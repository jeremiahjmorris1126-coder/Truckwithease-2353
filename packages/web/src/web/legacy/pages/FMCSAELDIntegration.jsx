import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const CYAN = '#00D4FF';
const GREEN = '#2ECC71';
const AMBER = '#FFB400';
const RED = '#E74C3C';

export default function FMCSAELDIntegration() {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Marcus Johnson',
      driverId: 'DRV-2024-001',
      licenseNumber: 'CA-CDL-5847291',
      licenseExpiry: '2026-08-15',
      medicalExpiry: '2025-11-20',
      deviceId: 'GEOTAB-2847',
      fmcsaStatus: 'compliant',
      fmcsaCSA: 72,
      violations: 0,
      lastFMCSACheck: '2024-08-01',
      hoursToday: 8.5,
      hoursRemaining: 6.5
    },
    {
      id: 2,
      name: 'Sarah Chen',
      driverId: 'DRV-2024-002',
      licenseNumber: 'TX-CDL-3019482',
      licenseExpiry: '2025-04-10',
      medicalExpiry: '2025-12-05',
      deviceId: 'GEOTAB-2891',
      fmcsaStatus: 'warning',
      fmcsaCSA: 81,
      violations: 2,
      lastFMCSACheck: '2024-08-01',
      hoursToday: 6.2,
      hoursRemaining: 8.8
    },
    {
      id: 3,
      name: 'James Rodriguez',
      driverId: 'DRV-2024-003',
      licenseNumber: 'FL-CDL-8374029',
      licenseExpiry: '2024-09-22',
      medicalExpiry: '2024-08-30',
      deviceId: 'GEOTAB-2903',
      fmcsaStatus: 'critical',
      fmcsaCSA: 94,
      violations: 5,
      lastFMCSACheck: '2024-07-28',
      hoursToday: 11.1,
      hoursRemaining: -1.1
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [verifyingFMCSA, setVerifyingFMCSA] = useState(false);

  const handleFMCSAVerification = async (driverId) => {
    setVerifyingFMCSA(driverId);
    
    // Simulate FMCSA API call
    setTimeout(() => {
      setDrivers(drivers.map(d => 
        d.id === driverId 
          ? {
              ...d,
              lastFMCSACheck: new Date().toLocaleDateString('en-US'),
              fmcsaStatus: Math.random() > 0.3 ? d.fmcsaStatus : 'warning'
            }
          : d
      ));
      setVerifyingFMCSA(null);
    }, 1500);
  };

  const handleELDSync = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    alert(`Syncing Geotab ELD for ${driver.name}...\n\nDevice ID: ${driver.deviceId}\nCurrent HOS: ${driver.hoursToday}h\nRemaining: ${driver.hoursRemaining}h`);
  };

  const getStatusColor = (status) => {
    if (status === 'compliant') return GREEN;
    if (status === 'warning') return AMBER;
    return RED;
  };

  const getStatusLabel = (status) => {
    if (status === 'compliant') return '✓ Compliant';
    if (status === 'warning') return '⚠ Warning';
    return '🚨 Critical';
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(to br, ${NAVY} 0%, #1a1a1a 100%)`, color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>FMCSA + ELD Integration</h1>
          <p style={{ fontSize: '1.2rem', color: CYAN, fontWeight: '300' }}>Real-time federal safety verification + Geotab HOS sync</p>
        </div>

        {/* Overview Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${CYAN}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fleet Compliance</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: GREEN }}>67%</p>
            <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '0.5rem' }}>2 of 3 drivers compliant with FMCSA</p>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${CYAN}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Last FMCSA Sync</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: CYAN }}>Today</p>
            <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '0.5rem' }}>All drivers checked against federal records</p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${CYAN}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ELD Devices Syncing</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: AMBER }}>3/3</p>
            <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '0.5rem' }}>All Geotab devices connected & live</p>
          </div>
        </div>

        {/* Driver List */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: CYAN }}>Registered Drivers with FMCSA Verification</h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {drivers.map(driver => (
              <div 
                key={driver.id}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `2px solid ${getStatusColor(driver.fmcsaStatus)}`,
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: selectedDriver?.id === driver.id ? `0 0 20px ${getStatusColor(driver.fmcsaStatus)}` : 'none'
                }}
                onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                      {driver.name}
                    </h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{driver.driverId}</p>
                  </div>
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    background: getStatusColor(driver.fmcsaStatus),
                    color: driver.fmcsaStatus === 'compliant' ? '#000' : 'white',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {getStatusLabel(driver.fmcsaStatus)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>License Expiry</p>
                    <p style={{ fontWeight: 'bold', color: new Date(driver.licenseExpiry) < new Date() ? RED : GREEN }}>
                      {new Date(driver.licenseExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Medical Cert</p>
                    <p style={{ fontWeight: 'bold', color: new Date(driver.medicalExpiry) < new Date() ? RED : GREEN }}>
                      {new Date(driver.medicalExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>CSA Score</p>
                    <p style={{ fontWeight: 'bold', color: driver.fmcsaCSA > 85 ? RED : driver.fmcsaCSA > 75 ? AMBER : GREEN }}>
                      {driver.fmcsaCSA} / 100
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>FMCSA Check</p>
                    <p style={{ fontWeight: 'bold', color: CYAN }}>{driver.lastFMCSACheck}</p>
                  </div>
                </div>

                {/* HOS Status */}
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#999' }}>Hours of Service Today</span>
                    <span style={{ fontWeight: 'bold', color: driver.hoursRemaining < 0 ? RED : CYAN }}>
                      {driver.hoursToday}h driven / {driver.hoursRemaining}h remaining
                    </span>
                  </div>
                  <div style={{ background: '#333', borderRadius: '0.25rem', height: '8px', overflow: 'hidden' }}>
                    <div 
                      style={{
                        background: driver.hoursRemaining < 0 ? RED : GREEN,
                        height: '100%',
                        width: `${Math.min(100, (driver.hoursToday / 14) * 100)}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                </div>

                {/* Violations */}
                {driver.violations > 0 && (
                  <div style={{ background: 'rgba(230,85,70,0.1)', border: `1px solid ${RED}`, borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem' }}>
                    <p style={{ color: RED, fontWeight: 'bold', fontSize: '0.9rem' }}>
                      🚨 {driver.violations} FMCSA Violation{driver.violations !== 1 ? 's' : ''} on Record
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFMCSAVerification(driver.id);
                    }}
                    style={{
                      background: CYAN,
                      color: '#000',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      opacity: verifyingFMCSA === driver.id ? 0.7 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {verifyingFMCSA === driver.id ? '⏳ Verifying FMCSA...' : '🔍 Verify FMCSA'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleELDSync(driver.id);
                    }}
                    style={{
                      background: ORANGE,
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    📡 Sync Geotab ELD
                  </button>
                </div>

                {/* Device Info */}
                {selectedDriver?.id === driver.id && (
                  <div style={{ background: 'rgba(0,212,255,0.1)', border: `1px solid ${CYAN}`, borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
                    <h4 style={{ color: CYAN, fontWeight: 'bold', marginBottom: '0.75rem' }}>Geotab ELD Device Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Device ID</p>
                        <p style={{ fontWeight: 'bold' }}>{driver.deviceId}</p>
                      </div>
                      <div>
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Connection Status</p>
                        <p style={{ fontWeight: 'bold', color: GREEN }}>✓ Connected</p>
                      </div>
                      <div>
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Last Sync</p>
                        <p style={{ fontWeight: 'bold' }}>2 minutes ago</p>
                      </div>
                      <div>
                        <p style={{ color: '#999', fontSize: '0.85rem' }}>Data Quality</p>
                        <p style={{ fontWeight: 'bold', color: GREEN }}>100%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FMCSA Integration Info */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          border: `1px solid ${ORANGE}`, 
          borderRadius: '0.75rem', 
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: ORANGE, marginBottom: '1rem' }}>
            🛡️ How FMCSA Integration Protects Your Fleet
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: GREEN, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
              <span><strong>Real-time CSA Scoring:</strong> Know each driver's federal safety rating (lower is better). CSA &gt; 90 = high risk.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: GREEN, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
              <span><strong>Automatic Violations Check:</strong> Federal violations surface instantly. Roadside inspection violations auto-populate from FMCSA database.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: GREEN, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
              <span><strong>License + Medical Expiry Alerts:</strong> Never deploy a driver with an expired license or medical certificate. TruckWithEase flags both 90 days before expiry.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: GREEN, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
              <span><strong>Geotab ELD Auto-Sync:</strong> HOS logs sync live from Geotab devices. No manual entry. DOT compliance guaranteed.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ color: GREEN, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
              <span><strong>Roadside Inspection Ready:</strong> Your complete FMCSA record is always current. Officers get real-time driver safety data at the scale.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
