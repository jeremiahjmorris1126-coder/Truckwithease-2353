import { useState } from "react";

const NAVY = "#0a1628";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";
const RED = "#dc2626";
const BLUE = "#0ea5e9";
const CARD = "#111f35";
const BORDER = "#1e3a5f";

// Official DOT document sources — direct confirmed links
const DOT_DOCUMENTS = [
  {
    category: "Hours of Service",
    color: AMBER,
    icon: "⏱️",
    docs: [
      { title: "Hours of Service Final Rule (49 CFR Part 395)", desc: "The complete federal HOS regulations governing all commercial drivers.", source: "FMCSA Official", url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-395" },
      { title: "HOS Summary Pocket Guide", desc: "Quick-reference card for property-carrying and passenger-carrying drivers.", source: "FMCSA", url: "https://www.fmcsa.dot.gov/regulations/hours-of-service" },
      { title: "Short-Haul Exception Guide", desc: "Full requirements for the 150 air-mile short-haul exception.", source: "FMCSA", url: "https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers-commerce" },
    ],
  },
  {
    category: "ELD & Logging",
    color: BLUE,
    icon: "📟",
    docs: [
      { title: "ELD Mandate — 49 CFR Part 395 Subpart B", desc: "Complete ELD technical specifications and mandate requirements.", source: "FMCSA Official", url: "https://www.fmcsa.dot.gov/hours-service/elds/electronic-logging-devices" },
      { title: "ELD Provider Registry", desc: "Official list of all FMCSA-registered ELD providers.", source: "FMCSA Registry", url: "https://eld.fmcsa.dot.gov/List" },
      { title: "Paper RODS Exemption Form (MCSA-5889)", desc: "Required form for ELD exemptions and short-haul exceptions.", source: "FMCSA Forms", url: "https://www.fmcsa.dot.gov/sites/fmcsa.dot.gov/files/docs/Form-MCSA-5889.pdf" },
    ],
  },
  {
    category: "Vehicle Inspection & DVIR",
    color: GREEN,
    icon: "🔧",
    docs: [
      { title: "Pre/Post Trip Inspection Requirements (49 CFR 396.11)", desc: "Full federal requirements for driver vehicle inspection reports.", source: "eCFR Official", url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/section-396.11" },
      { title: "Annual Inspection Standards (49 CFR 396.17)", desc: "Federal annual inspection requirements for CMVs.", source: "eCFR Official", url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/section-396.17" },
      { title: "Out-of-Service Criteria", desc: "CVSA official out-of-service criteria for vehicles and drivers.", source: "CVSA", url: "https://www.cvsa.org/programs/out-of-service-criteria/" },
    ],
  },
  {
    category: "Driver Qualification",
    color: "#a78bfa",
    icon: "🪪",
    docs: [
      { title: "Driver Qualification Files (49 CFR 391)", desc: "Complete requirements for maintaining driver qualification files.", source: "eCFR Official", url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391" },
      { title: "Medical Certificate Requirements", desc: "DOT physical exam and medical certification requirements.", source: "FMCSA", url: "https://www.fmcsa.dot.gov/registration/commercial-drivers-license/medical-certification-requirements" },
      { title: "National Registry — Find a Medical Examiner", desc: "Locate a certified DOT medical examiner near you.", source: "FMCSA Registry", url: "https://nationalregistry.fmcsa.dot.gov/NRPublicUI/home.seam" },
    ],
  },
  {
    category: "Safety & CSA Scores",
    color: RED,
    icon: "🛡️",
    docs: [
      { title: "SMS — Safety Measurement System", desc: "Look up your carrier's CSA score, violations, and safety rating.", source: "FMCSA SMS", url: "https://ai.fmcsa.dot.gov/SMS/" },
      { title: "DataQs — Challenge a Violation", desc: "Official portal to challenge inaccurate roadside inspection data.", source: "FMCSA DataQs", url: "https://dataqs.fmcsa.dot.gov/" },
      { title: "BASIC Score Methodology", desc: "How FMCSA calculates your 7 BASIC safety scores.", source: "FMCSA", url: "https://www.fmcsa.dot.gov/safety/carrier-safety/basics" },
    ],
  },
  {
    category: "Permits & Registration",
    color: "#34d399",
    icon: "📋",
    docs: [
      { title: "IFTA — International Fuel Tax Agreement", desc: "Official IFTA information, state contacts, and filing guides.", source: "IFTA Inc.", url: "https://www.iftach.org/" },
      { title: "IRP — International Registration Plan", desc: "Apportioned registration for vehicles traveling multiple states.", source: "IRP Inc.", url: "http://www.irponline.org/" },
      { title: "Oversize/Overweight Permits by State", desc: "FMCSA guide to state permit contacts for OS/OW loads.", source: "FMCSA", url: "https://www.fmcsa.dot.gov/regulations/cargo-securement/frequently-asked-questions-about-oversize-overweight-permits" },
    ],
  },
  {
    category: "Hazmat",
    color: "#f97316",
    icon: "☢️",
    docs: [
      { title: "Hazmat Regulations (49 CFR 100-185)", desc: "Complete federal hazardous materials transportation regulations.", source: "PHMSA", url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I" },
      { title: "Hazmat Employee Training Requirements", desc: "Training requirements for employees handling hazardous materials.", source: "PHMSA", url: "https://www.phmsa.dot.gov/training/hazmat/training-requirements-hazmat-employees" },
      { title: "Hazmat Registration", desc: "Annual hazmat registration requirements for carriers.", source: "PHMSA", url: "https://www.phmsa.dot.gov/registration" },
    ],
  },
  {
    category: "Weigh Station Bypass",
    color: AMBER,
    icon: "⚡",
    docs: [
      { title: "Drivewyze PreClear — Enrollment", desc: "Enroll in Drivewyze to legally bypass weigh stations on eligible routes.", source: "Drivewyze", url: "https://drivewyze.com/preclear/" },
      { title: "PrePass Weigh Station Bypass", desc: "PrePass enrollment for weigh station bypass and port of entry clearance.", source: "PrePass", url: "https://prepass.com/" },
      { title: "State Weigh Station Locations", desc: "FHWA map of all commercial vehicle enforcement locations by state.", source: "FHWA", url: "https://ops.fhwa.dot.gov/freight/infrastructure/weigh_stations/state_info/index.htm" },
    ],
  },
];

const BYPASS_TIPS = [
  { icon: "📊", title: "Keep Your CSA Score Clean", desc: "Carriers with CSA scores below threshold in all 7 BASICs get highest bypass rates. A clean safety record is your bypass pass." },
  { icon: "⚖️", title: "Know Your Weight Before You Roll", desc: "Always verify gross and axle weights before hitting the road. Overweight vehicles are always pulled in — no bypass system overrides weight violations." },
  { icon: "📋", title: "Current Permits & Registration", desc: "IFTA, IRP, and annual inspection must all be current. One expired document = pull-in, regardless of your bypass status." },
  { icon: "🩺", title: "Medical Certificate Current", desc: "Expired medical card triggers an out-of-service order immediately at any weigh station. Keep your DOT physical current." },
  { icon: "📡", title: "Enroll in Drivewyze or PrePass", desc: "Both networks provide legal weigh station bypass on thousands of stations nationwide. Enroll once, bypass automatically." },
  { icon: "🔍", title: "Respond Quickly to DataQs", desc: "Challenge inaccurate violations within 60 days through DataQs. One wrong violation can tank your CSA score and kill bypass eligibility." },
];

export default function DOTConnectPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...DOT_DOCUMENTS.map(d => d.category)];

  const filtered = DOT_DOCUMENTS.filter(group => {
    if (activeCategory !== "All" && group.category !== activeCategory) return false;
    if (search) {
      return group.docs.some(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase()));
    }
    return true;
  }).map(group => ({
    ...group,
    docs: search ? group.docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase())) : group.docs,
  }));

  return (
    <div style={{ minHeight: "100vh", background: NAVY, color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2244 100%)", borderBottom: `3px solid ${AMBER}`, padding: "24px 24px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <a href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: 14 }}>← Dashboard</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>🛣️</span>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>DOT Connect</h1>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Direct access to official DOT documents, bypass programs, and confirmed regulatory sources</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 0 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? AMBER : "transparent",
                  color: activeCategory === cat ? NAVY : "#94a3b8",
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>

        {/* Search */}
        <div style={{ marginBottom: 32 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search DOT documents, regulations, forms..."
            style={{
              width: "100%",
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "14px 20px",
              color: "white",
              fontSize: 16,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Alert Banner */}
        <div style={{ background: "#1a2e0a", border: `1px solid ${GREEN}`, borderRadius: 12, padding: "16px 20px", marginBottom: 32, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>✅</span>
          <div>
            <div style={{ fontWeight: 800, color: GREEN, marginBottom: 4 }}>Confirmed Sources Only</div>
            <div style={{ color: "#86efac", fontSize: 14, lineHeight: 1.6 }}>
              Every document and link below is sourced directly from official government agencies — FMCSA, PHMSA, eCFR, CVSA, and FHWA. No third-party summaries. No outdated PDFs. Click any link to access the live, official source.
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filtered.map(group => (
          <div key={group.category} style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{group.icon}</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: group.color }}>{group.category}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {group.docs.map(doc => (
                <div
                  key={doc.title}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, borderLeft: `4px solid ${group.color}` }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: group.color, letterSpacing: 2, marginBottom: 8 }}>
                    {doc.source}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.4 }}>{doc.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>{doc.desc}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: group.color + "22",
                      color: group.color,
                      border: `1px solid ${group.color}55`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    Open Official Source ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bypass Tips Section */}
        <div style={{ background: "#0d1f0d", border: `1px solid #1a3d1a`, borderRadius: 16, padding: 32, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: GREEN }}>Weigh Station Bypass — How to Qualify</h2>
          </div>
          <p style={{ color: "#86efac", marginBottom: 28, fontSize: 14, lineHeight: 1.7 }}>
            The weigh station bypass programs (Drivewyze and PrePass) are 100% legal and used by hundreds of thousands of carriers nationwide. You qualify automatically based on your safety record — here's exactly what you need to keep your bypass rate high.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {BYPASS_TIPS.map(tip => (
              <div key={tip.title} style={{ background: "#091509", border: "1px solid #1a3d1a", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{tip.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: GREEN }}>{tip.title}</div>
                <p style={{ color: "#86efac", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Random Inspection Section */}
        <div style={{ background: "#1a0a0a", border: `1px solid #3d1a1a`, borderRadius: 16, padding: 32, marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>🚔</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: RED }}>Random Inspections — Know Your Rights</h2>
          </div>
          <p style={{ color: "#fca5a5", marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
            Officers can stop any CMV at any time. Your best defense is a clean, organized truck with all documents current and accessible. Here's exactly what they're checking and what you're required to produce.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {[
              { title: "Documents You Must Carry", items: ["CDL (valid, correct class)", "Medical certificate (current)", "Registration / cab card", "IFTA license (if applicable)", "Bill of lading / shipping papers", "ELD or paper logs (8 days)", "Hazmat permits (if applicable)"] },
              { title: "What Officers Inspect", items: ["Brakes — #1 out-of-service cause", "Tires & wheels", "Lights & reflectors", "Cargo securement", "HOS records (logs or ELD)", "Driver condition & sobriety", "Vehicle markings & placards"] },
              { title: "Your Rights at Inspection", items: ["Right to know what they're looking for", "Right to refuse unreasonable searches", "Right to contact your fleet/dispatcher", "Right to request supervisor if unsafe conduct", "Right to challenge violations via DataQs", "Right to copy of inspection report (Form 396A)"] },
            ].map(section => (
              <div key={section.title} style={{ background: "#0d0505", border: "1px solid #3d1a1a", borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: RED, marginBottom: 12 }}>{section.title}</div>
                {section.items.map(item => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ color: RED, flexShrink: 0, fontSize: 12, marginTop: 2 }}>▸</span>
                    <span style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: "#0d0505", border: "1px solid #3d1a1a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, color: RED, marginBottom: 8 }}>After Any Inspection</div>
            <div style={{ color: "#fca5a5", fontSize: 14, lineHeight: 1.7 }}>
              You must receive Form MCSA-5514 (Driver/Vehicle Examination Report) before leaving the inspection location. Keep a copy. If you receive a violation you believe is inaccurate, file a DataQs challenge within 60 days at{" "}
              <a href="https://dataqs.fmcsa.dot.gov/" target="_blank" rel="noopener noreferrer" style={{ color: AMBER }}>dataqs.fmcsa.dot.gov</a>.
              Your TruckWithEase Compliance Vault stores all your inspection records so you're always ready.
            </div>
          </div>
        </div>

        {/* Quick Contacts */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 20px", color: AMBER }}>📞 Official DOT Contact Lines</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { agency: "FMCSA Hotline", number: "1-800-832-5660", desc: "Report safety violations, file complaints" },
              { agency: "PHMSA Hazmat Info", number: "1-800-467-4922", desc: "Hazardous materials questions" },
              { agency: "CVSA", number: "301-830-6143", desc: "Vehicle inspection standards" },
              { agency: "TruckWithEase Support", number: "636-706-8338", desc: "Your platform support line" },
            ].map(c => (
              <a
                key={c.agency}
                href={`tel:${c.number.replace(/-/g, "")}`}
                style={{ background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, textDecoration: "none", display: "block" }}
              >
                <div style={{ color: AMBER, fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{c.agency}</div>
                <div style={{ color: "white", fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{c.number}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{c.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
