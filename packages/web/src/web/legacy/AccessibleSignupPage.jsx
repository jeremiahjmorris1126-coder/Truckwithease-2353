import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const GOLD   = "#c9a84c";
const DARK   = "#060A10";
const DARK2  = "#0d1420";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const WHITE  = "#ffffff";

const PLANS = [
  {
    id: "solo",
    name: "Solo Driver",
    emoji: "🚛",
    price: "$29.99",
    tag: "Owner-Operators",
    what: "Everything you need to run your truck your way — logs, fuel finder, income tracking, and your own AI co-pilot.",
    features: ["HOS / ELD Logger", "Pre-Trip Inspection", "DOT AI Watcher", "Fuel Finder & Parking", "Income Tracker", "Rig Bucks Rewards"],
  },
  {
    id: "pro",
    name: "Pro",
    emoji: "⭐",
    price: "$39.99",
    tag: "Most Popular",
    highlight: true,
    what: "The full platform. Every tool, every AI agent, everything — load board, dispatch, fuel card, weigh station bypass, cinema.",
    features: ["Everything in Solo", "Load Board", "Dispatch Agent", "Fuel Card Integration", "Weigh Station Bypass", "Priority Support"],
  },
  {
    id: "fleet",
    name: "Fleet",
    emoji: "🏢",
    price: "$49.99",
    tag: "2–50 Trucks",
    what: "Run your whole fleet from one screen. See every driver, every load, every log — all in real time.",
    features: ["Everything in Pro", "Multi-Driver Dashboard", "Fleet Safety Scores", "HRease Hiring Tools", "Fleet Documents", "Custom Reports"],
  },
  {
    id: "toptier",
    name: "Top Tier",
    emoji: "👑",
    price: "$99.99",
    tag: "Enterprise Fleets",
    what: "The crown. DOT portal access, branded fleet documents, medical card tracking, CDL testing, and your own fleet intelligence hub.",
    features: ["Everything in Fleet", "DOT Portal Access", "Fleet Document Center", "Medical & CDL Tracker", "Print Intelligence", "White-Glove Support"],
    crown: true,
  },
];

export default function AccessibleSignupPage() {
  const [step, setStep]   = useState(1); // 1=welcome, 2=plan, 3=info, 4=done
  const [plan, setPlan]   = useState("pro");
  const [userType, setUserType] = useState("owner-op"); // owner-op, fleet-manager, or company-driver
  const [form, setForm]   = useState({ name: "", phone: "", email: "", trucks: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam && PLANS.find(p => p.id === planParam)) setPlan(planParam);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("We need your name to get started."); return; }
    if (!form.phone.trim() && !form.email.trim()) { setError("Please add a phone number or email so we can reach you."); return; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("That email doesn't look right — double-check it."); return;
    }
    
    // Solo drivers must be owner-operators (1099) to access Rig Bucks
    if (plan === "solo" && userType !== "owner-op") {
      setError("Solo plan is for independent 1099 drivers only. Fleet managers need the Fleet plan or higher.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Create signup record
      const signupRec = await pb.collection("signups").create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        plan,
        user_type: userType,
        fleet_size: form.trucks,
        rig_bucks_enabled: (plan === "solo" || plan === "pro") && userType === "owner-op",
        source: "accessible_signup",
        created_at: new Date().toISOString(),
      });

      // If Solo driver (owner-op), auto-create Rig Bucks account (limit 1 per owner-ops)
      if (plan === "solo" && userType === "owner-op") {
        await pb.collection("rig_bucks_accounts").create({
          user_name: form.name.trim(),
          email: form.email.trim(),
          account_type: "owner_operator",
          balance: 0,
          lifetime_earnings: 0,
          signup_id: signupRec.id,
        });
      }

      // If fleet plan, create subscription seat manager
      if (["fleet", "pro"].includes(plan)) {
        await pb.collection("subscription_seats").create({
          signup_id: signupRec.id,
          plan,
          user_type: userType,
          max_dat_logins: 2,
          max_uber_logins: 2,
          current_dat_logins: 0,
          current_uber_logins: 0,
          active_users: [],
        });
      }

      setStep(4);
    } catch (err) {
      if (err?.data?.email?.message?.includes("unique")) {
        setError("Looks like you already have an account! Email us at truckwithease@gmail.com and we'll sort it out.");
      } else {
        setError("Something went wrong. Call us at 636-706-8338 and we'll get you set up right now.");
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = PLANS.find(p => p.id === plan);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: DARK, minHeight: "100vh", color: WHITE }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; border-bottom: 1px solid rgba(201,168,76,0.15); background: rgba(6,10,16,0.95); position: sticky; top: 0; z-index: 100; }
        .su-logo { font-weight: 900; font-size: 20px; color: white; text-decoration: none; }
        .su-logo span { color: ${GOLD}; }
        .su-back { color: rgba(255,255,255,0.4); font-size: 15px; text-decoration: none; padding: 10px 0; }
        .su-back:hover { color: white; }

        .su-wrap { max-width: 760px; margin: 0 auto; padding: 40px 24px 80px; }

        /* Step indicators */
        .steps { display: flex; gap: 8px; justify-content: center; margin-bottom: 40px; }
        .step-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.3s; }
        .step-dot.active { background: ${GOLD}; width: 28px; border-radius: 5px; }
        .step-dot.done { background: ${GREEN}; }

        /* Welcome */
        .welcome-icon { font-size: 64px; text-align: center; margin-bottom: 24px; }
        .welcome-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; text-align: center; line-height: 1.15; margin-bottom: 16px; }
        .welcome-sub { color: rgba(255,255,255,0.55); font-size: clamp(16px, 2.5vw, 20px); text-align: center; line-height: 1.7; margin-bottom: 40px; }

        /* Plan cards */
        .plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        @media(max-width: 560px) { .plan-grid { grid-template-columns: 1fr; } }
        .plan-card { border: 2px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px 20px; cursor: pointer; transition: all 0.25s; background: rgba(255,255,255,0.03); position: relative; }
        .plan-card:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.05); }
        .plan-card.sel { border-color: ${GOLD}; background: rgba(201,168,76,0.08); }
        .plan-card.crown-card.sel { border-color: ${GOLD}; box-shadow: 0 0 32px rgba(201,168,76,0.25); }
        .plan-emoji { font-size: 36px; margin-bottom: 10px; }
        .plan-name { font-size: 22px; font-weight: 900; margin-bottom: 2px; }
        .plan-tag { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 600; margin-bottom: 12px; }
        .plan-price { font-size: 32px; font-weight: 900; color: ${GOLD}; margin-bottom: 14px; line-height: 1; }
        .plan-price span { font-size: 15px; color: rgba(255,255,255,0.4); font-weight: 400; }
        .plan-what { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 14px; }
        .plan-feat { font-size: 13px; color: rgba(255,255,255,0.55); margin-bottom: 6px; display: flex; gap: 8px; align-items: flex-start; }
        .plan-feat-check { color: ${GREEN}; flex-shrink: 0; font-size: 15px; }
        .plan-selected-bar { margin-top: 18px; background: ${GOLD}; color: ${DARK}; border-radius: 10px; padding: 10px; text-align: center; font-weight: 800; font-size: 14px; }
        .plan-select-bar { margin-top: 18px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); border-radius: 10px; padding: 10px; text-align: center; font-weight: 600; font-size: 14px; }
        .crown-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #c9a84c, #f5d782); color: #060A10; font-size: 11px; font-weight: 900; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }

        /* Form */
        .form-label { display: block; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .form-input { width: 100%; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 18px 20px; font-size: 18px; font-family: 'Poppins', sans-serif; color: white; outline: none; transition: border 0.2s; }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: ${GOLD}; background: rgba(201,168,76,0.05); }
        .form-hint { font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 8px; line-height: 1.5; }
        .form-select { appearance: none; cursor: pointer; }

        /* Buttons */
        .btn-gold { display: block; width: 100%; background: ${GOLD}; color: ${DARK}; border: none; border-radius: 16px; padding: 20px; font-weight: 900; font-size: 20px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s, transform 0.15s; text-align: center; }
        .btn-gold:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-gold:active { transform: translateY(0); }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-ghost { display: block; width: 100%; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 2px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 18px; font-weight: 700; font-size: 18px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; text-align: center; }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: white; }

        /* Error */
        .err-box { background: rgba(239,68,68,0.1); border: 2px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px 18px; color: #fca5a5; font-size: 15px; line-height: 1.6; }

        /* Success */
        .success-icon { font-size: 80px; text-align: center; margin-bottom: 24px; }
        .success-title { font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 900; text-align: center; margin-bottom: 16px; }
        .success-sub { font-size: 18px; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.7; margin-bottom: 32px; }
        .contact-strip { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; padding: 24px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); border-radius: 16px; margin-bottom: 24px; }
        .contact-link { color: ${GOLD}; text-decoration: none; font-weight: 800; font-size: 18px; }
        .contact-link:hover { text-decoration: underline; }

        /* Section title */
        .section-title { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; text-align: center; margin-bottom: 8px; }
        .section-sub { font-size: 16px; color: rgba(255,255,255,0.45); text-align: center; margin-bottom: 32px; line-height: 1.6; }

        /* Plan recap chip */
        .plan-chip { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); border-radius: 30px; padding: 8px 18px; margin-bottom: 28px; font-size: 15px; font-weight: 700; color: ${GOLD}; }

        /* Call banner */
        .call-banner { background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 18px; padding: 22px 24px; margin-bottom: 32px; text-align: center; }
        .call-banner-title { font-size: 18px; font-weight: 900; color: white; margin-bottom: 6px; }
        .call-banner-sub { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
        .call-banner-btn { display: inline-flex; align-items: center; gap: 10px; background: white; color: #15803d; border-radius: 50px; padding: 14px 28px; font-size: 20px; font-weight: 900; text-decoration: none; transition: transform 0.15s; }
        .call-banner-btn:hover { transform: scale(1.03); }
        .call-banner-hours { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 10px; }

        /* Floating call button */
        .float-call { position: fixed; bottom: 28px; right: 24px; z-index: 999; background: #16a34a; color: white; border-radius: 50px; padding: 14px 22px; font-size: 16px; font-weight: 900; text-decoration: none; box-shadow: 0 8px 24px rgba(22,163,74,0.45); display: flex; align-items: center; gap: 8px; transition: transform 0.15s, box-shadow 0.15s; }
        .float-call:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(22,163,74,0.55); }
        @media(max-width: 480px) { .float-call { bottom: 16px; right: 16px; padding: 12px 18px; font-size: 15px; } }
      `}</style>

      {/* Floating call button — always visible */}
      <a href="tel:6367068338" className="float-call">
        📞 <span>636-706-8338</span>
      </a>

      {/* Nav */}
      <nav className="su-nav">
        <a href="/" className="su-logo">Truck<span>WithEase</span></a>
        <a href="/" className="su-back">← Back</a>
      </nav>

      <div className="su-wrap">

        {/* Step dots */}
        <div className="steps">
          {[1,2,3,4].map(n => (
            <div key={n} className={`step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`} />
          ))}
        </div>

        {/* Terms Acceptance Modal */}
        {step > 1 && (
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: '24px',
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}>
            <strong style={{ color: C.gold }}>Terms & Conditions:</strong> By completing signup, you agree to our{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: 'underline' }}>
              Terms of Service & Liability
            </a>
            . You assume full responsibility for your use of TruckWithEase.
          </div>
        )}

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div>
            {/* Call to sign up banner */}
            <div className="call-banner">
              <div className="call-banner-title">Rather just call us? We'll sign you up in 5 minutes.</div>
              <div className="call-banner-sub">A real person picks up — no menus, no hold music, no runaround.</div>
              <a href="tel:6367068338" className="call-banner-btn">
                📞 636-706-8338
              </a>
              <div className="call-banner-hours">Mon – Fri · 7am – 8pm CT &nbsp;·&nbsp; Sat – Sun · 9am – 5pm CT</div>
            </div>

            <div className="welcome-icon">🚛</div>
            <h1 className="welcome-title">
              Welcome to <span style={{ color: GOLD }}>TruckWithEase</span>
            </h1>
            <p className="welcome-sub">
              We built this platform for every driver — whether you've been behind the wheel for 30 years or just got your CDL last month. Simple. No nonsense. Just the tools you need to make more money and spend less time on paperwork.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
              {[
                { icon: "📋", text: "HOS logs done in seconds" },
                { icon: "⛽", text: "Find the cheapest fuel near you" },
                { icon: "💰", text: "Track every dollar you earn" },
                { icon: "🤖", text: "AI that talks trucking with you" },
                { icon: "🛣️", text: "Load board — find loads fast" },
                { icon: "🔒", text: "DOT compliance, covered" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "16px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 26 }}>{icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.3 }}>{text}</span>
                </div>
              ))}
            </div>

            <button className="btn-gold" onClick={() => setStep(2)}>
              Let's Get Started →
            </button>
            <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
              14-day free trial · No credit card needed
            </div>
          </div>
        )}

        {/* ── STEP 2: Pick a Plan ── */}
        {step === 2 && (
          <div>
            <h2 className="section-title">Pick Your Plan</h2>
            <p className="section-sub">
              Start free for 14 days — no credit card, cancel anytime. You can always upgrade later.
            </p>

            <div className="plan-grid">
              {PLANS.map(p => (
                <div
                  key={p.id}
                  className={`plan-card${plan === p.id ? " sel" : ""}${p.crown ? " crown-card" : ""}`}
                  onClick={() => setPlan(p.id)}
                >
                  {p.crown && <div className="crown-badge">👑 Top Tier Exclusive</div>}
                  {p.highlight && !p.crown && <div className="crown-badge" style={{ background: "rgba(34,197,94,0.9)", color: "white" }}>⭐ Most Popular</div>}
                  <div className="plan-emoji">{p.emoji}</div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-tag">{p.tag}</div>
                  <div className="plan-price">{p.price}<span>/mo</span></div>
                  <div className="plan-what">{p.what}</div>
                  {p.features.map(f => (
                    <div key={f} className="plan-feat"><span className="plan-feat-check">✓</span>{f}</div>
                  ))}
                  {plan === p.id
                    ? <div className="plan-selected-bar">✓ This is my plan</div>
                    : <div className="plan-select-bar">Tap to choose</div>
                  }
                </div>
              ))}
            </div>

            <button className="btn-gold" onClick={() => setStep(3)} style={{ marginBottom: 12 }}>
              Continue with {selectedPlan?.name} →
            </button>
            <button className="btn-ghost" onClick={() => setStep(1)}>
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP 3: Your Info ── */}
        {step === 3 && (
          <div>
            <h2 className="section-title">Almost There</h2>
            <p className="section-sub" style={{ marginBottom: 16 }}>
              Just a few things and you're in. We keep it short — we know you've got miles to cover.
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div className="plan-chip">
                {selectedPlan?.emoji} {selectedPlan?.name} — {selectedPlan?.price}/mo
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label className="form-label">Your Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Ray Davis"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoFocus
                  autoComplete="name"
                />
                <p className="form-hint">Your first and last name — just so we know who we're talking to.</p>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="e.g. (555) 555-5555"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                />
                <p className="form-hint">We can reach you by text or call — whatever works for you.</p>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="e.g. ray@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
                <p className="form-hint">We'll send your login details here. Either phone or email — at least one is needed.</p>
              </div>

              <div>
                <label className="form-label">I am a…</label>
                <select
                  className="form-input form-select"
                  value={userType}
                  onChange={e => setUserType(e.target.value)}
                >
                  <option value="owner-op">Owner-Operator (Independent 1099)</option>
                  <option value="fleet-manager">Fleet Manager</option>
                  <option value="company-driver">Company Driver</option>
                </select>
                <p className="form-hint">
                  {userType === "owner-op" && "Solo drivers get Rig Bucks rewards, fuel card bonuses, and income tracking."}
                  {userType === "fleet-manager" && "Manage your fleet, monitor all drivers, and access enterprise tools."}
                  {userType === "company-driver" && "You'll use the platform through your fleet manager's account."}
                </p>
              </div>

              <div>
                <label className="form-label">How many trucks do you run?</label>
                <select
                  className="form-input form-select"
                  value={form.trucks}
                  onChange={e => setForm({ ...form, trucks: e.target.value })}
                >
                  <option value="1">Just me — 1 truck</option>
                  <option value="2-5">Small fleet — 2 to 5 trucks</option>
                  <option value="6-15">Growing fleet — 6 to 15 trucks</option>
                  <option value="16-50">Mid-size fleet — 16 to 50 trucks</option>
                  <option value="50+">Large fleet — 50 or more trucks</option>
                </select>
              </div>

              {error && <div className="err-box">{error}</div>}

              <button type="submit" className="btn-gold" disabled={loading}>
                {loading ? "Saving your spot…" : "Start My Free Trial →"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setStep(2)}>
                ← Change Plan
              </button>

              <div style={{ textAlign: "center", padding: "16px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 14 }}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Rather talk to someone?</div>
                <a href="tel:6367068338" style={{ color: GREEN, fontWeight: 900, fontSize: 20, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  📞 636-706-8338
                </a>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>We'll take it from here — about 5 minutes</div>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 4: All Done ── */}
        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div className="success-icon">🎉</div>
            <h2 className="success-title">You're In, {form.name.split(" ")[0]}!</h2>
            <p className="success-sub">
              Your 14-day free trial is live. We'll be in touch soon to walk you through everything — or just dive right in below.
            </p>

            <div className="contact-strip">
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Need help right now?</div>
                <a href="tel:6367068338" className="contact-link">📞 636-706-8338</a>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Send us a message</div>
                <a href="mailto:truckwithease@gmail.com" className="contact-link">✉️ truckwithease@gmail.com</a>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { emoji: "🚛", title: "Start Your First Log", desc: "Takes about 2 minutes" },
                { emoji: "⛽", title: "Find Cheap Fuel", desc: "Enter your location" },
                { emoji: "💰", title: "Check Your Income", desc: "Connect your trips" },
                { emoji: "🤖", title: "Talk to Your AI", desc: "Ask it anything trucker" },
              ].map(({ emoji, title, desc }) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 16px" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{desc}</div>
                </div>
              ))}
            </div>

            <a href="/" className="btn-gold" style={{ display: "block", textDecoration: "none" }}>
              Go to My Dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
