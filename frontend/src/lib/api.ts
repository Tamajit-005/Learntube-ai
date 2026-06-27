import type { AnalyzeResponse, SessionRecord } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  type: "no_transcript" | "rate_limit" | "server_error" | "network" | "not_found" | "invalid_url";
  message: string;
}

function parseErrorMessage(body: string): ApiError {
  // Try structured JSON error first (e.g. from HTTPException with detail)
  const isJson = body.trim().startsWith("{") || body.trim().startsWith("[");
  if (isJson) {
    try {
      const data = JSON.parse(body);
      if (data?.detail?.type) {
        return {
          type: data.detail.type as ApiError["type"],
          message: data.detail.message || body,
        };
      }
    } catch {
      // not valid JSON, fall through to plain-text checks
    }
  }

  // Plain-text heuristic matching for non-structured errors
  if (!isJson) {
    if (body.includes("TranscriptsDisabled") || body.includes("subtitles are disabled")) {
      return {
        type: "no_transcript",
        message: "This video doesn't have captions enabled. Try a different video that includes subtitles or closed captions.",
      };
    }
    if (body.includes("NoTranscriptFound") || body.includes("No transcripts were found")) {
      return {
        type: "no_transcript",
        message: "No English transcript found for this video. The video may be in a different language or captions are not available.",
      };
    }
    if (body.includes("rate limit") || body.includes("Rate limit") || body.includes("quota")) {
      return {
        type: "rate_limit",
        message: "The AI service is temporarily rate-limited. Please wait a moment and try again.",
      };
    }
    if (body.includes("request_too_large") || body.includes("too large")) {
      return {
        type: "server_error",
        message: "The video is too long to process. Try a shorter video.",
      };
    }
  }

  return {
    type: "server_error",
    message: body || "Something went wrong. Please try again with a different video.",
  };
}

export async function analyzeVideo(url: string): Promise<AnalyzeResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/analyze?url=${encodeURIComponent(url)}`, {
      method: "POST",
    });
  } catch {
    throw {
      type: "network",
      message: "Could not connect to the server. Make sure the backend is running on port 8000.",
    } as ApiError;
  }

  if (!response.ok) {
    const text = await response.text();
    throw parseErrorMessage(text);
  }

  return response.json();
}

export async function getCurrentHistory(): Promise<SessionRecord> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/history/current`);
  } catch {
    throw {
      type: "network",
      message: "Could not connect to the server. Make sure the backend is running on port 8000.",
    } as ApiError;
  }

  if (!response.ok) {
    const text = await response.text();
    throw parseErrorMessage(text);
  }

  return response.json();
}

export async function getPreviousHistory(): Promise<SessionRecord> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/history/previous`);
  } catch {
    throw {
      type: "network",
      message: "Could not connect to the server. Make sure the backend is running on port 8000.",
    } as ApiError;
  }

  if (!response.ok) {
    const text = await response.text();
    throw parseErrorMessage(text);
  }

  return response.json();
}
