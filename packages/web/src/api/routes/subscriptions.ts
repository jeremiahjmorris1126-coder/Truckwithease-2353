import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { PLANS, TRIAL_DAYS } from "./signup";

/**
 * Subscriptions + billing cases — server side.
 *
 * Replaces the PocketBase calls in legacy/SubscriptionsAdminPage.jsx and
 * legacy/SupportAgentBilling.jsx, both of which wrote to collections
 * (`subscriptions`, `billing_cases`) that existed on no server.
 *
 * IMPORTANT — nothing here moves money. AUTUMN_SECRET_KEY in this project is a
 * test key (`am_sk_test_`), and no subscription row has ever been handed to a
 * payment provider. Every response carries `live: false` so no screen can imply
 * a driver has been charged.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const SUB_STATUSES = ["trialing", "active", "past_due", "cancelled"] as const;
export const CASE_CATEGORIES = [
  "overcharge",
  "refund",
  "failed_payment",
  "plan_change",
  "invoice_request",
  "cancellation",
  "other",
] as const;
export const CASE_STATUSES = ["open", "in_review", "resolved", "refunded", "rejected"] as const;
export const CASE_PRIORITIES = ["low", "normal", "high"] as const;

const autumnKey = process.env.AUTUMN_SECRET_KEY ?? "";
const providerLive = autumnKey.startsWith("am_sk_live_");

/** Attached to every response. Do not remove — it is the only thing stopping a
 *  UI from telling a driver their card was charged. */
const billingMode = () => ({
  live: providerLive,
  provider: providerLive ? "autumn" : null,
  note: providerLive
    ? "Live payment provider key detected."
    : "No live payment provider. AUTUMN_SECRET_KEY is a test key, so no card is charged and no provider-side subscription exists. These rows are records only.",
});

const emailOk = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

/** Monthly total for a plan. Fleet lease bills per truck; everything else per seat. */
function monthlyTotal(plan: string, seats: number, trucks: number) {
  const p = PLANS[plan];
  if (!p) return { unitPrice: 0, units: 0, unit: "", monthlyTotal: 0 };
  const perTruck = p.unit.includes("truck");
  const units = perTruck ? Math.max(trucks, 0) : Math.max(seats, 1);
  return {
    unitPrice: p.unitPrice,
    units,
    unit: p.unit,
    monthlyTotal: Math.round(p.unitPrice * units * 100) / 100,
  };
}

export const subscriptions = new Hono()

  // ── Config ────────────────────────────────────────────────────────────────
  .get("/", (c) =>
    c.json({
      plans: PLANS,
      statuses: SUB_STATUSES,
      trialDays: TRIAL_DAYS,
      caseCategories: CASE_CATEGORIES,
      caseStatuses: CASE_STATUSES,
      casePriorities: CASE_PRIORITIES,
      billing: billingMode(),
      terms: { contract: "none", paymentTerms: "Net 30", billingEmail: "jeremiahjmorris1126@gmail.com" },
    }),
  )

  // ── Subscriptions ─────────────────────────────────────────────────────────
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const accountName = typeof body.accountName === "string" ? body.accountName.trim() : "";
    const plan = typeof body.plan === "string" ? body.plan : "";
    const contactEmail = body.contactEmail;

    if (!accountName) return c.json({ error: "accountName is required" }, 400);
    if (!emailOk(contactEmail)) return c.json({ error: "A valid contactEmail is required" }, 400);
    if (!PLANS[plan]) return c.json({ error: `plan must be one of ${Object.keys(PLANS).join(", ")}` }, 400);

    const seats = num(body.seats, 1) || 1;
    const trucks = num(body.trucks, 0);
    const priced = monthlyTotal(plan, seats, trucks);
    if (priced.units === 0) {
      return c.json({ error: `Plan ${plan} bills per ${priced.unit} — trucks must be at least 1` }, 400);
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86400_000);
    const row = {
      id: rid("sub"),
      signupId: typeof body.signupId === "string" ? body.signupId : null,
      accountName,
      contactEmail: (contactEmail as string).trim().toLowerCase(),
      plan,
      seats,
      trucks,
      unitPrice: priced.unitPrice,
      status: "trialing" as const,
      trialEndsAt,
      startedAt: now,
      cancelledAt: null,
      cancelReason: null,
      // Null on purpose: no provider has this record.
      provider: null,
      providerRef: null,
      notes: typeof body.notes === "string" ? body.notes : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.subscriptions).values(row);

    return c.json(
      {
        subscription: row,
        pricing: priced,
        charged: false,
        billing: billingMode(),
      },
      201,
    );
  })

  .get("/list", async (c) => {
    const status = c.req.query("status");
    const rows = status
      ? await db
          .select()
          .from(schema.subscriptions)
          .where(eq(schema.subscriptions.status, status))
          .orderBy(desc(schema.subscriptions.createdAt))
          .limit(500)
      : await db.select().from(schema.subscriptions).orderBy(desc(schema.subscriptions.createdAt)).limit(500);

    const counts = await db
      .select({ status: schema.subscriptions.status, n: sql<number>`count(*)` })
      .from(schema.subscriptions)
      .groupBy(schema.subscriptions.status);

    const mrr =
      Math.round(
        rows
          .filter((r) => r.status === "active")
          .reduce((sum, r) => sum + monthlyTotal(r.plan, r.seats, r.trucks).monthlyTotal, 0) * 100,
      ) / 100;

    return c.json({
      subscriptions: rows.map((r) => ({ ...r, pricing: monthlyTotal(r.plan, r.seats, r.trucks) })),
      total: rows.length,
      counts: Object.fromEntries(counts.map((r) => [r.status, Number(r.n)])),
      // Contracted, not collected. No money has been received through this app.
      contractedMrr: mrr,
      mrrNote: "Sum of monthly plan value for rows marked active. This is contracted value, not collected revenue.",
      billing: billingMode(),
    });
  })

  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    const cases = await db
      .select()
      .from(schema.billingCases)
      .where(eq(schema.billingCases.subscriptionId, row.id))
      .orderBy(desc(schema.billingCases.createdAt));
    return c.json({
      subscription: { ...row, pricing: monthlyTotal(row.plan, row.seats, row.trucks) },
      billingCases: cases,
      billing: billingMode(),
    });
  })

  .post("/:id/status", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = typeof body.status === "string" ? body.status : "";
    if (!(SUB_STATUSES as readonly string[]).includes(status)) {
      return c.json({ error: `status must be one of ${SUB_STATUSES.join(", ")}` }, 400);
    }
    const [row] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    await db
      .update(schema.subscriptions)
      .set({
        status,
        notes: typeof body.notes === "string" ? body.notes : row.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, row.id));

    return c.json({
      id: row.id,
      status,
      charged: false,
      // Marking a row active does not take payment.
      note:
        status === "active" && !providerLive
          ? "Marked active in this database only. No payment provider was contacted and no card was charged."
          : null,
      billing: billingMode(),
    });
  })

  .post("/:id/cancel", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const [row] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    if (row.status === "cancelled") {
      return c.json({ id: row.id, status: "cancelled", alreadyCancelled: true, billing: billingMode() });
    }
    const now = new Date();
    await db
      .update(schema.subscriptions)
      .set({
        status: "cancelled",
        cancelledAt: now,
        cancelReason: typeof body.reason === "string" ? body.reason : null,
        updatedAt: now,
      })
      .where(eq(schema.subscriptions.id, row.id));

    return c.json({
      id: row.id,
      status: "cancelled",
      cancelledAt: now,
      reason: typeof body.reason === "string" ? body.reason : null,
      providerCancelled: false,
      providerNote: row.providerRef
        ? "This row has a provider reference — cancel it with the provider too. This endpoint did not."
        : "No provider subscription existed for this row, so there is nothing to cancel on a provider side.",
      billing: billingMode(),
    });
  })

  // ── Billing cases ─────────────────────────────────────────────────────────
  .get("/billing-cases/list", async (c) => {
    const status = c.req.query("status");
    const rows = status
      ? await db
          .select()
          .from(schema.billingCases)
          .where(eq(schema.billingCases.status, status))
          .orderBy(desc(schema.billingCases.createdAt))
          .limit(500)
      : await db.select().from(schema.billingCases).orderBy(desc(schema.billingCases.createdAt)).limit(500);

    const counts = await db
      .select({ status: schema.billingCases.status, n: sql<number>`count(*)` })
      .from(schema.billingCases)
      .groupBy(schema.billingCases.status);

    const openDisputed =
      Math.round(
        rows
          .filter((r) => r.status === "open" || r.status === "in_review")
          .reduce((s, r) => s + (r.amountDisputed ?? 0), 0) * 100,
      ) / 100;

    return c.json({
      cases: rows,
      total: rows.length,
      counts: Object.fromEntries(counts.map((r) => [r.status, Number(r.n)])),
      openDisputedAmount: openDisputed,
      billing: billingMode(),
    });
  })

  .post("/billing-cases", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const category = typeof body.category === "string" ? body.category : "other";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!emailOk(body.contactEmail)) return c.json({ error: "A valid contactEmail is required" }, 400);
    if (!subject) return c.json({ error: "subject is required" }, 400);
    if (!description) return c.json({ error: "description is required" }, 400);
    if (!(CASE_CATEGORIES as readonly string[]).includes(category)) {
      return c.json({ error: `category must be one of ${CASE_CATEGORIES.join(", ")}` }, 400);
    }

    let subscriptionId: string | null = null;
    if (typeof body.subscriptionId === "string" && body.subscriptionId) {
      const [sub] = await db
        .select({ id: schema.subscriptions.id })
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, body.subscriptionId))
        .limit(1);
      if (!sub) return c.json({ error: `No subscription ${body.subscriptionId}` }, 400);
      subscriptionId = sub.id;
    }

    const amount = Number(body.amountDisputed);
    const priority =
      typeof body.priority === "string" && (CASE_PRIORITIES as readonly string[]).includes(body.priority)
        ? body.priority
        : category === "failed_payment" || category === "overcharge"
          ? "high"
          : "normal";

    const now = new Date();
    const row = {
      id: rid("bcase"),
      subscriptionId,
      contactEmail: (body.contactEmail as string).trim().toLowerCase(),
      category,
      subject,
      description,
      amountDisputed: Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) / 100 : null,
      priority,
      status: "open" as const,
      assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : null,
      resolution: null,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.billingCases).values(row);

    return c.json(
      {
        case: row,
        stored: true,
        // A refund cannot be issued from here — there is no provider to refund from.
        refundCapable: providerLive,
        refundNote: providerLive
          ? "A live provider key is present, but this endpoint still does not issue refunds. Refunds must be done in the provider dashboard."
          : "No live payment provider, so no charge exists to refund. Resolving a case here records a decision only.",
        billing: billingMode(),
      },
      201,
    );
  })

  .post("/billing-cases/:id/resolve", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = typeof body.status === "string" ? body.status : "resolved";
    if (!["resolved", "refunded", "rejected", "in_review"].includes(status)) {
      return c.json({ error: "status must be resolved, refunded, rejected or in_review" }, 400);
    }
    const resolution = typeof body.resolution === "string" ? body.resolution.trim() : "";
    if (status !== "in_review" && !resolution) {
      return c.json({ error: "resolution text is required when closing a case" }, 400);
    }

    const [row] = await db
      .select()
      .from(schema.billingCases)
      .where(eq(schema.billingCases.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    const now = new Date();
    await db
      .update(schema.billingCases)
      .set({
        status,
        resolution: resolution || row.resolution,
        assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : row.assignedTo,
        resolvedAt: status === "in_review" ? null : now,
        updatedAt: now,
      })
      .where(eq(schema.billingCases.id, row.id));

    return c.json({
      id: row.id,
      status,
      resolution: resolution || row.resolution,
      moneyMoved: false,
      moneyNote:
        status === "refunded"
          ? "Marked refunded in this database. No refund was sent — that has to happen wherever the original charge was taken."
          : null,
      billing: billingMode(),
    });
  });

export default subscriptions;
