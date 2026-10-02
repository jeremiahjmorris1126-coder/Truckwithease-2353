/**
 * /api/haptic — canonical vibration alert patterns, served from the server, plus
 * an append-only record of what actually played on a real device.
 *
 * WHY THIS ROUTER EXISTS — the encoding was literally wrong
 *   The page shipped a client-side library (legacy/lib/hapticLanguage.js) that
 *   documented its patterns as:
 *
 *       [duration_ms, pause_ms, repeat_count]
 *
 *   and then handed those exact arrays to navigator.vibrate(), which reads an
 *   array as ALTERNATING on/off milliseconds. So 'DANGER': [500, 200, 3] did not
 *   produce three long pulses. It produced: vibrate 500ms, pause 200ms, vibrate
 *   3 MILLISECONDS. Every labelled pattern in that file was wrong the same way,
 *   and the displayed duration was wrong too, because it summed vibrate time,
 *   pause time and the bogus repeat count into one number.
 *
 *   This router replaces that with true alternating on/off arrays, and reports
 *   on-time and total elapsed time separately, because they are different things.
 *
 * WHAT IT DOES
 *   - GET /            the canonical pattern registry, a sha256 version hash of
 *                      the exact encoding served, and honest platform facts.
 *   - POST /play       records one append-only row per playback attempt,
 *                      including whether the browser reported support at all.
 *   - GET /list        the last 200 recorded playbacks.
 *   - GET /status      what this feature is and is not.
 *
 * WHAT THIS DOES NOT CLAIM
 *   - This is NOT a language. It is a small set of alert vibrations with agreed
 *     meanings, the way a turn signal click is not a language. The old page
 *     claimed drivers "achieve fluency in 2-4 weeks" and that pre-built patterns
 *     "accelerate adoption by 60%". Those numbers were invented and are deleted.
 *   - It is NOT bidirectional. Nothing is transmitted to another person or
 *     another device. There is no endpoint that sends a vibration to a second
 *     phone, and hapticToTone() in the old library only returned a decorative
 *     string to the same browser it was called in.
 *   - It is NOT available on every phone. navigator.vibrate is not implemented
 *     by Safari on iOS at all, and not by desktop browsers. For a deaf driver on
 *     an iPhone this feature does nothing, and the page says so.
 *   - No human-factors statistics are asserted. The old page claimed "~600 touch
 *     receptors per square inch", "10-300 Hz with perfect discrimination" and
 *     "20-30 words per minute vs 150 wpm". None were sourced. All are deleted.
 *   - There is no emergency override. The old page claimed "Emergency signals
 *     override all other vibrations" and "Maximum vibration pattern is 5 seconds
 *     to prevent fatigue". Nothing enforced either one. The registry below is
 *     bounded by construction (see MAX_TOTAL_MS) and that bound is checked, not
 *     merely stated.
 */
import { Hono } from "hono";
import { createHash } from "node:crypto";
import { desc } from "drizzle-orm";
import { db } from "../database";
import { hapticPlaybacks } from "../database/schema";
import { auth } from "../auth";

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Hard ceiling on any single pattern, enforced below rather than claimed. */
export const MAX_TOTAL_MS = 5000;

type RawPattern = {
  key: string;
  label: string;
  meaning: string;
  category: "hazard" | "hours" | "navigation" | "message" | "emergency";
  /** ALTERNATING on/off milliseconds, exactly as navigator.vibrate() reads it. */
  pattern: number[];
};

/**
 * Canonical registry. Every array is alternating on/off ms: index 0 vibrates,
 * index 1 is silence, index 2 vibrates, and so on. An array of odd length ends
 * on a vibration, which is intentional — a trailing pause is inaudible anyway.
 */
export const RAW_PATTERNS: RawPattern[] = [
  {
    key: "stop_now",
    label: "STOP NOW",
    meaning: "One long unbroken buzz. Shortest possible thing to recognise: come to a stop.",
    category: "hazard",
    pattern: [900],
  },
  {
    key: "danger_ahead",
    label: "DANGER AHEAD",
    meaning: "Three long pulses. This is the pattern the old code intended and never produced.",
    category: "hazard",
    pattern: [500, 200, 500, 200, 500],
  },
  {
    key: "slow_down",
    label: "SLOW DOWN",
    meaning: "Pulses that get shorter, so the feel of it decelerates.",
    category: "hazard",
    pattern: [450, 150, 300, 150, 180, 150, 90],
  },
  {
    key: "low_bridge_ahead",
    label: "LOW BRIDGE AHEAD",
    meaning: "Three fast ticks then one long buzz. Paired with the low-bridge data, not a substitute for reading the sign.",
    category: "hazard",
    pattern: [140, 90, 140, 90, 140, 90, 700],
  },
  {
    key: "break_due",
    label: "30-MINUTE BREAK DUE",
    meaning: "Three even medium pulses. Hours-of-service reminder, not a legal determination.",
    category: "hours",
    pattern: [220, 120, 220, 120, 220],
  },
  {
    key: "drive_time_out",
    label: "DRIVE TIME EXHAUSTED",
    meaning: "Two long pulses with a wide gap. You are out of driving clock.",
    category: "hours",
    pattern: [700, 300, 700],
  },
  {
    key: "dvir_due",
    label: "INSPECTION DUE",
    meaning: "Long, two short, long. Pre-trip or post-trip inspection is outstanding.",
    category: "hours",
    pattern: [350, 120, 120, 120, 120, 120, 350],
  },
  {
    key: "weigh_station_ahead",
    label: "WEIGH STATION AHEAD",
    meaning: "Four even pulses, steady like a scale queue.",
    category: "navigation",
    pattern: [250, 130, 250, 130, 250, 130, 250],
  },
  {
    key: "fuel_stop_ahead",
    label: "FUEL STOP AHEAD",
    meaning: "Short then long — a rising pattern for something you are approaching.",
    category: "navigation",
    pattern: [180, 150, 480],
  },
  {
    key: "parking_found",
    label: "PARKING FOUND",
    meaning: "Two ticks then a settle. Good news pattern.",
    category: "navigation",
    pattern: [110, 90, 110, 90, 340],
  },
  {
    key: "turn_soon",
    label: "TURN COMING UP",
    meaning: "Two quick taps. Deliberately the lightest pattern in the set so it never competes with a hazard.",
    category: "navigation",
    pattern: [90, 90, 90],
  },
  {
    key: "message_received",
    label: "MESSAGE RECEIVED",
    meaning: "Two soft taps. Somebody sent you something; it can wait until you are stopped.",
    category: "message",
    pattern: [120, 100, 120],
  },
  {
    key: "confirm_yes",
    label: "CONFIRMED / YES",
    meaning: "Two crisp taps close together.",
    category: "message",
    pattern: [80, 70, 80],
  },
  {
    key: "negative_no",
    label: "NEGATIVE / NO",
    meaning: "Two heavy pulses. Deliberately the opposite weight of CONFIRMED.",
    category: "message",
    pattern: [420, 140, 420],
  },
  {
    key: "sos",
    label: "SOS",
    meaning:
      "Morse SOS: three short, three long, three short. Chosen because it is a real convention that predates this app, not something invented for it.",
    category: "emergency",
    pattern: [150, 100, 150, 100, 150, 300, 450, 100, 450, 100, 450, 300, 150, 100, 150, 100, 150],
  },
];

export type HapticPattern = RawPattern & {
  onTimeMs: number;
  offTimeMs: number;
  totalMs: number;
  pulseCount: number;
  withinMaxTotalMs: boolean;
};

/** on = even indexes, off = odd indexes. This is the whole bug fix, in one function. */
export function measure(pattern: number[]) {
  let onTimeMs = 0;
  let offTimeMs = 0;
  let pulseCount = 0;
  for (let i = 0; i < pattern.length; i++) {
    const v = Math.max(0, Math.round(pattern[i] ?? 0));
    if (i % 2 === 0) {
      onTimeMs += v;
      if (v > 0) pulseCount += 1;
    } else {
      offTimeMs += v;
    }
  }
  return { onTimeMs, offTimeMs, totalMs: onTimeMs + offTimeMs, pulseCount };
}

export function patterns(): HapticPattern[] {
  return RAW_PATTERNS.map((p) => {
    const m = measure(p.pattern);
    return { ...p, ...m, withinMaxTotalMs: m.totalMs <= MAX_TOTAL_MS };
  });
}

/**
 * patternVersion — sha256 over the canonical encoding actually served. Change a
 * single millisecond and the hash changes, so a recorded playback can always be
 * tied back to the exact array the device was given.
 */
export function patternVersion(): string {
  const canonical = RAW_PATTERNS.map((p) => `${p.key}:${p.pattern.join(",")}`).join("|");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

const PLATFORM = {
  api: "navigator.vibrate (W3C Vibration API)",
  iosSafariSupported: false,
  iosNote:
    "Safari on iOS does not implement the Vibration API. On an iPhone this feature does nothing at all, in any browser on the device, because every iOS browser uses Apple's engine. A native app using Core Haptics would be required.",
  androidChromeSupported: true,
  androidNote: "Android Chrome supports navigator.vibrate. It is ignored unless the page has had a user interaction first.",
  desktopSupported: false,
  desktopNote: "Desktop browsers report no vibration hardware. Nothing will fire on a laptop.",
  detectionNote:
    "The page reports the visitor's own ('vibrate' in navigator) result as a measured fact rather than asserting that 'all modern phones support this'.",
};

async function sessionFor(headers: Headers) {
  try {
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}

export const hapticRoute = new Hono()

  /** GET /api/haptic — the canonical registry, the version hash, and the platform truth. */
  .get("/", async (c) => {
    const started = Date.now();
    const list = patterns();
    const s = await sessionFor(c.req.raw.headers);
    const rows = await db.select().from(hapticPlaybacks);

    return c.json({
      version: patternVersion(),
      versionNote:
        "sha256 of every pattern key and its exact on/off array, computed server-side on every request. Recorded playbacks store this so an old row can never be misread as the current encoding.",
      encoding: {
        format: "ALTERNATING_ON_OFF_MS",
        note:
          "Index 0 vibrates, index 1 is silence, index 2 vibrates, and so on — exactly how navigator.vibrate() reads an array.",
        previousFormatBug:
          "The removed client library documented [duration_ms, pause_ms, repeat_count] and passed it straight to navigator.vibrate(). 'DANGER': [500, 200, 3] therefore vibrated 500ms, paused 200ms, then vibrated for 3 milliseconds instead of pulsing three times. Every labelled pattern was wrong the same way.",
      },
      patterns: list,
      patternCount: list.length,
      categories: Array.from(new Set(list.map((p) => p.category))),
      limits: {
        maxTotalMs: MAX_TOTAL_MS,
        allWithinLimit: list.every((p) => p.withinMaxTotalMs),
        longestKey: list.slice().sort((a, b) => b.totalMs - a.totalMs)[0]?.key ?? null,
        longestTotalMs: list.slice().sort((a, b) => b.totalMs - a.totalMs)[0]?.totalMs ?? 0,
        note: "Checked against the registry on every request, not asserted in prose.",
      },
      platform: PLATFORM,
      claims: {
        bidirectional: false,
        bidirectionalNote:
          "No pattern is transmitted to any other person or device. There is no send endpoint and no second device. The old page's headline claim that a deaf driver's response is 'received as tone and intent' by a hearing driver was false and is deleted.",
        learnedLanguage: false,
        learnedLanguageNote:
          "This is a fixed set of alert vibrations with agreed meanings, not a language. No fluency timeline, adoption rate, word-per-minute figure or receptor-density figure is claimed anywhere.",
        emergencyOverride: false,
        emergencyOverrideNote:
          "The browser gives no priority mechanism. Calling navigator.vibrate() replaces whatever was playing; it does not pre-empt system notifications or a phone call.",
        accessibilityCertification: false,
      },
      signedIn: Boolean(s?.user?.id),
      totals: {
        playbacksRecorded: rows.length,
        onSupportedDevices: rows.filter((r) => r.deviceSupported).length,
        onUnsupportedDevices: rows.filter((r) => !r.deviceSupported).length,
      },
      measuredMs: Date.now() - started,
    });
  })

  /** POST /api/haptic/play — record one real playback attempt. Anonymous is allowed. */
  .post("/play", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const key = typeof body.patternKey === "string" ? body.patternKey.trim() : "";
    const found = patterns().find((p) => p.key === key);
    if (!found) {
      return c.json(
        {
          error: `Unknown patternKey "${key}". The client may only play a pattern this endpoint served, so a stale or hand-typed key is refused instead of silently recorded.`,
          validKeys: patterns().map((p) => p.key),
        },
        400,
      );
    }

    const s = await sessionFor(c.req.raw.headers);
    const deviceSupported = body.deviceSupported === true;

    const row = {
      id: rid("hap"),
      userId: s?.user?.id ?? null,
      patternKey: found.key,
      patternVersion: patternVersion(),
      onTimeMs: found.onTimeMs,
      totalMs: found.totalMs,
      pulseCount: found.pulseCount,
      deviceSupported,
      userAgent: c.req.header("user-agent") ?? null,
    };
    await db.insert(hapticPlaybacks).values(row);

    return c.json({
      stored: true,
      id: row.id,
      patternKey: row.patternKey,
      pattern: found.pattern,
      onTimeMs: row.onTimeMs,
      totalMs: row.totalMs,
      pulseCount: row.pulseCount,
      deviceSupported,
      attributed: Boolean(row.userId),
      note: deviceSupported
        ? "Row written to haptic_playbacks. deviceSupported is what the browser itself reported, not an assumption."
        : "Row written to haptic_playbacks with deviceSupported=false. The browser reported no Vibration API, so nothing physically vibrated. That is recorded honestly rather than shown as a successful playback.",
    });
  })

  /** GET /api/haptic/list — the last 200 recorded playbacks. */
  .get("/list", async (c) => {
    const rows = await db.select().from(hapticPlaybacks).orderBy(desc(hapticPlaybacks.createdAt)).limit(200);
    const current = patternVersion();
    return c.json({
      playbacks: rows,
      total: rows.length,
      currentVersion: current,
      staleRows: rows.filter((r) => r.patternVersion !== current).length,
      note:
        "Rows whose patternVersion differs from currentVersion were played with an older encoding. They are kept, never rewritten.",
    });
  })

  /** GET /api/haptic/status — what this feature is and is not. */
  .get("/status", async (c) => {
    const rows = await db.select().from(hapticPlaybacks);
    const list = patterns();
    return c.json({
      live: true,
      table: "haptic_playbacks",
      rows: rows.length,
      currentVersion: patternVersion(),
      patternCount: list.length,
      maxTotalMs: MAX_TOTAL_MS,
      allWithinLimit: list.every((p) => p.withinMaxTotalMs),
      requiresSignIn: false,
      notes: [
        "Patterns are served from the server as alternating on/off millisecond arrays and hashed, so what played can be tied to an exact encoding.",
        "The replaced client library used [duration, pause, repeat] arrays with navigator.vibrate(), which made every labelled pattern vibrate for the repeat count in milliseconds. That bug is the reason this router exists.",
        "Nothing is sent to another driver or device. This is not two-way communication.",
        "Safari on iOS does not support the Vibration API, so this feature does nothing on any iPhone. That is disclosed on the page.",
        "No fluency timeline, adoption percentage, receptor count, frequency-discrimination range or words-per-minute figure is claimed. Those were invented in the previous version and were deleted.",
        "No accessibility certification is claimed.",
      ],
    });
  });

export default hapticRoute;
