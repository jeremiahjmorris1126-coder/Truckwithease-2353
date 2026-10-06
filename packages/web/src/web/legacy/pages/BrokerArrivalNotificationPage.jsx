import { useState, useEffect } from "react";
import PocketBase from "pocketbase";
import { Clock, MapPin, FileText, Mail, MessageSquare, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { verifyBrokerByEmail, lookupBrokerByIP, verifyArrivalNotificationSafety, logBrokerVerification } from '../lib/brokerWhoisVerification';

const pb = new PocketBase();

const C = {
  gold: "#D4AF37",
  black: "#0a0a0a",
  card: "#111",
  border: "#222",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
};

export default function BrokerArrivalNotificationPage() {
  const [activeTab, setActiveTab] = useState("arrival");
  const [driverId, setDriverId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [brokerEmail, setBrokerEmail] = useState("");
  const [brokerPhone, setBrokerPhone] = useState("");
  const [arrivalTime, setArrivalTime] = useState(new Date().toISOString().slice(0, 16));
  const [departureTime, setDepartureTime] = useState("");
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState("");
  const [notificationMethod, setNotificationMethod] = useState("both");
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [templateType, setTemplateType] = useState("arrival");
  const [isSending, setIsSending] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null);

  const DRIVERS = [
    { id: "d1", name: "Ray Davis", truck: "TR-4821", email: "ray.davis@fleet.local" },
    { id: "d2", name: "Maria Santos", truck: "TR-3390", email: "maria.santos@fleet.local" },
    { id: "d3", name: "John Miller", truck: "TR-5512", email: "john.miller@fleet.local" },
    { id: "d4", name: "Tanya Rhodes", truck: "TR-2201", email: "tanya.rhodes@fleet.local" },
    { id: "d5", name: "Carlos Vega", truck: "TR-6677", email: "carlos.vega@fleet.local" },
  ];

  const DOCUMENT_TYPES = [
    { id: "bol", name: "Bill of Lading", emoji: "📄" },
    { id: "proof", name: "Proof of Delivery", emoji: "✅" },
    { id: "inspection", name: "Pre-Delivery Inspection", emoji: "🔍" },
    { id: "weight", name: "Weight Slip", emoji: "⚖️" },
    { id: "photo", name: "Cargo Photos", emoji: "📸" },
  ];

  const NOTIFICATION_TEMPLATES = {
    arrival: {
      title: "Driver Arrival Notification",
      subject: "Driver On-Site: [DRIVER] at [LOCATION]",
      body: "Your driver [DRIVER] (Truck: [TRUCK]) has arrived at [LOCATION] at [TIME].",
    },
    departure: {
      title: "Driver Departure Notification",
      subject: "Driver Departed: [DRIVER] from [LOCATION]",
      body: "[DRIVER] has departed [LOCATION] at [TIME].",
    },
    delayed: {
      title: "Delayed Arrival Notice",
      subject: "Driver Delayed: [DRIVER] at [LOCATION]",
      body: "[DRIVER] is running [DELAY] behind schedule. New ETA: [ETA].",
    },
    completed: {
      title: "Load Completed",
      subject: "Load Completed: [DRIVER] at [LOCATION]",
      body: "Load completion confirmed. [DRIVER] loaded/unloaded at [LOCATION]. Departure: [TIME].",
    },
  };

  const handleAddDocument = () => {
    const newDoc = {
      id: Math.random(),
      type: documentTypes[0]?.id || "bol",
      timestamp: new Date().toLocaleString(),
      url: `document_${Date.now()}`,
    };
    setDocuments([...documents, newDoc]);
  };

  const handleRemoveDocument = (docId) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  const documentTypes = DOCUMENT_TYPES;

  const generateNotification = () => {
    if (!driverId || !locationName || !brokerEmail) {
      setConfirmStatus({ type: "error", message: "Fill in driver, location, and broker email" });
      return;
    }

    const driver = DRIVERS.find(d => d.id === driverId);
    const template = NOTIFICATION_TEMPLATES[templateType];

    const message = {
      to: brokerEmail,
      subject: template.subject
        .replace("[DRIVER]", driver.name)
        .replace("[TRUCK]", driver.truck)
        .replace("[LOCATION]", locationName),
      body: template.body
        .replace("[DRIVER]", driver.name)
        .replace("[TRUCK]", driver.truck)
        .replace("[LOCATION]", locationName)
        .replace("[TIME]", new Date(arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
      timestamp: new Date().toLocaleString(),
      driver: driver.name,
      location: locationName,
      method: notificationMethod,
      documents: documents.length,
      status: "ready to send",
    };

    return message;
  };

  const handleSendNotification = async () => {
    const notification = generateNotification();
    if (!notification) return;

    setIsSending(true);
    setTimeout(() => {
      const newEntry = {
        ...notification,
        id: Math.random(),
        status: "sent",
        sentTime: new Date().toLocaleString(),
      };

      setNotificationHistory([newEntry, ...notificationHistory]);
      setConfirmStatus({
        type: "success",
        message: `Notification sent to ${brokerEmail} via ${notificationMethod}`,
      });

      // Reset form
      setLocationName("");
      setBrokerEmail("");
      setBrokerPhone("");
      setDocuments([]);
      setNotes("");
      setArrivalTime(new Date().toISOString().slice(0, 16));

      setTimeout(() => setIsSending(false), 1500);
    }, 2000);
  };

  const handleAutomateTemplate = () => {
    // Simulate saving a template to use for future notifications
    setConfirmStatus({
      type: "success",
      message: `Template saved: Future arrivals at ${locationName} will auto-notify ${brokerEmail}`,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: "#fff", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "1rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            🔔 Driver Arrival & Site Notification
          </h1>
          <p style={{ color: "#aaa", fontSize: "1rem" }}>
            Automatic alerts to brokers when drivers arrive, depart, or complete loads. Send via email or SMS with documents & timestamps.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "1rem", overflowX: "auto" }}>
          {[
            { id: "arrival", label: "📍 Send Arrival Alert", icon: MapPin },
            { id: "history", label: "📋 Notification History", icon: FileText },
            { id: "templates", label: "⚙️ Automation & Templates", icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === tab.id ? C.blue : "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                fontSize: "0.95rem",
                fontWeight: activeTab === tab.id ? "bold" : "normal",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Message */}
        {confirmStatus && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "2rem",
              borderRadius: "8px",
              background: confirmStatus.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              border: `1px solid ${confirmStatus.type === "error" ? "#ef4444" : "#22c55e"}`,
              color: confirmStatus.type === "error" ? "#ef4444" : "#22c55e",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {confirmStatus.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {confirmStatus.message}
          </div>
        )}

        {/* ARRIVAL ALERT TAB */}
        {activeTab === "arrival" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            {/* Form */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Create Notification</h2>

              {/* Driver Selection */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  📦 Driver & Truck
                </label>
                <select
                  value={driverId}
                  onChange={e => setDriverId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">Select a driver...</option>
                  {DRIVERS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.truck}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  📍 Delivery Location / Shipper Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Amazon DSF Indianapolis, Pilot Truck Stop"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Broker Email */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  📧 Broker Email Address
                </label>
                <input
                  type="email"
                  placeholder="broker@company.com"
                  value={brokerEmail}
                  onChange={e => setBrokerEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Broker Phone */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  ☎️ Broker Phone (Optional for SMS)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={brokerPhone}
                  onChange={e => setBrokerPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Arrival Time */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  ⏰ Arrival Time
                </label>
                <input
                  type="datetime-local"
                  value={arrivalTime}
                  onChange={e => setArrivalTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Notification Type */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  🔔 Notification Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {Object.keys(NOTIFICATION_TEMPLATES).map(type => (
                    <button
                      key={type}
                      onClick={() => setTemplateType(type)}
                      style={{
                        padding: "0.75rem",
                        background: templateType === type ? C.blue : "#1a1a1a",
                        border: `1px solid ${templateType === type ? C.blue : C.border}`,
                        color: "#fff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: templateType === type ? "bold" : "normal",
                        textTransform: "capitalize",
                      }}
                    >
                      {type === "arrival" && "📍 Arrival"}
                      {type === "departure" && "🚛 Departure"}
                      {type === "delayed" && "⏳ Delayed"}
                      {type === "completed" && "✅ Completed"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Method */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  📤 Send Via
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[
                    { id: "email", label: "Email Only", icon: "📧" },
                    { id: "sms", label: "SMS Only", icon: "📱" },
                    { id: "both", label: "Email + SMS", icon: "📧📱" },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setNotificationMethod(method.id)}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: notificationMethod === method.id ? C.gold : "#1a1a1a",
                        border: `1px solid ${notificationMethod === method.id ? C.gold : C.border}`,
                        color: notificationMethod === method.id ? C.black : "#fff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: notificationMethod === method.id ? "bold" : "normal",
                      }}
                    >
                      {method.icon} {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.95rem" }}>
                  📝 Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special instructions or details for the broker..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#0a0a0a",
                    border: `1px solid ${C.border}`,
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={isSending}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: isSending ? "#666" : C.green,
                  color: C.black,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: isSending ? "not-allowed" : "pointer",
                  opacity: isSending ? 0.5 : 1,
                }}
              >
                {isSending ? "Sending..." : "📤 Send Notification to Broker"}
              </button>
            </div>

            {/* Preview */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>📧 Preview</h2>

              {generateNotification() && (
                <div style={{ background: "#0a0a0a", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.5rem", fontSize: "0.95rem", lineHeight: "1.6" }}>
                  <p style={{ marginBottom: "1rem" }}>
                    <strong>To:</strong> {brokerEmail || "(no email entered)"}
                  </p>
                  <p style={{ marginBottom: "1rem" }}>
                    <strong>Subject:</strong> {generateNotification().subject}
                  </p>
                  <div style={{ background: C.black, padding: "1rem", borderRadius: "6px", marginBottom: "1rem", color: "#ccc" }}>
                    <p style={{ marginBottom: "1rem" }}>{generateNotification().body}</p>
                    {notes && (
                      <p style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}`, color: "#aaa" }}>
                        <strong>Notes:</strong> {notes}
                      </p>
                    )}
                  </div>
                  {documents.length > 0 && (
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}` }}>
                      <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>📎 Documents Attached:</p>
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {documents.map(doc => (
                          <li key={doc.id} style={{ padding: "0.5rem 0", color: "#aaa", fontSize: "0.9rem" }}>
                            ✓ {DOCUMENT_TYPES.find(d => d.id === doc.type)?.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATION HISTORY TAB */}
        {activeTab === "history" && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>📋 Recent Notifications</h2>

            {notificationHistory.length === 0 ? (
              <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>No notifications sent yet. Send one to see it appear here.</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {notificationHistory.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      background: "#0a0a0a",
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      padding: "1.5rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                          {notif.driver} → {notif.location}
                        </p>
                        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                          To: {notif.to} • {notif.method.toUpperCase()}
                        </p>
                      </div>
                      <span style={{ background: C.green, color: C.black, padding: "0.5rem 1rem", borderRadius: "4px", fontWeight: "bold", fontSize: "0.85rem" }}>
                        ✓ Sent
                      </span>
                    </div>
                    <p style={{ color: "#ccc", marginBottom: "1rem", fontSize: "0.95rem" }}>{notif.subject}</p>
                    <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                      {notif.sentTime} • {notif.documents} document(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTOMATION & TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Template Builder */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>⚙️ Create Automation</h2>
              <p style={{ color: "#aaa", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                Save a template to auto-notify this broker for future arrivals at this location.
              </p>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Location:</p>
                  <p style={{ color: "#ccc", background: "#0a0a0a", padding: "0.75rem", borderRadius: "6px" }}>
                    {locationName || "(no location selected)"}
                  </p>
                </div>
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Broker Email:</p>
                  <p style={{ color: "#ccc", background: "#0a0a0a", padding: "0.75rem", borderRadius: "6px" }}>
                    {brokerEmail || "(no email selected)"}
                  </p>
                </div>
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Notification Type:</p>
                  <p style={{ color: "#ccc", background: "#0a0a0a", padding: "0.75rem", borderRadius: "6px", textTransform: "capitalize" }}>
                    {templateType}
                  </p>
                </div>

                <button
                  onClick={handleAutomateTemplate}
                  disabled={!locationName || !brokerEmail}
                  style={{
                    padding: "1rem",
                    background: locationName && brokerEmail ? C.blue : "#666",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    cursor: locationName && brokerEmail ? "pointer" : "not-allowed",
                    opacity: locationName && brokerEmail ? 1 : 0.5,
                    marginTop: "1rem",
                  }}
                >
                  💾 Save as Automation Template
                </button>
              </div>
            </div>

            {/* Active Automations */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>🤖 Active Automations</h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {[
                  { location: "Amazon DSF Indianapolis", broker: "dispatch@brokerX.com", type: "arrival", active: true },
                  { location: "Pilot Truck Stop Gary", broker: "ops@brokerY.com", type: "departure", active: true },
                  { location: "Receiver B Dock", broker: "admin@brokerZ.com", type: "completed", active: false },
                ].map((auto, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#0a0a0a",
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.95rem" }}>
                      <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{auto.location}</p>
                      <p style={{ color: "#aaa", fontSize: "0.85rem" }}>{auto.broker}</p>
                      <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                        {auto.type.charAt(0).toUpperCase() + auto.type.slice(1)} notifications
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "24px",
                          background: auto.active ? C.green : "#666",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          color: auto.active ? C.black : "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {auto.active ? "ON" : "OFF"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
