import json
import re
from app.services.ai_service import generate_ai_response


def _parse_json(text: str) -> dict | None:
    """Extract and parse JSON from AI response, handling markdown fences."""
    m = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass
    return None


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

    raw = await generate_ai_response(prompt)
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
