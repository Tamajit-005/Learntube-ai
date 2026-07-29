from app.services.ai_service import generate_ai_response
from app.services.json_utils import _parse_json


async def generate_interview_questions(chunk):
    prompt = f"""
    Create important interview questions from this tutorial.
    Categorize them into beginner, intermediate, and advanced levels.
    Return ONLY valid JSON (no markdown, no code fences) in this exact format:
    {{
      "sections": [
        {{
          "level": "Beginner",
          "intro": "optional intro text for this level",
          "questions": [
            {{
              "question": "What is ...?",
              "description": "Expected answer or explanation"
            }}
          ]
        }}
      ]
    }}
    "intro" is optional (can be empty string).
    "description" is the expected answer for the question (can be empty string).

    Tutorial:
    {chunk}
    """

    raw = await generate_ai_response(prompt, response_format={"type": "json_object"})
    parsed = _parse_json(raw)

    if parsed and isinstance(parsed, dict) and "sections" in parsed:
        validated = []
        for s in parsed["sections"]:
            if isinstance(s, dict) and "level" in s and "questions" in s:
                level = s["level"]
                if level.lower() not in ("beginner", "intermediate", "advanced"):
                    continue
                questions = []
                for q in s.get("questions", []):
                    if isinstance(q, dict) and "question" in q:
                        questions.append({
                            "question": q["question"],
                            "description": q.get("description", ""),
                        })
                if questions:
                    validated.append({
                        "level": level.capitalize(),
                        "intro": s.get("intro", ""),
                        "questions": questions,
                    })
        if validated:
            return {"sections": validated}

    return raw
