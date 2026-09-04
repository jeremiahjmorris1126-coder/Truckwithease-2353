/**
 * OpenAIService — server-proxied agent client.
 *
 * REWRITTEN Aug 25, 2026. Original preserved at docs/launch/OpenAIService.ORIGINAL.js.txt
 *
 * What the original did wrong:
 *   1. Read an OpenAI key from the `platform_settings` collection IN THE BROWSER, then called
 *      https://api.openai.com/v1/chat/completions directly from the browser. Any real key put
 *      there is readable from devtools by any user.
 *   2. On every failure path it called getFallbackResponse(), which returned hardcoded
 *      fabricated fleet statistics ("All 134 destinations running clean", "SMS delivery at
 *      99.8%", "0 dropped calls") rendered to the user as if the AI had answered. None of those
 *      numbers are measured anywhere in this codebase. That function is deleted, not restyled.
 *   3. Hardcoded gpt-4o-mini, which is legacy relative to the current model catalog.
 *
 * What this does instead: POSTs to the existing server-side /api/agent/* endpoints. The server
 * holds the provider key, composes PLATFORM_GUARDRAILS + the real persona prompt, and returns
 * an honest, clearly labelled "(demo mode)" answer when no provider key is configured.
 *
 * Export signatures are unchanged: askAgent(agentName, systemPrompt, userMessage), AGENT_PROMPTS.
 */

/**
 * Legacy Dream Team display names -> real server agent endpoints.
 * Only agents with a real server-side persona are listed. Anything absent is NOT BUILT and
 * says so rather than being silently routed to a different agent's brain.
 */
const AGENT_ENDPOINTS = {
  'THE GOAT': 'the-goat',
  'HRease': 'humanai-hr-manager',
  'Ghost Nerve': 'ghost-nerve',
  'Road Agent': 'road-agent',
  'Fleet Chief': 'fleet-chief',
  'Health Chief': 'health-chief',
  'Neural Safety': 'neural-safety',
  'Finance Alert': 'finance-alert',
  'Fleet Mind': 'intelligence-mind',
  'Memory Management': 'memory-agent',
  'Page Guardian': 'page-guardian',
  // AI Command Post cast — each must reach its OWN persona, not fall back to THE GOAT.
  'Routing Robbie': 'routing-robbie',
  'Compliant Kathy': 'compliant-kathy',
  'Dispatch Darryl': 'dispatch-darryl',
  'Money Marisol': 'money-marisol',
  'Safety Sarge': 'safety-sarge',
  'Weather Wanda': 'weather-wanda',
};

/** Agents named on legacy pages that have no server-side persona behind them. */
const NOT_BUILT = {
  'Signal Sam': 'telecom / Fleet Voice',
  'Billie Scan': 'document scanning & billing',
};

/**
 * Ask a platform agent. Returns a string for the caller to render.
 *
 * `systemPrompt` is accepted for signature compatibility but is NOT sent: the server owns the
 * system prompt so PLATFORM_GUARDRAILS cannot be stripped by a client. See api/agent/index.ts.
 */
export async function askAgent(agentName, systemPrompt, userMessage) {
  const notBuilt = NOT_BUILT[agentName];
  if (notBuilt) {
    return `${agentName} is not built yet — there is no ${notBuilt} agent on the server. Nothing was generated for this request.`;
  }

  const endpoint = AGENT_ENDPOINTS[agentName] || 'the-goat';

  try {
    const res = await fetch(`/api/agent/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] }),
      signal: AbortSignal.timeout(35000),
    });

    if (!res.ok) {
      return `${agentName} could not answer — the agent service returned ${res.status}. Nothing was generated. Try again, or check the AI Gateway configuration.`;
    }

    const data = await res.json();
    if (!data?.text) {
      return `${agentName} returned an empty response. Nothing was generated.`;
    }
    return data.text;
  } catch (e) {
    const timedOut = e?.name === 'TimeoutError' || e?.name === 'AbortError';
    return timedOut
      ? `${agentName} timed out after 35 seconds. Nothing was generated — the request was not completed.`
      : `${agentName} is unreachable (network error). Nothing was generated.`;
  }
}

/**
 * Streaming variant. Same routing and same NOT_BUILT gating as askAgent, but tokens are handed
 * to `onChunk` as they arrive so the chat panel fills in instead of sitting on a spinner.
 *
 * Resolves to { text, live, reason } once the stream ends. `live` is false when the server
 * answered in demo mode (no gateway key) — the caller should label it, not hide it.
 * Pass an AbortSignal to let the user stop a long answer.
 */
export async function askAgentStream(agentName, userMessage, onChunk, signal) {
  const notBuilt = NOT_BUILT[agentName];
  if (notBuilt) {
    const text = `${agentName} is not built yet — there is no ${notBuilt} agent on the server. Nothing was generated for this request.`;
    onChunk?.(text);
    return { text, live: false, reason: 'not_built' };
  }

  const endpoint = AGENT_ENDPOINTS[agentName] || 'the-goat';

  try {
    const res = await fetch(`/api/agent/stream/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] }),
      signal,
    });

    if (!res.ok || !res.body) {
      const text = `${agentName} could not answer — the agent service returned ${res.status}. Nothing was generated.`;
      onChunk?.(text);
      return { text, live: false, reason: 'http_' + res.status };
    }

    const live = res.headers.get('X-AI-Live') === 'true';
    const reason = res.headers.get('X-AI-Reason') || null;

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let text = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      if (chunk) {
        text += chunk;
        onChunk?.(chunk);
      }
    }
    return { text, live, reason };
  } catch (e) {
    if (e?.name === 'AbortError') return { text: '', live: false, reason: 'aborted' };
    const text = `${agentName} is unreachable (network error). Nothing was generated.`;
    onChunk?.(text);
    return { text, live: false, reason: 'network' };
  }
}

/**
 * Kept for signature compatibility with the legacy pages that import it.
 *
 * These are NOT the prompts the model receives. The real system prompts live server-side in
 * api/agent/personas.ts and api/agent/driver-assistant.ts, composed with PLATFORM_GUARDRAILS.
 * The originals here contained unverifiable platform claims ("absolute authority over all 134
 * platform destinations", "47 profit variables per mile", "SMS delivery at 99.8%") which the
 * server-side guardrails forbid. They are reduced to short descriptions used only for UI labels.
 */
export const AGENT_PROMPTS = {
  'THE GOAT': 'Supreme master agent — scans the operation, enforces fleet procedure, final authority.',
  'HRease': 'HR and hiring — driver qualification files, recruitment, background checks, onboarding, payroll.',
  'Ghost Nerve': 'Predictive anomaly layer — catches drift against a unit\'s own baseline before it becomes a breakdown.',
  'Signal Sam': 'Not built — no telecom agent exists on the server.',
  'Billie Scan': 'Not built — no scanning/billing agent exists on the server. Document OCR lives at /api/gemini/ocr.',
};

/** Which legacy agent names actually resolve to a server agent. For UI gating. */
export const AGENT_AVAILABILITY = Object.fromEntries([
  ...Object.keys(AGENT_ENDPOINTS).map((k) => [k, true]),
  ...Object.keys(NOT_BUILT).map((k) => [k, false]),
]);

export default { askAgent, askAgentStream, AGENT_PROMPTS, AGENT_AVAILABILITY };
