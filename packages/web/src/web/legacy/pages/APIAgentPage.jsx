/**
 * Integration status board — read-only.
 *
 * Rewritten 2026-08-28. The original is preserved at
 * docs/launch/APIAgentPage.ORIGINAL.jsx.txt. WHAT WAS DELETED AND WHY:
 *
 * 1. THE CREDENTIAL FORM. The old page was a browser form that asked the user to
 *    type ~40 provider secrets — openai_api_key, aws_access_key_id, twilio_token,
 *    serpapi_key, dat_api_key, here_api_key, greenscreens_api_key, gasbuddy_api_key,
 *    efs_api_key, comdata_api_key, triumphpay_api_key, apex_api_key, rts_api_key
 *    and more — and saved them to a PocketBase collection ("platform_settings")
 *    that has never existed. Any key typed there was either lost or exposed. No
 *    provider key is ever entered in, stored in, or read by the browser. Keys live
 *    in the server environment only.
 * 2. `new PocketBase()` and the whole PocketBase read. This page now reads one
 *    honest server endpoint: GET /api/integrations/status.
 * 3. THE FAKE ACTIVITY LOG. Nine invented log lines: "Full API health scan
 *    complete — 18 services verified", "OpenAI responding — all 12 Dream Team
 *    agents online", "SerpAPI quota check — 847 of 100,000 monthly searches used",
 *    "Facebook token check — 23 days remaining", "Twilio Fleet Voice — 3 active
 *    lines confirmed healthy", "FMCSA renewal reminder set — 147 days", "Ghost
 *    Nerve Twitter/X feed — live freight events flowing", "Geotab connection
 *    status — awaiting credentials from meeting", "World News feed — freight
 *    intelligence active". Nothing measured any of it. There is no activity log,
 *    because nothing logs integration activity yet.
 * 4. THE FAKE SCAN. runScan() was a setInterval that counted a progress bar to
 *    100 and then wrote a summary line. It called nothing. Replaced with a real
 *    per-provider probe: POST /api/integrations/probe/:id, which makes an actual
 *    HTTP request to the vendor and prints the status code it got back.
 * 5. THE AUTOCAB ENTRY claiming "TruckWithEase Quantum Core surpasses all Autocab
 *    dispatch capabilities across 12 layers". The platform never scores itself
 *    against a competitor.
 * 6. Off-brand palette (#f5a623 amber, #0d1117 and #1a2540 navy, #4a9eff blue,
 *    #00d4aa teal) and 40 vendor-brand colors. Now gold on black.
 * 7. Emoji icons, which render as empty boxes in several environments. Now
 *    lucide-react.
 */

import { useState, useEffect, useCallback } from "react";
import {
  KeyRound, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  HelpCircle, Radio, ShieldCheck,
} from "lucide-react";

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

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}
async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

function Panel({ title, note, right, icon, children }) {
  const Icon = icon;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icon ? <Icon size={16} color={C.gold} /> : null}
          <div style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: C.goldBright }}>{title}</div>
        </div>
        {right}
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
    <div style={{ border: `1px dashed #333`, borderRadius: 4, padding: 14, display: "flex", gap: 12, alignItems: "flex-start", marginTop: 10 }}>
      <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: C.warn }}>MISSING / NOT TRACKED</div>
        <div style={{ fontSize: 14, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.55 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: "10px 16px", minWidth: 110 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, color: C.goldBright }}>{value}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const STATE_META = {
  connected: { label: "CONNECTED", color: C.gold, Icon: CheckCircle2 },
  unknown: { label: "KEY PRESENT — NOT VERIFIED NOW", color: C.muted, Icon: HelpCircle },
  rejected: { label: "KEY REJECTED BY VENDOR", color: C.warn, Icon: XCircle },
  not_connected: { label: "NOT CONNECTED", color: C.dim, Icon: XCircle },
};

function ProviderCard({ p, probe, probing, result }) {
  const meta = STATE_META[p.state] ?? STATE_META.not_connected;
  const Icon = meta.Icon;
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, letterSpacing: "0.08em", color: C.white }}>{p.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.dim, marginTop: 3 }}>{p.category}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 10px" }}>
          <Icon size={13} color={meta.color} />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: meta.color }}>{meta.label}</span>
        </div>
      </div>

      <div style={{ fontSize: 13, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>{p.purpose}</div>
      <div style={{ fontSize: 13, color: C.white, marginTop: 10, lineHeight: 1.6 }}>{p.reason}</div>

      <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
        <div style={{ display: "flex", gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          <span style={{ color: C.dim, minWidth: 108 }}>env vars</span>
          <span style={{ color: p.envKeys.length ? C.white : C.dim }}>
            {p.envKeys.length ? p.envKeys.join(", ") : "none — nothing to configure yet"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          <span style={{ color: C.dim, minWidth: 108 }}>read by</span>
          <span style={{ color: p.usedBy.length ? C.white : C.dim }}>
            {p.usedBy.length ? p.usedBy.join("  ") : "nothing in the codebase reads it"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
        {p.probeable ? (
          <button
            onClick={() => probe(p.id)}
            disabled={probing}
            style={{
              background: "transparent", border: `1px solid ${C.gold}`, color: C.goldBright,
              fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.18em",
              padding: "7px 14px", borderRadius: 3, cursor: probing ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 7, textTransform: "uppercase",
              opacity: probing ? 0.6 : 1,
            }}
          >
            <Radio size={12} className={probing ? "spin" : undefined} /> Probe live
          </button>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim }}>No probe — there is nothing connected to call.</span>
        )}
        {p.docsUrl ? (
          <a href={p.docsUrl} target="_blank" rel="noreferrer" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.gold }}>
            vendor console →
          </a>
        ) : null}
      </div>

      {result ? (
        <div style={{ marginTop: 12, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12, background: "#0f0f0f" }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: result.ok ? C.gold : C.warn }}>
            {result.ok ? "LIVE CALL SUCCEEDED" : "LIVE CALL FAILED"}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.white, marginTop: 6, lineHeight: 1.6 }}>
            {result.detail}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.dim, marginTop: 6 }}>
            http {result.httpStatus ?? "—"} · {result.latencyMs} ms · {result.probedAt}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function APIAgentPage() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");
  const [probing, setProbing] = useState(null);
  const [results, setResults] = useState({});

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

  const probe = useCallback(async (id) => {
    setProbing(id);
    try {
      const j = await postJSON(`/api/integrations/probe/${id}`);
      setResults((r) => ({ ...r, [id]: j }));
    } catch (e) {
      setResults((r) => ({ ...r, [id]: { ok: false, detail: String(e.message || e), httpStatus: null, latencyMs: 0, probedAt: new Date().toISOString() } }));
    } finally {
      setProbing(null);
    }
  }, []);

  const providers = data?.providers ?? [];
  const counts = data?.counts ?? {};
  const groups = ["AI", "Infrastructure", "Messaging", "Maps & routing", "Telematics", "Weather", "Freight", "Compliance", "Reference data", "Payments"];
  const grouped = groups
    .map((g) => ({ g, items: providers.filter((p) => p.category === g) }))
    .filter((x) => x.items.length);

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`, padding: "26px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 11px" }}>
            <KeyRound size={13} color={C.gold} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: C.gold }}>INTEGRATIONS</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1.02, margin: "14px 0 0", letterSpacing: "0.02em" }}>
            WHAT IS ACTUALLY <span style={{ color: C.goldBright }}>CONNECTED</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, maxWidth: 860, marginTop: 10 }}>
            Every outside service the platform depends on, and the truth about each one. A provider shows as connected only
            when a key exists on the server and something in the code reads it. A key the vendor rejects shows as rejected,
            not as active. This page cannot show you a key and cannot set one — no provider secret is ever sent to or typed
            into the browser. Keys live in the server environment.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
            <Stat value={counts.total ?? "—"} label="PROVIDERS" />
            <Stat value={counts.connected ?? "—"} label="CONNECTED" />
            <Stat value={counts.keyPresentUnverified ?? "—"} label="KEY, UNVERIFIED" />
            <Stat value={counts.rejected ?? "—"} label="REJECTED" />
            <Stat value={counts.notConnected ?? "—"} label="NOT CONNECTED" />
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

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px" }}>
        {state === "error" ? (
          <Panel title="Could not load integration status" icon={AlertTriangle} note="GET /api/integrations/status">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.warn }}>{err}</div>
          </Panel>
        ) : null}

        {state === "loading" && !data ? (
          <Panel title="Loading" icon={RefreshCw} note="GET /api/integrations/status">
            <div style={{ color: C.muted, fontSize: 14 }}>Reading the server environment…</div>
          </Panel>
        ) : null}

        {grouped.map(({ g, items }) => (
          <Panel
            key={g}
            title={g}
            icon={ShieldCheck}
            note="GET /api/integrations/status · POST /api/integrations/probe/:id"
          >
            <div style={{ display: "grid", gap: 14 }}>
              {items.map((p) => (
                <ProviderCard key={p.id} p={p} probe={probe} probing={probing === p.id} result={results[p.id]} />
              ))}
            </div>
          </Panel>
        ))}

        {data ? (
          <Panel title="What this page will not do" icon={AlertTriangle}>
            <div style={{ display: "grid", gap: 10 }}>
              <Missing
                label="No key entry, anywhere in the app"
                reason="Provider secrets are set in the server environment by whoever runs the deployment. A page that collects them in a browser leaks them, and the old version of this page did exactly that for about forty vendors."
              />
              <Missing
                label="No integration activity log"
                reason="Nothing in the platform records integration calls yet, so there is no history to show. The old page printed nine invented log lines instead. Each probe result above is the only real measurement on this page, and it disappears on reload."
              />
              <Missing
                label="No quota, expiry, or renewal countdown"
                reason="No vendor here exposes quota or key-expiry to us today, and we do not store issue dates. Any number in that shape would be made up."
              />
            </div>
          </Panel>
        ) : null}

        {data ? (
          <Panel title="What would make this real" icon={CheckCircle2}>
            <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 14, lineHeight: 1.85 }}>
              <li>Pick an email provider — Resend, Postmark, or Mailgun. It is the last thing standing between a scanned BOL and a broker's inbox.</li>
              <li>Enable Geocoding and Places on the existing Google project. Free, and it unblocks address lookup, real fuel stops, and real parking locations.</li>
              <li>File the A2P 10DLC campaign and attach the sending number, or driver SMS will keep getting rejected by carriers.</li>
              <li>Get an Azuga key issued for this fleet account. The code is built and waiting; the current key is refused.</li>
              <li>Swap the Autumn test key for a live one before launch, or nothing can be charged.</li>
            </ol>
          </Panel>
        ) : null}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
          State on this page comes from environment-variable presence plus real HTTP responses. It does not prove a vendor
          will keep answering, it does not measure uptime, and it does not audit permissions or scopes on a key. A green
          state means a call worked once, when you clicked it.
        </div>
      </div>
    </div>
  );
}
