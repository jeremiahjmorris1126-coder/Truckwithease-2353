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

/** The shared pg Pool. Built lazily; reused by both Drizzle and Better Auth. */
export function getPool(): Pool {
  if (cachedPool) return cachedPool;
  cachedPool = new Pool({ connectionString: connectionString() });
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
