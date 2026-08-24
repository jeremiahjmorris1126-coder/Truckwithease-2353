import { useState, useEffect } from 'react';

const MODES = {
  truck: {
    id: 'truck',
    emoji: '🚛',
    label: 'TruckWithEase',
    tagline: 'CDL • ELD • DOT • Fleet Management',
    description: 'The complete platform for professional truck drivers, owner-operators, and fleet managers. Quantum dispatch, FMCSA compliance, payroll from ELD miles, and Ghost Nerve AI — all in one place.',
    color: '#F5A623',
    glow: 'rgba(245,166,35,0.4)',
    bg: 'linear-gradient(135deg, #1a0f00 0%, #0D0D0D 50%, #1a0800 100%)',
    accent: '#F5A623',
    features: [
      { icon: '⚡', label: 'Quantum Dispatch' },
      { icon: '🧠', label: 'Ghost Nerve AI' },
      { icon: '📋', label: 'HOS + ELD Logger' },
      { icon: '👥', label: 'HRease — Hire to Pay' },
      { icon: '🔍', label: 'Live Broker Check' },
      { icon: '🛡️', label: 'Phantom Compliance' },
      { icon: '🎮', label: 'Game Up Training' },
      { icon: '💰', label: 'Scan & Instant Bill' },
    ],
    cta: 'Enter TruckWithEase',
    route: '/dashboard',
    stats: [
      { val: '3.5M+', label: 'CDL Drivers' },
      { val: '47', label: 'Optimization Layers' },
      { val: '$0', label: 'Setup Fee' },
    ],
  },
  car: {
    id: 'car',
    emoji: '🚗',
    label: 'DriveWithEase',
    tagline: 'Delivery • Courier • Gig • Non-CDL',
    description: 'Built for Amazon Flex, DoorDash, Instacart, and every non-CDL delivery driver. Smart route optimization, earnings tracking, mileage logging for taxes, and instant accident reporting.',
    color: '#00D68F',
    glow: 'rgba(0,214,143,0.4)',
    bg: 'linear-gradient(135deg, #001a10 0%, #0D0D0D 50%, #001508 100%)',
    accent: '#00D68F',
    features: [
      { icon: '🗺️', label: 'Smart Route Optimizer' },
      { icon: '💵', label: 'Earnings Per Mile Tracker' },
      { icon: '🧾', label: 'Tax Mileage Logger' },
      { icon: '🚨', label: 'Accident Reporting' },
      { icon: '⛽', label: 'Live Fuel Prices' },
      { icon: '🔧', label: 'Vehicle Maintenance' },
      { icon: '📱', label: 'Hands-Free Calling' },
      { icon: '🏆', label: 'Delivery Rewards' },
    ],
    cta: 'Enter DriveWithEase',
    route: '/drive-dashboard',
    stats: [
      { val: '6.8M+', label: 'Delivery Drivers' },
      { val: '$0', label: 'Setup Fee' },
      { val: '24/7', label: 'Route Intelligence' },
    ],
  },
  bike: {
    id: 'bike',
    emoji: '🚲',
    label: 'RideWithEase',
    tagline: 'Bike • E-Bike • Scooter • Urban Courier',
    description: 'The only platform built specifically for bike and e-bike couriers. Safe route mapping, city-specific ordinances, weather alerts, package tracking, and earnings — tuned for NYC, Chicago, SF, LA, and beyond.',
    color: '#00E5FF',
    glow: 'rgba(0,229,255,0.4)',
    bg: 'linear-gradient(135deg, #001520 0%, #0D0D0D 50%, #000d15 100%)',
    accent: '#00E5FF',
    features: [
      { icon: '🗺️', label: 'Safe Bike Route Maps' },
      { icon: '🏙️', label: 'City-Specific Laws' },
      { icon: '🌦️', label: 'Weather & Wind Alerts' },
      { icon: '📦', label: 'Package Tracking' },
      { icon: '💵', label: 'Earnings Per Delivery' },
      { icon: '🚑', label: 'Injury Reporting + 911' },
      { icon: '🔋', label: 'E-Bike Battery Tracker' },
      { icon: '🏆', label: 'Courier Rewards' },
    ],
    cta: 'Enter RideWithEase',
    route: '/ride-dashboard',
    stats: [
      { val: '2.1M+', label: 'Urban Couriers' },
      { val: '50+', label: 'Cities Covered' },
      { val: '$0', label: 'Setup Fee' },
    ],
  },
};

export default function VehicleSelectorPage() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [launched, setLaunched] = useState(false);

  const active = selected || hovered;
  const mode = active ? MODES[active] : null;

  useEffect(() => {
    if (launched && selected) {
      setTimeout(() => {
        window.location.href = MODES[selected].route;
      }, 800);
    }
  }, [launched, selected]);

  const bg = mode
    ? mode.bg
    : 'linear-gradient(135deg, #0D0D0D 0%, #111 50%, #0D0D0D 100%)';

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      transition: 'background 0.6s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Rajdhani', 'Barlow Condensed', 'Arial Narrow', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Glow orb */}
      {mode && (
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          borderRadius: '50%',
          background: mode.glow,
          filter: 'blur(120px)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'background 0.6s ease',
          opacity: 0.5,
        }} />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 4,
          color: mode ? mode.accent : 'rgba(255,255,255,0.3)',
          marginBottom: 12, transition: 'color 0.4s',
          textTransform: 'uppercase',
        }}>
          ONE PLATFORM — THREE WORLDS
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          lineHeight: 1,
          letterSpacing: -1,
          textTransform: 'uppercase',
        }}>
          {mode ? (
            <span style={{ color: mode.accent, transition: 'color 0.4s' }}>{mode.label}</span>
          ) : (
            <>MOVE<span style={{ color: 'rgba(255,255,255,0.2)' }}>WITH</span>EASE</>
          )}
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: mode ? mode.accent : 'rgba(255,255,255,0.35)',
          marginTop: 10, fontWeight: 500,
          letterSpacing: 1, transition: 'color 0.4s',
        }}>
          {mode ? mode.tagline : 'SELECT YOUR VEHICLE — YOUR APP AWAITS'}
        </p>
      </div>

      {/* Three vehicle cards */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center',
        position: 'relative', zIndex: 2, marginBottom: 40,
      }}>
        {Object.values(MODES).map(m => {
          const isActive = selected === m.id || hovered === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelected(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 'clamp(180px, 25vw, 240px)',
                background: isActive
                  ? `linear-gradient(135deg, ${m.color}22, ${m.color}11)`
                  : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isActive ? m.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 20,
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isActive ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
                boxShadow: isActive ? `0 20px 60px ${m.glow}` : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 'clamp(48px, 8vw, 72px)',
                marginBottom: 12,
                filter: isActive ? 'drop-shadow(0 0 20px currentColor)' : 'none',
                transition: 'filter 0.3s',
              }}>
                {m.emoji}
              </div>
              <div style={{
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontWeight: 800,
                color: isActive ? m.color : '#fff',
                letterSpacing: 0.5,
                transition: 'color 0.3s',
                textTransform: 'uppercase',
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                marginTop: 6, letterSpacing: 1, textTransform: 'uppercase',
              }}>
                {m.tagline.split('•')[0].trim()}
              </div>
              {isActive && (
                <div style={{
                  marginTop: 16,
                  width: 40, height: 3,
                  background: m.color,
                  borderRadius: 2,
                  margin: '16px auto 0',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel — shows when a mode is selected/hovered */}
      {mode && (
        <div style={{
          maxWidth: 860,
          width: '100%',
          background: `linear-gradient(135deg, ${mode.color}0D, rgba(255,255,255,0.03))`,
          border: `1px solid ${mode.color}30`,
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 40px)',
          position: 'relative', zIndex: 2,
          animation: 'fadeSlideUp 0.4s ease',
        }}>
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            {mode.stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: mode.accent }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7, textAlign: 'center',
            marginBottom: 28,
          }}>
            {mode.description}
          </p>

          {/* Features grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10, marginBottom: 32,
          }}>
            {mode.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${mode.color}20`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => { setSelected(mode.id); setLaunched(true); }}
              style={{
                background: mode.accent,
                color: '#000',
                border: 'none',
                borderRadius: 12,
                padding: '16px 48px',
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
                boxShadow: `0 8px 32px ${mode.glow}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: launched ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              {launched ? '⚡ LAUNCHING...' : mode.cta + ' →'}
            </button>
            <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              Free trial — no credit card required
            </div>
          </div>
        </div>
      )}

      {!mode && (
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.2)',
          letterSpacing: 2, textTransform: 'uppercase',
          position: 'relative', zIndex: 2,
        }}>
          TAP YOUR VEHICLE TO BEGIN
        </div>
      )}

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 12, zIndex: 10,
      }}>
        <a href="/dashboard" style={{
          fontSize: 11, color: 'rgba(255,255,255,0.3)',
          letterSpacing: 2, textDecoration: 'none',
          textTransform: 'uppercase', padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, transition: 'color 0.2s',
        }}>
          Skip to Dashboard
        </a>
      </div>
    </div>
  );
}
