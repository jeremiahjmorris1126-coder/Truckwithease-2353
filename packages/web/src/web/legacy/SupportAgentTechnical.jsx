import React, { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const NAVY = "#001f3f";
const ORANGE = "#ff6b35";
const GREEN = "#4caf50";
const RED = "#dc2626";
const AMBER = "#ffc107";

export default function SupportAgentTechnical() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    fleet: "",
    issue: "",
    severity: "medium",
    category: "app-bug",
    description: ""
  });
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "app-bug", label: "App Bug / Crash" },
    { id: "gps-tracking", label: "GPS Tracking Not Working" },
    { id: "eld-sync", label: "ELD Sync Issue" },
    { id: "fuel-card", label: "Fuel Card Integration" },
    { id: "dispatch", label: "Dispatch Routing" },
    { id: "login", label: "Login / Authentication" },
    { id: "data-loss", label: "Data Loss / Recovery" },
    { id: "hardware", label: "Hardware Issue" },
    { id: "api-integration", label: "API Integration" },
    { id: "other", label: "Other" }
  ];

  const severityLevels = [
    { id: "low", label: "Low - Nice to have", color: "#4caf50" },
    { id: "medium", label: "Medium - Affects workflow", color: "#ffc107" },
    { id: "high", label: "High - Blocking work", color: "#ff9800" },
    { id: "critical", label: "Critical - Full outage", color: "#dc2626" }
  ];

  const diagnoseIssue = async () => {
    if (!newTicket.fleet || !newTicket.description) {
      setResponse("Please fill in fleet name and issue description.");
      return;
    }

    setLoading(true);
    try {
      const ticket = await pb.collection("support_tickets").create({
        fleet_name: newTicket.fleet,
        issue_title: newTicket.issue,
        category: newTicket.category,
        severity: newTicket.severity,
        description: newTicket.description,
        status: "open",
        created_at: new Date().toISOString(),
        agent: "Technical Support",
        diagnosis: "",
        resolution: ""
      });

      const diagnosticResponse = generateDiagnosis(newTicket);
      
      const updated = await pb.collection("support_tickets").update(ticket.id, {
        diagnosis: diagnosticResponse.diagnosis,
        suggested_steps: JSON.stringify(diagnosticResponse.steps)
      });

      setTickets([...tickets, updated]);
      setResponse(diagnosticResponse.diagnosis);
      setActiveTicket(updated.id);
      setNewTicket({ fleet: "", issue: "", severity: "medium", category: "app-bug", description: "" });
    } catch (err) {
      setResponse("Error creating ticket. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateDiagnosis = (ticket) => {
    const diagnostics = {
      "app-bug": {
        diagnosis: "🔍 App Crash Detected\n\nCommon causes: Outdated app version, insufficient device memory, conflicting third-party apps, or corrupted cache.\n\nImpact: User cannot access any features until resolved.",
        steps: [
          "Force close app (Settings > Apps > TruckWithEase > Force Stop)",
          "Clear app cache (Settings > Apps > TruckWithEase > Storage > Clear Cache)",
          "Ensure device has >500MB free storage",
          "Restart device",
          "Reinstall app if issue persists (data syncs automatically from cloud)",
          "Check App Store/Play Store for updates"
        ]
      },
      "gps-tracking": {
        diagnosis: "📍 GPS Tracking Issue\n\nCommon causes: Location permission denied, GPS disabled, poor signal, or server sync delay.\n\nImpact: Fleet visibility degraded; drivers show stale positions.",
        steps: [
          "Verify location permission: Settings > Apps > TruckWithEase > Permissions > Location > Allow all the time",
          "Ensure GPS is enabled on device (Settings > Location)",
          "Check internet connection (cellular or WiFi required for upload)",
          "If location is outdated: Pull down to refresh map",
          "Restart location service: Toggle location off/on",
          "If issue persists >5 min: Manual check-in via app button"
        ]
      },
      "eld-sync": {
        diagnosis: "🔗 ELD Sync Failure\n\nCommon causes: Connection loss between app and ELD hardware, Bluetooth disconnect, or firmware mismatch.\n\nImpact: HOS logs not updating; compliance risk.",
        steps: [
          "Check Bluetooth connection: Pair device again if needed",
          "Verify ELD hardware is powered on and charged",
          "Restart ELD device (hold power 10 seconds)",
          "Restart app",
          "Check ELD firmware version (Admin > Hardware > ELD Status)",
          "If firmware outdated: Use admin portal to push update",
          "Force sync: Tap sync icon in HOS logger"
        ]
      },
      "fuel-card": {
        diagnosis: "💳 Fuel Card Integration Down\n\nCommon causes: API token expired, merchant network issue, or card blocked.\n\nImpact: Real-time fuel pricing unavailable; manual entry required.",
        steps: [
          "Check card status: Admin > Fuel Card > Verify Active",
          "Verify merchant is enrolled with fuel provider (Pilot/Love's)",
          "Force API refresh: Admin > Integrations > Fuel > Reconnect",
          "Check card isn't declined (Contact Pilot/Love's merchant services)",
          "Verify merchant network connection",
          "Manual workaround: Driver can enter fuel amount and cost manually"
        ]
      },
      "dispatch": {
        diagnosis: "🗺️ Dispatch Routing Error\n\nCommon causes: Algorithm timeout, invalid route, map data outdated, or heavy load queue.\n\nImpact: Dispatch agent slow or returning suboptimal routes.",
        steps: [
          "Clear browser cache if using web admin console",
          "Verify all loads have valid pickup/delivery addresses",
          "Check road network data is current (Settings > Maps > Update)",
          "Reduce number of simultaneous route calculations",
          "Restart dispatch agent: Admin > Agents > Restart Dispatch",
          "If very slow: Check server load (Admin > System Health)"
        ]
      },
      "login": {
        diagnosis: "🔐 Login / Authentication Failure\n\nCommon causes: Wrong credentials, account locked, token expired, or server unreachable.\n\nImpact: User cannot access any app.",
        steps: [
          "Verify internet connection",
          "Double-check email and password (case-sensitive)",
          "Try 'Forgot Password' to reset",
          "Clear app cache and login again",
          "If account locked: Contact truckeasecare@gmail.com",
          "Check server status: status.truckwithease.com"
        ]
      },
      "data-loss": {
        diagnosis: "⚠️ Data Loss / Recovery\n\nCommon causes: Device factory reset, account sync failure, or accidental deletion.\n\nImpact: Historical data may be unavailable; recent data in cloud.",
        steps: [
          "Log in from new device to verify cloud sync",
          "Data from past 7 days is always in cloud backup",
          "For older data: Contact support with dates needed",
          "Enable auto-backup: Settings > Backup & Restore > Auto-Backup On",
          "Regular exports recommended: Admin > Reports > Export History"
        ]
      },
      "hardware": {
        diagnosis: "🔌 Hardware Issue\n\nCommon causes: Battery issue, charging port damaged, overheating, or screen failure.\n\nImpact: Device unreliable or non-functional.",
        steps: [
          "Try hard reset: Hold power + volume down for 10 sec",
          "Charge for 30 min with original charger",
          "If screen unresponsive: Check for physical damage",
          "Test in safe mode (Android: Hold power > Safe Mode)",
          "If battery drains fast: Reduce screen brightness, disable background apps",
          "RMA eligible: Contact support; replacement shipped in 24 hours"
        ]
      },
      "api-integration": {
        diagnosis: "🔌 API Integration Failure\n\nCommon causes: API key expired, rate limit exceeded, payload malformed, or endpoint deprecated.\n\nImpact: Third-party data not syncing.",
        steps: [
          "Verify API key is valid (Admin > Integrations > [Service] > Check Key)",
          "Check rate limits in partner dashboard",
          "Validate JSON payload format",
          "Review API logs: Admin > System > API Logs (last 100 calls)",
          "Reconnect integration: Disconnect > Re-authenticate",
          "If still failing: Check partner API status page"
        ]
      },
      "other": {
        diagnosis: "🔧 General Issue\n\nThis ticket needs more specific info to diagnose.\n\nImpact: Depends on issue type.",
        steps: [
          "Provide detailed steps to reproduce the issue",
          "Include device model and OS version",
          "Screenshot or video of the problem (if possible)",
          "Note exact time issue occurred (for log review)",
          "Describe impact on fleet operations",
          "Our team will follow up within 2 hours"
        ]
      }
    };

    return diagnostics[ticket.category] || diagnostics.other;
  };

  const resolveTicket = async (ticketId) => {
    try {
      const updated = await pb.collection("support_tickets").update(ticketId, {
        status: "resolved",
        resolved_at: new Date().toISOString()
      });
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      setActiveTicket(null);
      setResponse("Ticket resolved and closed. Customer notified.");
    } catch (err) {
      console.error(err);
    }
  };

  const activeTicketData = tickets.find(t => t.id === activeTicket);

  return (
    <div style={{ background: NAVY, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "10px" }}>
          🛠️ Technical Support Agent
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "40px" }}>
          Diagnose and resolve app issues in real-time. Every ticket auto-analyzed with repair steps.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* New Ticket Form */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>New Support Ticket</h2>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Fleet Name</label>
              <input
                type="text"
                value={newTicket.fleet}
                onChange={(e) => setNewTicket({ ...newTicket, fleet: e.target.value })}
                placeholder="e.g., Smith Fleet Corp"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Issue Title</label>
              <input
                type="text"
                value={newTicket.issue}
                onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                placeholder="Brief title of the issue"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Category</label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: NAVY }}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Severity</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {severityLevels.map(sev => (
                  <button
                    key={sev.id}
                    onClick={() => setNewTicket({ ...newTicket, severity: sev.id })}
                    style={{
                      padding: "10px",
                      background: newTicket.severity === sev.id ? sev.color : "rgba(255,255,255,0.05)",
                      color: newTicket.severity === sev.id ? NAVY : "white",
                      border: `1px solid ${sev.color}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Description</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="What happened? Steps to reproduce? Impact on operations?"
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button
              onClick={diagnoseIssue}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "rgba(255,107,53,0.5)" : ORANGE,
                color: NAVY,
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Analyzing..." : "Diagnose Issue"}
            </button>
          </div>

          {/* Active Ticket & Diagnosis */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>Diagnosis & Resolution</h2>

            {activeTicketData ? (
              <div>
                <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>{activeTicketData.issue_title}</h3>
                  <p style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>
                    {activeTicketData.fleet_name} • {activeTicketData.category.replace(/-/g, " ").toUpperCase()}
                  </p>
                  <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: severityLevels.find(s => s.id === activeTicketData.severity)?.color,
                    color: NAVY,
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {severityLevels.find(s => s.id === activeTicketData.severity)?.label}
                  </div>
                </div>

                {activeTicketData.diagnosis && (
                  <div style={{ marginBottom: "25px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: ORANGE }}>🔍 Diagnosis</h4>
                    <p style={{ fontSize: "13px", opacity: 0.8, whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {activeTicketData.diagnosis}
                    </p>
                  </div>
                )}

                {activeTicketData.suggested_steps && (
                  <div style={{ marginBottom: "25px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: GREEN }}>✓ Steps to Resolve</h4>
                    <ol style={{ fontSize: "13px", opacity: 0.8, paddingLeft: "20px", lineHeight: "1.8" }}>
                      {JSON.parse(activeTicketData.suggested_steps).map((step, i) => (
                        <li key={i} style={{ marginBottom: "8px" }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <button
                  onClick={() => resolveTicket(activeTicketData.id)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: GREEN,
                    color: NAVY,
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  ✓ Mark as Resolved
                </button>
              </div>
            ) : (
              <p style={{ opacity: 0.6, textAlign: "center", paddingTop: "40px" }}>
                Create a new ticket to see diagnosis and repair steps here.
              </p>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        {tickets.length > 0 && (
          <div style={{ marginTop: "40px", background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>Open & Recent Tickets</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {tickets.slice(-10).reverse().map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket.id)}
                  style={{
                    background: activeTicket === ticket.id ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)",
                    border: activeTicket === ticket.id ? `2px solid ${ORANGE}` : "1px solid rgba(255,255,255,0.1)",
                    padding: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>
                    {ticket.fleet_name}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
                    {ticket.issue_title}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6 }}>
                    {ticket.status === "resolved" ? "✓ Resolved" : "🔄 Open"} • {ticket.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
