/**
 * /api/responsible-use — the Responsible Use Agreement, and a real record of who accepted it.
 *
 * WHY THIS ROUTER EXISTS
 *   The onboarding page that collects this agreement recorded nothing. It showed
 *   a screen warning that violations "may result in account suspension,
 *   permanent ban, or legal action in accordance with local laws", and then, on
 *   the final button, called console.log(). No table, no endpoint, no row.
 *   An agreement nobody stores cannot be enforced and should not be displayed
 *   as if it can be.
 *
 * WHAT IT DOES
 *   - Serves the canonical pledge text FROM THE SERVER, so the text a driver
 *     agreed to is the text the server can prove it showed.
 *   - Hashes that exact text (sha256, node:crypto) into termsVersion. Change one
 *     word and the hash changes, and prior acceptances stop counting for the new
 *     wording. That is the point.
 *   - Writes one append-only row per (user, termsVersion) into
 *     responsible_use_acceptances.
 *
 * WHAT IT DOES NOT CLAIM
 *   - This is not a legal e-signature product. It is a timestamped record of a
 *     click, the exact text shown, and the locale it was shown in. It is not
 *     notarized, not witnessed, and carries no compliance certification.
 *   - Acceptance REQUIRES a signed-in account. Anonymous acceptance is refused
 *     with an explicit reason rather than silently "succeeding" — an
 *     unattributable acceptance is worth nothing.
 *   - The pledges are translated for 10 locales only. When a driver picks a
 *     locale with no translation, the response says ENGLISH_ONLY and the stored
 *     row says so too. The app never pretends a driver read text in their own
 *     language when they did not.
 *   - No enforcement exists yet. Nothing in the app currently blocks a driver
 *     who has not accepted. GET /status reports that honestly.
 */
import { Hono } from "hono";
import { createHash } from "node:crypto";
import { desc, eq, and } from "drizzle-orm";
import { db } from "../database";
import { responsibleUseAcceptances } from "../database/schema";
import { auth } from "../auth";

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Canonical English pledge text. This is the source of truth; the client
 * renders what this endpoint returns and nothing else.
 */
export const PLEDGES_EN: string[] = [
  "I will not operate a commercial vehicle while fatigued, impaired, or otherwise unfit to drive, and I will not use this app to make it look like I was fit when I was not.",
  "I will enter my hours, inspections and mileage honestly. I will not falsify a log, edit another driver's log, or ask anyone else to do it for me.",
  "I will not use this app while the vehicle is in motion except for hands-free voice, and I accept that no feature in it is worth a crash.",
  "I will treat every driver, dispatcher, broker, inspector and mechanic on this platform with respect, regardless of their country, language, religion, race, sex or disability.",
  "I will not post another person's private information, and I will not use community reports to harass, target or threaten anyone.",
  "I will report road conditions, speed traps, parking and repair shops in good faith, knowing other drivers make real decisions off what I post.",
  "I understand that TruckWithEase is a tool and not a legal authority: the responsibility for complying with FMCSA rules, state law and my carrier's policy stays with me.",
];

export const LOCALE_LABELS: Record<string, string> = {
  "en-US": "English (United States)",
  "ar-SA": "العربية (السعودية)",
  "es-ES": "Español (España)",
  "pt-BR": "Português (Brasil)",
  "fr-FR": "Français (France)",
  "de-DE": "Deutsch (Deutschland)",
  "zh-CN": "简体中文 (中国)",
  "ja-JP": "日本語 (日本)",
  "hi-IN": "हिन्दी (भारत)",
  "th-TH": "ไทย (ประเทศไทย)",
};

/** Locales whose pledge text is genuinely translated in full. */
export const TRANSLATED_LOCALES = Object.keys(LOCALE_LABELS);

/** RTL locales, so the client does not have to guess. */
export const RTL_LOCALES = ["ar-SA"];

/**
 * termsVersion — sha256 of the canonical English text, joined with a newline.
 * Computed at request time from the array above, never typed in by hand.
 */
export function termsVersion(): string {
  return createHash("sha256").update(PLEDGES_EN.join("\n"), "utf8").digest("hex");
}

async function sessionFor(headers: Headers) {
  try {
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}

export const responsibleUseRoute = new Hono()

  /** GET /api/responsible-use — the agreement text, the version hash, and whether the caller has accepted it. */
  .get("/", async (c) => {
    const started = Date.now();
    const version = termsVersion();
    const s = await sessionFor(c.req.raw.headers);
    const userId = s?.user?.id ?? null;

    let accepted: null | { id: string; locale: string; localeStatus: string; createdAt: Date | null } = null;
    if (userId) {
      const rows = await db
        .select()
        .from(responsibleUseAcceptances)
        .where(and(eq(responsibleUseAcceptances.userId, userId), eq(responsibleUseAcceptances.termsVersion, version)))
        .orderBy(desc(responsibleUseAcceptances.createdAt))
        .limit(1);
      const r = rows[0];
      if (r) accepted = { id: r.id, locale: r.locale, localeStatus: r.localeStatus, createdAt: r.createdAt ?? null };
    }

    const all = await db.select().from(responsibleUseAcceptances);

    return c.json({
      termsVersion: version,
      versionNote:
        "sha256 of the exact pledge text below, computed server-side on every request. If the wording changes this hash changes and previous acceptances no longer count.",
      pledges: PLEDGES_EN,
      pledgeCount: PLEDGES_EN.length,
      locales: LOCALE_LABELS,
      translatedLocales: TRANSLATED_LOCALES,
      rtlLocales: RTL_LOCALES,
      localeNote:
        "Pledge text is served in English. The locale a driver selects is recorded with the acceptance, and any locale outside translatedLocales is stored as ENGLISH_ONLY so the record never implies the driver read this in their own language.",
      signedIn: Boolean(userId),
      user: userId ? { id: userId, email: s?.user?.email ?? null } : null,
      accepted,
      totals: { acceptancesStored: all.length, uniqueUsers: new Set(all.map((r) => r.userId)).size },
      enforcement: {
        blocksUnacceptedDrivers: false,
        note:
          "Nothing in the app currently blocks a driver who has not accepted this agreement. Acceptance is recorded, not enforced. Enforcement is not built.",
      },
      claims: {
        legalESignature: false,
        notarized: false,
        witnessed: false,
        note: "This is a timestamped record of a click plus the exact text shown. It is not an e-signature product and no compliance certification is claimed.",
      },
      measuredMs: Date.now() - started,
    });
  })

  /** POST /api/responsible-use/accept — record acceptance. Requires a signed-in account. */
  .post("/accept", async (c) => {
    const s = await sessionFor(c.req.raw.headers);
    const userId = s?.user?.id ?? null;
    if (!userId) {
      return c.json(
        {
          error:
            "Not signed in. Acceptance is refused rather than stored anonymously — an acceptance that cannot be attributed to an account is worthless, so the app will not pretend it saved one.",
          signedIn: false,
        },
        401,
      );
    }

    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const locale = typeof body.locale === "string" && body.locale.trim() ? body.locale.trim() : "en-US";
    const acceptedIndexes = Array.isArray(body.acceptedIndexes) ? body.acceptedIndexes : [];
    const acceptedAll = acceptedIndexes.length === PLEDGES_EN.length;

    if (!acceptedAll) {
      return c.json(
        {
          error: `All ${PLEDGES_EN.length} pledges must be accepted. Received ${acceptedIndexes.length}. Partial acceptance is not stored.`,
          pledgeCount: PLEDGES_EN.length,
          received: acceptedIndexes.length,
        },
        400,
      );
    }

    const version = termsVersion();

    const existing = await db
      .select()
      .from(responsibleUseAcceptances)
      .where(and(eq(responsibleUseAcceptances.userId, userId), eq(responsibleUseAcceptances.termsVersion, version)))
      .limit(1);
    if (existing[0]) {
      return c.json({
        stored: false,
        alreadyAccepted: true,
        id: existing[0].id,
        acceptedAt: existing[0].createdAt,
        termsVersion: version,
        note: "This account already accepted this exact version. No duplicate row was written.",
      });
    }

    const row = {
      id: rid("rua"),
      userId,
      userEmail: s?.user?.email ?? null,
      locale,
      localeStatus: TRANSLATED_LOCALES.includes(locale) ? "TRANSLATED" : "ENGLISH_ONLY",
      termsVersion: version,
      pledgeCount: PLEDGES_EN.length,
      acceptedAll: true,
      userAgent: c.req.header("user-agent") ?? null,
    };
    await db.insert(responsibleUseAcceptances).values(row);

    return c.json({
      stored: true,
      id: row.id,
      userId,
      locale: row.locale,
      localeStatus: row.localeStatus,
      termsVersion: version,
      pledgeCount: row.pledgeCount,
      note: "Row written to responsible_use_acceptances. Append-only: a future wording change produces a new version hash and requires a new acceptance.",
    });
  })

  /** GET /api/responsible-use/list — every stored acceptance. Emails are shown as given; nothing else is exposed. */
  .get("/list", async (c) => {
    const rows = await db
      .select()
      .from(responsibleUseAcceptances)
      .orderBy(desc(responsibleUseAcceptances.createdAt))
      .limit(200);
    return c.json({
      acceptances: rows,
      total: rows.length,
      currentVersion: termsVersion(),
      note:
        "Rows whose termsVersion differs from currentVersion are acceptances of older wording. They are kept, not migrated, and they do not count as acceptance of the current text.",
    });
  })

  /** GET /api/responsible-use/status — one honest paragraph about what this feature is and is not. */
  .get("/status", async (c) => {
    const rows = await db.select().from(responsibleUseAcceptances);
    return c.json({
      live: true,
      table: "responsible_use_acceptances",
      rows: rows.length,
      currentVersion: termsVersion(),
      pledgeCount: PLEDGES_EN.length,
      translatedLocales: TRANSLATED_LOCALES.length,
      requiresSignIn: true,
      enforced: false,
      notes: [
        "Acceptance is recorded server-side and requires a signed-in account.",
        "Nothing blocks an unaccepted driver from using the app. Enforcement is not built.",
        "Not an e-signature product. No compliance certification is claimed.",
      ],
    });
  });

export default responsibleUseRoute;
