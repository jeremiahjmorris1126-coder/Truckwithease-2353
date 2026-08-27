import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import {
  decryptSecret,
  encryptSecret,
  fingerprint,
  maskHint,
  maskedPreview,
  vaultReady,
} from "../lib/crypto";

/**
 * Server-side API key vault.
 *
 * Rules that make this a real vault:
 *  - Plaintext is accepted once (store/rotate) and never returned to a client.
 *  - Ciphertext is AES-256-GCM and never leaves the server.
 *  - Reads of the real key happen in-process only, via `getVaultKey()`.
 *  - Every operation is written to api_key_audit_log.
 */

const SERVICES = [
  { key: "apifreaks", label: "APIFreaks (IP / WHOIS / timezone / admin units)" },
  { key: "google_maps", label: "Google Maps Platform" },
  { key: "openai", label: "OpenAI (parked — no code reads this key)" },
  { key: "checkr", label: "Checkr (background checks)" },
  { key: "twilio", label: "Twilio (SMS / voice)" },
  { key: "samsara", label: "Samsara ELD" },
  { key: "motive", label: "Motive ELD" },
  { key: "dat", label: "DAT load board" },
] as const;

async function audit(
  service: string,
  action: string,
  outcome: string,
  detail?: string,
  actor = "server",
) {
  await db.insert(schema.apiKeyAuditLog).values({
    id: crypto.randomUUID(),
    service,
    action,
    outcome,
    actor,
    detail: detail ?? null,
    at: new Date(),
  });
}

/**
 * Server-only accessor. Returns the decrypted key or null.
 * Never expose this over HTTP.
 */
export async function getVaultKey(service: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(schema.apiKeyVault)
    .where(eq(schema.apiKeyVault.service, service));
  if (!row) {
    await audit(service, "use", "not_found");
    return null;
  }
  if (!row.enabled) {
    await audit(service, "use", "disabled");
    return null;
  }
  try {
    const plain = decryptSecret(row.ciphertext);
    await db
      .update(schema.apiKeyVault)
      .set({ accessCount: (row.accessCount ?? 0) + 1, lastAccessed: new Date() })
      .where(eq(schema.apiKeyVault.id, row.id));
    await audit(service, "use", "ok");
    return plain;
  } catch (e) {
    await audit(service, "use", "error", e instanceof Error ? e.message : "decrypt failed");
    return null;
  }
}

/** Fall back to an env var so keys already in .env keep working. */
export async function getKeyOrEnv(service: string, envVar: string): Promise<string | null> {
  const fromVault = await getVaultKey(service);
  if (fromVault) return fromVault;
  return process.env[envVar] || null;
}

const publicRow = (r: typeof schema.apiKeyVault.$inferSelect) => ({
  id: r.id,
  service: r.service,
  label: r.label,
  preview: maskedPreview(r.hint),
  fingerprint: r.fingerprint.slice(0, 12),
  enabled: r.enabled,
  rotationCount: r.rotationCount,
  accessCount: r.accessCount,
  lastAccessed: r.lastAccessed,
  lastRotated: r.lastRotated,
  createdAt: r.createdAt,
});

export const vault = new Hono()
  .get("/services", (c) => c.json({ services: SERVICES }, 200))

  /** Vault status — what is stored, never the values. */
  .get("/", async (c) => {
    const rows = await db.select().from(schema.apiKeyVault);
    const stored = new Map(rows.map((r) => [r.service, r]));
    return c.json(
      {
        encryption: "aes-256-gcm",
        ready: vaultReady(),
        keys: rows.map(publicRow),
        services: SERVICES.map((s) => ({
          ...s,
          stored: stored.has(s.key),
          preview: stored.has(s.key) ? maskedPreview(stored.get(s.key)!.hint) : null,
        })),
      },
      200,
    );
  })

  .get("/status/:service", async (c) => {
    const service = c.req.param("service");
    const [row] = await db
      .select()
      .from(schema.apiKeyVault)
      .where(eq(schema.apiKeyVault.service, service));
    return c.json({ service, stored: Boolean(row), key: row ? publicRow(row) : null }, 200);
  })

  /** Store or rotate. Body: { service, value, label? } */
  .post("/", async (c) => {
    if (!vaultReady()) {
      return c.json({ error: "vault_unavailable", detail: "BETTER_AUTH_SECRET is not set" }, 503);
    }
    const body = await c.req.json<{ service?: string; value?: string; label?: string }>();
    const service = (body.service || "").trim();
    const value = (body.value || "").trim();
    if (!service || !value) {
      return c.json({ error: "service and value are required" }, 400);
    }

    const fp = fingerprint(value);
    const [existing] = await db
      .select()
      .from(schema.apiKeyVault)
      .where(eq(schema.apiKeyVault.service, service));

    if (existing) {
      const sameValue = existing.fingerprint === fp;
      await db
        .update(schema.apiKeyVault)
        .set({
          ciphertext: encryptSecret(value),
          hint: maskHint(value),
          fingerprint: fp,
          label: body.label ?? existing.label,
          lastRotated: new Date(),
          rotationCount: (existing.rotationCount ?? 0) + 1,
          enabled: true,
        })
        .where(eq(schema.apiKeyVault.id, existing.id));
      await audit(service, "rotate", "ok", sameValue ? "rotated to the same value" : undefined);
      const [row] = await db
        .select()
        .from(schema.apiKeyVault)
        .where(eq(schema.apiKeyVault.id, existing.id));
      return c.json(
        {
          ok: true,
          rotated: true,
          reusedSameValue: sameValue,
          warning: sameValue ? "The new key is identical to the old one — not a real rotation." : null,
          key: publicRow(row),
        },
        200,
      );
    }

    const id = crypto.randomUUID();
    await db.insert(schema.apiKeyVault).values({
      id,
      service,
      label: body.label ?? SERVICES.find((s) => s.key === service)?.label ?? service,
      ciphertext: encryptSecret(value),
      hint: maskHint(value),
      fingerprint: fp,
      createdAt: new Date(),
      lastRotated: new Date(),
      rotationCount: 0,
      accessCount: 0,
      enabled: true,
    });
    await audit(service, "store", "ok");
    const [row] = await db.select().from(schema.apiKeyVault).where(eq(schema.apiKeyVault.id, id));
    return c.json({ ok: true, rotated: false, key: publicRow(row) }, 200);
  })

  .post("/:service/disable", async (c) => {
    const service = c.req.param("service");
    await db
      .update(schema.apiKeyVault)
      .set({ enabled: false })
      .where(eq(schema.apiKeyVault.service, service));
    await audit(service, "denied", "disabled", "key disabled by request");
    return c.json({ ok: true, service, enabled: false }, 200);
  })

  .post("/:service/enable", async (c) => {
    const service = c.req.param("service");
    await db
      .update(schema.apiKeyVault)
      .set({ enabled: true })
      .where(eq(schema.apiKeyVault.service, service));
    await audit(service, "store", "ok", "key re-enabled");
    return c.json({ ok: true, service, enabled: true }, 200);
  })

  .delete("/:service", async (c) => {
    const service = c.req.param("service");
    await db.delete(schema.apiKeyVault).where(eq(schema.apiKeyVault.service, service));
    await audit(service, "delete", "ok");
    return c.json({ ok: true, service, deleted: true }, 200);
  })

  /**
   * Integrity check — decrypts every stored key in memory and confirms the
   * GCM tag verifies and the fingerprint still matches. Nothing is returned
   * except pass/fail per service.
   */
  .get("/integrity", async (c) => {
    const rows = await db.select().from(schema.apiKeyVault);
    const results = rows.map((r) => {
      try {
        const plain = decryptSecret(r.ciphertext);
        const fpOk = fingerprint(plain) === r.fingerprint;
        return {
          service: r.service,
          decrypts: true,
          fingerprintMatches: fpOk,
          status: fpOk ? "ok" : "fingerprint_mismatch",
        };
      } catch {
        return {
          service: r.service,
          decrypts: false,
          fingerprintMatches: false,
          status: "tampered_or_key_changed",
        };
      }
    });
    return c.json(
      {
        ready: vaultReady(),
        checked: results.length,
        passing: results.filter((r) => r.status === "ok").length,
        results,
      },
      200,
    );
  })

  .get("/audit", async (c) => {
    const rows = await db.select().from(schema.apiKeyAuditLog);
    const entries = rows
      .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
      .slice(0, 200);
    return c.json({ entries }, 200);
  });
