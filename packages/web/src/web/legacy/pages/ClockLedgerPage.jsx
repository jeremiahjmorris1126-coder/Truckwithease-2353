/**
 * THE CLOCK LEDGER — /clock-ledger
 *
 * READS (live, every value on this page comes from these round trips)
 *   GET /api/clock-ledger   REQUIRED — fleet clock consumption, per-driver ledger rows,
 *                           load ranking by $/clock-hour, integrity counts, hash chain
 *   GET /api/clock-ledger/chain  (optional) independent replay of the persisted chain from
 *                           genesis — every link recomputed server-side and reported pass/fail
 *   GET /api/hos            optional — fleet duty clocks, for cross-reference
 *   GET /api/quantum        optional — the naming statement printed verbatim
 *
 * COMPUTES / MEASURES LOCALLY
 *   Round-trip latency per read (timedGet), flagged at >= 3000 ms
 *   Nothing else. Every number rendered here is computed server-side in
 *   packages/web/src/api/routes/clockledger.ts against live rows.
 *
 * REMOVED IN THIS REWRITE
 *   Nothing — this page is new. It replaces no existing page and inherits no
 *   fabricated content. It deliberately renders NO number that the server did not
 *   return, and renders MISSING with the server's own reason string wherever a
 *   figure cannot be computed (currently revenue per clock-hour, because
 *   loads.booked_by_driver_id is set on 0 of 5 rows).
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   No prediction of future clock use. No confidence or accuracy percentage.
 *   No detention, deadhead or reset-stranding figure — no source table exists.
 *   No tax, IFTA or filing output. No quantum computation; "Quantum" elsewhere in
 *   this app is a product name. TruckWithEase is not an ELD, is not registered with
 *   FMCSA, and files nothing with any agency.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Fuel, Hash, ListOrdered, ShieldAlert, TrendingUp } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const hrs = (n) => (n === null || n === undefined ? "—" : `${n} h`);
const money = (n) => (n === null || n === undefined ? "—" : `$${Number(n).toLocaleString()}`);

export default function ClockLedgerPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [reads, setReads] = useState([]);
  const [led, setLed] = useState(null);
  const [hos, setHos] = useState(null);
  const [quantum, setQuantum] = useState(null);
  const [chain, setChain] = useState(null);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const [ledR] = await Promise.all([timedGet("/api/clock-ledger")]);
      if (!alive.current) return;
      const collected = [ledR];
      setLed(ledR.body);

      const opt = await Promise.allSettled([
        timedGet("/api/clock-ledger/chain"),
        timedGet("/api/hos"),
        timedGet("/api/quantum"),
      ]);
      if (!alive.current) return;
      const [chainR, hosR, qR] = opt;
      if (chainR.status === "fulfilled") { collected.push(chainR.value); setChain(chainR.value.body); }
      if (hosR.status === "fulfilled") { collected.push(hosR.value); setHos(hosR.value.body); }
      if (qR.status === "fulfilled") { collected.push(qR.value); setQuantum(qR.value.body); }

      setReads(collected);
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setError(e && e.message ? e.message : String(e));
      setState("error");
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  return (
    <div style={page}>
      <div style={wrap}>
        <Header
          icon={<Clock size={26} color={GOLDB} />}
          eyebrow="TruckWithEase / Clock Ledger"
          title="THE CLOCK"
          accent="LEDGER"
          lead="Fuel, trailers and trucks can be bought. Legal drive time cannot. A duty clock is the only genuinely finite input in trucking — and nothing on the market puts a price on an hour of it. This page does, off live rows only."
        />

        {state === "loading" && <Spin label="Reading /api/clock-ledger…" />}
        {state === "error" && <Err error={error} onRetry={load} />}

        {state === "ok" && led && (
          <>
            <Panel
              title="THE PREMISE"
              note="concept string returned by GET /api/clock-ledger"
              icon={<TrendingUp size={16} color={GOLD} />}
            >
              <p style={{ color: C.white, fontFamily: FB, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>
                {led.concept}
              </p>
              <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                Window: {led.window.days} days · limit {led.window.cycleLimitHours} h · basis {led.window.basis}
              </p>
            </Panel>

            <div style={{ ...grid(200), marginTop: 16 }}>
              <Stat label="Clock hours consumed" value={hrs(led.fleet.clockHoursConsumed)} sub={`${led.fleet.driversWithClockConsumed} of ${led.fleet.driversTotal} drivers`} />
              <Stat label="Hours that moved the truck" value={hrs(led.fleet.drivingHours)} sub="driving status only" tone="gold" />
              <Stat label="Hours burned, wheels stopped" value={hrs(led.fleet.burnedHours)} sub="on-duty not driving" tone="warn" />
              <Stat label="Revenue per clock-hour" value="—" sub="cannot be computed — see below" tone="warn" />
            </div>

            <div style={{ marginTop: 16 }}>
              <Missing
                label="REVENUE PER CLOCK-HOUR — NOT COMPUTABLE"
                reason={led.fleet.revenueAttributedNote}
              />
            </div>

            <Panel
              title="PER-DRIVER LEDGER"
              note="drivers[] from GET /api/clock-ledger"
              icon={<Clock size={16} color={GOLD} />}
              right={<Tag tone="dim">{led.drivers.length} drivers</Tag>}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Driver</th>
                      <th style={th}>Truck</th>
                      <th style={{ ...th, textAlign: "right" }}>Clock used</th>
                      <th style={{ ...th, textAlign: "right" }}>Driving</th>
                      <th style={{ ...th, textAlign: "right" }}>Burned</th>
                      <th style={{ ...th, textAlign: "right" }}>Productive</th>
                      <th style={{ ...th, textAlign: "right" }}>Cycle left</th>
                      <th style={{ ...th, textAlign: "right" }}>$/clock-hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {led.drivers.map((d) => (
                      <tr key={d.driverId}>
                        <td style={td}>
                          {d.name}
                          <div style={{ color: C.dim, fontFamily: FM, fontSize: 10.5 }}>{d.driverId}</div>
                        </td>
                        <td style={td}>{d.truckNumber || "—"}</td>
                        <td style={tdNum}>{d.clockHoursConsumed}</td>
                        <td style={{ ...tdNum, color: GOLDB }}>{d.drivingHours}</td>
                        <td style={{ ...tdNum, color: d.burnedHours > 0 ? WARN : C.muted }}>{d.burnedHours}</td>
                        <td style={tdNum}>{d.productiveSharePct === null ? "—" : `${d.productiveSharePct}%`}</td>
                        <td style={tdNum}>{d.cycleHoursRemaining}</td>
                        <td style={{ ...tdNum, color: C.muted }}>{d.dollarsPerClockHour === null ? "—" : money(d.dollarsPerClockHour)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: C.muted, fontFamily: FM, fontSize: 11, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                $/clock-hr is blank on every row for one reason, returned per driver by the
                server: {led.drivers[0] && led.drivers[0].revenueNote}
              </p>
            </Panel>

            <Panel
              title="THE REORDERING — $/MILE VS $/CLOCK-HOUR"
              note="loadRanking[] from GET /api/clock-ledger"
              icon={<ListOrdered size={16} color={GOLD} />}
              right={<Tag tone={led.rankingsAgree ? "dim" : "gold"}>{led.rankingsAgree ? "orders agree" : "orders disagree"}</Tag>}
            >
              <p style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, marginTop: 0 }}>
                Every load board on the market ranks freight by rate per mile. A mile is not
                the scarce thing — an hour of clock is. Both orderings are shown so the
                difference is visible instead of asserted.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Load</th>
                      <th style={th}>Lane</th>
                      <th style={{ ...th, textAlign: "right" }}>Miles</th>
                      <th style={{ ...th, textAlign: "right" }}>Rate</th>
                      <th style={{ ...th, textAlign: "right" }}>$/mile</th>
                      <th style={{ ...th, textAlign: "right" }}>Est. clock</th>
                      <th style={{ ...th, textAlign: "right" }}>$/clock-hr</th>
                      <th style={{ ...th, textAlign: "right" }}>Rank move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {led.loadRanking.map((l) => (
                      <tr key={l.id}>
                        <td style={td}>{l.id}</td>
                        <td style={td}>{l.origin} → {l.destination}</td>
                        <td style={tdNum}>{l.miles}</td>
                        <td style={tdNum}>{money(l.rate)}</td>
                        <td style={tdNum}>{l.ratePerMile}</td>
                        <td style={tdNum}>{l.estimatedClockHours}</td>
                        <td style={{ ...tdNum, color: GOLDB }}>{l.ratePerClockHour === null ? "—" : l.ratePerClockHour}</td>
                        <td style={tdNum}>
                          {l.rankDelta === 0 ? <span style={{ color: C.dim }}>—</span> : (
                            <span style={{ color: l.rankDelta > 0 ? GOLDB : WARN }}>
                              {l.rankDelta > 0 ? `+${l.rankDelta}` : l.rankDelta}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: C.muted, fontFamily: FM, fontSize: 11, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                {led.rankingNote}
              </p>
            </Panel>

            <Panel
              title="STATED ASSUMPTIONS"
              note="assumptions[] from GET /api/clock-ledger — declared so no caller reads them as measurements"
              icon={<Fuel size={16} color={GOLD} />}
            >
              {led.assumptions.map((a) => (
                <div key={a.key} style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
                  <div style={{ fontFamily: FM, fontSize: 12, color: GOLDB }}>{a.key} = {String(a.value)}</div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.white, marginTop: 4, lineHeight: 1.65 }}>{a.statement}</div>
                </div>
              ))}
            </Panel>

            <Panel
              title="DATA INTEGRITY — WHAT WAS THROWN OUT"
              note="integrity{} from GET /api/clock-ledger"
              icon={<ShieldAlert size={16} color={WARN} />}
              right={<Tag tone="warn">{led.integrity.excludedOpenIntervals} excluded</Tag>}
            >
              <div style={{ ...grid(200) }}>
                <Stat label="Open intervals excluded" value={led.integrity.excludedOpenIntervals} sub={`older than ${led.integrity.staleOpenIntervalHours} h`} tone="warn" />
                <Stat label="Out-of-window intervals" value={led.integrity.excludedOutOfWindowIntervals} sub={`before the ${led.window.days}-day window`} />
              </div>
              <p style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, marginTop: 14, marginBottom: 0 }}>
                {led.integrity.note}
              </p>
            </Panel>

            <Panel
              title="HASH CHAIN"
              note="chain{} from GET /api/clock-ledger"
              icon={<Hash size={16} color={GOLD} />}
              right={<Tag tone={led.chain.persisted ? "gold" : "warn"}>{led.chain.persisted ? "persisted" : "not persisted"}</Tag>}
            >
              <div style={{ ...grid(200) }}>
                <Stat label="Algorithm" value={led.chain.algorithm} />
                <Stat label="Rows sealed (total)" value={led.chain.rowsPersistedTotal} sub={`table ${led.chain.table}`} />
                <Stat label="Appended this read" value={led.chain.rowsAppendedThisRequest} sub={led.chain.rowsAppendedThisRequest === 0 ? "nothing changed" : "new sealed rows"} />
                <Stat label="Head seq" value={led.chain.headSeq} />
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ color: C.muted, fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>Construction</div>
                <div style={{ color: C.white, fontFamily: FM, fontSize: 12, marginTop: 5, wordBreak: "break-all" }}>
                  {led.chain.construction}
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ color: C.muted, fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>Head hash</div>
                <div style={{ color: GOLDB, fontFamily: FM, fontSize: 12, wordBreak: "break-all", marginTop: 5 }}>
                  {led.chain.headHash || "—"}
                </div>
              </div>
              <p style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, marginTop: 14, marginBottom: 0 }}>
                {led.chain.note}
              </p>
              {chain && (
                <div style={{ marginTop: 16, border: `1px solid ${C.border}`, background: C.black, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ color: C.muted, fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Independent replay — GET /api/clock-ledger/chain
                    </div>
                    <Tag tone={chain.verified ? "gold" : "warn"}>
                      {chain.verified ? `${chain.rows} of ${chain.rows} links verified` : `${chain.breaks.length} broken link(s)`}
                    </Tag>
                  </div>
                  <p style={{ color: C.white, fontFamily: FB, fontSize: 13, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                    {chain.verifiedNote}
                  </p>
                  {!chain.verified && (
                    <ul style={{ color: WARN, fontFamily: FM, fontSize: 12, lineHeight: 1.8, marginTop: 10, marginBottom: 0, paddingLeft: 18 }}>
                      {chain.breaks.map((b, i) => (
                        <li key={i}>seq {b.seq} — {b.reason}</li>
                      ))}
                    </ul>
                  )}
                  {chain.entries.length > 0 && (
                    <div style={{ overflowX: "auto", marginTop: 12 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={th}>Seq</th>
                            <th style={th}>Driver</th>
                            <th style={th}>Clock h</th>
                            <th style={th}>Drive h</th>
                            <th style={th}>Burned h</th>
                            <th style={th}>Chain hash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chain.entries.map((e) => (
                            <tr key={e.seq}>
                              <td style={tdNum}>{e.seq}</td>
                              <td style={td}>{e.driverId}</td>
                              <td style={tdNum}>{e.clockHoursConsumed}</td>
                              <td style={tdNum}>{e.drivingHours}</td>
                              <td style={tdNum}>{e.burnedHours}</td>
                              <td style={{ ...td, fontFamily: FM, fontSize: 11, color: GOLDB }}>{e.chainHash.slice(0, 24)}…</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              <p style={{ color: C.muted, fontFamily: FB, fontSize: 13, lineHeight: 1.75, marginTop: 10, marginBottom: 0 }}>
                Why it matters: an ELD locks a driver&apos;s record to the carrier that bought the
                device. A chained ledger the driver owns is the part that accrues — and the part
                a competitor starting today has none of. Sealing is append-only and idempotent:
                re-reading this page does not add rows, and a correction is written as a new row
                rather than an edit, so the history cannot be quietly rewritten.
              </p>
            </Panel>

            {hos && hos.limits && (
              <Panel title="CROSS-CHECK AGAINST /API/HOS" note="limits{} from GET /api/hos — the same federal limits, read from a different router" icon={<Clock size={16} color={GOLD} />}>
                <div style={{ ...grid(180) }}>
                  <Stat label="Driving limit" value={`${Math.round(hos.limits.driving / 60)} h`} />
                  <Stat label="On-duty window" value={`${Math.round(hos.limits.onDutyWindow / 60)} h`} />
                  <Stat label="Cycle" value={`${Math.round(hos.limits.cycle / 60)} h`} />
                  <Stat label="Break after" value={`${Math.round(hos.limits.breakAfter / 60)} h`} />
                </div>
              </Panel>
            )}

            {quantum && quantum.naming && (
              <Panel title="ON THE WORD QUANTUM" note="naming.statement from GET /api/quantum" icon={<ShieldAlert size={16} color={GOLD} />}>
                <p style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, margin: 0 }}>
                  {quantum.naming.statement}
                </p>
              </Panel>
            )}

            <Reads reads={reads} onReload={load} />

            <Disclaimer items={led.notClaimed} />
          </>
        )}
      </div>
    </div>
  );
}
