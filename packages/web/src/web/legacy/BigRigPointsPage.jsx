import { useState, useEffect } from "react";
import { pb } from "./lib/pb";

const GOLD = "#c9a84c";
const BG = "#0a0a0a";
const CARD = "#111111";
const CARD2 = "#161616";
const BORDER = "rgba(201,168,76,0.18)";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

// ─── How you earn ────────────────────────────────────────────────────────────
const EARN_ACTIONS = [
  { icon: "📋", label: "Pre-Trip DVIR",          pts: 50,  desc: "Complete any DOT inspection in-app" },
  { icon: "⏱️", label: "HOS On-Time Day",        pts: 75,  desc: "Zero HOS violations for the full day" },
  { icon: "⚡", label: "Weigh Bypass Used",       pts: 100, desc: "Every bypass lane pass earns instantly" },
  { icon: "✅", label: "Zero-Violation Day",      pts: 200, desc: "Clean HOS + DVIR + speed — the big one" },
  { icon: "🛡️", label: "DOT Inspection Passed",  pts: 150, desc: "Pass roadside and points drop automatically" },
  { icon: "🩺", label: "Med Card Renewed",        pts: 100, desc: "Stay current, get rewarded" },
  { icon: "👥", label: "Refer a Driver",          pts: 500, desc: "Biggest single earn on the platform" },
  { icon: "🔥", label: "7-Day Clean Streak",      pts: "2×", desc: "All your points for the week are doubled" },
];

// ─── Tiers ───────────────────────────────────────────────────────────────────
const TIERS = [
  { name: "Road Hauler",  min: 0,      max: 4999,  icon: "🚛", color: "#94a3b8", perks: ["Earn on every action", "Partner fuel discounts", "Monthly point summary"] },
  { name: "Gold Rig",     min: 5000,   max: 14999, icon: "⭐", color: GOLD,      perks: ["Everything in Road Hauler", "$25 Pilot Flying J card", "Priority dispatch matching", "CAT Scale fee waiver"] },
  { name: "Platinum Rig", min: 15000,  max: 29999, icon: "💎", color: "#60a5fa", perks: ["Everything in Gold Rig", "Love's Travel Stop perks", "Michelin tire discount", "PrePass transponder credit"] },
  { name: "Diamond Rig",  min: 30000,  max: null,  icon: "👑", color: GOLD,      perks: ["Everything in Platinum Rig", "TA Petro Truck Care credit", "Dedicated account manager", "First access to new features"] },
];

// ─── Redemptions ─────────────────────────────────────────────────────────────
const REDEEM = [
  { icon: "⛽", name: "Pilot Flying J Card",    pts: 2500, value: "$25",     partner: "Pilot Flying J",   color: "#003087" },
  { icon: "⛽", name: "Love's Credit",           pts: 2000, value: "$20",     partner: "Love's",           color: "#E31837" },
  { icon: "⚖️", name: "CAT Scale Waiver",        pts: 500,  value: "$12",     partner: "CAT Scale",        color: GOLD },
  { icon: "🔧", name: "TA Petro Shop Credit",    pts: 3000, value: "$30",     partner: "TA Petro",         color: "#CC0000" },
  { icon: "⚡", name: "PrePass Balance",          pts: 1500, value: "$15",     partner: "PrePass",          color: "#0ea5e9" },
  { icon: "💳", name: "Free Month",              pts: 2000, value: "1 Month", partner: "TruckWithEase",    color: GOLD },
];

// ─── Leaderboard mock ────────────────────────────────────────────────────────
const MOCK_LB = [
  { rank: 1, name: "Ray Davis",     pts: 28420, tier: "Diamond Rig", icon: "👑", state: "TX" },
  { rank: 2, name: "James Miller",  pts: 21880, tier: "Platinum Rig",icon: "💎", state: "OK" },
  { rank: 3, name: "Tony Williams", pts: 18200, tier: "Platinum Rig",icon: "💎", state: "MO" },
  { rank: 4, name: "Andre Johnson", pts: 12750, tier: "Gold Rig",    icon: "⭐", state: "IL" },
  { rank: 5, name: "Derrick Brown", pts: 9400,  tier: "Gold Rig",    icon: "⭐", state: "KS" },
];

function getTier(pts) {
  return TIERS.find(t => pts >= t.min && (t.max === null || pts <= t.max)) || TIERS[0];
}

export default function RigBucksPage() {
  const [userType, setUserType] = useState("owner-op"); // Will check from user's signup record
  const [tab, setTab] = useState("earn");
  const [myPoints, setMyPoints] = useState(0);
  const [liveBoard, setLiveBoard] = useState(MOCK_LB);
  const [redeemMsg, setRedeemMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // In real app, would check current user's account type
        // For now, checking if this user has a rig_bucks_accounts entry means they're owner-op
        const accounts = await pb.collection('rig_bucks_accounts').getList(1, 10, { sort: '-balance' });
        if (accounts.items.length > 0) {
          setLiveBoard(accounts.items.map((a, i) => ({
            rank: i + 1,
            name: a.user_name || `Driver ${i + 1}`,
            pts: a.balance || 0,
            tier: getTier(a.balance || 0).name,
            icon: getTier(a.balance || 0).icon,
            state: a.state || "—",
          })));
          setMyPoints(accounts.items[0]?.balance || 0);
        }
      } catch (_) {}
    }
    load();
  }, []);

  async function redeem(item) {
    try {
      await pb.collection('rig_bucks_ledger').create({
        action: 'redeem_' + item.name.toLowerCase().replace(/\s+/g, '_'),
        points: -item.pts,
        description: 'Redeemed: ' + item.name,
        redeemed: true,
      });
    } catch (_) {}
    setRedeemMsg(`${item.name} redeemed — logged to your account`);
    setTimeout(() => setRedeemMsg(""), 4000);
  }

  const myTier = getTier(myPoints);
  const nextTier = TIERS[TIERS.indexOf(myTier) + 1];
  const progress = nextTier ? Math.min(100, ((myPoints - myTier.min) / (nextTier.min - myTier.min)) * 100) : 100;

  const TABS = [
    { id: "earn",   label: "How to Earn" },
    { id: "tiers",  label: "Tiers" },
    { id: "redeem", label: "Redeem" },
    { id: "board",  label: "Leaderboard" },
  ];

  // Rig Bucks is only for owner-operators (1099 independent drivers)
  if (userType !== "owner-op") {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px" }}>Rig Bucks — Owner-Operators Only</h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "20px" }}>
            Rig Bucks rewards are exclusively for independent 1099 owner-operators. Fleet managers manage driver compensation through their fleet dashboard.
          </p>
          <a href="/" style={{ color: GOLD, textDecoration: "none", fontWeight: 700 }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "Oswald, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rb-tab { cursor: pointer; padding: 12px 20px; font-family: Oswald, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-bottom: 2px solid transparent; transition: all 0.2s; color: rgba(255,255,255,0.45); border: none; background: none; }
        .rb-tab.active { color: ${GOLD}; border-bottom-color: ${GOLD}; }
        .rb-tab:hover:not(.active) { color: rgba(255,255,255,0.75); }
        .rb-card { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 14px; padding: 22px; transition: transform 0.2s, border-color 0.2s; }
        .rb-card:hover { transform: translateY(-3px); border-color: ${GOLD}44; }
        .rb-earn { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .rb-tiers { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .rb-redeem { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .rb-btn { padding: 11px 20px; border-radius: 8px; font-family: Oswald, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.2s; }
        @media (max-width: 640px) {
          .rb-hero-grid { flex-direction: column !important; }
          .rb-earn, .rb-tiers, .rb-redeem { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Toast */}
      {redeemMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "linear-gradient(135deg,#166534,#15803d)", border: "1px solid #22c55e44", borderRadius: 12, padding: "14px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxWidth: 300, fontSize: 14 }}>
          ✅ {redeemMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none", fontFamily: "Inter, sans-serif" }}>← Back</a>
          <div style={{ width: 1, height: 24, background: BORDER }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: GOLD }}>RIG BUCKS</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, fontFamily: "Inter, sans-serif" }}>TRUCKWITHEASE REWARDS PROGRAM</div>
          </div>
        </div>
        {/* My balance pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 18px" }}>
          <span style={{ fontSize: 18 }}>{myTier.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>Your Balance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, fontFamily: "monospace" }}>{myPoints.toLocaleString()} pts</div>
          </div>
          <div style={{ width: 1, height: 32, background: BORDER }} />
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: myTier.color }}>{myTier.name}</div>
          </div>
        </div>
      </div>

      {/* Progress bar (if not max tier) */}
      {nextTier && (
        <div style={{ background: CARD2, borderBottom: `1px solid ${BORDER}`, padding: "12px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.45)" }}>
            <span>{myPoints.toLocaleString()} pts — {myTier.name}</span>
            <span>{nextTier.min.toLocaleString()} pts to {nextTier.name}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${GOLD}, #f59e0b)`, borderRadius: 99, transition: "width 0.8s ease" }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, paddingLeft: 24, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} className={`rb-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── EARN ── */}
        {tab === "earn" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>Every Action Earns</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
                Points are awarded automatically the moment you complete an action — no claiming, no paperwork. Clean driving builds your balance every single day.
              </div>
            </div>
            <div className="rb-earn">
              {EARN_ACTIONS.map((a, i) => (
                <div key={i} className="rb-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>{a.label}</div>
                      <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 20, padding: "3px 12px", color: GOLD, fontWeight: 700, fontSize: 13, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {typeof a.pts === "number" ? `+${a.pts}` : a.pts}
                      </div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick conversion note */}
            <div style={{ marginTop: 28, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 32 }}>💡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Simple math — 100 Rig Bucks = $1.00</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
                  A Zero-Violation Day earns 200 pts ($2.00 in partner rewards). A referral earns 500 pts ($5.00). A full clean week with the streak bonus can earn 2,000+ pts — that's a free month or a $20 fuel card.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TIERS ── */}
        {tab === "tiers" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>Status Tiers</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
                Your tier is calculated automatically from your total Rig Bucks earned. The higher you go, the better your partner deals get.
              </div>
            </div>
            <div className="rb-tiers">
              {TIERS.map((tier, i) => (
                <div key={i} className="rb-card" style={{ border: `1px solid ${tier.color}33`, position: "relative", overflow: "hidden" }}>
                  {myTier.name === tier.name && (
                    <div style={{ position: "absolute", top: 12, right: 12, background: `${GREEN}22`, border: `1px solid ${GREEN}44`, borderRadius: 20, padding: "2px 10px", fontSize: 10, color: GREEN, fontWeight: 700, letterSpacing: 1 }}>YOUR TIER</div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{tier.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: tier.color, marginBottom: 4, letterSpacing: 1 }}>{tier.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: 18 }}>
                    {tier.min.toLocaleString()}{tier.max ? `–${tier.max.toLocaleString()}` : "+"} pts
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {tier.perks.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: tier.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REDEEM ── */}
        {tab === "redeem" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>Redeem Your Points</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
                Real rewards at the places you already stop. Tap Redeem and the credit is applied or a code appears on your screen instantly.
              </div>
            </div>
            <div className="rb-redeem">
              {REDEEM.map((r, i) => {
                const canAfford = myPoints >= r.pts;
                return (
                  <div key={i} className="rb-card" style={{ border: `1px solid ${r.color}22` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${r.color}18`, border: `1px solid ${r.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>{r.partner}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 3, fontFamily: "Inter, sans-serif" }}>RIG BUCKS NEEDED</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: GOLD, fontFamily: "monospace" }}>{r.pts.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 3, fontFamily: "Inter, sans-serif" }}>YOU GET</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: GREEN, fontFamily: "monospace" }}>{r.value}</div>
                      </div>
                    </div>
                    <button
                      className="rb-btn"
                      onClick={() => redeem(r)}
                      style={{ width: "100%", background: canAfford ? `${r.color}22` : "rgba(255,255,255,0.05)", color: canAfford ? "#fff" : "rgba(255,255,255,0.3)", border: `1px solid ${canAfford ? r.color + "44" : "rgba(255,255,255,0.08)"}`, cursor: canAfford ? "pointer" : "not-allowed" }}>
                      {canAfford ? `Redeem ${r.pts.toLocaleString()} Rig Bucks` : `Need ${(r.pts - myPoints).toLocaleString()} more pts`}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>How redemption works</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Tap Redeem on any reward you can afford",
                  "For fuel cards — a barcode appears on-screen, show it at any pump or register",
                  "For CAT Scale — a single-use PIN appears, enter it at the terminal before your weigh",
                  "For PrePass — credit is added to your linked account automatically, no code needed",
                  "For a free month — applied to your next billing cycle automatically",
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
                    <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {tab === "board" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>Top Earners</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Live rankings — updated as drivers earn. Where do you rank?</div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Live Member Rankings</div>
                <div style={{ fontSize: 11, color: GREEN, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
                  LIVE
                </div>
              </div>
              {liveBoard.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: `1px solid rgba(255,255,255,0.04)`, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? `${GOLD}22` : i === 1 ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: i === 0 ? GOLD : i === 1 ? "#60a5fa" : "rgba(255,255,255,0.4)", fontFamily: "monospace", flexShrink: 0 }}>
                    {d.rank}
                  </div>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>{d.tier} · {d.state}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: GOLD, fontFamily: "monospace" }}>{d.pts.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>Rig Bucks</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "14px 20px", background: `${GOLD}08`, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🚛</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>Your position</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>Complete actions to join the board</div>
                  </div>
                </div>
                <a href="/leaderboard" style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none", letterSpacing: 0.5 }}>Full Rankings →</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>© 2026 TruckWithEase · Rig Bucks is the TruckWithEase rewards program · 100 pts = $1.00</span>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>← Back to platform</a>
      </div>
    </div>
  );
}
