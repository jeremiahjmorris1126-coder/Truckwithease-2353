import React, { useState } from "react";
import { ChevronRight, MapPin, Clock, AlertCircle } from "lucide-react";
import { resolveTimezone, convertTimeBetweenZones, getHOSDeadlineByTimezone } from "../lib/timezoneIntel";
import { calculateHOSDeadline, checkHOSCompliance, getHOSWindowByTimezone, logHOSEvent, validateHOSBeforeAccept } from '../lib/hosTimezoneCalculator';

const DARK_BG = "#0a0a0a";
const NAVY = "#0F172A";
const GOLD = "#C9A84C";
const ORANGE = "#FF6B00";
const BRIGHT_CYAN = "#00D9FF";
const GREEN = "#10B981";

export default function TimezoneIntelligencePage() {
  const [activeTab, setActiveTab] = useState("resolver");
  const [resolverInput, setResolverInput] = useState("chicago");
  const [resolverType, setResolverType] = useState("city_name");
  const [resolverResult, setResolverResult] = useState(null);
  const [convertFrom, setConvertFrom] = useState("America/Chicago");
  const [convertTo, setConvertTo] = useState("America/Los_Angeles");
  const [convertResult, setConvertResult] = useState(null);
  const [hosTimezone, setHosTimezone] = useState("America/Chicago");
  const [hosHours, setHosHours] = useState(11);
  const [hosResult, setHosResult] = useState(null);

  const timezones = [
    { id: "America/Chicago", name: "Central (CT)", offset: "-06:00" },
    { id: "America/New_York", name: "Eastern (ET)", offset: "-05:00" },
    { id: "America/Los_Angeles", name: "Pacific (PT)", offset: "-08:00" },
    { id: "America/Denver", name: "Mountain (MT)", offset: "-07:00" },
  ];

  const inputTypes = [
    { id: "city_name", label: "City Name", placeholder: "Chicago" },
    { id: "iata_code", label: "Airport (IATA)", placeholder: "ORD" },
    { id: "icao_code", label: "Airport (ICAO)", placeholder: "KORD" },
    { id: "un_locode", label: "Port (UN/LOCODE)", placeholder: "USNYC" },
    { id: "timezone_name", label: "Timezone", placeholder: "America/Chicago" },
    { id: "coordinates", label: "GPS (lat,lng)", placeholder: "41.8781,-87.6298" },
    { id: "ip_address", label: "IP Address", placeholder: "8.8.8.8" },
  ];

  async function handleResolve() {
    const result = await resolveTimezone(resolverInput, resolverType);
    setResolverResult(result);
  }

  async function handleConvert() {
    const now = Math.floor(Date.now() / 1000);
    const result = await convertTimeBetweenZones(now, convertFrom, convertTo);
    setConvertResult(result);
  }

  async function handleHOSDeadline() {
    const result = await getHOSDeadlineByTimezone(new Date().toISOString(), hosHours, hosTimezone);
    setHosResult(result);
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
            Timezone Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            marginBottom: "16px",
            lineHeight: 1.1,
          }}>
            Any Location Format.
            <br />
            <span style={{ color: BRIGHT_CYAN }}>Instant Timezone Data.</span>
          </h1>
          <p style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "700px",
            lineHeight: 1.6,
            fontFamily: "'Inter',sans-serif",
          }}>
            IP address, GPS coordinates, city name, airport code, port code, or timezone name — we resolve it all to 
            current time, UTC offset, DST status, and compliance windows. Critical for HOS deadlines and multi-zone operations.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: "20px", flexWrap: "wrap" }}>
          {[
            { id: "resolver", label: "🌍 Location Resolver" },
            { id: "converter", label: "🔄 Timezone Converter" },
            { id: "hos", label: "📋 HOS Deadline Calculator" },
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
              }}
              onMouseEnter={e => {
                if (activeTab !== t.id) e.currentTarget.style.color = "white";
              }}
              onMouseLeave={e => {
                if (activeTab !== t.id) e.currentTarget.style.color = "rgba(255,255,255,0.6)";
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
          {/* Location Resolver */}
          {activeTab === "resolver" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: BRIGHT_CYAN }}>
                🌍 Resolve Any Location to Timezone
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Input Type
                  </label>
                  <select value={resolverType} onChange={e => setResolverType(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}>
                    {inputTypes.map(t => (
                      <option key={t.id} value={t.id} style={{ background: NAVY }}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {inputTypes.find(t => t.id === resolverType)?.label}
                  </label>
                  <input
                    type="text"
                    value={resolverInput}
                    onChange={e => setResolverInput(e.target.value)}
                    placeholder={inputTypes.find(t => t.id === resolverType)?.placeholder}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.08)",
                      border: `1px solid rgba(255,255,255,0.15)`,
                      borderRadius: "8px",
                      color: "white",
                      padding: "12px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>
              <button onClick={handleResolve} style={{
                background: BRIGHT_CYAN,
                color: NAVY,
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "inherit",
                marginBottom: "24px",
              }}>
                Resolve Timezone →
              </button>

              {resolverResult && (
                <div style={{
                  background: "rgba(16,185,129,0.1)",
                  border: `1.5px solid ${GREEN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: GREEN, marginBottom: "16px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ Resolved: {resolverResult.name}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>Timezone:</strong> {resolverResult.timezone}</div>
                    <div><strong>Abbreviation:</strong> {resolverResult.abbr}</div>
                    <div><strong>UTC Offset:</strong> {resolverResult.utcOffset}</div>
                    <div><strong>DST Active:</strong> {resolverResult.isDST ? "Yes" : "No"}</div>
                    {resolverResult.name && <div><strong>Airport:</strong> {resolverResult.name}</div>}
                    {resolverResult.city && <div><strong>City:</strong> {resolverResult.city}, {resolverResult.state}</div>}
                    {resolverResult.elevation && <div><strong>Elevation:</strong> {resolverResult.elevation} ft</div>}
                    <div><strong>Current Time:</strong> {new Date(resolverResult.currentTime).toLocaleTimeString()}</div>
                    <div><strong>Unix Timestamp:</strong> {resolverResult.unixTimestamp}</div>
                    {resolverResult.nextDSTTransition && <div><strong>Next DST:</strong> {new Date(resolverResult.nextDSTTransition).toLocaleDateString()}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timezone Converter */}
          {activeTab === "converter" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: ORANGE }}>
                🔄 Convert Time Between Timezones
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    From Timezone
                  </label>
                  <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {timezones.map(tz => (
                      <option key={tz.id} value={tz.id} style={{ background: NAVY }}>{tz.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    To Timezone
                  </label>
                  <select value={convertTo} onChange={e => setConvertTo(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {timezones.map(tz => (
                      <option key={tz.id} value={tz.id} style={{ background: NAVY }}>{tz.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleConvert} style={{
                background: ORANGE,
                color: "#0F172A",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>
                Convert Time →
              </button>

              {convertResult && (
                <div style={{
                  background: "rgba(255,107,0,0.1)",
                  border: `1.5px solid ${ORANGE}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: ORANGE, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Time Conversion Result
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>
                        Original ({timezones.find(t => t.id === convertFrom)?.name})
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: GOLD }}>
                        {new Date(convertResult.original.time).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>
                        Converted ({timezones.find(t => t.id === convertTo)?.name})
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: BRIGHT_CYAN }}>
                        {new Date(convertResult.converted.time).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HOS Deadline */}
          {activeTab === "hos" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GREEN }}>
                📋 Calculate HOS Deadline by Timezone
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Driver Timezone
                  </label>
                  <select value={hosTimezone} onChange={e => setHosTimezone(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }}>
                    {timezones.map(tz => (
                      <option key={tz.id} value={tz.id} style={{ background: NAVY }}>{tz.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px", textTransform: "uppercase" }}>
                    Driving Hours (1-14)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={hosHours}
                    onChange={e => setHosHours(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.08)",
                      border: `1px solid rgba(255,255,255,0.15)`,
                      borderRadius: "8px",
                      color: "white",
                      padding: "12px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
              <button onClick={handleHOSDeadline} style={{
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
                Calculate Deadline →
              </button>

              {hosResult && (
                <div style={{
                  background: "rgba(16,185,129,0.1)",
                  border: `1.5px solid ${GREEN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: GREEN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    ✓ HOS Deadline Calculated
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontWeight: 700 }}>START TIME</div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: GOLD }}>
                        {new Date(hosResult.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontWeight: 700 }}>DEADLINE</div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: BRIGHT_CYAN }}>
                        {new Date(hosResult.deadline).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontWeight: 700 }}>TIMEZONE</div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: GREEN }}>
                        {hosResult.tzAbbr}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontWeight: 700 }}>HOURS ALLOWED</div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: ORANGE }}>
                        {hosResult.hosHours} hours
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div style={{ marginTop: "60px", padding: "32px", background: `rgba(255,107,0,0.08)`, border: `1.5px solid rgba(255,107,0,0.2)`, borderRadius: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "16px", color: ORANGE, display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={20} /> How It Works
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            <div>
              <strong>🌍 Location Resolver</strong>: Pass any input format (IP, GPS, city, airport code, port code, timezone). We return the timezone, current time in 6 formats, UTC offset, DST status, and full geolocation context.
            </div>
            <div>
              <strong>🔄 Timezone Converter</strong>: Convert any timestamp between two timezones instantly. Critical for cross-zone operations, delivery windows, and compliance checks across regions.
            </div>
            <div>
              <strong>📋 HOS Deadline</strong>: Calculate when a driver must rest based on their current timezone. Prevents violations and ensures compliance across all 50 states and their DST rules.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
