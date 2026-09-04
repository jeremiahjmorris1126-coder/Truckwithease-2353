import { Hono } from "hono";
import { z } from "zod";
import { runAgent, streamAgent, AGENT_ROSTER, type AgentId } from "../agent";
import { hasAI } from "../agent/gateway";
import { driverAlgorithmContext } from "./algorithm";

/**
 * Pulls the driver's learned profile (driving / customer / load / route) and returns it
 * as a system context note. Returns undefined when no driverId was sent or when the
 * profile lookup fails — an agent with no profile behaves exactly as it did before.
 */
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});
const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  driving: z.boolean().optional(),
  driverId: z.string().trim().min(1).max(128).optional(),
  profile: z.record(z.string(), z.unknown()).optional(),
  context: z.union([z.string().max(8000), z.record(z.string(), z.unknown())]).optional(),
  traxes: z.union([z.string().max(8000), z.record(z.string(), z.unknown())]).optional(),
  checks: z.union([z.string().max(8000), z.record(z.string(), z.unknown())]).optional(),
}).passthrough();

type AgentRequest = z.infer<typeof RequestSchema>;

class AgentRequestError extends Error {}

/** Parse once per request and reject malformed, oversized or unsupported chat input. */
async function agentRequest(c: { req: { json: () => Promise<unknown> } }): Promise<AgentRequest> {
  let raw: unknown;
  try { raw = await c.req.json(); } catch { throw new AgentRequestError("Request body must be valid JSON."); }
  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) throw new AgentRequestError(parsed.error.issues[0]?.message || "Invalid agent request.");
  const total = parsed.data.messages.reduce((sum, message) => sum + message.content.length, 0);
  if (total > 16000) throw new AgentRequestError("Combined message content must be 16,000 characters or fewer.");
  for (const field of ["context", "traxes", "checks", "profile"] as const) {
    const value = parsed.data[field];
    if (value !== undefined && JSON.stringify(value).length > 8000) throw new AgentRequestError(`${field} must be 8,000 characters or fewer when serialized.`);
  }
  return parsed.data;
}

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

// State DOT compliance quick reference (area-aware AI Watcher backing data)
const STATE_DOT: Record<string, { chains: string; speed: string; note: string }> = {
  CA: { chains: "R1-R3 chain controls Oct-Apr in mountains", speed: "55 mph trucks", note: "CARB clean-truck rules; strict idling limits (5 min)." },
  CO: { chains: "Chain law I-70 Sep 1-May 31", speed: "65 mph", note: "Passive chain law; carry chains or face fines." },
  TX: { chains: "None", speed: "Up to 75 mph", note: "Watch weigh stations on I-10/I-20; ELD strictly enforced." },
  IL: { chains: "None", speed: "65 mph", note: "Tollway heavy; a transponder account (PrePass / E-ZPass) is worth pricing out — we do not have a verified savings figure." },
  OH: { chains: "None", speed: "70 mph turnpike", note: "Ohio Turnpike axle-based tolls." },
  PA: { chains: "Snow removal law", speed: "65 mph", note: "Turnpike is the priciest per-mile in the network." },
};

export const agentRoutes = new Hono().onError((error, c) => {
  if (error instanceof AgentRequestError) return c.json({ error: error.message }, 400);
  console.error(JSON.stringify({ evt: "agent_route_error", message: error instanceof Error ? error.message : String(error) }));
  return c.json({ error: "Agent request could not be completed." }, 500);
})
  .get("/status", (c) => c.json({ live: hasAI() }, 200))
  .post("/driver-assistant", async (c) => {
    const { messages, driving, profile , driverId } = await agentRequest(c);
    const text = await runAgent("driver-assistant", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI(), driving: !!driving }, 200);
  })
  .post("/fleet-chief", async (c) => {
    const { messages, driving, profile , driverId } = await agentRequest(c);
    const text = await runAgent("fleet-chief", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/health-chief", async (c) => {
    const { messages, driving, profile , driverId } = await agentRequest(c);
    const text = await runAgent("health-chief", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/the-goat", async (c) => {
    const { messages, driving, profile, context , driverId } = await agentRequest(c);
    const opCtx = context ? `# Operational context supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const learned = await profileNote(driverId);
    const text = await runAgent("the-goat", messages, [opCtx, learned].filter(Boolean).join("\n\n") || undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/humanai", async (c) => {
    const { messages, profile , driverId } = await agentRequest(c);
    const text = await runAgent("humanai", messages, await profileNote(driverId), { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/road-agent", async (c) => {
    const { messages, driving, profile , driverId } = await agentRequest(c);
    const text = await runAgent("road-agent", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/ghost-nerve", async (c) => {
    const { messages, profile , driverId } = await agentRequest(c);
    const text = await runAgent("ghost-nerve", messages, await profileNote(driverId), { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/mind", async (c) => {
    const { messages, profile , driverId } = await agentRequest(c);
    const text = await runAgent("intelligence-mind", messages, await profileNote(driverId), { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/neural-safety", async (c) => {
    const { messages, driving, profile , driverId } = await agentRequest(c);
    const text = await runAgent("neural-safety", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/finance-alert", async (c) => {
    const { messages, profile , driverId } = await agentRequest(c);
    const text = await runAgent("finance-alert", messages, await profileNote(driverId), { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/memory-agent", async (c) => {
    const { messages, profile , driverId } = await agentRequest(c);
    const text = await runAgent("memory-agent", messages, await profileNote(driverId), { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/page-guardian", async (c) => {
    const { messages, checks } = await agentRequest(c);
    const text = await runAgent("page-guardian", messages ?? [{ role: "user", content: "Report on the latest health checks." }], checks ? `# Health check results\n${JSON.stringify(checks, null, 2)}` : undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  /* AI Command Post — the 7 personality-driven characters. */
  .post("/routing-robbie", async (c) => {
    const { messages, driving, profile, driverId } = await agentRequest(c);
    const text = await runAgent("routing-robbie", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI(), driving: !!driving }, 200);
  })
  .post("/compliant-kathy", async (c) => {
    const { messages, driving, profile, driverId } = await agentRequest(c);
    const text = await runAgent("compliant-kathy", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/dispatch-darryl", async (c) => {
    const { messages, profile, context, driverId } = await agentRequest(c);
    const loadCtx = context ? `# Load / broker context supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const learned = await profileNote(driverId);
    const text = await runAgent("dispatch-darryl", messages, [loadCtx, learned].filter(Boolean).join("\n\n") || undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/money-marisol", async (c) => {
    const { messages, profile, context, traxes, driverId } = await agentRequest(c);
    const money = context ?? traxes;
    const moneyCtx = money ? `# TRAXES / financial context supplied by the platform\n${typeof money === "string" ? money : JSON.stringify(money, null, 2)}` : undefined;
    const learned = await profileNote(driverId);
    const text = await runAgent("money-marisol", messages, [moneyCtx, learned].filter(Boolean).join("\n\n") || undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/safety-sarge", async (c) => {
    const { messages, driving, profile, driverId } = await agentRequest(c);
    const text = await runAgent("safety-sarge", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/weather-wanda", async (c) => {
    const { messages, driving, profile, driverId } = await agentRequest(c);
    const text = await runAgent("weather-wanda", messages, await profileNote(driverId), { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/humanai-hr-manager", async (c) => {
    const { messages, profile, context, driverId } = await agentRequest(c);
    const hrCtx = context ? `# HR / roster context supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const learned = await profileNote(driverId);
    const text = await runAgent("humanai-hr-manager", messages, [hrCtx, learned].filter(Boolean).join("\n\n") || undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/billie-scan", async (c) => {
    const { messages, context, driverId } = await agentRequest(c);
    const document = context ? `# Document details supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const text = await runAgent("billie-scan", messages, [document, await profileNote(driverId)].filter(Boolean).join("\n\n") || undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/signal-sam", async (c) => {
    const { messages, context, driverId } = await agentRequest(c);
    const communication = context ? `# Communication facts supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const text = await runAgent("signal-sam", messages, [communication, await profileNote(driverId)].filter(Boolean).join("\n\n") || undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/game-up-ai", async (c) => {
    const { messages, context, driverId } = await agentRequest(c);
    const training = context ? `# Training material supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const text = await runAgent("game-up-ai", messages, [training, await profileNote(driverId)].filter(Boolean).join("\n\n") || undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/hardware-bot", async (c) => {
    const { messages, context, driverId } = await agentRequest(c);
    const hardware = context ? `# Hardware details supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined;
    const text = await runAgent("hardware-bot", messages, [hardware, await profileNote(driverId)].filter(Boolean).join("\n\n") || undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  /**
   * Streaming chat. Plain HTTP (not JSON-per-request) because the point is to flush tokens as
   * they arrive — the one case the house style allows a non-JSON response.
   *
   * Response body is raw UTF-8 text, not SSE: the client appends every chunk verbatim.
   * Liveness travels in headers so the body stays pure text.
   *   X-AI-Live:   "true" only when a model actually answered
   *   X-AI-Reason: no_key | timeout | provider_error (absent when live)
   */
  .post("/stream/:agent", async (c) => {
    const id = c.req.param("agent") as AgentId;
    if (!AGENT_ROSTER.some((a) => a.id === id)) {
      return c.json({ error: "unknown_agent", agent: id, known: AGENT_ROSTER.map((a) => a.id) }, 404);
    }
    const body = await agentRequest(c);
    const messages = Array.isArray(body.messages) ? (body.messages as { role: string; content: string }[]) : [];
    if (!messages.length) return c.json({ error: "messages_required" }, 400);

    const { stream, live, reason, note } = await streamAgent(id, messages, await profileNote(body.driverId), {
      driving: !!body.driving,
      profile: (body.profile as Record<string, unknown>) ?? null,
    });

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-AI-Live": String(live),
    };
    if (reason) headers["X-AI-Reason"] = reason;
    if (note) headers["X-AI-Note"] = note;

    return new Response(stream, { status: 200, headers });
  })
  .get("/roster", (c) => c.json({ agents: AGENT_ROSTER, live: hasAI() }, 200))
  .get("/dot/:state", (c) => {
    const s = c.req.param("state").toUpperCase();
    return c.json({ state: s, info: STATE_DOT[s] ?? { chains: "Check state DOT", speed: "Varies", note: "No special alerts on file — drive to posted limits." } }, 200);
  });
