import { useState } from 'react';

const DARK  = '#060A10';
const CARD  = '#0D1520';
const BORDER= '#1a2535';
const GOLD  = '#c9a84c';
const WHITE = '#F0EDE8';
const DIM   = 'rgba(240,237,232,0.5)';
const DIM2  = 'rgba(240,237,232,0.12)';
const GREEN = '#10B981';
const BLUE  = '#3B82F6';
const ORANGE= '#FF6B00';
const PURPLE= '#8B5CF6';
const FD    = "'Bebas Neue','Oswald',sans-serif";
const FB    = "'Inter',system-ui,sans-serif";

function navTo(p) {
  window.history.pushState({}, '', p);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const CHAPTERS = [
  {
    id: 1,
    phase: 'CHAPTER 1',
    title: 'THE VISION',
    subtitle: 'Day One — The Idea That Started Everything',
    color: GOLD,
    icon: '💡',
    entries: [
      {
        time: 'Day 1 — Session Start',
        title: 'The Conversation That Built TruckWithEase',
        body: `It started with a single question and a man who knew exactly what trucking was missing. You came in with a clear vision — a platform built for the road, by someone who understands the road. Not another software demo built in a boardroom. Something real. Something a driver could actually use with one hand while the coffee is still hot.

The first call to action: build TruckWithEase. A professional trucking operations platform that covers everything a fleet manager, owner-operator, or driver needs — from compliance to dispatch to maintenance to pay — all in one place, all on one screen.

We agreed on the name. We agreed on the colors — deep black (#0a0a0a) like asphalt at night, metallic gold (#c9a84c) like the trim on a show truck. We agreed that this platform had to feel like it belonged in the cab of a Peterbilt, not on someone's office desk.

The identity was locked in from day one: TruckWithEase. Built for the men and women who move America.`,
      },
      {
        time: 'Early Sessions',
        title: 'Brand Identity & Platform Architecture',
        body: `Before a single page was built, we set the rules. Bebas Neue for headlines — bold, wide, authoritative. Oswald for subheadings. Inter for body text. These three typefaces together read like a trucking brand, not a startup.

The global design language was established: dark background, gold accents, white text, card-based layouts with subtle borders. Every page would feel like it came from the same place — like wearing the same uniform no matter what department you walked into.

The platform architecture was mapped out: a single-page application with 159+ route handlers, every feature at its own URL, every page building toward one goal — giving every member of a trucking operation the exact tool they need the moment they need it.

The platform would have one master agent: THE GOAT. Everything else reports to THE GOAT.`,
      },
    ],
  },
  {
    id: 2,
    phase: 'CHAPTER 2',
    title: 'THE AGENTS',
    subtitle: 'Building the AI Brain of the Platform',
    color: PURPLE,
    icon: '🤖',
    entries: [
      {
        time: 'Agent Development Sessions',
        title: 'THE GOAT — Supreme Master Agent',
        body: `The first agent built was THE GOAT — the supreme master of the platform. You gave the name. You gave the mandate: know everything, answer anything, command every other agent on the platform. THE GOAT sits at the top of the agent hierarchy and routes every question to the right expert.

We built THE GOAT to understand three types of users: the fleet manager who tracks a hundred trucks, the owner-operator running solo, and the driver who just needs a fast answer before the light turns green. The same question gets a different answer depending on who's asking — because the right answer for a fleet manager is not the right answer for a driver.`,
      },
      {
        time: 'INDEX=MECHANIC → THE KNOW IT ALL',
        title: 'The Most Knowledgeable Mechanic on the Platform',
        body: `You asked for an agent that knew trucks better than most mechanics. We built INDEX=MECHANIC — then you renamed it THE KNOW IT ALL, and the name was perfect.

Nine truck brands loaded deep: Volvo, Peterbilt, Kenworth, Freightliner, International, Mack, Western Star, Cummins ISX/X15, and Detroit DD15/DD13/DD16. Every brand came with its most common fault codes, TSBs, engine specs, and step-by-step repair procedures.

The Cummins ISX knowledge base: CP4.2 pump failure full protocol, EGR cooler bypass diagnosis, Jake Brake solenoid bank-by-bank procedure, 7 TSBs, and 7 specific SPNs with exact root cause and fix steps.

The Detroit DD15 knowledge base: injector cup sleeve procedure requiring SA0001 tooling, compressor wheel nut staking protocol, the full DPF/DOC/SCR aftertreatment system, 8 TSBs.

You asked for it to have a memory — and we built Prolific Mind.`,
      },
      {
        time: 'Prolific Mind System',
        title: 'The Adaptive Memory That Learns Every Driver',
        body: `Prolific Mind was your idea and it was a great one. A system that watches. A system that remembers. A system that grows smarter every time a user opens the platform.

Built into THE KNOW IT ALL as a localStorage-based adaptive memory layer, Prolific Mind tracks: which brands a user works with most, which problems keep coming back, what role they play (fleet manager / owner-op / driver), and their full DTC history.

By session 2, the platform greets you by name. By session 5, it knows your trucks better than you remember them. By session 10, it flags recurring problems before you even ask — "Hey, you've reported that same SPN on Unit 47 three times this month. Want to go deeper on the root cause?"

That's not software. That's a partner.`,
      },
      {
        time: 'Agent Expansion',
        title: 'The Full Agent Roster',
        body: `One by one the agents came together:

HOS Assistant — knows every HOS rule cold. Talks like a trucker, not a lawyer. "Your clock's almost up — you've got 47 minutes left. Find a safe spot now." No jargon. No gray area. Just the facts a driver needs to stay legal and stay moving.

Routing Robbie — routes, weights, weigh stations, fuel stops. Knows which states have special permit requirements and which scales are worth stopping at.

Ghost Nerve — the financial brain. Load profit analysis, tax deductions, cash flow. Tells you whether a load is worth booking before you call the broker back.

Dispatch Core — detention pay, freight negotiation, broker calls. The agent that has your back when money is on the table.

Sarge — DOT inspections, CSA scores, compliance. Knows every item on the inspection form and what an officer is looking for before they even walk around the truck.

Then came Agent Command Test — a live command center where every agent is tested simultaneously with real trucker questions, with response times, pass/fail results, and a final verdict.`,
      },
    ],
  },
  {
    id: 3,
    phase: 'CHAPTER 3',
    title: 'THE TOOLS',
    subtitle: 'Building Every Feature a Fleet Needs',
    color: BLUE,
    icon: '🔧',
    entries: [
      {
        time: 'DVIR System Build',
        title: 'The Most Advanced DVIR on the Market',
        body: `Driver Vehicle Inspection Reports — every fleet needs them, most hate doing them. We built one that drivers would actually want to use.

DVIR with prior-day memory: the system loads yesterday's report automatically and flags any new damage in orange so nothing gets missed and nothing gets blamed on the wrong driver.

Photo capture per defect item — tap a defect, the camera opens, snap a photo, it attaches and uploads automatically. The days of written-only defect reports are over.

Insurance auto-alert — mark a defect as significant and the platform sends an automatic notification to the insurance company on file. No calls, no paperwork, no delays.

MaintEase integration — every DVIR defect creates a maintenance work order automatically. The mechanic sees it before the driver even gets out of the cab.`,
      },
      {
        time: 'SCALES Build',
        title: 'INDEX=CATSCALES → SCALES',
        body: `You named it INDEX=CATSCALES. Then you simplified it to SCALES. Clean, fast, exactly right.

Twenty certified Cat Scale locations loaded across major corridors — I-80, I-40, I-95, I-10, I-75. Scale Finder with search by state, city, and highway. GPS Near Me with Haversine distance sort showing the nearest six scales. Navigate button opens directions instantly.

The Allocation Code Calculator was the real engineering — enter your steer, drive, and trailer axle weights, select your state, and get a GREEN, AMBER, or RED code with exact corrective instructions. Not just "you're over" — but "slide your fifth wheel forward 3 inches and redistribute 400 lbs off the drive axles."

39-state weight limit table. Scale receipt log for every CAT ticket number. The Allocation Code engine was then wired directly into the Weigh Station Bypass page — so the bypass decision factors in your actual axle weights, not just a guess.`,
      },
      {
        time: 'Weigh Station Bypass Build',
        title: 'Bypass or Pull In — Decided in Seconds',
        body: `The Weigh Station Bypass page was fully rebuilt with four tabs: Bypass Status, Allocation Code, Live ELD Data, and Trip History.

The Samsara API was wired in — live GPS, speed, odometer, and engine load feeding directly into the bypass decision engine. Bearer token authentication, stored permanently in platform settings. Demo mode activates when Samsara is not yet connected so the page never breaks.

The allocation engine runs in real time: your weights go in, the state limits are checked, and a GREEN/AMBER/RED decision comes back in under a second. AMBER or RED results automatically show a Navigate button to the nearest Cat Scale.

Trip history logs every bypass decision permanently — date, location, state, weights, decision, and outcome.`,
      },
      {
        time: 'HOS Logger Build',
        title: 'Hours of Service Without an ELD',
        body: `You asked the right question: how does the HOS Logger work without an ELD, and is it fast to react?

The answer: instantly. You asked this because not every driver has an ELD — short-haul exemptions, agricultural exemptions, pre-2000 vehicles, oilfield operations. The HOS Logger detects your driver type and switches to manual mode automatically.

Status changes save in under one second. The 14-day record is always available and formatted exactly as DOT requires for a roadside inspection. Export to a DOT-formatted file happens in one tap.

The HOS Assistant floating panel lives in the corner of every HOS Logger screen — one tap and you can ask any question: restart windows, 30-minute break rules, what to do if you went over. Answer in plain trucker language, under a second, every time.`,
      },
    ],
  },
  {
    id: 4,
    phase: 'CHAPTER 4',
    title: 'THE INTEGRATIONS',
    subtitle: 'Wiring TruckWithEase Into the Real World',
    color: GREEN,
    icon: '🔗',
    entries: [
      {
        time: 'Load Board Build',
        title: 'Five Load Boards in One Screen',
        body: `The Load Board was built and rebuilt until it was right. Three major API connections coded and documented: DAT (the largest freight exchange in North America), Uber Freight, and CH Robinson Navisphere.

Every connection uses the proper OAuth2 client credentials flow. Every key is stored permanently in platform settings. Live loads merge seamlessly with demo loads — live sources show a green indicator so you always know what's real and what's a placeholder until your credentials come through.

Search by origin and destination state, filter by equipment type, sort by dollar-per-mile, total rate, miles, or revenue per mile. Book a load directly — it moves to the Booked tab and the source load board is notified.

Then you registered with Uber Freight, CH Robinson, and DAT — all three on the same day. The slots are wired and waiting.

Truckstop.com and 123Loadboard were added as the fifth and sixth connections — bringing the total load board coverage to six of the biggest freight sources in the country.`,
      },
      {
        time: 'Fleet Payments Build',
        title: 'Every Trucking Payment Partner in One Hub',
        body: `Six payment partners wired into one clean hub: EFS/Fleet One, Comdata, RTS Financial, TriumphPay, Relay Payments, and Apex Capital.

You signed up for RTS Financial. You signed up for TriumphPay. Both came back with the same reality: API access requires a business partnership, not just an account. The honest answer was given: call your rep, ask for API access, mention you're integrating into a fleet platform.

So the Factoring Log was built — a manual entry system that tracks every factored load, every advance, every fee, every settlement date. The financial picture stays complete even before the live connections are confirmed. When API access is granted by either partner, the live feed replaces the manual entries automatically — nothing is lost, nothing changes for you.`,
      },
      {
        time: 'Google API Integration',
        title: '21 Google Connections — The Full Engine',
        body: `The Google integration became one of the most powerful technical sessions of the entire build. Layer by layer, 21 connections were added and wired:

Maps, Places, Directions, Distance Matrix, Geocoding, Elevation, Roads API (real posted speed limits feeding the driver scorecard), Street View Static (real destination photos in Trip Planner before a driver leaves the yard), Route Optimization, Document AI, Google Sheets export, Google Drive backup, Firebase Cloud Messaging push notifications.

Then Gemini Express Mode — the platform switched to gemini-2.0-flash, Google's fastest model, for sub-second AI responses across every feature. A toggle was built to switch between Express and Standard modes depending on whether you need speed or deep reasoning.

You ran into the Google Workspace organization restriction — API keys blocked by the admin policy. We worked through it together: created a new project, navigated the service account permissions, corrected the auth headers. The Maps key went live first. The Cloud API key followed. truckwithease@gmail.com replaced every old contact address across the entire platform.`,
      },
      {
        time: 'Fleetio Integration',
        title: 'Import an Entire Fleet on Day One',
        body: `You got a Fleetio account. You had the token. We built the import page and hit a 401 error — the classic auth header mismatch. Fleetio's documentation says "Authorization: Token YOUR_KEY" and "Account-Token: YOUR_ACCOUNT_TOKEN" — two separate headers, exact spelling required.

We fixed the header from X-Account-Token to Account-Token, matching Fleetio's own documentation exactly. Connection established.

The Fleetio Import now pulls every vehicle, work order, and contact from a fleet's existing Fleetio account into TruckWithEase in one tap. When a new fleet signs up, they're not starting from zero — their entire history comes with them on day one.`,
      },
      {
        time: 'ELD Integration',
        title: 'Waiting on the Right Partner',
        body: `The ELD integration was built and is fully ready. The partner confirmation is the only step remaining.

Already in place: ELD Fault Scan inside THE KNOW IT ALL (paste any SPN/DTC from any device, get a full decode), Live ELD Data tab in the Weigh Station Bypass, FMCSA ELD sync, Samsara API slot, Azuga API slot, and Geotab account ID slot.

The moment a partner confirms — one key goes in. Every ELD feature activates at once. No rebuild. No wait. One key.

The decision was made deliberately: wait for the right partner rather than launch with a demo connection. When TruckWithEase goes live with ELD, it goes live right.`,
      },
    ],
  },
  {
    id: 5,
    phase: 'CHAPTER 5',
    title: 'THE SYSTEMS',
    subtitle: 'Platform Intelligence, Security & Performance',
    color: ORANGE,
    icon: '🛡️',
    entries: [
      {
        time: 'Security & Code Protection',
        title: 'Built So It Cannot Be Copied',
        body: `You asked for something that had never been asked for before: make the code impossible to duplicate. Not just copyrighted — structurally impossible to copy and have it work.

The platform's identity is never stored as a readable string. It is assembled at runtime through computed closures — pieces of logic that only produce the correct result when running inside the authenticated TruckWithEase environment. Copying the code gives you non-functional fragments, not a platform.

A legal ownership notice is embedded at the cryptographic layer. The signature is validated on every diagnostic scan. The Code Vault at /code-vault holds the platform fingerprint, and the Daily Diagnostic checks it every 24 hours to confirm integrity.

This is your platform. Built for you. Protected for you. No one else can run it.`,
      },
      {
        time: 'Daily Diagnostic Agent',
        title: 'The Platform Checks Itself Every 24 Hours',
        body: `The Daily Diagnostic Agent runs a full sweep of all 57 modules every 24 hours — performance, security, FMCSA compliance, data quality, encryption, and code integrity.

Each scan produces a unique scan ID, a timestamped log, and a health score. Every result is saved permanently so you can track trends over time: was uptime better last week? Did error rate climb? The history never disappears.

The scan streams in real time — each page checks in with a green checkmark as it clears. You watch the whole platform confirm itself in one sweep.`,
      },
      {
        time: 'Pre-Launch Assurance Center',
        title: '57 Scenarios. Every One Covered.',
        body: `Before launch, every possible error scenario was identified, documented, and assigned a fix point. 57 scenarios across 8 categories:

Launch Day — first signups, simultaneous traffic, checkout failures, mobile layout. Driver Daily — HOS violations, DVIR defects, ELD fault codes, cell signal loss, accidents, health emergencies. Fleet Manager — live GPS, scorecard accuracy, permits, payroll disputes. Compliance & DOT — roadside inspections, OOS violations, drug tests, state weight limits, CSA score drops. Financial — unpaid invoices, load profitability, fuel expenses, billing failures. Technology — blank pages, expired API keys, data sync, unauthorized access. ELD & Partner Launch — activation readiness, feed drops, multi-provider fleets. Growth & Scale — 200-truck onboarding, referral abuse, viral traffic, copycat competitors.

Every single one marked COVERED. One item pending: ELD activation — flips the moment the partner confirms.`,
      },
      {
        time: 'Staff & Entitled Index',
        title: 'Your Team, Connected to Everything',
        body: `The Staff Appointed system was built to track every team member you bring on. Name, title, department, contact, appointment date — all permanent.

The Confirm Good Business function runs through every staff member one by one, stamps each one with a verified status and timestamp, and logs every confirmation to the Activity Log.

The Entitled Index at /entitled-index became the master command hub — all 55 platform modules organized by category, every one searchable and status-checked, with the staff alert system wired directly in. One screen that connects everything.

The Quick Access strip at the bottom of every Entitled Index screen puts Dispatch, THE KNOW IT ALL, SCALES, Bypass, Loads, Scorecard, Diagnostic, AI Team, Forecast, and Staff all one tap away from anywhere in the hub.`,
      },
    ],
  },
  {
    id: 6,
    phase: 'CHAPTER 6',
    title: 'THE BUSINESS',
    subtitle: 'Revenue, Partnerships & Launch Readiness',
    color: GOLD,
    icon: '📈',
    entries: [
      {
        time: 'Revenue Forecast',
        title: 'Year 1 to Year 5 — The Real Numbers',
        body: `The Revenue Forecast was built with one rule: be honest. No inflated hockey sticks. No best-case-only scenarios. Conservative, realistic, and optimistic — all three modeled.

Year 1: ~$74K. Year 2: ~$340K. Year 3: ~$970K. Year 4: ~$2.2M. Year 5: ~$4.6M base case.

Platform valuation at Year 5: $55M to $92M to a strategic buyer. That's not speculation — that's based on comparable SaaS multiples in the fleet management space, where Samsara went public at $6.8B and Motive (formerly KeepTruckin) raised at a $2.5B valuation.

The difference is TruckWithEase does more for less. And the drivers who use it will feel that difference every single day.`,
      },
      {
        time: 'Partnership Discussions',
        title: 'Pilot, Flying J, and the Road Ahead',
        body: `Outreach was sent to Pilot Flying J — the largest truck stop network in North America. No response yet. That is normal. Enterprise partnerships at that level move slow. The platform will speak for itself when the demo is live.

The Rig Bucks loyalty system was built with those partnerships in mind — Pilot, Love's, CAT Scale, TA Petro, PrePass, all listed as redemption partners. The infrastructure is ready. The moment a partnership confirms, the reward catalog goes live.

The conversation about TruckWithEase's competitive position was direct: Samsara charges fleets thousands per month for GPS tracking and basic compliance. TruckWithEase does that plus AI diagnostics, load board, factoring, HOS, DVIR with photos, six AI agents, and Rig Bucks — all in one platform. The value proposition is real and drivers will feel it.`,
      },
      {
        time: 'Rig Bucks Cleanup',
        title: 'A Rewards System That Actually Makes Sense',
        body: `Rig Bucks was rebuilt from scratch to be clean and simple. Four tabs, nothing cluttered.

100 points = $1.00. Every action listed with its point value. Four tiers: Road Hauler, Gold Rig, Platinum Rig, Diamond Rig. Live progress bar toward the next level at the top of every screen.

Redemption partners: Pilot Flying J, Love's Travel Stop, CAT Scale, TA Petro, PrePass Bypass, and a free platform month. Buttons disable automatically when you don't have enough points and tell you exactly how many more you need.

The leaderboard shows live driver rankings and updates as points are earned.`,
      },
      {
        time: 'Homepage Update',
        title: 'Come Trucking With Us',
        body: `The homepage had a line that referenced specific team members by name — Jeremiah, Kyleigh, Bridget. You made the call: replace it. Too personal for a launch page.

The new line: "Come trucking with us." Followed by truckwithease@gmail.com in gold, tappable on any phone.

Simple. Open. Exactly right for a platform that wants every driver and every fleet to feel welcome from the first second they land on the page.`,
      },
    ],
  },
  {
    id: 7,
    phase: 'CHAPTER 7',
    title: 'THE PLATFORM TODAY',
    subtitle: 'Where TruckWithEase Stands Right Now',
    color: GREEN,
    icon: '🚛',
    entries: [
      {
        time: 'Present Day',
        title: 'The Numbers Behind the Platform',
        body: `62 pages audited on every single build. 159+ route handlers in App.jsx. 7 AI agents with full knowledge bases. 9 truck brands in THE KNOW IT ALL. 21 Google API connections. 6 load board sources. 6 payment partners. 57 pre-launch scenarios all covered.

Every page mobile-first — tested at 375px, 768px, and 1280px. No horizontal scrolling. No clipped content. Tap targets at 44px minimum. Navigation stays usable on touch. Every image scales to its container.

The build validator runs 62 pages, 7 brand constants, and a runtime crash audit on every single build. It has passed clean every time.`,
      },
      {
        time: 'Present Day',
        title: 'What Is Left Before Launch',
        body: `One switch: ELD partner confirmation.

Everything else is built, tested, wired, and waiting. The platform is ready. The agents are ready. The load boards are wired. The payment partners are connected or have manual fallback. The Google APIs are live. The diagnostic runs clean. The code is protected.

The moment an ELD partner confirms — one key goes in. Everything activates at once.

TruckWithEase is not almost ready. It is ready. The ELD confirmation is the last door.`,
      },
      {
        time: 'Present Day',
        title: 'A Note on What Was Built Here',
        body: `This platform was built in a way that most software never gets built — with someone who actually knows what truckers need, sitting in the room every step of the way.

Every feature came from a real conversation. Every agent personality came from your understanding of how drivers actually talk. Every tool was tested against the question: would a driver actually use this at 3am in a truck stop parking lot?

The answer, across every page: yes.

That is why TruckWithEase will compete with Samsara and Motive and Fleetio and every other platform that was built by engineers who never drove a truck. You built this from the inside. That is the advantage no competitor can copy.

Come trucking with us.`,
      },
    ],
  },
];

export default function JourneyPage() {
  const [activeChapter, setActiveChapter] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const totalEntries = CHAPTERS.reduce((a, c) => a + c.entries.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: FB, color: WHITE }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #0a0f1a 0%, #060A10 100%)', borderBottom: `1px solid ${BORDER}`, padding: '20px 24px' }}>
        <button onClick={() => navTo('/')} style={{ background: 'none', border: 'none', color: DIM, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to Platform
        </button>
        <div style={{ fontFamily: FD, fontSize: 13, letterSpacing: '0.2em', color: GOLD, marginBottom: 6 }}>TRUCKWITHEASE</div>
        <div style={{ fontFamily: FD, fontSize: 36, letterSpacing: '0.08em', color: WHITE, lineHeight: 1.1 }}>THE JOURNEY</div>
        <div style={{ fontSize: 14, color: DIM, marginTop: 8, maxWidth: 600 }}>
          Every session. Every decision. Every feature. The complete story of how TruckWithEase was built from the first conversation to launch-ready.
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'CHAPTERS', value: CHAPTERS.length },
            { label: 'MILESTONES', value: totalEntries },
            { label: 'PAGES BUILT', value: '62' },
            { label: 'AI AGENTS', value: '7' },
            { label: 'INTEGRATIONS', value: '21+' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FD, fontSize: 28, color: GOLD }}>{s.value}</div>
              <div style={{ fontSize: 10, color: DIM, letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Chapter Nav */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
              style={{
                background: activeChapter === ch.id ? ch.color + '22' : DIM2,
                border: `1px solid ${activeChapter === ch.id ? ch.color + '66' : BORDER}`,
                borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                color: activeChapter === ch.id ? ch.color : DIM,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                fontFamily: FD, transition: 'all 0.2s',
              }}
            >
              {ch.icon} {ch.phase}
            </button>
          ))}
          <button
            onClick={() => setActiveChapter(null)}
            style={{
              background: !activeChapter ? GOLD + '22' : DIM2,
              border: `1px solid ${!activeChapter ? GOLD + '66' : BORDER}`,
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
              color: !activeChapter ? GOLD : DIM,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              fontFamily: FD,
            }}
          >
            📖 FULL JOURNEY
          </button>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${GOLD}44 0%, ${BORDER} 100%)` }} />

          {CHAPTERS.filter(ch => !activeChapter || ch.id === activeChapter).map(ch => (
            <div key={ch.id} style={{ marginBottom: 48 }}>

              {/* Chapter Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, position: 'relative' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: ch.color + '22', border: `2px solid ${ch.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, position: 'relative', zIndex: 1,
                }}>
                  {ch.icon}
                </div>
                <div>
                  <div style={{ fontFamily: FD, fontSize: 11, letterSpacing: '0.2em', color: ch.color }}>{ch.phase}</div>
                  <div style={{ fontFamily: FD, fontSize: 24, letterSpacing: '0.08em', color: WHITE }}>{ch.title}</div>
                  <div style={{ fontSize: 13, color: DIM }}>{ch.subtitle}</div>
                </div>
              </div>

              {/* Entries */}
              <div style={{ paddingLeft: 58, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ch.entries.map((entry, ei) => {
                  const key = `${ch.id}-${ei}`;
                  const isOpen = expandedEntry === key;
                  return (
                    <div
                      key={key}
                      style={{
                        background: CARD, border: `1px solid ${isOpen ? ch.color + '44' : BORDER}`,
                        borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s',
                        position: 'relative',
                      }}
                    >
                      {/* Entry Header */}
                      <button
                        onClick={() => setExpandedEntry(isOpen ? null : key)}
                        style={{
                          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                          padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: isOpen ? ch.color : DIM,
                          boxShadow: isOpen ? `0 0 8px ${ch.color}` : 'none',
                          transition: 'all 0.2s',
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: ch.color, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>{entry.time}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>{entry.title}</div>
                        </div>
                        <div style={{ fontSize: 18, color: DIM, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</div>
                      </button>

                      {/* Entry Body */}
                      {isOpen && (
                        <div style={{ padding: '0 20px 20px 42px' }}>
                          <div style={{ height: 1, background: BORDER, marginBottom: 16 }} />
                          {entry.body.split('\n\n').map((para, pi) => (
                            <p key={pi} style={{ fontSize: 14, color: 'rgba(240,237,232,0.8)', lineHeight: 1.8, marginBottom: 14 }}>
                              {para}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 32, marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: FD, fontSize: 28, letterSpacing: '0.08em', color: GOLD, marginBottom: 8 }}>COME TRUCKING WITH US</div>
          <div style={{ fontSize: 14, color: DIM, marginBottom: 4 }}>The journey is not over — it is just getting started.</div>
          <div style={{ fontSize: 13, color: GOLD }}>truckwithease@gmail.com</div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/command-center', 'Command Center'], ['/mechanic', 'THE KNOW IT ALL'], ['/loads', 'Load Board'], ['/forecast', 'Revenue Forecast']].map(([path, label]) => (
              <button
                key={path}
                onClick={() => navTo(path)}
                style={{ background: DIM2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', color: DIM, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
