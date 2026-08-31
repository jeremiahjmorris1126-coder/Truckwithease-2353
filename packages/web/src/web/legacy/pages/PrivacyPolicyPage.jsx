import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  card: '#0f1419',
  gold: '#c9a84c',
};

const sections = [
  {
    title: '1. Acceptance of Terms & User Responsibility',
    content: `By accessing and using TruckWithEase (the "Platform"), you acknowledge that you are solely responsible for your use of this Platform and all consequences arising from that use. TruckWithEase, its owners, operators, developers, and affiliates ("TruckWithEase," "we," "us") provide this Platform as-is without warranty of any kind.

You agree that TruckWithEase is not responsible for:
• Any loss, injury, or damage resulting from your use of the Platform or reliance on any information, advice, or features provided
• Accidents, incidents, or violations of law that occur as a result of your actions based on Platform guidance
• Equipment failure, GPS inaccuracy, or data transmission errors
• Third-party services, APIs, or load boards integrated with the Platform (DAT, Uber Freight, Samsara, etc.)
• Broker, shipper, or receiver actions, fraud, or non-payment
• Road conditions, traffic, weather, or law enforcement actions

You assume all risk associated with your use of this Platform.`,
  },
  {
    title: '2. Driver & Fleet Operator Liability Waiver',
    content: `All drivers, fleet managers, and business operators using this Platform do so at their own risk. TruckWithEase does not:
• Guarantee the accuracy of GPS tracking, route planning, or real-time alerts
• Guarantee the safety or legality of any road, route, or load recommendation
• Guarantee that driver actions based on Platform data will result in compliance with federal, state, or local laws
• Provide legal advice, tax advice, or business consulting
• Verify the legitimacy, financial stability, or trustworthiness of any broker, shipper, or carrier
• Guarantee payment for services rendered to any third party
• Assume responsibility for ELD compliance, HOS violations, or DOT infractions
• Provide medical or emergency assistance

Drivers must independently verify all safety information, follow all applicable laws, and make their own decisions.`,
  },
  {
    title: '3. Community Intelligence & Ratings Disclaimer',
    content: `Information, ratings, and complaints about brokers, shippers, receivers, roads, and charge stops on this Platform are user-generated and provided as-is. TruckWithEase does not:
• Verify the accuracy or truthfulness of any user-submitted rating, complaint, or report
• Guarantee that negative ratings are accurate or fair
• Remove or hide ratings based on complaints from rated entities
• Serve as a dispute resolution service for rating disagreements
• Legally defend users who make false, defamatory, or libelous statements
• Assume liability for reputational harm to any third party

Users submit all ratings and reports at their own risk and must ensure they are truthful and not libelous.`,
  },
  {
    title: '4. Load Board & Broker Matching',
    content: `TruckWithEase does not:
• Guarantee that loads posted on integrated load boards (DAT, Uber Freight, etc.) are legitimate
• Verify broker, shipper, or receiver identity, licensing, or financial responsibility
• Guarantee payment terms, load accuracy, or safe working conditions
• Mediate disputes between drivers and brokers
• Provide insurance or guarantee loss recovery in case of broker non-payment or fraud

All broker screening, rate negotiation, and contract review are the driver's or fleet's responsibility. TruckWithEase is not a broker and does not guarantee load completion or payment.`,
  },
  {
    title: '5. Route Planning & Navigation',
    content: `TruckWithEase route recommendations, charge-stop suggestions, and danger warnings are informational only and do not:
• Guarantee route legality for your vehicle, cargo, or class of license
• Account for weight limits, height restrictions, hazmat regulations, or local ordinances
• Provide real-time traffic updates or guaranteed accurate ETA estimates
• Override driver judgment or professional trucking standards
• Assume responsibility for accidents, damage, or delays resulting from route choice

Drivers must verify all routes are legal for their vehicle and cargo before proceeding.`,
  },
  {
    title: '6. Payment, Rig Bucks & Subscription Services',
    content: `Payment for services, Rig Bucks rewards, and subscription access are non-refundable once processed. TruckWithEase does not:
• Guarantee that Rig Bucks will be honored by any third-party partner or fuel network
• Guarantee subscription features will remain available or unchanged
• Assume responsibility for payment processing failures or unauthorized charges
• Provide customer support for third-party payment processors (Stripe, etc.)
• Guarantee that owner-operators will qualify for or maintain Rig Bucks eligibility

All subscriptions and purchases are final.`,
  },
  {
    title: '7. Data Collection & Privacy',
    content: `TruckWithEase collects:
• GPS location data, real-time tracking, and route history
• Load details, broker names, and freight information
• User ratings, complaints, and community feedback
• Device information, login times, and platform activity
• Payment information and subscription status

This data is used to:
• Personalize the Platform experience
• Generate community intelligence (ratings, danger reports, broker blacklists)
• Improve features and detect fraud
• Comply with legal obligations

TruckWithEase may share anonymized, aggregated data with partners, analytics services, and third-party integrations. You consent to this data collection and use by accepting these Terms.`,
  },
  {
    title: '8. Third-Party Integrations & APIs',
    content: `TruckWithEase integrates with third-party services including but not limited to:
• DAT, Uber Freight, Convoy (load boards)
• Samsara, Geotab (ELD providers)
• Google Maps (GPS and routing)
• Stripe, PayPal (payment processors)
• Weather services, traffic data providers

TruckWithEase is not responsible for:
• Service outages, data breaches, or failures of third-party platforms
• Privacy practices of integrated services
• API rate limits or data inaccuracies from third-party sources
• Changes to third-party pricing, terms, or availability

You are responsible for reading and accepting the terms of each integrated service.`,
  },
  {
    title: '9. No Warranty; Limitation of Liability',
    content: `THE PLATFORM IS PROVIDED "AS-IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TruckWithEase DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

TO THE MAXIMUM EXTENT PERMITTED BY LAW:
• TruckWithEase's total liability shall not exceed the amount you paid in the last 12 months
• TruckWithEase is not liable for indirect, incidental, consequential, or punitive damages
• TruckWithEase is not liable for lost profits, lost data, or loss of use

Some jurisdictions do not allow limitation of liability, so this may not apply to you.`,
  },
  {
    title: '10. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless TruckWithEase, its owners, operators, employees, and agents from any claim, demand, loss, or damage (including attorney's fees) arising from:
• Your use of the Platform
• Your violation of these Terms
• Your violation of any law or third-party rights
• Any user-generated content you submit
• Claims by brokers, shippers, or other third parties related to your actions

This indemnification applies even if TruckWithEase was negligent or at fault.`,
  },
  {
    title: '11. Prohibited Uses',
    content: `You agree not to use the Platform to:
• Submit false, defamatory, or libelous ratings or complaints
• Impersonate any person or entity
• Engage in fraud, phishing, or deception
• Interfere with Platform functionality or security
• Reverse-engineer, scrape, or harvest data without permission
• Post illegal content or facilitate illegal activity
• Harass, threaten, or abuse other users
• Submit spam, malware, or viruses

Violation of these prohibitions may result in immediate account termination and legal action.`,
  },
  {
    title: '12. Account Termination',
    content: `TruckWithEase reserves the right to suspend or terminate your account at any time, for any reason, without notice or liability, including:
• Violation of these Terms
• Non-payment of subscription fees
• Suspected fraudulent activity
• Abuse of community features
• Legal or regulatory obligations

Upon termination, your access to the Platform ceases immediately, and no refunds are issued.`,
  },
  {
    title: '13. Compliance with Laws',
    content: `You are solely responsible for compliance with all federal, state, and local laws including:
• Commercial Driver's License (CDL) requirements
• Hours of Service (HOS) regulations
• DOT safety standards
• ELD mandate compliance
• Hazmat and dangerous goods regulations
• State-specific trucking laws
• Tax obligations and reporting requirements

TruckWithEase does not provide legal or compliance advice. Consult a qualified attorney or compliance professional.`,
  },
  {
    title: '14. Changes to Terms & Platform',
    content: `TruckWithEase may modify these Terms and the Platform at any time without notice. Your continued use of the Platform after changes constitutes acceptance of the new Terms.

TruckWithEase may also:
• Discontinue features or services at any time
• Modify subscription pricing with 30 days notice
• Change data collection practices
• Modify API integrations or third-party partnerships

No liability is assumed for modifications.`,
  },
  {
    title: '15. Governing Law & Dispute Resolution',
    content: `These Terms are governed by the laws of Missouri, without regard to conflict of law principles.

All disputes shall be resolved through:
1. Good faith negotiation between the parties (30 days)
2. Binding arbitration administered by JAMS (if negotiation fails)
3. Arbitration shall be conducted in Saint Louis, Missouri

You waive the right to class action or jury trial. Arbitration fees shall be split equally unless the arbitrator determines otherwise. TruckWithEase shall not be liable for any cost of arbitration.`,
  },
  {
    title: '16. Contact & Support',
    content: `For questions about these Terms or your use of the Platform:
• Email: legal@truckwithease.com
• Phone: 636-706-8338
• Mailing Address: TruckWithEase, Saint Louis, Missouri

Support is provided on a best-effort basis and is not guaranteed.`,
  },
];

export default function PrivacyPolicyPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            Terms of Service & Liability
          </h1>
          <p style={{ fontSize: 14, color: C.white60, lineHeight: 1.6 }}>
            Last Updated: August 31, 2026
          </p>
          <p style={{ fontSize: 13, color: C.white60, marginTop: '10px', lineHeight: 1.6 }}>
            TruckWithEase is owned and operated by <strong style={{ color: C.gold }}>MorrisHive LLC</strong>, a
            Missouri limited liability company (Springfield, Missouri). MorrisHive LLC is the legal entity behind this
            Platform and the entity registered with our messaging carriers; "TruckWithEase" is the product name. In
            these Terms, "TruckWithEase," "we," and "us" mean MorrisHive LLC. Contact:
            jeremiahjmorris1126@gmail.com · 636-706-8338. Privacy practices are described in our{' '}
            <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.
          </p>
          <p style={{ fontSize: 13, color: C.white60, marginTop: '16px', lineHeight: 1.6 }}>
            <strong>Important:</strong> By using TruckWithEase, you accept full responsibility for your use of the Platform and any consequences arising from it. Read these Terms carefully before using the Platform.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map((section, idx) => (
            <div
              key={idx}
              style={{
                background: C.card,
                border: `1px solid rgba(201, 168, 76, 0.15)`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: C.gold,
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: 'left',
                }}
              >
                {section.title}
                <ChevronDown
                  size={16}
                  style={{
                    transition: 'transform 0.3s',
                    transform: expanded === idx ? 'rotate(180deg)' : 'rotate(0)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expanded === idx && (
                <div
                  style={{
                    padding: '16px',
                    borderTop: `1px solid rgba(201, 168, 76, 0.1)`,
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: C.white60,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            background: C.card,
            borderRadius: 8,
            border: `1px solid rgba(201, 168, 76, 0.15)`,
            fontSize: 12,
            color: C.white60,
            textAlign: 'center',
          }}
        >
          <p>
            By clicking "Accept" during signup or by continuing to use TruckWithEase, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <p style={{ marginTop: '12px' }}>
            TruckWithEase © 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
