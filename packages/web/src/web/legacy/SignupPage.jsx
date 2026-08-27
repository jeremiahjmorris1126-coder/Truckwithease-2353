import { useEffect, useState } from "react";

/**
 * SignupPage — server-backed.
 *
 * The original wrote to PocketBase collections `signups` and `trial_links`,
 * neither of which existed on any server. Every driver who filled this form saw
 * "You're on the road!" and the record evaporated. Original kept at
 * docs/launch/SignupPage.ORIGINAL.jsx.txt.
 *
 * Now posts to /api/signup (Turso-backed) and validates trial codes against
 * /api/signup/trial-links/check/:code. Repainted gold-on-black.
 * Prices come from the API so this page can never quote a stale number.
 */

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const RED = "#DC2626";

const PLAN_COPY = {
  solo: {
    desc: "Owner-operators running one truck",
    features: ["HOS / ELD logger", "Pre-trip DVIR", "DOT AI watcher", "Fuel finder & parking", "TRAXES financial AI", "Rig Bucks rewards"],
  },
  pro: {
    desc: "Most popular — full platform, nothing à-la-carte",
    features: ["Everything in Solo", "Load board access", "Dispatch Darryl AI", "Moviease", "Fleet Chief AI", "Weigh station bypass", "Priority support"],
    highlight: true,
  },
  fleet_lease: {
    desc: "Fleets that want the hardware included",
    features: ["Everything in Pro", "HRease", "Fleet command center", "Multi-driver management", "Safety scorecards", "Hardware lease included"],
  },
  fleet_owned: {
    desc: "Fleets that buy their own hardware",
    features: ["Everything in Pro", "HRease", "Fleet command center", "Multi-driver management", "Safety scorecards", "$600/truck one-time hardware"],
  },
};

const ROLE_LABELS = {
  driver: "Company driver",
  owner_operator: "Owner-operator",
  dispatcher: "Dispatcher",
  fleet_manager: "Fleet manager",
};

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState(null);
  const [plan, setPlan] = useState("pro");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    mcNumber: "",
    dotNumber: "",
    fleetSize: "1",
    role: "owner_operator",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trialCode, setTrialCode] = useState("");
  const [codeState, setCodeState] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/signup")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        if (d?.plans && !d.plans[plan]) setPlan(Object.keys(d.plans)[0]);
      })
      .catch(() => setConfig(null));

    const params = new URLSearchParams(window.location.search);
    const code = params.get("trial");
    const fleet = params.get("fleet");
    if (fleet) setForm((f) => ({ ...f, fleetSize: fleet }));
    if (code) {
      setTrialCode(code);
      checkCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkCode(code) {
    setCodeState({ checking: true });
    try {
      const r = await fetch(`/api/signup/trial-links/check/${encodeURIComponent(code.trim())}`);
      const d = await r.json();
      setCodeState(d);
      if (!d.valid) setError(d.reason || "That trial code is not valid.");
      else {
        setError("");
        if (d.plan) setPlan(d.plan);
      }
    } catch {
      setCodeState({ valid: false, reason: "Could not reach the server to check that code." });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError("Enter a valid email.");

    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          mcNumber: form.mcNumber.trim() || null,
          dotNumber: form.dotNumber.trim() || null,
          fleetSize: parseInt(form.fleetSize, 10) || 1,
          role: form.role,
          plan,
          vehicleWorld: "truck",
          source: trialCode ? "trial_link" : "landing",
          trialCode: trialCode || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Signup failed. Call 636-706-8338 and we'll do it for you.");
        return;
      }
      setResult(d);
      if (d?.signup?.id) {
        sessionStorage.setItem("signup_id", d.signup.id);
        sessionStorage.setItem("signup_email", d.signup.email);
      }
      setStep(3);
    } catch {
      setError("Could not reach the server. Nothing was saved. Call 636-706-8338 and we'll sign you up.");
    } finally {
      setLoading(false);
    }
  }

  const plans = config?.plans || {};
  const trialDays = config?.trialDays ?? 14;
  const selected = plans[plan];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: BLACK, minHeight: "100vh", color: "#fff" }}>
      <style>{`
        .su-input{background:#0f0f0f;border:1px solid ${BORDER};border-radius:10px;padding:13px 16px;font-size:14px;color:#fff;width:100%;outline:none;transition:border .2s;font-family:inherit}
        .su-input::placeholder{color:#555}
        .su-input:focus{border-color:${GOLD}}
        .su-plan{border:1px solid ${BORDER};border-radius:14px;padding:20px;cursor:pointer;transition:all .2s;background:${CARD}}
        .su-plan.sel{border-color:${GOLD};background:#1c1710}
        .su-plan:hover:not(.sel){border-color:#3a3a3a}
        .su-mono{font-family:'JetBrains Mono',ui-monospace,monospace}
        @media(max-width:900px){.su-plans{grid-template-columns:1fr!important}}
      `}</style>

      <nav style={{ padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}`, background: "#111111" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/static/twe-logo-horizontal-trim.png" alt="TruckWithEase" style={{ height: 30 }} />
        </a>
        <a href="/" style={{ color: "#777", fontSize: 12, textDecoration: "none", letterSpacing: 1 }}>← BACK TO SITE</a>
      </nav>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "44px 5% 100px" }}>
        {step < 3 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            {[{ n: 1, l: "Choose plan" }, { n: 2, l: "Your info" }, { n: 3, l: "You're in" }].map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: step >= s.n ? GOLD : "#1c1c1c", color: step >= s.n ? BLACK : "#666", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{s.n}</div>
                  <span style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: step >= s.n ? GOLD : "#555", fontWeight: 700 }}>{s.l}</span>
                </div>
                {i < 2 && <div style={{ width: 60, height: 1, background: step > s.n ? GOLD : BORDER, margin: "0 10px 20px" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Trial code banner */}
        {trialCode && codeState && !codeState.checking && (
          <div style={{ background: codeState.valid ? "#141a14" : "#1a1212", border: `1px solid ${codeState.valid ? "#2f5c2f" : "#5c2f2f"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13 }}>
            {codeState.valid ? (
              <span style={{ color: "#86efac" }}>
                Trial code <span className="su-mono" style={{ color: GOLD_BRIGHT }}>{trialCode}</span> applied — {codeState.trialDays ?? trialDays} days
                {codeState.usesLeft != null ? ` · ${codeState.usesLeft} spots left` : ""}
              </span>
            ) : (
              <span style={{ color: "#fca5a5" }}>{codeState.reason || "That trial code is not valid."} You can still sign up without it.</span>
            )}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 16, padding: "26px 30px", marginBottom: 34, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Rather talk to a real person?</div>
              <div style={{ fontSize: "clamp(1.05rem,2vw,1.3rem)", fontWeight: 700, marginBottom: 18 }}>
                Call us — we'll sign you up in about <span style={{ color: GOLD_BRIGHT }}>5 minutes</span>
              </div>
              <a href="tel:+16367068338" style={{ display: "inline-block", background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`, color: BLACK, borderRadius: 12, padding: "16px 34px", fontWeight: 900, fontSize: 20, textDecoration: "none", letterSpacing: 0.5 }}>
                636-706-8338
              </a>
              <div style={{ color: "#666", fontSize: 12, marginTop: 12 }}>Mon–Fri · 7am–9pm CST</div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue',Oswald,sans-serif", fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: 1, marginBottom: 8 }}>
                START YOUR <span style={{ color: GOLD_BRIGHT }}>{trialDays}-DAY FREE TRIAL</span>
              </h1>
              <p style={{ color: "#888", fontSize: 14 }}>No credit card. Cancel anytime. No contract.</p>
            </div>

            {!config && <div style={{ color: "#777", textAlign: "center", padding: 40 }}>Loading plans…</div>}

            <div className="su-plans" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginBottom: 30 }}>
              {Object.entries(plans).map(([id, p]) => {
                const copy = PLAN_COPY[id] || { desc: "", features: [] };
                return (
                  <div key={id} className={`su-plan${plan === id ? " sel" : ""}`} onClick={() => setPlan(id)} style={{ position: "relative" }}>
                    {copy.highlight && (
                      <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: GOLD, color: BLACK, fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>MOST POPULAR</div>
                    )}
                    <div style={{ fontFamily: "Oswald,sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{p.name}</div>
                    <div className="su-mono" style={{ fontWeight: 800, fontSize: 24, color: plan === id ? GOLD_BRIGHT : "#fff", marginBottom: 2 }}>${p.unitPrice}</div>
                    <div style={{ color: "#777", fontSize: 11, marginBottom: 12 }}>per {p.unit}</div>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 14, minHeight: 32 }}>{copy.desc}</div>
                    {copy.features.map((f) => (
                      <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#bbb" }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>✓</span>{f}
                      </div>
                    ))}
                    {p.note && <div style={{ color: "#666", fontSize: 11, marginTop: 10 }}>{p.note}</div>}
                    <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: plan === id ? GOLD : "#1c1c1c", textAlign: "center", fontWeight: 700, fontSize: 12, color: plan === id ? BLACK : "#777" }}>
                      {plan === id ? "SELECTED" : "SELECT"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => setStep(2)} disabled={!selected} style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 10, padding: "15px 44px", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: selected ? 1 : 0.4, fontFamily: "inherit" }}>
                CONTINUE {selected ? `WITH ${selected.name.toUpperCase()}` : ""} →
              </button>
              <div style={{ color: "#555", fontSize: 11, marginTop: 12 }}>No card is charged during the trial. Nothing is charged at all until you give us a card.</div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              {selected && (
                <div style={{ background: "#1c1710", border: `1px solid ${GOLD}55`, borderRadius: 8, padding: "7px 16px", display: "inline-block", marginBottom: 14 }}>
                  <span className="su-mono" style={{ color: GOLD_BRIGHT, fontSize: 12 }}>{selected.name} · ${selected.unitPrice}/{selected.unit}</span>
                </div>
              )}
              <h2 style={{ fontFamily: "'Bebas Neue',Oswald,sans-serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", letterSpacing: 1 }}>TELL US ABOUT YOU</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "name", l: "Full name *", ph: "Ray Davis", req: true },
                { k: "email", l: "Email *", ph: "ray@example.com", type: "email", req: true },
                { k: "phone", l: "Phone", ph: "(555) 000-0000", type: "tel" },
                { k: "company", l: "Company", ph: "Davis Trucking LLC" },
              ].map((f) => (
                <div key={f.k}>
                  <label style={{ color: "#777", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{f.l}</label>
                  <input className="su-input" type={f.type || "text"} placeholder={f.ph} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} required={f.req} />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "#777", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>MC number</label>
                  <input className="su-input" placeholder="123456" value={form.mcNumber} onChange={(e) => setForm({ ...form, mcNumber: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: "#777", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>DOT number</label>
                  <input className="su-input" placeholder="1234567" value={form.dotNumber} onChange={(e) => setForm({ ...form, dotNumber: e.target.value })} />
                </div>
              </div>
              <div style={{ color: "#555", fontSize: 11, marginTop: -6 }}>
                We check the MC number's format only. We do not verify your operating authority with FMCSA at signup.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "#777", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Role</label>
                  <select className="su-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ cursor: "pointer" }}>
                    {(config?.roles || Object.keys(ROLE_LABELS)).map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: "#777", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>How many trucks?</label>
                  <select className="su-input" value={form.fleetSize} onChange={(e) => setForm({ ...form, fleetSize: e.target.value })} style={{ cursor: "pointer" }}>
                    {["1", "2", "5", "15", "50", "100"].map((v) => (
                      <option key={v} value={v}>{v}{v === "100" ? "+" : ""} truck{v === "1" ? "" : "s"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ background: "#1a1212", border: `1px solid ${RED}55`, borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>{error}</div>
              )}

              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
                <div style={{ color: "#888", fontSize: 12, marginBottom: 9 }}>Don't want to type it?</div>
                <a href="tel:+16367068338" style={{ display: "inline-block", background: GOLD, color: BLACK, borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                  Call 636-706-8338
                </a>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: "#1c1c1c", color: "#888", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← BACK</button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: GOLD, color: BLACK, border: "none", borderRadius: 10, padding: 13, fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}>
                  {loading ? "SAVING…" : `START ${trialDays}-DAY TRIAL →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto", paddingTop: 10 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',Oswald,sans-serif", fontSize: "clamp(2rem,4vw,2.8rem)", color: GOLD_BRIGHT, letterSpacing: 1, marginBottom: 12 }}>
              {result?.duplicate ? "YOU'RE ALREADY IN" : "YOU'RE ON THE ROAD"}
            </h2>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
              {result?.duplicate
                ? "That email was already signed up, so we kept your original record instead of creating a second one."
                : `Your ${trialDays}-day trial record is saved. We'll reach out to finish setup.`}
            </p>
            {result?.signup?.id && (
              <div className="su-mono" style={{ color: "#666", fontSize: 12, marginBottom: 20 }}>Reference {result.signup.id}</div>
            )}
            {result?.chargedNote && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", color: "#999", fontSize: 12, marginBottom: 24, textAlign: "left" }}>
                {result.chargedNote}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
              <a href={`/onboarding?id=${result?.signup?.id || ""}`} style={{ background: GOLD, color: BLACK, padding: "14px 24px", borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                COMPLETE YOUR PROFILE →
              </a>
              <a href="tel:+16367068338" style={{ color: GOLD, fontSize: 13, textDecoration: "none" }}>Or call 636-706-8338 and we'll walk you through it</a>
            </div>

            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 22 }}>
              <h3 style={{ fontSize: 10, fontWeight: 700, color: "#666", marginBottom: 14, letterSpacing: 2 }}>IN THE MEANTIME</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" }}>
                {[
                  { label: "HOS / ELD logger", href: "/hos" },
                  { label: "Meet TRAXES", href: "/traxes" },
                  { label: "Rig Bucks", href: "/rig-bucks" },
                  { label: "Your AI team", href: "/ai-team" },
                  { label: "Command center", href: "/command" },
                  { label: "Support", href: "/support" },
                ].map((l) => (
                  <a key={l.label} href={l.href} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 15px", textDecoration: "none", color: "#ddd", fontSize: 13, fontWeight: 600 }}>{l.label}</a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
