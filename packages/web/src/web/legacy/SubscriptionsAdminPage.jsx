import { useEffect, useState } from "react";

/**
 * SubscriptionsAdminPage — server-backed.
 *
 * The original read PocketBase collections `subscriptions` and `signups`, which
 * existed on no server, so this page always rendered empty — and it hard-coded a
 * banner claiming "You have 3 active members — Jeremiah Morris, Kyleigh Morris,
 * and Bridget Taft — all on Pro." That was text, not data. It is gone.
 * Original kept at docs/launch/SubscriptionsAdminPage.ORIGINAL.jsx.txt.
 *
 * Now reads /api/subscriptions/list and /api/signup/list (Turso) and can move a
 * signup's status. Repainted gold-on-black.
 */

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#777";

const STATUS_COLOR = {
  active: "#4ade80",
  trialing: GOLD_BRIGHT,
  past_due: "#fbbf24",
  cancelled: "#a1a1aa",
  new: GOLD_BRIGHT,
  contacted: "#60a5fa",
  activated: "#4ade80",
  rejected: "#a1a1aa",
};

export default function SubscriptionsAdminPage() {
  const [subs, setSubs] = useState([]);
  const [subMeta, setSubMeta] = useState(null);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("subscriptions");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [a, b] = await Promise.all([
        fetch("/api/subscriptions/list").then((r) => r.json()),
        fetch("/api/signup/list").then((r) => r.json()),
      ]);
      setSubs(a.subscriptions || []);
      setSubMeta(a);
      setSignups(b.signups || []);
    } catch {
      setErr("Could not reach the server. This list is not showing live data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setSignupStatus(id, status) {
    setBusy(id);
    try {
      await fetch(`/api/signup/${id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  const records = tab === "subscriptions" ? subs : signups;
  const q = search.trim().toLowerCase();
  const filtered = records.filter((r) => {
    if (!q) return true;
    return [r.contactEmail, r.email, r.accountName, r.name, r.company].some((v) => (v || "").toLowerCase().includes(q));
  });

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const activeCount = subs.filter((s) => s.status === "active").length;
  const trialingCount = subs.filter((s) => s.status === "trialing").length;

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "#e5e5e5", fontFamily: "Inter, system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>TruckWithEase Admin</div>
            <h1 style={{ margin: 0, fontFamily: "'Bebas Neue',Oswald,sans-serif", fontSize: 34, letterSpacing: 1, color: "#fff" }}>SUBSCRIBER INBOX</h1>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Live from the database. Nothing on this page is placeholder text.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { v: subMeta ? `$${(subMeta.contractedMrr ?? 0).toFixed(2)}` : "—", l: "Contracted MRR" },
              { v: activeCount, l: "Active" },
              { v: trialingCount, l: "On trial" },
              { v: signups.length, l: "Signups" },
            ].map((s) => (
              <div key={s.l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 104 }}>
                <div style={{ color: GOLD_BRIGHT, fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Honesty banner — replaces the old fabricated "3 active members" copy. */}
        {subMeta?.billing && !subMeta.billing.live && (
          <div style={{ background: CARD, border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "13px 18px", marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: GOLD, fontSize: 13, marginBottom: 3 }}>No money has moved through this app</div>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>{subMeta.billing.note}</div>
            {subMeta.mrrNote && <div style={{ color: MUTED, fontSize: 12, marginTop: 5 }}>{subMeta.mrrNote}</div>}
          </div>
        )}

        {err && (
          <div style={{ background: "#1a1212", border: "1px solid #5c2f2f", borderRadius: 10, padding: "11px 16px", color: "#fca5a5", fontSize: 13, marginBottom: 18 }}>{err}</div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 4, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 4 }}>
            {[
              { id: "subscriptions", label: `Subscriptions (${subs.length})` },
              { id: "signups", label: `Signups (${signups.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ background: tab === t.id ? GOLD : "transparent", color: tab === t.id ? BLACK : MUTED, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 0.6, textTransform: "uppercase", fontFamily: "inherit" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 14px", color: "#e5e5e5", fontSize: 13, width: 250, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: MUTED, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#ddd" }}>Nothing here yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {tab === "subscriptions"
                ? "No subscription records exist. They appear the moment one is created."
                : "No signups yet. The signup form at /signup-original writes straight into this list."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {filtered.map((r) => {
              const isSub = tab === "subscriptions";
              const name = isSub ? r.accountName : r.name || "—";
              const email = isSub ? r.contactEmail : r.email;
              const status = r.status || "new";
              const color = STATUS_COLOR[status] || GOLD;
              return (
                <div key={r.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 240 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1f1a10", color: GOLD_BRIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{name}</div>
                      <div style={{ color: MUTED, fontSize: 12 }}>{email}</div>
                      {!isSub && r.company ? <div style={{ color: "#555", fontSize: 11 }}>{r.company}</div> : null}
                      {!isSub && r.mcNumber ? <div style={{ color: "#555", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>MC {r.mcNumber}</div> : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
                    {r.plan && (
                      <div style={{ background: "#1f1a10", border: `1px solid ${GOLD}44`, borderRadius: 7, padding: "4px 11px", color: GOLD_BRIGHT, fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>
                        {r.plan}
                      </div>
                    )}
                    {isSub && r.pricing && (
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}>
                        ${r.pricing.monthlyTotal.toFixed(2)}/mo
                        <span style={{ color: MUTED, fontWeight: 400, fontSize: 11 }}> · {r.pricing.units} {r.pricing.unit}</span>
                      </div>
                    )}
                    <div style={{ border: `1px solid ${color}55`, borderRadius: 6, padding: "3px 10px", color, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                      ● {status.replace("_", " ")}
                    </div>
                    {isSub && r.trialEndsAt && r.status === "trialing" && (
                      <div style={{ color: MUTED, fontSize: 11 }}>trial ends {fmt(r.trialEndsAt)}</div>
                    )}
                    <div style={{ color: "#555", fontSize: 11 }}>{fmt(r.createdAt)}</div>

                    {!isSub && (
                      <select
                        value={status}
                        disabled={busy === r.id}
                        onChange={(e) => setSignupStatus(r.id, e.target.value)}
                        style={{ background: "#0f0f0f", border: `1px solid ${BORDER}`, color: "#ddd", borderRadius: 7, padding: "6px 9px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {["new", "contacted", "activated", "rejected"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 28, padding: "14px 18px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: MUTED, fontSize: 12, lineHeight: 1.6 }}>
          Billing disputes and refund requests live on <a href="/support-billing" style={{ color: GOLD }}>Support Billing</a>. Trial links are generated from the same API at <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>/api/signup/trial-links</span>. SMS alerts for new signups are not wired — A2P registration has to clear first (<a href="/a2p" style={{ color: GOLD }}>A2P</a>).
        </div>
      </div>
    </div>
  );
}
