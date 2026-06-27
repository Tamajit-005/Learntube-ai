from fastapi import APIRouter, HTTPException, Query
from app.services import history_service
from app.services.youtube_service import process_youtube_video
from app.services.transcript_service import extract_video_id

router = APIRouter()

@router.get("/")
async def home():
    return {"message": "LearnTube AI Running"}

@router.post("/analyze")
async def analyze_video(url: str = Query(..., min_length=1)):
    if not extract_video_id(url):
        raise HTTPException(
            status_code=400,
            detail={
                "type": "invalid_url",
                "message": "That doesn't look like a valid YouTube URL. Please paste a link from youtube.com.",
            },
        )
    try:
        result = await process_youtube_video(url)
    except Exception as e:
        print(f"ERROR processing video: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "type": "server_error",
                "message": "Something went wrong. Try a different video or try again.",
            },
        )
    try:
        await history_service.save_last(url, result)
    except Exception:
        # Persistence failure should not block the user from seeing results
        pass
    return {"result": result}


@router.get("/history/current")
async def get_current_history():
    record = await history_service.get_current()
    if record is None:
        raise HTTPException(
            status_code=404,
            detail={"type": "not_found", "message": "No history found"},
        )
    return record


@router.get("/history/previous")
async def get_previous_history():
    record = await history_service.get_previous()
    if record is None:
        raise HTTPException(
            status_code=404,
            detail={"type": "not_found", "message": "No previous history"},
        )
    return record
