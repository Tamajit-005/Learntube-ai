import { NextRequest, NextResponse } from "next/server";
import { AiProviderError, TranscriptError, extractVideoId, processYoutubeVideo } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !extractVideoId(url)) {
    return errorJson(
      400,
      "invalid_url",
      "That doesn't look like a valid YouTube URL. Please paste a link from youtube.com.",
    );
  }

  const controller = new AbortController();
  const watchdog = setTimeout(() => controller.abort(), 270_000);

  try {
    const result = await processYoutubeVideo(url, { signal: controller.signal });
    return NextResponse.json({ result });
  } catch (err) {
    if (controller.signal.aborted) {
      return errorJson(500, "server_error", "Analysis took too long. Please try again.");
    }
    return errorResponse(err);
  } finally {
    clearTimeout(watchdog);
  }
}

function errorResponse(err: unknown): NextResponse {
  if (err instanceof TranscriptError) {
    if (err.kind === "invalid_url") return errorJson(400, "invalid_url", err.message);
    if (err.kind === "no_captions") {
      return errorJson(
        422,
        "no_transcript",
        "This video either doesn't have captions enabled or isn't available. Try the same video again after 24 hours.",
      );
    }
    return errorJson(500, "server_error", "Couldn't fetch the transcript after several tries. Please try again.");
  }
  if (err instanceof AiProviderError) {
    if (err.status === 429) {
      return errorJson(429, "rate_limit", "The AI service is temporarily rate-limited. Please wait a moment and try again.");
    }
    return errorJson(500, "server_error", err.message || "The AI service returned an error. Please try again.");
  }
  return errorJson(500, "server_error", "Something went wrong. Try a different video or try again.");
}

function errorJson(status: number, type: string, message: string): NextResponse {
  return NextResponse.json({ detail: { type, message } }, { status });
}
