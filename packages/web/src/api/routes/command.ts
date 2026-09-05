import { Hono } from "hono";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { auth } from "../auth";

const OPERATIONS_ROLES = new Set(["admin", "dispatch"]);

async function operator(headers: Headers) {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) return null;
    const [assignment] = await db.select().from(schema.userRoles).where(eq(schema.userRoles.userId, session.user.id)).limit(1);
    return { id: session.user.id, role: assignment?.role ?? "driver" };
  } catch {
    return null;
  }
}

async function requireOperator(headers: Headers) {
  const user = await operator(headers);
  if (!user) return { error: "Authentication required.", status: 401 as const };
  if (!OPERATIONS_ROLES.has(user.role)) return { error: "Command Center requires a dispatch or admin role.", status: 403 as const };
  return { user };
}

/** Authenticated operations overview. It reports stored records and configured service presence only; no secrets, external service claims, or fabricated fleet status. */
export const command = new Hono()
  .get("/overview", async (c) => {
    const access = await requireOperator(c.req.raw.headers);
    if ("error" in access) return c.json({ error: access.error }, access.status);

    const [drivers, signups, tickets, documents, maintenance, messages, hosRows, queue, signupTotal, ticketTotal, documentTotal, maintenanceTotal] = await Promise.all([
      db.select().from(schema.drivers),
      db.select().from(schema.signups).orderBy(desc(schema.signups.createdAt)).limit(50),
      db.select().from(schema.supportTickets).orderBy(desc(schema.supportTickets.createdAt)).limit(20),
      db.select().from(schema.traxesRecords).orderBy(desc(schema.traxesRecords.createdAt)).limit(20),
      db.select().from(schema.maintenanceRecords).orderBy(desc(schema.maintenanceRecords.createdAt)).limit(20),
      db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(20),
      db.select().from(schema.hosLogs),
      db.select().from(schema.traxesRecords).where(eq(schema.traxesRecords.destination, "dispatch")).orderBy(desc(schema.traxesRecords.sentAt)).limit(20),
      db.select({ value: count() }).from(schema.signups),
      db.select({ value: count() }).from(schema.supportTickets).where(eq(schema.supportTickets.status, "open")),
      db.select({ value: count() }).from(schema.traxesRecords).where(eq(schema.traxesRecords.destination, "dispatch")),
      db.select({ value: count() }).from(schema.maintenanceRecords).where(eq(schema.maintenanceRecords.status, "open")),
    ]);

    const current = new Map<string, typeof hosRows[number]>();
    for (const row of hosRows) if (!current.has(row.driverId) || current.get(row.driverId)!.startedAt < row.startedAt) current.set(row.driverId, row);
    const driving = drivers.filter((driver) => driver.status === "driving").length;
    const openTickets = ticketTotal[0]?.value ?? 0;
    const openMaintenance = maintenanceTotal[0]?.value ?? 0;
    const completedDocuments = documents.filter((record) => record.status === "filed").length;

    return c.json({
      role: access.user.role,
      generatedAt: new Date().toISOString(),
      counts: { drivers: drivers.length, driving, signups: signupTotal[0]?.value ?? 0, openTickets, dispatchDocuments: documentTotal[0]?.value ?? 0, documents: documents.length, completedDocuments, openMaintenance, messages: messages.length },
      drivers: drivers.map((driver) => ({ id: driver.id, name: driver.name, truckNumber: driver.truckNumber, status: driver.status, lastSeen: driver.lastSeen, dutyStatus: current.get(driver.id)?.status ?? null })),
      signups: signups.slice(0, 10), tickets: tickets.slice(0, 10), documents: queue, maintenance: maintenance.filter((record) => record.status !== "complete").slice(0, 10), messages: messages.slice(0, 10).reverse(),
      integrations: {
        database: Boolean(process.env.DATABASE_URL && process.env.DATABASE_AUTH_TOKEN),
        storage: Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY),
        ocr: Boolean(process.env.GEMINI_API_KEY),
        email: Boolean(process.env.POSTMARK_SERVER_TOKEN && process.env.EMAIL_FROM),
        telematics: Boolean(process.env.FLEETIO_API_KEY && process.env.FLEETIO_ACCOUNT_TOKEN),
      },
      note: "Counts are database rows at request time. Integration values mean configured, not provider-verified; use each integration health route before production use.",
    });
  })
  .post("/tickets/:id/status", async (c) => {
    const access = await requireOperator(c.req.raw.headers);
    if ("error" in access) return c.json({ error: access.error }, access.status);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const status = String(body.status ?? "");
    if (!new Set(["open", "in_progress", "resolved", "closed"]).has(status)) return c.json({ error: "Invalid ticket status." }, 400);
    const [ticket] = await db.update(schema.supportTickets).set({ status, resolution: typeof body.resolution === "string" ? body.resolution.slice(0, 2000) : null, updatedAt: new Date() }).where(eq(schema.supportTickets.id, c.req.param("id"))).returning();
    if (!ticket) return c.json({ error: "Ticket not found." }, 404);
    return c.json({ ticket, updated: true });
  });
