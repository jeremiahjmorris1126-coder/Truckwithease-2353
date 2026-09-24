// Gmail API v1 Service for Truckwithease Fleet Communications & Compliance Messaging
import { getAccessToken } from '../firebase';

export interface GmailLabel {
  id: string;
  name: string;
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
  color?: {
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
  data?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId?: string;
  internalDate: string;
  // Parsed fields
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  date: string;
  bodyHtml?: string;
  bodyText?: string;
  isUnread?: boolean;
  isStarred?: boolean;
  isImportant?: boolean;
  attachments?: EmailAttachment[];
  // Fleet domain classification
  fleetCategory?: 'DISPATCH' | 'COMPLIANCE' | 'DVIR_MAINTENANCE' | 'RATE_CON' | 'BROKER' | 'SAFETY' | 'GENERAL';
  compliancePriority?: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
}

export interface GmailUserProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface ComposeEmailPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyHtml?: string;
  bodyText: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  attachments?: {
    filename: string;
    mimeType: string;
    base64Data: string;
  }[];
}

// System sample fleet emails for demonstration and instant offline UI preview
export const SAMPLE_FLEET_EMAILS: GmailMessage[] = [
  {
    id: 'msg-fmcsa-01',
    threadId: 'thread-01',
    labelIds: ['INBOX', 'IMPORTANT', 'UNREAD'],
    snippet: 'URGENT: Annual Clearinghouse Queries Due for 14 Assigned Commercial Drivers (USDOT #3928192)...',
    internalDate: String(Date.now() - 1000 * 60 * 35),
    subject: 'CRITICAL: Annual Clearinghouse Compliance Audit Notice - USDOT #3928192',
    from: {
      name: 'FMCSA Safety Audit Division',
      email: 'notifications@fmcsa.dot.gov',
    },
    to: [{ name: 'Titan Carrier Safety Team', email: 'safety@titancarriers.com' }],
    date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    bodyHtml: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #c92a2a; border-bottom: 2px solid #c92a2a; padding-bottom: 8px;">FMCSA Clearinghouse Compliance Notification</h2>
      <p><strong>Carrier:</strong> TITAN CARRIER SERVICES LLC (USDOT: 3928192 | MC: 981244)</p>
      <p>This automated compliance reminder indicates that your annual mandatory FMCSA Drug & Alcohol Clearinghouse queries are due within 14 calendar days for <strong>14 active commercial motor vehicle drivers</strong> under 49 CFR § 382.701(b).</p>
      <div style="background: #fff5f5; border-left: 4px solid #c92a2a; padding: 12px; margin: 16px 0;">
        <strong>Action Required:</strong> Submit bulk driver query consent via the portal or synchronize via Truckwithease API Gateway to maintain unblemished Safety Fitness Rating (SFR).
      </div>
      <p>Direct Inquiries: DOT Hotline 1-800-832-5660 | Clearinghouse ID: CLH-992810</p>
    </div>`,
    bodyText: 'Annual Clearinghouse Compliance Audit Notice for USDOT #3928192. 14 commercial drivers pending query under 49 CFR 382.701(b). Action required within 14 calendar days.',
    isUnread: true,
    isStarred: true,
    isImportant: true,
    fleetCategory: 'COMPLIANCE',
    compliancePriority: 'CRITICAL',
    attachments: [
      {
        filename: 'FMCSA_Clearinghouse_Directives_2026.pdf',
        mimeType: 'application/pdf',
        size: 245000,
      },
    ],
  },
  {
    id: 'msg-ratecon-02',
    threadId: 'thread-02',
    labelIds: ['INBOX'],
    snippet: 'Rate Confirmation #RC-89210 - Chicago, IL to Dallas, TX ($3,850.00 Gross / 920 Miles)...',
    internalDate: String(Date.now() - 1000 * 60 * 120),
    subject: 'RATE CON #RC-89210: 44,000 lbs Reefer - Chicago IL -> Dallas TX ($3,850.00)',
    from: {
      name: 'Apex Freight Logistics Dispatch',
      email: 'dispatch@apexfreightlogistics.com',
    },
    to: [{ name: 'Titan Carrier Operations', email: 'dispatch@titancarriers.com' }],
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    bodyHtml: `<div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h3 style="color: #1a73e8;">RATE CONFIRMATION & BROKER-CARRIER AGREEMENT</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background: #f1f3f4;"><th style="padding: 8px; text-align: left;">Order ID</th><td style="padding: 8px;">RC-89210-TX</td></tr>
        <tr><th style="padding: 8px; text-align: left;">Rate (Flat)</th><td style="padding: 8px; font-weight: bold; color: #0d904f;">$3,850.00 USD ($4.18/mi)</td></tr>
        <tr style="background: #f1f3f4;"><th style="padding: 8px; text-align: left;">Origin</th><td style="padding: 8px;">Cold Storage Hub, Chicago, IL (08:00 CT)</td></tr>
        <tr><th style="padding: 8px; text-align: left;">Destination</th><td style="padding: 8px;">Grocery Distribution, Dallas, TX (Next Day 14:00 CT)</td></tr>
        <tr style="background: #f1f3f4;"><th style="padding: 8px; text-align: left;">Commodity</th><td style="padding: 8px;">Refrigerated Produce (Continuous -10°F)</td></tr>
      </table>
      <p style="margin-top: 14px;">Please e-sign this confirmation or reply ACCEPT to lock Unit 104.</p>
    </div>`,
    bodyText: 'Rate Confirmation RC-89210. Chicago, IL to Dallas, TX. Rate: $3,850.00 ($4.18/mi). 44,000 lbs Reefer. Continuous -10F.',
    isUnread: false,
    isStarred: true,
    isImportant: true,
    fleetCategory: 'RATE_CON',
    compliancePriority: 'HIGH',
    attachments: [
      {
        filename: 'RateConfirmation_RC-89210.pdf',
        mimeType: 'application/pdf',
        size: 188000,
      },
    ],
  },
  {
    id: 'msg-dvir-03',
    threadId: 'thread-03',
    labelIds: ['INBOX', 'UNREAD'],
    snippet: 'Pre-Trip DVIR Defect Notice: Unit #104 Brake Pad Wear Exceeds 80% Threshold...',
    internalDate: String(Date.now() - 1000 * 60 * 240),
    subject: 'DVIR ALERT: Unit #104 Pre-Trip Inspection - Brake Slack Adjuster Warning',
    from: {
      name: 'Truckwithease DVIR Autonomous Agent',
      email: 'dvir-agent@system.truckwithease.internal',
    },
    to: [
      { name: 'Titan Fleet Maintenance', email: 'maintenance@titancarriers.com' },
      { name: 'Driver J. Morris (Unit 104)', email: 'driver104@titancarriers.com' },
    ],
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    bodyHtml: `<div style="font-family: Arial, sans-serif; color: #222;">
      <h3 style="color: #d9381e;">⚠️ PRE-TRIP VEHICLE INSPECTION EXCEPTION DETECTED</h3>
      <p><strong>Vehicle Unit:</strong> #104 (2024 Freightliner Cascadia | VIN: 1FUJGLDR8PL892101)</p>
      <p><strong>Odometer:</strong> 142,390 mi | <strong>Inspector:</strong> Driver Jeremiah Morris</p>
      <div style="background: #fff8e1; border: 1px solid #ffe082; padding: 12px; border-radius: 6px; margin: 12px 0;">
        <p style="margin: 0; font-weight: bold; color: #f57f17;">Component: Steer Axle Left Slack Adjuster & Lining</p>
        <p style="margin: 4px 0 0 0; font-size: 14px;">Audible air stroke displacement slightly beyond 1.75-inch limit under 90 PSI brake application test (49 CFR § 393.47).</p>
      </div>
      <p>Work Order #WO-4089 automatically drafted in Maintenance Ledger. Roadside clearance pending master technician sign-off.</p>
    </div>`,
    bodyText: 'PRE-TRIP DVIR DEFECT: Unit #104 Steer Axle Left Slack Adjuster stroke warning. 49 CFR 393.47. Work order WO-4089 created.',
    isUnread: true,
    isStarred: false,
    isImportant: true,
    fleetCategory: 'DVIR_MAINTENANCE',
    compliancePriority: 'HIGH',
    attachments: [
      {
        filename: 'DVIR_PreTrip_Unit104_Signoff.pdf',
        mimeType: 'application/pdf',
        size: 310000,
      },
    ],
  },
  {
    id: 'msg-samsara-04',
    threadId: 'thread-04',
    labelIds: ['INBOX'],
    snippet: 'Samsara Cloud Gateway Telematics Sync: Firmware 2026.3.1 Deployed on 18 Units...',
    internalDate: String(Date.now() - 1000 * 60 * 60 * 18),
    subject: 'Telematics Gateway Diagnostic: 100% CAN-Bus Packet Integrity Verified',
    from: {
      name: 'Samsara Fleet Integration',
      email: 'integrations@samsara.com',
    },
    to: [{ name: 'Titan Carrier Systems', email: 'tech@titancarriers.com' }],
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    bodyHtml: `<div style="font-family: Arial, sans-serif;">
      <h3 style="color: #0b8043;">Telemetry Stream Health Report</h3>
      <p>All 18 vehicle edge nodes across your fleet reported healthy J1939 CAN-bus telemetry packets with 0 dropped frames in the last 24 hours.</p>
      <ul>
        <li>Average Latency: 16.4 ms</li>
        <li>Active Geofence Pings: 14,892</li>
        <li>Fuel Sensor Accuracy: 99.4%</li>
      </ul>
    </div>`,
    bodyText: 'Telematics Gateway Diagnostic: 100% CAN-Bus Packet Integrity Verified across 18 units.',
    isUnread: false,
    isStarred: false,
    isImportant: false,
    fleetCategory: 'DISPATCH',
    compliancePriority: 'NORMAL',
  },
  {
    id: 'msg-pilot-05',
    threadId: 'thread-05',
    labelIds: ['INBOX'],
    snippet: 'Pilot Flying J / Love’s Fleet Diesel Statement: $1,420.80 Saved via Fuel Card Discounts...',
    internalDate: String(Date.now() - 1000 * 60 * 60 * 36),
    subject: 'Fleet Fuel Card Rebate Statement - Week 10: $1,420.80 Net Savings',
    from: {
      name: 'FleetOne Fuel Network',
      email: 'billing@fleetone.com',
    },
    to: [{ name: 'Titan Carrier Accounts', email: 'accounts@titancarriers.com' }],
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    bodyHtml: `<div style="font-family: Arial, sans-serif;">
      <h3>Weekly Fleet Fuel Summary</h3>
      <p>Total Gallons Dispensed: 4,890.2 gal</p>
      <p>Average Pump Price: $3.78/gal</p>
      <p>Your Discounted Network Price: $3.49/gal</p>
      <p><strong>Total Weekly Savings: $1,420.80</strong></p>
    </div>`,
    bodyText: 'Fleet Fuel Rebate Statement: $1,420.80 saved across 4,890 gallons.',
    isUnread: false,
    isStarred: false,
    isImportant: false,
    fleetCategory: 'GENERAL',
    compliancePriority: 'LOW',
  },
];

export const SYSTEM_LABELS: GmailLabel[] = [
  { id: 'INBOX', name: 'Inbox', type: 'system', messagesTotal: 28, messagesUnread: 3 },
  { id: 'STARRED', name: 'Starred', type: 'system', messagesTotal: 4, messagesUnread: 0 },
  { id: 'IMPORTANT', name: 'Important', type: 'system', messagesTotal: 7, messagesUnread: 2 },
  { id: 'SENT', name: 'Sent', type: 'system', messagesTotal: 42, messagesUnread: 0 },
  { id: 'DRAFT', name: 'Drafts', type: 'system', messagesTotal: 2, messagesUnread: 0 },
  { id: 'TRASH', name: 'Trash', type: 'system', messagesTotal: 5, messagesUnread: 0 },
  { id: 'CATEGORY_COMPLIANCE', name: 'DOT & Compliance', type: 'user', messagesTotal: 12, messagesUnread: 2 },
  { id: 'CATEGORY_DISPATCH', name: 'Dispatch & Loads', type: 'user', messagesTotal: 16, messagesUnread: 1 },
  { id: 'CATEGORY_MAINTENANCE', name: 'DVIR & Repairs', type: 'user', messagesTotal: 8, messagesUnread: 1 },
];

// Helper: Decode base64url safe string
function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return jsonPayload;
  } catch (e) {
    try {
      return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

// Helper: Encode to base64url
function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Parse Raw Gmail Message payload into clean structured GmailMessage
export function parseRawGmailMessage(raw: any): GmailMessage {
  const headers: EmailHeader[] = raw.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const fromStr = getHeader('From');
  let fromName = fromStr;
  let fromEmail = fromStr;
  const fromMatch = fromStr.match(/(.*)<(.*)>/);
  if (fromMatch) {
    fromName = fromMatch[1].trim().replace(/^"|"$/g, '');
    fromEmail = fromMatch[2].trim();
  }

  const toStr = getHeader('To');
  const toList = toStr ? [{ name: toStr.replace(/<.*>/, '').trim(), email: toStr }] : [];

  let bodyHtml = '';
  let bodyText = '';
  const attachments: EmailAttachment[] = [];

  const parseParts = (part: any) => {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml += decodeBase64Url(part.body.data);
    } else if (part.filename && part.body) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      });
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(parseParts);
    }
  };

  if (raw.payload) {
    parseParts(raw.payload);
  }

  const labelIds = raw.labelIds || [];
  const isUnread = labelIds.includes('UNREAD');
  const isStarred = labelIds.includes('STARRED');
  const isImportant = labelIds.includes('IMPORTANT');

  const subject = getHeader('Subject') || '(No Subject)';
  
  // Categorize for fleet management
  let fleetCategory: GmailMessage['fleetCategory'] = 'GENERAL';
  let compliancePriority: GmailMessage['compliancePriority'] = 'NORMAL';
  const subLower = subject.toLowerCase() + ' ' + (raw.snippet || '').toLowerCase();

  if (subLower.includes('fmcsa') || subLower.includes('clearinghouse') || subLower.includes('dot') || subLower.includes('audit') || subLower.includes('hos')) {
    fleetCategory = 'COMPLIANCE';
    compliancePriority = 'CRITICAL';
  } else if (subLower.includes('dvir') || subLower.includes('inspection') || subLower.includes('repair') || subLower.includes('defect') || subLower.includes('brake') || subLower.includes('maintenance')) {
    fleetCategory = 'DVIR_MAINTENANCE';
    compliancePriority = 'HIGH';
  } else if (subLower.includes('rate con') || subLower.includes('broker') || subLower.includes('load') || subLower.includes('reefer') || subLower.includes('bol')) {
    fleetCategory = 'RATE_CON';
    compliancePriority = 'HIGH';
  } else if (subLower.includes('dispatch') || subLower.includes('telematics') || subLower.includes('gps') || subLower.includes('samsara')) {
    fleetCategory = 'DISPATCH';
    compliancePriority = 'NORMAL';
  }

  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds,
    snippet: raw.snippet || '',
    historyId: raw.historyId,
    internalDate: raw.internalDate || String(Date.now()),
    subject,
    from: { name: fromName || fromEmail || 'Unknown', email: fromEmail || fromStr },
    to: toList,
    date: getHeader('Date') || new Date().toISOString(),
    bodyHtml: bodyHtml || undefined,
    bodyText: bodyText || raw.snippet || '',
    isUnread,
    isStarred,
    isImportant,
    attachments: attachments.length > 0 ? attachments : undefined,
    fleetCategory,
    compliancePriority,
  };
}

// ---------------------------------------------------------------------------
// GMAIL LIVE API CLIENT CALLS
// ---------------------------------------------------------------------------

export async function fetchGmailUserProfile(token?: string): Promise<GmailUserProfile | null> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) return null;

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Gmail API error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Gmail user profile:', err);
    return null;
  }
}

export async function fetchGmailLabelsList(token?: string): Promise<GmailLabel[]> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) return SYSTEM_LABELS;

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return SYSTEM_LABELS;
    const data = await res.json();
    return data.labels || SYSTEM_LABELS;
  } catch (err) {
    console.warn('Using system labels fallback:', err);
    return SYSTEM_LABELS;
  }
}

export async function fetchGmailMessagesList(
  token?: string,
  options?: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  }
): Promise<{ messages: GmailMessage[]; nextPageToken?: string }> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    // Return sample offline data filtered by query or label
    let filtered = [...SAMPLE_FLEET_EMAILS];
    if (options?.labelIds && options.labelIds.length > 0) {
      const targetLabel = options.labelIds[0];
      if (targetLabel === 'STARRED') {
        filtered = filtered.filter((m) => m.isStarred);
      } else if (targetLabel === 'UNREAD') {
        filtered = filtered.filter((m) => m.isUnread);
      } else if (targetLabel === 'IMPORTANT') {
        filtered = filtered.filter((m) => m.isImportant);
      } else if (targetLabel === 'TRASH') {
        filtered = [];
      }
    }
    if (options?.q) {
      const qLower = options.q.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(qLower) ||
          m.snippet.toLowerCase().includes(qLower) ||
          m.from.name.toLowerCase().includes(qLower) ||
          m.from.email.toLowerCase().includes(qLower)
      );
    }
    return { messages: filtered };
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.set('maxResults', String(options?.maxResults || 20));
    if (options?.q) queryParams.set('q', options.q);
    if (options?.labelIds) {
      options.labelIds.forEach((id) => queryParams.append('labelIds', id));
    }
    if (options?.pageToken) queryParams.set('pageToken', options.pageToken);

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.warn(`Gmail messages list returned status ${res.status}. Using fallback.`);
      return { messages: SAMPLE_FLEET_EMAILS };
    }

    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) {
      return { messages: [] };
    }

    // Fetch individual full messages in parallel (up to 15)
    const detailPromises = data.messages.slice(0, 15).map(async (m: { id: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (msgRes.ok) {
          const raw = await msgRes.json();
          return parseRawGmailMessage(raw);
        }
      } catch (err) {
        console.warn(`Failed to fetch message ${m.id}`, err);
      }
      return null;
    });

    const parsedMessages = (await Promise.all(detailPromises)).filter(
      (m): m is GmailMessage => m !== null
    );

    return {
      messages: parsedMessages.length > 0 ? parsedMessages : SAMPLE_FLEET_EMAILS,
      nextPageToken: data.nextPageToken,
    };
  } catch (err) {
    console.error('Error in fetchGmailMessagesList:', err);
    return { messages: SAMPLE_FLEET_EMAILS };
  }
}

export async function fetchSingleGmailMessage(
  messageId: string,
  token?: string
): Promise<GmailMessage | null> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    return SAMPLE_FLEET_EMAILS.find((m) => m.id === messageId) || null;
  }

  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) throw new Error(`Failed to load message: ${res.status}`);
    const raw = await res.json();
    return parseRawGmailMessage(raw);
  } catch (err) {
    console.error('Failed to fetch message details:', err);
    return SAMPLE_FLEET_EMAILS.find((m) => m.id === messageId) || null;
  }
}

// Build RFC 2822 / MIME email string
function createMimeMessage(payload: ComposeEmailPayload): string {
  const boundary = `====_TruckWithEase_${Date.now()}_====`;
  const lines: string[] = [];

  lines.push(`To: ${payload.to}`);
  if (payload.cc) lines.push(`Cc: ${payload.cc}`);
  if (payload.bcc) lines.push(`Bcc: ${payload.bcc}`);
  lines.push(`Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`);
  lines.push('MIME-Version: 1.0');

  if (payload.inReplyTo) lines.push(`In-Reply-To: ${payload.inReplyTo}`);
  if (payload.references) lines.push(`References: ${payload.references}`);

  if (payload.attachments && payload.attachments.length > 0) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/html; charset="UTF-8"');
    lines.push('Content-Transfer-Encoding: 8bit');
    lines.push('');
    lines.push(payload.bodyHtml || payload.bodyText.replace(/\n/g, '<br/>'));
    lines.push('');

    payload.attachments.forEach((att) => {
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${att.mimeType}; name="${att.filename}"`);
      lines.push('Content-Transfer-Encoding: base64');
      lines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
      lines.push('');
      lines.push(att.base64Data);
      lines.push('');
    });

    lines.push(`--${boundary}--`);
  } else if (payload.bodyHtml) {
    lines.push('Content-Type: text/html; charset="UTF-8"');
    lines.push('Content-Transfer-Encoding: 8bit');
    lines.push('');
    lines.push(payload.bodyHtml);
  } else {
    lines.push('Content-Type: text/plain; charset="UTF-8"');
    lines.push('Content-Transfer-Encoding: 8bit');
    lines.push('');
    lines.push(payload.bodyText);
  }

  return lines.join('\r\n');
}

export async function sendGmailMessage(
  payload: ComposeEmailPayload,
  token?: string
): Promise<{ success: boolean; id?: string; threadId?: string; error?: string }> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    return {
      success: true,
      id: `local-sent-${Date.now()}`,
      threadId: payload.threadId || `thread-${Date.now()}`,
    };
  }

  try {
    const rawMime = createMimeMessage(payload);
    const encodedRaw = encodeBase64Url(rawMime);

    const body: any = { raw: encodedRaw };
    if (payload.threadId) {
      body.threadId = payload.threadId;
    }

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Failed to send email: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, id: data.id, threadId: data.threadId };
  } catch (err: any) {
    console.error('Failed to send Gmail message:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function createGmailDraft(
  payload: ComposeEmailPayload,
  token?: string
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    return { success: true, draftId: `draft-${Date.now()}` };
  }

  try {
    const rawMime = createMimeMessage(payload);
    const encodedRaw = encodeBase64Url(rawMime);

    const body = {
      message: {
        raw: encodedRaw,
        ...(payload.threadId ? { threadId: payload.threadId } : {}),
      },
    };

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Failed to save draft: ${res.statusText}`);
    const data = await res.json();
    return { success: true, draftId: data.id };
  } catch (err: any) {
    console.error('Failed to create draft:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function modifyGmailLabels(
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = [],
  token?: string
): Promise<boolean> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) return true;

  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addLabelIds, removeLabelIds }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to modify labels for message ${messageId}:`, err);
    return false;
  }
}

export async function trashGmailMessage(messageId: string, token?: string): Promise<boolean> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) return true;

  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to trash message ${messageId}:`, err);
    return false;
  }
}

export async function deleteGmailMessagePermanently(
  messageId: string,
  token?: string
): Promise<boolean> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) return true;

  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to permanently delete message ${messageId}:`, err);
    return false;
  }
}
