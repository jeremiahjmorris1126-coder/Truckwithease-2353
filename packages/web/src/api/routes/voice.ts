import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { computeClocks } from "./hos";
import { hasAI } from "../agent/gateway";
import { auth } from "../auth";

const commandSchema = z.object({
  transcript: z.string().trim().min(1).max(280),
  location: z.string().trim().max(240).optional(),
  lat: z.number().finite().min(-90).max(90).optional(),
  lon: z.number().finite().min(-180).max(180).optional(),
});

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const id = () => `hos-${crypto.randomUUID()}`;

async function currentDriver(headers: Headers) {
  const session = await auth.api.getSession({ headers }).catch(() => null);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  const rows = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
  return rows[0] ?? null;
}

async function setDutyStatus(driverId: string, status: string, location?: string) {
  const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId)).orderBy(desc(schema.hosLogs.startedAt));
  const current = logs.find((log) => !log.endedAt);
  const now = new Date();
  if (current) await db.update(schema.hosLogs).set({ endedAt: now }).where(eq(schema.hosLogs.id, current.id));
  const [log] = await db.insert(schema.hosLogs).values({ id: id(), driverId, status, startedAt: now, location: location ?? null, note: "Voice command" }).returning();
  await db.update(schema.drivers).set({ status }).where(eq(schema.drivers.id, driverId));
  return log;
}

export const voice = new Hono()
  .get("/readiness", (c) => c.json({
    voiceRecognition: "browser Web Speech API; availability is reported by the client",
    authenticated: true,
    weather: { live: true, endpoint: "/api/weather" },
    geocoding: { configured: Boolean(process.env.GOOGLE_GEOCODING_KEY || process.env.GOOGLE_PLACES_API_KEY), endpoint: "/api/routing/geocode" },
    agents: { live: hasAI(), endpoint: "/api/agent/roster", blocker: hasAI() ? null : "AI Gateway configuration is missing." },
  }))
  .post("/execute", zValidator("json", commandSchema), async (c) => {
    const { transcript, location, lat, lon } = c.req.valid("json");
    const driver = await currentDriver(c.req.raw.headers);
    if (!driver) return c.json({ error: "No driver profile is linked to this signed-in account. Ask dispatch to provision the driver email before issuing voice commands." }, 403);
    const driverId = driver.id;
    const phrase = normalize(transcript);

    if (/\b(log me as |start )?driving\b/.test(phrase)) {
      const log = await setDutyStatus(driverId, "driving", location);
      return c.json({ ok: true, intent: "hos.driving", message: "Duty status changed to Driving.", log }, 201);
    }
    if (/\b(take a break|start break|on break)\b/.test(phrase)) {
      const log = await setDutyStatus(driverId, "on_break", location);
      return c.json({ ok: true, intent: "hos.break", message: "Duty status changed to On Break.", log }, 201);
    }
    if (/\b(how much drive time|drive time.*left|drive time remaining)\b/.test(phrase)) {
      const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId));
      const clocks = computeClocks(logs);
      return c.json({ ok: true, intent: "hos.remaining", message: `${clocks.drivingRemaining} minutes of driving time remaining.`, clocks });
    }
    if (/\b(pre trip|pretrip|inspection)\b/.test(phrase)) {
      return c.json({ ok: true, intent: "dvir.start", message: "Pre-trip inspection ready. Complete the vehicle and odometer fields to submit it.", next: "/dvir" });
    }
    if (/\b(brake defect|defect)\b/.test(phrase)) {
      return c.json({ ok: false, intent: "dvir.defect", error: "A defect requires the truck unit, inspection type, and an explicit safety decision. Open the DVIR form to record it.", next: "/dvir" }, 422);
    }
    if (/\b(weather|storm|wind|alert)\b/.test(phrase)) {
      return c.json({ ok: true, intent: "weather", message: "Retrieving live National Weather Service alerts for your location.", next: Number.isFinite(lat) && Number.isFinite(lon) ? `/api/weather?lat=${lat}&lon=${lon}` : location ? `/api/routing/geocode?address=${encodeURIComponent(location)}` : "/weather" });
    }
    if (/\b(fuel|diesel)\b/.test(phrase)) {
      return c.json({ ok: true, intent: "fuel", message: "Fuel Finder is ready to search from your current location.", next: "/fuel" });
    }
    if (/\b(broken down|breakdown|emergency|sos)\b/.test(phrase)) {
      return c.json({ ok: false, intent: "emergency", error: "Emergency dispatch requires confirmation in the incident workflow; no emergency message was sent.", next: "/incidents" }, 409);
    }
    return c.json({ ok: false, intent: "unknown", error: "Command not recognized. Try a supported HOS, DVIR, weather, fuel, or emergency command." }, 422);
  });
