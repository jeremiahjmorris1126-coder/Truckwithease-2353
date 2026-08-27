/**
 * AgentOrchestrator — server-proxied multi-agent client.
 *
 * REWRITTEN Aug 25, 2026. Original preserved at docs/launch/AgentOrchestrator.ORIGINAL.js.txt
 *
 * What the original did wrong:
 *   1. Read an OpenAI key from localStorage/sessionStorage IN THE BROWSER and called
 *      https://api.openai.com/v1/chat/completions directly. A real key there is extractable
 *      from devtools by any user on the platform.
 *   2. logAgentActivity() wrote to the PocketBase collection `agent_activity`, which has never
 *      existed in any of the 44 tables. Every call failed silently inside a bare catch.
 *   3. runGodDiagnostic() polled 9 PocketBase shim collections and computed a "platform health
 *      score" from whether those localStorage-backed reads resolved. It measured nothing real.
 *   4. Hardcoded gpt-4o / gpt-4o-mini / gemini-1.5-pro — all legacy models, and the model choice
 *      belongs to the server anyway.
 *   5. 12 agents were declared; only some have a real server-side persona. The rest were given
 *      an invented system prompt full of unverifiable claims ("all 134 platform destinations",
 *      "47 variables per mile", "prevent violations 72 hours before they occur").
 *
 * What this does instead: every request goes to the existing server-side /api/agent/* endpoints,
 * which hold the provider key and compose PLATFORM_GUARDRAILS + the real persona prompt. Agents
 * with no server persona are marked built:false and say so instead of being routed to a
 * different agent's brain.
 *
 * Export signatures unchanged: AGENTS, routeToAgent, runAgentConversation, logAgentActivity,
 * runGodDiagnostic.
 */

const TIMEOUT_MS = 35000;

// ── Agent Registry ─────────────────────────────────────────────────────────
// `endpoint` is the real server agent. `built: false` means no server persona exists.
// `model` reflects what the SERVER actually runs (see api/agent/index.ts) — it is not a request
// parameter. Driving mode swaps to claude-haiku-4.5 server-side.
export const AGENTS = {
  GOD:         { name: 'THE GOAT',       endpoint: 'the-goat',      model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '👑', specialty: 'master-control' },
  GHOST:       { name: 'Ghost Nerve',    endpoint: 'ghost-nerve',   model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '⚡', specialty: 'intelligence' },
  HREASE:      { name: 'HumanAI',        endpoint: 'humanai',       model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🧑‍💼', specialty: 'human-resources' },
  DISPATCH:    { name: 'Road Agent',     endpoint: 'road-agent',    model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🗺️', specialty: 'routing' },
  COMPLIANCE:  { name: 'THE GOAT',       endpoint: 'the-goat',      model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🛡️', specialty: 'compliance' },
  SAFETY:      { name: 'Neural Safety',  endpoint: 'neural-safety', model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🚨', specialty: 'safety' },
  PAYROLL:     { name: 'Finance Alert',  endpoint: 'finance-alert', model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '💰', specialty: 'payroll' },
  MAINTENANCE: { name: 'Page Guardian',  endpoint: 'page-guardian', model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🔄', specialty: 'maintenance' },
  MECHANIC:    { name: 'Fleet Chief',    endpoint: 'fleet-chief',   model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🔧', specialty: 'diagnosis' },
  QUANTUM:     { name: 'Quantum Mind',   endpoint: 'quantum-mind',  model: 'anthropic/claude-sonnet-4.6', built: true,  emoji: '🧠', specialty: 'trend-analysis' },
  // No server-side persona behind these. Do not route them somewhere else and pretend.
  BILLIE:      { name: 'Billie Scan',    endpoint: null, model: null, built: false, emoji: '📄', specialty: 'billing' },
  SIGNAL:      { name: 'Signal Sam',     endpoint: null, model: null, built: false, emoji: '📡', specialty: 'telecom' },
  TRAINING:    { name: 'Game Up AI',     endpoint: null, model: null, built: false, emoji: '🎮', specialty: 'training' },
  HARDWARE:    { name: 'Hardware Bot',   endpoint: null, model: null, built: false, emoji: '🔧', specialty: 'hardware' },
};

/** POST to a server agent endpoint. Returns text, or an explicit failure string. */
async function callAgent(endpoint, userMessage, context = {}) {
  const body = { messages: [{ role: 'user', content: userMessage }] };
  if (context && Object.keys(context).length) body.context = context;
  if (context?.driving) body.driving = true;
  if (context?.profile) body.profile = context.profile;

  const res = await fetch(`/api/agent/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`agent service returned ${res.status}`);
  const data = await res.json();
  if (!data?.text) throw new Error('empty response from agent service');
  return data.text;
}

// ── Route request to correct agent ─────────────────────────────────────────
export async function routeToAgent(agentId, userMessage, context = {}) {
  const agent = AGENTS[agentId] || AGENTS.GOD;

  if (!agent.built || !agent.endpoint) {
    return `${agent.name} is not built yet — there is no ${agent.specialty} agent on the server. Nothing was generated for this request.`;
  }

  try {
    return await callAgent(agent.endpoint, userMessage, context);
  } catch (e) {
    const timedOut = e?.name === 'TimeoutError' || e?.name === 'AbortError';
    if (timedOut) return `${agent.name} timed out after ${TIMEOUT_MS / 1000} seconds. Nothing was generated.`;
    return `${agent.name} could not answer — ${e?.message || 'network error'}. Nothing was generated.`;
  }
}

// ── Multi-agent conversation ───────────────────────────────────────────────
export async function runAgentConversation(topic, agents = ['GOD', 'GHOST', 'HREASE']) {
  const messages = [];
  for (const agentId of agents) {
    const priorNote = messages.length
      ? ` Previous agents said: ${messages.map((m) => `${m.agent}: ${m.message}`).join(' | ')}`
      : '';
    const response = await routeToAgent(agentId, `${topic}.${priorNote}`.trim());
    messages.push({ agent: AGENTS[agentId]?.name || agentId, message: response });
  }
  return messages;
}

// ── Log agent activity ─────────────────────────────────────────────────────
/**
 * No-op. The original wrote to the PocketBase collection `agent_activity`, which never existed.
 * There is no agent activity table in the 44-table schema. Returning an explicit
 * { logged: false } instead of silently swallowing the failure — if we decide we want this
 * audit trail, it needs a real table and a server route.
 */
export async function logAgentActivity(agentId, action, result) {
  return {
    logged: false,
    reason: 'no agent_activity table exists',
    agent: AGENTS[agentId]?.name || agentId,
    action,
    resultPreview: typeof result === 'string' ? result.slice(0, 120) : '',
  };
}

// ── Platform health check ──────────────────────────────────────────────────
/**
 * Reads real server state instead of polling localStorage-backed shim collections.
 * `live` is the server's own AI-configured flag; `agents` is the real roster.
 * Returns { health, score, healthy, total } for signature compatibility with the old callers.
 */
export async function runGodDiagnostic() {
  try {
    const [statusRes, rosterRes] = await Promise.all([
      fetch('/api/agent/status', { signal: AbortSignal.timeout(10000) }),
      fetch('/api/agent/roster', { signal: AbortSignal.timeout(10000) }),
    ]);

    const status = statusRes.ok ? await statusRes.json() : null;
    const roster = rosterRes.ok ? await rosterRes.json() : null;
    const serverAgents = roster?.agents ?? [];

    const health = [
      {
        area: 'agent-service',
        status: statusRes.ok ? 'healthy' : 'error',
        detail: statusRes.ok ? `HTTP ${statusRes.status}` : `HTTP ${statusRes.status}`,
      },
      {
        area: 'ai-provider',
        status: status?.live ? 'healthy' : 'not-configured',
        detail: status?.live ? 'AI Gateway key present' : 'no AI Gateway key — agents answer in demo mode',
      },
      {
        area: 'agent-roster',
        status: serverAgents.length ? 'healthy' : 'error',
        count: serverAgents.length,
        detail: `${serverAgents.length} server-side personas`,
      },
    ];

    const healthy = health.filter((h) => h.status === 'healthy').length;
    return {
      health,
      score: Math.round((healthy / health.length) * 100),
      healthy,
      total: health.length,
      live: !!status?.live,
      agents: serverAgents,
      measured: true,
    };
  } catch (e) {
    return {
      health: [{ area: 'agent-service', status: 'error', detail: e?.message || 'unreachable' }],
      score: 0,
      healthy: 0,
      total: 1,
      live: false,
      agents: [],
      measured: false,
    };
  }
}

export default {
  AGENTS,
  routeToAgent,
  runAgentConversation,
  logAgentActivity,
  runGodDiagnostic,
};
