import React, { useState, useEffect } from "react";
import { Globe, Shield, DollarSign, Clock } from "lucide-react";
import { resolveIPLocation, checkIPThreats, geoTargetContent, validateCheckoutRisk } from "../lib/ipGeolocationIntel";

const DARK_BG = "#0a0a0a";
const NAVY = "#0F172A";
const GOLD = "#C9A84C";
const ORANGE = "#FF6B00";
const BRIGHT_CYAN = "#00D9FF";
const GREEN = "#10B981";

export default function IPGeolocationPage() {
  const [activeTab, setActiveTab] = useState("resolver");
  const [ipInput, setIpInput] = useState("8.8.8.8");
  const [locationResult, setLocationResult] = useState(null);
  const [threatsResult, setThreatsResult] = useState(null);
  const [contentResult, setContentResult] = useState(null);
  const [checkoutIP, setCheckoutIP] = useState("1.1.1.1");
  const [orderValue, setOrderValue] = useState(500);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [userIP, setUserIP] = useState(null);

  useEffect(() => {
    // Get user's own IP for demo
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => {});
  }, []);

  async function handleResolveIP() {
    const result = await resolveIPLocation(ipInput);
    setLocationResult(result);
  }

  async function handleCheckThreats() {
    const result = await checkIPThreats(ipInput);
    setThreatsResult(result);
  }

  async function handleGeoTarget() {
    const result = await geoTargetContent(ipInput);
    setContentResult(result);
  }

  async function handleCheckout() {
    const result = await validateCheckoutRisk(checkoutIP, orderValue);
    setCheckoutResult(result);
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
            background: `rgba(0,217,255,0.15)`,
            border: `1px solid rgba(0,217,255,0.4)`,
            borderRadius: "50px",
            padding: "8px 20px",
            marginBottom: "20px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: BRIGHT_CYAN,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }}></span>
            IP Geolocation Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            marginBottom: "16px",
            lineHeight: 1.1,
          }}>
            Every IP Tells <span style={{ color: BRIGHT_CYAN }}>a Story.</span>
          </h1>
          <p style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "700px",
            lineHeight: 1.6,
            fontFamily: "'Inter',sans-serif",
          }}>
            Any IPv4, IPv6, or hostname resolves to location, ISP, timezone, currency, and threat level. 
            Geo-target content, screen fraud at checkout, enrich logs with context, and identify VPNs and datacenters instantly.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: "20px", flexWrap: "wrap" }}>
          {[
            { id: "resolver", label: "🌍 IP Resolver" },
            { id: "threats", label: "🛡️ Threat Check" },
            { id: "targeting", label: "🎯 Geo-Targeting" },
            { id: "checkout", label: "💳 Checkout Risk" },
          ].map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? BRIGHT_CYAN : "transparent",
                color: activeTab === t.id ? NAVY : "rgba(255,255,255,0.6)",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,217,255,0.04) 100%)`,
          border: `1.5px solid rgba(255,255,255,0.1)`,
          borderRadius: "20px",
          padding: "40px",
        }}>
          {/* IP Resolver */}
          {activeTab === "resolver" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: BRIGHT_CYAN }}>
                🌍 Resolve Any IP Address
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address or Hostname</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} placeholder="8.8.8.8" style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <button onClick={handleResolveIP} style={{
                  background: BRIGHT_CYAN,
                  color: NAVY,
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Resolve</button>
              </div>

              {locationResult && (
                <div style={{
                  background: "rgba(0,217,255,0.1)",
                  border: `1.5px solid ${BRIGHT_CYAN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: BRIGHT_CYAN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ Location Data
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>IP:</strong> {locationResult.ip}</div>
                    <div><strong>Hostname:</strong> {locationResult.hostname || "N/A"}</div>
                    <div><strong>City:</strong> {locationResult.city}</div>
                    <div><strong>Region:</strong> {locationResult.region_name}</div>
                    <div><strong>Country:</strong> {locationResult.country_name} ({locationResult.country})</div>
                    <div><strong>Coordinates:</strong> {locationResult.latitude}, {locationResult.longitude}</div>
                    <div><strong>Timezone:</strong> {locationResult.timezone}</div>
                    <div><strong>Currency:</strong> {locationResult.currency} {locationResult.currency_symbol}</div>
                    <div><strong>ISP:</strong> {locationResult.isp}</div>
                    <div><strong>ASN:</strong> {locationResult.asn}</div>
                    <div><strong>Network:</strong> {locationResult.network}</div>
                    <div><strong>Type:</strong> {locationResult.is_datacenter ? "Datacenter" : locationResult.is_residential ? "Residential" : "Other"}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Threat Check */}
          {activeTab === "threats" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: "rgb(239, 68, 68)" }}>
                🛡️ Check for VPN/Proxy/Datacenter
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} placeholder="1.1.1.1" style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <button onClick={handleCheckThreats} style={{
                  background: "rgb(239, 68, 68)",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Check</button>
              </div>

              {threatsResult && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: `1.5px solid rgb(239, 68, 68)`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: "rgb(239, 68, 68)", marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Security Assessment
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                  }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>THREAT LEVEL</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: threatsResult.threat_level === "high" ? "rgb(239, 68, 68)" : threatsResult.threat_level === "medium" ? ORANGE : GREEN }}>
                        {threatsResult.threat_level.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>VPN DETECTED</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: threatsResult.is_vpn ? "rgb(239, 68, 68)" : GREEN }}>
                        {threatsResult.is_vpn ? "YES" : "NO"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>PROXY</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: threatsResult.is_proxy ? "rgb(239, 68, 68)" : GREEN }}>
                        {threatsResult.is_proxy ? "YES" : "NO"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>DATACENTER</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: threatsResult.is_datacenter ? ORANGE : GREEN }}>
                        {threatsResult.is_datacenter ? "YES" : "NO"}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                    <div><strong>Action:</strong> {threatsResult.recommended_action}</div>
                    <div style={{ marginTop: "12px" }}>
                      {Object.entries(threatsResult.risk_factors).map(([k, v]) => (
                        <div key={k}>• {v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Geo-Targeting */}
          {activeTab === "targeting" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GOLD }}>
                🎯 Geo-Target Content & Currency
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} placeholder="8.8.8.8" style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <button onClick={handleGeoTarget} style={{
                  background: GOLD,
                  color: "#0F172A",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Analyze</button>
              </div>

              {contentResult && (
                <div style={{
                  background: "rgba(201,168,76,0.1)",
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: GOLD, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Content & Currency for {contentResult.city}, {contentResult.region}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>CURRENCY</div>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>{contentResult.currency_symbol} {contentResult.currency}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>LANGUAGE</div>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>{contentResult.language.toUpperCase()}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>TIMEZONE</div>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>{contentResult.timezone.split("/")[1]}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>CALLING CODE</div>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>{contentResult.calling_code}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>
                    <div><strong>Welcome Message:</strong> {contentResult.content.welcome}</div>
                    <div><strong>Pricing:</strong> {contentResult.content.pricing_currency}</div>
                    <div><strong>Local Time:</strong> {contentResult.content.local_time}</div>
                    <div><strong>Offers:</strong> {contentResult.content.offers}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Checkout Risk */}
          {activeTab === "checkout" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GREEN }}>
                💳 Screen Fraud at Checkout
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>Customer IP</label>
                  <input type="text" value={checkoutIP} onChange={e => setCheckoutIP(e.target.value)} placeholder="1.1.1.1" style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>Order Value ($)</label>
                  <input type="number" value={orderValue} onChange={e => setOrderValue(Number(e.target.value))} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
              </div>
              <button onClick={handleCheckout} style={{
                background: GREEN,
                color: "#0F172A",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>Assess Risk</button>

              {checkoutResult && (
                <div style={{
                  background: checkoutResult.risk_level === "high" ? "rgba(239, 68, 68, 0.1)" : checkoutResult.risk_level === "medium" ? "rgba(255,107,0,0.1)" : "rgba(16,185,129,0.1)",
                  border: `1.5px solid ${checkoutResult.risk_level === "high" ? "rgb(239, 68, 68)" : checkoutResult.risk_level === "medium" ? ORANGE : GREEN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: checkoutResult.risk_level === "high" ? "rgb(239, 68, 68)" : checkoutResult.risk_level === "medium" ? ORANGE : GREEN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Risk Assessment: ${checkoutResult.order_value}
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                  }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>RISK SCORE</div>
                      <div style={{ fontSize: "24px", fontWeight: 900 }}>{checkoutResult.risk_score}/100</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>RISK LEVEL</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: checkoutResult.risk_level === "high" ? "rgb(239, 68, 68)" : checkoutResult.risk_level === "medium" ? ORANGE : GREEN }}>
                        {checkoutResult.risk_level.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>
                    <div><strong>Geolocation:</strong> {checkoutResult.geolocation}</div>
                    <div><strong>ISP:</strong> {checkoutResult.isp}</div>
                    <div><strong>Action:</strong> {checkoutResult.recommended_action}</div>
                    {checkoutResult.risk_factors.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <strong>Risk Factors:</strong>
                        {checkoutResult.risk_factors.map(f => <div key={f}>• {f}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: "60px", padding: "32px", background: `rgba(0,217,255,0.08)`, border: `1.5px solid rgba(0,217,255,0.2)`, borderRadius: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "16px", color: BRIGHT_CYAN, display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={20} /> Why IP Geolocation Matters
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            <div>
              <strong>🎯 Geo-Targeting</strong>: Serve pricing in local currency, content in local language, offers by region — all automatically detected from visitor IP.
            </div>
            <div>
              <strong>🛡️ Fraud Prevention</strong>: Detect VPNs, proxies, datacenters at checkout. Flag high-risk orders before they process.
            </div>
            <div>
              <strong>📍 Log Enrichment</strong>: Add geolocation context to every server log. Know not just *what* happened, but *where* and *who*.
            </div>
            <div>
              <strong>🏢 Compliance</strong>: Identify which jurisdictions your traffic comes from. Essential for GDPR, CCPA, tax compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
