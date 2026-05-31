from youtube_transcript_api import YouTubeTranscriptApi
import re

def extract_video_id(url: str):
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    return match.group(1)

async def get_transcript(url: str):
    video_id = extract_video_id(url)
    transcript = YouTubeTranscriptApi().fetch(
        video_id,
        languages=["en", "en-IN", "en-US", "en-GB"]
    )
    return transcript.to_raw_data()
