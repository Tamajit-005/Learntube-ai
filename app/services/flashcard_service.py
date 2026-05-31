from app.services.ai_service import generate_ai_response

async def generate_flashcards(chunk):

    prompt = f"""
    Create flashcards from this lecture.

    Format:
    Q:
    A:

    Lecture:
    {chunk}
    """

    return await generate_ai_response(prompt)
