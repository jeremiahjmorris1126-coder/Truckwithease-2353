/**
 * Charge-Stop Route Planner Panel — with memory, save, feedback & adaptive sorting
 * Saves routes + stop feedback, adapts future plans to user history.
 */
import { useState, useEffect, useCallback } from 'react';
import { pb } from '../lib/pb.js';

const GREEN  = '#00D68F';
const AMBER  = '#F5A623';
const BLUE   = '#00E5FF';
const PURPLE = '#a78bfa';
const RED    = '#FF4757';
const DIM    = 'rgba(255,255,255,0.42)';
const TEXT   = 'rgba(255,255,255,0.85)';
const BORD   = 'rgba(0,229,255,0.18)';
const CARD_S = { background: 'rgba(0,229,255,0.07)', border: `1px solid ${BORD}`, borderRadius: 14, padding: 18, marginBottom: 12 };

const VEHICLES = [
  { id: 'ev',    icon: '🚗', label: 'EV Car / Sedan',           range: 250, color: GREEN,  stopMi: 200, stopTime: 25, tip: 'DC Fast stops — ~20 min, grab a coffee each time' },
  { id: 'van',   icon: '🚐', label: 'EV Van / Cargo Sprinter',  range: 180, color: BLUE,   stopMi: 150, stopTime: 35, tip: 'Higher draw at highway speeds — plan stops every 150 mi' },
  { id: 'truck', icon: '🚛', label: 'Electric Truck / Fleet',    range: 150, color: AMBER,  stopMi: 120, stopTime: 45, tip: 'High-capacity bays only — Pilot, Loves, EA — book ahead' },
  { id: 'bike',  icon: '🚲', label: 'E-Bike / Cargo Bike',       range: 40,  color: PURPLE, stopMi: 32,  stopTime: 60, tip: 'Free city chargers every 30–35 mi — coffee shop stops' },
];

const AMENITIES_BY_VEHICLE = {
  ev:    [['🍔 McDonald\'s 24hr', '🚻 Restrooms', '📶 WiFi'], ['🚿 Pilot Showers', '🛒 Full store', '🪑 Lounge'], ['🌳 Rest area', '🚻 Restrooms', '🅿️ Free parking']],
  van:   [['☕ Starbucks', '🚻 Restrooms', '📶 WiFi'], ['⛽ Flying J', '🛒 Store', '🚻 Restrooms'], ['🌳 Park', '🚻 Restrooms', '🅿️ Parking']],
  truck: [['🚿 Showers', '🍕 Subway', '🛒 Loves Store'], ['🪑 Driver Lounge', '🚻 Restrooms', '📶 WiFi'], ['⛽ Pilot Flying J', '🚿 Showers', '🛒 Full stop'], ['🌳 Rest area', '🚻 Restrooms', '☕ Coffee']],
  bike:  [['☕ Coffee shop', '🔌 USB outlets', '📶 WiFi'], ['🥗 Whole Foods', '🚻 Restrooms', '🛒 Grocery'], ['🌳 Park', '🚰 Water', '🛌 Rest area'], ['🔧 Bike repair', '🚻 Restrooms', '🪑 Seating'], ['🏪 REI hub', '🔌 Charging rack', '🛒 Gear'], ['🌳 Final stretch rest', '🚻 Restrooms', '📶 WiFi']],
};

const STOP_NAMES = {
  ev:    ['Electrify America — I-65 Service Plaza', 'Tesla Supercharger — Pilot Flying J', 'EVgo Fast Charger — Rest Area 43'],
  van:   ['ChargePoint — Loves Travel Stop', 'Blink Level 2 — Flying J Full Stop', 'Electrify America — Service Area'],
  truck: ['Loves EV Bay — Truck-Friendly Stop', 'Pilot Flying J + 350kW Charger', 'Electrify America Truck Bay — Rest Area', 'Flying J Fleet Stop — Final Charge'],
  bike:  ['City Bike Corral + Coffee Shop', 'Whole Foods E-Bike Hub', 'Park Charging Kiosk — Midpoint Rest', 'REI Cycling Hub', 'Solar Bike Dock — Downtown', 'Final City Charger — Near Destination'],
};

// Alternate stop pools — used when feedback is negative on a stop
const ALT_STOP_NAMES = {
  ev:    ['EVgo DC Fast — Shell Station Hub', 'ChargePoint Network — Walmart Lot', 'Volta Charging — Shopping Center'],
  van:   ['EVgo Fast Bay — Costco Parking', 'Tesla Destination — Marriott Hotel', 'Blink Network — Target Store'],
  truck: ['TA TruckStop — EV Bay', 'Petro Stopping Center + 350kW', 'Ambest Truck Plaza EV Bay', 'Blue Beacon + Fleet Charger'],
  bike:  ['Library Solar Dock', 'YMCA E-Bike Corral', 'Community Park Charging Kiosk', 'Bike Share Hub + USB', 'Museum Solar Station', 'Transit Hub E-Bike Dock'],
};

const TIPS = {
  ev:    ['Charge to 80% — the last 20% is slow. Eat, rest, leave at 80%.', 'Download PlugShare before you leave — live port availability.', 'Plan stops at restaurants: you wait for free while you eat.'],
  van:   ['Cargo vans draw more at highway speed — 150-mile stops, not 180.', 'ChargePoint and Electrify America are most van-reliable.', 'Book ahead at busy stops — EV bays fill faster than diesel.'],
  truck: ['Book Pilot and Loves EV bays ahead — limited high-capacity spots.', 'Plan 45-min stops — shower, meal, rest. Your hours thank you.', '350kW Electrify America bays are your fastest option on the interstate.', 'Charge to 80% only — faster and easier on the battery pack.'],
  bike:  ['Charge at Whole Foods and REI — always free, always welcoming.', 'Stop every 30–35 miles — give yourself a 5-mile buffer.', 'Most city solar corrals need no app — just plug in and rest.', 'A hot battery needs 10–15 min before charging — use restroom first.'],
};

// Get or create a session ID stored in localStorage
function getSessionId() {
  let sid = localStorage.getItem('twe_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('twe_session_id', sid);
  }
  return sid;
}

// Load preferences from localStorage
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem('twe_route_prefs') || '{}');
  } catch { return {}; }
}

function savePrefs(prefs) {
  localStorage.setItem('twe_route_prefs', JSON.stringify(prefs));
}

export default function RoutePlannerPanel({ routeVehicle, setRouteVehicle, routeRange, setRouteRange, routeOrigin, setRouteOrigin, routeDest, setRouteDest, routePlanning, setRoutePlanning, routePlan, setRoutePlan }) {
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'saved'
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [stopFeedback, setStopFeedback] = useState({}); // { stopName: 1 | -1 }
  const [feedbackHistory, setFeedbackHistory] = useState({}); // { stopName: avgRating } from backend
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const sessionId = getSessionId();

  const vData = VEHICLES.find(v => v.id === routeVehicle) || VEHICLES[0];

  // On mount: restore preferences
  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.vehicle && setRouteVehicle) {
      setRouteVehicle(prefs.vehicle);
      const vd = VEHICLES.find(v => v.id === prefs.vehicle);
      if (vd && setRouteRange) setRouteRange(prefs.range || vd.range);
    }
  }, []);

  // Load feedback history to power adaptive sorting
  const loadFeedbackHistory = useCallback(async () => {
    try {
      const result = await pb.collection('route_stop_feedback').getList(1, 200, {
        filter: `session_id = "${sessionId}"`,
        sort: '-created',
      });
      const history = {};
      result.items.forEach(item => {
        if (!history[item.stop_name]) history[item.stop_name] = { sum: 0, count: 0 };
        history[item.stop_name].sum += item.rating;
        history[item.stop_name].count += 1;
      });
      const avg = {};
      Object.keys(history).forEach(k => {
        avg[k] = history[k].sum / history[k].count;
      });
      setFeedbackHistory(avg);
    } catch (_) {}
  }, [sessionId]);

  useEffect(() => {
    loadFeedbackHistory();
  }, [loadFeedbackHistory]);

  // Load saved routes when switching to saved tab
  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedRoutes();
    }
  }, [activeTab]);

  const loadSavedRoutes = async () => {
    setLoadingSaved(true);
    try {
      const result = await pb.collection('saved_routes').getList(1, 50, {
        filter: `session_id = "${sessionId}"`,
        sort: '-created',
      });
      setSavedRoutes(result.items);
    } catch (_) {
      setSavedRoutes([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Save vehicle preference to localStorage on change
  const handleVehicleChange = (vid) => {
    setRouteVehicle(vid);
    const vd = VEHICLES.find(v => v.id === vid);
    if (vd) {
      setRouteRange(vd.range);
      const prefs = loadPrefs();
      savePrefs({ ...prefs, vehicle: vid, range: vd.range });
    }
  };

  const handleRangeChange = (val) => {
    setRouteRange(val);
    const prefs = loadPrefs();
    savePrefs({ ...prefs, range: val });
  };

  // Submit stop feedback
  const submitFeedback = async (stop, rating) => {
    const key = stop.name;
    setStopFeedback(prev => ({ ...prev, [key]: rating }));
    try {
      await pb.collection('route_stop_feedback').create({
        session_id: sessionId,
        stop_name: stop.name,
        vehicle_type: routeVehicle,
        rating,
        route_origin: routePlan?.origin || '',
        route_dest: routePlan?.dest || '',
      });
      // Refresh history after new feedback
      await loadFeedbackHistory();
    } catch (_) {}
  };

  const planRoute = () => {
    if (!routeOrigin || !routeDest) return;
    setRoutePlanning(true);
    setStopFeedback({});

    // Save last used route to prefs
    const prefs = loadPrefs();
    savePrefs({ ...prefs, lastOrigin: routeOrigin, lastDest: routeDest });

    setTimeout(() => {
      const stopCount = Math.max(1, Math.ceil(400 / vData.stopMi));
      const amenityList = AMENITIES_BY_VEHICLE[routeVehicle] || AMENITIES_BY_VEHICLE.ev;
      const nameList    = STOP_NAMES[routeVehicle] || STOP_NAMES.ev;
      const altList     = ALT_STOP_NAMES[routeVehicle] || ALT_STOP_NAMES.ev;
      const colors      = [GREEN, AMBER, BLUE, PURPLE, GREEN, AMBER];

      const stops = Array.from({ length: Math.min(stopCount, nameList.length) }, (_, i) => {
        const primaryName = nameList[i];
        const altName = altList[i] || altList[i % altList.length];
        // Adaptive: use alt stop if primary has negative history (avg < 0)
        const primaryRating = feedbackHistory[primaryName];
        const usePrimary = primaryRating === undefined || primaryRating >= 0;
        const stopName = usePrimary ? primaryName : altName;
        const isTrusted = feedbackHistory[stopName] !== undefined && feedbackHistory[stopName] > 0;
        return {
          n: i + 1,
          name: stopName,
          dist: `${Math.round(vData.stopMi * (i + 0.8))} mi from start`,
          charger: routeVehicle === 'bike' ? 'Level 2 / USB Dock' : routeVehicle === 'truck' ? 'DC Fast (350kW)' : routeVehicle === 'van' ? 'DC Fast (150kW)' : 'DC Fast (250kW)',
          time: `${vData.stopTime} min`,
          amenities: amenityList[i % amenityList.length],
          open24: i % 2 === 0,
          color: colors[i % colors.length],
          trusted: isTrusted,
          swapped: !usePrimary,
        };
      });

      setRoutePlan({ origin: routeOrigin, dest: routeDest, vehicle: routeVehicle, vIcon: vData.icon, stops, totalStops: stops.length, totalChargeTime: `${stops.length * vData.stopTime} min` });
      setRoutePlanning(false);
    }, 2000);
  };

  const saveRoute = async () => {
    if (!routePlan) return;
    setSaveStatus('saving');
    try {
      await pb.collection('saved_routes').create({
        session_id: sessionId,
        origin: routePlan.origin,
        destination: routePlan.dest,
        vehicle: routePlan.vehicle,
        range_mi: routeRange,
        stops_json: JSON.stringify(routePlan.stops),
        total_stops: routePlan.totalStops,
        total_charge_time: routePlan.totalChargeTime,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (_) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const reloadSavedRoute = (sr) => {
    try {
      const stops = JSON.parse(sr.stops_json || '[]');
      const vd = VEHICLES.find(v => v.id === sr.vehicle) || VEHICLES[0];
      setRouteVehicle(sr.vehicle);
      setRouteRange(sr.range_mi || vd.range);
      setRouteOrigin(sr.origin);
      setRouteDest(sr.destination);
      setRoutePlan({
        origin: sr.origin,
        dest: sr.destination,
        vehicle: sr.vehicle,
        vIcon: vd.icon,
        stops,
        totalStops: sr.total_stops,
        totalChargeTime: sr.total_charge_time,
      });
      setActiveTab('planner');
    } catch (_) {}
  };

  const deleteSavedRoute = async (id) => {
    try {
      await pb.collection('saved_routes').delete(id);
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    } catch (_) {}
  };

  const formatDate = (str) => {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div style={{ color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'planner', label: '🗺️ Route Planner' },
          { id: 'saved',   label: '💾 My Saved Routes' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `2px solid ${activeTab === t.id ? BLUE : 'rgba(255,255,255,0.1)'}`, background: activeTab === t.id ? 'rgba(0,229,255,0.12)' : 'rgba(0,0,0,0.3)', color: activeTab === t.id ? BLUE : DIM, cursor: 'pointer', fontSize: 12, fontWeight: 800, transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SAVED ROUTES TAB ── */}
      {activeTab === 'saved' && (
        <div>
          <div style={{ fontSize: 13, color: DIM, marginBottom: 20, lineHeight: 1.65 }}>
            All your saved routes — tap any to reload it instantly. Your stop feedback shapes future plans.
          </div>
          {loadingSaved && (
            <div style={{ textAlign: 'center', color: BLUE, padding: 40, fontSize: 13 }}>⚛️ Loading your routes…</div>
          )}
          {!loadingSaved && savedRoutes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: DIM }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
              <div style={{ fontSize: 13 }}>No saved routes yet.</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Plan a route and tap "Save This Route" to keep it here.</div>
            </div>
          )}
          {!loadingSaved && savedRoutes.map(sr => {
            const vd = VEHICLES.find(v => v.id === sr.vehicle) || VEHICLES[0];
            return (
              <div key={sr.id} style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${vd.color}30`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', marginBottom: 4 }}>
                      {vd.icon} {sr.origin} → {sr.destination}
                    </div>
                    <div style={{ fontSize: 11, color: DIM, marginBottom: 8 }}>
                      {sr.total_stops} stop{sr.total_stops !== 1 ? 's' : ''} · {sr.total_charge_time} charging · {formatDate(sr.created)}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: vd.color + '20', color: vd.color, borderRadius: 8, padding: '3px 10px' }}>
                      {vd.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => reloadSavedRoute(sr)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: BLUE, color: '#000', fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                      Load Route
                    </button>
                    <button onClick={() => deleteSavedRoute(sr.id)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${RED}40`, background: 'transparent', color: RED, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PLANNER TAB ── */}
      {activeTab === 'planner' && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>🗺️ Charge-Stop Route Planner</div>
          <p style={{ fontSize: 13, color: DIM, marginBottom: 24, lineHeight: 1.65 }}>
            Enter your start and destination, pick your vehicle, and get a full charge-stop plan — for e-bikes, EV cars, vans, and electric trucks.
          </p>

          {/* Vehicle selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>I'm driving a…</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {VEHICLES.map(v => (
                <button key={v.id} onClick={() => handleVehicleChange(v.id)}
                  style={{ flex: '1 1 150px', padding: '13px 14px', borderRadius: 12, border: `2px solid ${routeVehicle === v.id ? v.color : 'rgba(255,255,255,0.1)'}`, background: routeVehicle === v.id ? v.color + '18' : 'rgba(0,0,0,0.3)', color: routeVehicle === v.id ? v.color : DIM, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{v.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 3 }}>{v.label}</div>
                  <div style={{ fontSize: 9, opacity: 0.75, lineHeight: 1.4 }}>{v.tip}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Origin + Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            {[
              { label: 'Starting From', value: routeOrigin, set: setRouteOrigin, ph: 'Chicago, IL' },
              { label: 'Going To',      value: routeDest,   set: setRouteDest,   ph: 'Nashville, TN' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORD}`, borderRadius: 10, color: TEXT, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          {/* Range slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase' }}>Current range</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: vData.color }}>{routeRange} mi</span>
            </div>
            <input type="range" min={15} max={400} value={routeRange} onChange={e => handleRangeChange(+e.target.value)}
              style={{ width: '100%', accentColor: vData.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: DIM, marginTop: 3 }}>
              <span>15 mi (low battery)</span><span>400 mi (full long-range)</span>
            </div>
          </div>

          <button onClick={planRoute} disabled={!routeOrigin || !routeDest || routePlanning}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: routeOrigin && routeDest && !routePlanning ? 'pointer' : 'not-allowed', background: routeOrigin && routeDest && !routePlanning ? `linear-gradient(135deg, ${vData.color}, ${vData.color}99)` : 'rgba(255,255,255,0.1)', color: '#000', fontWeight: 900, fontSize: 14, marginBottom: 28, opacity: routeOrigin && routeDest ? 1 : 0.5, transition: 'all 0.2s' }}>
            {routePlanning ? '⚛️ Finding best charge stops…' : `🗺️ Plan My ${vData.icon} Route`}
          </button>

          {/* RESULT */}
          {routePlan && (
            <div>
              {/* Summary bar */}
              <div style={{ background: vData.color + '10', border: `1px solid ${vData.color}30`, borderRadius: 14, padding: '16px 20px', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{vData.icon} {routePlan.origin} → {routePlan.dest}</div>
                    <div style={{ fontSize: 12, color: DIM }}>{routePlan.totalStops} charge stop{routePlan.totalStops > 1 ? 's' : ''} · ~{routePlan.totalChargeTime} total charging time</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 14px' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: vData.color }}>{routePlan.totalStops}</div>
                      <div style={{ fontSize: 9, color: DIM }}>STOPS</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 14px' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: vData.color }}>{routePlan.totalChargeTime}</div>
                      <div style={{ fontSize: 9, color: DIM }}>CHARGING</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Route button */}
              <button onClick={saveRoute} disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                style={{ width: '100%', marginBottom: 20, padding: '12px', borderRadius: 10, border: `2px solid ${saveStatus === 'saved' ? GREEN : saveStatus === 'error' ? RED : AMBER}`, background: saveStatus === 'saved' ? GREEN + '15' : 'rgba(0,0,0,0.35)', color: saveStatus === 'saved' ? GREEN : saveStatus === 'error' ? RED : AMBER, fontWeight: 900, fontSize: 13, cursor: saveStatus === 'saving' || saveStatus === 'saved' ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                {saveStatus === 'saving' ? '⏳ Saving…' : saveStatus === 'saved' ? '✓ Route Saved — tap "My Saved Routes" to see it' : saveStatus === 'error' ? '✕ Could not save — try again' : '💾 Save This Route'}
              </button>

              {/* Stop timeline */}
              <div style={{ position: 'relative', paddingLeft: 0 }}>
                <div style={{ position: 'absolute', left: 20, top: 20, bottom: 20, width: 2, background: `linear-gradient(180deg, ${vData.color}, ${BLUE})`, zIndex: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Start */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: vData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏁</div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORD}`, borderRadius: 10, padding: '10px 14px', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Start — {routePlan.origin}</div>
                      <div style={{ fontSize: 11, color: DIM }}>Current range: {routeRange} mi · Charge to full before departing if possible</div>
                    </div>
                  </div>

                  {routePlan.stops.map(stop => {
                    const fb = stopFeedback[stop.name];
                    return (
                      <div key={stop.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: stop.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#000', flexShrink: 0 }}>
                          {stop.n}
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${stop.color}40`, borderRadius: 12, padding: '14px 16px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{stop.name}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {stop.open24 && <span style={{ fontSize: 9, fontWeight: 800, background: GREEN + '20', color: GREEN, borderRadius: 10, padding: '2px 8px', letterSpacing: 1 }}>OPEN 24H</span>}
                              {stop.trusted && <span style={{ fontSize: 9, fontWeight: 800, background: BLUE + '20', color: BLUE, borderRadius: 10, padding: '2px 8px', letterSpacing: 1 }}>✓ YOUR PICK</span>}
                              {stop.swapped && <span style={{ fontSize: 9, fontWeight: 800, background: AMBER + '20', color: AMBER, borderRadius: 10, padding: '2px 8px', letterSpacing: 1 }}>↺ ADJUSTED</span>}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: DIM, marginBottom: 8 }}>📍 {stop.dist}</div>
                          <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: stop.color, fontWeight: 700 }}>⚡ {stop.charger}</span>
                            <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>⏱️ ~{stop.time}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {stop.amenities.map(a => (
                              <span key={a} style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '3px 9px', color: TEXT }}>{a}</span>
                            ))}
                          </div>

                          {/* Navigate + Feedback row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.name)}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-block', padding: '8px 18px', background: stop.color, color: '#000', borderRadius: 8, fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
                              🗺️ Navigate
                            </a>
                            {/* Feedback buttons */}
                            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                              <span style={{ fontSize: 10, color: DIM, alignSelf: 'center', marginRight: 4 }}>Rate stop:</span>
                              <button
                                onClick={() => submitFeedback(stop, 1)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${fb === 1 ? GREEN : 'rgba(255,255,255,0.15)'}`, background: fb === 1 ? GREEN + '25' : 'rgba(0,0,0,0.3)', color: fb === 1 ? GREEN : DIM, cursor: 'pointer', fontSize: 14, fontWeight: 900, minWidth: 40, minHeight: 36 }}>
                                👍
                              </button>
                              <button
                                onClick={() => submitFeedback(stop, -1)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${fb === -1 ? RED : 'rgba(255,255,255,0.15)'}`, background: fb === -1 ? RED + '25' : 'rgba(0,0,0,0.3)', color: fb === -1 ? RED : DIM, cursor: 'pointer', fontSize: 14, fontWeight: 900, minWidth: 40, minHeight: 36 }}>
                                👎
                              </button>
                            </div>
                          </div>
                          {fb === -1 && (
                            <div style={{ fontSize: 10, color: AMBER, marginTop: 8 }}>
                              ↺ Got it — we'll find a better stop here next time you plan this route.
                            </div>
                          )}
                          {fb === 1 && (
                            <div style={{ fontSize: 10, color: GREEN, marginTop: 8 }}>
                              ✓ Noted — we'll keep this stop as a trusted pick for your future routes.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* End */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏆</div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORD}`, borderRadius: 10, padding: '10px 14px', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Destination — {routePlan.dest}</div>
                      <div style={{ fontSize: 11, color: DIM }}>Arriving with ~20% reserve — enough to find final destination charger</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{ ...CARD_S, marginTop: 24, borderColor: AMBER }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: AMBER, marginBottom: 10 }}>💡 Tips for your {vData.label}</div>
                {(TIPS[routeVehicle] || TIPS.ev).map(t => (
                  <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: AMBER, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.55 }}>{t}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { setRoutePlan(null); setRouteOrigin(''); setRouteDest(''); }}
                style={{ width: '100%', marginTop: 8, padding: '12px', borderRadius: 10, border: `1px solid ${BORD}`, background: 'transparent', color: DIM, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                ↩ Plan a Different Route
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
