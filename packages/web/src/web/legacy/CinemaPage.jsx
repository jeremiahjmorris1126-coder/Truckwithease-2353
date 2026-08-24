import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#06090F";
const DEEP   = "#03050A";

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.08 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── Film Library Data ──────────────────────────────────────────────────────
const CATEGORIES = ["All", "Road Classics", "Documentaries", "Driver Stories", "Road Trips", "New Releases"];

const FILMS = [
  {
    id: 1,
    title: "Convoy",
    year: 1978,
    runtime: "1h 50m",
    rating: "PG",
    score: 4.2,
    category: "Road Classics",
    tag: "CLASSIC",
    tagColor: AMBER,
    desc: "A legendary trucker leads a convoy of rigs across the American Southwest to protest police harassment. The film that defined trucker culture.",
    poster: "/static/gen_cinema-poster-1-b581cd.webp",
    stars: ["Kris Kristofferson", "Ali MacGraw", "Ernest Borgnine"],
    badge: "🎬 Fan Favorite",
    youtubeId: "rvWqEgBYy4A",
    freeToWatch: true,
  },
  {
    id: 2,
    title: "Night Run",
    year: 2024,
    runtime: "1h 38m",
    rating: "NR",
    score: 4.6,
    category: "Driver Stories",
    tag: "ORIGINAL",
    tagColor: ORANGE,
    desc: "A solo owner-operator hauls a mystery load across three states overnight. Breathtaking cab footage shot entirely on dashcam. A Moviease original.",
    poster: "/static/gen_cinema-poster-2-69dab9.webp",
    stars: ["Moviease Original"],
    badge: "🚛 TWE Original",
    youtubeId: "dQw4w9WgXcQ",
    freeToWatch: false,
  },
  {
    id: 3,
    title: "Open Road: The Driver's Life",
    year: 2023,
    runtime: "58m",
    rating: "NR",
    score: 4.8,
    category: "Documentaries",
    tag: "DOCUMENTARY",
    tagColor: GREEN,
    desc: "Five owner-operators. Five hauls. One week on the road. An intimate look at the real life behind the wheel — the freedom, the grind, and everything in between.",
    poster: "/static/gen_cinema-poster-3-855518.webp",
    stars: ["Real Drivers", "Real Loads", "Real America"],
    badge: "⭐ Highest Rated",
    youtubeId: "yNLHsHNAVVQ",
    freeToWatch: true,
  },
  {
    id: 4,
    title: "Storm Chaser Haul",
    year: 2025,
    runtime: "1h 12m",
    rating: "NR",
    score: 4.4,
    category: "Road Trips",
    tag: "NEW",
    tagColor: "#60A5FA",
    desc: "A driver racing a tornado season haul through Tornado Alley — shot entirely from inside the cab. Weather, roads, and pure adrenaline.",
    poster: "/static/gen_cinema-poster-4-f950ec.webp",
    stars: ["Moviease"],
    badge: "🌪️ New Release",
    youtubeId: "BFpGQNFqsHo",
    freeToWatch: false,
  },
  {
    id: 5,
    title: "Last Stop Diner",
    year: 2022,
    runtime: "44m",
    rating: "NR",
    score: 4.7,
    category: "Driver Stories",
    tag: "DOCUMENTARY",
    tagColor: GREEN,
    desc: "Portraits of the people who keep America's truck stops alive — the waitresses, the regulars, the late-night talkers. A love letter to roadside America.",
    poster: "/static/gen_cinema-poster-5-1253a6.webp",
    stars: ["Award-Winning Short Documentary"],
    badge: "🏆 Award Winner",
    youtubeId: "v=9bZkp7q19f0",
    freeToWatch: true,
  },
  {
    id: 6,
    title: "10-4: Convoy Nation",
    year: 2025,
    runtime: "1h 28m",
    rating: "NR",
    score: 4.5,
    category: "Documentaries",
    tag: "NEW",
    tagColor: "#60A5FA",
    desc: "The untold history of CB radio, trucker culture, and how owner-operators built the backbone of American commerce. Interviews with drivers who were there.",
    poster: "/static/gen_cinema-poster-6-b84b96.webp",
    stars: ["Historical Documentary", "2025"],
    badge: "📻 CB Culture",
    youtubeId: "FTQbiNvZqaY",
    freeToWatch: false,
  },
];

const FEATURED = FILMS[2]; // Open Road — highest rated

function StarRating({ score }) {
  const full  = Math.floor(score);
  const half  = score % 1 >= 0.5;
  return (
    <span style={{ color: AMBER, fontSize: 13 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginLeft: 4 }}>{score}</span>
    </span>
  );
}

export default function CinemaPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FILMS.filter(f => {
    const matchCat  = activeCategory === "All" || f.category === activeCategory;
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: DEEP, minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${DEEP}; }
        ::-webkit-scrollbar-thumb { background: #1A2840; border-radius: 2px; }
        .cin-nav-link { transition: color 0.2s; }
        .cin-nav-link:hover { color: ${AMBER} !important; }
        .cin-cat { transition: all 0.18s; cursor: pointer; }
        .cin-cat:hover { background: rgba(255,180,0,0.1) !important; color: ${AMBER} !important; }
        .cin-cat.active { background: ${AMBER} !important; color: ${DEEP} !important; }
        .cin-card { transition: transform 0.22s, box-shadow 0.22s; cursor: pointer; }
        .cin-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important; }
        .cin-play { transition: all 0.18s; }
        .cin-play:hover { transform: scale(1.08); background: ${ORANGE} !important; }
        @keyframes cinShimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes cinPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.6; }
        }
        .cin-live { animation: cinPulse 2s ease-in-out infinite; }
        .cin-modal-overlay { animation: cinFadeIn 0.2s ease both; }
        @keyframes cinFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cin-modal-card { animation: cinSlideUp 0.28s cubic-bezier(.22,1,.36,1) both; }
        @keyframes cinSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 767px) {
          .cin-hero-grid { grid-template-columns: 1fr !important; }
          .cin-film-grid { grid-template-columns: 1fr 1fr !important; }
          .cin-nav-links { display: none !important; }
          .cin-cats { overflow-x: auto; flex-wrap: nowrap !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(3,5,10,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,107,0,0.15)", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎬</span>
            <span style={{ fontWeight: 900, fontSize: 16, color: "white", letterSpacing: -0.3 }}>
              Movie<span style={{ color: ORANGE }}>ase</span>
            </span>
          </div>
          <span style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", color: ORANGE, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, letterSpacing: 1.5 }}>PRO & FLEET</span>
        </div>
        <div className="cin-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[["#browse","Browse"],["#originals","TWE Originals"],["#coming-soon","Coming Soon"]].map(([h,l]) => (
            <a key={h} href={h} className="cin-nav-link" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
          <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "8px 18px", borderRadius: 7, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Upgrade to Pro</a>
          <a href="/" className="cin-nav-link" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      {/* ── HERO — Featured Film ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "78vh" }}>
        {/* Full-bleed hero image */}
        <img src="/static/gen_cinema-hero-c90ff7.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(3,5,10,0.92) 45%, rgba(3,5,10,0.3) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to top, rgba(3,5,10,1) 0%, transparent 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "80px 5%", maxWidth: 1200, margin: "0 auto" }}>
          <div className="cin-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "center" }}>
            <div>
              {/* Featured badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div className="cin-live" style={{ width: 7, height: 7, borderRadius: "50%", background: ORANGE }} />
                <span style={{ color: ORANGE, fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase" }}>Featured Tonight</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, marginBottom: 16, color: "white" }}>
                {FEATURED.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
                <StarRating score={FEATURED.score} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{FEATURED.year}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{FEATURED.runtime}</span>
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)" }}>{FEATURED.rating}</span>
                <span style={{ background: `${GREEN}20`, color: GREEN, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, border: `1px solid ${GREEN}40` }}>{FEATURED.badge}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 16, lineHeight: 1.8, maxWidth: 520, marginBottom: 32 }}>
                {FEATURED.desc}
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setSelectedFilm(FEATURED)} className="cin-play" style={{ background: "white", color: DEEP, border: "none", padding: "14px 32px", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 10 }}>
                  ▶ Watch Now
                </button>
                <button onClick={() => setSelectedFilm(FEATURED)} style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 24px", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  More Info
                </button>
              </div>
            </div>

            {/* Featured poster */}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src={FEATURED.poster} alt={FEATURED.title} style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── BROWSE ──────────────────────────────────────────────────────────── */}
      <section id="browse" style={{ padding: "60px 5% 40px", background: DEEP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            {/* Search + categories */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <div className="cin-cats" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`cin-cat${activeCategory === cat ? " active" : ""}`}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "7px 16px", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>
                    {cat}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Search films…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 16px", color: "white", fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", width: 200 }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
          </FadeIn>

          {/* Film grid */}
          <div className="cin-film-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {filtered.map((film, i) => (
              <FadeIn key={film.id} delay={i * 60}>
                <div className="cin-card" onClick={() => setSelectedFilm(film)} style={{ background: "#0A1220", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  {/* Poster */}
                  <div style={{ position: "relative" }}>
                    <img src={film.poster} alt={film.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                    {/* Overlay on hover via CSS — handled by card hover */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,18,32,0.95) 0%, transparent 50%)" }} />
                    {/* Tag */}
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                      <span style={{ background: film.tagColor, color: DEEP, fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 6, letterSpacing: 1 }}>{film.tag}</span>
                    </div>
                    {/* Play button */}
                    <div style={{ position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>▶</div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{film.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <StarRating score={film.score} />
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{film.year} · {film.runtime}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6 }}>{film.desc.slice(0, 90)}…</p>
                    <div style={{ marginTop: 10 }}>
                      <span style={{ background: "rgba(74,222,128,0.08)", color: GREEN, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, border: `1px solid ${GREEN}30` }}>{film.badge}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
              <div style={{ fontSize: 15 }}>No films found for "{search}"</div>
            </div>
          )}
        </div>
      </section>

      {/* ── TWE ORIGINALS BANNER ────────────────────────────────────────────── */}
      <section id="originals" style={{ padding: "70px 5%", background: `linear-gradient(135deg, ${NAVY2} 0%, #0A1830 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 18 }}>
                  <span style={{ fontSize: 14 }}>🚛</span>
                  <span style={{ color: ORANGE, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Moviease Originals</span>
                </div>
                <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 14 }}>
                  Stories made by drivers,<br /><span style={{ color: ORANGE }}>for drivers.</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, maxWidth: 480, marginBottom: 24 }}>
                  Moviease Originals are produced with real owner-operators and shot from the cab — dashcam footage, real loads, real roads. No Hollywood, no scripts. Just the actual life.
                </p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { icon: "📹", label: "Dashcam footage", sub: "Real cab, real load" },
                    { icon: "📥", label: "Download offline", sub: "Watch no-signal zones" },
                    { icon: "🏆", label: "Rig Bucks", sub: "+50 pts per film watched" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flexShrink: 0, width: 320 }}>
                {FILMS.filter(f => f.tag === "ORIGINAL" || f.tag === "NEW").slice(0, 4).map(film => (
                  <div key={film.id} onClick={() => setSelectedFilm(film)} style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    <img src={film.poster} alt={film.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── COMING SOON ─────────────────────────────────────────────────────── */}
      <section id="coming-soon" style={{ padding: "70px 5% 80px", background: DEEP }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ marginBottom: 36 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Coming This Quarter</div>
              <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 900, color: "white" }}>
                What's coming to <span style={{ color: AMBER }}>Moviease.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
            {[
              { icon: "🎥", title: "Maximum Overdrive", note: "1986 · Stephen King · Road Classic", status: "Licensing Review" },
              { icon: "🏁", title: "Smokey and the Bandit", note: "1977 · Road Legend · Burt Reynolds", status: "Licensing Review" },
              { icon: "📡", title: "Over the Limit: Long Haul Life", note: "Season 2 · TWE Original Documentary", status: "In Production" },
              { icon: "🌙", title: "Midnight Miles Podcast", note: "Weekly · Audio series for the late haul", status: "Coming Aug 2026" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 50}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 8 }}>{item.note}</div>
                    <span style={{ background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.25)", color: AMBER, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{item.status}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 5% 80px", background: "#080D1A" }}>
        <FadeIn>
          <div style={{ maxWidth: 680, margin: "0 auto", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, borderRadius: 20, padding: "36px 40px", textAlign: "center", border: "1px solid rgba(255,107,0,0.25)" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎬</div>
            <h2 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2.2rem)", marginBottom: 12 }}>
              Moviease is included<br />in <span style={{ color: ORANGE }}>Pro & Fleet plans.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, marginBottom: 28, maxWidth: 460, margin: "0 auto 28px" }}>
              Upgrade to Pro and get full Cinema access alongside every compliance tool, Traxes financial AI, Rig Bucks, and the $100 fuel card — all for $34.99/mo.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "14px 32px", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 24px rgba(255,107,0,0.4)" }}>
                Upgrade to Pro — $34.99/mo
              </a>
              <a href="/" style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "14px 24px", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
                ← Back to Site
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 16 }}>14-day free trial · No credit card required · Cancel anytime</p>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#020407", padding: "22px 5%", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>© 2026 Moviease · Streaming for drivers · Part of TruckWithEase</span>
        <a href="/" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textDecoration: "none" }}>← Back to main site</a>
      </footer>

      {/* ── FILM MODAL ──────────────────────────────────────────────────────── */}
      {selectedFilm && (
        <div className="cin-modal-overlay" onClick={() => setSelectedFilm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "5%", backdropFilter: "blur(8px)" }}>
          <div className="cin-modal-card" onClick={e => e.stopPropagation()} style={{ background: "#0A1220", borderRadius: 20, overflow: "hidden", maxWidth: 640, width: "100%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}>
            <div style={{ position: "relative" }}>
              {selectedFilm.freeToWatch && selectedFilm.youtubeId ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedFilm.youtubeId}?autoplay=1&rel=0`}
                  title={selectedFilm.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                />
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <img src={selectedFilm.poster} alt={selectedFilm.title} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
                {!selectedFilm.freeToWatch && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 40 }}>🔒</div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Pro & Fleet Subscribers</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Upgrade to watch</div>
                  </div>
                )}
              </div>
            )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,18,32,1) 0%, transparent 50%)" }} />
              <button onClick={() => setSelectedFilm(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                <span style={{ background: selectedFilm.tagColor, color: DEEP, fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 6, letterSpacing: 1 }}>{selectedFilm.tag}</span>
              </div>
            </div>
            <div style={{ padding: "20px 24px 28px" }}>
              <h3 style={{ color: "white", fontWeight: 900, fontSize: 22, marginBottom: 8 }}>{selectedFilm.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <StarRating score={selectedFilm.score} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{selectedFilm.year}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{selectedFilm.runtime}</span>
                <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{selectedFilm.rating}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{selectedFilm.desc}</p>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }}>
                {selectedFilm.stars.join(" · ")}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {selectedFilm.freeToWatch ? (
                  <button onClick={() => {}} style={{ flex: 1, background: ORANGE, color: "white", padding: "13px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                    ▶ Now Playing Above
                  </button>
                ) : (
                  <a href="/signup" style={{ flex: 1, background: ORANGE, color: "white", padding: "13px", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none", textAlign: "center" }}>
                    🔓 Upgrade to Pro · $34.99/mo
                  </a>
                )}
                <button onClick={() => setSelectedFilm(null)} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "13px 20px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
