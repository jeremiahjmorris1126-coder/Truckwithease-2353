import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../database";
import { traxesRecords } from "../database/schema";
import { S3_BUCKET, s3, storageConfigured } from "../lib/s3";
import { GEMINI_MODELS, callGemini, firstText, geminiKey } from "./gemini";

/**
 * TRAXES — scan a document, file it, keep the money record.
 *
 * Flow, all server-side except the byte transfer:
 *   1. client asks POST /api/storage/presign-upload  (folder "bol")
 *   2. client PUTs the photo straight to the bucket — no credential in the browser
 *   3. client calls POST /api/traxes/scan with the returned key
 *   4. this server GETs the object, sends it to Gemini vision as inlineData,
 *      and returns whatever fields the model could actually read
 *   5. client confirms/edits, then POST /api/traxes/records stores the row
 *   6. POST /api/traxes/send/:id files it to the dispatch queue and/or mints a
 *      short-lived signed link the driver can hand to a broker
 *
 * What this file deliberately does NOT do:
 *   - It does not email a broker. No email provider is connected to this project
 *     (no Resend/Postmark/Mailgun credential exists), so /send never claims a
 *     document was emailed. It returns a real signed link instead and says so.
 *   - It does not invent a number. If the model cannot read an amount, `amount`
 *     comes back null with a plain-English reason in `ocrNote`. There is no
 *     fallback guess, no average, no Math.random().
 *   - `ocrConfidence` is null. Gemini's generateContent returns no confidence
 *     score, so nothing is written to that column.
 *   - It files nothing with any tax authority and makes no claim of IRS
 *     acceptance. TRAXES is a record-keeper and a calculator for a preparer.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const bad = (msg: string) => ({ error: msg });

/** Document kinds the scanner is prompted for, and the tax bucket each lands in. */
export const TRAXES_KINDS = [
  { kind: "bol", label: "Bill of lading", category: "revenue" },
  { kind: "rate_confirmation", label: "Rate confirmation", category: "revenue" },
  { kind: "invoice", label: "Invoice", category: "revenue" },
  { kind: "fuel_receipt", label: "Fuel receipt", category: "fuel" },
  { kind: "lumper_receipt", label: "Lumper receipt", category: "lumper" },
  { kind: "scale_ticket", label: "Scale ticket", category: "scale" },
  { kind: "toll_receipt", label: "Toll receipt", category: "tolls" },
  { kind: "repair_invoice", label: "Repair invoice", category: "repair" },
  { kind: "permit", label: "Permit", category: "permit" },
  { kind: "other", label: "Other", category: "other" },
] as const;

export const TRAXES_CATEGORIES = [
  "revenue",
  "fuel",
  "tolls",
  "lumper",
  "scale",
  "repair",
  "permit",
  "insurance",
  "meals",
  "supplies",
  "other",
] as const;

const KIND_SET = new Set(TRAXES_KINDS.map((k) => k.kind));
const CATEGORY_SET = new Set<string>(TRAXES_CATEGORIES);
const categoryFor = (kind: string) => TRAXES_KINDS.find((k) => k.kind === kind)?.category ?? "other";

const MAX_SCAN_BYTES = 12 * 1024 * 1024; // Gemini inlineData ceiling used elsewhere in this project

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const str = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s && s.toLowerCase() !== "null" && s.toLowerCase() !== "unknown" ? s : null;
};
const asDate = (v: unknown): Date | null => {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * The extraction prompt. It is explicit that a missing field must come back null
 * — that instruction is the whole reason this feature can be trusted.
 */
const scanPrompt = (kind: string) => `You are reading a photograph of a trucking document. The driver says it is a "${kind}".

Return ONLY a JSON object, no markdown fence, with exactly these keys:
{
  "documentType": one of ${TRAXES_KINDS.map((k) => `"${k.kind}"`).join(", ")},
  "reference": document/BOL/PO/invoice/pro number as printed, or null,
  "broker": broker or carrier name as printed, or null,
  "vendor": truck stop, lumper service, repair shop or issuer name, or null,
  "amount": the single total dollar amount as a plain number, or null,
  "currency": 3-letter code if printed, else null,
  "date": the document date as YYYY-MM-DD, or null,
  "origin": shipper city/state, or null,
  "destination": consignee city/state, or null,
  "weight": net weight in pounds as a plain number, or null,
  "unreadable": array of the key names above you could not read,
  "note": one short sentence naming what was illegible or missing, or null
}

Rules you must follow:
- If a value is not legibly printed on the document, return null for it and list the key in "unreadable". Never estimate, never infer from context, never fill a typical value.
- "amount" is the grand total actually printed. If several totals appear and you cannot tell which is the grand total, return null and say so in "note".
- Do not return any key that is not in the list above.`;

/** Pull the JSON object out of a model reply that may be fenced or chatty. */
function parseModelJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/^```(?:json)?/im, "").replace(/```\s*$/m, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const taxYearOf = (d: Date | null) => (d ? d.getUTCFullYear() : new Date().getUTCFullYear());

export const traxes = new Hono()

  .get("/status", async (c) => {
    const key = await geminiKey();
    const rows = await db.select().from(traxesRecords);
    return c.json({
      module: "TRAXES",
      what: "Scan a document, file it to dispatch or hand a broker a signed link, and keep the money record for a tax preparer.",
      ocr: {
        configured: Boolean(key),
        provider: key ? "google-gemini" : null,
        model: key ? GEMINI_MODELS.vision : null,
        fallback: key ? GEMINI_MODELS.visionFallback : null,
        confidenceScores: false,
        note: key
          ? "Server-side only. The image is read from the bucket and posted to Gemini as inlineData; the browser never sees the key."
          : "GEMINI_API_KEY is not set, so /scan will return 503. Records can still be entered by hand.",
      },
      storage: {
        configured: storageConfigured,
        folder: "bol",
        note: storageConfigured
          ? "Uploads use presigned PUT URLs from /api/storage/presign-upload. No credential reaches the browser."
          : "S3 env vars are missing, so file scanning is unavailable.",
      },
      brokerDelivery: {
        emailConfigured: false,
        provider: null,
        note: "No email provider is connected to this project, so TRAXES cannot email a broker. /send returns a real short-lived signed link the driver sends themselves, and records destination=link. It never claims a document was emailed.",
      },
      dispatchDelivery: {
        live: true,
        note: "Filing to dispatch writes destination=dispatch on the record. GET /api/traxes/dispatch-queue is what the dispatch side reads.",
      },
      taxDisclaimer:
        "TRAXES stores and exports records. It does not file with the IRS or any state, does not compute tax owed as advice, and is not a substitute for a tax preparer.",
      records: rows.length,
      kinds: TRAXES_KINDS,
      categories: TRAXES_CATEGORIES,
    });
  })

  /**
   * OCR a file already uploaded to the bucket via presigned PUT.
   * Body: { key, kind?, driverId? }. Nothing is written to the DB here — the
   * driver confirms the fields first.
   */
  .post("/scan", async (c) => {
    if (!storageConfigured) return c.json(bad("Object storage is not configured on this server, so there is nothing to scan."), 503);
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const key = String((body as any).key || "").trim();
    if (!key) return c.json(bad("key is required — upload the file first with POST /api/storage/presign-upload"), 400);
    const kind = KIND_SET.has(String((body as any).kind)) ? String((body as any).kind) : "other";

    let head: { ContentLength?: number; ContentType?: string };
    try {
      head = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    } catch {
      return c.json(bad("That key does not exist in the bucket. Confirm the presigned PUT actually completed."), 404);
    }
    const size = head.ContentLength ?? 0;
    if (size > MAX_SCAN_BYTES) {
      return c.json(bad(`That file is ${size} bytes. The scanner accepts up to ${MAX_SCAN_BYTES} bytes — retake the photo at a lower resolution.`), 400);
    }
    const mimeType = head.ContentType || "image/jpeg";
    if (!/^image\/|^application\/pdf$/.test(mimeType)) {
      return c.json(bad(`The scanner reads images and PDFs. That object is ${mimeType}.`), 400);
    }

    let base64: string;
    try {
      const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
      const bytes = await obj.Body!.transformToByteArray();
      base64 = Buffer.from(bytes).toString("base64");
    } catch (e) {
      return c.json(bad(`Could not read the object back from the bucket: ${(e as Error).message}`), 502);
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: scanPrompt(kind) }, { inlineData: { mimeType, data: base64 } }],
        },
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    };

    const started = Date.now();
    let call = await callGemini(GEMINI_MODELS.vision, payload);
    let model = GEMINI_MODELS.vision;
    if (!call.ok && call.status !== 503) {
      call = await callGemini(GEMINI_MODELS.visionFallback, payload);
      model = GEMINI_MODELS.visionFallback;
    }
    const latencyMs = Date.now() - started;
    if (!call.ok) {
      return c.json({ ...bad(`OCR failed: ${call.error}`), model, latencyMs }, call.status === 503 ? 503 : 502);
    }

    const text = firstText(call.data);
    const parsed = text ? parseModelJson(text) : null;
    if (!parsed) {
      return c.json(
        { ...bad("The model answered but not with readable JSON. Nothing was extracted; enter the fields by hand."), model, latencyMs, raw: text?.slice(0, 600) ?? null },
        502,
      );
    }

    const occurredAt = asDate(parsed.date);
    const detected = KIND_SET.has(String(parsed.documentType)) ? String(parsed.documentType) : kind;
    const unreadable = Array.isArray(parsed.unreadable) ? parsed.unreadable.map(String) : [];
    const extracted = {
      kind: detected,
      category: categoryFor(detected),
      reference: str(parsed.reference),
      broker: str(parsed.broker),
      vendor: str(parsed.vendor),
      amount: num(parsed.amount),
      currency: str(parsed.currency) ?? "USD",
      occurredAt: occurredAt ? occurredAt.toISOString() : null,
      taxYear: taxYearOf(occurredAt),
      origin: str(parsed.origin),
      destination: str(parsed.destination),
      weight: num(parsed.weight),
    };

    return c.json({
      key,
      mimeType,
      sizeBytes: size,
      extracted,
      unreadable,
      ocrNote: str(parsed.note),
      // The provider returns no confidence score. This stays null rather than
      // showing the driver a number nobody measured.
      confidence: null,
      model,
      latencyMs,
      needsReview: extracted.amount === null || unreadable.length > 0,
      note:
        extracted.amount === null
          ? "No total was legibly readable, so the amount is blank. Type it in before filing — TRAXES will not guess it."
          : "Check every field against the paper before filing. The model reads what is printed; it does not verify it.",
    });
  })

  /** Store a confirmed record. Money fields stay null if the driver leaves them blank. */
  .post("/records", async (c) => {
    const b = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const driverId = String(b.driverId || "").trim();
    if (!driverId) return c.json(bad("driverId is required"), 400);
    const kind = KIND_SET.has(String(b.kind)) ? String(b.kind) : "other";
    const category = CATEGORY_SET.has(String(b.category)) ? String(b.category) : categoryFor(kind);
    const occurredAt = asDate(b.occurredAt) ?? new Date();
    const amount = num(b.amount);

    const [row] = await db
      .insert(traxesRecords)
      .values({
        id: rid("trx"),
        driverId,
        kind,
        category,
        docKey: str(b.docKey),
        fileName: str(b.fileName),
        mimeType: str(b.mimeType),
        sizeBytes: num(b.sizeBytes),
        broker: str(b.broker),
        loadId: str(b.loadId),
        reference: str(b.reference),
        vendor: str(b.vendor),
        amount,
        currency: str(b.currency) ?? "USD",
        taxYear: num(b.taxYear) ?? taxYearOf(occurredAt),
        occurredAt,
        deductible: b.deductible === undefined ? category !== "revenue" : Boolean(b.deductible),
        ocrRaw: str(b.ocrRaw),
        ocrNote: str(b.ocrNote),
        ocrModel: str(b.ocrModel),
        ocrConfidence: null,
        status: amount === null ? "needs_review" : "filed",
        destination: "none",
        notes: str(b.notes),
      })
      .returning();

    return c.json({
      record: row,
      note: amount === null ? "Stored as needs_review because no amount was entered." : "Stored.",
    });
  })

  .get("/records", async (c) => {
    const driverId = c.req.query("driverId");
    const taxYear = c.req.query("taxYear");
    const filters = [
      driverId ? eq(traxesRecords.driverId, driverId) : undefined,
      taxYear ? eq(traxesRecords.taxYear, Number(taxYear)) : undefined,
    ].filter(Boolean);
    const rows = await db
      .select()
      .from(traxesRecords)
      .where(filters.length ? and(...(filters as any)) : undefined)
      .orderBy(desc(traxesRecords.createdAt))
      .limit(200);
    return c.json({ records: rows, count: rows.length, limit: 200 });
  })

  .get("/records/:id", async (c) => {
    const [row] = await db.select().from(traxesRecords).where(eq(traxesRecords.id, c.req.param("id")));
    if (!row) return c.json(bad("No TRAXES record with that id."), 404);
    return c.json({ record: row });
  })

  .delete("/records/:id", async (c) => {
    const [row] = await db.select().from(traxesRecords).where(eq(traxesRecords.id, c.req.param("id")));
    if (!row) return c.json(bad("No TRAXES record with that id."), 404);
    await db.delete(traxesRecords).where(eq(traxesRecords.id, row.id));
    return c.json({ deleted: true, id: row.id, note: "The row is gone. The file in the bucket is untouched." });
  })

  /**
   * Send the document on. Two honest destinations:
   *   "dispatch" — writes destination=dispatch, which is what /dispatch-queue reads.
   *   "link"     — mints a presigned GET URL (max 24h) the driver forwards to the broker.
   * There is no "email" destination because no email provider is connected.
   */
  .post("/send/:id", async (c) => {
    const [row] = await db.select().from(traxesRecords).where(eq(traxesRecords.id, c.req.param("id")));
    if (!row) return c.json(bad("No TRAXES record with that id."), 404);
    const b = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const destination = String(b.destination || "dispatch");
    if (destination !== "dispatch" && destination !== "link") {
      return c.json(bad('destination must be "dispatch" or "link". Emailing a broker is not available — no email provider is connected to this project.'), 400);
    }

    let link: { url: string; expiresIn: number } | null = null;
    if (destination === "link") {
      if (!row.docKey) return c.json(bad("That record has no stored file, so there is nothing to link to."), 400);
      if (!storageConfigured) return c.json(bad("Object storage is not configured, so a link cannot be signed."), 503);
      const expiresIn = Math.min(Math.max(Number(b.expiresIn) || 86400, 300), 86400);
      try {
        await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: row.docKey }));
        const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: row.docKey }), { expiresIn });
        link = { url, expiresIn };
      } catch (e) {
        return c.json(bad(`Could not sign a link for that file: ${(e as Error).message}`), 502);
      }
    }

    const note =
      destination === "dispatch"
        ? "Filed to the dispatch queue in this platform. Nothing was emailed."
        : `Signed link created, valid for ${link!.expiresIn} seconds. TRAXES did not send it anywhere — copy it to the broker yourself.`;

    const [updated] = await db
      .update(traxesRecords)
      .set({ destination, destinationNote: note, sentAt: new Date(), status: row.status === "needs_review" ? "needs_review" : "filed" })
      .where(eq(traxesRecords.id, row.id))
      .returning();

    return c.json({ record: updated, destination, link, sent: destination === "dispatch", emailed: false, note });
  })

  /** What the dispatch side reads: everything a driver filed to dispatch. */
  .get("/dispatch-queue", async (c) => {
    const rows = await db
      .select()
      .from(traxesRecords)
      .where(eq(traxesRecords.destination, "dispatch"))
      .orderBy(desc(traxesRecords.sentAt))
      .limit(200);
    return c.json({
      queue: rows,
      count: rows.length,
      note: "These rows were filed to dispatch by a driver inside this platform. No external TMS received them.",
    });
  })

  /** Totals a tax preparer would ask for. Every figure is a sum of stored rows. */
  .get("/summary", async (c) => {
    const driverId = c.req.query("driverId");
    const taxYear = Number(c.req.query("taxYear")) || new Date().getUTCFullYear();
    const filters = [eq(traxesRecords.taxYear, taxYear), driverId ? eq(traxesRecords.driverId, driverId) : undefined].filter(Boolean);
    const rows = await db.select().from(traxesRecords).where(and(...(filters as any)));

    const byCategory: Record<string, { records: number; amount: number; missingAmount: number }> = {};
    let revenue = 0;
    let deductions = 0;
    let missingAmount = 0;
    for (const r of rows) {
      const c2 = r.category || "other";
      byCategory[c2] ??= { records: 0, amount: 0, missingAmount: 0 };
      byCategory[c2].records += 1;
      if (r.amount === null) {
        byCategory[c2].missingAmount += 1;
        missingAmount += 1;
        continue;
      }
      byCategory[c2].amount += r.amount;
      if (c2 === "revenue") revenue += r.amount;
      else if (r.deductible) deductions += r.amount;
    }

    return c.json({
      taxYear,
      driverId: driverId ?? null,
      records: rows.length,
      revenue,
      deductions,
      net: revenue - deductions,
      byCategory,
      recordsMissingAnAmount: missingAmount,
      completeness:
        rows.length === 0
          ? { value: null, reason: "No documents have been filed for this tax year yet." }
          : { value: Math.round(((rows.length - missingAmount) / rows.length) * 100), unit: "percent of records with a readable amount" },
      disclaimer:
        "These are sums of the documents stored in TRAXES, nothing more. They are not a tax return, not a tax computation, and not advice. Hand them to your preparer.",
    });
  })

  /** CSV a preparer can open. One row per document, no derived columns. */
  .get("/export", async (c) => {
    const driverId = c.req.query("driverId");
    const taxYear = Number(c.req.query("taxYear")) || new Date().getUTCFullYear();
    const filters = [eq(traxesRecords.taxYear, taxYear), driverId ? eq(traxesRecords.driverId, driverId) : undefined].filter(Boolean);
    const rows = await db.select().from(traxesRecords).where(and(...(filters as any))).orderBy(traxesRecords.occurredAt);

    const cols = [
      "date",
      "driver_id",
      "document_type",
      "tax_category",
      "deductible",
      "vendor",
      "broker",
      "reference",
      "load_id",
      "amount",
      "currency",
      "status",
      "sent_to",
      "file_key",
      "notes",
    ];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [cols.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.occurredAt ? new Date(r.occurredAt).toISOString().slice(0, 10) : "",
          r.driverId,
          r.kind,
          r.category,
          r.deductible ? "yes" : "no",
          r.vendor,
          r.broker,
          r.reference,
          r.loadId,
          r.amount === null ? "" : r.amount,
          r.currency,
          r.status,
          r.destination,
          r.docKey,
          r.ocrNote ?? r.notes,
        ]
          .map(esc)
          .join(","),
      );
    }
    return new Response(lines.join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="traxes-${taxYear}${driverId ? `-${driverId}` : ""}.csv"`,
      },
    });
  });
