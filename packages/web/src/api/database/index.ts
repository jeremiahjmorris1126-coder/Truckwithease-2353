import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * Lazy database handle.
 *
 * WHY THIS IS NOT A PLAIN `createClient(...)` AT MODULE TOP LEVEL:
 * every route file imports `db`, and `src/api/index.ts` imports all of them.
 * If the client is built at import time and `DATABASE_URL` is absent or
 * malformed, `@libsql/client` throws `URL_INVALID` while the module graph is
 * still loading — which takes down the ENTIRE API. Every endpoint then returns
 * a bare `500 Internal Server Error` with no hint of the real cause (this is
 * exactly what happened in preview: no DATABASE_URL -> whole backend dead).
 *
 * Instead we build the drizzle client on first use and cache it. A missing URL
 * now fails only the queries that actually touch the database, with a clear,
 * actionable message — routes that don't need the DB (health, ping, the
 * calculators, the function index) keep working, and the error names the fix.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

function realDb(): Db {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set, so no database connection can be opened. " +
        "In production this is injected by the platform; locally, set DATABASE_URL " +
        "(e.g. a Turso libsql:// URL, or file:local.db for a local SQLite file).",
    );
  }

  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  cached = drizzle(client, { schema });
  return cached;
}

/**
 * `db` keeps the exact same shape callers already use (`db.select(...)`,
 * `db.insert(...)`, `db.query...`). The Proxy just defers the client build to
 * the first property access instead of at import.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(realDb() as object, prop, receiver);
    return typeof value === "function" ? value.bind(realDb()) : value;
  },
}) as Db;
