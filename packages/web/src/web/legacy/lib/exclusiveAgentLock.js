/**
 * Exclusive Agent Lock — client for /api/integrity/lock
 * =====================================================
 * Rewritten from the original browser-only module. What the original actually did:
 *
 *  1. Shipped the "secret" licence key as a string constant in the browser
 *     bundle. Anyone with devtools had it.
 *  2. verifyPlatformIntegrity() returned true on all three code paths. It
 *     enforced nothing.
 *  3. The lockout was window.location.href = '/unauthorized'. Disabling
 *     JavaScript bypassed it.
 *  4. validateAgentCode(code) referenced an undefined `agentType` variable and
 *     threw whenever it was called.
 *
 * Licence state is now computed server-side and enforcement happens at the API
 * layer, where it cannot be bypassed from a browser. The original file is
 * preserved at docs/launch/exclusiveAgentLock.ORIGINAL.js.txt
 *
 * All exports from the original are kept so consumer pages need no edits.
 */

const BASE = '/api/integrity/lock';

/**
 * Not a secret. The real licence key never belonged in the browser bundle and
 * is not shipped here. This constant only exists because pages import it.
 */
const TRUCKWITHEASEKEY = 'TWE-CLIENT-PLACEHOLDER-NOT-A-SECRET';
const AGENTLOCKVERSION = '2.0.0-server';
const PLATFORMSIGNATURE = 'TruckWithEase-Agents-Server-Verified';

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Agent lock request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

class ExclusiveAgentLock {
  constructor() {
    this.version = AGENTLOCKVERSION;
    this.loaded = false;
    this.licensed = null;   // null = not checked yet. Never assume true.
    this.reason = 'Not checked yet.';
    this.enforcement = 'Server-side.';
    this.agents = [];
    this.note = '';
  }

  /** Fetch lock state + the accessibility agent catalog from the server. */
  async load() {
    try {
      const out = await call('');
      this.loaded = true;
      this.licensed = Boolean(out.lock?.licensed);
      this.reason = out.lock?.reason ?? '';
      this.enforcement = out.lock?.enforcement ?? '';
      this.version = out.lock?.version ?? AGENTLOCKVERSION;
      this.agents = out.accessibilityAgents ?? [];
      this.note = out.note ?? '';
      return out;
    } catch (error) {
      // Unreachable server means unverified, never "passing".
      this.loaded = false;
      this.licensed = null;
      this.reason = `Lock state could not be verified: ${error.message}`;
      return { lock: { licensed: null, reason: this.reason }, accessibilityAgents: [], error: error.message };
    }
  }

  /** Server-side verification. Optionally scoped to one agent id. */
  async verifyLicense(agentId = null) {
    const out = await call('/verify', {
      method: 'POST',
      body: JSON.stringify(agentId ? { agentId } : {}),
    }).catch((error) => ({ verified: false, error: error.message }));
    this.licensed = out.verified === true ? true : out.verified === false ? false : null;
    return out;
  }

  /**
   * The original returned true unconditionally. There is no integrity property
   * a browser can honestly assert about itself, so this defers to the server.
   */
  async verifyPlatformIntegrity() {
    const out = await this.load();
    return out.lock?.licensed ?? null;
  }

  /** One accessibility agent by id: deaf, blind, elderly, crisis, mentor, coordinator. */
  async getAgent(agentType) {
    if (!agentType) return null;
    try {
      return await call(`/agents/${encodeURIComponent(agentType)}`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  /** Full accessibility agent catalog. */
  async listAgents() {
    if (!this.loaded) await this.load();
    return this.agents;
  }

  /** Feature list for one agent, or null when the id is unknown. */
  async listAgentFeatures(agentType) {
    const agent = await this.getAgent(agentType);
    return agent ? agent.features : null;
  }

  /** Certificate describing verified state. Not a cryptographic artifact — labelled as such. */
  async generateAgentCertificate(agentType) {
    const out = await this.verifyLicense(agentType);
    return {
      agent: agentType,
      verified: out.verified === true,
      version: this.version,
      signature: `${PLATFORMSIGNATURE}-${agentType}`,
      issuedAt: new Date().toISOString(),
      note: 'Descriptive record of a server verification result. Not a signed certificate.',
    };
  }

  /**
   * Fixed signature — the original took only (code) but referenced an undefined
   * `agentType`, so it threw on every call.
   */
  validateAgentCode(agentType, code) {
    if (!agentType || typeof code !== 'string') return false;
    return code.includes(`TWE-${agentType}-LOCKED`);
  }

  isLicensed() {
    return this.licensed;
  }
}

const agentLock = new ExclusiveAgentLock();

// No module-level side effect. The original ran verifyPlatformIntegrity() and
// console-logged on import, which fired on every page load and proved nothing.

export {
  agentLock,
  ExclusiveAgentLock,
  TRUCKWITHEASEKEY,
  AGENTLOCKVERSION,
  PLATFORMSIGNATURE,
};

export default agentLock;
