// Customer Support — thin client over /api/support
//
// The original (docs/launch/customerSupport.ORIGINAL.js.txt) had two problems:
//
//  1. `createSupportTicket()` built an object, gave it a ticket number, and
//     returned it. Nothing was stored anywhere. Every driver who submitted a
//     ticket on CustomerSupportPage was told it was received and it was not.
//  2. SUPPORT_PHONE was '1-800-TRUCK-EASE' (1-800-878-2532). That number is not
//     owned by this business. Publishing it sends drivers to a stranger. It is
//     now the real published line, 636-706-8338.
//
// Category response times ("1-2 hours") are kept but relabelled as targets —
// there is no staffed 24/7 desk to guarantee them.

const API = "/api/support";

export const SUPPORT_EMAIL = "truckeasecare@gmail.com";
export const SUPPORT_PHONE = "636-706-8338";
export const BILLING_EMAIL = "jeremiahjmorris1126@gmail.com";

export const SUPPORT_HOURS = {
  mon: "6am-10pm CT",
  tue: "6am-10pm CT",
  wed: "6am-10pm CT",
  thu: "6am-10pm CT",
  fri: "6am-10pm CT",
  sat: "7am-9pm CT",
  sun: "8am-8pm CT",
};

export const RESPONSE_TIME_NOTE =
  "Response times are targets, not guarantees. There is no 24/7 staffed support desk yet. Anything safety-critical should be a phone call, not a ticket.";

export const SAFETY_ESCALATION =
  "If you are in immediate danger, call 911. For suicide or crisis support call or text 988. Do not wait on a support ticket.";

export const SUPPORT_CATEGORIES = {
  SAFETY: {
    name: "Safety or Roadside Emergency",
    icon: "🚨",
    description: "Breakdown, accident, unsafe dispatch pressure, being told to run illegal hours",
    responseTime: "immediate — call, do not wait on a ticket",
    priority: "critical",
  },
  COMPLIANCE: {
    name: "HOS, ELD and DOT Compliance",
    icon: "📋",
    description: "Log corrections, ELD malfunction reports, DVIR questions, audit requests",
    responseTime: "same business day (target)",
    priority: "high",
  },
  TECHNICAL: {
    name: "Technical Issues",
    icon: "⚙️",
    description: "App crashes, features not working, login problems, sync failures",
    responseTime: "1-2 business hours (target)",
    priority: "high",
  },
  BILLING: {
    name: "Billing and Subscription",
    icon: "💳",
    description: "Charges, plan changes, invoices, hardware lease questions",
    responseTime: "1 business day (target)",
    priority: "normal",
  },
  HARDWARE: {
    name: "Hardware",
    icon: "📦",
    description: "Tablet, ELD unit, dash cam, install kit — damage, replacement, returns",
    responseTime: "1 business day (target)",
    priority: "normal",
  },
  ACCOUNT: {
    name: "Account and Data",
    icon: "🔐",
    description: "Driver records, document access, export requests, deletion requests",
    responseTime: "2 business days (target)",
    priority: "normal",
  },
  FEEDBACK: {
    name: "Feature Request or Feedback",
    icon: "💡",
    description: "Something missing, something broken by design, something you want built",
    responseTime: "no committed response time",
    priority: "low",
  },
};

export const FAQ_TOPICS = {
  COMPLIANCE: [
    {
      q: "My ELD stopped recording mid-shift. What do I do?",
      a: "Note the time and reason, switch to paper logs immediately, and keep them for 8 days. Report the malfunction to the carrier within 24 hours — 49 CFR 395.34 requires the carrier to repair or replace within 8 days. File it under HOS/ELD Compliance so there is a record with a timestamp.",
    },
    {
      q: "Can I edit an HOS log after it is certified?",
      a: "You can request an edit, but driving time recorded automatically can never be shortened or deleted — not by you, not by a dispatcher. Annotations are added, the original stays. Anyone telling you otherwise is asking you to falsify a federal record.",
    },
    {
      q: "Do I have to take a 30-minute break?",
      a: "Yes — after 8 cumulative hours of driving time without a 30-minute interruption. The break can be off-duty, sleeper, or on-duty-not-driving.",
    },
  ],
  BILLING: [
    {
      q: "How does per-driver billing work if a driver leaves mid-month?",
      a: "Billing is per active driver. Deactivate the driver and the next invoice drops. There are no contracts and no cancellation fee.",
    },
    {
      q: "What happens after the 14-day trial?",
      a: "The trial does not auto-charge without a payment method on file. If you add one, the plan you selected starts at the end of the 14 days. Net 30 terms are available for Fleet accounts.",
    },
  ],
  HARDWARE: [
    {
      q: "What is included in the $600 per truck?",
      a: "Tablet plus ELD unit ($380), dash cam ($180), and install kit ($40). On the $49.99/truck/month Fleet plan the hardware is leased and included instead.",
    },
  ],
  TECHNICAL: [
    {
      q: "The app is not syncing. Do I lose my logs?",
      a: "No. Logs are recorded locally first and pushed when a connection returns. Do not reinstall while unsynced — that is the one action that can lose data.",
    },
  ],
};

async function req(path, opts) {
  const res = await fetch(API + path, opts);
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `${path} failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Create a support ticket. Now actually persists server-side.
 * Returns `{ stored: true, ticketNumber }` — check `stored` before telling the
 * driver anything was received.
 */
export async function createSupportTicket(ticket) {
  const payload = {
    category: (ticket?.category || "TECHNICAL").toUpperCase(),
    subject: ticket?.subject || "",
    body: ticket?.body || ticket?.message || ticket?.description || "",
    driverId: ticket?.driverId || null,
    contactEmail: ticket?.email || ticket?.contactEmail || null,
    contactPhone: ticket?.phone || ticket?.contactPhone || null,
  };
  try {
    return await req("/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      stored: false,
      error: e.message,
      note: `Ticket was NOT saved. Email ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE} instead.`,
    };
  }
}

/** List tickets, optionally for one driver. */
export async function listSupportTickets(driverId) {
  const qs = driverId ? `?driverId=${encodeURIComponent(driverId)}` : "";
  const r = await req(`/tickets${qs}`);
  return r.tickets || [];
}

/** Update a ticket's status. */
export async function setTicketStatus(id, status, resolution) {
  return req(`/tickets/${encodeURIComponent(id)}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, resolution: resolution || null }),
  });
}

/** Server-side support config, including whether the desk is open right now. */
export async function getSupportConfig() {
  try {
    return await req("/");
  } catch {
    return {
      email: SUPPORT_EMAIL,
      phone: SUPPORT_PHONE,
      hours: SUPPORT_HOURS,
      openNow: null,
      categories: SUPPORT_CATEGORIES,
      responseTimeNote: RESPONSE_TIME_NOTE,
      safetyEscalation: SAFETY_ESCALATION,
      note: "Server unreachable — showing built-in contact details.",
    };
  }
}

export function getSupportEmail() {
  return SUPPORT_EMAIL;
}

/** Array of { day, hours } in week order — the shape the support page renders. */
export function getSupportHours() {
  return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    hours: SUPPORT_HOURS[day],
  }));
}

/** Local Central-time check. The server returns the authoritative value. */
export function isSupportAvailable(now = new Date()) {
  const ct = new Date(now.getTime() - 5 * 3600_000); // CDT
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][ct.getUTCDay()];
  const windows = { sun: [8, 20], mon: [6, 22], tue: [6, 22], wed: [6, 22], thu: [6, 22], fri: [6, 22], sat: [7, 21] };
  const [open, close] = windows[day];
  const h = ct.getUTCHours();
  return { available: h >= open && h < close, day, hours: SUPPORT_HOURS[day] };
}

export function getFAQByCategory(category) {
  return FAQ_TOPICS[(category || "").toUpperCase()] || [];
}

export function searchFAQ(keyword) {
  const k = (keyword || "").toLowerCase().trim();
  if (!k) return [];
  const out = [];
  for (const [cat, items] of Object.entries(FAQ_TOPICS)) {
    for (const item of items) {
      if (item.q.toLowerCase().includes(k) || item.a.toLowerCase().includes(k)) {
        out.push({ category: cat, ...item });
      }
    }
  }
  return out;
}
