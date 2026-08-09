import type { AnalysisResult, InterviewSection, QuizQuestion } from "@/types";

// ===========================================================================
// Config (port of app/config.py::get_active_config)
// ===========================================================================

export type AiProvider = "openai" | "gemini" | "custom";

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getAiConfig(): AiConfig {
  const provider = (process.env.AI_PROVIDER || "openai") as AiProvider;
  if (provider === "gemini") {
    return {
      apiKey: process.env.GEMINI_API_KEY || "",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    };
  }
  if (provider === "custom") {
    return {
      apiKey: process.env.CUSTOM_API_KEY || "",
      baseUrl: process.env.CUSTOM_BASE_URL || "",
      model: process.env.CUSTOM_MODEL || "gpt-4.1-mini",
    };
  }
  return {
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  };
}

// ===========================================================================
// LLM client (OpenAI-compatible chat completions, raw fetch)
// ===========================================================================

export class AiProviderError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AiProviderError";
  }
}

export interface CompleteChatOptions {
  /** Ask the provider for a JSON object response. */
  json?: boolean;
  signal?: AbortSignal;
}

export async function completeChat(prompt: string, opts: CompleteChatOptions = {}): Promise<string> {
  const cfg = getAiConfig();
  if (!cfg.apiKey) {
    throw new AiProviderError(500, "The AI service API key is not configured. Set the provider key in your environment.");
  }
  const baseUrl = cfg.baseUrl.replace(/\/+$/, "");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  const onOuterAbort = () => controller.abort();
  opts.signal?.addEventListener("abort", onOuterAbort);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: "You are an educational AI assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `The AI service returned an error (${res.status}).`;
      try {
        const data = await res.json();
        if (data?.error?.message) message = data.error.message;
      } catch {}
      throw new AiProviderError(res.status, message);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new AiProviderError(500, "The AI service returned an empty response.");
    }
    return content;
  } finally {
    clearTimeout(timeout);
    opts.signal?.removeEventListener("abort", onOuterAbort);
  }
}

// ===========================================================================
// Transcript fetch via Cloudflare Worker (intermittent → 3 attempts + backoff)
// ===========================================================================

export type TranscriptErrorKind = "invalid_url" | "no_captions" | "unavailable";

export class TranscriptError extends Error {
  constructor(public kind: TranscriptErrorKind, message: string) {
    super(message);
    this.name = "TranscriptError";
  }
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

const VIDEO_ID_RE = /(?:v=|youtu\.be\/|embed\/|v\/|\/)([0-9A-Za-z_-]{11})(?:\S|$)/;
const TRANSCRIPT_PROXY_URL = process.env.TRANSCRIPT_PROXY_URL || "";

export function extractVideoId(url: string): string | null {
  const m = VIDEO_ID_RE.exec(url || "");
  return m ? m[1] : null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTranscript(
  url: string,
  opts: { signal?: AbortSignal } = {},
): Promise<TranscriptSegment[]> {
  if (!extractVideoId(url)) {
    throw new TranscriptError("invalid_url", "Could not extract a valid YouTube video ID from the URL.");
  }
  if (!TRANSCRIPT_PROXY_URL) {
    throw new TranscriptError("unavailable", "The transcript proxy URL is not configured.");
  }

  let lastError: TranscriptError = new TranscriptError("unavailable", "Could not fetch the transcript. Please try again.");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (opts.signal?.aborted) throw lastError;
    if (attempt > 0) {
      const backoff = attempt === 1 ? 400 : 1200;
      await sleep(backoff + Math.floor(Math.random() * 200));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const onOuterAbort = () => controller.abort();
    opts.signal?.addEventListener("abort", onOuterAbort);

    try {
      const res = await fetch(TRANSCRIPT_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const bodyText = await res.text();
      let data: { ok?: boolean; transcript?: TranscriptSegment[]; error?: string } | null = null;
      try {
        data = JSON.parse(bodyText);
      } catch {}
      if (data?.ok && Array.isArray(data.transcript)) {
        return data.transcript;
      }
      const msg = String(data?.error || (res.ok ? "No transcript available." : `The transcript proxy returned status ${res.status}.`));
      if (/captions|NoTranscript|no transcript/i.test(msg)) {
        throw new TranscriptError("no_captions", "This video either doesn't have captions enabled or isn't available. Try the same video again after 24 hours.");
      }
      lastError = new TranscriptError("unavailable", msg);
    } catch (err) {
      if (err instanceof TranscriptError) throw err;
      lastError = new TranscriptError("unavailable", err instanceof Error ? err.message : "Failed to fetch the transcript.");
    } finally {
      clearTimeout(timeout);
      opts.signal?.removeEventListener("abort", onOuterAbort);
    }
  }
  throw lastError;
}

// ===========================================================================
// JSON sanitizer (port of app/services/json_utils.py::_parse_json)
// ===========================================================================

export function parseJson(text: string): unknown {
  let s = text.trim();
  s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();

  // Unwrap double-wrapped braces: {{ ... }} -> { ... }
  const leading = s.length - s.replace(/^\{+/, "").length;
  const trailing = s.length - s.replace(/\}+$/, "").length;
  if (leading > 1 && trailing > 1 && leading === trailing) {
    s = s.slice(1, -1).trim();
  }

  // Unwrap double-wrapped arrays: [[ ... ]] -> [ ... ]
  if (s.startsWith("[[")) {
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "[") depth++;
      else if (s[i] === "]") {
        depth--;
        if (depth === 0 && i < s.length - 1 && s[i + 1] === "]") {
          s = s.slice(1, -1);
          break;
        }
      }
    }
  }

  // Extract the first balanced { ... } or [ ... ] block
  for (const [startChar, endChar] of [
    ["{", "}"],
    ["[", "]"],
  ]) {
    const idx = s.indexOf(startChar);
    if (idx === -1) continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = idx; i < s.length; i++) {
      const ch = s[i];
      if (inString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === '"') inString = false;
      } else {
        if (ch === '"') inString = true;
        else if (ch === startChar) depth++;
        else if (ch === endChar) {
          depth--;
          if (depth === 0) {
            const candidate = s.slice(idx, i + 1);
            try {
              return JSON.parse(candidate);
            } catch {}
            try {
              return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1"));
            } catch {}
            break;
          }
        }
      }
    }
  }
  return null;
}

// ===========================================================================
// Chunking (port of app/services/chunk_service.py)
// ===========================================================================

export function createChunks(transcript: TranscriptSegment[], chunkSize = 3000): string[] {
  const words = transcript.map((s) => s.text).join(" ").split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// ===========================================================================
// Concurrency (port of asyncio.Semaphore(2) + gather)
// ===========================================================================

export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  const workerCount = Math.min(limit, items.length);
  const workers = Array.from({ length: workerCount }, async () => {
    for (;;) {
      const i = index++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ===========================================================================
// The 5 generators (prompts copied verbatim from app/services/*.py)
// ===========================================================================

function generateNotes(text: string, signal?: AbortSignal): Promise<string> {
  const prompt = `
    Create structured smart notes from this lecture.

    Include:
    - headings
    - bullet points
    - important concepts
    - examples

    Lecture:
    ${text}
    `;
  return completeChat(prompt, { signal });
}

function generateFlashcards(text: string, signal?: AbortSignal): Promise<string> {
  const prompt = `
    Create flashcards from this lecture.

    Format:
    Q:
    A:

    Lecture:
    ${text}
    `;
  return completeChat(prompt, { signal });
}

function extractFormulas(text: string, signal?: AbortSignal): Promise<string> {
  const prompt = `
    Extract important formulas from this lecture.

    Return clean formulas only.

    Lecture:
    ${text}
    `;
  return completeChat(prompt, { signal });
}

function generateQuizzes(text: string, signal?: AbortSignal): Promise<string | { questions: QuizQuestion[] }> {
  const prompt = `
    Create 10 multiple-choice questions from this lecture.
    Return ONLY valid JSON (no markdown, no code fences) in this exact format:
    {
      "questions": [
        {
          "question": "What is ...?",
          "options": ["option A", "option B", "option C", "option D"],
          "correctIndex": 0
        }
      ]
    }
    "correctIndex" is the 0-based index of the correct option in the "options" array.
    Ensure exactly 4 options per question and exactly 1 correct answer per question.

    Lecture:
    ${text}
    `;
  return completeChat(prompt, { json: true, signal }).then((raw) => {
    const parsed = parseJson(raw) as { questions?: unknown[] } | null;
    if (parsed && Array.isArray(parsed.questions)) {
      const validated: QuizQuestion[] = [];
      for (const q of parsed.questions) {
        const o = q as Partial<QuizQuestion>;
        if (
          o &&
          typeof o.question === "string" &&
          Array.isArray(o.options) &&
          o.options.length === 4 &&
          typeof o.correctIndex === "number" &&
          Number.isInteger(o.correctIndex) &&
          o.correctIndex >= 0 &&
          o.correctIndex < 4
        ) {
          validated.push({ question: o.question, options: o.options, correctIndex: o.correctIndex });
        }
      }
      if (validated.length) return { questions: validated };
    }
    return raw;
  });
}

function generateInterviewQuestions(
  text: string,
  signal?: AbortSignal,
): Promise<string | { sections: InterviewSection[] }> {
  const prompt = `
    Create important interview questions from this tutorial.
    Categorize them into beginner, intermediate, and advanced levels.
    Return ONLY valid JSON (no markdown, no code fences) in this exact format:
    {
      "sections": [
        {
          "level": "Beginner",
          "intro": "optional intro text for this level",
          "questions": [
            {
              "question": "What is ...?",
              "description": "Expected answer or explanation"
            }
          ]
        }
      ]
    }
    "intro" is optional (can be empty string).
    "description" is the expected answer for the question (can be empty string).

    Tutorial:
    ${text}
    `;
  return completeChat(prompt, { json: true, signal }).then((raw) => {
    const parsed = parseJson(raw) as { sections?: unknown[] } | null;
    if (parsed && Array.isArray(parsed.sections)) {
      const validated: InterviewSection[] = [];
      for (const s of parsed.sections) {
        const sec = s as { level?: unknown; intro?: unknown; questions?: unknown[] };
        if (sec && typeof sec.level === "string" && Array.isArray(sec.questions)) {
          const level = sec.level.toLowerCase();
          if (!["beginner", "intermediate", "advanced"].includes(level)) continue;
          const questions: InterviewSection["questions"] = [];
          for (const q of sec.questions) {
            const item = q as { question?: unknown; description?: unknown };
            if (item && typeof item.question === "string") {
              questions.push({
                question: item.question,
                description: typeof item.description === "string" ? item.description : "",
              });
            }
          }
          if (questions.length) {
            validated.push({
              level: level.charAt(0).toUpperCase() + level.slice(1),
              intro: typeof sec.intro === "string" ? sec.intro : "",
              questions,
            });
          }
        }
      }
      if (validated.length) return { sections: validated };
    }
    return raw;
  });
}

// ===========================================================================
// Pipeline (port of app/services/youtube_service.py)
// ===========================================================================

export async function processYoutubeVideo(
  url: string,
  opts: { signal?: AbortSignal } = {},
): Promise<AnalysisResult> {
  const transcript = await fetchTranscript(url, opts);
  const chunks = createChunks(transcript);
  const combinedText = chunks.slice(0, 1).join(" ");

  type GenResult = string | { questions: QuizQuestion[] } | { sections: InterviewSection[] };
  const tasks: Array<() => Promise<GenResult>> = [
    () => generateNotes(combinedText, opts.signal),
    () => generateQuizzes(combinedText, opts.signal),
    () => generateFlashcards(combinedText, opts.signal),
    () => generateInterviewQuestions(combinedText, opts.signal),
    () => extractFormulas(combinedText, opts.signal),
  ];

  const [notes, quizzes, flashcards, interview_questions, formulas] = (await mapLimit(tasks, 2, (fn) => fn())) as [
    string,
    string | { questions: QuizQuestion[] },
    string,
    string | { sections: InterviewSection[] },
    string,
  ];
  return { notes, quizzes, flashcards, interview_questions, formulas };
}
