import { useState } from "react";

const C = {
  gold: "#F5C842",
  goldDim: "#C9A227",
  black: "#0a0a0a",
  card: "#111111",
  border: "#222222",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  red: "#ef4444",
};

const PLATFORMS = [
  { id: "all", label: "All Platforms", emoji: "🌐", color: C.gold },
  { id: "facebook", label: "Facebook", emoji: "📘", color: "#1877f2" },
  { id: "tiktok", label: "TikTok", emoji: "🎵", color: "#ff0050" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼", color: "#0a66c2" },
  { id: "reddit", label: "Reddit", emoji: "🔴", color: "#ff4500" },
  { id: "twitter", label: "Twitter/X", emoji: "🐦", color: "#1da1f2" },
  { id: "youtube", label: "YouTube", emoji: "▶️", color: "#ff0000" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "#e1306c" },
];

const POSTS = [
  // Week 1
  {
    day: 1, week: 1, platform: "facebook", title: "Everything In One Price",
    caption: `🚛 One platform. One price. $29.99/month.\n\nDispatch + Driver Hiring + Payroll + Background Checks + Load Board + Big Rig Bucks rewards — plus sealed HOS records that work alongside the ELD you already run.\n\nNo contracts. No new hardware. Free trial today.\n\n👉 truckwithease.com`,
    type: "Pricing", audience: "Fleet Managers", time: "6:00 AM", reach: "High",
    tip: "Post in Owner Operator Nation (180K), CDL Drivers Network (210K), Trucking USA groups"
  },
  {
    day: 2, week: 1, platform: "tiktok", title: "Ghost Nerve Demo",
    caption: `Ghost Nerve is doing things no trucking app has EVER done 🤯 Watch it route 12 loads simultaneously in real time #TruckTok #Trucking #FleetManagement #ELD #OwnerOperator`,
    type: "Screen Recording", audience: "All Drivers", time: "7:00 AM", reach: "Viral Potential",
    tip: "Record 60 seconds of Ghost Nerve pulsing + Dispatch running. No voiceover needed — the visuals sell it."
  },
  {
    day: 3, week: 1, platform: "linkedin", title: "Platform Comparison",
    caption: `Fleet managers: here's everything TruckWithEase does in one screen.\n\nHiring, payroll from ELD miles, intelligence dispatch, driver background checks, sealed HOS records — one platform, one login.\n\nIt runs alongside the ELD hardware you already own, so nothing gets ripped out.\n\nFree trial at truckwithease.com`,
    type: "Comparison Post", audience: "Fleet Managers, Logistics Directors", time: "8:00 AM", reach: "High",
    tip: "Tag fleet management companies, logistics directors, and owner-operator associations"
  },
  {
    day: 4, week: 1, platform: "reddit", title: "r/Truckers Introduction",
    caption: `Built a trucking platform for 2 years — here's what I learned Samsara and Motive get wrong\n\nNot here to bash anyone. Just sharing what drivers actually told me they needed:\n\n• HOS logging for local drivers NOT under ELD mandate\n• Hiring built into the same app as dispatch\n• Payroll calculated automatically from verified ELD miles\n• Background checks that run the moment someone applies\n\nBuilt all of it. Free trial if anyone wants to kick the tires: truckwithease.com\n\nHappy to answer any questions about how it works.`,
    type: "Authentic Story", audience: "Drivers, Owner Operators", time: "6:00 PM", reach: "High",
    tip: "Post in r/Truckers, r/CommercialTrucking, r/FreightBrokers — be genuine, answer every reply"
  },
  {
    day: 5, week: 1, platform: "twitter", title: "Ghost Nerve Thread",
    caption: `Thread: what Ghost Nerve actually does 🧵\n\n1/ Your dispatch is pre-solved before the driver's shift begins. They open the app and the work is already laid out.\n\n2/ Compliance risk is flagged while you can still fix it — not reported to you after the citation.\n\n3/ Profit computed per mile, per load, per driver — not once a month.\n\n4/ Every dispatch message is stamped with the driver's legal clock at the second it was sent, then hash-chained — so altering a record afterward breaks the chain and shows up.\n\nThis is TruckWithEase. truckwithease.com`,
    type: "Thread", audience: "Industry, Investors", time: "9:00 AM", reach: "Medium",
    tip: "Pin this thread to your profile. Engage with every reply for the first 2 hours."
  },
  {
    day: 6, week: 1, platform: "youtube", title: "Full Platform Demo",
    caption: `TruckWithEase Full Demo — Dispatch, Ghost Nerve, HOS Logger, Driver Hiring & More\n\nIn this video I walk through every major feature of TruckWithEase — the only platform that handles ELD compliance, driver hiring, payroll from verified miles, intelligence dispatch, and Big Rig Bucks rewards all in one place.\n\n#TruckWithEase #TruckingApp #ELD #FleetManagement #QuatumDispatch`,
    type: "Demo Video", audience: "All", time: "10:00 AM", reach: "Long-term SEO",
    tip: "Target keywords: 'Samsara alternative', 'best ELD app 2025', 'trucking fleet management app'"
  },
  {
    day: 7, week: 1, platform: "instagram", title: "Logo + Price Drop",
    caption: `The trucking app that does everything.\n\nSolo drivers from $29.99/month.\nFleets from $49.99/seat.\n\nDispatch. ELD Compliance. Driver Hiring. Payroll. Load Board. Big Rig Bucks.\n\nAll of it. One platform. truckwithease.com\n\n#Trucking #ELD #FleetManagement #OwnerOperator #CDL #TruckDriver #Dispatch`,
    type: "Brand Post", audience: "All Drivers", time: "8:00 AM", reach: "Medium",
    tip: "Use your TruckWithEase logo as the image. Clean, bold, premium."
  },
  // Week 2
  {
    day: 8, week: 2, platform: "facebook", title: "Driver Hiring Feature",
    caption: `Fleet managers — how long does it take you to hire a new driver right now?\n\nWith TruckWithEase HRease:\n✅ Post a job opening in 60 seconds\n✅ Criminal background check runs automatically on every applicant\n✅ DOT Safety record pulled from FMCSA instantly\n✅ CDL verified against state DMV automatically\n✅ You get a HIRE / DON'T HIRE recommendation before you make one phone call\n\nFree trial at truckwithease.com`,
    type: "Feature Spotlight", audience: "Fleet Managers", time: "7:00 AM", reach: "High",
    tip: "Boost this post to fleet managers and logistics companies within 50 miles of major trucking hubs"
  },
  {
    day: 9, week: 2, platform: "tiktok", title: "Big Rig Bucks",
    caption: `Drivers earn REAL rewards just for doing their job right 🏆 #BigRigBucks #TruckTok #TruckDriver #CDL #Trucking`,
    type: "Feature Demo", audience: "Drivers", time: "6:00 AM", reach: "Viral Potential",
    tip: "Show the Big Rig Bucks leaderboard updating in real time. Drivers love competition."
  },
  {
    day: 10, week: 2, platform: "linkedin", title: "Where The Hours Go",
    caption: `Where a 10-truck fleet quietly loses time every week:\n\n• Manual payroll calculation → automated from ELD miles\n• Phone screening applicants → automated background checks\n• Spreadsheet dispatch → intelligence route optimization\n• Digging through texts to prove what was agreed → sealed message history with the duty clock attached\n\nRun your own numbers and see what that time is worth to you.\n\nCalculate yours at truckwithease.com/roi-calculator`,
    type: "ROI Analysis", audience: "Fleet Owners, CFOs", time: "8:00 AM", reach: "High",
    tip: "Share in Fleet Management, Logistics, and Supply Chain LinkedIn groups"
  },
  {
    day: 11, week: 2, platform: "reddit", title: "Local Driver HOS",
    caption: `PSA for local/last-mile drivers: you might not need an ELD at all\n\nIf you drive within a 100 air-mile radius and return to the same location each day, you're likely exempt from the ELD mandate.\n\nBut you still need to log hours correctly or you can get cited.\n\nTruckWithEase has a specific HOS mode built for local/short-haul/exempt drivers — separate from the ELD logging. Free to try: truckwithease.com\n\nHappy to explain the exemptions if anyone has questions.`,
    type: "Education Post", audience: "Local Drivers", time: "5:00 PM", reach: "High",
    tip: "Post in r/Truckers and r/AmazonFlexDrivers — huge untapped audience"
  },
  {
    day: 12, week: 2, platform: "twitter", title: "Bike Courier Announcement",
    caption: `We just built something for bike couriers in NYC, Chicago, SF, LA and Miami.\n\nSafe route mapping. Dangerous intersection alerts. E-bike battery planning. City-specific laws. Package tracking. Earnings per delivery.\n\nAll inside TruckWithEase.\n\nBecause every courier deserves a platform built for them.\n\ntruckwithease.com/ride-with-ease`,
    type: "Product Announcement", audience: "Bike Couriers, Gig Workers", time: "12:00 PM", reach: "Medium",
    tip: "Tag @NYCMayor, @ChicagoCityHall, local cycling advocacy accounts for organic reach"
  },
  {
    day: 13, week: 2, platform: "youtube", title: "HOS Logger Deep Dive",
    caption: `TruckWithEase HOS Logger — Works for EVERY Driver Type (ELD, Local, Short-Haul, Exempt)\n\nMost ELD apps only work for long-haul CDL drivers. TruckWithEase supports 6 driver types including local/last-mile, short-haul exempt, and agricultural drivers.\n\n#HOSLogging #ELD #TruckDriver #LocalDriver #AmazonFlex`,
    type: "Tutorial Video", audience: "All Driver Types", time: "10:00 AM", reach: "Long-term SEO",
    tip: "This video targets 'local driver HOS' — a keyword nobody owns yet"
  },
  {
    day: 14, week: 2, platform: "instagram", title: "Bike + Car + Truck",
    caption: `One platform. Every vehicle.\n\n🚛 Tractor-trailers\n🚗 Sprinters & delivery vans\n🚲 Bike couriers\n\nIntelligence routing. Real-time safety. Earnings tracking. Rewards.\n\nAll of it at truckwithease.com\n\n#Trucking #Delivery #BikeLife #CourierLife #Dispatch #FleetManagement`,
    type: "Brand Story", audience: "All Vehicle Types", time: "9:00 AM", reach: "Medium",
    tip: "Use a split graphic — truck, car, bike side by side in gold on black"
  },
  // Week 3
  {
    day: 15, week: 3, platform: "facebook", title: "Free Trial Push",
    caption: `Free trial still open this week.\n\nNo credit card. No contract. No new hardware.\n\nLog in and run your own fleet's numbers through it before you decide anything.\n\n🔗 truckwithease.com`,
    type: "Urgency CTA", audience: "All", time: "6:00 AM", reach: "High",
    tip: "Run this as a paid boost for $10 — target owner operators 25-55 within 100 miles of major freight hubs"
  },
  {
    day: 16, week: 3, platform: "tiktok", title: "Dispatch Speed",
    caption: `Watch 12 loads get optimized simultaneously in under 7 seconds 🤯 This is intelligence dispatching #TruckTok #Dispatch #Trucking #FleetManagement`,
    type: "Speed Demo", audience: "All", time: "7:00 AM", reach: "Viral Potential",
    tip: "Add trending trucking audio. Speed up the video slightly for maximum impact."
  },
  {
    day: 17, week: 3, platform: "linkedin", title: "FMCSA Compliance",
    caption: `Fleet managers: do you actually know where your compliance gaps are?\n\nTruckWithEase tracks HOS logging, DVIR submission, CSA score monitoring, and drug & alcohol clearinghouse status in one checklist — and shows you plainly which items it covers and which ones are still on you.\n\nNo guessing about what's handled.\n\nSee your compliance checklist at truckwithease.com/fmcsa-registration`,
    type: "Compliance Education", audience: "Fleet Managers, Safety Directors", time: "8:00 AM", reach: "High",
    tip: "Tag DOT consultants and trucking attorneys for credibility"
  },
  {
    day: 18, week: 3, platform: "reddit", title: "Game Up Training",
    caption: `We built a gamified CDL training system inside TruckWithEase and I want honest feedback\n\n10 modules: HOS, Pre-Trip, Hazmat, DOT Inspection Prep, Defensive Driving, Load Securement, ELD Operation, Accident Reporting, Drug & Alcohol, Backing & Maneuvering.\n\nDrivers earn XP and Big Rig Bucks for completing each module. Fleet managers see every driver's certification status in real time.\n\nFree to try: truckwithease.com/game-up\n\nWhat would make you actually use this?`,
    type: "Feedback Request", audience: "Drivers", time: "6:00 PM", reach: "High",
    tip: "r/Truckers loves giving feedback. Respond to every comment."
  },
  {
    day: 19, week: 3, platform: "twitter", title: "Payroll From ELD Miles",
    caption: `Trucking payroll should be simple:\n\n1. Driver drives\n2. ELD records verified miles\n3. Payroll calculates automatically\n4. You approve in one tap\n5. Done\n\nThat's TruckWithEase payroll.\n\nNo spreadsheets. No manual calculations. No disputes.\n\ntruckwithease.com`,
    type: "Feature Highlight", audience: "Fleet Managers", time: "9:00 AM", reach: "Medium",
    tip: "Simple, clear, factual. This type of post gets shared by fleet managers constantly."
  },
  {
    day: 20, week: 3, platform: "youtube", title: "Driver Hiring Walkthrough",
    caption: `How TruckWithEase Hires Drivers Automatically — Background Check, DOT Verify, CDL Check in 60 Seconds\n\nWatch the full HRease hiring flow from job posting to background check results to offer letter.\n\n#DriverHiring #FleetManagement #CDL #TruckingJobs #HRease`,
    type: "Process Walkthrough", audience: "Fleet Managers", time: "10:00 AM", reach: "Long-term SEO",
    tip: "Title targets 'how to hire truck drivers' — 8,100 searches/month"
  },
  {
    day: 21, week: 3, platform: "instagram", title: "Safety SOS Feature",
    caption: `One tap. 911 local dispatch. State Patrol direct connect. GPS transmitted.\n\nEvery driver on TruckWithEase has Safety SOS in their pocket.\n\nBecause getting home safe is the only metric that matters.\n\ntruckwithease.com\n\n#TruckDriver #Trucking #SafetyFirst #CDL #OwnerOperator`,
    type: "Safety Feature", audience: "Drivers", time: "8:00 AM", reach: "High",
    tip: "This post will be shared by drivers' families. Real emotional connection."
  },
  // Week 4
  {
    day: 22, week: 4, platform: "facebook", title: "Dream Team Agents",
    caption: `Our AI Dream Team never sleeps.\n\n⚡ THE GOAT — master platform agent, zero errors\n👩‍💼 HRease — hiring, onboarding, driver retention\n📡 Signal Sam — every phone line, every text, 24/7\n🧾 Billie Scan — one photo, bill sent to everyone instantly\n\nThis isn't software. This is your operations team.\n\nFree trial: truckwithease.com`,
    type: "Agent Spotlight", audience: "Fleet Managers", time: "7:00 AM", reach: "High",
    tip: "Video of the Dream Team page loading with agents animating in gets huge engagement"
  },
  {
    day: 23, week: 4, platform: "tiktok", title: "Safety SOS Demo",
    caption: `One tap and help is on the way 🚨 Every driver needs this #TruckDriver #TruckTok #Safety #CDL #Trucking`,
    type: "Safety Demo", audience: "Drivers, Families", time: "6:00 AM", reach: "Viral Potential",
    tip: "Show the SOS button press, the GPS transmit, the state patrol connection. Emotional + practical."
  },
  {
    day: 24, week: 4, platform: "linkedin", title: "Ghost Nerve Moat",
    caption: `What makes Ghost Nerve hard to copy:\n\n1. Driver data that compounds — every pattern, every lane, every decision\n2. Revenue computed per mile, per load, per driver\n3. The Sealed Line — every dispatch message hash-chained to the driver's duty clock at the second it was sent, so tampering is evident\n4. Compliance risk surfaced while it's still fixable\n\nThis is TruckWithEase.\n\ntruckwithease.com/ghost-nerve`,
    type: "Investor/Industry Post", audience: "Investors, Industry Leaders", time: "9:00 AM", reach: "High",
    tip: "Tag venture capital firms focused on logistics and transportation tech"
  },
  {
    day: 25, week: 4, platform: "reddit", title: "Van/Sprinter Drivers",
    caption: `For all the Sprinter van drivers, Amazon DSP fleets, and FedEx Ground contractors: TruckWithEase now has a full mode built specifically for you\n\nCross-state compliance updates automatically. Cold chain temperature logs for pharmaceutical routes. Two-person team delivery mode. Intelligence route optimization that saves 28 minutes per shift.\n\nFree trial: truckwithease.com/drive-with-ease\n\nNot for CDL holders only — built for every commercial vehicle.`,
    type: "Audience Expansion", audience: "Van/Sprinter Drivers", time: "5:00 PM", reach: "High",
    tip: "Post in r/AmazonDSP, r/FedEx, r/UPS subreddits — massive untapped audience"
  },
  {
    day: 26, week: 4, platform: "twitter", title: "Works With Your ELD",
    caption: `TruckWithEase is built to run alongside the ELD you already have.\n\nWe don't sell you hardware and we don't ask you to rip anything out. Your existing device keeps doing HOS. TruckWithEase handles dispatch, payroll, hiring, and sealed message records on top of it.\n\nNo double systems. One platform.\n\ntruckwithease.com`,
    type: "Positioning", audience: "Industry", time: "10:00 AM", reach: "Medium",
    tip: "Do not name or tag a hardware vendor — no integration partnership is signed"
  },
  {
    day: 27, week: 4, platform: "youtube", title: "Bike Courier Feature Tour",
    caption: `TruckWithEase for Bike Couriers — Safe Routes, Earnings, E-Bike Battery, City Laws & More\n\nThe first serious platform built for urban bike and e-bike couriers across NYC, Chicago, SF, LA, and Miami.\n\n#BikeLife #CourierLife #EBike #NYCBike #ChicagoBike #DoorDash #UberEats`,
    type: "Feature Tour", audience: "Bike Couriers", time: "10:00 AM", reach: "Long-term SEO",
    tip: "Targets zero-competition keywords. First mover advantage on YouTube for bike courier apps."
  },
  {
    day: 28, week: 4, platform: "instagram", title: "Month 1 Milestone",
    caption: `Month 1. Platform live. Real drivers. Real fleets.\n\nThank you to everyone who tried TruckWithEase. We're just getting started.\n\n🚛 Dispatch\n📱 Fleet Voice\n🎮 Game Up Training\n⚡ Ghost Nerve Intelligence\n💰 Big Rig Bucks\n\ntruckwithease.com\n\n#TruckWithEase #Trucking #FleetManagement #Milestone`,
    type: "Milestone Post", audience: "All", time: "9:00 AM", reach: "High",
    tip: "Authenticity wins on Instagram. Real milestone posts get saved and shared."
  },
  {
    day: 29, week: 5, platform: "facebook", title: "30-Day Wrap",
    caption: `30 days of TruckWithEase. Here's what we learned from real drivers and fleet managers:\n\n✅ The #1 request: payroll from ELD miles (it's live)\n✅ The #1 surprise: bike courier mode hit harder than expected\n✅ The #1 question: "Why doesn't Samsara do this?"\n\nWe're building what the industry actually needs.\n\nFree trial still open: truckwithease.com`,
    type: "Month Wrap-Up", audience: "All", time: "6:00 AM", reach: "High",
    tip: "Community-style wrap-up posts get massive organic reach on Facebook"
  },
  {
    day: 30, week: 5, platform: "tiktok", title: "30-Day Recap",
    caption: `30 days. Real drivers. Real fleets. Real intelligence dispatching. We're just getting started 🚛⚡ #TruckWithEase #TruckTok #Trucking #FleetManagement #Dispatch`,
    type: "Recap Reel", audience: "All", time: "7:00 AM", reach: "Viral Potential",
    tip: "Montage of all the best screen recordings from the month. Use trending audio."
  },
];

const REACH_COLOR = { "High": C.green, "Viral Potential": C.gold, "Medium": C.blue, "Long-term SEO": C.purple };

export default function SocialCalendarPage() {
  const [filter, setFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [view, setView] = useState("calendar"); // calendar | stats

  const filtered = filter === "all" ? POSTS : POSTS.filter(p => p.platform === filter);

  function copyCaption(post) {
    navigator.clipboard.writeText(post.caption);
    setCopiedId(post.day);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const stats = {
    total: POSTS.length,
    platforms: [...new Set(POSTS.map(p => p.platform))].length,
    viral: POSTS.filter(p => p.reach === "Viral Potential").length,
    high: POSTS.filter(p => p.reach === "High").length,
  };

  return (
    <div style={{ background: C.black, minHeight: "100vh", fontFamily: "'Oswald', sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #1a1400 100%)", borderBottom: `1px solid ${C.border}`, padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: C.gold, letterSpacing: 4, marginBottom: 8 }}>TRUCKWITHEASE</div>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: 0, letterSpacing: 2 }}>
                30-DAY <span style={{ color: C.gold }}>SOCIAL MEDIA</span> CALENDAR
              </h1>
              <div style={{ color: "#999", marginTop: 8, fontSize: 15 }}>Every post written, every day planned — copy and go</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {["calendar", "stats"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  background: view === v ? C.gold : "transparent",
                  color: view === v ? C.black : "#fff",
                  border: `1px solid ${view === v ? C.gold : C.border}`,
                  padding: "10px 24px", borderRadius: 8, fontFamily: "'Oswald', sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase"
                }}>{v === "calendar" ? "📅 Calendar" : "📊 Stats"}</button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total Posts", value: stats.total, color: C.gold },
              { label: "Platforms", value: stats.platforms, color: C.blue },
              { label: "Viral Potential", value: stats.viral, color: "#ff0050" },
              { label: "High Reach", value: stats.high, color: C.green },
            ].map(s => (
              <div key={s.label} style={{ background: "#111", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 20px", minWidth: 120 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {view === "stats" ? (
          <div>
            <h2 style={{ color: C.gold, letterSpacing: 2, marginBottom: 24 }}>ADVERTISING INTELLIGENCE REPORT</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {[
                { platform: "Facebook Groups", reach: "4.2M drivers", cost: "Free", roi: "⭐⭐⭐⭐⭐", tip: "Owner Operator Nation (180K), CDL Drivers Network (210K). Post 3x/week at 6AM.", color: "#1877f2" },
                { platform: "TikTok #TruckTok", reach: "4.8B views", cost: "Free", roi: "⭐⭐⭐⭐⭐", tip: "60-second screen recordings go viral. Ghost Nerve demo is your #1 asset.", color: "#ff0050" },
                { platform: "LinkedIn", reach: "Fleet Managers", cost: "Free", roi: "⭐⭐⭐⭐", tip: "Post ROI comparisons and compliance content. Tag logistics directors directly.", color: "#0a66c2" },
                { platform: "Reddit", reach: "Authentic drivers", cost: "Free", roi: "⭐⭐⭐⭐", tip: "r/Truckers, r/CommercialTrucking, r/AmazonDSP. Answer every reply for 2 hours.", color: "#ff4500" },
                { platform: "YouTube SEO", reach: "Long-term", cost: "Free", roi: "⭐⭐⭐⭐", tip: "'Samsara alternative' = 51K searches/month. Nobody owns it yet. You can.", color: "#ff0000" },
                { platform: "Instagram Reels", reach: "Driver community", cost: "Free", roi: "⭐⭐⭐", tip: "Safety SOS and Big Rig Bucks posts get shared by drivers' families.", color: "#e1306c" },
              ].map(s => (
                <div key={s.platform} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.platform}</div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    <span style={{ background: "#222", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: C.gold }}>Reach: {s.reach}</span>
                    <span style={{ background: "#222", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: C.green }}>Cost: {s.cost}</span>
                  </div>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{s.roi}</div>
                  <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{s.tip}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.gold}`, borderRadius: 16, padding: 24, marginTop: 24 }}>
              <h3 style={{ color: C.gold, letterSpacing: 2, marginBottom: 16 }}>💰 PAID ADS — IF YOU EVER RUN THEM</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { platform: "Facebook Ads", budget: "$10/day", result: "~50K impressions, ~180 clicks", cpa: "$1.67/click" },
                  { platform: "Google Search", budget: "$15/day", result: "'Samsara alternative' keyword", cpa: "First mover" },
                  { platform: "TikTok Ads", budget: "$5/day", result: "~80K video views", cpa: "$0.06/view" },
                ].map(p => (
                  <div key={p.platform} style={{ background: "#0a0a0a", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.platform}</div>
                    <div style={{ fontSize: 13, color: C.gold }}>{p.budget}/day</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{p.result}</div>
                    <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>{p.cpa}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Platform Filter */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setFilter(p.id)} style={{
                  background: filter === p.id ? p.color : "#111",
                  color: filter === p.id ? (p.id === "all" ? C.black : "#fff") : "#aaa",
                  border: `1px solid ${filter === p.id ? p.color : C.border}`,
                  padding: "8px 16px", borderRadius: 8, fontFamily: "'Oswald', sans-serif",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                  transition: "all 0.2s"
                }}>{p.emoji} {p.label}</button>
              ))}
            </div>

            {/* Post Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filtered.map(post => {
                const platform = PLATFORMS.find(p => p.id === post.platform);
                return (
                  <div key={post.day} style={{
                    background: C.card, border: `1px solid ${selectedPost?.day === post.day ? C.gold : C.border}`,
                    borderRadius: 16, overflow: "hidden", cursor: "pointer",
                    transition: "all 0.2s", borderTop: `3px solid ${platform?.color || C.gold}`
                  }} onClick={() => setSelectedPost(selectedPost?.day === post.day ? null : post)}>
                    {/* Post Header */}
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{platform?.emoji}</span>
                          <span style={{ fontSize: 12, color: platform?.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{platform?.label}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ background: "#1a1400", color: C.gold, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Day {post.day}</span>
                          <span style={{ background: "#0a0a0a", color: REACH_COLOR[post.reach] || "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{post.reach}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>{post.title}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{post.type} · {post.time} · {post.audience}</div>
                    </div>

                    {/* Caption Preview */}
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, maxHeight: selectedPost?.day === post.day ? "none" : 80, overflow: "hidden", whiteSpace: "pre-line" }}>
                        {post.caption}
                      </div>

                      {selectedPost?.day === post.day && (
                        <div style={{ marginTop: 16, background: "#0a0a0a", borderRadius: 10, padding: 14, borderLeft: `3px solid ${C.gold}` }}>
                          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>💡 PRO TIP</div>
                          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{post.tip}</div>
                        </div>
                      )}

                      <button onClick={e => { e.stopPropagation(); copyCaption(post); }} style={{
                        marginTop: 12, background: copiedId === post.day ? C.green : "transparent",
                        color: copiedId === post.day ? C.black : C.gold,
                        border: `1px solid ${copiedId === post.day ? C.green : C.gold}`,
                        padding: "8px 16px", borderRadius: 8, fontFamily: "'Oswald', sans-serif",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", letterSpacing: 1
                      }}>
                        {copiedId === post.day ? "✓ COPIED!" : "📋 COPY CAPTION"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
