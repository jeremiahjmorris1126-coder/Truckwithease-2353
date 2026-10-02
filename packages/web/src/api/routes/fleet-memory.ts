import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq, like, or } from "drizzle-orm";

/**
 * Fleet Memory — server side.
 *
 * Replaces legacy/lib/fleetMemory.js, which wrote driver-submitted intelligence to four
 * PocketBase collections that never existed on any server:
 *   user_activity_index, fleet_intelligence_notes, shipper_broker_ratings, route_stop_feedback
 *
 * None were in SERVER_COLLECTIONS, so the pb shim resolved them against localStorage.
 * Consequences that this route fixes:
 *  - Every note a driver filed about a broker was saved to that one browser and nowhere else.
 *  - checkEntityWarnings() therefore returned "no warnings" for every broker on every other
 *    device. DispatchPage and FleetLoadBoardPage showed a clean broker check that had checked nothing.
 *  - FleetMemoryPage rendered empty arrays as "cross-fleet intelligence", so an empty database
 *    looked like a fleet with no complaints.
 *
 * Design rules kept from the rest of this API:
 *  - Aggregates report their sample size. A stop rated once is not a ranked stop.
 *  - Nothing here is scored, weighted or predicted. These are driver reports, counted.
 *  - An empty result returns an explicit empty array plus a note, so the UI can say
 *    "no reports yet" instead of implying the entity is clean.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const key = (s: string) => (s || "").trim().toLowerCase();

/** A stop needs this many reports before it is ranked at all. */
export const MIN_STOP_REPORTS = 3;

export const fleetMemory = new Hono()
  .get("/", (c) =>
    c.json(
      {
        service: "fleet-memory",
        tables: ["activity_log", "fleet_intelligence_notes", "shipper_broker_ratings", "route_stop_feedback"],
        minStopReports: MIN_STOP_REPORTS,
        note: "Driver-submitted reports, counted. Nothing here is scored or predicted, and no entity is rated by this platform.",
      },
      200,
    ),
  )

  /** Activity logging. Fire-and-forget from the client; never blocks a page. */
  .post("/activity", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    if (!b.module || !b.actionType) return c.json({ error: "module and actionType are required" }, 400);
    const row = {
      id: rid("act"),
      sessionId: String(b.sessionId || "anonymous").slice(0, 80),
      module: String(b.module).slice(0, 80),
      actionType: String(b.actionType).slice(0, 60),
      detail: b.detail ? String(b.detail).slice(0, 200) : null,
      value: b.value ? String(b.value).slice(0, 100) : null,
      device: b.device ? String(b.device).slice(0, 20) : null,
    };
    await db.insert(schema.activityLog).values(row);
    return c.json({ logged: true, id: row.id }, 200);
  })

  /** Warning lookup for one broker/shipper/receiver by name. */
  .get("/entity/:name", async (c) => {
    const raw = c.req.param("name");
    const k = key(raw);
    if (k.length < 2) return c.json({ error: "name must be at least 2 characters" }, 400);

    const [notes, ratings] = await Promise.all([
      db.select().from(schema.fleetNotes).where(like(schema.fleetNotes.entityNameKey, `%${k}%`)).orderBy(desc(schema.fleetNotes.createdAt)).limit(50),
      db.select().from(schema.entityRatings).where(like(schema.entityRatings.companyNameKey, `%${k}%`)).orderBy(desc(schema.entityRatings.createdAt)).limit(50),
    ]);

    const negRatings = ratings.filter((r) => r.rating <= 2);
    const hasWarnings = notes.length > 0 || negRatings.length > 0;

    let worstSeverity = "none";
    if (notes.some((n) => n.severity === "Critical")) worstSeverity = "critical";
    else if (negRatings.length >= 2 || notes.some((n) => n.severity === "High")) worstSeverity = "high";
    else if (notes.length > 0 || negRatings.length > 0) worstSeverity = "medium";

    const reportCount = notes.length + ratings.length;
    return c.json(
      {
        entityName: raw,
        hasWarnings,
        worstSeverity,
        notes,
        ratings,
        negRatings,
        reportCount,
        // The distinction the old client-side version erased.
        note:
          reportCount === 0
            ? "No driver has filed a report on this name. That means nobody has reported anything — not that the company is in good standing. This platform does not rate brokers."
            : `${reportCount} driver-submitted report(s) on file. These are unverified driver accounts, not findings.`,
      },
      200,
    );
  })

  /** File a note about a broker/shipper/receiver. */
  .post("/notes", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const name = String(b.entityName || "").trim();
    const text = String(b.noteText || "").trim();
    if (name.length < 2) return c.json({ error: "entityName is required" }, 400);
    if (text.length < 5) return c.json({ error: "noteText is required" }, 400);

    const row = {
      id: rid("fnote"),
      entityName: name.slice(0, 160),
      entityNameKey: key(name).slice(0, 160),
      entityType: String(b.entityType || "Broker").slice(0, 40),
      noteType: String(b.noteType || "Other").slice(0, 60),
      severity: String(b.severity || "Medium").slice(0, 20),
      noteText: text.slice(0, 2000),
      fleetName: b.fleetName ? String(b.fleetName).slice(0, 120) : null,
      driverName: b.driverName ? String(b.driverName).slice(0, 120) : null,
      loadNumber: b.loadNumber ? String(b.loadNumber).slice(0, 60) : null,
      mcNumber: b.mcNumber ? String(b.mcNumber).slice(0, 40) : null,
      resolved: false,
      sessionId: b.sessionId ? String(b.sessionId).slice(0, 80) : null,
    };
    await db.insert(schema.fleetNotes).values(row);
    return c.json({ note: row, stored: true }, 200);
  })

  /** Recent notes and ratings feed. */
  .get("/notes", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") || 30), 200);
    const [notes, ratings] = await Promise.all([
      db.select().from(schema.fleetNotes).orderBy(desc(schema.fleetNotes.createdAt)).limit(limit),
      db.select().from(schema.entityRatings).orderBy(desc(schema.entityRatings.createdAt)).limit(limit),
    ]);
    return c.json({ notes, ratings, total: notes.length + ratings.length }, 200);
  })

  /** Submit a 1-5 star rating on a broker/shipper. */
  .post("/ratings", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const name = String(b.companyName || "").trim();
    const rating = Number(b.rating);
    if (name.length < 2) return c.json({ error: "companyName is required" }, 400);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return c.json({ error: "rating must be 1-5" }, 400);

    const row = {
      id: rid("rate"),
      companyName: name.slice(0, 160),
      companyNameKey: key(name).slice(0, 160),
      companyType: String(b.companyType || "Broker").slice(0, 40),
      rating: Math.round(rating),
      paySpeed: b.paySpeed ? String(b.paySpeed).slice(0, 40) : null,
      communication: b.communication ? String(b.communication).slice(0, 40) : null,
      reviewText: b.reviewText ? String(b.reviewText).slice(0, 2000) : null,
      mcNumber: b.mcNumber ? String(b.mcNumber).slice(0, 40) : null,
      sessionId: b.sessionId ? String(b.sessionId).slice(0, 80) : null,
    };
    await db.insert(schema.entityRatings).values(row);
    return c.json({ rating: row, stored: true }, 200);
  })

  /** Entities with the most flags. Counted, not scored. */
  .get("/worst-entities", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") || 20), 100);
    const [notes, ratings] = await Promise.all([
      db.select().from(schema.fleetNotes).orderBy(desc(schema.fleetNotes.createdAt)).limit(500),
      db.select().from(schema.entityRatings).orderBy(desc(schema.entityRatings.createdAt)).limit(500),
    ]);

    const agg: Record<string, { name: string; type: string; complaints: number; negRatings: number; notes: typeof notes }> = {};
    for (const n of notes) {
      const k = n.entityNameKey;
      if (!k) continue;
      agg[k] ||= { name: n.entityName, type: n.entityType, complaints: 0, negRatings: 0, notes: [] };
      agg[k].complaints++;
      agg[k].notes.push(n);
    }
    for (const r of ratings.filter((x) => x.rating <= 2)) {
      const k = r.companyNameKey;
      if (!k) continue;
      agg[k] ||= { name: r.companyName, type: r.companyType, complaints: 0, negRatings: 0, notes: [] };
      agg[k].negRatings++;
    }

    const entities = Object.values(agg)
      .map((e) => ({ ...e, totalFlags: e.complaints + e.negRatings }))
      .filter((e) => e.totalFlags > 0)
      .sort((a, b) => b.totalFlags - a.totalFlags)
      .slice(0, limit);

    return c.json(
      {
        entities,
        totalReports: notes.length + ratings.length,
        note:
          entities.length === 0
            ? "No entity has been flagged yet. This list is built entirely from driver submissions — an empty list means nothing has been reported, not that every broker is clean."
            : "Ranked by number of driver reports. Unverified driver accounts, not findings.",
      },
      200,
    );
  })

  /** Stop feedback aggregate. Only stops with MIN_STOP_REPORTS reports are ranked. */
  .get("/stops", async (c) => {
    const vehicleType = c.req.query("vehicleType");
    const limit = Math.min(Number(c.req.query("limit") || 15), 100);

    const rows = vehicleType
      ? await db.select().from(schema.stopFeedback).where(eq(schema.stopFeedback.vehicleType, vehicleType)).orderBy(desc(schema.stopFeedback.createdAt)).limit(1000)
      : await db.select().from(schema.stopFeedback).orderBy(desc(schema.stopFeedback.createdAt)).limit(1000);

    const agg: Record<string, { stopName: string; vehicleType: string; pos: number; neg: number; total: number }> = {};
    for (const r of rows) {
      const k = r.stopNameKey;
      if (!k) continue;
      agg[k] ||= { stopName: r.stopName, vehicleType: r.vehicleType, pos: 0, neg: 0, total: 0 };
      if (r.rating > 0) agg[k].pos++;
      else if (r.rating < 0) agg[k].neg++;
      agg[k].total++;
    }

    const all = Object.values(agg).map((s) => ({
      ...s,
      score: s.pos - s.neg,
      // pct is only meaningful with enough reports; null below the threshold rather than a made-up 50.
      pct: s.total >= MIN_STOP_REPORTS ? Math.round((s.pos / s.total) * 100) : null,
      ranked: s.total >= MIN_STOP_REPORTS,
    }));

    const ranked = all.filter((s) => s.ranked).sort((a, b) => b.score - a.score).slice(0, limit);
    const tooFew = all.filter((s) => !s.ranked).length;

    return c.json(
      {
        stops: ranked,
        totalReports: rows.length,
        stopsBelowThreshold: tooFew,
        minReports: MIN_STOP_REPORTS,
        note:
          ranked.length === 0
            ? `No stop has reached ${MIN_STOP_REPORTS} driver reports yet, so nothing is ranked. ${tooFew} stop(s) have some feedback but not enough to mean anything.`
            : `Stops with at least ${MIN_STOP_REPORTS} driver reports. ${tooFew} more stop(s) are below the threshold and not shown.`,
      },
      200,
    );
  })

  /** Rate a stop: +1 or -1. */
  .post("/stops", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const name = String(b.stopName || "").trim();
    const rating = Number(b.rating);
    if (name.length < 2) return c.json({ error: "stopName is required" }, 400);
    if (rating !== 1 && rating !== -1) return c.json({ error: "rating must be 1 or -1" }, 400);

    const row = {
      id: rid("stopfb"),
      stopName: name.slice(0, 160),
      stopNameKey: key(name).slice(0, 160),
      vehicleType: String(b.vehicleType || "truck").slice(0, 30),
      rating,
      routeOrigin: b.routeOrigin ? String(b.routeOrigin).slice(0, 120) : null,
      routeDest: b.routeDest ? String(b.routeDest).slice(0, 120) : null,
      sessionId: b.sessionId ? String(b.sessionId).slice(0, 80) : null,
    };
    await db.insert(schema.stopFeedback).values(row);
    return c.json({ feedback: row, stored: true }, 200);
  });

export default fleetMemory;
