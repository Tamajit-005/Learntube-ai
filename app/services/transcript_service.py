import html
import re

import httpx

_YT_ID_PATTERN = re.compile(r"(?:v=|youtu\.be/|embed/|v/|/)([0-9A-Za-z_-]{11})(?:\S|$)")

# YouTube blocks the transcript API for requests that look like scraping bots.
# Mimicking the Android app (client context + user agent) keeps the request
# accepted even from datacenter/cloud IPs.
_INNERTUBE_API = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false"
_ANDROID_UA = "com.google.android.youtube/20.10.38 (Linux; U; Android 14)"
_ANDROID_CONTEXT = {"client": {"clientName": "ANDROID", "clientVersion": "20.10.38"}}
_EN_LANGS = {"en", "en-IN", "en-US", "en-GB"}


def extract_video_id(url: str) -> str | None:
    match = _YT_ID_PATTERN.search(url)
    return match.group(1) if match else None


def _parse_timedtext(xml: str) -> list[dict]:
    segments = []

    # srv3 format: <p t="ms" d="ms"><s>word</s>...</p>
    for m in re.finditer(r'<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)</p>', xml):
        inner = re.sub(r"<[^>]+>", "", m.group(3))
        text = re.sub(r"\s+", " ", html.unescape(inner)).strip()
        if text:
            segments.append({
                "text": text,
                "start": int(m.group(1)) / 1000.0,
                "duration": int(m.group(2)) / 1000.0,
            })

    # classic format: <text start="s" dur="s">text</text>
    if not segments:
        for m in re.finditer(r'<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)</text>', xml):
            text = re.sub(r"\s+", " ", html.unescape(m.group(3))).strip()
            if text:
                segments.append({
                    "text": text,
                    "start": float(m.group(1)),
                    "duration": float(m.group(2)),
                })

    return segments


async def get_transcript(url: str):
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Could not extract a valid YouTube video ID from the URL.")

    headers = {"Content-Type": "application/json", "User-Agent": _ANDROID_UA}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            _INNERTUBE_API,
            headers=headers,
            json={"context": _ANDROID_CONTEXT, "videoId": video_id},
        )
        resp.raise_for_status()
        data = resp.json()

        tracks = (
            (data.get("captions") or {}).get("playerCaptionsTracklistRenderer") or {}
        ).get("captionTracks") or []
        if not tracks:
            status = (data.get("playabilityStatus") or {}).get("status", "OK")
            if status != "OK":
                raise ValueError("This video is unavailable or cannot be played.")
            raise ValueError("This video doesn't have captions enabled.")

        track = next(
            (t for t in tracks if t.get("languageCode") in _EN_LANGS),
            tracks[0],
        )
        caption_resp = await client.get(
            track["baseUrl"],
            headers={"User-Agent": _ANDROID_UA},
        )
        caption_resp.raise_for_status()

    segments = _parse_timedtext(caption_resp.text)
    if not segments:
        raise ValueError("No transcript segments could be parsed for this video.")

    return segments
