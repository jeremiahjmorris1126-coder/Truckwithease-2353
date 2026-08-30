import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { and, desc, eq, gte } from "drizzle-orm";

/**
 * ELD hardware integration — server-side.
 *
 * The original eldIntegration.js wrote to five PocketBase collections that never
 * existed (`eld_devices`, `eld_sync_channels`, `eld_telemetry`,
 * `fatigue_state`, `fatigue_alerts`), so every call failed silently and
 * no device was ever actually registered.
 *
 * It also scored fatigue with Math.random() in four places — lane variance,
 * speed consistency, reaction time, and the 128-dimension vector. That is not a
 * model, it is a random number generator, and on a safety feature that is worse
 * than nothing. This version scores fatigue only from telemetry rows that were
 * actually recorded, and returns `insufficientData` when there aren't enough.
 */

export const ELD_DEVICE_TYPES = {
  GPS_TRACKER: "gps_tracker",
  OBD2_READER: "obd2_reader",
  DASH_CAM: "dash_cam",
  CELLULAR_MODEM: "cellular_modem",
  STEERING_WHEEL_HAPTIC: "steering_wheel_haptic",
  VEHICLE_SEAT_HAPTIC: "vehicle_seat_haptic",
} as const;

const DEVICE_TYPE_VALUES: string[] = Object.values(ELD_DEVICE_TYPES);

/** Fatigue bands used across the platform. */
export const FATIGUE_BANDS = [
  { max: 39, level: "alert", action: "none" },
  { max: 64, level: "elevated", action: "monitor" },
  { max: 84, level: "high", action: "recommend_rest" },
  { max: 100, level: "critical", action: "stop_driving" },
] as const;

export function fatigueBand(score: number) {
  return FATIGUE_BANDS.find((b) => score <= b.max) ?? FATIGUE_BANDS[FATIGUE_BANDS.length - 1];
}

const MIN_SAMPLES = 10;

type TelemetryRow = typeof schema.eldTelemetry.$inferSelect;

/**
 * Fatigue score 0-100 from real telemetry only.
 *
 * Inputs, all observed — no random terms:
 *  - harsh events (brake / accel / lane departure) per 100 miles
 *  - speed variance over the window
 *  - continuous driving time since the last stop (speed < 5 mph)
 *  - time of day, weighted for the 00:00-06:00 circadian low
 */
export function scoreFatigue(rows: TelemetryRow[]) {
  if (rows.length < MIN_SAMPLES) {
    return {
      insufficientData: true,
      samples: rows.length,
      needed: MIN_SAMPLES,
      score: null as number | null,
      level: "unknown",
      note: `Fatigue scoring needs at least ${MIN_SAMPLES} telemetry samples. No score is produced from fewer — a guessed safety number is worse than none.`,
    };
  }

  const ordered = [...rows].sort((a, b) => +a.recordedAt - +b.recordedAt);
  const speeds = ordered.map((r) => r.speedMph ?? 0);
  const odos = ordered.map((r) => r.odometer ?? 0).filter((v) => v > 0);
  const miles = odos.length >= 2 ? Math.max(0, odos[odos.length - 1] - odos[0]) : 0;

  const harsh = ordered.filter((r) => r.harshBrake || r.harshAccel).length;
  const laneDepartures = ordered.filter((r) => r.laneDeparture).length;
  const per100 = miles > 5 ? (harsh + laneDepartures) / (miles / 100) : harsh + laneDepartures;

  const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const variance = speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length;
  const stdev = Math.sqrt(variance);

  // Continuous drive time: from the last sample under 5 mph to now.
  let lastStopIdx = 0;
  for (let i = ordered.length - 1; i >= 0; i--) {
    if ((ordered[i].speedMph ?? 0) < 5) { lastStopIdx = i; break; }
  }
  const continuousMs = +ordered[ordered.length - 1].recordedAt - +ordered[lastStopIdx].recordedAt;
  const continuousHours = continuousMs / 3_600_000;

  const hour = new Date(+ordered[ordered.length - 1].recordedAt).getUTCHours();
  const circadian = hour >= 0 && hour < 6 ? 15 : hour >= 22 ? 8 : 0;

  const harshPoints = Math.min(35, per100 * 7);          // 5 events / 100 mi ≈ 35
  const variancePoints = Math.min(20, Math.max(0, (stdev - 6) * 2.5));
  const drivePoints = Math.min(30, Math.max(0, (continuousHours - 4) * 10)); // clean until 4 h
  const score = Math.round(Math.min(100, harshPoints + variancePoints + drivePoints + circadian));
  const band = fatigueBand(score);

  return {
    insufficientData: false,
    samples: ordered.length,
    score,
    level: band.level,
    recommendedAction: band.action,
    factors: {
      harshEventsPer100Miles: Number(per100.toFixed(2)),
      milesObserved: Number(miles.toFixed(1)),
      speedStdevMph: Number(stdev.toFixed(2)),
      continuousDriveHours: Number(continuousHours.toFixed(2)),
      circadianPenalty: circadian,
    },
    note: "Score is computed from recorded telemetry only. It is a coaching signal, not an HOS determination — the ELD log of record still governs.",
  };
}

export const eld = new Hono()
  .get("/device-types", (c) => c.json({ types: ELD_DEVICE_TYPES, values: DEVICE_TYPE_VALUES }))

  .post("/devices", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const driverId = b.driverId ?? b.driver_id;
    const deviceType = b.deviceType ?? b.device_type;
    const deviceSerial = b.deviceSerial ?? b.device_serial;
    if (!driverId || !deviceType || !deviceSerial) {
      return c.json({ error: "driverId, deviceType and deviceSerial are all required" }, 400);
    }
    if (!DEVICE_TYPE_VALUES.includes(deviceType)) {
      return c.json({ error: `Unknown device type "${deviceType}"`, allowed: DEVICE_TYPE_VALUES }, 400);
    }
    const existing = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.deviceSerial, deviceSerial)).limit(1);
    if (existing.length) return c.json({ error: "That serial is already registered", device: existing[0] }, 409);

    const id = `eld-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(schema.eldDevices).values({
      id,
      driverId,
      truckId: b.truckId ?? b.truck_id ?? null,
      deviceType,
      deviceSerial,
      firmwareVersion: b.firmwareVersion ?? b.firmware_version ?? null,
      status: "active",
      syncIntervalSeconds: Number(b.syncIntervalSeconds ?? 30),
    });
    const [device] = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.id, id));
    return c.json({ ok: true, device, note: "Device is registered in the platform. It is not 'connected' until it posts telemetry to POST /api/eld/telemetry." }, 201);
  })

  .get("/devices/:driverId", async (c) => {
    const rows = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.driverId, c.req.param("driverId")));
    return c.json({ count: rows.length, devices: rows });
  })

  .post("/telemetry", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const deviceId = b.deviceId ?? b.device_id;
    if (!deviceId) return c.json({ error: "deviceId is required" }, 400);
    const [device] = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.id, deviceId)).limit(1);
    if (!device) return c.json({ error: "Unknown device. Register it first at POST /api/eld/devices." }, 404);

    const id = `tlm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(schema.eldTelemetry).values({
      id,
      deviceId,
      driverId: device.driverId,
      speedMph: b.speedMph ?? b.speed_mph ?? null,
      rpm: b.rpm ?? b.obd2_engine_rpm ?? null,
      engineHours: b.engineHours ?? null,
      odometer: b.odometer ?? null,
      lat: b.lat ?? b.gps_lat ?? null,
      lng: b.lng ?? b.gps_lng ?? null,
      harshBrake: Boolean(b.harshBrake ?? b.harsh_brake ?? false),
      harshAccel: Boolean(b.harshAccel ?? b.harsh_accel ?? false),
      laneDeparture: Boolean(b.laneDeparture ?? b.lane_departure ?? false),
    });

    await db.update(schema.eldDevices)
      .set({
        lastSync: new Date(),
        status: "active",
        batteryLevel: b.batteryLevel ?? b.battery_level ?? device.batteryLevel,
        signalStrength: b.signalStrength ?? b.signal_strength ?? device.signalStrength,
      })
      .where(eq(schema.eldDevices.id, deviceId));

    const since = new Date(Date.now() - 8 * 3600_000);
    const window = await db.select().from(schema.eldTelemetry)
      .where(and(eq(schema.eldTelemetry.deviceId, deviceId), gte(schema.eldTelemetry.recordedAt, since)))
      .orderBy(desc(schema.eldTelemetry.recordedAt))
      .limit(500);

    const fatigue = scoreFatigue(window);
    if (!fatigue.insufficientData && fatigue.score !== null) {
      await db.update(schema.eldTelemetry).set({ fatigueScore: fatigue.score }).where(eq(schema.eldTelemetry.id, id));
    }
    return c.json({ ok: true, id, fatigue }, 201);
  })

  .get("/status/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const devices = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.driverId, driverId));
    if (devices.length === 0) {
      return c.json({
        driverId, connected: false, devices: [], fatigue: null,
        note: "No ELD hardware is registered to this driver. Nothing is being read from a truck.",
      });
    }
    const since = new Date(Date.now() - 8 * 3600_000);
    const rows = await db.select().from(schema.eldTelemetry)
      .where(and(eq(schema.eldTelemetry.driverId, driverId), gte(schema.eldTelemetry.recordedAt, since)))
      .orderBy(desc(schema.eldTelemetry.recordedAt))
      .limit(500);

    const now = Date.now();
    const withHealth = devices.map((d) => {
      const ageMs = d.lastSync ? now - +d.lastSync : null;
      const stale = ageMs === null || ageMs > d.syncIntervalSeconds * 1000 * 10;
      return { ...d, secondsSinceSync: ageMs === null ? null : Math.round(ageMs / 1000), online: !stale };
    });

    return c.json({
      driverId,
      connected: withHealth.some((d) => d.online),
      devices: withHealth,
      telemetrySamples8h: rows.length,
      fatigue: scoreFatigue(rows),
      latest: rows[0] ?? null,
    });
  })

  .post("/devices/:id/sync", async (c) => {
    const id = c.req.param("id");
    const [device] = await db.select().from(schema.eldDevices).where(eq(schema.eldDevices.id, id)).limit(1);
    if (!device) return c.json({ error: "Unknown device" }, 404);
    const ageMs = device.lastSync ? Date.now() - +device.lastSync : null;
    const online = ageMs !== null && ageMs < device.syncIntervalSeconds * 1000 * 10;
    if (!online) {
      await db.update(schema.eldDevices).set({ status: "offline" }).where(eq(schema.eldDevices.id, id));
    }
    return c.json({
      deviceId: id,
      online,
      secondsSinceSync: ageMs === null ? null : Math.round(ageMs / 1000),
      status: online ? "active" : "offline",
      note: online ? "Device is posting telemetry inside its sync window." : "Device has not posted telemetry inside its sync window. Marked offline — the platform cannot reach hardware it has never heard from.",
    });
  })

  .post("/devices/:id/retire", async (c) => {
    const id = c.req.param("id");
    const res = await db.update(schema.eldDevices).set({ status: "retired" }).where(eq(schema.eldDevices.id, id)).returning();
    if (res.length === 0) return c.json({ error: "Unknown device" }, 404);
    return c.json({ ok: true, device: res[0] });
  });
