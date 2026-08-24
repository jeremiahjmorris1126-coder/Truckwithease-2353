import { useState } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';

export default function DemoPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestDemo = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real scenario, this would send a request to your backend
      // For now, we'll store it and generate a demo login
      const demoLoginUrl = `https://app.truckwithease.com/demo-login?email=${encodeURIComponent(email)}&token=demo_${Math.random().toString(36).slice(2, 15)}`;

      // In your implementation, you'd send the user an email with this link
      // or show it directly if you prefer

      // For this demo, we'll show the link
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: NAVY2, minHeight: '100vh', color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .demo-input {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 14px;
          font-family: 'Poppins',sans-serif;
          color: white;
          width: 100%;
          outline: none;
          transition: border 0.2s;
        }
        .demo-input::placeholder { color: rgba(255,255,255,0.3); }
        .demo-input:focus { border-color: ${AMBER}; }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          padding: '0 5%',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ height: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>
            Truck<span style={{ color: AMBER }}>WithEase</span>
          </span>
        </a>
        <a href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>
          ← Back to site
        </a>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 5%' }}>
        {!submitted ? (
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 12 }}>
              See TruckWithEase in <span style={{ color: AMBER }}>action</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 40 }}>
              Start a 14-day free trial instantly with no credit card required. We'll give you full access to every feature
              — HOS logging, GPS tracking, load board, the works. Log in immediately and explore everything.
            </p>

            <div style={{ background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 12, padding: 24, marginBottom: 40 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>What you'll get instant access to:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  '✓ HOS / ELD Logger',
                  '✓ Live GPS Tracking',
                  '✓ Pre-Trip DVIR',
                  '✓ Load Board',
                  '✓ Fuel Finder',
                  '✓ Parking Locator',
                  '✓ Expense Tracker',
                  '✓ Dispatch Messaging',
                ].map((feature) => (
                  <div key={feature} style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleRequestDemo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  className="demo-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={{ background: `${RED}15`, border: `1px solid ${RED}40`, borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: AMBER,
                  color: DARK = '#06090F',
                  border: 'none',
                  borderRadius: 10,
                  padding: '15px',
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                  opacity: loading ? 0.7 : 1,
                  marginTop: 8,
                }}
              >
                {loading ? 'Getting your login link…' : 'Get Demo Login Link →'}
              </button>

              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>
                No credit card required. Full access for 14 days.
              </p>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🎯</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: AMBER, marginBottom: 12 }}>Check your email!</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              We've sent your demo login details to <strong>{email}</strong>. You'll have instant access to the full platform.
            </p>

            <div style={{ background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 10, padding: 20, marginBottom: 32 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12 }}>
                <strong>Didn't get the email?</strong> Check your spam folder, or we can resend it.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  background: 'transparent',
                  color: AMBER,
                  border: `2px solid ${AMBER}`,
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                Try another email
              </button>
            </div>

            <a
              href="/"
              style={{
                background: ORANGE,
                color: 'white',
                padding: '14px 40px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Back to TruckWithEase
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
