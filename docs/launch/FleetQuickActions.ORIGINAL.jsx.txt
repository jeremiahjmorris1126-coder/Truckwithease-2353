import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { Zap, Truck, MapPin, Users, DollarSign, Shield, Settings, Plus } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function FleetQuickActions() {
  const [fleetEmail, setFleetEmail] = useState('');
  const [actions, setActions] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('dispatch');

  const defaultActions = [
    {
      id: 'dispatch-load',
      name: 'Dispatch Load',
      category: 'dispatch',
      description: 'Assign a new load to a driver',
      icon: '🚚',
      color: ORANGE,
      time: '5 min'
    },
    {
      id: 'check-compliance',
      name: 'Check Compliance',
      category: 'compliance',
      description: 'View HOS, DVIR, and expiry status',
      icon: '✓',
      color: GREEN,
      time: '2 min'
    },
    {
      id: 'fuel-check',
      name: 'Fuel Check',
      category: 'fuel',
      description: 'Find cheapest fuel nearby',
      icon: '⛽',
      color: AMBER,
      time: '1 min'
    },
    {
      id: 'profitability',
      name: 'Check Profitability',
      category: 'finance',
      description: 'View load margins and earnings',
      icon: '💰',
      color: GREEN,
      time: '3 min'
    },
    {
      id: 'driver-perf',
      name: 'Driver Performance',
      category: 'people',
      description: 'See safety scores and metrics',
      icon: '👥',
      color: NAVY,
      time: '4 min'
    },
    {
      id: 'maintenance',
      name: 'Schedule Maintenance',
      category: 'maintenance',
      description: 'Book truck service or repairs',
      icon: '🔧',
      color: RED,
      time: '3 min'
    },
    {
      id: 'breakdown-sos',
      name: 'Breakdown SOS',
      category: 'emergency',
      description: 'Get immediate roadside assistance',
      icon: '🆘',
      color: RED,
      time: '1 min'
    },
    {
      id: 'weather-alerts',
      name: 'Weather & Delays',
      category: 'planning',
      description: 'Check route conditions and hazards',
      icon: '🌦️',
      color: NAVY,
      time: '2 min'
    },
  ];

  useEffect(() => {
    const email = sessionStorage.getItem('signup_email');
    if (email) {
      setFleetEmail(email);
      loadQuickActions(email);
    }
  }, []);

  async function loadQuickActions(email) {
    try {
      const records = await pb.collection('fleet_quick_actions').getList(1, 50, {
        filter: `fleet_email = "${email}"`,
      });
      if (records.items.length > 0) {
        setActions(records.items.map(a => a.action_data));
        setRecentActions(records.items.slice(0, 5).map(a => ({
          name: a.action_data?.name,
          time: new Date(a.created).toLocaleTimeString(),
          status: a.status || 'completed'
        })));
      } else {
        setActions(defaultActions);
      }
    } catch (e) {
      setActions(defaultActions);
    }
  }

  async function addCustomAction() {
    if (!newActionName.trim()) return;

    const customAction = {
      id: `custom-${Date.now()}`,
      name: newActionName,
      category: selectedCategory,
      description: 'Custom quick action',
      icon: '⚡',
      color: ORANGE,
      time: '5 min',
      custom: true
    };

    try {
      await pb.collection('fleet_quick_actions').create({
        fleet_email: fleetEmail,
        action_data: customAction,
        status: 'created'
      });

      setActions([...actions, customAction]);
      setNewActionName('');
      setShowAddAction(false);
    } catch (error) {
      console.error('Error adding action:', error);
    }
  }

  async function executeAction(action) {
    try {
      await pb.collection('fleet_quick_actions').create({
        fleet_email: fleetEmail,
        action_data: action,
        status: 'executed'
      });

      setRecentActions([
        { name: action.name, time: new Date().toLocaleTimeString(), status: 'completed' },
        ...recentActions.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }

  const categories = ['dispatch', 'compliance', 'fuel', 'finance', 'people', 'maintenance', 'emergency', 'planning'];
  const categoryEmojis = {
    dispatch: '🚚',
    compliance: '✓',
    fuel: '⛽',
    finance: '💰',
    people: '👥',
    maintenance: '🔧',
    emergency: '🆘',
    planning: '🌦️'
  };

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '32px 24px', borderBottom: `2px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Zap size={32} style={{ color: AMBER }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Fleet Quick Actions</h1>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#a0b4d8', margin: 0 }}>One-click access to your most critical fleet operations. Dispatch, compliance, fuel, profitability, and more—all in seconds.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        {/* Quick Actions Grid */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24, color: AMBER }}>Essential Fleet Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => executeAction(action)}
                style={{
                  background: NAVY2,
                  border: `2px solid ${action.color}`,
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: 'translateY(0)',
                  boxShadow: `0 0 0 rgba(255, 107, 0, 0)`,
                  hoverState: {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px rgba(255, 107, 0, 0.2)`
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(255, 107, 0, 0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 0 0 rgba(255, 107, 0, 0)`;
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{action.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  {action.name}
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#a0b4d8', lineHeight: 1.4 }}>
                  {action.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid rgba(255, 180, 0, 0.1)` }}>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>⏱️ {action.time}</span>
                  <span style={{ fontSize: '0.8rem', color: action.color, fontWeight: 600 }}>→</span>
                </div>
              </button>
            ))}
          </div>

          {/* Add Custom Action Button */}
          <button
            onClick={() => setShowAddAction(!showAddAction)}
            style={{
              padding: '14px 24px',
              background: NAVY2,
              border: `2px dashed ${AMBER}`,
              borderRadius: 12,
              color: AMBER,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(255, 180, 0, 0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = NAVY2;
            }}
          >
            <Plus size={20} />
            Add Custom Action
          </button>

          {/* Add Custom Action Form */}
          {showAddAction && (
            <div style={{
              marginTop: 20,
              padding: 24,
              background: NAVY2,
              border: `1px solid ${AMBER}`,
              borderRadius: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 16,
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e0e0e0' }}>
                  Action Name
                </label>
                <input
                  type="text"
                  value={newActionName}
                  onChange={(e) => setNewActionName(e.target.value)}
                  placeholder="e.g., 'Report Vehicle Issue'"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: NAVY,
                    border: `1px solid rgba(255, 180, 0, 0.3)`,
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e0e0e0' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: NAVY,
                    border: `1px solid rgba(255, 180, 0, 0.3)`,
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{categoryEmojis[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={addCustomAction}
                style={{
                  padding: '10px 20px',
                  background: GREEN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Create Action
              </button>
            </div>
          )}
        </div>

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, color: AMBER }}>Recent Actions</h2>
            <div style={{
              background: NAVY2,
              borderRadius: 12,
              border: `1px solid rgba(255, 180, 0, 0.2)`,
              overflow: 'hidden'
            }}>
              {recentActions.map((action, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < recentActions.length - 1 ? `1px solid rgba(255, 180, 0, 0.1)` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{action.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>{action.time}</p>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: action.status === 'completed' ? GREEN : AMBER,
                    background: action.status === 'completed' ? `rgba(22, 163, 74, 0.1)` : `rgba(255, 180, 0, 0.1)`,
                    padding: '4px 12px',
                    borderRadius: 4
                  }}>
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
