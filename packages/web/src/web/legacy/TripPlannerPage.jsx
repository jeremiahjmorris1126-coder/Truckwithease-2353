/**
 * TripPlannerPage — rebuilt Aug 26, 2026.
 *
 * Removed fabricated content (original preserved at docs/launch/TripPlannerPage.ORIGINAL.jsx.txt):
 *  1. PRESET_ROUTES — five invented lanes with invented mileage, drive times, fuel costs,
 *     toll costs, load weights and rate-per-mile ("$3.10", "$2.85"…). Quoting a market rate
 *     the platform never read is the worst of these. Deleted; the planner now computes only
 *     from numbers the driver types in.
 *  2. DEFAULT_LEGS — three invented Dallas→Memphis legs with invented mileage, drive times,
 *     a named "Pilot TT — Exit 220", a weigh station "open", and "⚡ PrePass bypass active".
 *     There is no routing API enabled and no PrePass connection. Deleted.
 *  3. FUEL_STOPS / REST_AREAS — invented stations and rest areas with invented exits,
 *     per-gallon prices, amenities and space counts. Deleted. Live regional diesel price now
 *     comes from GET /api/fuel/stations, which reads U.S. EIA data.
 *  4. HOS_PLAN — a seven-row invented clock ("05:00 pre-trip", "08:14 break", "13:18 arrival")
 *     presented as a compliant plan. Replaced by the driver's real remaining clocks from
 *     GET /api/hos, compared against the drive hours the plan actually needs.
 *  5. STATE_ALERTS — invented per-state statements ("Spring weight ban lifted June 15",
 *     "I-40 EB right lane closed"). No state DOT feed exists. Deleted.
 *  6. CONSTRUCTION_ZONES — three invented work zones with invented mile markers, delay
 *     ranges, lane counts, speeds and detours. Deleted.
 *  7. ALTERNATE_ROUTES — two invented detours with invented savings ("Saves ~35 min",
 *     "Saves 22 mi") and turn-by-turn steps through real towns. Deleted.
 *  8. The Google Maps Directions embed iframe and the Street View still. Both were verified
 *     dead on Aug 26, 2026 — the Maps Embed API returns HTTP 403 for the current key, so the
 *     page was rendering a broken frame. Stated as not enabled instead of shown broken.
 *
 * Restyled from navy/orange/amber/green/red/purple on #F0F4FA to gold-on-black.
 * Everything on the page is either typed in by the driver or read from a named endpoint, and
 * each panel names its endpoint.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Route,
  Fuel,
  Clock,
  Calculator,
  AlertTriangle,
  RefreshCw,
  MapPinned,
  Receipt,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const WARN = "#c96a4c";
const DRIVER_ID = "drv-1";

const money = (n) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : "—");
const hoursFromSec = (s) => (Number.isFinite(s) ? s / 3600 : null);
const hm = (s) => {
  if (!Number.isFinite(s)) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

function Panel({ title, note, children, right }) {
  return (
    <section className="border border-[#222] bg-[#161616]">
      <header className="flex items-start justify-between gap-4 border-b border-[#222] px-5 py-4">
        <div>
          <h2 className="font-[Oswald] text-sm uppercase tracking-[0.22em] text-white">{title}</h2>
          {note && <p className="mt-1 font-[Inter] text-[11px] leading-snug text-[#666]">{note}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Missing({ label, reason }) {
  return (
    <div className="border border-dashed border-[#333] bg-[#0f0f0f] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={13} style={{ color: WARN }} />
        <span
          className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em]"
          style={{ color: WARN }}
        >
          Missing / Not tracked
        </span>
      </div>
      <p className="mt-2 font-[Oswald] text-xs uppercase tracking-[0.16em] text-white">{label}</p>
      <p className="mt-1 font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">{reason}</p>
    </div>
  );
}

const inputCls =
  "w-full border border-[#222] bg-[#0f0f0f] px-3 py-2 font-[JetBrains_Mono] text-sm text-white outline-none transition placeholder:text-[#666] focus:border-[#C9A84C]";

export default function TripPlannerPage() {
  // ── driver inputs (the only source of trip facts on this page) ───────────
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [miles, setMiles] = useState("");
  const [mpg, setMpg] = useState("6.5");
  const [fuelPrice, setFuelPrice] = useState("");
  const [ratePerMile, setRatePerMile] = useState("");
  const [avgSpeed, setAvgSpeed] = useState("55");

  // ── live EIA diesel price ────────────────────────────────────────────────
  const [dieselState, setDieselState] = useState("loading");
  const [diesel, setDiesel] = useState(null);
  const [dieselError, setDieselError] = useState("");
  const [stateCode, setStateCode] = useState("MO");

  const loadDiesel = useCallback((st) => {
    setDieselState("loading");
    setDieselError("");
    fetch(`/api/fuel/stations?state=${encodeURIComponent(st)}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => {
        setDiesel(j);
        setDieselState("ok");
        if (Number.isFinite(j?.avg)) {
          setFuelPrice((prev) => (prev === "" ? String(j.avg) : prev));
        }
      })
      .catch((e) => {
        setDieselError(String(e?.message || e));
        setDieselState("error");
      });
  }, []);

  useEffect(() => {
    loadDiesel(stateCode);
  }, [loadDiesel, stateCode]);

  // ── real HOS clocks ──────────────────────────────────────────────────────
  const [hosState, setHosState] = useState("loading");
  const [hos, setHos] = useState(null);
  const [hosError, setHosError] = useState("");

  const loadHos = useCallback(() => {
    setHosState("loading");
    setHosError("");
    fetch("/api/hos")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => {
        const row = (j.fleet || []).find((d) => d.driverId === DRIVER_ID) || (j.fleet || [])[0] || null;
        setHos(row);
        setHosState("ok");
      })
      .catch((e) => {
        setHosError(String(e?.message || e));
        setHosState("error");
      });
  }, []);

  useEffect(() => {
    loadHos();
  }, [loadHos]);

  // ── toll estimate from the API's reference rates ─────────────────────────
  const [roads, setRoads] = useState([]);
  const [roadId, setRoadId] = useState("");
  const [axles, setAxles] = useState("5");
  const [toll, setToll] = useState(null);
  const [tollError, setTollError] = useState("");
  const [tollBusy, setTollBusy] = useState(false);

  useEffect(() => {
    fetch("/api/tolls/roads")
      .then((r) => r.json())
      .then((j) => setRoads(j.roads || []))
      .catch(() => setRoads([]));
  }, []);

  const runToll = () => {
    if (!roadId) return;
    setTollBusy(true);
    setTollError("");
    setToll(null);
    fetch("/api/tolls/estimate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roadId, miles: Number(miles) || 0, axles: Number(axles) || 5 }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => setToll(j))
      .catch((e) => setTollError(String(e?.message || e)))
      .finally(() => setTollBusy(false));
  };

  // ── derived math — inputs only, nothing invented ─────────────────────────
  const m = Number(miles);
  const g = Number(mpg);
  const p = Number(fuelPrice);
  const rpm = Number(ratePerMile);
  const spd = Number(avgSpeed);

  const gallons = m > 0 && g > 0 ? m / g : null;
  const fuelCost = gallons != null && p > 0 ? gallons * p : null;
  const tollCost = toll && Number.isFinite(toll.gross) ? toll.gross : null;
  const driveHours = m > 0 && spd > 0 ? m / spd : null;
  const gross = m > 0 && rpm > 0 ? m * rpm : null;
  const costs = (fuelCost || 0) + (tollCost || 0);
  const net = gross != null ? gross - costs : null;
  const costPerMile = m > 0 && costs > 0 ? costs / m : null;

  const driveRemainingSec = hos?.clocks?.drivingRemaining;
  const windowRemainingSec = hos?.clocks?.onDutyWindowRemaining;
  const fitsDrive =
    driveHours != null && Number.isFinite(driveRemainingSec)
      ? driveHours <= hoursFromSec(driveRemainingSec)
      : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-[Inter] text-white">
      <header className="border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex w-fit items-center gap-2 border border-[#222] bg-[#0f0f0f] px-2.5 py-1">
            <Route size={12} style={{ color: GOLD }} />
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Cost &amp; hours planner
            </span>
          </div>
          <h1 className="mt-4 font-[Bebas_Neue] text-5xl leading-none tracking-wide">
            TRIP <span style={{ color: GOLD_BRIGHT }}>PLANNER</span>
          </h1>
          <p className="mt-3 max-w-2xl font-[Inter] text-sm leading-relaxed text-[#8a8a8a]">
            Enter the trip and this page computes the money and the hours. It does not route you:
            no mapping or directions API is enabled on this key, so mileage is yours to enter.
            Diesel price is live from the U.S. EIA, tolls come from the reference rate table in
            the API, and the hours check uses your real HOS clocks.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-6 py-8 lg:grid-cols-[1fr_1fr]">
        {/* ── inputs ─────────────────────────────────────────────────────── */}
        <Panel title="The trip" note="Every value here is typed in by you. Nothing is prefilled from a saved lane.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Origin">
              <input className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City, ST" />
            </Field>
            <Field label="Destination">
              <input className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} placeholder="City, ST" />
            </Field>
            <Field label="Miles">
              <input className={inputCls} value={miles} onChange={(e) => setMiles(e.target.value)} placeholder="e.g. 466" inputMode="decimal" />
            </Field>
            <Field label="Avg speed (mph)">
              <input className={inputCls} value={avgSpeed} onChange={(e) => setAvgSpeed(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Truck MPG">
              <input className={inputCls} value={mpg} onChange={(e) => setMpg(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Diesel $/gal">
              <input className={inputCls} value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Your rate $/mile">
              <input className={inputCls} value={ratePerMile} onChange={(e) => setRatePerMile(e.target.value)} placeholder="from your rate con" inputMode="decimal" />
            </Field>
            <Field label="Axles (for tolls)">
              <input className={inputCls} value={axles} onChange={(e) => setAxles(e.target.value)} inputMode="numeric" />
            </Field>
          </div>
          <p className="mt-4 font-[Inter] text-[11px] leading-relaxed text-[#666]">
            Rate per mile must come off your own rate confirmation. TruckWithEase does not
            subscribe to a rate index and will never suggest a market rate.
          </p>
        </Panel>

        {/* ── money ──────────────────────────────────────────────────────── */}
        <Panel title="Money" note="Computed from your inputs plus the toll estimate below. No stored lane costs.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Gallons burned", gallons != null ? gallons.toFixed(1) : "—"],
              ["Fuel cost", money(fuelCost)],
              ["Toll (from estimate)", money(tollCost)],
              ["Total trip cost", costs > 0 ? money(costs) : "—"],
              ["Gross (miles × your rate)", money(gross)],
              ["Net after fuel + toll", money(net)],
              ["Cost per mile", costPerMile != null ? `$${costPerMile.toFixed(3)}` : "—"],
              ["Drive time at avg speed", driveHours != null ? `${driveHours.toFixed(1)} h` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2.5">
                <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">{k}</div>
                <div className="mt-1 font-[JetBrains_Mono] text-lg" style={{ color: GOLD_BRIGHT }}>{v}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-[Inter] text-[11px] leading-relaxed text-[#666]">
            A dash means an input is missing. The page will not fill a gap with an assumption —
            no default mileage, no default rate, no "typical" lane cost.
          </p>
        </Panel>

        {/* ── diesel ─────────────────────────────────────────────────────── */}
        <Panel
          title="Diesel price"
          note="Source: GET /api/fuel/stations — U.S. Energy Information Administration regional data"
          right={
            <button
              onClick={() => loadDiesel(stateCode)}
              className="flex items-center gap-1.5 border border-[#222] bg-[#0f0f0f] px-3 py-1.5 font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a] transition hover:border-[#C9A84C] hover:text-white"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          }
        >
          <div className="mb-4 flex items-end gap-3">
            <Field label="State">
              <input
                className={inputCls}
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="MO"
              />
            </Field>
          </div>

          {dieselState === "loading" && (
            <p className="font-[JetBrains_Mono] text-xs text-[#666]">Loading EIA data…</p>
          )}
          {dieselState === "error" && (
            <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>
              Failed: {dieselError}
            </p>
          )}
          {dieselState === "ok" && diesel && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Regional avg", Number.isFinite(diesel.avg) ? `$${diesel.avg.toFixed(2)}` : "—"],
                  ["Region", diesel.region || "—"],
                  ["Period", diesel.period || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2">
                    <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">{k}</div>
                    <div className="mt-1 font-[JetBrains_Mono] text-sm text-white">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="border px-2 py-0.5 font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.16em]"
                  style={
                    diesel.live
                      ? { borderColor: GOLD, color: GOLD_BRIGHT }
                      : { borderColor: WARN, color: WARN }
                  }
                >
                  {diesel.live ? "Live · EIA" : "Estimate · EIA unreachable"}
                </span>
                <span className="font-[Inter] text-[11px] text-[#666]">
                  source: {diesel.source || "—"}
                </span>
              </div>
              <p className="mt-3 font-[Inter] text-[11px] leading-relaxed text-[#666]">
                This is a regional average, not a price at a specific pump. Per-station pump prices
                are not licensed on this platform.
              </p>
            </>
          )}
        </Panel>

        {/* ── tolls ──────────────────────────────────────────────────────── */}
        <Panel
          title="Toll estimate"
          note="Source: GET /api/tolls/roads and POST /api/tolls/estimate — a static reference rate table in the API, not a live toll-authority feed"
        >
          <div className="grid gap-3 sm:grid-cols-[2fr_auto]">
            <Field label="Toll road">
              <select className={inputCls} value={roadId} onChange={(e) => setRoadId(e.target.value)}>
                <option value="">Select a road…</option>
                {roads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — ${Number(r.perMile).toFixed(2)}/mi
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <button
                onClick={runToll}
                disabled={!roadId || !(Number(miles) > 0) || tollBusy}
                className="flex items-center gap-2 border px-4 py-2 font-[Oswald] text-xs uppercase tracking-[0.18em] transition disabled:opacity-40"
                style={{ borderColor: GOLD, color: GOLD_BRIGHT }}
              >
                <Calculator size={13} /> {tollBusy ? "Working…" : "Estimate"}
              </button>
            </div>
          </div>

          {tollError && (
            <p className="mt-3 font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>
              {tollError}
            </p>
          )}

          {toll && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Gross toll", money(toll.gross)],
                ["Miles used", String(toll.miles ?? miles)],
                ["Axles", String(toll.axles ?? axles)],
              ].map(([k, v]) => (
                <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2">
                  <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">{k}</div>
                  <div className="mt-1 font-[JetBrains_Mono] text-sm text-white">{v}</div>
                </div>
              ))}
            </div>
          )}

          {!roadId && !toll && (
            <p className="mt-4 font-[Inter] text-[11px] leading-relaxed text-[#666]">
              Assumes the whole trip runs on the selected road. For a mixed route, estimate each
              tolled segment separately on the <a href="/tolls" className="underline hover:text-white">Tolls page</a>.
            </p>
          )}
        </Panel>

        {/* ── hours ──────────────────────────────────────────────────────── */}
        <Panel
          title="Hours check"
          note={`Source: GET /api/hos — real clocks for ${DRIVER_ID}`}
          right={
            <button
              onClick={loadHos}
              className="flex items-center gap-1.5 border border-[#222] bg-[#0f0f0f] px-3 py-1.5 font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a] transition hover:border-[#C9A84C] hover:text-white"
            >
              <RefreshCw size={11} /> Reload
            </button>
          }
        >
          {hosState === "loading" && (
            <p className="font-[JetBrains_Mono] text-xs text-[#666]">Loading clocks…</p>
          )}
          {hosState === "error" && (
            <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>
              Failed: {hosError}
            </p>
          )}
          {hosState === "ok" && !hos && (
            <Missing
              label="HOS clocks for this driver"
              reason="GET /api/hos returned no row for this driver, so there is nothing to compare the plan against."
            />
          )}
          {hosState === "ok" && hos && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Driver", `${hos.name || hos.driverId}${hos.truckNumber ? ` · ${hos.truckNumber}` : ""}`],
                  ["Duty status", String(hos.status || "—")],
                  ["Driving remaining", hm(driveRemainingSec)],
                  ["14-hr window remaining", hm(windowRemainingSec)],
                ].map(([k, v]) => (
                  <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2">
                    <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">{k}</div>
                    <div className="mt-1 font-[JetBrains_Mono] text-sm text-white">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border border-[#222] bg-[#0f0f0f] p-4">
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: GOLD }} />
                  <span className="font-[Oswald] text-xs uppercase tracking-[0.18em] text-white">
                    Does this trip fit today?
                  </span>
                </div>
                {driveHours == null ? (
                  <p className="mt-2 font-[Inter] text-[11px] text-[#8a8a8a]">
                    Enter miles and an average speed and this compares the drive time against your
                    remaining driving clock.
                  </p>
                ) : fitsDrive == null ? (
                  <p className="mt-2 font-[Inter] text-[11px] text-[#8a8a8a]">
                    No remaining-driving value came back from the API, so this cannot be answered.
                  </p>
                ) : (
                  <p
                    className="mt-2 font-[JetBrains_Mono] text-sm"
                    style={{ color: fitsDrive ? GOLD_BRIGHT : WARN }}
                  >
                    {driveHours.toFixed(1)} h of driving vs {hm(driveRemainingSec)} remaining —{" "}
                    {fitsDrive ? "fits in today's driving clock" : "does NOT fit; you will need a reset or a relay"}
                  </p>
                )}
                <p className="mt-2 font-[Inter] text-[11px] leading-relaxed text-[#666]">
                  Straight clock arithmetic only. It does not account for the 30-minute break,
                  loading and unloading time, fuel stops, traffic, or a split sleeper — and
                  TruckWithEase is not a registered ELD. Your ELD record is the record.
                </p>
              </div>

              {Array.isArray(hos.violations) && hos.violations.length > 0 && (
                <div className="mt-4 space-y-2">
                  {hos.violations.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 border px-3 py-2"
                      style={{ borderColor: WARN }}
                    >
                      <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: WARN }} />
                      <div>
                        <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em]" style={{ color: WARN }}>
                          {v.level}
                        </div>
                        <div className="font-[Inter] text-[11px] text-[#8a8a8a]">{v.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>

        {/* ── what isn't here ───────────────────────────────────────────── */}
        <Panel title="Not on this page" note="Named honestly instead of filled with examples.">
          <div className="space-y-3">
            <Missing
              label="Routing, mileage, legs, turn-by-turn, map"
              reason="No mapping API is enabled for this key. Verified Aug 26, 2026: the Google Maps Embed API returns HTTP 403, and the Places API returns API_KEY_SERVICE_BLOCKED. The old page rendered a Directions iframe and a Street View still that were both broken, plus three invented legs. Enter your mileage from your own routing tool."
            />
            <Missing
              label="Fuel stops and rest areas along the route"
              reason="No truck-stop or rest-area location licence exists on this platform. The old page named specific Pilot and Love's locations with exits and pump prices that were invented."
            />
            <Missing
              label="Construction zones, lane closures, work-zone delays"
              reason="No state DOT work-zone feed is connected. The old page listed three zones with invented mile markers, delay ranges and detours."
            />
            <Missing
              label="Per-state weight limits and seasonal restrictions"
              reason="No state permitting or weight-restriction feed is connected. Check the state's DOT permit office. Federal limits are on the Load Chief weight guidance, which cites FHWA."
            />
            <Missing
              label="Weigh-station status and bypass"
              reason="There is no PrePass or Drivewyze contract or API connection. The old page displayed 'PrePass bypass active' on a leg."
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { href: "/tolls", label: "Tolls", icon: Receipt },
              { href: "/fuel-finder", label: "Fuel finder", icon: Fuel },
              { href: "/weather", label: "Weather (NWS)", icon: MapPinned },
            ].map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 border border-[#222] bg-[#0f0f0f] px-3 py-2 font-[Oswald] text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a] transition hover:border-[#C9A84C] hover:text-white"
                >
                  <Icon size={12} style={{ color: GOLD }} /> {l.label}
                </a>
              );
            })}
          </div>
        </Panel>
      </main>

      <footer className="border-t border-[#222] px-6 py-6">
        <div className="mx-auto max-w-6xl font-[Inter] text-[11px] leading-relaxed text-[#666]">
          Estimates only. Fuel and toll figures are computed from the inputs above and the EIA
          regional average; actual pump prices, toll rates and drive times will differ.{" "}
          <a href="/" className="underline hover:text-white">
            Back to dashboard
          </a>
        </div>
      </footer>
    </div>
  );
}
