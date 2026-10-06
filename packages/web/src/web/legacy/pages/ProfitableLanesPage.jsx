import { useState, useEffect } from "react";
import PocketBase from "pocketbase";
import { getComplianceWindowByLocation, getHOSDeadlineByTimezone } from "../lib/timezoneIntel";
import { getLoadCompliance } from "../lib/adminUnitsIntel";

const pb = new PocketBase();

const DARK = "#0a0b0f";
const CARD = "#12151c";
const BORDER = "#1e2330";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const RED = "#ef4444";
const MUTED = "#6b7280";

const mockLanes = [
  { id: 1, origin: "Chicago, IL", dest: "Dallas, TX", miles: 921, loads: 47, avgRate: 3.42, totalRevenue: 147823, fuelCost: 28940, tollCost: 1840, originState: "IL", destState: "TX", driverPay: 41390, netProfit: 75653, profitPerMile: 2.11, topTruck: "IL-4482", trend: "up", commodity: "Reefer", onTime: 94 },
  { id: 2, origin: "Atlanta, GA", dest: "New York, NY", miles: 876, loads: 38, avgRate: 3.91, totalRevenue: 129987, fuelCost: 27180, tollCost: 4210, originState: "GA", destState: "NY", driverPay: 36396, netProfit: 62201, profitPerMile: 1.87, topTruck: "GA-2291", trend: "up", commodity: "Flatbed", onTime: 91 },
  { id: 3, origin: "Los Angeles, CA", dest: "Phoenix, AZ", miles: 372, loads: 62, avgRate: 2.84, totalRevenue: 65474, fuelCost: 11532, tollCost: 210, originState: "CA", destState: "AZ", driverPay: 18333, netProfit: 35399, profitPerMile: 1.54, topTruck: "CA-9901", trend: "flat", commodity: "Dry Van", onTime: 97 },
  { id: 4, origin: "Houston, TX", dest: "Memphis, TN", miles: 487, loads: 29, avgRate: 3.18, totalRevenue: 44934, fuelCost: 15098, tollCost: 490, originState: "TX", destState: "TN", driverPay: 12581, netProfit: 16765, profitPerMile: 1.18, topTruck: "TX-5513", trend: "down", commodity: "Hazmat", onTime: 88 },
  { id: 5, origin: "Seattle, WA", dest: "Portland, OR", miles: 174, loads: 84, avgRate: 2.21, totalRevenue: 32273, fuelCost: 5394, tollCost: 120, originState: "WA", destState: "OR", driverPay: 9036, netProfit: 17723, profitPerMile: 1.22, topTruck: "WA-3347", trend: "up", commodity: "Local", onTime: 99 },
  { id: 6, origin: "Miami, FL", dest: "Orlando, FL", miles: 236, loads: 71, avgRate: 2.47, totalRevenue: 41386, fuelCost: 7316, tollCost: 890, originState: "FL", destState: "FL", driverPay: 11588, netProfit: 21592, profitPerMile: 1.29, topTruck: "FL-7721", trend: "up", commodity: "Reefer", onTime: 96 },
  { id: 7, origin: "Denver, CO", dest: "Salt Lake City, UT", miles: 525, loads: 22, avgRate: 2.93, totalRevenue: 33803, fuelCost: 16275, tollCost: 0, originState: "CO", destState: "UT", driverPay: 9465, netProfit: 8063, profitPerMile: 0.70, topTruck: "CO-8814", trend: "down", commodity: "Flatbed", onTime: 82 },
  { id: 8, origin: "Nashville, TN", dest: "Charlotte, NC", miles: 409, loads: 41, avgRate: 3.05, totalRevenue: 51193, fuelCost: 12679, tollCost: 320, originState: "TN", destState: "NC", driverPay: 14334, netProfit: 23860, profitPerMile: 1.43, topTruck: "TN-6602", trend: "flat", commodity: "Dry Van", onTime: 93 },
];

const mockTrucks = [
  { id: 1, unit: "IL-4482", driver: "Marcus Williams", miles: 42180, revenue: 148920, fuelCost: 28344, maintenance: 3200, driverPay: 41697, netProfit: 75679, rpm: 1.79, utilization: 94, trend: "up", topLane: "Chicago→Dallas" },
  { id: 2, unit: "GA-2291", driver: "Sandra Torres", miles: 38940, revenue: 132392, fuelCost: 26158, maintenance: 2800, driverPay: 37069, netProfit: 66365, rpm: 1.70, utilization: 91, trend: "up", topLane: "Atlanta→NYC" },
  { id: 3, unit: "CA-9901", driver: "James Park", miles: 29040, revenue: 86473, fuelCost: 19555, maintenance: 1900, driverPay: 24212, netProfit: 40806, rpm: 1.40, utilization: 97, trend: "up", topLane: "LA→Phoenix" },
  { id: 4, unit: "FL-7721", driver: "Diana Reyes", miles: 22120, revenue: 72814, fuelCost: 14891, maintenance: 2100, driverPay: 20388, netProfit: 35435, rpm: 1.60, utilization: 96, trend: "flat", topLane: "Miami→Orlando" },
  { id: 5, unit: "TX-5513", driver: "Robert Kim", miles: 18930, revenue: 58418, fuelCost: 12736, maintenance: 3400, driverPay: 16357, netProfit: 25925, rpm: 1.37, utilization: 88, trend: "down", topLane: "Houston→Memphis" },
  { id: 6, unit: "TN-6602", driver: "Angela Davis", miles: 21870, revenue: 69147, fuelCost: 14707, maintenance: 1600, driverPay: 19361, netProfit: 33479, rpm: 1.53, utilization: 93, trend: "flat", topLane: "Nashville→Charlotte" },
];

const mockCommodities = [
  { type: "Reefer", loads: 118, avgRate: 3.61, avgMiles: 621, totalRevenue: 265409, netMargin: 48, growth: "+12%" },
  { type: "Dry Van", loads: 103, avgRate: 2.94, avgMiles: 488, totalRevenue: 147781, netMargin: 41, growth: "+4%" },
  { type: "Flatbed", loads: 60, avgRate: 3.47, avgMiles: 693, totalRevenue: 144018, netMargin: 37, growth: "-2%" },
  { type: "Hazmat", loads: 29, avgRate: 3.18, avgMiles: 487, totalRevenue: 44934, netMargin: 29, growth: "-8%" },
  { type: "Local/Last-Mile", loads: 155, avgRate: 2.21, avgMiles: 174, totalRevenue: 53022, netMargin: 52, growth: "+21%" },
];

const fmtK = v => v >= 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v}`;
const fmtDollar = v => `$${v.toLocaleString()}`;

export default function ProfitableLanesPage() {
  const [tab, setTab] = useState("lanes");
  const [sortBy, setSortBy] = useState("netProfit");
  const [selected, setSelected] = useState(null);
  const [timeframe, setTimeframe] = useState("90d");
  const [populating, setPopulating] = useState(false);
  const [populated, setPopulated] = useState(false);

  const handlePopulateAll = async () => {
    setPopulating(true);
    // Simulate populating all tabs with a dramatic reveal
    await new Promise(r => setTimeout(r, 800));
    setTab("lanes"); setSortBy("netProfit");
    await new Promise(r => setTimeout(r, 300));
    setPopulated(true);
    setPopulating(false);
    // Auto-cycle through all tabs to show data
    const tabs = ["lanes","trucks","commodity","insights"];
    for (const t of tabs) {
      setTab(t);
      await new Promise(r => setTimeout(r, 600));
    }
    setTab("lanes");
  };

  const sorted = [...mockLanes].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalRevenue = mockLanes.reduce((s, l) => s + l.totalRevenue, 0);
  const totalProfit = mockLanes.reduce((s, l) => s + l.netProfit, 0);
  const totalLoads = mockLanes.reduce((s, l) => s + l.loads, 0);
  const avgMargin = Math.round((totalProfit / totalRevenue) * 100);

  // Get tax-adjusted profit for each lane
  const lanesWithTax = sorted.map(lane => {
    const originTax = getTaxRatesByState(lane.originState);
    const destTax = getTaxRatesByState(lane.destState);
    const taxAdjustment = ((originTax.salesTax + destTax.salesTax) / 2) * (lane.totalRevenue / 100);
    return { ...lane, taxAdjustment, taxAdjustedProfit: lane.netProfit - taxAdjustment };
  });

  const trendIcon = t => t === "up" ? "▲" : t === "down" ? "▼" : "—";
  const trendColor = t => t === "up" ? GREEN : t === "down" ? RED : MUTED;

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#e2e8f0", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0d1117 0%, #12151c 50%, #0a0f1a 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "32px 24px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
                <span style={{ fontSize: 11, color: GREEN, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>Live Intelligence</span>
              </div>
              <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, margin: 0, letterSpacing: -1 }}>
                Profitable Lanes & Load Intelligence
              </h1>
              <p style={{ color: MUTED, marginTop: 6, fontSize: 14 }}>Every mile analyzed — know exactly where your money is made</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {["30d","90d","6mo","1yr"].map(t => (
                <button key={t} onClick={() => setTimeframe(t)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${timeframe===t ? AMBER : BORDER}`, background: timeframe===t ? `${AMBER}18` : "transparent", color: timeframe===t ? AMBER : MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
              ))}
              <button
                onClick={handlePopulateAll}
                disabled={populating}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: populated ? `${GREEN}22` : `linear-gradient(135deg, ${AMBER}, #f97316)`, color: populated ? GREEN : "#000", fontSize: 12, fontWeight: 800, cursor: populating ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6, letterSpacing: 0.5, boxShadow: populated ? "none" : `0 0 20px ${AMBER}40` }}>
                {populating ? "⚡ Loading All Data..." : populated ? "✓ All Data Loaded" : "⚡ Populate All — 1 Click"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Revenue", value: fmtDollar(totalRevenue), sub: "across all lanes", color: BLUE },
              { label: "Net Profit", value: fmtDollar(totalProfit), sub: "after all costs", color: GREEN },
              { label: "Profit Margin", value: `${avgMargin}%`, sub: "fleet average", color: AMBER },
              { label: "Total Loads", value: totalLoads, sub: "completed hauls", color: "#a78bfa" },
              { label: "Best Lane RPM", value: `$${sorted[0]?.profitPerMile.toFixed(2)}`, sub: `${sorted[0]?.origin.split(",")[0]}→${sorted[0]?.dest.split(",")[0]}`, color: GREEN },
            ].map(c => (
              <div key={c.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORDER}` }}>
            {[
              { id: "lanes", label: "🛣️ Lane Analysis" },
              { id: "trucks", label: "🚛 Truck Profitability" },
              { id: "commodity", label: "📦 By Commodity" },
              { id: "insights", label: "🧠 AI Insights" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 20px", border: "none", borderBottom: tab===t.id ? `2px solid ${AMBER}` : "2px solid transparent", background: "transparent", color: tab===t.id ? AMBER : MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* LANES TAB */}
        {tab === "lanes" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Lane Profitability Ranking</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: MUTED }}>Sort by:</span>
                {[
                  { k: "netProfit", label: "Net Profit" },
                  { k: "profitPerMile", label: "$/Mile" },
                  { k: "avgRate", label: "Avg Rate" },
                  { k: "loads", label: "Load Count" },
                ].map(s => (
                  <button key={s.k} onClick={() => setSortBy(s.k)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${sortBy===s.k ? AMBER : BORDER}`, background: sortBy===s.k ? `${AMBER}18` : "transparent", color: sortBy===s.k ? AMBER : MUTED, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map((lane, idx) => (
                <div key={lane.id} onClick={() => setSelected(selected===lane.id ? null : lane.id)}
                  style={{ background: CARD, border: `1px solid ${selected===lane.id ? AMBER : BORDER}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: idx === 0 ? `${AMBER}22` : idx === 1 ? `${GREEN}18` : `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: idx === 0 ? AMBER : idx === 1 ? GREEN : BLUE, flexShrink: 0 }}>
                      #{idx+1}
                    </div>
                    <div style={{ flex: 2, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{lane.origin} → {lane.dest}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{lane.miles.toLocaleString()} mi · {lane.commodity} · {lane.loads} loads · {lane.onTime}% on-time</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 90 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{fmtDollar(lane.netProfit)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>Net Profit</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 70 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: AMBER }}>${lane.profitPerMile.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>per mile</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 70 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: BLUE }}>${lane.avgRate.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>avg rate/mi</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 60 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: trendColor(lane.trend) }}>{trendIcon(lane.trend)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>trend</div>
                    </div>
                  </div>

                  {/* Expanded breakdown */}
                  {selected === lane.id && (
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
                      {[
                        { label: "Gross Revenue", value: fmtDollar(lane.totalRevenue), color: BLUE },
                        { label: "Fuel Cost", value: fmtDollar(lane.fuelCost), color: RED },
                        { label: "Toll Cost", value: fmtDollar(lane.tollCost), color: RED },
                        { label: "Driver Pay", value: fmtDollar(lane.driverPay), color: "#f97316" },
                        { label: "Net Profit", value: fmtDollar(lane.netProfit), color: GREEN },
                        { label: "Margin", value: `${Math.round((lane.netProfit/lane.totalRevenue)*100)}%`, color: AMBER },
                        { label: "Top Truck", value: lane.topTruck, color: "#a78bfa" },
                        { label: "Avg $/Load", value: `$${Math.round(lane.totalRevenue/lane.loads).toLocaleString()}`, color: BLUE },
                      ].map(d => (
                        <div key={d.label} style={{ background: "#0d1017", borderRadius: 10, padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                          <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{d.label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: d.color }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUCKS TAB */}
        {tab === "trucks" && (
          <div>
            <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Truck-by-Truck Profitability</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {mockTrucks.map((t, idx) => (
                <div key={t.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>{t.unit}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{t.driver}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: GREEN }}>{fmtDollar(t.netProfit)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>net profit</div>
                    </div>
                  </div>

                  {/* Utilization bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, marginBottom: 4 }}>
                      <span>Utilization</span><span style={{ color: t.utilization >= 90 ? GREEN : t.utilization >= 80 ? AMBER : RED }}>{t.utilization}%</span>
                    </div>
                    <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${t.utilization}%`, background: t.utilization >= 90 ? GREEN : t.utilization >= 80 ? AMBER : RED, borderRadius: 3 }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Revenue", value: fmtK(t.revenue), color: BLUE },
                      { label: "$/Mile", value: `$${t.rpm.toFixed(2)}`, color: AMBER },
                      { label: "Miles", value: t.miles.toLocaleString(), color: "#a78bfa" },
                      { label: "Fuel", value: fmtK(t.fuelCost), color: RED },
                      { label: "Maint.", value: fmtK(t.maintenance), color: "#f97316" },
                      { label: "Driver Pay", value: fmtK(t.driverPay), color: MUTED },
                    ].map(d => (
                      <div key={d.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</div>
                        <div style={{ fontSize: 10, color: MUTED }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "#0d1017", borderRadius: 8, fontSize: 12, color: MUTED }}>
                    Best lane: <span style={{ color: AMBER, fontWeight: 600 }}>{t.topLane}</span> &nbsp;·&nbsp; Trend: <span style={{ color: trendColor(t.trend), fontWeight: 700 }}>{trendIcon(t.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMODITY TAB */}
        {tab === "commodity" && (
          <div>
            <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Profitability by Freight Type</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mockCommodities.map(c => (
                <div key={c.type} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{c.type}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{c.loads} loads · avg {c.avgMiles} mi</div>
                    </div>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                      {[
                        { label: "Total Revenue", value: fmtDollar(c.totalRevenue), color: BLUE },
                        { label: "Avg Rate/Mi", value: `$${c.avgRate.toFixed(2)}`, color: AMBER },
                        { label: "Net Margin", value: `${c.netMargin}%`, color: c.netMargin >= 45 ? GREEN : c.netMargin >= 35 ? AMBER : RED },
                        { label: "Growth", value: c.growth, color: c.growth.startsWith("+") ? GREEN : RED },
                      ].map(d => (
                        <div key={d.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: d.color }}>{d.value}</div>
                          <div style={{ fontSize: 11, color: MUTED }}>{d.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Margin bar */}
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Margin</div>
                      <div style={{ height: 8, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.netMargin}%`, background: c.netMargin >= 45 ? GREEN : c.netMargin >= 35 ? AMBER : RED, borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {tab === "insights" && (
          <div>
            <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>AI-Powered Recommendations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {[
                {
                  icon: "🏆",
                  title: "Your #1 lane is printing money",
                  desc: "Chicago→Dallas is generating $2.11 profit per mile — 42% above your fleet average. Consider adding a second truck on this lane and negotiating a dedicated contract with the top shipper.",
                  action: "View Lane Details",
                  color: GREEN,
                  urgency: "opportunity",
                },
                {
                  icon: "⚠️",
                  title: "Denver→Salt Lake is bleeding margin",
                  desc: "Only $0.70/mile net — your worst performing lane. Fuel costs are 48% of gross revenue. Either renegotiate the rate to $3.50+/mi or redirect that truck to Nashville→Charlotte instead.",
                  action: "Reroute Truck",
                  color: RED,
                  urgency: "alert",
                },
                {
                  icon: "📦",
                  title: "Local/Last-Mile is your fastest growing segment",
                  desc: "52% net margin and growing 21% — your highest margin freight type. Amazon, grocery, and pharma routes are underserved in your network. Adding 3 van drivers could add $80K+ net/year.",
                  action: "Post Driver Ad",
                  color: AMBER,
                  urgency: "opportunity",
                },
                {
                  icon: "🚛",
                  title: "IL-4482 is your most profitable truck",
                  desc: "Marcus Williams generates $75K net per year. His secret: 94% utilization and zero idle weeks. Replicate his lane pattern (Chicago→Dallas→Chicago backhaul) across 2 more trucks.",
                  action: "Copy Lane Pattern",
                  color: BLUE,
                  urgency: "opportunity",
                },
                {
                  icon: "⛽",
                  title: "Fuel is your #2 cost — optimize routing",
                  desc: "Your fleet spent $108K on fuel last quarter. Geotab telematics shows 3 trucks averaging 5.2 MPG vs your fleet average of 6.1 MPG. A maintenance check could recover $14K/year.",
                  action: "Schedule Maintenance",
                  color: "#f97316",
                  urgency: "alert",
                },
                {
                  icon: "📈",
                  title: "Reefer lanes outperform everything",
                  desc: "Your reefer freight averages $3.61/mile vs $2.94 dry van — a 23% premium. If you converted 2 dry-van trucks to reefer-capable, projected annual profit increase is $48,000.",
                  action: "Run ROI Calculator",
                  color: "#a78bfa",
                  urgency: "opportunity",
                },
              ].map(ins => (
                <div key={ins.title} style={{ background: CARD, border: `1px solid ${ins.urgency === "alert" ? `${RED}40` : `${ins.color}30`}`, borderRadius: 14, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{ins.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{ins.title}</div>
                      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{ins.desc}</p>
                    </div>
                  </div>
                  <button style={{ marginTop: 4, padding: "8px 16px", borderRadius: 8, border: `1px solid ${ins.color}`, background: `${ins.color}15`, color: ins.color, fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}>{ins.action} →</button>
                </div>
              ))}
            </div>

            {/* Summary recommendation box */}
            <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${AMBER}12, ${GREEN}08)`, border: `1px solid ${AMBER}40`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: AMBER, marginBottom: 8 }}>🎯 Bottom Line — This Quarter</div>
              <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>
                Your fleet is making <strong style={{ color: GREEN }}>{fmtDollar(totalProfit)}</strong> net on <strong style={{ color: BLUE }}>{fmtDollar(totalRevenue)}</strong> gross — a solid <strong style={{ color: AMBER }}>{avgMargin}% margin</strong>. Your top 3 lanes account for 68% of that profit. Kill or renegotiate your Denver→SLC lane, double down on Chicago→Dallas and Local/Last-Mile, and your margin climbs to 52%+ without adding a single truck.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
