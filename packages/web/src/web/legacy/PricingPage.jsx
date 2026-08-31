// BILLING & PRICING MODULE — TruckWithEase
//
// Rebuilt Aug 25, 2026 from a pasted standalone HTML file (preserved verbatim at
// docs/launch/BillingPricingModule.ORIGINAL.html.txt). What changed and why:
//
//  - Prices are now READ FROM THE API (`GET /api/signup`, PLANS in api/routes/signup.ts).
//    Nothing on this page retypes a price. One source of truth.
//  - DELETED "Annual ROI: $82,000+ in optimizations" and "Breakeven: 3.6 months" —
//    no customer has ever paid anything. Fabricated numbers get deleted, not restyled.
//  - DELETED the lease-vs-buy "breakeven ~10 months / payback 10 months" claim. It was
//    backwards: owned costs $10/unit/mo MORE than lease AND carries $600/truck upfront,
//    so owning never breaks even. Replaced with an honest per-unit comparison that says so.
//  - DELETED the "5-year total cost $3,900" figure (real owned 5-yr = $600 + 59.99*60 =
//    $4,199.40) and the "$9,975 5-year savings from buying" (sign was inverted).
//  - DELETED invented hardware SKUs (tablet+ELD $380, dash cam $180, install kit $40,
//    upgrades $150/$120/$450) and hardware promises with no supplier contract behind them
//    (3-year warranty, 24-hour replacement, 48-hour upgrade shipping).
//  - DELETED "24/7 Phone Support" and "Dedicated account manager" — one-man company.
//  - DELETED the fake invoice customer (Midwest Express Logistics, INV-2026-08-001) and
//    the invented $150 "Advanced Compliance Reports" line item. Invoice is now a blank
//    template with a NOT A REAL INVOICE banner.
//  - Feature comparison is labeled PLANNED — NOT ENFORCED: there is no user login and no
//    entitlement layer in this app, so no tier gates anything today.
//  - billing@truckwitheaseai.com (unregistered domain) -> jeremiahjmorris1126@gmail.com.
//  - Recolored to brand gold-on-black. The original was navy/slate/green/amber.

import React, { useEffect, useState } from "react";
import { featurePrices } from "./PricingTiersConfig";

const GOLD = "#C9A84C";
const GOLDB = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const BILLING_EMAIL = "jeremiahjmorris1126@gmail.com";
const SUPPORT_EMAIL = "truckeasecare@gmail.com";
const SUPPORT_PHONE = "636-706-8338";
const HARDWARE_ONE_TIME = 600; // $/truck, one-time. Fleet (hardware owned) only.

const TABS = [
  { id: "tiers", label: "Pricing Tiers" },
  { id: "hardware", label: "Hardware" },
  { id: "compare", label: "Feature Comparison" },
  { id: "examples", label: "Billing Examples" },
  { id: "invoice", label: "Invoice Template" },
];

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── shared bits ──────────────────────────────────────────────────────────── */

function Banner({ tone = "warn", children }) {
  const c = tone === "warn" ? WARN : GOLD;
  return (
    <div
      style={{
        border: `1px solid ${c}`,
        background: tone === "warn" ? "rgba(201,106,76,0.08)" : "rgba(201,168,76,0.08)",
        color: c,
        padding: "12px 16px",
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        letterSpacing: 0.4,
        lineHeight: 1.6,
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, accent = false, style = {} }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${accent ? GOLD : BORDER}`,
        borderRadius: 8,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 30,
          letterSpacing: 1.5,
          color: GOLDB,
          margin: 0,
        }}
      >
        {children}
      </h2>
      {sub ? (
        <p style={{ color: MUTED, fontSize: 14, margin: "6px 0 0", fontFamily: "Inter, sans-serif" }}>{sub}</p>
      ) : null}
    </div>
  );
}

/* ── tab: tiers ───────────────────────────────────────────────────────────── */

function TiersTab({ plans, trialDays }) {
  const order = ["solo", "pro", "fleet_lease", "fleet_owned"];
  return (
    <div>
      <SectionTitle sub={`Prices read live from the API. ${trialDays}-day free trial, no contracts, Net 30.`}>
        PRICING TIERS
      </SectionTitle>
      <Banner>
        NO PAYMENT PROCESSING IS LIVE. The payment provider key in this build is a test key. Signing up stores a
        record — it does not charge a card and does not create a subscription with a provider.
      </Banner>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
        {order.map((key) => {
          const p = plans[key];
          if (!p) return null;
          return (
            <Card key={key} accent={key === "pro"}>
              {key === "pro" ? (
                <div
                  style={{
                    display: "inline-block",
                    background: GOLD,
                    color: BLACK,
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 11,
                    letterSpacing: 1,
                    padding: "3px 10px",
                    borderRadius: 3,
                    marginBottom: 10,
                  }}
                >
                  ALL-INCLUSIVE
                </div>
              ) : null}
              <h3
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 20,
                  color: "#eee",
                  margin: "0 0 10px",
                  letterSpacing: 0.6,
                }}
              >
                {p.name}
              </h3>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: GOLDB, lineHeight: 1 }}>
                {money(p.unitPrice)}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: MUTED, marginTop: 4 }}>
                per {p.unit}
              </div>
              <p style={{ color: MUTED, fontSize: 13, marginTop: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
                {p.note}
              </p>
              {key === "fleet_owned" ? (
                <p style={{ color: WARN, fontSize: 12, marginTop: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                  + {money(HARDWARE_ONE_TIME)}/truck one-time
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle sub="Solo only. Range confirmed at $2.99–$10.99. The individual add-on list below is a draft — none of it is enforced in code yet because there is no entitlement layer.">
          À-LA-CARTE ADD-ONS
        </SectionTitle>
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "8px 24px" }}>
            {featurePrices.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  borderBottom: `1px solid ${BORDER}`,
                  padding: "8px 0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "#ddd",
                }}
              >
                <span>{f.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: GOLD, whiteSpace: "nowrap" }}>
                  {f.price}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── tab: hardware ────────────────────────────────────────────────────────── */

function HardwareTab({ plans }) {
  const lease = plans.fleet_lease;
  const owned = plans.fleet_owned;
  if (!lease || !owned) return null;

  const rows = [
    ["Billing unit", `per ${lease.unit}`, `per ${owned.unit}`],
    ["Monthly rate", `${money(lease.unitPrice)} / ${lease.unit}`, `${money(owned.unitPrice)} / ${owned.unit}`],
    ["Up-front cost", "$0.00", `${money(HARDWARE_ONE_TIME)} per truck`],
    ["Who owns the hardware", "TruckWithEase", "The carrier"],
    ["Replacement / warranty terms", "NOT SET — no supplier contract", "NOT SET — no supplier contract"],
  ];

  const yr5Lease = lease.unitPrice * 60;
  const yr5Owned = HARDWARE_ONE_TIME + owned.unitPrice * 60;

  return (
    <div>
      <SectionTitle sub="Lease and owned are not directly comparable — one bills per truck, the other per driver.">
        HARDWARE OPTIONS
      </SectionTitle>

      <Banner>
        THERE IS NO BREAKEVEN ON BUYING. Owned bills {money(owned.unitPrice - lease.unitPrice)}/unit/mo MORE than
        lease and adds {money(HARDWARE_ONE_TIME)} per truck up front. Buying never catches up on cost. The reason to
        buy is hardware ownership and control, not savings. The original document claimed a ~10-month payback — that
        was wrong in direction, not just in size.
      </Banner>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          <thead>
            <tr>
              {["", "Fleet — hardware leased", "Fleet — hardware owned"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: GOLD,
                    fontFamily: "Oswald, sans-serif",
                    letterSpacing: 0.6,
                    borderBottom: `1px solid ${GOLD}`,
                    fontSize: 13,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderBottom: `1px solid ${BORDER}`,
                      color: i === 0 ? MUTED : "#ddd",
                      fontFamily: i === 0 ? "Inter, sans-serif" : "'JetBrains Mono', monospace",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card>
          <h3 style={{ fontFamily: "Oswald, sans-serif", color: "#eee", fontSize: 16, margin: "0 0 14px" }}>
            5-YEAR COST, ONE UNIT (60 months, no price changes assumed)
          </h3>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#ddd", lineHeight: 2 }}>
            <div>
              Leased: {money(lease.unitPrice)} × 60 = <span style={{ color: GOLDB }}>{money(yr5Lease)}</span>{" "}
              <span style={{ color: DIM }}>(per truck)</span>
            </div>
            <div>
              Owned: {money(HARDWARE_ONE_TIME)} + ({money(owned.unitPrice)} × 60) ={" "}
              <span style={{ color: GOLDB }}>{money(yr5Owned)}</span>{" "}
              <span style={{ color: DIM }}>(hardware per truck + subscription per driver)</span>
            </div>
            <div style={{ color: WARN }}>Difference: owned costs {money(yr5Owned - yr5Lease)} more over 5 years.</div>
          </div>
          <p style={{ color: DIM, fontSize: 12, marginTop: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
            This is a straight arithmetic projection, not a quote. It assumes one driver per truck; a fleet running two
            drivers on one truck pays the owned subscription twice and the lease rate once, which widens the gap.
          </p>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card>
          <h3 style={{ fontFamily: "Oswald, sans-serif", color: WARN, fontSize: 15, margin: "0 0 12px" }}>
            NOT COMMITTED — DO NOT QUOTE
          </h3>
          <ul style={{ color: MUTED, fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
            <li>Hardware SKUs and unit costs — no supplier contract is signed.</li>
            <li>Warranty length, damage protection, and replacement turnaround.</li>
            <li>Upgrade / RMA shipping times.</li>
            <li>TruckWithEase is not an ELD and is not an FMCSA-registered ELD provider. No registration is being pursued. It runs alongside the ELD you already have.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ── tab: feature comparison ──────────────────────────────────────────────── */

// state: "built" (exists in this app), "partial", "planned" (does not exist yet)
const COMPARE = [
  ["HOS / ELD logging", "built"],
  ["DVIR (pre-trip / post-trip)", "built"],
  ["GPS tracking & live map", "built"],
  ["Fuel finder (live EIA diesel prices)", "built"],
  ["Trip planner", "built"],
  ["Load board", "built"],
  ["Dispatch chat", "built"],
  ["TRAXES accountant AI", "built"],
  ["Driver safety scorecard", "built"],
  ["Roadwards rewards", "built"],
  ["Breakdown SOS", "built"],
  ["Community bulletin board", "built"],
  ["HR module (people, payroll, docs)", "partial"],
  ["Document storage / uploads", "partial"],
  ["Weigh-station bypass (PrePass)", "planned"],
  ["Fuel card integration & sync", "planned"],
  ["Factoring & invoice management", "partial"],
  ["Detention pay recovery", "partial"],
  ["AI dispatch optimization", "planned"],
  ["Dash cam integration", "planned"],
  ["Background checks (Checkr)", "planned"],
];

const STATE_STYLE = {
  built: { label: "BUILT", color: GOLDB },
  partial: { label: "PARTIAL", color: GOLD },
  planned: { label: "NOT BUILT", color: WARN },
};

function CompareTab() {
  const counts = COMPARE.reduce((a, [, s]) => ({ ...a, [s]: (a[s] || 0) + 1 }), {});
  return (
    <div>
      <SectionTitle sub="What exists in the code today — not what each tier unlocks.">FEATURE COMPARISON</SectionTitle>

      <Banner>
        TIER GATING IS PLANNED — NOT ENFORCED. This app has no user login and no entitlement layer, so no plan
        currently restricts any feature. Any table that shows ✓ / ✗ per tier is a sales intention, not behavior.
        Real gating needs auth first.
      </Banner>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
        <span style={{ color: GOLDB }}>BUILT {counts.built || 0}</span>
        <span style={{ color: GOLD }}>PARTIAL {counts.partial || 0}</span>
        <span style={{ color: WARN }}>NOT BUILT {counts.planned || 0}</span>
        <span style={{ color: DIM }}>TIER-ENFORCED 0</span>
      </div>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
          <thead>
            <tr>
              {["Feature", "Status in code", "Enforced by plan?"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: GOLD,
                    fontFamily: "Oswald, sans-serif",
                    borderBottom: `1px solid ${GOLD}`,
                    fontSize: 13,
                    letterSpacing: 0.6,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([name, state]) => (
              <tr key={name}>
                <td style={{ padding: "9px 12px", borderBottom: `1px solid ${BORDER}`, color: "#ddd" }}>{name}</td>
                <td
                  style={{
                    padding: "9px 12px",
                    borderBottom: `1px solid ${BORDER}`,
                    color: STATE_STYLE[state].color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {STATE_STYLE[state].label}
                </td>
                <td
                  style={{
                    padding: "9px 12px",
                    borderBottom: `1px solid ${BORDER}`,
                    color: DIM,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  NO
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── tab: billing examples ────────────────────────────────────────────────── */

function ExamplesTab({ plans, trialDays }) {
  const [drivers, setDrivers] = useState(25);
  const [trucks, setTrucks] = useState(25);
  const n = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

  const rows = [
    {
      label: "Solo",
      qty: n(drivers),
      unit: plans.solo?.unit,
      rate: plans.solo?.unitPrice,
      upfront: 0,
      base: n(drivers) * (plans.solo?.unitPrice || 0),
    },
    {
      label: "Pro",
      qty: n(drivers),
      unit: plans.pro?.unit,
      rate: plans.pro?.unitPrice,
      upfront: 0,
      base: n(drivers) * (plans.pro?.unitPrice || 0),
    },
    {
      label: "Fleet — hardware leased",
      qty: n(trucks),
      unit: plans.fleet_lease?.unit,
      rate: plans.fleet_lease?.unitPrice,
      upfront: 0,
      base: n(trucks) * (plans.fleet_lease?.unitPrice || 0),
    },
    {
      label: "Fleet — hardware owned",
      qty: n(drivers),
      unit: plans.fleet_owned?.unit,
      rate: plans.fleet_owned?.unitPrice,
      upfront: n(trucks) * HARDWARE_ONE_TIME,
      base: n(drivers) * (plans.fleet_owned?.unitPrice || 0),
    },
  ];

  const input = {
    background: BLACK,
    border: `1px solid ${BORDER}`,
    color: GOLDB,
    padding: "8px 10px",
    borderRadius: 4,
    width: 90,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
  };

  return (
    <div>
      <SectionTitle sub="Straight multiplication from the live plan rates. No discounts, no ROI claims, no tax.">
        BILLING EXAMPLES
      </SectionTitle>

      <Banner>
        NO ROI FIGURES ON THIS PAGE. The original document claimed "$82,000+ annual ROI" and a "3.6 month breakeven".
        Nobody has paid for this product yet, so there is no data behind either number. They were removed.
      </Banner>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ color: MUTED, fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 0.6 }}>
            DRIVERS{" "}
            <input type="number" min="1" value={drivers} onChange={(e) => setDrivers(Number(e.target.value))} style={input} />
          </label>
          <label style={{ color: MUTED, fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 0.6 }}>
            TRUCKS{" "}
            <input type="number" min="1" value={trucks} onChange={(e) => setTrucks(Number(e.target.value))} style={input} />
          </label>
        </div>
      </Card>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr>
              {["Plan", "Billed on", "Rate", "Qty", "Monthly", "One-time"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: GOLD,
                    fontFamily: "Oswald, sans-serif",
                    borderBottom: `1px solid ${GOLD}`,
                    fontSize: 13,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: "#ddd", fontFamily: "Inter, sans-serif" }}>
                  {r.label}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>{r.unit}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>
                  {money(r.rate || 0)}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>{r.qty}</td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: GOLDB }}>
                  {money(r.base)}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: r.upfront ? WARN : DIM }}>
                  {r.upfront ? money(r.upfront) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: DIM, fontSize: 12, marginTop: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
          Sales tax is not calculated anywhere in this app. Terms: {trialDays}-day free trial, then monthly, Net 30, no
          contract. Solo add-ons ($2.99–$10.99 each) are not included above.
        </p>
      </Card>
    </div>
  );
}

/* ── tab: invoice template ────────────────────────────────────────────────── */

function InvoiceTab({ plans }) {
  const line = { padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, color: "#ddd" };
  const blank = <span style={{ color: DIM }}>—</span>;
  return (
    <div>
      <SectionTitle sub="Blank layout only. No customer, no amounts, no invoice number.">INVOICE TEMPLATE</SectionTitle>

      <Banner>
        NOT A REAL INVOICE. No invoice has ever been issued and no money has moved. The original document shipped a
        fabricated invoice for "Midwest Express Logistics" totalling $1,505.73, including a $150 SKU that exists in no
        price list and a $0 "24/7 Phone Support" line. All of it was removed.
      </Banner>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: GOLDB, letterSpacing: 1.4 }}>
              TRUCKWITHEASE
            </div>
            <div style={{ color: MUTED, fontSize: 12, fontFamily: "Inter, sans-serif", lineHeight: 1.8, marginTop: 6 }}>
              My Dads Trucking LLC · Springfield, MO
              <br />
              Billing: {BILLING_EMAIL}
              <br />
              Support: {SUPPORT_EMAIL} · {SUPPORT_PHONE}
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: MUTED, lineHeight: 2 }}>
            <div>INVOICE # {blank}</div>
            <div>ISSUED {blank}</div>
            <div>DUE Net 30</div>
            <div>BILL TO {blank}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr>
              {["Description", "Unit", "Rate", "Qty", "Amount"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: GOLD,
                    fontFamily: "Oswald, sans-serif",
                    borderBottom: `1px solid ${GOLD}`,
                    fontSize: 13,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(plans).map(([k, p]) => (
              <tr key={k}>
                <td style={{ ...line, fontFamily: "Inter, sans-serif" }}>{p.name} subscription</td>
                <td style={line}>{p.unit}</td>
                <td style={line}>{money(p.unitPrice)}</td>
                <td style={line}>{blank}</td>
                <td style={line}>{blank}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...line, fontFamily: "Inter, sans-serif" }}>Hardware, one-time (owned plan only)</td>
              <td style={line}>truck</td>
              <td style={line}>{money(HARDWARE_ONE_TIME)}</td>
              <td style={line}>{blank}</td>
              <td style={line}>{blank}</td>
            </tr>
            <tr>
              <td style={{ ...line, fontFamily: "Inter, sans-serif" }}>Solo à-la-carte add-ons</td>
              <td style={line}>each</td>
              <td style={line}>$2.99 – $10.99</td>
              <td style={line}>{blank}</td>
              <td style={line}>{blank}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: "12px", textAlign: "right", color: MUTED, fontFamily: "Oswald, sans-serif" }}>
                SALES TAX
              </td>
              <td style={{ padding: "12px", color: WARN }}>NOT CALCULATED</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: "12px", textAlign: "right", color: GOLD, fontFamily: "Oswald, sans-serif" }}>
                TOTAL DUE
              </td>
              <td style={{ padding: "12px", color: DIM }}>—</td>
            </tr>
          </tbody>
        </table>

        <p style={{ color: DIM, fontSize: 12, marginTop: 18, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
          There is no PDF generator behind this page. The original had a download button that only fired an alert
          saying the feature "would be integrated here" — it was removed rather than shipped as a dead button. Use the
          browser's print-to-PDF until real invoicing is wired to a payment provider.
        </p>
      </Card>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  const [tab, setTab] = useState("tiers");
  const [state, setState] = useState({ loading: true, error: "", plans: null, trialDays: null });

  useEffect(() => {
    const ctl = new AbortController();
    fetch("/api/signup", { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setState({ loading: false, error: "", plans: d.plans, trialDays: d.trialDays }))
      .catch((e) => {
        if (e.name === "AbortError") return;
        setState({ loading: false, error: String(e.message || e), plans: null, trialDays: null });
      });
    return () => ctl.abort();
  }, []);

  const wrap = { background: BLACK, minHeight: "100vh", color: "#eee", padding: "36px 5% 80px" };

  if (state.loading) {
    return (
      <div style={wrap}>
        <p style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>Loading pricing from API…</p>
      </div>
    );
  }

  if (state.error || !state.plans) {
    return (
      <div style={wrap}>
        <Banner>
          PRICING UNAVAILABLE — could not read /api/signup ({state.error || "no plans returned"}). No prices are
          hardcoded on this page, so nothing is shown rather than showing a stale number.
        </Banner>
      </div>
    );
  }

  const { plans, trialDays } = state;

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM, letterSpacing: 1 }}>
          INTERNAL + SALES REFERENCE · PRICES READ FROM /api/signup · NO LIVE BILLING
        </div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 52,
            letterSpacing: 2,
            margin: "0 0 6px",
            background: "linear-gradient(135deg,#A9762A 0%,#FFD700 45%,#F5E79E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          BILLING &amp; PRICING
        </h1>
        <p style={{ color: MUTED, fontFamily: "Inter, sans-serif", fontSize: 15, margin: "0 0 28px" }}>
          {trialDays}-day free trial · no contracts · cancel anytime · Net 30 · billing questions:{" "}
          <a href={`mailto:${BILLING_EMAIL}`} style={{ color: GOLD }}>
            {BILLING_EMAIL}
          </a>
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: on ? GOLD : "transparent",
                  color: on ? BLACK : MUTED,
                  border: `1px solid ${on ? GOLD : BORDER}`,
                  padding: "9px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 13,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "tiers" && <TiersTab plans={plans} trialDays={trialDays} />}
        {tab === "hardware" && <HardwareTab plans={plans} />}
        {tab === "compare" && <CompareTab />}
        {tab === "examples" && <ExamplesTab plans={plans} trialDays={trialDays} />}
        {tab === "invoice" && <InvoiceTab plans={plans} />}
      </div>
    </div>
  );
}
