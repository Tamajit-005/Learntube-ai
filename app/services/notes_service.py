from app.services.ai_service import generate_ai_response

async def generate_notes(chunk):

    prompt = f"""
    Create structured smart notes from this lecture.

    Include:
    - headings
    - bullet points
    - important concepts
    - examples

    Lecture:
    {chunk}
    """

    return await generate_ai_response(prompt)
