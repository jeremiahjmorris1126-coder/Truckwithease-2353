import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const PLAN_COLORS = {
  solo: "#F59E0B",
  pro: "#3B82F6",
  fleet_rental: "#8B5CF6",
  fleet_owned: "#10B981",
};

const PLAN_LABELS = {
  solo: "Solo $29.99",
  pro: "Pro $39.99",
  fleet_rental: "Fleet Rental $49.99",
  fleet_owned: "Fleet Owned $59.99/seat",
};

export default function SubscriptionsAdminPage() {
  const [subs, setSubs] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("subscriptions");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        // Load subscriptions
        const subRes = await pb.collection("subscriptions").getList(1, 200, {
          sort: "-created",
          signal: controller.signal,
        });
        setSubs(subRes.items || []);

        // Load signups
        const sigRes = await pb.collection("signups").getList(1, 200, {
          sort: "-created",
          signal: controller.signal,
        });
        setSignups(sigRes.items || []);
      } catch (e) {
        if (!e?.isAbort) console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const allRecords = tab === "subscriptions" ? subs : signups;
  const filtered = allRecords.filter(r => {
    const q = search.toLowerCase();
    return !q || (r.user_email || r.email || "").toLowerCase().includes(q) ||
      (r.user_name || r.name || "").toLowerCase().includes(q);
  });

  const totalMRR = subs.filter(s => s.status === "active").reduce((acc, s) => acc + (Number(s.price) || 0), 0);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const colors = {
    bg: "#0A0A0F",
    card: "#12121A",
    border: "#1E1E2E",
    gold: "#F59E0B",
    text: "#E2E8F0",
    muted: "#64748B",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: colors.gold, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>TruckWithEase Admin</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#FFF" }}>Subscriber Inbox</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>Every new subscription and signup lands here instantly</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ color: colors.gold, fontSize: 22, fontWeight: 800 }}>${totalMRR.toFixed(2)}</div>
              <div style={{ color: colors.muted, fontSize: 11, fontWeight: 600 }}>MONTHLY REVENUE</div>
            </div>
            <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ color: "#3B82F6", fontSize: 22, fontWeight: 800 }}>{subs.filter(s => s.status === "active").length}</div>
              <div style={{ color: colors.muted, fontSize: 11, fontWeight: 600 }}>ACTIVE SUBS</div>
            </div>
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ color: "#10B981", fontSize: 22, fontWeight: 800 }}>{signups.length}</div>
              <div style={{ color: colors.muted, fontSize: 11, fontWeight: 600 }}>TOTAL SIGNUPS</div>
            </div>
          </div>
        </div>

        {/* Notification banner */}
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>📬</span>
          <div>
            <div style={{ fontWeight: 700, color: colors.gold, fontSize: 14 }}>Where new subscribers go</div>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
              Every checkout completion saves instantly to this page. You have <strong style={{ color: "#FFF" }}>3 active members</strong> — Jeremiah Morris, Kyleigh Morris, and Bridget Taft — all on Pro. No email relay needed; this inbox is your live subscriber dashboard.
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 4, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 4 }}>
            {[
              { id: "subscriptions", label: `💳 Subscriptions (${subs.length})` },
              { id: "signups", label: `👤 All Signups (${signups.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? colors.gold : "transparent",
                color: tab === t.id ? "#000" : colors.muted,
                border: "none", borderRadius: 8, padding: "8px 16px",
                fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
              }}>{t.label}</button>
            ))}
          </div>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 14px", color: colors.text, fontSize: 13, width: 240, outline: "none" }}
          />
        </div>

        {/* Records */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: colors.muted }}>Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: colors.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>No subscribers yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>They'll appear here the moment someone signs up</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((r, i) => {
              const email = r.user_email || r.email || "—";
              const name = r.user_name || r.name || "—";
              const plan = r.plan || "pro";
              const price = r.price ? `$${Number(r.price).toFixed(2)}/mo` : "";
              const status = r.status || "active";
              const planColor = PLAN_COLORS[plan] || colors.gold;

              return (
                <div key={r.id || i} style={{
                  background: colors.card, border: `1px solid ${colors.border}`,
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 12,
                  borderLeft: `3px solid ${planColor}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${planColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: planColor }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#FFF" }}>{name}</div>
                      <div style={{ color: colors.muted, fontSize: 13 }}>{email}</div>
                      {r.user_phone || r.phone ? <div style={{ color: colors.muted, fontSize: 12 }}>{r.user_phone || r.phone}</div> : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ background: `${planColor}18`, border: `1px solid ${planColor}44`, borderRadius: 8, padding: "4px 12px" }}>
                      <span style={{ color: planColor, fontWeight: 700, fontSize: 12 }}>{PLAN_LABELS[plan] || plan.toUpperCase()}</span>
                    </div>
                    {price && <div style={{ color: "#FFF", fontWeight: 700, fontSize: 15 }}>{price}</div>}
                    <div style={{
                      background: status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      border: `1px solid ${status === "active" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                      borderRadius: 6, padding: "3px 10px"
                    }}>
                      <span style={{ color: status === "active" ? "#10B981" : "#EF4444", fontSize: 11, fontWeight: 700 }}>
                        {status === "active" ? "● ACTIVE" : "● " + status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: colors.muted, fontSize: 12 }}>{fmt(r.created)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <div style={{ color: colors.muted, fontSize: 13 }}>
            <strong style={{ color: colors.text }}>Want text alerts for new signups?</strong> Signal Sam can send you an SMS the moment anyone subscribes — go to <a href="/fleet-voice" style={{ color: colors.gold }}>Fleet Voice</a> and activate your notification number.
          </div>
        </div>

      </div>
    </div>
  );
}
