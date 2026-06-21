import json
import re


def fix_json_braces(text: str) -> str:
    """Fix common LLM JSON malformations like double-wrapped braces."""
    stripped = text.strip()

    # Remove markdown code fences
    stripped = re.sub(r"^```(?:json)?\s*\n?", "", stripped)
    stripped = re.sub(r"\n?```\s*$", "", stripped)

    # Remove leading/trailing whitespace within outer braces
    stripped = stripped.strip()

    # Fix double-wrapped outer braces: {{ ... }} -> { ... }
    # Count leading { and trailing } — if both are >1 and equal, strip one layer
    leading = len(stripped) - len(stripped.lstrip("{"))
    trailing = len(stripped) - len(stripped.rstrip("}"))
    if leading > 1 and trailing > 1 and leading == trailing:
        stripped = stripped[1:-1].strip()

    # Fix double-wrapped arrays: [[ ... ]] -> [ ... ]
    if stripped.startswith("[["):
        # Find matching ]]
        depth = 0
        for i, ch in enumerate(stripped):
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0 and i < len(stripped) - 1 and stripped[i + 1] == "]":
                    stripped = stripped[1:-1]
                    break

    return stripped


def _normalize_trailing_commas(text: str) -> str:
    """Remove trailing commas before } or ] (common LLM error)."""
    # Remove trailing comma before closing brace/bracket in JSON context
    return re.sub(r",\s*([}\]])", r"\1", text)


def _parse_json(text: str) -> dict | list | None:
    """Extract and parse JSON from AI response, handling common malformations."""
    text = fix_json_braces(text)

    # Extract first { ... } or [ ... ] block
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        idx = text.find(start_char)
        if idx == -1:
            continue
        depth = 0
        for i in range(idx, len(text)):
            if text[i] == start_char:
                depth += 1
            elif text[i] == end_char:
                depth -= 1
                if depth == 0:
                    candidate = text[idx : i + 1]
                    # Try parsing as-is
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        pass
                    # Try with trailing commas fixed
                    try:
                        return json.loads(_normalize_trailing_commas(candidate))
                    except json.JSONDecodeError:
                        pass
                    break
    return None
