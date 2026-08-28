/**
 * Overlap review — which paid services would duplicate each other.
 *
 * Rewritten 2026-08-28. Original preserved at
 * docs/launch/APIDiagnosticPage.ORIGINAL.jsx.txt. WHAT WAS DELETED AND WHY:
 *
 * 1. status: "active" ON VENDORS WITH NO KEY AND NO CODE. The old page showed a
 *    green "active" badge for SerpAPI, YouTube, World News, Twitter/X, Azure,
 *    FMCSA, iDrive E2 and DevSecOps ALM. None of them has a credential in the
 *    environment and nothing in the codebase calls any of them. Status now comes
 *    from GET /api/integrations/status, which reports env-var presence plus what
 *    has actually been verified against the vendor.
 * 2. THE INVENTED VERDICTS. Every overlap row ended in "Keep Both ✓" with a
 *    confident one-line justification nobody had measured, e.g. "IBM is more
 *    accurate in noisy cabs, AWS is fallback". Those claims are gone. Overlaps
 *    are now stated as an open decision with the real cost of each option, and
 *    the page says plainly when the answer is not known.
 * 3. THE IBM WATSON ROW (removed 2026-08-27 — IBM was scrapped; Gemini already
 *    does OCR and transcription).
 * 4. Off-brand navy/blue/teal palette. Now gold on black.
 */

import { useState, useEffect, useCallback } from "react";
import { GitCompareArrows, RefreshCw, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Scale } from "lucide-react";

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

/**
 * Overlaps that actually exist in this codebase or in Jeremiah's shortlist.
 * `decision` is either a fact ("already decided, here is why") or an honest
 * open question. Nothing here invents an accuracy or latency comparison.
 */
const OVERLAPS = [
  {
    id: "weather",
    title: "US weather — NWS vs OpenWeatherMap",
    a: { id: "nws", label: "National Weather Service", cost: "Free, keyless, US government" },
    b: { id: "openweather", label: "OpenWeatherMap", cost: "Free tier, key required" },
    decided: true,
    decision:
      "Decided: NWS. It is the authoritative US source, it needs no key, and it publishes watches and warnings that a driver actually has to act on. The OpenWeather key that was added is currently rejected with HTTP 401 and nothing in the platform reads it. Drop it unless we need non-US coverage.",
  },
  {
    id: "ocr",
    title: "Document OCR and transcription — Gemini vs a second AI vendor",
    a: { id: "gemini", label: "Google Gemini", cost: "Already paid for and in use" },
    b: { id: null, label: "A second OCR/speech vendor (IBM, AWS, Azure)", cost: "New bill" },
    decided: true,
    decision:
      "Decided: Gemini only. It already reads scanned documents in TRAXES and transcribes audio for captions, both verified live. A second vendor buys a duplicate of a capability that already works. The IBM Watson claims that used to be on this page were deleted on 2026-08-27 — there is no IBM key and never was.",
  },
  {
    id: "routing",
    title: "Routing — Google Directions vs HERE truck routing",
    a: { id: "google_maps", label: "Google Directions", cost: "Enabled and billed today" },
    b: { id: "here", label: "HERE truck routing", cost: "Free tier, 250k calls/mo, no card" },
    decided: false,
    decision:
      "Open, and this one is not a duplicate. Google gives us a route; it does not apply bridge heights, weight limits, or hazmat restrictions. HERE does. Not a cost question — a correctness question for a 13'6\" trailer. Nobody has signed up for a HERE key yet, so the platform currently plans truck trips on car routes.",
  },
  {
    id: "geocoding",
    title: "Address lookup — Google Geocoding vs nothing",
    a: { id: "google_maps", label: "Google Geocoding / Places", cost: "Already on the billed project" },
    b: { id: null, label: "No provider", cost: "—" },
    decided: false,
    decision:
      "Not an overlap, a gap. Geocoding, Places, Distance Matrix, Elevation, Time Zone and Roads are all NOT enabled on Google project 405307027459, so every call to them fails. Enabling them costs nothing and unblocks address search, real fuel-stop locations, and real truck-parking locations.",
  },
  {
    id: "eld",
    title: "Telematics — Azuga vs Samsara vs Geotab",
    a: { id: "azuga", label: "Azuga", cost: "Route built, key rejected" },
    b: { id: "samsara", label: "Samsara / Geotab", cost: "No credentials, no code" },
    decided: false,
    decision:
      "Open, but only one of them is close. The Azuga v2 route is written and works; Azuga refuses the key we hold, so it needs one issued for this fleet account. Samsara and Geotab have no key and no code at all. Pick one and finish it — three half-integrations is worse than one that reports real GPS.",
  },
  {
    id: "email",
    title: "Email — Resend vs Postmark vs Mailgun",
    a: { id: "email", label: "Any transactional provider", cost: "~$0–20/mo at our volume" },
    b: { id: null, label: "Amazon SES", cost: "Cheapest, but ruled out" },
    decided: false,
    decision:
      "Open and blocking. Nothing can be emailed today, which is why TRAXES files a scanned BOL but never claims it sent it to a broker. SES is ruled out because the platform uses no AWS, and the SES MX record on morrishive.com is Jeremiah's existing inbound mail, not our sender. Any of the other three works; the decision matters more than the choice.",
  },
  {
    id: "loads",
    title: "Freight data — DAT vs Uber Freight vs CH Robinson",
    a: { id: "dat", label: "DAT", cost: "Paid subscription" },
    b: { id: null, label: "Uber Freight / CH Robinson", cost: "Partner approval" },
    decided: false,
    decision:
      "Open, and nothing is connected. The 5 loads in the database are seeded test rows and the load board says so. This is a real integration with a real bill behind it, not something to switch on for launch week.",
  },
  {
    id: "billing",
    title: "Payments — Autumn test key vs live key",
    a: { id: "autumn", label: "Autumn (test)", cost: "In place, cannot charge" },
    b: { id: null, label: "Autumn (live)", cost: "Same, live mode" },
    decided: true,
    decision:
      "Decided, not done: the same provider needs a live key. Every /api/subscriptions response returns billing.live = false on purpose while the test key is in place, so no page can claim a charge succeeded. No money can move until this is swapped.",
  },
];

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

function Stat({ value, label }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: "10px 16px", minWidth: 120 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, color: C.goldBright }}>{value}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const STATE_META = {
  connected: { label: "CONNECTED", color: C.gold, Icon: CheckCircle2 },
  unknown: { label: "KEY PRESENT, UNVERIFIED", color: C.muted, Icon: HelpCircle },
  rejected: { label: "KEY REJECTED", color: C.warn, Icon: XCircle },
  not_connected: { label: "NOT CONNECTED", color: C.dim, Icon: XCircle },
};

function SideBadge({ side, byId }) {
  const p = side.id ? byId[side.id] : null;
  const meta = p ? STATE_META[p.state] ?? STATE_META.not_connected : null;
  const Icon = meta?.Icon;
  return (
    <div style={{ border: `1px solid ${C.border}`, background: "#0f0f0f", borderRadius: 4, padding: 14, flex: "1 1 260px" }}>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: C.white, letterSpacing: "0.06em" }}>{side.label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim, marginTop: 6 }}>{side.cost}</div>
      <div style={{ marginTop: 10 }}>
        {meta ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 3, padding: "4px 9px" }}>
            <Icon size={12} color={meta.color} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: meta.color }}>{meta.label}</span>
          </span>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.dim }}>not tracked as a provider</span>
        )}
      </div>
    </div>
  );
}

export default function APIDiagnosticPage() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setErr("");
    try {
      const j = await getJSON("/api/integrations/status");
      setData(j);
      setState("ok");
    } catch (e) {
      setErr(String(e.message || e));
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byId = {};
  for (const p of data?.providers ?? []) byId[p.id] = p;

  const decidedCount = OVERLAPS.filter((o) => o.decided).length;
  const openCount = OVERLAPS.length - decidedCount;

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`, padding: "26px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 11px" }}>
            <GitCompareArrows size={13} color={C.gold} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: C.gold }}>OVERLAP REVIEW</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1.02, margin: "14px 0 0", letterSpacing: "0.02em" }}>
            WHERE TWO VENDORS WOULD DO THE <span style={{ color: C.goldBright }}>SAME JOB</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, maxWidth: 880, marginTop: 10 }}>
            Eight places where the platform either pays twice for one capability, or has to pick. Each row shows the real
            state of both sides, pulled live from the server, and either the decision already made or the fact that it is
            still open. There are no invented accuracy comparisons here and no vendor is called active because a badge
            looked better green.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
            <Stat value={OVERLAPS.length} label="OVERLAPS" />
            <Stat value={decidedCount} label="DECIDED" />
            <Stat value={openCount} label="STILL OPEN" />
            <Stat value={data?.counts?.rejected ?? "—"} label="KEYS REJECTED" />
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
        {state === "error" ? (
          <Panel title="Could not load provider state" icon={AlertTriangle} note="GET /api/integrations/status">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.warn }}>{err}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 10 }}>
              The overlap analysis below is still accurate — only the live badges are missing.
            </div>
          </Panel>
        ) : null}

        {OVERLAPS.map((o) => (
          <Panel key={o.id} title={o.title} icon={Scale} note="GET /api/integrations/status">
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <SideBadge side={o.a} byId={byId} />
              <SideBadge side={o.b} byId={byId} />
            </div>
            <div
              style={{
                marginTop: 14, border: `1px ${o.decided ? "solid" : "dashed"} ${o.decided ? C.border : "#333"}`,
                borderRadius: 4, padding: 14, background: C.nav,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {o.decided ? <CheckCircle2 size={14} color={C.gold} /> : <AlertTriangle size={14} color={C.warn} />}
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: o.decided ? C.gold : C.warn }}>
                  {o.decided ? "DECISION MADE" : "DECISION STILL OPEN"}
                </span>
              </div>
              <div style={{ fontSize: 14, color: C.white, marginTop: 8, lineHeight: 1.7 }}>{o.decision}</div>
            </div>
          </Panel>
        ))}

        <Panel title="What this page cannot tell you" icon={AlertTriangle}>
          <div style={{ border: "1px dashed #333", borderRadius: 4, padding: 14, display: "flex", gap: 12 }}>
            <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: C.warn }}>MISSING / NOT TRACKED</div>
              <div style={{ fontSize: 14, color: C.white, marginTop: 4 }}>No accuracy, latency, or cost measurements</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>
                Comparing two vendors properly means running the same 100 documents, or the same 100 routes, through both
                and counting the differences. That has not been done for any pair on this page, and no invoice data is in
                the platform, so no dollar figure here is measured either. Every line above is either a fact about what is
                wired or an explicit open question.
              </div>
            </div>
          </div>
        </Panel>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
          Provider state is read from GET /api/integrations/status. This page does not display, collect, or store any
          provider key.
        </div>
      </div>
    </div>
  );
}
