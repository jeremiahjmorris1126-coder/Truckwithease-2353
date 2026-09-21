import { createHash } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

/** Writes a new duty event; existing events are never updated or deleted by this module. */
export async function appendDutyEvent(input: {
  driverId: string;
  eventType: "status_change" | "correction";
  status: string;
  occurredAt: Date;
  location?: string | null;
  note?: string | null;
  source: "driver" | "dispatcher" | "device";
  revisionOf?: string | null;
}) {
  return db.transaction(async (tx) => {
    // A transaction-scoped Postgres advisory lock prevents two simultaneous events
    // for one driver from reading the same predecessor and forking the hash chain.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${input.driverId}))`);
    const [previous] = await tx.select().from(schema.eldDutyEvents)
      .where(eq(schema.eldDutyEvents.driverId, input.driverId))
      .orderBy(desc(schema.eldDutyEvents.createdAt)).limit(1);
    const prevHash = previous?.chainHash ?? "GENESIS";
    const payload = JSON.stringify({ ...input, occurredAt: input.occurredAt.toISOString() });
    const payloadHash = sha256(payload);
    const chainHash = sha256(`${payloadHash}:${prevHash}`);
    const event = { id: id("elde"), ...input, payloadHash, prevHash, chainHash };
    await tx.insert(schema.eldDutyEvents).values(event);
    return event;
  });
}
