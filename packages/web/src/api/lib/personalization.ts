import { sql } from "drizzle-orm";
import { db } from "../database";

/** Ensures the small ownership table exists before personalization queries run.
 * This is intentionally idempotent because this project has no migration runner
 * in its Vercel deployment path. */
let ready: Promise<void> | null = null;

export function ensurePersonalizationSchema() {
  if (!ready) {
    ready = db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS user_driver_profiles (
        user_id TEXT PRIMARY KEY NOT NULL,
        driver_id TEXT NOT NULL UNIQUE,
        personalization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        consented_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)).then(() => undefined, (error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
