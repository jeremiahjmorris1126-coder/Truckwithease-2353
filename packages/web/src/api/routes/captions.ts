import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { GEMINI_MODELS, callGemini, firstText, geminiKey } from "./gemini";

/**
 * Captions + translation — server side, Gemini only.
 *
 * Built to replace the pasted `awsServices.js`, which could not run: there are
 * no AWS credentials in this project at all, it imported the end-of-support
 * aws-sdk v2, and its quality numbers were hardcoded (`confidence: 0.998` on
 * transcription, `confidence: 0.96` and `latency: '2.3s'` on translation) rather
 * than measured. Its `generateSignLanguageVideo()` invoked a Lambda named
 * truckwithease-asl-generator that does not exist, and `predictFatigue()` filled
 * 124 of 128 model input dimensions with Math.random().
 *
 * What this route does instead:
 *   - Transcribes audio with Gemini (the key is already live and server-side).
 *   - Translates text with Gemini into the ten locales the app actually ships
 *     translated copy for. Nothing else is offered, so the UI cannot promise a
 *     language the platform does not support.
 *   - Reports `confidence: null`. Gemini's generateContent response carries no
 *     ASR confidence score, so there is no honest number to put there.
 *   - Reports `latencyMs` measured with a clock around the provider call, not a
 *     copy string.
 *   - Logs every request to accessibility_requests (the same queue the
 *     accessibility page reads) with provider "gemini" and fulfilled true only
 *     when the provider actually returned text.
 *
 * Deliberately NOT built: sign-language video. No model available here produces
 * real ASL/BSL/LSF, so /api/captions has no sign-language endpoint at all rather
 * than a stub that returns a broken video url.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** The ten locales with complete translated app copy (mirrors lib/i18n.js SUPPORTED_LANGUAGES). */
export const CAPTION_LANGUAGES = {
  "en-US": "English (United States)",
  "ar-SA": "Arabic (Saudi Arabia)",
  "es-ES": "Spanish (Spain)",
  "pt-BR": "Portuguese (Brazil)",
  "fr-FR": "French (France)",
  "de-DE": "German (Germany)",
  "zh-CN": "Chinese, Simplified (China)",
  "ja-JP": "Japanese (Japan)",
  "hi-IN": "Hindi (India)",
  "th-TH": "Thai (Thailand)",
} as const;

type CaptionLang = keyof typeof CAPTION_LANGUAGES;

const isLang = (v: unknown): v is CaptionLang =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(CAPTION_LANGUAGES, v);

/** Audio container types Gemini accepts as inlineData. */
const AUDIO_MIME = /^audio\/(wav|x-wav|wave|mpeg|mp3|mp4|m4a|x-m4a|aac|ogg|opus|flac|webm|aiff|amr|3gpp)$/;

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // ~15 MB decoded; Gemini inline request ceiling is 20 MB
const MAX_TEXT_CHARS = 5000;

const TRANSCRIBE_INSTRUCTIONS = `You are transcribing audio recorded inside a moving commercial truck cab in the United States.
Return the spoken words verbatim. Rules:
- Do not summarise, translate, correct grammar, or add words that were not spoken.
- Keep trucking terms as spoken: BOL, DVIR, HOS, ELD, DOT, reefer, deadhead, drop and hook, bobtail, lumper, 34-hour reset.
- If a stretch is inaudible, write [inaudible] in place of it. Do not guess.
- If the audio contains no speech at all, return an empty transcript string.
- Report the language you actually heard as a BCP-47 tag.`;

const TRANSLATE_INSTRUCTIONS = `You translate short operational messages for commercial truck drivers.
Rules:
- Translate meaning, not word-for-word. Keep it plain and short enough to read at a glance.
- Leave regulatory acronyms and document identifiers in their original form: DOT, FMCSA, HOS, ELD, DVIR, BOL, PO numbers, load numbers, unit numbers.
- Keep numbers, dates, weights and dollar amounts exactly as given. Do not convert units or currency.
- Do not add advice, warnings or pleasantries that are not in the source.`;

const bad = (error: string, extra: Record<string, unknown> = {}) => ({ live: false, error, ...extra });

/** Persist to the shared accessibility queue. Never throws into the response path. */
async function logRequest(row: {
  driverId: string | null;
  kind: "caption" | "translation";
  sourceText: string | null;
  sourceLanguage: string;
  targetLanguage: string | null;
  resultText: string | null;
  fulfilled: boolean;
  note: string;
}): Promise<string | null> {
  const id = rid("areq");
  try {
    await db.insert(schema.accessibilityRequests).values({
      id,
      driverId: row.driverId || "unassigned",
      kind: row.kind,
      sourceText: row.sourceText ? row.sourceText.slice(0, 4000) : null,
      sourceLanguage: row.sourceLanguage.slice(0, 12),
      targetLanguage: row.targetLanguage ? row.targetLanguage.slice(0, 12) : null,
      resultText: row.resultText ? row.resultText.slice(0, 4000) : null,
      resultSource: row.fulfilled ? "provider" : null,
      provider: "gemini",
      fulfilled: row.fulfilled,
      note: row.note,
    });
    return id;
  } catch {
    // A logging failure must not turn a successful transcription into an error.
    return null;
  }
}

export const captions = new Hono()
  /** What is actually wired up. Safe to call with no key — it says so. */
  .get("/status", async (c) => {
    const key = await geminiKey();
    return c.json({
      live: Boolean(key),
      provider: "gemini",
      keyPresent: Boolean(key),
      models: { transcribe: GEMINI_MODELS.vision, translate: GEMINI_MODELS.vision },
      capabilities: {
        transcribeAudio: Boolean(key),
        translateText: Boolean(key),
        speakTranslation: Boolean(key), // via POST /api/gemini/tts, not this route
        signLanguageVideo: false,
      },
      languages: CAPTION_LANGUAGES,
      limits: { maxAudioBytes: MAX_AUDIO_BYTES, maxTextChars: MAX_TEXT_CHARS },
      notes: [
        "Gemini returns no ASR confidence score, so confidence is always null here. Nothing invents one.",
        "latencyMs on every response is measured around the provider call.",
        "Sign-language video is not implemented. No model available here produces real ASL, BSL or LSF.",
        "Translation targets are limited to the ten locales the app ships translated copy for.",
      ],
      note: key
        ? "Gemini key present server-side. Transcription and translation are live."
        : "No Gemini key. Every endpoint on this route returns 503 until GEMINI_API_KEY is set or a key is stored in the vault.",
    });
  })

  .get("/languages", (c) =>
    c.json({
      languages: CAPTION_LANGUAGES,
      count: Object.keys(CAPTION_LANGUAGES).length,
      note: "These are the locales with complete translated app copy. Other locales render English text with correct formatting and are not offered here.",
    }),
  )

  /**
   * Transcribe audio.
   * Body: { audioBase64, mimeType, driverId?, languageHint?, translateTo? }
   * Returns { live, transcript, language, confidence: null, latencyMs, translation? }
   */
  .post("/transcribe", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    const audioBase64: string | undefined =
      typeof body.audioBase64 === "string" ? body.audioBase64.replace(/^data:[^;]+;base64,/, "") : undefined;
    const mimeType: string = typeof body.mimeType === "string" ? body.mimeType : "audio/wav";
    const driverId: string | null = typeof body.driverId === "string" && body.driverId.trim() ? body.driverId.trim() : null;
    const languageHint: string | null = typeof body.languageHint === "string" ? body.languageHint.slice(0, 12) : null;

    if (!audioBase64) return c.json(bad("audioBase64_required"), 400);
    if (!AUDIO_MIME.test(mimeType)) return c.json(bad("unsupported_mime_type", { mimeType }), 400);
    const approxBytes = Math.floor((audioBase64.length * 3) / 4);
    if (approxBytes > MAX_AUDIO_BYTES) {
      return c.json(bad("audio_too_large", { maxBytes: MAX_AUDIO_BYTES, approxBytes }), 413);
    }
    if (body.translateTo != null && !isLang(body.translateTo)) {
      return c.json(bad("unsupported_language", { translateTo: body.translateTo, supported: Object.keys(CAPTION_LANGUAGES) }), 400);
    }
    const translateTo: CaptionLang | null = isLang(body.translateTo) ? body.translateTo : null;

    const request = {
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            {
              text:
                `${TRANSCRIBE_INSTRUCTIONS}\n` +
                (languageHint ? `The speaker is expected to be speaking ${languageHint}, but trust the audio over this hint.\n` : ""),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            transcript: { type: "string" },
            language: { type: "string", nullable: true },
            speechDetected: { type: "boolean" },
            inaudibleSegments: { type: "integer", nullable: true },
          },
          required: ["transcript", "speechDetected"],
        },
      },
    };

    const started = Date.now();
    let model: string = GEMINI_MODELS.vision;
    let res = await callGemini(model, request);
    if (!res.ok && (res.status === 404 || res.status === 429 || res.status === 503)) {
      model = GEMINI_MODELS.visionFallback;
      res = await callGemini(model, request);
    }
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      return c.json(bad(res.error, { model, latencyMs, stage: "transcribe" }), res.status === 503 ? 503 : 502);
    }
    const raw = firstText(res.data);
    if (!raw) return c.json(bad("empty_response", { model, latencyMs }), 502);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return c.json(bad("unparseable_model_output", { model, latencyMs, raw: raw.slice(0, 800) }), 502);
    }

    const transcript: string = typeof parsed.transcript === "string" ? parsed.transcript.trim() : "";
    const speechDetected: boolean = parsed.speechDetected === true && transcript.length > 0;

    // Optional second hop: translate the transcript we just produced.
    let translation: null | {
      targetLanguage: CaptionLang;
      text: string | null;
      latencyMs: number;
      model: string;
      error?: string;
    } = null;
    if (translateTo && speechDetected) {
      const t = await translateText(transcript, translateTo, parsed.language ?? null);
      translation = t.ok
        ? { targetLanguage: translateTo, text: t.text, latencyMs: t.latencyMs, model: t.model }
        : { targetLanguage: translateTo, text: null, latencyMs: t.latencyMs, model: t.model, error: t.error };
    }

    const requestId = await logRequest({
      driverId,
      kind: "caption",
      sourceText: transcript || null,
      sourceLanguage: parsed.language || languageHint || "unknown",
      targetLanguage: translateTo,
      resultText: translation?.text ?? transcript ?? null,
      fulfilled: speechDetected,
      note: speechDetected
        ? `Transcribed by Gemini (${model}) in ${latencyMs} ms. No confidence score — the provider does not return one.`
        : "Gemini reported no speech in the audio. Nothing was transcribed and nothing was guessed.",
    });

    return c.json(
      {
        live: true,
        source: "gemini",
        model,
        requestId,
        transcript,
        speechDetected,
        language: parsed.language ?? null,
        inaudibleSegments: typeof parsed.inaudibleSegments === "number" ? parsed.inaudibleSegments : null,
        // Deliberately null. Gemini's generateContent response has no ASR
        // confidence field, so any number here would be invented.
        confidence: null,
        latencyMs,
        translation,
        note: speechDetected
          ? "Verbatim transcript. [inaudible] marks audio the model could not make out — it does not guess. confidence is null because Gemini returns no confidence score."
          : "No speech detected in the audio.",
      },
      200,
    );
  })

  /**
   * Translate text.
   * Body: { text, targetLanguage, sourceLanguage?, driverId? }
   * Returns { live, translatedText, targetLanguage, latencyMs, confidence: null }
   */
  .post("/translate", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    const text: string = typeof body.text === "string" ? body.text.trim() : "";
    const driverId: string | null = typeof body.driverId === "string" && body.driverId.trim() ? body.driverId.trim() : null;
    const sourceLanguage: string | null = typeof body.sourceLanguage === "string" ? body.sourceLanguage.slice(0, 12) : null;

    if (!text) return c.json(bad("text_required"), 400);
    if (text.length > MAX_TEXT_CHARS) {
      return c.json(bad("text_too_long", { maxChars: MAX_TEXT_CHARS, chars: text.length }), 413);
    }
    if (!isLang(body.targetLanguage)) {
      return c.json(
        bad("unsupported_language", { targetLanguage: body.targetLanguage ?? null, supported: Object.keys(CAPTION_LANGUAGES) }),
        400,
      );
    }
    const targetLanguage: CaptionLang = body.targetLanguage;

    const t = await translateText(text, targetLanguage, sourceLanguage);
    if (!t.ok) {
      return c.json(bad(t.error, { model: t.model, latencyMs: t.latencyMs, stage: "translate" }), t.status === 503 ? 503 : 502);
    }

    const requestId = await logRequest({
      driverId,
      kind: "translation",
      sourceText: text,
      sourceLanguage: t.detectedSource || sourceLanguage || "unknown",
      targetLanguage,
      resultText: t.text,
      fulfilled: Boolean(t.text),
      note: `Translated by Gemini (${t.model}) in ${t.latencyMs} ms. No confidence score — the provider does not return one.`,
    });

    return c.json(
      {
        live: true,
        source: "gemini",
        model: t.model,
        requestId,
        sourceText: text,
        sourceLanguage: t.detectedSource || sourceLanguage || null,
        targetLanguage,
        targetLanguageLabel: CAPTION_LANGUAGES[targetLanguage],
        translatedText: t.text,
        confidence: null,
        latencyMs: t.latencyMs,
        audioUrl: null,
        note: "Machine translation, not a certified translation. Acronyms, numbers and dollar amounts are left as written. POST the result to /api/gemini/tts to hear it — this route stores no audio files.",
      },
      200,
    );
  })

  /** Recent caption / translation rows for the queue view. */
  .get("/history", async (c) => {
    const driverId = c.req.query("driverId");
    const kind = c.req.query("kind");
    const limit = Math.min(Math.max(Number(c.req.query("limit") || 50) || 50, 1), 200);
    const where = [
      driverId ? eq(schema.accessibilityRequests.driverId, driverId) : undefined,
      kind === "caption" || kind === "translation" ? eq(schema.accessibilityRequests.kind, kind) : undefined,
    ].filter(Boolean);

    const rows = await db
      .select()
      .from(schema.accessibilityRequests)
      .where(where.length ? and(...(where as never[])) : undefined)
      .orderBy(desc(schema.accessibilityRequests.createdAt))
      .limit(limit);

    return c.json({
      requests: rows,
      count: rows.length,
      fulfilledCount: rows.filter((r) => r.fulfilled).length,
      note: "Same table the accessibility queue reads. Rows written by this route carry provider 'gemini'; unfulfilled rows say in `note` why nothing was produced.",
    });
  });

/** Shared translation call. Returns a measured latency in every branch. */
async function translateText(
  text: string,
  target: CaptionLang,
  sourceHint: string | null,
): Promise<
  | { ok: true; text: string; detectedSource: string | null; latencyMs: number; model: string }
  | { ok: false; error: string; status: number; latencyMs: number; model: string }
> {
  const request = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `${TRANSLATE_INSTRUCTIONS}\n\nTarget language: ${CAPTION_LANGUAGES[target]} (${target})\n` +
              (sourceHint ? `Source language hint: ${sourceHint}\n` : "") +
              `\nText to translate:\n${text}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          translatedText: { type: "string" },
          detectedSourceLanguage: { type: "string", nullable: true },
        },
        required: ["translatedText"],
      },
    },
  };

  const started = Date.now();
  let model: string = GEMINI_MODELS.vision;
  let res = await callGemini(model, request);
  if (!res.ok && (res.status === 404 || res.status === 429 || res.status === 503)) {
    model = GEMINI_MODELS.visionFallback;
    res = await callGemini(model, request);
  }
  const latencyMs = Date.now() - started;

  if (!res.ok) return { ok: false, error: res.error, status: res.status, latencyMs, model };
  const raw = firstText(res.data);
  if (!raw) return { ok: false, error: "empty_response", status: 502, latencyMs, model };
  try {
    const parsed = JSON.parse(raw);
    const out = typeof parsed.translatedText === "string" ? parsed.translatedText.trim() : "";
    if (!out) return { ok: false, error: "empty_translation", status: 502, latencyMs, model };
    return {
      ok: true,
      text: out,
      detectedSource: typeof parsed.detectedSourceLanguage === "string" ? parsed.detectedSourceLanguage : null,
      latencyMs,
      model,
    };
  } catch {
    return { ok: false, error: "unparseable_model_output", status: 502, latencyMs, model };
  }
}
