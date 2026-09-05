import { sql } from "drizzle-orm";
import { db } from "../database";

/** Ensures the small ownership table exists before personalization queries run.
 * This is intentionally idempotent because this project has no migration runner
 * in its Vercel deployment path. */
let ready: Promise<void> | null = null;

export function ensurePersonalizationSchema() {
  if (!ready) {
    ready = db.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS user_driver_profiles (
        user_id TEXT PRIMARY KEY NOT NULL,
        driver_id TEXT NOT NULL UNIQUE,
        personalization_enabled INTEGER NOT NULL DEFAULT 0,
        consented_at INTEGER,
        updated_at INTEGER NOT NULL
      )
    `)).then(() => undefined);
  }
  return ready;
}
