import React, { useState } from 'react';
import { ChevronDown, Mail, Share2, Phone, MapPin, Target, DollarSign, TrendingUp } from 'lucide-react';

export default function GeotabPartnershipStrategy() {
  const [expandedSection, setExpandedSection] = useState('contacts');

  const geotabContacts = [
    {
      title: "VP of Channel & Partnerships",
      name: "Geotab Reseller Program Lead",
      email: "partnerships@geotab.com",
      phone: "+1-416-633-9150",
      department: "Business Development",
      priority: "CRITICAL",
      message: "Your entry point. This person approves all reseller agreements and gives you wholesale pricing."
    },
    {
      title: "Regional Sales Director (North America)",
      name: "Geotab Territory Manager",
      email: "sales@geotab.com",
      phone: "+1-800-663-8462",
      department: "Sales",
      priority: "HIGH",
      message: "Can fast-track your certification and provide co-marketing support."
    },
    {
      title: "Technical Integration Manager",
      name: "Geotab API & Integration Lead",
      email: "developers@geotab.com",
      department: "Technical",
      priority: "HIGH",
      message: "Ensures your TruckWithEase integration with Geotab APIs is seamless and certified."
    },
    {
      title: "Partner Success Manager",
      name: "Geotab Partner Enablement",
      email: "partner-support@geotab.com",
      department: "Support",
      priority: "MEDIUM",
      message: "Trains your team, provides sales collateral, handles ongoing partner support."
    }
  ];

  const resellerAgreementTerms = [
    {
      term: "Wholesale Pricing",
      yours: "You pay Geotab 40-45% off retail",
      retail: "$850 per device",
      yourCost: "$425-510 per device",
      yourMargin: "$690-975 bundled with software",
      impact: "35-45% gross margin on hardware"
    },
    {
      term: "Territory Rights",
      description: "Exclusive or non-exclusive coverage of your region",
      recommend: "Start non-exclusive (faster approval), prove success, then negotiate exclusive"
    },
    {
      term: "Volume Commitments",
      year1: "100-500 devices minimum",
      year2: "500-1000 devices",
      year3: "1000+ devices",
      impact: "Higher volume = better pricing & co-marketing support"
    },
    {
      term: "Co-Marketing",
      benefits: ["Geotab mentions you as certified partner", "Joint case studies", "Lead sharing", "Geotab partner directory"],
      impact: "Geotab sends you 10-20 qualified leads per month"
    },
    {
      term: "Technical Support",
      geotab: "Geotab handles device support & software updates",
      you: "You handle customer onboarding, integration, and TruckWithEase support",
      impact: "Clear handoff = no confusion"
    },
    {
      term: "Contract Length",
      standard: "2-3 years with annual renewal option",
      negotiation: "Push for 3-year terms to lock in wholesale pricing"
    }
  ];

  const implementationPlan = [
    {
      week: "Week 1",
      action: "Research & Outreach",
      tasks: [
        "Email partnerships@geotab.com with subject: 'TruckWithEase — Fleet Management + Geotab ELD Bundle Partnership'",
        "LinkedIn message the Regional Sales Director",
        "Include your 2-year financial projections (fleets you'll capture, devices per year)",
        "Mention your 8 target fleets already interested"
      ]
    },
    {
      week: "Week 2",
      action: "Initial Call",
      tasks: [
        "Geotab calls to discuss partnership opportunity",
        "You pitch: 'We sell your ELDs bundled with our fleet software at 40% lower cost than Samsara'",
        "Show them your pricing strategy & hardware bundle offer",
        "Ask about reseller certification & timeline"
      ]
    },
    {
      week: "Week 3",
      action: "Agreement Negotiation",
      tasks: [
        "Geotab sends draft reseller agreement",
        "Negotiate: wholesale pricing, territory, volume commitment, co-marketing",
        "Target: 45% discount, non-exclusive territory, 200-device year-1 commitment, co-marketing",
        "Get API integration access for TruckWithEase"
      ]
    },
    {
      week: "Week 4",
      action: "Technical Setup",
      tasks: [
        "Geotab assigns integration manager to your project",
        "You wire Geotab API into your app (already 60% done)",
        "Geotab certifies your ELD integration",
        "Test end-to-end: tablet → Geotab device → HOS logs in TruckWithEase"
      ]
    },
    {
      week: "Week 5-6",
      action: "Launch",
      tasks: [
        "Agreement signed, wholesale pricing active",
        "You announce hardware bundle to your 8 target fleets",
        "Geotab announces partnership in their partner directory",
        "First fleet onboarded with bundled hardware"
      ]
    }
  ];

  const alternativePartners = [
    {
      name: "Samsara (High Risk)",
      why: "They compete directly with you on dispatch & safety. Less likely to partner.",
      margin: "Similar to Geotab (35-40%)",
      recommend: "Skip for now"
    },
    {
      name: "Verizon Connect (Good Option)",
      why: "Strong ELD + telematics. Less aggressive on software. Open to resellers.",
      margin: "40-45% discount",
      recommend: "Secondary option if Geotab negotiation stalls"
    },
    {
      name: "Samsara (Alternative Route)",
      why: "If you can't partner with them, position yourself as a 'Samsara alternative.' Use Geotab instead.",
      margin: "Better margins as independent",
      recommend: "Your best path to market"
    }
  ];

  const negotiationScript = `
Subject: Partnership Opportunity — Fleet Management + ELD Bundle

Hi [Name],

TruckWithEase is a fleet management platform (dispatch, safety, payroll, compliance) that's 40% cheaper than Samsara and growing fast. We're interested in bundling Geotab ELDs with our software to offer fleets a complete solution.

Our pitch to fleets: "Get Geotab ELD + TruckWithEase fleet software for $1,200 per driver. Save $6,000+ vs. Samsara. Same data, half the price."

We have 8 regional fleets already interested and project selling 200-500 Geotab devices in year one.

We'd like to explore a reseller partnership. We'd handle:
— Customer acquisition & onboarding
— Software integration & support
— Co-marketing

Geotab would handle:
— Device provisioning & support
— Wholesale pricing (40-45% discount)
— Technical certification

Would you be open to a 30-min call to discuss next steps?

Thanks,
[Your Name]
TruckWithEase
[Your Phone]
[Your Email]
`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Geotab Partnership Strategy</h1>
          <p className="text-cyan-400 text-lg">Your roadmap to becoming a certified Geotab reseller & bundling ELDs with TruckWithEase</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-semibold">Wholesale Discount</span>
            </div>
            <p className="text-2xl font-bold text-white">40-45%</p>
            <p className="text-sm text-gray-400">Off retail ELD price</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Your Margin</span>
            </div>
            <p className="text-2xl font-bold text-white">35-45%</p>
            <p className="text-sm text-gray-400">Hardware + software bundled</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Year 1 Target</span>
            </div>
            <p className="text-2xl font-bold text-white">200-500</p>
            <p className="text-sm text-gray-400">Geotab devices to install</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Timeline</span>
            </div>
            <p className="text-2xl font-bold text-white">4-6 Weeks</p>
            <p className="text-sm text-gray-400">To signed agreement</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['contacts', 'agreement', 'implementation', 'script'].map(tab => (
            <button
              key={tab}
              onClick={() => setExpandedSection(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                expandedSection === tab
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'contacts' && 'Who to Contact'}
              {tab === 'agreement' && 'Agreement Terms'}
              {tab === 'implementation' && 'Implementation'}
              {tab === 'script' && 'Email Script'}
            </button>
          ))}
        </div>

        {/* Contacts Section */}
        {expandedSection === 'contacts' && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Key Geotab Contacts</h2>
            {geotabContacts.map((contact, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{contact.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        contact.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                        contact.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {contact.priority}
                      </span>
                    </div>
                    <p className="text-gray-400">{contact.name} • {contact.department}</p>
                  </div>
                </div>
                <p className="text-cyan-300 mb-4 italic">{contact.message}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600 p-3 rounded transition-all">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-300">{contact.email}</span>
                  </a>
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600 p-3 rounded transition-all">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{contact.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agreement Terms Section */}
        {expandedSection === 'agreement' && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Reseller Agreement Key Terms</h2>
            {resellerAgreementTerms.map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-orange-400 mb-3">{item.term}</h3>
                {item.yourCost ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Retail Price</p>
                      <p className="text-white font-bold text-lg">{item.retail}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Your Cost</p>
                      <p className="text-green-400 font-bold text-lg">{item.yourCost}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Bundled Margin</p>
                      <p className="text-cyan-400 font-bold text-lg">{item.yourMargin}</p>
                    </div>
                  </div>
                ) : item.description ? (
                  <p className="text-gray-300 mb-3">{item.description}</p>
                ) : null}
                {item.year1 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-gray-400 text-sm mb-2"><span className="text-gray-300 font-semibold">Year 1:</span> {item.year1}</p>
                    <p className="text-gray-400 text-sm mb-2"><span className="text-gray-300 font-semibold">Year 2:</span> {item.year2}</p>
                    <p className="text-gray-400 text-sm"><span className="text-gray-300 font-semibold">Year 3:</span> {item.year3}</p>
                  </div>
                )}
                {item.benefits && (
                  <ul className="mt-3 space-y-2">
                    {item.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="text-gray-300 flex items-center gap-2">
                        <span className="text-orange-400">✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                )}
                {item.geotab && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <p className="text-gray-400"><span className="text-cyan-400 font-semibold">Geotab handles:</span> {item.geotab}</p>
                    <p className="text-gray-400"><span className="text-orange-400 font-semibold">You handle:</span> {item.you}</p>
                  </div>
                )}
                {item.impact && <p className="mt-3 text-cyan-300 text-sm">→ {item.impact}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Implementation Plan Section */}
        {expandedSection === 'implementation' && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6-Week Implementation Plan</h2>
            {implementationPlan.map((phase, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">{idx + 1}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{phase.week}</h3>
                    <p className="text-orange-400 font-semibold">{phase.action}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-13">
                  {phase.tasks.map((task, tidx) => (
                    <li key={tidx} className="text-gray-300 flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">→</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Email Script Section */}
        {expandedSection === 'script' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">First Contact Email Script</h2>
            <div className="bg-slate-800/50 border border-orange-500/50 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-4">Copy this email and personalize with your details. Send to partnerships@geotab.com</p>
              <div className="bg-slate-900 rounded p-6 font-mono text-sm text-gray-300 mb-6 max-h-96 overflow-y-auto">
                {negotiationScript.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(negotiationScript);
                  alert('Email script copied to clipboard!');
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-all"
              >
                Copy Email Script
              </button>
            </div>

            <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-cyan-400 font-bold text-lg mb-4">Pro Tips</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">1.</span>
                  <span className="text-gray-300"><span className="font-semibold">Mention your 8 target fleets</span> — this shows real opportunity, not hypothetical interest</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">2.</span>
                  <span className="text-gray-300"><span className="font-semibold">Follow up via LinkedIn</span> if you don't hear back in 3 days — tag the Regional Sales Director</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">3.</span>
                  <span className="text-gray-300"><span className="font-semibold">Negotiate wholesale pricing first</span> — 45% is your target, 40% is your floor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">4.</span>
                  <span className="text-gray-300"><span className="font-semibold">Push for non-exclusive territory</span> initially, prove success, then ask for exclusive after 12 months</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">5.</span>
                  <span className="text-gray-300"><span className="font-semibold">Ask for co-marketing support early</span> — Geotab leads are worth $500-1K each</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Alternative Partners */}
        <div className="mt-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Alternative Partners (If Geotab Doesn't Work Out)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternativePartners.map((partner, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded p-4">
                <h3 className="text-lg font-bold text-orange-400 mb-2">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{partner.why}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><span className="font-semibold">Margin:</span> {partner.margin}</p>
                  <p className="text-cyan-400 font-semibold">{partner.recommend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Your Next Move</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span><span className="font-semibold">Send the email</span> to partnerships@geotab.com this week</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span><span className="font-semibold">Follow up on LinkedIn</span> with the Regional Sales Director if no response in 3 days</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
              <span><span className="font-semibold">Jump on the call</span> when Geotab reaches out — have your 2-year financial model ready</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
              <span><span className="font-semibold">Negotiate hard</span> on wholesale pricing and co-marketing — don't accept their first offer</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
              <span><span className="font-semibold">Launch with your 8 target fleets</span> the day you get wholesale pricing confirmed</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
