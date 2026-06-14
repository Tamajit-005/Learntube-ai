import asyncio
import json
import logging
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

MAX_SESSIONS = 100
ID_BYTES = 4
HISTORY_PATH = Path(__file__).resolve().parents[2] / "data" / "history.json"

_lock = asyncio.Lock()


async def load() -> dict:
    try:
        text = HISTORY_PATH.read_text()
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("root not a dict")
        return data
    except FileNotFoundError:
        return {}
    except (json.JSONDecodeError, ValueError):
        corrupt = HISTORY_PATH.with_name(f"history.json.corrupt.{datetime.now():%Y%m%d%H%M%S}")
        HISTORY_PATH.rename(corrupt)
        logger.warning("corrupt history.json renamed to %s; starting fresh", corrupt.name)
        return {}


async def save(data: dict) -> None:
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = HISTORY_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2))
    os.replace(tmp, HISTORY_PATH)


def _generate_id(existing: set[str]) -> str:
    for _ in range(10):
        sid = secrets.token_hex(ID_BYTES)
        if sid not in existing:
            return sid
    raise RuntimeError("failed to generate unique session id after 10 attempts")


async def append(url: str, result: dict) -> str:
    async with _lock:
        data = await load()
        existing_ids = set(data.keys())
        sid = _generate_id(existing_ids)
        data[sid] = {
            "id": sid,
            "url": url,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "result": result,
        }
        # FIFO trim: keep the MAX_SESSIONS most recent by analyzed_at
        if len(data) > MAX_SESSIONS:
            sorted_items = sorted(data.items(), key=lambda kv: kv[1]["analyzed_at"], reverse=True)
            data = dict(sorted_items[:MAX_SESSIONS])
        await save(data)
        return sid


async def get(session_id: str) -> dict | None:
    async with _lock:
        data = await load()
        return data.get(session_id)
