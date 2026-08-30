/**
 * traxes-ai.ts — TRAXES AS THE PLATFORM'S AI. Mounted alongside traxes.ts on /api/traxes.
 *
 * Two endpoints:
 *   GET  /api/traxes/brain   the live platform index TRAXES thinks with, in full, as JSON.
 *                            Published deliberately: anyone can audit exactly what TRAXES can see
 *                            before trusting a word it says.
 *   POST /api/traxes/ai      one TRAXES turn. Body: { messages, driverId?, context? }.
 *                            Returns the answer plus the list of live reads that backed it.
 *
 * READS
 *   agent/traxes-brain.ts    app.routes (lazy getter — this file cannot import `app`),
 *                            sqlite_master + COUNT(*), env presence as booleans, CAPS, App.jsx
 *   agent/traxes-agent.ts    the model turn, tool-looped over agent/traxes-tools.ts
 *   routes/algorithm.ts      the learned driver profile, injected as a system note exactly the way
 *                            routes/agent.ts does it
 *
 * WHAT THIS FILE DOES NOT DO
 *   - No write path. POST /ai runs an agent with read-only tools; it mutates nothing.
 *   - It returns no env value. /brain reports credential presence as booleans plus a
 *     documented-format verdict, never a value or part of one.
 *   - It publishes no uptime, availability, accuracy or confidence figure. Nothing measures them.
 *   - It makes no ELD registration claim and no agency-filing claim.
 */

import { Hono } from "hono";
import { runTraxes } from "../agent/traxes-agent";
import { buildBrain } from "../agent/traxes-brain";
import { hasAI } from "../agent/gateway";
import { driverAlgorithmContext } from "./algorithm";

/** Same contract as routes/agent.ts: no profile, no note, no behaviour change. */
async function profileNote(driverId: unknown): Promise<string | undefined> {
  if (typeof driverId !== "string" || !driverId.trim()) return undefined;
  try {
    const { context, observedCount } = await driverAlgorithmContext(driverId.trim());
    if (!observedCount) return undefined;
    return `# Learned driver profile (source: /api/algorithm/${driverId}/context)\n${context}`;
  } catch {
    return undefined;
  }
}

export const traxesAI = (getRoutes: () => { method: string; path: string }[]) =>
  new Hono()

    .get("/brain", async (c) => {
      const brain = await buildBrain(getRoutes);
      return c.json({ ...brain, ai: { live: hasAI(), model: hasAI() ? "anthropic/claude-sonnet-4.6" : null } }, 200);
    })

    .post("/ai", async (c) => {
      const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
      const raw = Array.isArray(body.messages) ? body.messages : [];
      const messages = raw
        .map((m) => ({ role: String((m as any)?.role ?? "user"), content: String((m as any)?.content ?? "") }))
        .filter((m) => m.content.trim().length > 0 && (m.role === "user" || m.role === "assistant"))
        .slice(-20);

      if (messages.length === 0) {
        return c.json({ error: "messages is required — send [{ role: 'user', content: '...' }]" }, 400);
      }

      const opCtx =
        body.context && typeof body.context === "string" && body.context.trim()
          ? `# Operational context supplied by the caller\n${body.context.trim()}`
          : undefined;
      const learned = await profileNote(body.driverId);
      const note = [opCtx, learned].filter(Boolean).join("\n\n") || undefined;

      const reply = await runTraxes(messages, { getRoutes, baseUrl: new URL(c.req.url).origin }, note);
      return c.json(reply, 200);
    });
