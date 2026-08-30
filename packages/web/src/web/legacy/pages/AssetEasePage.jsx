import { useState, useEffect, useCallback } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

// ─── Brand ───────────────────────────────────────────────────────────────────
const GOLD   = "#c9a84c";
const BLACK  = "#0a0a0a";
const DARK   = "#0e0e0e";
const CARD   = "#131313";
const CARD2  = "#181818";
const BORDER = "#252525";
const GREEN  = "#22c55e";
const AMBER  = "#f59e0b";
const RED    = "#ef4444";
const BLUE   = "#60a5fa";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => n == null || n === "" ? "—" : Number(n).toLocaleString();
const fmtMoney = (n) => n == null || n === "" ? "—" : "$" + Number(n).toLocaleString();
const daysUntil = (d) => d ? Math.round((new Date(d) - new Date()) / 86400000) : null;
const urgencyColor = (days) => days == null ? "#555" : days < 14 ? RED : days < 30 ? AMBER : days < 60 ? GOLD : GREEN;
const urgencyLabel = (days) => days == null ? "—" : days < 0 ? "EXPIRED" : days === 0 ? "TODAY" : `${days}d`;

const STATUS_META = {
  active:         { color: GREEN,  label: "Active" },
  available:      { color: GREEN,  label: "Available" },
  in_use:         { color: BLUE,   label: "In Use" },
  in_shop:        { color: AMBER,  label: "In Shop" },
  maintenance:    { color: AMBER,  label: "Service" },
  out_of_service: { color: RED,    label: "OOS" },
  sold:           { color: "#777", label: "Sold" },
  pending:        { color: "#777", label: "Pending" },
};

const VEHICLE_TYPES = [
  { value: "semi_truck",  icon: "🚛", label: "Semi Truck" },
  { value: "box_truck",   icon: "📦", label: "Box Truck" },
  { value: "van",         icon: "🚐", label: "Van" },
  { value: "pickup",      icon: "🛻", label: "Pickup" },
  { value: "car",         icon: "🚗", label: "Car" },
  { value: "motorcycle",  icon: "🏍️", label: "Motorcycle" },
  { value: "other",       icon: "🔧", label: "Other" },
];

const TRAILER_TYPES = [
  "Dry Van","Reefer","Flatbed","Step Deck","Lowboy",
  "Tanker","Double Drop","Conestoga","Curtainside","Other"
];

const FUEL_TYPES = ["Diesel","Gasoline","Electric","Hybrid","CNG","LNG"];

const STATUS_ALL_V = ["active","in_shop","maintenance","out_of_service","sold","pending"];
const STATUS_ALL_T = ["available","in_use","in_shop","maintenance","out_of_service","sold"];

// Straight-line depreciation estimate (5-yr trucks, 3-yr trailers)
function estimateValue(purchasePrice, purchaseYear, assetType) {
  if (!purchasePrice || !purchaseYear) return null;
  const life = assetType === "trailer" ? 10 : 7;
  const age  = new Date().getFullYear() - Number(purchaseYear);
  const residual = purchasePrice * 0.10;
  const annual = (purchasePrice - residual) / life;
  const val = Math.max(residual, purchasePrice - (annual * age));
  return Math.round(val);
}

// Fleet health score 0-100
function calcHealth(vehicles, trailers) {
  const all = vehicles.length + trailers.length;
  if (!all) return 100;
  const oos = vehicles.filter(v => v.status === "out_of_service").length
            + trailers.filter(t => t.status === "out_of_service").length;
  const svc = vehicles.filter(v => v.status === "maintenance" || v.status === "in_shop").length
            + trailers.filter(t => t.status === "maintenance" || t.status === "in_shop").length;
  const expiring = [...vehicles, ...trailers].filter(a => {
    const d = daysUntil(a.registration_expiry || a.insurance_expiry);
    return d != null && d < 30 && d >= 0;
  }).length;
  const score = 100 - (oos * 15) - (svc * 5) - (expiring * 3);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Total fleet book value
function totalValue(vehicles, trailers) {
  let sum = 0;
  for (const v of vehicles) {
    const val = v.current_value || estimateValue(v.purchase_price, v.year, "vehicle");
    if (val) sum += val;
  }
  for (const t of trailers) {
    const val = t.current_value || estimateValue(t.purchase_price, t.year, "trailer");
    if (val) sum += val;
  }
  return sum;
}

// ─── Empty forms ─────────────────────────────────────────────────────────────
const EMPTY_V = {
  unit_number:"", asset_type:"semi_truck", make:"", model:"", year:"", vin:"",
  license_plate:"", state:"", status:"active", assigned_driver:"", odometer:"",
  fuel_type:"Diesel", purchase_price:"", current_value:"", purchase_date:"",
  last_inspection:"", next_service_due:"", insurance_expiry:"", registration_expiry:"", notes:""
};
const EMPTY_T = {
  trailer_number:"", trailer_type:"Dry Van", make:"", model:"", year:"", vin:"",
  license_plate:"", state:"", status:"available", assigned_truck:"", current_location:"",
  length_ft:"", load_capacity_lbs:"", purchase_price:"", current_value:"", purchase_date:"",
  last_inspection:"", next_service_due:"", registration_expiry:"", insurance_expiry:"", notes:""
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatPill({ label, value, color = GOLD, sub }) {
  return (
    <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", textAlign: "center", minWidth: 110 }}>
      <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "Oswald, sans-serif", letterSpacing: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function HealthMeter({ score }) {
  const color = score >= 80 ? GREEN : score >= 60 ? AMBER : RED;
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Fair" : "Needs Attention";
  return (
    <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, minWidth: 200 }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: 60, height: 60 }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#222" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color, fontFamily: "Oswald, sans-serif" }}>{score}</div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase" }}>Fleet Health</div>
        <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "Oswald, sans-serif" }}>{label}</div>
      </div>
    </div>
  );
}

function AssetBankCard({ asset, type, onEdit, onDelete }) {
  const isV = type === "vehicle";
  const id   = isV ? asset.unit_number : asset.trailer_number;
  const sub  = isV
    ? [asset.year, asset.make, asset.model].filter(Boolean).join(" ")
    : [asset.trailer_type, asset.length_ft ? asset.length_ft + "ft" : ""].filter(Boolean).join(" · ");
  const icon = isV ? (VEHICLE_TYPES.find(t => t.value === asset.asset_type)?.icon || "🚛") : "📦";
  const sm = STATUS_META[asset.status] || { color: "#777", label: asset.status };
  const regDays = daysUntil(asset.registration_expiry);
  const insDays = daysUntil(asset.insurance_expiry);
  const svcDays = daysUntil(asset.next_service_due);
  const estimatedVal = isV
    ? (asset.current_value || estimateValue(asset.purchase_price, asset.year, "vehicle"))
    : (asset.current_value || estimateValue(asset.purchase_price, asset.year, "trailer"));

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD + "55"}
      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: "Oswald, sans-serif", letterSpacing: 1 }}>{id || "—"}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{sub || "No details yet"}</div>
          </div>
        </div>
        <span style={{ background: sm.color + "20", color: sm.color, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, whiteSpace: "nowrap" }}>{sm.label}</span>
      </div>

      {/* Asset Bank Value */}
      {estimatedVal && (
        <div style={{ background: `linear-gradient(135deg, #1a1200, #0f0f0f)`, border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>ASSET VALUE</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: GOLD, fontFamily: "Oswald, sans-serif" }}>{fmtMoney(estimatedVal)}</div>
        </div>
      )}

      {/* Key Info Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
        {isV && asset.assigned_driver && <div style={{ color: "#aaa" }}>👤 <span style={{ color: "#ccc" }}>{asset.assigned_driver}</span></div>}
        {!isV && asset.assigned_truck && <div style={{ color: "#aaa" }}>🚛 <span style={{ color: "#ccc" }}>{asset.assigned_truck}</span></div>}
        {!isV && asset.current_location && <div style={{ color: "#aaa" }}>📍 <span style={{ color: "#ccc" }}>{asset.current_location}</span></div>}
        {asset.license_plate && <div style={{ color: "#aaa" }}>🪪 <span style={{ color: "#ccc" }}>{asset.license_plate}</span></div>}
        {isV && asset.odometer && <div style={{ color: "#aaa" }}>📊 <span style={{ color: "#ccc" }}>{fmt(asset.odometer)} mi</span></div>}
        {!isV && asset.load_capacity_lbs && <div style={{ color: "#aaa" }}>⚖️ <span style={{ color: "#ccc" }}>{fmt(asset.load_capacity_lbs)} lbs</span></div>}
        {asset.vin && <div style={{ color: "#555", fontSize: 10, gridColumn: "1/-1", fontFamily: "monospace" }}>VIN: {asset.vin}</div>}
      </div>

      {/* Compliance Strip */}
      {(regDays != null || insDays != null || svcDays != null) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {regDays != null && (
            <div style={{ background: urgencyColor(regDays) + "18", border: `1px solid ${urgencyColor(regDays)}44`, color: urgencyColor(regDays), padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              REG {urgencyLabel(regDays)}
            </div>
          )}
          {insDays != null && (
            <div style={{ background: urgencyColor(insDays) + "18", border: `1px solid ${urgencyColor(insDays)}44`, color: urgencyColor(insDays), padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              INS {urgencyLabel(insDays)}
            </div>
          )}
          {svcDays != null && (
            <div style={{ background: urgencyColor(svcDays) + "18", border: `1px solid ${urgencyColor(svcDays)}44`, color: urgencyColor(svcDays), padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              SVC {urgencyLabel(svcDays)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <button onClick={onEdit} style={{ flex: 1, background: "transparent", border: `1px solid ${GOLD}55`, color: GOLD, padding: "8px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Oswald, sans-serif" }}>Edit</button>
        <button onClick={onDelete} style={{ background: "transparent", border: `1px solid ${RED}44`, color: RED, padding: "8px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "Oswald, sans-serif" }}>✕</button>
      </div>
    </div>
  );
}

function FF({ label, value, onChange, placeholder, type = "text", children }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 5, textTransform: "uppercase" }}>{label}</label>
      {children || (
        <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", borderRadius: 7, fontSize: 13, fontFamily: "Oswald, sans-serif", outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 5, textTransform: "uppercase" }}>{label}</label>
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", borderRadius: 7, fontSize: 13, fontFamily: "Oswald, sans-serif", outline: "none" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetEasePage() {
  const [tab, setTab]           = useState("bank");
  const [vehicles, setVehicles] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Forms
  const [showVForm, setShowVForm]   = useState(false);
  const [showTForm, setShowTForm]   = useState(false);
  const [vForm, setVForm]           = useState(EMPTY_V);
  const [tForm, setTForm]           = useState(EMPTY_T);
  const [editVId, setEditVId]       = useState(null);
  const [editTId, setEditTId]       = useState(null);

  // Intelligence analysis
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [v, t] = await Promise.all([
        pb.collection("fleet_vehicles").getFullList({ sort: "-created" }).catch(() => []),
        pb.collection("fleet_trailers").getFullList({ sort: "-created" }).catch(() => []),
      ]);
      setVehicles(v);
      setTrailers(t);
    } catch {}
    setLoading(false);
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function runIndex() {
    setIndexing(true);
    await new Promise(r => setTimeout(r, 2400));
    const health = calcHealth(vehicles, trailers);
    const fleetVal = totalValue(vehicles, trailers);
    const expiring = [...vehicles, ...trailers].filter(a => {
      const d = daysUntil(a.registration_expiry || a.insurance_expiry);
      return d != null && d < 30 && d >= 0;
    });
    const available = vehicles.filter(v => ["active","available"].includes(v.status)).length
                    + trailers.filter(t => t.status === "available").length;
    const inService = vehicles.filter(v => ["maintenance","in_shop"].includes(v.status)).length
                    + trailers.filter(t => ["maintenance","in_shop"].includes(t.status)).length;

    let rec;
    if (vehicles.length + trailers.length === 0) {
      rec = "Start building your asset bank — add your first vehicle or trailer.";
    } else if (expiring.length > 0) {
      rec = `${expiring.length} asset${expiring.length > 1 ? "s" : ""} need compliance attention within 30 days — act now.`;
    } else if (inService > 0) {
      rec = `${inService} asset${inService > 1 ? "s are" : " is"} in service — monitor closely to minimize downtime.`;
    } else {
      rec = `Fleet running clean. ${available} asset${available !== 1 ? "s" : ""} ready to roll.`;
    }

    setAnalysis({ health, fleetVal, available, inService, expiring: expiring.length, total: vehicles.length + trailers.length, rec });
    setIndexed(true);
    setIndexing(false);
  }

  async function saveVehicle() {
    if (!vForm.unit_number.trim()) { showToast("Unit number is required", "error"); return; }
    setSaving(true);
    try {
      const data = {
        ...vForm,
        year: vForm.year ? Number(vForm.year) : null,
        odometer: vForm.odometer ? Number(vForm.odometer) : null,
        purchase_price: vForm.purchase_price ? Number(vForm.purchase_price) : null,
        current_value: vForm.current_value ? Number(vForm.current_value) : null,
      };
      if (editVId) {
        await pb.collection("fleet_vehicles").update(editVId, data);
        showToast("Vehicle updated in your asset bank");
      } else {
        await pb.collection("fleet_vehicles").create(data);
        showToast("Vehicle added to your asset bank");
      }
      setShowVForm(false); setVForm(EMPTY_V); setEditVId(null);
      await loadAll();
    } catch { showToast("Could not save — try again", "error"); }
    setSaving(false);
  }

  async function saveTrailer() {
    if (!tForm.trailer_number.trim()) { showToast("Trailer number is required", "error"); return; }
    setSaving(true);
    try {
      const data = {
        ...tForm,
        year: tForm.year ? Number(tForm.year) : null,
        length_ft: tForm.length_ft ? Number(tForm.length_ft) : null,
        load_capacity_lbs: tForm.load_capacity_lbs ? Number(tForm.load_capacity_lbs) : null,
        purchase_price: tForm.purchase_price ? Number(tForm.purchase_price) : null,
        current_value: tForm.current_value ? Number(tForm.current_value) : null,
      };
      if (editTId) {
        await pb.collection("fleet_trailers").update(editTId, data);
        showToast("Trailer updated in your asset bank");
      } else {
        await pb.collection("fleet_trailers").create(data);
        showToast("Trailer added to your asset bank");
      }
      setShowTForm(false); setTForm(EMPTY_T); setEditTId(null);
      await loadAll();
    } catch { showToast("Could not save — try again", "error"); }
    setSaving(false);
  }

  async function delVehicle(id) {
    if (!confirm("Remove this vehicle from your asset bank?")) return;
    await pb.collection("fleet_vehicles").delete(id).catch(() => {});
    showToast("Vehicle removed"); loadAll();
  }
  async function delTrailer(id) {
    if (!confirm("Remove this trailer from your asset bank?")) return;
    await pb.collection("fleet_trailers").delete(id).catch(() => {});
    showToast("Trailer removed"); loadAll();
  }

  function openEditV(v) { setVForm({ ...EMPTY_V, ...v }); setEditVId(v.id); setShowVForm(true); setTab("vehicles"); }
  function openEditT(t) { setTForm({ ...EMPTY_T, ...t }); setEditTId(t.id); setShowTForm(true); setTab("trailers"); }

  const fveh = vehicles.filter(v => {
    const q = search.toLowerCase();
    const ms = !q || [v.unit_number,v.make,v.model,v.assigned_driver,v.license_plate,v.vin].some(s => (s||"").toLowerCase().includes(q));
    const mf = statusFilter === "all" || v.status === statusFilter;
    return ms && mf;
  });
  const ftra = trailers.filter(t => {
    const q = search.toLowerCase();
    const ms = !q || [t.trailer_number,t.make,t.trailer_type,t.current_location,t.vin,t.license_plate].some(s => (s||"").toLowerCase().includes(q));
    const mf = statusFilter === "all" || t.status === statusFilter;
    return ms && mf;
  });

  const totalAll = vehicles.length + trailers.length;
  const bankVal  = totalValue(vehicles, trailers);
  const health   = calcHealth(vehicles, trailers);
  const avail    = vehicles.filter(v => ["active","available"].includes(v.status)).length
                 + trailers.filter(t => t.status === "available").length;
  const svcNeeded = vehicles.filter(v => ["maintenance","in_shop"].includes(v.status)).length
                  + trailers.filter(t => ["maintenance","in_shop"].includes(t.status)).length;

  const TABS = [
    { id: "bank",       label: "⚡ Asset Bank" },
    { id: "vehicles",   label: "🚛 Vehicles" },
    { id: "trailers",   label: "📦 Trailers" },
    { id: "intelligence", label: "🧠 Intelligence" },
  ];

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "Oswald, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? RED : GOLD, color: toast.type === "error" ? "#fff" : BLACK, padding: "12px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: DARK, borderBottom: `2px solid ${GOLD}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${GOLD}, #7a5a1a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🏦</div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 3, color: GOLD, lineHeight: 1 }}>AssetEase</div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginTop: 2 }}>FLEET ASSET INTELLIGENCE BANK · TRUCKWITHEASE</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={runIndex} disabled={indexing}
            style={{ background: indexed ? `linear-gradient(135deg, ${GOLD}, #7a5a1a)` : "transparent", border: `2px solid ${GOLD}`, color: indexed ? BLACK : GOLD, padding: "10px 22px", borderRadius: 8, cursor: indexing ? "wait" : "pointer", fontWeight: 700, fontSize: 13, letterSpacing: 1, display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s", fontFamily: "Oswald, sans-serif" }}>
            <span style={indexing ? { animation: "spin 0.8s linear infinite", display: "inline-block" } : {}}>⚡</span>
            {indexing ? "Indexing All Records…" : indexed ? "Re-Index Fleet" : "Intelligence Index"}
          </button>
          <button onClick={() => { window.history.pushState({}, "", "/live-gps"); window.dispatchEvent(new PopStateEvent("popstate")); }}
            style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}55`, color: GREEN, padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "Oswald, sans-serif", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "spin 2s linear infinite" }} />
            Live GPS
          </button>
          <button onClick={() => window.history.back()}
            style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#666", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>← Back</button>
        </div>
      </div>

      {/* Intelligence Analysis Banner */}
      {analysis && (
        <div style={{ background: "linear-gradient(135deg, #1c1200 0%, #0a0a0a 100%)", borderBottom: `1px solid ${GOLD}44`, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 10, color: GOLD, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>⚡ INTELLIGENCE INDEX COMPLETE — ALL RECORDS MEMORIZED</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{analysis.rec}</div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>{analysis.total}</div><div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>TOTAL ASSETS</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: GREEN }}>{analysis.available}</div><div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>READY</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: AMBER }}>{analysis.inService}</div><div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>IN SERVICE</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: RED }}>{analysis.expiring}</div><div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>EXPIRING</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>{bankVal ? "$" + (bankVal >= 1000000 ? (bankVal/1000000).toFixed(1)+"M" : (bankVal/1000).toFixed(0)+"K") : "—"}</div><div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>BANK VALUE</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 1, background: BORDER, flexWrap: "wrap" }}>
        {[
          { label: "Total Assets",   value: loading ? "—" : totalAll,                       color: GOLD },
          { label: "Vehicles",       value: loading ? "—" : vehicles.length,                 color: BLUE },
          { label: "Trailers",       value: loading ? "—" : trailers.length,                 color: "#a78bfa" },
          { label: "Ready to Run",   value: loading ? "—" : avail,                           color: GREEN },
          { label: "In Service",     value: loading ? "—" : svcNeeded,                       color: AMBER },
          { label: "Fleet Value",    value: loading ? "—" : bankVal ? "$" + (bankVal >= 1000000 ? (bankVal/1000000).toFixed(1)+"M" : (bankVal/1000).toFixed(0)+"K") : "—", color: GOLD },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 120px", background: CARD, padding: "14px 16px", textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: DARK, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: "none", border: "none", color: tab === t.id ? GOLD : "#666", borderBottom: tab === t.id ? `3px solid ${GOLD}` : "3px solid transparent", padding: "15px 24px", cursor: "pointer", fontWeight: 700, fontSize: 13, letterSpacing: 1, whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: "Oswald, sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>

        {/* ── ASSET BANK TAB ── */}
        {tab === "bank" && (
          <div>
            {/* Top Row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28, alignItems: "stretch" }}>
              <HealthMeter score={health} />
              <StatPill label="Vehicles" value={vehicles.length} color={BLUE} />
              <StatPill label="Trailers" value={trailers.length} color="#a78bfa" />
              <StatPill label="Ready to Run" value={avail} color={GREEN} />
              <StatPill label="Fleet Value" value={bankVal ? fmtMoney(bankVal) : "—"} color={GOLD} sub="Estimated book value" />
              {!indexed && (
                <div style={{ flex: 1, background: `linear-gradient(135deg, #1a1200, #0d0d0d)`, border: `1px dashed ${GOLD}66`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 200, cursor: "pointer" }}
                  onClick={runIndex}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>⚡</div>
                    <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1 }}>RUN INTELLIGENCE INDEX</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>Collect · Store · Memorize</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <button onClick={() => { setVForm(EMPTY_V); setEditVId(null); setShowVForm(true); setTab("vehicles"); }}
                style={{ background: GOLD, color: BLACK, border: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 14, letterSpacing: 1, fontFamily: "Oswald, sans-serif" }}>
                + Add Vehicle
              </button>
              <button onClick={() => { setTForm(EMPTY_T); setEditTId(null); setShowTForm(true); setTab("trailers"); }}
                style={{ background: "transparent", border: `2px solid ${GOLD}`, color: GOLD, padding: "12px 28px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 14, letterSpacing: 1, fontFamily: "Oswald, sans-serif" }}>
                + Add Trailer
              </button>
            </div>

            {/* Intelligence Options Grid */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>Fleet Intelligence Options</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { icon: "⚡", title: "Instant Index",       plain: "Every asset catalogued the moment it's added", q: "Real-time O(1) lookup across all asset records" },
                  { icon: "🏦", title: "Asset Bank Value",    plain: "Know your fleet's worth at a glance", q: "Depreciation-adjusted book value via straight-line model" },
                  { icon: "🧠", title: "Pattern Memory",      plain: "Learns your fleet — flags issues before they hit", q: "Anomaly detection on service intervals and utilization deltas" },
                  { icon: "🎯", title: "Smart Assignment",    plain: "Right truck, right load, right now", q: "Constraint-satisfaction matching on availability + capacity" },
                  { icon: "📍", title: "Location Memory",     plain: "Always knows where every trailer is", q: "Persistent location state with last-updated timestamp" },
                  { icon: "🔮", title: "Predictive Service",  plain: "Service alerts days ahead, not day of", q: "Time-series projection on mileage and inspection intervals" },
                ].map(o => (
                  <div key={o.title} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{o.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 4 }}>{o.title}</div>
                    <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5, marginBottom: 8 }}>{o.plain}</div>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", lineHeight: 1.4 }}>{o.q}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assets */}
            {vehicles.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Recent Vehicles</span>
                  <button onClick={() => setTab("vehicles")} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", fontFamily: "Oswald, sans-serif" }}>View all →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                  {vehicles.slice(0, 3).map(v => <AssetBankCard key={v.id} asset={v} type="vehicle" onEdit={() => openEditV(v)} onDelete={() => delVehicle(v.id)} />)}
                </div>
              </div>
            )}
            {trailers.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Recent Trailers</span>
                  <button onClick={() => setTab("trailers")} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", fontFamily: "Oswald, sans-serif" }}>View all →</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                  {trailers.slice(0, 3).map(t => <AssetBankCard key={t.id} asset={t} type="trailer" onEdit={() => openEditT(t)} onDelete={() => delTrailer(t.id)} />)}
                </div>
              </div>
            )}
            {totalAll === 0 && !loading && (
              <div style={{ background: CARD, border: `1px dashed ${BORDER}`, borderRadius: 14, padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Your Asset Bank is Empty</div>
                <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Add your first vehicle or trailer to start building your indexed fleet.</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => { setVForm(EMPTY_V); setEditVId(null); setShowVForm(true); setTab("vehicles"); }}
                    style={{ background: GOLD, color: BLACK, border: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Oswald, sans-serif" }}>Add Vehicle</button>
                  <button onClick={() => { setTForm(EMPTY_T); setEditTId(null); setShowTForm(true); setTab("trailers"); }}
                    style={{ background: "transparent", border: `2px solid ${GOLD}`, color: GOLD, padding: "12px 28px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Oswald, sans-serif" }}>Add Trailer</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VEHICLES TAB ── */}
        {tab === "vehicles" && (
          <div>
            {/* Controls */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles…"
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 13, flex: 1, minWidth: 160, outline: "none", fontFamily: "Oswald, sans-serif" }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Oswald, sans-serif" }}>
                <option value="all">All Status</option>
                {STATUS_ALL_V.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
              </select>
              <button onClick={() => { setVForm(EMPTY_V); setEditVId(null); setShowVForm(!showVForm); }}
                style={{ background: GOLD, color: BLACK, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif", letterSpacing: 1, whiteSpace: "nowrap" }}>
                {showVForm ? "✕ Cancel" : "+ Add Vehicle"}
              </button>
            </div>

            {/* Vehicle Form */}
            {showVForm && (
              <div style={{ background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 20, letterSpacing: 2 }}>{editVId ? "EDIT VEHICLE" : "ADD VEHICLE TO ASSET BANK"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                  <FF label="Unit Number *" value={vForm.unit_number} onChange={v => setVForm(f => ({...f, unit_number: v}))} placeholder="TRK-001" />
                  <Select label="Asset Type" value={vForm.asset_type} onChange={v => setVForm(f => ({...f, asset_type: v}))} options={VEHICLE_TYPES.map(t => ({ value: t.value, label: t.icon + " " + t.label }))} />
                  <FF label="Make" value={vForm.make} onChange={v => setVForm(f => ({...f, make: v}))} placeholder="Freightliner, Kenworth…" />
                  <FF label="Model" value={vForm.model} onChange={v => setVForm(f => ({...f, model: v}))} placeholder="Cascadia, T680…" />
                  <FF label="Year" value={vForm.year} onChange={v => setVForm(f => ({...f, year: v}))} placeholder="2022" type="number" />
                  <FF label="VIN" value={vForm.vin} onChange={v => setVForm(f => ({...f, vin: v}))} placeholder="17-character VIN" />
                  <FF label="License Plate" value={vForm.license_plate} onChange={v => setVForm(f => ({...f, license_plate: v}))} placeholder="ABC-1234" />
                  <FF label="State" value={vForm.state} onChange={v => setVForm(f => ({...f, state: v}))} placeholder="TX" />
                  <Select label="Status" value={vForm.status} onChange={v => setVForm(f => ({...f, status: v}))} options={STATUS_ALL_V.map(s => ({ value: s, label: STATUS_META[s]?.label || s }))} />
                  <FF label="Assigned Driver" value={vForm.assigned_driver} onChange={v => setVForm(f => ({...f, assigned_driver: v}))} placeholder="Driver name" />
                  <FF label="Odometer (miles)" value={vForm.odometer} onChange={v => setVForm(f => ({...f, odometer: v}))} placeholder="150000" type="number" />
                  <Select label="Fuel Type" value={vForm.fuel_type} onChange={v => setVForm(f => ({...f, fuel_type: v}))} options={FUEL_TYPES} />
                  <FF label="Purchase Price ($)" value={vForm.purchase_price} onChange={v => setVForm(f => ({...f, purchase_price: v}))} placeholder="120000" type="number" />
                  <FF label="Current Value ($)" value={vForm.current_value} onChange={v => setVForm(f => ({...f, current_value: v}))} placeholder="Leave blank to estimate" type="number" />
                  <FF label="Purchase Date" value={vForm.purchase_date} onChange={v => setVForm(f => ({...f, purchase_date: v}))} type="date" />
                  <FF label="Last Inspection" value={vForm.last_inspection} onChange={v => setVForm(f => ({...f, last_inspection: v}))} type="date" />
                  <FF label="Next Service Due" value={vForm.next_service_due} onChange={v => setVForm(f => ({...f, next_service_due: v}))} type="date" />
                  <FF label="Insurance Expiry" value={vForm.insurance_expiry} onChange={v => setVForm(f => ({...f, insurance_expiry: v}))} type="date" />
                  <FF label="Registration Expiry" value={vForm.registration_expiry} onChange={v => setVForm(f => ({...f, registration_expiry: v}))} type="date" />
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 5, textTransform: "uppercase" }}>Notes</label>
                    <textarea value={vForm.notes || ""} onChange={e => setVForm(f => ({...f, notes: e.target.value}))} placeholder="Additional notes…"
                      style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", borderRadius: 7, fontSize: 13, fontFamily: "Oswald, sans-serif", minHeight: 70, resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button onClick={saveVehicle} disabled={saving}
                    style={{ background: GOLD, color: BLACK, border: "none", padding: "12px 30px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Oswald, sans-serif", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving…" : editVId ? "Update Vehicle" : "Add to Asset Bank"}
                  </button>
                  <button onClick={() => { setShowVForm(false); setEditVId(null); setVForm(EMPTY_V); }}
                    style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#666", padding: "12px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>Cancel</button>
                </div>
              </div>
            )}

            {loading ? <Spinner /> : fveh.length === 0 ? <EmptyMsg icon="🚛" msg="No vehicles match your search." /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
                {fveh.map(v => <AssetBankCard key={v.id} asset={v} type="vehicle" onEdit={() => openEditV(v)} onDelete={() => delVehicle(v.id)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TRAILERS TAB ── */}
        {tab === "trailers" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trailers…"
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 13, flex: 1, minWidth: 160, outline: "none", fontFamily: "Oswald, sans-serif" }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Oswald, sans-serif" }}>
                <option value="all">All Status</option>
                {STATUS_ALL_T.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
              </select>
              <button onClick={() => { setTForm(EMPTY_T); setEditTId(null); setShowTForm(!showTForm); }}
                style={{ background: GOLD, color: BLACK, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif", letterSpacing: 1, whiteSpace: "nowrap" }}>
                {showTForm ? "✕ Cancel" : "+ Add Trailer"}
              </button>
            </div>

            {showTForm && (
              <div style={{ background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 20, letterSpacing: 2 }}>{editTId ? "EDIT TRAILER" : "ADD TRAILER TO ASSET BANK"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                  <FF label="Trailer Number *" value={tForm.trailer_number} onChange={v => setTForm(f => ({...f, trailer_number: v}))} placeholder="TRL-001" />
                  <Select label="Trailer Type" value={tForm.trailer_type} onChange={v => setTForm(f => ({...f, trailer_type: v}))} options={TRAILER_TYPES} />
                  <FF label="Make" value={tForm.make} onChange={v => setTForm(f => ({...f, make: v}))} placeholder="Utility, Great Dane…" />
                  <FF label="Model" value={tForm.model} onChange={v => setTForm(f => ({...f, model: v}))} placeholder="Model…" />
                  <FF label="Year" value={tForm.year} onChange={v => setTForm(f => ({...f, year: v}))} placeholder="2021" type="number" />
                  <FF label="VIN" value={tForm.vin} onChange={v => setTForm(f => ({...f, vin: v}))} placeholder="17-character VIN" />
                  <FF label="License Plate" value={tForm.license_plate} onChange={v => setTForm(f => ({...f, license_plate: v}))} placeholder="ABC-1234" />
                  <FF label="State" value={tForm.state} onChange={v => setTForm(f => ({...f, state: v}))} placeholder="TX" />
                  <Select label="Status" value={tForm.status} onChange={v => setTForm(f => ({...f, status: v}))} options={STATUS_ALL_T.map(s => ({ value: s, label: STATUS_META[s]?.label || s }))} />
                  <FF label="Assigned Truck" value={tForm.assigned_truck} onChange={v => setTForm(f => ({...f, assigned_truck: v}))} placeholder="Unit number" />
                  <FF label="Current Location" value={tForm.current_location} onChange={v => setTForm(f => ({...f, current_location: v}))} placeholder="City, State or Yard" />
                  <FF label="Length (ft)" value={tForm.length_ft} onChange={v => setTForm(f => ({...f, length_ft: v}))} placeholder="53" type="number" />
                  <FF label="Capacity (lbs)" value={tForm.load_capacity_lbs} onChange={v => setTForm(f => ({...f, load_capacity_lbs: v}))} placeholder="45000" type="number" />
                  <FF label="Purchase Price ($)" value={tForm.purchase_price} onChange={v => setTForm(f => ({...f, purchase_price: v}))} placeholder="45000" type="number" />
                  <FF label="Current Value ($)" value={tForm.current_value} onChange={v => setTForm(f => ({...f, current_value: v}))} placeholder="Leave blank to estimate" type="number" />
                  <FF label="Purchase Date" value={tForm.purchase_date} onChange={v => setTForm(f => ({...f, purchase_date: v}))} type="date" />
                  <FF label="Last Inspection" value={tForm.last_inspection} onChange={v => setTForm(f => ({...f, last_inspection: v}))} type="date" />
                  <FF label="Next Service Due" value={tForm.next_service_due} onChange={v => setTForm(f => ({...f, next_service_due: v}))} type="date" />
                  <FF label="Registration Expiry" value={tForm.registration_expiry} onChange={v => setTForm(f => ({...f, registration_expiry: v}))} type="date" />
                  <FF label="Insurance Expiry" value={tForm.insurance_expiry} onChange={v => setTForm(f => ({...f, insurance_expiry: v}))} type="date" />
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 5, textTransform: "uppercase" }}>Notes</label>
                    <textarea value={tForm.notes || ""} onChange={e => setTForm(f => ({...f, notes: e.target.value}))} placeholder="Additional notes…"
                      style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", borderRadius: 7, fontSize: 13, fontFamily: "Oswald, sans-serif", minHeight: 70, resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button onClick={saveTrailer} disabled={saving}
                    style={{ background: GOLD, color: BLACK, border: "none", padding: "12px 30px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Oswald, sans-serif", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving…" : editTId ? "Update Trailer" : "Add to Asset Bank"}
                  </button>
                  <button onClick={() => { setShowTForm(false); setEditTId(null); setTForm(EMPTY_T); }}
                    style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#666", padding: "12px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>Cancel</button>
                </div>
              </div>
            )}

            {loading ? <Spinner /> : ftra.length === 0 ? <EmptyMsg icon="📦" msg="No trailers match your search." /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
                {ftra.map(t => <AssetBankCard key={t.id} asset={t} type="trailer" onEdit={() => openEditT(t)} onDelete={() => delTrailer(t.id)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── INTELLIGENCE TAB ── */}
        {tab === "intelligence" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>

            {/* Vehicle Utilization */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>VEHICLE UTILIZATION</div>
              {STATUS_ALL_V.map(s => {
                const count = vehicles.filter(v => v.status === s).length;
                const pct   = vehicles.length ? Math.round((count / vehicles.length) * 100) : 0;
                return (
                  <div key={s} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#bbb" }}>{STATUS_META[s]?.label || s}</span>
                      <span style={{ color: STATUS_META[s]?.color || "#777", fontWeight: 700 }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#1e1e1e", borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${pct}%`, background: STATUS_META[s]?.color || "#777", borderRadius: 3, transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trailer Utilization */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>TRAILER UTILIZATION</div>
              {STATUS_ALL_T.map(s => {
                const count = trailers.filter(t => t.status === s).length;
                const pct   = trailers.length ? Math.round((count / trailers.length) * 100) : 0;
                return (
                  <div key={s} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#bbb" }}>{STATUS_META[s]?.label || s}</span>
                      <span style={{ color: STATUS_META[s]?.color || "#777", fontWeight: 700 }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#1e1e1e", borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${pct}%`, background: STATUS_META[s]?.color || "#777", borderRadius: 3, transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance Radar */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>COMPLIANCE RADAR</div>
              {(() => {
                const alerts = [];
                for (const v of vehicles) {
                  const rd = daysUntil(v.registration_expiry);
                  const id = daysUntil(v.insurance_expiry);
                  const sd = daysUntil(v.next_service_due);
                  if (rd != null && rd < 60) alerts.push({ name: v.unit_number || "Vehicle", type: "Registration", days: rd });
                  if (id != null && id < 60) alerts.push({ name: v.unit_number || "Vehicle", type: "Insurance", days: id });
                  if (sd != null && sd < 30) alerts.push({ name: v.unit_number || "Vehicle", type: "Service Due", days: sd });
                }
                for (const t of trailers) {
                  const rd = daysUntil(t.registration_expiry);
                  const sd = daysUntil(t.next_service_due);
                  if (rd != null && rd < 60) alerts.push({ name: t.trailer_number || "Trailer", type: "Registration", days: rd });
                  if (sd != null && sd < 30) alerts.push({ name: t.trailer_number || "Trailer", type: "Service Due", days: sd });
                }
                alerts.sort((a, b) => a.days - b.days);
                if (!alerts.length) return <div style={{ color: "#555", fontSize: 13 }}>No upcoming expirations — all compliance looks clear.</div>;
                return alerts.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{a.type}</div>
                    </div>
                    <div style={{ background: urgencyColor(a.days) + "20", color: urgencyColor(a.days), padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                      {urgencyLabel(a.days)}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Asset Bank Ledger */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>ASSET BANK LEDGER</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: "#888" }}>Total Assets</span>
                <span style={{ color: "#fff", fontWeight: 700 }}>{totalAll}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: "#888" }}>Vehicles in Bank</span>
                <span style={{ color: BLUE, fontWeight: 700 }}>{vehicles.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: "#888" }}>Trailers in Bank</span>
                <span style={{ color: "#a78bfa", fontWeight: 700 }}>{trailers.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: "#888" }}>Ready to Deploy</span>
                <span style={{ color: GREEN, fontWeight: 700 }}>{avail}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}>
                <span style={{ color: "#888" }}>Fleet Health Score</span>
                <span style={{ color: health >= 80 ? GREEN : health >= 60 ? AMBER : RED, fontWeight: 700 }}>{health}/100</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", fontSize: 14 }}>
                <span style={{ color: "#aaa", fontWeight: 700 }}>Estimated Bank Value</span>
                <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, fontFamily: "Oswald, sans-serif" }}>{bankVal ? fmtMoney(bankVal) : "—"}</span>
              </div>
            </div>

            {/* Intelligence Actions */}
            <div style={{ background: `linear-gradient(135deg, #1a1200, #0d0d0d)`, border: `1px solid ${GOLD}44`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>⚡ INTELLIGENCE ACTIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "⚡", label: "Re-Index All Records", action: () => { runIndex(); setTab("bank"); } },
                  { icon: "🚛", label: "Add New Vehicle",  action: () => { setVForm(EMPTY_V); setEditVId(null); setShowVForm(true); setTab("vehicles"); } },
                  { icon: "📦", label: "Add New Trailer",  action: () => { setTForm(EMPTY_T); setEditTId(null); setShowTForm(true); setTab("trailers"); } },
                  { icon: "🏦", label: "View Asset Bank",  action: () => setTab("bank") },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#ccc", padding: "12px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Oswald, sans-serif", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#ccc"; }}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        input::placeholder, textarea::placeholder { color: #444; }
        select option { background: #111; }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
      <div style={{ fontSize: 30, animation: "spin 0.8s linear infinite", display: "inline-block" }}>⚡</div>
      <div style={{ fontSize: 13, marginTop: 12 }}>Loading your asset bank…</div>
    </div>
  );
}

function EmptyMsg({ icon, msg }) {
  return (
    <div style={{ background: "#131313", border: "1px dashed #252525", borderRadius: 12, padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ color: "#555", fontSize: 14 }}>{msg}</div>
    </div>
  );
}


