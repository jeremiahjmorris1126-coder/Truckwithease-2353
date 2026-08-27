import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function APIIntegrationDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const integrations = [
    {
      id: 1,
      feature: 'Entertainment (Movies & Music)',
      status: 'Ready for Integration',
      priority: 'High',
      complexity: 'Medium',
      apis: [
        {
          name: 'Spotify Web API',
          purpose: 'Stream music, playlist management, playback control',
          auth: 'OAuth 2.0',
          cost: 'Free tier (dev) / $0.004 per stream (production)',
          effort: '2-3 weeks',
          docs: 'https://developer.spotify.com/documentation/web-api',
        },
        {
          name: 'YouTube Data API v3',
          purpose: 'Search & embed movies, music videos',
          auth: 'API Key / OAuth 2.0',
          cost: 'Free (1M quota/day)',
          effort: '1-2 weeks',
          docs: 'https://developers.google.com/youtube/v3',
        },
        {
          name: 'TMDB (The Movie Database) API',
          purpose: 'Movie metadata, ratings, trailers, posters',
          auth: 'API Key',
          cost: 'Free',
          effort: '1 week',
          docs: 'https://www.themoviedb.org/settings/api',
        },
      ],
    },
    {
      id: 2,
      feature: 'GPS & Real-time Tracking',
      status: 'Ready for Integration',
      priority: 'High',
      complexity: 'High',
      apis: [
        {
          name: 'Google Maps Platform',
          purpose: 'Real-time location tracking, route optimization, geocoding',
          auth: 'API Key',
          cost: '$7 per 1,000 requests (pay-as-you-go)',
          effort: '3-4 weeks',
          docs: 'https://developers.google.com/maps',
        },
        {
          name: 'Mapbox GL JS',
          purpose: 'Custom map rendering, real-time fleet tracking',
          auth: 'Access Token',
          cost: '$0.50 per 1,000 requests after free tier',
          effort: '2-3 weeks',
          docs: 'https://docs.mapbox.com/mapbox-gl-js/',
        },
      ],
    },
    {
      id: 3,
      feature: 'Weather Data',
      status: 'Ready for Integration',
      priority: 'Medium',
      complexity: 'Low',
      apis: [
        {
          name: 'OpenWeatherMap API',
          purpose: 'Current weather, 5-day forecast, alerts',
          auth: 'API Key',
          cost: 'Free tier (1,000 calls/day)',
          effort: '3-5 days',
          docs: 'https://openweathermap.org/api',
        },
      ],
    },
    {
      id: 4,
      feature: 'Load Board & Freight Matching',
      status: 'Ready for Integration',
      priority: 'High',
      complexity: 'High',
      apis: [
        {
          name: 'DAT Load Board API',
          purpose: 'Access to live loads, spot pricing, carrier analytics',
          auth: 'OAuth 2.0',
          cost: '$99-299/month + transaction fees',
          effort: '3-4 weeks',
          docs: 'https://api.dat.com/docs',
        },
        {
          name: 'Convoy API (Alternative)',
          purpose: 'Freight matching, pricing, carrier analytics',
          auth: 'API Key / OAuth 2.0',
          cost: '$0-500/month (scale-based)',
          effort: '3-4 weeks',
          docs: 'https://developers.convoy.com',
        },
      ],
    },
    {
      id: 5,
      feature: 'Payment Processing',
      status: 'Ready for Integration',
      priority: 'Critical',
      complexity: 'High',
      apis: [
        {
          name: 'Stripe API',
          purpose: 'Credit card processing, recurring billing, payouts',
          auth: 'API Key (secret + publishable)',
          cost: '2.9% + $0.30 per transaction',
          effort: '2-3 weeks',
          docs: 'https://stripe.com/docs/api',
        },
        {
          name: 'ACH/Bank Transfers',
          purpose: 'Direct bank account payouts to drivers',
          auth: 'OAuth 2.0',
          cost: '$0.25-$0.50 per transfer',
          effort: '4-5 weeks',
          docs: 'Via Stripe or Plaid',
        },
      ],
    },
    {
      id: 6,
      feature: 'Fuel Card & Telematics',
      status: 'Ready for Integration',
      priority: 'High',
      complexity: 'Medium',
      apis: [
        {
          name: 'Love\'s/Pilot Fuel API',
          purpose: 'Integrate fuel card services, loyalty programs',
          auth: 'API Key / OAuth 2.0',
          cost: 'Partnership-based',
          effort: '4-6 weeks (partnership negotiation)',
          docs: 'Contact sales team',
        },
        {
          name: 'Samsara / Verizon Connect',
          purpose: 'Vehicle telematics, fuel consumption, driver behavior',
          auth: 'API Key',
          cost: '$10-50/vehicle/month',
          effort: '2-3 weeks',
          docs: 'https://developers.samsara.com',
        },
      ],
    },
    {
      id: 7,
      feature: 'Email & SMS Notifications',
      status: 'Ready for Integration',
      priority: 'High',
      complexity: 'Low',
      apis: [
        {
          name: 'Twilio',
          purpose: 'SMS, WhatsApp, voice notifications',
          auth: 'API Key',
          cost: '$0.0075 per SMS (after free tier)',
          effort: '1 week',
          docs: 'https://www.twilio.com/docs',
        },
        {
          name: 'SendGrid',
          purpose: 'Transactional email, marketing emails',
          auth: 'API Key',
          cost: 'Free tier (100 emails/day)',
          effort: '1 week',
          docs: 'https://sendgrid.com/docs',
        },
      ],
    },
    {
      id: 8,
      feature: 'Document & Invoice Management',
      status: 'Ready for Integration',
      priority: 'Medium',
      complexity: 'Medium',
      apis: [
        {
          name: 'DocuSign eSignature API',
          purpose: 'Digital signing of BOLs, contracts, invoices',
          auth: 'OAuth 2.0',
          cost: '$10-50/month per user',
          effort: '2-3 weeks',
          docs: 'https://developers.docusign.com',
        },
      ],
    },
  ];

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .api-tab {
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
        .api-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '32px 5%', borderBottom: `2px solid ${ORANGE}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>API Integration Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            All APIs required for TruckWithEase features—playback, tracking, payments, fuel, and notifications.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'overview', label: '📋 All Integrations' },
          { id: 'entertainment', label: '🎬 Entertainment' },
          { id: 'payments', label: '💳 Payments' },
          { id: 'ops', label: '🚛 Fleet Ops' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`api-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>All Required APIs</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 24,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{integration.feature}</h3>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{
                          background: integration.status === 'Ready for Integration' ? `${GREEN}20` : `${ORANGE}20`,
                          color: integration.status === 'Ready for Integration' ? GREEN : ORANGE,
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {integration.status}
                        </span>
                        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                          Priority: <span style={{ color: integration.priority === 'Critical' ? RED : integration.priority === 'High' ? ORANGE : AMBER }}>
                            {integration.priority}
                          </span>
                        </span>
                        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                          Complexity: {integration.complexity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {integration.apis.map((api, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 10,
                          padding: 16,
                        }}
                      >
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 10 }}>{api.name}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Purpose</div>
                            <div style={{ fontSize: 12, color: NAVY, fontWeight: 500, lineHeight: 1.4 }}>{api.purpose}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Auth Method</div>
                            <div style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>{api.auth}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Cost</div>
                            <div style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{api.cost}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Dev Effort</div>
                            <div style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>{api.effort}</div>
                          </div>
                        </div>
                        <a
                          href={api.docs}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            fontSize: 11,
                            color: AMBER,
                            fontWeight: 700,
                            textDecoration: 'none',
                            borderBottom: `1px solid ${AMBER}`,
                          }}
                        >
                          View Documentation →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'entertainment' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>🎬 Entertainment: Movie & Music Streaming</h2>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>How Playback Works</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: ORANGE, marginBottom: 12 }}>🎵 Music Playback (Spotify)</h4>
                  <ol style={{ paddingLeft: 20, display: 'grid', gap: 8, fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                    <li>User clicks "Play Song"</li>
                    <li>Frontend calls Spotify Web API with song URI</li>
                    <li>Spotify returns playback token & metadata</li>
                    <li>Embed Spotify Web Playback SDK in browser</li>
                    <li>Player controls (play, pause, skip, volume) work in-app</li>
                  </ol>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: ORANGE, marginBottom: 12 }}>🎬 Movie Playback (YouTube / TMDB)</h4>
                  <ol style={{ paddingLeft: 20, display: 'grid', gap: 8, fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                    <li>User clicks "Play Movie"</li>
                    <li>Frontend queries YouTube Data API for video</li>
                    <li>Embed YouTube player iframe</li>
                    <li>User watches within TruckWithEase app</li>
                    <li>Track watch time (analytics)</li>
                  </ol>
                </div>
              </div>
            </div>

            <div style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>✓ Quick Setup Path</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { step: '1. Create Spotify Dev Account', time: '15 min', effort: 'Easy' },
                  { step: '2. Get API credentials (Client ID, Secret)', time: '5 min', effort: 'Easy' },
                  { step: '3. Implement Spotify Web Playback SDK', time: '2-3 days', effort: 'Medium' },
                  { step: '4. Test & Deploy', time: '1 day', effort: 'Easy' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{item.step}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>⏱️ {item.time}</div>
                    <div style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>Effort: {item.effort}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>💳 Payment Processing & Payouts</h2>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>Stripe Implementation</h3>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>
                Stripe handles billing, card processing, and recurring payments. Use Stripe Connect for payouts to driver accounts.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: ORANGE, marginBottom: 12 }}>Fleet Billing</h4>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 6, fontSize: 12, color: '#64748B' }}>
                    <li>Create Stripe customer for each fleet</li>
                    <li>Store card securely (Stripe handles PCI)</li>
                    <li>Bill monthly/yearly subscriptions</li>
                    <li>Handle failed payments & retries</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: ORANGE, marginBottom: 12 }}>Driver Payouts</h4>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 6, fontSize: 12, color: '#64748B' }}>
                    <li>Connect driver bank accounts securely</li>
                    <li>Pay fuel reimbursements via ACH</li>
                    <li>Payout load earnings weekly</li>
                    <li>Track payroll & taxes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'ops' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>🚛 Fleet Operations APIs</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                {
                  title: 'GPS & Real-time Tracking',
                  icon: '📍',
                  items: [
                    'Google Maps for location, routing, traffic',
                    'Update driver locations every 10-30 seconds',
                    'Show live fleet positions on dashboard',
                    'Cost: $7/1K requests (~$10-50/month for 50-truck fleet)',
                  ],
                },
                {
                  title: 'Load Board',
                  icon: '📦',
                  items: [
                    'DAT Load Board API: $99-299/month',
                    'Access 10M+ loads daily across US',
                    'Pull rates, match loads to fleet capacity',
                    'Alternative: Convoy API (variable pricing)',
                  ],
                },
                {
                  title: 'Weather & Alerts',
                  icon: '🌧️',
                  items: [
                    'OpenWeatherMap: Free tier (1K calls/day)',
                    'Show forecast for driver routes',
                    'Alert on severe weather ahead',
                    'Integration: < 1 week',
                  ],
                },
                {
                  title: 'Fuel Card Integration',
                  icon: '⛽',
                  items: [
                    'Partner with Pilot/Love\'s directly',
                    'Import fuel transactions automatically',
                    'Track fuel costs per load',
                    'Negotiated partnership cost (usually $0)',
                  ],
                },
              ].map((section, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>{section.icon}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{section.title}</h3>
                  </div>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 8 }}>
                    {section.items.map((item, j) => (
                      <li key={j} style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
