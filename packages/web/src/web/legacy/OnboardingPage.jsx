import { useState, useEffect } from 'react';
import { pb } from './lib/pb';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupData, setSignupData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    driversLicense: '',
    ein: '',
    bankName: '',
    accountType: 'checking',
    routingNumber: '',
    accountNumber: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signupId = params.get('id');
    
    // Get signup data from sessionStorage or fetch from backend
    const email = sessionStorage.getItem('signup_email');
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
    
    if (signupId) {
      sessionStorage.setItem('signup_id', signupId);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('First and last name are required.');
        return;
      }
      setStep(2);
      setError('');
    } else if (step === 2) {
      if (!formData.businessName.trim() || !formData.driversLicense.trim() || !formData.ein.trim()) {
        setError('All business information is required.');
        return;
      }
      setStep(3);
      setError('');
    } else if (step === 3) {
      if (!formData.bankName.trim() || !formData.routingNumber.trim() || !formData.accountNumber.trim()) {
        setError('All banking information is required.');
        return;
      }
      submitProfile();
    }
  };

  const submitProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const signupId = sessionStorage.getItem('signup_id');
      
      // Update the original signup record with full profile & banking
      if (signupId) {
        await pb.collection('signups').update(signupId, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          businessName: formData.businessName.trim(),
          driversLicense: formData.driversLicense.trim(),
          ein: formData.ein.trim(),
          bankName: formData.bankName.trim(),
          accountType: formData.accountType,
          routingNumber: formData.routingNumber.trim(),
          accountNumber: formData.accountNumber.trim(),
          profile_complete: true,
          banking_verified: false, // Will be verified by admin
          completed_onboarding_at: new Date().toISOString(),
        });
      }
      
      // Clear session storage
      sessionStorage.removeItem('signup_id');
      sessionStorage.removeItem('signup_email');
      
      setStep(4);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(
        err?.data?.message || 'Something went wrong — please try again or contact truckwithease@gmail.com.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: NAVY2, minHeight: '100vh', color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .onb-input {
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
        .onb-input::placeholder { color: rgba(255,255,255,0.3); }
        .onb-input:focus { border-color: ${AMBER}; }
        .onb-input:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <nav style={{ padding: '0 5%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ height: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>
            Truck<span style={{ color: AMBER }}>WithEase</span>
          </span>
        </a>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 5% 80px' }}>
        {/* Progress */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40, justifyContent: 'center' }}>
            {[{ n: 1, l: 'Personal' }, { n: 2, l: 'Business' }, { n: 3, l: 'Banking' }, { n: 4, l: 'Complete' }].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: step >= s.n ? AMBER : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 14,
                    color: step >= s.n ? DARK : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s',
                  }}>
                    {s.n}
                  </div>
                  <span style={{ fontSize: 11, color: step >= s.n ? AMBER : 'rgba(255,255,255,0.3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {s.l}
                  </span>
                </div>
                {i < 3 && <div style={{ width: 60, height: 2, background: step > s.n ? AMBER : 'rgba(255,255,255,0.1)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Tell us your name</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>
              We'll use this to personalize your TruckWithEase account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  First Name *
                </label>
                <input
                  className="onb-input"
                  placeholder="Ray"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Last Name *
                </label>
                <input
                  className="onb-input"
                  placeholder="Davis"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              {error && (
                <div style={{ background: `${RED}15`, border: `1px solid ${RED}40`, borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleNext}
                style={{
                  background: AMBER,
                  color: DARK,
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px',
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                  marginTop: 8,
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Business Info */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Business information</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>
              We need a few details for compliance and account setup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Business Name *
                </label>
                <input
                  className="onb-input"
                  placeholder="Ray Davis Trucking"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Driver's License Number *
                </label>
                <input
                  className="onb-input"
                  placeholder="A1234567"
                  name="driversLicense"
                  value={formData.driversLicense}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  EIN (Tax ID) *
                </label>
                <input
                  className="onb-input"
                  placeholder="12-3456789"
                  name="ein"
                  value={formData.ein}
                  onChange={handleInputChange}
                />
              </div>

              {error && (
                <div style={{ background: `${RED}15`, border: `1px solid ${RED}40`, borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => { setStep(1); setError(''); }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    flex: 2,
                    background: AMBER,
                    color: DARK,
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px',
                    fontWeight: 900,
                    fontSize: 15,
                    cursor: 'pointer',
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Banking */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Banking details</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>
              This is where we'll deposit your earnings and handle payments securely.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Bank Name *
                </label>
                <input
                  className="onb-input"
                  placeholder="Chase, Bank of America, etc."
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Account Type *
                </label>
                <select
                  className="onb-input"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Routing Number *
                </label>
                <input
                  className="onb-input"
                  placeholder="021000021"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Account Number *
                </label>
                <input
                  className="onb-input"
                  placeholder="123456789"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  type="password"
                />
              </div>

              <div style={{ background: 'rgba(16,163,74,0.15)', border: '1px solid rgba(16,163,74,0.3)', borderRadius: 8, padding: '12px 14px', color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                🔒 Your banking details are encrypted and secured. We never share your information.
              </div>

              {error && (
                <div style={{ background: `${RED}15`, border: `1px solid ${RED}40`, borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => { setStep(2); setError(''); }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  style={{
                    flex: 2,
                    background: AMBER,
                    color: DARK,
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px',
                    fontWeight: 900,
                    fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Poppins',sans-serif",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Setting up account…' : 'Complete Setup →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: AMBER, marginBottom: 12 }}>Welcome aboard!</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              Your profile is set up and banking details are secure. You can now log in and start using TruckWithEase.
            </p>

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
              Go to Dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
