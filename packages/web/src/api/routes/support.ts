import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Customer support — server side.
 *
 * Replaces legacy/lib/customerSupport.js, which built a ticket object,
 * returned it, and threw it away. Nothing was ever stored, so every "ticket
 * submitted" message on CustomerSupportPage was a lie to the driver.
 *
 * Two corrections carried over from the original:
 *  - The phone number was '1-800-TRUCK-EASE'. That number is not owned by this
 *    business. It now uses the real published line.
 *  - Response times were advertised per category ("1-2 hours"). With no support
 *    staff rota those are targets, not commitments, and they are labelled as
 *    targets in the payload.
 */

export const SUPPORT_EMAIL = "truckeasecare@gmail.com";
export const SUPPORT_PHONE = "636-706-8338";
export const BILLING_EMAIL = "jeremiahjmorris1126@gmail.com";

/** Central time. Stored as 24h so the availability check is not string parsing. */
export const SUPPORT_HOURS: Record<string, { open: number; close: number; label: string }> = {
  sun: { open: 8, close: 20, label: "8am–8pm CT" },
  mon: { open: 6, close: 22, label: "6am–10pm CT" },
  tue: { open: 6, close: 22, label: "6am–10pm CT" },
  wed: { open: 6, close: 22, label: "6am–10pm CT" },
  thu: { open: 6, close: 22, label: "6am–10pm CT" },
  fri: { open: 6, close: 22, label: "6am–10pm CT" },
  sat: { open: 7, close: 21, label: "7am–9pm CT" },
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export const SUPPORT_CATEGORIES: Record<
  string,
  { name: string; description: string; priority: string; targetResponse: string; route: string }
> = {
  SAFETY: {
    name: "Safety or Roadside Emergency",
    description: "Breakdown, accident, unsafe dispatch pressure, hours you are being told to run illegally",
    priority: "critical",
    targetResponse: "immediate — call, do not wait on a ticket",
    route: "phone",
  },
  COMPLIANCE: {
    name: "HOS, ELD and DOT Compliance",
    description: "Log corrections, ELD malfunction reports, DVIR questions, audit requests",
    priority: "high",
    targetResponse: "same business day (target)",
    route: "ticket",
  },
  TECHNICAL: {
    name: "Technical Issues",
    description: "App crashes, features not working, login problems, sync failures",
    priority: "high",
    targetResponse: "1–2 business hours (target)",
    route: "ticket",
  },
  BILLING: {
    name: "Billing and Subscription",
    description: "Charges, plan changes, invoices, hardware lease questions",
    priority: "normal",
    targetResponse: "1 business day (target)",
    route: "ticket",
  },
  HARDWARE: {
    name: "Hardware",
    description: "Tablet, ELD unit, dash cam, install kit — damage, replacement, returns",
    priority: "normal",
    targetResponse: "1 business day (target)",
    route: "ticket",
  },
  ACCOUNT: {
    name: "Account and Data",
    description: "Driver records, document access, export requests, deletion requests",
    priority: "normal",
    targetResponse: "2 business days (target)",
    route: "ticket",
  },
  FEEDBACK: {
    name: "Feature Request or Feedback",
    description: "Something missing, something broken by design, something you want built",
    priority: "low",
    targetResponse: "no committed response time",
    route: "ticket",
  },
};

export const RESPONSE_TIME_NOTE =
  "Response times are targets, not guarantees. There is no 24/7 staffed support desk yet. Anything safety-critical should be a phone call, not a ticket.";

export const SAFETY_ESCALATION =
  "If you are in immediate danger, call 911. For suicide or crisis support call or text 988. Do not wait on a support ticket.";

export function isSupportOpen(now = new Date()): { open: boolean; today: string; hours: string } {
  // Central time offset without pulling a tz library: CT is UTC-5 (CDT) / UTC-6 (CST).
  // August is CDT, so -5. This is approximate by design and labelled as such.
  const ct = new Date(now.getTime() - 5 * 3600_000);
  const key = DAY_KEYS[ct.getUTCDay()];
  const h = SUPPORT_HOURS[key];
  const hour = ct.getUTCHours();
  return { open: hour >= h.open && hour < h.close, today: key, hours: h.label };
}

function ticketNumber(): string {
  const d = new Date();
  const stamp = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000; // ticket id only, not data
  return `TWE-${stamp}-${rand}`;
}

export const support = new Hono()
  .get("/", (c) => {
    const status = isSupportOpen();
    return c.json(
      {
        email: SUPPORT_EMAIL,
        billingEmail: BILLING_EMAIL,
        phone: SUPPORT_PHONE,
        hours: Object.fromEntries(Object.entries(SUPPORT_HOURS).map(([k, v]) => [k, v.label])),
        openNow: status.open,
        today: status.today,
        todayHours: status.hours,
        timezone: "America/Chicago (offset approximated as UTC-5)",
        categories: SUPPORT_CATEGORIES,
        responseTimeNote: RESPONSE_TIME_NOTE,
        safetyEscalation: SAFETY_ESCALATION,
      },
      200,
    );
  })

  .post("/tickets", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const category = String(body.category ?? "TECHNICAL").toUpperCase();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.body ?? body.message ?? "").trim();

    if (!subject || !message) {
      return c.json({ error: "subject and body are both required" }, 400);
    }
    const cat = SUPPORT_CATEGORIES[category];
    if (!cat) {
      return c.json({ error: "unknown category", validCategories: Object.keys(SUPPORT_CATEGORIES) }, 400);
    }

    const id = crypto.randomUUID();
    const number = ticketNumber();
    await db.insert(schema.supportTickets).values({
      id,
      ticketNumber: number,
      category,
      priority: cat.priority,
      subject,
      body: message,
      driverId: (body.driverId as string) || null,
      contactEmail: (body.contactEmail as string) || null,
      contactPhone: (body.contactPhone as string) || null,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return c.json(
      {
        id,
        ticketNumber: number,
        category,
        categoryName: cat.name,
        priority: cat.priority,
        status: "open",
        stored: true,
        targetResponse: cat.targetResponse,
        responseTimeNote: RESPONSE_TIME_NOTE,
        note:
          cat.route === "phone"
            ? `This category should be a phone call. Ticket saved, but call ${SUPPORT_PHONE} now.`
            : `Ticket saved on the server. Reference ${number}.`,
      },
      201,
    );
  })

  .get("/tickets", async (c) => {
    const driverId = c.req.query("driverId");
    const rows = driverId
      ? await db
          .select()
          .from(schema.supportTickets)
          .where(eq(schema.supportTickets.driverId, driverId))
          .orderBy(desc(schema.supportTickets.createdAt))
          .limit(100)
      : await db
          .select()
          .from(schema.supportTickets)
          .orderBy(desc(schema.supportTickets.createdAt))
          .limit(100);
    return c.json({ tickets: rows, count: rows.length }, 200);
  })

  .post("/tickets/:id/status", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = String(body.status ?? "");
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return c.json({ error: "status must be open, in_progress, resolved or closed" }, 400);
    }
    await db
      .update(schema.supportTickets)
      .set({ status, resolution: (body.resolution as string) || null, updatedAt: new Date() })
      .where(eq(schema.supportTickets.id, id));
    return c.json({ id, status, updated: true }, 200);
  });
