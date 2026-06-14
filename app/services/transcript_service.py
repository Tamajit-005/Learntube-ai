from youtube_transcript_api import YouTubeTranscriptApi
import re

_YT_ID_PATTERN = re.compile(r"(?:v=|youtu\.be/|embed/|v/|/)([0-9A-Za-z_-]{11})(?:\S|$)")

def extract_video_id(url: str) -> str | None:
    match = _YT_ID_PATTERN.search(url)
    return match.group(1) if match else None

async def get_transcript(url: str):
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Could not extract a valid YouTube video ID from the URL.")
    transcript = YouTubeTranscriptApi().fetch(
        video_id,
        languages=["en", "en-IN", "en-US", "en-GB"]
    )
    return transcript.to_raw_data()
