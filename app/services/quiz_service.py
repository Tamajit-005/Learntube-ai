from app.services.ai_service import generate_ai_response
from app.services.json_utils import _parse_json


async def generate_mcqs(chunk):
    prompt = f"""
    Create 10 multiple-choice questions from this lecture.
    Return ONLY valid JSON (no markdown, no code fences) in this exact format:
    {{
      "questions": [
        {{
          "question": "What is ...?",
          "options": ["option A", "option B", "option C", "option D"],
          "correctIndex": 0
        }}
      ]
    }}
    "correctIndex" is the 0-based index of the correct option in the "options" array.
    Ensure exactly 4 options per question and exactly 1 correct answer per question.

    Lecture:
    {chunk}
    """

    raw = await generate_ai_response(prompt, response_format={"type": "json_object"})
    parsed = _parse_json(raw)

    if parsed and isinstance(parsed, dict) and "questions" in parsed:
        validated = []
        for q in parsed["questions"]:
            if (
                isinstance(q, dict)
                and "question" in q
                and "options" in q
                and "correctIndex" in q
                and isinstance(q["options"], list)
                and len(q["options"]) == 4
                and isinstance(q["correctIndex"], int)
                and 0 <= q["correctIndex"] < 4
            ):
                validated.append(q)
        if validated:
            return {"questions": validated}

    # Fallback: return raw text so the frontend can try to parse it
    return raw
