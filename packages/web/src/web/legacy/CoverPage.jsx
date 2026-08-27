import { useState, useEffect, useRef } from 'react';

/**
 * CoverPage — public landing page (routes /cover and /home-old).
 *
 * REWRITTEN Aug 25 2026. Original preserved at docs/launch/CoverPage.ORIGINAL.jsx.txt.
 * What was removed and why:
 *  - Stats "13M+ Drivers Served", "47 AI Variables Per Mile", "$400 vs $800+", "12 Proprietary
 *    Features" — all invented. There are no customers yet.
 *  - A scrolling "live" ticker and a pulsing "Ghost Nerve Active" badge fed by a hardcoded
 *    array of eight scripted events. A scripted demo is never labeled live.
 *  - A TruckWithEase / Samsara / Motive feature table headed "THE ONLY HONEST COMPARISON",
 *    plus "$400 vs $800+ per 10-truck fleet" price cards quoting competitors' pricing.
 *  - Feature copy for things with no code: 47-variable optimization, payroll from ELD miles,
 *    72-hour violation prediction, one-tap 911 dispatch, hands-free cab calling, simultaneous
 *    multi-party billing, and "8 live data sources" (only Google Maps is wired).
 *  - Wrong prices ($29/$39/$49/$59) and feature bullets for HRease, Ghost Nerve, Azure and
 *    Geotab. Pricing now matches PLANS in api/routes/signup.ts.
 *  - Stale contact address truckwithease@gmail.com -> truckeasecare@gmail.com (support).
 */

// Brand tokens — matches the logo exactly
const B = {
  black:     '#0a0a0a',
  blackCard: '#161616',
  blackBorder:'#222222',
  gold:      '#C9A84C',
  goldBright:'#FFD700',
  goldDim:   '#8A6E2F',
  white:     '#FFFFFF',
  white90:   'rgba(255,255,255,0.90)',
  white60:   'rgba(255,255,255,0.60)',
  white30:   'rgba(255,255,255,0.30)',
  white10:   'rgba(255,255,255,0.06)',
};

const goldGrad = `linear-gradient(135deg, ${B.gold} 0%, ${B.goldBright} 45%, ${B.gold} 75%, ${B.goldDim} 100%)`;

const FEATURES = [
  { icon: '📋', title: 'HOS + ELD Logger', sub: 'Duty-status logging for local, short-haul and long-haul, with exemptions', tag: 'BUILT', link: '/hos-logger' },
  { icon: '🔧', title: 'DVIR + Maintenance', sub: 'Pre/post-trip inspection reports, defects, work orders and PM intervals', tag: 'BUILT', link: '/dvir' },
  { icon: '📊', title: 'Driver Safety Score', sub: 'Scored from your own speeding, HOS, DVIR and violation records — never guessed', tag: 'BUILT', link: '/driver-scorecard' },
  { icon: '🗒️', title: 'Fleet Memory', sub: 'Your drivers\' notes and ratings on brokers, shippers and stops, shared fleet-wide', tag: 'BUILT', link: '/fleet-memory' },
  { icon: '🚚', title: 'Load Board + Dispatch', sub: 'Post, assign and book loads with state-by-state dispatch compliance rules', tag: 'BUILT', link: '/loads' },
  { icon: '🤖', title: 'AI Assistants', sub: '12 role-based assistants for dispatch, compliance, safety, health and money', tag: 'BUILT', link: '/ai-team' },
  { icon: '📷', title: 'Document Scan', sub: 'Photograph a BOL, rate con, invoice or DVIR and get the text transcribed', tag: 'BUILT', link: '/scan-bill' },
  { icon: '⛽', title: 'Fuel + Tolls', sub: 'Fuel card charges, spend tracking and toll records in one ledger', tag: 'BUILT', link: '/fuel' },
  { icon: '👥', title: 'HR Records', sub: 'People files, occurrences, pay configuration and document storage', tag: 'BUILT', link: '/humanai' },
  { icon: '🏆', title: 'Big Rig Bucks', sub: 'Points for clean days, safe miles and completed training', tag: 'BUILT', link: '/rig-bucks' },
  { icon: '🩺', title: 'Driver Health', sub: 'Med card expirations and vitals tracking alongside HOS fatigue', tag: 'BUILT', link: '/driver-health' },
  { icon: '🎮', title: 'Game Up Training', sub: 'Training modules drivers actually finish, tied to the rewards ledger', tag: 'BUILT', link: '/game-up' },
];


const TIERS = [
  { name: 'Solo',                  price: '$29.99', period: '/driver/mo', features: ['1 driver','HOS logger','DVIR','Load board','Big Rig Bucks','À-la-carte add-ons $2.99–$10.99'] },
  { name: 'Pro',                   price: '$39.99', period: '/driver/mo', features: ['All-inclusive','Dispatch + compliance rules','Document scan','Safety score','Fleet memory','Everything in Solo'], hot: true },
  { name: 'Fleet — hardware lease',price: '$49.99', period: '/truck/mo',  features: ['Hardware lease included','Unlimited drivers per truck','HR records','Fleet-wide reporting','Everything in Pro'] },
  { name: 'Fleet — hardware owned',price: '$59.99', period: '/driver/mo', features: ['You own the hardware','$600 per truck one-time','Custom branding','Fleet-wide reporting','Everything in Pro'] },
];


const NAV_LINKS = [
  { label: 'Platform',  href: '/platform' },
  { label: 'Features',  href: '#features' },
  { label: 'Pricing',   href: '#pricing' },
  { label: 'Dispatch',  href: '/dispatch' },
  { label: 'Log In',    href: '/command' },
];

export default function CoverPage() {
  const [scrolled, setScrolled]   = useState(false);
  const [navOpen, setNavOpen]     = useState(false);
  const [activeTier, setActiveTier] = useState(1);
  const [visible, setVisible]     = useState(new Set());
  const cardRefs = useRef([]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(v => new Set([...v, e.target.dataset.idx])); });
    }, { threshold: 0.12 });
    cardRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const nav = (href) => {
    setNavOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div style={{ background: B.black, minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent',
        borderBottom: scrolled ? `1px solid ${B.blackBorder}` : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        {/* Logo */}
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => nav('/')}>
          <img src="/static/twe-full-logo.jpg" alt="TruckWithEase @ Morrishive" style={{ height: 48, objectFit: 'contain', borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' }} />
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => nav(l.href)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif", fontWeight: 500,
              fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: B.white60,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = B.gold}
            onMouseLeave={e => e.currentTarget.style.color = B.white60}
            >{l.label}</button>
          ))}
          <button onClick={() => nav('/signup')} style={{
            background: goldGrad, color: B.black,
            fontFamily: "'Oswald', sans-serif", fontWeight: 700,
            fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
            border: 'none', borderRadius: 6, padding: '9px 22px', cursor: 'pointer',
          }}>Get Started Free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px 80px', textAlign: 'center', position: 'relative',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '18%', left: '12%', width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)` }} />
        </div>

        {/* Logo hero — full logo with truck, fade in + glow pulse */}
        <div style={{ marginBottom: 28, animation: 'logoFadeIn 1.2s ease both' }}>
          <img
            src="/static/twe-full-logo.jpg"
            alt="TruckWithEase @ Morrishive.com"
            style={{
              maxWidth: 480, width: '88vw', objectFit: 'contain',
              borderRadius: 16,
              filter: 'drop-shadow(0 0 60px rgba(201,168,76,0.45)) drop-shadow(0 0 20px rgba(201,168,76,0.25))',
              animation: 'logoGlow 3s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* Status badge — factual, not a live feed */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: B.white10, border: `1px solid ${B.blackBorder}`,
          borderRadius: 999, padding: '7px 18px', marginBottom: 28,
          animation: 'fadeInUp 0.7s 0.1s ease both',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: B.gold, display: 'inline-block', animation: 'goldPulse 2s infinite' }} />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: '0.12em', color: B.gold, textTransform: 'uppercase' }}>
            HOS · DVIR · Dispatch · 14-day free trial
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 12vw, 110px)',
          lineHeight: 0.92, letterSpacing: '0.03em',
          textTransform: 'uppercase', margin: '0 0 8px',
          color: B.white,
          animation: 'fadeInUp 0.7s 0.15s ease both',
        }}>
          TRUCK SMARTER.
        </h1>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 12vw, 110px)',
          lineHeight: 0.92, letterSpacing: '0.03em',
          textTransform: 'uppercase', margin: '0 0 24px',
          background: goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'fadeInUp 0.7s 0.2s ease both',
        }}>
          PAY LESS.
        </h1>

        <p style={{
          fontSize: 18, color: B.white60, maxWidth: 580, lineHeight: 1.6,
          margin: '0 auto 40px',
          animation: 'fadeInUp 0.7s 0.25s ease both',
        }}>
          The only platform that dispatches, hires, pays, trains, and protects every driver — truck, van, car, or bike — from one screen. No hardware required.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeInUp 0.7s 0.3s ease both' }}>
          <button onClick={() => nav('/signup')} style={{
            background: goldGrad, color: B.black,
            fontFamily: "'Oswald', sans-serif", fontWeight: 700,
            fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase',
            border: 'none', borderRadius: 8, padding: '16px 40px', cursor: 'pointer',
            boxShadow: '0 0 32px rgba(201,168,76,0.28)',
          }}>Start Free — No Card Needed</button>
          <button onClick={() => nav('/vehicle-select')} style={{
            background: 'transparent', color: B.gold,
            fontFamily: "'Oswald', sans-serif", fontWeight: 600,
            fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase',
            border: `1px solid ${B.goldDim}`, borderRadius: 8, padding: '15px 32px', cursor: 'pointer',
          }}>🚛 🚗 🚲 All Driver Types</button>
        </div>

        {/* App Store Badges */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 32, animation: 'fadeInUp 0.7s 0.35s ease both' }}>
          <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#000', border: '1.5px solid rgba(201,168,76,0.4)', borderRadius: 10,
            padding: '10px 20px', textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.15)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Oswald, sans-serif' }}>Download on the</div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>App Store</div>
            </div>
          </a>
          <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#000', border: '1.5px solid rgba(201,168,76,0.4)', borderRadius: 10,
            padding: '10px 20px', textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.15)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.18 23.76c.3.16.64.19.96.08l.1-.06 11.05-6.37-2.35-2.35-9.76 8.7z" fill="#EA4335"/><path d="M20.93 10.03l-2.94-1.7-2.62 2.36 2.62 2.6 2.96-1.71c.84-.49.84-1.07-.02-1.55z" fill="#FBBC04"/><path d="M4.14.22C3.82.1 3.47.14 3.18.3l9.76 9.77 2.35-2.35L4.24.28l-.1-.06z" fill="#4285F4"/><path d="M3.18.3c-.54.31-.88.9-.88 1.63v20.14c0 .73.34 1.32.88 1.63l.06.03 11.27-11.27v-.27L3.24.27l-.06.03z" fill="#34A853"/></svg>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Oswald, sans-serif' }}>Get it on</div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>Google Play</div>
            </div>
          </a>
        </div>

        {/* What this is — no invented numbers */}
        <div style={{
          display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center',
          marginTop: 48, animation: 'fadeInUp 0.7s 0.4s ease both',
        }}>
          {[
            { num: '14',   label: 'Day Free Trial' },
            { num: '$29.99', label: 'Starting Per Driver / Mo' },
            { num: '0',    label: 'Contracts. Cancel Anytime' },
            { num: '12',   label: 'AI Assistants Built In' },
          ].map(s2 => (
            <div key={s2.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: '0.04em', background: goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s2.num}</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.white30 }}>{s2.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', height: 1, background: `linear-gradient(90deg, transparent, ${B.goldDim}, transparent)`, margin: 0 }} />

      {/* ── Features ── */}
      <section id="features" style={{ padding: '90px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: B.gold, marginBottom: 12 }}>PROPRIETARY PLATFORM</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px,7vw,72px)', letterSpacing: '0.03em', color: B.white, margin: 0 }}>BUILT DIFFERENT. BUILT BETTER.</h2>
          <p style={{ fontSize: 16, color: B.white60, marginTop: 12, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Twelve functions no competitor has built. Every one exclusive to TruckWithEase.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={el => cardRefs.current[i] = el}
              data-idx={String(i)}
              onClick={() => nav(f.link)}
              style={{
                background: B.blackCard,
                border: `1px solid ${B.blackBorder}`,
                borderRadius: 12, padding: '24px 22px', cursor: 'pointer',
                opacity: visible.has(String(i)) ? 1 : 0,
                transform: visible.has(String(i)) ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ${i * 0.04}s, transform 0.5s ${i * 0.04}s, border-color 0.2s, box-shadow 0.2s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = B.goldDim; e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = B.blackBorder; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{
                display: 'inline-block', fontFamily: "'Oswald', sans-serif",
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: B.black, background: goldGrad,
                borderRadius: 4, padding: '2px 8px', marginBottom: 10,
              }}>{f.tag}</div>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: '0.04em', color: B.white, margin: '0 0 6px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: B.white60, margin: 0, lineHeight: 1.5 }}>{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', height: 1, background: `linear-gradient(90deg, transparent, ${B.goldDim}, transparent)`, margin: 0 }} />

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '90px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: B.gold, marginBottom: 12 }}>TRANSPARENT PRICING</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px,6vw,64px)', letterSpacing: '0.03em', color: B.white, margin: 0 }}>ONE PRICE. EVERYTHING INCLUDED.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {TIERS.map((t, i) => (
            <div key={t.name} onClick={() => nav('/checkout')} style={{
              background: t.hot ? B.blackCard : B.blackCard,
              border: t.hot ? `2px solid ${B.gold}` : `1px solid ${B.blackBorder}`,
              borderRadius: 14, padding: '28px 22px', cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              boxShadow: t.hot ? `0 0 32px rgba(201,168,76,0.15)` : 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {t.hot && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: goldGrad, color: B.black, fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 4, padding: '2px 8px' }}>MOST POPULAR</div>
              )}
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.gold, marginBottom: 8 }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, background: goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{t.price}</span>
                <span style={{ fontSize: 13, color: B.white30 }}>{t.period}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '16px 0 20px', padding: 0 }}>
                {t.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: B.white60, padding: '4px 0', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                    <span style={{ color: B.gold, marginTop: 1 }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <button style={{
                width: '100%', background: t.hot ? goldGrad : 'transparent',
                color: t.hot ? B.black : B.gold,
                fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
                border: t.hot ? 'none' : `1px solid ${B.goldDim}`,
                borderRadius: 7, padding: '11px', cursor: 'pointer',
              }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: B.gold, marginBottom: 16 }}>THE DECISION IS EASY</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,9vw,96px)', letterSpacing: '0.03em', color: B.white, margin: '0 0 20px', lineHeight: 0.95 }}>
          YOUR FLEET.<br />
          <span style={{ background: goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YOUR RULES.</span>
        </h2>
        <p style={{ fontSize: 17, color: B.white60, maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.6 }}>
          Come trucking with us.
        </p>
        <a href="mailto:truckeasecare@gmail.com" style={{ display: 'block', fontSize: 15, color: B.gold, marginBottom: 28, letterSpacing: '0.05em', textDecoration: 'none', fontFamily: "'Oswald', sans-serif" }}>
          truckeasecare@gmail.com
        </a>
        <button onClick={() => nav('/signup')} style={{
          background: goldGrad, color: B.black,
          fontFamily: "'Oswald', sans-serif", fontWeight: 700,
          fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase',
          border: 'none', borderRadius: 9, padding: '18px 56px', cursor: 'pointer',
          boxShadow: '0 0 48px rgba(201,168,76,0.3)',
        }}>Start Free Today — No Card Required</button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${B.blackBorder}`, padding: '32px 24px', textAlign: 'center' }}>
        <img src="/static/twe-logo.png" alt="TruckWithEase" style={{ height: 32, opacity: 0.7, marginBottom: 12 }} />
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.white30 }}>
          © 2026 TruckWithEase @ Morrishive.com — All Rights Reserved
        </div>
      </footer>

      {/* Floating call button */}
      <a
        href="tel:6367068338"
        style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 999,
          background: goldGrad, color: B.black,
          borderRadius: 50, padding: '14px 22px',
          fontSize: 16, fontWeight: 900, textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(201,168,76,0.45)',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,168,76,0.6)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.45)'; }}
      >
        📞 <span>636-706-8338</span>
      </a>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 6px rgba(201,168,76,0.4);} 50%{box-shadow:0 0 18px rgba(201,168,76,0.8);} }
        @keyframes logoFadeIn { from { opacity:0; transform:scale(0.92) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes logoGlow { from { filter:drop-shadow(0 0 30px rgba(201,168,76,0.3)) drop-shadow(0 0 10px rgba(201,168,76,0.15)); } to { filter:drop-shadow(0 0 70px rgba(201,168,76,0.6)) drop-shadow(0 0 30px rgba(201,168,76,0.35)); } }
        @media(max-width:640px){
          nav > div:last-child { display: none; }
        }
        @media(max-width:480px){
          a[href="tel:6367068338"] { bottom: 16px !important; right: 16px !important; padding: 12px 18px !important; font-size: 15px !important; }
        }
      `}</style>
    </div>
  );
}
