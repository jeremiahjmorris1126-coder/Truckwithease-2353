import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  

  .fk-nav {
    position: sticky; top: 0; z-index: 100;
    background: ${NAVY2};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.5);
    border-bottom: 1px solid rgba(255,180,0,0.15);
  }
  .fk-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .fk-nav-logo img { width: 36px; height: 36px; border-radius: 8px; }
  .fk-nav-label { color: #fff; font-weight: 700; font-size: 1rem; }
  .fk-nav-sub { color: ${AMBER}; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .fk-nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .fk-nav-links a { color: #c8d4f0; text-decoration: none; font-size: 0.85rem; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
  .fk-nav-links a:hover { background: rgba(255,255,255,0.08); }
  .fk-btn-trial { background: ${AMBER}; color: ${DARK}; font-weight: 700; font-size: 0.85rem; padding: 8px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; }

  /* HERO */
  .fk-hero {
    background: linear-gradient(160deg, ${NAVY2} 0%, #0f2461 40%, #1a1a2e 100%);
    padding: 60px 24px 50px;
    display: flex; align-items: center; justify-content: center;
    gap: 60px; flex-wrap: wrap;
  }
  .fk-hero-text { color: #fff; max-width: 400px; }
  .fk-hero-text h1 { font-size: 2.2rem; font-weight: 800; line-height: 1.15; margin-bottom: 14px; }
  .fk-hero-text h1 span { color: ${AMBER}; }
  .fk-hero-text p { color: #a0b4d8; font-size: 1rem; line-height: 1.6; margin-bottom: 24px; }
  .fk-hero-cta { display: inline-block; background: ${AMBER}; color: ${DARK}; font-weight: 800; font-size: 1rem; padding: 14px 32px; border-radius: 10px; text-decoration: none; transition: opacity 0.2s; }
  .fk-hero-cta:hover { opacity: 0.88; }

  /* VIRTUAL CARD */
  .fk-card-outer { perspective: 800px; }
  .fk-vcard {
    width: 320px; height: 200px;
    border-radius: 18px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f2461 100%);
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,180,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
    padding: 22px 24px;
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    transform: rotateY(-8deg) rotateX(4deg);
    transition: transform 0.4s;
  }
  .fk-vcard:hover { transform: rotateY(0) rotateX(0); }
  .fk-vcard::before {
    content: ""; position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,180,0,0.15), transparent 70%);
  }
  .fk-vcard-top { display: flex; align-items: center; justify-content: space-between; }
  .fk-vcard-brand { color: #fff; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.05em; }
  .fk-vcard-brand span { color: ${AMBER}; }
  .fk-vcard-chip {
    width: 36px; height: 26px; border-radius: 4px;
    background: linear-gradient(135deg, #d4a017, #f5c842);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; color: #7c5e0a;
  }
  .fk-vcard-label {
    color: ${AMBER}; font-size: 1.3rem; font-weight: 800;
    letter-spacing: 0.15em; text-align: center;
  }
  .fk-vcard-num { color: rgba(255,255,255,0.7); font-family: 'DM Mono',monospace; font-size: 1rem; letter-spacing: 0.18em; }
  .fk-vcard-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
  .fk-vcard-name { color: rgba(255,255,255,0.85); font-family: 'DM Mono',monospace; font-size: 0.82rem; letter-spacing: 0.1em; }
  .fk-vcard-credit { background: ${AMBER}; color: ${DARK}; font-weight: 800; font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; }

  /* HOW IT WORKS */
  .fk-section { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
  .fk-section-title { font-size: 1.4rem; font-weight: 800; color: #e2e8f0; text-align: center; margin-bottom: 8px; }
  .fk-section-sub { color: #94a3b8; text-align: center; font-size: 0.9rem; margin-bottom: 32px; }
  .fk-section-title-dk { font-size: 1.4rem; font-weight: 800; color: ${NAVY}; text-align: center; margin-bottom: 8px; }
  .fk-section-sub-dk { color: #64748b; text-align: center; font-size: 0.9rem; margin-bottom: 32px; }

  .fk-steps { display: flex; justify-content: center; gap: 0; flex-wrap: wrap; }
  .fk-step { flex: 1; min-width: 200px; text-align: center; padding: 20px 16px; position: relative; }
  .fk-step:not(:last-child)::after { content: "→"; position: absolute; right: -6px; top: 40px; color: ${AMBER}; font-size: 1.4rem; }
  .fk-step-num { width: 48px; height: 48px; border-radius: 50%; background: ${AMBER}; color: ${DARK}; font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
  .fk-step-title { color: #fff; font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; }
  .fk-step-desc { color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }

  /* BENEFITS */
  .fk-benefits-bg { background: #f8faff; padding: 48px 24px; }
  .fk-benefits-inner { max-width: 900px; margin: 0 auto; }
  .fk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media(max-width:700px){ .fk-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:480px){ .fk-grid { grid-template-columns: 1fr; } }
  .fk-tile {
    background: #fff; border-radius: 12px; padding: 20px;
    box-shadow: 0 2px 10px rgba(11,42,107,0.07);
    border-top: 3px solid ${AMBER};
  }
  .fk-tile-icon { font-size: 1.8rem; margin-bottom: 8px; }
  .fk-tile-title { font-size: 0.88rem; font-weight: 700; color: ${NAVY}; margin-bottom: 4px; }
  .fk-tile-desc { font-size: 0.8rem; color: #64748b; line-height: 1.5; }

  /* PARTNERS */
  .fk-partners { background: ${NAVY2}; padding: 28px 24px; }
  .fk-partners-inner { max-width: 900px; margin: 0 auto; }
  .fk-partners-title { color: #94a3b8; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; margin-bottom: 16px; }
  .fk-partner-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .fk-partner-badge { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 8px 18px; color: #cbd5e1; font-weight: 700; font-size: 0.82rem; white-space: nowrap; }

  /* CALCULATOR */
  .fk-calc-bg { background: linear-gradient(135deg, ${NAVY2}, #0f2461); padding: 48px 24px; }
  .fk-calc-inner { max-width: 560px; margin: 0 auto; }
  .fk-calc-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,180,0,0.2); border-radius: 16px; padding: 32px; }
  .fk-calc-title { color: #fff; font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; }
  .fk-calc-sub { color: #94a3b8; font-size: 0.85rem; margin-bottom: 24px; }
  .fk-presets { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
  .fk-preset { border: 1.5px solid rgba(255,180,0,0.4); background: transparent; color: ${AMBER}; border-radius: 8px; padding: 8px 16px; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: 'Poppins',sans-serif; transition: all 0.2s; }
  .fk-preset.active, .fk-preset:hover { background: ${AMBER}; color: ${DARK}; border-color: ${AMBER}; }
  .fk-calc-input { width: 100%; border: 1.5px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); border-radius: 8px; padding: 10px 14px; color: #fff; font-family: 'Poppins',sans-serif; font-size: 1rem; outline: none; margin-bottom: 20px; }
  .fk-calc-input:focus { border-color: ${AMBER}; }
  .fk-calc-result { background: rgba(255,180,0,0.1); border: 1px solid rgba(255,180,0,0.3); border-radius: 10px; padding: 16px 20px; }
  .fk-calc-result-label { color: #a0b4d8; font-size: 0.82rem; margin-bottom: 6px; }
  .fk-calc-result-val { color: ${AMBER}; font-size: 2rem; font-weight: 800; font-family: 'DM Mono',monospace; }
  .fk-calc-breakdown { color: #94a3b8; font-size: 0.78rem; margin-top: 6px; }

  /* CTA */
  .fk-cta-bg { background: ${AMBER}; padding: 56px 24px; text-align: center; }
  .fk-cta-inner { max-width: 560px; margin: 0 auto; }
  .fk-cta-inner h2 { font-size: 1.8rem; font-weight: 800; color: ${DARK}; margin-bottom: 10px; }
  .fk-cta-inner p { color: rgba(6,9,15,0.65); font-size: 0.9rem; margin-bottom: 28px; }
  .fk-cta-btn { display: inline-block; background: ${NAVY}; color: #fff; font-weight: 800; font-size: 1.05rem; padding: 16px 40px; border-radius: 12px; text-decoration: none; transition: opacity 0.2s; margin-bottom: 14px; display: block; }
  .fk-cta-btn:hover { opacity: 0.88; }
  .fk-cta-note { color: rgba(6,9,15,0.55); font-size: 0.82rem; }

  @media(max-width:500px){
    .fk-hero h1 { font-size: 1.6rem; }
    .fk-vcard { width: 280px; height: 175px; }
    .fk-nav-links a { font-size: 0.75rem; padding: 5px 6px; }
    .fk-btn-trial { padding: 7px 10px; font-size: 0.78rem; }
    .fk-step:not(:last-child)::after { display: none; }
  }
`;

const benefits = [
  { icon: "💯", title: "$100 Instant Credit", desc: "Credited to your account the moment you activate — no waiting, no forms." },
  { icon: "⛽", title: "Discounts at 4,000+ Stops", desc: "Save cents per gallon at every major truck stop chain across the country." },
  { icon: "✅", title: "No Separate Application", desc: "Included in your plan. Activate in the app in under 60 seconds." },
  { icon: "🛂", title: "Works with PrePass", desc: "Seamless lane-bypass integration on the Pro plan saves time at weigh stations." },
  { icon: "📊", title: "Automatic Fuel Tracking", desc: "Every purchase logs itself — your fuel spend is always up to date." },
  { icon: "📝", title: "IRS-Deductible via Traxes", desc: "Fuel expenses flow directly into your tax tracker for easy deductions." },
];

const partners = ["Pilot Flying J", "Love's", "TA Petro", "Flying J", "Kwik Trip"];

const presets = [400, 600, 800, 1000];

export default function FuelCardPage() {
  const [spend, setSpend] = useState(600);
  const [custom, setCustom] = useState("");

  const effective = custom ? parseFloat(custom) || 0 : spend;
  // $100 first-month credit + 4¢/gal discount (avg ~150 gallons/week at ~$4/gal)
  const gallons = effective / 4;
  const galDiscount = gallons * 0.04;
  const firstMonthSavings = Math.round(100 + galDiscount * 4);

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="fk-nav">
        <a href="/" className="fk-nav-logo">
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
          <div>
            <div className="fk-nav-label">TruckWithEase</div>
            <div className="fk-nav-sub">$100 Fuel Card</div>
          </div>
        </a>
        <div className="fk-nav-links">
          <a href="/">← Back</a>
          <a href="/scorecard">Scorecard</a>
          <a href="/permit-book">Permits</a>
          <a href="/factoring">Factoring</a>
          <a href="/#pricing" className="fk-btn-trial">Start Free Trial</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="fk-hero">
        <div className="fk-hero-text">
          <h1>Your <span>$100 Fuel Card</span> is Ready to Activate</h1>
          <p>Fill up at 4,000+ truck stops nationwide with instant savings built right into your TruckWithEase plan. No separate application. No extra fees.</p>
          <a href="/#pricing" className="fk-hero-cta">Activate My Fuel Card →</a>
        </div>

        {/* VIRTUAL CARD */}
        <div className="fk-card-outer">
          <div className="fk-vcard">
            <div className="fk-vcard-top">
              <div className="fk-vcard-brand">Truck<span>WithEase</span></div>
              <div className="fk-vcard-chip">■■■</div>
            </div>
            <div className="fk-vcard-label">FUEL CARD</div>
            <div>
              <div className="fk-vcard-num">**** **** **** 4421</div>
            </div>
            <div className="fk-vcard-bottom">
              <div className="fk-vcard-name">RAY DAVIS</div>
              <div className="fk-vcard-credit">$100 CREDIT</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="fk-section">
        <div className="fk-section-title">How It Works</div>
        <div className="fk-section-sub">Three steps from sign-up to savings</div>
        <div className="fk-steps">
          <div className="fk-step">
            <div className="fk-step-num">1</div>
            <div className="fk-step-title">Sign Up</div>
            <div className="fk-step-desc">Choose Solo, Pro, or Fleet — your fuel card is included from day one.</div>
          </div>
          <div className="fk-step">
            <div className="fk-step-num">2</div>
            <div className="fk-step-title">Activate in the App</div>
            <div className="fk-step-desc">Tap "Activate Fuel Card" in your dashboard — your $100 credit loads instantly.</div>
          </div>
          <div className="fk-step">
            <div className="fk-step-num">3</div>
            <div className="fk-step-title">Fill Up & Save</div>
            <div className="fk-step-desc">Use it at 4,000+ locations — Pilot, Love's, TA Petro, Flying J, and more.</div>
          </div>
        </div>
      </div>

      {/* BENEFITS */}
      <div className="fk-benefits-bg">
        <div className="fk-benefits-inner">
          <div className="fk-section-title-dk">Everything You Get</div>
          <div className="fk-section-sub-dk">Six reasons truckers love the fuel card</div>
          <div className="fk-grid">
            {benefits.map((b, i) => (
              <div className="fk-tile" key={i}>
                <div className="fk-tile-icon">{b.icon}</div>
                <div className="fk-tile-title">{b.title}</div>
                <div className="fk-tile-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PARTNERS */}
      <div className="fk-partners">
        <div className="fk-partners-inner">
          <div className="fk-partners-title">Accepted at Truck Stops Nationwide</div>
          <div className="fk-partner-row">
            {partners.map((p) => (
              <div className="fk-partner-badge" key={p}>{p}</div>
            ))}
          </div>
        </div>
      </div>

      {/* SAVINGS CALCULATOR */}
      <div className="fk-calc-bg">
        <div className="fk-calc-inner">
          <div className="fk-calc-card">
            <div className="fk-calc-title">💰 Savings Calculator</div>
            <div className="fk-calc-sub">See how much you save in your first month</div>
            <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 10 }}>Weekly fuel spend ($)</div>
            <div className="fk-presets">
              {presets.map((p) => (
                <button
                  key={p}
                  className={`fk-preset${spend === p && !custom ? " active" : ""}`}
                  onClick={() => { setSpend(p); setCustom(""); }}
                >
                  ${p}
                </button>
              ))}
            </div>
            <input
              className="fk-calc-input"
              type="number"
              placeholder="Or enter a custom amount…"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); }}
            />
            <div className="fk-calc-result">
              <div className="fk-calc-result-label">You save in your first month:</div>
              <div className="fk-calc-result-val">${firstMonthSavings.toLocaleString()}</div>
              <div className="fk-calc-breakdown">
                $100 activation credit + avg 4¢/gal discount on ~{Math.round(gallons * 4).toLocaleString()} gallons
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fk-cta-bg">
        <div className="fk-cta-inner">
          <h2>Ready to Save at the Pump?</h2>
          <p>Your $100 fuel card activates the moment you sign up — no paperwork, no waiting.</p>
          <a href="/#pricing" className="fk-cta-btn">⚡ Activate My Fuel Card</a>
          <div className="fk-cta-note">
            Included in Solo ($19.99/mo), Pro ($34.99/mo), and Fleet plans. No separate application required.
          </div>
        </div>
      </div>
    </>
  );
}
