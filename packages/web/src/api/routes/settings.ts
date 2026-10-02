import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

/** Integration catalogue from the platform reference doc. */
export const INTEGRATIONS: { key: string; provider: string; category: string }[] = [
  { key: "geotab", provider: "Geotab", category: "eld" },
  { key: "motive", provider: "Motive (KeepTruckin)", category: "eld" },
  { key: "samsara", provider: "Samsara", category: "eld" },
  { key: "azuga", provider: "Azuga", category: "eld" },
  { key: "idrive", provider: "iDrive", category: "eld" },
  { key: "dat", provider: "DAT", category: "load_board" },
  { key: "truckstop", provider: "Truckstop", category: "load_board" },
  { key: "loadboard123", provider: "123Loadboard", category: "load_board" },
  { key: "direct_freight", provider: "Direct Freight", category: "load_board" },
  { key: "twilio", provider: "Twilio (SMS/Voice)", category: "comms" },
  { key: "a2p_10dlc", provider: "A2P 10DLC", category: "comms" },
  { key: "google_maps", provider: "Google Maps", category: "gps" },
  { key: "stripe", provider: "Stripe", category: "payments" },
  { key: "autumn", provider: "Autumn", category: "payments" },
  { key: "checkr", provider: "Checkr", category: "hr" },
];

/**
 * Integration credentials and platform toggles.
 *
 * Security: a row marked `secret` never returns its value to the client — only
 * whether it is set. Real provider secrets belong in the root `.env`, not here;
 * this table is for non-secret config and connection status.
 */
export const settings = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  .get("/integrations", async (c) => {
    const rows = await db.select().from(schema.platformSettings);
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const integrations = INTEGRATIONS.map((i) => {
      const row = byKey.get(i.key);
      return {
        ...i,
        connected: Boolean(row?.value),
        enabled: row?.enabled ?? false,
        updatedAt: row?.updatedAt ?? null,
      };
    });
    return c.json({ integrations }, 200);
  })

  .get("/", async (c) => {
    const rows = await db.select().from(schema.platformSettings);
    return c.json(
      {
        settings: rows.map((r) => ({
          id: r.id,
          key: r.key,
          category: r.category,
          provider: r.provider,
          value: r.secret ? null : r.value,
          isSet: Boolean(r.value),
          secret: r.secret,
          enabled: r.enabled,
          updatedAt: r.updatedAt,
        })),
      },
      200,
    );
  })

  .put("/:key", async (c) => {
    const key = c.req.param("key");
    const b = await c.req.json();
    const known = INTEGRATIONS.find((i) => i.key === key);
    const values = {
      id: `set-${key}`,
      key,
      category: b.category ?? known?.category ?? "general",
      provider: b.provider ?? known?.provider ?? null,
      value: b.value ?? null,
      secret: b.secret !== undefined ? Boolean(b.secret) : true,
      enabled: b.enabled !== undefined ? Boolean(b.enabled) : true,
      updatedAt: new Date(),
    };
    const [existing] = await db.select().from(schema.platformSettings).where(eq(schema.platformSettings.key, key));
    const [row] = existing
      ? await db.update(schema.platformSettings).set(values).where(eq(schema.platformSettings.key, key)).returning()
      : await db.insert(schema.platformSettings).values(values).returning();
    return c.json({ setting: { key: row.key, isSet: Boolean(row.value), enabled: row.enabled } }, 200);
  })

  .delete("/:key", async (c) => {
    await db.delete(schema.platformSettings).where(eq(schema.platformSettings.key, c.req.param("key")));
    return c.json({ ok: true }, 200);
  });
