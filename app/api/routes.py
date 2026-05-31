from fastapi import APIRouter
from app.services.youtube_service import process_youtube_video

router = APIRouter()

@router.get("/")
async def home():
    return {"message": "LearnTube AI Running"}

@router.post("/analyze")
async def analyze_video(url: str):
    result = await process_youtube_video(url)
    return result
