import type { AnalyzeResponse } from "@/types";

export interface ApiError {
  type: "no_transcript" | "rate_limit" | "server_error" | "network" | "not_found" | "invalid_url";
  message: string;
}

function parseErrorMessage(body: string): ApiError {
  // The analyze route always returns structured JSON errors { detail: { type, message } }.
  try {
    const data = JSON.parse(body);
    if (data?.detail?.type) {
      return {
        type: data.detail.type as ApiError["type"],
        message: data.detail.message || body,
      };
    }
  } catch {
    // not JSON — fall through to the generic fallback
  }

  return {
    type: "server_error",
    message: body || "Something went wrong. Please try again with a different video.",
  };
}

export async function analyzeVideo(url: string): Promise<AnalyzeResponse> {
  let response: Response;

  try {
    response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`, {
      method: "POST",
    });
  } catch {
    throw {
      type: "network",
      message: "Could not connect to the server. Please try again.",
    } as ApiError;
  }

  if (!response.ok) {
    const text = await response.text();
    throw parseErrorMessage(text);
  }

  return response.json();
}
