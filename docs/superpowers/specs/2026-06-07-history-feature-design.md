# Session History Persistence — Design

**Date:** 2026-06-07
**Status:** Approved
**Scope:** Add a `history.json` to LearnTube AI so that analysis results can be saved and restored by a short session id.

## 1. Problem

Today, analysis results live only in React Context state. A page refresh wipes them; the user has to re-run a (slow) AI analysis to see the same notes, quiz, flashcards, etc. again.

## 2. Goal

A user can:

- Receive a short session id after analyzing a video
- Copy the id
- Later, paste the id on the home page and have the full result (notes, quiz, flashcards, interview, timestamps, formulas) restored
- See the same data on every section page (Notes, Quiz, etc.) as if they had just analyzed the video

## 3. Non-goals

- Multi-user support / authentication
- Cross-device sync
- Sharing a session by URL
- Re-running analysis with a different prompt
- YouTube metadata (title, channel, thumbnail)
- Raw transcript persistence
- Migration of an in-flight analysis

## 4. Decisions

| Decision | Choice | Why |
|---|---|---|
| What is a session | One analyzed video | Matches "restore old assets" cleanly |
| Where the file lives | `data/history.json` on the backend | User asked for a JSON file; backend is the natural owner |
| Who reads/writes | FastAPI | Single source of truth |
| Id format | 8 hex chars from `secrets.token_hex(4)` | Short, copy-friendly, collision-safe at ≤50 sessions |
| Concurrency control | `asyncio.Lock` inside the history service | Sufficient for a single-process dev server |
| Persistence trigger | Auto-append after a successful `/analyze` | No extra round trip |
| Restore mechanism | Input field on home page; no URL parameter | Simplest UX; matches user choice |
| Cap | 50 sessions, FIFO by `analyzed_at` | Bounds file size |
| Atomic write | Write to `*.tmp` then `os.replace` | Crash-safe |
| Schema | Plain dict keyed by id; no `version`, no separate `order` list | Minimal per user choice |
| Storage gitignore | `data/` is gitignored | Local artifact, not source |

## 5. Data Model

`data/history.json` is a JSON object whose keys are session ids and values are session records.

```json
{
  "a1b2c3d4": {
    "id": "a1b2c3d4",
    "url": "https://youtube.com/watch?v=abc123",
    "analyzed_at": "2026-06-07T12:34:56Z",
    "result": {
      "notes": "...",
      "quizzes": "...",
      "flashcards": "...",
      "interview_questions": "...",
      "timestamps": [{"timestamp": 0, "summary": "..."}],
      "formulas": "..."
    }
  }
}
```

`analyzed_at` is ISO 8601 UTC. The `result` shape matches the existing `AnalysisResult` TypeScript interface exactly.

## 6. Backend

### 6.1 New module: `app/services/history_service.py`

Public surface:

- `MAX_SESSIONS: int = 50`
- `ID_LENGTH: int = 8`
- `HISTORY_PATH: Path` — points to `<repo>/data/history.json` (resolved relative to the working directory at import time)
- `async with _lock: ...` — module-level `asyncio.Lock`
- `async def load() -> dict` — read file, return parsed dict; on missing file or corrupt JSON, log a warning and return `{}`
- `async def save(data: dict) -> None` — atomic write to `data/history.json` via `data/history.json.tmp` + `os.replace`; create `data/` if missing
- `async def generate_id(existing: set[str]) -> str` — produce an 8-char hex id, retry up to 10 times if it collides
- `async def append(url: str, result: AnalysisResult) -> str` — load → generate unique id → add record → trim to `MAX_SESSIONS` by oldest `analyzed_at` (parse ISO timestamps) → save → return id
- `async def get(session_id: str) -> dict | None` — load, return the matching record or `None`

The service does not import FastAPI. It is a pure async module.

### 6.2 Modified: `app/api/routes.py`

- `POST /analyze` now returns `{"session_id": str, "result": AnalysisResult}` instead of the bare result. The handler calls `history_service.append(url, result)` after `process_youtube_video` succeeds and wraps the response.
- New `GET /sessions/{session_id}` returns the matching record (status 200) or 404 with `{"type": "not_found", "message": "Session not found"}` if absent. FastAPI's path validation rejects malformed ids with 422.
- Errors during the append (e.g. disk full) bubble up as 500 with a generic message; the response payload to the client still includes the analysis result, so the user is not blocked from viewing it. (The session id may be missing in this rare case — acceptable degradation.)

### 6.3 Configuration

No new env vars. `HISTORY_PATH` is resolved at module import time using `Path(__file__).resolve().parents[2] / "data" / "history.json"`.

## 7. Frontend

### 7.1 Types (`src/types/index.ts`)

Add:

```ts
export interface SessionRecord {
  id: string;
  url: string;
  analyzed_at: string;
  result: AnalysisResult;
}

export interface AnalyzeResponse {
  session_id: string;
  result: AnalysisResult;
}
```

`AnalysisResult` is unchanged.

### 7.2 API (`src/lib/api.ts`)

- `analyzeVideo(url): Promise<AnalyzeResponse>` — updated return type.
- New `getSession(id: string): Promise<SessionRecord>` — calls `GET /sessions/{id}`; on 404 throws `ApiError` with `type: "not_found"`; on network error throws the existing `network` error.

### 7.3 Context (`src/context/AnalysisContext.tsx`)

State additions:

- `sessionId: string | null`
- `analyzedAt: string | null`
- `analyzedUrl: string | null`

`handleSubmit` writes the three fields from the response alongside the result.

New method `restoreSession(id: string): Promise<void>`:

- Sets `loading` true
- Calls `getSession(id)`
- On success: sets `result`, `sessionId`, `analyzedAt`, `analyzedUrl`; toasts success
- On `not_found` error: toasts the "trimmed" message
- On other errors: existing error flow
- Always clears `loading` in `finally`

New method `clearSession()` resets the four state fields plus `error`.

### 7.4 Home page (`src/app/page.tsx`)

- After successful analysis, the success card shows the session id in a copyable input/button row.
- Below the section links, a "Restore from session id" form: text input + submit button.
- The restore form is disabled while `loading` is true.
- Restoring from id populates state without triggering a new analysis; the user is then free to navigate to any section page.

### 7.5 Section pages

Unchanged. They read from `AnalysisContext`, so a restored session lights up every page identically to a fresh analysis.

## 8. Error Handling

| Scenario | Behavior |
|---|---|
| First-ever run, no `data/` | `data/` is created on first save; the file is initialized to `{}` |
| `history.json` is missing | Treated as `{}`; new analysis creates it |
| `history.json` is corrupt JSON | Logged at WARNING; treated as `{}`. Server continues. |
| Disk full / `OSError` on write | Caught; 500 returned; in-memory response still includes the analysis result so the user is not blocked |
| `GET /sessions/{id}` with unknown id | 404 with `{"type": "not_found", "message": "Session not found"}` |
| `GET /sessions/{id}` with malformed id (e.g. `../`) | 422 from FastAPI path validation |
| Same id collision (theoretical) | `generate_id` retries up to 10 times |
| Trim to 50 | Drop the record with the oldest `analyzed_at`; the FIFO cap is enforced on every append |
| User deletes `history.json` manually | Next append creates a fresh empty file; older sessions are lost — acceptable |

## 9. Testing

### Backend (pytest + httpx AsyncClient)

`tests/test_history_service.py`:

- `append` creates an id, persists, and returns the id
- `get` returns the same record
- `get` of an unknown id returns `None`
- 51 appends trim to 50; the oldest by `analyzed_at` is dropped
- corrupt JSON is treated as `{}`
- two concurrent appends both end up persisted (race test)
- a duplicate id is detected and a fresh id is generated

`tests/test_routes.py`:

- `POST /analyze` returns `{session_id, result}` and the session is retrievable via `GET /sessions/{id}`
- `GET /sessions/{id}` for an unknown id returns 404 with the expected body

### Frontend

No new test framework. Manual verification:

1. Analyze a video → success card shows an 8-char id, Copy button works
2. Refresh the page → home shows the restore form; paste the id → all section pages populate
3. Analyze 51 videos → the oldest is no longer retrievable; `GET /sessions/{oldest}` returns 404
4. Manually corrupt `data/history.json` (e.g. write `"{"`) → server still serves `/analyze`; new analysis rewrites the file cleanly

## 10. Rollout

- `data/` is added to `.gitignore`
- No new dependencies on the frontend
- One new backend dependency: `pytest` and `httpx` for tests (add to `requirements-dev.txt`); runtime uses only stdlib (`asyncio`, `secrets`, `json`, `pathlib`, `os`)
- Backward-compatibility note: the response shape of `POST /analyze` changes. Anything outside this codebase calling it must be updated. There is no such caller in this repo.

## 11. Out of Scope (future ideas)

- Listing past sessions in the UI
- Renaming sessions / adding user-supplied labels
- Sharing sessions via a URL
- Re-running analysis with a different prompt
- YouTube metadata caching
- Migration to SQLite once concurrent usage justifies it
