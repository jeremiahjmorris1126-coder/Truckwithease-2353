import { useState, useRef, useEffect, useCallback } from "react";
import { GOOGLE_MAPS_KEY, loadGoogleMaps } from "./maps-config.js";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

const PARKING_SPOTS = [
  { id:1, name:"Pilot Flying J #0441", exit:"220", distance:4.2,  spaces:38, total:60, free:false, price:0, showers:true, showerCount:12, showerWait:"~5 min", food:true, wifi:true, scales:true, beds:true, safe:true, bigRig:true, overnight:true, lit:true, cameras:true, type:"truck_stop", city:"Texarkana, TX", hosAlert:null,
    nearbyMotels:[{name:"La Quinta Inn Texarkana",dist:"0.8 mi",rate:"$79/nt",rating:4.1},{name:"Holiday Inn Express",dist:"1.2 mi",rate:"$94/nt",rating:4.3}] },
  { id:2, name:"Love's Travel Stop", exit:"11", distance:8.5, spaces:14, total:40, free:false, price:0, showers:true, showerCount:8, showerWait:"~15 min", food:true, wifi:true, scales:false, beds:false, safe:true, bigRig:true, overnight:true, lit:true, cameras:true, type:"truck_stop", city:"Memphis, TN", hosAlert:null,
    nearbyMotels:[{name:"Super 8 Memphis",dist:"0.4 mi",rate:"$64/nt",rating:3.8},{name:"Comfort Inn & Suites",dist:"1.0 mi",rate:"$89/nt",rating:4.0}] },
  { id:3, name:"I-30 Rest Area WB", exit:"N/A", distance:12.1, spaces:6, total:22, free:true, price:0, showers:false, showerCount:0, showerWait:"N/A", food:false, wifi:false, scales:false, beds:false, safe:true, bigRig:true, overnight:false, lit:false, cameras:false, type:"rest_area", city:"Benton, AR", hosAlert:"⚠️ No cameras or lighting — not recommended overnight",
    nearbyMotels:[{name:"Americas Best Value Inn",dist:"3.1 mi",rate:"$59/nt",rating:3.5}] },
  { id:4, name:"Flying J #0882", exit:"48", distance:15.8, spaces:42, total:65, free:false, price:0, showers:true, showerCount:18, showerWait:"~3 min", food:true, wifi:true, scales:true, beds:true, safe:true, bigRig:true, overnight:true, lit:true, cameras:true, type:"truck_stop", city:"Joplin, MO", hosAlert:null,
    nearbyMotels:[{name:"Drury Inn & Suites",dist:"0.6 mi",rate:"$109/nt",rating:4.5},{name:"Hampton Inn Joplin",dist:"0.9 mi",rate:"$119/nt",rating:4.4},{name:"Motel 6 Joplin",dist:"0.3 mi",rate:"$54/nt",rating:3.6}] },
  { id:5, name:"Walmart Supercenter", exit:"7", distance:3.1, spaces:4, total:8, free:true, price:0, showers:false, showerCount:0, showerWait:"N/A", food:true, wifi:false, scales:false, beds:false, safe:false, bigRig:false, overnight:false, lit:true, cameras:false, type:"walmart", city:"Texarkana, TX", hosAlert:"🚫 NOT safe for overnight — 3 theft reports this month. Do not park here.",
    nearbyMotels:[] },
  { id:6, name:"TA Petro #193", exit:"61", distance:22.4, spaces:55, total:80, free:false, price:0, showers:true, showerCount:20, showerWait:"~2 min", food:true, wifi:true, scales:true, beds:true, safe:true, bigRig:true, overnight:true, lit:true, cameras:true, type:"truck_stop", city:"Springfield, MO", hosAlert:null,
    nearbyMotels:[{name:"Best Western Plus Springfield",dist:"1.1 mi",rate:"$89/nt",rating:4.2},{name:"Days Inn Springfield",dist:"0.7 mi",rate:"$65/nt",rating:3.7}] },
  { id:7, name:"I-40 Rest Area EB", exit:"N/A", distance:6.7, spaces:3, total:18, free:true, price:0, showers:false, showerCount:0, showerWait:"N/A", food:false, wifi:false, scales:false, beds:false, safe:true, bigRig:true, overnight:false, lit:false, cameras:false, type:"rest_area", city:"Amarillo, TX", hosAlert:"⚠️ Only 3 spaces — may fill before you arrive. Have a backup.",
    nearbyMotels:[{name:"Holiday Inn Amarillo",dist:"4.2 mi",rate:"$99/nt",rating:4.1}] },
  { id:8, name:"Petro Stopping Center", exit:"42", distance:18.3, spaces:28, total:45, free:false, price:0, showers:true, showerCount:15, showerWait:"~8 min", food:true, wifi:true, scales:true, beds:false, safe:true, bigRig:true, overnight:true, lit:true, cameras:true, type:"truck_stop", city:"OKC, OK", hosAlert:null,
    nearbyMotels:[{name:"La Quinta Inn OKC",dist:"0.5 mi",rate:"$84/nt",rating:4.0},{name:"Econolodge OKC",dist:"0.2 mi",rate:"$49/nt",rating:3.3}] },
];

// Current HOS simulation - driver has 2h 15m of drive time remaining
const DRIVER_HOS = { driveLeft: "2h 15m", windowLeft: "3h 40m", action: "STOP NEEDED IN ~135 MI" };

const FILTER_TYPES = ["All","Big Rig Only","Overnight Safe","Truck Stop","Rest Area"];

function spaceColor(spaces, total) {
  const pct = spaces / total;
  if (pct > 0.33) return GREEN;
  if (pct > 0.08) return AMBER;
  return RED;
}

const PIN_POSITIONS = [
  { id:1, x:55, y:38 }, { id:2, x:72, y:55 }, { id:3, x:40, y:62 },
  { id:4, x:60, y:72 }, { id:5, x:52, y:32 }, { id:6, x:78, y:78 },
  { id:7, x:25, y:48 }, { id:8, x:65, y:65 },
];


const SPOT_COORDS = {
  1: { lat: 33.4357, lng: -94.0477 },
  2: { lat: 35.1495, lng: -90.0490 },
  3: { lat: 34.5651, lng: -92.5452 },
  4: { lat: 37.0842, lng: -94.5133 },
  5: { lat: 33.4418, lng: -94.0377 },
  6: { lat: 37.2153, lng: -93.2982 },
  7: { lat: 35.2220, lng: -101.8313 },
  8: { lat: 35.4676, lng: -97.5164 },
};

export default function ParkingPage() {
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("All");
  const [overnightOnly, setOvernight] = useState(false);
  const [bigRigOnly, setBigRig]     = useState(false);
  const [selected, setSelected]     = useState(PARKING_SPOTS[0]);
  const [chatInput, setChatInput]   = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role:"ai", text:`⚠️ HOS ALERT: You have ${DRIVER_HOS.driveLeft} of drive time left. Based on your corridor, I'm showing 3 safe big-rig overnight spots within your range. Top pick: Pilot Flying J #0441 at Exit 220 — 38 open spaces, cameras, lit lot, full amenities. Want me to set it as your destination?` }
  ]);

  const chatEndRef = useRef(null);
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  const filtered = PARKING_SPOTS.filter(s => {
    if (filter === "Big Rig Only" && !s.bigRig) return false;
    if (filter === "Overnight Safe" && (!s.overnight || !s.safe)) return false;
    if (filter === "Truck Stop" && s.type !== "truck_stop") return false;
    if (filter === "Rest Area" && s.type !== "rest_area") return false;
    if (overnightOnly && (!s.overnight || !s.safe)) return false;
    if (bigRigOnly && !s.bigRig) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!mapRef.current || mapObj.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.5, lng: -94.5 }, zoom: 7,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#07111f' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8EC3B9' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e3a6e' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d5a9e' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1929' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapObj.current = map;
      PARKING_SPOTS.forEach(spot => {
        const coords = SPOT_COORDS[spot.id];
        if (!coords) return;
        const pct = spot.spaces / spot.total;
        const color = pct > 0.33 ? '#16A34A' : pct > 0.08 ? '#FFB400' : '#DC2626';
        const marker = new window.google.maps.Marker({
          position: coords, map,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
          title: spot.name,
        });
        marker.addListener('click', () => setSelected(spot));
      });
      setMapLoaded(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapObj.current || !selected) return;
    const c = SPOT_COORDS[selected.id];
    if (c) { mapObj.current.panTo(c); mapObj.current.setZoom(13); }
  }, [selected]);


  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(p => [...p, { role:"user", text:msg }]);
    setChatInput("");
    setTimeout(() => {
      const lower = msg.toLowerCase();
      let reply;
      if (lower.includes("overnight") || lower.includes("safe") || lower.includes("sleep"))
        reply = "Best overnight options on your corridor: 1️⃣ Flying J #0882 (Exit 48 · 42 spaces · cameras · lit) 2️⃣ TA Petro #193 (Exit 61 · 55 spaces · full amenities) 3️⃣ Pilot at Exit 220 (38 spaces · closest). All three have verified security and big-rig spaces. Avoid the I-30 rest area — no lighting.";
      else if (lower.includes("big rig") || lower.includes("truck"))
        reply = "All truck stops on your list accommodate 53-ft trailers and doubles. Rest areas may have length restrictions — I-40 Rest Area EB has a 65-ft limit. Flying J #0882 has the most big-rig spaces right now with 42 open.";
      else if (lower.includes("free") || lower.includes("cost"))
        reply = "Free options: I-30 Rest Area (6 spaces, no amenities) and I-40 Rest Area EB (3 spaces, very limited). Not recommended for overnight — no cameras or lighting. Truck stops are pay-as-you-go with fuel purchase often waiving overnight fees.";
      else if (lower.includes("hos") || lower.includes("time"))
        reply = `Your HOS window closes in ${DRIVER_HOS.windowLeft}. At current speed you can safely reach Flying J #0882 at Exit 48 (15.8 mi) or Pilot at Exit 220 (4.2 mi, closest). I'd recommend stopping at Pilot to keep a safety buffer on your clock.`;
      else
        reply = "I can help you find the safest big-rig overnight parking on your corridor. Ask about overnight-safe spots, HOS timing, big-rig clearance, or which lots have cameras and lighting.";
      setChatMessages(p => [...p, { role:"ai", text:reply }]);
    }, 900);
  }

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#0C1628", minHeight:"100vh", color:"#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1e3a6e;border-radius:2px}
        .pk-nav-link{color:#94a3b8;text-decoration:none;font-size:13px;font-weight:500;transition:color 0.2s}
        .pk-nav-link:hover{color:#FFB400}
        .pk-filter{border:1px solid #1e3a6e;background:transparent;color:#94a3b8;padding:6px 13px;border-radius:20px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap}
        .pk-filter.active{background:#FFB400;border-color:#FFB400;color:#000}
        .pk-filter:hover:not(.active){border-color:#FFB400;color:#FFB400}
        .pk-spot{background:#0f1f3d;border:1px solid #1e3a6e;border-radius:12px;padding:13px;cursor:pointer;transition:all 0.2s;margin-bottom:8px}
        .pk-spot:hover,.pk-spot.sel{border-color:#FFB400;background:#131f3a}
        .pk-toggle{width:40px;height:22px;border-radius:11px;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
        .pk-toggle-knob{position:absolute;top:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:left 0.2s}
        .pk-chat-input{background:#0f1f3d;border:1px solid #1e3a6e;color:#e2e8f0;font-family:'Poppins',sans-serif;font-size:13px;border-radius:8px;padding:10px 14px;flex:1;outline:none}
        .pk-chat-input:focus{border-color:#FFB400}
        @media(max-width:900px){.pk-layout{flex-direction:column!important}.pk-left{width:100%!important;max-height:55vh!important}.pk-right{height:45vh!important}}
      `}</style>

      {/* HOS ALERT BANNER */}
      <div style={{ background:"linear-gradient(90deg,#7c1515,#991b1b)", borderBottom:"2px solid #dc2626", padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>⏱️</span>
          <div>
            <div style={{ color:"white", fontWeight:800, fontSize:13 }}>HOS ALERT — {DRIVER_HOS.action}</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>Drive time left: {DRIVER_HOS.driveLeft} · Window closes in: {DRIVER_HOS.windowLeft}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ background:"rgba(0,0,0,0.3)", color:"#fca5a5", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, border:"1px solid #dc2626" }}>3 safe stops within range</span>
          <a href="/hos" style={{ background:"#dc2626", color:"white", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, textDecoration:"none" }}>View HOS →</a>
        </div>
      </div>

      {/* NAV */}
      <nav style={{ background:NAVY2, padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #1e3a6e", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:32, borderRadius:8 }} /></a>
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ fontWeight:800, fontSize:14, color:"white" }}>🅿️ Truck Parking Finder</span>
        </div>
        <div style={{ display:"flex", gap:18, alignItems:"center" }}>
          <a href="/fuel-finder" className="pk-nav-link">⛽ Fuel</a>
          <a href="/bypass" className="pk-nav-link">⚡ Bypass</a>
          <a href="/breakdown" className="pk-nav-link">🆘 SOS</a>
          <a href="/#pricing" style={{ background:AMBER, color:DARK, padding:"6px 14px", borderRadius:7, fontWeight:800, fontSize:12, textDecoration:"none" }}>Free Trial</a>
          <a href="/" className="pk-nav-link" style={{ fontSize:11 }}>← Back</a>
        </div>
      </nav>

      <div className="pk-layout" style={{ display:"flex", height:"calc(100vh - 120px)" }}>

        {/* LEFT PANEL */}
        <div className="pk-left" style={{ width:330, background:"#0a1628", borderRight:"1px solid #1a2e50", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Search */}
          <div style={{ padding:"12px 14px 8px" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search city, highway, exit..."
              style={{ width:"100%", background:"#0f1f3d", border:"1px solid #1e3a6e", color:"#e2e8f0", fontFamily:"'Poppins',sans-serif", fontSize:13, borderRadius:8, padding:"9px 14px", outline:"none" }} />
          </div>

          {/* Filters */}
          <div style={{ padding:"0 14px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {FILTER_TYPES.map(f => (
              <button key={f} className={`pk-filter${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>

          {/* Smart toggles */}
          <div style={{ padding:"8px 14px", borderTop:"1px solid #1a2e50", display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"🚛 Big Rig Only (53ft+)", val:bigRigOnly, set:setBigRig },
              { label:"🌙 Overnight Safe Only", val:overnightOnly, set:setOvernight },
            ].map(t => (
              <div key={t.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:"#94a3b8" }}>{t.label}</span>
                <div className="pk-toggle" onClick={()=>t.set(!t.val)} style={{ background:t.val?AMBER:"#1e3a6e" }}>
                  <div className="pk-toggle-knob" style={{ left:t.val?21:3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Spot list */}
          <div style={{ flex:1, overflowY:"auto", padding:"10px 14px" }}>
            {filtered.length === 0 && <div style={{ color:"#64748b", textAlign:"center", marginTop:30, fontSize:13 }}>No spots match your filters.</div>}
            {filtered.map(s => (
              <div key={s.id} className={`pk-spot${selected?.id===s.id?" sel":""}`} onClick={()=>setSelected(s)}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{s.city}{s.exit!=="N/A"?` · Exit ${s.exit}`:""} · {s.distance} mi</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                    <div style={{ fontWeight:900, fontSize:20, color:spaceColor(s.spaces,s.total), fontFamily:"'DM Mono',monospace" }}>{s.spaces}</div>
                    <div style={{ fontSize:10, color:"#64748b" }}>/{s.total}</div>
                  </div>
                </div>

                {/* HOS alert for this spot */}
                {s.hosAlert && (
                  <div style={{ background:"rgba(220,38,38,0.12)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:6, padding:"5px 8px", marginBottom:6, fontSize:11, color:"#fca5a5", lineHeight:1.4 }}>
                    {s.hosAlert}
                  </div>
                )}

                <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
                  {s.showers && <span style={{ fontSize:13 }} title={`${s.showerCount} showers · ${s.showerWait}`}>🚿 {s.showerCount}</span>}
                  {s.food    && <span style={{ fontSize:13 }} title="Food">🍔</span>}
                  {s.wifi    && <span style={{ fontSize:13 }} title="WiFi">📶</span>}
                  {s.scales  && <span style={{ fontSize:13 }} title="Scales">⚖️</span>}
                  {s.beds    && <span style={{ fontSize:13 }} title="Sleeper Beds">🛏️</span>}
                  {s.cameras && <span style={{ fontSize:13 }} title="Security Cameras">📹</span>}
                  {s.lit     && <span style={{ fontSize:13 }} title="Lit Lot">💡</span>}
                  <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:s.free?GREEN:AMBER }}>{s.free?"FREE":"PAID"}</span>
                  {s.overnight && s.safe && <span style={{ fontSize:9, background:"#14532d", color:"#86efac", padding:"2px 6px", borderRadius:20 }}>✓ Overnight</span>}
                  {s.bigRig   && <span style={{ fontSize:9, background:"#1e3a6e", color:"#93c5fd", padding:"2px 6px", borderRadius:20 }}>🚛 Big Rig</span>}
                  {!s.safe    && <span style={{ fontSize:9, background:"#7c1515", color:"#fca5a5", padding:"2px 6px", borderRadius:20 }}>⚠️ Theft Risk</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Sarge */}
          <div style={{ padding:"10px 14px", background:"#0d1a30", borderTop:"1px solid #1a2e50" }}>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:18 }}>🦺</span>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:AMBER, marginBottom:2 }}>Safety Sarge</div>
                <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.5 }}>Truck stops with cameras + lighting only for overnight. Rest areas are for breaks, not sleep. Walmart lots have the highest truck theft rate of any parking type.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — MAP + CHAT */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Map */}
          <div className="pk-right" style={{ flex:1, position:"relative", background:"#07111f", overflow:"hidden" }}>
            {/* Real Google Maps */}
            <div ref={mapRef} style={{ width:"100%", height:"100%" }} />
            {!mapLoaded && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#07111f", flexDirection:"column", gap:12 }}>
                <div style={{ fontSize:32 }}>🗺️</div>
                <div style={{ color:"#FFB400", fontWeight:700, fontSize:14 }}>Loading map…</div>
                <div style={{ color:"#64748b", fontSize:12 }}>Google Maps powering live parking locations</div>
              </div>
            )}
            {/* Legend */}
            <div style={{ position:"absolute", bottom:16, left:16, background:"rgba(10,22,40,0.9)", border:"1px solid #1e3a6e", borderRadius:8, padding:"10px 14px", display:"flex", gap:14, flexWrap:"wrap", zIndex:10 }}>
              {[[GREEN,"20+ spaces"],[AMBER,"5–20 spaces"],[RED,"< 5 spaces"]].map(([col,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col }} />
                  <span style={{ fontSize:10, color:"#94a3b8" }}>{l}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:12 }}>🌙</span>
                <span style={{ fontSize:10, color:"#94a3b8" }}>Overnight Safe</span>
              </div>
            </div>

            {/* Selected detail */}
            {selected && (
              <div style={{ position:"absolute", top:16, right:16, width:270, background:"rgba(10,22,40,0.97)", border:`1px solid ${selected.overnight&&selected.safe?GREEN:selected.safe?AMBER:RED}`, borderRadius:14, padding:18, zIndex:20 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#fff", marginBottom:3 }}>{selected.name}</div>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:10 }}>{selected.city}{selected.exit!=="N/A"?` · Exit ${selected.exit}`:""}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                  {[
                    { l:"Open", v:selected.spaces, c:spaceColor(selected.spaces,selected.total) },
                    { l:"Total", v:selected.total, c:"#fff" },
                    { l:"Type", v:selected.free?"Free":"Paid", c:selected.free?GREEN:AMBER },
                  ].map(d=>(
                    <div key={d.l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:900, color:d.c, fontFamily:"'DM Mono',monospace" }}>{d.v}</div>
                      <div style={{ fontSize:10, color:"#64748b" }}>{d.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                  {selected.overnight && selected.safe && <span style={{ fontSize:10, background:"rgba(22,163,74,0.15)", color:"#86efac", border:"1px solid rgba(22,163,74,0.3)", padding:"2px 8px", borderRadius:20 }}>🌙 Overnight Safe</span>}
                  {selected.bigRig && <span style={{ fontSize:10, background:"rgba(59,130,246,0.15)", color:"#93c5fd", border:"1px solid rgba(59,130,246,0.3)", padding:"2px 8px", borderRadius:20 }}>🚛 Big Rig OK</span>}
                  {selected.cameras && <span style={{ fontSize:10, background:"rgba(255,180,0,0.1)", color:AMBER, border:`1px solid ${AMBER}30`, padding:"2px 8px", borderRadius:20 }}>📹 Cameras</span>}
                  {selected.lit && <span style={{ fontSize:10, background:"rgba(255,180,0,0.1)", color:AMBER, border:`1px solid ${AMBER}30`, padding:"2px 8px", borderRadius:20 }}>💡 Lit Lot</span>}
                  {!selected.safe && <span style={{ fontSize:10, background:"rgba(220,38,38,0.15)", color:"#fca5a5", border:"1px solid rgba(220,38,38,0.3)", padding:"2px 8px", borderRadius:20 }}>⚠️ Theft Reports</span>}
                </div>
                {selected.hosAlert && (
                  <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.25)", borderRadius:8, padding:"8px 10px", marginBottom:10, fontSize:11, color:"#fca5a5", lineHeight:1.5 }}>
                    {selected.hosAlert}
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
                  {[
                    { e:"🚿", l:"Showers", v:selected.showers },
                    { e:"🍔", l:"Food",    v:selected.food },
                    { e:"📶", l:"WiFi",    v:selected.wifi },
                    { e:"⚖️", l:"Scales",  v:selected.scales },
                    { e:"🛏️", l:"Beds",   v:selected.beds },
                    { e:"⛽", l:"Fuel",    v:selected.type==="truck_stop" },
                  ].map(a=>(
                    <div key={a.l} style={{ display:"flex", alignItems:"center", gap:4, opacity:a.v?1:0.3 }}>
                      <span style={{ fontSize:11 }}>{a.e}</span>
                      <span style={{ fontSize:10, color:a.v?"#e2e8f0":"#475569" }}>{a.l}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{}} style={{ width:"100%", background:selected.overnight&&selected.safe?GREEN:ORANGE, color:"white", border:"none", borderRadius:8, padding:"10px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                  🧭 Navigate Here
                </button>
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div style={{ background:"#0a1628", borderTop:"1px solid #1a2e50", padding:"12px 16px", height:200, display:"flex", flexDirection:"column" }}>
            <div style={{ fontSize:11, fontWeight:700, color:AMBER, marginBottom:8 }}>🤖 AI Parking Navigator — HOS-Aware</div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:6, marginBottom:8 }}>
              {chatMessages.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"85%", background:m.role==="user"?NAVY:"#0f1f3d", border:m.role==="ai"?`1px solid ${AMBER}33`:"none", color:"#e2e8f0", borderRadius:8, padding:"7px 12px", fontSize:12, lineHeight:1.5 }}>
                    {m.role==="ai"&&<span style={{ color:AMBER, fontWeight:700 }}>Navigator: </span>}
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} style={{ display:"flex", gap:8 }}>
              <input className="pk-chat-input" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about overnight safety, big rig spots, HOS timing..." />
              <button type="submit" style={{ background:AMBER, color:DARK, border:"none", borderRadius:8, padding:"9px 16px", fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:13 }}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
