import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { MapPin, Truck, FileText, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function LocationDataAgent() {
  const [activeTab, setActiveTab] = useState('assignments');
  const [locationMatches, setLocationMatches] = useState([
    {
      id: 1,
      loadId: 'LD-8843',
      driverId: 'D001',
      driverName: 'Ray Davis',
      pickupCity: 'St. Louis, MO',
      deliveryCity: 'Chicago, IL',
      pickupLat: 38.6270,
      pickupLng: -90.1994,
      deliveryLat: 41.8781,
      deliveryLng: -87.6298,
      miles: 298,
      estProfit: '$187',
      driverLocation: 'St. Louis, MO',
      driverLat: 38.6235,
      driverLng: -90.1968,
      distanceToPickup: '2.1 miles',
      eta: '15 minutes',
      documentStatus: 'All verified',
      documents: [
        { type: 'CDL License', status: 'Valid', expiry: 'Mar 15, 2028', icon: '✓' },
        { type: 'Medical Certificate', status: 'Valid', expiry: 'Sep 10, 2027', icon: '✓' },
        { type: 'HAZMAT Endorsement', status: 'Not required', icon: '-' },
        { type: 'Safety Clearance', status: 'Clear', icon: '✓' },
      ],
      driverProfile: {
        score: 98,
        streakDays: 31,
        violations: 0,
        hazmatQualified: false,
        temperatureControlQualified: true,
      },
      compatibility: 'Perfect Match',
      compatibilityScore: 98,
      reason: 'Driver 2.1 miles away, all documents valid, no HOS conflicts, excellent safety record',
      assignmentStatus: 'Ready to Assign'
    },
    {
      id: 2,
      loadId: 'LD-8845',
      driverId: 'D002',
      driverName: 'Sarah Johnson',
      pickupCity: 'Memphis, TN',
      deliveryCity: 'Atlanta, GA',
      pickupLat: 35.1495,
      pickupLng: -90.0490,
      deliveryLat: 33.7490,
      deliveryLng: -84.3880,
      miles: 392,
      estProfit: '$298',
      driverLocation: 'Memphis, TN',
      driverLat: 35.1450,
      driverLng: -90.0520,
      distanceToPickup: '4.3 miles',
      eta: '22 minutes',
      documentStatus: 'Alert on file',
      documents: [
        { type: 'CDL License', status: 'Valid', expiry: 'Jun 22, 2028', icon: '✓' },
        { type: 'Medical Certificate', status: 'Valid', expiry: 'Sep 10, 2027', icon: '✓' },
        { type: 'HAZMAT Endorsement', status: 'Valid', expiry: 'Jun 22, 2028', icon: '✓' },
        { type: 'Temperature Control Qualified', status: 'Valid', icon: '✓' },
      ],
      driverProfile: {
        score: 91,
        streakDays: 22,
        violations: 1,
        hazmatQualified: true,
        temperatureControlQualified: true,
      },
      compatibility: 'Excellent Match',
      compatibilityScore: 95,
      reason: 'Food/Groceries requires temp control—driver qualified. 4.3 miles away, all docs valid, HOS permits 16hr drive',
      assignmentStatus: 'Ready to Assign'
    },
    {
      id: 3,
      loadId: 'LD-8846',
      driverId: 'D003',
      driverName: 'Mike Chen',
      pickupCity: 'Detroit, MI',
      deliveryCity: 'Cleveland, OH',
      pickupLat: 42.3314,
      pickupLng: -83.0458,
      deliveryLat: 41.4993,
      deliveryLng: -81.6944,
      miles: 175,
      estProfit: '$89',
      driverLocation: 'Chicago, IL',
      driverLat: 41.8781,
      driverLng: -87.6298,
      distanceToPickup: '287 miles',
      eta: '4.5 hours',
      documentStatus: 'Critical Alert',
      documents: [
        { type: 'CDL License', status: 'Valid', expiry: 'Oct 10, 2027', icon: '✓' },
        { type: 'Medical Certificate', status: 'EXPIRED', expiry: 'Jul 15, 2026', icon: '✗' },
        { type: 'HAZMAT Endorsement', status: 'N/A', icon: '-' },
        { type: 'Safety Clearance', status: 'BLOCKED', icon: '✗' },
      ],
      driverProfile: {
        score: 78,
        streakDays: 8,
        violations: 3,
        hazmatQualified: false,
        temperatureControlQualified: false,
      },
      compatibility: 'Cannot Assign',
      compatibilityScore: 12,
      reason: 'Medical cert expired—driver cannot legally drive. Assignment blocked until renewed.',
      assignmentStatus: 'Blocked - Document Issue'
    }
  ]);

  const [agentLog, setAgentLog] = useState([
    { timestamp: '2 minutes ago', event: 'Load Match', message: 'LD-8843 (St. Louis → Chicago): Matched with D001 (Ray Davis) at 2.1 miles. All documents verified. Compatibility 98%.', status: 'Ready' },
    { timestamp: '3 minutes ago', event: 'Location Check', message: 'D002 (Sarah Johnson) at Memphis, TN pickup location. Temperature control required—driver qualified. Compatibility 95%.', status: 'Ready' },
    { timestamp: '5 minutes ago', event: 'Document Verification', message: 'D003 (Mike Chen): Medical cert expired. Assignment blocked. Agent sent alert to compliance team.', status: 'Blocked' },
    { timestamp: '7 minutes ago', event: 'HOS Validation', message: 'D001 has 10 hours drive time available. LD-8843 requires 9.8 hours. ✓ Match approved.', status: 'Approved' },
    { timestamp: '10 minutes ago', event: 'Load Analysis', message: 'LD-8845 (Food/Groceries): Requires temperature control. Searched driver pool: 1 qualified driver available (D002).', status: 'Found' },
  ]);

  const [suggestions, setSuggestions] = useState([
    { type: 'Assignment Ready', load: 'LD-8843', driver: 'Ray Davis', action: 'Assign immediately—driver 2.1 miles away, 98% match', urgency: 'High' },
    { type: 'Assignment Ready', load: 'LD-8845', driver: 'Sarah Johnson', action: 'Assign immediately—driver qualified for temp control, 95% match', urgency: 'High' },
    { type: 'Cannot Assign', load: 'LD-8846', driver: 'Mike Chen', action: 'Driver medical cert expired. Route to nearest qualified driver or wait for renewal.', urgency: 'Critical' },
  ]);

  async function assignLoad(match) {
    try {
      await pb.collection('load_assignments').create({
        load_id: match.loadId,
        driver_id: match.driverId,
        driver_name: match.driverName,
        pickup_location: match.pickupCity,
        delivery_location: match.deliveryCity,
        pickup_lat: match.pickupLat,
        pickup_lng: match.pickupLng,
        delivery_lat: match.deliveryLat,
        delivery_lng: match.deliveryLng,
        miles: match.miles,
        est_profit: match.estProfit,
        compatibility_score: match.compatibilityScore,
        documents_verified: true,
        assigned_at: new Date(),
      });

      setLocationMatches(locationMatches.map(m =>
        m.id === match.id ? { ...m, assignmentStatus: 'Assigned ✓' } : m
      ));
    } catch (error) {
      console.error('Error assigning load:', error);
    }
  }

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '32px 24px', borderBottom: `2px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <MapPin size={32} style={{ color: AMBER }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Location Data Agent</h1>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#a0b4d8', margin: 0 }}>GPS location + driver profile + verified documents = perfect load assignment. Agents talk to each other. No guessing on compatibility.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: `2px solid rgba(255,255,255,0.1)`, overflowX: 'auto' }}>
          {['assignments', 'log', 'suggestions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: activeTab === tab ? AMBER : '#a0b4d8',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${AMBER}` : '3px solid transparent',
                fontWeight: activeTab === tab ? 700 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'assignments' && '🎯 Load-Driver Matches'}
              {tab === 'log' && '📍 Agent Activity Log'}
              {tab === 'suggestions' && '⚡ Ready to Assign'}
            </button>
          ))}
        </div>

        {/* Load-Driver Matches Tab */}
        {activeTab === 'assignments' && (
          <div>
            {locationMatches.map((match) => (
              <div
                key={match.id}
                style={{
                  background: NAVY2,
                  border: `1px solid rgba(255, 180, 0, 0.2)`,
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 24
                }}
              >
                {/* Left Column: Load & Driver Info */}
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Truck size={20} style={{ color: ORANGE }} />
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Load {match.loadId}</h3>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#a0b4d8' }}>
                      {match.pickupCity} → {match.deliveryCity}
                    </p>
                    <div style={{ fontSize: '0.85rem', color: '#666', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>{match.miles} miles</div>
                      <div>{match.estProfit} estimated profit</div>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid rgba(255, 180, 0, 0.1)`, paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, background: ORANGE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {match.driverId}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{match.driverName}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Current: {match.driverLocation}</p>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#a0b4d8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>📍 {match.distanceToPickup} away</div>
                      <div>⏱️ {match.eta} ETA</div>
                      <div>Score: {match.driverProfile.score}</div>
                      <div>Streak: {match.driverProfile.streakDays} days</div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Documents & Compatibility */}
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700, color: AMBER }}>Verified Documents</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {match.documents.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: doc.status === 'Valid' || doc.status === 'Clear' ? GREEN : doc.status === 'Not required' ? '#666' : RED,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }}>
                            {doc.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: '#fff' }}>{doc.type}</p>
                            <p style={{ margin: '2px 0 0', color: '#666', fontSize: '0.75rem' }}>{doc.status} {doc.expiry && `- Expires ${doc.expiry}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 180, 0, 0.1)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Compatibility Score</p>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: AMBER }}>{match.compatibilityScore}%</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0b4d8', lineHeight: 1.4 }}>{match.reason}</p>
                  </div>

                  <button
                    onClick={() => assignLoad(match)}
                    disabled={match.assignmentStatus.includes('Assigned') || match.assignmentStatus.includes('Blocked')}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: match.assignmentStatus.includes('Blocked') ? '#444' : GREEN,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: match.assignmentStatus.includes('Blocked') ? 'not-allowed' : 'pointer',
                      opacity: match.assignmentStatus.includes('Blocked') ? 0.5 : 1
                    }}
                  >
                    {match.assignmentStatus}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agent Activity Log Tab */}
        {activeTab === 'log' && (
          <div style={{
            background: NAVY2,
            borderRadius: 12,
            border: `1px solid rgba(255, 180, 0, 0.2)`,
            overflow: 'hidden'
          }}>
            {agentLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  borderBottom: idx < agentLog.length - 1 ? `1px solid rgba(255, 180, 0, 0.1)` : 'none',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  alignItems: 'start'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: AMBER, fontSize: '0.9rem' }}>{log.event}</p>
                  <p style={{ margin: 0, color: '#a0b4d8', fontSize: '0.85rem', lineHeight: 1.4 }}>{log.message}</p>
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: log.status === 'Ready' ? `rgba(22, 163, 74, 0.2)` : log.status === 'Approved' ? `rgba(22, 163, 74, 0.2)` : log.status === 'Found' ? `rgba(255, 180, 0, 0.2)` : `rgba(220, 38, 38, 0.2)`,
                  color: log.status === 'Ready' || log.status === 'Approved' || log.status === 'Found' ? GREEN : RED,
                  whiteSpace: 'nowrap'
                }}>
                  {log.status}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                style={{
                  background: NAVY2,
                  border: `2px solid ${sug.urgency === 'Critical' ? RED : sug.urgency === 'High' ? ORANGE : AMBER}`,
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Zap size={18} style={{ color: AMBER }} />
                    <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{sug.type}</p>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#a0b4d8' }}>
                    <strong>{sug.load}</strong> → <strong>{sug.driver}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{sug.action}</p>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: sug.urgency === 'Critical' ? RED : sug.urgency === 'High' ? ORANGE : AMBER,
                  color: '#000',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}>
                  {sug.urgency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
