import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * Load board seats — server side.
 *
 * Rebuilt from the pasted PocketBase `load_board_licenses` collection, which
 * legacy/lib/loadBoardLicensing.js writes to in 12 places against a server that
 * does not exist.
 *
 * Two deliberate changes from the pasted schema:
 *  1. `password_hash` is GONE. You cannot log a driver into DAT with a hash —
 *     hashes are one-way. Storing one would either be useless or, if it was
 *     really the password, a plaintext credential in a table. Credentials go in
 *     `api_key_vault` (AES-256-GCM) and this table keeps only `credentialRef`.
 *  2. Nothing here buys anything. `purchaseLoadBoardLicense()` in the original
 *     lib returned a fabricated username/password and marked the seat active.
 *     There is no DAT or Uber Freight reseller agreement and no API credential,
 *     so seats are created `pending` and every response says so.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const LB_SERVICES = ["dat", "uber_freight", "truckstop", "internal"] as const;
export const LB_STATUSES = ["pending", "active", "expired", "revoked"] as const;

/** No load board reseller relationship exists yet. */
const RESELLER = {
  live: false,
  provider: null as string | null,
  note: "TruckWithEase has no reseller or API agreement with DAT, Uber Freight or Truckstop. Seats recorded here are internal tracking only — no account was purchased or provisioned.",
};

const bad = (msg: string) => ({ error: msg });

export const licensing = new Hono()

  .get("/", (c) =>
    c.json({
      services: LB_SERVICES,
      statuses: LB_STATUSES,
      reseller: RESELLER,
      notes: {
        credentials:
          "Login credentials are never stored in this table. Store them through /api/vault and reference the vault row id as credentialRef.",
        activation:
          "A seat only becomes `active` when someone confirms a real account exists on the load board. The server cannot verify that on its own.",
      },
    }),
  )

  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const driverId = String(body.driverId || "").trim();
    const service = String(body.service || "").trim().toLowerCase();
    if (!driverId) return c.json(bad("driverId is required"), 400);
    if (!LB_SERVICES.includes(service as (typeof LB_SERVICES)[number]))
      return c.json(bad(`service must be one of: ${LB_SERVICES.join(", ")}`), 400);

    const [dupe] = await db
      .select()
      .from(schema.loadBoardLicenses)
      .where(and(eq(schema.loadBoardLicenses.driverId, driverId), eq(schema.loadBoardLicenses.service, service)))
      .limit(1);
    if (dupe && dupe.status !== "revoked") {
      return c.json({ license: dupe, duplicate: true, note: "This driver already has a seat on this service." });
    }

    const days = Number(body.days) > 0 ? Number(body.days) : 30;
    const id = rid("lbl");
    await db.insert(schema.loadBoardLicenses).values({
      id,
      driverId,
      fleetId: body.fleetId ? String(body.fleetId) : null,
      service,
      username: body.username ? String(body.username).slice(0, 200) : null,
      credentialRef: body.credentialRef ? String(body.credentialRef) : null,
      status: "pending",
      seatLabel: body.seatLabel ? String(body.seatLabel).slice(0, 120) : null,
      purchased: false,
      expiresAt: new Date(Date.now() + days * 86400000),
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
    });
    const [row] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    return c.json({ license: row, purchased: false, reseller: RESELLER }, 201);
  })

  .get("/list", async (c) => {
    const driverId = c.req.query("driverId");
    const service = c.req.query("service");
    const where = [
      driverId ? eq(schema.loadBoardLicenses.driverId, driverId) : undefined,
      service ? eq(schema.loadBoardLicenses.service, service) : undefined,
    ].filter(Boolean);
    const rows = await db
      .select()
      .from(schema.loadBoardLicenses)
      .where(where.length ? and(...(where as never[])) : undefined)
      .orderBy(desc(schema.loadBoardLicenses.createdAt))
      .limit(300);

    const now = Date.now();
    return c.json({
      licenses: rows.map((r) => ({
        ...r,
        expired: r.expiresAt ? r.expiresAt.getTime() < now : false,
        hasCredential: Boolean(r.credentialRef),
      })),
      count: rows.length,
      activeCount: rows.filter((r) => r.status === "active").length,
      reseller: RESELLER,
    });
  })

  .post("/:id/status", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const status = String(body.status || "").trim();
    if (!LB_STATUSES.includes(status as (typeof LB_STATUSES)[number]))
      return c.json(bad(`status must be one of: ${LB_STATUSES.join(", ")}`), 400);

    const [row] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    if (!row) return c.json(bad("license not found"), 404);

    // Activating claims a real account exists on the load board. Require the
    // person doing it to say who confirmed it, so the record is not just a flag.
    if (status === "active" && !row.credentialRef && !body.confirmedBy)
      return c.json(
        bad("Activating a seat needs either a credentialRef (vault row) or confirmedBy (who verified the account exists). The server cannot check DAT or Uber Freight."),
        400,
      );

    await db
      .update(schema.loadBoardLicenses)
      .set({
        status,
        revokedReason: status === "revoked" ? String(body.reason || "manual_revoke") : null,
        notes: body.confirmedBy ? `Confirmed by ${String(body.confirmedBy).slice(0, 120)}` : row.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.loadBoardLicenses.id, id));

    const [updated] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    return c.json({
      license: updated,
      providerNotified: false,
      note: "Status changed in TruckWithEase only. No load board was contacted.",
    });
  })

  .post("/:id/login", async (c) => {
    const id = c.req.param("id");
    const [row] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    if (!row) return c.json(bad("license not found"), 404);
    await db
      .update(schema.loadBoardLicenses)
      .set({ lastLoginAt: new Date(), loginCount: row.loginCount + 1, updatedAt: new Date() })
      .where(eq(schema.loadBoardLicenses.id, id));
    return c.json({ ok: true, id, loginCount: row.loginCount + 1, note: "Recorded a login attempt reported by the client. Not verified with the load board." });
  })

  .post("/:id/renew", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const days = Number(body.days) > 0 ? Number(body.days) : 30;
    const [row] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    if (!row) return c.json(bad("license not found"), 404);
    const base = row.expiresAt && row.expiresAt.getTime() > Date.now() ? row.expiresAt.getTime() : Date.now();
    await db
      .update(schema.loadBoardLicenses)
      .set({ expiresAt: new Date(base + days * 86400000), updatedAt: new Date() })
      .where(eq(schema.loadBoardLicenses.id, id));
    const [updated] = await db.select().from(schema.loadBoardLicenses).where(eq(schema.loadBoardLicenses.id, id)).limit(1);
    return c.json({
      license: updated,
      charged: false,
      note: "Expiry extended in our records. Nothing was billed and no load board subscription was renewed.",
    });
  });
