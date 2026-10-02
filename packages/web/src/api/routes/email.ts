import { Hono } from "hono";
import { emailConfigured, emailInfo, sendEmail, verifyEmailToken } from "../services/email";

/**
 * Email routes — Postmark.
 *
 * Built 2026-08-28 after Jeremiah chose Postmark over Resend and Mailgun.
 *
 * WHAT THIS ROUTE WILL NOT DO
 *   - It never returns POSTMARK_SERVER_TOKEN, or any part of it.
 *   - It never reports an email as sent without a Postmark MessageID. Every
 *     failure returns Postmark's own message and ErrorCode, unedited.
 *   - There is no marketing/bulk send here. This is transactional only.
 */

const bad = (msg: string) => ({ error: msg });

export const email = new Hono()
  /** Non-secret view of the mail setup and exactly what is still missing. */
  .get("/status", (c) => {
    const info = emailInfo();
    return c.json({
      ...info,
      note: info.configured
        ? "A token and a From address are set. Call POST /api/email/verify to confirm Postmark accepts the token, and POST /api/email/test to prove a real message lands."
        : "Email is not sendable yet. Everything in blockers must be resolved first. Until then TRAXES files documents and mints signed links, and never claims anything was emailed.",
      dnsRequired: [
        "Postmark refuses senders on public domains (gmail.com, yahoo.com and the rest), so EMAIL_FROM must be a mailbox on morrishive.com.",
        "Add the DKIM TXT record Postmark generates for that domain.",
        "Add the Return-Path CNAME Postmark generates, so bounces come back to us.",
        "The existing MX record (inbound-smtp.us-east-1.amazonaws.com, priority 9) is inbound mail and is untouched by any of this.",
      ],
      generatedAt: new Date().toISOString(),
    });
  })

  /** Verify the token against Postmark without sending mail. */
  .post("/verify", async (c) => {
    const r = await verifyEmailToken();
    return c.json({ ...r, provider: "postmark", checkedAt: new Date().toISOString() }, r.ok ? 200 : 502);
  })

  /**
   * Send one real test message. Deliberately requires an explicit recipient —
   * there is no default address, so nobody gets surprise mail.
   */
  .post("/test", async (c) => {
    if (!emailConfigured()) return c.json({ ...bad("Email is not configured."), blockers: emailInfo().blockers }, 503);
    const b = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const to = String(b.to ?? "").trim();
    if (!to) return c.json(bad("Pass { to: \"someone@example.com\" }. There is no default recipient."), 400);
    try {
      const r = await sendEmail({
        to,
        subject: "TruckWithEase — Postmark test",
        text:
          "This is a test message from TruckWithEase.\n\n" +
          "If you are reading it, Postmark accepted the send, the From address is verified, and the platform can email a broker a rate confirmation, an invoice, or a scanned BOL.\n\n" +
          "Nothing about this message was simulated.\n\nTruckWithEase — Drive Smart. Stay Compliant.",
        tag: "test",
      });
      return c.json({ sent: true, ...r, note: "Postmark returned a MessageID. That means accepted for delivery, which is not the same as landed in the inbox — check the Postmark activity feed for the delivery event." });
    } catch (e) {
      return c.json(bad((e as Error).message), 502);
    }
  })

  /**
   * Send a document to a broker or shipper. Used by TRAXES.
   * The caller supplies the link; this route does not read storage itself.
   */
  .post("/send-document", async (c) => {
    if (!emailConfigured()) return c.json({ ...bad("Email is not configured."), blockers: emailInfo().blockers }, 503);
    const b = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const to = String(b.to ?? "").trim();
    const label = String(b.label ?? "Document").trim();
    const link = String(b.link ?? "").trim();
    const message = String(b.message ?? "").trim();
    if (!to) return c.json(bad("A recipient address is required."), 400);
    if (!link) return c.json(bad("A signed document link is required. This route does not attach files from storage."), 400);
    try {
      const r = await sendEmail({
        to,
        subject: `${label} — TruckWithEase`,
        text: [message || `${label} is attached by secure link below.`, "", link, "", "This link expires. Download the file before it does.", "", "Sent from TruckWithEase."].join("\n"),
        tag: "document",
      });
      return c.json({ sent: true, ...r });
    } catch (e) {
      return c.json(bad((e as Error).message), 502);
    }
  });
