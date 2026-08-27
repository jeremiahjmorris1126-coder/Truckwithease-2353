// TruckWithEase feature + tier pricing configuration.
//
// PRICING OF RECORD (Aug 2026), confirmed by Jeremiah 2026-08-26:
//   ELD hardware = $600 one-time per truck, OR pay monthly, in which case the
//   hardware lease is included in the Fleet tier at $49.99/truck/mo.
//   There is NO separate monthly hardware rental fee.
//
// CORRECTED 2026-08-26 - this file contradicted the pricing of record, and
// CheckoutPage.jsx reads pricingPlans from here, so it was quoting wrong money:
//   - "rent tablets + ELD devices for $15-$25/mo per unit"  -> DELETED, no such plan
//   - "one-time hardware purchase ($180-$220 per unit)"     -> $600 per truck
//   - ELD device "Included in all tiers"                    -> only the Fleet lease
//   - "Dedicated Support & Account Manager"                 -> Priority Email Support
//     (there is no account-manager or 24/7 phone staff to honor that promise;
//      same claim was already removed from PricingPage for the same reason)
//   - fleet-owned "/seat/mo" -> "/driver/mo"; fleet lease "/mo" -> "/truck/mo"
//   - the "ELD Device" row was REMOVED from featurePrices entirely: that list is
//     the Solo à-la-carte menu of monthly add-ons, and hardware is not a monthly
//     add-on. Hardware pricing lives on the Hardware tab of PricingPage.
//
// The authoritative source for the monthly plan prices is PLANS in
// src/api/routes/signup.ts (field `unitPrice`). PricingPage.jsx fetches those
// over GET /api/signup instead of reading them here. Do not retype a monthly
// price in this file.

export const featurePrices = [
  { id: "dispatch", name: "Dispatch Routing & Messaging", price: "$4.99" },
  { id: "fleet-tracking", name: "Live Fleet Map & Multi-Vehicle Admin", price: "$3.99" },
  { id: "fuel-card-integration", name: "Fuel Card Integration & Syncing", price: "$5.99" },
  { id: "factoring", name: "Factoring & Invoice Management", price: "$6.99" },
  { id: "ai-mechanic", name: "Fleet Chief AI (Diagnostics)", price: "$7.99" },
  { id: "ai-health", name: "Health Chief AI", price: "$5.99" },
  { id: "prepass", name: "Weigh Station Bypass (PrePass)", price: "$8.99" },
  { id: "toll-optimizer", name: "Toll Route Optimizer", price: "$3.99" },
  { id: "cam-integration", name: "TruckEase Cam Integration", price: "$4.99" },
  { id: "safety-scorecard", name: "Driver Safety Scorecard & Coaching", price: "$4.99" },
  { id: "state-patrol", name: "State Patrol Intelligence", price: "$6.99" },
  { id: "voice-priority", name: "Voice Commands (Priority Support)", price: "$2.99" },
  { id: "bulk-reports", name: "Bulk DVIR Reports & Analytics", price: "$5.99" },
  { id: "compliance-tools", name: "State Compliance Tools (AB5, etc.)", price: "$6.99" },
  { id: "custom-integrations", name: "Custom Integrations & API Access", price: "$10.99" },
  { id: "dedicated-support", name: "Priority Email Support", price: "$9.99" },
];

export const pricingPlans = [
  {
    id: "solo",
    name: "Solo",
    price: "$29.99",
    period: "/mo",
    tag: "Owner-Operators",
    description: "Download the app (iOS, Android, Mac) and start logging HOS instantly—build your own with features as you grow",
    included: [
      "🚚 HOS/ELD Logger (built-in, no extra device needed)",
      "📍 GPS Tracking",
      "🔍 Pre-Trip DVIR",
      "⚠️ State DOT AI Watcher",
      "⛽ Live Fuel Finder",
      "🅿️ Parking Finder",
      "📦 Load Board",
      "📊 IFTA Tracking",
      "💰 Load Profit Calculator",
      "💳 Expense Tracker",
      "⏰ Detention Pay Tracker",
      "🗺️ Trip Planner",
      "📋 Digital Permit Book",
      "🆘 Breakdown SOS",
      "📱 Download app to iOS, Android, or Mac"
    ],
    addOns: "Add any feature à la carte ($2.99–$10.99/mo)",
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39.99",
    period: "/mo",
    tag: "Most Popular",
    description: "All Solo features + dispatch, fleet tracking, and AI tools—download app or add ELD hardware as an option",
    included: [
      "All Solo features",
      "🚚 HOS/ELD Logger (app-based or with optional hardware)",
      "📍 Dispatch Routing & Messaging",
      "🗺️ Live Fleet Map (multi-driver view)",
      "⛽ Fuel Card Integration",
      "💵 Factoring & Invoice Management",
      "🔧 Fleet Chief AI (Diagnostics)",
      "❤️ Health Chief AI",
      "🛣️ Weigh Station Bypass (PrePass)",
      "🛣️ Toll Route Optimizer",
      "📹 TruckEase Cam Integration",
      "🏆 Driver Safety Scorecard",
      "🎙️ Voice Commands (Priority)",
      "📊 Speed & Idle Tracking",
      "📱 Download app to iOS, Android, or Mac",
      "📱 Optional: Add ELD tablet hardware ($600 one-time per truck)"
    ],
    excluded: "Fleet management (multi-driver admin, bulk reporting)",
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    id: "fleet-rental",
    name: "Fleet (App + ELD Optional)",
    price: "$49.99",
    period: "/truck/mo",
    tag: "Fleet Managers",
    description: "All Pro features + multi-driver admin—drivers download the app, or you provide ELD tablets for the fleet",
    included: [
      "All Pro features",
      "🚚 HOS/ELD Logger (app-based, available to all drivers)",
      "👥 Multi-driver Fleet Admin Map",
      "👥 Unlimited Drivers per Fleet",
      "📊 Fleet HOS Overview & Status",
      "📋 Bulk DVIR Reports",
      "🏆 Driver Safety Scorecards",
      "🚔 State Patrol Intelligence",
      "⚖️ CA AB5 Compliance Tools",
      "📢 Driver Coaching Alerts",
      "🔗 Custom Integrations",
      "💼 Priority Email Support",
      "📱 Drivers download app (iOS, Android, Mac)",
      "📱 ELD tablet hardware lease included — no separate fee"
    ],
    hardwareNote: "Drivers use the app on their own phones — no hardware required. If you want ELD tablets, the hardware lease is included in the $49.99/truck/mo price. There is no separate monthly hardware fee.",
    cta: "Start Free Trial",
  },
  {
    id: "fleet-owned",
    name: "Fleet (App + ELD Hardware Owned)",
    price: "$59.99",
    period: "/driver/mo",
    tag: "Fleet Managers",
    description: "All features + owned ELD hardware per driver—one-time purchase, full control",
    included: [
      "All Pro features",
      "🚚 HOS/ELD Logger (dedicated hardware)",
      "👥 Multi-driver Fleet Admin Map",
      "👥 Unlimited Drivers per Fleet",
      "📊 Fleet HOS Overview & Status",
      "📋 Bulk DVIR Reports",
      "🏆 Driver Safety Scorecards",
      "🚔 State Patrol Intelligence",
      "⚖️ CA AB5 Compliance Tools",
      "📢 Driver Coaching Alerts",
      "🔗 Custom Integrations",
      "💼 Priority Email Support",
      "📱 ELD Tablet Hardware (Owned) — $600 one-time per truck"
    ],
    hardwareNote: "One-time hardware purchase of $600 per truck. Subscription continues at $59.99/driver/mo. Fleet owns and controls the hardware lifecycle.",
    cta: "Contact Sales",
  },
];

export const compareRows = [
  { feature: "Base Monthly Price", solo: "$29.99", pro: "$39.99", fleetRental: "$49.99", fleetOwned: "$59.99/driver" },
  { feature: "HOS/ELD Logger", solo: "✓ App-based", pro: "✓ App-based", fleetRental: "✓ App-based + optional hardware", fleetOwned: "✓ Dedicated hardware" },
  { feature: "Download to Phone/Mac", solo: "✓ iOS, Android, Mac", pro: "✓ iOS, Android, Mac", fleetRental: "✓ iOS, Android, Mac", fleetOwned: "✓ iOS, Android, Mac + tablet" },
  { feature: "Build-Your-Own Features", solo: "Yes ($2.99–$10.99 each)", pro: "All included", fleetRental: "All included", fleetOwned: "All included" },
  { feature: "Dispatch & Multi-Driver", solo: "Add for $4.99", pro: "✓ Included", fleetRental: "✓ Included", fleetOwned: "✓ Included" },
  { feature: "Fleet Admin Map", solo: "Add for $3.99", pro: "Add for $3.99", fleetRental: "✓ Included", fleetOwned: "✓ Included" },
  { feature: "ELD Hardware", solo: "Not included — $600 one-time per truck", pro: "Not included — $600 one-time per truck", fleetRental: "✓ Lease included in $49.99/truck/mo", fleetOwned: "✓ Owned — $600 one-time per truck" },
  { feature: "Support", solo: "Email", pro: "Priority email", fleetRental: "Priority email", fleetOwned: "Priority email" },
  { feature: "Best For", solo: "Owner-operators, cost-conscious startups", pro: "Independent operators, small fleets, phone-based logging", fleetRental: "Fleets wanting app flexibility + optional hardware rental", fleetOwned: "Fleets wanting dedicated ELD tablets per driver" },
];
