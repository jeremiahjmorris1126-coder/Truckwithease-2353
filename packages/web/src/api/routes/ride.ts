import { Hono } from "hono";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * RideWithEase — server side.
 *
 * A SECOND PRODUCT, not a TruckWithEase module: bike / e-bike / cargo-bike /
 * car courier work on gig platforms. Nothing in 49 CFR 395 applies to a bicycle
 * courier, so there is deliberately no HOS, ELD or DVIR surface here.
 *
 * Replaces the fully-mocked legacy/pages/RideWithEasePage.jsx, where every
 * number on all ten tabs was a hardcoded constant: platform earnings, delivery
 * lists, safety scores for named city blocks, battery percentages, gear
 * inspection dates and tax deductions. None of it came from anywhere.
 *
 * What this route does and does not do:
 *   REAL   — couriers, deliveries, earnings, expenses, mileage, maintenance
 *            intervals, points. All computed from rows the courier entered.
 *   ABSENT — route safety scoring, live traffic, charger maps, weather.
 *            Those need data feeds nobody has bought yet, so they return
 *            empty with a reason instead of a plausible-looking number.
 */

// ── Vehicles ────────────────────────────────────────────────────────────────
// `mileageDeductible` is the one that matters at tax time: the IRS standard
// mileage rate applies to a car, van, pickup or panel truck. A bicycle is not
// one, so bike miles CANNOT be deducted at the standard rate — a bike courier
// deducts actual costs instead. Getting this wrong on a return is a real
// problem, so the API states it per vehicle rather than leaving it to the UI.
export const VEHICLE_TYPES: Record<
  string,
  { name: string; powered: boolean; mileageDeductible: boolean; note: string }
> = {
  ebike: { name: "E-Bike", powered: true, mileageDeductible: false, note: "Class 1-3 pedal assist. Deduct actual costs, not standard mileage." },
  road_bike: { name: "Road Bike", powered: false, mileageDeductible: false, note: "Deduct actual costs, not standard mileage." },
  cargo_bike: { name: "Cargo Bike", powered: true, mileageDeductible: false, note: "Deduct actual costs, not standard mileage." },
  hybrid: { name: "Hybrid / City Bike", powered: false, mileageDeductible: false, note: "Deduct actual costs, not standard mileage." },
  fat_tire_ebike: { name: "Fat Tire E-Bike", powered: true, mileageDeductible: false, note: "Deduct actual costs, not standard mileage." },
  scooter: { name: "Scooter / Moped", powered: true, mileageDeductible: false, note: "Not a car, van, pickup or panel truck — standard mileage rate does not apply." },
  car: { name: "Car / Van", powered: true, mileageDeductible: true, note: "Eligible for the IRS standard mileage rate, or actual costs — pick one method per vehicle." },
};

/** Platform keys only. No earnings, ratings or "Active" status are invented here. */
export const PLATFORMS = [
  "doordash", "uber_eats", "grubhub", "instacart", "amazon_flex", "shipt", "relay", "roadie", "spark", "other",
] as const;

// ── Tax ─────────────────────────────────────────────────────────────────────
// Last rate this codebase can vouch for is the 2025 business rate of $0.70/mi
// (IRS Notice 2025-05). The 2026 rate is not confirmed in here — the response
// carries the year and a confirmed flag so nothing quotes a made-up number.
export const MILEAGE_RATE = { rate: 0.7, rateYear: 2025, confirmed: false, source: "IRS Notice 2025-05 (business standard mileage rate)" };

export const TAX_DISCLAIMER =
  "Estimates only, not tax advice. Standard mileage applies to a car, van, pickup or panel truck — not to a bicycle or e-bike. Confirm the current year rate and your method with a CPA before filing.";

// ── Maintenance ─────────────────────────────────────────────────────────────
// Ordinary bicycle service intervals. Mileage-based where mileage drives wear,
// time-based where it does not. No item claims a live sensor reading.
export const MAINTENANCE_ITEMS: Record<
  string,
  { name: string; intervalMi: number | null; intervalDays: number | null; note: string }
> = {
  chain_lube: { name: "Chain lubrication", intervalMi: 150, intervalDays: 14, note: "Sooner after any wet ride." },
  chain_wear: { name: "Chain wear check", intervalMi: 750, intervalDays: null, note: "Replace at 0.5% stretch or the cassette goes with it." },
  tire_pressure: { name: "Tire pressure", intervalMi: null, intervalDays: 3, note: "Check before every shift. Tubes lose pressure sitting still." },
  tires: { name: "Tire replacement", intervalMi: 2000, intervalDays: null, note: "Loaded delivery bikes wear rear tires far faster than the front." },
  brake_pads: { name: "Brake pads", intervalMi: 1000, intervalDays: null, note: "Inspect; replace at 1mm of pad material." },
  brake_cables: { name: "Cable / hose check", intervalMi: 2500, intervalDays: 180, note: "Fraying cable or spongy lever means stop riding." },
  drivetrain_clean: { name: "Drivetrain clean", intervalMi: 300, intervalDays: 21, note: null as unknown as string },
  wheel_true: { name: "Wheel true and spoke tension", intervalMi: 1500, intervalDays: null, note: "Cargo loads pull wheels out of true." },
  battery_service: { name: "Battery inspection (e-bike)", intervalMi: null, intervalDays: 90, note: "Store between 30-80% charge. Never charge a battery that has been dropped or swollen." },
  helmet_replace: { name: "Helmet replacement", intervalMi: null, intervalDays: 1825, note: "Immediately after any impact, regardless of age or how it looks." },
  lights: { name: "Light function check", intervalMi: null, intervalDays: 7, note: "Front and rear. Required after dark in most jurisdictions." },
};

// ── Points (Rig Bucks) — same convention as the truck-side Roadwards engine ──
export const POINT_RULES = [
  { key: "per_delivery", points: 2, basis: "each completed delivery" },
  { key: "per_10_miles", points: 1, basis: "every 10 delivered miles" },
  { key: "proof_photo", points: 1, basis: "each delivery with proof-of-delivery photo attached" },
  { key: "expense_logged", points: 1, basis: "each receipt logged (keeps the tax record real)" },
];

const NOT_COLLECTED =
  "Not collected yet. This needs a data source the platform has not purchased or built — it returns empty rather than an invented value.";

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const round2 = (n: number) => Math.round(n * 100) / 100;

async function courierOr404(courierId: string) {
  const [c] = await db.select().from(schema.rideCouriers).where(eq(schema.rideCouriers.id, courierId)).limit(1);
  return c ?? null;
}

export const ride = new Hono()

  // ── Config ────────────────────────────────────────────────────────────────
  .get("/", (c) =>
    c.json({
      product: "RideWithEase",
      description: "Gig courier operations for bike, e-bike, cargo-bike, scooter and car couriers. Separate product from TruckWithEase.",
      vehicleTypes: VEHICLE_TYPES,
      platforms: PLATFORMS,
      mileageRate: MILEAGE_RATE,
      pointRules: POINT_RULES,
      maintenanceItems: MAINTENANCE_ITEMS,
      taxDisclaimer: TAX_DISCLAIMER,
      modules: {
        deliveries: "LIVE",
        earnings: "LIVE — computed from stored deliveries",
        tax: "LIVE — computed from stored deliveries and expenses",
        maintenance: "LIVE — interval based, courier logs each service",
        rigBucks: "LIVE — computed from stored activity",
        routeSafety: "NOT BUILT — no crash or bike-lane data source",
        charging: "NOT BUILT — no charger network feed",
        weatherRouting: "NOT BUILT",
        platformSync: "NOT BUILT — no gig platform API access; deliveries are entered by the courier",
      },
    }),
  )

  // ── Couriers ──────────────────────────────────────────────────────────────
  .get("/couriers", async (c) => {
    const rows = await db.select().from(schema.rideCouriers).orderBy(desc(schema.rideCouriers.createdAt));
    return c.json({ couriers: rows.map((r) => ({ ...r, platforms: r.platforms ? JSON.parse(r.platforms) : [] })), count: rows.length });
  })

  .post("/couriers", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const name = typeof b.name === "string" ? b.name.trim() : "";
    const vehicleType = typeof b.vehicleType === "string" ? b.vehicleType : "";
    if (!name) return c.json({ error: "name is required" }, 400);
    if (!VEHICLE_TYPES[vehicleType]) return c.json({ error: "unknown vehicleType", validVehicleTypes: Object.keys(VEHICLE_TYPES) }, 400);

    const id = rid("crr");
    await db.insert(schema.rideCouriers).values({
      id,
      name,
      vehicleType,
      city: typeof b.city === "string" ? b.city : null,
      platforms: Array.isArray(b.platforms) ? JSON.stringify(b.platforms) : null,
      contactEmail: typeof b.contactEmail === "string" ? b.contactEmail : null,
      contactPhone: typeof b.contactPhone === "string" ? b.contactPhone : null,
    });
    return c.json({ stored: true, courierId: id, vehicle: VEHICLE_TYPES[vehicleType] }, 201);
  })

  // ── Deliveries ────────────────────────────────────────────────────────────
  .get("/deliveries", async (c) => {
    const courierId = c.req.query("courierId");
    const q = db.select().from(schema.rideDeliveries).orderBy(desc(schema.rideDeliveries.createdAt)).limit(200);
    const rows = courierId
      ? await db.select().from(schema.rideDeliveries).where(eq(schema.rideDeliveries.courierId, courierId)).orderBy(desc(schema.rideDeliveries.createdAt)).limit(200)
      : await q;
    return c.json({ deliveries: rows, count: rows.length });
  })

  .post("/deliveries", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const courierId = typeof b.courierId === "string" ? b.courierId : "";
    const platform = typeof b.platform === "string" ? b.platform.toLowerCase() : "";
    if (!(await courierOr404(courierId))) return c.json({ error: "unknown courierId" }, 404);
    if (!(PLATFORMS as readonly string[]).includes(platform)) return c.json({ error: "unknown platform", validPlatforms: PLATFORMS }, 400);

    const id = rid("dlv");
    const status = typeof b.status === "string" ? b.status : "pending";
    await db.insert(schema.rideDeliveries).values({
      id,
      courierId,
      platform,
      externalId: typeof b.externalId === "string" ? b.externalId : null,
      pickupAddress: typeof b.pickupAddress === "string" ? b.pickupAddress : null,
      dropoffAddress: typeof b.dropoffAddress === "string" ? b.dropoffAddress : null,
      distanceMi: num(b.distanceMi),
      payout: num(b.payout),
      tip: num(b.tip),
      platformFee: num(b.platformFee),
      status,
      proofPhotoUrl: typeof b.proofPhotoUrl === "string" ? b.proofPhotoUrl : null,
      acceptedAt: new Date(),
      deliveredAt: status === "delivered" ? new Date() : null,
      notes: typeof b.notes === "string" ? b.notes : null,
    });
    return c.json({ stored: true, deliveryId: id }, 201);
  })

  .post("/deliveries/:id/status", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = typeof b.status === "string" ? b.status : "";
    const valid = ["pending", "in_progress", "delivered", "cancelled"];
    if (!valid.includes(status)) return c.json({ error: "invalid status", validStatuses: valid }, 400);
    const patch: Record<string, unknown> = { status };
    if (status === "delivered") {
      patch.deliveredAt = new Date();
      if (num(b.tip) !== null) patch.tip = num(b.tip);
      if (typeof b.proofPhotoUrl === "string") patch.proofPhotoUrl = b.proofPhotoUrl;
    }
    await db.update(schema.rideDeliveries).set(patch).where(eq(schema.rideDeliveries.id, c.req.param("id")));
    return c.json({ updated: true, status });
  })

  // ── Earnings ──────────────────────────────────────────────────────────────
  // Gross, tips, fees and per-mile only. No $/hour: nothing in this product
  // records when a shift started or ended, and a fabricated hourly rate is the
  // number a courier would actually make decisions on.
  .get("/earnings/:courierId", async (c) => {
    const courierId = c.req.param("courierId");
    const courier = await courierOr404(courierId);
    if (!courier) return c.json({ error: "unknown courierId" }, 404);
    const days = Math.min(Math.max(Number(c.req.query("days") ?? 30) || 30, 1), 365);
    const since = new Date(Date.now() - days * 86_400_000);

    const rows = await db
      .select()
      .from(schema.rideDeliveries)
      .where(and(eq(schema.rideDeliveries.courierId, courierId), gte(schema.rideDeliveries.createdAt, since)));

    const done = rows.filter((r) => r.status === "delivered");
    const payout = done.reduce((s, r) => s + (r.payout ?? 0), 0);
    const tips = done.reduce((s, r) => s + (r.tip ?? 0), 0);
    const fees = done.reduce((s, r) => s + (r.platformFee ?? 0), 0);
    const miles = done.reduce((s, r) => s + (r.distanceMi ?? 0), 0);

    const byPlatform: Record<string, { deliveries: number; gross: number; miles: number }> = {};
    for (const r of done) {
      const p = (byPlatform[r.platform] ??= { deliveries: 0, gross: 0, miles: 0 });
      p.deliveries += 1;
      p.gross += (r.payout ?? 0) + (r.tip ?? 0);
      p.miles += r.distanceMi ?? 0;
    }
    for (const p of Object.values(byPlatform)) {
      p.gross = round2(p.gross);
      p.miles = round2(p.miles);
    }

    return c.json({
      courierId,
      windowDays: days,
      deliveries: done.length,
      cancelled: rows.filter((r) => r.status === "cancelled").length,
      pending: rows.filter((r) => r.status === "pending" || r.status === "in_progress").length,
      gross: round2(payout + tips),
      basePayout: round2(payout),
      tips: round2(tips),
      platformFees: round2(fees),
      net: round2(payout + tips - fees),
      miles: round2(miles),
      perDelivery: done.length ? round2((payout + tips) / done.length) : null,
      perMile: miles > 0 ? round2((payout + tips) / miles) : null,
      perHour: null,
      byPlatform,
      methodology: "Summed from delivered rows this courier entered. Rows with a blank payout count as $0, not as an average.",
      limitation: "perHour is null on purpose — no shift clock exists in this product yet.",
    });
  })

  // ── Tax and miles ─────────────────────────────────────────────────────────
  .get("/tax/:courierId", async (c) => {
    const courierId = c.req.param("courierId");
    const courier = await courierOr404(courierId);
    if (!courier) return c.json({ error: "unknown courierId" }, 404);
    const year = Number(c.req.query("year") ?? new Date().getFullYear());
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const deliveries = await db.select().from(schema.rideDeliveries).where(eq(schema.rideDeliveries.courierId, courierId));
    const inYear = deliveries.filter((r) => r.status === "delivered" && r.createdAt >= start && r.createdAt < end);
    const miles = round2(inYear.reduce((s, r) => s + (r.distanceMi ?? 0), 0));
    const gross = round2(inYear.reduce((s, r) => s + (r.payout ?? 0) + (r.tip ?? 0), 0));

    const expenses = await db.select().from(schema.rideExpenses).where(eq(schema.rideExpenses.courierId, courierId));
    const inYearExp = expenses.filter((e) => e.incurredAt >= start && e.incurredAt < end);
    const byCategory: Record<string, number> = {};
    let deductibleExpense = 0;
    for (const e of inYearExp) {
      const claimable = e.amount * (e.businessPct / 100);
      byCategory[e.category] = round2((byCategory[e.category] ?? 0) + claimable);
      deductibleExpense += claimable;
    }

    const vehicle = VEHICLE_TYPES[courier.vehicleType] ?? null;
    const mileageEligible = !!vehicle?.mileageDeductible;

    return c.json({
      courierId,
      year,
      vehicleType: courier.vehicleType,
      milesLogged: miles,
      grossEarnings: gross,
      mileageMethod: mileageEligible
        ? {
            eligible: true,
            rate: MILEAGE_RATE.rate,
            rateYear: MILEAGE_RATE.rateYear,
            rateConfirmedForThisYear: MILEAGE_RATE.rateYear === year && MILEAGE_RATE.confirmed,
            estimatedDeduction: round2(miles * MILEAGE_RATE.rate),
            source: MILEAGE_RATE.source,
          }
        : {
            eligible: false,
            estimatedDeduction: null,
            reason: `A ${vehicle?.name ?? courier.vehicleType} is not a car, van, pickup or panel truck, so the IRS standard mileage rate does not apply. Deduct actual costs instead — that is what the expense log is for.`,
          },
      actualExpenseMethod: {
        eligible: true,
        totalDeductible: round2(deductibleExpense),
        byCategory,
        receipts: inYearExp.length,
      },
      estimatedNetBeforeTax: round2(gross - deductibleExpense - (mileageEligible ? miles * MILEAGE_RATE.rate : 0)),
      selfEmploymentNote:
        "Gig courier income is self-employment income. Schedule C plus Schedule SE, and quarterly estimated payments if you expect to owe $1,000 or more.",
      disclaimer: TAX_DISCLAIMER,
      exportReady: inYearExp.length > 0 || inYear.length > 0,
    });
  })

  .get("/expenses/:courierId", async (c) => {
    const rows = await db
      .select()
      .from(schema.rideExpenses)
      .where(eq(schema.rideExpenses.courierId, c.req.param("courierId")))
      .orderBy(desc(schema.rideExpenses.incurredAt))
      .limit(200);
    return c.json({ expenses: rows, count: rows.length, total: round2(rows.reduce((s, r) => s + r.amount, 0)) });
  })

  .post("/expenses", async (c) => {
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const courierId = typeof b.courierId === "string" ? b.courierId : "";
    if (!(await courierOr404(courierId))) return c.json({ error: "unknown courierId" }, 404);
    const cats = ["gear", "maintenance", "platform_fee", "phone", "insurance", "charging", "other"];
    const category = typeof b.category === "string" ? b.category : "";
    if (!cats.includes(category)) return c.json({ error: "unknown category", validCategories: cats }, 400);
    const amount = num(b.amount);
    if (amount === null || amount <= 0) return c.json({ error: "amount must be a positive number" }, 400);
    const description = typeof b.description === "string" ? b.description.trim() : "";
    if (!description) return c.json({ error: "description is required — an unlabelled receipt is not a record" }, 400);

    const id = rid("exp");
    const pct = num(b.businessPct);
    await db.insert(schema.rideExpenses).values({
      id,
      courierId,
      category,
      description,
      amount,
      businessPct: pct === null ? 100 : Math.min(Math.max(Math.round(pct), 0), 100),
      receiptUrl: typeof b.receiptUrl === "string" ? b.receiptUrl : null,
      incurredAt: typeof b.incurredAt === "string" ? new Date(b.incurredAt) : new Date(),
    });
    return c.json({ stored: true, expenseId: id }, 201);
  })

  // ── Maintenance ───────────────────────────────────────────────────────────
  // Due/overdue comes from the courier's own logged service plus delivered
  // miles since that service. No item pretends to read a sensor.
  .get("/maintenance/:courierId", async (c) => {
    const courierId = c.req.param("courierId");
    const courier = await courierOr404(courierId);
    if (!courier) return c.json({ error: "unknown courierId" }, 404);

    const logs = await db.select().from(schema.rideMaintenance).where(eq(schema.rideMaintenance.courierId, courierId));
    const deliveries = await db.select().from(schema.rideDeliveries).where(eq(schema.rideDeliveries.courierId, courierId));
    const delivered = deliveries.filter((d) => d.status === "delivered");
    const lifetimeMi = round2(delivered.reduce((s, d) => s + (d.distanceMi ?? 0), 0));

    const items = Object.entries(MAINTENANCE_ITEMS).map(([key, def]) => {
      const log = logs.filter((l) => l.item === key).sort((a, b) => (b.lastServiceAt?.getTime() ?? 0) - (a.lastServiceAt?.getTime() ?? 0))[0];
      if (!log) {
        return { item: key, ...def, status: "unknown", reason: "Never logged. Log the last time you did it and this starts tracking.", milesSince: null, daysSince: null };
      }
      const milesSince = round2(lifetimeMi - (log.lastServiceMi ?? 0));
      const daysSince = log.lastServiceAt ? Math.floor((Date.now() - log.lastServiceAt.getTime()) / 86_400_000) : null;
      const overMiles = def.intervalMi !== null && milesSince >= def.intervalMi;
      const overDays = def.intervalDays !== null && daysSince !== null && daysSince >= def.intervalDays;
      const nearMiles = def.intervalMi !== null && milesSince >= def.intervalMi * 0.8;
      const nearDays = def.intervalDays !== null && daysSince !== null && daysSince >= def.intervalDays * 0.8;
      return {
        item: key,
        ...def,
        status: overMiles || overDays ? "due" : nearMiles || nearDays ? "soon" : "ok",
        milesSince,
        daysSince,
        lastServiceAt: log.lastServiceAt,
        reason: overMiles ? `${milesSince} mi since service, interval is ${def.intervalMi} mi` : overDays ? `${daysSince} days since service, interval is ${def.intervalDays} days` : null,
      };
    });

    return c.json({
      courierId,
      vehicleType: courier.vehicleType,
      lifetimeDeliveredMiles: lifetimeMi,
      items,
      due: items.filter((i) => i.status === "due").length,
      unknown: items.filter((i) => i.status === "unknown").length,
      methodology: "Miles come from delivered deliveries only. Riding you never logged is not counted, so treat this as a floor.",
      sensorNote: "No battery percentage, tire pressure or brake wear reading is available — no connected bike hardware exists in this product.",
    });
  })

  .post("/maintenance/:courierId/service", async (c) => {
    const courierId = c.req.param("courierId");
    if (!(await courierOr404(courierId))) return c.json({ error: "unknown courierId" }, 404);
    const b = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const item = typeof b.item === "string" ? b.item : "";
    if (!MAINTENANCE_ITEMS[item]) return c.json({ error: "unknown maintenance item", validItems: Object.keys(MAINTENANCE_ITEMS) }, 400);

    const deliveries = await db.select().from(schema.rideDeliveries).where(eq(schema.rideDeliveries.courierId, courierId));
    const lifetimeMi = round2(deliveries.filter((d) => d.status === "delivered").reduce((s, d) => s + (d.distanceMi ?? 0), 0));

    const id = rid("mnt");
    await db.insert(schema.rideMaintenance).values({
      id,
      courierId,
      item,
      lastServiceAt: typeof b.servicedAt === "string" ? new Date(b.servicedAt) : new Date(),
      lastServiceMi: num(b.atMiles) ?? lifetimeMi,
      notes: typeof b.notes === "string" ? b.notes : null,
    });
    return c.json({ stored: true, serviceId: id, item, atMiles: num(b.atMiles) ?? lifetimeMi });
  })

  // ── Rig Bucks ─────────────────────────────────────────────────────────────
  .get("/rig-bucks/:courierId", async (c) => {
    const courierId = c.req.param("courierId");
    if (!(await courierOr404(courierId))) return c.json({ error: "unknown courierId" }, 404);

    const deliveries = await db.select().from(schema.rideDeliveries).where(eq(schema.rideDeliveries.courierId, courierId));
    const expenses = await db.select().from(schema.rideExpenses).where(eq(schema.rideExpenses.courierId, courierId));
    const done = deliveries.filter((d) => d.status === "delivered");
    const miles = done.reduce((s, d) => s + (d.distanceMi ?? 0), 0);
    const photos = done.filter((d) => !!d.proofPhotoUrl).length;

    const lines = [
      { rule: "per_delivery", count: done.length, points: done.length * 2 },
      { rule: "per_10_miles", count: Math.floor(miles / 10), points: Math.floor(miles / 10) },
      { rule: "proof_photo", count: photos, points: photos },
      { rule: "expense_logged", count: expenses.length, points: expenses.length },
    ];
    const total = lines.reduce((s, l) => s + l.points, 0);

    return c.json({
      courierId,
      balance: total,
      lines,
      rules: POINT_RULES,
      methodology: "Earned only from stored activity. There is no streak, rating or star bonus — the platforms do not share ratings with us.",
      redemption: "NOT BUILT — no reward catalog for RideWithEase yet. Points accrue; nothing can be spent.",
    });
  })

  // ── Deliberately empty ────────────────────────────────────────────────────
  .get("/safety/:courierId", (c) =>
    c.json({
      courierId: c.req.param("courierId"),
      zones: [],
      routeSafetyScores: null,
      note: NOT_COLLECTED,
      wouldNeed: "Bike-lane geometry plus reported crash data (city open-data or NHTSA FARS). Neither is wired up.",
      whatIsReal: "Call 911 for a crash or a threat. Log the incident afterwards so it exists in your own record.",
      doNotRead: "Absence of a warning here does not mean a street is safe. Nothing has been measured.",
    }),
  )

  .get("/charging/:courierId", (c) =>
    c.json({
      courierId: c.req.param("courierId"),
      stations: [],
      batteryPercent: null,
      rangeRemainingMi: null,
      note: NOT_COLLECTED,
      wouldNeed: "A charger network API (NREL AFDC is free and public) plus a BMS connection on the bike for state of charge.",
      careRules: [
        "Store between 30-80% for anything longer than a couple of days.",
        "Charge at room temperature, never straight after a hard shift while the pack is hot.",
        "A swollen, dropped or water-soaked pack goes outside away from the building and does not get charged again.",
      ],
    }),
  );
