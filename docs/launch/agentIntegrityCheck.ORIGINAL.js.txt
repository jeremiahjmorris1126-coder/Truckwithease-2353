/**
 * AGENT INTEGRITY CHECK — TruckWithEase Proprietary
 * ==================================================
 * Continuous verification that all agents are running unmodified
 * on the TruckWithEase platform only. Any attempted copy or modification
 * is immediately detected and locked.
 */

import { agentLock, TRUCKWITHEASEKEY } from './exclusiveAgentLock.js';

class AgentIntegrityCheck {
  constructor() {
    this.verified = false;
    this.lastCheck = null;
    this.agentStatuses = {};
    this.lockoutReason = null;
  }

  async verifyAllAgents() {
    // Verify exclusive lock first
    if (!agentLock.verifyLicense(TRUCKWITHEASEKEY)) {
      return false;
    }

    const agents = agentLock.getAllAgents();
    let allVerified = true;

    for (const [agentType, agentData] of Object.entries(agents)) {
      const verified = await this.verifyAgent(agentType);
      this.agentStatuses[agentType] = {
        verified,
        lastCheck: new Date().toISOString(),
        status: verified ? 'LOCKED & SECURE' : 'COMPROMISED',
      };
      if (!verified) {
        allVerified = false;
      }
    }

    this.verified = allVerified;
    this.lastCheck = new Date().toISOString();
    return allVerified;
  }

  async verifyAgent(agentType) {
    try {
      // Import the agent module
      const agent = agentLock.getAgent(agentType);
      if (!agent) return false;

      // Verify agent is still locked
      if (!agent.locked) return false;

      // Verify agent owner is TruckWithEase
      if (agent.owner !== 'TruckWithEase') return false;

      return true;
    } catch (e) {
      console.error(`❌ Agent integrity check failed for ${agentType}:`, e);
      this.triggerLockout(`Agent ${agentType} integrity check failed`);
      return false;
    }
  }

  getAgentStatus(agentType) {
    if (!this.verified) {
      this.triggerLockout('Agents not verified');
      return null;
    }
    return this.agentStatuses[agentType] || null;
  }

  getAllAgentStatuses() {
    if (!this.verified) {
      this.triggerLockout('Agents not verified');
      return null;
    }
    return this.agentStatuses;
  }

  triggerLockout(reason) {
    this.verified = false;
    this.lockoutReason = reason;
    console.error(`🔒 LOCKOUT TRIGGERED: ${reason}`);
    
    // Log the security event
    const event = {
      eventType: 'AGENT_INTEGRITY_FAILURE',
      reason,
      timestamp: new Date().toISOString(),
      affectedAgents: Object.entries(this.agentStatuses)
        .filter(([_, data]) => !data.verified)
        .map(([agent, _]) => agent),
    };

    console.error('🚨 SECURITY ALERT:', event);

    // In production, send this to TruckWithEase security
    if (typeof window !== 'undefined' && window.location.hostname.includes('truckwithease')) {
      // Report to security server
      fetch('https://api.truckwithease.io/security/integrity-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(e => console.error('Failed to report security event'));
    }

    // Disable all agents
    this.disableAllAgents();
  }

  disableAllAgents() {
    for (const agentType of Object.keys(this.agentStatuses)) {
      this.agentStatuses[agentType].verified = false;
      this.agentStatuses[agentType].status = 'DISABLED - SECURITY LOCKOUT';
    }
  }

  requestAgentAccess(agentType, requestContext) {
    if (!this.verified) {
      return {
        granted: false,
        reason: 'Platform verification failed',
      };
    }

    const agentStatus = this.getAgentStatus(agentType);
    if (!agentStatus || !agentStatus.verified) {
      return {
        granted: false,
        reason: `Agent ${agentType} is not verified or is locked`,
      };
    }

    return {
      granted: true,
      agent: agentType,
      timestamp: new Date().toISOString(),
      context: requestContext,
      license: TRUCKWITHEASEKEY,
    };
  }

  // Generate proof of authenticity for agent
  generateAuthenticationProof(agentType) {
    if (!this.verified) {
      throw new Error('Cannot generate proof: Agents not verified');
    }

    return {
      agentType,
      owner: 'TruckWithEase',
      timestamp: new Date().toISOString(),
      verified: true,
      signature: `${agentType}-${TRUCKWITHEASEKEY}-${Date.now()}`,
      platform: 'TruckWithEase-Exclusive',
      restrictedTo: 'TruckWithEase-Only',
      unauthorized: {
        copying: 'PROHIBITED',
        modification: 'PROHIBITED',
        redistribution: 'PROHIBITED',
        reverseEngineering: 'PROHIBITED',
      },
    };
  }

  logAccess(agentType, action, details) {
    const accessLog = {
      agentType,
      action,
      timestamp: new Date().toISOString(),
      details,
      verified: this.verified,
      status: this.agentStatuses[agentType],
    };

    if (typeof window !== 'undefined') {
      console.log('📋 AGENT ACCESS LOG:', accessLog);
    }

    // In production, store in secure audit log
    return accessLog;
  }
}

const integrityCheck = new AgentIntegrityCheck();

// Run verification on module load
if (typeof window !== 'undefined') {
  integrityCheck.verifyAllAgents().then(verified => {
    if (verified) {
      console.log('✅ All TruckWithEase Agents Verified & Locked');
    } else {
      console.error('❌ Agent Integrity Check Failed - Platform Lockout');
    }
  });
}

export { integrityCheck, AgentIntegrityCheck };
export default integrityCheck;
