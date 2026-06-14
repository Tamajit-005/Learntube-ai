import json
import re
from app.services.ai_service import generate_ai_response


def _parse_json(text: str) -> dict | None:
    """Extract and parse JSON from AI response, handling markdown fences."""
    # Try extracting from ```json ... ``` block
    m = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if m:
        text = m.group(1).strip()
    # Try parsing directly
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try finding {...} top-level object
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass
    return None


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

    raw = await generate_ai_response(prompt)
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
