import React, { useState } from "react";
import { AlertCircle, Copy } from "lucide-react";
import { lookupIPWhois, getAbuseContact, verifyIPOwnership, getIPBlockInfo, scanIPBlockForThreats } from "../lib/ipWhoisIntel";

const DARK_BG = "#0a0a0a";
const NAVY = "#0F172A";
const GOLD = "#C9A84C";
const ORANGE = "#FF6B00";
const BRIGHT_CYAN = "#00D9FF";
const GREEN = "#10B981";

export default function IPWhoisPage() {
  const [activeTab, setActiveTab] = useState("lookup");
  const [ipInput, setIpInput] = useState("8.8.8.8");
  const [whoisResult, setWhoisResult] = useState(null);
  const [abuseResult, setAbuseResult] = useState(null);
  const [claimedOwner, setClaimedOwner] = useState("Google");
  const [verifyResult, setVerifyResult] = useState(null);
  const [blockResult, setBlockResult] = useState(null);
  const [threatResult, setThreatResult] = useState(null);
  const [copied, setCopied] = useState("");

  async function handleLookup() {
    const result = await lookupIPWhois(ipInput);
    setWhoisResult(result);
  }

  async function handleGetAbuse() {
    const result = await getAbuseContact(ipInput);
    setAbuseResult(result);
  }

  async function handleVerify() {
    const result = await verifyIPOwnership(ipInput, claimedOwner);
    setVerifyResult(result);
  }

  async function handleGetBlock() {
    const result = await getIPBlockInfo(ipInput);
    setBlockResult(result);
  }

  async function handleScanThreat() {
    const result = await scanIPBlockForThreats(ipInput);
    setThreatResult(result);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(text.substring(0, 20));
    setTimeout(() => setCopied(""), 2000);
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
            IP WHOIS Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            marginBottom: "16px",
            lineHeight: 1.1,
          }}>
            Know Who Owns <span style={{ color: ORANGE }}>Every IP.</span>
          </h1>
          <p style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "700px",
            lineHeight: 1.6,
            fontFamily: "'Inter',sans-serif",
          }}>
            Query all 5 Regional Internet Registries (ARIN, RIPE NCC, APNIC, LACNIC, AFRINIC) in one call. 
            Get owner, CIDR block, abuse contacts, and raw WHOIS text for investigation and compliance.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: "20px", flexWrap: "wrap" }}>
          {[
            { id: "lookup", label: "🔍 WHOIS Lookup" },
            { id: "abuse", label: "⚠️ Abuse Contact" },
            { id: "verify", label: "✓ Verify Ownership" },
            { id: "block", label: "🧱 IP Block Info" },
            { id: "threat", label: "🛡️ Threat Scan" },
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
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,107,0,0.04) 100%)`,
          border: `1.5px solid rgba(255,255,255,0.1)`,
          borderRadius: "20px",
          padding: "40px",
        }}>
          {/* WHOIS Lookup */}
          {activeTab === "lookup" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: ORANGE }}>
                🔍 Full WHOIS Lookup
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
                <button onClick={handleLookup} style={{
                  background: ORANGE,
                  color: "#0F172A",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Lookup</button>
              </div>

              {whoisResult && (
                <div style={{
                  background: "rgba(255,107,0,0.1)",
                  border: `1.5px solid ${ORANGE}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: ORANGE, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    WHOIS Record for {whoisResult.ip}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "14px", marginBottom: "20px" }}>
                    <div><strong>Owner:</strong> {whoisResult.owner}</div>
                    <div><strong>Organization:</strong> {whoisResult.organization}</div>
                    <div><strong>CIDR:</strong> {whoisResult.cidr}</div>
                    <div><strong>Country:</strong> {whoisResult.country}</div>
                    <div><strong>Registry:</strong> {whoisResult.registry}</div>
                    <div><strong>Allocated:</strong> {whoisResult.created}</div>
                    <div><strong>Admin Contact:</strong> {whoisResult.contacts.admin}</div>
                    <div><strong>Tech Contact:</strong> {whoisResult.contacts.tech}</div>
                    <div><strong>Abuse Contact:</strong> {whoisResult.contacts.abuse}</div>
                  </div>
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <strong>Raw WHOIS Record</strong>
                      <button onClick={() => copyToClipboard(whoisResult.raw_whois)} style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        color: BRIGHT_CYAN,
                        fontSize: "12px",
                      }}>
                        {copied === whoisResult.raw_whois.substring(0, 20) ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <pre style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      overflow: "auto",
                      maxHeight: "300px",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "monospace",
                      lineHeight: 1.4,
                    }}>
                      {whoisResult.raw_whois}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Abuse Contact */}
          {activeTab === "abuse" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: "rgb(239, 68, 68)" }}>
                ⚠️ Get Abuse Contact
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
                <button onClick={handleGetAbuse} style={{
                  background: "rgb(239, 68, 68)",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Get Contact</button>
              </div>

              {abuseResult && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: `1.5px solid rgb(239, 68, 68)`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: "rgb(239, 68, 68)", marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Abuse Contact for {abuseResult.ip}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "14px", marginBottom: "20px" }}>
                    <div><strong>Owner:</strong> {abuseResult.owner}</div>
                    <div><strong>Organization:</strong> {abuseResult.organization}</div>
                    <div><strong>Registry:</strong> {abuseResult.registry}</div>
                    <div><strong>Abuse Email:</strong> {abuseResult.abuse_email}</div>
                  </div>
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <strong>Report Template</strong>
                      <button onClick={() => copyToClipboard(abuseResult.report_template)} style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        color: BRIGHT_CYAN,
                        fontSize: "12px",
                      }}>
                        Copy
                      </button>
                    </div>
                    <pre style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      overflow: "auto",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                    }}>
                      {abuseResult.report_template}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verify Ownership */}
          {activeTab === "verify" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: GREEN }}>
                ✓ Verify IP Ownership
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} style={{
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
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>Claimed Owner</label>
                  <input type="text" value={claimedOwner} onChange={e => setClaimedOwner(e.target.value)} placeholder="Google" style={{
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
              <button onClick={handleVerify} style={{
                background: GREEN,
                color: "#0F172A",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "24px",
              }}>Verify</button>

              {verifyResult && (
                <div style={{
                  background: verifyResult.verified ? "rgba(16,185,129,0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `1.5px solid ${verifyResult.verified ? GREEN : "rgb(239, 68, 68)"}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: verifyResult.verified ? GREEN : "rgb(239, 68, 68)", marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    {verifyResult.verified ? "✓ Verified" : "✗ Not Verified"}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>IP:</strong> {verifyResult.ip}</div>
                    <div><strong>Claimed Owner:</strong> {verifyResult.claimed_owner}</div>
                    <div><strong>Actual Owner:</strong> {verifyResult.actual_owner}</div>
                    <div><strong>Organization:</strong> {verifyResult.organization}</div>
                    <div><strong>CIDR:</strong> {verifyResult.cidr}</div>
                    <div><strong>Registry:</strong> {verifyResult.registry}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IP Block Info */}
          {activeTab === "block" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: BRIGHT_CYAN }}>
                🧱 IP Block Information
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <button onClick={handleGetBlock} style={{
                  background: BRIGHT_CYAN,
                  color: NAVY,
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Get Block</button>
              </div>

              {blockResult && (
                <div style={{
                  background: "rgba(0,217,255,0.1)",
                  border: `1.5px solid ${BRIGHT_CYAN}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: BRIGHT_CYAN, marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Block: {blockResult.cidr}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", fontSize: "14px" }}>
                    <div><strong>Size:</strong> {blockResult.size} IPs</div>
                    <div><strong>Start:</strong> {blockResult.start_ip}</div>
                    <div><strong>End:</strong> {blockResult.end_ip}</div>
                    <div><strong>Owner:</strong> {blockResult.owner}</div>
                    <div><strong>Organization:</strong> {blockResult.organization}</div>
                    <div><strong>Country:</strong> {blockResult.country}</div>
                    <div><strong>Registry:</strong> {blockResult.registry}</div>
                    <div><strong>Allocated:</strong> {blockResult.allocated}</div>
                    <div><strong>Last Updated:</strong> {blockResult.last_updated}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Threat Scan */}
          {activeTab === "threat" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px", color: "rgb(239, 68, 68)" }}>
                🛡️ Scan IP Block for Threats
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: GOLD, marginBottom: "8px" }}>IP Address</label>
                  <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: "8px",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                  }} />
                </div>
                <button onClick={handleScanThreat} style={{
                  background: "rgb(239, 68, 68)",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "8px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "14px",
                }}>Scan</button>
              </div>

              {threatResult && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: `1.5px solid rgb(239, 68, 68)`,
                  borderRadius: "12px",
                  padding: "24px",
                }}>
                  <h3 style={{ color: "rgb(239, 68, 68)", marginBottom: "20px", fontSize: "18px", fontWeight: 900 }}>
                    Threat Scan: {threatResult.cidr}
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                  }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>TOTAL IPs</div>
                      <div style={{ fontSize: "24px", fontWeight: 900 }}>{threatResult.total_ips}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>FLAGGED</div>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: threatResult.flagged_count > 0 ? "rgb(239, 68, 68)" : GREEN }}>
                        {threatResult.flagged_count}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>% THREAT</div>
                      <div style={{ fontSize: "24px", fontWeight: 900 }}>{threatResult.threat_percentage}%</div>
                    </div>
                  </div>
                  {threatResult.flagged_ips.length > 0 && (
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                      <strong>Flagged IPs:</strong> {threatResult.flagged_ips.join(", ")}
                    </div>
                  )}
                  <div style={{ marginTop: "12px", fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                    <strong>Recommendation:</strong> {threatResult.recommendation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "60px", padding: "32px", background: `rgba(255,107,0,0.08)`, border: `1.5px solid rgba(255,107,0,0.2)`, borderRadius: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "16px", color: ORANGE }}>
            <AlertCircle size={20} style={{ display: "inline", marginRight: "8px" }} />
            Why WHOIS Matters
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            <div><strong>🔍 Investigations:</strong> Identify who owns an IP. Report abuse to the right contact.</div>
            <div><strong>✓ Verification:</strong> Confirm claimed domains/IPs match their actual WHOIS records.</div>
            <div><strong>🛡️ Security:</strong> Scan entire IP blocks for flagged addresses. Know your threat surface.</div>
            <div><strong>📋 Compliance:</strong> Retain raw WHOIS records for audit trails and legal discovery.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
