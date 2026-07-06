/**
 * @file api/voice/transcribe/route.ts
 * @route POST `/api/voice/transcribe`
 *
 * WALKTHROUGH — Phase 3 server-side STT proxy
 * ─────────────────────────────────────────────
 * Accepts a multipart/form-data request with an audio blob + provider hint.
 * Proxies to Deepgram Nova (DEEPGRAM_API_KEY) or AssemblyAI (ASSEMBLYAI_API_KEY).
 * Returns `{ text: string }` on success.
 *
 * Security:
 *   - `auth()` guard — must be authenticated
 *   - `consumeAiRateLimit` — shared 10 req/min sliding window per user
 *   - API keys stay server-side; never exposed to browser
 *
 * Fallback: returns 503 with `{ error }` so the client (useVoiceInput)
 * can gracefully fall back to Phase 1 / Phase 2.
 *
 * Matching pattern: same structure as `/api/ai/assist/route.ts`.
 * Metadata fields validated via `voiceTranscribeSchema` (Zod); audio blob checked separately.
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";
import { voiceTranscribeSchema } from "@/lib/validations";

/** Transcribe via Deepgram Nova-2 */
async function transcribeDeepgram(audioBlob: Blob): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY not configured");

  const arrayBuffer = await audioBlob.arrayBuffer();
  const res = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": audioBlob.type || "audio/webm",
      },
      body: arrayBuffer,
    },
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Deepgram error ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
  };
  return json.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
}

/** Transcribe via AssemblyAI (upload + poll pattern) */
async function transcribeAssemblyAI(audioBlob: Blob): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY not configured");

  const headers = { authorization: apiKey, "content-type": "application/json" };

  // 1. Upload audio
  const arrayBuffer = await audioBlob.arrayBuffer();
  const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: apiKey, "content-type": audioBlob.type || "audio/webm" },
    body: arrayBuffer,
  });
  if (!uploadRes.ok) throw new Error(`AssemblyAI upload failed: ${uploadRes.status}`);
  const { upload_url } = (await uploadRes.json()) as { upload_url: string };

  // 2. Request transcript
  const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers,
    body: JSON.stringify({ audio_url: upload_url }),
  });
  if (!transcriptRes.ok) throw new Error(`AssemblyAI transcript request failed: ${transcriptRes.status}`);
  const { id } = (await transcriptRes.json()) as { id: string };

  // 3. Poll for completion (short chunks ≤ 5s finish quickly)
  const MAX_POLLS = 20;
  const POLL_INTERVAL_MS = 500;
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, { headers });
    if (!pollRes.ok) continue;
    const result = (await pollRes.json()) as { status: string; text?: string; error?: string };
    if (result.status === "completed") return result.text ?? "";
    if (result.status === "error") throw new Error(`AssemblyAI error: ${result.error}`);
  }

  throw new Error("AssemblyAI transcript timed out.");
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit (shared with AI assist)
  const rate = await consumeAiRateLimit(session.user.id);
  if (!rate.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded — try again in ${rate.retryAfterSec}s` },
      { status: 429 },
    );
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  const providerRaw = formData.get("provider");

  const parsed = voiceTranscribeSchema.safeParse({
    provider: typeof providerRaw === "string" ? providerRaw : undefined,
    audioFormat:
      audioFile instanceof Blob && audioFile.type
        ? audioFile.type.slice(0, 30)
        : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  if (!audioFile || !(audioFile instanceof Blob) || audioFile.size === 0) {
    return NextResponse.json({ error: "Missing audio blob" }, { status: 400 });
  }

  const provider = parsed.data.provider;

  try {
    let text = "";
    if (provider === "server-assemblyai") {
      text = await transcribeAssemblyAI(audioFile);
    } else {
      // Default to Deepgram
      text = await transcribeDeepgram(audioFile);
    }
    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Transcription failed";
    // 503 signals client to fall back to Phase 1 / Phase 2
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
