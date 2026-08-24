import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const LOADS = [
  { id: "LD-8821", origin: "Chicago, IL",      dest: "Kansas City, MO",   miles: 487, rate: 2.45, total: 1193, weight: "42,000", commodity: "General Freight",          trailer: "Dry Van",  pickup: "Today 14:00",    delivery: "Tomorrow 08:00", broker: "Echo Global",      brokerScore: 94, posted: "12 min ago" },
  { id: "LD-9034", origin: "St. Louis, MO",    dest: "Memphis, TN",       miles: 284, rate: 2.80, total: 795,  weight: "38,500", commodity: "Automotive Parts",         trailer: "Flatbed",  pickup: "Today 18:00",    delivery: "Tomorrow 10:00", broker: "Coyote Logistics",  brokerScore: 88, posted: "28 min ago" },
  { id: "LD-7712", origin: "Dallas, TX",       dest: "Oklahoma City, OK", miles: 198, rate: 3.10, total: 614,  weight: "29,000", commodity: "Electronics",              trailer: "Reefer",   pickup: "Tomorrow 06:00", delivery: "Tomorrow 14:00", broker: "XPO Logistics",     brokerScore: 79, posted: "1 hr ago"  },
  { id: "LD-6651", origin: "Denver, CO",       dest: "Albuquerque, NM",   miles: 450, rate: 2.60, total: 1170, weight: "44,000", commodity: "Construction Materials",   trailer: "Flatbed",  pickup: "Tomorrow 09:00", delivery: "Tomorrow 17:00", broker: "Landstar",          brokerScore: 91, posted: "2 hrs ago" },
  { id: "LD-5540", origin: "Indianapolis, IN", dest: "Columbus, OH",      miles: 175, rate: 2.95, total: 516,  weight: "35,000", commodity: "Food Products",            trailer: "Reefer",   pickup: "Today 20:00",    delivery: "Tomorrow 06:00", broker: "CH Robinson",       brokerScore: 85, posted: "3 hrs ago" },
  { id: "LD-4429", origin: "Houston, TX",      dest: "San Antonio, TX",   miles: 200, rate: 2.20, total: 440,  weight: "47,000", commodity: "Chemicals (Hazmat)",       trailer: "Tanker",   pickup: "Tomorrow 12:00", delivery: "Tomorrow 20:00", broker: "FreightQuote",      brokerScore: 76, posted: "4 hrs ago" },
];

const TRAILER_ICONS = { "Dry Van": "📦", "Flatbed": "🔧", "Reefer": "❄️", "Tanker": "🛢️" };

function rateColor(r) {
  if (r >= 3.0) return GREEN;
  if (r >= 2.7) return AMBER;
  return "#aab4cc";
}

function scoreColor(s) {
  if (s >= 90) return GREEN;
  if (s >= 80) return AMBER;
  return RED;
}

const BROKERS_DETAIL = {
  "Echo Global":      { contact: "(800) 354-7993", instructions: "No pallets. Straps required.", detention: "$50/hr after 2hrs", bol: "Electronic BOL accepted" },
  "Coyote Logistics": { contact: "(888) 267-9861", instructions: "Blanket wrap required.", detention: "$75/hr after 1hr", bol: "Paper BOL required" },
  "XPO Logistics":    { contact: "(800) 796-9726", instructions: "Temperature log required. Set at 35°F.", detention: "$60/hr after 2hrs", bol: "Electronic BOL accepted" },
  "Landstar":         { contact: "(800) 872-9400", instructions: "Tarps required. Chains provided by shipper.", detention: "$50/hr after 2hrs", bol: "Paper BOL required" },
  "CH Robinson":      { contact: "(800) 323-7587", instructions: "Keep below 38°F. No coloads.", detention: "$55/hr after 2hrs", bol: "Electronic BOL accepted" },
  "FreightQuote":     { contact: "(800) 323-5441", instructions: "Hazmat placards required. MSDS sheet on file.", detention: "$65/hr after 1hr", bol: "Paper BOL + hazmat docs" },
};

export default function LoadBoardPage() {
  const [search, setSearch] = useState("");
  const [trailerFilter, setTrailerFilter] = useState("All");
  const [minRate, setMinRate] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [expandedId, setExpandedId] = useState(null);
  const [postForm, setPostForm] = useState({ fromCity: "", destination: "", trailer: "Dry Van", date: "", maxWeight: "" });
  const [postSuccess, setPostSuccess] = useState(false);

  let filtered = LOADS.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.origin.toLowerCase().includes(q) || l.dest.toLowerCase().includes(q) || l.commodity.toLowerCase().includes(q);
    const matchTrailer = trailerFilter === "All" || l.trailer === trailerFilter;
    const matchRate = !minRate || l.rate >= parseFloat(minRate);
    return matchSearch && matchTrailer && matchRate;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "Rate") return b.rate - a.rate;
    if (sortBy === "Miles") return b.miles - a.miles;
    if (sortBy === "Total") return b.total - a.total;
    return 0;
  });

  function handlePost(e) {
    e.preventDefault();
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3000);
    setPostForm({ fromCity: "", destination: "", trailer: "Dry Van", date: "", maxWeight: "" });
  }

  const avgRate = (LOADS.reduce((s, l) => s + l.rate, 0) / LOADS.length).toFixed(2);
  const bestRate = Math.max(...LOADS.map(l => l.rate)).toFixed(2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lb-root { font-family: 'Poppins', sans-serif; background: #f0f2f8; color: ${DARK}; min-height: 100vh; }
        .lb-nav { position: sticky; top: 0; z-index: 100; background: ${NAVY2}; border-bottom: 3px solid ${AMBER}; display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 60px; }
        .lb-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1rem; color: #fff; text-decoration: none; }
        .lb-nav-logo img { width: 32px; height: 32px; object-fit: contain; }
        .lb-nav-title { color: ${AMBER}; font-size: 1rem; font-weight: 700; }
        .lb-nav-links { margin-left: auto; display: flex; gap: 16px; align-items: center; }
        .lb-nav-links a { color: #aab4cc; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: color 0.2s; }
        .lb-nav-links a:hover { color: ${AMBER}; }
        .lb-stats { background: ${NAVY}; padding: 16px 24px; display: flex; gap: 32px; align-items: center; flex-wrap: wrap; }
        .lb-stat { display: flex; flex-direction: column; }
        .lb-stat-val { font-family: 'DM Mono', monospace; font-size: 1.4rem; font-weight: 700; color: #fff; }
        .lb-stat-key { font-size: 0.68rem; color: #aab4cc; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .lb-stat-sep { width: 1px; height: 36px; background: #ffffff22; }
        .lb-truck-badge { margin-left: auto; background: ${AMBER}; color: ${DARK}; font-weight: 700; font-size: 0.75rem; padding: 6px 14px; border-radius: 20px; }
        .lb-filters { background: #fff; border-bottom: 1px solid #dde2f0; padding: 14px 24px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .lb-search { flex: 1; min-width: 180px; background: #f0f2f8; border: 1px solid #dde2f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.82rem; padding: 8px 14px; outline: none; color: ${DARK}; transition: border-color 0.2s; }
        .lb-search:focus { border-color: ${NAVY}; }
        .lb-select { background: #f0f2f8; border: 1px solid #dde2f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.82rem; padding: 8px 12px; outline: none; color: ${DARK}; cursor: pointer; }
        .lb-rate-input { width: 120px; background: #f0f2f8; border: 1px solid #dde2f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.82rem; padding: 8px 12px; outline: none; color: ${DARK}; }
        .lb-layout { display: flex; gap: 0; max-width: 1400px; margin: 0 auto; padding: 24px; gap: 24px; align-items: flex-start; }
        .lb-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .lb-sidebar { width: 280px; min-width: 280px; }
        .lb-card { background: #fff; border: 1px solid #dde2f0; border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s, border-color 0.2s; cursor: pointer; }
        .lb-card:hover { box-shadow: 0 4px 20px rgba(11,42,107,0.12); border-color: #c0cadf; }
        .lb-card-top { padding: 18px 20px; }
        .lb-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .lb-card-id { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #778; font-weight: 500; }
        .lb-card-posted { font-size: 0.68rem; color: #aab; }
        .lb-card-commodity { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .lb-commodity-icon { font-size: 1.1rem; }
        .lb-commodity-name { font-size: 0.78rem; font-weight: 600; color: #445; }
        .lb-trailer-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; background: #eef0f8; color: ${NAVY}; margin-left: 4px; }
        .lb-route { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .lb-city { font-size: 1.1rem; font-weight: 800; color: ${NAVY}; }
        .lb-route-arrow { color: ${ORANGE}; font-size: 1.2rem; font-weight: 900; }
        .lb-route-miles { font-size: 0.72rem; color: #778; font-weight: 500; }
        .lb-card-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
        .lb-meta-item { display: flex; flex-direction: column; }
        .lb-meta-val { font-size: 0.8rem; font-weight: 700; color: ${DARK}; }
        .lb-meta-key { font-size: 0.62rem; color: #aab; text-transform: uppercase; letter-spacing: 0.5px; }
        .lb-card-bottom { display: flex; align-items: center; justify-content: space-between; }
        .lb-broker-info { display: flex; align-items: center; gap: 8px; }
        .lb-broker-name { font-size: 0.75rem; font-weight: 600; color: #445; }
        .lb-score-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 10px; }
        .lb-rate-block { display: flex; align-items: baseline; gap: 8px; }
        .lb-rate-val { font-family: 'DM Mono', monospace; font-size: 1.5rem; font-weight: 700; }
        .lb-rate-unit { font-size: 0.72rem; color: #778; }
        .lb-rate-total { font-size: 0.8rem; font-weight: 700; color: #445; }
        .lb-card-actions { display: flex; gap: 8px; margin-left: 16px; }
        .lb-btn-book { background: ${NAVY}; color: #fff; border: none; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.78rem; padding: 8px 16px; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: opacity 0.2s; }
        .lb-btn-book:hover { opacity: 0.85; }
        .lb-btn-call { background: #fff; color: ${NAVY}; border: 2px solid ${NAVY}; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.78rem; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
        .lb-btn-call:hover { background: #f0f2f8; }
        .lb-expand-toggle { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; background: #f6f8ff; border-top: 1px solid #eef0f8; font-size: 0.72rem; color: ${NAVY}; font-weight: 600; }
        .lb-detail { padding: 18px 20px; background: #f6f8ff; border-top: 1px solid #eef0f8; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lb-detail-item { }
        .lb-detail-key { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; color: #aab; font-weight: 600; margin-bottom: 3px; }
        .lb-detail-val { font-size: 0.78rem; font-weight: 600; color: ${DARK}; }
        .lb-post-card { background: #fff; border: 1px solid #dde2f0; border-radius: 12px; padding: 20px; position: sticky; top: 84px; }
        .lb-post-title { font-size: 1rem; font-weight: 800; color: ${NAVY}; margin-bottom: 4px; }
        .lb-post-sub { font-size: 0.72rem; color: #778; margin-bottom: 16px; }
        .lb-post-form { display: flex; flex-direction: column; gap: 10px; }
        .lb-post-label { font-size: 0.72rem; font-weight: 700; color: #445; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
        .lb-post-input { width: 100%; background: #f0f2f8; border: 1px solid #dde2f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.8rem; padding: 9px 12px; outline: none; color: ${DARK}; transition: border-color 0.2s; }
        .lb-post-input:focus { border-color: ${NAVY}; }
        .lb-post-select { width: 100%; background: #f0f2f8; border: 1px solid #dde2f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.8rem; padding: 9px 12px; outline: none; color: ${DARK}; cursor: pointer; }
        .lb-post-btn { width: 100%; background: ${NAVY}; color: #fff; border: none; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.85rem; padding: 11px; border-radius: 8px; cursor: pointer; margin-top: 6px; transition: opacity 0.2s; }
        .lb-post-btn:hover { opacity: 0.85; }
        .lb-post-success { background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 10px; text-align: center; font-size: 0.78rem; font-weight: 700; color: ${GREEN}; margin-top: 8px; }
        @media (max-width: 900px) {
          .lb-layout { flex-direction: column; padding: 16px; }
          .lb-sidebar { width: 100%; min-width: 0; }
          .lb-post-card { position: static; }
          .lb-nav-links { display: none; }
          .lb-stats { gap: 16px; }
          .lb-stat-sep { display: none; }
          .lb-truck-badge { display: none; }
        }
      `}</style>
      <div className="lb-root">
        <nav className="lb-nav">
          <a href="/" className="lb-nav-logo">
            <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
            <span>TruckWithEase</span>
          </a>
          <span className="lb-nav-title">📦 Load Board</span>
          <div className="lb-nav-links">
            <a href="/load-profit">Load Profit Calc</a>
            <a href="/command">Command Center</a>
            <a href="/#pricing" style={{ background: '#FFB400', color: '#06090F', padding: '6px 14px', borderRadius: 7, fontWeight: 800 }}>Free Trial</a>
            <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>← Back</a>
          </div>
        </nav>

        <div className="lb-stats">
          <div className="lb-stat">
            <span className="lb-stat-val">{LOADS.length}</span>
            <span className="lb-stat-key">Available Loads</span>
          </div>
          <div className="lb-stat-sep"></div>
          <div className="lb-stat">
            <span className="lb-stat-val" style={{ color: AMBER }}>${avgRate}/mi</span>
            <span className="lb-stat-key">Avg Rate/Mi</span>
          </div>
          <div className="lb-stat-sep"></div>
          <div className="lb-stat">
            <span className="lb-stat-val" style={{ color: GREEN }}>${bestRate}/mi</span>
            <span className="lb-stat-key">Best Rate</span>
          </div>
          <div className="lb-stat-sep"></div>
          <div className="lb-stat">
            <span className="lb-stat-val">Live</span>
            <span className="lb-stat-key">Feed Status</span>
          </div>
          <div className="lb-truck-badge">🚛 Dry Van · Your Truck</div>
        </div>

        <div className="lb-filters">
          <input
            className="lb-search"
            placeholder="Search origin, destination, or commodity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="lb-select" value={trailerFilter} onChange={e => setTrailerFilter(e.target.value)}>
            <option value="All">All Trailers</option>
            <option>Dry Van</option>
            <option>Flatbed</option>
            <option>Reefer</option>
            <option>Tanker</option>
          </select>
          <input
            className="lb-rate-input"
            type="number"
            step="0.1"
            placeholder="Min $/mi"
            value={minRate}
            onChange={e => setMinRate(e.target.value)}
          />
          <select className="lb-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option>Newest</option>
            <option>Rate</option>
            <option>Miles</option>
            <option>Total</option>
          </select>
        </div>

        <div className="lb-layout">
          <div className="lb-main">
            {filtered.map(load => {
              const expanded = expandedId === load.id;
              const detail = BROKERS_DETAIL[load.broker] || {};
              return (
                <div key={load.id} className="lb-card">
                  <div className="lb-card-top" onClick={() => setExpandedId(expanded ? null : load.id)}>
                    <div className="lb-card-header">
                      <span className="lb-card-id">{load.id}</span>
                      <span className="lb-card-posted">🕐 {load.posted}</span>
                    </div>
                    <div className="lb-card-commodity">
                      <span className="lb-commodity-icon">{TRAILER_ICONS[load.trailer] || "📦"}</span>
                      <span className="lb-commodity-name">{load.commodity}</span>
                      <span className="lb-trailer-badge">{load.trailer}</span>
                    </div>
                    <div className="lb-route">
                      <span className="lb-city">{load.origin}</span>
                      <span className="lb-route-arrow">→</span>
                      <span className="lb-city">{load.dest}</span>
                      <span className="lb-route-miles">· {load.miles} mi</span>
                    </div>
                    <div className="lb-card-meta">
                      <div className="lb-meta-item">
                        <span className="lb-meta-val">📅 {load.pickup}</span>
                        <span className="lb-meta-key">Pickup</span>
                      </div>
                      <div className="lb-meta-item">
                        <span className="lb-meta-val">📅 {load.delivery}</span>
                        <span className="lb-meta-key">Delivery</span>
                      </div>
                      <div className="lb-meta-item">
                        <span className="lb-meta-val">{load.weight} lbs</span>
                        <span className="lb-meta-key">Weight</span>
                      </div>
                    </div>
                    <div className="lb-card-bottom">
                      <div>
                        <div className="lb-broker-info" style={{ marginBottom: 4 }}>
                          <span className="lb-broker-name">{load.broker}</span>
                          <span className="lb-score-badge" style={{ background: scoreColor(load.brokerScore) + "22", color: scoreColor(load.brokerScore) }}>
                            {load.brokerScore}/100
                          </span>
                        </div>
                        <div className="lb-rate-block">
                          <span className="lb-rate-val" style={{ color: rateColor(load.rate) }}>${load.rate.toFixed(2)}</span>
                          <span className="lb-rate-unit">/mi</span>
                          <span className="lb-rate-total">· ${load.total.toLocaleString()} total</span>
                        </div>
                      </div>
                      <div className="lb-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="lb-btn-book">Book Load</button>
                        <a href="/scan-bill" className="lb-btn-call" style={{ textDecoration: "none" }}>📄 Scan BOL</a>
                      </div>
                    </div>
                  </div>
                  <div className="lb-expand-toggle">
                    {expanded ? "▲ Hide Details" : "▼ Show Full Details"}
                  </div>
                  {expanded && (
                    <div className="lb-detail">
                      <div className="lb-detail-item">
                        <div className="lb-detail-key">Broker Contact</div>
                        <div className="lb-detail-val">{detail.contact}</div>
                      </div>
                      <div className="lb-detail-item">
                        <div className="lb-detail-key">Detention Policy</div>
                        <div className="lb-detail-val">{detail.detention}</div>
                      </div>
                      <div className="lb-detail-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lb-detail-key">Special Instructions</div>
                        <div className="lb-detail-val">{detail.instructions}</div>
                      </div>
                      <div className="lb-detail-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lb-detail-key">BOL Requirements</div>
                        <div className="lb-detail-val">{detail.bol}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aab" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📦</div>
                <div style={{ fontWeight: 700 }}>No loads match your filters</div>
                <div style={{ fontSize: "0.82rem", marginTop: 6 }}>Try adjusting your search or filters</div>
              </div>
            )}
          </div>

          <div className="lb-sidebar">
            <div className="lb-post-card">
              <div className="lb-post-title">Post My Truck</div>
              <div className="lb-post-sub">Let brokers find you — get matched to loads automatically</div>
              <form className="lb-post-form" onSubmit={handlePost}>
                <div>
                  <label className="lb-post-label">Available From</label>
                  <input
                    className="lb-post-input"
                    placeholder="City, State"
                    value={postForm.fromCity}
                    onChange={e => setPostForm(p => ({ ...p, fromCity: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="lb-post-label">Preferred Destination</label>
                  <input
                    className="lb-post-input"
                    placeholder="City, State or 'Anywhere'"
                    value={postForm.destination}
                    onChange={e => setPostForm(p => ({ ...p, destination: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="lb-post-label">Trailer Type</label>
                  <select
                    className="lb-post-select"
                    value={postForm.trailer}
                    onChange={e => setPostForm(p => ({ ...p, trailer: e.target.value }))}
                  >
                    <option>Dry Van</option>
                    <option>Flatbed</option>
                    <option>Reefer</option>
                    <option>Tanker</option>
                    <option>Step Deck</option>
                    <option>Lowboy</option>
                  </select>
                </div>
                <div>
                  <label className="lb-post-label">Available Date</label>
                  <input
                    className="lb-post-input"
                    type="date"
                    value={postForm.date}
                    onChange={e => setPostForm(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="lb-post-label">Max Weight (lbs)</label>
                  <input
                    className="lb-post-input"
                    placeholder="e.g. 44,000"
                    value={postForm.maxWeight}
                    onChange={e => setPostForm(p => ({ ...p, maxWeight: e.target.value }))}
                  />
                </div>
                <button type="submit" className="lb-post-btn">🚛 Post My Truck</button>
              </form>
              {postSuccess && (
                <div className="lb-post-success">✅ Truck posted! Brokers can now find you.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
