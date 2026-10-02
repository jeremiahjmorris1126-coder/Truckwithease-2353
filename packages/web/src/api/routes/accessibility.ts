import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * Accessibility — server side.
 *
 * Rebuilt from the pasted PocketBase schema (`captions`, `sign_language_videos`,
 * `haptic_communications`, `translations`, plus the accessibility fields that
 * were bolted onto `drivers`). Those collections existed on no server, so the
 * accessibility pages saved nothing at all.
 *
 * What is deliberately NOT reproduced:
 *  - `confidence` on captions / translations / sign-language rows. There is no
 *    ASR, MT or sign-language provider connected. A confidence number with no
 *    model behind it is a fabricated number.
 *  - `video_url` / `audio_url`. Nothing renders sign-language video or TTS on
 *    the server today, so a url column would only ever hold a broken link.
 * Requests are stored with `fulfilled: false` and a plain-English `note`
 * instead, so the queue is real and the gap is visible.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const ACCESS_NEEDS = [
  "deaf",
  "hard_of_hearing",
  "low_vision",
  "blind",
  "dyslexia",
  "limited_english",
  "mobility",
  "none",
] as const;

export const SIGN_LANGUAGES = ["ASL", "BSL", "LSF", "DGS", "ISL", "AUSLAN", "NZSL"] as const;
export const HAPTIC_DEVICES = ["phone", "smartwatch", "steering_wheel", "dashboard"] as const;
export const URGENCY = ["low", "medium", "high", "critical"] as const;
export const REQUEST_KINDS = ["caption", "translation", "sign_language"] as const;

/** No speech-to-text, machine-translation or sign-language provider is wired. */
const PROVIDERS = {
  caption: { provider: null as string | null, live: false, note: "No speech-to-text provider is connected. Caption requests are queued, not transcribed." },
  translation: { provider: null as string | null, live: false, note: "No machine-translation provider is connected. Phrases already in the static safety catalog are answered from it; anything else is queued." },
  sign_language: { provider: null as string | null, live: false, note: "No sign-language video source exists. Requests are queued so we can see what drivers actually ask for." },
};

/** Haptic patterns are fixed sequences in ms (vibrate, pause, vibrate...). */
export const HAPTIC_PATTERNS: Record<string, { sequence: number[]; urgency: string; meaning: string }> = {
  hos_warning: { sequence: [200, 100, 200], urgency: "medium", meaning: "You are inside 60 minutes of your 11-hour driving limit." },
  hos_violation: { sequence: [600, 200, 600, 200, 600], urgency: "critical", meaning: "Driving limit reached. Park." },
  break_due: { sequence: [300, 150, 300], urgency: "medium", meaning: "30-minute break is due." },
  weigh_station_ahead: { sequence: [150, 100, 150, 100, 150], urgency: "high", meaning: "Weigh station ahead." },
  inspection_due: { sequence: [400], urgency: "low", meaning: "Pre-trip inspection not submitted." },
  message_received: { sequence: [120, 80, 120], urgency: "low", meaning: "New dispatch message." },
  sos_acknowledged: { sequence: [800, 300, 800], urgency: "critical", meaning: "Your SOS was received." },
};

const bad = (msg: string) => ({ error: msg });

export const accessibility = new Hono()

  .get("/", (c) =>
    c.json({
      needs: ACCESS_NEEDS,
      signLanguages: SIGN_LANGUAGES,
      hapticDevices: HAPTIC_DEVICES,
      urgency: URGENCY,
      requestKinds: REQUEST_KINDS,
      hapticPatterns: HAPTIC_PATTERNS,
      providers: PROVIDERS,
      notes: {
        haptics:
          "Haptic events are recorded here. Whether the phone or watch actually buzzed depends on the device; `delivered` is only true once a client confirms it.",
        media: "No caption, translation or sign-language provider is connected. Nothing here transcribes or translates on its own.",
      },
    }),
  )

  // ── Driver accessibility profile ──────────────────────────────────────────
  .get("/profile/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const [row] = await db
      .select()
      .from(schema.driverAccessibility)
      .where(eq(schema.driverAccessibility.driverId, driverId))
      .limit(1);
    if (!row) {
      return c.json({
        profile: null,
        note: "No accessibility profile saved for this driver yet. Defaults apply: English, no captions, no haptics.",
      });
    }
    return c.json({ profile: { ...row, needs: row.needs ? JSON.parse(row.needs) : [] } });
  })

  .post("/profile", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const driverId = String(body.driverId || "").trim();
    if (!driverId) return c.json(bad("driverId is required"), 400);

    const needs: string[] = Array.isArray(body.needs) ? body.needs.filter((n: unknown) => typeof n === "string") : [];
    const unknownNeeds = needs.filter((n) => !ACCESS_NEEDS.includes(n as (typeof ACCESS_NEEDS)[number]));
    if (unknownNeeds.length) return c.json(bad(`unknown needs: ${unknownNeeds.join(", ")}`), 400);

    const sign = body.signLanguage ? String(body.signLanguage).toUpperCase() : null;
    if (sign && !SIGN_LANGUAGES.includes(sign as (typeof SIGN_LANGUAGES)[number]))
      return c.json(bad(`signLanguage must be one of: ${SIGN_LANGUAGES.join(", ")}`), 400);

    const device = body.hapticDevice ? String(body.hapticDevice) : null;
    if (device && !HAPTIC_DEVICES.includes(device as (typeof HAPTIC_DEVICES)[number]))
      return c.json(bad(`hapticDevice must be one of: ${HAPTIC_DEVICES.join(", ")}`), 400);

    const values = {
      driverId,
      preferredLanguage: String(body.preferredLanguage || "en").slice(0, 12),
      needs: JSON.stringify(needs),
      captionsEnabled: Boolean(body.captionsEnabled),
      hapticsEnabled: Boolean(body.hapticsEnabled),
      signLanguage: sign,
      hapticDevice: device,
      vehicleWorld: ["truck", "car", "bike"].includes(String(body.vehicleWorld)) ? String(body.vehicleWorld) : "truck",
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: schema.driverAccessibility.id })
      .from(schema.driverAccessibility)
      .where(eq(schema.driverAccessibility.driverId, driverId))
      .limit(1);

    if (existing) {
      await db.update(schema.driverAccessibility).set(values).where(eq(schema.driverAccessibility.id, existing.id));
      const [row] = await db
        .select()
        .from(schema.driverAccessibility)
        .where(eq(schema.driverAccessibility.id, existing.id))
        .limit(1);
      return c.json({ profile: { ...row, needs }, updated: true });
    }

    const id = rid("acc");
    await db.insert(schema.driverAccessibility).values({ id, ...values });
    const [row] = await db.select().from(schema.driverAccessibility).where(eq(schema.driverAccessibility.id, id)).limit(1);
    return c.json({ profile: { ...row, needs }, updated: false }, 201);
  })

  .get("/profiles", async (c) => {
    const rows = await db
      .select()
      .from(schema.driverAccessibility)
      .orderBy(desc(schema.driverAccessibility.updatedAt))
      .limit(200);
    return c.json({
      profiles: rows.map((r) => ({ ...r, needs: r.needs ? JSON.parse(r.needs) : [] })),
      count: rows.length,
    });
  })

  // ── Haptic events ─────────────────────────────────────────────────────────
  .post("/haptics", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const driverId = String(body.driverId || "").trim();
    const patternType = String(body.patternType || "").trim();
    if (!driverId) return c.json(bad("driverId is required"), 400);
    if (!patternType) return c.json(bad("patternType is required"), 400);

    const known = HAPTIC_PATTERNS[patternType];
    const sequence: number[] = Array.isArray(body.sequence) ? body.sequence : known?.sequence || [];
    if (!sequence.length)
      return c.json(bad(`unknown patternType "${patternType}" and no sequence supplied. Known: ${Object.keys(HAPTIC_PATTERNS).join(", ")}`), 400);

    const urgency = String(body.urgency || known?.urgency || "low");
    if (!URGENCY.includes(urgency as (typeof URGENCY)[number])) return c.json(bad(`urgency must be one of: ${URGENCY.join(", ")}`), 400);

    const deviceType = String(body.deviceType || "phone");
    if (!HAPTIC_DEVICES.includes(deviceType as (typeof HAPTIC_DEVICES)[number]))
      return c.json(bad(`deviceType must be one of: ${HAPTIC_DEVICES.join(", ")}`), 400);

    const id = rid("hap");
    await db.insert(schema.hapticEvents).values({
      id,
      driverId,
      patternType,
      sequence: JSON.stringify(sequence),
      deviceType,
      urgency,
      message: body.message ? String(body.message).slice(0, 500) : known?.meaning || null,
      delivered: false,
      deliveryNote: "Queued on the server. The client must confirm delivery — we cannot see whether the device actually vibrated.",
    });
    const [row] = await db.select().from(schema.hapticEvents).where(eq(schema.hapticEvents.id, id)).limit(1);
    return c.json({ event: { ...row, sequence }, delivered: false }, 201);
  })

  .post("/haptics/:id/delivered", async (c) => {
    const id = c.req.param("id");
    const [row] = await db.select().from(schema.hapticEvents).where(eq(schema.hapticEvents.id, id)).limit(1);
    if (!row) return c.json(bad("haptic event not found"), 404);
    await db
      .update(schema.hapticEvents)
      .set({ delivered: true, deliveryNote: "Confirmed by the client device." })
      .where(eq(schema.hapticEvents.id, id));
    return c.json({ ok: true, id });
  })

  .get("/haptics/:driverId", async (c) => {
    const rows = await db
      .select()
      .from(schema.hapticEvents)
      .where(eq(schema.hapticEvents.driverId, c.req.param("driverId")))
      .orderBy(desc(schema.hapticEvents.createdAt))
      .limit(100);
    return c.json({
      events: rows.map((r) => ({ ...r, sequence: r.sequence ? JSON.parse(r.sequence) : [] })),
      count: rows.length,
    });
  })

  // ── Caption / translation / sign-language requests ────────────────────────
  .post("/requests", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const driverId = String(body.driverId || "").trim();
    const kind = String(body.kind || "").trim();
    if (!driverId) return c.json(bad("driverId is required"), 400);
    if (!REQUEST_KINDS.includes(kind as (typeof REQUEST_KINDS)[number]))
      return c.json(bad(`kind must be one of: ${REQUEST_KINDS.join(", ")}`), 400);

    const sourceText = body.sourceText ? String(body.sourceText).slice(0, 4000) : null;
    if (!sourceText) return c.json(bad("sourceText is required"), 400);

    const p = PROVIDERS[kind as keyof typeof PROVIDERS];
    const id = rid("areq");
    await db.insert(schema.accessibilityRequests).values({
      id,
      driverId,
      kind,
      sourceText,
      sourceLanguage: String(body.sourceLanguage || "en").slice(0, 12),
      targetLanguage: body.targetLanguage ? String(body.targetLanguage).slice(0, 12) : null,
      resultText: null,
      resultSource: null,
      provider: p.provider,
      fulfilled: false,
      note: p.note,
    });
    const [row] = await db.select().from(schema.accessibilityRequests).where(eq(schema.accessibilityRequests.id, id)).limit(1);
    return c.json({ request: row, fulfilled: false, provider: p.provider, live: p.live, note: p.note }, 201);
  })

  .get("/requests", async (c) => {
    const kind = c.req.query("kind");
    const driverId = c.req.query("driverId");
    const where = [
      kind ? eq(schema.accessibilityRequests.kind, kind) : undefined,
      driverId ? eq(schema.accessibilityRequests.driverId, driverId) : undefined,
    ].filter(Boolean);
    const rows = await db
      .select()
      .from(schema.accessibilityRequests)
      .where(where.length ? and(...(where as never[])) : undefined)
      .orderBy(desc(schema.accessibilityRequests.createdAt))
      .limit(200);
    return c.json({
      requests: rows,
      count: rows.length,
      fulfilledCount: rows.filter((r) => r.fulfilled).length,
      providers: PROVIDERS,
      note: "Requests accumulate until a provider is connected. The backlog is the honest measure of demand for this feature.",
    });
  });
