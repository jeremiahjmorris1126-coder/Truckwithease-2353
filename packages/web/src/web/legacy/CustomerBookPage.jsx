import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const NAVY = "#0a1628";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";
const RED = "#dc2626";
const BLUE = "#0ea5e9";
const TEAL = "#06b6d4";
const CARD = "#111f35";
const BORDER = "#1e3a5f";
const DIM = "#4a6070";

// ── SEED DATA (shows until real data is added) ─────────────────────────────
const SEED_CUSTOMERS = [
  { id:"c1", company_name:"Amazon Freight", contact_name:"Mark Stevens", contact_phone:"314-555-0101", contact_email:"mstevens@amazon.com", city:"St. Louis", state:"MO", customer_type:"Shipper", rating:4.2, total_loads:142, total_revenue:387400, avg_rate_per_mile:4.80, on_time_pct:94, detention_avg_hrs:1.2, status:"Active" },
  { id:"c2", company_name:"Walmart Distribution", contact_name:"Lisa Park", contact_phone:"479-555-0202", contact_email:"lpark@walmart.com", city:"Bentonville", state:"AR", customer_type:"Shipper", rating:3.8, total_loads:87, total_revenue:198600, avg_rate_per_mile:4.10, on_time_pct:88, detention_avg_hrs:2.8, status:"Active" },
  { id:"c3", company_name:"Home Depot Supply", contact_name:"Derek Brown", contact_phone:"770-555-0303", contact_email:"dbrown@homedepot.com", city:"Atlanta", state:"GA", customer_type:"Receiver", rating:4.7, total_loads:63, total_revenue:156800, avg_rate_per_mile:5.20, on_time_pct:97, detention_avg_hrs:0.6, status:"Active" },
  { id:"c4", company_name:"Target Corp", contact_name:"Susan Lee", contact_phone:"612-555-0404", contact_email:"slee@target.com", city:"Minneapolis", state:"MN", customer_type:"Shipper", rating:2.9, total_loads:34, total_revenue:72300, avg_rate_per_mile:3.80, on_time_pct:79, detention_avg_hrs:4.1, status:"Watch" },
  { id:"c5", company_name:"FedEx Freight", contact_name:"James Wilson", contact_phone:"901-555-0505", contact_email:"jwilson@fedex.com", city:"Memphis", state:"TN", customer_type:"Broker", rating:4.5, total_loads:211, total_revenue:512000, avg_rate_per_mile:5.60, on_time_pct:96, detention_avg_hrs:0.8, status:"Active" },
  { id:"c6", company_name:"DAT Load Board", contact_name:"Amy Chen", contact_phone:"503-555-0606", contact_email:"achen@dat.com", city:"Portland", state:"OR", customer_type:"Broker", rating:4.0, total_loads:58, total_revenue:134200, avg_rate_per_mile:4.40, on_time_pct:91, detention_avg_hrs:1.5, status:"Active" },
];

const SEED_LOADS = {
  c1: [
    { id:"l1", load_number:"AMZ-84921", driver_name:"Ray Davis", truck_unit:"TRK-441", trailer_unit:"TRL-081", origin:"Dallas, TX", destination:"Memphis, TN", pickup_date:"2026-08-04", delivery_date:"2026-08-05", miles:471, rate:2840, rate_per_mile:6.03, detention_hrs:0.5, detention_pay:75, status:"In Transit", commodity:"Reefer", weight_lbs:43200 },
    { id:"l2", load_number:"AMZ-84756", driver_name:"Sarah Chen", truck_unit:"TRK-774", trailer_unit:"TRL-042", origin:"Chicago, IL", destination:"Detroit, MI", pickup_date:"2026-08-03", delivery_date:"2026-08-03", miles:283, rate:1750, rate_per_mile:6.18, detention_hrs:0, detention_pay:0, status:"Delivered", commodity:"Dry Van", weight_lbs:36000 },
    { id:"l3", load_number:"AMZ-84612", driver_name:"Tony Williams", truck_unit:"TRK-317", trailer_unit:"TRL-019", origin:"KC, MO", destination:"Chicago, IL", pickup_date:"2026-08-02", delivery_date:"2026-08-03", miles:509, rate:3100, rate_per_mile:6.09, detention_hrs:1.2, detention_pay:180, status:"Delivered", commodity:"Flatbed", weight_lbs:41000 },
  ],
  c2: [
    { id:"l4", load_number:"WMT-22841", driver_name:"Marcus Lee", truck_unit:"TRK-335", trailer_unit:"TRL-055", origin:"Bentonville, AR", destination:"Houston, TX", pickup_date:"2026-08-04", delivery_date:"2026-08-05", miles:512, rate:2100, rate_per_mile:4.10, detention_hrs:3.2, detention_pay:480, status:"In Transit", commodity:"Dry Van", weight_lbs:38500 },
    { id:"l5", load_number:"WMT-22790", driver_name:"Andre Johnson", truck_unit:"TRK-509", trailer_unit:"TRL-033", origin:"Bentonville, AR", destination:"Atlanta, GA", pickup_date:"2026-08-01", delivery_date:"2026-08-02", miles:748, rate:2900, rate_per_mile:3.88, detention_hrs:2.5, detention_pay:375, status:"Delivered", commodity:"Dry Van", weight_lbs:40000 },
  ],
  c4: [
    { id:"l6", load_number:"TGT-11209", driver_name:"Derrick Brown", truck_unit:"TRK-102", trailer_unit:"TRL-077", origin:"Minneapolis, MN", destination:"Chicago, IL", pickup_date:"2026-07-30", delivery_date:"2026-07-31", miles:409, rate:1580, rate_per_mile:3.86, detention_hrs:5.0, detention_pay:750, status:"Delivered", commodity:"Dry Van", weight_lbs:29500 },
  ],
};

const SEED_REVIEWS = {
  c1: [
    { id:"r1", driver_name:"Ray Davis", rating:5, category:"Payment", review:"Amazon pays fast — always within 14 days. No detention games. Dock was organized, in and out in 45 min.", load_number:"AMZ-84756", detention_hrs:0.5, would_return:true },
    { id:"r2", driver_name:"Tony Williams", rating:4, category:"Facility", review:"Chicago dock was a little slow but staff was friendly. Good lighting, safe lot. Would take Amazon loads again.", load_number:"AMZ-84612", detention_hrs:1.2, would_return:true },
  ],
  c2: [
    { id:"r3", driver_name:"Marcus Lee", rating:2, category:"Detention", review:"Walmart Bentonville kept me 3+ hours over my appointment time with zero communication. No detention pay offered.", load_number:"WMT-22841", detention_hrs:3.2, would_return:false },
    { id:"r4", driver_name:"Andre Johnson", rating:3, category:"Facility", review:"Long lines but they do eventually move. Dock doors were tight — hard in a wide load. Pay was on time.", load_number:"WMT-22790", detention_hrs:2.5, would_return:true },
  ],
  c4: [
    { id:"r5", driver_name:"Derrick Brown", rating:1, category:"Detention", review:"5 hours detention and they refused to sign my detention form. Dispatcher was rude. Avoid Target Minneapolis.", load_number:"TGT-11209", detention_hrs:5.0, would_return:false },
  ],
  c5: [
    { id:"r6", driver_name:"Sarah Chen", rating:5, category:"Payment", review:"FedEx Freight is the gold standard. Paying $5.60/mile, always on time, dock staff is professional. Best broker on our board.", load_number:"FDX-99012", detention_hrs:0.8, would_return:true },
  ],
};

// ── HELPERS ────────────────────────────────────────────────────────────────
const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const fmt$ = (n) => n >= 1000 ? "$" + (n/1000).toFixed(0) + "K" : "$" + n;
const statusColor = { Active:GREEN, Watch:AMBER, Inactive:DIM };
const ratingColor = (r) => r >= 4.5 ? GREEN : r >= 3.5 ? AMBER : RED;

export default function CustomerBookPage() {
  const [view, setView]         = useState("book");   // book | detail | add-load | add-review | add-customer
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [customers, setCustomers]   = useState(SEED_CUSTOMERS);
  const [dbLoaded, setDbLoaded]     = useState(false);
  const [activeTab, setActiveTab]   = useState("overview"); // overview | loads | reviews
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  // Load form states
  const [newLoad, setNewLoad] = useState({ load_number:"", driver_name:"", truck_unit:"", trailer_unit:"", origin:"", destination:"", pickup_date:"", delivery_date:"", miles:"", rate:"", commodity:"", weight_lbs:"", status:"Available" });
  const [newReview, setNewReview] = useState({ driver_name:"", rating:5, category:"Detention", review:"", load_number:"", detention_hrs:"", would_return:true });
  const [newCustomer, setNewCustomer] = useState({ company_name:"", contact_name:"", contact_phone:"", contact_email:"", city:"", state:"", customer_type:"Shipper", notes:"" });

  const showToast = (msg, color=GREEN) => { setToast({msg, color}); setTimeout(()=>setToast(null), 3000); };

  // Try to load from storage
  useEffect(() => {
    const controller = new AbortController();
    pb.collection("fleet_customers").getList(1, 200, { sort: "-created", signal: controller.signal })
      .then(res => { if (res.items.length > 0) { setCustomers(res.items); setDbLoaded(true); } })
      .catch(e => { if (!e?.isAbort) console.warn("No live customers yet"); });
    return () => controller.abort();
  }, []);

  const saveCustomer = async () => {
    if (!newCustomer.company_name) return;
    setSaving(true);
    try {
      const rec = await pb.collection("fleet_customers").create({ ...newCustomer, rating: 0, total_loads: 0, total_revenue: 0, avg_rate_per_mile: 0, on_time_pct: 0, detention_avg_hrs: 0, status: "Active" });
      setCustomers(prev => [rec, ...prev]);
      showToast("Customer added to your book");
      setView("book");
      setNewCustomer({ company_name:"", contact_name:"", contact_phone:"", contact_email:"", city:"", state:"", customer_type:"Shipper", notes:"" });
    } catch(e) { console.error(e); showToast("Could not save — try again", RED); }
    setSaving(false);
  };

  const saveLoad = async () => {
    if (!newLoad.load_number) return;
    setSaving(true);
    try {
      await pb.collection("customer_loads").create({ ...newLoad, customer_id: selected?.id, customer_name: selected?.company_name, fleet_id: "fleet_001", miles: Number(newLoad.miles)||0, rate: Number(newLoad.rate)||0, rate_per_mile: newLoad.miles && newLoad.rate ? (Number(newLoad.rate)/Number(newLoad.miles)).toFixed(2) : 0, weight_lbs: Number(newLoad.weight_lbs)||0 });
      showToast("Load saved to customer record");
      setView("detail");
      setNewLoad({ load_number:"", driver_name:"", truck_unit:"", trailer_unit:"", origin:"", destination:"", pickup_date:"", delivery_date:"", miles:"", rate:"", commodity:"", weight_lbs:"", status:"Available" });
    } catch(e) { showToast("Could not save — try again", RED); }
    setSaving(false);
  };

  const saveReview = async () => {
    if (!newReview.review) return;
    setSaving(true);
    try {
      await pb.collection("customer_reviews").create({ ...newReview, customer_id: selected?.id, customer_name: selected?.company_name, fleet_id: "fleet_001", detention_hrs: Number(newReview.detention_hrs)||0 });
      showToast("Review saved");
      setView("detail");
      setNewReview({ driver_name:"", rating:5, category:"Detention", review:"", load_number:"", detention_hrs:"", would_return:true });
    } catch(e) { showToast("Could not save — try again", RED); }
    setSaving(false);
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.company_name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.state?.toLowerCase().includes(q) || c.contact_name?.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || c.customer_type === typeFilter;
    return matchSearch && matchType;
  });

  const selLoads = selected ? (SEED_LOADS[selected.id] || []) : [];
  const selReviews = selected ? (SEED_REVIEWS[selected.id] || []) : [];

  const inp = { background:"#0d1b2e", border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", color:"white", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };
  const label = { display:"block", color:DIM, fontSize:12, fontWeight:600, marginBottom:5, letterSpacing:1 };

  return (
    <div style={{ minHeight:"100vh", background:NAVY, color:"white", fontFamily:"system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && <div style={{ position:"fixed", top:20, right:20, background:toast.color, color:toast.color===GREEN?"#0a1628":"white", borderRadius:10, padding:"12px 20px", fontWeight:700, zIndex:999, fontSize:14 }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ background:"#0d1b2e", borderBottom:`2px solid ${AMBER}`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {view !== "book" && <button onClick={()=>setView("book")} style={{ background:"none", border:"none", color:AMBER, cursor:"pointer", fontSize:14 }}>← Back</button>}
          <div>
            <div style={{ fontWeight:900, fontSize:20, letterSpacing:-0.5 }}>📒 Customer Book</div>
            <div style={{ color:DIM, fontSize:12 }}>Fleet intelligence · All contacts · Full load & revenue history</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
            <div style={{ color:AMBER, fontWeight:800, fontSize:18 }}>{customers.length}</div>
            <div style={{ color:DIM, fontSize:10 }}>CUSTOMERS</div>
          </div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
            <div style={{ color:GREEN, fontWeight:800, fontSize:18 }}>{customers.filter(c=>c.status==="Active").length}</div>
            <div style={{ color:DIM, fontSize:10 }}>ACTIVE</div>
          </div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
            <div style={{ color:TEAL, fontWeight:800, fontSize:18 }}>${(customers.reduce((a,c)=>a+(c.total_revenue||0),0)/1000).toFixed(0)}K</div>
            <div style={{ color:DIM, fontSize:10 }}>TOTAL REV</div>
          </div>
          <button onClick={()=>setView("add-customer")} style={{ background:AMBER, color:NAVY, border:"none", borderRadius:8, padding:"10px 18px", fontWeight:800, fontSize:13, cursor:"pointer" }}>+ Add Customer</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* ── BOOK VIEW ── */}
        {view === "book" && (
          <>
            {/* Search & Filter */}
            <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by company, city, state, contact..." style={{ ...inp, flex:1, minWidth:200 }}/>
              {["All","Shipper","Receiver","Broker"].map(t=>(
                <button key={t} onClick={()=>setTypeFilter(t)} style={{ background:typeFilter===t?AMBER:"transparent", color:typeFilter===t?NAVY:DIM, border:`1px solid ${typeFilter===t?AMBER:BORDER}`, borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>{t}</button>
              ))}
            </div>

            {/* Customer Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14 }}>
              {filtered.map(c => (
                <div key={c.id} onClick={()=>{ setSelected(c); setView("detail"); setActiveTab("overview"); }}
                  style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:20, cursor:"pointer", borderLeft:`4px solid ${ratingColor(c.rating||0)}`, transition:"border-color 0.2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16 }}>{c.company_name}</div>
                      <div style={{ color:DIM, fontSize:12, marginTop:2 }}>{c.city}, {c.state} · {c.customer_type}</div>
                    </div>
                    <span style={{ background:(statusColor[c.status]||DIM)+"22", color:statusColor[c.status]||DIM, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{c.status||"Active"}</span>
                  </div>

                  {/* Rating */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <span style={{ color:ratingColor(c.rating||0), fontSize:14 }}>{stars(c.rating||0)}</span>
                    <span style={{ color:ratingColor(c.rating||0), fontWeight:700, fontSize:14 }}>{(c.rating||0).toFixed(1)}</span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      { label:"LOADS", value:c.total_loads||0, color:BLUE },
                      { label:"REVENUE", value:fmt$(c.total_revenue||0), color:GREEN },
                      { label:"$/MILE", value:"$"+(c.avg_rate_per_mile||0).toFixed(2), color:TEAL },
                    ].map(s=>(
                      <div key={s.label} style={{ background:"#0d1b2e", borderRadius:6, padding:"8px 10px" }}>
                        <div style={{ color:DIM, fontSize:9, letterSpacing:1 }}>{s.label}</div>
                        <div style={{ color:s.color, fontWeight:800, fontSize:15, marginTop:2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Contact */}
                  <div style={{ marginTop:12, color:DIM, fontSize:12 }}>
                    {c.contact_name} · {c.contact_phone}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ color:DIM, gridColumn:"1/-1", textAlign:"center", padding:40 }}>No customers match your search.</div>}
            </div>
          </>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && selected && (
          <>
            {/* Header card */}
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:24, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
                <div>
                  <h1 style={{ fontSize:26, fontWeight:900, margin:0 }}>{selected.company_name}</h1>
                  <div style={{ color:DIM, fontSize:13, marginTop:4 }}>{selected.customer_type} · {selected.city}, {selected.state}</div>
                  <div style={{ color:ratingColor(selected.rating||0), fontSize:18, marginTop:6 }}>{stars(selected.rating||0)} <span style={{ fontSize:14, fontWeight:700 }}>{(selected.rating||0).toFixed(1)}/5</span></div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <a href={`tel:${selected.contact_phone}`} style={{ background:GREEN, color:"white", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, textDecoration:"none" }}>📞 Call</a>
                  <a href={`mailto:${selected.contact_email}`} style={{ background:BLUE, color:"white", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, textDecoration:"none" }}>✉️ Email</a>
                  <button onClick={()=>setView("add-load")} style={{ background:AMBER, color:NAVY, border:"none", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Load</button>
                  <button onClick={()=>setView("add-review")} style={{ background:"transparent", color:AMBER, border:`1px solid ${AMBER}`, borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Review</button>
                </div>
              </div>

              {/* Key metrics */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:10 }}>
                {[
                  { label:"Total Loads", value:selected.total_loads||selLoads.length, color:BLUE },
                  { label:"Total Revenue", value:fmt$(selected.total_revenue||selLoads.reduce((a,l)=>a+(l.rate||0),0)), color:GREEN },
                  { label:"Avg $/Mile", value:"$"+(selected.avg_rate_per_mile||0).toFixed(2), color:TEAL },
                  { label:"On-Time %", value:(selected.on_time_pct||0)+"%", color:selected.on_time_pct>=90?GREEN:selected.on_time_pct>=80?AMBER:RED },
                  { label:"Avg Detention", value:(selected.detention_avg_hrs||0).toFixed(1)+"h", color:selected.detention_avg_hrs>2?RED:selected.detention_avg_hrs>1?AMBER:GREEN },
                  { label:"Status", value:selected.status||"Active", color:statusColor[selected.status]||GREEN },
                ].map(m=>(
                  <div key={m.label} style={{ background:"#0d1b2e", borderRadius:8, padding:"12px 14px" }}>
                    <div style={{ color:DIM, fontSize:10, letterSpacing:1 }}>{m.label.toUpperCase()}</div>
                    <div style={{ color:m.color, fontWeight:800, fontSize:18, marginTop:4 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, marginBottom:16 }}>
              {[["overview","📍 Overview"],["loads","📦 Loads"],["reviews","⭐ Driver Reviews"]].map(([t,l])=>(
                <button key={t} onClick={()=>setActiveTab(t)} style={{ background:activeTab===t?AMBER:"transparent", color:activeTab===t?NAVY:DIM, border:`1px solid ${activeTab===t?AMBER:BORDER}`, borderRadius:8, padding:"8px 18px", fontWeight:700, fontSize:13, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:20 }}>
                  <div style={{ color:AMBER, fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:14 }}>CONTACT INFORMATION</div>
                  {[["Contact",selected.contact_name],["Phone",selected.contact_phone],["Email",selected.contact_email],["Location",`${selected.city}, ${selected.state}`]].map(([k,v])=>v&&(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${BORDER}` }}>
                      <span style={{ color:DIM, fontSize:13 }}>{k}</span>
                      <span style={{ color:"white", fontSize:13, fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:20 }}>
                  <div style={{ color:AMBER, fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:14 }}>PERFORMANCE SNAPSHOT</div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:DIM, fontSize:12 }}>On-Time Rate</span>
                      <span style={{ color:GREEN, fontWeight:700 }}>{selected.on_time_pct||94}%</span>
                    </div>
                    <div style={{ background:"#0d1b2e", borderRadius:4, height:8 }}>
                      <div style={{ background:GREEN, borderRadius:4, height:8, width:`${selected.on_time_pct||94}%` }}/>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:DIM, fontSize:12 }}>Driver Rating</span>
                      <span style={{ color:ratingColor(selected.rating||0), fontWeight:700 }}>{(selected.rating||0).toFixed(1)}/5</span>
                    </div>
                    <div style={{ background:"#0d1b2e", borderRadius:4, height:8 }}>
                      <div style={{ background:ratingColor(selected.rating||0), borderRadius:4, height:8, width:`${((selected.rating||0)/5)*100}%` }}/>
                    </div>
                  </div>
                  {selected.notes && <div style={{ color:DIM, fontSize:13, fontStyle:"italic", marginTop:10 }}>{selected.notes}</div>}
                </div>
              </div>
            )}

            {/* Loads Tab */}
            {activeTab === "loads" && (
              <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden" }}>
                {selLoads.length === 0 ? (
                  <div style={{ padding:40, textAlign:"center", color:DIM }}>No loads recorded yet. <button onClick={()=>setView("add-load")} style={{ background:"none", border:"none", color:AMBER, cursor:"pointer", fontWeight:700 }}>Add the first load →</button></div>
                ) : (
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#0d1b2e" }}>
                        {["Load #","Driver","Truck","Trailer","Origin → Dest","Miles","Rate","$/Mi","Detention","Status"].map(h=>(
                          <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:DIM, fontSize:11, letterSpacing:1, whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selLoads.map((l,i)=>(
                        <tr key={l.id} style={{ borderBottom:`1px solid ${BORDER}`, background:i%2===0?"transparent":NAVY+"44" }}>
                          <td style={{ padding:"11px 14px", color:TEAL, fontWeight:700 }}>{l.load_number}</td>
                          <td style={{ padding:"11px 14px" }}>{l.driver_name}</td>
                          <td style={{ padding:"11px 14px", color:DIM }}>{l.truck_unit}</td>
                          <td style={{ padding:"11px 14px", color:DIM }}>{l.trailer_unit}</td>
                          <td style={{ padding:"11px 14px" }}>{l.origin} → {l.destination}</td>
                          <td style={{ padding:"11px 14px", color:DIM }}>{l.miles}mi</td>
                          <td style={{ padding:"11px 14px", color:GREEN, fontWeight:700 }}>${l.rate?.toLocaleString()}</td>
                          <td style={{ padding:"11px 14px", color:TEAL }}>${l.rate_per_mile}</td>
                          <td style={{ padding:"11px 14px", color:l.detention_hrs>2?RED:l.detention_hrs>0?AMBER:GREEN }}>{l.detention_hrs}h {l.detention_pay>0?`($${l.detention_pay})`:""}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <span style={{ color:l.status==="Delivered"?GREEN:l.status==="In Transit"?BLUE:AMBER, fontWeight:700, fontSize:11 }}>{l.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {selReviews.length === 0 ? (
                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:40, textAlign:"center", color:DIM }}>No driver reviews yet. <button onClick={()=>setView("add-review")} style={{ background:"none", border:"none", color:AMBER, cursor:"pointer", fontWeight:700 }}>Add the first review →</button></div>
                ) : selReviews.map(r=>(
                  <div key={r.id} style={{ background:CARD, border:`1px solid ${r.would_return?GREEN:RED}33`, borderRadius:12, padding:20, marginBottom:12, borderLeft:`4px solid ${ratingColor(r.rating)}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                      <div>
                        <span style={{ fontWeight:700 }}>{r.driver_name}</span>
                        <span style={{ color:DIM, fontSize:12, marginLeft:10 }}>Load {r.load_number}</span>
                        <span style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:4, padding:"2px 8px", fontSize:11, color:AMBER, marginLeft:8 }}>{r.category}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ color:ratingColor(r.rating), fontSize:16 }}>{stars(r.rating)}</span>
                        <span style={{ color:r.would_return?GREEN:RED, fontSize:12, fontWeight:700 }}>{r.would_return?"✓ Would Return":"✗ Would Not Return"}</span>
                      </div>
                    </div>
                    <p style={{ color:"#c8dae8", fontSize:14, margin:"12px 0", lineHeight:1.7 }}>{r.review}</p>
                    {r.detention_hrs > 0 && <div style={{ color:r.detention_hrs>2?RED:AMBER, fontSize:12, fontWeight:600 }}>⏱️ Detention: {r.detention_hrs}h</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ADD LOAD ── */}
        {view === "add-load" && selected && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:4 }}>📦 Add Load — {selected.company_name}</h2>
            <p style={{ color:DIM, marginBottom:24, fontSize:14 }}>Every load is tracked against this customer — driver, truck, trailer, rate, and revenue all saved.</p>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["Load Number","load_number","LD-00001"],["Driver Name","driver_name","Full name"],["Truck Unit","truck_unit","TRK-000"],["Trailer Unit","trailer_unit","TRL-000"],["Origin","origin","City, ST"],["Destination","destination","City, ST"],["Pickup Date","pickup_date","date"],["Delivery Date","delivery_date","date"],["Miles","miles","0"],["Rate ($)","rate","0"],["Commodity","commodity","Dry Van"],["Weight (lbs)","weight_lbs","0"]].map(([lbl,key,ph])=>(
                <div key={key} style={{ gridColumn: key==="origin"||key==="destination" ? "span 1" : "span 1" }}>
                  <label style={label}>{lbl.toUpperCase()}</label>
                  <input type={key.includes("date")?"date":key==="miles"||key==="rate"||key==="weight_lbs"?"number":"text"} value={newLoad[key]} onChange={e=>setNewLoad(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={inp}/>
                </div>
              ))}
              <div>
                <label style={label}>STATUS</label>
                <select value={newLoad.status} onChange={e=>setNewLoad(p=>({...p,status:e.target.value}))} style={inp}>
                  {["Available","In Transit","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveLoad} disabled={saving} style={{ width:"100%", background:saving?"#374151":AMBER, color:NAVY, border:"none", borderRadius:12, padding:"16px", fontSize:16, fontWeight:800, cursor:saving?"not-allowed":"pointer", marginTop:16 }}>
              {saving ? "Saving..." : "Save Load to Customer Record"}
            </button>
          </div>
        )}

        {/* ── ADD REVIEW ── */}
        {view === "add-review" && selected && (
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:4 }}>⭐ Driver Review — {selected.company_name}</h2>
            <p style={{ color:DIM, marginBottom:24, fontSize:14 }}>Honest reviews protect every driver in the fleet. Be specific about detention, facility, and payment.</p>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
              <div><label style={label}>DRIVER NAME</label><input value={newReview.driver_name} onChange={e=>setNewReview(p=>({...p,driver_name:e.target.value}))} placeholder="Your name" style={inp}/></div>
              <div><label style={label}>LOAD NUMBER</label><input value={newReview.load_number} onChange={e=>setNewReview(p=>({...p,load_number:e.target.value}))} placeholder="LD-00000" style={inp}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={label}>CATEGORY</label>
                  <select value={newReview.category} onChange={e=>setNewReview(p=>({...p,category:e.target.value}))} style={inp}>
                    {["Detention","Payment","Facility","Communication","Loading","Safety","Overall"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>DETENTION HOURS</label>
                  <input type="number" value={newReview.detention_hrs} onChange={e=>setNewReview(p=>({...p,detention_hrs:e.target.value}))} placeholder="0" style={inp}/>
                </div>
              </div>
              <div>
                <label style={label}>RATING</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setNewReview(p=>({...p,rating:n}))} style={{ background:newReview.rating>=n?AMBER:"transparent", color:newReview.rating>=n?NAVY:"#64748b", border:`1px solid ${newReview.rating>=n?AMBER:BORDER}`, borderRadius:6, padding:"8px 16px", fontSize:18, cursor:"pointer" }}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={label}>YOUR REVIEW</label>
                <textarea value={newReview.review} onChange={e=>setNewReview(p=>({...p,review:e.target.value}))} placeholder="Describe your experience — detention, facility, dock staff, communication, payment..." rows={5} style={{ ...inp, resize:"vertical" }}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" checked={newReview.would_return} onChange={e=>setNewReview(p=>({...p,would_return:e.target.checked}))} id="wr" style={{ width:18, height:18 }}/>
                <label htmlFor="wr" style={{ color:"white", fontWeight:600 }}>I would take loads from this customer again</label>
              </div>
            </div>
            <button onClick={saveReview} disabled={saving} style={{ width:"100%", background:saving?"#374151":AMBER, color:NAVY, border:"none", borderRadius:12, padding:"16px", fontSize:16, fontWeight:800, cursor:saving?"not-allowed":"pointer", marginTop:16 }}>
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        )}

        {/* ── ADD CUSTOMER ── */}
        {view === "add-customer" && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, fontWeight:900, marginBottom:4 }}>📒 Add New Customer</h2>
            <p style={{ color:DIM, marginBottom:24, fontSize:14 }}>Add a shipper, receiver, or broker to your fleet's customer book.</p>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["Company Name","company_name","Required"],["Contact Name","contact_name","Full name"],["Phone","contact_phone","555-000-0000"],["Email","contact_email","email@company.com"],["City","city","City"],["State","state","MO"]].map(([lbl,key,ph])=>(
                <div key={key}>
                  <label style={label}>{lbl.toUpperCase()}</label>
                  <input value={newCustomer[key]} onChange={e=>setNewCustomer(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={inp}/>
                </div>
              ))}
              <div>
                <label style={label}>TYPE</label>
                <select value={newCustomer.customer_type} onChange={e=>setNewCustomer(p=>({...p,customer_type:e.target.value}))} style={inp}>
                  {["Shipper","Receiver","Broker"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={label}>NOTES</label>
                <textarea value={newCustomer.notes} onChange={e=>setNewCustomer(p=>({...p,notes:e.target.value}))} placeholder="Payment terms, special instructions, watch points..." rows={3} style={{ ...inp, resize:"vertical" }}/>
              </div>
            </div>
            <button onClick={saveCustomer} disabled={saving||!newCustomer.company_name} style={{ width:"100%", background:saving||!newCustomer.company_name?"#374151":AMBER, color:NAVY, border:"none", borderRadius:12, padding:"16px", fontSize:16, fontWeight:800, cursor:saving||!newCustomer.company_name?"not-allowed":"pointer", marginTop:16 }}>
              {saving ? "Saving..." : "Add to Customer Book"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
