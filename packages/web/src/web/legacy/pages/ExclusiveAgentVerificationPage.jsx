import React, { useState, useEffect } from 'react';
import { integrityCheck } from '../lib/agentIntegrityCheck.js';
import { agentLock } from '../lib/exclusiveAgentLock.js';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
};

export default function ExclusiveAgentVerificationPage() {
  const [verified, setVerified] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const result = await integrityCheck.verifyAllAgents();
      setVerified(result);
      setAgentStatuses(integrityCheck.getAllAgentStatuses() || {});
      setLoading(false);
    };
    verify();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '12px' }}>🔒</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            TruckWithEase Exclusive Agent Verification
          </h1>
          <p style={{ fontSize: 13, color: C.white60 }}>
            Proprietary System — Patent Pending
          </p>
        </div>

        {/* Status */}
        {loading ? (
          <div style={{
            background: C.card,
            border: `2px solid ${C.gold}`,
            borderRadius: 12,
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: '8px' }}>
              Verifying Exclusive Agent Lock...
            </div>
            <div style={{ fontSize: 12, color: C.white60 }}>
              Platform integrity check in progress. All agents being verified as TruckWithEase-exclusive.
            </div>
          </div>
        ) : verified ? (
          <div style={{
            background: `linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))`,
            border: `2px solid ${C.green}`,
            borderRadius: 12,
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: '8px', color: C.green }}>
              ALL AGENTS VERIFIED & LOCKED
            </div>
            <div style={{ fontSize: 12, color: C.white60, marginBottom: '16px' }}>
              6 specialized agents confirmed as TruckWithEase proprietary only
            </div>
            <div style={{
              background: C.black,
              border: `1px solid ${C.white30}`,
              borderRadius: 8,
              padding: '16px',
              fontSize: 11,
              color: C.white60,
              lineHeight: 1.8,
            }}>
              ✓ Exclusive lock verified<br/>
              ✓ Platform signature confirmed<br/>
              ✓ No unauthorized copies detected<br/>
              ✓ All agents running unmodified<br/>
              ✓ Copycat prevention active<br/>
              ✓ Real-time integrity monitoring enabled
            </div>
          </div>
        ) : (
          <div style={{
            background: `linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))`,
            border: `2px solid ${C.red}`,
            borderRadius: 12,
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: '16px' }}>🔓</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: '8px', color: C.red }}>
              VERIFICATION FAILED
            </div>
            <div style={{ fontSize: 12, color: C.white60 }}>
              Agent integrity check could not complete. Lockout initiated.
            </div>
          </div>
        )}

        {/* Agent Statuses */}
        {!loading && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
              Agent Status Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {Object.entries(agentStatuses).map(([agent, status]) => (
                <div key={agent} style={{
                  background: C.card,
                  border: `1px solid ${status.verified ? C.green : C.red}44`,
                  borderRadius: 8,
                  padding: '16px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, textTransform: 'capitalize' }}>
                      {agent.replace(/_/g, ' ')}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: status.verified ? C.green : C.red,
                      padding: '4px 8px',
                      background: status.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderRadius: 4,
                    }}>
                      {status.verified ? '✅ LOCKED' : '❌ FAILED'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.white60 }}>
                    {status.status}
                  </div>
                  <div style={{ fontSize: 10, color: C.white30, marginTop: '8px' }}>
                    Last check: {new Date(status.lastCheck).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protection Info */}
        <div style={{
          marginTop: '32px',
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          padding: '20px',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>
            🛡️ Exclusive Protection System
          </h3>
          <div style={{ fontSize: 12, color: C.white60, lineHeight: 2 }}>
            <div>✓ <strong>Cryptographic Lock:</strong> All 6 agents encrypted with TruckWithEase proprietary key</div>
            <div>✓ <strong>Platform Verification:</strong> Agents only execute on TruckWithEase infrastructure</div>
            <div>✓ <strong>Real-Time Monitoring:</strong> Continuous integrity checks detect any modification attempts</div>
            <div>✓ <strong>Copycat Prevention:</strong> Unauthorized copies trigger immediate platform lockout</div>
            <div>✓ <strong>License Enforcement:</strong> Only valid TruckWithEase license keys grant access</div>
            <div>✓ <strong>Audit Trail:</strong> Every access logged and verified as legitimate</div>
            <div style={{ marginTop: '12px', color: C.gold, fontWeight: 700 }}>
              ⚖️ Patent pending. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
