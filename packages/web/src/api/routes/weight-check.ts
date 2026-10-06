/**
 * /api/weight-check — federal truck weight limits and the Federal Bridge Formula,
 * computed server-side from the citation. No database, no credential, no per-state
 * table. Pure arithmetic over numbers the caller supplies.
 *
 * WHY THIS ROUTER EXISTS
 *   The capability was declared with endpoints:[] and tables:[], so the function
 *   index correctly reported it "not_built" — the math lived only in the browser
 *   and there was nothing server-side to measure. This gives it one honest server
 *   endpoint so web and mobile compute the SAME result from the SAME citation,
 *   and so a result can be tied to the statute it came from.
 *
 * THE LAW, VERBATIM WHERE IT MATTERS
 *   23 U.S.C. 127 and 23 CFR 658.17, Interstate System:
 *     - Single axle:        20,000 lb
 *     - Tandem axle:        34,000 lb
 *     - Gross vehicle:      80,000 lb
 *     - Bridge Formula:     W = 500 x ( L*N/(N-1) + 12N + 36 )
 *         W = max weight in lb on any group of 2+ consecutive axles
 *         L = distance in feet between the extremes of the group (outer axles)
 *         N = number of axles in the group
 *       The statutory result is rounded to the NEAREST 500 lb (with an exact
 *       half-increment tie resolved DOWNWARD, per FHWA policy), and no group
 *       may exceed 80,000 lb regardless of what the formula yields.
 *
 * WHAT THIS IS NOT
 *   - It is NOT a per-state limit service. Each state's non-Interstate limits,
 *     grandfather rights and permit thresholds need their own verified statute
 *     citation, so none are invented here. Interstate System only.
 *   - It is NOT a permit. Exceeding a limit here means "you need a permit or you
 *     are illegal", not "here is your permit".
 *   - It does NOT know your actual scaled weights. It checks the numbers you give
 *     it against the federal limits; a CAT scale ticket is the real measurement.
 *   - Advisory only under 23 U.S.C. 409.
 */
import { Hono } from "hono";

/* -------------------------------------------------------------------------
 * FEDERAL LIMITS — the constants, straight from the citation.
 * ------------------------------------------------------------------------- */
export const FEDERAL_LIMITS = {
  singleAxleLb: 20000,
  tandemAxleLb: 34000,
  grossVehicleLb: 80000,
  citation: "23 U.S.C. 127; 23 CFR 658.17",
  system: "Interstate System",
} as const;

/**
 * Bridge Formula rounds to the NEAREST 500 lb (23 CFR 658.17 / FHWA "Bridge
 * Formula Weights": "W ... to the nearest 500 pounds"). FHWA policy resolves an
 * exact half-increment tie (e.g. 79,750 -> 159.5) DOWNWARD, so we cannot use
 * Math.round, which rounds .5 up. Math.ceil(x - 0.5) rounds half-down.
 */
function roundNearest500(lb: number): number {
  return Math.ceil(lb / 500 - 0.5) * 500;
}

/**
 * bridgeFormula — W = 500 x ( L*N/(N-1) + 12N + 36 ), capped at the 80,000 gross.
 * Returns both the raw and the statutory (rounded-to-nearest-500, capped) figure
 * so the caller can see the rounding rather than take it on faith.
 */
export function bridgeFormula(lengthFt: number, axles: number) {
  if (!Number.isFinite(lengthFt) || !Number.isFinite(axles)) {
    return { error: "lengthFt and axles must both be numbers." as const };
  }
  const N = Math.round(axles);
  if (N < 2) {
    return {
      error: "The Bridge Formula applies to a group of 2 or more axles. A single axle uses the flat 20,000 lb limit." as const,
    };
  }
  if (lengthFt < 0) return { error: "lengthFt cannot be negative." as const };

  const raw = 500 * ((lengthFt * N) / (N - 1) + 12 * N + 36);
  const rounded = roundNearest500(raw);
  const capped = Math.min(rounded, FEDERAL_LIMITS.grossVehicleLb);

  return {
    lengthFt,
    axles: N,
    formula: "W = 500 x ( L*N/(N-1) + 12N + 36 )",
    rawLb: Math.round(raw),
    statutoryMaxLb: capped,
    roundedToNearest500: rounded !== Math.round(raw),
    cappedAtGross: rounded > FEDERAL_LIMITS.grossVehicleLb,
    citation: FEDERAL_LIMITS.citation,
  };
}

type AxleGroupCheck = { label?: string; lengthFt: number; axles: number; weightLb: number };

export const weightCheck = new Hono()

  /** GET /api/weight-check — the federal limits, the formula, and a worked example. */
  .get("/", (c) => {
    // A worked example so the response is self-documenting: classic 5-axle tractor
    // semitrailer, 51 ft between the steer and the rear tandem.
    const example = bridgeFormula(51, 5);
    return c.json({
      what: "Federal Interstate truck weight limits and the Federal Bridge Formula, computed from the citation.",
      limits: FEDERAL_LIMITS,
      bridgeFormula: {
        expression: "W = 500 x ( L*N/(N-1) + 12N + 36 )",
        variables: {
          W: "maximum weight in lb on the axle group",
          L: "distance in feet between the extreme (outer) axles of the group",
          N: "number of axles in the group",
        },
        rounding: "Result is rounded to the nearest 500 lb (an exact half-increment tie is resolved downward) and may never exceed the 80,000 lb gross.",
        citation: FEDERAL_LIMITS.citation,
      },
      workedExample: {
        description: "5-axle tractor-semitrailer, 51 ft between outer axles.",
        result: example,
      },
      endpoints: {
        "POST /api/weight-check/bridge-formula": "Body { lengthFt, axles } -> max weight for one axle group.",
        "POST /api/weight-check/check": "Body { grossLb, singleAxlesLb[], tandemsLb[], outerBridge? } -> pass/fail per federal limit.",
      },
      limitsOfThisTool: [
        "Interstate System only. No per-state, grandfather or permit-threshold table is included, because each would need its own verified statute citation.",
        "This is not a permit and does not weigh your truck. It checks numbers you supply against the federal limits.",
        "Advisory only under 23 U.S.C. 409.",
      ],
    });
  })

  /** POST /api/weight-check/bridge-formula — one axle group. */
  .post("/bridge-formula", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const lengthFt = Number(body.lengthFt);
    const axles = Number(body.axles);
    const result = bridgeFormula(lengthFt, axles);
    if ("error" in result) return c.json({ ok: false, ...result }, 400);
    return c.json({ ok: true, ...result });
  })

  /**
   * POST /api/weight-check/check — check a full configuration against the three
   * federal limits. Every input is a number the caller supplies; nothing is
   * measured or assumed. Returns a pass/fail per limit with the amount over.
   */
  .post("/check", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const grossLb = Number(body.grossLb);
    const singleAxlesLb = Array.isArray(body.singleAxlesLb) ? body.singleAxlesLb.map(Number) : [];
    const tandemsLb = Array.isArray(body.tandemsLb) ? body.tandemsLb.map(Number) : [];
    const outer = body.outerBridge as { lengthFt?: number; axles?: number } | undefined;

    if (!Number.isFinite(grossLb)) {
      return c.json({ ok: false, error: "grossLb (total scaled weight in lb) is required." }, 400);
    }

    const checks: Array<{ limit: string; citation: string; valueLb: number; maxLb: number; pass: boolean; overByLb: number }> = [];

    checks.push({
      limit: "Gross vehicle weight",
      citation: FEDERAL_LIMITS.citation,
      valueLb: grossLb,
      maxLb: FEDERAL_LIMITS.grossVehicleLb,
      pass: grossLb <= FEDERAL_LIMITS.grossVehicleLb,
      overByLb: Math.max(0, grossLb - FEDERAL_LIMITS.grossVehicleLb),
    });

    singleAxlesLb.forEach((w, i) => {
      if (!Number.isFinite(w)) return;
      checks.push({
        limit: `Single axle #${i + 1}`,
        citation: FEDERAL_LIMITS.citation,
        valueLb: w,
        maxLb: FEDERAL_LIMITS.singleAxleLb,
        pass: w <= FEDERAL_LIMITS.singleAxleLb,
        overByLb: Math.max(0, w - FEDERAL_LIMITS.singleAxleLb),
      });
    });

    tandemsLb.forEach((w, i) => {
      if (!Number.isFinite(w)) return;
      checks.push({
        limit: `Tandem axle group #${i + 1}`,
        citation: FEDERAL_LIMITS.citation,
        valueLb: w,
        maxLb: FEDERAL_LIMITS.tandemAxleLb,
        pass: w <= FEDERAL_LIMITS.tandemAxleLb,
        overByLb: Math.max(0, w - FEDERAL_LIMITS.tandemAxleLb),
      });
    });

    let outerBridge: ReturnType<typeof bridgeFormula> | null = null;
    if (outer && Number.isFinite(Number(outer.lengthFt)) && Number.isFinite(Number(outer.axles))) {
      outerBridge = bridgeFormula(Number(outer.lengthFt), Number(outer.axles));
      if (!("error" in outerBridge)) {
        checks.push({
          limit: `Bridge Formula, outer group (${outerBridge.axles} axles over ${outerBridge.lengthFt} ft)`,
          citation: FEDERAL_LIMITS.citation,
          valueLb: grossLb,
          maxLb: outerBridge.statutoryMaxLb,
          pass: grossLb <= outerBridge.statutoryMaxLb,
          overByLb: Math.max(0, grossLb - outerBridge.statutoryMaxLb),
        });
      }
    }

    const failed = checks.filter((x) => !x.pass);
    return c.json({
      ok: true,
      legalOnInterstate: failed.length === 0,
      checks,
      failed,
      outerBridge,
      system: FEDERAL_LIMITS.system,
      note:
        failed.length === 0
          ? "Every supplied value is at or under its federal Interstate limit. This is not a permit and does not account for state-specific or posted-bridge limits."
          : "At least one value exceeds its federal Interstate limit. A permit may be required, or the load must be redistributed or reduced. State limits may be stricter.",
      disclaimer: "Advisory only under 23 U.S.C. 409. A CAT scale ticket is the real measurement; these are the numbers you entered.",
    });
  });

export default weightCheck;
