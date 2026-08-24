import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

const TYPE_COLORS = {
  receiver:{ bg:"rgba(59,130,246,0.15)", color:"#93C5FD", label:"Receiver" },
  shipper: { bg:"rgba(22,163,74,0.12)",  color:"#86EFAC", label:"Shipper" },
  vendor:  { bg:"rgba(255,180,0,0.12)",  color:"#FFB400",  label:"Vendor" },
};

const DEMO_LOCATIONS = [
  { id:"d1", place_name:"Apex Logistics - Memphis DC",         place_type:"receiver", city_state:"Memphis, TN",          dock_number:"Door 14-B",    gate_code:"5521",   avg_wait_min:47,  free_time_min:120, detention_rate:50, open_time:"06:00", close_time:"22:00", contact_name:"Mike Torres",     contact_phone:"901-555-0142", notes:"Call Mike 30 min out. Gate B only for Class A. Tight turn — pull past and back in.", visits:8,  last_visit:"Jul 9",  rating:4 },
  { id:"d2", place_name:"Bluegrass Logistics - St. Louis",     place_type:"shipper",  city_state:"St. Louis, MO",        dock_number:"Dock 3",       gate_code:"",       avg_wait_min:22,  free_time_min:90,  detention_rate:55, open_time:"05:30", close_time:"18:00", contact_name:"Sarah Chen",      contact_phone:"314-555-0881", notes:"Early morning preferred. Paperwork ready at window 1. Usually fast — under an hour.", visits:5, last_visit:"Jul 2",  rating:5 },
  { id:"d3", place_name:"Walmart DC #7042 - OKC",              place_type:"receiver", city_state:"Oklahoma City, OK",    dock_number:"Appt. only",   gate_code:"9914",   avg_wait_min:180, free_time_min:60,  detention_rate:50, open_time:"00:00", close_time:"23:59", contact_name:"Guard desk",      contact_phone:"405-555-0220", notes:"SLOW. Avg 3 hrs. Free time only 1hr. Start detention clock on arrival. Print all paperwork.", visits:3, last_visit:"Jun 28", rating:2 },
  { id:"d4", place_name:"Dollar General - Goodlettsville DC",  place_type:"receiver", city_state:"Goodlettsville, TN",  dock_number:"Gate 4",       gate_code:"",       avg_wait_min:95,  free_time_min:120, detention_rate:50, open_time:"06:00", close_time:"20:00", contact_name:"Receiving office",contact_phone:"615-555-0399", notes:"Guard shack first. Dock assignment 20-40 min. Lumper cash $150-200. Good cell signal.", visits:4, last_visit:"Jul 12", rating:3 },
];

function StarRating({ rating }) {
  return <span style={{ color:AMBER }}>{[1,2,3,4,5].map(n=><span key={n}>{n<=rating?"★":"☆"}</span>)}</span>;
}

export default function LocationMemoryPage() {
  const [locations, setLocations]   = useState(DEMO_LOCATIONS);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected]     = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [chatInput, setChatInput]   = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role:"ai", text:"I'm your Location Intelligence — Dispatch Darryl's memory for every dock, gate code, and detention clock you've ever hit. Ask me about any shipper or receiver you've visited, or I can pull the notes from your last trip." }
  ]);
  const [saving, setSaving]         = useState(false);
  const chatEnd = useRef(null);

  const [form, setForm] = useState({
    place_name:"", place_type:"receiver", city_state:"", dock_number:"",
    gate_code:"", avg_wait_min:0, free_time_min:120, detention_rate:50,
    open_time:"", close_time:"", contact_name:"", contact_phone:"", notes:"", rating:3,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    pb.collection("location_memory").getList(1, 100, { sort:"-visits", signal:ctrl.signal })
      .then(r => { if (r.items.length > 0) setLocations(r.items); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chatHistory]);

  const filtered = locations.filter(l => {
    if (typeFilter !== "All" && l.place_type !== typeFilter) return false;
    if (search && !l.place_name.toLowerCase().includes(search.toLowerCase()) && !l.city_state?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function sendChat(e) {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatHistory(h => [...h, { role:"user", text:q }]);
    setChatInput("");
    setTimeout(() => {
      const ql = q.toLowerCase();
      let r;
      const match = locations.find(l => l.place_name.toLowerCase().includes(ql.split(" ")[0]) || l.city_state?.toLowerCase().includes(ql));
      if (match) {
        r = `Here's what I know about ${match.place_name}:\n\n📍 ${match.city_state} · ${match.place_type}\n🚪 Dock: ${match.dock_number || "N/A"} · Gate code: ${match.gate_code || "none on file"}\n⏱️ Avg wait: ${match.avg_wait_min} min · Free time: ${match.free_time_min} min\n💰 Detention rate: $${match.detention_rate}/hr after free time\n📞 ${match.contact_name} — ${match.contact_phone}\n\n📝 "${match.notes}"\n\nYou've been here ${match.visits} time${match.visits!==1?"s":""} — last visit ${match.last_visit}.`;
      } else if (ql.includes("detention") || ql.includes("worst") || ql.includes("slow")) {
        const worst = [...locations].sort((a,b) => (b.avg_wait_min||0)-(a.avg_wait_min||0))[0];
        r = `Slowest location you've visited: ${worst.place_name} in ${worst.city_state}. Average wait ${worst.avg_wait_min} minutes with only ${worst.free_time_min} minutes free time. Detention starts at $${worst.detention_rate}/hr. ${worst.notes}`;
      } else if (ql.includes("fast") || ql.includes("quick") || ql.includes("best")) {
        const best = [...locations].sort((a,b) => (a.avg_wait_min||999)-(b.avg_wait_min||999))[0];
        r = `Fastest location: ${best.place_name} in ${best.city_state} — avg wait only ${best.avg_wait_min} minutes. ${best.notes}`;
      } else if (ql.includes("gate") || ql.includes("code")) {
        const withCodes = locations.filter(l => l.gate_code);
        r = withCodes.length > 0
          ? "Gate codes on file:\n" + withCodes.map(l => `${l.place_name}: ${l.gate_code}`).join("\n")
          : "No gate codes saved yet. Add them when you visit a location — tap any card to edit.";
      } else {
        r = `I have ${locations.length} locations in memory. Ask me about any of them by name or city, or ask for "slowest", "fastest", or "gate codes". You can also add a new location with the + button.`;
      }
      setChatHistory(h => [...h, { role:"ai", text:r }]);
    }, 700);
  }

  async function saveLocation(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const rec = await pb.collection("location_memory").create({ ...form, visits:1, last_visit:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}) });
      setLocations(l => [rec, ...l]);
      setAddOpen(false);
      setForm({ place_name:"", place_type:"receiver", city_state:"", dock_number:"", gate_code:"", avg_wait_min:0, free_time_min:120, detention_rate:50, open_time:"", close_time:"", contact_name:"", contact_phone:"", notes:"", rating:3 });
    } catch { /* optimistic: add to local state anyway */
      setLocations(l => [{ id:"local_"+Date.now(), ...form, visits:1, last_visit:"Today" }, ...l]);
      setAddOpen(false);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#F0F4FA", minHeight:"100vh", color:"#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:2px}
        .lm-card{background:white;border-radius:14px;border:1px solid #E2E8F0;padding:18px;cursor:pointer;transition:all 0.15s}
        .lm-card:hover,.lm-card.sel{border-color:${NAVY};box-shadow:0 4px 16px rgba(11,42,107,0.1)}
        .lm-filter{border:1px solid #E2E8F0;background:white;border-radius:20px;padding:7px 16px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;color:#64748B;transition:all 0.15s}
        .lm-filter.active{background:${NAVY};color:white;border-color:${NAVY}}
        .lm-input{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;font-family:'Poppins',sans-serif;color:#0F172A;width:100%;outline:none}
        .lm-input:focus{border-color:${NAVY}}
        .lm-chat-input{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;font-size:13px;font-family:'Poppins',sans-serif;color:#0F172A;outline:none;flex:1}
        .lm-chat-input:focus{border-color:${AMBER}}
        @media(max-width:900px){.lm-layout{flex-direction:column!important}.lm-right{width:100%!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ background:NAVY2, padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:30, borderRadius:7 }} /></a>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)" }} />
          <span style={{ fontWeight:800, fontSize:14, color:"white" }}>📍 Location Intelligence</span>
        </div>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <a href="/dispatch" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>💬 Dispatch</a>
          <a href="/detention" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>⏳ Detention</a>
          <a href="/#pricing" style={{ background:AMBER, color:DARK, padding:"6px 14px", borderRadius:7, fontWeight:800, fontSize:12, textDecoration:"none" }}>Free Trial</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 5% 60px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:"clamp(1.4rem,2.5vw,1.9rem)", fontWeight:900, color:NAVY, marginBottom:4 }}>Location Intelligence</h1>
            <p style={{ color:"#64748B", fontSize:13 }}>Every dock, gate code, wait time, and detention clock you've encountered — remembered.</p>
          </div>
          <button onClick={()=>setAddOpen(true)} style={{ background:NAVY, color:"white", border:"none", borderRadius:10, padding:"11px 20px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
            + Add Location
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
          {[
            { l:"Locations Saved",   v:locations.length,                                                          c:NAVY  },
            { l:"Avg Wait Time",     v:Math.round(locations.reduce((s,l)=>s+(l.avg_wait_min||0),0)/locations.length||0)+"m", c:ORANGE},
            { l:"Detention Risk",    v:locations.filter(l=>(l.avg_wait_min||0)>90).length+" high",                c:RED   },
            { l:"Fast Facilities",   v:locations.filter(l=>(l.avg_wait_min||0)<30).length+" <30m",               c:GREEN },
          ].map(s=>(
            <div key={s.l} style={{ background:"white", borderRadius:12, border:"1px solid #E2E8F0", padding:"14px 16px" }}>
              <div style={{ fontWeight:900, fontSize:20, color:s.c, fontFamily:"'DM Mono',monospace" }}>{s.v}</div>
              <div style={{ color:"#94A3B8", fontSize:11, fontWeight:600, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="lm-layout" style={{ display:"flex", gap:20 }}>
          {/* LEFT — list */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* Search + filters */}
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              <input className="lm-input" placeholder="Search by name or city…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:260 }} />
              {["All","receiver","shipper","vendor"].map(t=>(
                <button key={t} className={`lm-filter${typeFilter===t?" active":""}`} onClick={()=>setTypeFilter(t)}>
                  {t==="All"?"All":TYPE_COLORS[t]?.label||t}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:40, textAlign:"center", color:"#94A3B8" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📍</div>
                <div style={{ fontWeight:600 }}>No locations found.</div>
                <div style={{ fontSize:12, marginTop:6 }}>Add your first location or adjust your filters.</div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map(l => {
                const tc = TYPE_COLORS[l.place_type] || TYPE_COLORS.vendor;
                const isSel = selected?.id === l.id;
                return (
                  <div key={l.id} className={`lm-card${isSel?" sel":""}`} onClick={()=>setSelected(isSel?null:l)}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                          <span style={{ background:tc.bg, color:tc.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{tc.label}</span>
                          <span style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{l.place_name}</span>
                          {l.avg_wait_min >= 120 && <span style={{ background:`${RED}10`, color:RED, fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:10 }}>⚠️ HIGH DETENTION RISK</span>}
                        </div>
                        <div style={{ color:"#64748B", fontSize:12 }}>📍 {l.city_state}{l.dock_number?` · 🚪 ${l.dock_number}`:""}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontWeight:900, fontSize:18, color:(l.avg_wait_min||0)<45?GREEN:(l.avg_wait_min||0)<90?AMBER:RED, fontFamily:"'DM Mono',monospace" }}>{l.avg_wait_min||"—"}m</div>
                        <div style={{ fontSize:9, color:"#94A3B8" }}>avg wait</div>
                        <div style={{ marginTop:4 }}><StarRating rating={l.rating||3} /></div>
                      </div>
                    </div>

                    {isSel && (
                      <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #F1F5F9" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                          {[
                            {l:"Free Time",       v:`${l.free_time_min||"—"} min`},
                            {l:"Detention Rate",  v:`$${l.detention_rate||50}/hr`},
                            {l:"Hours",           v:`${l.open_time||"—"} – ${l.close_time||"—"}`},
                            {l:"Contact",         v:l.contact_name||"—"},
                            {l:"Gate Code",       v:l.gate_code||"None on file"},
                            {l:"Phone",           v:l.contact_phone||"—"},
                          ].map(row=>(
                            <div key={row.l} style={{ borderBottom:"1px solid #F8FAFC", paddingBottom:6 }}>
                              <div style={{ color:"#94A3B8", fontSize:10, fontWeight:700 }}>{row.l}</div>
                              <div style={{ fontWeight:600, fontSize:12, color:"#0F172A", marginTop:2 }}>{row.v}</div>
                            </div>
                          ))}
                        </div>
                        {l.notes && (
                          <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#475569", lineHeight:1.6, borderLeft:`3px solid ${AMBER}` }}>
                            💬 {l.notes}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:8, marginTop:12 }}>
                          <a href="/detention" style={{ background:RED, color:"white", padding:"8px 14px", borderRadius:8, fontWeight:700, fontSize:12, textDecoration:"none" }}>⏱️ Start Detention</a>
                          <a href="/dispatch" style={{ background:"#F1F5F9", color:NAVY, padding:"8px 14px", borderRadius:8, fontWeight:600, fontSize:12, textDecoration:"none" }}>📡 Alert Dispatch</a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — AI chat */}
          <div className="lm-right" style={{ width:320, flexShrink:0 }}>
            <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden", position:"sticky", top:70 }}>
              <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVY2})`, padding:"14px 18px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>📡</span>
                <div>
                  <div style={{ color:"white", fontWeight:800, fontSize:13 }}>Dispatch Darryl — Location Memory</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10 }}>Ask about any shipper, receiver, or dock</div>
                </div>
              </div>
              <div style={{ padding:"14px 16px", minHeight:280, maxHeight:380, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
                {chatHistory.map((m,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"90%", background:m.role==="user"?NAVY:"#F8FAFC", border:m.role==="ai"?"1px solid #E2E8F0":"none", color:m.role==="user"?"white":"#0F172A", borderRadius:10, padding:"8px 12px", fontSize:12, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                      {m.role==="ai"&&<span style={{ color:ORANGE, fontWeight:700, display:"block", marginBottom:3 }}>Darryl: </span>}
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>
              <div style={{ borderTop:"1px solid #E2E8F0", padding:"10px 14px", display:"flex", flexWrap:"wrap", gap:6, borderBottom:"1px solid #E2E8F0" }}>
                {["Slowest dock","Gate codes","Memphis locations","Best rating"].map(p=>(
                  <button key={p} onClick={()=>{setChatInput(p);setTimeout(()=>sendChat(),10);}} style={{ background:"#F1F5F9", color:NAVY, border:"1px solid #E2E8F0", borderRadius:20, padding:"4px 10px", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>{p}</button>
                ))}
              </div>
              <form onSubmit={sendChat} style={{ display:"flex", gap:8, padding:"10px 14px 14px" }}>
                <input className="lm-chat-input" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about any location…" />
                <button type="submit" style={{ background:AMBER, color:DARK, border:"none", borderRadius:8, padding:"9px 14px", fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:12 }}>Ask</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ADD LOCATION MODAL */}
      {addOpen && (
        <div onClick={()=>setAddOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"5%", overflowY:"auto" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:"28px", maxWidth:560, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:17, color:NAVY }}>Add Location to Memory</div>
              <button onClick={()=>setAddOpen(false)} style={{ background:"#F1F5F9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <form onSubmit={saveLocation} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>PLACE NAME *</label>
                <input className="lm-input" placeholder="e.g. Walmart DC #7042 - OKC" value={form.place_name} onChange={e=>setForm({...form,place_name:e.target.value})} required />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>TYPE</label>
                <select className="lm-input" value={form.place_type} onChange={e=>setForm({...form,place_type:e.target.value})} style={{ cursor:"pointer" }}>
                  <option value="receiver">Receiver</option>
                  <option value="shipper">Shipper</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>CITY, STATE</label>
                <input className="lm-input" placeholder="Memphis, TN" value={form.city_state} onChange={e=>setForm({...form,city_state:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>DOCK / DOOR #</label>
                <input className="lm-input" placeholder="Door 14-B" value={form.dock_number} onChange={e=>setForm({...form,dock_number:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>GATE CODE</label>
                <input className="lm-input" placeholder="5521" value={form.gate_code} onChange={e=>setForm({...form,gate_code:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>AVG WAIT TIME (min)</label>
                <input className="lm-input" type="number" value={form.avg_wait_min} onChange={e=>setForm({...form,avg_wait_min:parseInt(e.target.value)||0})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>FREE TIME (min)</label>
                <input className="lm-input" type="number" value={form.free_time_min} onChange={e=>setForm({...form,free_time_min:parseInt(e.target.value)||0})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>DETENTION RATE ($/hr)</label>
                <input className="lm-input" type="number" value={form.detention_rate} onChange={e=>setForm({...form,detention_rate:parseInt(e.target.value)||50})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>CONTACT NAME</label>
                <input className="lm-input" placeholder="Mike Torres" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>CONTACT PHONE</label>
                <input className="lm-input" placeholder="901-555-0142" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>OPEN TIME</label>
                <input className="lm-input" type="time" value={form.open_time} onChange={e=>setForm({...form,open_time:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>CLOSE TIME</label>
                <input className="lm-input" type="time" value={form.close_time} onChange={e=>setForm({...form,close_time:e.target.value})} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>NOTES (dock tips, quirks, what to watch out for)</label>
                <textarea className="lm-input" rows={3} placeholder="Call ahead 30 min. Gate B only. Tight turn — pull past and back in." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{ resize:"vertical" }} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ color:"#64748B", fontSize:11, fontWeight:700, display:"block", marginBottom:8 }}>OVERALL RATING</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[1,2,3,4,5].map(n=>(
                    <button type="button" key={n} onClick={()=>setForm({...form,rating:n})} style={{ background:n<=form.rating?AMBER:"#F1F5F9", border:"none", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:18 }}>★</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn:"1/-1", display:"flex", gap:10 }}>
                <button type="button" onClick={()=>setAddOpen(false)} style={{ flex:1, background:"#F1F5F9", color:"#475569", border:"none", borderRadius:10, padding:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex:2, background:NAVY, color:"white", border:"none", borderRadius:10, padding:"12px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif", opacity:saving?0.7:1 }}>
                  {saving?"Saving…":"Save to Memory →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
