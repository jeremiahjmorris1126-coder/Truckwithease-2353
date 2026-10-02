import { useState, useEffect, useCallback } from "react";

/**
 * Twilio setup — rewritten server-side.
 *
 * The original version of this page rendered a form that asked the operator to
 * type an Account SID and Auth Token into the browser and wrote them to a
 * PocketBase collection that existed on no server. Two problems: nothing was
 * ever saved, and an auth token in browser state is a credential leak.
 *
 * This version never collects a secret. Credentials live in `.env` on the
 * server; the page reads their status from /api/twilio, which makes a real call
 * to Twilio. Domain verification tokens are stored server-side and checked with
 * a real public DNS lookup — this app cannot and does not mark a domain
 * verified on Twilio's behalf.
 */

const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#ffd700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const fieldBase = {
  width: "100%",
  background: BLACK,
  border: `1px solid ${BORDER}`,
  color: "#fff",
  padding: "10px 13px",
  borderRadius: 8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = { fontSize: 11, color: MUTED, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase" };

const card = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 22,
  marginBottom: 18,
};

const btnGold = {
  background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`,
  color: "#0a0a0a",
  border: "none",
  borderRadius: 9,
  padding: "11px 22px",
  fontWeight: 800,
  fontFamily: "'Oswald', sans-serif",
  letterSpacing: 1,
  fontSize: 13,
  textTransform: "uppercase",
  cursor: "pointer",
};

const btnGhost = {
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}55`,
  borderRadius: 9,
  padding: "9px 18px",
  fontWeight: 700,
  fontFamily: "'Oswald', sans-serif",
  letterSpacing: 1,
  fontSize: 12,
  textTransform: "uppercase",
  cursor: "pointer",
};

function Pill({ ok, children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: ok ? GOLD_BRIGHT : WARN,
        background: ok ? "rgba(255,215,0,0.12)" : "rgba(201,106,76,0.12)",
        border: `1px solid ${ok ? "rgba(255,215,0,0.35)" : "rgba(201,106,76,0.35)"}`,
      }}
    >
      {children}
    </span>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ color: MUTED, fontSize: 13 }}>{k}</span>
      <span style={{ color: "#fff", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "right", wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}

export default function TwilioSetupPage() {
  const [health, setHealth] = useState(null);
  const [numbers, setNumbers] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ domain: "", token: "", recordName: "@", purpose: "link_shortening" });
  const [checks, setChecks] = useState({});
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, n, d] = await Promise.all([
        fetch("/api/twilio").then((r) => r.json()),
        fetch("/api/twilio/numbers").then((r) => r.json()),
        fetch("/api/twilio/domains").then((r) => r.json()),
      ]);
      setHealth(h);
      setNumbers(n);
      setDomains(d.domains || []);
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addDomain = async () => {
    setError("");
    setBusy("add");
    try {
      const res = await fetch("/api/twilio/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Could not save that token");
      else {
        setForm({ ...form, domain: "", token: "" });
        await load();
      }
    } catch (e) {
      setError(String(e));
    }
    setBusy("");
  };

  const checkDomain = async (id) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/twilio/domains/${id}/check`, { method: "POST" });
      const data = await res.json();
      setChecks((c) => ({ ...c, [id]: data }));
      await load();
    } catch (e) {
      setError(String(e));
    }
    setBusy("");
  };

  const removeDomain = async (id) => {
    setBusy(id);
    await fetch(`/api/twilio/domains/${id}`, { method: "DELETE" });
    await load();
    setBusy("");
  };

  const copy = (text, tag) => {
    navigator.clipboard?.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(""), 1600);
  };

  const connected = health?.connected;

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "#fff", fontFamily: "'Inter', sans-serif", padding: "36px 20px 80px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 2, color: GOLD_BRIGHT, lineHeight: 1 }}>
            TWILIO SETUP
          </div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>
            Account status, sending numbers, and domain verification. Credentials are read from the server — nothing secret is typed
            into or shown on this page.
          </div>
        </div>

        {error ? (
          <div style={{ ...card, borderColor: `${WARN}55`, color: WARN, fontSize: 13 }}>{error}</div>
        ) : null}

        {/* ── Account ─────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: 1.4, textTransform: "uppercase", color: GOLD }}>
              Account
            </div>
            {loading ? <span style={{ color: DIM, fontSize: 12 }}>checking…</span> : <Pill ok={connected}>{connected ? "Connected" : "Not connected"}</Pill>}
          </div>

          {health && connected ? (
            <>
              <Row k="Account SID" v={health.accountSid} />
              <Row k="Friendly name" v={health.friendlyName || "—"} />
              <Row k="Account status" v={String(health.accountStatus || "—")} />
              <Row k="Account type" v={String(health.accountType || "—")} />
              <Row k="Sending number (.env)" v={health.fromNumber || "not set"} />
              <div style={{ color: DIM, fontSize: 12, marginTop: 12 }}>{health.secretsNote}</div>
            </>
          ) : health ? (
            <div style={{ color: WARN, fontSize: 13 }}>{health.reason}{health.twilioError ? ` — ${health.twilioError}` : ""}</div>
          ) : null}
        </div>

        {/* ── Numbers ─────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: 1.4, textTransform: "uppercase", color: GOLD, marginBottom: 14 }}>
            Phone numbers on this account
          </div>
          {numbers?.numbers?.length ? (
            numbers.numbers.map((n) => (
              <div key={n.sid} style={{ padding: "11px 0", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: GOLD_BRIGHT }}>{n.phoneNumber}</div>
                <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
                  {n.friendlyName} · SMS {n.smsCapable ? "yes" : "no"} · Voice {n.voiceCapable ? "yes" : "no"}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: MUTED, fontSize: 13 }}>{numbers?.note || (loading ? "loading…" : "—")}</div>
          )}
        </div>

        {/* ── Domain verification ─────────────────────────────────── */}
        <div style={card}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: 1.4, textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>
            Domain verification
          </div>
          <div style={{ color: MUTED, fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
            Twilio proves you own a domain by reading a DNS <b style={{ color: "#fff" }}>TXT</b> record. Save the token here, add the
            record at IONOS, then press Check DNS. This app only reports what public DNS returns — Twilio's console still makes the
            final call.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={labelStyle}>Domain</div>
              <input
                style={fieldBase}
                placeholder="truckwithease.morrishive.com"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
              />
            </div>
            <div>
              <div style={labelStyle}>Record host</div>
              <input style={fieldBase} value={form.recordName} onChange={(e) => setForm({ ...form, recordName: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Verification token from Twilio</div>
            <input
              style={{ ...fieldBase, fontFamily: "'JetBrains Mono', monospace" }}
              placeholder="twilio-domain-verification=…"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
            />
          </div>
          <button style={btnGold} onClick={addDomain} disabled={busy === "add"}>
            {busy === "add" ? "Saving…" : "Save token"}
          </button>

          <div style={{ marginTop: 22 }}>
            {domains.map((d) => {
              const chk = checks[d.id];
              return (
                <div key={d.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 12, background: BLACK }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, letterSpacing: 1, color: "#fff" }}>{d.domain}</div>
                    <Pill ok={Boolean(d.verifiedAt)}>{d.verifiedAt ? "TXT found in DNS" : "Not in DNS yet"}</Pill>
                  </div>

                  <div style={{ marginTop: 12, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 12 }}>
                    <div style={{ ...labelStyle, marginBottom: 8 }}>Add this record at IONOS</div>
                    <Row k="Type" v="TXT" />
                    <Row k="Host" v={d.recordName || "@"} />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0" }}>
                      <span style={{ color: MUTED, fontSize: 13 }}>Value</span>
                      <span style={{ color: GOLD_BRIGHT, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textAlign: "right", wordBreak: "break-all" }}>
                        {d.token}
                      </span>
                    </div>
                    <button style={{ ...btnGhost, marginTop: 4 }} onClick={() => copy(d.token, d.id)}>
                      {copied === d.id ? "Copied" : "Copy value"}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button style={btnGold} onClick={() => checkDomain(d.id)} disabled={busy === d.id}>
                      {busy === d.id ? "Looking up…" : "Check DNS"}
                    </button>
                    <button style={btnGhost} onClick={() => removeDomain(d.id)} disabled={busy === d.id}>
                      Remove
                    </button>
                  </div>

                  {chk ? (
                    <div style={{ marginTop: 12, fontSize: 12.5, color: chk.found ? GOLD_BRIGHT : WARN, lineHeight: 1.6 }}>
                      {chk.meaning}
                      <div style={{ color: DIM, marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                        checked: {(chk.hostsChecked || []).map((h) => h.host).join(", ")}
                      </div>
                    </div>
                  ) : d.lastCheckedAt ? (
                    <div style={{ color: DIM, fontSize: 12, marginTop: 10 }}>Last checked {new Date(d.lastCheckedAt).toLocaleString()}</div>
                  ) : null}
                </div>
              );
            })}
            {!domains.length && !loading ? <div style={{ color: DIM, fontSize: 13 }}>No verification tokens saved yet.</div> : null}
          </div>
        </div>

        {/* ── What this page will not do ──────────────────────────── */}
        <div style={{ ...card, borderColor: `${GOLD}33` }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 1.4, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>
            What this page does not do
          </div>
          <ul style={{ color: MUTED, fontSize: 13, lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
            <li>It does not accept an Auth Token. Credentials belong in <code style={{ color: "#fff" }}>.env</code> on the server, not in a browser form.</li>
            <li>It does not edit DNS. The TXT record has to be added at IONOS.</li>
            <li>It does not mark a domain verified with Twilio. Only Twilio can do that, in their console.</li>
            <li>A2P 10DLC brand filing lives on the A2P page and needs your Trust Hub bundle SIDs first.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
