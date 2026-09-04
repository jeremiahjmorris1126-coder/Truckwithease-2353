import { Hono } from "hono";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { hasAdminRole } from "./session";

/**
 * Signups and trial links — server side.
 *
 * Replaces the PocketBase calls in legacy/SignupPage.jsx and the trial-link
 * generator, both of which wrote to collections (`signups`, `trial_links`)
 * that existed on no server. A driver filled the form, saw "you're in!", and
 * the record went nowhere. For a launch whose first cohort is 50 Reddit beta
 * drivers, that is the single worst place to lose data.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const ROLES = ["driver", "owner_operator", "dispatcher", "fleet_manager"] as const;
export const VEHICLE_WORLDS = ["truck", "car", "bike"] as const;
export const SIGNUP_STATUSES = ["new", "contacted", "activated", "rejected"] as const;

/** Real pricing, Aug 2026. Kept here so signup and billing quote the same numbers. */
export const PLANS: Record<string, { name: string; unitPrice: number; unit: string; note: string }> = {
  solo: { name: "Solo", unitPrice: 29.99, unit: "driver/mo", note: "À-la-carte add-ons $2.99–$10.99." },
  pro: { name: "Pro", unitPrice: 39.99, unit: "driver/mo", note: "All-inclusive." },
  fleet_lease: { name: "Fleet (hardware leased)", unitPrice: 49.99, unit: "truck/mo", note: "Hardware lease included." },
  fleet_owned: { name: "Fleet (hardware owned)", unitPrice: 59.99, unit: "driver/mo", note: "$600/truck one-time hardware." },
};

export const TRIAL_DAYS = 14;

const emailOk = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** MC numbers are 5–8 digits. This is a FORMAT check only — it is not an
 *  FMCSA authority lookup, and it must never be presented as one. */
const mcFormatOk = (v: string) => /^\d{5,8}$/.test(v.replace(/^MC-?/i, "").trim());

export const signup = new Hono()

  .get("/", (c) =>
    c.json({
      plans: PLANS,
      roles: ROLES,
      vehicleWorlds: VEHICLE_WORLDS,
      trialDays: TRIAL_DAYS,
      statuses: SIGNUP_STATUSES,
      notes: {
        mcCheck: "MC number is validated for format only (5-8 digits). No FMCSA authority lookup is performed.",
        payment: "Signing up stores a record. It does not charge anything and does not create a payment-provider subscription.",
      },
    }),
  )

  // ── Create a signup ───────────────────────────────────────────────────────
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);

    if (!emailOk(body.email)) {
      return c.json({ error: "A valid email is required.", field: "email" }, 400);
    }
    const email = String(body.email).trim().toLowerCase();

    const role = typeof body.role === "string" && (ROLES as readonly string[]).includes(body.role)
      ? body.role
      : "driver";
    const vehicleWorld =
      typeof body.vehicleWorld === "string" && (VEHICLE_WORLDS as readonly string[]).includes(body.vehicleWorld)
        ? body.vehicleWorld
        : "truck";

    if (body.plan != null && body.plan !== "" && !PLANS[String(body.plan)]) {
      return c.json({ error: "Unknown plan.", validPlans: Object.keys(PLANS) }, 400);
    }

    const mcRaw = typeof body.mcNumber === "string" ? body.mcNumber.trim() : "";
    if (mcRaw && !mcFormatOk(mcRaw)) {
      return c.json(
        { error: "MC number should be 5-8 digits.", field: "mcNumber", formatOnly: true },
        400,
      );
    }

    // Duplicate email: return the existing row instead of silently making a second one.
    const [existing] = await db
      .select()
      .from(schema.signups)
      .where(eq(schema.signups.email, email))
      .limit(1);
    if (existing) {
      return c.json({ signup: existing, stored: true, duplicate: true }, 200);
    }

    // Trial code, if one was used.
    let trialCode: string | null = null;
    if (typeof body.trialCode === "string" && body.trialCode.trim()) {
      const code = body.trialCode.trim().toUpperCase();
      const [link] = await db
        .select()
        .from(schema.trialLinks)
        .where(eq(schema.trialLinks.code, code))
        .limit(1);
      if (!link) return c.json({ error: "That trial code does not exist.", field: "trialCode" }, 404);
      if (!link.active) return c.json({ error: "That trial code is no longer active.", field: "trialCode" }, 400);
      if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
        return c.json({ error: "That trial code has expired.", field: "trialCode" }, 400);
      }
      if (link.maxUses != null && link.uses >= link.maxUses) {
        return c.json({ error: "That trial code has been used up.", field: "trialCode" }, 400);
      }
      trialCode = code;
      await db
        .update(schema.trialLinks)
        .set({ uses: sql`${schema.trialLinks.uses} + 1` })
        .where(eq(schema.trialLinks.id, link.id));
    }

    const id = rid("sgn");
    const row = {
      id,
      email,
      name: typeof body.name === "string" ? body.name.trim() || null : null,
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      company: typeof body.company === "string" ? body.company.trim() || null : null,
      mcNumber: mcRaw || null,
      dotNumber: typeof body.dotNumber === "string" ? body.dotNumber.trim() || null : null,
      fleetSize: Number.isFinite(Number(body.fleetSize)) && Number(body.fleetSize) > 0 ? Math.round(Number(body.fleetSize)) : null,
      role,
      plan: body.plan ? String(body.plan) : null,
      vehicleWorld,
      source: typeof body.source === "string" ? body.source.trim() || null : null,
      trialCode,
      status: "new" as const,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
    };

    await db.insert(schema.signups).values(row);
    const [saved] = await db.select().from(schema.signups).where(eq(schema.signups.id, id)).limit(1);

    return c.json(
      {
        signup: saved,
        stored: true,
        trialDays: TRIAL_DAYS,
        charged: false,
        chargedNote:
          "No payment was taken and no subscription exists with a payment provider yet. This is a stored signup record only.",
      },
      201,
    );
  })

  // ── List / filter signups (admin) ─────────────────────────────────────────
  .get("/list", async (c) => {
    if (!(await hasAdminRole(c.req.raw.headers))) return c.json({ error: "Admin role required." }, 403);
    const status = c.req.query("status");
    const rows = await db
      .select()
      .from(schema.signups)
      .where(status ? eq(schema.signups.status, status) : undefined)
      .orderBy(desc(schema.signups.createdAt))
      .limit(500);

    const counts: Record<string, number> = {};
    for (const s of SIGNUP_STATUSES) counts[s] = 0;
    const all = await db.select({ status: schema.signups.status }).from(schema.signups);
    for (const r of all) counts[r.status] = (counts[r.status] ?? 0) + 1;

    return c.json({ signups: rows, total: all.length, counts });
  })

  .post("/:id/status", async (c) => {
    if (!(await hasAdminRole(c.req.raw.headers))) return c.json({ error: "Admin role required." }, 403);
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = String(body.status ?? "");
    if (!(SIGNUP_STATUSES as readonly string[]).includes(status)) {
      return c.json({ error: "Invalid status.", validStatuses: SIGNUP_STATUSES }, 400);
    }
    const [row] = await db.select().from(schema.signups).where(eq(schema.signups.id, id)).limit(1);
    if (!row) return c.json({ error: "Signup not found." }, 404);

    await db
      .update(schema.signups)
      .set({
        status,
        notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : row.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.signups.id, id));

    const [updated] = await db.select().from(schema.signups).where(eq(schema.signups.id, id)).limit(1);
    return c.json({ signup: updated, stored: true });
  })

  // ── Trial links ───────────────────────────────────────────────────────────
  .get("/trial-links", async (c) => {
    const rows = await db
      .select()
      .from(schema.trialLinks)
      .orderBy(desc(schema.trialLinks.createdAt))
      .limit(200);
    return c.json({
      trialLinks: rows.map((r) => ({
        ...r,
        expired: r.expiresAt ? r.expiresAt.getTime() < Date.now() : false,
        exhausted: r.maxUses != null && r.uses >= r.maxUses,
      })),
    });
  })

  .post("/trial-links", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (!label) return c.json({ error: "A label is required so you know who a link went to.", field: "label" }, 400);
    if (body.plan != null && body.plan !== "" && !PLANS[String(body.plan)]) {
      return c.json({ error: "Unknown plan.", validPlans: Object.keys(PLANS) }, 400);
    }

    const code = `TWE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const id = rid("trl");
    const trialDays = Number.isFinite(Number(body.trialDays)) && Number(body.trialDays) > 0
      ? Math.round(Number(body.trialDays))
      : TRIAL_DAYS;

    await db.insert(schema.trialLinks).values({
      id,
      code,
      label,
      plan: body.plan ? String(body.plan) : null,
      trialDays,
      maxUses: Number.isFinite(Number(body.maxUses)) && Number(body.maxUses) > 0 ? Math.round(Number(body.maxUses)) : null,
      expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : null,
      active: true,
      createdBy: typeof body.createdBy === "string" ? body.createdBy.trim() || null : null,
    });

    const [saved] = await db.select().from(schema.trialLinks).where(eq(schema.trialLinks.id, id)).limit(1);
    return c.json({ trialLink: saved, stored: true, shareCode: code }, 201);
  })

  .post("/trial-links/:id/deactivate", async (c) => {
    const id = c.req.param("id");
    const [row] = await db.select().from(schema.trialLinks).where(eq(schema.trialLinks.id, id)).limit(1);
    if (!row) return c.json({ error: "Trial link not found." }, 404);
    await db.update(schema.trialLinks).set({ active: false }).where(eq(schema.trialLinks.id, id));
    return c.json({ id, active: false, stored: true });
  })

  /** Public check used by the signup form before submitting. */
  .get("/trial-links/check/:code", async (c) => {
    const code = c.req.param("code").trim().toUpperCase();
    const [link] = await db
      .select()
      .from(schema.trialLinks)
      .where(and(eq(schema.trialLinks.code, code), eq(schema.trialLinks.active, true)))
      .limit(1);
    if (!link) return c.json({ valid: false, reason: "No active trial link with that code." }, 200);
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      return c.json({ valid: false, reason: "That code has expired." }, 200);
    }
    if (link.maxUses != null && link.uses >= link.maxUses) {
      return c.json({ valid: false, reason: "That code has been used up." }, 200);
    }
    return c.json({ valid: true, plan: link.plan, trialDays: link.trialDays, label: link.label });
  });
