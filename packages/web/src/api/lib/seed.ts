import { db } from "../database";
import * as schema from "../database/schema";
import { sql } from "drizzle-orm";

/**
 * Idempotent seed for demo. Runs once on first API call.
 * Populates realistic fleet so every screen is explorable.
 */
let seeded = false;

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000);

const DRIVERS = [
  { id: "drv-1", name: "Marcus Bell", truckNumber: "T-104", status: "driving", phone: "417-555-0104", email: "marcus@twe.demo", cdlNumber: "MO-CDL-88213", homeBase: "St. Louis, MO", tier: "pro", points: 4820, lat: 38.627, lng: -90.199, speed: 62, heading: 90 },
  { id: "drv-2", name: "Dana Cruz", truckNumber: "T-217", status: "on_duty", phone: "417-555-0217", email: "dana@twe.demo", cdlNumber: "IL-CDL-40921", homeBase: "Chicago, IL", tier: "solo", points: 2110, lat: 41.878, lng: -87.629, speed: 0, heading: 0 },
  { id: "drv-3", name: "Ray Okafor", truckNumber: "T-330", status: "sleeper", phone: "417-555-0330", email: "ray@twe.demo", cdlNumber: "TX-CDL-55110", homeBase: "Dallas, TX", tier: "fleet", points: 6340, lat: 32.776, lng: -96.796, speed: 0, heading: 0 },
  { id: "drv-4", name: "Ashley Kim", truckNumber: "T-451", status: "driving", phone: "417-555-0451", email: "ashley@twe.demo", cdlNumber: "OH-CDL-72004", homeBase: "Columbus, OH", tier: "fleet", points: 3990, lat: 39.961, lng: -82.999, speed: 58, heading: 270 },
  { id: "drv-5", name: "Luis Ferreira", truckNumber: "T-508", status: "off_duty", phone: "417-555-0508", email: "luis@twe.demo", cdlNumber: "GA-CDL-31887", homeBase: "Atlanta, GA", tier: "solo", points: 1560, lat: 33.749, lng: -84.388, speed: 0, heading: 0 },
];

const TRUCKS = [
  { id: "trk-1", unit: "T-104", make: "Freightliner", model: "Cascadia", year: 2022, vin: "1FUJGLDR5NLMV1234", plate: "MO-TR104", assignedDriverId: "drv-1", odometer: 412500, status: "active" },
  { id: "trk-2", unit: "T-217", make: "Kenworth", model: "T680", year: 2021, vin: "1XKYDP9X5MJ456789", plate: "IL-TR217", assignedDriverId: "drv-2", odometer: 388120, status: "active" },
  { id: "trk-3", unit: "T-330", make: "Peterbilt", model: "579", year: 2023, vin: "1XPBDP9X0PD998877", plate: "TX-TR330", assignedDriverId: "drv-3", odometer: 201340, status: "active" },
  { id: "trk-4", unit: "T-451", make: "Volvo", model: "VNL 860", year: 2020, vin: "4V4NC9EH5LN223344", plate: "OH-TR451", assignedDriverId: "drv-4", odometer: 502870, status: "maintenance" },
  { id: "trk-5", unit: "T-508", make: "International", model: "LT625", year: 2022, vin: "3HSDZAPR5NN667788", plate: "GA-TR508", assignedDriverId: "drv-5", odometer: 297610, status: "active" },
];

const LOADS = [
  { id: "load-1", origin: "St. Louis, MO", destination: "Nashville, TN", miles: 309, rate: 1150, equipment: "Dry Van", weight: 42000, pickupDate: "2026-07-06", broker: "TQL", status: "available" },
  { id: "load-2", origin: "Dallas, TX", destination: "Oklahoma City, OK", miles: 206, rate: 780, equipment: "Reefer", weight: 38000, pickupDate: "2026-07-06", broker: "CH Robinson", status: "available" },
  { id: "load-3", origin: "Chicago, IL", destination: "Indianapolis, IN", miles: 183, rate: 690, equipment: "Flatbed", weight: 44000, pickupDate: "2026-07-07", broker: "Coyote", status: "available" },
  { id: "load-4", origin: "Atlanta, GA", destination: "Charlotte, NC", miles: 245, rate: 900, equipment: "Dry Van", weight: 40000, pickupDate: "2026-07-07", broker: "TQL", status: "available" },
  { id: "load-5", origin: "Columbus, OH", destination: "Pittsburgh, PA", miles: 185, rate: 720, equipment: "Reefer", weight: 39000, pickupDate: "2026-07-08", broker: "Echo", status: "available" },
];

export async function ensureSeed() {
  if (seeded) return;
  try {
    const existing = await db.select({ c: sql<number>`count(*)` }).from(schema.drivers);
    if ((existing[0]?.c ?? 0) > 0) {
      seeded = true;
      return;
    }

    await db.insert(schema.drivers).values(
      DRIVERS.map((d) => ({ ...d, lastSeen: new Date(now - 60_000) }))
    );
    await db.insert(schema.trucks).values(TRUCKS);
    await db.insert(schema.loads).values(LOADS);

    // HOS logs for drv-1 today
    await db.insert(schema.hosLogs).values([
      { id: "hos-1", driverId: "drv-1", status: "off_duty", startedAt: hoursAgo(14), endedAt: hoursAgo(11), location: "St. Louis, MO" },
      { id: "hos-2", driverId: "drv-1", status: "on_duty", startedAt: hoursAgo(11), endedAt: hoursAgo(10.5), location: "St. Louis Terminal", note: "Pre-trip inspection" },
      { id: "hos-3", driverId: "drv-1", status: "driving", startedAt: hoursAgo(10.5), endedAt: null, location: "I-70 E" },
    ]);

    // DVIR
    await db.insert(schema.dvirInspections).values([
      { id: "dvir-1", driverId: "drv-1", truckUnit: "T-104", type: "pre_trip", vehicleType: "tractor", odometer: 412500, location: "St. Louis, MO", defects: "[]", hasDefects: false, safeToOperate: true, signature: "Marcus Bell", status: "submitted" },
      { id: "dvir-2", driverId: "drv-4", truckUnit: "T-451", type: "pre_trip", vehicleType: "tractor", odometer: 502870, location: "Columbus, OH", defects: JSON.stringify(["Left rear brake chamber leak", "Trailer marker light out"]), hasDefects: true, safeToOperate: false, signature: "Ashley Kim", status: "needs_repair" },
    ]);

    // Trips
    await db.insert(schema.trips).values([
      { id: "trip-1", driverId: "drv-1", origin: "St. Louis, MO", destination: "Indianapolis, IN", miles: 242, startedAt: hoursAgo(10.5), endedAt: null, maxSpeed: 68, idleMinutes: 22, status: "active" },
      { id: "trip-2", driverId: "drv-3", origin: "Dallas, TX", destination: "Houston, TX", miles: 239, startedAt: hoursAgo(30), endedAt: hoursAgo(25), maxSpeed: 71, idleMinutes: 41, status: "completed" },
    ]);

    // Messages
    await db.insert(schema.messages).values([
      { id: "msg-1", fromId: "dispatch", fromName: "Dispatch", toId: null, body: "Morning drivers — watch for I-70 construction near Effingham. Plan fuel accordingly.", createdAt: new Date(now - 3 * 3600_000) },
      { id: "msg-2", fromId: "drv-1", fromName: "Marcus Bell", toId: "dispatch", body: "Copy. Rolling now, ETA Indy 2pm.", createdAt: new Date(now - 2.5 * 3600_000) },
    ]);

    seeded = true;
  } catch (e) {
    console.error("Seed error:", e);
  }
}
