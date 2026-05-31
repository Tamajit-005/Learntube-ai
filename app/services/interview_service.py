from app.services.ai_service import generate_ai_response

async def generate_interview_questions(chunk):

    prompt = f"""
    Create important interview questions from this tutorial.

    Include:
    - beginner
    - intermediate
    - advanced

    Tutorial:
    {chunk}
    """

    return await generate_ai_response(prompt)
