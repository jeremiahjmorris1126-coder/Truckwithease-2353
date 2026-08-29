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
// src/api/routes/signup.ts. PricingPage.jsx and CheckoutPage.jsx both fetch those
// over GET /api/signup. Do not retype a monthly price in this file.
//
// REMOVED 2026-08-29: the entire `pricingPlans` export. It was a SECOND price list
// holding $29.99 / $39.99 / $49.99 / $59.99 plus per-plan `included` bullets, and
// CheckoutPage.jsx rendered it, so this product shipped two price lists that could
// drift apart. Deleted. The bullets it carried were fabricated anyway - among them
// "HOS/ELD Logger (built-in, no extra device needed)" (this is not an ELD and no
// device ships), "Load Board" (there is no load board integration of any kind),
// "Parking Finder", "Live Fuel Finder" and a "Most Popular" highlight flag with no
// adoption data behind it. Only `featurePrices` - the Solo a-la-carte add-on menu -
// survives in this file.

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
