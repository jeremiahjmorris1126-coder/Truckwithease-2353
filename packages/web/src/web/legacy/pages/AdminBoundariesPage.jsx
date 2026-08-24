import React, { useState } from "react";
import { ChevronRight, MapPin, AlertCircle, DollarSign } from "lucide-react";
import { getAdminUnit, getComplianceRulesForLocation, getLoadCompliance, getTaxJurisdictions, listAllSubdivisions } from "../lib/adminUnitsIntel";

const DARK_BG = "#0a0a0a";
const NAVY = "#0F172A";
const GOLD = "#C9A84C";
const ORANGE = "#FF6B00";
const BRIGHT_CYAN = "#00D9FF";
const GREEN = "#10B981";

export default function AdminBoundariesPage() {
  const [activeTab, setActiveTab] = useState("compliance");
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("IL");
  const [complianceResult, setComplianceResult] = useState(null);
  const [pickupCountry, setPickupCountry] = useState("US");
  const [pickupState, setPickupState] = useState("IL");
  const [dropCountry, setDropCountry] = useState("US");
  const [dropState, setDropState] = useState("CA");
  const [loadComplianceResult, setLoadComplianceResult] = useState(null);
  const [taxCountry, setTaxCountry] = useState("US");
  const [taxState, setTaxState] = useState("IL");
  const [taxResult, setTaxResult] = useState(null);
  const [subdivisions, setSubdivisions] = useState([]);

  const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "MX", name: "Mexico" },
  ];

  const usStates = [
    { code: "IL", name: "Illinois" },
    { code: "NY", name: "New York" },
    { code: "CA", name: "California" },
    { code: "TX", name: "Texas" },
    { code: "CO", name: "Colorado" },
    { code: "FL", name: "Florida" },
    { code: "WA", name: "Washington" },
    { code: "AZ", name: "Arizona" },
  ];

  const caProvinces = [
    { code: "ON", name: "Ontario" },
    { code: "BC", name: "British Columbia" },
    { code: "AB", name: "Alberta" },
  ];

  const mxStates = [
    { code: "CDMX", name: "Mexico City" },
    { code: "MEX", name: "State of Mexico" },
  ];

  const stateOptions = country === "US" ? usStates : country === "CA" ? caProvinces : mxStates;

  async function handleGetCompliance() {
    const result = await getComplianceRulesForLocation(country, state);
    setComplianceResult(result);
  }

  async function handleLoadCompliance() {
    const result = await getLoadCompliance(pickupCountry, pickupState, dropCountry, dropState);
    setLoadComplianceResult(result);
  }

  async function handleGetTax() {
    const result = await getTaxJurisdictions(taxCountry, taxState);
    setTaxResult(result);
  }

  async function handleListSubdivisions() {
    const result = await listAllSubdivisions(country);
    setSubdivisions(result);
  }

  return (
    <div style={{ background: DARK_BG, color: "#fff", fontFamily: "'Oswald',sans-serif", minHeight: "100vh", padding: "40px 5%" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: `rgba(255,107,0,0.15)`,
            border: `1px solid rgba(255,107,0,0.4)`,
            borderRadius: "50px",
            padding: "8px 20px",
            marginBottom: "20px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: ORANGE,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }}></span>
            Admin Boundaries Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            marginBottom: "16px",
            lineHeight: 1.1,
          }}>
            Know the Rules.
            <br />
            <span style={{ color: ORANGE }}>Every Border.</span>
          </h1>
          <p style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "700px",
            lineHeight: 1.6,
            fontFamily: "'Inter',sans-serif",
          }}>
            Real-time compliance rules, tax jurisdictions, toll zones, and administrative boundaries. 
            Drivers automatically know DOT regulations, HOS limits, fuel taxes, sales taxes, and local restrictions 
            for every state, county, and cross-border load.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: "20px", flexWrap: "wrap" }}>
          {[
            { id: "compliance", label: "📋 Location Compliance" },
            { id: "load", label: "🚛 Load Compliance" },
            { id: "tax", label: "💰 Tax Jurisdiction" },
            { id: "subdivisions", label: "🗺️ All Subdivisions" },
          ].map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? ORANGE : "transparent",
                color: activeTab === t.id ? "#0F172A" : "rgba(255,255,255,0.6)",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s",
                fontFamily: "'Oswald',sans-serif",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,107,0,0.04) 100%)`,
          border: `1.5px solid rgba(255,255,255,0.1)`,
          borderRadius: "20px",
          padding: "40px",
        }}>
          {/* Location Compliance */}
          {activeTab === "compliance" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: ORANGE }}>
                📋 Get Compliance Rules for Any Location
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Country
                  </label>
                  <select value={country} onChange={e => { setCountry(e.target.value); setState(stateOptions[0]?.code || ""); }} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: NAVY }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    State / Province
                  </label>
                  <select value={state} onChange={e => setState(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {stateOptions.map(s => (
                      <option key={s.code} value={s.code} style={{ background: NAVY }}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleGetCompliance} style={{
                background: BRIGHT_CYAN,
                color: NAVY,
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>
                Get Compliance Rules →
              </button>

              {complianceResult && !complianceResult.error && (
                <div style={{
                  background: "rgba(0,217,255,0.1)",
                  border: `1.5px solid ${BRIGHT_CYAN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: BRIGHT_CYAN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ Compliance Rules for {complianceResult.state}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>Timezone:</strong> {complianceResult.timezone}</div>
                    <div><strong>Max Driving Hours:</strong> {complianceResult.max_driving_hours} hrs/day</div>
                    <div><strong>Required Break:</strong> {complianceResult.required_break_minutes} min</div>
                    <div><strong>Sales Tax:</strong> {(complianceResult.sales_tax_rate * 100).toFixed(2)}%</div>
                    <div><strong>Fuel Tax:</strong> ${complianceResult.fuel_tax_rate.toFixed(2)}/gallon</div>
                    <div><strong>Toll Systems:</strong> {complianceResult.toll_systems.length > 0 ? complianceResult.toll_systems.join(", ") : "None"}</div>
                    <div><strong>Compliance Zone:</strong> {complianceResult.compliance_zone}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Load Compliance */}
          {activeTab === "load" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GREEN }}>
                🚛 Check Load Compliance Across Routes
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Pickup Country
                  </label>
                  <select value={pickupCountry} onChange={e => setPickupCountry(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: NAVY }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Pickup State
                  </label>
                  <select value={pickupState} onChange={e => setPickupState(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {(pickupCountry === "US" ? usStates : pickupCountry === "CA" ? caProvinces : mxStates).map(s => (
                      <option key={s.code} value={s.code} style={{ background: NAVY }}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Dropoff Country
                  </label>
                  <select value={dropCountry} onChange={e => setDropCountry(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: NAVY }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Dropoff State
                  </label>
                  <select value={dropState} onChange={e => setDropState(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {(dropCountry === "US" ? usStates : dropCountry === "CA" ? caProvinces : mxStates).map(s => (
                      <option key={s.code} value={s.code} style={{ background: NAVY }}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleLoadCompliance} style={{
                background: GREEN,
                color: "#0F172A",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>
                Check Load Compliance →
              </button>

              {loadComplianceResult && (
                <div style={{
                  background: "rgba(16,185,129,0.1)",
                  border: `1.5px solid ${GREEN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: GREEN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ Load Compliance Analysis
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ background: "rgba(255,107,0,0.1)", borderRadius: "8px", padding: "16px", border: `1px solid ${ORANGE}` }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: "8px" }}>PICKUP</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>
                        {loadComplianceResult.pickup.state} • {loadComplianceResult.pickup.timezone}
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                        Fuel Tax: ${loadComplianceResult.pickup.fuel_tax_rate.toFixed(2)}/gal
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,217,255,0.1)", borderRadius: "8px", padding: "16px", border: `1px solid ${BRIGHT_CYAN}` }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: "8px" }}>DROPOFF</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>
                        {loadComplianceResult.dropoff.state} • {loadComplianceResult.dropoff.timezone}
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                        Fuel Tax: ${loadComplianceResult.dropoff.fuel_tax_rate.toFixed(2)}/gal
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                    <div><strong>Cross-State:</strong> {loadComplianceResult.cross_state ? "Yes" : "No"}</div>
                    <div><strong>Cross-Border:</strong> {loadComplianceResult.cross_border ? "Yes" : "No"}</div>
                    <div style={{ marginTop: "12px" }}>
                      <strong>Restrictions:</strong>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: "6px" }}>
                        • Max Hours: {loadComplianceResult.restrictions.max_hours}
                        <br />
                        • Required Rest: {loadComplianceResult.restrictions.required_rest} min
                        {loadComplianceResult.restrictions.hazmat_zones.length > 0 && (
                          <>
                            <br />• Hazmat Zones: {loadComplianceResult.restrictions.hazmat_zones.join(", ")}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tax Jurisdiction */}
          {activeTab === "tax" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GOLD }}>
                💰 Tax Jurisdiction Lookup
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Country
                  </label>
                  <select value={taxCountry} onChange={e => { setTaxCountry(e.target.value); setTaxState((taxCountry === "US" ? usStates : taxCountry === "CA" ? caProvinces : mxStates)[0]?.code); }} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: NAVY }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    State / Province
                  </label>
                  <select value={taxState} onChange={e => setTaxState(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {(taxCountry === "US" ? usStates : taxCountry === "CA" ? caProvinces : mxStates).map(s => (
                      <option key={s.code} value={s.code} style={{ background: NAVY }}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleGetTax} style={{
                background: GOLD,
                color: "#0F172A",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>
                Get Tax Rates →
              </button>

              {taxResult && !taxResult.error && (
                <div style={{
                  background: "rgba(201,168,76,0.1)",
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: GOLD, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ Tax Rules for {taxResult.state}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>Sales Tax:</strong> {(taxResult.sales_tax * 100).toFixed(2)}%</div>
                    <div><strong>Fuel Tax:</strong> ${taxResult.fuel_tax.toFixed(2)}/gallon</div>
                    <div><strong>Vehicle Registration Tax:</strong> {(taxResult.vehicle_registration_tax * 100).toFixed(1)}%</div>
                    <div><strong>Income Tax:</strong> {taxResult.income_tax === 0 ? "None" : `${(taxResult.income_tax * 100).toFixed(1)}%`}</div>
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid rgba(255,255,255,0.1)`, fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                    {taxResult.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subdivisions */}
          {activeTab === "subdivisions" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: BRIGHT_CYAN }}>
                🗺️ All Subdivisions
              </h2>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                  Country
                </label>
                <select value={country} onChange={e => setCountry(e.target.value)} style={{
                  width: "100%",
                  maxWidth: "400px",
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid rgba(255,255,255,0.15)`,
                  borderRadius: "8px",
                  color: "white",
                  padding: "12px",
                  fontSize: "14px",
                }}>
                  {countries.map(c => (
                    <option key={c.code} value={c.code} style={{ background: NAVY }}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleListSubdivisions} style={{
                background: BRIGHT_CYAN,
                color: NAVY,
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>
                Load Subdivisions →
              </button>

              {subdivisions.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                }}>
                  {subdivisions.map(s => (
                    <div key={s.code} style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid rgba(255,255,255,0.1)`,
                      borderRadius: "8px",
                      padding: "16px",
                    }}>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: BRIGHT_CYAN, marginBottom: "8px" }}>
                        {s.name} ({s.code})
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                        <div>Timezone: {s.timezone}</div>
                        <div>Sales Tax: {(s.salesTax * 100).toFixed(2)}%</div>
                        <div>Fuel Tax: ${s.fuelTax.toFixed(2)}/gal</div>
                        <div>Max Hours: {s.drivingHours} hrs</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div style={{ marginTop: "60px", padding: "32px", background: `rgba(16,185,129,0.08)`, border: `1.5px solid rgba(16,185,129,0.2)`, borderRadius: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "16px", color: GREEN, display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={20} /> Why Admin Boundaries Matter
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            <div>
              <strong>🚛 Compliance Automation</strong>: Every location automatically triggers the correct DOT rules, HOS limits, and local restrictions. No manual lookup.
            </div>
            <div>
              <strong>💰 Tax Accuracy</strong>: Load pricing automatically includes state fuel tax, sales tax, and vehicle registration tax. Never underbid.
            </div>
            <div>
              <strong>🌍 Border Intelligence</strong>: Cross-border and cross-state loads flag special permits, hazmat zones, and toll system changes.
            </div>
            <div>
              <strong>📊 Route Optimization</strong>: Know which states have higher/lower taxes before accepting loads. Maximize profits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
