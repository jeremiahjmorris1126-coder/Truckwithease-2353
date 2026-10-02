import { useState, useEffect } from "react";

/**
 * Accessible signup — this is the page that serves /signup.
 *
 * Rewritten server-side. Two things were wrong with the original:
 *  1. It imported PocketBase and wrote to `signups`, `rig_bucks_accounts` and
 *     `subscription_seats` on a PocketBase instance that does not exist. Every
 *     signup on the public path was silently dropped.
 *  2. Line 265 referenced an undefined `C.gold`, so the page threw the instant
 *     a visitor advanced past step 1.
 *
 * It now posts to /api/signup and pulls plans and prices from the API so it can
 * never quote a stale price. Plain language and large targets are deliberate —
 * this is the accessible path.
 */

const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#ffd700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const NAV = "#111111";
const BORDER = "#222222";

/** Copy only. Prices and plan ids come from GET /api/signup. */
const PLAN_COPY = {
  solo: {
    name: "Solo",
    tag: "Owner-operators running one truck",
    what: "Everything you need to run your truck your way — logs, fuel finder, income tracking, and your own AI co-pilot.",
    features: ["HOS / ELD logger", "Pre-trip inspection", "DOT AI watcher", "Fuel finder & parking", "TRAXES income tracker", "Rig Bucks rewards"],
  },
  pro: {
    name: "Pro",
    tag: "Most drivers pick this",
    highlight: true,
    what: "The full platform. Every tool, every AI agent — load board, dispatch, weigh station bypass, nothing à-la-carte.",
    features: ["Everything in Solo", "Load board access", "Dispatch Darryl AI", "Fleet Chief AI", "Weigh station bypass", "Priority support"],
  },
  fleet_lease: {
    name: "Fleet — hardware leased",
    tag: "Fleets that want the hardware included",
    what: "Run the whole fleet from one screen. Tablet, ELD and dash cam come with the lease.",
    features: ["Everything in Pro", "Multi-driver dashboard", "Fleet safety scores", "HRease hiring tools", "Fleet documents", "Hardware lease included"],
  },
  fleet_owned: {
    name: "Fleet — hardware owned",
    tag: "Fleets buying hardware outright",
    what: "Same fleet platform, lower monthly, hardware purchased once per truck.",
    features: ["Everything in Pro", "Multi-driver dashboard", "Fleet safety scores", "HRease hiring tools", "Fleet documents", "You own the hardware"],
  },
};

const ROLE_OPTIONS = [
  { id: "owner_operator", label: "Owner-operator (independent, 1099)", hint: "You own or lease your own truck and run under your own authority or someone else's." },
  { id: "fleet_manager", label: "Fleet manager / owner", hint: "You manage other drivers. Pick a Fleet plan so every driver gets a seat." },
  { id: "company_driver", label: "Company driver", hint: "You drive for a carrier. If your fleet already has TruckWithEase, they add you — you don't need to pay." },
];

const FLEET_SIZES = [
  { id: "1", label: "Just me — 1 truck" },
  { id: "2-5", label: "2 to 5 trucks" },
  { id: "6-15", label: "6 to 15 trucks" },
  { id: "16-50", label: "16 to 50 trucks" },
  { id: "50+", label: "50 or more trucks" },
];

const PHONE = "636-706-8338";

export default function AccessibleSignupPage() {
  const [step, setStep] = useState(1); // 1 welcome, 2 plan, 3 info, 4 done
  const [config, setConfig] = useState(null);
  const [plan, setPlan] = useState("pro");
  const [role, setRole] = useState("owner_operator");
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", mcNumber: "", trucks: "1", trialCode: "" });
  const [codeState, setCodeState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/signup")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        const params = new URLSearchParams(window.location.search);
        const p = params.get("plan");
        if (p && d?.plans?.[p]) setPlan(p);
        const c = params.get("code");
        if (c) setForm((f) => ({ ...f, trialCode: c.toUpperCase() }));
      })
      .catch(() => setConfig(null));
  }, []);

  const plans = config?.plans || {};
  const planIds = Object.keys(plans).length ? Object.keys(plans) : Object.keys(PLAN_COPY);
  const trialDays = config?.trialDays ?? 14;
  const selected = plans[plan];
  const copy = PLAN_COPY[plan] || {};

  function priceLine(id) {
    const p = plans[id];
    if (!p) return { amount: "—", unit: "" };
    const amt = Number(p.unitPrice ?? p.price);
    if (!Number.isFinite(amt)) return { amount: "", unit: "" };
    return { amount: `${amt.toFixed(2)}`, unit: p.unit ? `/${p.unit}` : "/mo" };
  }

  async function checkCode() {
    const code = form.trialCode.trim().toUpperCase();
    if (!code) {
      setCodeState(null);
      return;
    }
    try {
      const r = await fetch(`/api/signup/trial-links/check/${encodeURIComponent(code)}`);
      const d = await r.json();
      setCodeState(d.valid ? { ok: true, msg: d.note || "Code accepted." } : { ok: false, msg: d.reason || "That code is not active." });
    } catch {
      setCodeState({ ok: false, msg: "Could not check that code right now. You can still sign up without it." });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("We need your name to get started.");
    if (!form.email.trim() && !form.phone.trim()) return setError("Add a phone number or an email so we can reach you.");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setError("That email does not look right — give it another look.");
    }
    if (!form.email.trim()) {
      return setError("We need an email to create the account. If you would rather do it by phone, call " + PHONE + ".");
    }

    setLoading(true);
    try {
      const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          companyName: form.company.trim() || undefined,
          mcNumber: form.mcNumber.trim() || undefined,
          role,
          plan,
          fleetSize: form.trucks,
          trialCode: form.trialCode.trim().toUpperCase() || undefined,
          source: "accessible_signup",
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || `Something went wrong. Call ${PHONE} and we will set you up right now.`);
        setLoading(false);
        return;
      }
      setResult(d);
      setStep(4);
    } catch {
      setError(`We could not reach the server. Call ${PHONE} and we will do it for you.`);
    }
    setLoading(false);
  }

  const css = `
    .as-wrap *, .as-wrap *::before, .as-wrap *::after { box-sizing: border-box; }
    .as-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 68px;
      border-bottom: 1px solid ${BORDER}; background: ${NAV}; position: sticky; top: 0; z-index: 100; }
    .as-back { color: #8a8a8a; font-size: 15px; text-decoration: none; letter-spacing: 1px; }
    .as-back:hover { color: #fff; }
    .as-body { max-width: 780px; margin: 0 auto; padding: 36px 24px 90px; }
    .as-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 34px; }
    .as-dot { width: 10px; height: 10px; border-radius: 50%; background: #2a2a2a; }
    .as-dot.on { background: ${GOLD}; width: 30px; border-radius: 5px; }
    .as-dot.done { background: ${GOLD}; opacity: 0.45; }
    .as-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.4rem, 6vw, 3.6rem); line-height: 1.05;
      letter-spacing: 1px; text-align: center; margin-bottom: 16px; }
    .as-sub { color: #a5a5a5; font-size: clamp(16px, 2.2vw, 19px); text-align: center; line-height: 1.75; margin-bottom: 34px;
      font-family: 'Inter', sans-serif; }
    .as-call { background: ${CARD}; border: 1px solid ${GOLD}; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px; }
    .as-call-t { font-family: 'Oswald', sans-serif; font-size: 19px; color: #fff; margin-bottom: 6px; }
    .as-call-s { font-family: 'Inter', sans-serif; font-size: 14px; color: #8a8a8a; margin-bottom: 16px; }
    .as-call-b { display: inline-block; background: linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%);
      color: ${BLACK}; border-radius: 50px; padding: 15px 34px; font-size: 22px; font-weight: 700;
      text-decoration: none; font-family: 'Oswald', sans-serif; letter-spacing: 1px; }
    .as-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media(max-width: 620px) { .as-grid2 { grid-template-columns: 1fr; } }
    .as-plan { border: 2px solid ${BORDER}; border-radius: 18px; padding: 24px 20px; cursor: pointer; background: ${CARD}; position: relative; }
    .as-plan:hover { border-color: rgba(201,168,76,0.5); }
    .as-plan.sel { border-color: ${GOLD}; box-shadow: 0 0 28px rgba(201,168,76,0.14); }
    .as-plan-n { font-family: 'Oswald', sans-serif; font-size: 21px; font-weight: 600; margin-bottom: 3px; }
    .as-plan-tag { font-family: 'Inter', sans-serif; font-size: 13px; color: #7d7d7d; margin-bottom: 14px; }
    .as-plan-p { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: ${GOLD_BRIGHT}; line-height: 1; margin-bottom: 12px; }
    .as-plan-p span { font-family: 'Inter', sans-serif; font-size: 14px; color: #7d7d7d; }
    .as-plan-w { font-family: 'Inter', sans-serif; font-size: 14px; color: #a5a5a5; line-height: 1.65; margin-bottom: 14px; }
    .as-feat { font-family: 'Inter', sans-serif; font-size: 13.5px; color: #bdbdbd; margin-bottom: 7px; display: flex; gap: 9px; }
    .as-feat i { color: ${GOLD}; font-style: normal; }
    .as-bar { margin-top: 18px; border-radius: 10px; padding: 11px; text-align: center; font-family: 'Oswald', sans-serif;
      font-size: 14px; letter-spacing: 1px; }
    .as-bar.on { background: ${GOLD}; color: ${BLACK}; font-weight: 700; }
    .as-bar.off { background: #1d1d1d; color: #6c6c6c; }
    .as-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: ${GOLD};
      color: ${BLACK}; font-family: 'Oswald', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 15px;
      border-radius: 20px; letter-spacing: 1.5px; white-space: nowrap; }
    .as-label { display: block; font-family: 'Oswald', sans-serif; font-size: 14px; color: #9a9a9a;
      text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 9px; }
    .as-input { width: 100%; background: ${BLACK}; border: 2px solid ${BORDER}; border-radius: 13px; padding: 17px 19px;
      font-size: 18px; font-family: 'Inter', sans-serif; color: #fff; outline: none; }
    .as-input:focus { border-color: ${GOLD}; }
    .as-input::placeholder { color: #4a4a4a; }
    .as-hint { font-family: 'Inter', sans-serif; font-size: 13px; color: #6c6c6c; margin-top: 8px; line-height: 1.6; }
    .as-gold { display: block; width: 100%; background: ${GOLD}; color: ${BLACK}; border: none; border-radius: 15px;
      padding: 20px; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 1.5px;
      cursor: pointer; text-align: center; text-decoration: none; }
    .as-gold:disabled { opacity: 0.45; cursor: not-allowed; }
    .as-ghost { display: block; width: 100%; background: transparent; color: #8a8a8a; border: 2px solid ${BORDER};
      border-radius: 15px; padding: 17px; font-family: 'Oswald', sans-serif; font-size: 17px; letter-spacing: 1.2px;
      cursor: pointer; text-align: center; }
    .as-err { background: rgba(201,106,76,0.10); border: 2px solid #6a3a2a; border-radius: 12px; padding: 16px 18px;
      color: #e0a58c; font-size: 15px; line-height: 1.6; font-family: 'Inter', sans-serif; }
    .as-note { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 15px 17px;
      font-family: 'Inter', sans-serif; font-size: 13px; color: #8a8a8a; line-height: 1.7; }
    .as-float { position: fixed; bottom: 24px; right: 22px; z-index: 999; background: ${GOLD}; color: ${BLACK};
      border-radius: 50px; padding: 14px 22px; font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700;
      letter-spacing: 1px; text-decoration: none; box-shadow: 0 10px 28px rgba(0,0,0,0.6); }
  `;

  return (
    <div className="as-wrap" style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{css}</style>

      <a href={`tel:${PHONE.replace(/-/g, "")}`} className="as-float">{PHONE}</a>

      <nav className="as-nav">
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/static/twe-logo-horizontal-trim.png" alt="TruckWithEase" style={{ height: 32 }} />
        </a>
        <a href="/" className="as-back">&larr; BACK TO SITE</a>
      </nav>

      <div className="as-body">
        <div className="as-dots">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`as-dot ${step === n ? "on" : step > n ? "done" : ""}`} />
          ))}
        </div>

        {step > 1 && step < 4 && (
          <div className="as-note" style={{ marginBottom: 24 }}>
            <strong style={{ color: GOLD }}>Terms:</strong> by finishing signup you agree to our{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>
              Terms of Service and Privacy Policy
            </a>
            . No card is collected on this page and nothing is charged today.
          </div>
        )}

        {/* ── STEP 1 ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="as-call">
              <div className="as-call-t">Rather just call? We will sign you up in about 5 minutes.</div>
              <div className="as-call-s">A real person picks up. No menus, no hold music.</div>
              <a href={`tel:${PHONE.replace(/-/g, "")}`} className="as-call-b">{PHONE}</a>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6c6c6c", marginTop: 12 }}>
                Mon–Fri 7am–9pm CST
              </div>
            </div>

            <h1 className="as-h1">
              WELCOME TO <span style={{ color: GOLD }}>TRUCKWITHEASE</span>
            </h1>
            <p className="as-sub">
              Built for every driver — 30 years behind the wheel or a CDL you got last month. Simple, no nonsense, just the
              tools that make you money and cut the paperwork.
            </p>

            <div className="as-grid2" style={{ marginBottom: 30 }}>
              {[
                "HOS logs done in seconds",
                "Cheapest fuel on your route",
                "Every dollar tracked by TRAXES",
                "12 AI agents that talk trucking",
                "Load board — find loads fast",
                "DOT compliance, covered",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: CARD,
                    borderRadius: 13,
                    padding: "17px 16px",
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <span style={{ color: GOLD, fontFamily: "'Oswald', sans-serif" }}>&mdash;</span>
                  <span style={{ fontSize: 15, color: "#d5d5d5", lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>

            <button className="as-gold" onClick={() => setStep(2)}>LET'S GET STARTED</button>
            <div style={{ textAlign: "center", marginTop: 15, color: "#6c6c6c", fontSize: 14 }}>
              {trialDays}-day free trial · no credit card · cancel anytime
            </div>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h1 className="as-h1">PICK YOUR PLAN</h1>
            <p className="as-sub">
              Free for {trialDays} days, no card. You can move up or down later — there is no contract.
            </p>

            <div className="as-grid2" style={{ marginBottom: 28 }}>
              {planIds.map((id) => {
                const c = PLAN_COPY[id] || { name: id, features: [] };
                const pr = priceLine(id);
                return (
                  <div key={id} className={`as-plan${plan === id ? " sel" : ""}`} onClick={() => setPlan(id)}>
                    {c.highlight && <div className="as-badge">MOST POPULAR</div>}
                    <div className="as-plan-n">{c.name}</div>
                    <div className="as-plan-tag">{c.tag}</div>
                    <div className="as-plan-p">
                      {pr.amount}
                      <span>{pr.unit}</span>
                    </div>
                    <div className="as-plan-w">{c.what}</div>
                    {(c.features || []).map((f) => (
                      <div key={f} className="as-feat">
                        <i>&#10003;</i>
                        {f}
                      </div>
                    ))}
                    {plans[id]?.note ? (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6c6c6c", marginTop: 10 }}>
                        {plans[id].note}
                      </div>
                    ) : null}
                    <div className={`as-bar ${plan === id ? "on" : "off"}`}>
                      {plan === id ? "THIS IS MY PLAN" : "TAP TO CHOOSE"}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="as-gold" style={{ marginBottom: 12 }} onClick={() => setStep(3)}>
              CONTINUE WITH {(copy.name || plan).toUpperCase()}
            </button>
            <button className="as-ghost" onClick={() => setStep(1)}>&larr; BACK</button>
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h1 className="as-h1">ALMOST THERE</h1>
            <p className="as-sub" style={{ marginBottom: 20 }}>
              A few things and you are in. We keep it short — you have miles to cover.
            </p>

            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(201,168,76,0.10)",
                  border: `1px solid ${GOLD}`,
                  borderRadius: 30,
                  padding: "9px 20px",
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 15,
                  color: GOLD,
                  letterSpacing: 1,
                }}
              >
                {copy.name || plan} — {priceLine(plan).amount}
                {priceLine(plan).unit}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label className="as-label">Your name *</label>
                <input
                  className="as-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ray Davis"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="as-label">Email *</label>
                <input
                  className="as-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ray@example.com"
                  autoComplete="email"
                />
                <p className="as-hint">Your login goes here. Already signed up with this email? We will just pull up your existing account.</p>
              </div>

              <div>
                <label className="as-label">Phone</label>
                <input
                  className="as-input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
                <p className="as-hint">Call or text, whichever you prefer.</p>
              </div>

              <div>
                <label className="as-label">I am a…</label>
                <select className="as-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  {(config?.roles || ROLE_OPTIONS.map((r) => r.id)).map((id) => {
                    const r = ROLE_OPTIONS.find((x) => x.id === id);
                    return (
                      <option key={id} value={id}>
                        {r ? r.label : id}
                      </option>
                    );
                  })}
                </select>
                <p className="as-hint">{ROLE_OPTIONS.find((r) => r.id === role)?.hint}</p>
              </div>

              <div>
                <label className="as-label">Company / carrier name</label>
                <input
                  className="as-input"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Trucking LLC"
                />
              </div>

              <div>
                <label className="as-label">MC number</label>
                <input
                  className="as-input"
                  value={form.mcNumber}
                  onChange={(e) => setForm({ ...form, mcNumber: e.target.value })}
                  placeholder="MC-123456"
                />
                <p className="as-hint">
                  Optional. We check the number's format only. We do not verify your operating authority with FMCSA at signup.
                </p>
              </div>

              <div>
                <label className="as-label">How many trucks?</label>
                <select className="as-input" value={form.trucks} onChange={(e) => setForm({ ...form, trucks: e.target.value })}>
                  {FLEET_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="as-label">Trial code (if someone gave you one)</label>
                <input
                  className="as-input"
                  value={form.trialCode}
                  onChange={(e) => setForm({ ...form, trialCode: e.target.value.toUpperCase() })}
                  onBlur={checkCode}
                  placeholder="TWE-XXXXXX"
                />
                {codeState ? (
                  <p className="as-hint" style={{ color: codeState.ok ? GOLD : "#e0a58c" }}>{codeState.msg}</p>
                ) : (
                  <p className="as-hint">Leave it blank if you do not have one. It changes nothing about the price.</p>
                )}
              </div>

              {error && <div className="as-err">{error}</div>}

              <button type="submit" className="as-gold" disabled={loading}>
                {loading ? "SAVING…" : "START MY FREE TRIAL"}
              </button>
              <button type="button" className="as-ghost" onClick={() => setStep(2)}>&larr; CHANGE PLAN</button>

              <div className="as-note" style={{ textAlign: "center" }}>
                No card is collected here and nothing is charged today. When your trial ends we will contact you before any
                billing starts.
                <div style={{ marginTop: 12 }}>
                  Rather talk to someone?{" "}
                  <a href={`tel:${PHONE.replace(/-/g, "")}`} style={{ color: GOLD, fontWeight: 700 }}>{PHONE}</a>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 4 ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <h1 className="as-h1">
              {result?.duplicate ? "YOU'RE ALREADY IN" : `YOU'RE IN, ${(form.name.split(" ")[0] || "DRIVER").toUpperCase()}`}
            </h1>
            <p className="as-sub">
              {result?.duplicate
                ? "We already have this email on file, so we pulled up your existing signup instead of making a second one."
                : `Your ${trialDays}-day trial is recorded. We will reach out to walk you through it, or dive in below.`}
            </p>

            <div className="as-note" style={{ textAlign: "left", marginBottom: 22 }}>
              {result?.chargedNote ||
                "No card was collected and nothing has been charged. Billing is not live in this build — we will contact you before anything is billed."}
              {result?.signup?.id ? (
                <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: GOLD }}>
                  Reference: {result.signup.id}
                </div>
              ) : null}
            </div>

            <div className="as-call" style={{ marginBottom: 22 }}>
              <div className="as-call-t">Need a hand right now?</div>
              <a href={`tel:${PHONE.replace(/-/g, "")}`} className="as-call-b">{PHONE}</a>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#8a8a8a", marginTop: 12 }}>
                or email <a href="mailto:jeremiahjmorris1126@gmail.com" style={{ color: GOLD }}>jeremiahjmorris1126@gmail.com</a>
              </div>
            </div>

            <a href="/app" className="as-gold" style={{ marginBottom: 12 }}>GO TO MY DASHBOARD</a>
            <a href="/" className="as-ghost">BACK TO THE SITE</a>
          </div>
        )}
      </div>
    </div>
  );
}
