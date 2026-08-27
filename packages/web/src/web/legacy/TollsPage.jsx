/**
 * TollsPage — rebuilt Aug 26, 2026.
 *
 * Removed fabricated content (original preserved at docs/launch/TollsPage.ORIGINAL.jsx.txt):
 *  1. TOLL_ALERTS — five invented "LIVE" toll alerts with fake ages ("8 min ago",
 *     "22 min ago") and invented facts (a "15% toll surcharge", an "Aug 1 12% rate
 *     adjustment", a lane closure). No toll-authority alert feed exists. Deleted,
 *     along with the auto-advancing "🔴 LIVE" ticker that presented them as real.
 *  2. ROUTES — four invented city-pair comparisons with made-up toll costs, miles
 *     and drive times. Replaced with a comparison that calls POST /api/tolls/compare
 *     with the numbers the user enters.
 *  3. TOLL_HISTORY — five invented toll transactions with dates, amounts and
 *     payment methods. Replaced with the real expense log at /api/tolls/expenses/:driverId.
 *  4. PrePass claims — "18% average discount", "Works on 95% of toll roads in the US",
 *     "Every bypass earns Rig Bucks automatically", "TruckWithEase integrates PrePass".
 *     There is no PrePass contract or API connection. The page now states that plainly.
 *  5. The $0.12/toll-mile blanket calculator — replaced by the per-road reference
 *     rates the API actually returns.
 *
 * Restyled from navy/orange/amber/green/red on #F8FAFC to gold-on-black.
 * Honest labelling: the per-road rates are a static reference table in the API, not a
 * live toll-authority feed, and the page says so.
 */

import { useState, useEffect, useCallback } from "react";
import { Route, Calculator, Receipt, Radio, RefreshCw, AlertTriangle, Plus } from "lucide-react";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const WARN = "#c96a4c";
const DRIVER_ID = "drv-1";

const money = (n) => (typeof n === "number" ? `$${n.toFixed(2)}` : "—");

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
      <span className="mb-1 block font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-[#222] bg-[#0f0f0f] px-3 py-2 font-[JetBrains_Mono] text-sm text-white outline-none transition placeholder:text-[#666] focus:border-[#C9A84C]";

export default function TollsPage() {
  const [roads, setRoads] = useState([]);
  const [roadsState, setRoadsState] = useState("loading");
  const [roadsError, setRoadsError] = useState("");

  const [roadId, setRoadId] = useState("");
  const [miles, setMiles] = useState(200);
  const [axles, setAxles] = useState(5);
  const [estimate, setEstimate] = useState(null);
  const [compare, setCompare] = useState(null);
  const [detourMiles, setDetourMiles] = useState("");
  const [busy, setBusy] = useState("");
  const [calcError, setCalcError] = useState("");

  const [expenses, setExpenses] = useState(null);
  const [expError, setExpError] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const [transponder, setTransponder] = useState(null);
  const [tier, setTier] = useState("pro");

  const loadRoads = useCallback(async () => {
    setRoadsState("loading");
    try {
      const r = await fetch("/api/tolls/roads");
      if (!r.ok) throw new Error(`GET /api/tolls/roads returned ${r.status}`);
      const j = await r.json();
      const list = Array.isArray(j.roads) ? j.roads : [];
      setRoads(list);
      if (list.length && !roadId) setRoadId(list[0].id);
      setRoadsState("ok");
    } catch (e) {
      setRoadsError(String(e.message || e));
      setRoadsState("error");
    }
  }, [roadId]);

  const loadExpenses = useCallback(async () => {
    try {
      const r = await fetch(`/api/tolls/expenses/${DRIVER_ID}`);
      if (!r.ok) throw new Error(`GET /api/tolls/expenses returned ${r.status}`);
      setExpenses(await r.json());
      setExpError("");
    } catch (e) {
      setExpError(String(e.message || e));
    }
  }, []);

  const loadTransponder = useCallback(async (t) => {
    try {
      const r = await fetch(`/api/tolls/transponder/${DRIVER_ID}?tier=${t}`);
      if (!r.ok) throw new Error(`GET /api/tolls/transponder returned ${r.status}`);
      setTransponder(await r.json());
    } catch (e) {
      setTransponder({ error: String(e.message || e) });
    }
  }, []);

  useEffect(() => { loadRoads(); loadExpenses(); }, [loadRoads, loadExpenses]);
  useEffect(() => { loadTransponder(tier); }, [tier, loadTransponder]);

  const road = roads.find((r) => r.id === roadId) || null;

  const runEstimate = async () => {
    setBusy("estimate");
    setCalcError("");
    try {
      const r = await fetch("/api/tolls/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roadId, miles: Number(miles), axles: Number(axles) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `POST /api/tolls/estimate returned ${r.status}`);
      setEstimate(j);
    } catch (e) {
      setEstimate(null);
      setCalcError(String(e.message || e));
    } finally {
      setBusy("");
    }
  };

  const runCompare = async () => {
    setBusy("compare");
    setCalcError("");
    try {
      const body = { roadId, miles: Number(miles) };
      if (detourMiles !== "") body.detourMiles = Number(detourMiles);
      const r = await fetch("/api/tolls/compare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `POST /api/tolls/compare returned ${r.status}`);
      setCompare(j);
    } catch (e) {
      setCompare(null);
      setCalcError(String(e.message || e));
    } finally {
      setBusy("");
    }
  };

  const logExpense = async () => {
    const amount = Number(newAmount);
    if (!road || !amount) return;
    setBusy("expense");
    try {
      const r = await fetch(`/api/tolls/expenses/${DRIVER_ID}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ road: road.name, state: road.state, amount }),
      });
      if (!r.ok) throw new Error(`POST /api/tolls/expenses returned ${r.status}`);
      setNewAmount("");
      await loadExpenses();
    } catch (e) {
      setExpError(String(e.message || e));
    } finally {
      setBusy("");
    }
  };

  const activate = async () => {
    setBusy("transponder");
    try {
      const r = await fetch(`/api/tolls/transponder/${DRIVER_ID}/activate`, { method: "POST" });
      if (!r.ok) throw new Error(`activate returned ${r.status}`);
      await loadTransponder(tier);
    } catch (e) {
      setTransponder({ error: String(e.message || e) });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-3 inline-flex items-center gap-2 border border-[#C9A84C]/40 px-2 py-1">
            <Route size={13} style={{ color: GOLD }} />
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.28em]" style={{ color: GOLD }}>
              Toll Suite
            </span>
          </div>
          <h1 className="font-[Bebas_Neue] text-5xl leading-none tracking-wide md:text-6xl">
            TOLL <span style={{ color: GOLD_BRIGHT }}>COST CONTROL</span>
          </h1>
          <p className="mt-3 max-w-3xl font-[Inter] text-sm leading-relaxed text-[#8a8a8a]">
            Reference toll rates for 5-axle rigs, a real server-side estimator, toll-versus-free route math and
            a per-driver toll expense log. Every figure here is calculated by the API from the numbers you enter —
            there are no sample routes and no sample transactions.
          </p>
          <div className="mt-5 flex items-start gap-2 border border-[#222] bg-[#111] px-4 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
            <p className="font-[Inter] text-xs leading-relaxed text-[#8a8a8a]">
              <span className="text-white">Rate source:</span> a static reference table of per-mile rates maintained
              in the API. It is <span className="text-white">not</span> a live toll-authority feed, so plaza-level
              pricing, surcharges and lane closures are not reflected. Confirm the final amount with the toll authority.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-10">
        {/* RATE TABLE */}
        <Panel
          title="Per-mile reference rates"
          note="GET /api/tolls/roads — 5-axle baseline. Rates scale by axle count in the estimator."
          right={
            <button
              onClick={loadRoads}
              className="flex items-center gap-2 border border-[#C9A84C]/50 px-3 py-1.5 font-[Oswald] text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
            >
              <RefreshCw size={12} /> Reload
            </button>
          }
        >
          {roadsState === "loading" && <p className="font-[JetBrains_Mono] text-xs text-[#666]">Loading rates…</p>}
          {roadsState === "error" && (
            <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>{roadsError}</p>
          )}
          {roadsState === "ok" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {roads.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoadId(r.id)}
                  className={`flex items-center justify-between border px-3 py-3 text-left transition ${
                    roadId === r.id ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#222] bg-[#0f0f0f] hover:border-[#C9A84C]/50"
                  }`}
                >
                  <span>
                    <span className="block font-[Oswald] text-[13px] uppercase tracking-wide text-white">{r.name}</span>
                    <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">{r.state}</span>
                  </span>
                  <span className="font-[JetBrains_Mono] text-sm" style={{ color: GOLD_BRIGHT }}>
                    ${r.perMile.toFixed(2)}/mi
                  </span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* ESTIMATOR + COMPARISON */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Toll estimator"
            note="POST /api/tolls/estimate — the server does the math; nothing is precomputed."
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Toll road">
                <select className={inputCls} value={roadId} onChange={(e) => setRoadId(e.target.value)}>
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Axles">
                <input className={inputCls} type="number" min={2} max={9} value={axles} onChange={(e) => setAxles(e.target.value)} />
              </Field>
              <Field label="Toll miles">
                <input className={inputCls} type="number" min={1} value={miles} onChange={(e) => setMiles(e.target.value)} />
              </Field>
              <div className="flex items-end">
                <button
                  onClick={runEstimate}
                  disabled={busy === "estimate" || !roadId}
                  className="flex w-full items-center justify-center gap-2 bg-[#C9A84C] py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] text-black disabled:opacity-40"
                >
                  <Calculator size={14} /> {busy === "estimate" ? "Working" : "Estimate"}
                </button>
              </div>
            </div>

            {estimate && (
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#222] pt-4">
                {[
                  ["Gross toll", money(estimate.gross)],
                  ["With transponder", money(estimate.withPrePass)],
                  ["Difference", money(estimate.saved)],
                ].map(([k, v]) => (
                  <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2">
                    <p className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.16em] text-[#666]">{k}</p>
                    <p className="font-[Bebas_Neue] text-2xl" style={{ color: GOLD_BRIGHT }}>{v}</p>
                  </div>
                ))}
                <p className="col-span-3 font-[Inter] text-[11px] leading-snug text-[#666]">
                  The transponder column applies the discount rate held in the API. It is an estimate of what a
                  transponder programme would charge, not a quoted price from any provider.
                </p>
              </div>
            )}
            {calcError && (
              <p className="mt-3 font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>{calcError}</p>
            )}
          </Panel>

          <Panel
            title="Toll route vs free route"
            note="POST /api/tolls/compare — compares the toll charge against the extra fuel and time of a detour."
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Toll miles">
                <input className={inputCls} type="number" min={1} value={miles} onChange={(e) => setMiles(e.target.value)} />
              </Field>
              <Field label="Detour miles (optional)">
                <input
                  className={inputCls}
                  type="number"
                  placeholder="leave blank for +15%"
                  value={detourMiles}
                  onChange={(e) => setDetourMiles(e.target.value)}
                />
              </Field>
            </div>
            <button
              onClick={runCompare}
              disabled={busy === "compare" || !roadId}
              className="mt-3 flex w-full items-center justify-center gap-2 border border-[#C9A84C]/50 py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10 disabled:opacity-40"
            >
              <Route size={14} /> {busy === "compare" ? "Working" : "Compare routes"}
            </button>

            {compare && (
              <div className="mt-4 space-y-2 border-t border-[#222] pt-4">
                {[
                  ["Toll route", compare.tollRoute],
                  ["Free route", compare.freeRoute],
                ].map(([label, r]) => (
                  <div key={label} className="flex items-center justify-between border border-[#222] bg-[#0f0f0f] px-3 py-2">
                    <span className="font-[Oswald] text-[12px] uppercase tracking-wider text-white">{label}</span>
                    <span className="font-[JetBrains_Mono] text-xs text-[#8a8a8a]">
                      {r.miles} mi · <span style={{ color: GOLD_BRIGHT }}>{money(r.cost)}</span> · +{r.addedMin} min
                    </span>
                  </div>
                ))}
                <p className="font-[Inter] text-xs text-[#8a8a8a]">
                  Server recommendation: <span className="font-[Oswald] uppercase tracking-wider" style={{ color: GOLD_BRIGHT }}>{compare.recommendation}</span>
                  {" "}· net difference {money(compare.netSaved)}
                </p>
                <p className="font-[Inter] text-[11px] text-[#666]">
                  Free-route cost is extra diesel only, at the fuel price and MPG assumed in the API. It excludes
                  wear, driver hours and any weight or height restriction on the detour.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* EXPENSES + TRANSPONDER */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title={`Toll expense log — ${DRIVER_ID}`}
            note="GET/POST /api/tolls/expenses/:driverId. Held in API memory for now, so entries clear on server restart — no fabricated history is shown."
          >
            <div className="mb-4 flex gap-2">
              <input
                className={inputCls}
                type="number"
                step="0.01"
                placeholder="Amount paid"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
              <button
                onClick={logExpense}
                disabled={busy === "expense" || !newAmount || !road}
                className="flex items-center gap-2 bg-[#C9A84C] px-4 font-[Oswald] text-xs uppercase tracking-[0.2em] text-black disabled:opacity-40"
              >
                <Plus size={14} /> Log
              </button>
            </div>
            <p className="mb-3 font-[JetBrains_Mono] text-[10px] text-[#666]">
              Logs against: {road ? `${road.name} (${road.state})` : "select a road above"}
            </p>

            {expError && <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>{expError}</p>}

            {expenses && expenses.expenses?.length === 0 && (
              <div className="border border-[#222] bg-[#0f0f0f] px-4 py-6 text-center">
                <p className="font-[Oswald] text-sm uppercase tracking-wider text-[#8a8a8a]">No toll expenses logged</p>
                <p className="mt-1 font-[Inter] text-xs text-[#666]">Nothing has been recorded for this driver yet.</p>
              </div>
            )}

            {expenses && expenses.expenses?.length > 0 && (
              <>
                <div className="mb-3 flex items-center justify-between border border-[#222] bg-[#0f0f0f] px-3 py-2">
                  <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">Total logged</span>
                  <span className="font-[Bebas_Neue] text-2xl" style={{ color: GOLD_BRIGHT }}>{money(expenses.total)}</span>
                </div>
                <div className="space-y-1">
                  {expenses.expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between border-l-2 border-[#C9A84C] bg-[#0f0f0f] px-3 py-2">
                      <span className="font-[Inter] text-xs text-[#d4d4d4]">
                        {e.date} · {e.road} <span className="text-[#666]">({e.state})</span>
                      </span>
                      <span className="font-[JetBrains_Mono] text-sm text-white">{money(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          <Panel
            title="Transponder / bypass"
            note="GET /api/tolls/transponder/:driverId — tier gated by the API."
          >
            <div className="mb-4 flex gap-1">
              {["solo", "pro", "fleet"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`px-3 py-1.5 font-[Oswald] text-[10px] uppercase tracking-[0.2em] transition ${
                    tier === t ? "bg-[#C9A84C] text-black" : "border border-[#222] text-[#8a8a8a] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {!transponder && <p className="font-[JetBrains_Mono] text-xs text-[#666]">Checking eligibility…</p>}

            {transponder?.error && (
              <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>{transponder.error}</p>
            )}

            {transponder && !transponder.error && transponder.eligible === false && (
              <div className="border border-[#222] bg-[#0f0f0f] px-4 py-4">
                <p className="font-[Oswald] text-sm uppercase tracking-wider" style={{ color: GOLD }}>Not included on this tier</p>
                <p className="mt-1 font-[Inter] text-xs text-[#8a8a8a]">{transponder.reason}</p>
              </div>
            )}

            {transponder?.eligible && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border border-[#222] bg-[#0f0f0f] px-3 py-3">
                  <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">Status</span>
                  <span className="font-[Oswald] text-sm uppercase tracking-wider" style={{ color: transponder.active ? GOLD_BRIGHT : "#8a8a8a" }}>
                    {transponder.active ? `Tag issued · ${transponder.tag}` : "Not activated"}
                  </span>
                </div>
                <div className="flex items-center justify-between border border-[#222] bg-[#0f0f0f] px-3 py-3">
                  <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">Bundle price</span>
                  <span className="font-[JetBrains_Mono] text-sm text-white">{money(transponder.price)}/mo</span>
                </div>
                {!transponder.active && (
                  <button
                    onClick={activate}
                    disabled={busy === "transponder"}
                    className="flex w-full items-center justify-center gap-2 border border-[#C9A84C]/50 py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10 disabled:opacity-40"
                  >
                    <Radio size={14} /> Issue internal tag record
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 border border-[#222] bg-[#0f0f0f] px-3 py-3">
              <p className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">
                Weigh-station bypass provider
              </p>
              <p className="font-[Oswald] text-sm text-[#8a8a8a]">MISSING / NOT TRACKED</p>
              <p className="mt-1 font-[Inter] text-[11px] leading-snug text-[#666]">
                No bypass or transponder provider is under contract and no provider API is connected. Activating
                here only creates an internal record — it does not order hardware, open an account, or apply a
                discount at any plaza.
              </p>
            </div>
          </Panel>
        </div>

        <div className="flex items-center gap-2 border border-[#222] bg-[#111] px-5 py-4">
          <Receipt size={15} style={{ color: GOLD }} />
          <p className="font-[Inter] text-xs text-[#8a8a8a]">
            Toll receipts belong in your IFTA and expense records. TruckWithEase keeps the log; it does not file
            anything with any state or authority on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
