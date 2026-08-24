import { Hono } from "hono";
import { runAgent, AGENT_ROSTER } from "../agent";
import { hasAI } from "../agent/gateway";

// State DOT compliance quick reference (area-aware AI Watcher backing data)
const STATE_DOT: Record<string, { chains: string; speed: string; note: string }> = {
  CA: { chains: "R1-R3 chain controls Oct-Apr in mountains", speed: "55 mph trucks", note: "CARB clean-truck rules; strict idling limits (5 min)." },
  CO: { chains: "Chain law I-70 Sep 1-May 31", speed: "65 mph", note: "Passive chain law; carry chains or face fines." },
  TX: { chains: "None", speed: "Up to 75 mph", note: "Watch weigh stations on I-10/I-20; ELD strictly enforced." },
  IL: { chains: "None", speed: "65 mph", note: "Tollway heavy; PrePass/EZpass saves ~18%." },
  OH: { chains: "None", speed: "70 mph turnpike", note: "Ohio Turnpike axle-based tolls." },
  PA: { chains: "Snow removal law", speed: "65 mph", note: "Turnpike is the priciest per-mile in the network." },
};

export const agentRoutes = new Hono()
  .get("/status", (c) => c.json({ live: hasAI() }, 200))
  .post("/driver-assistant", async (c) => {
    const { messages, driving, profile } = await c.req.json();
    const text = await runAgent("driver-assistant", messages, undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI(), driving: !!driving }, 200);
  })
  .post("/fleet-chief", async (c) => {
    const { messages, driving, profile } = await c.req.json();
    const text = await runAgent("fleet-chief", messages, undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/health-chief", async (c) => {
    const { messages, driving, profile } = await c.req.json();
    const text = await runAgent("health-chief", messages, undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/the-goat", async (c) => {
    const { messages, driving, profile, context } = await c.req.json();
    const text = await runAgent("the-goat", messages, context ? `# Operational context supplied by the platform\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}` : undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/road-agent", async (c) => {
    const { messages, driving, profile } = await c.req.json();
    const text = await runAgent("road-agent", messages, undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/ghost-nerve", async (c) => {
    const { messages, profile } = await c.req.json();
    const text = await runAgent("ghost-nerve", messages, undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/quantum-mind", async (c) => {
    const { messages, profile } = await c.req.json();
    const text = await runAgent("quantum-mind", messages, undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/neural-safety", async (c) => {
    const { messages, driving, profile } = await c.req.json();
    const text = await runAgent("neural-safety", messages, undefined, { driving: !!driving, profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/finance-alert", async (c) => {
    const { messages, profile } = await c.req.json();
    const text = await runAgent("finance-alert", messages, undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/memory-agent", async (c) => {
    const { messages, profile } = await c.req.json();
    const text = await runAgent("memory-agent", messages, undefined, { profile: profile ?? null });
    return c.json({ text, live: hasAI() }, 200);
  })
  .post("/page-guardian", async (c) => {
    const { messages, checks } = await c.req.json();
    const text = await runAgent("page-guardian", messages ?? [{ role: "user", content: "Report on the latest health checks." }], checks ? `# Health check results\n${JSON.stringify(checks, null, 2)}` : undefined);
    return c.json({ text, live: hasAI() }, 200);
  })
  .get("/roster", (c) => c.json({ agents: AGENT_ROSTER, live: hasAI() }, 200))
  .get("/dot/:state", (c) => {
    const s = c.req.param("state").toUpperCase();
    return c.json({ state: s, info: STATE_DOT[s] ?? { chains: "Check state DOT", speed: "Varies", note: "No special alerts on file — drive to posted limits." } }, 200);
  });
