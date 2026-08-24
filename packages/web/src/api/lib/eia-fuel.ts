import * as XLSX from "xlsx";

/**
 * Live diesel prices from the U.S. Energy Information Administration (EIA).
 * Public government data files — NO API KEY required.
 * We pull the 5 PADD regional weekly No.2 diesel retail averages and the
 * national average, cache them for 6h, and map a driver's state -> PADD region
 * so station prices reflect real current regional diesel prices.
 */

const SOURCES: Record<string, string> = {
  US: "EMD_EPD2D_PTE_NUS_DPG", // National
  P1: "EMD_EPD2D_PTE_R10_DPG", // East Coast
  P2: "EMD_EPD2D_PTE_R20_DPG", // Midwest
  P3: "EMD_EPD2D_PTE_R30_DPG", // Gulf Coast
  P4: "EMD_EPD2D_PTE_R40_DPG", // Rocky Mountain
  P5: "EMD_EPD2D_PTE_R50_DPG", // West Coast
};

// US state -> PADD region
const STATE_PADD: Record<string, keyof typeof SOURCES> = {
  // PADD 1 — East Coast
  CT: "P1", ME: "P1", MA: "P1", NH: "P1", RI: "P1", VT: "P1", DE: "P1", DC: "P1",
  MD: "P1", NJ: "P1", NY: "P1", PA: "P1", FL: "P1", GA: "P1", NC: "P1", SC: "P1", VA: "P1", WV: "P1",
  // PADD 2 — Midwest
  IL: "P2", IN: "P2", IA: "P2", KS: "P2", KY: "P2", MI: "P2", MN: "P2", MO: "P2",
  NE: "P2", ND: "P2", OH: "P2", OK: "P2", SD: "P2", TN: "P2", WI: "P2",
  // PADD 3 — Gulf Coast
  AL: "P3", AR: "P3", LA: "P3", MS: "P3", NM: "P3", TX: "P3",
  // PADD 4 — Rocky Mountain
  CO: "P4", ID: "P4", MT: "P4", UT: "P4", WY: "P4",
  // PADD 5 — West Coast
  AK: "P5", AZ: "P5", CA: "P5", HI: "P5", NV: "P5", OR: "P5", WA: "P5",
};

const REGION_LABEL: Record<string, string> = {
  US: "U.S. Average", P1: "East Coast (PADD 1)", P2: "Midwest (PADD 2)",
  P3: "Gulf Coast (PADD 3)", P4: "Rocky Mountain (PADD 4)", P5: "West Coast (PADD 5)",
};

type PriceData = { prices: Record<string, number>; period: string };
let cache: { data: PriceData; ts: number } | null = null;
const TTL = 6 * 60 * 60 * 1000; // 6h
let inflight: Promise<PriceData> | null = null;

async function fetchOne(sourcekey: string): Promise<{ price: number; period: string } | null> {
  const url = `https://www.eia.gov/dnav/pet/hist_xls/${sourcekey}w.xls`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
    const sh = wb.Sheets["Data 1"];
    if (!sh) return null;
    const rows = XLSX.utils.sheet_to_json<any[]>(sh, { header: 1 });
    // Find last row with a numeric price in col 1
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      const v = Number(r?.[1]);
      if (r && Number.isFinite(v) && v > 0) {
        let period = "";
        const d = r[0];
        if (d instanceof Date) period = d.toISOString().slice(0, 10);
        else if (typeof d === "string") period = d;
        return { price: v, period };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function load(): Promise<PriceData> {
  const entries = await Promise.all(
    Object.entries(SOURCES).map(async ([region, key]) => {
      const r = await fetchOne(key);
      return [region, r] as const;
    }),
  );
  const prices: Record<string, number> = {};
  let period = "";
  for (const [region, r] of entries) {
    if (r) {
      prices[region] = r.price;
      if (r.period && !period) period = r.period;
    }
  }
  return { prices, period };
}

export async function getDieselPrices(): Promise<{ data: PriceData; live: boolean }> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL && Object.keys(cache.data.prices).length > 0) {
    return { data: cache.data, live: true };
  }
  if (!inflight) inflight = load().finally(() => { inflight = null; });
  try {
    const data = await inflight;
    if (Object.keys(data.prices).length > 0) {
      cache = { data, ts: now };
      return { data, live: true };
    }
  } catch {
    /* fall through */
  }
  // Stale cache is better than nothing
  if (cache) return { data: cache.data, live: true };
  return { data: { prices: {}, period: "" }, live: false };
}

/** Regional average diesel for a state (falls back to US average). */
export function regionalPrice(data: PriceData, state?: string | null): { base: number; region: string; label: string } | null {
  const region = (state && STATE_PADD[state.toUpperCase()]) || "US";
  const base = data.prices[region] ?? data.prices.US;
  if (!Number.isFinite(base)) return null;
  return { base, region, label: REGION_LABEL[region] ?? "U.S. Average" };
}

export { STATE_PADD, REGION_LABEL };
