import { useState, useEffect } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function SubscriberAgentPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [subscribers, setSubscribers] = useState([
    {
      id: 1,
      name: 'Ray Davis',
      email: 'ray@example.com',
      plan: 'Pro',
      status: 'Active',
      joinDate: '2024-07-15',
      profileComplete: true,
      bankingVerified: true,
      resigsFeatures: ['HOS', 'DVIR', 'Load Board', 'Fuel Finder'],
      issues: [],
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      plan: 'Solo',
      status: 'Pending',
      joinDate: '2024-07-20',
      profileComplete: false,
      bankingVerified: false,
      registeredFeatures: ['HOS'],
      issues: ['Profile incomplete', 'Banking not verified'],
    },
    {
      id: 3,
      name: 'John Miller',
      email: 'john@example.com',
      plan: 'Fleet',
      status: 'Active',
      joinDate: '2024-06-10',
      profileComplete: true,
      bankingVerified: true,
      registeredFeatures: ['HOS', 'DVIR', 'Fleet Command', 'GPS Tracking', 'Dispatch'],
      issues: [],
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'Pro',
    features: [],
  });

  const allFeatures = [
    'HOS / ELD Logger',
    'Pre-Trip DVIR',
    'Load Board',
    'GPS Tracking',
    'Fuel Finder',
    'Parking Finder',
    'Dispatch Messaging',
    'Fleet Chief AI',
    'Factoring Integration',
    'Weigh Station Bypass',
    'Traxes AI',
    'Rig Bucks',
  ];

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleAddSubscriber = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email required');
      return;
    }

    const newSubscriber = {
      id: subscribers.length + 1,
      name: formData.name,
      email: formData.email,
      plan: formData.plan,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      profileComplete: true,
      bankingVerified: true,
      registeredFeatures: formData.features,
      issues: [],
    };

    setSubscribers([...subscribers, newSubscriber]);
    setFormData({ name: '', email: '', plan: 'Pro', features: [] });
    setShowForm(false);
  };

  const verifyAlignment = (subscriber) => {
    const issues = [];
    if (!subscriber.profileComplete) issues.push('Profile incomplete');
    if (!subscriber.bankingVerified) issues.push('Banking not verified');
    if (subscriber.registeredFeatures.length === 0) issues.push('No features registered');
    if (subscriber.plan && !subscriber.registeredFeatures.length) issues.push('Plan/features mismatch');
    return issues;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return GREEN;
      case 'Pending':
        return ORANGE;
      case 'Inactive':
        return RED;
      default:
        return '#94A3B8';
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .agent-input {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Poppins',sans-serif;
          color: #0F172A;
          width: 100%;
          outline: none;
          transition: border 0.2s;
        }
        .agent-input:focus {
          border-color: ${AMBER};
          box-shadow: 0 0 0 3px rgba(255,180,0,0.1);
        }
        .agent-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: ${AMBER};
        }
        .agent-tab {
          background: none;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          color: #64748B;
          font-family: 'Poppins',sans-serif;
        }
        .agent-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
        @media (max-width: 1024px) {
          .agent-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '24px 5%', borderBottom: `1px solid ${AMBER}20` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>🤖 Subscriber Agent</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Monitor, manage, and align all subscriber accounts. Ensure complete profiles, verified banking, and correct feature registration.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'verify', label: '✓ Alignment Check' },
          { id: 'manage', label: '⚙️ Manage' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`agent-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* ─── OVERVIEW TAB ─── */}
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, color: NAVY }}>Subscriber Dashboard</h2>

            {/* Stats Cards */}
            <div className="agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Total Subscribers', value: subscribers.length, icon: '👤' },
                { label: 'Active', value: subscribers.filter((s) => s.status === 'Active').length, icon: '✓' },
                { label: 'Pending', value: subscribers.filter((s) => s.status === 'Pending').length, icon: '⏳' },
                { label: 'Fully Aligned', value: subscribers.filter((s) => verifyAlignment(s).length === 0).length, icon: '🎯' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: NAVY }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Subscriber Table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>All Subscribers</h3>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    background: AMBER,
                    color: DARK,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  + Add Subscriber
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      {['Name', 'Email', 'Plan', 'Status', 'Joined', 'Profile', 'Banking', 'Features'].map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: '14px 16px',
                            textAlign: 'left',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#64748B',
                            borderRight: '1px solid #E2E8F0',
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #E2E8F0', background: sub.status === 'Pending' ? 'rgba(255,180,0,0.05)' : 'white' }}>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>{sub.name}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{sub.email}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>{sub.plan}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              background: `${getStatusColor(sub.status)}15`,
                              color: getStatusColor(sub.status),
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{sub.joinDate}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          {sub.profileComplete ? <span style={{ color: GREEN, fontWeight: 700 }}>✓</span> : <span style={{ color: RED }}>✗</span>}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          {sub.bankingVerified ? <span style={{ color: GREEN, fontWeight: 700 }}>✓</span> : <span style={{ color: RED }}>✗</span>}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>{sub.registeredFeatures.length} features</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── ALIGNMENT CHECK TAB ─── */}
        {selectedTab === 'verify' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, color: NAVY }}>Account Alignment Verification</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {subscribers.map((sub) => {
                const issues = verifyAlignment(sub);
                return (
                  <div
                    key={sub.id}
                    style={{
                      background: 'white',
                      borderRadius: 12,
                      border: `2px solid ${issues.length === 0 ? GREEN : issues.length > 1 ? RED : ORANGE}`,
                      padding: 20,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{sub.name}</h3>
                        <p style={{ fontSize: 13, color: '#64748B' }}>{sub.email} · {sub.plan} Plan</p>
                      </div>
                      <span
                        style={{
                          background: issues.length === 0 ? `${GREEN}15` : `${issues.length > 1 ? RED : ORANGE}15`,
                          color: issues.length === 0 ? GREEN : issues.length > 1 ? RED : ORANGE,
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {issues.length === 0 ? '✓ Aligned' : `${issues.length} Issue${issues.length > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {issues.length > 0 && (
                      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: 12 }}>
                        <div style={{ color: '#92400E', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Issues Found:</div>
                        <ul style={{ color: '#92400E', fontSize: 13, marginLeft: 20, lineHeight: 1.8 }}>
                          {issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {issues.length === 0 && (
                      <div style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, padding: 12, color: GREEN, fontSize: 13, fontWeight: 600 }}>
                        ✓ All requirements met — profile complete, banking verified, features aligned with plan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── MANAGE TAB ─── */}
        {selectedTab === 'manage' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, color: NAVY }}>
              {showForm ? 'Add New Subscriber' : 'Manage Subscribers'}
            </h2>

            {showForm ? (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 32, maxWidth: 600 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Full Name</label>
                  <input
                    className="agent-input"
                    placeholder="Ray Davis"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Email Address</label>
                  <input
                    className="agent-input"
                    type="email"
                    placeholder="ray@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Plan</label>
                  <select
                    className="agent-input"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  >
                    <option value="Solo">Solo</option>
                    <option value="Pro">Pro</option>
                    <option value="Fleet">Fleet</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Features to Register</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {allFeatures.map((feature) => (
                      <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          className="agent-checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                        />
                        <span style={{ fontSize: 13, color: '#0F172A' }}>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={handleAddSubscriber}
                    style={{
                      flex: 1,
                      background: AMBER,
                      color: DARK,
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    Add Subscriber
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      flex: 1,
                      background: '#E2E8F0',
                      color: '#0F172A',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: AMBER,
                  color: DARK,
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                + Add New Subscriber
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
