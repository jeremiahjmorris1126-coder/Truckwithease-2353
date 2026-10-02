import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#06090F";

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

const plans = [
  {
    id: "solo",
    name: "Solo",
    price: 19.99,
    priceLabel: "$19.99/mo",
    referrerReward: "1 Month Free",
    referrerMonths: 1,
    friendReward: "1 Month Free",
    friendMonths: 1,
    rigBucks: 500,
    color: AMBER,
    icon: "🚛",
    desc: "Owner-operator plan",
    referrerValue: "$19.99",
    friendValue: "$19.99",
  },
  {
    id: "pro",
    name: "Pro",
    price: 34.99,
    priceLabel: "$34.99/mo",
    referrerReward: "2 Months Free",
    referrerMonths: 2,
    friendReward: "1 Month Free",
    friendMonths: 1,
    rigBucks: 500,
    color: ORANGE,
    icon: "⭐",
    highlight: true,
    desc: "Full-feature driver plan",
    referrerValue: "$69.98",
    friendValue: "$34.99",
  },
  {
    id: "fleet",
    name: "Fleet",
    price: 24.99,
    priceLabel: "$24.99/seat/mo",
    referrerReward: "2 Months Free",
    referrerMonths: 2,
    friendReward: "1 Month Free",
    friendMonths: 1,
    rigBucks: 500,
    color: GREEN,
    icon: "🏢",
    desc: "Per-seat fleet plan",
    referrerValue: "$49.98/seat",
    friendValue: "$24.99/seat",
  },
];

const steps = [
  {
    n: "01",
    icon: "📲",
    title: "Share Your Link",
    desc: "Every TruckWithEase driver gets a unique referral link inside the app. Share it anywhere — text, Facebook, a trucker group, a rest stop conversation.",
  },
  {
    n: "02",
    icon: "✅",
    title: "Your Friend Signs Up & Subscribes",
    desc: "They use your link, start their 14-day free trial, and convert to any paid plan. Their first month is on us — no charge.",
  },
  {
    n: "03",
    icon: "💰",
    title: "You Get Free Months + Rig Bucks",
    desc: "The moment they subscribe, your account is credited. Solo referral = 1 free month. Pro or Fleet referral = 2 free months. Plus 500 Rig Bucks drop instantly.",
  },
  {
    n: "04",
    icon: "🔁",
    title: "No Limit — Keep Referring",
    desc: "There's no cap on how many drivers you can refer. Refer 12 drivers on Pro plans and you've earned 2 full years free. The math works in your favor.",
  },
];

const faqs = [
  {
    q: "When do I get my free months?",
    a: "The moment your referred driver's first paid charge goes through — usually at the end of their 14-day free trial. It's automatic, no request needed.",
  },
  {
    q: "Does my friend get anything too?",
    a: "Yes — every driver who signs up through your link gets their first month free, regardless of which plan they choose. It's a win on both sides.",
  },
  {
    q: "What if I refer someone on Solo but they upgrade to Pro?",
    a: "Your reward is based on the plan they're on when their first payment hits. If they upgrade before the trial ends, you get the Pro reward (2 months free).",
  },
  {
    q: "Is there a limit on how many people I can refer?",
    a: "Zero limit. Refer 1 driver or 100 — every qualifying referral earns you free months and Rig Bucks. Some of our most active drivers refer their whole fleet.",
  },
  {
    q: "Do the free months stack?",
    a: "Yes. If you earn 3 free months across multiple referrals, they stack back-to-back. You won't be charged until your credits run out.",
  },
  {
    q: "How do I get my referral link?",
    a: "It's inside the TruckWithEase app under your profile → Refer a Driver. One tap copies your unique link. You can also share directly to text, Facebook, or WhatsApp from there.",
  },
  {
    q: "What counts as a qualifying referral?",
    a: "Your friend must sign up using your unique referral link and complete at least one paid billing cycle. Trial-only signups don't count — they need to become a paid subscriber.",
  },
];

export default function ReferralTruckerPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard?.writeText("https://truckwithease.app/join?ref=YOUR_CODE");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A", overflowX: "hidden", background: DARK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${DARK}; }
        ::-webkit-scrollbar-thumb { background: #1A2840; border-radius: 3px; }
        .ref-plan-card { transition: transform 0.22s, box-shadow 0.22s; }
        .ref-plan-card:hover { transform: translateY(-5px); }
        .ref-nav-link { transition: color 0.2s; }
        .ref-nav-link:hover { color: ${AMBER} !important; }
        .ref-step { transition: background 0.2s; }
        .ref-step:hover { background: rgba(255,180,0,0.06) !important; }
        .ref-faq { transition: background 0.18s; cursor: pointer; }
        .ref-faq:hover { background: rgba(255,255,255,0.06) !important; }
        .ref-copy-btn { transition: all 0.18s; }
        .ref-copy-btn:hover { background: #D97F00 !important; }
        @keyframes refFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .ref-coin { animation: refFloat 3.5s ease-in-out infinite; }
        @keyframes refGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(255,180,0,0.25); }
          50%       { box-shadow: 0 0 48px rgba(255,180,0,0.5); }
        }
        .ref-glow { animation: refGlow 2.8s ease-in-out infinite; }
        @keyframes refPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        .ref-pop { animation: refPop 0.45s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 767px) {
          .ref-two-col { grid-template-columns: 1fr !important; }
          .ref-three-col { grid-template-columns: 1fr !important; }
          .ref-hero-vis { display: none !important; }
          .ref-nav-links { display: none !important; }
          .ref-mob-btns { display: flex !important; }
        }
        @media (min-width: 768px) { .ref-mob-btns { display: none !important; } }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,9,15,0.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,180,0,0.1)", padding: "0 5%", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "white" }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="ref-nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[["#how-it-works","How It Works"],["#rewards","Your Rewards"],["#faqs","FAQs"]].map(([h,l]) => (
            <a key={h} href={h} className="ref-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>{l}</a>
          ))}
          <a href="/rig-bucks" className="ref-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>🏆 Rig Bucks</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "9px 20px", borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Start Free Trial</a>
        </div>
        <div className="ref-mob-btns" style={{ display: "none", gap: 10 }}>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "8px 14px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>← Home</a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: DARK, minHeight: "86vh", display: "flex", alignItems: "center", padding: "70px 5% 80px", position: "relative", overflow: "hidden" }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,180,0,0.03) 1px, transparent 1px)", backgroundSize: "52px 52px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: "40%", left: "55%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div className="ref-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 2 }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.35)", borderRadius: 20, padding: "6px 16px", marginBottom: 26 }}>
              <span style={{ fontSize: 14 }}>🚛</span>
              <span style={{ color: ORANGE, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Refer a Trucker Program</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.8rem,7vw,5rem)", fontWeight: 900, letterSpacing: -2.5, lineHeight: 1.0, marginBottom: 18 }}>
              <span style={{ color: "white" }}>Refer a trucker.</span><br />
              <span style={{ color: ORANGE }}>Ride free.</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, lineHeight: 1.85, marginBottom: 16, maxWidth: 500 }}>
              Share TruckWithEase with a fellow driver and earn <strong style={{ color: "white" }}>1–2 months completely free</strong> the moment they subscribe — plus <strong style={{ color: AMBER }}>500 Rig Bucks</strong> dropped into your account automatically.
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              No forms. No waiting. No cap on how many drivers you refer. Every qualifying referral puts money back in your pocket.
            </p>

            {/* Mock referral link box */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28, maxWidth: 460 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Your Referral Link</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>truckwithease.app/join?ref=<span style={{ color: AMBER }}>YOUR_CODE</span></div>
              </div>
              <button onClick={copyLink} className="ref-copy-btn ref-glow"
                style={{ background: AMBER, color: DARK, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "15px 32px", borderRadius: 12, fontWeight: 900, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 28px rgba(255,107,0,0.4)" }}>
                Start Your Free Trial
              </a>
              <a href="#how-it-works" style={{ background: "rgba(255,255,255,0.07)", color: "white", padding: "15px 24px", borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
                See How It Works →
              </a>
            </div>
          </div>

          {/* Right — reward cards visual */}
          <div className="ref-hero-vis" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* You earn card */}
            <div className="ref-coin" style={{ background: "#0C1628", borderRadius: 18, border: "1px solid rgba(255,107,0,0.3)", padding: "22px 24px", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤑</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>You Earn</div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>When they subscribe</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {plans.map(p => (
                  <div key={p.id} style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ color: p.color, fontWeight: 900, fontSize: 13 }}>{p.referrerReward}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>{p.name} plan</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>≈ {p.referrerValue} value</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Friend gets card */}
            <div style={{ background: "#0C1628", borderRadius: 18, border: "1px solid rgba(255,180,0,0.25)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,180,0,0.12)", border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎁</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Your Friend Gets</div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>On any plan they choose</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${AMBER}, #D97F00)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎉</div>
                <div>
                  <div style={{ color: AMBER, fontWeight: 900, fontSize: 22 }}>1 Month Free</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 2 }}>First month on TruckWithEase — no charge</div>
                </div>
              </div>
            </div>
            {/* Rig Bucks */}
            <div style={{ background: `linear-gradient(135deg, rgba(255,180,0,0.1), rgba(255,107,0,0.06))`, borderRadius: 14, border: "1px solid rgba(255,180,0,0.2)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 28 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: AMBER, fontWeight: 900, fontSize: 16 }}>+500 Rig Bucks</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>Automatically added per referral · Redeemable at Pilot, Love's, TA Petro</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "90px 5%", background: "#080D1A" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ color: ORANGE, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Dead Simple</div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,2.9rem)", fontWeight: 900, color: "white", lineHeight: 1.1 }}>
                Four steps.<br /><span style={{ color: ORANGE }}>Free months.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 60}>
                <div className="ref-step" style={{ display: "flex", gap: 24, padding: "28px 24px", borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", borderRadius: i === 0 ? "14px 14px 0 0" : i === steps.length - 1 ? "0 0 14px 14px" : 0, background: "rgba(255,255,255,0.02)", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 500, color: "rgba(255,180,0,0.18)", flexShrink: 0, lineHeight: 1, width: 52 }}>{step.n}</div>
                  <div style={{ fontSize: 28, flexShrink: 0, marginTop: 4 }}>{step.icon}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{step.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 14.5, lineHeight: 1.75 }}>{step.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── REWARD BREAKDOWN BY PLAN ─────────────────────────────────────────── */}
      <section id="rewards" style={{ padding: "90px 5%", background: DARK }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Every Plan, Spelled Out</div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: "white", lineHeight: 1.1 }}>
                Exactly what you earn.<br /><span style={{ color: AMBER }}>No fine print.</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 460, margin: "14px auto 0", lineHeight: 1.8 }}>
                Your reward depends on which plan your friend subscribes to. Pro and Fleet referrals earn you 2 full months free.
              </p>
            </div>
          </FadeIn>
          <div className="ref-three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {plans.map((plan, i) => (
              <FadeIn key={plan.id} delay={i * 70}>
                <div className="ref-plan-card" style={{
                  background: "#0C1628",
                  borderRadius: 20,
                  border: `2px solid ${plan.highlight ? plan.color + "55" : "rgba(255,255,255,0.08)"}`,
                  overflow: "hidden",
                  boxShadow: plan.highlight ? `0 12px 40px ${plan.color}18` : "none",
                }}>
                  {/* Header */}
                  <div style={{ background: `${plan.color}12`, borderBottom: `1px solid ${plan.color}20`, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{plan.icon}</span>
                      <span style={{ color: plan.color, fontWeight: 900, fontSize: 18 }}>{plan.name}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{plan.priceLabel} · {plan.desc}</div>
                  </div>
                  {/* Rewards */}
                  <div style={{ padding: "22px" }}>
                    {/* You earn */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>You Earn</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${plan.color}18`, border: `1px solid ${plan.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤑</div>
                        <div>
                          <div style={{ color: plan.color, fontWeight: 900, fontSize: 20 }}>{plan.referrerReward}</div>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>≈ {plan.referrerValue} value</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 18 }} />
                    {/* Friend gets */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Your Friend Gets</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,180,0,0.12)", border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎁</div>
                        <div>
                          <div style={{ color: AMBER, fontWeight: 900, fontSize: 20 }}>{plan.friendReward}</div>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>≈ {plan.friendValue} value</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 18 }} />
                    {/* Rig Bucks */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏆</div>
                      <div>
                        <div style={{ color: AMBER, fontWeight: 900, fontSize: 16 }}>+{plan.rigBucks} Rig Bucks</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Auto-added on their first payment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Math example */}
          <FadeIn delay={100}>
            <div style={{ marginTop: 32, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ color: ORANGE, fontWeight: 800, fontSize: 14, marginBottom: 12 }}>💡 The math that makes drivers talk</div>
              <div className="ref-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { eg: "Refer 6 drivers on Solo", result: "6 free months · $119.94 value · 3,000 Rig Bucks", color: AMBER },
                  { eg: "Refer 6 drivers on Pro", result: "12 free months — a full year free · $419.88 value · 3,000 Rig Bucks", color: ORANGE },
                ].map(item => (
                  <div key={item.eg} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 6 }}>Example: {item.eg}</div>
                    <div style={{ color: item.color, fontWeight: 700, fontSize: 13, lineHeight: 1.6 }}>→ {item.result}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────────── */}
      <section id="faqs" style={{ padding: "90px 5%", background: "#080D1A" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Questions Answered</div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,2.6rem)", fontWeight: 900, color: "white" }}>
                Everything you need<br /><span style={{ color: AMBER }}>to know.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 40}>
                <div className="ref-faq"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ background: openFaq === i ? "rgba(255,180,0,0.06)" : "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderRadius: i === 0 ? "12px 12px 0 0" : i === faqs.length - 1 ? "0 0 12px 12px" : 0, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <span style={{ color: openFaq === i ? AMBER : "white", fontWeight: 700, fontSize: 14 }}>{faq.q}</span>
                    <span style={{ color: AMBER, fontSize: 18, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div className="ref-pop" style={{ marginTop: 14, color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8 }}>{faq.a}</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 5%", background: DARK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <FadeIn>
          <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>👥</div>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 16 }}>
              Know a driver who needs this?<br /><span style={{ color: ORANGE }}>Tell them. Get paid.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.8 }}>
              Start your 14-day free trial, get your referral link from the app, and start earning free months from day one.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "16px 40px", borderRadius: 12, fontWeight: 900, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 28px rgba(255,107,0,0.4)" }}>
                Start Free Trial — 14 Days
              </a>
              <a href="/rig-bucks" style={{ background: "rgba(255,255,255,0.07)", color: "white", padding: "16px 28px", borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
                🏆 Rig Bucks
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 20 }}>No credit card required · No cap on referrals · Rewards stack automatically</p>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#030508", padding: "24px 5%", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>© 2026 TruckWithEase · Refer a Driver Program · Part of Rig Bucks</span>
        <a href="/" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textDecoration: "none" }}>← Back to main site</a>
      </footer>
    </div>
  );
}
