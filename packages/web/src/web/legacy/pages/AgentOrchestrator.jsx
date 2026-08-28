/**
 * Agent roster — what is built, what is not, what feeds it.
 *
 * Rewritten 2026-08-28. Original preserved at
 * docs/launch/AgentOrchestrator.ORIGINAL.jsx.txt. WHAT WAS DELETED AND WHY:
 *
 * 1. THE INTEGRATIONS ARRAY. Sixteen vendors hardcoded with status:'active' —
 *    including several with no key in the environment and no code that calls
 *    them. Vendor state now comes from GET /api/integrations/status, which
 *    reports environment-variable presence and what has really been verified.
 * 2. THE PERFECT SCORES. "All 150 pages verified — auto-repair on standby",
 *    "Health score 100% — next scan in 4m 32s", "Security score 100/100 — zero
 *    threats detected". Nothing scans pages, nothing scores health, nothing
 *    scans for threats. A missing metric now renders as MISSING / NOT TRACKED
 *    with the reason, never as 100.
 * 3. The IBM Watson row (removed 2026-08-27 — IBM was scrapped).
 * 4. Off-brand cyan/blue/red palette. Now gold on black.
 *
 * The built/not-built split is NOT written here. It is read from AGENTS in
 * legacy/services/AgentOrchestrator.js, which is the authority: 10 agents have
 * a real server persona behind /api/agent, and 4 (BILLIE, SIGNAL, TRAINING,
 * HARDWARE) have built:false and are never routed to.
 */

import { useState, useEffect, useCallback } from "react";
import { Bot, RefreshCw, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Cpu } from "lucide-react";
import { AGENTS } from "../services/AgentOrchestrator";

const C = {
  gold: "#C9A84C",
  goldBright: "#FFD700",
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  warn: "#c96a4c",
  muted: "#8a8a8a",
  dim: "#666666",
  white: "#ffffff",
};

/** Plain-English job per agent key. No capability is claimed that the server persona does not answer for. */
const JOBS = {
  GOD: "Master control — routes a question to the right specialist and answers general platform questions.",
  GHOST: "Freight and road intelligence. Answers from what it is given; it has no live news or market feed wired.",
  HREASE: "Hiring and people questions, backed by the real HR tables — people, documents, occurrences, payroll runs.",
  DISPATCH: "Route and trip questions. Real routing math comes from /api/routing/plan on Google Directions.",
  COMPLIANCE: "HOS and DOT rule questions, against the real HOS clocks in /api/hos.",
  SAFETY: "Safety coaching against the computed driver safety score in /api/safety/:driverId.",
  PAYROLL: "Pay and settlement questions against the HR payroll tables.",
  MAINTENANCE: "Platform and page questions. It answers; it does not repair anything.",
  MECHANIC: "Symptom-to-cause diagnosis conversation for a truck fault.",
  QUANTUM: "Trend and pattern questions, including the per-driver learned profile from /api/algorithm.",
  BILLIE: "Invoice and billing document handling.",
  SIGNAL: "Telecom and SMS monitoring.",
  TRAINING: "Driver training and CDL coaching modules.",
  HARDWARE: "Hardware and device provisioning.",
};

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

function Panel({ title, note, icon, children }) {
  const Icon = icon;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
        {Icon ? <Icon size={16} color={C.gold} /> : null}
        <div style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: C.goldBright }}>{title}</div>
      </div>
      {note ? (
        <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim }}>{note}</div>
      ) : null}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 4, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: C.warn }}>MISSING / NOT TRACKED</div>
        <div style={{ fontSize: 14, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: "10px 16px", minWidth: 115 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, color: C.goldBright }}>{value}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid #1b1b1b` }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim, minWidth: 150 }}>{k}</div>
      <div style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif", fontSize: mono ? 11 : 13, color: tone === "warn" ? C.warn : C.white, lineHeight: 1.6 }}>{v}</div>
    </div>
  );
}

const STATE_META = {
  connected: { label: "CONNECTED", color: C.gold, Icon: CheckCircle2 },
  unknown: { label: "KEY PRESENT, UNVERIFIED", color: C.muted, Icon: HelpCircle },
  rejected: { label: "KEY REJECTED", color: C.warn, Icon: XCircle },
  not_connected: { label: "NOT CONNECTED", color: C.dim, Icon: XCircle },
};

export default function AgentOrchestrator() {
  const [providers, setProviders] = useState(null);
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setErr("");
    try {
      const j = await getJSON("/api/integrations/status");
      setProviders(j.providers || []);
      setState("ok");
    } catch (e) {
      setErr(String(e.message || e));
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const keys = Object.keys(AGENTS);
  const built = keys.filter((k) => AGENTS[k].built);
  const notBuilt = keys.filter((k) => !AGENTS[k].built);
  const endpoints = new Set(built.map((k) => AGENTS[k].endpoint));

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`, padding: "26px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 11px" }}>
            <Bot size={13} color={C.gold} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: C.gold }}>AGENT ROSTER</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1.02, margin: "14px 0 0", letterSpacing: "0.02em" }}>
            WHICH AGENTS ACTUALLY <span style={{ color: C.goldBright }}>ANSWER</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, maxWidth: 880, marginTop: 10 }}>
            Fourteen agents are defined. {built.length} of them have a real persona on the server behind /api/agent and will
            answer a question. {notBuilt.length} do not exist yet, and the router refuses to fake them — ask one and it tells you
            it is not built instead of generating something that sounds right.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
            <Stat value={keys.length} label="DEFINED" />
            <Stat value={built.length} label="BUILT" />
            <Stat value={notBuilt.length} label="NOT BUILT" />
            <Stat value={endpoints.size} label="SERVER PERSONAS" />
            <button
              onClick={load}
              style={{
                background: "transparent", border: `1px solid ${C.gold}`, color: C.goldBright,
                fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em",
                padding: "10px 16px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <RefreshCw size={13} className={state === "loading" ? "spin" : undefined} /> REFRESH
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: 24 }}>
        <Panel title={`Built — ${built.length} agents`} icon={CheckCircle2} note="AGENTS in legacy/services/AgentOrchestrator.js · POST /api/agent/:endpoint">
          <div style={{ display: "grid", gap: 12 }}>
            {built.map((k) => {
              const a = AGENTS[k];
              return (
                <div key={k} style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: C.white, letterSpacing: "0.06em" }}>
                      {a.name} <span style={{ color: C.dim, fontSize: 12 }}>· {k}</span>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 3, padding: "4px 9px" }}>
                      <CheckCircle2 size={12} color={C.gold} />
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: C.gold }}>BUILT</span>
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>{JOBS[k]}</div>
                  <div style={{ marginTop: 8 }}>
                    <Row k="endpoint" v={`/api/agent/${a.endpoint}`} mono />
                    <Row k="specialty" v={a.specialty} mono />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title={`Not built — ${notBuilt.length} agents`} icon={XCircle} note="built:false in AGENTS — the router returns a refusal, not an answer">
          <div style={{ display: "grid", gap: 12 }}>
            {notBuilt.map((k) => (
              <div key={k}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, color: C.white, letterSpacing: "0.06em", marginBottom: 8 }}>
                  {AGENTS[k].name} <span style={{ color: C.dim, fontSize: 12 }}>· {k}</span>
                </div>
                <Missing
                  label={JOBS[k]}
                  reason={`No server persona exists for "${AGENTS[k].specialty}". routeToAgent() returns a plain refusal naming the agent, so nothing is generated for the request. Building it means adding the persona to src/api/agent and giving it real data to read.`}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="What the agents can read" icon={Cpu} note="GET /api/integrations/status">
          {state === "error" ? (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.warn }}>{err}</div>
          ) : null}
          {state === "loading" && !providers ? <div style={{ color: C.muted, fontSize: 14 }}>Loading provider state…</div> : null}
          {providers ? (
            <div style={{ display: "grid", gap: 8 }}>
              {providers.map((p) => {
                const meta = STATE_META[p.state] ?? STATE_META.not_connected;
                const Icon = meta.Icon;
                return (
                  <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1b1b1b", flexWrap: "wrap" }}>
                    <Icon size={13} color={meta.color} style={{ flexShrink: 0 }} />
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: C.white, minWidth: 220 }}>{p.name}</div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: meta.color, minWidth: 190 }}>{meta.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim }}>
                      {p.usedBy.length ? p.usedBy.join("  ") : "nothing reads it"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Panel>

        <Panel title="Not measured" icon={AlertTriangle}>
          <div style={{ display: "grid", gap: 10 }}>
            <Missing
              label="No platform health score"
              reason="Nothing crawls the pages and nothing computes a health number. The old version of this page printed 'all 150 pages verified' and 'health score 100% — next scan in 4m 32s' with no scanner behind either line."
            />
            <Missing
              label="No security score and no threat detection"
              reason="There is no scanner, no dependency audit pipeline, and no intrusion monitoring in this platform. '100/100 — zero threats detected' was invented."
            />
            <Missing
              label="No agent activity history"
              reason="logAgentActivity() is deliberately a no-op that returns { logged: false } — the table it used to write to never existed. Agent calls are not recorded, so there is no history, no per-agent call count, and no latency chart."
            />
            <Missing
              label="No auto-repair"
              reason="Page Guardian answers questions about the platform. It cannot edit, deploy, or repair anything, and 'auto-repair on standby' implied it could."
            />
          </div>
        </Panel>

        <Panel title="What would make this smarter" icon={CheckCircle2}>
          <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 14, lineHeight: 1.85 }}>
            <li>Pass driverId through callAgent — one line. The 10 built agents would immediately get the per-driver learned profile from /api/algorithm instead of answering blind.</li>
            <li>Log agent calls to a real table so this page can show call counts, failures, and latency that were actually measured.</li>
            <li>Build BILLIE on top of the TRAXES document store — it is the closest of the four to real, because the scan and record plumbing already exists.</li>
            <li>SIGNAL cannot be built usefully until the A2P campaign is filed; there is nothing for it to monitor.</li>
          </ol>
        </Panel>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
          Agent definitions are read from the client-side roster in legacy/services/AgentOrchestrator.js; provider state is
          read from the server. This page does not run agents, does not grade them, and does not display any provider key.
        </div>
      </div>
    </div>
  );
}
