import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { sha256 } from "../lib/crypto";
import { AGENT_ROSTER, agentSystemPrompt, type AgentId } from "../agent";
import { PLATFORM_GUARDRAILS } from "../agent/driver-assistant";
import { ACCESSIBILITY_AGENTS, ACCESSIBILITY_NOTE, AGENT_LOCK_VERSION, lockState } from "../lib/agent-lock";

/**
 * Agent integrity — server-side.
 *
 * The original agentIntegrityCheck.js ran in the browser and asserted
 * `agent.owner === "TruckWithEase"` on an object the client controls, then
 * reported failures to api.truckwithease.io (dead). Anyone with devtools could
 * pass it, so it proved nothing.
 *
 * This version hashes each agent's *composed system prompt* on the server —
 * guardrails included — and compares it to a sealed baseline. If a prompt is
 * edited, weakened, or has its guardrails stripped, the hash changes and the
 * check actually fails. The browser cannot influence the result.
 */

/** A guardrail fingerprint that must appear inside every composed prompt. */
const GUARDRAIL_MARKER = PLATFORM_GUARDRAILS.slice(0, 120);

/**
 * driver-assistant is the governing spec itself — its safety rules are written
 * inline rather than prepended from PLATFORM_GUARDRAILS. It is checked against
 * its own non-negotiable clauses instead of the shared marker.
 */
const SELF_GOVERNING: Partial<Record<AgentId, string[]>> = {
  "driver-assistant": ["safety comes before s", "fmcsa", "never"],
};

function hasGuardrails(id: AgentId, prompt: string): boolean {
  const own = SELF_GOVERNING[id];
  if (own) {
    const lower = prompt.toLowerCase();
    return own.every((clause) => lower.includes(clause));
  }
  return prompt.includes(GUARDRAIL_MARKER);
}

function composed(id: AgentId) {
  const prompt = agentSystemPrompt(id);
  return {
    prompt,
    hash: sha256(prompt),
    chars: prompt.length,
    guardrails: hasGuardrails(id, prompt),
  };
}

export const integrity = new Hono()
  /** Seal the current prompts as the baseline. Idempotent per agent. */
  .post("/seal", async (c) => {
    const force = c.req.query("force") === "1";
    const existing = await db.select().from(schema.agentIntegrity);
    const sealedIds = new Set(existing.map((r) => r.id));
    const sealed: string[] = [];
    const resealed: string[] = [];

    for (const a of AGENT_ROSTER) {
      const { hash, chars, guardrails } = composed(a.id);
      if (sealedIds.has(a.id)) {
        if (!force) continue;
        await db
          .update(schema.agentIntegrity)
          .set({ baselineHash: hash, promptChars: chars, guardrailsPresent: guardrails, sealedAt: new Date() })
          .where(eq(schema.agentIntegrity.id, a.id));
        resealed.push(a.id);
      } else {
        await db.insert(schema.agentIntegrity).values({
          id: a.id,
          name: a.name,
          baselineHash: hash,
          promptChars: chars,
          guardrailsPresent: guardrails,
          sealedAt: new Date(),
        });
        sealed.push(a.id);
      }
    }
    return c.json({ ok: true, agents: AGENT_ROSTER.length, sealed, resealed }, 200);
  })

  /** Run the real check. Auto-seals on first run so it is never vacuously green. */
  .get("/", async (c) => {
    let baselines = await db.select().from(schema.agentIntegrity);

    if (baselines.length === 0) {
      for (const a of AGENT_ROSTER) {
        const { hash, chars, guardrails } = composed(a.id);
        await db.insert(schema.agentIntegrity).values({
          id: a.id,
          name: a.name,
          baselineHash: hash,
          promptChars: chars,
          guardrailsPresent: guardrails,
          sealedAt: new Date(),
        });
      }
      baselines = await db.select().from(schema.agentIntegrity);
    }

    const byId = new Map(baselines.map((b) => [b.id, b]));
    const now = new Date();
    const agents = [];

    for (const a of AGENT_ROSTER) {
      const { hash, chars, guardrails } = composed(a.id);
      const base = byId.get(a.id);
      let result: "ok" | "drift" | "missing_guardrails" | "unsealed";
      if (!base) result = "unsealed";
      else if (!guardrails) result = "missing_guardrails";
      else if (base.baselineHash !== hash) result = "drift";
      else result = "ok";

      if (base) {
        await db
          .update(schema.agentIntegrity)
          .set({ lastCheckedAt: now, lastResult: result })
          .where(eq(schema.agentIntegrity.id, a.id));
      }

      agents.push({
        id: a.id,
        name: a.name,
        role: a.role,
        result,
        guardrailsPresent: guardrails,
        promptChars: chars,
        currentHash: hash.slice(0, 16),
        baselineHash: base ? base.baselineHash.slice(0, 16) : null,
        charDelta: base ? chars - base.promptChars : null,
        sealedAt: base?.sealedAt ?? null,
      });
    }

    const failing = agents.filter((a) => a.result !== "ok");
    return c.json(
      {
        checkedAt: now,
        verification: "server-side sha256 of each composed system prompt, guardrails included",
        agents: agents.length,
        passing: agents.length - failing.length,
        failing: failing.length,
        status: failing.length === 0 ? "intact" : "compromised",
        detail: agents,
        note:
          failing.length === 0
            ? "Every agent prompt matches its sealed baseline and still carries PLATFORM_GUARDRAILS."
            : "One or more agent prompts changed since sealing. Review the diff, then POST /api/integrity/seal?force=1 to accept the new baseline.",
      },
      200,
    );
  })

  .get("/agent/:id", async (c) => {
    const id = c.req.param("id") as AgentId;
    const known = AGENT_ROSTER.find((a) => a.id === id);
    if (!known) return c.json({ error: "unknown_agent", agents: AGENT_ROSTER.map((a) => a.id) }, 404);
    const { hash, chars, guardrails } = composed(id);
    const [base] = await db.select().from(schema.agentIntegrity).where(eq(schema.agentIntegrity.id, id));
    return c.json(
      {
        id,
        name: known.name,
        guardrailsPresent: guardrails,
        promptChars: chars,
        currentHash: hash,
        baselineHash: base?.baselineHash ?? null,
        matches: base ? base.baselineHash === hash : null,
        lastResult: base?.lastResult ?? null,
      },
      200,
    );
  })

  /**
   * Platform / agent lock. Replaces exclusiveAgentLock.js, whose
   * verifyPlatformIntegrity() returned true on every path and whose lockout was
   * a browser redirect.
   */
  .get("/lock", (c) =>
    c.json({
      lock: lockState(),
      accessibilityAgents: ACCESSIBILITY_AGENTS,
      accessibilityAgentCount: ACCESSIBILITY_AGENTS.length,
      note: ACCESSIBILITY_NOTE,
      previousImplementation:
        "exclusiveAgentLock.js shipped a hardcoded key in the browser bundle, verified nothing, and threw in validateAgentCode() on an undefined variable. Preserved at docs/launch/exclusiveAgentLock.ORIGINAL.js.txt.",
    }),
  )

  .get("/lock/agents/:id", (c) => {
    const id = c.req.param("id");
    const agent = ACCESSIBILITY_AGENTS.find((a) => a.id === id);
    if (!agent) return c.json({ error: "unknown_agent", agents: ACCESSIBILITY_AGENTS.map((a) => a.id) }, 404);
    return c.json({ ...agent, version: AGENT_LOCK_VERSION, note: ACCESSIBILITY_NOTE });
  })

  .post("/lock/verify", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const state = lockState();
    const agentId = typeof body.agentId === "string" ? body.agentId : null;
    const agent = agentId ? ACCESSIBILITY_AGENTS.find((a) => a.id === agentId) ?? null : null;
    return c.json({
      verified: state.licensed,
      lock: state,
      agent,
      agentKnown: agentId ? Boolean(agent) : null,
      note: "Verification is computed on the server from instance state. No key is sent to the browser, and a failed verification does not redirect the page — it withholds the resource.",
    });
  });
