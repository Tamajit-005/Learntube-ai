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
        session_id = await history_service.append(url, result)
        return {"session_id": session_id, "result": result}
    except Exception:
        # Persistence failure should not block the user from seeing results
        return {"session_id": None, "result": result}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    record = await history_service.get(session_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail={"type": "not_found", "message": "Session not found"},
        )
    return record
