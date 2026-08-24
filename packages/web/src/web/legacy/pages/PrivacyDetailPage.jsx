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
    title: 'PRIVACY POLICY: DATA COLLECTION & PROCESSING',
    content: `TruckWithEase collects the following categories of data:

LOCATION DATA:
• Real-time GPS coordinates, speed, bearing, altitude
• Route history and planned routes
• Geofenced stop locations and dwell times
• Collected every 30-60 seconds during active use
• Retained for 24 months; deleted automatically unless archived

OPERATIONAL DATA:
• Load details: origin, destination, commodity, weight, rate, broker name
• Delivery status, timestamps, signatures
• Equipment used, fuel consumption, maintenance records
• Driver hours of service, break times, vehicle diagnostics
• Retained for 36 months for compliance audit

IDENTITY & ACCOUNT DATA:
• Name, phone, email, physical address
• Business entity type (owner-op, fleet manager, company driver)
• Driver's license number, CDL status, medical card expiry (if provided)
• Payment information (tokenized; never stored in plaintext)
• Subscription plan and billing history
• Retained for account lifetime + 7 years (tax law)

BEHAVIORAL & PREFERENCE DATA:
• Platform usage patterns, feature adoption, session duration
• Ratings submitted (brokers, shippers, charge stops, roads)
• Community complaints filed and complaint details
• Search history, load filters, saved routes
• Device type, browser, operating system
• Retained for 36 months; anonymized after 12 months

COMMUNICATION DATA:
• In-app messages, notifications, support conversations
• Broker messages, dispatch assignments, load confirmations
• Email communications and opt-in preferences
• Retained for 24 months; deleted upon request

HOW WE USE THIS DATA:
• Provide platform functionality (GPS tracking, load matching, dispatch)
• Personalize experience (onboarding, recommendations, alerts)
• Community intelligence (broker ratings, danger reports, stop rankings)
• Detect fraud, prevent abuse, enforce terms of service
• Comply with legal obligations (DOT audits, tax reporting, subpoenas)
• Improve features, fix bugs, conduct research
• Send transactional emails and opt-in marketing communications
• Aggregate anonymized data for business intelligence

DATA SHARING:
• With integrated services: Google Maps, DAT, Uber Freight, Samsara (per their privacy policies)
• Payment processors: Stripe (PCI-DSS compliant; card never stored by us)
• Analytics: Mixpanel, Segment (anonymized events only)
• Legal/law enforcement: when required by subpoena or court order
• Business sale: all data transfers to acquiring company (notice provided)
• Never sold to brokers; aggregated ratings are published for driver protection
• Never shared with third parties for marketing without explicit opt-in`,
  },
  {
    title: 'DATA SUBJECT RIGHTS (GDPR & CCPA)',
    content: `Users have the following rights:

RIGHT TO ACCESS (GDPR Art. 15, CCPA §1798.100):
• Request copy of all personal data held about you
• Provided in machine-readable format within 30 days
• Free of charge (1 request per calendar year)
• Contact: privacy@truckwithease.com with subject "Data Subject Access Request"

RIGHT TO RECTIFICATION (GDPR Art. 16):
• Correct inaccurate personal data
• Request we complete incomplete data
• Implemented within 30 days
• Done through Settings > Account or email request

RIGHT TO ERASURE (GDPR Art. 17, CCPA §1798.105):
• Right to be forgotten under certain conditions
• We will delete within 30 days unless:
  — Data is necessary to fulfill a contract
  — We have a legal obligation to keep it
  — You filed a complaint we must investigate
  — We need it to establish, exercise, or defend legal claims
• Community-generated data (your submitted ratings) may remain anonymized
• Contact: privacy@truckwithease.com with subject "Erasure Request"

RIGHT TO RESTRICT PROCESSING (GDPR Art. 18):
• Request we stop processing your data (keep it but don't use it)
• Applied within 30 days during dispute resolution
• Marketing communications can be opt-out via Settings

RIGHT TO DATA PORTABILITY (GDPR Art. 20, CCPA §1798.100(d)):
• Request portable copy of your data in standard format (JSON, CSV)
• Provided within 30 days at no cost
• Can be transferred to another service

RIGHT TO OBJECT (GDPR Art. 21):
• Object to processing for marketing, profiling, or legitimate interests
• Must be honored within 30 days
• Opt-out links in all marketing emails

RIGHT TO NOT BE SUBJECT TO AUTOMATED DECISION-MAKING (GDPR Art. 22):
• You have right to human review of automated decisions affecting you
• We do not make automated decisions about account access
• If you believe a decision was automated, contact privacy@truckwithease.com

EXERCISE YOUR RIGHTS:
Email: privacy@truckwithease.com
Mail: TruckWithEase, Privacy Officer, Saint Louis, Missouri
Phone: 636-706-8338
Proof of identity required; we respond within 30 days`,
  },
  {
    title: 'DATA RETENTION & DELETION SCHEDULE',
    content: `Data is retained according to this schedule:

ACTIVE ACCOUNT DATA (KEPT FOR ACCOUNT LIFETIME):
• Account credentials, name, contact information, subscription status
• Payment/billing history (7 years for tax compliance)
• User preferences, saved routes, customizations

TRANSACTIONAL DATA (RETAINED 36 MONTHS):
• Load details, delivery records, dispatch assignments
• Trip history, fuel records, maintenance records
• Broker assignments and communication logs

BEHAVIORAL DATA (RETAINED 24 MONTHS):
• Location history, session logs, feature usage
• Support conversations, feature feedback
• Search history, filter preferences

COMMUNITY SUBMISSIONS (RETAINED INDEFINITELY BUT ANONYMIZED):
• Broker ratings, shipper ratings, charge-stop ratings
• Road danger reports, community intelligence notes
• Your name may be deleted; the rating/complaint remains anonymized

UPON ACCOUNT DELETION:
All personal data is deleted within 30 days EXCEPT:
• Data necessary to complete ongoing transactions
• Data required by law (tax records, subpoena responses)
• Aggregated, anonymized community data
• Data needed to establish, exercise, or defend legal claims

AUTOMATIC DELETION:
• Inactive accounts: data deleted 36 months after last login
• Failed login attempts: deleted after 90 days
• Temporary files, caches, logs: deleted after 30 days
• Breach investigation data: deleted after investigation closes

RETENTION EXCEPTIONS:
We may retain data longer if:
• Required by law (DOT, tax law, legal hold)
• Actively contested or under dispute
• Necessary to defend against legal claims
• Needed for fraud investigation or abuse prevention`,
  },
  {
    title: 'COOKIES & TRACKING TECHNOLOGIES',
    content: `TruckWithEase uses the following tracking technologies:

ESSENTIAL COOKIES (REQUIRED FOR FUNCTIONALITY):
• Session ID: keeps you logged in across browser tabs
• Preferences: remembers your language, theme, timezone settings
• CSRF protection: prevents cross-site request forgery
• These cannot be disabled without breaking the platform

ANALYTICS COOKIES (OPTIONAL):
• Mixpanel: tracks feature usage, user flow, crash events
• Session Recording (anonymous): shows us how users interact with UI
• Retention: 12 months
• Opt-out: Settings > Privacy > Disable Analytics

ADVERTISING COOKIES (OPTIONAL):
• Google Analytics: tracks campaign performance
• Meta Pixel: tracks email signup conversions
• Retention: 180 days
• Opt-out: Settings > Privacy > Disable Advertising Tracking

THIRD-PARTY COOKIES:
• Google Maps: analytics on map feature usage
• Stripe: fraud detection, payment optimization
• DAT/Uber Freight integrations: session management
• We cannot control third-party cookie deletion; use your browser settings

LOCAL STORAGE:
• We store non-sensitive preferences, draft forms, saved searches locally
• This data stays on your device; never sent to our servers
• Clear via browser settings or within the app (Settings > Clear Cache)

MANAGING COOKIES:
• Browser settings: disable cookies (may break platform)
• App settings: Settings > Privacy > toggle Analytics/Advertising
• Opt-out links in all marketing emails
• Do-Not-Track requests: we honor DNT header if set in browser

HOW TO DISABLE COOKIES BY BROWSER:
Chrome: Settings > Privacy and Security > Cookies
Firefox: Settings > Privacy & Security > Cookies and Site Data
Safari: Preferences > Privacy > Block all cookies
Edge: Settings > Privacy > Cookies

PIXEL TAGS:
• Used in marketing emails to track opens and clicks
• Opt-out: unsubscribe from marketing emails (link at bottom of each email)`,
  },
  {
    title: 'SECURITY & DATA PROTECTION MEASURES',
    content: `TruckWithEase implements the following security controls:

ENCRYPTION IN TRANSIT:
• HTTPS/TLS 1.3 on all connections
• API calls encrypted with 256-bit AES
• Third-party integrations use HTTPS only
• No unencrypted data transmission

ENCRYPTION AT REST:
• Database encryption using AES-256
• Sensitive fields encrypted individually (SSN, payment tokens)
• Backup encryption with 256-bit keys
• Encryption keys managed separately from encrypted data

ACCESS CONTROLS:
• Role-based access control (RBAC)
• Multi-factor authentication available for sensitive accounts
• Password minimum: 12 characters, complexity required
• Session timeout after 30 minutes of inactivity
• Admin access: 2-person rule (two admins required for sensitive changes)

DATABASE SECURITY:
• Private database, not publicly accessible
• Access restricted to TruckWithEase applications only
• SQL injection prevention via parameterized queries
• Regular penetration testing

API SECURITY:
• Rate limiting: 1000 requests/hour per user
• Input validation on all endpoints
• Output encoding to prevent XSS
• CORS policy restricts cross-origin requests
• API keys rotated quarterly

INFRASTRUCTURE SECURITY:
• Cloud hosting on secure, SOC 2 certified infrastructure
• DDoS protection enabled
• Web Application Firewall (WAF) active
• Intrusion detection system (IDS) monitoring
• Automatic security updates applied weekly

INCIDENT RESPONSE:
• Dedicated incident response team
• Breach notification within 24 hours (GDPR/CCPA compliant)
• Notification to affected individuals within 72 hours
• Notification to regulators where required
• Forensics investigation documented

DATA BACKUP:
• Daily incremental backups
• Weekly full backups
• Backups encrypted and stored separately
• Recovery testing quarterly
• Retention: 30 days for incremental, 1 year for full backups

PENETRATION TESTING:
• Quarterly third-party penetration testing
• Annual SOC 2 Type II audit
• Results available to enterprise customers upon request

EMPLOYEE ACCESS:
• Background checks on all staff with data access
• Data access restricted to job necessity
• Confidentiality agreements signed
• Security training required annually
• Termination process includes access revocation`,
  },
  {
    title: 'THIRD-PARTY DATA SHARING & PROCESSORS',
    content: `TruckWithEase shares data with the following processors:

LOAD BOARDS (USER CHOICE):
• DAT: load history shared when you claim loads (your choice)
• Uber Freight: broker assignments shared (your choice)
• Convoy: available as integration (your choice)
• Control: you can block sharing per load board in Settings

MAPPING & LOCATION:
• Google Maps: real-time location, route planning, traffic data
• Google sees: your origin, destination, route, timestamps
• Retention: 30 days at Google (review their privacy policy)
• Opt-out: use in-app routing instead of Maps

PAYMENT PROCESSING:
• Stripe: payment card information (PCI-DSS Level 1)
• Stripe sees: card number, expiry, CVC, billing address, cardholder name
• We never see your full card number (tokenized)
• Retention: per Stripe's schedule; see stripe.com/privacy

ANALYTICS & PERFORMANCE:
• Mixpanel: aggregated usage data, feature adoption metrics
• Segment: consolidated analytics (sends to Mixpanel, Google Analytics)
• Neither sees personal identifiers (anonymized user ID only)
• Retention: 12 months; you can opt-out

FLEET MANAGEMENT INTEGRATIONS:
• Samsara: real-time GPS, vehicle diagnostics, driver behavior (if connected)
• Geotab: similar fleet data if using their ELD
• You control whether data is shared via Settings > Integrations

HOSTING & INFRASTRUCTURE:
• PocketBase: backend data storage (on secure cloud infrastructure)
• AWS/hosting provider: infrastructure hosting
• Their subprocessors: see their Data Processing Agreement

LEGAL & GOVERNMENT:
• Law enforcement: data provided only with valid subpoena, warrant, or court order
• Tax authorities: tax data (sales records) provided for compliance
• DOT audits: compliance data provided as required
• Regulatory investigations: data disclosed as legally required

DATA PROCESSING AGREEMENTS:
We have Data Processing Agreements (DPA) with:
• Stripe
• Google
• Samsara
• Segment
• Mixpanel
• All agreements include GDPR Article 28 Standard Contractual Clauses

INTERNATIONAL TRANSFERS (GDPR):
Data may be transferred to:
• USA (Standard Contractual Clauses for GDPR compliance)
• EU (no transfer needed)
• Other countries: reviewed case-by-case for adequacy

REMOVING SHARING:
You can opt-out of data sharing:
• Settings > Integrations > disconnect services
• Settings > Privacy > opt-out of analytics
• Settings > Load Boards > disable specific boards
• Account deletion: removes data from all processors (except legal holds)

VENDOR COMPLIANCE REQUIREMENTS:
All vendors must:
• Sign Data Processing Agreement (DPA)
• Provide SOC 2 or ISO 27001 certification
• Implement minimum security controls
• Report any breaches immediately
• Allow audit upon request`,
  },
  {
    title: 'JURISDICTION, COMPLIANCE STANDARDS & LEGAL BASIS',
    content: `TruckWithEase operates under the following legal frameworks:

GOVERNING LAW:
• Primary: Laws of Missouri, USA
• Secondary: Federal laws of the United States
• GDPR applies to users in EU
• CCPA applies to users in California
• Jurisdiction: St. Louis, Missouri (arbitration clause applies)

COMPLIANCE CERTIFICATIONS:
• SOC 2 Type II: annual audit of security and availability controls
• ISO 27001: information security management system
• GDPR: Privacy by Design principles implemented
• CCPA: California Consumer Privacy Act compliant
• ADA: Website accessibility standards (WCAG 2.1 AA)
• HIPAA: Not applicable (no health information processing)

DATA LOCALIZATION:
• Primary data center: United States
• Backup data center: United States
• No data transferred to countries without adequacy determination
• European users: data storage complies with GDPR Article 44-49

RETENTION BASIS:
Data is retained based on:
• Contract necessity: data needed to provide service
• Legal obligation: data required by law to retain
• Legitimate interest: data needed for business operations, fraud prevention, safety
• User consent: marketing data (user can withdraw anytime)

SPECIAL CATEGORIES (GDPR ARTICLE 9):
TruckWithEase does NOT intentionally collect:
• Racial or ethnic origin
• Political opinions
• Religious or philosophical beliefs
• Trade union membership
• Genetic data
• Biometric data for identification
• Health data
• Sex life or sexual orientation data

Note: If you voluntarily include such data in profiles or messages, you consent to processing.

CHILDREN'S DATA (COPPA):
• The Platform is not intended for users under 18
• If you are under 18, do not use the Platform
• We do not knowingly collect data from children under 13
• If discovered, child's data will be deleted immediately
• Contact: privacy@truckwithease.com if you believe child data was collected

VULNERABLE ADULTS:
• Anyone unable to consent should have legal representative create account
• We recommend parental/guardian review of account activity
• Guardians can request account access review

DATA SUBJECT REQUESTS PROCEDURES:
1. Email privacy@truckwithease.com with request type (Access, Correction, Erasure, etc.)
2. Include proof of identity (last 4 of license + birthdate)
3. You will receive acknowledgment within 2 business days
4. Fulfillment within 30 days (45 days for complex requests)
5. Response via email to registered address
6. Right to appeal with Data Protection Authority (GDPR EU users)
7. No fees charged unless request is excessive

REGULATORY COOPERATION:
• Data Protection Authority requests: fulfilled within legal timeframe
• Law enforcement requests: fulfilled with valid legal process
• Subpoenas: verified for authenticity; counsel notified
• Emergency requests: fulfilled if law enforcement provides proper identification

DISPUTE RESOLUTION:
1. First: Submit complaint to TruckWithEase privacy team
2. Second: Escalate to Data Protection Authority (EU/GDPR)
3. Third: File complaint with CCPA enforcement (California users)
4. Fourth: Binding arbitration (see Terms of Service)`,
  },
  {
    title: 'POLICY UPDATES & CONTACT INFORMATION',
    content: `CHANGES TO THIS POLICY:
• Effective date shown at top of this document
• Material changes: notified via email 30 days before effective date
• Non-material changes: effective immediately; notice not required
• Your continued use = acceptance of updated terms

REVIEWING THIS POLICY:
• Full policy available at: truckwithease.com/privacy
• Print-friendly version available at: truckwithease.com/docs/privacy-pdf
• Previous versions available on request (email privacy team)

HOW WE CONTACT YOU:
• Email to address on file (transactional, security alerts, policy updates)
• In-app notifications (feature updates, security notices)
• SMS only if you opt in to alerts
• You control notification frequency in Settings > Notifications

HOW YOU CAN CONTACT US:
Email: privacy@truckwithease.com (response within 2 business days)
Phone: 636-706-8338 (Mon–Fri, 8am–6pm CT)
Mail: TruckWithEase, Privacy Officer, Saint Louis, Missouri
Data Protection Authority (EU users): file complaint with your local DPA

WHO IS RESPONSIBLE:
• Data Controller: TruckWithEase (responsible for compliance)
• Data Processors: PocketBase, Stripe, Google, and others (listed above)
• Data Protection Officer: available on request to privacy@truckwithease.com

COOKIES & TRACKING PREFERENCES:
Go to: Settings > Privacy > manage tracking preferences
Or: truckwithease.com/privacy/manage-cookies

MARKETING OPT-OUT:
Click "unsubscribe" link in any marketing email
Or: Settings > Communications > uncheck "Marketing Emails"
Or: Email privacy@truckwithease.com with subject "Unsubscribe"

DO-NOT-TRACK:
We honor Do-Not-Track browser signals:
• Disable analytics tracking
• Disable third-party tracking
• Do not use behavioral tracking for recommendations

BREACH NOTIFICATION:
If we discover unauthorized access to your data:
• You will be notified within 24 hours
• Details: what data, when, what we're doing
• Notification: email to address on file, plus phone if critical
• Regulatory notification: filed within 72 hours if required

EFFECTIVE DATE: August 21, 2026
LAST UPDATED: August 21, 2026
POLICY VERSION: 1.0`,
  },
];

export default function PrivacyDetailPage() {
  const [expanded, setExpanded] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            Privacy Policy (Extended)
          </h1>
          <p style={{ fontSize: 14, color: C.white60, lineHeight: 1.6 }}>
            <strong>Effective: August 21, 2026</strong><br />
            Complete transparency about how TruckWithEase collects, uses, stores, and protects your data. GDPR, CCPA, and state law compliant.
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
                    lineHeight: 1.8,
                    color: C.white60,
                    whiteSpace: 'pre-wrap',
                    maxHeight: '500px',
                    overflowY: 'auto',
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
            <strong>Questions?</strong> Email privacy@truckwithease.com or call 636-706-8338.
          </p>
        </div>
      </div>
    </div>
  );
}
