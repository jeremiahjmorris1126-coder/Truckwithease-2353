import React, { useState } from "react";

const NAVY = "#001f3f";
const ORANGE = "#ff6b35";
const GREEN = "#4caf50";
const RED = "#dc2626";
const AMBER = "#ffc107";

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState("driver");
  const [expandedStep, setExpandedStep] = useState(0);

  const driverTutorial = [
    {
      step: 1,
      title: "Sign Up & Create Your Account",
      duration: "2 minutes",
      description: "Join TruckWithEase with zero commitment — 14-day free trial, no credit card required.",
      details: [
        "Go to the signup page and enter your name, email, and phone number",
        "Verify your email (check spam folder if needed)",
        "Download the mobile app from App Store or Google Play",
        "Log in with your new account — you're instantly live on the network",
        "You'll see your personal dashboard with loads, HOS logger, and fuel finder"
      ],
      icon: "👤"
    },
    {
      step: 2,
      title: "Complete Your Driver Profile",
      duration: "5 minutes",
      description: "Upload your credentials so you're ready to start accepting loads.",
      details: [
        "Tap Profile > License & Documents",
        "Photograph your CDL (driver's license) — OCR reads it instantly, auto-fills expiry date and endorsements",
        "Upload medical certificate (FMCSA Form)",
        "Confirm HAZMAT endorsement status if you haul dangerous goods",
        "System auto-checks — if anything expires soon, you get a reminder",
        "Once verified, you're cleared to accept loads"
      ],
      icon: "📋"
    },
    {
      step: 3,
      title: "Accept Your First Load",
      duration: "3 minutes",
      description: "See what profit you'll actually make — no guessing.",
      details: [
        "Tap Load Board (home screen)",
        "Browse available loads — filter by distance, rate, destination",
        "Tap any load to see the profit breakdown:",
        "  • Base rate (what shipper pays)",
        "  • Fuel cost auto-calculated from your truck's MPG",
        "  • Tolls auto-deducted (highway charges pre-calculated)",
        "  • Detention hours tracked (you get $150/hr for waiting)",
        "  • Your net profit shows at the top in GREEN",
        "If the profit looks good, tap 'Accept Load' — shipper gets notified instantly"
      ],
      icon: "📦"
    },
    {
      step: 4,
      title: "Log Your HOS (Hours of Service)",
      duration: "Automatic",
      description: "FMCSA rules enforced automatically — no violation surprises.",
      details: [
        "When you start driving, tap HOS Logger — it auto-starts",
        "As you drive, the app logs your hours — driving, on-duty, breaks, off-duty",
        "Tap 'Log Break' when you stop (rest areas, shipper, anywhere)",
        "App auto-calculates your remaining available hours for the day",
        "If you get close to 11-hour limit, the app warns you: 'You have 1.5 hours remaining'",
        "Comply automatically — no risk of violation fines"
      ],
      icon: "⏱️"
    },
    {
      step: 5,
      title: "Use Fuel Finder to Save Money",
      duration: "1 minute",
      description: "Find the cheapest fuel on your route — save $50+ per fill-up.",
      details: [
        "Tap Fuel Finder on your dashboard",
        "Map shows all truck stops on your current route (Pilot, Love's, Speedway, etc.)",
        "Price per gallon displayed for each stop — color-coded green (cheapest) to red (most expensive)",
        "Tap a stop to see amenities (shower, restaurant, parking, WiFi)",
        "Divert slightly if the savings are worth it (app calculates extra miles vs. fuel savings)",
        "When you fuel up, the app auto-tracks your purchase if card is linked"
      ],
      icon: "⛽"
    },
    {
      step: 6,
      title: "Track Detention Time & Get Paid",
      duration: "Automatic",
      description: "Detention shouldn't cost you money — claim every hour.",
      details: [
        "When you arrive at shipper or receiver, tap 'Arrival'",
        "App starts a detention timer automatically",
        "While waiting (loading/unloading), you see the timer running",
        "After 2 hours of waiting, you can auto-claim detention pay at $150/hour",
        "Tap 'End Detention' when you're cleared to leave",
        "App calculates your detention bonus and adds it to your load earnings",
        "Payment includes detention + base rate + adjustments = your total for the load"
      ],
      icon: "⏰"
    },
    {
      step: 7,
      title: "Handle a Breakdown (If It Happens)",
      duration: "30 seconds to fix",
      description: "One tap to find a repair shop, get a quote, and bill your carrier.",
      details: [
        "If something breaks on the road, tap the red SOS button (bottom of screen)",
        "Select 'Vehicle Breakdown' and describe the issue (engine, tire, electrical, etc.)",
        "AI agent finds the nearest certified repair shop — shows distance, estimated wait",
        "You can accept the shop quote right in the app, or call them directly",
        "Shop gets your truck info instantly. You're not dead on the side of the road",
        "Repair costs auto-tracked and billed to your carrier (you're not liable)",
        "Dispatch gets notified and can reassign loads to other drivers"
      ],
      icon: "🚨"
    },
    {
      step: 8,
      title: "View Your Weekly Earnings & Safety Score",
      duration: "1 minute",
      description: "See exactly how much you made and how you compare to the fleet.",
      details: [
        "Tap Reports > Weekly Earnings",
        "See breakdown: total loads, total miles, total pay, detention bonuses",
        "Compare your earnings to weekly target — are you on pace?",
        "Tap Safety Scorecard to see your performance:",
        "  • Speeding incidents (mph over limit)",
        "  • Hard braking (aggressive stops)",
        "  • Idle time (engine running parked)",
        "  • On-time delivery rate",
        "Improve any metric and earn safety bonuses ($50–$200/month)"
      ],
      icon: "📊"
    },
    {
      step: 9,
      title: "Get Coaching Alerts (Real Support)",
      duration: "Real-time",
      description: "When you do something unsafe, you don't get fined — you get coached.",
      details: [
        "If you speed over 75 mph, you get an in-app alert: 'Speeding detected: 78 mph. Slow down safely.'",
        "Hard brake? Alert: 'Sharp braking detected. Check your following distance.'",
        "Idle too long? Alert: 'Engine running for 30 min. Turn it off to save fuel.'",
        "No fines, no shame — just coaching to keep you safe and save money",
        "Fleet manager sees these alerts too (only coaching version, not disciplinary)",
        "Over time, your safety score improves and you unlock bonuses"
      ],
      icon: "💡"
    },
    {
      step: 10,
      title: "Convert to Paid & Keep Growing",
      duration: "1 click",
      description: "Day 13 of your trial — choose your plan and go unlimited.",
      details: [
        "On day 13, you get an email: 'Your 14-day trial ends tomorrow'",
        "Visit /checkout and choose your plan:",
        "  • Solo $29.99/mo: Load board + HOS + fuel finder + basic coaching",
        "  • Pro $39.99/mo: Solo + AI dispatch optimization + fuel card integration + priority support",
        "  • Add features anytime ($2.99–$10.99/mo each) as your needs grow",
        "No setup fee. Cancel anytime (though you probably won't want to)",
        "Your next 30 days of earnings are yours to keep — your subscription is separate"
      ],
      icon: "✨"
    }
  ];

  const fleetTutorial = [
    {
      step: 1,
      title: "Sign Up & Create Your Fleet Account",
      duration: "3 minutes",
      description: "Set up your fleet workspace with one master account.",
      details: [
        "Go to the signup page and enter your fleet name, email, and phone",
        "Verify your email",
        "You land in the Fleet Admin Dashboard — a bird's-eye view of your entire operation",
        "No download needed yet (mobile app optional for drivers)",
        "You see: fleet overview, compliance status, dispatch board, profitability metrics"
      ],
      icon: "🏢"
    },
    {
      step: 2,
      title: "Import Your Driver Roster",
      duration: "5 minutes",
      description: "Bulk-add all your drivers at once — no manual entry.",
      details: [
        "Tap Admin > Drivers > Upload Roster",
        "Download the CSV template (3 columns: name, email, phone)",
        "Paste in your driver list (50, 100, 500 — doesn't matter)",
        "Upload and submit",
        "System auto-generates accounts for every driver",
        "Each driver gets an onboarding email with login link",
        "They download the app and are live in minutes — you don't have to hand-hold anyone"
      ],
      icon: "👥"
    },
    {
      step: 3,
      title: "Set Your Compliance Rules",
      duration: "5 minutes",
      description: "Define what safety and compliance rules your fleet follows.",
      details: [
        "Tap Settings > Compliance Thresholds",
        "Set your rules:",
        "  • HOS limit (typically 11 hours; you can set lower for safety)",
        "  • Speeding threshold (e.g., 'flag if over 75 mph')",
        "  • Idle time limit (e.g., 'alert if engine runs >30 min parked')",
        "  • DVIR requirements (require photos before every load, after every trip, etc.)",
        "  • Medical certificate expiry reminders (auto-alert 30 days before expiry)",
        "When a driver breaks a rule, you get an alert — they get coaching, not punishment",
        "Rules auto-enforce across your fleet"
      ],
      icon: "⚙️"
    },
    {
      step: 4,
      title: "Launch Your Dispatch Board",
      duration: "10 minutes",
      description: "Assign loads intelligently — AI suggests the best driver for each load.",
      details: [
        "Tap Dispatch Board (home screen)",
        "Enter a load: shipper, origin, destination, weight, rate",
        "System auto-calculates: distance, fuel cost, detention risk, profit margin",
        "AI agent recommends 3 drivers based on:",
        "  • Location (closest driver first)",
        "  • Availability (not in HOS violation, not overloaded)",
        "  • Specialization (if load requires tanker/flatbed/reefer, driver has license)",
        "  • Safety score (best performers get priority)",
        "You can tap 'Auto-Assign' (AI decides) or manually pick a driver",
        "Driver gets notified instantly in their app — can accept or decline in 30 seconds"
      ],
      icon: "🗺️"
    },
    {
      step: 5,
      title: "Monitor Fleet in Real-Time",
      duration: "Continuous",
      description: "Know where every truck is, what they're hauling, and if they're on time.",
      details: [
        "Fleet Map shows all vehicles in real-time GPS",
        "Color coding: green (on-time, safe), amber (approaching HOS limit, speeding), red (broken down, non-compliant)",
        "Tap any truck to see:",
        "  • Current load and ETA",
        "  • Driver's HOS remaining today",
        "  • Recent speeding/braking incidents",
        "  • Fuel level (if truck has fuel gauge)",
        "If a truck breaks down, you're notified instantly with repair shop options",
        "If HOS violation is imminent, system auto-suggests a rest stop"
      ],
      icon: "📍"
    },
    {
      step: 6,
      title: "Automate Fuel Card Integration",
      duration: "5 minutes",
      description: "Every fuel purchase auto-tracks — no expense forms, no guessing.",
      details: [
        "Tap Admin > Integrations > Fuel Card",
        "Link your Pilot/Love's fuel card account (or other provider)",
        "Every driver's fuel swipe automatically logs:",
        "  • Amount (gallons and dollars)",
        "  • Location and time",
        "  • Associated load (if on load when fueling)",
        "At end of day, you see: total fleet fuel spend, price per gallon, MPG per truck",
        "Identify inefficient trucks instantly (if T-023 is getting 4.2 MPG vs. fleet avg 6.1 MPG, you know why)"
      ],
      icon: "💳"
    },
    {
      step: 7,
      title: "Review Compliance & Safety Reports",
      duration: "5 minutes daily",
      description: "Daily safety briefing — what happened, what to coach, what to celebrate.",
      details: [
        "Tap Reports > Daily Safety Report",
        "See yesterday's fleet performance:",
        "  • Total miles driven",
        "  • Speeding incidents (by driver, by truck)",
        "  • Hard braking events",
        "  • Idle time (wasted fuel)",
        "  • HOS compliance (anyone close to limit?)",
        "  • DVIR submissions (required photos received)",
        "Red flags are listed first ('Driver Mike exceeded HOS yesterday by 1.5 hours')",
        "You can auto-send coaching messages to individual drivers or bulk coach the fleet",
        "Over time, you see trends (e.g., speeding drops 23% after month 2)"
      ],
      icon: "📋"
    },
    {
      step: 8,
      title: "Track Profitability Per Truck",
      duration: "2 minutes",
      description: "Know which trucks are making money and which are costing you.",
      details: [
        "Tap Reports > Profitability Dashboard",
        "See every truck ranked by profit:",
        "  • Truck T-001: $2,840 gross, $680 fuel, $150 tolls, $2,010 net profit",
        "  • Truck T-002: $2,120 gross, $890 fuel (high idle), $50 tolls, $1,180 net profit",
        "System highlights inefficiencies:",
        "  • T-002's fuel spend is 30% higher than T-001 (same load type)",
        "  • Recommendation: Check tire pressure, idle reduction training, fuel card limit if driver is overusing",
        "Detention recovery is auto-tracked too — if drivers aren't claiming detention, you can coach them"
      ],
      icon: "💰"
    },
    {
      step: 9,
      title: "Generate Reports for Shareholders & Insurance",
      duration: "1 click",
      description: "Professional PDFs ready to send to anyone — no data entry.",
      details: [
        "Tap Reports > Export",
        "Choose what to include:",
        "  • Monthly P&L (revenue, fuel, tolls, detention, net)",
        "  • Safety scorecard (compliance %, violations, trend)",
        "  • Driver performance (earnings, safety, retention)",
        "  • Fleet health (uptime %, breakdowns, maintenance needed)",
        "Click 'Generate PDF' — it's ready in seconds",
        "Email directly to accountant, insurance broker, or board members",
        "Historical reports saved (auditable for 7 years)"
      ],
      icon: "📊"
    },
    {
      step: 10,
      title: "Choose Your Fleet Plan & Go Live",
      duration: "1 click",
      description: "14-day trial done — pick Fleet plan and all drivers get full access.",
      details: [
        "Day 13 of trial, you get an email: 'Your trial ends tomorrow'",
        "Visit /checkout and choose:",
        "  • Fleet Rental $49.99/seat/mo (up to 10 trucks): includes tablet & ELD rental",
        "  • Fleet Owned $59.99/seat/mo (up to 10 trucks): you buy hardware outright ($180/unit one-time)",
        "For a 50-truck fleet:",
        "  • Fleet Rental: 5 groups of 10 = $2,500/mo all-in with hardware",
        "  • Fleet Owned: 5 groups × $59.99 × 10 + hardware cost",
        "Subscribe and your entire fleet goes live — dispatch, HOS, compliance, profitability tracking all enabled",
        "Hardware ships within 24 hours. Installed within 5 days. Your fleet is fully operational."
      ],
      icon: "🚀"
    }
  ];

  const steps = activeTab === "driver" ? driverTutorial : fleetTutorial;

  return (
    <div style={{ background: NAVY, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>
          📚 Getting Started Tutorials
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.8, textAlign: "center", marginBottom: "40px" }}>
          Follow these step-by-step guides to master TruckWithEase in 30 minutes.
        </p>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "40px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("driver")}
            style={{
              padding: "12px 30px",
              background: activeTab === "driver" ? ORANGE : "rgba(255,255,255,0.1)",
              color: activeTab === "driver" ? NAVY : "white",
              border: activeTab === "driver" ? "none" : `1px solid rgba(255,255,255,0.2)`,
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            👨‍💼 Driver Tutorial
          </button>
          <button
            onClick={() => setActiveTab("fleet")}
            style={{
              padding: "12px 30px",
              background: activeTab === "fleet" ? ORANGE : "rgba(255,255,255,0.1)",
              color: activeTab === "fleet" ? NAVY : "white",
              border: activeTab === "fleet" ? "none" : `1px solid rgba(255,255,255,0.2)`,
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            🏢 Fleet Manager Tutorial
          </button>
        </div>

        {/* Tutorial Steps */}
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {steps.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                marginBottom: "20px",
                overflow: "hidden",
                transition: "all 0.3s"
              }}
            >
              <div
                onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "25px",
                  background: expandedStep === idx ? "rgba(255,107,53,0.1)" : "transparent",
                  cursor: "pointer",
                  borderBottom: expandedStep === idx ? `2px solid ${ORANGE}` : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
                  <div style={{ fontSize: "40px" }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "13px", opacity: 0.6, marginBottom: "5px" }}>
                      STEP {item.step} • {item.duration}
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    opacity: 0.6,
                    transform: expandedStep === idx ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s"
                  }}
                >
                  ▼
                </div>
              </div>

              {expandedStep === idx && (
                <div style={{ padding: "30px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontSize: "15px", opacity: 0.8, marginBottom: "20px", lineHeight: "1.6" }}>
                    {item.description}
                  </p>

                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px", borderLeft: `4px solid ${ORANGE}` }}>
                    {item.details.map((detail, didx) => (
                      <div key={didx} style={{ marginBottom: didx < item.details.length - 1 ? "12px" : "0", fontSize: "14px", opacity: 0.85, lineHeight: "1.6" }}>
                        {detail.includes("•") ? (
                          <div style={{ marginLeft: "15px" }}>• {detail.replace("•", "").trim()}</div>
                        ) : (
                          <div>{detail}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: "60px", textAlign: "center", background: "rgba(255,107,53,0.1)", padding: "40px", borderRadius: "12px", border: `1px solid ${ORANGE}` }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
            Ready to Start Your 14-Day Trial?
          </h2>
          <p style={{ fontSize: "15px", opacity: 0.8, marginBottom: "25px" }}>
            No credit card required. Drivers and fleet managers both get instant access to the full platform.
          </p>
          <button
            onClick={() => window.location.href = "/checkout"}
            style={{
              padding: "14px 40px",
              background: ORANGE,
              color: NAVY,
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            Start Your Free Trial Now
          </button>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: "60px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px", textAlign: "center" }}>Quick Questions</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {[
              { q: "Do I need a credit card for the trial?", a: "No. 14 days free, no payment method required. You only pay if you decide to subscribe." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime and keep all your data. No long-term contract." },
              { q: "What happens to my data if I cancel?", a: "Your data stays archived for 6 months. You can export or re-activate anytime." },
              { q: "Do I have to buy hardware?", a: "Fleet plans include hardware rental ($49.99/mo) or you can buy outright ($59.99/mo subscription + one-time hardware cost)." },
              { q: "Can I upgrade/downgrade plans?", a: "Yes, anytime. Pro-rated billing means you only pay for what you use." },
              { q: "What if I have technical issues?", a: "Email truckeasecare@gmail.com or tap Help in-app. Response within 2 hours." }
            ].map((faq, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "10px", color: ORANGE }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: "14px", opacity: 0.8, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
