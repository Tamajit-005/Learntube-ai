from app.services.ai_service import generate_ai_response

async def extract_formulas(chunk):

    prompt = f"""
    Extract important formulas from this lecture.

    Return clean formulas only.

    Lecture:
    {chunk}
    """

    return await generate_ai_response(prompt)
