import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Lazy database handle (Neon Postgres via node-postgres).
 *
 * WHY THIS IS NOT A PLAIN `new Pool(...)` AT MODULE TOP LEVEL:
 * every route file imports `db`, and `src/api/index.ts` imports all of them.
 * If the pool is built at import time and `DATABASE_URL` is absent or malformed,
 * construction throws while the module graph is still loading — which takes down
 * the ENTIRE API. Every endpoint then returns a bare `500 Internal Server Error`
 * with no hint of the real cause (this is exactly what happened in preview: no
 * DATABASE_URL -> whole backend dead).
 *
 * Instead we build the pool + drizzle client on first use and cache them. A
 * missing URL now fails only the queries that actually touch the database, with
 * a clear, actionable message — routes that don't need the DB (health, ping,
 * the calculators, the function index) keep working, and the error names the fix.
 *
 * The same pg Pool backs both Drizzle (app queries) and Better Auth (users /
 * sessions), so there is one connection and one source of truth.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;

let cachedPool: Pool | null = null;
let cachedDb: Db | null = null;

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set, so no database connection can be opened. " +
        "In production this is injected by the Neon integration; locally, set " +
        "DATABASE_URL to a Postgres connection string (postgres://user:pass@host/db).",
    );
  }
  return url;
}

/**
 * The shared pg Pool. Built lazily; reused by both Drizzle and Better Auth.
 *
 * Tuned for a serverless deployment (Vercel Functions) in front of Neon's own
 * connection pooler. The relevant differences from pg's defaults:
 *   - `max: 5` — a single function instance serves a small number of concurrent
 *     requests, and Neon's pooler multiplexes the real Postgres connections.
 *     Leaving pg at its default `max: 10` per instance lets a burst of cold
 *     starts exhaust Neon's connection ceiling. Overridable via DB_POOL_MAX.
 *   - `connectionTimeoutMillis: 10000` — pg's default is 0 (wait forever). A
 *     saturated pool would otherwise hang the request until the platform kills
 *     it; now it fails fast with a real error.
 *   - `idleTimeoutMillis: 30000` — return idle connections to Neon promptly.
 *   - `allowExitOnIdle: true` — let a frozen/idle function instance exit cleanly
 *     instead of being held open by a lingering socket.
 *   - `keepAlive: true` — avoid re-dialing on reused warm connections.
 */
export function getPool(): Pool {
  if (cachedPool) return cachedPool;
  const max = Number(process.env.DB_POOL_MAX) || 5;
  cachedPool = new Pool({
    connectionString: connectionString(),
    max,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    allowExitOnIdle: true,
    keepAlive: true,
  });
  // A pool-level error (e.g. Neon dropping an idle socket) must not crash the
  // process; log it and let the next query re-open a connection.
  cachedPool.on("error", (err) => {
    console.error("[v0] pg pool error:", err.message);
  });
  return cachedPool;
}

function realDb(): Db {
  if (cachedDb) return cachedDb;
  cachedDb = drizzle(getPool(), { schema });
  return cachedDb;
}

/**
 * `db` keeps the exact same shape callers already use (`db.select(...)`,
 * `db.insert(...)`, `db.query...`, `db.execute(...)`). The Proxy just defers the
 * pool + client build to the first property access instead of at import.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(realDb() as object, prop, receiver);
    return typeof value === "function" ? value.bind(realDb()) : value;
  },
}) as Db;
