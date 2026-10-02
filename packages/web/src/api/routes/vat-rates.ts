import { Hono } from "hono";

/**
 * VAT / GST rates — server-side, on APIFreaks.
 *
 * Built 2026-08-26. Replaces docs/launch/vatRates.ORIGINAL.js.txt, a browser-side
 * client that called six /api/vat-rates/* endpoints which did not exist, so every
 * function returned null. Export-facing response field names below are kept exactly
 * as that client destructures them, so the original file works unchanged.
 *
 * Upstream, verified live with the existing APIFREAKS_API_KEY on 2026-08-26:
 *   GET https://api.apifreaks.com/v1.0/vat/rates/country?country=DE   header X-apiKey
 *     -> [{"country":"DE","type":"vat","currency":"EUR","standard_rate":0.19,
 *          "reduced_rate":[0.07,0],"categories":{"books":0.07,...}}]
 *   country=CA            -> [{"type":"gst","currency":"CAD","standard_rate":0.05}]
 *   country=United_States -> [{"type":"none","currency":"USD","standard_rate":0}]
 *   GET .../v1.0/vat/rates/ip-address  (same auth) for IP auto-detect
 * The param is `country` (Alpha-2, Alpha-3 or Full_Name with underscores).
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *   - No US state fuel/diesel tax rates. APIFreaks has no such product and IFTA
 *     publishes its rates as quarterly PDFs. Inventing cents-per-gallon numbers a
 *     driver would file against is not acceptable, so /fuel-tax returns null state
 *     values with a reason. The federal excise figures it does return are statute.
 *   - No compliance verdict. /load-compliance never returns compliant:true and never
 *     returns a filing deadline. TRAXES is a calculator and a record-keeper, not a
 *     filing service. It lists jurisdictions and the rates each one publishes.
 *   - No "potential savings" number invented from rates we do not have.
 */

const AF_BASE = "https://api.apifreaks.com/v1.0/vat/rates";
const TIMEOUT_MS = 15000;
const CACHE_MS = 6 * 60 * 60 * 1000; // rates change by legislation, not by the minute

type AfRate = {
  country?: string;
  type?: string;
  currency?: string;
  standard_rate?: number;
  reduced_rate?: number[];
  categories?: Record<string, number>;
};

const cache = new Map<string, { at: number; data: AfRate[] }>();

function key(): string | null {
  const k = process.env.APIFREAKS_API_KEY;
  return k && k.trim() ? k.trim() : null;
}

/** 26 U.S.C. 4081 — federal motor fuel excise. Statutory, not estimated. */
const FEDERAL_EXCISE_USD_PER_GAL = {
  diesel: 0.244,
  gasoline: 0.184,
  note:
    "Federal excise under 26 U.S.C. 4081: 24.4 cents/gal diesel, 18.4 cents/gal gasoline. " +
    "Unchanged since 1993. This is the federal component only.",
};

async function afFetch(path: string, params: Record<string, string>) {
  const k = key();
  if (!k) {
    return {
      ok: false as const,
      notConfigured: true as const,
      reason: "APIFREAKS_API_KEY is not set in .env.",
    };
  }
  const url = new URL(AF_BASE + path);
  for (const [a, b] of Object.entries(params)) if (b) url.searchParams.set(a, b);

  const cacheKey = url.toString();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return { ok: true as const, data: hit.data, cached: true, endpoint: cacheKey };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      headers: { "X-apiKey": k, Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false as const,
        notConfigured: false as const,
        status: res.status,
        endpoint: cacheKey,
        reason: `APIFreaks returned ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    const parsed = JSON.parse(text) as AfRate[];
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    cache.set(cacheKey, { at: Date.now(), data: arr });
    return { ok: true as const, data: arr, cached: false, endpoint: cacheKey };
  } catch (err) {
    return {
      ok: false as const,
      notConfigured: false as const,
      status: 0,
      endpoint: cacheKey,
      reason: err instanceof Error ? err.message : "request failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Shape one APIFreaks record into the field names the existing client reads. */
function shape(r: AfRate, lookup: string) {
  const type = (r.type || "unknown").toLowerCase();
  const standard = typeof r.standard_rate === "number" ? r.standard_rate : null;
  const reduced = Array.isArray(r.reduced_rate)
    ? r.reduced_rate
        .filter((n) => typeof n === "number")
        .map((n) => ({ name: n === 0 ? "zero-rated" : `reduced ${(n * 100).toFixed(1)}%`, rate: n }))
    : [];

  const noVat = type === "none" || standard === 0;
  return {
    country: r.country || lookup,
    code: r.country || lookup,
    taxType: type,
    currency: r.currency || null,
    standard,
    standardPercent: standard === null ? null : Number((standard * 100).toFixed(2)),
    reduced,
    categories: r.categories || null,
    /**
     * APIFreaks returns a single national rate. It publishes no US state or Canadian
     * provincial breakdown, so this is null rather than a guess. US sales tax and
     * Canadian PST/HST provincial components are not in this feed.
     */
    states: null,
    effectiveDate: null,
    notes: noVat
      ? `${r.country || lookup} has no VAT/GST on freight at the national level (APIFreaks type "${type}", rate 0). ` +
        "A domestic US load carries no VAT — do not add one to an invoice. US freight exposure is " +
        "IFTA fuel tax, state sales tax on some services, and the federal excise, none of which are in this feed."
      : `National ${type.toUpperCase()} rate as published by APIFreaks. Effective date is not supplied by ` +
        "the provider, so it is not shown. Verify against the taxing authority before invoicing.",
    source: "apifreaks.com /v1.0/vat/rates/country",
  };
}

export const vatRates = new Hono();

/** Provider/integration status. */
vatRates.get("/status", (c) =>
  c.json({
    provider: "apifreaks",
    configured: Boolean(key()),
    endpoints: {
      country: `${AF_BASE}/country?country=XX`,
      ipAddress: `${AF_BASE}/ip-address`,
    },
    covers: "National VAT / GST / consumption-tax rate per country.",
    doesNotCover: [
      "US state or local sales tax",
      "US state diesel/IFTA fuel tax rates",
      "Canadian provincial PST/HST components",
      "Effective dates or rate history",
    ],
    fetchedAt: new Date().toISOString(),
  }),
);

/** POST /api/vat-rates  { lookup: "DE" | "United_States" | "CA" } */
vatRates.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const lookup = String(body?.lookup || "").trim();
  if (!lookup) return c.json({ error: "pass { lookup: <country code or name> }" }, 400);

  const r = await afFetch("/country", { country: lookup.replace(/\s+/g, "_") });
  if (!r.ok) return c.json({ error: "rate lookup failed", reason: r.reason, standard: null }, 502);
  if (!r.data.length) {
    return c.json(
      { error: "no rate published for that country", lookup, standard: null },
      404,
    );
  }
  return c.json({ ...shape(r.data[0], lookup), cached: r.cached, fetchedAt: new Date().toISOString() });
});

/** GET /api/vat-rates/auto-detect — APIFreaks resolves the caller's IP itself. */
vatRates.get("/auto-detect", async (c) => {
  const r = await afFetch("/ip-address", {});
  if (!r.ok) {
    return c.json(
      {
        error: "ip lookup failed",
        reason: r.reason,
        country: null,
        state: null,
        standard: null,
        detectMethod: "ip-geolocation",
      },
      502,
    );
  }
  const first = r.data[0] || {};
  const shaped = shape(first, first.country || "unknown");
  return c.json({
    ...shaped,
    /** APIFreaks resolves to country only. No state/province is returned, so this is null. */
    state: null,
    detectMethod: "ip-geolocation",
    caveat:
      "Detected from the server's outbound IP unless the provider reads the forwarded client IP. " +
      "For a driver crossing a border, pass the country explicitly instead of trusting this.",
    cached: r.cached,
  });
});

/** POST /api/vat-rates/calculate { price, origin, destination } */
vatRates.post("/calculate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const price = Number(body?.price);
  const origin = String(body?.origin || "").trim();
  const destination = String(body?.destination || "").trim();

  if (!Number.isFinite(price) || price < 0) {
    return c.json({ error: "pass a numeric { price }" }, 400);
  }
  if (!origin || !destination) {
    return c.json({ error: "pass { origin } and { destination } country identifiers" }, 400);
  }

  const [o, d] = await Promise.all([
    afFetch("/country", { country: origin.replace(/\s+/g, "_") }),
    afFetch("/country", { country: destination.replace(/\s+/g, "_") }),
  ]);
  if (!o.ok || !d.ok) {
    return c.json(
      {
        error: "rate lookup failed",
        reason: (!o.ok && o.reason) || (!d.ok && d.reason) || "unknown",
        base: price,
        totalTax: null,
        final: null,
      },
      502,
    );
  }

  const os = shape(o.data[0] || {}, origin);
  const ds = shape(d.data[0] || {}, destination);
  const originTax = os.standard === null ? null : Number((price * os.standard).toFixed(2));
  const destTax = ds.standard === null ? null : Number((price * ds.standard).toFixed(2));

  const domesticUS =
    os.taxType === "none" && ds.taxType === "none";

  return c.json({
    base: price,
    currency: os.currency,
    originTax,
    destTax,
    /**
     * Deliberately not originTax + destTax. Nobody charges both ends of a cross-border
     * move; which side is taxable depends on place-of-supply rules this API does not
     * publish. So the total is only stated when one side is zero-rated.
     */
    totalTax:
      originTax === null || destTax === null
        ? null
        : originTax === 0
          ? destTax
          : destTax === 0
            ? originTax
            : null,
    final: null,
    breakdown: [
      { leg: "origin", country: os.country, taxType: os.taxType, rate: os.standard, tax: originTax },
      { leg: "destination", country: ds.country, taxType: ds.taxType, rate: ds.standard, tax: destTax },
    ],
    verdict: null,
    notes: domesticUS
      ? "Both ends are US. There is no VAT on this load — bill the linehaul with no tax line. " +
        "Your actual tax exposure on this run is IFTA fuel tax, which this endpoint does not compute."
      : "Cross-border: only one jurisdiction normally taxes the supply, and place-of-supply rules " +
        "for freight are not published by this provider. totalTax and final are null unless one side " +
        "is zero-rated. Confirm with your accountant before you put a tax line on the invoice.",
    source: "apifreaks.com /v1.0/vat/rates/country",
    fetchedAt: new Date().toISOString(),
  });
});

/** POST /api/vat-rates/fuel-tax { state } */
vatRates.post("/fuel-tax", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const state = String(body?.state || "").trim().toUpperCase();

  return c.json({
    state: state || null,
    /** Not available. Not estimated. */
    diesel: null,
    gasoline: null,
    federal: FEDERAL_EXCISE_USD_PER_GAL,
    total: null,
    updated: null,
    available: false,
    reason:
      "No state fuel tax rates are wired. APIFreaks sells VAT/GST rates only — it has no US " +
      "state fuel tax product. IFTA publishes its rates as a quarterly PDF matrix with no public API. " +
      "These fields stay null rather than carry numbers you would file a return against.",
    whatWouldFixIt:
      "Either a paid IFTA/fuel-tax data licence, or a quarterly manual load of the IFTA rate matrix " +
      "into a table with the source quarter stamped on every row.",
    federalIsReal:
      "The federal figures above are statutory (26 U.S.C. 4081), not an estimate — but they are only " +
      "the federal slice, never the whole per-gallon tax.",
  });
});

/** POST /api/vat-rates/load-compliance { origin, destination, ... } */
vatRates.post("/load-compliance", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const origin = String(body?.origin || body?.originCountry || "").trim();
  const destination = String(body?.destination || body?.destCountry || "").trim();

  const jurisdictions: Array<Record<string, unknown>> = [];
  for (const [label, value] of [
    ["origin", origin],
    ["destination", destination],
  ] as const) {
    if (!value) continue;
    const r = await afFetch("/country", { country: value.replace(/\s+/g, "_") });
    if (r.ok && r.data.length) {
      const s = shape(r.data[0], value);
      jurisdictions.push({
        leg: label,
        country: s.country,
        taxType: s.taxType,
        standardRate: s.standard,
        standardPercent: s.standardPercent,
        currency: s.currency,
        source: s.source,
      });
    } else {
      jurisdictions.push({
        leg: label,
        country: value,
        taxType: null,
        standardRate: null,
        reason: !r.ok ? r.reason : "no rate published",
      });
    }
  }

  return c.json({
    /** Never true. This platform does not certify tax compliance. */
    compliant: null,
    jurisdictions,
    liability: null,
    reporting: null,
    deadlines: null,
    recs: null,
    reason:
      "TruckWithEase does not determine tax compliance and will not print a filing deadline. It is a " +
      "calculator and a record-keeper. What you get above is the published national rate for each " +
      "jurisdiction on the run — the verdict, the liability figure and the filing calendar are your " +
      "accountant's, and a wrong deadline here would cost you a penalty.",
    alsoMissing: [
      "IFTA quarterly fuel tax — the actual filing obligation for a US interstate carrier",
      "Heavy Vehicle Use Tax (Form 2290)",
      "State-level registration and apportioned plate obligations (IRP)",
    ],
    source: "apifreaks.com /v1.0/vat/rates/country",
    fetchedAt: new Date().toISOString(),
  });
});

/** POST /api/vat-rates/route-comparison { routes: [{ id?, origin, destination }] } */
vatRates.post("/route-comparison", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const routes = Array.isArray(body?.routes) ? body.routes.slice(0, 12) : [];
  if (!routes.length) {
    return c.json({ error: "pass { routes: [{ origin, destination }] }" }, 400);
  }

  const out: Array<Record<string, unknown>> = [];
  for (const [i, route] of routes.entries()) {
    const origin = String(route?.origin || "").trim();
    const destination = String(route?.destination || "").trim();
    const legs: Array<Record<string, unknown>> = [];
    let maxRate: number | null = null;

    for (const [label, value] of [
      ["origin", origin],
      ["destination", destination],
    ] as const) {
      if (!value) {
        legs.push({ leg: label, country: null, standardRate: null, reason: "not supplied" });
        continue;
      }
      const r = await afFetch("/country", { country: value.replace(/\s+/g, "_") });
      if (r.ok && r.data.length) {
        const s = shape(r.data[0], value);
        legs.push({ leg: label, country: s.country, taxType: s.taxType, standardRate: s.standard });
        if (s.standard !== null) maxRate = maxRate === null ? s.standard : Math.max(maxRate, s.standard);
      } else {
        legs.push({
          leg: label,
          country: value,
          standardRate: null,
          reason: !r.ok ? r.reason : "no rate published",
        });
      }
    }

    out.push({
      id: route?.id ?? `route-${i + 1}`,
      route: `${origin || "?"} -> ${destination || "?"}`,
      legs,
      highestPublishedRate: maxRate,
      /** No dollar burden: that needs a load value and place-of-supply rules we do not have. */
      taxBurden: null,
      fuelTax: null,
      compliance: null,
    });
  }

  const rated = out.filter((r) => typeof r.highestPublishedRate === "number");
  const sorted = [...rated].sort(
    (a, b) => (a.highestPublishedRate as number) - (b.highestPublishedRate as number),
  );

  return c.json({
    routes: out,
    lowestTax: sorted[0] ? { id: sorted[0].id, rate: sorted[0].highestPublishedRate } : null,
    highestTax: sorted.length
      ? { id: sorted[sorted.length - 1].id, rate: sorted[sorted.length - 1].highestPublishedRate }
      : null,
    /** Not computed. A savings number needs load value and fuel tax, neither of which is available. */
    potentialSavings: null,
    comparedOn: "highest published national VAT/GST rate on either end of the run",
    notes:
      "Fuel tax is null on every route because no US state fuel tax source is wired, and for a " +
      "domestic US run every rate here is 0 — so this comparison only tells you something on " +
      "cross-border work. It is not a routing recommendation.",
    fetchedAt: new Date().toISOString(),
  });
});

export default vatRates;
