import { useState } from 'react';
import { Copy, Download, Mail, Check, Clock } from 'lucide-react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();
const NAVY = '#1e3a5f';
const ORANGE = '#f59e0b';
const GREEN = '#10b981';

export default function ShareAndOnboardPage() {
  const [copied, setCopied] = useState('');
  const [fleetName, setFleetName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [expirationMode, setExpirationMode] = useState('24h');
  const [customDate, setCustomDate] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [trialCode, setTrialCode] = useState('');
  const baseUrl = window.location.origin;

  const generateTrialCode = () => {
    return 'TW' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const calculateExpiration = () => {
    let expDate;
    if (expirationMode === '24h') {
      expDate = new Date();
      expDate.setHours(expDate.getHours() + 24);
    } else {
      expDate = new Date(customDate);
    }
    return expDate;
  };

  const generateLink = async () => {
    const code = generateTrialCode();
    const expiration = calculateExpiration();
    
    try {
      await pb.collection('trial_links').create({
        code: code,
        fleet_name: fleetName || 'New Fleet',
        contact_email: contactEmail,
        expires_at: expiration.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      });
      
      const fullLink = `${baseUrl}/signup?trial=${code}&fleet=${encodeURIComponent(fleetName || 'New Fleet')}`;
      setGeneratedLink(fullLink);
      setTrialCode(code);
    } catch (err) {
      alert('Failed to generate trial link. Try again.');
      console.error(err);
    }
  };

  const trialLink = generatedLink;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateQRCode = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(trialLink)}`;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `TruckWithEase-Trial-${trialCode}.png`;
    a.click();
  };

  const emailBody = encodeURIComponent(
    `Hi,\n\nYou've been invited to try TruckWithEase — the all-in-one fleet management platform.\n\n📱 Get started: ${trialLink}\n\nYou get:\n• 14-day free trial (no credit card)\n• Real-time dispatch and HOS tracking\n• AI safety coaching\n• Detention recovery automation\n\nThis link expires ${expirationMode === '24h' ? 'in 24 hours' : new Date(customDate).toLocaleDateString()}.\n\nAny questions? Reply to this email.\n\nHappy trucking!`
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '700px' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>
          Share TruckWithEase
        </h1>
        <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
          Generate time-limited trial links and QR codes. They expire in 24 hours or on your chosen date.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
        {/* Link Generation Section */}
        <div style={{ background: 'white', border: `2px solid ${ORANGE}`, borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 24 }}>
            🔗 Generate Trial Link
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
              Fleet Name (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Davis Trucking"
              value={fleetName}
              onChange={e => setFleetName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
              Contact Email (optional)
            </label>
            <input
              type="email"
              placeholder="e.g. manager@fleet.com"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
              Link Expires
            </label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <button
                onClick={() => setExpirationMode('24h')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: expirationMode === '24h' ? ORANGE : '#f3f4f6',
                  color: expirationMode === '24h' ? 'white' : '#374151',
                  border: `1.5px solid ${expirationMode === '24h' ? ORANGE : '#e5e7eb'}`,
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                24 Hours
              </button>
              <button
                onClick={() => setExpirationMode('custom')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: expirationMode === 'custom' ? ORANGE : '#f3f4f6',
                  color: expirationMode === 'custom' ? 'white' : '#374151',
                  border: `1.5px solid ${expirationMode === 'custom' ? ORANGE : '#e5e7eb'}`,
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Custom Date
              </button>
            </div>
            {expirationMode === 'custom' && (
              <input
                type="datetime-local"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1.5px solid ${ORANGE}`,
                  borderRadius: 6,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            )}
          </div>

          <button
            onClick={generateLink}
            disabled={!fleetName && !contactEmail}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              background: (!fleetName && !contactEmail) ? '#d1d5db' : NAVY,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: (!fleetName && !contactEmail) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              if (fleetName || contactEmail) e.currentTarget.style.background = '#0f172a';
            }}
            onMouseLeave={e => {
              if (fleetName || contactEmail) e.currentTarget.style.background = NAVY;
            }}
          >
            <Clock size={16} />
            Generate Time-Limited Link
          </button>

          {generatedLink && (
            <>
              <div style={{ background: '#f0fdf4', border: `2px solid ${GREEN}`, borderRadius: 8, padding: 16, marginTop: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <p style={{ fontWeight: 700, color: GREEN, fontSize: 14 }}>Link Generated!</p>
                </div>
                <p style={{ fontSize: 12, color: '#15803d', marginBottom: 8 }}>
                  Code: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{trialCode}</span>
                </p>
                <p style={{ fontSize: 12, color: '#15803d' }}>
                  Expires: {expirationMode === '24h' 
                    ? new Date(Date.now() + 86400000).toLocaleString()
                    : new Date(customDate).toLocaleString()}
                </p>
              </div>

              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                  Trial Link (Limited Time)
                </p>
                <p style={{ fontSize: 12, color: '#374151', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {trialLink}
                </p>
              </div>

              <button
                onClick={() => handleCopy(trialLink, 'link')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: copied === 'link' ? GREEN : ORANGE,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {copied === 'link' ? <Check size={16} /> : <Copy size={16} />}
                {copied === 'link' ? 'Copied!' : 'Copy Link'}
              </button>
            </>
          )}
        </div>

        {/* QR Code Section */}
        {generatedLink && (
          <div style={{ background: 'white', border: `2px solid ${NAVY}`, borderRadius: 12, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 24 }}>
              📲 QR Code
            </h2>

            <div style={{
              background: '#f9fafb',
              border: '2px dashed #d1d5db',
              borderRadius: 8,
              padding: 32,
              textAlign: 'center',
              marginBottom: 24,
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Scan to start trial
              </p>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                Code: {trialCode}
              </p>
              <p style={{ fontSize: 11, color: '#bbb' }}>
                Expires {expirationMode === '24h' ? 'in 24 hours' : new Date(customDate).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={generateQRCode}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                background: NAVY,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Download size={16} />
              Download QR Code
            </button>

            <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', border: `1px solid #fcd34d`, borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                🎯 <strong>Perfect for:</strong> Posters, flyers, business cards, trade show booths. Drivers scan and jump straight into the trial.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Template Section */}
      {generatedLink && (
        <div style={{ background: 'white', border: `2px solid #e5e7eb`, borderRadius: 12, padding: 32, marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 24 }}>
            ✉️ Email Invitation
          </h2>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 24, fontFamily: 'monospace', fontSize: 13, color: '#374151', lineHeight: 1.8, maxHeight: 280, overflow: 'auto' }}>
            Hi,<br /><br />
            You've been invited to try TruckWithEase — the all-in-one fleet management platform.<br /><br />
            📱 Get started: <span style={{ color: ORANGE, fontWeight: 700 }}>{trialLink}</span><br /><br />
            You get:<br />
            • 14-day free trial (no credit card)<br />
            • Real-time dispatch and HOS tracking<br />
            • AI safety coaching<br />
            • Detention recovery automation<br /><br />
            This link expires {expirationMode === '24h' ? 'in 24 hours' : new Date(customDate).toLocaleDateString()}.<br /><br />
            Any questions? Reply to this email.<br /><br />
            Happy trucking!
          </div>

          <a
            href={`mailto:?subject=Join TruckWithEase - Limited Time Trial&body=${emailBody}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 24px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Mail size={16} />
            Send Email
          </a>
        </div>
      )}

      {/* Info Section */}
      <div style={{ background: '#eff6ff', border: `2px solid #bfdbfe`, borderRadius: 12, padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 20 }}>
          📋 How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          <div>
            <p style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>1. Generate</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              Enter fleet name and choose 24-hour or custom expiration. Click generate.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>2. Share</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              Copy the link, download the QR code, or send via email. All expire on your schedule.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>3. Track</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              Expired links stop working automatically. Generate new ones anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
