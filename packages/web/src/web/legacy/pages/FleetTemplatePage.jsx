import { useState, useEffect, useRef } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const DARK = "#060A10";

const TEMPLATE_TYPES = [
  { id: "letterhead", label: "Company Letterhead", icon: "📄", desc: "Professional header for all correspondence" },
  { id: "rate_confirmation", label: "Rate Confirmation", icon: "📋", desc: "Lock in load rates with shippers & brokers" },
  { id: "bol", label: "Bill of Lading", icon: "📦", desc: "Official freight shipment document" },
  { id: "load_confirmation", label: "Load Confirmation", icon: "🚛", desc: "Dispatch to driver load assignment" },
  { id: "driver_checklist", label: "Driver Checklist", icon: "✅", desc: "Pre-trip / post-trip inspection checklist" },
  { id: "safety_policy", label: "Safety Policy", icon: "🛡️", desc: "Fleet safety rules & procedures" },
  { id: "dvir", label: "DVIR Form", icon: "🔧", desc: "Driver Vehicle Inspection Report" },
  { id: "accident_report", label: "Accident Report", icon: "⚠️", desc: "Incident documentation form" },
  { id: "lease_agreement", label: "Lease Agreement", icon: "📝", desc: "Owner-operator lease template" },
  { id: "invoice", label: "Freight Invoice", icon: "💰", desc: "Billing document for completed loads" },
];

const DEFAULT_TEMPLATES = {
  letterhead: {
    header_title: "FREIGHT SERVICES",
    tagline: "Reliable. Professional. On Time.",
    address: "123 Freight Lane, Dallas, TX 75001",
    phone: "(800) 555-0100",
    mc_number: "MC-123456",
    dot_number: "DOT-9876543",
    body_text: "To Whom It May Concern,\n\nThis letter serves as official correspondence from [Fleet Name] regarding [Subject Matter].\n\n[Body of letter here]\n\nSincerely,\n[Name]\n[Title]"
  },
  rate_confirmation: {
    load_number: "RC-{{DATE}}-001",
    shipper: "Shipper Name",
    consignee: "Consignee Name",
    pickup_location: "Origin City, ST",
    pickup_date: "",
    delivery_location: "Destination City, ST",
    delivery_date: "",
    commodity: "General Freight",
    weight: "40,000 lbs",
    rate: "$0.00",
    fuel_surcharge: "Included",
    detention_rate: "$75/hr after 2hrs free",
    payment_terms: "Net 30",
    special_instructions: ""
  },
  bol: {
    shipper_name: "Shipper Company Name",
    shipper_address: "Shipper Address",
    consignee_name: "Consignee Name",
    consignee_address: "Delivery Address",
    carrier_name: "Your Fleet Name",
    pro_number: "PRO-{{DATE}}-001",
    bol_number: "BOL-{{DATE}}-001",
    commodity: "General Freight",
    pieces: "1",
    weight: "0 lbs",
    freight_class: "70",
    declared_value: "$0.00",
    special_instructions: "Handle with care",
    hazmat: false
  },
  load_confirmation: {
    driver_name: "Driver Name",
    truck_number: "Unit #",
    trailer_number: "Trailer #",
    load_number: "LD-{{DATE}}-001",
    pickup_city: "Origin",
    pickup_time: "",
    delivery_city: "Destination",
    delivery_time: "",
    miles: "0",
    rate_per_mile: "$0.00",
    total_pay: "$0.00",
    fuel_advance: "$0.00",
    dispatcher: "Dispatcher Name",
    broker_name: "",
    broker_phone: "",
    special_notes: ""
  },
  driver_checklist: {
    items_pretip: [
      "Engine oil level", "Coolant level", "Brake fluid level",
      "Windshield washer fluid", "Tire pressure (all 18 wheels)",
      "Tire tread depth", "Lights — headlights, taillights, turn signals",
      "Mirrors clean and adjusted", "Fuel level", "Horn working",
      "Windshield clear / no cracks", "Wipers functional",
      "Coupling devices secure", "Safety chains attached",
      "Clearance lights working", "Fire extinguisher present",
      "Triangles / flares present", "Log book current", "Registration in cab",
      "Insurance card in cab"
    ],
    items_posttrip: [
      "Fuel added", "Miles logged", "Any defects noted",
      "Trailer secured / doors sealed", "Paperwork turned in",
      "Load secured properly", "Brake check performed"
    ]
  },
  safety_policy: {
    policy_title: "FLEET SAFETY POLICY",
    effective_date: "",
    sections: [
      { title: "Speed Limits", body: "All drivers must obey posted speed limits at all times. Maximum highway speed is 65 MPH." },
      { title: "Hours of Service", body: "All drivers must comply with FMCSA HOS regulations. No driving beyond allowable hours." },
      { title: "Drug & Alcohol Policy", body: "Zero tolerance policy. Random testing program in effect per DOT regulations." },
      { title: "Cell Phone Policy", body: "No handheld cell phone use while driving. Hands-free devices only." },
      { title: "Accident Reporting", body: "Any accident must be reported to dispatch immediately. Call 911 if injuries involved." },
      { title: "Pre-Trip Inspections", body: "Mandatory pre-trip and post-trip DVIR required every day of operation." }
    ]
  },
  dvir: {
    unit_number: "",
    odometer: "",
    trailer_number: "",
    items: [
      "Air Compressor", "Air Lines", "Battery", "Body/Doors",
      "Brake Accessories", "Brakes (Service)", "Brakes (Parking/Emergency)",
      "Clutch", "Coupling Devices", "Defroster/Heater", "Drive Line",
      "Engine", "Exhaust", "Fifth Wheel", "Frame/Assembly",
      "Front Axle", "Fuel Tanks", "Horn", "Lights (Head)", "Lights (Tail)",
      "Lights (Turn)", "Lights (Clearance)", "Mirrors", "Muffler",
      "Oil Pressure", "Radiator", "Rear End", "Reflectors", "Safety Equipment",
      "Starter", "Steering", "Suspension System", "Tires", "Transmission",
      "Trip Recorder", "Wheels/Rims", "Windows/Windshield", "Wipers"
    ],
    remarks: ""
  },
  accident_report: {
    date_of_accident: "",
    time_of_accident: "",
    location: "",
    driver_name: "",
    unit_number: "",
    other_party_name: "",
    other_vehicle_plate: "",
    injuries: "None",
    police_report_number: "",
    description: "",
    witnesses: "",
    weather_conditions: "Clear",
    road_conditions: "Dry"
  },
  lease_agreement: {
    carrier_name: "Carrier Company Name",
    carrier_mc: "MC-000000",
    carrier_dot: "DOT-000000",
    operator_name: "Owner-Operator Name",
    operator_ssn_last4: "XXXX",
    truck_year: "",
    truck_make: "",
    truck_vin: "",
    compensation_type: "Per Mile",
    compensation_rate: "$0.00",
    fuel_deduction: "Operator responsible",
    escrow_amount: "$0.00",
    term_start: "",
    term_end: "At-Will",
    notice_period: "14 days"
  },
  invoice: {
    invoice_number: "INV-{{DATE}}-001",
    bill_to: "Broker / Shipper Name",
    bill_to_address: "Address",
    load_number: "",
    pickup_date: "",
    delivery_date: "",
    origin: "",
    destination: "",
    commodity: "General Freight",
    miles: "0",
    rate: "$0.00",
    fuel_surcharge: "$0.00",
    detention: "$0.00",
    lumper: "$0.00",
    total_due: "$0.00",
    payment_terms: "Net 30",
    remit_to: "Your Fleet Name\nAddress\nCity, ST ZIP",
    bank_info: ""
  }
};

function logPrint(templateType, templateName, fleetName) {
  pb.collection("document_print_log").create({
    fleet_name: fleetName,
    document_type: templateType,
    document_name: templateName,
    print_method: "browser_print",
    module_source: "fleet_templates",
    page_count: 1,
    metadata: { timestamp: new Date().toISOString() }
  }).catch(() => {});
}

function PrintPreview({ template, templateType, fleetData, onClose }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const fillDate = (str) => (str || "").replace(/\{\{DATE\}\}/g, dateCode);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, overflow: "auto" }}>
      <div style={{ maxWidth: 900, margin: "20px auto", background: "#fff", borderRadius: 4, overflow: "hidden" }}>
        {/* Print controls */}
        <div style={{ background: DARK, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: GOLD, fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 2 }}>PRINT PREVIEW</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                logPrint(templateType, template.template_name || templateType, fleetData.fleet_name || "Fleet");
                window.print();
              }}
              style={{ background: GOLD, color: DARK, border: "none", borderRadius: 4, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
            >🖨️ PRINT NOW</button>
            <button onClick={onClose} style={{ background: "#333", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontSize: 14 }}>✕ Close</button>
          </div>
        </div>

        {/* Document */}
        <div id="print-area" style={{ padding: "60px 70px", fontFamily: "Georgia, serif", color: "#111", lineHeight: 1.6 }}>
          {/* Header */}
          <div style={{ borderBottom: `4px solid ${fleetData.brand_color || GOLD}`, paddingBottom: 20, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              {fleetData.logo_url && (
                <img src={fleetData.logo_url} alt="Logo" style={{ height: 60, maxWidth: 200, objectFit: "contain", marginBottom: 8, display: "block" }} />
              )}
              <div style={{ fontSize: 28, fontWeight: 700, color: DARK, fontFamily: "Arial Black, sans-serif", letterSpacing: 1 }}>
                {fleetData.fleet_name || "YOUR FLEET NAME"}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {fleetData.address || "Address"} | {fleetData.phone || "Phone"} | {fleetData.email || "Email"}
              </div>
              {fleetData.mc_number && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{fleetData.mc_number} | {fleetData.dot_number}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: fleetData.brand_color || GOLD, textTransform: "uppercase", letterSpacing: 2 }}>
                {TEMPLATE_TYPES.find(t => t.id === templateType)?.label || templateType}
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>Date: {today}</div>
            </div>
          </div>

          {/* Body based on type */}
          {templateType === "letterhead" && (
            <div style={{ minHeight: 600 }}>
              <pre style={{ fontFamily: "Georgia, serif", fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{template.content?.body_text || DEFAULT_TEMPLATES.letterhead.body_text}</pre>
            </div>
          )}

          {templateType === "rate_confirmation" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 20 }}>
                RATE CONFIRMATION #{fillDate(template.content?.load_number || DEFAULT_TEMPLATES.rate_confirmation.load_number)}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                {[
                  ["Shipper", template.content?.shipper || DEFAULT_TEMPLATES.rate_confirmation.shipper],
                  ["Consignee", template.content?.consignee || DEFAULT_TEMPLATES.rate_confirmation.consignee],
                  ["Pickup Location", template.content?.pickup_location],
                  ["Pickup Date/Time", template.content?.pickup_date],
                  ["Delivery Location", template.content?.delivery_location],
                  ["Delivery Date/Time", template.content?.delivery_date],
                  ["Commodity", template.content?.commodity || "General Freight"],
                  ["Weight", template.content?.weight],
                  ["Rate", template.content?.rate],
                  ["Fuel Surcharge", template.content?.fuel_surcharge],
                  ["Detention Rate", template.content?.detention_rate],
                  ["Payment Terms", template.content?.payment_terms],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: "8px 12px", background: "#f5f5f5", fontWeight: 600, width: "40%", border: "1px solid #ddd" }}>{k}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{v || "—"}</td>
                  </tr>
                ))}
              </table>
              {template.content?.special_instructions && (
                <div style={{ background: "#fffbef", border: "1px solid #f0d080", borderRadius: 4, padding: 12, fontSize: 13 }}>
                  <strong>Special Instructions:</strong> {template.content.special_instructions}
                </div>
              )}
              <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 30, marginBottom: 8 }}></div>
                  <div style={{ fontSize: 12, color: "#666" }}>Carrier Signature / Date</div>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 30, marginBottom: 8 }}></div>
                  <div style={{ fontSize: 12, color: "#666" }}>Shipper/Broker Signature / Date</div>
                </div>
              </div>
            </div>
          )}

          {templateType === "bol" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>BILL OF LADING</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>BOL #: {fillDate(template.content?.bol_number || DEFAULT_TEMPLATES.bol.bol_number)} | PRO #: {fillDate(template.content?.pro_number || DEFAULT_TEMPLATES.bol.pro_number)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ border: "1px solid #ddd", padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, textTransform: "uppercase", fontSize: 12, color: "#666" }}>Shipper</div>
                  <div>{template.content?.shipper_name || DEFAULT_TEMPLATES.bol.shipper_name}</div>
                  <div style={{ color: "#666" }}>{template.content?.shipper_address || DEFAULT_TEMPLATES.bol.shipper_address}</div>
                </div>
                <div style={{ border: "1px solid #ddd", padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, textTransform: "uppercase", fontSize: 12, color: "#666" }}>Consignee</div>
                  <div>{template.content?.consignee_name || DEFAULT_TEMPLATES.bol.consignee_name}</div>
                  <div style={{ color: "#666" }}>{template.content?.consignee_address || DEFAULT_TEMPLATES.bol.consignee_address}</div>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: DARK, color: "#fff" }}>
                    {["Pieces", "Description", "Weight", "Class", "Declared Value"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.pieces || "1"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.commodity || "General Freight"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.weight || "0 lbs"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.freight_class || "70"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.declared_value || "$0.00"}</td>
                  </tr>
                </tbody>
              </table>
              {template.content?.special_instructions && (
                <div style={{ background: "#f9f9f9", border: "1px solid #ddd", padding: 10, fontSize: 13, marginBottom: 20 }}>
                  <strong>Special Instructions:</strong> {template.content.special_instructions}
                </div>
              )}
              <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
                {["Shipper Signature", "Driver Signature", "Consignee Signature"].map(s => (
                  <div key={s}>
                    <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                    <div style={{ fontSize: 11, color: "#666" }}>{s} / Date</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {templateType === "load_confirmation" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 20 }}>
                LOAD CONFIRMATION — {fillDate(template.content?.load_number || DEFAULT_TEMPLATES.load_confirmation.load_number)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  ["Driver", template.content?.driver_name],
                  ["Truck #", template.content?.truck_number],
                  ["Trailer #", template.content?.trailer_number],
                  ["Dispatcher", template.content?.dispatcher],
                  ["Pickup City", template.content?.pickup_city],
                  ["Pickup Time", template.content?.pickup_time],
                  ["Delivery City", template.content?.delivery_city],
                  ["Delivery Time", template.content?.delivery_time],
                  ["Miles", template.content?.miles],
                  ["Rate/Mile", template.content?.rate_per_mile],
                  ["Total Pay", template.content?.total_pay],
                  ["Fuel Advance", template.content?.fuel_advance],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#f5f5f5", padding: "8px 12px", borderRadius: 3 }}>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontWeight: 600 }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
              {(template.content?.broker_name || template.content?.special_notes) && (
                <div style={{ marginTop: 16, background: "#fffbef", border: "1px solid #f0d080", padding: 12, borderRadius: 3 }}>
                  {template.content?.broker_name && <div><strong>Broker:</strong> {template.content.broker_name} {template.content.broker_phone && `| ${template.content.broker_phone}`}</div>}
                  {template.content?.special_notes && <div style={{ marginTop: 6 }}><strong>Notes:</strong> {template.content.special_notes}</div>}
                </div>
              )}
            </div>
          )}

          {templateType === "driver_checklist" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>PRE-TRIP / POST-TRIP DRIVER CHECKLIST</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Driver: __________________ | Unit #: __________ | Date: {today} | Odometer: __________</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <div>
                  <div style={{ fontWeight: 700, background: DARK, color: GOLD, padding: "6px 12px", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pre-Trip Inspection</div>
                  {(template.content?.items_pretip || DEFAULT_TEMPLATES.driver_checklist.items_pretip).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #eee", fontSize: 13 }}>
                      <div style={{ width: 16, height: 16, border: "1px solid #999", borderRadius: 2, flexShrink: 0 }}></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, background: "#333", color: "#fff", padding: "6px 12px", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Post-Trip Inspection</div>
                  {(template.content?.items_posttrip || DEFAULT_TEMPLATES.driver_checklist.items_posttrip).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #eee", fontSize: 13 }}>
                      <div style={{ width: 16, height: 16, border: "1px solid #999", borderRadius: 2, flexShrink: 0 }}></div>
                      <span>{item}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, fontWeight: 700, fontSize: 13 }}>Defects Found:</div>
                  <div style={{ height: 60, borderBottom: "1px solid #ccc", marginTop: 8 }}></div>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                    <div style={{ fontSize: 11, color: "#666" }}>Driver Signature</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {templateType === "dvir" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>DRIVER VEHICLE INSPECTION REPORT (DVIR)</div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>49 CFR Part 396.11 — Required by FMCSA</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Unit Number", template.content?.unit_number || ""],
                  ["Odometer", template.content?.odometer || ""],
                  ["Trailer #", template.content?.trailer_number || ""],
                  ["Driver", ""],
                  ["Date", today],
                  ["Location", ""]
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#f5f5f5", padding: "6px 10px", borderRadius: 3 }}>
                    <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontWeight: 600, minHeight: 18 }}>{v || "________________"}</div>
                  </div>
                ))}
              </div>
              <div style={{ columns: 3, columnGap: 20 }}>
                {(template.content?.items || DEFAULT_TEMPLATES.dvir.items).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "3px 0", breakInside: "avoid", fontSize: 12 }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                    <span style={{ borderBottom: "1px solid #ddd", flex: 1 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 10 }}>
                <strong style={{ fontSize: 13 }}>Defects / Remarks:</strong>
                <div style={{ minHeight: 50, marginTop: 6 }}>{template.content?.remarks || "None"}</div>
              </div>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                  <div style={{ fontSize: 11, color: "#666" }}>Driver Signature</div>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                  <div style={{ fontSize: 11, color: "#666" }}>Mechanic Signature (if defects)</div>
                </div>
              </div>
            </div>
          )}

          {templateType === "safety_policy" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>
                {template.content?.policy_title || DEFAULT_TEMPLATES.safety_policy.policy_title}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
                {fleetData.fleet_name || "Fleet Name"} | Effective: {template.content?.effective_date || today}
              </div>
              {(template.content?.sections || DEFAULT_TEMPLATES.safety_policy.sections).map((s, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, borderBottom: `2px solid ${fleetData.brand_color || GOLD}`, paddingBottom: 4, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {i + 1}. {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8 }}>{s.body}</div>
                </div>
              ))}
              <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                  <div style={{ fontSize: 11, color: "#666" }}>Fleet Manager Signature / Date</div>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #333", paddingBottom: 28, marginBottom: 6 }}></div>
                  <div style={{ fontSize: 11, color: "#666" }}>Driver Acknowledgment / Date</div>
                </div>
              </div>
            </div>
          )}

          {templateType === "invoice" && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>
                FREIGHT INVOICE #{fillDate(template.content?.invoice_number || DEFAULT_TEMPLATES.invoice.invoice_number)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ border: "1px solid #ddd", padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>Bill To</div>
                  <div>{template.content?.bill_to || DEFAULT_TEMPLATES.invoice.bill_to}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{template.content?.bill_to_address}</div>
                </div>
                <div style={{ border: "1px solid #ddd", padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>Remit To</div>
                  <pre style={{ fontFamily: "inherit", fontSize: 13, margin: 0 }}>{template.content?.remit_to || DEFAULT_TEMPLATES.invoice.remit_to}</pre>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: DARK, color: "#fff" }}>
                    {["Description", "Load #", "Origin → Destination", "Miles", "Amount"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.commodity || "Freight Hauled"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.load_number || "—"}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.origin} → {template.content?.destination}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>{template.content?.miles}</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd", fontWeight: 600 }}>{template.content?.rate || "$0.00"}</td>
                  </tr>
                  {[
                    ["Fuel Surcharge", template.content?.fuel_surcharge],
                    ["Detention", template.content?.detention],
                    ["Lumper", template.content?.lumper],
                  ].filter(([, v]) => v && v !== "$0.00").map(([label, val]) => (
                    <tr key={label}>
                      <td colSpan={4} style={{ padding: "6px 12px", border: "1px solid #ddd", color: "#666" }}>{label}</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #ddd" }}>{val}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f9f9f9" }}>
                    <td colSpan={4} style={{ padding: "10px 12px", border: "1px solid #ddd", fontWeight: 700, textAlign: "right" }}>TOTAL DUE</td>
                    <td style={{ padding: "10px 12px", border: "1px solid #ddd", fontWeight: 700, fontSize: 18, color: DARK }}>{template.content?.total_due || "$0.00"}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: 12, color: "#666" }}>Payment Terms: {template.content?.payment_terms || "Net 30"}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 60, borderTop: `2px solid ${fleetData.brand_color || GOLD}`, paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999" }}>
            <span>{fleetData.fleet_name || "Fleet Name"} | {fleetData.mc_number || ""} | {fleetData.dot_number || ""}</span>
            <span>Generated via TruckWithEase Platform | {today}</span>
          </div>
        </div>
      </div>

      <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
    </div>
  );
}

export default function FleetTemplatePage() {
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedType, setSelectedType] = useState("rate_confirmation");
  const [fleetData, setFleetData] = useState({
    fleet_name: "",
    address: "",
    phone: "",
    email: "truckeasecare@gmail.com",
    mc_number: "",
    dot_number: "",
    logo_url: "",
    brand_color: GOLD,
    accent_color: DARK
  });
  const [templateContent, setTemplateContent] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [printLog, setPrintLog] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [activeDoc, setActiveDoc] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef();

  const currentDefault = DEFAULT_TEMPLATES[selectedType] || {};

  useEffect(() => {
    loadTemplates();
    loadPrintLog();
  }, []);

  async function loadTemplates() {
    setLoadingTemplates(true);
    try {
      const res = await pb.collection("fleet_templates").getList(1, 50, { sort: "-created" });
      setSavedTemplates(res.items);
    } catch (e) {}
    setLoadingTemplates(false);
  }

  async function loadPrintLog() {
    try {
      const res = await pb.collection("document_print_log").getList(1, 100, { sort: "-created" });
      setPrintLog(res.items);
    } catch (e) {}
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      alert("Give this template a name first.");
      return;
    }
    setSaving(true);
    try {
      const merged = { ...currentDefault, ...templateContent };
      const data = {
        fleet_name: fleetData.fleet_name,
        template_type: selectedType,
        template_name: templateName,
        content: merged,
        logo_url: fleetData.logo_url,
        brand_color: fleetData.brand_color,
        accent_color: fleetData.accent_color,
        contact_info: { address: fleetData.address, phone: fleetData.phone, email: fleetData.email, mc_number: fleetData.mc_number, dot_number: fleetData.dot_number },
        is_draft: false,
        print_count: 0
      };
      if (activeDoc) {
        await pb.collection("fleet_templates").update(activeDoc.id, data);
      } else {
        const rec = await pb.collection("fleet_templates").create(data);
        setActiveDoc(rec);
      }
      await loadTemplates();
    } catch (e) {}
    setSaving(false);
  }

  function loadSaved(t) {
    setSelectedType(t.template_type);
    setTemplateName(t.template_name);
    setTemplateContent(t.content || {});
    setFleetData(d => ({
      ...d,
      fleet_name: t.fleet_name || d.fleet_name,
      logo_url: t.logo_url || d.logo_url,
      brand_color: t.brand_color || d.brand_color,
      accent_color: t.accent_color || d.accent_color,
      ...(t.contact_info || {})
    }));
    setActiveDoc(t);
    setActiveTab("builder");
  }

  function handlePrint() {
    const merged = { ...currentDefault, ...templateContent };
    setCurrentTemplate({ template_name: templateName || selectedType, content: merged });
    setShowPrint(true);
  }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFleetData(d => ({ ...d, logo_url: ev.target.result }));
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function updateContent(key, value) {
    setTemplateContent(prev => ({ ...prev, [key]: value }));
  }

  const val = (key) => templateContent[key] !== undefined ? templateContent[key] : currentDefault[key] || "";

  const TABS = [
    { id: "builder", label: "Template Builder" },
    { id: "saved", label: `Saved Templates (${savedTemplates.length})` },
    { id: "print_log", label: "Print Intelligence" },
  ];

  // Print analytics
  const totalPrints = printLog.length;
  const byType = printLog.reduce((acc, r) => { acc[r.document_type] = (acc[r.document_type] || 0) + 1; return acc; }, {});
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const todayPrints = printLog.filter(r => r.created?.startsWith(new Date().toISOString().slice(0, 10))).length;

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#fff", fontFamily: "Oswald, sans-serif" }}>
      {showPrint && currentTemplate && (
        <PrintPreview
          template={currentTemplate}
          templateType={selectedType}
          fleetData={fleetData}
          onClose={() => { setShowPrint(false); loadPrintLog(); }}
        />
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0f1a 0%, #060A10 100%)", borderBottom: `3px solid ${GOLD}`, padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: GOLD, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Top Tier Fleet Access</div>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 36px)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 3, color: "#fff" }}>
                FLEET DOCUMENT CENTER
              </h1>
              <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>Build, customize, and print professional logistics documents — branded to your fleet</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handlePrint} style={{ background: GOLD, color: DARK, border: "none", borderRadius: 4, padding: "10px 24px", fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: 1 }}>
                🖨️ PRINT PREVIEW
              </button>
              <button onClick={saveTemplate} disabled={saving} style={{ background: saving ? "#333" : "#1a2a1a", color: saving ? "#666" : "#4ade80", border: "1px solid #2a4a2a", borderRadius: 4, padding: "10px 20px", fontFamily: "Oswald, sans-serif", fontSize: 15, cursor: "pointer", letterSpacing: 1 }}>
                {saving ? "SAVING..." : "💾 SAVE"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1a2233", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: "none", border: "none", color: activeTab === t.id ? GOLD : "#666", borderBottom: activeTab === t.id ? `3px solid ${GOLD}` : "3px solid transparent", padding: "14px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap", transition: "color 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* BUILDER TAB */}
        {activeTab === "builder" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>

            {/* Left: Fleet Identity + Template Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Fleet Identity Card */}
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
                <div style={{ color: GOLD, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, fontFamily: "Bebas Neue, sans-serif", borderBottom: "1px solid #1a2233", paddingBottom: 8 }}>
                  Fleet Identity
                </div>

                {/* Logo Upload */}
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <div
                    onClick={() => logoRef.current?.click()}
                    style={{
                      width: "100%", height: 80, border: `2px dashed ${GOLD}40`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#0a0f1a", transition: "border-color 0.2s", overflow: "hidden"
                    }}
                  >
                    {fleetData.logo_url ? (
                      <img src={fleetData.logo_url} alt="Logo" style={{ height: 70, maxWidth: "100%", objectFit: "contain" }} />
                    ) : (
                      <>
                        <span style={{ fontSize: 24 }}>🏢</span>
                        <span style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{logoUploading ? "Uploading..." : "Click to upload logo"}</span>
                      </>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  {fleetData.logo_url && (
                    <button onClick={() => setFleetData(d => ({ ...d, logo_url: "" }))} style={{ marginTop: 6, background: "none", border: "none", color: "#e55", fontSize: 11, cursor: "pointer" }}>Remove logo</button>
                  )}
                </div>

                {[
                  { key: "fleet_name", label: "Fleet Name", placeholder: "Your Fleet Name" },
                  { key: "address", label: "Address", placeholder: "123 Freight Lane, Dallas TX" },
                  { key: "phone", label: "Phone", placeholder: "(800) 555-0100" },
                  { key: "email", label: "Email", placeholder: "dispatch@yourfleet.com" },
                  { key: "mc_number", label: "MC Number", placeholder: "MC-000000" },
                  { key: "dot_number", label: "DOT Number", placeholder: "DOT-0000000" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>
                    <input
                      value={fleetData[key] || ""}
                      onChange={e => setFleetData(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", background: "#0a0f1a", border: "1px solid #1a2233", borderRadius: 4, padding: "7px 10px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Brand Color</label>
                    <input type="color" value={fleetData.brand_color || GOLD} onChange={e => setFleetData(d => ({ ...d, brand_color: e.target.value }))}
                      style={{ width: "100%", height: 36, border: "1px solid #1a2233", borderRadius: 4, background: "#0a0f1a", cursor: "pointer" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Accent Color</label>
                    <input type="color" value={fleetData.accent_color || DARK} onChange={e => setFleetData(d => ({ ...d, accent_color: e.target.value }))}
                      style={{ width: "100%", height: 36, border: "1px solid #1a2233", borderRadius: 4, background: "#0a0f1a", cursor: "pointer" }} />
                  </div>
                </div>
              </div>

              {/* Template Type */}
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
                <div style={{ color: GOLD, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, fontFamily: "Bebas Neue, sans-serif", borderBottom: "1px solid #1a2233", paddingBottom: 8 }}>
                  Template Type
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {TEMPLATE_TYPES.map(t => (
                    <button key={t.id} onClick={() => { setSelectedType(t.id); setTemplateContent({}); setTemplateName(""); setActiveDoc(null); }}
                      style={{ background: selectedType === t.id ? `${GOLD}20` : "transparent", border: selectedType === t.id ? `1px solid ${GOLD}` : "1px solid #1a2233", borderRadius: 6, padding: "10px 12px", color: selectedType === t.id ? GOLD : "#aaa", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 13, transition: "all 0.2s" }}>
                      <span style={{ marginRight: 8 }}>{t.icon}</span>
                      <span style={{ fontWeight: 600 }}>{t.label}</span>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 2, marginLeft: 24 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Template Editor */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ color: GOLD, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Bebas Neue, sans-serif" }}>
                    {TEMPLATE_TYPES.find(t => t.id === selectedType)?.label}
                  </div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>Fill in the fields — every change saves automatically</div>
                </div>
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="Template name (e.g. 'Standard Rate Conf')"
                  style={{ background: "#060A10", border: `1px solid ${GOLD}40`, borderRadius: 4, padding: "8px 14px", color: "#fff", fontSize: 13, fontFamily: "inherit", width: 260 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {selectedType === "letterhead" && (
                  <>
                    {[
                      { key: "header_title", label: "Document Title", placeholder: "FREIGHT SERVICES" },
                      { key: "tagline", label: "Tagline", placeholder: "Reliable. Professional." },
                    ].map(({ key, label, placeholder }) => (
                      <InputField key={key} label={label} value={val(key)} placeholder={placeholder} onChange={v => updateContent(key, v)} />
                    ))}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Letter Body</label>
                      <textarea
                        value={val("body_text")}
                        onChange={e => updateContent("body_text", e.target.value)}
                        rows={12}
                        placeholder="Type your letter body here..."
                        style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "10px 12px", color: "#fff", fontSize: 13, fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }}
                      />
                    </div>
                  </>
                )}

                {selectedType === "rate_confirmation" && [
                  { key: "load_number", label: "Load / RC Number", placeholder: "RC-001" },
                  { key: "shipper", label: "Shipper Name", placeholder: "Shipper Co." },
                  { key: "consignee", label: "Consignee", placeholder: "Delivery Co." },
                  { key: "pickup_location", label: "Pickup Location", placeholder: "Dallas, TX" },
                  { key: "pickup_date", label: "Pickup Date/Time", placeholder: "08/20/2026 0600" },
                  { key: "delivery_location", label: "Delivery Location", placeholder: "Chicago, IL" },
                  { key: "delivery_date", label: "Delivery Date/Time", placeholder: "08/21/2026 1400" },
                  { key: "commodity", label: "Commodity", placeholder: "General Freight" },
                  { key: "weight", label: "Weight", placeholder: "40,000 lbs" },
                  { key: "rate", label: "Rate", placeholder: "$2.50/mile" },
                  { key: "fuel_surcharge", label: "Fuel Surcharge", placeholder: "Included" },
                  { key: "detention_rate", label: "Detention Rate", placeholder: "$75/hr after 2hrs" },
                  { key: "payment_terms", label: "Payment Terms", placeholder: "Net 30" },
                  { key: "special_instructions", label: "Special Instructions", placeholder: "" },
                ].map(({ key, label, placeholder }) => (
                  <InputField key={key} label={label} value={val(key)} placeholder={placeholder} onChange={v => updateContent(key, v)} />
                ))}

                {selectedType === "bol" && [
                  { key: "bol_number", label: "BOL Number", placeholder: "BOL-001" },
                  { key: "pro_number", label: "PRO Number", placeholder: "PRO-001" },
                  { key: "shipper_name", label: "Shipper Name", placeholder: "" },
                  { key: "shipper_address", label: "Shipper Address", placeholder: "" },
                  { key: "consignee_name", label: "Consignee Name", placeholder: "" },
                  { key: "consignee_address", label: "Consignee Address", placeholder: "" },
                  { key: "commodity", label: "Commodity Description", placeholder: "General Freight" },
                  { key: "pieces", label: "Pieces", placeholder: "1" },
                  { key: "weight", label: "Weight", placeholder: "40,000 lbs" },
                  { key: "freight_class", label: "Freight Class", placeholder: "70" },
                  { key: "declared_value", label: "Declared Value", placeholder: "$0.00" },
                  { key: "special_instructions", label: "Special Instructions", placeholder: "" },
                ].map(({ key, label, placeholder }) => (
                  <InputField key={key} label={label} value={val(key)} placeholder={placeholder} onChange={v => updateContent(key, v)} />
                ))}

                {selectedType === "load_confirmation" && [
                  { key: "load_number", label: "Load Number", placeholder: "LD-001" },
                  { key: "driver_name", label: "Driver Name", placeholder: "" },
                  { key: "truck_number", label: "Truck Unit #", placeholder: "T-101" },
                  { key: "trailer_number", label: "Trailer #", placeholder: "" },
                  { key: "dispatcher", label: "Dispatcher", placeholder: "" },
                  { key: "pickup_city", label: "Pickup City", placeholder: "Dallas, TX" },
                  { key: "pickup_time", label: "Pickup Date/Time", placeholder: "" },
                  { key: "delivery_city", label: "Delivery City", placeholder: "Chicago, IL" },
                  { key: "delivery_time", label: "Delivery Date/Time", placeholder: "" },
                  { key: "miles", label: "Miles", placeholder: "0" },
                  { key: "rate_per_mile", label: "Rate / Mile", placeholder: "$0.00" },
                  { key: "total_pay", label: "Total Driver Pay", placeholder: "$0.00" },
                  { key: "fuel_advance", label: "Fuel Advance", placeholder: "$0.00" },
                  { key: "broker_name", label: "Broker Name", placeholder: "" },
                  { key: "broker_phone", label: "Broker Phone", placeholder: "" },
                  { key: "special_notes", label: "Special Notes", placeholder: "" },
                ].map(({ key, label, placeholder }) => (
                  <InputField key={key} label={label} value={val(key)} placeholder={placeholder} onChange={v => updateContent(key, v)} />
                ))}

                {selectedType === "invoice" && [
                  { key: "invoice_number", label: "Invoice Number", placeholder: "INV-001" },
                  { key: "bill_to", label: "Bill To (Name)", placeholder: "Broker/Shipper Name" },
                  { key: "bill_to_address", label: "Bill To Address", placeholder: "" },
                  { key: "load_number", label: "Load Number", placeholder: "" },
                  { key: "pickup_date", label: "Pickup Date", placeholder: "" },
                  { key: "delivery_date", label: "Delivery Date", placeholder: "" },
                  { key: "origin", label: "Origin", placeholder: "Dallas, TX" },
                  { key: "destination", label: "Destination", placeholder: "Chicago, IL" },
                  { key: "commodity", label: "Commodity", placeholder: "General Freight" },
                  { key: "miles", label: "Miles", placeholder: "0" },
                  { key: "rate", label: "Line Haul", placeholder: "$0.00" },
                  { key: "fuel_surcharge", label: "Fuel Surcharge", placeholder: "$0.00" },
                  { key: "detention", label: "Detention", placeholder: "$0.00" },
                  { key: "lumper", label: "Lumper", placeholder: "$0.00" },
                  { key: "total_due", label: "TOTAL DUE", placeholder: "$0.00" },
                  { key: "payment_terms", label: "Payment Terms", placeholder: "Net 30" },
                ].map(({ key, label, placeholder }) => (
                  <InputField key={key} label={label} value={val(key)} placeholder={placeholder} onChange={v => updateContent(key, v)} />
                ))}

                {(selectedType === "driver_checklist" || selectedType === "dvir" || selectedType === "safety_policy" || selectedType === "accident_report" || selectedType === "lease_agreement") && (
                  <div style={{ gridColumn: "1 / -1", color: "#888", fontSize: 14, padding: 20, textAlign: "center", border: "1px dashed #1a2233", borderRadius: 6 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>
                      {TEMPLATE_TYPES.find(t => t.id === selectedType)?.icon}
                    </div>
                    <div style={{ color: "#ccc", fontWeight: 600, marginBottom: 6 }}>Standard {TEMPLATE_TYPES.find(t => t.id === selectedType)?.label}</div>
                    <div>Your fleet name, logo, and brand colors are automatically applied. Click <strong style={{ color: GOLD }}>Print Preview</strong> to see the full document — it's ready to go.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SAVED TEMPLATES TAB */}
        {activeTab === "saved" && (
          <div>
            <div style={{ marginBottom: 16, color: "#888", fontSize: 13 }}>
              {savedTemplates.length === 0 ? "No saved templates yet — build one in the Template Builder and hit Save." : `${savedTemplates.length} templates saved for your fleet`}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {savedTemplates.map(t => {
                const meta = TEMPLATE_TYPES.find(x => x.id === t.template_type);
                return (
                  <div key={t.id} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2233"}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{meta?.icon || "📄"}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: "#fff" }}>{t.template_name}</div>
                    <div style={{ fontSize: 12, color: GOLD, marginBottom: 6 }}>{meta?.label}</div>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 14 }}>
                      {t.fleet_name && <span>🚛 {t.fleet_name} | </span>}
                      Saved {new Date(t.created).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => loadSaved(t)} style={{ flex: 1, background: `${GOLD}20`, border: `1px solid ${GOLD}40`, color: GOLD, borderRadius: 4, padding: "8px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => {
                        loadSaved(t);
                        setTimeout(() => { handlePrint(); }, 100);
                      }} style={{ flex: 1, background: "#1a2233", border: "1px solid #2a3a4a", color: "#ccc", borderRadius: 4, padding: "8px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                        🖨️ Print
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRINT INTELLIGENCE TAB */}
        {activeTab === "print_log" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Documents Printed", value: totalPrints, icon: "🖨️", color: GOLD },
                { label: "Printed Today", value: todayPrints, icon: "📅", color: "#4ade80" },
                { label: "Top Document Type", value: topType ? topType[0].replace(/_/g, " ").toUpperCase() : "—", icon: "📊", color: "#60a5fa" },
                { label: "Unique Doc Types", value: Object.keys(byType).length, icon: "📋", color: "#f472b6" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700, color: s.color, fontFamily: "Bebas Neue, sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Document type breakdown */}
            {Object.keys(byType).length > 0 && (
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <div style={{ color: GOLD, fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 16 }}>PRINT ACTIVITY BY DOCUMENT TYPE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                    const max = Math.max(...Object.values(byType));
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 160, fontSize: 13, color: "#ccc", textTransform: "capitalize" }}>{type.replace(/_/g, " ")}</div>
                        <div style={{ flex: 1, background: "#060A10", borderRadius: 4, height: 20, overflow: "hidden" }}>
                          <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD}, ${GOLD}80)`, borderRadius: 4, transition: "width 0.5s" }}></div>
                        </div>
                        <div style={{ width: 30, textAlign: "right", fontWeight: 700, color: GOLD, fontSize: 14 }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Print log table */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
              <div style={{ color: GOLD, fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 16 }}>RECENT PRINT ACTIVITY</div>
              {printLog.length === 0 ? (
                <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "30px 0" }}>No documents printed yet. Every print will be tracked here — building your fleet's logistics intelligence over time.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Document", "Type", "Fleet", "Driver/Load", "Date"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #1a2233" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {printLog.map(r => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #0a0f1a" }}>
                          <td style={{ padding: "10px 12px", fontSize: 13, color: "#ccc" }}>{r.document_name || "—"}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: GOLD, textTransform: "capitalize" }}>{(r.document_type || "—").replace(/_/g, " ")}</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, color: "#aaa" }}>{r.fleet_name || "—"}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: "#666" }}>{r.driver_name || r.load_number || "—"}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: "#555" }}>{r.created ? new Date(r.created).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>
      <input
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
      />
    </div>
  );
}
