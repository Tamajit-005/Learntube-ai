import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

HISTORY_PATH = Path(__file__).resolve().parents[2] / "data" / "history.json"

_lock = asyncio.Lock()


async def _load() -> dict | None:
    """Read the stored dict { current, previous }, migrating old format."""
    try:
        text = HISTORY_PATH.read_text()
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("root not a dict")
        # Migrate from old single-record format { url, result, ... }
        if "url" in data and "current" not in data:
            data = {"current": data, "previous": None}
            await _save(data)
        return data
    except FileNotFoundError:
        return None
    except (json.JSONDecodeError, ValueError):
        corrupt = HISTORY_PATH.with_name(
            f"history.json.corrupt.{datetime.now():%Y%m%d%H%M%S}"
        )
        HISTORY_PATH.rename(corrupt)
        logger.warning("corrupt history.json renamed to %s", corrupt.name)
        return None


async def _save(data: dict) -> None:
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = HISTORY_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2))
    os.replace(tmp, HISTORY_PATH)


async def save_last(url: str, result: dict) -> dict:
    """Push current → previous, then store the new session as current."""
    record = {
        "url": url,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "result": result,
    }
    async with _lock:
        existing = await _load()
        if existing:
            existing["previous"] = existing.get("current")
            existing["current"] = record
        else:
            existing = {"current": record, "previous": None}
        await _save(existing)
    return record


async def get_current() -> dict | None:
    """Return the current session record, or None."""
    async with _lock:
        data = await _load()
        if data and data.get("current"):
            return data["current"]
        return None


async def get_previous() -> dict | None:
    """Return the previous session record, or None."""
    async with _lock:
        data = await _load()
        if data and data.get("previous"):
            return data["previous"]
        return None
