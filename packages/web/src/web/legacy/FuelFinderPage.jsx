import { useState, useRef, useEffect } from "react";
import { loadGoogleMaps } from "./maps-config.js";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const FUEL_STOPS = [
  { id: 1, name: "Pilot Travel Center",     exit: "220", distance: 4.2,  diesel: 3.07, def: 2.89, showers: true, food: true, wifi: true, scales: true, parking: 38, showersWait: 0,   type: "truck_stop", city: "Texarkana, TX",     lat: 35, lng: 20 },
  { id: 2, name: "Love's Travel Stop",      exit: "11",  distance: 8.5,  diesel: 3.12, def: 2.94, showers: true, food: true, wifi: true, scales: false, parking: 22, showersWait: 15,  type: "truck_stop", city: "Memphis, TN",       lat: 55, lng: 70 },
  { id: 3, name: "TA Petro Stopping Ctr",   exit: "35",  distance: 12.1, diesel: 3.18, def: 2.99, showers: true, food: true, wifi: false,scales: true,  parking: 14, showersWait: 30,  type: "truck_stop", city: "Little Rock, AR",   lat: 40, lng: 45 },
  { id: 4, name: "Flying J Travel Center",  exit: "48",  distance: 15.8, diesel: 3.09, def: 2.91, showers: true, food: true, wifi: true, scales: true,  parking: 45, showersWait: 5,   type: "truck_stop", city: "Joplin, MO",       lat: 30, lng: 60 },
  { id: 5, name: "Casey's General Store",   exit: "7",   distance: 3.1,  diesel: 3.22, def: null, showers: false,food: true, wifi: false,scales: false, parking: 4,  showersWait: null,type: "gas",        city: "Texarkana, TX",     lat: 45, lng: 30 },
  { id: 6, name: "Kwik Trip Truck Stop",    exit: "61",  distance: 22.4, diesel: 3.04, def: 2.88, showers: true, food: true, wifi: true, scales: true,  parking: 60, showersWait: 0,   type: "truck_stop", city: "Springfield, MO",   lat: 25, lng: 50 },
  { id: 7, name: "Maverick Transport Fuel", exit: "14",  distance: 6.7,  diesel: 3.15, def: 2.97, showers: false,food: false,wifi: false,scales: false, parking: 8,  showersWait: null,type: "truck_stop", city: "Hope, AR",          lat: 60, lng: 35 },
  { id: 8, name: "Petro Stopping Center",   exit: "42",  distance: 18.3, diesel: 3.11, def: 2.93, showers: true, food: true, wifi: true, scales: true,  parking: 32, showersWait: 20,  type: "truck_stop", city: "Oklahoma City, OK", lat: 50, lng: 80 },
];

const prices = FUEL_STOPS.map(s => s.diesel);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

function priceColor(p) {
  if (p <= minPrice + 0.03) return GREEN;
  if (p >= maxPrice - 0.03) return RED;
  return AMBER;
}

function priceLabel(p) {
  if (p <= minPrice + 0.03) return "BEST";
  if (p >= maxPrice - 0.03) return "HIGH";
  return "AVG";
}

const FILTERS = ["All", "Truck Stop", "DEF Available", "Showers", "Scales"];

const FUEL_COORDS = {
  1: { lat: 33.4357, lng: -94.0477 }, 2: { lat: 35.1495, lng: -90.0490 },
  3: { lat: 37.0842, lng: -94.5133 }, 4: { lat: 35.2220, lng: -101.8313 },
  5: { lat: 37.2153, lng: -93.2982 }, 6: { lat: 35.4676, lng: -97.5164 },
  7: { lat: 34.7465, lng: -92.2896 }, 8: { lat: 38.2527, lng: -85.7585 },
};

export default function FuelFinderPage() {
  const fuelMapRef = useRef(null);
  const fuelMapObj = useRef(null);
  const [fuelMapLoaded, setFuelMapLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedStop, setSelectedStop] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "ai", text: "I found 3 diesel stops under $3.10/gal within 40 miles. The cheapest is Pilot at Exit 220 — $3.07/gal with 24 open spots and no shower wait." }
  ]);

  const filtered = FUEL_STOPS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.exit.includes(q);
    let matchFilter = true;
    if (activeFilter === "Truck Stop") matchFilter = s.type === "truck_stop";
    if (activeFilter === "DEF Available") matchFilter = !!s.def;
    if (activeFilter === "Showers") matchFilter = s.showers;
    if (activeFilter === "Scales") matchFilter = s.scales;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!fuelMapRef.current || fuelMapObj.current) return;
      const map = new window.google.maps.Map(fuelMapRef.current, {
        center: { lat: 36.0, lng: -93.0 }, zoom: 6,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#07111f' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8EC3B9' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e3a6e' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d5a9e' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1929' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });
      fuelMapObj.current = map;
      FUEL_STOPS.forEach(stop => {
        const coords = FUEL_COORDS[stop.id];
        if (!coords) return;
        const color = stop.price < 3.15 ? '#16A34A' : stop.price < 3.25 ? '#FFB400' : '#DC2626';
        const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/><text x="16" y="20" text-anchor="middle" font-size="12" fill="white">⛽</text></svg>`);
        new window.google.maps.Marker({
          position: coords, map,
          icon: { url: 'data:image/svg+xml;utf8,' + svg, scaledSize: new window.google.maps.Size(32, 32) },
          title: `${stop.name} — $${stop.price.toFixed(3)}/gal`,
        });
      });
      setFuelMapLoaded(true);
    }).catch(() => {});
  }, []);

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { from: "user", text: chatInput },
      { from: "ai", text: "Checking real-time availability... Pilot at Exit 220 still has the best diesel rate at $3.07/gal with open parking. Love's at Exit 11 is next at $3.12/gal with a 15-min shower wait." }
    ]);
    setChatInput("");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a1628; }
        .ff-root { font-family: 'Poppins', sans-serif; background: #0a1628; color: #e8eaf0; min-height: 100vh; }
        .ff-nav { position: sticky; top: 0; z-index: 100; background: ${NAVY2}; border-bottom: 2px solid ${AMBER}; display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 60px; }
        .ff-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1rem; color: #fff; text-decoration: none; }
        .ff-nav-logo img { width: 32px; height: 32px; object-fit: contain; }
        .ff-nav-title { color: ${AMBER}; font-size: 1rem; font-weight: 700; }
        .ff-nav-links { margin-left: auto; display: flex; gap: 16px; align-items: center; }
        .ff-nav-links a { color: #aab4cc; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: color 0.2s; }
        .ff-nav-links a:hover { color: ${AMBER}; }
        .ff-back { color: ${AMBER}; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .ff-layout { display: flex; height: calc(100vh - 60px); overflow: hidden; }
        .ff-left { width: 320px; min-width: 320px; background: #0C1628; border-right: 1px solid #1a2d50; display: flex; flex-direction: column; overflow: hidden; }
        .ff-search-wrap { padding: 16px; border-bottom: 1px solid #1a2d50; }
        .ff-search { width: 100%; background: #162038; border: 1px solid #2a3d60; border-radius: 8px; color: #e8eaf0; font-family: 'Poppins', sans-serif; font-size: 0.85rem; padding: 10px 14px; outline: none; transition: border-color 0.2s; }
        .ff-search:focus { border-color: ${AMBER}; }
        .ff-search::placeholder { color: #556; }
        .ff-filters { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 16px; border-bottom: 1px solid #1a2d50; }
        .ff-filter-btn { background: #162038; border: 1px solid #2a3d60; color: #aab4cc; font-family: 'Poppins', sans-serif; font-size: 0.72rem; font-weight: 600; padding: 5px 10px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
        .ff-filter-btn.active { background: ${AMBER}; border-color: ${AMBER}; color: ${DARK}; }
        .ff-stop-list { flex: 1; overflow-y: auto; }
        .ff-stop-list::-webkit-scrollbar { width: 4px; }
        .ff-stop-list::-webkit-scrollbar-track { background: #0C1628; }
        .ff-stop-list::-webkit-scrollbar-thumb { background: #2a3d60; border-radius: 2px; }
        .ff-stop-item { padding: 14px 16px; border-bottom: 1px solid #1a2d50; cursor: pointer; transition: background 0.2s; }
        .ff-stop-item:hover { background: #162038; }
        .ff-stop-item.selected { background: #162038; border-left: 3px solid ${AMBER}; }
        .ff-stop-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .ff-stop-name { font-size: 0.82rem; font-weight: 700; color: #fff; line-height: 1.3; flex: 1; margin-right: 8px; }
        .ff-diesel-price { font-family: 'DM Mono', monospace; font-size: 1.1rem; font-weight: 700; }
        .ff-stop-meta { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
        .ff-exit-badge { background: #1e3255; border: 1px solid #2a4070; border-radius: 4px; font-size: 0.68rem; font-weight: 600; color: #aab4cc; padding: 2px 6px; font-family: 'DM Mono', monospace; }
        .ff-distance { font-size: 0.72rem; color: #778; }
        .ff-price-label { font-size: 0.62rem; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
        .ff-amenities { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
        .ff-amenity { font-size: 0.9rem; opacity: 0.9; }
        .ff-amenity.dim { opacity: 0.2; }
        .ff-parking-badge { display: inline-flex; align-items: center; gap: 4px; background: #0f2240; border: 1px solid #2a4070; border-radius: 4px; font-size: 0.68rem; font-weight: 600; padding: 2px 8px; color: #aab4cc; }
        .ff-parking-dot { width: 6px; height: 6px; border-radius: 50%; background: ${GREEN}; }
        .ff-right { flex: 1; background: #0C1628; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .ff-map-area { flex: 1; position: relative; overflow: hidden; background: #0C1628; }
        .ff-map-road { position: absolute; top: 50%; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #1a3060, ${AMBER}99, #1a3060); transform: translateY(-50%); border-radius: 4px; box-shadow: 0 0 20px ${AMBER}44; }
        .ff-map-road-v { position: absolute; left: 50%; top: 0; bottom: 0; width: 6px; background: linear-gradient(180deg, #1a3060, #2a4070, #1a3060); transform: translateX(-50%); border-radius: 3px; }
        .ff-map-grid { position: absolute; inset: 0; background-image: linear-gradient(#1a306022 1px, transparent 1px), linear-gradient(90deg, #1a306022 1px, transparent 1px); background-size: 60px 60px; }
        .ff-map-label { position: absolute; top: 16px; left: 20px; font-size: 0.7rem; font-weight: 600; color: #556; text-transform: uppercase; letter-spacing: 2px; }
        .ff-you-marker { position: absolute; transform: translate(-50%, -50%); z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .ff-you-truck { font-size: 1.8rem; filter: drop-shadow(0 0 8px ${AMBER}); }
        .ff-you-label { background: ${AMBER}; color: ${DARK}; font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 3px; letter-spacing: 1px; }
        .ff-stop-pin { position: absolute; transform: translate(-50%, -50%); z-index: 8; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; transition: transform 0.2s; }
        .ff-stop-pin:hover { transform: translate(-50%, -50%) scale(1.2); }
        .ff-stop-pin.selected { transform: translate(-50%, -50%) scale(1.3); z-index: 9; }
        .ff-pin-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .ff-pin-label { background: #0C1628cc; color: #e8eaf0; font-size: 0.55rem; font-weight: 600; padding: 1px 5px; border-radius: 3px; white-space: nowrap; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
        .ff-detail-card { position: absolute; top: 16px; right: 16px; width: 280px; background: #0f1f3d; border: 1px solid #2a4070; border-radius: 12px; padding: 20px; z-index: 20; box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
        .ff-detail-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #778; cursor: pointer; font-size: 1.2rem; }
        .ff-detail-name { font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 4px; padding-right: 20px; }
        .ff-detail-city { font-size: 0.75rem; color: #778; margin-bottom: 12px; }
        .ff-detail-prices { display: flex; gap: 12px; margin-bottom: 14px; }
        .ff-detail-price { text-align: center; }
        .ff-detail-price-val { font-family: 'DM Mono', monospace; font-size: 1.4rem; font-weight: 700; display: block; }
        .ff-detail-price-label { font-size: 0.65rem; color: #778; font-weight: 600; text-transform: uppercase; }
        .ff-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #1a3050; font-size: 0.75rem; }
        .ff-detail-row:last-of-type { border-bottom: none; }
        .ff-detail-key { color: #778; }
        .ff-detail-val { color: #e8eaf0; font-weight: 600; }
        .ff-navigate-btn { width: 100%; margin-top: 14px; background: ${ORANGE}; border: none; color: #fff; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.85rem; padding: 10px; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }
        .ff-navigate-btn:hover { opacity: 0.88; }
        .ff-chat { background: #080f1e; border-top: 1px solid #1a2d50; padding: 14px 16px; }
        .ff-chat-title { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .ff-chat-dot { width: 8px; height: 8px; border-radius: 50%; background: ${GREEN}; box-shadow: 0 0 6px ${GREEN}; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .ff-chat-label { font-size: 0.72rem; font-weight: 700; color: ${AMBER}; text-transform: uppercase; letter-spacing: 1px; }
        .ff-chat-messages { max-height: 100px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .ff-chat-msg { font-size: 0.75rem; padding: 6px 10px; border-radius: 6px; max-width: 90%; }
        .ff-chat-msg.ai { background: #0f2240; color: #c8d4e8; align-self: flex-start; border-left: 2px solid ${AMBER}; }
        .ff-chat-msg.user { background: ${NAVY}; color: #fff; align-self: flex-end; }
        .ff-chat-form { display: flex; gap: 8px; }
        .ff-chat-input { flex: 1; background: #0f2240; border: 1px solid #2a3d60; border-radius: 6px; color: #e8eaf0; font-family: 'Poppins', sans-serif; font-size: 0.75rem; padding: 7px 10px; outline: none; }
        .ff-chat-input:focus { border-color: ${AMBER}; }
        .ff-chat-send { background: ${AMBER}; border: none; color: ${DARK}; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.75rem; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
        @media (max-width: 768px) {
          .ff-layout { flex-direction: column; height: auto; overflow: visible; }
          .ff-left { width: 100%; min-width: 0; height: auto; overflow: visible; }
          .ff-stop-list { max-height: 400px; overflow-y: auto; }
          .ff-right { height: 400px; }
          .ff-nav-links { display: none; }
        }
      `}</style>
      <div className="ff-root">
        <nav className="ff-nav">
          <a href="/" className="ff-nav-logo">
            <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
            <span>TruckWithEase</span>
          </a>
          <span className="ff-nav-title">⛽ Fuel Finder</span>
          <div className="ff-nav-links">
            <a href="/command">Command Center</a>
            <a href="/#pricing">Pricing</a>
            <a href="/" className="ff-back">← Back</a>
          </div>
        </nav>

        <div className="ff-layout">
          {/* Left Panel */}
          <div className="ff-left">
            <div className="ff-search-wrap">
              <input
                className="ff-search"
                placeholder="Search by city, highway, exit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="ff-filters">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`ff-filter-btn${activeFilter === f ? " active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >{f}</button>
              ))}
            </div>
            <div className="ff-stop-list">
              {filtered.map(stop => {
                const pc = priceColor(stop.diesel);
                const pl = priceLabel(stop.diesel);
                return (
                  <div
                    key={stop.id}
                    className={`ff-stop-item${selectedStop?.id === stop.id ? " selected" : ""}`}
                    onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
                  >
                    <div className="ff-stop-header">
                      <span className="ff-stop-name">{stop.name}</span>
                      <span className="ff-diesel-price" style={{ color: pc }}>${stop.diesel.toFixed(2)}</span>
                    </div>
                    <div className="ff-stop-meta">
                      <span className="ff-exit-badge">Exit {stop.exit}</span>
                      <span className="ff-distance">{stop.distance} mi</span>
                      <span className="ff-price-label" style={{ background: pc + "33", color: pc }}>{pl}</span>
                    </div>
                    <div className="ff-amenities">
                      <span className={`ff-amenity${true ? "" : " dim"}`}>⛽</span>
                      <span className={`ff-amenity${!stop.showers ? " dim" : ""}`}>🚿</span>
                      <span className={`ff-amenity${!stop.food ? " dim" : ""}`}>🍔</span>
                      <span className={`ff-amenity${!stop.wifi ? " dim" : ""}`}>📶</span>
                      <span className={`ff-amenity${!stop.scales ? " dim" : ""}`}>⚖️</span>
                      <span className={`ff-amenity${stop.parking < 10 ? " dim" : ""}`}>🛏️</span>
                    </div>
                    <div className="ff-parking-badge">
                      <span className="ff-parking-dot" style={{ background: stop.parking > 20 ? GREEN : stop.parking > 8 ? AMBER : RED }}></span>
                      {stop.parking} spots open
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="ff-right">
            <div className="ff-map-area">
              <div ref={fuelMapRef} style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} />
              {!fuelMapLoaded && <>
                <div className="ff-map-grid"></div>
                <div className="ff-map-road"></div>
                <div className="ff-map-road-v"></div>
              </>}
              <div className="ff-map-label">{fuelMapLoaded ? "LIVE FUEL MAP — Google Maps" : "LIVE FUEL MAP"}</div>

              {/* YOU marker */}
              <div className="ff-you-marker" style={{ left: "50%", top: "50%" }}>
                <div className="ff-you-truck">🚛</div>
                <div className="ff-you-label">YOU</div>
              </div>

              {/* Stop pins */}
              {FUEL_STOPS.map(stop => {
                const pc = priceColor(stop.diesel);
                return (
                  <div
                    key={stop.id}
                    className={`ff-stop-pin${selectedStop?.id === stop.id ? " selected" : ""}`}
                    style={{ left: `${stop.lng}%`, top: `${stop.lat}%` }}
                    onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
                  >
                    <div className="ff-pin-circle" style={{ background: pc }}>
                      ${stop.diesel.toFixed(2).slice(1)}
                    </div>
                    <div className="ff-pin-label">{stop.name.split(" ")[0]}</div>
                  </div>
                );
              })}

              {/* Detail card overlay */}
              {selectedStop && (
                <div className="ff-detail-card">
                  <button className="ff-detail-close" onClick={() => setSelectedStop(null)}>✕</button>
                  <div className="ff-detail-name">{selectedStop.name}</div>
                  <div className="ff-detail-city">📍 {selectedStop.city} · Exit {selectedStop.exit}</div>
                  <div className="ff-detail-prices">
                    <div className="ff-detail-price">
                      <span className="ff-detail-price-val" style={{ color: priceColor(selectedStop.diesel) }}>${selectedStop.diesel.toFixed(2)}</span>
                      <span className="ff-detail-price-label">Diesel</span>
                    </div>
                    {selectedStop.def && (
                      <div className="ff-detail-price">
                        <span className="ff-detail-price-val" style={{ color: AMBER }}>${selectedStop.def.toFixed(2)}</span>
                        <span className="ff-detail-price-label">DEF</span>
                      </div>
                    )}
                  </div>
                  <div className="ff-detail-row">
                    <span className="ff-detail-key">Distance</span>
                    <span className="ff-detail-val">{selectedStop.distance} miles</span>
                  </div>
                  <div className="ff-detail-row">
                    <span className="ff-detail-key">Parking Open</span>
                    <span className="ff-detail-val" style={{ color: selectedStop.parking > 20 ? GREEN : selectedStop.parking > 8 ? AMBER : RED }}>{selectedStop.parking} spots</span>
                  </div>
                  <div className="ff-detail-row">
                    <span className="ff-detail-key">Showers</span>
                    <span className="ff-detail-val">{selectedStop.showers ? (selectedStop.showersWait === 0 ? "✅ No wait" : `⏱ ${selectedStop.showersWait} min wait`) : "❌ None"}</span>
                  </div>
                  <div className="ff-detail-row">
                    <span className="ff-detail-key">CAT Scale</span>
                    <span className="ff-detail-val">{selectedStop.scales ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="ff-detail-row">
                    <span className="ff-detail-key">Food / WiFi</span>
                    <span className="ff-detail-val">{selectedStop.food ? "🍔" : "—"} {selectedStop.wifi ? "📶" : "—"}</span>
                  </div>
                  <button className="ff-navigate-btn">🧭 Navigate Here</button>
                </div>
              )}
            </div>

            {/* AI Chat */}
            <div className="ff-chat">
              <div className="ff-chat-title">
                <div className="ff-chat-dot"></div>
                <span className="ff-chat-label">AI Parking Navigator</span>
              </div>
              <div className="ff-chat-messages">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`ff-chat-msg ${m.from}`}>{m.text}</div>
                ))}
              </div>
              <form className="ff-chat-form" onSubmit={sendChat}>
                <input
                  className="ff-chat-input"
                  placeholder="Ask about fuel stops, parking, amenities..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button type="submit" className="ff-chat-send">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
