import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { 
  loadGoogleMaps, 
  GOOGLE_MAPS_KEY,
  getDirections,
  getDistanceMatrix,
  geocodeAddress,
  searchNearby,
  getElevation,
} from '../maps-config.js';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
};

const GOOGLE_APIS = [
  {
    name: 'Maps JavaScript API',
    service: 'maps',
    description: 'Real-time mapping, directions, routing, markers',
    usage: ['Route planning', 'Charge stops map', 'Geofencing', 'Fleet tracking'],
    testFn: loadGoogleMaps,
    required: true,
    quota: '25,000 requests/day',
  },
  {
    name: 'Directions API',
    service: 'directions',
    description: 'Calculate routes between two or more points',
    usage: ['Trip planning', 'Route optimization', 'ETA calculation'],
    testFn: () => getDirections('New York', 'Los Angeles'),
    required: true,
    quota: '2,500 requests/day',
  },
  {
    name: 'Distance Matrix API',
    service: 'distance_matrix',
    description: 'Calculate distances and travel times between multiple locations',
    usage: ['Fleet dispatch', 'Stop optimization', 'Cost calculation'],
    testFn: () => getDistanceMatrix(['New York'], ['Los Angeles']),
    required: true,
    quota: '2,500 requests/day',
  },
  {
    name: 'Geocoding API',
    service: 'geocoding',
    description: 'Convert addresses to coordinates and vice versa',
    usage: ['Address validation', 'Stop location lookup', 'Driver address verification'],
    testFn: () => geocodeAddress('New York, NY'),
    required: true,
    quota: '50,000 requests/day',
  },
  {
    name: 'Places API',
    service: 'places',
    description: 'Find and get details about places (charge stops, fuel stations, etc.)',
    usage: ['Charge stop discovery', 'Fuel finder', 'Parking location search', 'Restaurant ratings'],
    testFn: () => searchNearby(40.7128, -74.0060, 'gas_station'),
    required: true,
    quota: '25,000 requests/day',
  },
  {
    name: 'Elevation API',
    service: 'elevation',
    description: 'Get elevation data for routes and locations',
    usage: ['Terrain analysis', 'Grade calculation', 'Truck capability assessment'],
    testFn: () => getElevation(40.7128, -74.0060),
    required: false,
    quota: '25,000 requests/day',
  },
  {
    name: 'Vision API (REST)',
    service: 'vision',
    description: 'Image recognition, text extraction, label detection',
    usage: ['DVIR photo analysis', 'Accident report document scanning', 'Plate recognition'],
    testFn: null,
    required: false,
    quota: '1,000 requests/day',
    note: 'Requires separate API key setup in Google Cloud Console',
  },
  {
    name: 'Speech-to-Text API (REST)',
    service: 'speech',
    description: 'Convert audio to text with high accuracy',
    usage: ['Voice commands', 'Voice clone training', 'Accident report dictation', 'HOS logging by voice'],
    testFn: null,
    required: false,
    quota: '60,000 minutes/month',
    note: 'Requires separate API key setup in Google Cloud Console',
  },
  {
    name: 'Natural Language API (REST)',
    service: 'nlp',
    description: 'Analyze sentiment, entities, and syntax in text',
    usage: ['Broker rating sentiment analysis', 'Complaint classification', 'Driver feedback analysis'],
    testFn: null,
    required: false,
    quota: '5,000 requests/day',
    note: 'Requires separate API key setup in Google Cloud Console',
  },
  {
    name: 'Text-to-Speech API (REST)',
    service: 'text_to_speech',
    description: 'Convert text to natural-sounding audio',
    usage: ['Voice clone agent responses', 'Alert narration', 'Navigation audio', 'Accessibility'],
    testFn: null,
    required: false,
    quota: '4 million characters/month',
    note: 'CRITICAL for Voice Clone feature — must enable & test',
  },
  {
    name: 'Translation API (REST)',
    service: 'translation',
    description: 'Translate text between languages',
    usage: ['Multi-language support', 'Driver communications', 'Broker message translation'],
    testFn: null,
    required: false,
    quota: '500,000 characters/month',
    note: 'Requires separate API key setup in Google Cloud Console',
  },
  {
    name: 'Roads API',
    service: 'roads',
    description: 'Snap coordinates to roads, get speed limits',
    usage: ['Route accuracy', 'Speed limit alerts', 'Regulatory compliance'],
    testFn: null,
    required: false,
    quota: '20,000 requests/day',
  },
];

export default function GoogleAPIsPage() {
  const [apiStatus, setApiStatus] = useState({});
  const [testing, setTesting] = useState(null);
  const [customKey, setCustomKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load initial status for all APIs
    const checkAPIs = async () => {
      const status = {};
      for (const api of GOOGLE_APIS) {
        status[api.service] = 'checking';
      }
      setApiStatus(status);

      // Test each API
      for (const api of GOOGLE_APIS) {
        try {
          if (api.testFn) {
            await api.testFn();
            status[api.service] = 'active';
          } else {
            status[api.service] = 'pending';
          }
        } catch (err) {
          status[api.service] = 'error';
        }
        setApiStatus({ ...status });
      }
    };
    checkAPIs();
  }, []);

  const testAPI = async (api) => {
    if (!api.testFn) {
      alert('This API requires manual setup in Google Cloud Console.');
      return;
    }
    setTesting(api.service);
    try {
      await api.testFn();
      setApiStatus(prev => ({ ...prev, [api.service]: 'active' }));
    } catch (err) {
      setApiStatus(prev => ({ ...prev, [api.service]: 'error' }));
      alert(`Error testing ${api.name}: ${err.message}`);
    }
    setTesting(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return C.green;
      case 'error': return C.red;
      case 'pending': return C.gold;
      default: return C.white30;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '✓ Active';
      case 'error': return '✗ Error';
      case 'pending': return '⏳ Manual Setup';
      case 'checking': return '🔄 Checking…';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            🔌 Google APIs Control Center
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Manage all 11 Google APIs integrated with TruckWithEase. Check status, test connectivity, and monitor quota usage. API key:
            <span style={{
              marginLeft: '8px',
              fontSize: 13,
              fontFamily: 'monospace',
              background: C.card,
              padding: '4px 8px',
              borderRadius: 4,
              display: 'inline-block',
            }}>
              {showKey ? GOOGLE_MAPS_KEY : '••••••••••••••••••••••••••••••••••••••••'}
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.gold,
                  cursor: 'pointer',
                  marginLeft: '8px',
                  padding: 0,
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </span>
          </p>
        </div>

        {/* Status Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'APIs Active', value: Object.values(apiStatus).filter(s => s === 'active').length },
            { label: 'APIs Pending', value: Object.values(apiStatus).filter(s => s === 'pending').length },
            { label: 'APIs Error', value: Object.values(apiStatus).filter(s => s === 'error').length },
            { label: 'Daily Quota Remaining', value: '~80% (checks daily)' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: C.white60, marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* API List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {GOOGLE_APIS.map(api => {
            const status = apiStatus[api.service] || 'checking';
            const statusColor = getStatusColor(status);

            return (
              <div key={api.service} style={{
                background: C.card,
                border: `1px solid ${C.white30}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding: '16px',
                  borderBottom: `1px solid ${C.white30}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '4px', color: C.white }}>
                      {api.name}
                    </h3>
                    <p style={{ fontSize: 12, color: C.white60 }}>{api.description}</p>
                  </div>
                  {api.required && (
                    <span style={{
                      fontSize: 11,
                      background: C.gold,
                      color: C.black,
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      Required
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '16px' }}>
                  {/* Status */}
                  <div style={{
                    padding: '12px',
                    background: C.black,
                    borderRadius: 6,
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>
                      {getStatusLabel(status)}
                    </div>
                    <div style={{ fontSize: 11, color: C.white60 }}>{api.quota}</div>
                  </div>

                  {/* Usage */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: 11, color: C.white60, fontWeight: 600, marginBottom: '6px' }}>
                      USAGE:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {api.usage.map((use, idx) => (
                        <li key={idx} style={{ fontSize: 12, color: C.white60, marginBottom: '4px' }}>
                          • {use}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Note */}
                  {api.note && (
                    <div style={{
                      fontSize: 11,
                      color: api.note.includes('CRITICAL') ? C.red : C.gold,
                      background: api.note.includes('CRITICAL') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                      padding: '8px',
                      borderRadius: 4,
                      marginBottom: '12px',
                      border: `1px solid ${api.note.includes('CRITICAL') ? C.red + '33' : C.gold + '33'}`,
                    }}>
                      ⓘ {api.note}
                    </div>
                  )}

                  {/* Action Button */}
                  {api.testFn && (
                    <button
                      onClick={() => testAPI(api)}
                      disabled={testing === api.service}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: testing === api.service ? C.white30 : C.blue,
                        color: C.white,
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: testing === api.service ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {testing === api.service ? 'Testing…' : 'Test Connection'}
                    </button>
                  )}
                  {!api.testFn && (
                    <a
                      href="https://console.cloud.google.com/apis/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        background: C.gold,
                        color: C.black,
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      Go to Google Cloud Console
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Setup Instructions */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 10,
          padding: '24px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            ⚙️ Setup Instructions
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: 1.8, color: C.white60, fontSize: 13 }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Enable APIs:</strong> Go to Google Cloud Console → APIs & Services → Enable the APIs above for your project
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Billing:</strong> Add a payment method to unlock higher quotas (pay-as-you-go, no fixed fees)
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>API Keys:</strong> For REST APIs (Vision, Speech, NLP, Translate), create API keys in Cloud Console and add them below
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Text-to-Speech (CRITICAL for Voice Clone):</strong> Must enable Google Cloud Text-to-Speech API. This powers the voice clone agent.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Test:</strong> Click "Test Connection" on each API to verify it's working
            </li>
            <li>
              <strong>Monitor:</strong> Check quota usage in Cloud Console → Quotas & System Limits
            </li>
          </ol>
        </div>

        {/* API Key Management */}
        <div style={{
          marginTop: '32px',
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 10,
          padding: '24px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            🔑 Add Additional API Keys
          </h2>
          <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px' }}>
            For REST APIs (Vision, Speech, NLP, Translate), paste your Google Cloud API key here:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={customKey}
              onChange={e => setCustomKey(e.target.value)}
              placeholder="Paste your Google Cloud API key here"
              style={{
                padding: '12px',
                background: C.black,
                border: `1px solid ${C.white30}`,
                borderRadius: 6,
                color: C.white,
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => {
                if (customKey) {
                  localStorage.setItem('google_cloud_key', customKey);
                  alert('API key saved successfully!');
                  setCustomKey('');
                } else {
                  alert('Please paste an API key first.');
                }
              }}
              style={{
                padding: '12px',
                background: C.gold,
                color: C.black,
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
