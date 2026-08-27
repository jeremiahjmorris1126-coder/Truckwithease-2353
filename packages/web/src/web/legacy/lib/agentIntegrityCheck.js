/**
 * Agent integrity check — client shim.
 *
 * Original preserved at docs/launch/agentIntegrityCheck.ORIGINAL.js.txt. It was
 * replaced because a license/integrity check that runs in the browser cannot be
 * enforced: it asserted `agent.owner === 'TruckWithEase'` on an object the page
 * controls, so anyone with devtools passed it. It also reported failures to
 * https://api.truckwithease.io/security/integrity-failure, which is dead.
 *
 * The real check is server-side at /api/integrity: it sha256-hashes each agent's
 * composed system prompt (guardrails included) and compares it to a sealed
 * baseline. A weakened or guardrail-stripped prompt changes the hash and is
 * actually detected. This file just reads that verdict.
 */

const API = "/api/integrity";

export class AgentIntegrityCheck {
  constructor() {
    this.lastResult = null;
  }

  /** Full server-side verification of every agent. */
  async verifyAll() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`integrity -> ${res.status}`);
      const data = await res.json();
      this.lastResult = data;
      return data;
    } catch (e) {
      this.lastResult = null;
      return {
        status: "unknown",
        error: e.message,
        note: "Integrity endpoint unreachable. Treat as unverified, not as passing.",
        agents: 0,
        passing: 0,
        failing: 0,
        detail: [],
      };
    }
  }

  /** One agent by id, e.g. "the-goat". */
  async verifyAgent(agentId) {
    try {
      const res = await fetch(`${API}/agent/${encodeURIComponent(agentId)}`);
      if (!res.ok) return { id: agentId, matches: null, error: `HTTP ${res.status}` };
      return res.json();
    } catch (e) {
      return { id: agentId, matches: null, error: e.message };
    }
  }

  /** Accept the current prompts as the new baseline. */
  async seal(force = false) {
    try {
      const res = await fetch(`${API}/seal${force ? "?force=1" : ""}`, { method: "POST" });
      return res.ok ? res.json() : { ok: false, error: `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /** true only when the server says every agent is intact. */
  async isIntact() {
    const r = await this.verifyAll();
    return r.status === "intact";
  }
}

export const integrityCheck = new AgentIntegrityCheck();
export default integrityCheck;
