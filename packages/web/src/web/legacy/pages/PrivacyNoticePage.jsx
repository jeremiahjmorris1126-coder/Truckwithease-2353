import React from 'react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  card: '#0f1419',
  gold: '#c9a84c',
  goldB: '#FFD700',
};

const LAST_UPDATED = 'August 30, 2026';

const sections = [
  {
    title: 'Who we are',
    body: `TruckWithEase is fleet compliance software owned and operated by MorrisHive LLC, a Missouri limited liability company. MorrisHive LLC is the legal entity responsible for this platform and is the entity registered with our messaging carriers; TruckWithEase is the product name. This notice explains what personal information the platform collects, why, who it is shared with, and how to get it deleted.

Contact for any privacy request: jeremiahjmorris1126@gmail.com`,
  },
  {
    title: 'Mobile phone numbers and text messaging',
    body: `The phone lines inside TruckWithEase are internal fleet communication lines. A fleet subscribes to lines at $10.50 per line per month and assigns each line to one of its own employees, so that fleet's drivers and dispatchers can text each other about their own work. These lines are not used to contact brokers, shippers, or the general public, and they are never used for marketing, promotion, or lead generation.

We use mobile phone numbers for two things and nothing else:

1. One-time sign-in codes sent to an employee signing in to their own account.
2. Internal dispatch replies. When a dispatcher or driver at the fleet texts one of the fleet's own lines asking whether a driver can run more miles, the platform answers on that line with that driver's remaining legal hours under 49 CFR Part 395.

How consent is collected. Every person we text is an employee of the fleet that pays for the line. That employee signs in to their own TruckWithEase account, enters their own mobile number on the account screen, and checks a box reading "Text me sign-in codes and dispatch messages from my fleet at this number. Message and data rates may apply. Message frequency varies. Reply HELP for help, STOP to opt out." The box is unchecked by default, the employee checks it themselves, and the number is not saved and cannot be texted without it. We store the consent wording shown, the timestamp, and the account it belongs to. Replying STOP, or removing the number, ends messaging to that number immediately.

No mobile information is sold or shared with any third party for marketing or promotional purposes. Mobile opt-in data and consent records are never sold, rented, shared, or transferred to any third party for their own marketing, and are never shared with affiliates, lead generators, data brokers, or advertising networks for any purpose.

The only parties that ever see a mobile number are (a) Twilio, the licensed telecom provider that carries the message on our behalf, and (b) law enforcement or a court where we are legally required to produce it. Twilio acts as our service provider and is not permitted to use the number for its own marketing.

Message frequency varies with dispatch activity. Message and data rates may apply. Reply STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT, REVOKE or OPTOUT to any message to stop all messages from that number. Reply HELP or INFO for help. Opting out of messaging does not delete the account.`,
  },
  {
    title: 'What else we collect',
    body: `• Account and identity: name, email, mobile number, role, employer, CDL status and medical card expiry when the driver or fleet enters them.
• Duty status: hours-of-service intervals, driving, on-duty and off-duty time, and the recomputed duty clock. This is the core of the product.
• Messaging records: the body, direction, timestamp and delivery status of messages sent or received on a fleet number, plus the duty clock as of the second the message existed.
• Location and route data where the driver has enabled it, and load, fuel and expense records the user enters.
• Device and log data: IP address, device type, session times, and error logs.

We do not collect biometric identifiers, and we do not buy personal information about drivers from data brokers.`,
  },
  {
    title: 'Why we keep messages sealed',
    body: `Every message on a fleet number is stored with the driver's duty clock as of the second that message existed, and linked into an append-only sha256 chain. Records are never edited or deleted in place: a correction is appended as a new record that points back at the one it supersedes.

This makes the record tamper-evident — if a stored measurement or message body is altered, the recomputed chain breaks and the break is reported. It is not notarization, not a legal certification, and not a third-party timestamp authority.

Because these records exist to be replayed in a dispute or a DOT audit, messaging and duty-status records are retained for the life of the account plus 3 years, and are excluded from routine deletion.`,
  },
  {
    title: 'Who we share information with',
    body: `We share only what a service provider needs to do its job, under contract, and never for their own marketing:

• Twilio — carries SMS and voice on fleet numbers.
• Google Maps Platform — routing and place lookups.
• Stripe — payment processing. We never store full card numbers.
• IDrive e2 — encrypted document and file storage.
• The driver's own fleet administrator, for drivers on a Fleet account.

We also disclose information when legally compelled by subpoena, warrant, or court order, or to protect someone's safety. We do not sell personal information, and we do not share it for cross-context behavioral advertising.`,
  },
  {
    title: 'Your rights',
    body: `You can ask us to (a) show you the personal information we hold about you, (b) correct it, (c) delete it, (d) export it, or (e) stop messaging you. Email jeremiahjmorris1126@gmail.com with the request type. We respond within 30 days and we do not charge for it, and we will not retaliate or downgrade service for making a request.

Two limits, stated plainly: we keep duty-status and sealed messaging records for the retention period above even after a deletion request, because federal recordkeeping and the evidentiary purpose of the record require it; and if you are a driver on a Fleet account, your fleet administrator also controls records about your employment.

The platform is not intended for anyone under 18 and we do not knowingly collect information from children.`,
  },
  {
    title: 'Security and changes',
    body: `Data is encrypted in transit over TLS. Credentials are hashed. Files are stored with server-side encryption and reached only through short-lived presigned URLs. Access to production data is limited to the operator of the platform. No system is perfectly secure, and we do not claim an uptime or breach-proof guarantee.

If this notice changes materially we will update the date at the top and post the change on this page. Continued use after a change means you accept the updated notice.`,
  },
];

export default function PrivacyNoticePage() {
  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: C.gold, letterSpacing: 0.5 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: C.white60, margin: 0 }}>
          TruckWithEase — a product of MorrisHive LLC · Last updated: {LAST_UPDATED}
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: C.card,
            border: `1px solid ${C.gold}55`,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.7,
            color: C.white,
          }}
        >
          <strong style={{ color: C.goldB }}>Short version.</strong> Mobile phone numbers are used only for
          sign-in codes and dispatch replies about loads. <strong>No mobile information is sold or shared with
          third parties for marketing or promotional purposes.</strong> Reply STOP to any message to stop all
          messages. Email jeremiahjmorris1126@gmail.com to see, correct, or delete your data.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          {sections.map((s) => (
            <section
              key={s.title}
              style={{
                background: C.card,
                border: `1px solid rgba(201, 168, 76, 0.15)`,
                borderRadius: 8,
                padding: 18,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.gold, margin: '0 0 10px' }}>{s.title}</h2>
              <div style={{ fontSize: 13, lineHeight: 1.75, color: C.white60, whiteSpace: 'pre-wrap' }}>
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 18,
            background: C.card,
            borderRadius: 8,
            border: `1px solid rgba(201, 168, 76, 0.15)`,
            fontSize: 12,
            color: C.white60,
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: 0 }}>
            Messaging program terms are in the{' '}
            <a href="/terms" style={{ color: C.goldB }}>Terms of Service</a>. Privacy requests:
            jeremiahjmorris1126@gmail.com · 636-706-8338
          </p>
          <p style={{ marginTop: 10, marginBottom: 0 }}>TruckWithEase © 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
