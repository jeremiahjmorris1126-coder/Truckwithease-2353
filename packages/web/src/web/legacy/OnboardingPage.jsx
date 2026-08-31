/**
 * OnboardingPage — /onboarding
 *
 * READS (live, endpoint printed next to every claim on screen)
 *   GET  /api/signup            required — roles, vehicleWorlds, plans, trialDays,
 *                               notes.mcCheck, notes.payment. The ONLY price source.
 *   GET  /api/support           required — real email, phone and per-day hours.
 *   GET  /api/responsible-use   optional — pledge count + sha256 termsVersion.
 *   POST /api/signup            on submit — writes a real row to the `signups` table
 *                               and renders the server's own response, including
 *                               `charged: false` and its `chargedNote`, verbatim.
 *
 * COMPUTES/MEASURES LOCALLY
 *   Round-trip ms per fetch via performance.now(); flags >= 3000 ms as slow.
 *   Client-side required-field checks and a 5-8 digit MC FORMAT check that mirrors
 *   the server's. The server re-validates; this is only to save a round trip.
 *
 * REMOVED IN THIS REWRITE (every item below was fabricated or dangerous)
 *   - `import { pb } from './lib/pb'` and the write
 *     `pb.collection('signups').update(signupId, {...})`. No PocketBase server
 *     exists. Every field a driver typed on this page went nowhere.
 *   - THE ENTIRE BANKING STEP: bankName, accountType (checking/savings),
 *     routingNumber, accountNumber. TruckWithEase stores no banking or
 *     payment-method data anywhere, has no payment processor connected, and
 *     moves no money. Collecting a routing and account number in a browser
 *     input was the single worst thing in this codebase.
 *   - "This is where we'll deposit your earnings and handle payments securely."
 *     Nothing deposits anything. There are no earnings and no payouts.
 *   - "Your banking details are encrypted and secured. We never share your
 *     information." No encryption existed. Nothing was stored at all.
 *   - `banking_verified: false, // Will be verified by admin`. There is no admin
 *     banking verification, no reviewer, and no queue.
 *   - `profile_complete: true` and `completed_onboarding_at` — flags written to a
 *     collection that does not exist, gating nothing.
 *   - The EIN (Tax ID) and Driver's License Number fields. Both were collected,
 *     both were discarded, neither is validated against any agency, and the
 *     signups table has no column for either.
 *   - Step 4's confetti emoji, "Welcome aboard!", "Your profile is set up and
 *     banking details are secure. You can now log in and start using
 *     TruckWithEase." and the "Go to Dashboard" button pointing at "/".
 *     Nothing was set up; there was no account and no login.
 *   - The lock emoji, the runtime `@import` of Poppins from fonts.googleapis.com,
 *     and the off-palette navy #0B2A6B / #081E4D, orange #FF6B00, amber #FFB400,
 *     green #16A34A, red #DC2626, dark #06090F constants.
 *   - The /static/truckwithease-icon.png nav mark. Every horizontal logo asset in
 *     public/static has "MORRISHIVE.COM" baked into the pixels, so the page uses
 *     the text wordmark until a clean file exists.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   It does not create a login, a subscription, or a payment method. It does not
 *   verify a driver's license, EIN, DOT number, insurance or FMCSA operating
 *   authority. The MC field is a format check only. It is not an ELD enrollment.
 *   Accepting the Responsible Use Agreement is not enforced anywhere in the
 *   product — nothing blocks a driver who never accepted it, and the page says so.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Tag as TagIcon,
  UserRound,
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#f2f2f2',
  muted: '#8a8a8a',
  dim: '#666666',
};
const FD = "'Bebas Neue',sans-serif";
const FH = "'Oswald',sans-serif";
const FB = "'Inter',sans-serif";
const FM = "'JetBrains Mono',monospace";

const SLOW_MS = 3000;

const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

const PLAN_ORDER = ['solo', 'pro', 'fleet_lease', 'fleet_owned'];

const ROLE_LABEL = {
  driver: 'Company driver',
  owner_operator: 'Owner-operator',
  dispatcher: 'Dispatcher',
  fleet_manager: 'Fleet manager',
};

const WORLD_LABEL = { truck: 'Truck', car: 'Car', bike: 'Bike' };

const STEPS = [
  { n: 1, label: 'You' },
  { n: 2, label: 'Operation' },
  { n: 3, label: 'Plan' },
  { n: 4, label: 'Stored' },
];

async function timedGet(url) {
  const t0 = performance.now();
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    const text = await r.text();
    const ms = Math.round(performance.now() - t0);
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    if (!r.ok) {
      const msg = (body && (body.error || body.message)) || `HTTP ${r.status}`;
      throw Object.assign(new Error(msg), { status: r.status, ms, url });
    }
    return { body, ms, status: r.status, url };
  } catch (e) {
    const ms = Math.round(performance.now() - t0);
    throw Object.assign(e instanceof Error ? e : new Error(String(e)), {
      ms,
      url,
      status: e && e.status ? e.status : 0,
    });
  }
}

async function timedPost(url, payload) {
  const t0 = performance.now();
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return { body, ms, status: r.status, url, ok: r.ok };
}

function Spin() {
  return (
    <>
      <style>{'@keyframes twe-spin{to{transform:rotate(360deg)}}'}</style>
      <Loader2 size={16} color={GOLD} style={{ animation: 'twe-spin 1s linear infinite' }} />
    </>
  );
}

function Wordmark({ size = 20 }) {
  return (
    <span style={{ fontFamily: FD, fontSize: size, letterSpacing: '0.06em', color: C.white }}>
      TRUCK<span style={{ color: GOLDB }}>WITH</span>EASE
    </span>
  );
}

function Panel({ title, note, right, icon, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        marginBottom: 18,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {icon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: FH,
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: C.white,
              margin: 0,
            }}
          >
            {title}
          </h2>
          {note ? (
            <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, margin: '5px 0 0' }}>{note}</p>
          ) : null}
        </div>
        {right}
      </header>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: '1px dashed #333333',
        borderRadius: 4,
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        marginTop: 12,
      }}
    >
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div
          style={{
            fontFamily: FH,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: WARN,
          }}
        >
          {label || 'MISSING / NOT TRACKED'}
        </div>
        <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, marginTop: 5, lineHeight: 1.65 }}>
          {reason}
        </div>
      </div>
    </div>
  );
}

function Tag({ text, tone }) {
  const col = tone === 'warn' ? WARN : tone === 'gold' ? GOLDB : C.muted;
  return (
    <span
      style={{
        border: `1px solid ${col}55`,
        color: col,
        fontFamily: FM,
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function Err({ msg }) {
  return (
    <div
      style={{
        border: `1px solid ${WARN}55`,
        borderRadius: 4,
        padding: '11px 14px',
        fontFamily: FM,
        fontSize: 12,
        color: WARN,
        lineHeight: 1.6,
        wordBreak: 'break-word',
      }}
    >
      {msg}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontFamily: FH,
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: C.muted,
  marginBottom: 7,
};

const inputStyle = {
  width: '100%',
  background: C.black,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  padding: '12px 13px',
  fontFamily: FB,
  fontSize: 14,
  color: C.white,
  outline: 'none',
};

function Field({ label, name, value, onChange, placeholder, hint, type = 'text' }) {
  return (
    <div>
      <label style={labelStyle} htmlFor={`onb-${name}`}>
        {label}
      </label>
      <input
        id={`onb-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
      {hint ? (
        <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 6 }}>{hint}</div>
      ) : null}
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label style={labelStyle} htmlFor={`onb-${name}`}>
        {label}
      </label>
      <select
        id={`onb-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: C.black }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Btn({ children, onClick, primary, disabled, flex }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: flex || 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: primary ? GOLD : 'transparent',
        color: primary ? C.black : C.white,
        border: `1px solid ${primary ? GOLD : C.border}`,
        borderRadius: 4,
        padding: '12px 20px',
        fontFamily: FH,
        fontSize: 13,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

const mcFormatOk = (v) => /^\d{5,8}$/.test(String(v).replace(/^MC-?/i, '').trim());
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

export default function OnboardingPage() {
  const alive = useRef(false);
  const [state, setState] = useState('loading');
  const [loadErr, setLoadErr] = useState('');
  const [cfg, setCfg] = useState(null);
  const [support, setSupport] = useState(null);
  const [ru, setRu] = useState(null);
  const [ruErr, setRuErr] = useState('');
  const [reads, setReads] = useState([]);

  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    vehicleWorld: 'truck',
    company: '',
    mcNumber: '',
    dotNumber: '',
    fleetSize: '',
    plan: 'solo',
    notes: '',
  });

  const load = useCallback(async () => {
    setState('loading');
    setLoadErr('');
    setReads([]);
    try {
      const [s, sup] = await Promise.all([timedGet('/api/signup'), timedGet('/api/support')]);
      if (!alive.current) return;
      setCfg(s.body);
      setSupport(sup.body);
      setReads([s, sup].map((r) => ({ url: r.url, status: r.status, ms: r.ms })));
      setState('ok');
    } catch (e) {
      if (!alive.current) return;
      setLoadErr(`${e.url || ''} -> ${e.status || 'network'} ${e.message}`);
      setState('error');
      return;
    }
    const [r] = await Promise.allSettled([timedGet('/api/responsible-use')]);
    if (!alive.current) return;
    if (r.status === 'fulfilled') {
      setRu(r.value.body);
      setReads((prev) => [...prev, { url: r.value.url, status: r.value.status, ms: r.value.ms }]);
    } else {
      const e = r.reason || {};
      setRuErr(`${e.status || 'network'} ${e.message || 'failed'}`);
      setReads((prev) => [
        ...prev,
        { url: '/api/responsible-use', status: e.status || 0, ms: e.ms || 0 },
      ]);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const next = () => {
    setErr('');
    if (step === 1) {
      if (!form.name.trim()) return setErr('Name is required.');
      if (!emailOk(form.email)) return setErr('A valid email is required — the server rejects anything else.');
      return setStep(2);
    }
    if (step === 2) {
      if (form.mcNumber.trim() && !mcFormatOk(form.mcNumber)) {
        return setErr('MC number should be 5-8 digits. Leave it blank if you do not have one.');
      }
      if (form.fleetSize.trim() && !(Number(form.fleetSize) > 0)) {
        return setErr('Fleet size must be a number greater than zero, or blank.');
      }
      return setStep(3);
    }
    return submit();
  };

  const submit = async () => {
    setSubmitting(true);
    setErr('');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      role: form.role,
      vehicleWorld: form.vehicleWorld,
      company: form.company.trim() || undefined,
      mcNumber: form.mcNumber.trim() || undefined,
      dotNumber: form.dotNumber.trim() || undefined,
      fleetSize: form.fleetSize.trim() || undefined,
      plan: form.plan || undefined,
      notes: form.notes.trim() || undefined,
      source: 'onboarding',
    };
    try {
      const r = await timedPost('/api/signup', payload);
      if (!alive.current) return;
      setReads((prev) => [...prev, { url: 'POST /api/signup', status: r.status, ms: r.ms }]);
      if (!r.ok) {
        setErr(
          `POST /api/signup -> ${r.status} ${(r.body && (r.body.error || r.body.message)) || 'request rejected'}`,
        );
        setSubmitting(false);
        return;
      }
      setResult({ ...r.body, httpStatus: r.status, ms: r.ms });
      setStep(4);
    } catch (e) {
      if (alive.current) setErr(`POST /api/signup -> network ${e.message}`);
    } finally {
      if (alive.current) setSubmitting(false);
    }
  };

  const plans = cfg && cfg.plans ? cfg.plans : {};
  const planKeys = PLAN_ORDER.filter((k) => plans[k]).concat(
    Object.keys(plans).filter((k) => !PLAN_ORDER.includes(k)),
  );
  const roles = (cfg && cfg.roles) || ['driver'];
  const worlds = (cfg && cfg.vehicleWorlds) || ['truck'];

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: FB }}>
      <nav
        style={{
          background: C.nav,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={22} />
        </a>
        <a
          href="/"
          style={{
            textDecoration: 'none',
            fontFamily: FH,
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          Back to site
        </a>
      </nav>

      {/* Header band */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: '40px 24px 34px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: '5px 12px',
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            <ClipboardList size={13} color={GOLD} /> Onboarding
          </span>
          <h1
            style={{
              fontFamily: FD,
              fontSize: 'clamp(38px,7vw,68px)',
              lineHeight: 1.02,
              letterSpacing: '0.02em',
              margin: '16px 0 12px',
            }}
          >
            THIS FORM STORES A SIGNUP RECORD.{' '}
            <span style={{ color: GOLDB }}>IT DOES NOT CHARGE YOU</span> AND IT DOES NOT CREATE A
            LOGIN.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: C.muted, maxWidth: 720, margin: 0 }}>
            Everything you type here is written to one table on our server and read back to you on
            the last screen, exactly as the server returned it. No card, no bank account, no routing
            number, and no license or tax ID is collected — TruckWithEase has no payment processor
            connected and stores no banking data anywhere.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 72px' }}>
        {state === 'loading' && (
          <Panel title="Loading" note="GET /api/signup + GET /api/support">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: C.muted, fontFamily: FM, fontSize: 12 }}>
              <Spin /> Reading plans, roles and support hours from the server.
            </div>
          </Panel>
        )}

        {state === 'error' && (
          <Panel title="Cannot load onboarding" note="GET /api/signup + GET /api/support">
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginTop: 0 }}>
              This page will not render a plan, a price or a support hour it could not read from the
              server. The server's own error:
            </p>
            <Err msg={loadErr} />
            <div style={{ marginTop: 14 }}>
              <Btn onClick={load} primary>
                <RefreshCw size={14} /> Try again
              </Btn>
            </div>
          </Panel>
        )}

        {state === 'ok' && (
          <>
            {/* Progress */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 3,
                        border: `1px solid ${step >= s.n ? GOLD : C.border}`,
                        background: step >= s.n ? GOLD : 'transparent',
                        color: step >= s.n ? C.black : C.dim,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: FD,
                        fontSize: 17,
                      }}
                    >
                      {s.n}
                    </div>
                    <span
                      style={{
                        fontFamily: FH,
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: step >= s.n ? C.white : C.dim,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 34,
                        height: 1,
                        background: step > s.n ? GOLD : C.border,
                        margin: '0 12px',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <Panel
                title="Who you are"
                note="Fields map 1:1 to columns on the signups table"
                icon={<UserRound size={16} color={GOLD} />}
              >
                <div style={{ display: 'grid', gap: 16 }}>
                  <Field label="Name" name="name" value={form.name} onChange={onChange} placeholder="Jeremiah Morris" />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    hint="Required. If this email already has a signup, the server returns that existing record instead of creating a second one."
                  />
                  <Field
                    label="Phone (optional)"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="636-706-8338"
                  />
                  <Select
                    label="Role"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    options={roles.map((r) => ({ value: r, label: ROLE_LABEL[r] || r }))}
                  />
                  <Select
                    label="Vehicle"
                    name="vehicleWorld"
                    value={form.vehicleWorld}
                    onChange={onChange}
                    options={worlds.map((w) => ({ value: w, label: WORLD_LABEL[w] || w }))}
                  />
                  {err ? <Err msg={err} /> : null}
                  <div>
                    <Btn onClick={next} primary>
                      Continue <ArrowRight size={14} />
                    </Btn>
                  </div>
                </div>
              </Panel>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <Panel
                title="Your operation"
                note="All optional. Nothing here is verified against any agency."
                icon={<Building2 size={16} color={GOLD} />}
              >
                <div style={{ display: 'grid', gap: 16 }}>
                  <Field
                    label="Company (optional)"
                    name="company"
                    value={form.company}
                    onChange={onChange}
                    placeholder="Acme Trucking LLC"
                  />
                  <Field
                    label="MC number (optional)"
                    name="mcNumber"
                    value={form.mcNumber}
                    onChange={onChange}
                    placeholder="123456"
                    hint="5-8 digits."
                  />
                  <Field
                    label="USDOT number (optional)"
                    name="dotNumber"
                    value={form.dotNumber}
                    onChange={onChange}
                    placeholder="1234567"
                    hint="Stored as text. Not checked against anything."
                  />
                  <Field
                    label="Fleet size (optional)"
                    name="fleetSize"
                    value={form.fleetSize}
                    onChange={onChange}
                    placeholder="1"
                  />
                  <Field
                    label="Anything we should know (optional)"
                    name="notes"
                    value={form.notes}
                    onChange={onChange}
                    placeholder="Which ELD you already run, what you need most"
                  />

                  {cfg.notes && cfg.notes.mcCheck ? (
                    <Missing label="MC NUMBER — FORMAT CHECK ONLY" reason={cfg.notes.mcCheck} />
                  ) : null}
                  <Missing
                    label="NOT COLLECTED, NOT STORED"
                    reason="No driver's license number, EIN, bank account, routing number, or card number is collected on this page or anywhere else in TruckWithEase. An earlier version of this form asked for all of them and stored none of them."
                  />

                  {err ? <Err msg={err} /> : null}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Btn onClick={() => { setStep(1); setErr(''); }}>
                      <ArrowLeft size={14} /> Back
                    </Btn>
                    <Btn onClick={next} primary flex="1">
                      Continue <ArrowRight size={14} />
                    </Btn>
                  </div>
                </div>
              </Panel>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <Panel
                  title="Plan you are interested in"
                  note="Prices from GET /api/signup -> plans. This page has no price list of its own."
                  icon={<TagIcon size={16} color={GOLD} />}
                  right={cfg.trialDays ? <Tag text={`${cfg.trialDays}-day trial`} tone="gold" /> : null}
                >
                  <div style={{ display: 'grid', gap: 12 }}>
                    {planKeys.map((k) => {
                      const p = plans[k];
                      const on = form.plan === k;
                      return (
                        <button
                          type="button"
                          key={k}
                          onClick={() => setForm((prev) => ({ ...prev, plan: k }))}
                          style={{
                            textAlign: 'left',
                            background: on ? '#1c1c1c' : C.black,
                            border: `1px solid ${on ? GOLD : C.border}`,
                            borderRadius: 4,
                            padding: '14px 16px',
                            cursor: 'pointer',
                            color: C.white,
                            fontFamily: FB,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: FH, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              {p.name}
                            </span>
                            <span style={{ fontFamily: FD, fontSize: 26, color: GOLDB }}>${p.price}</span>
                            <span style={{ fontFamily: FM, fontSize: 11, color: C.muted }}>{p.unit}</span>
                          </div>
                          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{p.note}</div>
                        </button>
                      );
                    })}
                  </div>

                  {cfg.notes && cfg.notes.payment ? (
                    <Missing label="BILLING IS NOT LIVE" reason={cfg.notes.payment} />
                  ) : null}
                </Panel>

                <Panel
                  title="Responsible Use Agreement"
                  note="GET /api/responsible-use"
                  icon={<ShieldCheck size={16} color={GOLD} />}
                >
                  {ru ? (
                    <>
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>
                        {Array.isArray(ru.pledges) ? ru.pledges.length : 0} pledges, served from the
                        server. Terms version is a sha256 of the exact pledge text:
                      </p>
                      <div
                        style={{
                          fontFamily: FM,
                          fontSize: 11,
                          color: GOLD,
                          marginTop: 8,
                          wordBreak: 'break-all',
                        }}
                      >
                        {ru.termsVersion}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <a
                          href="/responsible-use"
                          style={{
                            fontFamily: FH,
                            fontSize: 12,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: GOLDB,
                          }}
                        >
                          Read and accept it →
                        </a>
                      </div>
                      <Missing
                        label="ACCEPTANCE IS NOT ENFORCED"
                        reason="Acceptances are recorded, but no screen in TruckWithEase is blocked for a driver who never accepted. Enforcement is not built yet."
                      />
                    </>
                  ) : (
                    <Missing
                      label="AGREEMENT NOT READ"
                      reason={`Could not read /api/responsible-use (${ruErr || 'unknown'}), so this page will not tell you how many pledges there are or what version is current.`}
                    />
                  )}
                </Panel>

                <Panel title="Submit" note="POST /api/signup" icon={<Send size={16} color={GOLD} />}>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginTop: 0 }}>
                    Pressing this writes one row to the signups table. The next screen shows the row
                    the server returned, its id and status, and the server's own statement about
                    whether anything was charged.
                  </p>
                  {err ? <Err msg={err} /> : null}
                  <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                    <Btn onClick={() => { setStep(2); setErr(''); }} disabled={submitting}>
                      <ArrowLeft size={14} /> Back
                    </Btn>
                    <Btn onClick={next} primary flex="1" disabled={submitting}>
                      {submitting ? <Spin /> : <Send size={14} />}
                      {submitting ? 'Storing…' : 'Store my signup'}
                    </Btn>
                  </div>
                </Panel>
              </>
            )}

            {/* Step 4 */}
            {step === 4 && result && (
              <>
                <Panel
                  title={result.duplicate ? 'Already on file' : 'Stored'}
                  note={`POST /api/signup -> ${result.httpStatus} in ${result.ms} ms`}
                  icon={<CheckCircle2 size={16} color={GOLD} />}
                  right={<Tag text={result.charged === false ? 'Nothing charged' : 'Charge state unknown'} tone={result.charged === false ? 'gold' : 'warn'} />}
                >
                  {result.duplicate ? (
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginTop: 0 }}>
                      This email already had a signup record, so the server returned the existing one
                      rather than creating a duplicate.
                    </p>
                  ) : null}

                  <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                    {[
                      ['Record id', result.signup && result.signup.id],
                      ['Email', result.signup && result.signup.email],
                      ['Role', result.signup && result.signup.role],
                      ['Vehicle', result.signup && result.signup.vehicleWorld],
                      ['Plan of interest', (result.signup && result.signup.plan) || 'none'],
                      ['Status', result.signup && result.signup.status],
                      ['Trial days', result.trialDays],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          borderBottom: `1px solid ${C.border}`,
                          paddingBottom: 7,
                        }}
                      >
                        <span style={{ fontFamily: FH, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>
                          {k}
                        </span>
                        <span style={{ fontFamily: FM, fontSize: 12, color: C.white, wordBreak: 'break-all' }}>
                          {v == null || v === '' ? '—' : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {result.chargedNote ? (
                    <Missing label="WHAT THIS RECORD IS NOT" reason={result.chargedNote} />
                  ) : null}
                </Panel>

                <Panel title="What happens next" note="Written by a human, not generated" icon={<ClipboardList size={16} color={GOLD} />}>
                  <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 14, lineHeight: 1.85 }}>
                    <li>A person reads this record. There is no automated approval step.</li>
                    <li>
                      You do not have a login yet. Accounts are created separately at{' '}
                      <a href="/sign-in" style={{ color: GOLDB }}>/sign-in</a>, and new accounts get
                      the driver role.
                    </li>
                    <li>No subscription exists and no payment method is on file.</li>
                    <li>
                      Nothing was filed with FMCSA, no operating authority was checked, and no ELD was
                      registered on your behalf.
                    </li>
                  </ol>
                </Panel>
              </>
            )}

            {/* Support */}
            {support && (
              <Panel
                title="Need help while you do this"
                note="GET /api/support — real hours, not a 24/7 claim"
                icon={<Clock size={16} color={GOLD} />}
                right={<Tag text={support.openNow ? 'Open now' : 'Closed now'} tone={support.openNow ? 'gold' : 'warn'} />}
              >
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontFamily: FM, fontSize: 12, color: C.white }}>
                    <Mail size={14} color={GOLD} /> {support.email}
                  </span>
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontFamily: FM, fontSize: 12, color: C.white }}>
                    <Phone size={14} color={GOLD} /> {support.phone}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {DAYS.map(([k, name]) => {
                    const today = support.today === k;
                    return (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: `1px solid ${C.border}`,
                          paddingBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FH,
                            fontSize: 12,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: today ? GOLDB : C.muted,
                          }}
                        >
                          {name}
                          {today ? ' · today' : ''}
                        </span>
                        <span style={{ fontFamily: FM, fontSize: 12, color: today ? GOLDB : C.white }}>
                          {(support.hours && support.hours[k]) || '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 10, marginBottom: 0 }}>
                  {support.timezone}
                </p>
              </Panel>
            )}

            {/* Not claimed */}
            <Panel title="What this page does not do" note="Read it before you type anything">
              <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 14, lineHeight: 1.9 }}>
                <li>It does not take a payment, and it does not start a subscription.</li>
                <li>It does not collect or store bank, routing, account or card numbers.</li>
                <li>It does not collect a driver's license number or an EIN.</li>
                <li>It does not create a login or grant access to any screen.</li>
                <li>It does not verify your MC number, USDOT number, insurance or authority with FMCSA.</li>
                <li>It does not enroll you in an ELD. TruckWithEase is not a registered ELD.</li>
                <li>It does not file anything with any agency.</li>
                <li>It does not ship hardware.</li>
                <li>It does not run a background check.</li>
              </ol>
            </Panel>

            {/* Measured reads */}
            <Panel
              title="Measured round trips"
              note="performance.now() around every request this page made"
              right={
                <Btn onClick={load}>
                  <RefreshCw size={13} /> Re-read
                </Btn>
              }
            >
              <div style={{ display: 'grid', gap: 6 }}>
                {reads.map((r, i) => (
                  <div
                    key={`${r.url}-${i}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontFamily: FM,
                      fontSize: 12,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ color: C.white, wordBreak: 'break-all' }}>{r.url}</span>
                    <span style={{ color: r.status >= 200 && r.status < 300 ? C.muted : WARN, whiteSpace: 'nowrap' }}>
                      {r.status || 'network'} · {r.ms} ms{r.ms >= SLOW_MS ? ' ← slow' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.nav, padding: '22px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: FM, fontSize: 11, color: C.dim, lineHeight: 1.8 }}>
          TruckWithEase is compliance and fleet management software that runs alongside the ELD a
          driver already has. It is not an ELD, it is not registered with FMCSA, and it files nothing
          with any agency.
        </div>
      </footer>
    </div>
  );
}
