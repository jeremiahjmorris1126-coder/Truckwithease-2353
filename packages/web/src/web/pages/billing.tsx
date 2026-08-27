import { useState } from "react";
import { Check, X, Truck, Sparkles, Building2, Download, Wrench, Home, RefreshCw } from "lucide-react";

/* ------------------------------------------------------------------ data */

const TIERS = [
  {
    id: "solo",
    name: "Solo",
    icon: Truck,
    desc: "For owner-operators and small fleets",
    price: "$29.99",
    period: "per driver / month",
    note: "No setup fee, cancel anytime",
    featured: false,
    alt: { label: "À la carte features:", price: "$2.99 – $10.99", period: "add what you need" },
    included: [
      "HOS logging & ELD",
      "Basic dispatch",
      "GPS tracking",
      "Fuel finder",
      "Driver safety scorecard",
    ],
    excluded: ["Fleet-wide dashboard", "Advanced compliance", "Dedicated support"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    desc: "All-in-one for growing fleets",
    price: "$39.99",
    period: "per driver / month",
    note: "Everything included, no add-ons",
    featured: true,
    alt: null,
    included: [
      "HOS logging & ELD",
      "AI dispatch optimization",
      "GPS tracking + real-time updates",
      "Fuel card integration & sync",
      "DVIR compliance",
      "Detention tracking & recovery",
      "Driver performance analytics",
      "Breakdown SOS & nearest repair",
      "Load profitability calculator",
      "Expense tracking & reporting",
    ],
    excluded: ["Multi-fleet management", "Dedicated account manager"],
  },
  {
    id: "fleet",
    name: "Fleet",
    icon: Building2,
    desc: "Enterprise fleet management",
    price: "$49.99",
    period: "per truck / month (up to 10 trucks)",
    note: "Includes hardware rental",
    featured: false,
    alt: { label: "OR buy outright:", price: "$59.99", period: "per driver / month (no hardware fee)" },
    included: [
      "Everything in Pro +",
      "Multi-fleet management",
      "Advanced compliance audit",
      "Batch DVIR reports",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Hardware support & replacement",
    ],
    excluded: [],
  },
];

const HARDWARE = [
  {
    icon: Truck,
    title: "Lease Option",
    sub: "Fleet Rental $49.99 / truck",
    heading: "Included per truck",
    lines: [
      'Android tablet (8") with TruckWithEase pre-loaded',
      "ELD device with cellular (4G / LTE)",
      "Dash camera (front-facing)",
      "Vehicle mount & USB charging",
      "3-year warranty & damage protection",
      "24-hour hardware replacement",
    ],
    footLabel: "Best for",
    foot: "Fleets wanting predictable costs, zero capital outlay, and 24/7 support",
    footTone: "text-emerald-400",
  },
  {
    icon: Home,
    title: "Own Outright",
    sub: "Fleet Owned $59.99 / driver",
    heading: "One-time hardware purchase",
    lines: [
      "Tablet + ELD — $380",
      "Dash camera bundle — $180",
      "Installation kit — $40",
      "Total per truck — $600",
      "Monthly software — $59.99 / driver",
    ],
    footLabel: "Breakeven",
    foot: "~10 months of payments. 5-year total cost $3,900 vs $2,999 leased.",
    footTone: "text-amber-400",
  },
  {
    icon: RefreshCw,
    title: "Upgrade Options",
    sub: "Hardware refresh anytime",
    heading: "Available upgrades",
    lines: [
      "Tablet upgrade — $150 (every 3 years)",
      "ELD replacement — $120 (battery / damage)",
      "Additional dash cam — $180",
      "360° camera system — $450",
    ],
    footLabel: "Shipping",
    foot: "All upgrades ship within 48 hours",
    footTone: "text-twgold",
  },
];

type Cell = true | false | string;
const COMPARISON: { feature: string; solo: Cell; pro: Cell; fleet: Cell }[] = [
  { feature: "HOS Logging & ELD", solo: true, pro: true, fleet: true },
  { feature: "GPS Real-time Tracking", solo: true, pro: true, fleet: true },
  { feature: "Dispatch Optimization", solo: "Basic", pro: "AI", fleet: "AI" },
  { feature: "DVIR & Vehicle Inspections", solo: false, pro: true, fleet: true },
  { feature: "Fuel Card Integration", solo: false, pro: true, fleet: true },
  { feature: "Detention Tracking & Recovery", solo: false, pro: true, fleet: true },
  { feature: "Load Profitability Calculator", solo: false, pro: true, fleet: true },
  { feature: "Expense Tracking", solo: false, pro: true, fleet: true },
  { feature: "Breakdown SOS & Repair Locator", solo: false, pro: true, fleet: true },
  { feature: "Driver Performance Analytics", solo: false, pro: true, fleet: true },
  { feature: "Multi-Fleet Management", solo: false, pro: false, fleet: true },
  { feature: "Advanced Compliance Reports", solo: false, pro: false, fleet: true },
  { feature: "Dedicated Account Manager", solo: false, pro: false, fleet: true },
  { feature: "24/7 Phone Support", solo: "Email", pro: "Email", fleet: "24/7" },
  { feature: "Hardware Included", solo: false, pro: false, fleet: "w/ lease" },
  { feature: "14-Day Free Trial", solo: true, pro: true, fleet: true },
];

const EXAMPLES = [
  {
    title: "Solo Owner-Operator",
    lines: [
      ["TruckWithEase Solo subscription", "$29.99"],
      ["Add: GPS Premium feature", "+$4.99"],
      ["Add: Advanced reports", "+$5.99"],
    ],
    total: ["Monthly total", "$40.97"],
    notes: ["No hardware costs", "14-day free trial", "Cancel anytime"],
    tone: "text-twgold",
  },
  {
    title: "Growing 5-Truck Fleet",
    lines: [
      ["Pro subscription (5 drivers)", "$39.99 × 5"],
      ["Subtotal", "$199.95"],
      ["Hardware rental (5 trucks)", "Included"],
    ],
    total: ["Monthly total", "$199.95"],
    notes: ["All features included", "No hardware cost", "Predictable monthly burn"],
    tone: "text-twgold",
  },
  {
    title: "Enterprise: 50 Trucks (Lease)",
    lines: [
      ["Fleet Rental subscriptions (50)", "$49.99 × 50"],
      ["Subtotal", "$2,499.50"],
      ["Hardware", "$0 — included"],
      ["Dedicated support", "Included"],
    ],
    total: ["Monthly total", "$2,499.50"],
    notes: ["Annual ROI: $82,000+ in optimizations", "Breakeven: 3.6 months"],
    tone: "text-emerald-400",
  },
  {
    title: "Enterprise: 50 Trucks (Owned)",
    lines: [
      ["Hardware (one-time)", "$600 × 50"],
      ["CAPEX", "$30,000"],
      ["Software subscriptions", "$59.99 × 50"],
      ["Subtotal", "$2,999.50"],
    ],
    total: ["Year 1 monthly", "$2,999.50"],
    notes: ["Payback period: 10 months", "5-year savings vs lease: $9,975"],
    tone: "text-amber-400",
  },
];

const INVOICE_ITEMS = [
  ["Fleet Subscription (Lease) — August 2026", "25 trucks", "$49.99", "$1,249.75"],
  ["Hardware Lease (Tablet + ELD + Dash Cam per truck)", "25 units", "Included", "$0.00"],
  ["24/7 Phone Support", "1", "Included", "$0.00"],
  ["Advanced Compliance Reports (Optional)", "1", "$150.00", "$150.00"],
];

const TABS = [
  { id: "pricing", label: "Pricing Tiers" },
  { id: "hardware", label: "Hardware Options" },
  { id: "comparison", label: "Feature Comparison" },
  { id: "examples", label: "Billing Examples" },
  { id: "invoice", label: "Sample Invoice" },
] as const;

/* -------------------------------------------------------------- helpers */

function Mark({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-400" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-twborder" />;
  return <span className="font-heading text-xs uppercase tracking-wide text-twgold">{value}</span>;
}

/* ----------------------------------------------------------------- page */

export default function Billing() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pricing");

  return (
    <div className="min-h-screen bg-twblack text-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* header */}
        <header className="text-center">
          <img src="/static/twe-logo-horizontal-trim.png" alt="TruckWithEase" className="mx-auto h-10 w-auto object-contain" />
          <h1 className="mt-6 font-display text-4xl tracking-wide text-twgoldbright sm:text-5xl">
            BILLING &amp; PRICING
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400">
            Complete transparency on fleet software, hardware, and monthly charges.
          </p>
          <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-twgold to-transparent" />
        </header>

        {/* tabs */}
        <nav className="mt-10 flex gap-1 overflow-x-auto border-b border-twborder">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-5 py-3 font-heading text-sm uppercase tracking-wide transition-colors ${
                tab === t.id
                  ? "border-twgoldbright text-twgoldbright"
                  : "border-transparent text-neutral-500 hover:text-twgold"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ---------------------------------------------------- pricing */}
        {tab === "pricing" && (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {TIERS.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className={`relative flex flex-col rounded-2xl border bg-twcard p-7 ${
                    t.featured ? "border-twgoldbright shadow-[0_0_40px_-12px_rgba(255,215,0,0.35)]" : "border-twborder"
                  }`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-twgoldbright px-3 py-1 font-heading text-[10px] uppercase tracking-widest text-twblack">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-twborder bg-twnav">
                      <Icon className="h-5 w-5 text-twgold" />
                    </div>
                    <span className="font-display text-2xl tracking-wide text-twgoldbright">{t.name}</span>
                  </div>
                  <p className="mt-3 min-h-[40px] text-sm text-neutral-400">{t.desc}</p>

                  <div className="mt-5 rounded-xl border-l-2 border-twgold bg-twnav p-4">
                    <div className="font-mono-data text-4xl font-bold text-white">{t.price}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-neutral-400">{t.period}</div>
                    <div className="mt-2 text-xs text-twgold">{t.note}</div>
                  </div>

                  {t.alt && (
                    <div className="mt-3 rounded-xl border-l-2 border-emerald-500 bg-twnav p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400">{t.alt.label}</div>
                      <div className="mt-1 font-mono-data text-2xl font-bold text-white">{t.alt.price}</div>
                      <div className="text-xs text-neutral-400">{t.alt.period}</div>
                    </div>
                  )}

                  <button
                    className={`mt-6 w-full rounded-lg py-3 font-heading text-sm uppercase tracking-wide transition-colors ${
                      t.featured
                        ? "bg-twgoldbright text-twblack hover:bg-twgold"
                        : "border border-twgold text-twgold hover:bg-twgold hover:text-twblack"
                    }`}
                  >
                    Start 14-day free trial
                  </button>

                  <ul className="mt-6 space-y-2.5">
                    {t.included.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-200">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                    {t.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-600 line-through">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* --------------------------------------------------- hardware */}
        {tab === "hardware" && (
          <div className="mt-10">
            <h2 className="font-display text-2xl tracking-wide text-twgoldbright">HARDWARE — LEASE VS BUY</h2>
            <p className="mt-2 max-w-3xl text-sm text-neutral-400">
              Rental includes support, replacement, and updates. Ownership builds asset value.
            </p>
            <div className="mt-7 grid gap-6 lg:grid-cols-3">
              {HARDWARE.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="flex flex-col rounded-2xl border border-twborder bg-twcard p-6">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-twgold" />
                      <div>
                        <div className="font-heading text-lg uppercase tracking-wide text-twgoldbright">{h.title}</div>
                        <div className="text-xs text-neutral-500">{h.sub}</div>
                      </div>
                    </div>
                    <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-twgold">{h.heading}</div>
                    <ul className="mt-3 space-y-2">
                      {h.lines.map((l) => (
                        <li key={l} className="flex gap-2 text-sm text-neutral-300">
                          <span className="text-twgold">•</span>
                          {l}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto border-t border-twborder pt-4 text-sm">
                      <span className="font-semibold uppercase tracking-wide text-neutral-500">{h.footLabel}: </span>
                      <span className={h.footTone}>{h.foot}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------- comparison */}
        {tab === "comparison" && (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-twborder bg-twcard">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-twnav">
                  <th className="px-5 py-4 text-left font-heading text-xs uppercase tracking-widest text-twgold">Feature</th>
                  <th className="px-5 py-4 font-heading text-xs uppercase tracking-widest text-twgold">Solo $29.99</th>
                  <th className="px-5 py-4 font-heading text-xs uppercase tracking-widest text-twgoldbright">Pro $39.99</th>
                  <th className="px-5 py-4 font-heading text-xs uppercase tracking-widest text-twgold">Fleet $49.99 / $59.99</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((r, i) => (
                  <tr key={r.feature} className={i % 2 ? "bg-twnav/40" : ""}>
                    <td className="border-t border-twborder px-5 py-3 text-neutral-200">{r.feature}</td>
                    <td className="border-t border-twborder px-5 py-3 text-center"><Mark value={r.solo} /></td>
                    <td className="border-t border-twborder px-5 py-3 text-center"><Mark value={r.pro} /></td>
                    <td className="border-t border-twborder px-5 py-3 text-center"><Mark value={r.fleet} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------------------------------------------- examples */}
        {tab === "examples" && (
          <div className="mt-10">
            <h2 className="font-display text-2xl tracking-wide text-twgoldbright">REAL-WORLD BILLING SCENARIOS</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {EXAMPLES.map((e) => (
                <div key={e.title} className="rounded-2xl border border-twborder bg-twcard p-6">
                  <div className="font-heading text-lg uppercase tracking-wide text-twgold">{e.title}</div>
                  <div className="mt-4 space-y-2">
                    {e.lines.map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm text-neutral-300">
                        <span>{l}</span>
                        <span className="font-mono-data">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-twborder pt-3 font-bold text-twgoldbright">
                      <span>{e.total[0]}</span>
                      <span className="font-mono-data">{e.total[1]}</span>
                    </div>
                  </div>
                  <ul className={`mt-4 space-y-1 text-xs ${e.tone}`}>
                    {e.notes.map((n) => (
                      <li key={n}>✓ {n}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- invoice */}
        {tab === "invoice" && (
          <div className="mt-10">
            <div className="mx-auto max-w-3xl rounded-2xl border border-twborder bg-twcard p-8">
              <div className="flex items-start justify-between border-b border-twborder pb-5">
                <div>
                  <div className="font-display text-3xl tracking-wide text-twgoldbright">INVOICE</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-neutral-500">TruckWithEase</div>
                </div>
                <img src="/static/twe-logo-horizontal-trim.png" alt="" className="h-8 w-auto object-contain" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Bill To", "Midwest Express Logistics"],
                  ["Invoice #", "INV-2026-08-001"],
                  ["Invoice Date", "August 1, 2026"],
                  ["Due Date", "August 31, 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-twborder bg-twnav p-3">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{k}</div>
                    <div className="mt-1 font-semibold text-white">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-twborder">
                      {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                        <th key={h} className="px-2 py-3 text-left font-heading text-[11px] uppercase tracking-widest text-twgold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICE_ITEMS.map((row) => (
                      <tr key={row[0]} className="border-b border-twborder/60">
                        <td className="px-2 py-3 text-neutral-200">{row[0]}</td>
                        <td className="px-2 py-3 text-neutral-400">{row[1]}</td>
                        <td className="px-2 py-3 font-mono-data text-neutral-400">{row[2]}</td>
                        <td className="px-2 py-3 font-mono-data text-white">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-end gap-2 border-t border-twborder pt-5 text-sm">
                <div className="flex gap-8">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="w-32 text-right font-mono-data text-white">$1,399.75</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-neutral-500">Tax (varies by state)</span>
                  <span className="w-32 text-right font-mono-data text-white">$105.98</span>
                </div>
                <div className="flex gap-8 border-t border-twborder pt-3 text-lg font-bold text-twgoldbright">
                  <span>TOTAL DUE</span>
                  <span className="w-32 text-right font-mono-data">$1,505.73</span>
                </div>
              </div>

              <div className="mt-6 border-t border-twborder pt-4 text-center text-xs text-neutral-500">
                <b className="text-neutral-300">Payment Terms:</b> Net 30 • Auto-renews monthly • All pricing in USD
                <br />
                Questions? jeremiahjmorris1126@gmail.com
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-twgoldbright px-6 py-3 font-heading text-sm uppercase tracking-wide text-twblack transition-colors hover:bg-twgold"
              >
                <Download className="h-4 w-4" />
                Save / Print as PDF
              </button>
            </div>
          </div>
        )}

        {/* footer */}
        <footer className="mt-16 border-t border-twborder pt-6 text-center text-xs text-neutral-500">
          <div className="flex items-center justify-center gap-2 text-twgold">
            <Wrench className="h-3.5 w-3.5" />
            <span className="font-heading uppercase tracking-widest">TruckWithEase — Complete Fleet Management</span>
          </div>
          <p className="mt-2">14-day free trial • No contracts • Cancel anytime</p>
          <p className="mt-1 text-neutral-600">All pricing effective as of August 2026</p>
        </footer>
      </div>
    </div>
  );
}
