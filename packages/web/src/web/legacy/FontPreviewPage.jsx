import { useState } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#06090F";

const FONT_OPTIONS = [
  {
    id: "barlow",
    name: "Barlow Condensed",
    import: "Barlow+Condensed:wght@400;600;700;800;900",
    family: "'Barlow Condensed', sans-serif",
    tag: "Bold & Industrial",
    desc: "Tight, muscular, built for the road. Used by heavy-equipment brands. Headlines hit hard — feels like it was made for trucking.",
    vibe: "🏗️ Industrial strength",
    best: "Headlines & nav — pairs with Barlow body text",
    body: "'Barlow', sans-serif",
    bodyImport: "Barlow:wght@400;500;600",
  },
  {
    id: "rajdhani",
    name: "Rajdhani",
    import: "Rajdhani:wght@400;500;600;700",
    family: "'Rajdhani', sans-serif",
    tag: "Tech & Precision",
    desc: "Geometric, sharp-edged, confident. Reads as serious technology without being cold. Makes your HOS numbers and stats feel authoritative.",
    vibe: "⚡ Tech-forward authority",
    best: "Headlines + data displays",
    body: "'Nunito Sans', sans-serif",
    bodyImport: "Nunito+Sans:wght@400;500;600",
  },
  {
    id: "oswald",
    name: "Oswald",
    import: "Oswald:wght@400;500;600;700",
    family: "'Oswald', sans-serif",
    tag: "Classic American Bold",
    desc: "The condensed workhorse — every American trade magazine uses a variant of this. Recognizable, trustworthy, no-nonsense. Drivers know this feeling.",
    vibe: "🇺🇸 American workhorse",
    best: "Headlines + CTAs",
    body: "'Source Sans 3', sans-serif",
    bodyImport: "Source+Sans+3:wght@400;500;600",
  },
  {
    id: "exo",
    name: "Exo 2",
    import: "Exo+2:wght@400;500;600;700;800;900",
    family: "'Exo 2', sans-serif",
    tag: "Modern & Techy",
    desc: "Slightly futuristic but still friendly. Works great for both headlines and body text. Your DOT AI and Traxes features feel more advanced with this.",
    vibe: "🚀 Modern precision",
    best: "Full UI — headlines and body both",
    body: "'Exo 2', sans-serif",
    bodyImport: null,
  },
  {
    id: "bebas",
    name: "Bebas Neue + Inter",
    import: "Bebas+Neue&family=Inter:wght@400;500;600",
    family: "'Bebas Neue', sans-serif",
    tag: "Maximum Impact",
    desc: "All-caps display giant — used by NASCAR, Monster Energy, major trucking brands. Pure attention. Pairs with clean Inter for body text to balance the energy.",
    vibe: "💥 Maximum impact",
    best: "Hero sections & big stats only",
    body: "'Inter', sans-serif",
    bodyImport: null,
  },
  {
    id: "manrope",
    name: "Manrope",
    import: "Manrope:wght@400;500;600;700;800",
    family: "'Manrope', sans-serif",
    tag: "Clean & Premium",
    desc: "Geometric but warm. Feels like a premium SaaS product — think Stripe or Linear. Makes TruckWithEase look polished and credible to fleet managers.",
    vibe: "✨ Premium SaaS feel",
    best: "Full UI — very legible at all sizes",
    body: "'Manrope', sans-serif",
    bodyImport: null,
  },
];

// Entertainment feature ideas
const ENTERTAINMENT = [
  {
    icon: "🎬",
    title: "Moviease",
    desc: "A curated streaming library of trucking movies, documentaries, and cab-cam road trip films — available in the app during rest breaks. Think 'Convoy', 'Smokey and the Bandit', 'Maximum Overdrive', plus modern trucking YouTube originals.",
    plans: "Pro & Fleet",
    wow: "No other ELD app has this. Period.",
  },
  {
    icon: "🎙️",
    title: "Big Rig Radio",
    desc: "Curated trucking podcasts, CB culture throwbacks, road audio stories, and weekly industry news — all inside the app. Downloads for offline play during no-signal zones.",
    plans: "All plans",
    wow: "Keeps drivers in the app during breaks — increases retention.",
  },
  {
    icon: "🎮",
    title: "Rest Stop Mini-Games",
    desc: "Simple, one-hand games during mandatory rest breaks — earn Rig Bucks for playtime. Nothing that requires focus; think trucking trivia, parking challenges, road sign quizzes.",
    plans: "All plans",
    wow: "Turns mandatory 30-min breaks into engagement gold.",
  },
  {
    icon: "📡",
    title: "Live Trucking Community Feed",
    desc: "A real-time social feed for TruckWithEase drivers — road hazards, weigh station wait times, fuel price tips, parking wins. Like Waze but for the cab culture. Moderated + verified drivers only.",
    plans: "All plans",
    wow: "Creates network effects — more drivers = better data for everyone.",
  },
  {
    icon: "🏆",
    title: "Trucking Trivia League",
    desc: "Weekly trucking knowledge competitions — DOT rules, US geography, CB lingo, trucking history. Earn Rig Bucks for correct answers. Monthly prize: free Pro month for the top scorer.",
    plans: "All plans",
    wow: "Viral — drivers will challenge each other and post scores.",
  },
  {
    icon: "🎵",
    title: "Road Trip Playlists",
    desc: "Curated Spotify/Apple Music playlists built for different run types — midnight haul, city delivery, long-haul highway. Partnered with country, classic rock, and hip-hop labels who want the driver demographic.",
    plans: "All plans",
    wow: "Partnership opportunity — labels pay for the placement.",
  },
];

export default function FontPreviewPage() {
  const [activeFont, setActiveFont] = useState("barlow");
  const [loadedFonts, setLoadedFonts] = useState({ barlow: true });
  const selected = FONT_OPTIONS.find(f => f.id === activeFont);

  function selectFont(font) {
    setActiveFont(font.id);
    if (!loadedFonts[font.id]) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.import}&display=swap`;
      document.head.appendChild(link);
      if (font.bodyImport) {
        const link2 = document.createElement("link");
        link2.rel = "stylesheet";
        link2.href = `https://fonts.googleapis.com/css2?family=${font.bodyImport}&display=swap`;
        document.head.appendChild(link2);
      }
      setLoadedFonts(p => ({ ...p, [font.id]: true }));
    }
  }

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif", background: DARK, minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fp-font-btn { transition: all 0.18s; cursor: pointer; }
        .fp-font-btn:hover { border-color: rgba(255,180,0,0.5) !important; background: rgba(255,180,0,0.06) !important; }
        .fp-font-btn.active { border-color: ${AMBER} !important; background: rgba(255,180,0,0.1) !important; }
        .fp-ent-card { transition: transform 0.2s, background 0.2s; }
        .fp-ent-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.08) !important; }
        @media (max-width: 767px) {
          .fp-two-col { grid-template-columns: 1fr !important; }
          .fp-three-col { grid-template-columns: 1fr 1fr !important; }
          .fp-nav-links { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(6,9,15,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,180,0,0.1)", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "white" }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="fp-nav-links" style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#fonts" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>Text Styles</a>
          <a href="#entertainment" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>Entertainment Ideas</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none" }}>← Back to site</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 5%" }}>

        {/* ── FONT SECTION ── */}
        <section id="fonts">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Text Style Options</div>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "white", marginBottom: 12 }}>
              Pick the look that feels like <span style={{ color: ORANGE }}>TruckWithEase.</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
              Orange and navy stay exactly as they are — we're just finding the right text personality to match. Click each option to preview it live.
            </p>
          </div>

          {/* Font picker row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            {FONT_OPTIONS.map(font => (
              <button key={font.id} onClick={() => selectFont(font)}
                className={`fp-font-btn${activeFont === font.id ? " active" : ""}`}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 18px", fontFamily: font.family, color: "white", fontSize: 14, fontWeight: 700 }}>
                {font.name}
              </button>
            ))}
          </div>

          {/* Live preview card */}
          <div style={{ background: "#0C1628", borderRadius: 24, border: `2px solid ${AMBER}33`, overflow: "hidden", marginBottom: 16 }}>
            {/* Selected font info bar */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ color: AMBER, fontWeight: 800, fontSize: 15, fontFamily: selected.family }}>{selected.name}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginLeft: 12 }}>{selected.tag}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ background: "rgba(255,180,0,0.12)", border: "1px solid rgba(255,180,0,0.3)", color: AMBER, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{selected.vibe}</span>
                <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>Best for: {selected.best}</span>
              </div>
            </div>

            {/* HERO PREVIEW */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #001229 100%)`, padding: "48px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,107,0,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, display: "inline-block" }} />
                  <span style={{ color: "#FFB366", fontSize: 11, fontWeight: 700, fontFamily: selected.body, letterSpacing: 1.5, textTransform: "uppercase" }}>FMCSA-Ready · All 50 States · No Contracts</span>
                </div>
                <h1 style={{ fontFamily: selected.family, fontSize: "clamp(2.8rem,6vw,4.5rem)", fontWeight: 900, color: "white", lineHeight: 1.05, marginBottom: 18, letterSpacing: selected.id === "bebas" ? 2 : -1 }}>
                  Drive Smart.<br />
                  <span style={{ color: ORANGE }}>Stay Compliant.</span><br />
                  <span style={{ color: AMBER }}>Earn More.</span>
                </h1>
                <p style={{ fontFamily: selected.body, color: "rgba(255,255,255,0.7)", fontSize: 17, lineHeight: 1.8, marginBottom: 32, maxWidth: 480 }}>
                  The all-in-one platform built for owner-operators and fleets — HOS/ELD, DOT AI, load board, fuel card, and Traxes, your personal financial co-pilot. All in one app.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ background: ORANGE, color: "white", padding: "14px 32px", borderRadius: 10, fontFamily: selected.family, fontWeight: selected.id === "bebas" ? 400 : 800, fontSize: selected.id === "bebas" ? 18 : 15, letterSpacing: selected.id === "bebas" ? 1.5 : 0 }}>
                    Start 14-Day Free Trial
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "14px 24px", borderRadius: 10, fontFamily: selected.body, fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.2)" }}>
                    See the App →
                  </div>
                </div>
              </div>
            </div>

            {/* NAV PREVIEW */}
            <div style={{ background: "white", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #E2E8F0" }}>
              <span style={{ fontFamily: selected.family, fontWeight: 900, fontSize: 18, color: NAVY, letterSpacing: selected.id === "bebas" ? 1 : 0 }}>
                TruckWith<span style={{ color: AMBER }}>Ease</span>
              </span>
              <div style={{ display: "flex", gap: 22 }}>
                {["Features", "Traxes", "Rig Bucks", "Pricing"].map(l => (
                  <span key={l} style={{ fontFamily: selected.body, color: "#64748B", fontSize: 13, fontWeight: 500 }}>{l}</span>
                ))}
                <span style={{ fontFamily: selected.body, background: ORANGE, color: "white", padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700 }}>Start Free Trial</span>
              </div>
            </div>

            {/* PRICING CARD PREVIEW */}
            <div style={{ background: "#F8FAFC", padding: "32px 28px", display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { name: "Solo", price: "$19.99", color: AMBER },
                { name: "Pro", price: "$34.99", color: ORANGE, highlight: true },
                { name: "Fleet", price: "$24.99", color: GREEN },
              ].map(plan => (
                <div key={plan.name} style={{ flex: 1, minWidth: 160, background: plan.highlight ? ORANGE : "white", borderRadius: 14, padding: "20px 18px", border: `2px solid ${plan.highlight ? ORANGE : "#E2E8F0"}`, transform: plan.highlight ? "scale(1.04)" : "scale(1)" }}>
                  <div style={{ fontFamily: selected.body, fontSize: 11, fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,0.7)" : plan.color, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Owner-Operator</div>
                  <div style={{ fontFamily: selected.family, fontWeight: 900, fontSize: 22, color: plan.highlight ? "white" : "#0F172A", letterSpacing: selected.id === "bebas" ? 1 : 0, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontFamily: selected.family, fontWeight: 900, fontSize: 30, color: plan.highlight ? "white" : plan.color, letterSpacing: selected.id === "bebas" ? 1 : 0 }}>{plan.price}<span style={{ fontFamily: selected.body, fontSize: 13, fontWeight: 400, color: plan.highlight ? "rgba(255,255,255,0.6)" : "#94A3B8" }}>/mo</span></div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ padding: "20px 28px", background: "#080D1A" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.75 }}>
                <strong style={{ color: AMBER, fontFamily: selected.family }}>{selected.name}:</strong>{" "}
                <span style={{ fontFamily: selected.body }}>{selected.desc}</span>
              </p>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 80 }}>
            Tell us which one feels right and we'll apply it across every page instantly.
          </p>
        </section>

        {/* ── ENTERTAINMENT SECTION ── */}
        <section id="entertainment">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: ORANGE, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Subscriber Perks</div>
            <h2 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: "white", marginBottom: 14 }}>
              Entertainment ideas for<br /><span style={{ color: ORANGE }}>your drivers.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
              These live inside the app during rest breaks and downtime. Every one of these either keeps drivers in the app longer or creates something they'll tell other drivers about.
            </p>
          </div>

          <div className="fp-three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {ENTERTAINMENT.map((item, i) => (
              <div key={item.title} className="fp-ent-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 22px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 13.5, lineHeight: 1.75, marginBottom: 14 }}>{item.desc}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.25)", color: AMBER, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{item.plans}</span>
                  <span style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", color: "#FFB366", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{item.wow}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Moviease highlight */}
          <div style={{ marginTop: 28, background: `linear-gradient(135deg, ${NAVY} 0%, #0D2050 100%)`, borderRadius: 20, padding: "32px 36px", border: "1px solid rgba(255,107,0,0.3)" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🎬</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: ORANGE, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Moviease</div>
                <h3 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.3rem,2.5vw,1.8rem)", marginBottom: 12 }}>A streaming library built for the cab.</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8, maxWidth: 580, marginBottom: 16 }}>
                  This is genuinely differentiated. No ELD app on the market has a curated streaming library. During a 10-hour sleeper break, a driver wants options — and if TruckWithEase is where they watch Smokey and the Bandit, Convoy, Over the Limit, or a dashcam road-trip doc, they're staying subscribed.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { icon: "🎥", label: "Trucking classics", sub: "Convoy, Smokey & the Bandit, Maximum Overdrive" },
                    { icon: "📹", label: "Documentaries", sub: "Over the Limit, long-haul reality content" },
                    { icon: "🎙️", label: "Road originals", sub: "Dashcam clips, cab-tour videos, driver stories" },
                    { icon: "📱", label: "Download offline", sub: "No-signal zones covered — downloads before the haul" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 3 }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <p style={{ color: ORANGE, fontWeight: 700, fontSize: 13, marginTop: 16 }}>
                  💡 Licensing angle: Start with public domain trucking films + YouTube trucking creators who'd love the distribution. No Hollywood licensing costs to start.
                </p>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 24 }}>
            Tell us which entertainment features feel right and we'll design the in-app experience for them.
          </p>
        </section>
      </div>
    </div>
  );
}
