import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps, GOOGLE_MAPS_KEY } from '../maps-config.js';
import RoutePlannerPanel from './RoutePlannerPanel';

const C = {
  dark: '#060A10', blue: '#00E5FF', green: '#00D68F', amber: '#F5A623',
  red: '#FF3D57', gold: '#c9a84c', purple: '#A855F7',
  card: 'rgba(0,229,255,0.07)', border: 'rgba(0,229,255,0.18)',
  text: 'rgba(255,255,255,0.85)', dim: 'rgba(255,255,255,0.42)',
};

const NETWORKS = {
  'Tesla': { color: '#E31937', icon: '⚡' },
  'ChargePoint': { color: '#00A8E0', icon: '🔵' },
  'Electrify America': { color: '#0068B5', icon: '🔌' },
  'EVgo': { color: '#00B140', icon: '🟢' },
  'Blink': { color: '#4B8B3B', icon: '💚' },
  'default': { color: C.blue, icon: '⚡' },
};

const DEMO_EV = [
  { name: 'Tesla Supercharger — Chicago Loop', address: '14 E Jackson Blvd, Chicago, IL', network: 'Tesla', level: 'DC Fast (250kW)', slots: 12, available: 8, distance: '0.3 mi', wait: '0 min', connectors: ['CCS', 'Tesla'], price: '$0.43/kWh', open24: true, amenities: ['Restroom', 'Retail nearby'] },
  { name: 'ChargePoint Station — Millennium Park', address: '201 E Randolph St, Chicago, IL', network: 'ChargePoint', level: 'Level 2 (7.2kW)', slots: 6, available: 4, distance: '0.6 mi', wait: '0 min', connectors: ['J1772'], price: '$0.18/kWh', open24: false, amenities: ['Parking', 'Park access'] },
  { name: 'Electrify America — Navy Pier', address: '600 E Grand Ave, Chicago, IL', network: 'Electrify America', level: 'DC Fast (150kW)', slots: 8, available: 3, distance: '1.1 mi', wait: '~8 min', connectors: ['CCS', 'CHAdeMO'], price: '$0.43/kWh', open24: true, amenities: ['Restroom', 'Food court'] },
  { name: 'EVgo Fast Charger — South Loop', address: '1 S Halsted St, Chicago, IL', network: 'EVgo', level: 'DC Fast (100kW)', slots: 4, available: 2, distance: '1.4 mi', wait: '~5 min', connectors: ['CCS', 'CHAdeMO'], price: '$0.35/kWh', open24: true, amenities: ['Retail nearby'] },
  { name: 'Blink Level 2 — Wicker Park', address: '1465 N Milwaukee Ave, Chicago, IL', network: 'Blink', level: 'Level 2 (6.2kW)', slots: 3, available: 3, distance: '2.8 mi', wait: '0 min', connectors: ['J1772'], price: '$0.08/min', open24: false, amenities: ['Coffee shop'] },
  { name: 'ChargePoint — O\'Hare Airport', address: '10000 W O\'Hare Ave, Chicago, IL', network: 'ChargePoint', level: 'Level 2 (7.2kW)', slots: 24, available: 11, distance: '14.2 mi', wait: '0 min', connectors: ['J1772'], price: '$0.18/kWh', open24: true, amenities: ['Airport', 'Parking garage'] },
];

const DEMO_BIKE = [
  { name: 'Divvy E-Bike Station — Millennium', address: '201 E Randolph, Chicago', network: 'Divvy', slots: 20, available: 14, distance: '0.5 mi', type: 'Shared E-Bike Dock', free: true, powered: true },
  { name: 'REI Bike Charging Hub', address: '1466 N Halsted St, Chicago', network: 'REI', slots: 8, available: 8, distance: '2.2 mi', type: 'USB + 110V Outlets', free: true, powered: true },
  { name: 'WeWork Bike Room — River North', address: '20 W Kinzie St, Chicago', network: 'WeWork', slots: 12, available: 9, distance: '0.9 mi', type: 'Secured + Charging', free: false, powered: true },
  { name: 'Walgreens Bike Corral — Wicker Park', address: '1372 N Milwaukee Ave, Chicago', network: 'City of Chicago', slots: 10, available: 10, distance: '2.7 mi', type: 'Covered + Solar Charging', free: true, powered: true },
  { name: 'Whole Foods Bike Station — Lincoln Park', address: '1550 N Kingsbury St, Chicago', network: 'Whole Foods', slots: 6, available: 5, distance: '3.1 mi', type: 'Locker + USB Port', free: true, powered: true },
  { name: 'City Bike Repair + Charge Kiosk', address: '323 E Riverwalk, Chicago', network: 'City of Chicago', slots: 4, available: 4, distance: '0.8 mi', type: 'Self-Service Repair + Charge', free: true, powered: true },
];

const CONNECTOR_GUIDE = [
  { name: 'CCS (Combined Charging System)', vehicles: 'Most EVs — Ford, Chevy, BMW, VW, Hyundai', speed: 'Up to 350kW DC Fast', color: C.blue },
  { name: 'Tesla (NACS)', vehicles: 'All Tesla vehicles + adapters available', speed: 'Up to 250kW Supercharger', color: C.red },
  { name: 'CHAdeMO', vehicles: 'Nissan Leaf, Mitsubishi Outlander', speed: 'Up to 100kW DC Fast', color: C.amber },
  { name: 'J1772', vehicles: 'All EVs (AC Level 1 & Level 2)', speed: 'Up to 19.2kW Level 2', color: C.green },
  { name: 'NEMA 14-50', vehicles: 'Home charging standard — 240V outlet', speed: 'Up to 7.2kW Level 2', color: C.purple },
];

export default function ChargingStationsPage() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const [mode, setMode] = useState('ev'); // 'ev', 'bike', 'truck'
  // Route planner state
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeVehicle, setRouteVehicle] = useState('ev');
  const [routeRange, setRouteRange] = useState(250);
  const [routePlanning, setRoutePlanning] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [city, setCity] = useState('Chicago, IL');
  const [searching, setSearching] = useState(false);
  const [stations, setStations] = useState(DEMO_EV);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [tab2, setTab2] = useState('map'); // 'map' or 'list' or 'guide'
  const markers = useRef([]);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (mapRef.current && !mapObj.current) {
        mapObj.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 41.8827, lng: -87.6233 },
          zoom: 13,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c2128' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#161b22' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1829' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          ],
        });
        setMapReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!mapReady || !mapObj.current) return;
    // Clear old markers
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];

    const list = mode === 'ev' ? DEMO_EV : DEMO_BIKE;
    // Chicago coords approx for demo
    const baseCoords = [
      { lat: 41.878, lng: -87.629 },
      { lat: 41.884, lng: -87.623 },
      { lat: 41.891, lng: -87.613 },
      { lat: 41.870, lng: -87.637 },
      { lat: 41.908, lng: -87.668 },
      { lat: 41.980, lng: -87.908 },
    ];

    list.forEach((s, i) => {
      if (!baseCoords[i]) return;
      const marker = new window.google.maps.Marker({
        position: baseCoords[i],
        map: mapObj.current,
        title: s.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: mode === 'ev' ? C.green : C.blue,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        label: { text: mode === 'ev' ? '⚡' : '🚲', fontSize: '14px' },
      });
      marker.addListener('click', () => setSelected(s));
      markers.current.push(marker);
    });
  }, [mapReady, mode]);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setStations(mode === 'ev' ? DEMO_EV : DEMO_BIKE);
      setSearching(false);
    }, 1200);
  };

  const handleLocate = (auto = false) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      if (mapObj.current) {
        mapObj.current.setCenter(loc);
        mapObj.current.setZoom(14);
        new window.google.maps.Marker({
          position: loc,
          map: mapObj.current,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: C.amber, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
          title: 'You are here',
        });
      }
      // Auto-search nearby stations when location is found
      setSearching(true);
      setCity('Near your location');
      setTimeout(() => {
        // Sort demo stations by simulated proximity to user
        const nearby = (mode === 'ev' ? DEMO_EV : DEMO_BIKE)
          .slice()
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        setStations(nearby);
        setSearching(false);
        if (auto) setTab2('list'); // on auto-load, switch to list so nearest charger is visible
      }, 900);
    }, () => {
      // Silently fail — user denied or unavailable, no error shown
    }, { enableHighAccuracy: true, timeout: 8000 });
  };

  // Auto-locate on first load
  useEffect(() => {
    handleLocate(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const avail = (s) => mode === 'ev' ? s.available : s.available;
  const total = (s) => mode === 'ev' ? s.slots : s.slots;
  const availColor = (s) => {
    const r = avail(s) / total(s);
    return r > 0.5 ? C.green : r > 0.2 ? C.amber : C.red;
  };

  const s = {
    page: { background: C.dark, minHeight: '100vh', color: '#fff', fontFamily: "'Oswald', 'Bebas Neue', sans-serif" },
    header: { background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,214,143,0.06), rgba(6,10,16,0.98))', borderBottom: `1px solid ${C.border}`, padding: '20px 24px' },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 },
    label: { fontSize: 10, letterSpacing: 4, color: C.blue, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 },
    btn: (active, color) => ({ padding: '9px 18px', borderRadius: 9, border: `1px solid ${active ? (color || C.blue) : 'rgba(255,255,255,0.12)'}`, background: active ? `${color || C.blue}22` : 'transparent', color: active ? (color || C.blue) : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 800, transition: 'all 0.2s' }),
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: C.green, fontWeight: 800, marginBottom: 4 }}>TRUCKWITHEASE — CHARGING STATION FINDER</div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>
          ⚡ Charging <span style={{ color: C.green }}>Station Finder</span>
        </div>
        <div style={{ fontSize: 13, color: C.dim, marginBottom: 16 }}>EV fast chargers · E-bike charging docks · Bike-share stations — all on one map</div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button style={s.btn(mode === 'ev', C.green)} onClick={() => { setMode('ev'); setStations(DEMO_EV); setSelected(null); }}>🚗 EV Car / Van</button>
          <button style={s.btn(mode === 'bike', C.blue)} onClick={() => { setMode('bike'); setStations(DEMO_BIKE); setSelected(null); }}>🚲 E-Bike</button>
          <button style={s.btn(mode === 'truck', C.amber)} onClick={() => { setMode('truck'); setStations(DEMO_EV); setSelected(null); }}>🚛 EV Truck / Fleet</button>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="City, zip, or address…"
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
          <button onClick={handleSearch} style={{ background: C.green, color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
            {searching ? '⏳ Searching…' : '🔍 Find Stations'}
          </button>
          <button onClick={() => handleLocate(false)} style={{ background: userLocation ? 'rgba(0,214,143,0.18)' : 'rgba(245,166,35,0.15)', border: `1px solid ${userLocation ? C.green : C.amber}`, borderRadius: 10, padding: '10px 16px', color: userLocation ? C.green : C.amber, fontWeight: 900, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s' }}>
            {userLocation ? '✅ Location Active — Refresh' : '📍 Use My Location'}
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {mode === 'ev' ? [
            { l: 'Stations Found', v: '6', c: C.green },
            { l: 'Available Now', v: '31 ports', c: C.green },
            { l: 'DC Fast Charge', v: '4 stations', c: C.amber },
            { l: 'Avg Wait', v: '< 5 min', c: C.blue },
            { l: 'Nearest', v: '0.3 mi', c: C.dim },
          ] : [
            { l: 'Charging Docks', v: '6 spots', c: C.blue },
            { l: 'Available Now', v: '50 ports', c: C.green },
            { l: 'Free Charging', v: '5 locations', c: C.green },
            { l: 'Solar-Powered', v: '1 station', c: C.amber },
            { l: 'Nearest', v: '0.5 mi', c: C.dim },
          ].map(k => (
            <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '7px 14px', flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 2 }}>{k.l.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)' }}>
        {[['map', '🗺️ Map'], ['list', '📋 List'], ['rest', '🛌 Charge & Rest'], ['planner', '🗺️ Route Planner'], ['guide', '📖 Connector Guide']].map(([k, l]) => (
          <button key={k} style={s.btn(tab2 === k)} onClick={() => setTab2(k)}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 20 }}>

        {/* MAP VIEW */}
        {tab2 === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16 }}>
            <div>
              <div ref={mapRef} style={{ width: '100%', height: 500, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }} />
              <div style={{ marginTop: 10, fontSize: 12, color: C.dim }}>
                {mode === 'ev' ? '🟢 Green pins = EV chargers' : '🔵 Blue pins = E-bike charging'} · 🟡 Yellow = Your location · Click any pin for details
              </div>
            </div>

            {selected && (
              <div style={{ ...s.card, borderColor: mode === 'ev' ? C.green : C.blue }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{selected.name}</div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>{selected.address}</div>

                {mode === 'ev' ? (
                  <>
                    <div style={{ background: `${availColor(selected)}22`, border: `1px solid ${availColor(selected)}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: availColor(selected), fontWeight: 900 }}>
                        {avail(selected)} of {total(selected)} ports available
                        {selected.wait !== '0 min' && ` · Est. wait: ${selected.wait}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {[
                        ['Network', selected.network],
                        ['Charge Level', selected.level],
                        ['Price', selected.price],
                        ['24/7', selected.open24 ? 'Yes' : 'Limited hours'],
                        ['Connectors', selected.connectors?.join(', ')],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: C.dim }}>{l}</span>
                          <span style={{ color: C.text, fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {selected.amenities?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 6 }}>AMENITIES</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {selected.amenities.map(a => (
                            <span key={a} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: C.text }}>{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ background: `${C.blue}22`, border: `1px solid ${C.blue}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: C.blue, fontWeight: 900 }}>{avail(selected)} of {total(selected)} spots available</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {[
                        ['Type', selected.type],
                        ['Network', selected.network],
                        ['Cost', selected.free ? 'Free' : 'Paid'],
                        ['Powered', selected.powered ? 'Yes — charging available' : 'Bike rack only'],
                        ['Distance', selected.distance],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: C.dim }}>{l}</span>
                          <span style={{ color: C.text, fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.address)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: C.green, color: '#000', border: 'none', borderRadius: 9, padding: '10px 14px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>🗺️ Navigate</a>
                  <button style={{ flex: 1, background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.blue}`, borderRadius: 9, padding: '10px 14px', color: C.blue, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>🔖 Save</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {tab2 === 'list' && (
          <div>
            {/* Nearest Open Charger Banner — shows when GPS is active */}
            {userLocation && stations.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(0,214,143,0.18), rgba(0,229,255,0.08))', border: `1px solid ${C.green}`, borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 28 }}>📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: C.green, fontWeight: 800, marginBottom: 2 }}>NEAREST OPEN CHARGER</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{stations[0].name}</div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{stations[0].distance} away · {stations[0].available} ports open · {mode === 'ev' ? stations[0].price : (stations[0].free ? 'Free' : 'Paid')}</div>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stations[0].address)}`} target="_blank" rel="noreferrer" style={{ background: C.green, color: '#000', padding: '10px 18px', borderRadius: 10, fontWeight: 900, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  ▶ Navigate
                </a>
              </div>
            )}
            {mode === 'ev' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', 'DC Fast', 'Level 2'].map(f => (
                  <button key={f} style={s.btn(filterLevel === f)} onClick={() => setFilterLevel(f)}>{f === 'all' ? 'All Levels' : f}</button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stations
                .filter(st => mode === 'bike' || filterLevel === 'all' || st.level?.includes(filterLevel))
                .map(st => (
                  <div key={st.name} onClick={() => setSelected(selected?.name === st.name ? null : st)} style={{ ...s.card, cursor: 'pointer', borderColor: selected?.name === st.name ? (mode === 'ev' ? C.green : C.blue) : C.border, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4 }}>{st.name}</div>
                        <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{st.address}</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: C.dim }}>📍 {st.distance}</span>
                          {mode === 'ev' ? (
                            <>
                              <span style={{ fontSize: 11, color: C.dim }}>{st.level}</span>
                              <span style={{ fontSize: 11, color: C.dim }}>{st.price}</span>
                              {st.open24 && <span style={{ fontSize: 11, color: C.green }}>24/7</span>}
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 11, color: C.dim }}>{st.type}</span>
                              {st.free && <span style={{ fontSize: 11, color: C.green }}>Free</span>}
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: availColor(st) }}>{avail(st)}/{total(st)}</div>
                        <div style={{ fontSize: 10, color: C.dim }}>available</div>
                        {mode === 'ev' && st.wait !== '0 min' && <div style={{ fontSize: 11, color: C.amber, marginTop: 2 }}>Wait: {st.wait}</div>}
                      </div>
                    </div>

                    {selected?.name === st.name && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(st.address)}`} target="_blank" rel="noopener noreferrer" style={{ background: C.green, color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textDecoration: 'none' }}>🗺️ Navigate</a>
                        <button style={{ background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.blue}`, borderRadius: 8, padding: '8px 16px', color: C.blue, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>🔖 Save Station</button>
                        {mode === 'ev' && st.connectors && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            {st.connectors.map(c => (
                              <span key={c} style={{ background: 'rgba(0,229,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: C.blue }}>{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* CHARGE & REST VIEW */}
        {tab2 === 'rest' && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>⚡🛌 Charge & Rest — Top Up While You Take a Break</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every location below has a charger AND a place to rest, eat, or use the restroom — so you're never just sitting next to a plug in a parking lot.</p>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['All', 'Food Nearby', 'Restroom', 'Free WiFi', 'Open 24h', 'Truck Friendly'].map(f => (
                <button key={f} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${C.border}`, background: f === 'All' ? C.green : 'rgba(0,0,0,0.4)', color: f === 'All' ? '#000' : C.text, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{f}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  name: 'McDonald\'s + ChargePoint — I-90 & Harlem Ave',
                  address: '7050 W Higgins Ave, Chicago, IL',
                  charger: 'Level 2 (7.2kW) · 4 ports · 2 available',
                  chargeTime: '~3h to full charge',
                  amenities: ['🍔 Full McDonald\'s — 24hr', '🚻 Clean Restrooms', '📶 Free WiFi', '🪑 Indoor Seating'],
                  score: 94, open24: true, truckFriendly: false, color: C.green,
                  tip: 'Perfect lunch stop — charge while you eat. 2 available ports right now.',
                },
                {
                  name: 'Pilot Flying J + Tesla Supercharger — I-94 S',
                  address: '3124 S Canal St, Chicago, IL',
                  charger: 'DC Fast (250kW Tesla) · 12 ports · 7 available',
                  chargeTime: '~25 min to 80%',
                  amenities: ['⛽ Pilot Flying J full stop', '🚻 Truck-rated restrooms', '🛒 Full store + hot food', '🚿 Showers available', '🪑 Driver\'s lounge'],
                  score: 99, open24: true, truckFriendly: true, color: '#E31937',
                  tip: 'Best full-stop on this corridor. 25 min charge, shower, food — back on the road.',
                },
                {
                  name: 'Starbucks + Electrify America — Oak Brook',
                  address: '2155 W 22nd St, Oak Brook, IL',
                  charger: 'DC Fast (150kW) · 6 ports · 4 available',
                  chargeTime: '~30 min to 80%',
                  amenities: ['☕ Starbucks drive-thru', '🚻 Restrooms', '📶 Free WiFi', '🪑 Comfortable seating'],
                  score: 88, open24: false, truckFriendly: false, color: C.blue,
                  tip: 'Order ahead on the app — coffee\'s ready when your car is.',
                },
                {
                  name: 'Whole Foods + EVgo — Lincoln Park',
                  address: '1550 N Kingsbury St, Chicago, IL',
                  charger: 'DC Fast (100kW) · 4 ports · 2 available',
                  chargeTime: '~35 min to 80%',
                  amenities: ['🥗 Whole Foods hot bar', '🚻 Clean restrooms', '📶 Free WiFi', '🪑 Cafe seating', '🧺 Grocery pickup'],
                  score: 85, open24: false, truckFriendly: false, color: C.green,
                  tip: 'Grab lunch from the hot bar and check emails — car\'s ready before you\'re done eating.',
                },
                {
                  name: 'Metra Park & Ride + ChargePoint — Naperville',
                  address: '105 E 4th Ave, Naperville, IL',
                  charger: 'Level 2 (6.6kW) · 20 ports · 14 available',
                  chargeTime: '~4h full charge',
                  amenities: ['🚻 Restrooms', '🌳 Shaded rest area', '🚂 Train access', '🅿️ Free parking 4h'],
                  score: 82, open24: false, truckFriendly: false, color: C.amber,
                  tip: 'Low-traffic, plenty of ports. Good option for an afternoon charge with a walk.',
                },
                {
                  name: 'Loves Travel Stop + Blink — I-55 & Weber Rd',
                  address: '25535 W Eames St, Channahon, IL',
                  charger: 'Level 2 (7.2kW) + DC Fast (50kW) · 8 ports · 6 available',
                  chargeTime: '~25–45 min depending on level',
                  amenities: ['🍕 Subway + Arby\'s inside', '🚻 Truck-rated restrooms', '🛒 Full travel store', '🚿 Showers', '🪑 Quiet seating area'],
                  score: 91, open24: true, truckFriendly: true, color: C.amber,
                  tip: 'Truck-friendly layout — easy pull-in, long dwell time welcome. Full stop capability.',
                },
              ].map((loc, i) => (
                <div key={i} style={{ ...s.card, borderLeft: `4px solid ${loc.color}`, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        {loc.open24 && <span style={{ fontSize: 9, fontWeight: 800, background: C.green + '25', color: C.green, borderRadius: 12, padding: '2px 8px', letterSpacing: 1 }}>OPEN 24H</span>}
                        {loc.truckFriendly && <span style={{ fontSize: 9, fontWeight: 800, background: C.amber + '25', color: C.amber, borderRadius: 12, padding: '2px 8px', letterSpacing: 1 }}>🚛 TRUCK FRIENDLY</span>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{loc.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{loc.address}</div>
                    </div>
                    <div style={{ textAlign: 'center', background: loc.color + '15', border: `1px solid ${loc.color}30`, borderRadius: 10, padding: '8px 14px' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: loc.color }}>{loc.score}</div>
                      <div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>REST SCORE</div>
                    </div>
                  </div>

                  {/* Charger info */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 2 }}>CHARGER</div>
                      <div style={{ fontSize: 11, color: loc.color, fontWeight: 700 }}>{loc.charger}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 2 }}>ESTIMATED TIME</div>
                      <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{loc.chargeTime}</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {loc.amenities.map(a => (
                      <span key={a} style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', color: C.text }}>{a}</span>
                    ))}
                  </div>

                  {/* Pro tip */}
                  <div style={{ background: loc.color + '10', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: C.text, fontStyle: 'italic', marginBottom: 12 }}>
                    💡 {loc.tip}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: '9px', borderRadius: 8, background: loc.color, color: '#000', fontWeight: 900, fontSize: 12, textDecoration: 'none', textAlign: 'center' }}>
                      🗺️ Navigate
                    </a>
                    <button style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      ⏰ Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Rest & charge tips */}
            <div style={{ ...s.card, marginTop: 24, borderColor: C.amber }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.amber, marginBottom: 12 }}>🧠 Smart Charge & Rest Tips</div>
              {[
                'DC Fast chargers slow down after 80% — stop there, rest, and you\'ve saved 20 minutes of waiting.',
                'Level 2 chargers are perfect for lunch or a 30-minute break — slow enough to not worry about moving the car.',
                'Most truck stops with chargers actively welcome EV drivers — don\'t hesitate to use the driver\'s lounge.',
                'Plan charge stops at meal times and you\'ll rarely feel like charging is a delay — it\'s just lunch.',
                'Download the ChargePoint, EVgo, and PlugShare apps — they all show live availability before you leave.',
              ].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: C.amber, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTE PLANNER */}
        {tab2 === 'planner' && (
          <RoutePlannerPanel routeVehicle={routeVehicle} setRouteVehicle={setRouteVehicle} routeRange={routeRange} setRouteRange={setRouteRange} routeOrigin={routeOrigin} setRouteOrigin={setRouteOrigin} routeDest={routeDest} setRouteDest={setRouteDest} routePlanning={routePlanning} setRoutePlanning={setRoutePlanning} routePlan={routePlan} setRoutePlan={setRoutePlan} />
        )}

        {/* CONNECTOR GUIDE */}
        {tab2 === 'guide' && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>EV Connector Guide — Know Before You Charge</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Pull up to the wrong connector and you're stuck. Here's exactly what plug your vehicle uses — and what every station has waiting for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CONNECTOR_GUIDE.map(g => (
                <div key={g.name} style={{ ...s.card, borderLeft: `4px solid ${g.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: g.color, fontWeight: 800 }}>{g.speed}</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.text }}>🚗 {g.vehicles}</div>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, marginTop: 20, borderColor: C.amber }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.amber, marginBottom: 10 }}>⚡ Charging Speed Explained</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { level: 'Level 1 (120V)', time: '8–24 hrs for full charge', best: 'Overnight at home — never rely on Level 1 on a shift', color: C.dim },
                  { level: 'Level 2 (240V)', time: '3–8 hrs for full charge', best: 'Parking garages, workplaces, shopping centers', color: C.blue },
                  { level: 'DC Fast Charge', time: '20–45 min to 80%', best: 'Highway stops, fleet hubs — fastest available', color: C.green },
                  { level: 'Ultra Fast (150kW+)', time: '10–20 min to 80%', best: 'Electrify America, Tesla V3 — best for courier fleets', color: C.amber },
                ].map(c => (
                  <div key={c.level} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: c.color }}>{c.level} — {c.time}</div>
                      <div style={{ fontSize: 12, color: C.dim }}>{c.best}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...s.card, marginTop: 16, borderColor: C.blue }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.blue, marginBottom: 10 }}>🚲 E-Bike Charging Tips</div>
              {[
                'Most e-bike batteries charge from a standard 110V outlet — same plug as your phone charger, just bigger.',
                'A full charge takes 3–6 hours depending on battery size — plan around your lunch break or end of shift.',
                'Free charging at Divvy stations, REI, Whole Foods, and most city bike corrals — no app needed at most spots.',
                'Solar-powered bike stations are spreading fast in Chicago, NYC, and Austin — always free.',
                'Never charge a hot battery — wait 15 minutes after a long ride before plugging in.',
              ].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: C.blue, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: C.text }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
