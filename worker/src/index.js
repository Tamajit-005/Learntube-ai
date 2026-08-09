/**
 * LearnTube AI — YouTube transcript proxy
 *
 * Runs on Cloudflare's network so requests to YouTube come from Cloudflare's
 * egress IPs (not Render's, which YouTube blocks for transcript fetching).
 *
 * Accepts:  POST  { "url": "..." }  or  { "videoId": "..." }
 * Returns:  { "ok": true, "transcript": [{ text, start, duration }, ...] }
 *        or  { "ok": false, "error": "..." }
 */

const INNERTUBE_API = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

// Same client contexts the backend uses. A video can report "unavailable" for
// one context and not another, so try several before falling back to scraping.
const CLIENTS = [
  {
    context: { clientName: "ANDROID", clientVersion: "20.10.38" },
    ua: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
  },
  {
    context: { clientName: "IOS", clientVersion: "20.10.4" },
    ua: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X)",
  },
];

const WEB_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const EN_LANGS = new Set(["en", "en-IN", "en-US", "en-GB"]);
const VIDEO_ID_RE = /(?:v=|youtu\.be\/|embed\/|v\/|\/)([0-9A-Za-z_-]{11})(?:\S|$)/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: CORS });
    }
    if (request.method !== "POST") {
      return json({ error: 'Use POST with a JSON body: { "url": "..." } or { "videoId": "..." }' }, 400);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400);
    }
    console.log("Request body:", body);
    const videoId = body.videoId || extractVideoId(body.url);
    if (!videoId) {
      return json({ error: "Could not extract a valid YouTube video ID from the URL." }, 400);
    }

    try {
      const transcript = await getTranscript(videoId);
      return json({ ok: true, transcript });
    } catch (err) {
      return json({ ok: false, error: String((err && err.message) || err) }, 500);
    }
  },
};

function extractVideoId(url) {
  const m = VIDEO_ID_RE.exec(url || "");
  return m ? m[1] : null;
}

async function getTranscript(videoId) {
  let tracks = [];

  for (const { context, ua } of CLIENTS) {
    try {
      const resp = await fetch(INNERTUBE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": ua },
        body: JSON.stringify({ context: { client: context }, videoId }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      tracks = (data.captions || {}).playerCaptionsTracklistRenderer?.captionTracks || [];
    } catch {
      continue;
    }
    if (tracks.length) break;
  }

  if (!tracks.length) {
    try {
      const page = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { "User-Agent": WEB_UA, "Accept-Language": "en" },
      });
      if (page.ok) {
        const html = await page.text();
        const parsed = parseYtInitialPlayerResponse(html);
        tracks = (parsed.captions || {}).playerCaptionsTracklistRenderer?.captionTracks || [];
      }
    } catch {}
  }

  if (!tracks.length) {
    throw new Error("This video either doesn't have captions enabled or isn't available. Try the same video again after 24 hours.");
  }

  const track = tracks.find((t) => EN_LANGS.has(t.languageCode)) || tracks[0];
  const xmlResp = await fetch(track.baseUrl, { headers: { "User-Agent": WEB_UA } });
  if (!xmlResp.ok) throw new Error("Failed to fetch the caption track.");
  const xml = await xmlResp.text();

  const segments = parseTimedText(xml);
  if (!segments.length) throw new Error("No transcript segments could be parsed for this video.");
  return segments;
}

function parseYtInitialPlayerResponse(html) {
  const m = html.match(/ytInitialPlayerResponse\s*=\s*(\{)/);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(start, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

function parseTimedText(xml) {
  const segments = [];

  // srv3 format: <p t="ms" d="ms"><s>word</s>...</p>
  const pRe = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pRe.exec(xml))) {
    const inner = m[3].replace(/<[^>]+>/g, "");
    const text = decodeEntities(inner.replace(/\s+/g, " ").trim());
    if (text) {
      segments.push({ text, start: parseInt(m[1], 10) / 1000, duration: parseInt(m[2], 10) / 1000 });
    }
  }

  // classic format: <text start="s" dur="s">text</text>
  if (!segments.length) {
    const textRe = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    while ((m = textRe.exec(xml))) {
      const text = decodeEntities(m[3].replace(/\s+/g, " ").trim());
      if (text) {
        segments.push({ text, start: parseFloat(m[1]), duration: parseFloat(m[2]) });
      }
    }
  }

  return segments;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
