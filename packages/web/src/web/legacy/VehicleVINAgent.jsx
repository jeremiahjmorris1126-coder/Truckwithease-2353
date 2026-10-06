import React, { useState } from 'react';

import { Camera, MapPin, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
const NAVY = '#1e3a5f';
const ORANGE = '#ea8c35';
const AMBER = '#f59e0b';
const GREEN = '#10b981';
const RED = '#ef4444';

export default function VehicleVINAgent() {
  const [vinInput, setVinInput] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock VIN database - in production, this would query DOT, NHTSA, and internal records
  const mockVINDatabase = {
    '1HGCV41JXMN109186': {
      vin: '1HGCV41JXMN109186',
      year: 2021,
      make: 'Honda',
      model: 'Civic',
      licensePlate: 'TRK-4829',
      owner: 'Morrishive Logistics LLC',
      ownerPhone: '(555) 234-5678',
      ownerEmail: 'truckeasecare@gmail.com',
      homeYard: {
        address: '1450 Industrial Blvd, Memphis, TN 38112',
        coordinates: { lat: 35.1264, lng: -90.0176 },
        phone: '(901) 555-0147'
      },
      maintenanceRecords: [
        { date: '2026-07-15', type: 'Oil Change', cost: 89.99, odometer: 45320, status: 'completed' },
        { date: '2026-06-22', type: 'Tire Rotation', cost: 129.00, odometer: 44980, status: 'completed' },
        { date: '2026-05-10', type: 'Brake Inspection', cost: 199.99, odometer: 44100, status: 'completed' },
        { date: '2026-04-05', type: 'Engine Diagnostic', cost: 159.99, odometer: 43400, status: 'completed' },
        { date: '2026-03-01', type: 'Coolant Flush', cost: 149.99, odometer: 42800, status: 'completed' }
      ],
      loansAndFinancing: [
        { lender: 'Commercial Fleet Finance Corp', loanId: 'CFF-2021-001', originalAmount: 32000, amountDue: 8420.50, interestRate: '6.5%', dueDate: '2026-09-15', status: 'active', monthlyPayment: 580 },
        { lender: 'Equipment Leasing Partners', loanId: 'ELP-2025-042', originalAmount: 5500, amountDue: 2100.00, interestRate: '7.2%', dueDate: '2026-08-20', status: 'active', monthlyPayment: 185 }
      ],
      nextMaintenanceDue: {
        type: 'Oil Change',
        dueDate: '2026-08-15',
        daysUntilDue: 12,
        estimatedCost: 89.99
      },
      complianceStatus: 'good',
      lastInspection: '2026-07-20',
      inspectionExpires: '2027-07-20'
    },
    '5TDKRFH72LS123456': {
      vin: '5TDKRFH72LS123456',
      year: 2020,
      make: 'Toyota',
      model: 'Tundra',
      licensePlate: 'TRK-3941',
      owner: 'Morrishive Logistics LLC',
      ownerPhone: '(555) 234-5678',
      ownerEmail: 'truckeasecare@gmail.com',
      homeYard: {
        address: '1450 Industrial Blvd, Memphis, TN 38112',
        coordinates: { lat: 35.1264, lng: -90.0176 },
        phone: '(901) 555-0147'
      },
      maintenanceRecords: [
        { date: '2026-06-30', type: 'Transmission Service', cost: 450.00, odometer: 78920, status: 'completed' },
        { date: '2026-05-15', type: 'Battery Replacement', cost: 189.99, odometer: 78100, status: 'completed' }
      ],
      loansAndFinancing: [
        { lender: 'Commercial Fleet Finance Corp', loanId: 'CFF-2020-008', originalAmount: 42000, amountDue: 12950.75, interestRate: '6.8%', dueDate: '2026-10-01', status: 'active', monthlyPayment: 720 }
      ],
      nextMaintenanceDue: {
        type: 'Oil Change',
        dueDate: '2026-08-30',
        daysUntilDue: 27,
        estimatedCost: 99.99
      },
      complianceStatus: 'good',
      lastInspection: '2026-06-15',
      inspectionExpires: '2027-06-15'
    }
  };

  const handleVINLookup = () => {
    if (!vinInput.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundVehicle = mockVINDatabase[vinInput.toUpperCase()];
      if (foundVehicle) {
        setVehicleData(foundVehicle);
      } else {
        setVehicleData(null);
      }
      setLoading(false);
    }, 1000);
  };

  const getTotalDebt = () => {
    if (!vehicleData?.loansAndFinancing) return 0;
    return vehicleData.loansAndFinancing.reduce((sum, loan) => sum + loan.amountDue, 0);
  };

  const handleCameraCapture = () => {
    // In production, this would open device camera and OCR the VIN
    setCameraActive(true);
    // Simulating camera capture - in real app, this would parse VIN from image
    setTimeout(() => {
      setVinInput('1HGCV41JXMN109186');
      setCameraActive(false);
    }, 2000);
  };

  return (
    <div style={{ background: NAVY, minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            Vehicle VIN Agent
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '16px' }}>
            Snap a photo of your VIN or enter it manually. Instantly see maintenance history, loan balances, ownership, and home yard location.
          </p>
        </div>

        {/* VIN Input Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: NAVY }}>
              Vehicle VIN
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleVINLookup()}
                placeholder="Enter VIN or capture photo"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '12px',
                  border: `2px solid ${ORANGE}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleVINLookup}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: ORANGE,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Searching...' : 'Look Up'}
              </button>
              <button
                onClick={handleCameraCapture}
                style={{
                  padding: '12px 24px',
                  background: GREEN,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} /> Scan VIN
              </button>
            </div>
          </div>
          {cameraActive && (
            <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', color: '#1e40af', fontSize: '14px' }}>
              📷 Camera active - capturing VIN from photo...
            </div>
          )}
        </div>

        {/* Sample VINs */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>Try these VINs:</strong> 1HGCV41JXMN109186 or 5TDKRFH72LS123456
        </div>

        {vehicleData && (
          <>
            {/* Vehicle Overview Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: NAVY, marginBottom: '4px' }}>
                    {vehicleData.year} {vehicleData.make} {vehicleData.model}
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px' }}>VIN: {vehicleData.vin}</p>
                  <p style={{ color: '#666', fontSize: '14px' }}>License: {vehicleData.licensePlate}</p>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: vehicleData.complianceStatus === 'good' ? '#d1fae5' : '#fed7aa',
                  color: vehicleData.complianceStatus === 'good' ? GREEN : AMBER,
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={18} />
                  {vehicleData.complianceStatus === 'good' ? 'Compliant' : 'Needs Attention'}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '16px', borderBottom: `2px solid #e5e7eb`, marginBottom: '20px' }}>
                {['overview', 'maintenance', 'loans', 'location'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontWeight: selectedTab === tab ? '600' : '500',
                      color: selectedTab === tab ? ORANGE : '#666',
                      borderBottom: selectedTab === tab ? `3px solid ${ORANGE}` : 'none',
                      marginBottom: '-2px'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {selectedTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>OWNER</div>
                    <div style={{ color: NAVY, fontWeight: '600', marginBottom: '8px' }}>{vehicleData.owner}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{vehicleData.ownerPhone}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{vehicleData.ownerEmail}</div>
                  </div>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>INSPECTION</div>
                    <div style={{ color: NAVY, fontWeight: '600', marginBottom: '4px' }}>Last: {vehicleData.lastInspection}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Expires: {vehicleData.inspectionExpires}</div>
                  </div>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>NEXT MAINTENANCE</div>
                    <div style={{ color: NAVY, fontWeight: '600', marginBottom: '4px' }}>{vehicleData.nextMaintenanceDue.type}</div>
                    <div style={{ fontSize: '13px', color: vehicleData.nextMaintenanceDue.daysUntilDue <= 7 ? RED : '#666' }}>
                      Due in {vehicleData.nextMaintenanceDue.daysUntilDue} days
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'maintenance' && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ color: NAVY, fontWeight: '600', marginBottom: '12px' }}>Maintenance History</h3>
                    {vehicleData.maintenanceRecords.map((record, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: NAVY }}>{record.type}</div>
                          <div style={{ fontSize: '13px', color: '#666' }}>{record.date} • {record.odometer.toLocaleString()} mi</div>
                        </div>
                        <div style={{ fontWeight: '600', color: GREEN }}>${record.cost.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'loans' && (
                <div>
                  <div style={{
                    padding: '16px',
                    background: '#fee2e2',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: '#991b1b', fontWeight: '600', fontSize: '14px' }}>TOTAL AMOUNT DUE</div>
                      <div style={{ color: RED, fontSize: '24px', fontWeight: 'bold' }}>
                        ${getTotalDebt().toFixed(2)}
                      </div>
                    </div>
                    <DollarSign size={32} color={RED} />
                  </div>

                  <h3 style={{ color: NAVY, fontWeight: '600', marginBottom: '12px' }}>Active Loans</h3>
                  {vehicleData.loansAndFinancing.map((loan, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: `2px solid ${loan.daysUntilDue <= 14 ? RED : '#e5e7eb'}`
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>LENDER</div>
                          <div style={{ color: NAVY, fontWeight: '600' }}>{loan.lender}</div>
                        </div>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>LOAN ID</div>
                          <div style={{ color: NAVY, fontWeight: '600' }}>{loan.loanId}</div>
                        </div>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>AMOUNT DUE</div>
                          <div style={{ color: RED, fontWeight: '600', fontSize: '16px' }}>${loan.amountDue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>MONTHLY PAYMENT</div>
                          <div style={{ color: NAVY, fontWeight: '600' }}>${loan.monthlyPayment}</div>
                        </div>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>INTEREST RATE</div>
                          <div style={{ color: NAVY, fontWeight: '600' }}>{loan.interestRate}</div>
                        </div>
                        <div>
                          <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>DUE DATE</div>
                          <div style={{ color: NAVY, fontWeight: '600' }}>{loan.dueDate}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === 'location' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <MapPin size={20} color={ORANGE} />
                      <div style={{ color: '#999', fontSize: '12px', fontWeight: '600' }}>HOME YARD</div>
                    </div>
                    <div style={{ color: NAVY, fontWeight: '600', marginBottom: '8px' }}>
                      {vehicleData.homeYard.address}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                      {vehicleData.homeYard.phone}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Lat: {vehicleData.homeYard.coordinates.lat}, Long: {vehicleData.homeYard.coordinates.lng}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!vehicleData && vinInput && !loading && (
          <div style={{
            background: '#fee2e2',
            borderRadius: '12px',
            padding: '24px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={24} />
            <div>
              <strong>Vehicle not found.</strong> Please check the VIN and try again, or use one of the sample VINs above.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
