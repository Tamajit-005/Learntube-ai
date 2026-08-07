import html
import json
import re

import httpx

_YT_ID_PATTERN = re.compile(r"(?:v=|youtu\.be/|embed/|v/|/)([0-9A-Za-z_-]{11})(?:\S|$)")

# YouTube blocks transcript requests that look like scraping bots. Mimicking
# official app clients keeps requests accepted even from datacenter/cloud IPs.
# The same video can report "unavailable" for one client context and not
# another, so we try several contexts before falling back to scraping the
# watch page.
_INNERTUBE_API = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false"
_CLIENT_CONTEXTS = [
    (
        {"clientName": "ANDROID", "clientVersion": "20.10.38"},
        "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    ),
    (
        {"clientName": "IOS", "clientVersion": "20.10.4"},
        "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X)",
    ),
]
_WEB_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
_EN_LANGS = {"en", "en-IN", "en-US", "en-GB"}


def extract_video_id(url: str) -> str | None:
    match = _YT_ID_PATTERN.search(url)
    return match.group(1) if match else None


def _extract_tracks(data: dict) -> list[dict]:
    return (
        (data.get("captions") or {}).get("playerCaptionsTracklistRenderer") or {}
    ).get("captionTracks") or []


def _parse_yt_initial_player_response(html_text: str) -> dict | None:
    """Extract the ytInitialPlayerResponse JSON, brace-counting past strings."""
    m = re.search(r"ytInitialPlayerResponse\s*=\s*(\{)", html_text)
    if not m:
        return None
    start = m.start(1)
    depth = 0
    in_string = False
    escape = False
    for i in range(start, len(html_text)):
        ch = html_text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
        else:
            if ch == '"':
                in_string = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(html_text[start:i + 1])
                    except json.JSONDecodeError:
                        return None
    return None


async def _fetch_caption_track(client: httpx.AsyncClient, base_url: str) -> str:
    resp = await client.get(base_url, headers={"User-Agent": _WEB_UA})
    resp.raise_for_status()
    return resp.text


async def get_transcript(url: str):
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Could not extract a valid YouTube video ID from the URL.")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Strategy 1: innertube player API across app client contexts
        tracks = []
        for context, ua in _CLIENT_CONTEXTS:
            try:
                resp = await client.post(
                    _INNERTUBE_API,
                    headers={"Content-Type": "application/json", "User-Agent": ua},
                    json={"context": {"client": context}, "videoId": video_id},
                )
                resp.raise_for_status()
                tracks = _extract_tracks(resp.json())
            except Exception:
                continue
            if tracks:
                break

        # Strategy 2: scrape the watch page and read its embedded player data
        if not tracks:
            try:
                page = await client.get(
                    f"https://www.youtube.com/watch?v={video_id}",
                    headers={"User-Agent": _WEB_UA, "Accept-Language": "en"},
                )
                page.raise_for_status()
                tracks = _extract_tracks(_parse_yt_initial_player_response(page.text) or {})
            except Exception:
                tracks = []

        if not tracks:
            raise ValueError(
                "This video doesn't have captions enabled or is unavailable."
            )

        track = next(
            (t for t in tracks if t.get("languageCode") in _EN_LANGS),
            tracks[0],
        )
        transcript_xml = await _fetch_caption_track(client, track["baseUrl"])

    segments = _parse_timedtext(transcript_xml)
    if not segments:
        raise ValueError("No transcript segments could be parsed for this video.")

    return segments


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
