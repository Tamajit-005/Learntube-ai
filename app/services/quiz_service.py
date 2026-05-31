from app.services.ai_service import generate_ai_response

async def generate_mcqs(chunk):

    prompt = f"""
    Create 10 MCQs from this lecture.

    Include:
    - 4 options
    - correct answer

    Lecture:
    {chunk}
    """

    return await generate_ai_response(prompt)
