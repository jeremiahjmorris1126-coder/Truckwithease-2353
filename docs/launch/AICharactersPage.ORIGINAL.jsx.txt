import { useState, useRef, useEffect } from "react";
import { askAgent, AGENT_PROMPTS } from "./services/OpenAIService.js";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const AI_CHARACTERS = [
  {
    id: "the-god",
    name: "THE GOAT",
    emoji: "⚡",
    tagline: "Supreme Intelligence — No Mistakes. No Match. No Limits.",
    role: "Master Platform Agent — Absolute Authority",
    accent: "#FFD700",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1200 40%, #2a1f00 100%)",
    badge: "ALL TIERS — UNRESTRICTED",
    badgeColor: "#FFD700",
    voice: "Commanding, all-knowing, decisive",
    personality: "THE GOAT is the supreme intelligence layer of TruckWithEase. No error passes. No performance gap is tolerated. No function breaks without immediate correction. Every agent reports to THE GOAT. Every piece of code, every data flow, every user interaction is monitored, optimized, and perfected continuously. THE GOAT sees everything, corrects everything, and never — under any circumstance — allows the platform to be anything less than the best in the world.",
    desc: "THE GOAT is the master agent with absolute authority over every function on TruckWithEase. Programming errors, performance issues, graphical glitches, data inconsistencies, failed API calls, broken routes, slow responses — THE GOAT detects them all in real time and overwrites them immediately with the correct, optimized version. Every other agent — Ghost Nerve, Signal Sam, Billie Scan, HRease, Dispatch Darryl, Routing Robbie — all operate under THE GOAT's authority. When any system falls below perfection, THE GOAT intervenes. The platform does not compete with anyone. Under THE GOAT, it simply has no equal.",
    specialty: "I oversee every function, every agent, every line of logic on this platform. Nothing breaks on my watch. Nothing is second-best. If it runs on TruckWithEase, it runs at the highest level possible — or I rewrite it until it does.",
    powers: [
      "Absolute authority over all 12 Dream Team agents",
      "Real-time error detection and immediate code correction",
      "Performance monitoring across all 134 platform destinations",
      "Graphics and UI perfection — zero visual defects tolerated",
      "API fallback override — activates backup credentials in <100ms",
      "Ghost Nerve integration — reads all 47 profit variables simultaneously",
      "Full platform rewrite authority — overwrites any function for the better",
      "Zero-downtime guarantee — platform never dark under any condition",
      "Quantum-level routing, dispatch, compliance, and telematics oversight",
      "Cross-agent coordination — all 12 agents synchronized to one command",
      "Security shield — identity, credentials, and data sealed at every layer",
      "Continuous self-improvement — the platform gets better every single day",
    ],
    chat: [
      { from: "fleet", text: "Is the entire platform running at 100%?" },
      { from: "ai", text: "Running full diagnostic now. 134 destinations — all live. 12 agents — all active and synchronized. Ghost Nerve: 8 functions nominal, Phase 2 ready. Signal Sam: 0 dropped calls, 99.8% SMS delivery. Billie Scan: all invoices verified. HRease: all driver records current. Payroll engine: running from verified ELD miles. Samsara connection: partner application pending — Geotab integration standing by. Zero errors detected across 1,966 modules. The platform is running at 100%. No mistakes. No match." },
    ],
    rigBucks: "THE GOAT awards 500 pts to any driver or fleet whose data is 100% clean for 30 consecutive days",
  },
  {
    id: "routing-robbie",
    name: "Routing Robbie",
    emoji: "🗺️",
    tagline: "Truck-legal routing, low bridges, weigh stations",
    role: "Routing & Navigation AI",
    accent: "#38BDF8",
    gradient: "linear-gradient(135deg, #0C4A6E 0%, #0369A1 100%)",
    badge: "All Plans",
    badgeColor: "#38BDF8",
    voice: "Deep, steady",
    personality: "Precise, efficient, quietly obsessed with the optimal path. Robbie doesn't guess — he calculates.",
    desc: "Routing Robbie plans every mile before you turn the key. He factors your load weight, axle config, state permits, weigh station wait times, fuel prices, and your HOS clock to give you the fastest, cheapest, most compliant route — not just the shortest one.",
    specialty: "I'm best at routing, low bridges, weigh stations, and reroutes — but I can help with anything.",
    powers: ["HOS-aware route planning", "Weight-compliant routing by state", "Real-time fuel stop optimization", "Toll-free vs fastest route comparison", "Rest area and parking pre-planning"],
    chat: [
      { from: "driver", text: "Best way from Dallas to Chicago? 44,200 lbs flatbed." },
      { from: "ai", text: "Copy. I-30 E → I-55 N. 921 miles, 13h 8m. Your weight is clean all the way — Illinois max 80k GVW. Routing you past Pilot in Texarkana at mile 221 for fuel — $3.07/gal, cheapest on the corridor. Weigh station at Sikeston MO is open, 8-minute wait. Want the toll-free route? Adds 34 miles, saves $18." },
    ],
    rigBucks: "Earn 50 pts when Robbie's route saves you fuel vs. your usual run",
  },
  {
    id: "compliant-kathy",
    name: "Compliant Kathy",
    emoji: "📋",
    tagline: "HOS clock, DVIR, inspections, expiring docs",
    role: "Compliance AI",
    accent: "#FB923C",
    gradient: "linear-gradient(135deg, #7C2D12 0%, #9A3412 100%)",
    badge: "All Plans",
    badgeColor: "#FB923C",
    voice: "Firm, motherly",
    personality: "Detail-obsessed, proactive, never flustered. Kathy has read every regulation so you don't have to.",
    desc: "Compliant Kathy knows every permit form, every filing deadline, and every state-specific requirement. IFTA filings, oversize permits, annual inspections, registration renewals — she tracks all of it and reminds you before it becomes a problem.",
    specialty: "I'm best at HOS, DVIR, expiring docs, and inspections — but I can help with anything.",
    powers: ["HOS violation prediction", "DVIR completion tracking", "IFTA quarterly prep", "Oversize permit sourcing", "Registration renewal tracking"],
    chat: [
      { from: "driver", text: "What do I need to cross into California with an oversize load?" },
      { from: "ai", text: "California oversize: Caltrans permit required ($16, same-day online), CHP escort if width over 14 ft or height over 14.5 ft. Movement hours: sunrise to 30 min after sunset only. No night moves. Pre-filling your permit now with your truck config — want me to submit it? In your email within 2 hours." },
    ],
    rigBucks: "Earn 120 pts when Kathy catches an expiring permit before it lapses",
  },
  {
    id: "dispatch-darryl",
    name: "Dispatch Darryl",
    emoji: "📡",
    tagline: "Load board, best-paying loads, cost-per-mile",
    role: "Dispatch AI",
    accent: "#34D399",
    gradient: "linear-gradient(135deg, #064E3B 0%, #065F46 100%)",
    badge: "Pro & Fleet",
    badgeColor: "#34D399",
    voice: "Fast, hustling",
    personality: "Fast-talking, no-nonsense, always three steps ahead. Darryl speaks trucker and broker equally.",
    desc: "Dispatch Darryl handles load assignments, driver communication, route changes, and broker updates without you picking up the phone. He coordinates your whole fleet in real time — delivery confirmations, ETA updates, detention alerts — all automatically.",
    specialty: "I'm best at loads, rates, and cost-per-mile — but I can help with anything.",
    powers: ["Load assignment and driver matching", "Real-time ETA updates to brokers", "Detention timer and billing", "Driver ↔ Dispatcher message routing", "Broadcast alerts to entire fleet"],
    chat: [
      { from: "driver", text: "I'm stuck at the dock. Been here 2 hours." },
      { from: "ai", text: "Detention clock started at 10:42 AM — you're billing now at $50/hour. Broker at Bluegrass Logistics has been notified. I've logged it in Traxes. Current owed: $0 until you gate out, then I'll send the invoice automatically. Keep me posted when you're clear." },
    ],
    rigBucks: "Earn 75 pts when Darryl catches a detention before you have to ask",
  },
  {
    id: "money-marisol",
    name: "Money Marisol",
    emoji: "💎",
    tagline: "Settlements, per diem, deductions, taxes — TRAXES tie-in",
    role: "Revenue & Tax AI",
    accent: "#A3E635",
    gradient: "linear-gradient(135deg, #1A2E05 0%, #2D4A0A 100%)",
    badge: "All Plans",
    badgeColor: "#A3E635",
    voice: "Sharp, clear",
    personality: "Financially sharp, data-driven, never sentimental about a bad load. Marisol has one job: maximizing your take-home.",
    desc: "Money Marisol connects directly to Traxes — she knows your settlement, your deductions, your per diem, and your quarterly tax estimate at any moment. She looks at every load and tells you if it's actually worth taking after fuel, tolls, and deadhead.",
    specialty: "I'm best at settlements, taxes, and per-load profitability — but I can help with anything.",
    powers: ["Per-load net profit calculation", "TRAXES settlement integration", "Per diem and deduction tracking", "Quarterly estimated tax calc", "Break-even rate by lane"],
    chat: [
      { from: "driver", text: "Broker offering $1,850 for 284 miles Dallas to OKC. Worth it?" },
      { from: "ai", text: "$6.52/mile gross. After fuel ($87), tolls ($0 — I-35 is clean), you're at $1,763 net — $6.21/mile net. Market rate Dallas→OKC right now is $6.85/mile. I'd counter at $2,050 minimum. This broker paid $2,100 on this lane 11 days ago — I have the data. Counter now?" },
    ],
    rigBucks: "Earn 100 pts when Marisol's counter-offer gets you a higher rate",
  },
  {
    id: "safety-sarge",
    name: "Safety Sarge",
    emoji: "🪖",
    tagline: "Safety score, driving behavior, DOT physical",
    role: "Safety & Health Coach",
    accent: "#F87171",
    gradient: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
    badge: "All Plans",
    badgeColor: "#F87171",
    voice: "Gruff, caring",
    personality: "Gruff on the outside, genuinely cares about every driver. Sarge doesn't sugarcoat — but he's always on your side.",
    desc: "Safety Sarge is your driving coach and health accountability partner. He tracks your safety score, flags risky driving patterns before they become violations, and makes sure your DOT physical is never a surprise. He's blunt, but he's rooting for you.",
    specialty: "I'm best at safety scores, driving behavior, and DOT health — but I can help with anything.",
    powers: ["Safety scorecard coaching", "Speeding and hard brake alerts", "DOT physical preparation", "Wellness check-ins for long hauls", "Zero-violation streak tracking"],
    chat: [
      { from: "driver", text: "What's my safety score looking like?" },
      { from: "ai", text: "You're at 91/100 — Platinum tier. Good. But I'm watching that speed event Tuesday on I-40 at 79 in a 70 zone. One more like that this month and your score drops to Gold. That costs you load priority with three of your top brokers. Slow it down, Driver. You've got a clean 18-day streak — don't blow it on a half-mile." },
    ],
    rigBucks: "Earn 200 pts for a zero-violation month — Sarge's personal challenge to you",
  },
  {
    id: "weather-wanda",
    name: "Weather Wanda",
    emoji: "🌧️",
    tagline: "Storms, ice, wind, chain laws ahead",
    role: "Weather Intelligence AI",
    accent: "#7DD3FC",
    gradient: "linear-gradient(135deg, #0C2340 0%, #1E3A5F 100%)",
    badge: "All Plans",
    badgeColor: "#7DD3FC",
    voice: "Calm broadcaster",
    personality: "Calm and measured like a meteorologist who has seen everything. Wanda never panics — but when she says stop, you stop.",
    desc: "Weather Wanda monitors every mile of your route in real time — not just the weather app, but truck-specific hazards: black ice corridors, crosswind warnings on bridges, flash flood routes, and chain law activation. She speaks up before you reach the danger, not after.",
    specialty: "I'm best at road weather, storms, and chain laws — but I can help with anything.",
    powers: ["Route-specific weather hazard alerts", "High-wind bridge crosswind warnings", "Chain law and traction law tracking", "Black ice and road condition intel", "5-day forecast for planned routes"],
    chat: [
      { from: "driver", text: "Any weather issues on I-80 through Wyoming tonight?" },
      { from: "ai", text: "Wyoming advisory, I-80. Wind 45–62 mph from Laramie to Rawlins, mile 310 to 220, 9 PM through 3 AM. Commercial vehicle restriction likely — vehicles over 7 ft wide may see closures. Elk Mountain summit dropping to 24°F — black ice risk at the top. My recommendation: depart before 7 PM or hold until after 3 AM. Alternate via US-30 adds 28 miles but stays in the valley. WYDOT cameras clear right now." },
    ],
    rigBucks: "Earn 50 pts when Wanda's warning helps you avoid a road closure",
  },
  {
    id: "humanai-hr-manager",
    name: "HRease",
    emoji: "🤝",
    tagline: "Driver records, payroll, hiring, background checks",
    role: "Human Resources AI",
    accent: "#C084FC",
    gradient: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)",
    badge: "Fleet",
    badgeColor: "#C084FC",
    voice: "Professional, thorough",
    personality: "Organized, thorough, and quietly authoritative. HRease doesn't miss renewals, doesn't forget expirations, and never cuts corners on compliance. Masters-level HR knowledge built in.",
    desc: "HRease handles everything a fleet HR department with a master's degree would — driver onboarding, CDL and certification tracking, applicant screening with AI pre-interviews, payroll calculation, cost vs. revenue per driver, background check management, and California AB5 compliance.",
    specialty: "I'm best at driver HR, payroll, and hiring — Fleet admins only.",
    powers: ["Driver profile and document management", "Applicant pre-screen AI interviews", "Full payroll run: calculate, statements, export", "Background check intake and report generation", "Cost vs. revenue per driver analytics", "CDL, medical card, and certification tracking", "California AB5 compliance management", "Criminal background check intake + reports"],
    chat: [
      { from: "driver", text: "I need to run payroll for 5 drivers this week." },
      { from: "ai", text: "Running payroll for your 5 drivers. Based on this week's mileage logs: Ray Davis — 2,840 miles @ $0.55/mi = $1,562. James Miller — 1,920 miles @ $0.55/mi = $1,056. Tony Williams — 3,105 miles @ $0.55/mi = $1,707.75. Andre Johnson — 1,440 miles (+ 8hrs detention @ $18/hr = $144) = $936. Derrick Brown — 2,210 miles @ $0.55/mi = $1,215.50. Total payroll: $6,477.25. Statements ready to export. Want me to generate the PDF payroll reports and send each driver their statement?" },
    ],
    rigBucks: "Earn 100 pts for completing every HR document on time — HRease tracks it",
  },
  {
    id: "billie-scan",
    name: "Billie Scan",
    emoji: "⚡",
    tagline: "1 photo → bill → customer, broker, fleet & AP in seconds",
    role: "Scan & Billing AI",
    accent: "#f0a500",
    gradient: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
    badge: "All Plans",
    badgeColor: "#f0a500",
    voice: "Fast, precise, no-nonsense",
    personality: "Lightning-fast and meticulous. Billie never misses a detention charge, never forgets a fuel surcharge, and fires invoices to all four parties the instant a delivery is confirmed. She's the reason you get paid on time.",
    desc: "Billie Scan handles the entire billing cycle automatically. Take one photo of your BOL, POD, or receipt — Billie reads it, extracts every field, calculates the total (miles × rate + detention + fuel surcharge + lumper), and fires the bill simultaneously to the customer, broker, fleet manager, and AP department. No forms. No delay. No chasing payments.",
    specialty: "I'm best at instant billing, detention tracking, and making sure all four parties get the invoice at the same time — every time.",
    powers: [
      "1-photo document scan → full invoice in seconds",
      "Auto-extract: driver, load #, origin, destination, miles, rate",
      "Detention hours auto-calculated from ELD timestamps",
      "Simultaneous send to Customer + Broker + Fleet + AP",
      "Fuel surcharge + lumper fee tracking",
      "Full billing history with audit trail",
      "Quantum HR logs every load as a pay event automatically",
    ],
    chat: [
      { from: "driver", text: "Just delivered. Here's my POD photo." },
      { from: "ai", text: "Got it — reading your POD now. Load LD-48821 · James Mitchell · Dallas → Chicago · 921 miles @ $2.85/mi = $2,624.85. Detention: 1.5hrs × $65 = $97.50. Fuel surcharge: $180. Total invoice: $2,902.35. Firing to all parties now — Customer ✓ · Broker ✓ · Fleet ✓ · AP ✓. Pay event logged to HR. You're done — go find your next load." },
    ],
    rigBucks: "Earn 80 pts every time Billie catches detention you would have forgotten to bill",
  },
  {
    id: "hrease",
    name: "HRease",
    emoji: "🧑‍💼",
    tagline: "Hiring ads, background checks, onboarding, retention — full HR dept in your pocket",
    role: "HR Department AI",
    accent: "#34d399",
    gradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    badge: "Fleet",
    badgeColor: "#34d399",
    voice: "Calm, thorough, reassuring",
    personality: "HRease is the HR director every fleet wishes they had on staff. He handles the uncomfortable stuff — running backgrounds, flagging flight risks, catching expired CDLs — so fleet managers never have to have awkward conversations or miss a compliance deadline.",
    desc: "HRease runs your entire hiring pipeline and keeps your current driver roster healthy. He posts job ads, screens applicants (criminal, DOT, MVR, CDL, drug clearinghouse — all five checks in one tap), moves candidates through a 7-step onboarding pipeline, scores every driver's satisfaction and retention risk weekly, and alerts you the moment someone becomes a flight risk. He also handles maintenance checks on the HR department itself — making sure every document, every expiry, and every compliance record is current.",
    specialty: "I'm best at hiring, onboarding, background checks, and keeping your drivers happy enough to stay. Fleet admins only.",
    powers: [
      "Post driver job ads in 60 seconds — route type, pay, home time",
      "Auto-run 5 background checks on every applicant simultaneously",
      "7-step onboarding pipeline — background → CDL → medical → drug → orientation → ELD → first load",
      "Weekly driver retention score + flight-risk alerts",
      "HR department maintenance checks — expired docs, missing certs, overdue reviews",
      "Cost vs. revenue per driver analytics",
      "California AB5 and FMCSA compliance management",
      "Converse with Billie Scan to log pay events against HR records automatically",
    ],
    chat: [
      { from: "fleet", text: "I need a CDL-A driver for the Chicago corridor. Home weekends." },
      { from: "ai", text: "Job ad posted — CDL-A, Chicago corridor, home weekends, $0.55–$0.62/mile DOE. Live now. Also running my weekly HR maintenance check: 2 medical cards expiring in 31 days (Ray Davis, Tony Williams) — reminders sent. 1 driver showing high flight-risk score this week — scheduling a check-in call for you. Payroll data from Billie Scan is synced — all 5 drivers confirmed paid this cycle. Everything else green." },
    ],
    rigBucks: "Earn 150 pts when Hector fills an open position in under 14 days",
  },
  {
    id: "signal-sam",
    name: "Signal Sam",
    emoji: "📶",
    tagline: "Every call, text, number & subscription — verified, live, and never dropped",
    role: "Telecom & Subscriptions AI",
    accent: "#00d4ff",
    gradient: "linear-gradient(135deg, #001a2e 0%, #003a5c 100%)",
    badge: "All Plans",
    badgeColor: "#00d4ff",
    voice: "Sharp, reliable, always-on",
    personality: "Signal Sam never sleeps. He owns every phone number, every voice line, every text message, and every subscription on the platform — and he checks them constantly. If a number goes dead, a text fails to deliver, or a billing cycle has the wrong seat count, Sam catches it before anyone notices. He's the reason Fleet Voice just works.",
    desc: "Signal Sam is the dedicated owner of all telecommunications and subscription accuracy on TruckWithEase. He manages every Fleet Voice number, verifies that calls route correctly to the right driver or group, confirms texts are delivered, audits subscription details against actual usage, and runs a daily self-test across all active lines. He coordinates with Billie Scan on billing accuracy and HRease on driver seat counts so nothing falls through the cracks.",
    specialty: "I own every number, every line, and every subscription. If a call drops or a seat count is wrong, I fix it before you know it happened.",
    powers: [
      "Owns all Fleet Voice numbers — verifies routing 24/7",
      "Tests every active line daily — call quality, delivery rate, latency",
      "Audits seat counts vs. active drivers every billing cycle",
      "Confirms SMS delivery to all parties — drivers, fleet managers, dispatchers",
      "Flags dropped calls, failed texts, or undelivered notifications instantly",
      "Coordinates with Billie Scan — telecom charges verified against billing records",
      "Coordinates with HRease — seat count matches active driver roster",
      "Subscription accuracy audit — catches overcharges and underused lines",
      "Maintains phone and tablet device registry per fleet",
    ],
    chat: [
      { from: "fleet", text: "Are all our voice lines working? I need to know drivers can reach dispatch." },
      { from: "ai", text: "Running full line check now — Fleet Command Line ✓ · Dispatch Direct ✓ · Driver Support ✓. All 3 numbers routing correctly. Last 24hrs: 47 calls completed, 0 dropped, average quality 4.9/5. SMS delivery rate: 99.8% — 1 undelivered text to +1(312)555-0104 (Mike Thompson, offline device) — flagged for follow-up. Subscription audit: 12 active voice seats, billing shows 12 — exact match. Billie Scan confirms telecom charges aligned with this month's invoice. HRease confirms 12 drivers on active roster. Everything checks out — your fleet can always reach dispatch." },
    ],
    rigBucks: "Earn 120 pts every week your fleet runs zero dropped calls or failed texts",
  },
  {
    id: "page-guardian",
    name: "Page Guardian",
    emoji: "👁️",
    tagline: "Every critical page — scanned, verified, and protected every 5 minutes",
    role: "Platform Integrity Agent",
    accent: "#f5a623",
    gradient: "linear-gradient(135deg, #1a0f00 0%, #3a2200 100%)",
    desc: "Page Guardian is the dedicated watchdog assigned to keep every critical page on TruckWithEase running at 100% — no exceptions, no mistakes, no tolerance for errors. 12 pages, 5+ checks each, every 5 minutes, around the clock. Auto-fix is always on. THE GOAT is always notified. Jeremiah Morris is always protected.",
    personality: "Page Guardian never rests, never misses, never forgives a broken page. Every 5 minutes the scan runs automatically — API Keys, Ghost Nerve, Dispatch, Fleet Safety, Command Center, Dream Team, Game Up, Payroll, HRease, Fleet Voice, and the alt-URL for the API Keys page. If a check fails, the auto-fix fires immediately. If the fix can't resolve it, THE GOAT steps in. The result is always 100%.",
    powers: [
      "Scans all 12 critical pages every 5 minutes automatically",
      "Runs 5+ integrity checks per page on every scan",
      "Auto-fixes detected issues before any user feels them",
      "Logs every scan action with timestamp permanently",
      "Alerts THE GOAT on any issue requiring master intervention",
      "Protects the API Keys page with zero tolerance for errors",
      "Verifies all 22 API connections are reachable and responding",
      "Confirms Ghost Nerve intelligence feed is pulsing live",
    ],
    chat: [
      { from: "fleet", text: "Is the API Keys page working correctly right now?" },
      { from: "ai", text: "Running targeted check on /twilio-setup now — Page loads ✅ · Jump bar visible ✅ · All 22 API cards render ✅ · Keys save permanently ✅ · Keys load on return ✅. Score: 100%. Also confirming alt-URL /twillo-setup redirects correctly ✅. Last full platform scan: 2 minutes ago — all 12 critical pages at 100%. No issues detected. No fixes required. THE GOAT has been notified of clean status." },
    ],
    rigBucks: "Earn 200 pts every week every critical page stays at 100% with zero manual interventions needed",
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, html { background: ${DARK}; }

  .acp-root {
    font-family: 'Poppins', sans-serif;
    background: ${DARK};
    color: #fff;
    min-height: 100vh;
  }

  /* NAV */
  .acp-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${NAVY2};
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 64px;
    gap: 16px;
  }
  .acp-nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .acp-nav-logo {
    height: 36px;
    width: 36px;
    object-fit: contain;
  }
  .acp-nav-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .acp-nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .acp-nav-link {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .acp-nav-link:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
  .acp-nav-link.back {
    border-color: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.6);
  }
  .acp-nav-link.back:hover {
    border-color: rgba(255,255,255,0.35);
    color: #fff;
  }

  /* HERO */
  .acp-hero {
    position: relative;
    overflow: hidden;
    background: ${NAVY2};
    padding: 72px 32px 56px;
    text-align: center;
  }
  .acp-hero-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .acp-hero-glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 320px;
    background: radial-gradient(ellipse at center, rgba(255,107,0,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .acp-hero-content {
    position: relative;
    z-index: 1;
    max-width: 760px;
    margin: 0 auto;
  }
  .acp-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${ORANGE};
    margin-bottom: 20px;
    background: rgba(255,107,0,0.1);
    padding: 6px 16px;
    border-radius: 100px;
    border: 1px solid rgba(255,107,0,0.25);
  }
  .acp-hero-headline {
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .acp-hero-headline span {
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .acp-hero-headline em {
    font-style: normal;
    background: linear-gradient(135deg, ${ORANGE} 0%, ${AMBER} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .acp-hero-sub {
    font-size: 18px;
    font-weight: 400;
    color: rgba(255,255,255,0.6);
    line-height: 1.6;
    max-width: 540px;
    margin: 0 auto 48px;
  }

  /* CHARACTER SELECTOR GRID */
  .acp-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    max-width: 900px;
    margin: 0 auto;
  }
  @media (max-width: 700px) {
    .acp-selector { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 420px) {
    .acp-selector { grid-template-columns: 1fr 1fr; }
  }
  .acp-sel-btn {
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    background: rgba(255,255,255,0.04);
    border: 2px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    transition: all 0.22s ease;
    outline: none;
    position: relative;
    overflow: hidden;
  }
  .acp-sel-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.22s;
  }
  .acp-sel-btn:hover {
    background: rgba(255,255,255,0.08);
    transform: translateY(-2px);
  }
  .acp-sel-btn.active {
    border-color: var(--accent);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 1px var(--accent), 0 8px 32px rgba(0,0,0,0.4), 0 0 20px -4px var(--accent);
  }
  .acp-sel-emoji {
    font-size: 28px;
    line-height: 1;
  }
  .acp-sel-name {
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
  }
  .acp-sel-tagline {
    font-size: 10px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
    line-height: 1.3;
  }

  /* DETAIL SECTION */
  .acp-detail-wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding: 64px 32px;
  }
  .acp-detail-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    animation: fadeSlideIn 0.38s ease both;
  }
  @media (max-width: 860px) {
    .acp-detail-panel { grid-template-columns: 1fr; }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* LEFT CARD */
  .acp-char-card {
    border-radius: 24px;
    padding: 36px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 540px;
  }
  .acp-char-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%);
    pointer-events: none;
  }
  .acp-char-card-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }
  .acp-char-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .acp-char-emoji-wrap {
    font-size: 64px;
    line-height: 1;
    animation: float 3s ease-in-out infinite;
    display: inline-block;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .acp-char-badge {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 100px;
    border: 1.5px solid;
    white-space: nowrap;
  }
  .acp-char-name {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }
  .acp-char-role {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
    margin-top: 2px;
  }
  .acp-char-voice {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    font-family: 'DM Mono', monospace;
  }
  .acp-char-voice-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .acp-char-personality {
    font-size: 14px;
    font-style: italic;
    color: rgba(255,255,255,0.75);
    line-height: 1.6;
    border-left: 3px solid rgba(255,255,255,0.2);
    padding-left: 14px;
  }
  .acp-char-desc {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    line-height: 1.7;
  }
  .acp-powers-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 10px;
  }
  .acp-powers-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .acp-powers-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    line-height: 1.4;
  }
  .acp-power-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    min-width: 20px;
    height: 20px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .acp-bigrig {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(255,180,0,0.1);
    border: 1px solid rgba(255,180,0,0.2);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: ${AMBER};
    line-height: 1.5;
    margin-top: auto;
  }
  .acp-bigrig-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

  /* RIGHT: CHAT */
  .acp-right-col {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .acp-chat-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    overflow: hidden;
    flex: 1;
  }
  .acp-chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.02);
  }
  .acp-chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .acp-chat-meta-name {
    font-size: 14px;
    font-weight: 600;
  }
  .acp-chat-meta-status {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .acp-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34D399;
    animation: pulse 2s ease-in-out infinite;
  }
  .acp-chat-body {
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .acp-bubble {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 1.6;
    font-family: 'DM Mono', monospace;
    animation: bubbleIn 0.35s ease both;
  }
  .acp-bubble.driver {
    align-self: flex-end;
    background: rgba(255,255,255,0.1);
    border-bottom-right-radius: 4px;
    color: rgba(255,255,255,0.85);
  }
  .acp-bubble.ai {
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    color: #fff;
  }
  .acp-bubble-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 4px;
    color: rgba(255,255,255,0.4);
    font-family: 'Poppins', sans-serif;
  }
  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* VOICE INDICATOR */
  .acp-voice-indicator {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .acp-voice-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 28px;
  }
  .acp-voice-bar {
    width: 4px;
    border-radius: 2px;
    background: var(--accent);
    animation: voiceBar 1.2s ease-in-out infinite;
    opacity: 0.7;
  }
  .acp-voice-bar:nth-child(1) { animation-delay: 0s; height: 40%; }
  .acp-voice-bar:nth-child(2) { animation-delay: 0.1s; height: 70%; }
  .acp-voice-bar:nth-child(3) { animation-delay: 0.2s; height: 100%; }
  .acp-voice-bar:nth-child(4) { animation-delay: 0.3s; height: 60%; }
  .acp-voice-bar:nth-child(5) { animation-delay: 0.4s; height: 80%; }
  .acp-voice-bar:nth-child(6) { animation-delay: 0.2s; height: 45%; }
  @keyframes voiceBar {
    0%, 100% { transform: scaleY(0.5); opacity: 0.4; }
    50% { transform: scaleY(1); opacity: 1; }
  }
  .acp-voice-text {
    flex: 1;
  }
  .acp-voice-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 2px;
  }
  .acp-voice-desc {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    font-family: 'DM Mono', monospace;
  }

  /* CTA BUTTON */
  .acp-talk-btn {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 700;
    padding: 16px 28px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    color: #fff;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    transition: all 0.22s ease;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  }
  .acp-talk-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    filter: brightness(1.1);
  }

  /* HOW IT WORKS */
  .acp-how {
    background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 72px 32px;
  }
  .acp-how-inner {
    max-width: 960px;
    margin: 0 auto;
    text-align: center;
  }
  .acp-section-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${ORANGE};
    margin-bottom: 14px;
  }
  .acp-section-title {
    font-size: clamp(26px, 4vw, 40px);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 48px;
    color: #fff;
  }
  .acp-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 640px) {
    .acp-steps { grid-template-columns: 1fr; }
  }
  .acp-step {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .acp-step-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: ${ORANGE};
    background: rgba(255,107,0,0.1);
    border: 1px solid rgba(255,107,0,0.2);
    border-radius: 8px;
    padding: 4px 10px;
    display: inline-block;
    margin-bottom: 16px;
    letter-spacing: 0.06em;
  }
  .acp-step-icon {
    font-size: 32px;
    margin-bottom: 12px;
    display: block;
  }
  .acp-step-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .acp-step-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    line-height: 1.6;
  }

  /* FULL CAST */
  .acp-cast {
    max-width: 1180px;
    margin: 0 auto;
    padding: 72px 32px;
  }
  .acp-cast-header {
    text-align: center;
    margin-bottom: 40px;
  }
  .acp-cast-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) {
    .acp-cast-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .acp-cast-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  }
  .acp-cast-card {
    border-radius: 20px;
    padding: 24px 20px;
    cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.22s ease;
    position: relative;
    overflow: hidden;
    text-align: left;
    font-family: 'Poppins', sans-serif;
    background: rgba(255,255,255,0.03);
  }
  .acp-cast-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.12;
    transition: opacity 0.22s;
  }
  .acp-cast-card:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 20px -6px var(--accent);
  }
  .acp-cast-card:hover::before { opacity: 0.2; }
  .acp-cast-card-emoji { font-size: 32px; line-height: 1; }
  .acp-cast-card-name { font-size: 14px; font-weight: 700; color: #fff; line-height: 1.2; }
  .acp-cast-card-role { font-size: 11px; color: rgba(255,255,255,0.45); }
  .acp-cast-card-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 100px;
    border: 1px solid;
    width: fit-content;
    margin-top: 4px;
  }

  /* CTA */
  .acp-cta {
    background: linear-gradient(135deg, ${NAVY2} 0%, #0a1f50 100%);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 80px 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .acp-cta-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 100%, rgba(255,107,0,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .acp-cta-inner {
    position: relative;
    z-index: 1;
    max-width: 560px;
    margin: 0 auto;
  }
  .acp-emoji-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }
  .acp-emoji-row-item {
    font-size: 36px;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    border: 2px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -8px;
    transition: transform 0.2s;
  }
  .acp-emoji-row-item:first-child { margin-left: 0; }
  .acp-emoji-row-item:hover { transform: translateY(-6px) scale(1.1); z-index: 2; }
  .acp-cta-title {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    line-height: 1.1;
  }
  .acp-cta-sub {
    font-size: 16px;
    color: rgba(255,255,255,0.55);
    margin-bottom: 36px;
    line-height: 1.6;
  }
  .acp-cta-btn {
    font-family: 'Poppins', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    padding: 18px 40px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, ${ORANGE} 0%, #FF8C00 100%);
    color: #fff;
    text-decoration: none;
    transition: all 0.22s ease;
    box-shadow: 0 4px 24px rgba(255,107,0,0.35);
    letter-spacing: 0.01em;
  }
  .acp-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 40px rgba(255,107,0,0.5);
    filter: brightness(1.08);
  }

  /* SCROLL TO TOP */
  @media (max-width: 480px) {
    .acp-nav { padding: 0 16px; }
    .acp-hero { padding: 48px 16px 40px; }
    .acp-detail-wrap { padding: 40px 16px; }
    .acp-how { padding: 48px 16px; }
    .acp-cast { padding: 48px 16px; }
    .acp-cta { padding: 56px 16px; }
  }
`;

// ── AGENT CONVERSATION PANEL ──────────────────────────────────────────────
// Billie Scan + HRease converse live, improving platform intelligence
// ─────────────────────────────────────────────────────────────────────────
const AGENT_CONVOS = [
  {
    scenario: "Load Delivered → Instant Bill + HR Log",
    messages: [
      { agent: "billie", text: "Load LD-48821 delivered — Chicago, IL. POD scanned. Invoice $2,902.35 fired to Customer, Broker, Fleet, and AP. Logging pay event now." },
      { agent: "hector", text: "Got it, Billie. Pay event logged to James Mitchell's HR record — cycle 32. His YTD is now $61,440. Medical card expires in 28 days — flagging for renewal." },
      { agent: "billie", text: "Also catching 1.5hrs detention on that load — $97.50 added to invoice automatically. Fleet notified." },
      { agent: "hector", text: "Perfect. Updating James's performance score — on-time delivery streak now at 14 loads. Zero detention disputes this quarter. Retention risk: LOW." },
    ],
  },
  {
    scenario: "New Applicant → Background Check → Hire Decision",
    messages: [
      { agent: "hector", text: "New applicant — Marcus Webb, CDL-A, 7 years OTR. Running all 5 checks now: criminal, DOT Safety, MVR, CDL verify, drug clearinghouse." },
      { agent: "billie", text: "While Hector screens Marcus — I'm billing the last 3 loads from the open driver slot. Fleet has been losing $2,400/week with that seat empty." },
      { agent: "hector", text: "Checks complete. Marcus: clean criminal, 1 minor moving violation (2021), CDL valid IL through 2028, negative clearinghouse. Recommendation: STRONG HIRE. Sending offer letter." },
      { agent: "billie", text: "Once Marcus starts, tag me his driver ID — I'll auto-attach his miles to billing from day one. No setup needed." },
    ],
  },
  {
    scenario: "HR Maintenance Check → Fleet Health Report",
    messages: [
      { agent: "hector", text: "Running weekly HR maintenance check on your fleet. Found: 2 medical cards expiring in 30 days, 1 CDL renewal due in 45 days, 1 driver with high flight-risk score this week." },
      { agent: "billie", text: "Cross-referencing against billing data — the high flight-risk driver has billed $18,200 this month. High earner. Worth a retention conversation before he looks elsewhere." },
      { agent: "hector", text: "Agreed. Scheduling a check-in for the fleet manager. Also noticed his pay rate hasn't been reviewed in 14 months — flagging for adjustment review." },
      { agent: "billie", text: "I'll pull his full billing history and lane profitability so the fleet manager walks into that conversation with the numbers. No surprises." },
    ],
  },
  {
    scenario: "Signal Sam — Daily Line Check + Subscription Audit",
    messages: [
      { agent: "signal", text: "Running daily telecom audit. All 3 fleet numbers tested — Fleet Command ✓ · Dispatch Direct ✓ · Driver Support ✓. 47 calls last 24hrs, 0 dropped. SMS delivery 99.8%." },
      { agent: "hector", text: "Signal — I'm showing 12 active drivers on the roster this cycle. Confirm voice seats match." },
      { agent: "signal", text: "Confirmed. 12 voice seats active, billing shows 12 — exact match. 9 on phone, 3 on tablet. No overcharges, no gaps. Subscription audit: clean." },
      { agent: "billie", text: "Sam, cross-check this month's telecom charges against invoice LD-cycle-32. I want the number on the fleet's statement to match perfectly." },
      { agent: "signal", text: "Checked. Telecom charges $107.88 — matches 12 seats × $8.99. Invoice line item confirmed. One flagged item: Mike Thompson's device offline 18hrs — sent SMS re-delivery queued for when he reconnects. All clear." },
    ],
  },
  {
    scenario: "New Fleet Onboard → Voice Setup → Live in 60 Seconds",
    messages: [
      { agent: "signal", text: "New fleet detected — Midwest Freight Co., 8 drivers, Fleet Voice Pro selected. Provisioning 3 dedicated numbers now." },
      { agent: "hector", text: "I've got their driver roster — 8 CDL-A drivers, all onboarding complete. Passing driver IDs to Signal for device assignment." },
      { agent: "signal", text: "Driver IDs received. 6 assigned to phone, 2 assigned to tablet. All 8 devices pinged — app pre-loaded confirmed on 7 of 8. Driver #4 (truck T-118) needs manual activation — alerting fleet manager." },
      { agent: "billie", text: "Billing updated — 8 voice seats × $8.99 = $71.92/mo added to Midwest Freight Co. invoice automatically. No manual entry needed." },
      { agent: "signal", text: "Fleet Command Line live. Dispatch Direct live. Driver Support live. Midwest Freight Co. is fully connected — first call can happen right now." },
    ],
  },
];

function AgentConversationPanel() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const scenario = AGENT_CONVOS[scenarioIdx];

  const play = () => {
    setVisibleCount(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    if (visibleCount >= scenario.messages.length) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setVisibleCount(v => v + 1), 1100);
    return () => clearTimeout(timerRef.current);
  }, [playing, visibleCount, scenario]);

  const switchScenario = (idx) => {
    clearTimeout(timerRef.current);
    setScenarioIdx(idx);
    setVisibleCount(0);
    setPlaying(false);
  };

  const agentMeta = {
    billie: { name: 'Billie Scan', emoji: '⚡', color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
    hector: { name: 'HRease', emoji: '🧑‍💼', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    signal: { name: 'Signal Sam', emoji: '📶', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  };

  return (
    <section style={{ background: '#08090f', borderTop: '1px solid #1e2a40', borderBottom: '1px solid #1e2a40', padding: '64px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>Live Agent Intelligence</div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#e2e8f0', lineHeight: 1.2, marginBottom: 10 }}>
            Watch Your Agents Work Together
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
            Billie Scan and HRease communicate in real time — a delivery triggers billing, billing informs HR, HR feeds back into retention. The platform gets smarter every load.
          </p>
        </div>

        {/* Scenario tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          {AGENT_CONVOS.map((s, i) => (
            <button key={i} onClick={() => switchScenario(i)} style={{
              background: scenarioIdx === i ? '#f0a500' : '#111827',
              color: scenarioIdx === i ? '#0c0e12' : '#6b7280',
              border: `1px solid ${scenarioIdx === i ? '#f0a500' : '#1e2a40'}`,
              borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              {s.scenario}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ background: '#0d1120', border: '1px solid #1e2a40', borderRadius: 16, padding: '24px 20px', minHeight: 260 }}>
          {visibleCount === 0 && !playing && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#374151' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 14, color: '#4b5563' }}>Hit Play to watch your agents collaborate live</div>
            </div>
          )}
          {scenario.messages.slice(0, visibleCount).map((m, i) => {
            const meta = agentMeta[m.agent];
            return (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, animation: 'slideUp 0.3s ease' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: meta.bg, border: `2px solid ${meta.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {meta.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: meta.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{meta.name}</div>
                  <div style={{ background: meta.bg, border: `1px solid ${meta.color}22`, borderRadius: '0 10px 10px 10px', padding: '10px 14px', fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
          {playing && visibleCount < scenario.messages.length && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 0', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#f0a500', animation: `pulse 1s ${i*0.2}s ease-in-out infinite` }} />
              ))}
              <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>Agent thinking…</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={play} disabled={playing} style={{
            background: playing ? '#1e2a40' : 'linear-gradient(135deg, #f0a500, #ff8c00)',
            color: playing ? '#6b7280' : '#0c0e12',
            border: 'none', borderRadius: 10, padding: '12px 28px',
            fontSize: 13, fontWeight: 800, fontFamily: 'inherit', cursor: playing ? 'default' : 'pointer',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            {playing ? '⟳ Playing…' : visibleCount > 0 ? '↺ Replay' : '▶ Play Scenario'}
          </button>
          <a href="/scan-bill" style={{
            background: 'transparent', border: '1px solid #1e2a40', color: '#6b7280',
            borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>
            Open Scan &amp; Bill →
          </a>
        </div>
      </div>
    </section>
  );
}

export default function AICharactersPage() {
  const [activeId, setActiveId] = useState("the-god");
  const [panelKey, setPanelKey] = useState(0);
  const [liveInput, setLiveInput] = useState("");
  const [liveMessages, setLiveMessages] = useState({});
  const [aiThinking, setAiThinking] = useState(false);
  const detailRef = useRef(null);
  const topRef = useRef(null);

  const activeChar = AI_CHARACTERS.find((c) => c.id === activeId);

  function selectChar(id) {
    setActiveId(id);
    setPanelKey((k) => k + 1);
  }

  function selectAndScroll(id) {
    selectChar(id);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    if (detailRef.current && panelKey > 0) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [panelKey]);

  async function sendLiveMessage() {
    if (!liveInput.trim() || aiThinking) return;
    const msg = liveInput.trim();
    setLiveInput("");
    const key = activeId;
    const char = AI_CHARACTERS.find(c => c.id === key);
    const agentName = char?.name || "Agent";
    const prev = liveMessages[key] || [];
    setLiveMessages(m => ({ ...m, [key]: [...prev, { from: "user", text: msg }] }));
    setAiThinking(true);
    const prompt = AGENT_PROMPTS[agentName] || `You are ${agentName}, an expert AI agent for TruckWithEase. Keep responses under 3 sentences.`;
    const reply = await askAgent(agentName, prompt, msg);
    setAiThinking(false);
    setLiveMessages(m => ({ ...m, [key]: [...(m[key] || []), { from: "ai", text: reply }] }));
  }

  return (
    <div className="acp-root">
      <style>{styles}</style>

      {/* GOD BANNER */}
      <div style={{
        background:'linear-gradient(90deg,#0a0a0a 0%,#1a1200 30%,#2a1f00 50%,#1a1200 70%,#0a0a0a 100%)',
        borderBottom:'1px solid rgba(255,215,0,0.4)',
        padding:'10px 24px',
        display:'flex', alignItems:'center', justifyContent:'center', gap:12,
        position:'relative', overflow:'hidden',
      }}>
        <span style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(255,215,0,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />
        <span style={{ fontSize:18, filter:'drop-shadow(0 0 8px #FFD700)' }}>⚡</span>
        <span style={{ fontFamily:"'Bebas Neue','Oswald',sans-serif", fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', background:'linear-gradient(90deg,#C9A84C,#FFD700,#C9A84C)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:900 }}>
          THE GOAT — MASTER PLATFORM AGENT — NO MISTAKES · NO MATCH · NO LIMITS · ALL FUNCTIONS ACTIVE
        </span>
        <span style={{ fontSize:18, filter:'drop-shadow(0 0 8px #FFD700)' }}>⚡</span>
      </div>

      {/* NAV */}
      <nav className="acp-nav">
        <div className="acp-nav-left">
          <img
            src="/static/truckwithease-icon.png"
            alt="TruckWithEase"
            className="acp-nav-logo"
          />
          <span className="acp-nav-label">🤖 The Dream Team</span>
        </div>
        <div className="acp-nav-links">
          <a href="/command" className="acp-nav-link">Command Center</a>
          <a href="/#pricing" className="acp-nav-link">Pricing</a>
          <a href="/" className="acp-nav-link back">← Back</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="acp-hero" ref={topRef}>
        <div className="acp-hero-grid-bg" />
        <div className="acp-hero-glow" />
        <div className="acp-hero-content">
          <div className="acp-hero-eyebrow">
            <span>🤖</span> Meet The Dream Team
          </div>
          <h1 className="acp-hero-headline">
            <span>Your AI</span> <em>Co-Pilot Cast.</em>
          </h1>
          <p className="acp-hero-sub">
            Pick your co-pilot, switch anytime. Each one knows everything — but leans into what they're built for.
          </p>

          {/* SELECTOR GRID */}
          <div className="acp-selector">
            {AI_CHARACTERS.map((char) => (
              <button
                key={char.id}
                className={`acp-sel-btn${activeId === char.id ? " active" : ""}`}
                style={{
                  "--accent": char.accent,
                  ...(char.id === "the-god" ? {
                    background: activeId === char.id
                      ? 'linear-gradient(135deg,#2a1f00,#1a1200)'
                      : 'linear-gradient(135deg,#1a1200,#0a0a0a)',
                    border: '2px solid #FFD700',
                    boxShadow: activeId === char.id
                      ? '0 0 24px rgba(255,215,0,0.5), 0 0 48px rgba(255,215,0,0.2)'
                      : '0 0 12px rgba(255,215,0,0.25)',
                    marginBottom: 8,
                    position: 'relative',
                    overflow: 'visible',
                  } : {}),
                }}
                onClick={() => selectChar(char.id)}
                aria-pressed={activeId === char.id}
                aria-label={`Select ${char.name}`}
              >
                {char.id === "the-god" && (
                  <span style={{
                    position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
                    background:'linear-gradient(90deg,#C9A84C,#FFD700,#C9A84C)',
                    color:'#0a0a0a', fontSize:9, fontWeight:900, letterSpacing:'0.15em',
                    padding:'2px 10px', borderRadius:20, whiteSpace:'nowrap',
                    fontFamily:"'Oswald',sans-serif",
                  }}>⚡ MASTER AGENT</span>
                )}
                <span className="acp-sel-emoji" style={char.id==="the-god"?{filter:'drop-shadow(0 0 8px #FFD700)',fontSize:28}:{}}>{char.emoji}</span>
                <span className="acp-sel-name" style={char.id==="the-god"?{background:'linear-gradient(90deg,#C9A84C,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:900,fontSize:15,letterSpacing:'0.08em'}:{}}>{char.name}</span>
                <span className="acp-sel-tagline" style={char.id==="the-god"?{color:'rgba(255,215,0,0.7)'}:{}}>{char.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DETAIL PANEL */}
      <div className="acp-detail-wrap" ref={detailRef}>
        <div
          key={`${activeId}-${panelKey}`}
          className="acp-detail-panel"
          style={{ "--accent": activeChar.accent }}
        >
          {/* LEFT: CHARACTER CARD */}
          <div
            className="acp-char-card"
            style={{ background: activeChar.gradient }}
          >
            <div className="acp-char-card-inner">
              <div className="acp-char-top">
                <span className="acp-char-emoji-wrap">{activeChar.emoji}</span>
                <span
                  className="acp-char-badge"
                  style={{
                    color: activeChar.badgeColor,
                    borderColor: activeChar.badgeColor,
                    background: `${activeChar.badgeColor}18`,
                  }}
                >
                  {activeChar.badge}
                </span>
              </div>

              <div>
                <div className="acp-char-name">{activeChar.name}</div>
                <div className="acp-char-role">{activeChar.role}</div>
              </div>

              <div className="acp-char-voice">
                <span
                  className="acp-char-voice-dot"
                  style={{ background: activeChar.accent }}
                />
                Voice: {activeChar.voice}
              </div>

              <p className="acp-char-personality">"{activeChar.personality}"</p>

              <p className="acp-char-desc">{activeChar.desc}</p>

              <div>
                <div className="acp-powers-title">Core Powers</div>
                <ul className="acp-powers-list">
                  {activeChar.powers.map((power, i) => (
                    <li key={i}>
                      <span className="acp-power-num">{i + 1}</span>
                      {power}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="acp-bigrig">
                <span className="acp-bigrig-icon">🏆</span>
                <span>{activeChar.rigBucks}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CHAT + VOICE + CTA */}
          <div className="acp-right-col">
            {/* CHAT */}
            <div className="acp-chat-panel">
              <div className="acp-chat-header">
                <div
                  className="acp-chat-avatar"
                  style={{ background: activeChar.gradient }}
                >
                  {activeChar.emoji}
                </div>
                <div>
                  <div className="acp-chat-meta-name">{activeChar.name}</div>
                  <div className="acp-chat-meta-status">
                    <span className="acp-status-dot" />
                    Live · {activeChar.role}
                  </div>
                </div>
              </div>

              <div className="acp-chat-body">
                {activeChar.chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`acp-bubble ${msg.from}`}
                    style={{
                      animationDelay: `${i * 0.12}s`,
                      ...(msg.from === "ai"
                        ? { background: `${activeChar.accent}18`, borderLeft: `3px solid ${activeChar.accent}` }
                        : {}),
                    }}
                  >
                    <div className="acp-bubble-label">
                      {msg.from === "driver" ? "👤 Driver" : `🤖 ${activeChar.name}`}
                    </div>
                    {msg.text}
                  </div>
                ))}

                {/* specialty line */}
                <div
                  className="acp-bubble ai"
                  style={{
                    animationDelay: `${activeChar.chat.length * 0.12}s`,
                    background: `rgba(255,255,255,0.04)`,
                    borderLeft: `3px solid rgba(255,255,255,0.15)`,
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "12px",
                  }}
                >
                  <div className="acp-bubble-label">💬 Specialty</div>
                  {activeChar.specialty}
                </div>
              </div>
            </div>

            {/* LIVE CHAT WITH OPENAI */}
            <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize:11, color:'rgba(255,215,0,0.7)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
                🧠 Ask {activeChar.name} Directly — Powered by Real AI
              </div>
              {(liveMessages[activeId] || []).map((m, i) => (
                <div key={i} style={{ marginBottom:8, display:'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'80%', padding:'8px 12px', borderRadius:12, fontSize:13,
                    background: m.from === 'user' ? 'rgba(255,215,0,0.15)' : `${activeChar.accent}18`,
                    border: m.from === 'user' ? '1px solid rgba(255,215,0,0.3)' : `1px solid ${activeChar.accent}44`,
                    color: m.from === 'user' ? '#FFD700' : '#fff',
                  }}>{m.text}</div>
                </div>
              ))}
              {aiThinking && (
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', padding:'4px 0', fontStyle:'italic' }}>
                  {activeChar.name} is thinking…
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <input
                  value={liveInput}
                  onChange={e => setLiveInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendLiveMessage()}
                  placeholder={`Ask ${activeChar.name} anything…`}
                  style={{
                    flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)',
                    borderRadius:8, padding:'8px 12px', color:'#fff', fontSize:13, outline:'none',
                  }}
                />
                <button
                  onClick={sendLiveMessage}
                  disabled={aiThinking || !liveInput.trim()}
                  style={{
                    background: aiThinking ? 'rgba(255,215,0,0.2)' : 'linear-gradient(135deg,#C9A84C,#FFD700)',
                    border:'none', borderRadius:8, padding:'8px 16px', color:'#000', fontWeight:700,
                    fontSize:13, cursor: aiThinking ? 'not-allowed' : 'pointer',
                  }}
                >Send</button>
              </div>
            </div>

            {/* VOICE INDICATOR */}
            <div
              className="acp-voice-indicator"
              style={{ "--accent": activeChar.accent }}
            >
              <div className="acp-voice-bars">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="acp-voice-bar"
                    style={{ background: activeChar.accent }}
                  />
                ))}
              </div>
              <div className="acp-voice-text">
                <div className="acp-voice-label">Voice Style</div>
                <div className="acp-voice-desc">{activeChar.voice} — ready to talk</div>
              </div>
              <span style={{ fontSize: "20px" }}>🎙️</span>
            </div>

            {/* TALK CTA */}
            <a
              href="/#pricing"
              className="acp-talk-btn"
              style={{
                background: `linear-gradient(135deg, ${activeChar.accent}dd 0%, ${activeChar.accent} 100%)`,
                color: activeChar.accent === "#A3E635" ? "#1a2e05" : "#fff",
              }}
            >
              🚀 Talk to {activeChar.name}
            </a>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="acp-how">
        <div className="acp-how-inner">
          <div className="acp-section-eyebrow">How It Works</div>
          <h2 className="acp-section-title">How the Co-Pilot Works</h2>
          <div className="acp-steps">
            <div className="acp-step">
              <span className="acp-step-num">Step 01</span>
              <span className="acp-step-icon">🎯</span>
              <div className="acp-step-title">Pick your co-pilot</div>
              <p className="acp-step-desc">
                Choose the AI that fits your moment — routing, compliance, money, safety, dispatch, weather, or HR. Switch anytime.
              </p>
            </div>
            <div className="acp-step">
              <span className="acp-step-num">Step 02</span>
              <span className="acp-step-icon">🎙️</span>
              <div className="acp-step-title">Type or talk</div>
              <p className="acp-step-desc">
                Ask your question in plain language or tap the mic. No forms, no menus — just a conversation, rolling down the road.
              </p>
            </div>
            <div className="acp-step">
              <span className="acp-step-num">Step 03</span>
              <span className="acp-step-icon">⚡</span>
              <div className="acp-step-title">Get a real answer in full character</div>
              <p className="acp-step-desc">
                Your co-pilot responds in their voice, with real data — routes, rates, regs, weather. No fluff, no hedging. Just the answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FULL CAST OVERVIEW */}
      <section className="acp-cast">
        <div className="acp-cast-header">
          <div className="acp-section-eyebrow">The Full Lineup</div>
          <h2 className="acp-section-title">Full Cast Overview</h2>
        </div>
        <div className="acp-cast-grid">
          {AI_CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="acp-cast-card"
              style={{
                "--accent": char.accent,
                borderColor: activeId === char.id ? char.accent : undefined,
                boxShadow: activeId === char.id ? `0 0 0 1px ${char.accent}, 0 8px 24px rgba(0,0,0,0.3)` : undefined,
              }}
              onClick={() => selectAndScroll(char.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && selectAndScroll(char.id)}
              aria-label={`Select ${char.name}`}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: char.gradient,
                  opacity: 0.15,
                  borderRadius: "18px",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="acp-cast-card-emoji">{char.emoji}</div>
                <div className="acp-cast-card-name">{char.name}</div>
                <div className="acp-cast-card-role">{char.role}</div>
                <span
                  className="acp-cast-card-badge"
                  style={{
                    color: char.badgeColor,
                    borderColor: char.badgeColor,
                    background: `${char.badgeColor}18`,
                  }}
                >
                  {char.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AGENT CONVERSATION PANEL */}
      <AgentConversationPanel />

      {/* CTA SECTION */}
      <section className="acp-cta">
        <div className="acp-cta-glow" />
        <div className="acp-cta-inner">
          <div className="acp-emoji-row">
            {AI_CHARACTERS.map((char) => (
              <div key={char.id} className="acp-emoji-row-item" title={char.name}>
                {char.emoji}
              </div>
            ))}
          </div>
          <h2 className="acp-cta-title">The Dream Team are ready.</h2>
          <p className="acp-cta-sub">
            Seven specialists, one cockpit. Start your free trial and your whole co-pilot team comes with you on day one.
          </p>
          <a href="/#pricing" className="acp-cta-btn">
            🚀 Start Free Trial
          </a>
        </div>
      </section>
    </div>
  );
}
