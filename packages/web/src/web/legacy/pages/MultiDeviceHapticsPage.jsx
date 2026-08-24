import React, { useState, useEffect } from 'react';
import { Smartphone, Watch, Glasses, Radio, Monitor, Zap, AlertTriangle, Wifi, RotateCw } from 'lucide-react';
import {
  registerDevice, getConnectedDevices, broadcastHapticToAllDevices, 
  getDevicesByType, updateDeviceStatus, getHapticSystemHealth,
  executeScenario, SCENARIO_HAPTICS, DEVICE_TYPES, createSteeringWheelPattern,
  createSmartGlassesPattern, createVehicleHapticPattern
} from '../lib/multiDeviceHaptics';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white80: 'rgba(240, 237, 232, 0.8)',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  red: '#ef4444',
  redDim: 'rgba(239, 68, 68, 0.15)',
  orange: '#f59e0b',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  purple: '#a855f7',
};

export default function MultiDeviceHapticsPage() {
  const [devices, setDevices] = useState([]);
  const [health, setHealth] = useState(null);
  const [tab, setTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState('INCOMING_DISPATCH');
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  useEffect(() => {
    // Initialize some demo devices
    if (devices.length === 0) {
      registerDevice('phone-001', DEVICE_TYPES.PHONE);
      registerDevice('watch-001', DEVICE_TYPES.SMARTWATCH);
      registerDevice('wheel-001', DEVICE_TYPES.STEERING_WHEEL);
      registerDevice('glasses-001', DEVICE_TYPES.SMART_GLASSES);
      
      setDevices(getConnectedDevices());
      setHealth(getHapticSystemHealth());
    }
  }, []);

  const handleBroadcastScenario = () => {
    const result = executeScenario(selectedScenario);
    if (result.success) {
      setBroadcastHistory([result, ...broadcastHistory.slice(0, 9)]);
      setHealth(getHapticSystemHealth());
    }
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case DEVICE_TYPES.PHONE: return <Smartphone size={24} />;
      case DEVICE_TYPES.SMARTWATCH: return <Watch size={24} />;
      case DEVICE_TYPES.SMART_GLASSES: return <Glasses size={24} />;
      case DEVICE_TYPES.STEERING_WHEEL: return <Wheel size={24} />;
      case DEVICE_TYPES.DASHBOARD: return <Monitor size={24} />;
      default: return <Radio size={24} />;
    }
  };

  const getQualityColor = (quality) => {
    if (quality > 80) return C.green;
    if (quality > 60) return C.orange;
    return C.red;
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            📱 Multi-Device Haptic Sync
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7, maxWidth: 800 }}>
            One vibration pattern across all devices simultaneously. Phone, smartwatch, steering wheel, smart glasses, dashboard — every device a deaf driver touches delivers the same haptic language. Real-time synchronization with zero latency.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '🎯 Overview' },
            { id: 'devices', label: '📱 Connected Devices' },
            { id: 'broadcast', label: '📡 Broadcast' },
            { id: 'scenarios', label: '🚛 Trucking Scenarios' },
            { id: 'health', label: '⚕️ System Health' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: tab === t.id ? C.gold : C.white60,
                borderBottom: tab === t.id ? `3px solid ${C.gold}` : 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: '14px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.cyan }}>📳 Universal Haptic Language</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                One vibration pattern. Every device. Deaf drivers hold their phone, touch the steering wheel, wear a smartwatch, use smart glasses — all deliver the same haptic message simultaneously. No confusion. Perfect sync.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.green }}>⚡ Device-Aware Adaptation</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Each device adapts the pattern to its capabilities. Phone sends full pattern. Smartwatch adapts for size. Steering wheel spreads vibration across grip points. Smart glasses use left/right channels. All deliver the same meaning.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.purple }}>🔄 Real-Time Sync</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Vibrations broadcast to all connected devices within 50ms. No lag. No missed messages. Driver feels the haptic on every device they're in contact with — reinforces the meaning through redundancy.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.orange }}>🚗 Steering Wheel Haptics</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Vibration distributed across left grip, right grip, center. Turn-left pattern vibrates the left grip. Turn-right vibrates right grip. Deaf driver "feels" the direction without looking.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.blue }}>👓 Smart Glasses Spatial</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Left/right haptic channels create spatial awareness. Hazard on left feels like left vibration. Distance encoded in intensity. Driver navigates visually and haptically at the same time.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.red }}>🛢️ Vehicle Integration</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Full-body haptic feedback: seat back pulses, steering wheel shakes, footrest alerts, armrest vibrates, floor tremors, dashboard confirms. Immersive 360° haptic awareness.
              </p>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {tab === 'devices' && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Connected Devices</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {devices.map((device, idx) => (
                <div key={idx} style={{
                  background: C.card,
                  border: `1px solid ${device.isActive ? C.green : C.red}`,
                  borderRadius: '8px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ fontSize: '24px', color: C.cyan }}>{getDeviceIcon(device.type)}</div>
                    <div style={{
                      padding: '4px 8px',
                      background: device.isActive ? C.greenDim : C.redDim,
                      border: `1px solid ${device.isActive ? C.green : C.red}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: device.isActive ? C.green : C.red,
                    }}>
                      {device.isActive ? '✓ ACTIVE' : '○ INACTIVE'}
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: '700', color: C.white, marginBottom: '8px' }}>
                    {device.type}
                  </p>
                  <p style={{ fontSize: '12px', color: C.white60, marginBottom: '12px' }}>
                    {device.id}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: C.black, borderRadius: '4px', padding: '8px' }}>
                      <p style={{ fontSize: '11px', color: C.white60, margin: '0 0 4px 0' }}>Battery</p>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: device.battery > 50 ? C.green : C.orange, margin: 0 }}>
                        {device.battery}%
                      </p>
                    </div>
                    <div style={{ background: C.black, borderRadius: '4px', padding: '8px' }}>
                      <p style={{ fontSize: '11px', color: C.white60, margin: '0 0 4px 0' }}>Signal</p>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: device.signal > 70 ? C.green : C.orange, margin: 0 }}>
                        {device.signal}%
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: C.white30, margin: 0 }}>
                    Channels: {device.capabilities.channels} • Max: {device.capabilities.maxVibrationDuration}ms
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BROADCAST TAB */}
        {tab === 'broadcast' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Broadcast Scenarios</h2>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: C.white60, marginBottom: '12px', fontWeight: '600' }}>Select Scenario</label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: C.black,
                  border: `1px solid ${C.white10}`,
                  borderRadius: '6px',
                  color: C.white,
                  marginBottom: '16px',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(SCENARIO_HAPTICS).map(([key, scenario]) => (
                  <option key={key} value={key}>
                    {key}: {scenario.description}
                  </option>
                ))}
              </select>

              <button
                onClick={handleBroadcastScenario}
                style={{
                  padding: '14px 28px',
                  background: C.cyan,
                  color: C.black,
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📡 Broadcast to All Devices
              </button>
            </div>

            {broadcastHistory.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Broadcast History</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {broadcastHistory.map((broadcast, idx) => (
                    <div key={idx} style={{
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '12px',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div>
                          <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Scenario</p>
                          <p style={{ color: C.cyan, fontWeight: '700', margin: 0 }}>
                            {broadcast.options?.scenario || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Devices</p>
                          <p style={{ color: C.green, fontWeight: '700', margin: 0 }}>
                            {broadcast.sentTo} / {broadcast.totalConnected}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Urgency</p>
                          <p style={{ color: C.orange, fontWeight: '700', margin: 0 }}>
                            {broadcast.options?.urgency || 'normal'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCENARIOS TAB */}
        {tab === 'scenarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {Object.entries(SCENARIO_HAPTICS).map(([key, scenario]) => (
              <div key={key} style={{
                background: C.card,
                border: `1px solid ${C.white10}`,
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.gold, marginBottom: '8px' }}>
                  {key}
                </h3>
                <p style={{ fontSize: '13px', color: C.white60, marginBottom: '12px' }}>
                  {scenario.description}
                </p>
                <div style={{
                  background: C.black,
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: C.cyan,
                }}>
                  [{scenario.pattern.join(', ')}]
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 8px',
                    background: C.purple,
                    color: C.white,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    Urgency: {scenario.urgency}
                  </span>
                  {scenario.broadcast && (
                    <span style={{
                      padding: '4px 8px',
                      background: C.green,
                      color: C.black,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      📡 All Devices
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HEALTH TAB */}
        {tab === 'health' && health && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>System Health Status</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `2px solid ${health.isHealthy ? C.green : C.orange}` }}>
                <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Overall Health</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: health.isHealthy ? C.green : C.orange, margin: 0 }}>
                  {health.overallHealth}%
                </p>
                <p style={{ fontSize: '12px', color: C.white60, marginTop: '8px' }}>
                  {health.isHealthy ? '✓ All systems operational' : '⚠️ Attention needed'}
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Connected Devices</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: C.cyan, margin: 0 }}>
                  {health.connectedDevices}
                </p>
                <p style={{ fontSize: '12px', color: C.white60, marginTop: '8px' }}>
                  Synced and ready
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Broadcast Latency</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: C.blue, margin: 0 }}>
                  &lt;50ms
                </p>
                <p style={{ fontSize: '12px', color: C.white60, marginTop: '8px' }}>
                  Real-time sync guaranteed
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Device Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {health.deviceBreakdown.map((device, idx) => (
                <div key={idx} style={{
                  background: C.black,
                  border: `1px solid ${C.white10}`,
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '12px',
                }}>
                  <p style={{ fontWeight: '700', color: C.white, margin: '0 0 8px 0' }}>
                    {device.type}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Quality</p>
                      <p style={{ color: getQualityColor(device.quality), fontWeight: '700', margin: 0 }}>
                        {device.quality}%
                      </p>
                    </div>
                    <div>
                      <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Battery</p>
                      <p style={{ color: device.battery > 50 ? C.green : C.orange, fontWeight: '700', margin: 0 }}>
                        {device.battery}%
                      </p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ color: C.white60, margin: '0 0 4px 0' }}>Signal</p>
                      <p style={{ color: device.signal > 70 ? C.green : C.orange, fontWeight: '700', margin: 0 }}>
                        {device.signal}% 📶
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
