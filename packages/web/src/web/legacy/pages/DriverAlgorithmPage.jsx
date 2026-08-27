/**
 * DriverAlgorithmPage — NEW 2026-08-27
 * Route: /driver-algorithm, /my-algorithm  (App.jsx)
 *
 * WHAT THIS PAGE IS
 * The per-driver learning layer. Every value on it is computed server-side from rows this
 * driver actually generated — his duty logs, his DVIRs, his speeding events, the loads he
 * booked, the routes he ran, and the decisions the app recorded as signals.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT DO
 * - No invented preferences. Nothing here is a guess about what a driver "probably" likes.
 * - No prediction. A pattern is a description of what already happened, never a forecast.
 * - Any pattern with fewer than 5 observations renders as MISSING / NOT TRACKED with the real
 *   count, instead of a number that looks authoritative on two data points.
 * - Confidence is derived from sample size alone. No model scores its own certainty here.
 *
 * DATA SOURCES (all real, all server-side)
 * - GET /api/algorithm/status      row counts the engine can learn from right now
 * - GET /api/algorithm/:driverId   the four-dimension profile
 * - GET /api/fleet/drivers         the driver picker
 */

import { useState, useEffect, useCallback } from "react";
import {
  Brain, AlertTriangle, Loader2, RefreshCw, Gauge, Users, Package, Route as RouteIcon,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const DIMENSIONS = [
  { key: "driving", label: "Driving skill", icon: Gauge, blurb: "Learned from duty logs, DVIR inspections and speeding events." },
  { key: "customer", label: "Customer frequency", icon: Users, blurb: "Learned from brokers on loads this driver actually booked." },
  { key: "load", label: "Loads", icon: Package, blurb: "Learned from the loads he took and the ones he passed on." },
  { key: "route", label: "Routes", icon: RouteIcon, blurb: "Learned from booked lanes and logged trips." },
];

/* ---------------------------------------------------------------- house kit */

function Panel({ title, note, right, children }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: GOLD }}>{title}</div>
          {note && <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: DIM, marginTop: 4 }}>{note}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 8, padding: 14, background: "#121212" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={15} color={WARN} />
        <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, color: WARN }}>
          Missing / Not tracked
        </span>
      </div>
      <div style={{ color: "#ddd", fontSize: 14, marginTop: 8 }}>{label}</div>
      <div style={{ color: MUTED, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ background: "#121212", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", minWidth: 120 }}>
      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 34, lineHeight: 1, color: GOLDBR }}>{value}</div>
      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 10.5, color: MUTED, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function PatternCard({ p }) {
  if (p.insufficient) {
    return (
      <Missing
        label={p.label}
        reason={`Only ${p.sampleCount} observation${p.sampleCount === 1 ? "" : "s"} — the engine needs 5 before it will state this. ${p.basis}`}
      />
    );
  }
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14, background: "#121212" }}>
      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, color: MUTED }}>{p.label}</div>
      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 26, lineHeight: 1.15, color: GOLDBR, marginTop: 8 }}>{p.value}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: GOLD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "3px 7px" }}>
          {p.sampleCount} observations
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "3px 7px" }}>
          {p.confidence} confidence
        </span>
      </div>
      <div style={{ color: DIM, fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>{p.basis}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function DriverAlgorithmPage() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("drv-1");
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/fleet/drivers")
      .then((r) => r.json())
      .then((d) => setDrivers(Array.isArray(d?.drivers) ? d.drivers : []))
      .catch(() => setDrivers([]));
    fetch("/api/algorithm/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const load = useCallback(async (id) => {
    setState("loading");
    setErr("");
    try {
      const res = await fetch(`/api/algorithm/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `server returned ${res.status}`);
      setProfile(data);
      setState("ok");
    } catch (e) {
      setErr(String(e?.message || e));
      setState("error");
    }
  }, []);

  useEffect(() => { load(driverId); }, [driverId, load]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* header band */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: "linear-gradient(180deg,#111 0%,#0a0a0a 100%)", padding: "34px 26px 30px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, borderRadius: 999, padding: "5px 12px" }}>
            <Brain size={14} color={GOLD} />
            <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 10.5, color: GOLD }}>
              Driver algorithm
            </span>
          </div>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 52, lineHeight: 1.05, margin: "16px 0 10px", letterSpacing: "0.02em" }}>
            WHAT THE AGENTS HAVE <span style={{ color: GOLDBR }}>LEARNED</span> ABOUT YOU
          </h1>
          <p style={{ color: MUTED, fontSize: 15, maxWidth: 780, lineHeight: 1.6, margin: 0 }}>
            Every agent in the platform reads this profile before it answers you. It is built from your own
            records across four things: how you drive, who you haul for, which loads you take, and which
            routes you run. Nothing on this page is a guess — if the app has not watched you do something
            at least five times, it says so and the agents are told to ask you instead.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={{ background: "#0f0f0f", color: "#e8e8e8", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "9px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
            >
              {(drivers.length ? drivers : [{ id: "drv-1", name: "drv-1" }]).map((d) => (
                <option key={d.id} value={d.id}>{d.name} {d.truckNumber ? `(${d.truckNumber})` : ""}</option>
              ))}
            </select>
            <button
              onClick={() => load(driverId)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "9px 15px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Recompute
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px" }}>
        {/* what the engine can learn from */}
        <Panel title="What the engine can learn from right now" note="GET /api/algorithm/status">
          {!status ? (
            <div style={{ color: MUTED, fontSize: 13 }}>Could not read the engine status.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {Object.entries(status.learnsFrom || {}).map(([k, v]) => (
                  <Stat key={k} value={v} label={k.replace(/_/g, " ")} />
                ))}
              </div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 14, lineHeight: 1.6 }}>
                {status.note}
              </div>
            </>
          )}
        </Panel>

        {state === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, padding: 30 }}>
            <Loader2 size={18} className="spin" color={GOLD} /> Computing this driver&apos;s profile…
          </div>
        )}

        {state === "error" && (
          <Panel title="Profile failed" note={`GET /api/algorithm/${driverId}`}>
            <div style={{ color: WARN, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{err}</div>
          </Panel>
        )}

        {state === "ok" && profile && (
          <>
            <Panel
              title={`Profile — ${profile.driver?.name || profile.driverId}`}
              note={`GET /api/algorithm/${profile.driverId} · window ${profile.windowDays} days · minimum ${profile.minSamples} observations per pattern`}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Stat value={`${profile.patternsLearned}/${profile.patternsPossible}`} label="patterns learned" />
                <Stat value={profile.signalsRecorded} label="recorded decisions" />
                <Stat value={profile.driver?.truckNumber || "—"} label="truck" />
              </div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 14, lineHeight: 1.6 }}>{profile.note}</div>
            </Panel>

            {DIMENSIONS.map(({ key, label, icon: Icon, blurb }) => {
              const list = profile.dimensions?.[key] || [];
              const learned = list.filter((p) => !p.insufficient).length;
              return (
                <Panel
                  key={key}
                  title={label}
                  note={blurb}
                  right={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: learned ? GOLD : MUTED, border: `1px solid ${BORDER}`, borderRadius: 999, padding: "5px 11px" }}>
                      <Icon size={13} /> {learned} of {list.length} learned
                    </span>
                  }
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
                    {list.map((p) => <PatternCard key={p.label} p={p} />)}
                  </div>
                </Panel>
              );
            })}
          </>
        )}

        <Panel title="What would make this page smarter">
          <ol style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
            <li>Book and pass on loads inside the app. Right now no load on the board has a driver attached, so customer, load and route have nothing to learn from.</li>
            <li>Record route decisions from the trip planner, so lanes and run lengths build up the same way.</li>
            <li>Keep running pre-trip and post-trip DVIRs — recurring defects are the strongest maintenance-coaching signal we have.</li>
            <li>More speeding-event history. Three events is an incident count, not a habit.</li>
          </ol>
        </Panel>

        <div style={{ color: DIM, fontSize: 12, lineHeight: 1.7, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
          This page is a description of recorded behaviour, not a prediction and not a score. It is not a
          safety rating, not a CSA score, and not an employment evaluation. Patterns below five observations
          are withheld on purpose. The agents receive the same profile you see here, with instructions to
          ask you directly about anything marked NOT ENOUGH DATA.
        </div>
      </div>
    </div>
  );
}
