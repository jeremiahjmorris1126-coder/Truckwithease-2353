import { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();
const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

const PLANS = [
  { id:"solo",  name:"Solo",  price:"$19.99", desc:"Perfect for owner-operators", features:["HOS / ELD Logger","Pre-Trip DVIR","DOT AI Watcher","Fuel Finder & Parking","Traxes Financial AI","Rig Bucks Rewards","14 AI-powered tools"] },
  { id:"pro",   name:"Pro",   price:"$34.99", desc:"Most popular — full platform", features:["Everything in Solo","Load Board Access","Dispatch Darryl AI","$100 Fuel Card Included","Moviease","Fleet Chief AI","Weigh Station Bypass","Priority support"], highlight:true },
  { id:"fleet", name:"Fleet", price:"$24.99/seat", desc:"For fleets of all sizes", features:["Everything in Pro","HRease","Fleet Command Center","Multi-driver management","Safety Scorecards","California AB5 Tools","Custom integrations"] },
];

export default function SignupPage() {
  const [step, setStep]         = useState(1); // 1=plan, 2=info, 3=done
  const [plan, setPlan]         = useState("pro");
  const [form, setForm]         = useState({ name:"", email:"", phone:"", fleet_size:"1" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [trialCode, setTrialCode] = useState("");

  // Check URL params on mount to get trial code and fleet name
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("trial");
    const fleet = params.get("fleet");
    
    if (code) {
      setTrialCode(code);
      // Verify code is valid and not expired
      verifyTrialCode(code);
    }
    
    if (fleet) {
      setForm(f => ({ ...f, fleet_size: fleet }));
    }
  }, []);

  async function verifyTrialCode(code) {
    try {
      const record = await pb.collection("trial_links").getFirstListItem(`code="${code}"`);
      const expTime = new Date(record.expires_at).getTime();
      const now = Date.now();
      
      if (now > expTime) {
        setError("This trial link has expired. Generate a new one.");
        setTrialCode("");
      } else {
        setTrialCode(code);
      }
    } catch (err) {
      setError("Invalid trial code.");
      setTrialCode("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate inputs
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) { setError("Please enter a valid email."); return; }
    if (form.phone.trim() && form.phone.trim().length < 10) { setError("Phone must be at least 10 digits."); return; }
    
    setLoading(true);
    setError("");
    try {
      const record = await pb.collection("signups").create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        plan,
        fleet_size: parseInt(form.fleet_size) || 1,
        source: trialCode ? "trial_link" : "landing_page",
        trial_code: trialCode || null,
        created_at: new Date().toISOString(),
      });
      
      // If trial link was used, mark it as redeemed
      if (trialCode) {
        await pb.collection("trial_links").update(
          (await pb.collection("trial_links").getFirstListItem(`code="${trialCode}"`)).id,
          { is_active: false, redeemed_by: record.email, redeemed_at: new Date().toISOString() }
        );
      }
      
      // Save signup ID to sessionStorage for onboarding redirect
      sessionStorage.setItem("signup_id", record.id);
      sessionStorage.setItem("signup_email", record.email);
      setStep(3);
    } catch (err) {
      console.error("Signup error:", err);
      if (err.status === 400 && err.data?.email) {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError("Signup failed. Please try again or email us at truckwithease@gmail.com.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:NAVY2, minHeight:"100vh", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .su-input{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:13px 16px;font-size:14px;font-family:'Poppins',sans-serif;color:white;width:100%;outline:none;transition:border 0.2s}
        .su-input::placeholder{color:rgba(255,255,255,0.3)}
        .su-input:focus{border-color:${AMBER}}
        .su-plan{border:2px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.2s;background:rgba(255,255,255,0.04)}
        .su-plan.sel{border-color:${AMBER};background:rgba(255,180,0,0.07)}
        .su-plan:hover:not(.sel){border-color:rgba(255,255,255,0.25)}
        @media(max-width:768px){.su-plans{grid-template-columns:1fr!important}.su-two-col{flex-direction:column!important}}
        .call-strip{background:linear-gradient(135deg,#1a3a00,#0a2200);border:2px solid #4ade80;border-radius:20px;padding:28px 32px;margin-bottom:36px;text-align:center}
        .call-btn{display:inline-flex;align-items:center;gap:14px;background:#4ade80;color:#0a2200;border:none;border-radius:16px;padding:20px 36px;font-size:22px;font-weight:900;cursor:pointer;font-family:'Poppins',sans-serif;text-decoration:none;transition:transform 0.15s,box-shadow 0.15s;box-shadow:0 4px 24px rgba(74,222,128,0.4);width:100%;justify-content:center;max-width:400px}
        .call-btn:hover{transform:scale(1.03);box-shadow:0 6px 32px rgba(74,222,128,0.55)}
        .call-btn:active{transform:scale(0.98)}
        .call-float{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
        .call-float-btn{display:flex;align-items:center;gap:12px;background:#4ade80;color:#0a2200;border:none;border-radius:50px;padding:14px 22px;font-size:16px;font-weight:900;cursor:pointer;font-family:'Poppins',sans-serif;text-decoration:none;box-shadow:0 4px 20px rgba(74,222,128,0.5);transition:transform 0.15s}
        .call-float-btn:hover{transform:scale(1.05)}
        .call-divider{display:flex;align-items:center;gap:16px;margin:28px 0;color:rgba(255,255,255,0.25);font-size:13px;font-weight:600}
        .call-divider::before,.call-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.1)}
        @media(max-width:500px){.call-btn{font-size:18px;padding:18px 24px}.call-float-btn{font-size:14px;padding:12px 18px}}
      `}</style>

      {/* Nav */}
      <nav style={{ padding:"0 5%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ height:32, borderRadius:8 }} />
          <span style={{ fontWeight:900, fontSize:15, color:"white" }}>Truck<span style={{ color:AMBER }}>WithEase</span></span>
        </a>
        <a href="/" style={{ color:"rgba(255,255,255,0.4)", fontSize:12, textDecoration:"none" }}>← Back to site</a>
      </nav>

      {/* Floating Call Button — always visible */}
      <a href="tel:+16367068338" className="call-float">
        <div className="call-float-btn">
          <span style={{ fontSize:22 }}>📞</span>
          <span>Call to Sign Up</span>
        </div>
        <div style={{ background:"rgba(0,0,0,0.7)", color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:20, textAlign:"center" }}>We'll do it for you — 5 min</div>
      </a>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 5% 100px" }}>

        {/* Progress */}
        {step < 3 && (
          <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:40, justifyContent:"center" }}>
            {[{n:1,l:"Choose Plan"},{n:2,l:"Your Info"},{n:3,l:"You're In"}].map((s,i)=>(
              <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:step>=s.n?AMBER:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:step>=s.n?DARK:"rgba(255,255,255,0.4)", transition:"all 0.3s" }}>{s.n}</div>
                  <span style={{ fontSize:11, color:step>=s.n?AMBER:"rgba(255,255,255,0.3)", fontWeight:600, whiteSpace:"nowrap" }}>{s.l}</span>
                </div>
                {i<2 && <div style={{ width:60, height:2, background:step>s.n?AMBER:"rgba(255,255,255,0.1)", margin:"0 8px", marginBottom:20, transition:"background 0.3s" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Choose Plan */}
        {step === 1 && (
          <div>
            {/* CALL TO SIGN UP — top of page */}
            <div className="call-strip">
              <div style={{ fontSize:14, fontWeight:700, color:"#86efac", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>Rather talk to a real person?</div>
              <div style={{ fontSize:"clamp(1.1rem,2vw,1.35rem)", fontWeight:800, color:"white", marginBottom:18, lineHeight:1.4 }}>
                Just call us — we'll sign you up <span style={{ color:"#4ade80" }}>in about 5 minutes</span>
              </div>
              <a href="tel:+16367068338" className="call-btn">
                <span style={{ fontSize:28 }}>📞</span>
                <span>Call&nbsp;636-706-8338</span>
              </a>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:14 }}>
                Mon – Fri &nbsp;|&nbsp; 7am – 9pm CST &nbsp;|&nbsp; We pick up fast
              </div>
            </div>

            <div className="call-divider">or sign up online below</div>

            <div style={{ textAlign:"center", marginBottom:32 }}>
              <h1 style={{ fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:900, marginBottom:10 }}>Start Your <span style={{ color:AMBER }}>14-Day Free Trial</span></h1>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15 }}>No credit card required. Cancel anytime. Every plan includes the full platform.</p>
            </div>
            <div className="su-plans" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32 }}>
              {PLANS.map(p => (
                <div key={p.id} className={`su-plan${plan===p.id?" sel":""}`} onClick={()=>setPlan(p.id)} style={{ position:"relative" }}>
                  {p.highlight && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:AMBER, color:DARK, fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:20 }}>MOST POPULAR</div>}
                  <div style={{ fontWeight:800, fontSize:18, color:"white", marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontWeight:900, fontSize:26, color:p.id===plan?AMBER:"white", fontFamily:"'DM Mono',monospace", marginBottom:4 }}>{p.price}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginBottom:14 }}>per month{p.id==="fleet"?" per driver":""}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginBottom:16 }}>{p.desc}</div>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", gap:8, marginBottom:7, fontSize:12, color:"rgba(255,255,255,0.75)" }}>
                      <span style={{ color:GREEN, flexShrink:0 }}>✓</span>{f}
                    </div>
                  ))}
                  <div style={{ marginTop:16, padding:"10px", borderRadius:8, background:plan===p.id?AMBER:"rgba(255,255,255,0.07)", textAlign:"center", fontWeight:700, fontSize:13, color:plan===p.id?DARK:"rgba(255,255,255,0.5)", transition:"all 0.2s" }}>
                    {plan===p.id?"✓ Selected":"Select Plan"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center" }}>
              <button onClick={()=>setStep(2)} style={{ background:AMBER, color:DARK, border:"none", borderRadius:12, padding:"15px 48px", fontWeight:900, fontSize:16, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                Continue with {PLANS.find(p2=>p2.id===plan)?.name} →
              </button>
              <div style={{ color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:12 }}>No credit card required during trial</div>
            </div>
          </div>
        )}

        {/* Step 2 — Your Info */}
        {step === 2 && (
          <div style={{ maxWidth:480, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ background:`${AMBER}15`, border:`1px solid ${AMBER}30`, borderRadius:10, padding:"8px 18px", display:"inline-block", marginBottom:16 }}>
                <span style={{ color:AMBER, fontWeight:700, fontSize:12 }}>{PLANS.find(p=>p.id===plan)?.name} Plan · {PLANS.find(p=>p.id===plan)?.price}/mo</span>
              </div>
              <h2 style={{ fontSize:"clamp(1.5rem,2.5vw,2rem)", fontWeight:900, marginBottom:8 }}>Tell us about yourself</h2>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>We'll set up your account and reach out to get you started.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Full Name *</label>
                <input className="su-input" placeholder="Ray Davis" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
              </div>
              <div>
                <label style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Email Address *</label>
                <input className="su-input" type="email" placeholder="ray@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
              </div>
              <div>
                <label style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Phone (optional)</label>
                <input className="su-input" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
              </div>
              <div>
                <label style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>How many trucks?</label>
                <select className="su-input" value={form.fleet_size} onChange={e=>setForm({...form,fleet_size:e.target.value})} style={{ cursor:"pointer" }}>
                  {["1","2-5","6-15","16-50","50+"].map(v=><option key={v} value={v}>{v} truck{v==="1"?"":"s"}</option>)}
                </select>
              </div>
              {error && <div style={{ background:`${RED}15`, border:`1px solid ${RED}40`, borderRadius:8, padding:"10px 14px", color:"#fca5a5", fontSize:13 }}>{error}</div>}

              {/* Call option mid-form */}
              <div style={{ background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:12, padding:"16px 20px", textAlign:"center", marginTop:4 }}>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:10 }}>Don't want to type? No problem.</div>
                <a href="tel:+16367068338" style={{ display:"inline-flex", alignItems:"center", gap:10, background:"#4ade80", color:"#0a2200", borderRadius:12, padding:"12px 24px", fontWeight:900, fontSize:16, textDecoration:"none" }}>
                  <span>📞</span> Call us — we'll fill this out for you
                </a>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:8 }}>636-706-8338 &nbsp;·&nbsp; Takes about 5 minutes</div>
              </div>

              <div style={{ display:"flex", gap:12, marginTop:8 }}>
                <button type="button" onClick={()=>setStep(1)} style={{ flex:1, background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>← Back</button>
                <button type="submit" disabled={loading} style={{ flex:2, background:AMBER, color:DARK, border:"none", borderRadius:10, padding:"13px", fontWeight:900, fontSize:15, cursor:"pointer", fontFamily:"'Poppins',sans-serif", opacity:loading?0.7:1 }}>
                  {loading ? "Starting your trial…" : "Start Free Trial →"}
                </button>
              </div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:11, textAlign:"center" }}>By continuing you agree to our Terms of Service and Privacy Policy</div>
            </form>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div style={{ textAlign:"center", maxWidth:520, margin:"0 auto", paddingTop:20 }}>
            <div style={{ fontSize:72, marginBottom:24 }}>🚛</div>
            <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:900, color:AMBER, marginBottom:12 }}>You're on the road!</h2>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, lineHeight:1.8, marginBottom:24 }}>
              Your 14-day free trial is confirmed. Complete your profile next so we can get you set up with banking and payment processing.
            </p>
            
            <div style={{ display:"flex", gap:12, marginBottom:32, flexDirection:"column" }}>
              <a 
                href={`/onboarding?id=${sessionStorage.getItem("signup_id")}`}
                style={{ background:AMBER, color:DARK, padding:"14px 24px", borderRadius:12, fontWeight:800, fontSize:15, textDecoration:"none", display:"block" }}
              >
                Complete Profile & Banking Setup →
              </a>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>
                Takes about 5 minutes
              </p>
            </div>

            <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:24 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.6)", marginBottom:16, letterSpacing:1 }}>IN THE MEANTIME</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, textAlign:"left" }}>
                {[
                  {icon:"⏱️",label:"HOS / ELD Logger",href:"/hos"},
                  {icon:"💎",label:"Meet Traxes",href:"/traxes"},
                  {icon:"🏆",label:"Rig Bucks",href:"/rig-bucks"},
                  {icon:"🤖",label:"Your AI Team",href:"/ai-team"},
                  {icon:"🎯",label:"Command Center",href:"/command"},
                  {icon:"🎬",label:"TW Cinema",href:"/cinema"},
                ].map(l=>(
                  <a key={l.label} href={l.href} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"14px 16px", textDecoration:"none", color:"white", display:"flex", gap:10, alignItems:"center", fontSize:13, fontWeight:600 }}>
                    <span style={{ fontSize:18 }}>{l.icon}</span>{l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
