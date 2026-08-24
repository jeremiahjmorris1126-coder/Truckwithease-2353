import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.08 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── Checklist data ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "regulatory",
    title: "Regulatory & Legal",
    icon: "⚖️",
    color: RED,
    priority: "CRITICAL — Do First",
    items: [
      {
        id: "fmcsa_reg",
        label: "FMCSA Business Registration (USDOT + MC Number)",
        detail: "Step 1 of 2 for FMCSA. Go to the Unified Registration System (URS) at fmcsa.dot.gov/registration. You'll register for a USDOT Number and, if operating as a for-hire carrier or broker, an MC (Motor Carrier) Number. As an ELD software provider you need the USDOT at minimum. Have ready: business legal name, EIN/Tax ID, business address, contact info, and nature of business (select 'Technology Provider' or 'ELD Provider'). The online form takes 20–30 minutes. Your USDOT number is issued instantly online.",
        link: "https://portal.fmcsa.dot.gov/URS/",
        linkLabel: "FMCSA Unified Registration System →",
        urgent: true,
        dueWeek: "Do this week",
        steps: [
          "Go to portal.fmcsa.dot.gov/URS",
          "Select 'Register a new entity'",
          "Choose entity type: Company/Corporation",
          "Enter your EIN, business legal name, and address",
          "Select your operation type — Technology / ELD Provider",
          "Complete and submit — USDOT number issued instantly",
          "Save your USDOT number — you need it for Step 2",
        ],
      },
      {
        id: "eld_cert",
        label: "FMCSA ELD Self-Certification & Device Registration",
        detail: "Step 2 of 2 — this is the one that officially puts TruckWithEase on the federal ELD registry so drivers using your app are legally compliant. Go to the FMCSA ELD registration portal. You'll need: your USDOT number (from Step 1), your ELD make/model name ('TruckWithEase'), a unique ELD identifier, your technical specification document (already prepared — the PDF on your site), and a statement of certification. Once submitted, your device appears on the public FMCSA ELD list within 1–3 business days. Drivers can then use your app for FMCSA-required ELD compliance.",
        link: "https://eld.fmcsa.dot.gov/",
        linkLabel: "FMCSA ELD Registration Portal →",
        urgent: true,
        dueWeek: "Immediately after Step 1",
        steps: [
          "Complete FMCSA Business Registration first (item above)",
          "Go to eld.fmcsa.dot.gov",
          "Click 'Register an ELD'",
          "Enter your USDOT number",
          "ELD Make: TruckWithEase",
          "Upload or link your technical specification document",
          "Certify that your ELD meets 49 CFR Part 395, Subpart B",
          "Submit — approval appears on public registry within 1–3 days",
          "Screenshot and save your registry confirmation",
        ],
      },
      {
        id: "business_entity",
        label: "Business Entity (LLC or Corp) Registered",
        detail: "Must be fully registered in your state before you can open a business bank account, accept payments, or sign partner agreements. If not done — do it this week.",
        urgent: true,
        dueWeek: "Week 1",
      },
      {
        id: "tos",
        label: "Terms of Service — Legal Review",
        detail: "Not a template — have an attorney review your ToS. Liability for ELD data, HOS logging accuracy, and dispatch tools needs specific language. Budget $500–2,000 for a trucking-aware attorney.",
        urgent: true,
        dueWeek: "Week 2–3",
      },
      {
        id: "privacy",
        label: "Privacy Policy — Live URL",
        detail: "Required by Apple App Store and Google Play before they will publish your app. Must cover CCPA (California users), location data, and driver financial data collected by Traxes. Needs its own live URL — e.g. truckwithease.app/privacy.",
        urgent: true,
        dueWeek: "Week 2",
      },
      {
        id: "ccpa",
        label: "CCPA Compliance (California Drivers)",
        detail: "California Consumer Privacy Act applies to any app with California users — and CA has the highest density of owner-operators in the US. Must disclose what data Traxes collects and give users opt-out rights.",
        dueWeek: "Week 3",
      },
      {
        id: "insurance",
        label: "Business & Tech Liability Insurance",
        detail: "General liability + tech E&O (Errors & Omissions) insurance. If an ELD logging error contributes to a compliance violation, you need coverage. Embroker and Hiscox offer tech startup policies starting ~$100/mo.",
        dueWeek: "Week 3–4",
      },
    ],
  },
  {
    id: "financial",
    title: "Financial & Payments",
    icon: "💳",
    color: AMBER,
    priority: "HIGH — Blocks Launch",
    items: [
      {
        id: "stripe",
        label: "Stripe Payment Account — Business Name",
        detail: "Set up Stripe under your registered business entity. Stripe Atlas can help if you need a US entity fast. Test payments end-to-end before launch — failed checkouts on day 1 kill conversions.",
        link: "https://stripe.com",
        linkLabel: "Stripe.com",
        urgent: true,
        dueWeek: "Week 2",
      },
      {
        id: "bank",
        label: "Business Bank Account",
        detail: "Required before Stripe will pay out. Mercury (mercury.com) is popular for startups — no minimums, free wires, opens in 24–48 hours. Relay is another good option.",
        dueWeek: "Week 1–2",
      },
      {
        id: "fuel_card_deal",
        label: "Fuel Card Partnership Agreement Signed",
        detail: "The $100 fuel card perk in your Pro plan needs a real agreement in place before you can offer it. WEX, Comdata, and EFS are the major trucking fuel card issuers. Contact their partner/fleet programs team. Give yourself 6–8 weeks for contract negotiation.",
        urgent: true,
        dueWeek: "Week 2 (start now — long lead time)",
      },
      {
        id: "factoring_deal",
        label: "Factoring Partner Agreement",
        detail: "If you're advertising factoring integration, you need a signed referral or API agreement with at least one factoring partner (Triumph, OTR Capital, RTS Financial, Apex Capital). 4–6 week lead time typical.",
        dueWeek: "Week 3–4",
      },
      {
        id: "accounting",
        label: "Accounting Software Connected",
        detail: "QuickBooks or Wave for the business itself. Separate from Traxes (which tracks driver finances) — you need your own books clean from day one for tax purposes and investor readiness.",
        dueWeek: "Week 4",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & App Stores",
    icon: "📱",
    color: "#60A5FA",
    priority: "HIGH — Long Lead Times",
    items: [
      {
        id: "apple_dev",
        label: "Apple Developer Account ($99/yr)",
        detail: "✅ You have this — great. Make sure your bundle ID is registered and your app is created inside App Store Connect so you're ready for TestFlight beta and final submission.",
        link: "https://appstoreconnect.apple.com",
        linkLabel: "App Store Connect",
        urgent: false,
        dueWeek: "Done ✓",
        done: true,
      },
      {
        id: "google_dev",
        label: "Google Play Developer Account ($25 one-time)",
        detail: "✅ You have this — great. Open your Play Console, create a new app, and you're ready to start uploading your first release for internal testing.",
        link: "https://play.google.com/console",
        linkLabel: "Google Play Console →",
        urgent: false,
        dueWeek: "Done ✓",
        done: true,
      },
      {
        id: "privacy_url",
        label: "Privacy Policy Live at Public URL",
        detail: "✅ Your Privacy Policy is now live at truckwithease.com/privacy — covers CCPA, location data, ELD data retention, FMCSA compliance, and all required disclosures. Use this URL in both app store submission forms.",
        link: "/privacy",
        linkLabel: "View Privacy Policy →",
        urgent: false,
        dueWeek: "Done ✓",
        done: true,
      },
      {
        id: "app_store_assets",
        label: "App Store Listing — Screenshots & Copy",
        detail: "Apple requires: icon (1024×1024), 3–10 screenshots per device size (iPhone, iPad), app description, keywords, support URL. Google Play similar. Your store screenshots are already produced — great head start.",
        dueWeek: "Week 6–8",
      },
      {
        id: "crash_monitoring",
        label: "Crash Reporting & Uptime Monitoring",
        detail: "Sentry.io for crash reporting (free tier available). Better Uptime or UptimeRobot for server monitoring. Non-negotiable before public launch — you need to know about outages before drivers do.",
        dueWeek: "Week 4–6",
      },
      {
        id: "beta_testing",
        label: "TestFlight Beta (iOS) + Google Play Beta",
        detail: "Run a 2–4 week closed beta with 10–20 real drivers before public launch. TestFlight allows up to 10,000 external testers. This catches real-world issues your team won't think to test.",
        dueWeek: "Week 8–10 (run through Week 12)",
      },
      {
        id: "support_system",
        label: "Driver Support System Live",
        detail: "At minimum: truckwithease@gmail.com routed to a ticketing system (Freshdesk free tier or Zendesk). A driver hitting an ELD issue at 2am on I-40 needs to know someone is listening. Add a support chat widget if possible.",
        dueWeek: "Week 4",
      },
    ],
  },
  {
    id: "partnerships",
    title: "Partnerships & Outreach",
    icon: "🤝",
    color: GREEN,
    priority: "HIGH — Start Immediately",
    items: [
      {
        id: "ooida",
        label: "OOIDA Partnership Outreach — Start NOW",
        detail: "Owner-Operator Independent Drivers Association — 150K+ members. An endorsed vendor badge = more credibility than $100K in ads. Their vendor program contact is at ooida.com/our-programs. Use Road Agent on this site to draft your outreach letter.",
        link: "https://www.ooida.com",
        linkLabel: "OOIDA.com",
        urgent: true,
        dueWeek: "Week 1 — Send this week",
      },
      {
        id: "pilot_loves",
        label: "Pilot Flying J / Love's Rig Bucks Conversation",
        detail: "Start the conversation early — these deals take 90–180 days to close. Contact Pilot's fleet partnerships team and Love's commercial partnerships. The Rig Bucks integration is your hook: drivers earn points redeemable at their locations.",
        dueWeek: "Week 2–3 (start conversation now)",
      },
      {
        id: "cdl_schools",
        label: "CDL School Partnerships — 5 Target Schools",
        detail: "New CDL graduates need ELD compliance from day one. A TruckWithEase bundle in their orientation packet = lifetime customers. Target: Roadmaster Drivers School, CR England CDL Training, Swift Driving Academy, Prime Inc. Truck Driving School, Werner Transportation.",
        dueWeek: "Week 4–6",
      },
      {
        id: "factoring_outreach",
        label: "Factoring Company Co-Marketing Talks",
        detail: "Triumph Business Capital, OTR Capital, RTS Financial, Apex Capital Corp. Pitch: Traxes shows drivers their real cash flow, making them better factoring clients. Co-marketing opportunity — their customers need your platform.",
        dueWeek: "Week 3–5",
      },
      {
        id: "beta_drivers",
        label: "Recruit 10–20 Beta Drivers",
        detail: "Real drivers, real loads, real feedback. Post in r/Truckers and r/AskTruckers: 'Looking for owner-operators to beta test a new ELD app — free for 60 days, your feedback shapes the product.' Offer a lifetime discount or charter member status.",
        urgent: true,
        dueWeek: "Week 2–3",
      },
      {
        id: "youtube_collab",
        label: "YouTube Creator Collaboration — 1 Confirmed",
        detail: "One authentic trucking creator demo beats all paid ads combined at launch. Target: Trucking with Alex, Life of a Trucker, Road Dog Trucking. Offer a free Pro account + revenue share or flat fee. Aim for filming in Week 10 for a launch-week publish.",
        dueWeek: "Week 4–6 (reach out now)",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Pre-Launch",
    icon: "📣",
    color: ORANGE,
    priority: "MEDIUM — Build in Parallel",
    items: [
      {
        id: "email_capture",
        label: "Email List — Pre-Launch Waitlist",
        detail: "Your contact form is live — good. Add a dedicated 'Get Early Access' email capture on the homepage with a simple hook: 'Be first when TruckWithEase launches. 14-day free trial starts the day we go live.' Target: 200+ emails before launch day.",
        dueWeek: "Week 2",
      },
      {
        id: "social_accounts",
        label: "Social Accounts Set Up & Branded",
        detail: "Secure @TruckWithEase on: TikTok, Instagram, Facebook (Page + Group), YouTube, LinkedIn. Even if you don't post yet — claim the handles now before someone else does.",
        dueWeek: "Week 1",
      },
      {
        id: "facebook_groups",
        label: "Facebook Group Content Plan — 3 Posts/Week",
        detail: "Value-first content in r/Truckers, state trucker groups, OOIDA Facebook. Start 6–8 weeks before launch so you have credibility when you announce. Topics: HOS tips, state DOT updates, fuel saving hacks. Never mention the product for the first 4 weeks.",
        dueWeek: "Week 3 (start posting)",
      },
      {
        id: "app_store_listing",
        label: "App Store Listing Copy & Screenshots Finalized",
        detail: "Write your App Store title, subtitle, description, and keywords. Title suggestion: 'TruckWithEase — ELD & HOS Logger'. Primary keyword: 'eld app'. Your store screenshots are already produced — write the copy to match.",
        dueWeek: "Week 6–8",
      },
      {
        id: "press_release",
        label: "Press Release — Trucking Trade Media",
        detail: "Send to: Overdrive Magazine (overdriveonline.com), Land Line Magazine (OOIDA's publication), TruckingInfo.com, Commercial Carrier Journal. Time it for launch week. Angle: 'First all-in-one ELD + financial AI platform built for owner-operators, not fleet offices.'",
        dueWeek: "Week 10–11 (write Week 8)",
      },
      {
        id: "launch_email",
        label: "Launch Email Sequence Written",
        detail: "5-email sequence ready to send to your waitlist on launch day: (1) We're live, (2) Here's what Traxes found for drivers like you, (3) Rig Bucks — your first 50 pts are waiting, (4) Week 1 compliance tip, (5) Trial ending — here's what you keep.",
        dueWeek: "Week 8–9",
      },
      {
        id: "testimonials",
        label: "3 Driver Testimonials — Video or Written",
        detail: "From your beta drivers. Even a 60-second iPhone video of a real driver saying what changed for them is worth more than any professionally produced ad. Get these during beta (Week 10–12) and have them ready for launch.",
        dueWeek: "Week 11–12",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations & Support",
    icon: "⚙️",
    color: "#8B5CF6",
    priority: "MEDIUM — Before Launch",
    items: [
      {
        id: "support_email",
        label: "Support Email + Ticketing System",
        detail: "truckwithease@gmail.com or truckwithease@gmail.com routed through Freshdesk (free for up to 10 agents) or Zendesk. Drivers need to know someone is on the other end — especially during trial.",
        dueWeek: "Week 3",
      },
      {
        id: "onboarding_flow",
        label: "Driver Onboarding Flow — In-App",
        detail: "A driver who gets stuck in the first 5 minutes churns and never comes back. Map your onboarding: account creation → first DVIR → HOS setup → Traxes connection. Each step should take under 2 minutes.",
        dueWeek: "Week 6–8",
      },
      {
        id: "faq",
        label: "FAQ / Help Center Live",
        detail: "15–20 articles covering: How to set up HOS logging, How to complete a DVIR, What is Traxes and how does it work, How do Rig Bucks work, How to cancel. Intercom or Freshdesk both let you publish a public help center free.",
        dueWeek: "Week 6–8",
      },
      {
        id: "refund_policy",
        label: "Refund Policy Written and Published",
        detail: "Required for app store compliance. Keep it fair and clear: 14-day trial means no charge until day 15, pro-rated refunds within first 30 days of a paid month. Drivers trust platforms that stand behind their product.",
        dueWeek: "Week 3",
      },
    ],
  },
];

const OOIDA_LETTER = `Subject: Partnership Inquiry — TruckWithEase ELD & Financial Platform for Owner-Operators

Dear OOIDA Partnership Team,

My name is [Your Name], and I'm the founder of TruckWithEase — a new all-in-one platform built specifically for owner-operators and small fleets.

I'm reaching out because OOIDA represents exactly who we built this for: independent drivers who are tired of enterprise ELD tools designed for fleet offices, not the people behind the wheel.

TruckWithEase combines FMCSA-compliant HOS/ELD logging, a State DOT AI Watcher (all 50 states), pre-trip DVIR, live fuel finder, load board, and — uniquely — Traxes, an AI financial co-pilot that tracks mileage, logs expenses, and prepares year-end tax packages automatically.

All at $19.99/mo for owner-operators. No contracts. Cancel anytime.

We're preparing to launch September 1, 2026, and we believe an OOIDA vendor partnership would be meaningful for your members — and a genuine endorsement we'd be proud to carry.

I'd welcome a 20-minute call to share the product and explore what a member-benefit relationship could look like.

You can see the platform at: [your site URL]

Thank you for everything OOIDA does for America's independent drivers.

[Your Name]
Founder, TruckWithEase
[Phone]
[Email]`;

const PILOT_LETTER = `Subject: Rig Bucks Partnership Opportunity — TruckWithEase

Dear Pilot Flying J Partnerships Team,

I'm reaching out about a partnership opportunity that directly benefits your truck stop loyalty customers.

TruckWithEase is launching September 1, 2026 — an all-in-one platform for owner-operators combining ELD compliance, financial tools, and a rewards program called Rig Bucks.

Rig Bucks are earned by drivers for safe, compliant behavior: completing vehicle inspections, running clean HOS logs, zero-violation days. They're redeemable at partner locations — and Pilot Flying J is exactly the kind of household name we want at the top of that list.

The opportunity: drivers who earn Rig Bucks and see "Pilot Flying J Gift Card — 2,500 pts" as a redemption option will actively choose your locations over competitors. It's a loyalty amplifier built directly into the app they're using every day on the road.

I'd love to set up a 30-minute call with your fleet partnerships team to explore what a formal Rig Bucks integration could look like.

[Your Name]
Founder, TruckWithEase
[Phone] | [Email] | [Website]`;

export default function LaunchChecklistPage() {
  const STORAGE_KEY = "twe_launch_checklist_v1";
  const [checked, setChecked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      // Pre-check confirmed items
      if (!("apple_dev" in saved)) saved.apple_dev = true;
      if (!("google_dev" in saved)) saved.google_dev = true;
      if (!("privacy_url" in saved)) saved.privacy_url = true;
      return saved;
    } catch { return { apple_dev: true, google_dev: true, privacy_url: true }; }
  });
  const [activeSection, setActiveSection] = useState(null);
  const [showLetter, setShowLetter] = useState(null);

  function toggle(id) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const totalItems = SECTIONS.reduce((a, s) => a + s.items.length, 0);
  const doneItems  = SECTIONS.reduce((a, s) => a + s.items.filter(i => checked[i.id]).length, 0);
  const pct = Math.round((doneItems / totalItems) * 100);

  // Days until Sept 1 2026
  const target = new Date("2026-09-01");
  const today  = new Date();
  const daysLeft = Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.floor(daysLeft / 7);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F0F4FA; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .lc-item { transition: background 0.18s; }
        .lc-item:hover { background: #EFF6FF !important; }
        .lc-check { transition: all 0.18s; cursor: pointer; }
        .lc-check:hover { border-color: ${NAVY} !important; }
        .lc-section { transition: box-shadow 0.2s; }
        .lc-section:hover { box-shadow: 0 6px 24px rgba(11,42,107,0.08); }
        .lc-letter-btn { transition: all 0.2s; }
        .lc-letter-btn:hover { background: ${NAVY} !important; color: white !important; }
        .lc-nav-link { transition: color 0.2s; }
        .lc-nav-link:hover { color: ${AMBER} !important; }
        @keyframes lcProgress {
          from { width: 0; }
        }
        .lc-bar { animation: lcProgress 1.2s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 767px) {
          .lc-two-col { grid-template-columns: 1fr !important; }
          .lc-header-row { flex-direction: column !important; gap: 16px !important; }
          .lc-nav-links { display: none !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ background: "white", borderBottom: "1px solid #E2E8F0", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: NAVY }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="lc-nav-links" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ background: `${GREEN}15`, color: GREEN, fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 20, border: `1px solid ${GREEN}30` }}>
            🗓️ {daysLeft} days to 9/1/26
          </span>
          <a href="/road-agent" className="lc-nav-link" style={{ color: "#64748B", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>🛣️ Road Agent</a>
          <a href="/#pricing" style={{ background: AMBER, color: "#06090F", padding: "7px 14px", borderRadius: 7, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Free Trial</a>
          <a href="/" style={{ color: "#94A3B8", fontSize: 12, textDecoration: "none", opacity: 0.6 }}>← Back</a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, padding: "48px 5% 44px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,180,0,0.07)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div className="lc-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,180,0,0.12)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
                  <span style={{ color: AMBER, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>September 1, 2026 Launch Target</span>
                </div>
                <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.1, marginBottom: 10 }}>
                  Pre-Launch <span style={{ color: AMBER }}>Checklist</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, maxWidth: 500 }}>
                  Everything you need to launch TruckWithEase on time. Check items off as you go — your progress saves automatically.
                </p>
              </div>
              {/* Progress ring area */}
              <div style={{ display: "flex", gap: 24, flexShrink: 0, flexWrap: "wrap" }}>
                {[
                  { val: daysLeft, unit: "days left", color: daysLeft < 30 ? RED : daysLeft < 60 ? ORANGE : GREEN },
                  { val: weeksLeft, unit: "weeks left", color: AMBER },
                  { val: `${pct}%`, unit: "complete", color: "#60A5FA" },
                ].map(s => (
                  <div key={s.unit} style={{ textAlign: "center", background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 22px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ color: s.color, fontWeight: 900, fontSize: 28, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 4, fontWeight: 500 }}>{s.unit}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Master progress bar */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 }}>Overall progress</span>
                <span style={{ color: AMBER, fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{doneItems} / {totalItems} items</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                <div className="lc-bar" style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${AMBER}, ${ORANGE})`, borderRadius: 4, minWidth: pct > 0 ? 8 : 0 }} />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── LETTER MODAL ─────────────────────────────────────────────────────── */}
      {showLetter && (
        <div onClick={() => setShowLetter(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "5%" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: "32px 36px", maxWidth: 680, width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: NAVY }}>{showLetter === "ooida" ? "OOIDA Partnership Letter" : "Pilot Flying J Outreach"}</h3>
              <button onClick={() => setShowLetter(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8" }}>✕</button>
            </div>
            <pre style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap", background: "#F8FAFC", borderRadius: 10, padding: 20, border: "1px solid #E2E8F0" }}>
              {showLetter === "ooida" ? OOIDA_LETTER : PILOT_LETTER}
            </pre>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { navigator.clipboard?.writeText(showLetter === "ooida" ? OOIDA_LETTER : PILOT_LETTER); }} style={{ background: NAVY, color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                Copy to Clipboard
              </button>
              <button onClick={() => setShowLetter(null)} style={{ background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 5% 80px" }}>

        {/* Quick action letters */}
        <FadeIn>
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", marginBottom: 32, border: "1px solid #E2E8F0", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY, marginBottom: 4 }}>Ready-to-send outreach letters</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>Click to open, fill in your name, and send this week. These two partnerships alone can make your launch.</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              <button onClick={() => setShowLetter("ooida")} className="lc-letter-btn" style={{ background: "#EFF6FF", color: NAVY, border: `1px solid ${NAVY}30`, borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                🏆 OOIDA Letter
              </button>
              <button onClick={() => setShowLetter("pilot")} className="lc-letter-btn" style={{ background: "#FFF7ED", color: ORANGE, border: `1px solid ${ORANGE}30`, borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                ⛽ Pilot Flying J Letter
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Sections */}
        {SECTIONS.map((section, si) => {
          const sectionDone = section.items.filter(i => checked[i.id]).length;
          const sectionPct  = Math.round((sectionDone / section.items.length) * 100);
          return (
            <FadeIn key={section.id} delay={si * 60} style={{ marginBottom: 24 }}>
              <div className="lc-section" style={{ background: "white", borderRadius: 18, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Section header */}
                <div onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  style={{ padding: "20px 28px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", cursor: "pointer" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: `${section.color}15`, border: `1px solid ${section.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{section.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{section.title}</span>
                      <span style={{ background: `${section.color}15`, color: section.color, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>{section.priority}</span>
                    </div>
                    <div style={{ marginTop: 6, height: 4, background: "#F1F5F9", borderRadius: 2, maxWidth: 200 }}>
                      <div style={{ height: "100%", width: `${sectionPct}%`, background: section.color, borderRadius: 2, transition: "width 0.4s", minWidth: sectionPct > 0 ? 4 : 0 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: section.color, fontWeight: 900, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>{sectionDone}/{section.items.length}</div>
                    <div style={{ color: "#94A3B8", fontSize: 11 }}>complete</div>
                  </div>
                </div>
                {/* Items */}
                <div style={{ padding: "8px 0" }}>
                  {section.items.map((item, ii) => (
                    <div key={item.id} className="lc-item"
                      style={{ display: "flex", gap: 16, padding: "14px 28px", alignItems: "flex-start", background: checked[item.id] ? "#F0FDF4" : "transparent", borderBottom: ii < section.items.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      {/* Checkbox */}
                      <div className="lc-check" onClick={() => toggle(item.id)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: checked[item.id] ? `2px solid ${GREEN}` : "2px solid #CBD5E1", background: checked[item.id] ? GREEN : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        {checked[item.id] && <span style={{ color: "white", fontSize: 13, fontWeight: 900 }}>✓</span>}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span onClick={() => toggle(item.id)} style={{ fontWeight: 700, fontSize: 14, color: checked[item.id] ? "#64748B" : "#0F172A", textDecoration: checked[item.id] ? "line-through" : "none", cursor: "pointer" }}>
                            {item.label}
                          </span>
                          {item.urgent && !checked[item.id] && (
                            <span style={{ background: `${RED}12`, color: RED, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${RED}25` }}>Urgent</span>
                          )}
                          <span style={{ color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{item.dueWeek}</span>
                        </div>
                        <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.7 }}>{item.detail}</p>
                        {/* Step-by-step guide */}
                        {item.steps && !checked[item.id] && (
                          <div style={{ marginTop: 14, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "14px 16px" }}>
                            <div style={{ color: GREEN, fontWeight: 800, fontSize: 12, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Step-by-Step</div>
                            {item.steps.map((step, si) => (
                              <div key={si} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: GREEN, color: "white", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                                <span style={{ color: "#166534", fontSize: 13, lineHeight: 1.6 }}>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.link && !checked[item.id] && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, color: NAVY, fontSize: 12, fontWeight: 700, textDecoration: "none", background: "#EFF6FF", padding: "6px 14px", borderRadius: 7, border: "1px solid #BFDBFE" }}>
                            → {item.linkLabel}
                          </a>
                        )}
                        {/* OOIDA quick action */}
                        {item.id === "ooida" && !checked[item.id] && (
                          <button onClick={() => setShowLetter("ooida")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 8, color: ORANGE, fontSize: 12, fontWeight: 700, background: "#FFF7ED", padding: "5px 12px", borderRadius: 7, border: `1px solid ${ORANGE}30`, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                            ✉️ Open OOIDA Letter
                          </button>
                        )}
                        {item.id === "pilot_loves" && !checked[item.id] && (
                          <button onClick={() => setShowLetter("pilot")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 8, color: ORANGE, fontSize: 12, fontWeight: 700, background: "#FFF7ED", padding: "5px 12px", borderRadius: 7, border: `1px solid ${ORANGE}30`, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                            ✉️ Open Pilot Letter
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })}

        {/* Bottom encouragement */}
        <FadeIn delay={200}>
          <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, borderRadius: 18, padding: "32px 36px", textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚛</div>
            <h3 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.3rem,2.5vw,1.8rem)", marginBottom: 12 }}>
              You're building something the industry genuinely needs.<br /><span style={{ color: AMBER }}>September 1st is yours.</span>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.8 }}>
              Every item you check off brings 500,000 owner-operators one step closer to an app that actually works for them.
            </p>
            <a href="/road-agent" style={{ display: "inline-block", background: AMBER, color: "#0F172A", padding: "13px 30px", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
              Ask Road Agent for Strategy Help →
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
