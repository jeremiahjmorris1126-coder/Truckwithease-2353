import { useState, useRef, useEffect } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#06090F";

// ─── Knowledge base ──────────────────────────────────────────────────────────
const AGENT_PERSONA = {
  name: "Road Agent",
  title: "Logistics & Growth Strategist",
  tagline: "I know the trucking market. I know how to move product through it.",
  avatar: "🛣️",
};

// Full knowledge context Road Agent draws from
const KNOWLEDGE = {
  market: {
    size: "The US trucking industry generates $875B+ annually. 3.5M+ commercial truck drivers on US roads. 500K+ owner-operators. 91% of freight moves by truck at some point.",
    ownerOp: "Owner-operators are the fastest-growing segment — up 18% since 2020. Average age 46. Smartphone adoption 94%. They consume content on YouTube, Facebook Groups (r/Truckers, r/AskTruckers), TikTok (@truckerdave style creators), and listen to podcasts during long hauls.",
    pain: "Top 3 pains: (1) compliance paperwork & HOS violations ($16K avg annual fine risk), (2) fuel cost management (fuel = 25-35% of operating costs), (3) cash flow / getting paid fast (factoring delays average 30-45 days). These are TruckWithEase's exact solutions.",
    competitors: "Motive (KeepTruckin): $350M ARR, enterprise-focused, 3-yr contracts, hated by solo drivers. Trucker Path: 1M+ users, free, ad-supported, no financial tools. DAT: load board only, $59+/mo. None combine ELD + financial tools + rewards in one app.",
    pricing: "Industry standard ELD-only: $35-99/mo. TruckWithEase Solo at $19.99 is a legitimate price disruptor — $15-79 cheaper than alternatives with far more features.",
  },
  channels: {
    organic: [
      "YouTube — trucking channels (Trucking with Alex, Life of a Trucker, Road Dog Trucking) have 100K-2M subscribers. Authentic product demos + driver testimonials convert well.",
      "Facebook Groups — r/Truckers (280K), Owner Operator Independent Drivers Association (OOIDA) Facebook, state-specific trucker groups. Post value-first (compliance tips, fuel saving hacks) before any product pitch.",
      "TikTok & Instagram Reels — '#TruckerLife' has 2.8B views. Short 'day in the life with TruckWithEase' content showing real screens converts at 3-5x vs static ads.",
      "Reddit — r/Truckers (180K), r/AskTruckers (95K). Answer compliance and HOS questions authentically. Never hard-sell. Build trust first.",
      "Podcast sponsorships — '10-4 Magazine Podcast', 'Trucking for Millennials', 'Big Rig Banter'. 30-sec mid-roll spots with driver-coded language ('no contracts, no BS').",
    ],
    paid: [
      "Google Search — high-intent keywords: 'best ELD app owner operator', 'FMCSA compliant HOS app', 'trucking app no contract'. CPC $2-8, strong conversion intent.",
      "Facebook/Instagram — target by job title 'Truck Driver', 'Owner Operator', 'CDL Driver'. Interest targeting: OOIDA, Overdrive Magazine, trucking Facebook groups. $15-25 CPM.",
      "YouTube pre-roll — target trucking channel viewers. 15-sec non-skip: hook with '$19.99 vs $99/mo — same compliance, more features'.",
      "Truck stop digital — Pilot, Love's, and TA Petro have digital signage networks. Geo-targeted ads at pump + inside. High dwell time = high attention.",
    ],
    partnerships: [
      "OOIDA (Owner-Operator Independent Drivers Association) — 150K+ member org. Partnership or endorsed vendor status = instant credibility. They actively promote member-benefit tools.",
      "Trucking schools / CDL programs — new drivers need ELD compliance from day one. Partner with top 50 CDL schools for onboarding bundles.",
      "Factoring companies — Triumph Business Capital, OTR Capital, RTS Financial. Co-market: 'TruckWithEase + [Factoring Co] = faster cash + compliance in one place'.",
      "Pilot Flying J & Love's — their loyalty apps have millions of registered truckers. Co-branded Rig Bucks integration = natural distribution.",
      "Fleet management software — integrate with McLeod Software, TMW Suite, PCS TMS for fleet dispatch referrals.",
    ],
    content: [
      "Weekly compliance tip emails — 'This week's DOT change you need to know'. Free value, builds list.",
      "Free HOS violation calculator tool — 'See how much your current ELD is costing you in risk'. Lead magnet.",
      "Driver testimonial video series — 90-sec real driver stories. Film at truck stops. Authentic > polished.",
      "State-specific compliance guides — 'Texas Trucker's Complete 2026 DOT Guide'. SEO goldmine, shareable in state groups.",
      "Rig Bucks leaderboard — public-facing monthly rankings create organic social sharing ('I'm #3 in Missouri!').",
    ],
  },
  messaging: {
    ownerOp: {
      hook: "You didn't go independent to be buried in paperwork and overcharged for it.",
      pain: "Most ELD apps were built for fleet offices. You're paying $99/mo for a tool that treats you like a number.",
      solution: "TruckWithEase is the first app built for you — not your dispatcher, not a safety manager. HOS, DOT AI, load board, fuel card, and Traxes (your financial co-pilot) in one place.",
      proof: "No contracts. Cancel anytime. $19.99/mo Solo — less than most drivers spend on a single fuel stop snack per week.",
      cta: "Start your 14-day free trial. No card required.",
    },
    fleet: {
      hook: "Your drivers' compliance is your license to operate. Don't leave it to chance.",
      pain: "Motive locks you in for 3 years. Your drivers hate it. Your safety score suffers.",
      solution: "TruckWithEase Fleet gives you live GPS, HOS monitoring, DVIR oversight, and driver coaching — all without the enterprise contract.",
      proof: "$24.99/seat/mo. Month-to-month. Your drivers actually use it because it's built for them.",
      cta: "Talk to our fleet team.",
    },
    differentiator: "The only platform with: ELD compliance + Traxes financial AI + Rig Bucks rewards + $100 fuel card + load board — all in one, no contracts, mobile-first.",
  },
  gtm: {
    phase1: "Months 1-3: Organic foundation. OOIDA outreach, 3 Facebook group posts/week (value-first), 2 YouTube collaborations, launch Rig Bucks leaderboard as viral loop.",
    phase2: "Months 4-6: Paid amplification. Google Search ($2K/mo budget, tight keyword list), Facebook retargeting of website visitors, pilot Flying J digital signage in top 5 states by owner-op density (TX, CA, FL, OH, PA).",
    phase3: "Months 7-12: Partnership acceleration. OOIDA vendor endorsement, CDL school onboarding deals, factoring company co-marketing, Pilot Flying J Rig Bucks formal integration.",
    kpis: "Target KPIs: Month 3: 500 trial signups. Month 6: 1,500 paid subscribers. Month 12: 5,000 paid. CAC target <$45, LTV >$600 (30 months retention × $19.99).",
  },
};

// ─── Agent response engine ───────────────────────────────────────────────────
function generateResponse(input) {
  const q = input.toLowerCase();

  // Market size / opportunity
  if (q.match(/market|size|opportunity|big|industry|revenue|billion/)) {
    return `Great question to start with — knowing your battlefield matters.\n\n**The US trucking market is $875 billion annually.** Here's what that means for TruckWithEase:\n\n• **3.5M+ commercial drivers** on US roads right now\n• **500K+ owner-operators** — your primary target, the fastest-growing segment (up 18% since 2020)\n• Average owner-op age: 46. Smartphone adoption: **94%**. They are absolutely on their phones between loads.\n\nThe opportunity isn't the whole market — it's the owner-operator and small fleet segment that's been **systematically underserved** by enterprise tools like Motive. That's your lane. And it's wide open.\n\nWant me to break down the competitive landscape next, or jump into how we reach these drivers?`;
  }

  // Competitors
  if (q.match(/compet|motive|keeptruckin|trucker path|dat|rival|versus|vs\b/)) {
    return `Let me give you the real picture on your competition — no sugar-coating.\n\n**Motive (KeepTruckin)** — $350M ARR, enterprise darling, 3-year contracts. Owner-ops rate them 3.4/5. Reddit is full of 'getting away from Motive' threads. They're not your real competition for owner-ops — they're your proof point.\n\n**Trucker Path** — 1M+ users, free, ad-supported. Truck-stop directory with no financial tools. Drivers use it like they use Google Maps — not a loyalty product.\n\n**DAT** — Load board only, $59+/mo. Single-purpose. No compliance, no financial tools.\n\n**Your actual position:** TruckWithEase is the only platform combining ELD + Traxes financial AI + Rig Bucks rewards + fuel card + load board at $19.99/mo with no contracts. **That doesn't exist anywhere else.** You're not competing — you're creating a new category.\n\nThe message writes itself: *"They built it for the fleet office. We built it for you."*\n\nWant the messaging framework for each competitor angle?`;
  }

  // Channels / where to find drivers
  if (q.match(/channel|reach|find|where|facebook|youtube|tiktok|reddit|social|advertis|market/)) {
    return `Here's where your drivers actually live — and how to reach them without wasting a dollar.\n\n**Organic (Start Here — Months 1-3):**\n• **Facebook Groups** — r/Truckers (280K members), state-specific trucker groups, OOIDA Facebook. Post compliance tips and HOS guides first. Build trust before you mention the app.\n• **YouTube** — Channels like Trucking with Alex (800K subs) do authentic product demos. One real collab beats 100 banner ads.\n• **TikTok/Reels** — #TruckerLife has 2.8 billion views. 60-second "day in the life with TruckWithEase" showing real screens. Authentic over polished, every time.\n• **Reddit** — r/Truckers, r/AskTruckers. Answer HOS and compliance questions. Never sell directly. Earn the trust first.\n\n**Paid (Months 4-6, once you have testimonials):**\n• Google Search — "best ELD app owner operator", "HOS app no contract". $2-8 CPC, very high purchase intent.\n• Facebook targeting — Job title: Owner Operator, CDL Driver. Interest: OOIDA, Overdrive Magazine. $15-25 CPM.\n• **Truck stop digital signage** — Pilot and Love's have screens at the pumps. Drivers see them for 5-8 minutes during fill-up. High attention, zero competition.\n\nWhat's your current budget range? I can build a phased plan around it.`;
  }

  // Partnerships
  if (q.match(/partner|ooida|pilot|love|ta petro|association|school|cdl|factor/)) {
    return `Partnerships are your fastest credibility shortcut in this market — drivers trust other drivers and their organizations far more than ads.\n\n**Tier 1 — Do This First:**\n🏆 **OOIDA (Owner-Operator Independent Drivers Association)** — 150K+ members, extremely loyal, actively promote member-benefit tools. An OOIDA endorsed vendor badge is worth more than $100K in paid ads. Reach out to their partnership team directly.\n\n**Tier 2 — High Volume:**\n⛽ **Pilot Flying J & Love's** — Their loyalty programs have millions of registered truckers. A formal Rig Bucks integration (drivers earn points redeemable at the pump) = natural distribution inside an app they already open daily.\n\n🎓 **CDL Schools** — New drivers need ELD compliance from day one. Partner with the top 50 CDL programs for onboarding bundles. A driver who starts with TruckWithEase becomes a 10+ year customer.\n\n**Tier 3 — Revenue Amplifiers:**\n💰 **Factoring companies** (Triumph, OTR Capital, RTS Financial) — Co-market: "TruckWithEase + [Factoring Co] = full financial picture in one place." They need you too — Traxes makes their clients better customers.\n\nWant me to draft the OOIDA outreach pitch? That's the one I'd prioritize this week.`;
  }

  // Messaging / copy
  if (q.match(/messag|copy|pitch|hook|headline|tagline|say|word|script|ad|content/)) {
    return `Here's the messaging that cuts through with your exact audience — tested against what works in this market.\n\n**For Owner-Operators:**\n> *"You didn't go independent to be buried in paperwork and overcharged for it."*\n\nThen: "Most ELD apps were built for fleet offices. You're paying $99/mo for a tool that treats you like a number. TruckWithEase is the first one built for you — HOS, DOT AI, load board, fuel card, and Traxes your financial co-pilot. $19.99/mo. No contracts. Cancel anytime."\n\n**For Fleet Managers:**\n> *"Your drivers' compliance is your license to operate. Don't leave it to chance — or a 3-year contract."*\n\n**Proof points that land hardest:**\n• "$19.99 vs $99/mo — same compliance, more features" (direct comparison, verifiable)\n• "Less than what most drivers spend on a fuel stop snack per week" (makes price feel trivial)\n• "No contracts — we earn your business every single month" (turns vulnerability into strength)\n• "Built by people who understand the road" (human credibility vs. Silicon Valley tone)\n\n**What NOT to say:** Never lead with features. Lead with the pain you solve. Drivers don't care about "FMCSA-compliant ELD logging" — they care about not getting hit with a $16,000 violation fine.\n\nWant scripts for a specific channel — YouTube collab brief, Facebook post, or Google ad copy?`;
  }

  // Go-to-market / launch plan
  if (q.match(/launch|gtm|go.to.market|plan|phase|strategy|timeline|roadmap|start/)) {
    return `Here's a 12-month go-to-market built specifically for your market and stage.\n\n**Phase 1 — Months 1-3: Build Trust, Build List**\n• 3x weekly Facebook group posts (compliance tips, not product pitches)\n• 2 YouTube creator collabs — authentic demo, their audience, your product\n• Launch Rig Bucks public leaderboard as a viral loop ("I'm #3 in Missouri!")\n• OOIDA partnership outreach — this is your top priority\n• Email list: free weekly "DOT change you need to know" newsletter\n\n📊 *Target: 500 trial signups*\n\n**Phase 2 — Months 4-6: Amplify What's Working**\n• Google Search ads ($2K/mo — tight keyword list, high intent only)\n• Facebook retargeting of website visitors with driver testimonial video\n• Pilot Flying J pump-side digital signage in TX, CA, FL, OH, PA (top owner-op states)\n• CDL school onboarding bundles — 5 school partnerships\n\n📊 *Target: 1,500 paid subscribers*\n\n**Phase 3 — Months 7-12: Partnership Acceleration**\n• OOIDA endorsed vendor (if not already)\n• Formal Pilot/Love's Rig Bucks integration\n• Factoring company co-marketing with 2 partners\n• Fleet outreach — target 100-500 truck carriers via LinkedIn + TMS integrations\n\n📊 *Target: 5,000 paid subscribers · CAC <$45 · LTV >$600*\n\nWhat part do you want to go deeper on?`;
  }

  // Pricing / value prop
  if (q.match(/pric|value|worth|cheap|expensive|cost|roi|justify/)) {
    return `The pricing story for TruckWithEase is one of the strongest I've seen in this space — here's how to tell it.\n\n**The comparison that wins:**\n| | TruckWithEase Solo | Motive | Trucker Path + DAT |\n|---|---|---|---|\n| Price | $19.99/mo | $35-99/mo | $59+/mo |\n| ELD/HOS | ✓ | ✓ | ✗ |\n| Financial AI (Traxes) | ✓ | ✗ | ✗ |\n| Fuel Card ($100) | ✓ | ✗ | ✗ |\n| Load Board | ✓ | ✗ | ✓ (DAT only) |\n| Rewards Program | ✓ | ✗ | ✗ |\n| No Contract | ✓ | ✗ | ✓ |\n\n**The ROI framing that closes:**\n• Traxes finds an average $4,200/yr in missed deductions → pays for **17 years** of the Solo plan\n• One avoided HOS violation ($16,000 average fine) → pays for **66 years** of the Solo plan\n• $100 fuel card perk included in Pro → nearly covers 3 months at $34.99\n\n**The line that sticks:** *"It's less than $20 a month to run your whole business compliantly and profitably. That's not a software subscription — that's your back office."*\n\nNever apologize for the price. Justify the value and let the math do the selling.`;
  }

  // Content strategy
  if (q.match(/content|blog|video|post|email|newsletter|seo|organic/)) {
    return `Content is how you own this market long-term without paying for every eyeball. Here's the playbook.\n\n**Content Pillars (everything you publish fits one of these):**\n1. 🛡️ **Compliance Made Simple** — HOS tips, DOT updates, inspection prep. Positions TruckWithEase as the authority.\n2. 💰 **Money on the Road** — Fuel savings, tax deductions, load profitability. Traxes content lives here.\n3. 🏆 **Driver Wins** — Rig Bucks leaderboard, badge earners, testimonials. Community and social proof.\n4. 🚛 **The Road Life** — Authentic driver content. Human, relatable, never corporate.\n\n**SEO Goldmines (write these first):**\n• "2026 HOS Rules for Owner-Operators — Complete Guide"\n• "Best ELD App for Owner-Operators: Honest Comparison"\n• "[State] Trucker's Complete DOT Compliance Guide" × 10 top states\n• "How to Maximize Your Mileage Tax Deduction as a Truck Driver"\n\nEach state guide alone can rank for 500-2,000 monthly searches with zero competition. That's 10 articles × 1,000 visitors = 10,000 qualified visitors/month, free.\n\n**Email sequence for free trial signups:**\nDay 0: Welcome + "Here's what Traxes found for drivers like you"\nDay 3: Rig Bucks — your first 50 pts are waiting\nDay 7: "Your compliance checklist for this week"\nDay 14: "Drivers who stayed — here's what changed for them"\nDay 21: Trial ending — here's what you keep\n\nWant me to write any of these pieces in full?`;
  }


  // Drivewyze / PrePass bypass partnership
  if (q.match(/drivewyze|prepass|weigh.*bypass|bypass.*weigh|bypass.*partner/)) {
    return "Drivewyze is exactly the right partner to prioritize — here is how to approach it effectively.\n\n**Why Drivewyze first:**\n• 300K+ enrolled commercial vehicles already in their system\n• Driver-side integration — your app pings their system, no new hardware\n• PrePass covers some states Drivewyze does not — good to list both\n\n**Your opening move:**\n1. drivewyze.com/partners — select Software/App Integration\n2. Lead with: TruckWithEase has a bypass page already built around Drivewyze branding, a named rewards program featuring bypass credits, and a September 1st launch date\n3. Ask for their Fleet Technology Partner track — that is the integration path\n\n**Timeline:** Initial response 5-10 days, agreement 2-4 weeks, technical integration 4-8 weeks. Start now and you can have live bypass at launch.\n\n**The one line that opens the door:** We have already built the driver-facing experience around Drivewyze. We want to formalize the integration before our September 1st launch.\n\nWant me to draft the full partnership email you can send today?";
  }

  // Pilot Flying J / Love's / truck stop partnerships
  if (q.match(/pilot|flying j|loves|ta petro|truck stop.*partner|fuel.*partner/)) {
    return "Pilot Flying J and Love's are Tier 1 for TruckWithEase — here is the direct path.\n\n**Pilot Flying J:** partners.pilotflyingj.com\nThe angle: Rig Bucks already features Pilot redemptions. You are driving Pilot brand preference before a driver walks in the door. That is their marketing, not your ask.\n\n**Love's Travel Stops:** partnerships@loves.com\nLove's has been more aggressive on app integrations than Pilot in the last 18 months. Faster to move.\n\n**TA Petro:** ta-petro.com/fleet-services\nSmaller but highly loyal regional base. Good for regional launch markets.\n\n**The line that opens the door:**\nTruckWithEase Rig Bucks rewards drivers for every fuel purchase at Pilot. Our drivers already see Pilot as the preferred stop. We want to make that a formal partnership before September 1st.\n\nThis outreach letter is already in your Launch Checklist at /launch — ready to copy and send.";
  }

  // CDL schools / new drivers
  if (q.match(/cdl.*school|school.*cdl|new.*driver|student.*driver|training.*program/)) {
    return "CDL school partnerships are one of the highest-ROI acquisition channels available — here is why.\n\n**The math:** 50,000+ new CDL licenses issued every year. A driver who starts on TruckWithEase in week one of their career becomes a 10-20 year customer. Acquisition cost here is near zero.\n\n**How to approach it:**\n• Target the top 50 CDL programs in TX, CA, FL, OH, PA, GA, TN, NC first\n• Offer: co-branded onboarding kit, 30 days of Pro free for every graduate\n• Ask for: 15 minutes in their final training week — compliance tools you will need day one\n\n**What to say to the director:**\nWe are not asking you to sell anything. We want to give your graduates a 30-day head start on compliance. If TruckWithEase earns their business, we will pay you a referral fee for every grad who converts to paid.\n\nWant the full outreach email for CDL school directors?";
  }


  // Rig Bucks rewards partnerships - how to get Flying J etc on board
  if (q.match(/big rig points|rewards.*partner|flying j.*partner|pilot.*partner|loves.*reward|truck stop.*partner|get.*partner|partner.*reward|how.*flying j|fuel.*reward|redemption/)) {
    return "Getting Pilot Flying J, Love's, and TA Petro into your Rig Bucks program is a structured business conversation — here is the exact approach.\n\n**The core pitch to every fuel brand:**\nRig Bucks already features their brand as a redemption destination. You are not asking them to create something new — you are asking them to formalize what is already happening. Drivers are already choosing Pilot because of the rewards. The ask is: let's make it official, trackable, and co-marketed.\n\n**Who to contact at each brand:**\n⛽ **Pilot Flying J** — partners.pilotflyingj.com → Business Development → Fleet Technology\n⛽ **Love's Travel Stops** — partnerships@loves.com → Fleet & Technology Partnerships\n⛽ **TA Petro** — ta-petro.com/fleet-services → Fleet Accounts team\n⛽ **CAT Scale** — catscale.com → Corporate office direct outreach\n\n**Three partnership models to propose:**\n1. **Affinity Redemption** — drivers redeem Rig Bucks for fuel credits at the pump. Partner pays nothing; you drive their volume. Start here.\n2. **Co-Branded Rewards** — every gallon purchased at Pilot earns extra Rig Bucks. Pilot markets it inside myPilot app. You share data. Revenue share model.\n3. **Exclusive Partner** — one fuel brand becomes your official Rig Bucks fuel partner. Exclusivity premium, deeper integration, joint press release.\n\n**The number that opens doors:**\nEven 1,000 active subscribers making 2 fuel stops per week = 8,000 branded fuel decisions per month. Show them that math. For Pilot, one new loyal driver spending $800/month on diesel = $9,600/yr per subscriber. Your subscriber base is their pipeline.\n\n**The outreach email that works:**\n\'TruckWithEase Rig Bucks already lists Pilot Flying J as a preferred redemption partner. Our subscribers see Pilot every time they check their points balance. We are launching September 1st with [X] subscribers. We would like to formalize this partnership before launch and explore a co-marketing arrangement. Can we schedule a 20-minute call?\'\n\nThis letter is in your Launch Checklist at /launch — ready to send today. Want me to customize it for a specific brand?";
  }

  // OOIDA letter
  if (q.match(/ooida.*letter|write.*ooida|draft.*ooida|ooida.*pitch|ooida.*email/)) {
    return `Here's your OOIDA partnership letter — fill in your name and send it this week. This is the highest-priority outreach on your entire pre-launch list.\n\n---\n\n**Subject:** Partnership Inquiry — TruckWithEase ELD & Financial Platform for Owner-Operators\n\nDear OOIDA Partnership Team,\n\nMy name is [Your Name], and I'm the founder of TruckWithEase — a new all-in-one platform built specifically for owner-operators and small fleets.\n\nI'm reaching out because OOIDA represents exactly who we built this for: independent drivers who are tired of enterprise ELD tools designed for fleet offices, not the people behind the wheel.\n\nTruckWithEase combines FMCSA-compliant HOS/ELD logging, a State DOT AI Watcher covering all 50 states, pre-trip DVIR, live fuel finder, load board, and Traxes — an AI financial co-pilot that tracks mileage, logs expenses, and prepares year-end tax packages automatically. All at $19.99/mo for owner-operators. No contracts. Cancel anytime.\n\nWe're launching September 1, 2026, and we believe an OOIDA vendor partnership would be genuinely valuable for your members.\n\nI'd welcome a 20-minute call to share the product and explore what a member-benefit relationship could look like.\n\n[Your Name] | Founder, TruckWithEase | [Phone] | [Email]\n\n---\n\nYou can also find this letter pre-loaded in your **Launch Checklist** at /launch — along with the full Pilot Flying J outreach letter and every other action item between now and September 1st.`;
  }

  // Default / general — rotate so it never feels like a stuck loop
  const fallbacks = [
    "Interesting question. Can you give me a bit more context so I can give you a sharper answer?\n\nAre you asking about a specific channel (Facebook, YouTube, Google), a specific audience (owner-op vs. fleet manager), or a specific competitor you want to outmaneuver?\n\nOr tell me your single biggest concern about the September 1st launch and I will work backwards from there.",
    "Let me give you a direct answer.\n\nFor TruckWithEase at this stage, the highest-leverage move is almost always trust before awareness. Truckers have seen too many apps come and go. The ones who convert already believe you understand the road.\n\nWhat specific challenge are you working on right now — reaching new drivers, converting trials to paid, or retaining subscribers once they are in?",
    "Good question to be thinking about.\n\nIn this market, the fastest path to real paying subscribers by September 1st is: OOIDA endorsement plus two YouTube collabs plus Google Search ads on best ELD app owner operator. That combination alone can drive 300-500 qualified trials in 60 days.\n\nWant me to build out any of those three channels in detail?",
  ];
  return fallbacks[Math.floor(Date.now() / 1000) % fallbacks.length];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function formatMessage(text) {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Bullets
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  for (let line of lines) {
    if (line.trim().startsWith('•') || line.trim().startsWith('🏆') || line.trim().startsWith('⛽') || line.trim().startsWith('🎓') || line.trim().startsWith('💰') || line.trim().startsWith('📊') || line.trim().startsWith('🛡️') || line.trim().startsWith('💰') || line.trim().startsWith('🚛') || line.trim().startsWith('📣') || line.trim().startsWith('🤝') || line.trim().startsWith('✍️') || line.trim().startsWith('🚀') || line.trim().startsWith('🗺️')) {
      result.push(`<div style="display:flex;gap:8px;margin:5px 0;"><span style="flex-shrink:0">${line.trim().charAt(0)}</span><span>${line.trim().slice(1).trim()}</span></div>`);
    } else if (line.trim().startsWith('>')) {
      result.push(`<blockquote style="border-left:3px solid #FFB400;padding-left:14px;margin:12px 0;color:rgba(255,255,255,0.9);font-style:italic;">${line.trim().slice(1).trim()}</blockquote>`);
    } else if (line.trim().startsWith('|')) {
      result.push(`<code style="display:block;font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,0.7);margin:2px 0;">${line}</code>`);
    } else if (line.trim() === '') {
      result.push('<div style="height:8px"></div>');
    } else {
      result.push(`<div style="margin:3px 0;">${line}</div>`);
    }
  }
  return result.join('');
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "🗺️", label: "How big is this market?" },
  { icon: "📣", label: "Where do I find owner-operators?" },
  { icon: "🤝", label: "Best partnerships to pursue?" },
  { icon: "✍️", label: "Write me a pitch for drivers" },
  { icon: "🚀", label: "Build me a launch plan" },
  { icon: "💰", label: "How do I sell the price?" },
  { icon: "⚔️", label: "How do we beat Motive?" },
  { icon: "📱", label: "Content strategy for TikTok" },
];

export default function RoadAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: `Welcome. I'm **Road Agent** — your logistics and growth strategist for the trucking app market.\n\nI know this industry cold: 3.5M drivers, 500K owner-operators, $875B in freight, and every platform competing for their attention. I know what messaging cuts through, which channels convert, and exactly where TruckWithEase has a genuine competitive edge.\n\n**Ask me anything about reaching your market.** Or pick one of the quick topics below to get started.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text) {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      const response = generateResponse(q);
      setMessages(m => [...m, { role: "agent", text: response }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: DARK, minHeight: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${DARK}; }
        ::-webkit-scrollbar-thumb { background: #1E3050; border-radius: 2px; }
        .ra-sugg { transition: all 0.18s; border: 1px solid rgba(255,180,0,0.18); }
        .ra-sugg:hover { background: rgba(255,180,0,0.1) !important; border-color: rgba(255,180,0,0.5) !important; transform: translateY(-2px); }
        .ra-send { transition: all 0.18s; }
        .ra-send:hover { background: #D97F00 !important; }
        .ra-nav-link { transition: color 0.2s; }
        .ra-nav-link:hover { color: ${AMBER} !important; }
        @keyframes raTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        .ra-dot { animation: raTyping 1.2s ease-in-out infinite; }
        .ra-dot:nth-child(2) { animation-delay: 0.15s; }
        .ra-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes raFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ra-msg { animation: raFadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
        @keyframes raGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,180,0,0.2); }
          50%       { box-shadow: 0 0 40px rgba(255,180,0,0.45); }
        }
        .ra-avatar { animation: raGlow 3s ease-in-out infinite; }
        @media (max-width: 767px) {
          .ra-nav-links { display: none !important; }
          .ra-sugg-grid { grid-template-columns: 1fr 1fr !important; }
          .ra-stats { gap: 20px !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,9,15,0.96)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,180,0,0.1)", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "white" }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="ra-nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 20, padding: "6px 14px" }}>
            <span style={{ fontSize: 16 }}>🛣️</span>
            <span style={{ color: AMBER, fontWeight: 700, fontSize: 13 }}>Road Agent</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
          </div>
          <a href="/" className="ra-nav-link" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", marginLeft: 8 }}>← Back to site</a>
        </div>
      </nav>

      {/* ── HERO STRIP ───────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY2} 0%, #0A1830 50%, ${DARK} 100%)`, borderBottom: "1px solid rgba(255,180,0,0.08)", padding: "40px 5% 36px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,180,0,0.025) 1px, transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div className="ra-avatar" style={{ width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: `2px solid rgba(255,180,0,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🛣️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: -0.5 }}>Road Agent</h1>
                  <span style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ADE80", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>● Online</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>
                  Logistics pro + trucking market specialist. Knows your drivers, your competition, and exactly how to put TruckWithEase in front of the right people.
                </p>
              </div>
              {/* Quick stats */}
              <div className="ra-stats" style={{ display: "flex", gap: 32, flexShrink: 0 }}>
                {[["$875B","US Trucking Market"],["500K+","Owner-Operators"],["3.5M+","Active Drivers"]].map(([v,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ color: AMBER, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{v}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── CHAT AREA ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 900, width: "100%", margin: "0 auto", padding: "0 5%", paddingBottom: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 20px" }}>
          {messages.map((msg, i) => (
            <div key={i} className="ra-msg" style={{ display: "flex", gap: 14, marginBottom: 22, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "agent" && (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginTop: 2 }}>🛣️</div>
              )}
              <div style={{ maxWidth: "82%", background: msg.role === "agent" ? "#0C1628" : `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: msg.role === "agent" ? "1px solid rgba(255,255,255,0.07)" : `1px solid rgba(255,180,0,0.2)`, borderRadius: msg.role === "agent" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", padding: "14px 18px", color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
              {msg.role === "user" && (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginTop: 2, color: DARK, fontWeight: 900 }}>U</div>
              )}
            </div>
          ))}
          {typing && (
            <div className="ra-msg" style={{ display: "flex", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛣️</div>
              <div style={{ background: "#0C1628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} className="ra-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: AMBER, opacity: 0.4 }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions — show only before first user message */}
        {messages.filter(m => m.role === "user").length === 0 && (
          <FadeIn delay={200}>
            <div className="ra-sugg-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.label} className="ra-sugg"
                  onClick={() => send(s.label)}
                  style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ lineHeight: 1.4 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Input bar */}
        <div style={{ padding: "16px 0 24px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea ref={inputRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={handleKey}
              placeholder="Ask Road Agent anything about reaching the trucking market…"
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", color: "white", fontSize: 14, fontFamily: "'Poppins', sans-serif", outline: "none", resize: "none", lineHeight: 1.5, minHeight: 48, maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,180,0,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
            <button onClick={() => send()} className="ra-send" disabled={!input.trim() || typing}
              style={{ width: 48, height: 48, borderRadius: 12, background: input.trim() && !typing ? AMBER : "rgba(255,255,255,0.08)", border: "none", cursor: input.trim() && !typing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, transition: "all 0.18s" }}>
              <span style={{ color: input.trim() && !typing ? DARK : "rgba(255,255,255,0.3)", fontWeight: 900 }}>↑</span>
            </button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8, textAlign: "center" }}>
            Road Agent knows the US trucking market, owner-operator behavior, competitor landscape, and growth strategy for TruckWithEase.
          </p>
        </div>
      </div>
    </div>
  );
}
