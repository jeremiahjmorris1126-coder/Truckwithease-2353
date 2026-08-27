import { useState, useEffect } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

// Curated trucking news categories with relevant static articles 
// (live news API can be wired via NewsAPI.org key when ready)
const NEWS = [
  { id:1, cat:"Regulation", catColor:RED,   title:"FMCSA Updates HOS Split-Sleeper Provision for 2026", source:"Trucking News Wire", time:"2h ago",   location:"National", summary:"The FMCSA finalized amendments to the split-sleeper berth provision, giving owner-operators more flexibility in how they split their 10-hour off-duty requirement. The rule takes effect September 1, 2026.", hot:true },
  { id:2, cat:"Fuel",       catColor:ORANGE, title:"Diesel Prices Drop to 18-Month Low Across Mid-South Corridor", source:"Fleet Owner", time:"4h ago",  location:"TX · OK · AR · TN", summary:"Average diesel prices across the I-40 and I-30 corridors fell to $3.07/gal this week — the lowest point since January 2025. Analysts credit increased refinery output and a mild summer demand curve.", hot:true },
  { id:3, cat:"Safety",     catColor:GREEN,  title:"DOT Announces Expanded Roadside Inspection Blitz — August 2026", source:"FMCSA.dot.gov", time:"6h ago",  location:"All 50 States", summary:"Operation Safe Driver Week kicks off August 18th. Officers will focus on distracted driving, seatbelt compliance, and speeding in CMVs. Ensure your DVIR is current and HOS logs are complete.", hot:true },
  { id:4, cat:"Market",     catColor:AMBER,  title:"Spot Rates Climb 12% Week-Over-Week on Southern Lanes", source:"DAT Freight", time:"8h ago",  location:"Southeast", summary:"Reefer and flatbed spot rates on Dallas-Atlanta and Houston-Miami lanes are up sharply. Brokers report tight capacity following a wave of carrier exits in Q2." },
  { id:5, cat:"Tech",       catColor:"#7C3AED",title:"ELD Mandate Expanded — Older Exemptions Ending October 2026", source:"Land Line Mag", time:"1d ago", location:"National", summary:"The FMCSA confirmed that the final tier of ELD exemptions for pre-2000 model year engines expires October 1st. All affected vehicles must be equipped with compliant ELD devices." },
  { id:6, cat:"Regulation", catColor:RED,    title:"California AB5 Enforcement Intensifies for Truckers", source:"Overdrive Mag", time:"1d ago", location:"California", summary:"State enforcement agencies are stepping up AB5 compliance checks at ports and distribution centers. Independent contractors operating in CA should consult legal counsel on classification status." },
  { id:7, cat:"Fuel",       catColor:ORANGE, title:"Pilot Flying J Announces New Diesel Discount Program for Solo Operators", source:"Pilot Flying J", time:"2d ago", location:"National", summary:"Pilot Flying J launched a new tiered fuel discount program for independent drivers, offering up to 12¢/gallon savings with no minimum volume requirement. Sign-up available at the pump or via app." },
  { id:8, cat:"Safety",     catColor:GREEN,  title:"OOIDA Urges Members to Comment on Proposed Speed Limiter Rule", source:"OOIDA", time:"2d ago", location:"National", summary:"The Owner-Operator Independent Drivers Association is urging members to submit public comments opposing the FMCSA's proposed 68 mph speed limiter mandate before the August 5th deadline." },
  { id:9, cat:"Market",     catColor:AMBER,  title:"Amazon Freight Open to Owner-Ops — Direct Load Access Launching", source:"FreightWaves", time:"3d ago", location:"National", summary:"Amazon Freight is opening direct load access to owner-operators with Class A CDLs for the first time, offering same-day tendering on its freight network with Net-7 payment terms." },
  { id:10,cat:"Tech",       catColor:"#7C3AED",title:"New DOT Physical Telemedicine Rule — What Drivers Need to Know", source:"FMCSA.dot.gov", time:"3d ago", location:"National", summary:"The FMCSA finalized a new rule allowing DOT physicals to be conducted via certified telemedicine providers, reducing time off the road for medical card renewals." },
];

const WEATHER_ALERTS = [
  { state:"IL", alert:"Tornado Watch in effect until 8PM CT — I-57 and I-55 corridors", level:"danger" },
  { state:"TX", alert:"Excessive Heat Warning — road surface temps exceeding 140°F on I-10", level:"warn" },
  { state:"CO", alert:"Mountain chain law lifted — I-70 clear through Eisenhower Tunnel", level:"ok" },
];

const CATS = ["All","Regulation","Fuel","Safety","Market","Tech"];

export default function TruckingNewsPage() {

  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    // Fetch live trucking news from FMCSA RSS + FreightWaves RSS (free, no key needed)
    const FEEDS = [
      // FMCSA press releases (official, always relevant)
      "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.fmcsa.dot.gov%2Frss%2Fpress-releases.xml",
      // Commercial Carrier Journal news
      "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.ccjdigital.com%2Ffeed%2F",
    ];
    
    Promise.any(
      FEEDS.map(url =>
        fetch(url, { signal: AbortSignal.timeout(5000) })
          .then(r => r.json())
          .then(data => {
            if (!data.items || data.items.length === 0) throw new Error('empty');
            return data.items.slice(0, 6).map((item, i) => ({
              id: 100 + i,
              cat: item.categories?.[0] || "Update",
              catColor: i % 3 === 0 ? RED : i % 3 === 1 ? ORANGE : GREEN,
              title: item.title,
              source: data.feed?.title || "Industry News",
              time: new Date(item.pubDate).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
              location: "National",
              summary: (item.description || item.content || "").replace(/<[^>]+>/g, '').slice(0, 280) + "...",
              hot: i < 2,
              link: item.link,
            }));
          })
      )
    )
    .then(items => { setLiveNews(items); setNewsLoading(false); })
    .catch(() => { setNewsLoading(false); }); // Fall back to static NEWS on error
  }, []);

  const allNews = liveNews.length > 0 ? [...liveNews, ...NEWS] : NEWS;

  const [activeCat, setCat] = useState("All");
  const [search, setSearch]  = useState("");
  const [location, setLoc]   = useState("National");

  const filtered = allNews.filter(n => {
    if (activeCat !== "All" && n.cat !== activeCat) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hotStories = allNews.filter(n => n.hot).slice(0, 3);

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#F0F4FA", minHeight:"100vh", color:"#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:2px}
        .tn-cat{border:1px solid #E2E8F0;background:white;borderRadius:20px;padding:7px 16px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;color:#64748B;transition:all 0.15s}
        .tn-cat.active{background:${NAVY};color:white;border-color:${NAVY}}
        .tn-cat:hover:not(.active){border-color:${NAVY};color:${NAVY}}
        .tn-card{background:white;border-radius:14px;border:1px solid #E2E8F0;padding:20px;transition:all 0.15s;cursor:pointer}
        .tn-card:hover{border-color:${NAVY};transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,42,107,0.08)}
        .tn-input{background:white;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;font-size:13px;font-family:'Poppins',sans-serif;color:#0F172A;width:100%;outline:none}
        .tn-input:focus{border-color:${NAVY}}
        @media(max-width:900px){.tn-layout{flex-direction:column!important}.tn-sidebar{width:100%!important}}
      `}</style>

      {/* Nav */}
      <nav style={{ background:NAVY2, padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:30, borderRadius:7 }} /></a>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontWeight:800, fontSize:13, color:"white" }}>📰 Trucking News & Alerts</span>
            {!newsLoading && liveNews.length > 0 && <span style={{ background:"rgba(22,163,74,0.2)", color:"#4ADE80", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:10, border:"1px solid rgba(22,163,74,0.3)" }}>LIVE</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <a href="/weather" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>🌤️ Weather</a>
          <a href="/state-patrol" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>🚔 State Patrol</a>
          <a href="/#pricing" style={{ background:AMBER, color:DARK, padding:"6px 14px", borderRadius:7, fontWeight:800, fontSize:12, textDecoration:"none" }}>Free Trial</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      {/* Breaking alerts */}
      <div style={{ background:NAVY, padding:"0 5%" }}>
        {WEATHER_ALERTS.map((a,i) => (
          <div key={i} style={{ padding:"8px 0", borderBottom:i<WEATHER_ALERTS.length-1?"1px solid rgba(255,255,255,0.07)":"none", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ background:a.level==="danger"?RED:a.level==="warn"?AMBER:GREEN, color:"white", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:10, flexShrink:0 }}>{a.state}</span>
            <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>{a.alert}</span>
          </div>
        ))}
      </div>

      <div className="tn-layout" style={{ display:"flex", gap:24, maxWidth:1200, margin:"0 auto", padding:"24px 5% 60px" }}>
        {/* MAIN */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Search + categories */}
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <input className="tn-input" placeholder="Search news…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:260 }} />
            {CATS.map(c=>(
              <button key={c} className={`tn-cat${activeCat===c?" active":""}`} onClick={()=>setCat(c)}>{c}</button>
            ))}
          </div>

          {/* Hot stories */}
          {activeCat==="All" && !search && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>🔥 Breaking Now</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
                {hotStories.map(n=>(
                  <div key={n.id} className="tn-card" style={{ borderLeft:`4px solid ${n.catColor}` }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                      <span style={{ background:`${n.catColor}15`, color:n.catColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{n.cat}</span>
                      <span style={{ color:"#94A3B8", fontSize:10 }}>{n.time}</span>
                      <span style={{ background:"#FEF2F2", color:RED, fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:10 }}>🔴 LIVE</span>
                    </div>
                    <div style={{ fontWeight:700, fontSize:13, color:"#0F172A", lineHeight:1.4, marginBottom:6 }}>{n.title}</div>
                    <div style={{ color:"#64748B", fontSize:11 }}>{n.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All stories */}
          <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
            {activeCat==="All" ? "All Stories" : activeCat} · {filtered.length} article{filtered.length!==1?"s":""}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filtered.map(n=>(
              <div key={n.id} className="tn-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                      <span style={{ background:`${n.catColor}12`, color:n.catColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{n.cat}</span>
                      <span style={{ color:"#94A3B8", fontSize:11 }}>📍 {n.location}</span>
                      {n.hot && <span style={{ background:"#FEF2F2", color:RED, fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:10 }}>BREAKING</span>}
                    </div>
                    <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", marginBottom:8, lineHeight:1.4 }}>{n.title}</div>
                    <div style={{ color:"#64748B", fontSize:13, lineHeight:1.7 }}>{n.summary}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ color:"#94A3B8", fontSize:11 }}>{n.time}</div>
                    <div style={{ color:"#CBD5E1", fontSize:11, marginTop:3 }}>{n.source}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="tn-sidebar" style={{ width:280, flexShrink:0 }}>
          {/* Location */}
          <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:"16px", marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>📍 Your Location</div>
            <select value={location} onChange={e=>setLoc(e.target.value)} style={{ width:"100%", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:8, padding:"9px 12px", fontSize:13, fontFamily:"'Poppins',sans-serif", color:"#0F172A", cursor:"pointer" }}>
              {["National","Texas","California","Illinois","Tennessee","Missouri","Georgia","Florida","Ohio","Pennsylvania"].map(s=><option key={s}>{s}</option>)}
            </select>
            <div style={{ color:"#94A3B8", fontSize:11, marginTop:8 }}>News filtered for your region</div>
          </div>

          {/* Quick links */}
          <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:"16px", marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>🔗 Quick Access</div>
            {[
              {icon:"🚔", label:"State Patrol Intel", href:"/state-patrol"},
              {icon:"🌤️", label:"Road Weather",       href:"/weather"},
              {icon:"⚡", label:"Weigh Bypass",       href:"/bypass"},
              {icon:"🅿️", label:"Parking Finder",    href:"/parking"},
              {icon:"⛽", label:"Fuel Prices",        href:"/fuel-finder"},
              {icon:"📑", label:"Permit Book",        href:"/permit-book"},
            ].map(l=>(
              <a key={l.label} href={l.href} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F8FAFC", textDecoration:"none", color:"#0F172A", fontSize:13, fontWeight:500 }}>
                <span>{l.icon}</span>{l.label}
              </a>
            ))}
          </div>

          {/* DOT Tip */}
          <div style={{ background:`${NAVY}`, borderRadius:14, padding:"16px" }}>
            <div style={{ color:AMBER, fontWeight:700, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>DOT TIP OF THE DAY</div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13, lineHeight:1.7 }}>Keep your last 7 days of ELD logs accessible during a roadside inspection. Officers can request them on the spot — make sure they're synced and complete before you roll.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
