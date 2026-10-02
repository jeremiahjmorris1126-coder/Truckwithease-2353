import { Hono } from "hono";
import { getKeyOrEnv } from "./vault";

/**
 * Gemini (Google AI Studio) — document OCR + text-to-speech.
 *
 * Two real consumers, both server-side:
 *   1. POST /api/gemini/ocr   — Scan & Bill document extraction (BOL, rate
 *      confirmation, invoice, DVIR photo). Returns structured fields.
 *   2. POST /api/gemini/tts   — AI Co-Pilot Cast voices. Gemini returns raw
 *      16-bit PCM; we wrap it in a WAV header so a browser <audio> can play it
 *      with no client-side decoding.
 *
 * Rules kept from the rest of this API:
 *   - The key is read server-side (vault, then GEMINI_API_KEY in .env) and is
 *     never sent to the browser.
 *   - With no key every endpoint returns 503 `{ live: false }`. Nothing is
 *     faked, and OCR never invents field values.
 *
 * Model names verified live against the account on 2026-08-24. Note that
 * gemini-2.0-flash is retired and 404s ("no longer available, use
 * models/gemini-3.6-flash"), so do not reintroduce it.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const GEMINI_MODELS = {
  /** Multimodal extraction (images + PDF pages). */
  vision: "gemini-3.6-flash",
  /** Cheaper fallback if the primary is throttled. */
  visionFallback: "gemini-2.5-flash",
  /** Speech synthesis. Returns audio/L16 PCM, not mp3. */
  tts: "gemini-2.5-flash-preview-tts",
} as const;

/**
 * AI Co-Pilot Cast → Gemini prebuilt speaker mapping.
 * Character names are ours; the `speaker` values are Gemini's own prebuilt
 * voice ids. Nothing here is cloned from a real person.
 */
export const COPILOT_VOICES = [
  { id: "routing-robbie", name: "Routing Robbie", speaker: "Puck", blurb: "Upbeat road-trip navigator" },
  { id: "compliant-kathy", name: "Compliant Kathy", speaker: "Kore", blurb: "Steady, precise compliance read" },
  { id: "dispatch-darryl", name: "Dispatch Darryl", speaker: "Charon", blurb: "Low, no-nonsense dispatcher" },
  { id: "money-marisol", name: "Money Marisol", speaker: "Aoede", blurb: "Warm, clear numbers voice" },
  { id: "safety-sam", name: "Safety Sam", speaker: "Fenrir", blurb: "Firm trucker-boss safety coach" },
  { id: "weather-wayne", name: "Weather Wayne", speaker: "Zephyr", blurb: "Bright broadcast weather read" },
] as const;

const DOC_TYPES = ["bol", "rate_confirmation", "invoice", "dvir", "generic"] as const;
type DocType = (typeof DOC_TYPES)[number];

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // ~12 MB of decoded image
const MAX_TTS_CHARS = 2000;

export async function geminiKey(): Promise<string | null> {
  return getKeyOrEnv("gemini", "GEMINI_API_KEY");
}

export type GeminiCall =
  | { ok: true; data: any }
  | { ok: false; status: number; error: string };

export async function callGemini(model: string, body: unknown): Promise<GeminiCall> {
  const key = await geminiKey();
  if (!key) return { ok: false, status: 503, error: "no_api_key" };
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON error body */
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json?.error?.message || text.slice(0, 400) || `http_${res.status}`,
      };
    }
    return { ok: true, data: json };
  } catch (e) {
    return { ok: false, status: 502, error: e instanceof Error ? e.message : "fetch failed" };
  }
}

/** Pull the first text part out of a generateContent response. */
export function firstText(data: any): string | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  for (const p of parts) if (typeof p?.text === "string" && p.text.trim()) return p.text;
  return null;
}

/** Pull the first inline audio part out of a generateContent response. */
function firstAudio(data: any): { base64: string; mimeType: string } | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  for (const p of parts) {
    const inline = p?.inlineData ?? p?.inline_data;
    if (inline?.data) return { base64: inline.data, mimeType: inline.mimeType ?? inline.mime_type ?? "" };
  }
  return null;
}

/** Parse "audio/L16;codec=pcm;rate=24000" → sample rate. */
function sampleRateFrom(mimeType: string): number {
  const m = /rate=(\d+)/.exec(mimeType);
  return m ? parseInt(m[1], 10) : 24000;
}

/**
 * Wrap raw signed 16-bit little-endian mono PCM in a RIFF/WAVE header so the
 * browser can play it directly. Gemini TTS returns bare PCM.
 */
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Field sets we ask for per document type. Nothing is inferred or guessed. */
const OCR_FIELDS: Record<DocType, string[]> = {
  bol: [
    "bolNumber", "proNumber", "poNumber", "shipperName", "shipperAddress",
    "consigneeName", "consigneeAddress", "pickupDate", "deliveryDate",
    "pieces", "weight", "weightUnit", "commodity", "carrierName", "trailerNumber",
    "sealNumber", "freightCharges", "specialInstructions",
  ],
  rate_confirmation: [
    "loadNumber", "brokerName", "brokerMc", "brokerPhone", "rate", "rateType",
    "fuelSurcharge", "totalPay", "originCity", "originState", "destinationCity",
    "destinationState", "pickupDate", "deliveryDate", "miles", "equipment",
    "commodity", "weight", "paymentTerms",
  ],
  invoice: [
    "invoiceNumber", "invoiceDate", "dueDate", "billToName", "billToAddress",
    "loadNumber", "bolNumber", "subtotal", "accessorials", "total", "paymentTerms",
  ],
  dvir: [
    "unitNumber", "trailerNumber", "odometer", "inspectionDate", "inspectionType",
    "driverName", "defectsFound", "defectList", "safeToOperate", "remarks",
  ],
  generic: ["documentType", "date", "referenceNumber", "parties", "amounts", "summary"],
};

const OCR_INSTRUCTIONS = `You are reading a scanned freight document for a US trucking company.

Rules:
- Transcribe only what is legibly printed or written on the document.
- If a field is not present or not legible, return null for it. NEVER guess, infer, complete, or invent a value. A null is correct and useful; a plausible invention is not.
- Keep numbers exactly as printed (do not convert units, do not round).
- Dates: return ISO YYYY-MM-DD when the year is legible, otherwise return the date exactly as printed as a string.
- Put anything you read that does not fit a requested field into "notes".
- In "unreadable", list the names of any requested fields you could not read because of image quality.
Return JSON only.`;

export const gemini = new Hono()

  /** Status — is a key present, what models are configured. Never returns the key. */
  .get("/", async (c) => {
    const key = await geminiKey();
    return c.json(
      {
        connected: !!key,
        provider: "google-ai-studio",
        models: GEMINI_MODELS,
        capabilities: ["document_ocr", "text_to_speech"],
        voices: COPILOT_VOICES.length,
        docTypes: DOC_TYPES,
        verifiedLive: "2026-08-24",
        note: key
          ? "Key loaded server-side. It is never sent to the browser."
          : "No Gemini key configured — set GEMINI_API_KEY in the root .env or store it in the vault as service 'gemini'.",
      },
      200,
    );
  })

  /** Live model list straight from Google. Proves the key works. */
  .get("/models", async (c) => {
    const key = await geminiKey();
    if (!key) return c.json({ live: false, error: "no_api_key" }, 503);
    try {
      const res = await fetch(`${GEMINI_BASE}/models?key=${encodeURIComponent(key)}`);
      const json: any = await res.json();
      if (!res.ok) return c.json({ live: false, error: json?.error?.message ?? `http_${res.status}` }, 502);
      const models = (json.models ?? [])
        .filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
        .map((m: any) => m.name.replace(/^models\//, ""));
      return c.json({ live: true, count: models.length, models }, 200);
    } catch (e) {
      return c.json({ live: false, error: e instanceof Error ? e.message : "fetch failed" }, 502);
    }
  })

  /** Voice roster for the AI Co-Pilot Cast. */
  .get("/voices", async (c) => {
    const key = await geminiKey();
    return c.json(
      {
        live: !!key,
        provider: "google-ai-studio",
        model: GEMINI_MODELS.tts,
        format: "audio/wav (16-bit PCM, mono)",
        voices: COPILOT_VOICES,
      },
      200,
    );
  })

  /**
   * Document OCR. Body: { imageBase64, mimeType, docType?, prompt? }
   * Returns { live: true, docType, fields, notes, unreadable, model, usage }.
   */
  .post("/ocr", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    const imageBase64: string | undefined =
      typeof body.imageBase64 === "string" ? body.imageBase64.replace(/^data:[^;]+;base64,/, "") : undefined;
    const mimeType: string = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
    const docType: DocType = DOC_TYPES.includes(body.docType) ? body.docType : "bol";

    if (!imageBase64) return c.json({ live: false, error: "imageBase64_required" }, 400);
    if (!/^(image\/(jpeg|jpg|png|webp|heic|heif)|application\/pdf)$/.test(mimeType)) {
      return c.json({ live: false, error: "unsupported_mime_type", mimeType }, 400);
    }
    const approxBytes = Math.floor((imageBase64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return c.json({ live: false, error: "image_too_large", maxBytes: MAX_IMAGE_BYTES, approxBytes }, 413);
    }

    const fields = OCR_FIELDS[docType];
    const request = {
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            {
              text:
                `${OCR_INSTRUCTIONS}\n\nDocument type: ${docType}\nFields to extract: ${fields.join(", ")}\n` +
                (typeof body.prompt === "string" && body.prompt.trim() ? `Operator note: ${body.prompt.trim()}\n` : ""),
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
            fields: {
              type: "object",
              properties: Object.fromEntries(fields.map((f) => [f, { type: "string", nullable: true }])),
            },
            notes: { type: "string", nullable: true },
            unreadable: { type: "array", items: { type: "string" } },
          },
          required: ["fields"],
        },
      },
    };

    let res = await callGemini(GEMINI_MODELS.vision, request);
    let model: string = GEMINI_MODELS.vision;
    if (!res.ok && (res.status === 404 || res.status === 429 || res.status === 503)) {
      model = GEMINI_MODELS.visionFallback;
      res = await callGemini(model, request);
    }
    if (!res.ok) return c.json({ live: false, error: res.error, model }, res.status === 503 ? 503 : 502);

    const raw = firstText(res.data);
    if (!raw) return c.json({ live: false, error: "empty_response", model }, 502);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return c.json({ live: false, error: "unparseable_model_output", model, raw: raw.slice(0, 800) }, 502);
    }

    const extracted = parsed.fields ?? {};
    const readCount = Object.values(extracted).filter((v) => v !== null && v !== "" && v !== undefined).length;

    return c.json(
      {
        live: true,
        source: "gemini",
        model,
        docType,
        fields: extracted,
        fieldsRead: readCount,
        fieldsRequested: fields.length,
        notes: parsed.notes ?? null,
        unreadable: parsed.unreadable ?? [],
        // Extraction is a transcription, not a verification. Nothing here has
        // been checked against FMCSA, a broker, or any other source.
        verified: false,
        note: "Transcribed from the image by Gemini. Null means the field was not legible or not present — confirm before invoicing.",
        usage: res.data?.usageMetadata ?? null,
      },
      200,
    );
  })

  /**
   * Text to speech. Body: { text, voice?, speaker?, style? }
   * Returns { live: true, mimeType: "audio/wav", audioBase64, bytes, voice }.
   */
  .post("/tts", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    const text: string = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return c.json({ live: false, error: "text_required" }, 400);
    if (text.length > MAX_TTS_CHARS) {
      return c.json({ live: false, error: "text_too_long", maxChars: MAX_TTS_CHARS, chars: text.length }, 413);
    }

    const cast = COPILOT_VOICES.find((v) => v.id === body.voice || v.name === body.voice);
    const speaker = cast?.speaker ?? (typeof body.speaker === "string" ? body.speaker : "Kore");
    const style = typeof body.style === "string" && body.style.trim() ? body.style.trim() : null;
    const prompt = style ? `${style}: ${text}` : text;

    const res = await callGemini(GEMINI_MODELS.tts, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: speaker } } },
      },
    });
    if (!res.ok) {
      return c.json({ live: false, error: res.error, model: GEMINI_MODELS.tts }, res.status === 503 ? 503 : 502);
    }

    const audio = firstAudio(res.data);
    if (!audio) return c.json({ live: false, error: "no_audio_returned", model: GEMINI_MODELS.tts }, 502);

    const pcm = Buffer.from(audio.base64, "base64");
    const rate = sampleRateFrom(audio.mimeType);
    const wav = pcmToWav(pcm, rate);

    return c.json(
      {
        live: true,
        source: "gemini",
        model: GEMINI_MODELS.tts,
        voice: cast ? { id: cast.id, name: cast.name, speaker } : { id: null, name: null, speaker },
        mimeType: "audio/wav",
        sampleRate: rate,
        bytes: wav.length,
        chars: text.length,
        audioBase64: wav.toString("base64"),
      },
      200,
    );
  });
