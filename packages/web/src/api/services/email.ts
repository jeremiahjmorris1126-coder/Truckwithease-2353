/**
 * Transactional email — Postmark.
 *
 * Chosen by Jeremiah on 2026-08-28. Postmark over Resend/Mailgun; SES was ruled
 * out because this platform uses no AWS and the SES MX on morrishive.com is his
 * existing inbound mail, not our sender.
 *
 * WHY PLAIN FETCH AND NOT THE npm PACKAGE
 *   Postmark's send endpoint is one POST with one header. Adding a dependency
 *   buys nothing and the official SDK pulls its own HTTP stack.
 *
 * RULES THIS FILE FOLLOWS
 *   - Server-side only. POSTMARK_SERVER_TOKEN has no VITE_ prefix and is never
 *     returned to the browser, not even a masked version.
 *   - Nothing in this platform ever claims a document was emailed unless
 *     Postmark returned a MessageID. `sendEmail` throws on every other outcome,
 *     and callers surface the raw Postmark ErrorCode.
 *   - No silent no-op. If the token is missing, `sendEmail` throws with what is
 *     missing — it does not pretend to queue.
 *
 * POSTMARK CONSTRAINT THAT STILL BLOCKS REAL SENDING (verified 2026-08-28)
 *   Postmark refuses sender addresses on public domains. From their own docs:
 *   "we don't allow email addresses on public domains such as Gmail and Yahoo."
 *   So EMAIL_FROM cannot be jeremiahjmorris1126@gmail.com or
 *   truckeasecare@gmail.com. It has to be a mailbox on a domain we control —
 *   morrishive.com — with Postmark's DKIM and Return-Path records published in
 *   DNS. Until that is done, Postmark answers 300/401 and this module reports it
 *   verbatim rather than swallowing it.
 */

const API = "https://api.postmarkapp.com/email";
const TIMEOUT_MS = 15000;

const clean = (k: string) => String(process.env[k] ?? "").replace(/"/g, "").trim();

/** Postmark server token. Server-scoped, found on the API Tokens tab of the server. */
export const postmarkToken = () => clean("POSTMARK_SERVER_TOKEN");

/** The verified sender. Must be a Postmark Sender Signature or a verified domain. */
export const emailFrom = () => clean("EMAIL_FROM");

/** Where replies land. Defaults to the support inbox, which may be a gmail — reply-to is unrestricted. */
export const emailReplyTo = () => clean("EMAIL_REPLY_TO") || "truckeasecare@gmail.com";

export const emailConfigured = () => Boolean(postmarkToken() && emailFrom());

/** Non-secret description of the mail setup, safe to return from an API route. */
export function emailInfo() {
  const token = postmarkToken();
  const from = emailFrom();
  const fromDomain = from.includes("@") ? from.split("@")[1].toLowerCase() : null;
  const publicDomain = fromDomain ? ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com"].includes(fromDomain) : false;
  return {
    provider: "postmark" as const,
    tokenPresent: Boolean(token),
    from: from || null,
    fromDomain,
    replyTo: emailReplyTo(),
    configured: emailConfigured(),
    /** True when the From address can never be verified by Postmark as written. */
    fromOnPublicDomain: publicDomain,
    blockers: [
      !token ? "POSTMARK_SERVER_TOKEN is not set." : null,
      !from ? "EMAIL_FROM is not set." : null,
      publicDomain ? `EMAIL_FROM is on ${fromDomain}, which Postmark refuses. Use a mailbox on a domain you control.` : null,
    ].filter(Boolean) as string[],
  };
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  /** Postmark message stream. "outbound" is transactional; broadcasts need their own stream. */
  stream?: string;
  attachments?: { Name: string; Content: string; ContentType: string }[];
  /** Grouped in Postmark's UI so a bounce can be traced to a feature. */
  tag?: string;
};

export type SendEmailResult = {
  messageId: string;
  to: string;
  submittedAt: string;
  provider: "postmark";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Send one email. Resolves only when Postmark accepted it and returned a
 * MessageID. Throws with Postmark's own message on anything else.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const token = postmarkToken();
  const from = emailFrom();
  if (!token) throw new Error("Email is not configured: POSTMARK_SERVER_TOKEN is not set on the server.");
  if (!from) throw new Error("Email is not configured: EMAIL_FROM is not set on the server.");

  const list = (Array.isArray(opts.to) ? opts.to : [opts.to]).map((s) => String(s).trim()).filter(Boolean);
  if (!list.length) throw new Error("No recipient address was given.");
  const badAddr = list.find((a) => !EMAIL_RE.test(a));
  if (badAddr) throw new Error(`That does not look like an email address: ${badAddr}`);
  if (!opts.subject?.trim()) throw new Error("Subject is required.");
  if (!opts.text?.trim() && !opts.html?.trim()) throw new Error("Either text or html body is required.");

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        From: from,
        To: list.join(","),
        Subject: opts.subject,
        TextBody: opts.text,
        HtmlBody: opts.html,
        ReplyTo: opts.replyTo || emailReplyTo(),
        MessageStream: opts.stream || "outbound",
        Tag: opts.tag,
        Attachments: opts.attachments,
        TrackOpens: false,
      }),
      signal: ctl.signal,
    });

    const j: any = await r.json().catch(() => null);
    if (!r.ok || !j?.MessageID) {
      // Postmark returns its own ErrorCode; 300 = bad From/To, 401 = bad token,
      // 405 = account not approved for sending yet. Pass it through unedited.
      const code = j?.ErrorCode !== undefined ? ` (Postmark ErrorCode ${j.ErrorCode})` : "";
      throw new Error(`Postmark rejected the send${code}: ${j?.Message ?? `HTTP ${r.status}`}`);
    }
    return {
      messageId: String(j.MessageID),
      to: String(j.To ?? list.join(",")),
      submittedAt: String(j.SubmittedAt ?? new Date().toISOString()),
      provider: "postmark",
    };
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error(`Postmark did not answer within ${TIMEOUT_MS}ms. Nothing was sent.`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Verify the token against Postmark without sending anything.
 * GET /server returns the server this token belongs to.
 */
export async function verifyEmailToken(): Promise<{ ok: boolean; status: number | null; detail: string }> {
  const token = postmarkToken();
  if (!token) return { ok: false, status: null, detail: "POSTMARK_SERVER_TOKEN is not set." };
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch("https://api.postmarkapp.com/server", {
      headers: { "X-Postmark-Server-Token": token, Accept: "application/json" },
      signal: ctl.signal,
    });
    const j: any = await r.json().catch(() => null);
    if (!r.ok) return { ok: false, status: r.status, detail: j?.Message ?? `HTTP ${r.status}` };
    return {
      ok: true,
      status: r.status,
      detail: `Token belongs to Postmark server "${j?.Name ?? "unknown"}". Note: a valid token does not mean mail will deliver — the From address still needs a verified Sender Signature or domain.`,
    };
  } catch (e: any) {
    return { ok: false, status: null, detail: e?.name === "AbortError" ? `Timed out after ${TIMEOUT_MS}ms.` : String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}
