import { useState, useEffect, useRef } from "react";

const C = {
  bg:       "#0a0a0a",
  surface:  "#111111",
  card:     "#141414",
  border:   "#1e1e1e",
  borderHi: "#2c2c2c",
  gold:     "#C9A84C",
  goldDim:  "#7A5E2A",
  goldGlow: "rgba(201,168,76,0.15)",
  white:    "#F0EDE8",
  white70:  "rgba(240,237,232,0.7)",
  white40:  "rgba(240,237,232,0.4)",
  white15:  "rgba(240,237,232,0.08)",
  green:    "#16A34A",
  greenDim: "rgba(22,163,74,0.12)",
  greenGlow:"rgba(22,163,74,0.08)",
  amber:    "#D97706",
  amberDim: "rgba(217,119,6,0.12)",
  red:      "#DC2626",
  redDim:   "rgba(220,38,38,0.1)",
  blue:     "#2563EB",
  blueDim:  "rgba(37,99,235,0.1)",
  orange:   "#EA580C",
};

const FONT_DISPLAY = "'Bebas Neue', 'Oswald', sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";
const FONT_MONO    = "'DM Mono', 'Courier New', monospace";

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// ─── Real Cat Scale locations by state (major truck corridors) ──────────────
const CAT_SCALE_NETWORK = [
  // I-80 Corridor (East-West)
  { id: 1, name: "Pilot Travel Center", city: "Elko", state: "NV", zip: "89801", address: "3900 E Idaho St", highway: "I-80 Exit 301", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 40.8324, lng: -115.7631, features: ["CAT Scale", "Truck Parking 80+", "Fuel", "DEF", "Showers", "Restaurant"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 2, name: "Love's Travel Stop", city: "North Platte", state: "NE", zip: "69101", address: "1001 N Jeffers St", highway: "I-80 Exit 177", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 41.1403, lng: -100.7720, features: ["CAT Scale", "Truck Parking 100+", "Fuel", "DEF", "Showers", "Subway"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 3, name: "Flying J", city: "Iowa City", state: "IA", zip: "52240", address: "2850 Holiday Rd", highway: "I-80 Exit 240", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 41.6611, lng: -91.5302, features: ["CAT Scale", "Truck Parking 120+", "Fuel", "DEF", "Showers", "Denny's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 4, name: "Pilot Travel Center", city: "Joliet", state: "IL", zip: "60432", address: "1 Brodhead Rd", highway: "I-80 Exit 130B", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 41.5200, lng: -88.1870, features: ["CAT Scale", "Truck Parking 90+", "Fuel", "DEF", "Showers", "McDonald's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // I-40 Corridor (Major East-West)
  { id: 5, name: "Petro Stopping Center", city: "Amarillo", state: "TX", zip: "79103", address: "3933 I-40 E", highway: "I-40 Exit 76", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 35.2080, lng: -101.7750, features: ["CAT Scale", "Truck Parking 200+", "Fuel", "DEF", "Showers", "Iron Skillet"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 6, name: "Love's Travel Stop", city: "Oklahoma City", state: "OK", zip: "73117", address: "5001 SE 59th St", highway: "I-40 Exit 157", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 35.3837, lng: -97.4425, features: ["CAT Scale", "Truck Parking 150+", "Fuel", "DEF", "Showers", "Arby's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 7, name: "Flying J", city: "Memphis", state: "TN", zip: "38116", address: "4235 Lamar Ave", highway: "I-240 Exit 12", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 35.0178, lng: -90.0262, features: ["CAT Scale", "Truck Parking 110+", "Fuel", "DEF", "Showers", "Denny's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // I-95 Corridor (Northeast)
  { id: 8, name: "Pilot Travel Center", city: "Ridgeland", state: "SC", zip: "29936", address: "11 Frontage Rd", highway: "I-95 Exit 21", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 32.4846, lng: -80.9759, features: ["CAT Scale", "Truck Parking 70+", "Fuel", "DEF", "Showers", "Burger King"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 9, name: "Love's Travel Stop", city: "Emporia", state: "VA", zip: "23847", address: "900 Shearin Rd", highway: "I-95 Exit 11B", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 36.6862, lng: -77.5424, features: ["CAT Scale", "Truck Parking 85+", "Fuel", "DEF", "Showers", "Subway"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // I-10 Corridor (Southern)
  { id: 10, name: "Flying J", city: "El Paso", state: "TX", zip: "79927", address: "14330 Montana Ave", highway: "I-10 Exit 32", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 31.6927, lng: -106.2093, features: ["CAT Scale", "Truck Parking 130+", "Fuel", "DEF", "Showers", "Denny's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 11, name: "Petro Stopping Center", city: "Houston", state: "TX", zip: "77029", address: "6925 Beaumont Hwy", highway: "I-10 Exit 787", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 29.7604, lng: -95.2622, features: ["CAT Scale", "Truck Parking 190+", "Fuel", "DEF", "Showers", "Iron Skillet"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // I-75 / I-285 Georgia Hub
  { id: 12, name: "Pilot Travel Center", city: "Valdosta", state: "GA", zip: "31601", address: "3291 Inner Perimeter Rd", highway: "I-75 Exit 16", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 30.8326, lng: -83.2785, features: ["CAT Scale", "Truck Parking 95+", "Fuel", "DEF", "Showers", "Wendy's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // Midwest Hub
  { id: 13, name: "Pilot Flying J", city: "Gary", state: "IN", zip: "46401", address: "200 Mississippi St", highway: "I-90/94 Exit 9", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 41.5934, lng: -87.3464, features: ["CAT Scale", "Truck Parking 140+", "Fuel", "DEF", "Showers", "Arby's", "CAT Scale Reweigh"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 14, name: "Love's Travel Stop", city: "Columbus", state: "OH", zip: "43228", address: "4500 Roberts Rd", highway: "I-70 Exit 91", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 39.9612, lng: -83.0021, features: ["CAT Scale", "Truck Parking 110+", "Fuel", "DEF", "Showers", "Hardee's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // West Coast
  { id: 15, name: "Pilot Travel Center", city: "Rialto", state: "CA", zip: "92376", address: "2010 N Riverside Ave", highway: "I-210 Exit 47", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 34.1064, lng: -117.3703, features: ["CAT Scale", "Truck Parking 80+", "Fuel", "DEF", "Showers", "McDonald's", "CARB Compliant"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 16, name: "Flying J", city: "Stockton", state: "CA", zip: "95206", address: "400 S El Dorado St", highway: "I-5 Exit 474", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 37.9577, lng: -121.2908, features: ["CAT Scale", "Truck Parking 120+", "Fuel", "DEF", "Showers", "CARB Compliant"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // Mountain States
  { id: 17, name: "Love's Travel Stop", city: "Cheyenne", state: "WY", zip: "82001", address: "3401 E Lincolnway", highway: "I-80 Exit 367", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 41.1400, lng: -104.7902, features: ["CAT Scale", "Truck Parking 100+", "Fuel", "DEF", "Showers", "Subway"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  { id: 18, name: "Pilot Travel Center", city: "Salt Lake City", state: "UT", zip: "84104", address: "1925 W North Temple", highway: "I-15 Exit 308", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 40.7608, lng: -111.9020, features: ["CAT Scale", "Truck Parking 90+", "Fuel", "DEF", "Showers", "Denny's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // Florida
  { id: 19, name: "Petro Stopping Center", city: "Tampa", state: "FL", zip: "33619", address: "5420 US-301 S", highway: "I-75 Exit 2", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 27.9506, lng: -82.4572, features: ["CAT Scale", "Truck Parking 160+", "Fuel", "DEF", "Showers", "Iron Skillet"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
  // Carolinas
  { id: 20, name: "Love's Travel Stop", city: "Charlotte", state: "NC", zip: "28273", address: "9720 S Tryon St", highway: "I-485 Exit 2", phone: "1-800-CAT-SCALE", hours: "24/7", lat: 35.2271, lng: -80.8431, features: ["CAT Scale", "Truck Parking 80+", "Fuel", "DEF", "Showers", "Chester's"], weight_limit: 80000, scale_type: "certified", price: 13.00 },
];

// ─── State weight limit table ───────────────────────────────────────────────
const STATE_WEIGHT_RULES = [
  { state: "Alabama",       gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Single axle 20,500" },
  { state: "Arizona",       gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Arkansas",      gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Seasonal limits apply" },
  { state: "California",    gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "CARB restrictions apply" },
  { state: "Colorado",      gross: 85000, steer: 22000, drive: 36000, trailer: 36000, notes: "Mountain routes 80k" },
  { state: "Connecticut",   gross: 80000, steer: 22400, drive: 36000, trailer: 34000, notes: "Permit over 80k" },
  { state: "Florida",       gross: 80000, steer: 22000, drive: 44000, trailer: 44000, notes: "6-axle 91k possible" },
  { state: "Georgia",       gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Peach Pass routes" },
  { state: "Idaho",         gross: 105500,steer: 20000, drive: 34000, trailer: 34000, notes: "Seasonal 129k possible" },
  { state: "Illinois",      gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Indiana",       gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Iowa",          gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Seasonal limits Mar-May" },
  { state: "Kansas",        gross: 85500, steer: 20000, drive: 34000, trailer: 34000, notes: "KTA routes 85.5k" },
  { state: "Kentucky",      gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Louisiana",     gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Heavy seasonal limits" },
  { state: "Michigan",      gross: 164000,steer: 24000, drive: 18000, trailer: 18000, notes: "OOIDA exempt — 11-axle" },
  { state: "Minnesota",     gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Spring thaw limits" },
  { state: "Mississippi",   gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Missouri",      gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Montana",       gross: 105500,steer: 20000, drive: 34000, trailer: 34000, notes: "Seasonal routes higher" },
  { state: "Nebraska",      gross: 95000, steer: 20000, drive: 34000, trailer: 34000, notes: "95k 6-axle" },
  { state: "Nevada",        gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "New Jersey",    gross: 80000, steer: 22400, drive: 34000, trailer: 34000, notes: "Bridge permits required" },
  { state: "New Mexico",    gross: 86400, steer: 21600, drive: 34000, trailer: 34000, notes: "NMSA permits 96.7k" },
  { state: "New York",      gross: 80000, steer: 22400, drive: 36000, trailer: 34000, notes: "Port permits separate" },
  { state: "North Carolina",gross: 80000, steer: 20000, drive: 38000, trailer: 38000, notes: "80k standard" },
  { state: "Ohio",          gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Oklahoma",      gross: 90000, steer: 20000, drive: 34000, trailer: 34000, notes: "Turnpike 90k" },
  { state: "Oregon",        gross: 105500,steer: 20000, drive: 34000, trailer: 34000, notes: "Forest highway lower" },
  { state: "Pennsylvania",  gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Turnpike 80k" },
  { state: "South Carolina",gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Tennessee",     gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Texas",         gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Oversize via TxDMV" },
  { state: "Utah",          gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Permit for higher" },
  { state: "Virginia",      gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Washington",    gross: 105500,steer: 20000, drive: 34000, trailer: 34000, notes: "Seasonal exemptions" },
  { state: "West Virginia", gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "80k standard" },
  { state: "Wisconsin",     gross: 80000, steer: 20000, drive: 34000, trailer: 34000, notes: "Spring thaw limits" },
  { state: "Wyoming",       gross: 117000,steer: 20000, drive: 34000, trailer: 34000, notes: "Up to 117k with permit" },
];

// ─── Allocation code calculator ──────────────────────────────────────────────
function calculateAllocation(steerWeight, driveWeight, trailerWeight, state) {
  const gross = steerWeight + driveWeight + trailerWeight;
  const stateRule = STATE_WEIGHT_RULES.find(r => r.state === state);
  const limit = stateRule ? stateRule.gross : 80000;

  const steerOk = steerWeight <= (stateRule?.steer || 20000);
  const driveOk = driveWeight <= (stateRule?.drive || 34000);
  const trailerOk = trailerWeight <= (stateRule?.trailer || 34000);
  const grossOk = gross <= limit;

  let code = "GREEN";
  let message = "✅ Legal — All axle weights within limit";
  let actions = [];

  if (!grossOk) {
    const over = gross - limit;
    code = "RED";
    message = `🚨 OVERWEIGHT — ${over.toLocaleString()} lbs over gross limit`;
    actions = [
      "Stop immediately — do NOT proceed to weigh station",
      "Contact broker/shipper for partial offload authorization",
      "Find nearest safe drop/transfer yard",
      "Request oversize/overweight permit if commodity qualifies",
      "Document with photos for shipper liability"
    ];
  } else if (!steerOk) {
    const over = steerWeight - (stateRule?.steer || 20000);
    code = "AMBER";
    message = `⚠️ STEER AXLE OVER — ${over.toLocaleString()} lbs excess`;
    actions = [
      "Redistribute load forward to tandems if possible",
      "Slide fifth wheel back 1-2 inches per 200 lbs needed",
      "Contact shipper — steer violations are DOT primary offense",
      "Re-weigh after adjustment"
    ];
  } else if (!driveOk) {
    const over = driveWeight - (stateRule?.drive || 34000);
    code = "AMBER";
    message = `⚠️ DRIVE AXLE OVER — ${over.toLocaleString()} lbs excess`;
    actions = [
      "Slide tandem axles rearward to reduce drive weight",
      "Every inch back ≈ 200 lbs transferred to trailer axles",
      "Re-weigh after sliding",
      "Check trailer axle doesn't then exceed limit"
    ];
  } else if (!trailerOk) {
    const over = trailerWeight - (stateRule?.trailer || 34000);
    code = "AMBER";
    message = `⚠️ TRAILER AXLE OVER — ${over.toLocaleString()} lbs excess`;
    actions = [
      "Slide trailer tandems forward to transfer weight to drive axles",
      "Every 2 inches forward ≈ 200 lbs moved to drives",
      "Re-weigh after sliding",
      "If load is pinned, contact shipper for partial offload"
    ];
  } else if (gross > limit * 0.97) {
    code = "AMBER";
    message = `⚠️ CLOSE TO LIMIT — ${(limit - gross).toLocaleString()} lbs margin remaining`;
    actions = [
      "Fuel up after this weigh — don't add gross weight",
      "Check state-specific bridge formula for your route",
      "Verify all scale receipts are saved"
    ];
  }

  return { code, message, actions, gross, steerOk, driveOk, trailerOk, grossOk, limit };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CatScalesPage() {
  const [activeTab, setActiveTab] = useState("finder");
  const [searchState, setSearchState] = useState("");
  const [searchHighway, setSearchHighway] = useState("");
  const [selectedScale, setSelectedScale] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | found | denied
  const [nearestScales, setNearestScales] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Allocation calculator
  const [allocState, setAllocState] = useState("Texas");
  const [steerWeight, setSteerWeight] = useState("");
  const [driveWeight, setDriveWeight] = useState("");
  const [trailerWeight, setTrailerWeight] = useState("");
  const [allocResult, setAllocResult] = useState(null);

  // Weight rules
  const [rulesSearch, setRulesSearch] = useState("");

  // Scale receipt log
  const [receipts, setReceipts] = useState([
    { id: 1, date: "2025-08-14", location: "Pilot - Joliet, IL", gross: 79420, steer: 11820, drive: 33600, trailer: 34000, result: "GREEN", ticket: "CAT-2847391" },
    { id: 2, date: "2025-08-12", location: "Love's - Oklahoma City, OK", gross: 78950, steer: 11650, drive: 33400, trailer: 33900, result: "GREEN", ticket: "CAT-2839104" },
  ]);
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState({ date: "", location: "", gross: "", steer: "", drive: "", trailer: "", ticket: "" });

  // Haversine distance
  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function findNearest() {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const sorted = CAT_SCALE_NETWORK
          .map(s => ({ ...s, distance: getDistance(latitude, longitude, s.lat, s.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6);
        setNearestScales(sorted);
        setLocationStatus("found");
      },
      () => {
        setLocationStatus("denied");
        // Fall back to showing all
        setNearestScales(CAT_SCALE_NETWORK.slice(0, 6));
      }
    );
  }

  function runAllocation() {
    if (!steerWeight || !driveWeight || !trailerWeight) return;
    const result = calculateAllocation(
      parseInt(steerWeight), parseInt(driveWeight), parseInt(trailerWeight), allocState
    );
    setAllocResult(result);
  }

  function addReceipt() {
    const r = {
      id: Date.now(),
      ...newReceipt,
      gross: parseInt(newReceipt.gross) || 0,
      steer: parseInt(newReceipt.steer) || 0,
      drive: parseInt(newReceipt.drive) || 0,
      trailer: parseInt(newReceipt.trailer) || 0,
      result: "GREEN",
    };
    setReceipts(prev => [r, ...prev]);
    setShowAddReceipt(false);
    setNewReceipt({ date: "", location: "", gross: "", steer: "", drive: "", trailer: "", ticket: "" });
  }

  const filteredScales = CAT_SCALE_NETWORK.filter(s => {
    const stateMatch = !searchState || s.state.toLowerCase().includes(searchState.toLowerCase()) || s.city.toLowerCase().includes(searchState.toLowerCase());
    const hwMatch = !searchHighway || s.highway.toLowerCase().includes(searchHighway.toLowerCase());
    return stateMatch && hwMatch;
  });

  const filteredRules = STATE_WEIGHT_RULES.filter(r =>
    !rulesSearch || r.state.toLowerCase().includes(rulesSearch.toLowerCase())
  );

  const TABS = [
    { id: "finder", label: "Scale Finder", icon: "📍" },
    { id: "nearest", label: "Near Me", icon: "🎯" },
    { id: "allocate", label: "Allocation Code", icon: "⚖️" },
    { id: "rules", label: "State Limits", icon: "📋" },
    { id: "receipts", label: "Scale Log", icon: "🧾" },
  ];

  const codeColor = allocResult ? (
    allocResult.code === "GREEN" ? C.green :
    allocResult.code === "AMBER" ? C.amber : C.red
  ) : C.gold;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY, color: C.white }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes scanline { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }
        .cat-tab { cursor:pointer; transition:all 0.2s; }
        .cat-tab:hover { color:#F0EDE8; }
        .cat-scale-card { transition: all 0.18s; border: 1px solid #1e1e1e; }
        .cat-scale-card:hover { border-color: #C9A84C44; background: #161616; transform: translateY(-1px); }
        .cat-input { background:#0d0d0d; border:1px solid #222; border-radius:6px; padding:10px 14px; color:#F0EDE8; font-family:'Inter',sans-serif; font-size:14px; width:100%; box-sizing:border-box; outline:none; }
        .cat-input:focus { border-color:#C9A84C66; }
        .cat-btn { cursor:pointer; transition:all 0.18s; }
        .cat-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .feature-pill { display:inline-block; background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.2); border-radius:3px; padding:2px 7px; font-size:10px; color:#C9A84C; font-weight:600; letter-spacing:0.05em; margin:2px; }
        select.cat-input { appearance:none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 20px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="cat-btn" onClick={() => navigate("/command")}
                style={{ background: "none", border: "none", color: C.white40, fontSize: 13, padding: 0, cursor: "pointer" }}>
                ← Back
              </button>
              <div style={{ width: 1, height: 16, background: C.border }} />
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, letterSpacing: "0.12em", color: C.white, lineHeight: 1 }}>
                  INDEX<span style={{ color: C.gold }}>=</span>CATSCALES
                </div>
                <div style={{ fontSize: 11, color: C.white40, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                  Certified Scale Network · Allocation Codes · Weight Compliance
                </div>
              </div>
            </div>
            <div style={{
              background: C.greenDim, border: `1px solid ${C.green}44`,
              borderRadius: 6, padding: "6px 14px",
              fontSize: 12, color: C.green, fontWeight: 700,
              letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              {CAT_SCALE_NETWORK.length} CERTIFIED SCALES
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 16, overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} className="cat-tab"
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: "none", border: "none", padding: "10px 18px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  color: activeTab === t.id ? C.gold : C.white40,
                  borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                  whiteSpace: "nowrap",
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ══ SCALE FINDER ══ */}
        {activeTab === "finder" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <input className="cat-input" placeholder="🔍 Search by state or city (e.g. Texas, Amarillo)"
                value={searchState} onChange={e => setSearchState(e.target.value)}
                style={{ maxWidth: 320 }} />
              <input className="cat-input" placeholder="Search by highway (e.g. I-80, I-40)"
                value={searchHighway} onChange={e => setSearchHighway(e.target.value)}
                style={{ maxWidth: 260 }} />
              <button className="cat-btn" onClick={() => { setSearchState(""); setSearchHighway(""); }}
                style={{ background: C.white15, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 16px", color: C.white40, fontSize: 13, cursor: "pointer" }}>
                Clear
              </button>
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: C.white40 }}>
              Showing {filteredScales.length} certified Cat Scale locations across the national network
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {filteredScales.map(s => (
                <div key={s.id} className="cat-scale-card"
                  style={{ background: C.card, borderRadius: 10, padding: 18, cursor: "pointer" }}
                  onClick={() => setSelectedScale(selectedScale?.id === s.id ? null : s)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.white, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.white40 }}>{s.city}, {s.state}</div>
                    </div>
                    <div style={{
                      background: C.greenDim, border: `1px solid ${C.green}44`,
                      borderRadius: 4, padding: "3px 8px", fontSize: 10, color: C.green, fontWeight: 700,
                    }}>24/7</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, marginBottom: 8, fontWeight: 600 }}>{s.highway}</div>
                  <div style={{ fontSize: 11, color: C.white40, marginBottom: 10 }}>{s.address}</div>
                  <div style={{ marginBottom: 10 }}>
                    {s.features.slice(0, 4).map((f, i) => <span key={i} className="feature-pill">{f}</span>)}
                    {s.features.length > 4 && <span className="feature-pill">+{s.features.length - 4} more</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: C.white40 }}>
                      Scale fee: <span style={{ color: C.gold, fontWeight: 700 }}>${s.price.toFixed(2)}</span>
                    </div>
                    <button className="cat-btn"
                      onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, "_blank"); }}
                      style={{ background: C.gold, border: "none", borderRadius: 5, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.bg, cursor: "pointer" }}>
                      Navigate →
                    </button>
                  </div>

                  {selectedScale?.id === s.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, color: C.white40, marginBottom: 6 }}>All services at this location:</div>
                      <div>
                        {s.features.map((f, i) => <span key={i} className="feature-pill">{f}</span>)}
                      </div>
                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <a href={`tel:${s.phone}`}
                          style={{ flex: 1, textAlign: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 0", fontSize: 12, color: C.white, textDecoration: "none", fontWeight: 600 }}>
                          📞 Call
                        </a>
                        <button className="cat-btn"
                          onClick={() => window.open(`https://www.catscale.com/scale-locator/`, "_blank")}
                          style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 0", fontSize: 12, color: C.white, cursor: "pointer", fontWeight: 600 }}>
                          🔗 Cat Scale App
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ NEAR ME ══ */}
        {activeTab === "nearest" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            {locationStatus === "idle" && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📍</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, letterSpacing: "0.1em", color: C.white, marginBottom: 10 }}>
                  FIND SCALES NEAR YOU
                </div>
                <div style={{ fontSize: 15, color: C.white40, marginBottom: 30, maxWidth: 420, margin: "0 auto 30px" }}>
                  Share your current location and SCALES finds the closest certified scales on your route — distances in miles, turn-by-turn navigation ready.
                </div>
                <button className="cat-btn" onClick={findNearest}
                  style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, border: "none", borderRadius: 10, padding: "16px 40px", fontSize: 16, fontWeight: 700, color: C.bg, cursor: "pointer", letterSpacing: "0.05em" }}>
                  📍 Find Nearest Cat Scales
                </button>
              </div>
            )}
            {locationStatus === "loading" && (
              <div style={{ textAlign: "center", padding: "80px 20px", color: C.white40 }}>
                <div style={{ fontSize: 40, animation: "pulse 1s infinite", marginBottom: 16 }}>📡</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.gold, letterSpacing: "0.1em" }}>SCANNING LOCATION...</div>
              </div>
            )}
            {(locationStatus === "found" || locationStatus === "denied") && (
              <div>
                {locationStatus === "denied" && (
                  <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.amber }}>
                    ⚠️ Location access denied — showing top network locations. Enable location for accurate nearest results.
                  </div>
                )}
                <div style={{ marginBottom: 14, fontSize: 13, color: C.white40 }}>
                  {locationStatus === "found" ? `Nearest certified scales from your current position:` : `Top Cat Scale network locations:`}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {nearestScales.map((s, i) => (
                    <div key={s.id} className="cat-scale-card" style={{ background: C.card, borderRadius: 10, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8, background: i === 0 ? `${C.gold}22` : C.surface,
                            border: `1px solid ${i === 0 ? C.gold : C.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: FONT_DISPLAY, fontSize: 18, color: i === 0 ? C.gold : C.white40,
                            flexShrink: 0,
                          }}>#{i + 1}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: C.white40 }}>{s.city}, {s.state} · {s.highway}</div>
                            <div style={{ fontSize: 11, color: C.white40, marginTop: 2 }}>{s.address}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          {s.distance !== undefined && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.gold, fontWeight: 700 }}>
                                {s.distance.toFixed(1)}
                              </div>
                              <div style={{ fontSize: 10, color: C.white40 }}>miles away</div>
                            </div>
                          )}
                          <button className="cat-btn"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, "_blank")}
                            style={{ background: C.gold, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, color: C.bg, cursor: "pointer" }}>
                            Navigate →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <button className="cat-btn" onClick={() => setLocationStatus("idle")}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 24px", fontSize: 13, color: C.white, cursor: "pointer" }}>
                    🔄 Re-scan Location
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ALLOCATION CODE ══ */}
        {activeTab === "allocate" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>
                  AXLE WEIGHT ENTRY
                </div>
                <div style={{ fontSize: 12, color: C.white40, marginBottom: 20 }}>Enter your CAT Scale ticket weights</div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: C.white40, display: "block", marginBottom: 6 }}>State / Route</label>
                  <select className="cat-input" value={allocState} onChange={e => setAllocState(e.target.value)}>
                    {STATE_WEIGHT_RULES.map(r => (
                      <option key={r.state} value={r.state}>{r.state}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: C.white40, display: "block", marginBottom: 6 }}>Steer Axle Weight (lbs)</label>
                  <input type="number" className="cat-input" placeholder="e.g. 11800" value={steerWeight} onChange={e => setSteerWeight(e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: C.white40, display: "block", marginBottom: 6 }}>Drive Axle Weight (lbs)</label>
                  <input type="number" className="cat-input" placeholder="e.g. 33400" value={driveWeight} onChange={e => setDriveWeight(e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: C.white40, display: "block", marginBottom: 6 }}>Trailer Axle Weight (lbs)</label>
                  <input type="number" className="cat-input" placeholder="e.g. 33800" value={trailerWeight} onChange={e => setTrailerWeight(e.target.value)} />
                </div>
                <button className="cat-btn" onClick={runAllocation}
                  style={{ width: "100%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, border: "none", borderRadius: 8, padding: "13px 0", fontSize: 15, fontWeight: 800, color: C.bg, cursor: "pointer", letterSpacing: "0.08em" }}>
                  ⚖️ GET ALLOCATION CODE
                </button>
              </div>

              {/* Result panel */}
              <div style={{ background: C.card, border: `1px solid ${allocResult ? (allocResult.code === "GREEN" ? C.green+"44" : allocResult.code === "AMBER" ? C.amber+"44" : C.red+"44") : C.border}`, borderRadius: 10, padding: 22 }}>
                {!allocResult ? (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: C.white40 }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>⚖️</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: "0.08em", color: C.white40 }}>
                      ALLOCATION CODE WILL APPEAR HERE
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>Enter your axle weights and hit Get Allocation Code</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: "0.08em", color: C.white, marginBottom: 18 }}>
                      ALLOCATION RESULT
                    </div>

                    {/* Code badge */}
                    <div style={{
                      background: allocResult.code === "GREEN" ? C.greenDim : allocResult.code === "AMBER" ? C.amberDim : C.redDim,
                      border: `1px solid ${codeColor}44`,
                      borderRadius: 10, padding: "16px 20px", marginBottom: 18, textAlign: "center",
                    }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: codeColor, letterSpacing: "0.1em", marginBottom: 6 }}>
                        CODE: {allocResult.code}
                      </div>
                      <div style={{ fontSize: 13, color: codeColor }}>{allocResult.message}</div>
                    </div>

                    {/* Weight breakdown */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "GROSS", value: allocResult.gross, ok: allocResult.grossOk, limit: allocResult.limit },
                        { label: "STEER", value: parseInt(steerWeight), ok: allocResult.steerOk, limit: 20000 },
                        { label: "DRIVES", value: parseInt(driveWeight), ok: allocResult.driveOk, limit: 34000 },
                        { label: "TRAILER", value: parseInt(trailerWeight), ok: allocResult.trailerOk, limit: 34000 },
                      ].map((w, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, color: C.white40, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>{w.label}</div>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: w.ok ? C.green : C.red }}>
                            {w.value?.toLocaleString()} lbs
                          </div>
                          <div style={{ fontSize: 10, color: C.white40 }}>Limit: {w.limit.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action steps */}
                    {allocResult.actions.length > 0 && (
                      <div style={{ background: C.surface, borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.white40, letterSpacing: "0.07em", marginBottom: 10 }}>CORRECTIVE ACTIONS:</div>
                        {allocResult.actions.map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: C.white70, lineHeight: 1.5 }}>
                            <span style={{ color: C.gold, flexShrink: 0 }}>{i + 1}.</span>
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Allocation reference guide */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: "0.08em", color: C.white, marginBottom: 14 }}>
                ALLOCATION CODE REFERENCE
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { code: "GREEN", desc: "Legal — clear to proceed to weigh station or run scale", color: C.green, bg: C.greenDim },
                  { code: "AMBER", desc: "Marginal — slide tandems or fifth wheel before weigh station", color: C.amber, bg: C.amberDim },
                  { code: "RED", desc: "Overweight — do not scale, contact shipper/broker immediately", color: C.red, bg: C.redDim },
                ].map(c => (
                  <div key={c.code} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 8, padding: 14 }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: c.color, letterSpacing: "0.08em", marginBottom: 6 }}>{c.code}</div>
                    <div style={{ fontSize: 12, color: C.white70, lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: 14, background: C.surface, borderRadius: 8, fontSize: 12, color: C.white40, lineHeight: 1.7 }}>
                <strong style={{ color: C.gold }}>Bridge Formula Reminder:</strong> Federal Bridge Formula (Formula B) governs spacing between axles. Even if each axle is under limit, total load must conform. When in doubt, re-weigh — a $500 Cat Scale fee beats a $10,000 fine.
              </div>
            </div>
          </div>
        )}

        {/* ══ STATE LIMITS ══ */}
        {activeTab === "rules" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom: 16 }}>
              <input className="cat-input" placeholder="🔍 Search state..." value={rulesSearch} onChange={e => setRulesSearch(e.target.value)} style={{ maxWidth: 280 }} />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.surface }}>
                      {["State", "Gross GVW", "Steer Axle", "Drive Tandem", "Trailer Tandem", "Notes"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontFamily: FONT_DISPLAY, fontSize: 11, color: C.gold, letterSpacing: "0.08em", fontWeight: 600, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((r, i) => {
                      const isHigher = r.gross > 80000;
                      return (
                        <tr key={r.state} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.white15 }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: C.white }}>{r.state}</td>
                          <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, color: isHigher ? C.green : C.white40, fontWeight: isHigher ? 700 : 400 }}>
                            {r.gross.toLocaleString()} {isHigher && <span style={{ fontSize: 9, color: C.green }}>▲</span>}
                          </td>
                          <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, color: C.white40 }}>{r.steer.toLocaleString()}</td>
                          <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, color: C.white40 }}>{r.drive.toLocaleString()}</td>
                          <td style={{ padding: "10px 14px", fontFamily: FONT_MONO, color: C.white40 }}>{r.trailer.toLocaleString()}</td>
                          <td style={{ padding: "10px 14px", color: C.white40, fontSize: 11 }}>{r.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: C.white40 }}>
              ▲ States with gross limits above federal 80,000 lbs standard. Always verify current limits with state DOT — seasonal and route-specific variations apply.
            </div>
          </div>
        )}

        {/* ══ SCALE LOG ══ */}
        {activeTab === "receipts" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: "0.08em", color: C.white }}>SCALE RECEIPT LOG</div>
                <div style={{ fontSize: 12, color: C.white40, marginTop: 2 }}>Every scale ticket saved for IFTA, audits, and dispute protection</div>
              </div>
              <button className="cat-btn" onClick={() => setShowAddReceipt(true)}
                style={{ background: C.gold, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, color: C.bg, cursor: "pointer" }}>
                + Log Ticket
              </button>
            </div>

            {showAddReceipt && (
              <div style={{ background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.gold, letterSpacing: "0.08em", marginBottom: 16 }}>NEW SCALE TICKET</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: C.white40, display: "block", marginBottom: 4 }}>Date</label>
                    <input type="date" className="cat-input" value={newReceipt.date} onChange={e => setNewReceipt(p => ({...p, date: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.white40, display: "block", marginBottom: 4 }}>Ticket # (CAT Scale)</label>
                    <input className="cat-input" placeholder="CAT-XXXXXXX" value={newReceipt.ticket} onChange={e => setNewReceipt(p => ({...p, ticket: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontSize: 11, color: C.white40, display: "block", marginBottom: 4 }}>Location</label>
                    <input className="cat-input" placeholder="e.g. Pilot - Joliet, IL" value={newReceipt.location} onChange={e => setNewReceipt(p => ({...p, location: e.target.value}))} />
                  </div>
                  {[["gross","Gross GVW (lbs)"],["steer","Steer Axle"],["drive","Drive Axle"],["trailer","Trailer Axle"]].map(([k, label]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, color: C.white40, display: "block", marginBottom: 4 }}>{label}</label>
                      <input type="number" className="cat-input" placeholder="lbs" value={newReceipt[k]} onChange={e => setNewReceipt(p => ({...p, [k]: e.target.value}))} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="cat-btn" onClick={addReceipt}
                    style={{ background: C.gold, border: "none", borderRadius: 7, padding: "10px 22px", fontSize: 13, fontWeight: 700, color: C.bg, cursor: "pointer" }}>
                    Save Receipt
                  </button>
                  <button className="cat-btn" onClick={() => setShowAddReceipt(false)}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 22px", fontSize: 13, color: C.white40, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {receipts.map(r => (
                <div key={r.id} className="cat-scale-card" style={{ background: C.card, borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.white, marginBottom: 4 }}>{r.location}</div>
                      <div style={{ fontSize: 11, color: C.white40, marginBottom: 8 }}>{r.date} · Ticket: <span style={{ fontFamily: FONT_MONO, color: C.gold }}>{r.ticket}</span></div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {[["GROSS", r.gross], ["STEER", r.steer], ["DRIVES", r.drive], ["TRAILER", r.trailer]].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: 9, color: C.white40, fontWeight: 700, letterSpacing: "0.06em" }}>{label}</div>
                            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.white, fontWeight: 600 }}>{val?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: r.result === "GREEN" ? C.greenDim : r.result === "AMBER" ? C.amberDim : C.redDim,
                      border: `1px solid ${r.result === "GREEN" ? C.green : r.result === "AMBER" ? C.amber : C.red}44`,
                      borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700,
                      color: r.result === "GREEN" ? C.green : r.result === "AMBER" ? C.amber : C.red,
                      alignSelf: "flex-start",
                    }}>{r.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
