import { useState } from "react";
import PocketBase from "pocketbase";
import { pricingPlans } from "./PricingTiersConfig";

const pb = new PocketBase();

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

export default function CheckoutPage() {
  const [step, setStep]         = useState(1);
  const [plan, setPlan]         = useState("pro");
  const [form, setForm]         = useState({ name:"", email:"", phone:"" });
  const [card, setCard]         = useState({ number:"", expiry:"", cvc:"" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [addons, setAddons] = useState({ dashcam: false, dashcamSeats: 1, voice: false, voiceSeats: 1, voiceDevice: "phone" });

  const addonOptions = [
    {
      id: "dashcam",
      name: "AI Dashcam",
      tagline: "Road-facing + cab-facing · AI safety alerts · Live feed in dispatch",
      pricePerSeat: 12.99,
      badge: "New Add-On",
      partners: "Powered by Lytx · SmartWitness · Geotab",
      icon: "📷",
    },
    {
      id: "voice",
      name: "Fleet Voice",
      tagline: "Hands-free in-cab calling · Fleet numbers · Group lines through your speakers",
      pricePerSeat: 8.99,
      badge: "Hands-Free",
      partners: "Phone or tablet · App pre-loaded · Ready to call",
      icon: "📡",
      hasDevice: true,
    },
  ];

  const addonTotal =
    (addons.dashcam ? addons.dashcamSeats * 12.99 : 0) +
    (addons.voice ? addons.voiceSeats * 8.99 : 0);
  const grandTotal = (getPlanPrice ? getPlanPrice() : 29.99) + addonTotal;

  const planDetails = {
    solo: { price: 29.99, name: "Solo" },
    pro: { price: 39.99, name: "Pro" },
    "fleet-rental": { price: 49.99, name: "Fleet (Rental)" },
    "fleet-owned": { price: 59.99, name: "Fleet (Owned)" },
  };

  const getPlanPrice = () => {
    return planDetails[plan]?.price || 29.99;
  };

  const getPlanName = () => {
    return planDetails[plan]?.name || "Plan";
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const subscription = await pb.collection("subscriptions").create({
        user_email: form.email,
        user_name: form.name,
        user_phone: form.phone,
        plan: plan,
        price: getPlanPrice(),
        plan_name: getPlanName(),
        card_last4: card.number.slice(-4),
        status: "active",
        created_at: new Date().toISOString(),
        stripe_id: "sim_" + Math.random().toString(36).slice(2, 11),
      });

      if (subscription) {
        sessionStorage.setItem("subscription", JSON.stringify(subscription));
        sessionStorage.setItem("userEmail", form.email);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/fleet-profile";
        }, 2000);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        background: NAVY, 
        color: "white", 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>✓</div>
          <h2 style={{ fontSize: "32px", marginBottom: "15px" }}>Payment Successful!</h2>
          <p style={{ fontSize: "16px", opacity: 0.8, marginBottom: "30px" }}>
            Your subscription to {getPlanName()} has been activated. Redirecting to fleet profile setup...
          </p>
          <div style={{ fontSize: "14px", opacity: 0.6 }}>A confirmation email has been sent to {form.email}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: DARK, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "40px", textAlign: "center" }}>
          Checkout
        </h1>

        {/* Plan Selection */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "30px", textAlign: "center" }}>Select Your Plan</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "40px"
            }}>
              {pricingPlans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={{
                    border: plan === p.id ? `3px solid ${ORANGE}` : `1px solid rgba(255,255,255,0.2)`,
                    borderRadius: "10px",
                    padding: "25px",
                    background: plan === p.id ? `rgba(255,107,53,0.1)` : "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "10px" }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: ORANGE, marginBottom: "15px" }}>
                    {p.price}
                  </div>
                  <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "15px" }}>
                    {p.description}
                  </p>
                  {p.highlight && (
                    <div style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      background: GREEN,
                      color: NAVY,
                      borderRadius: "4px",
                      display: "inline-block",
                      fontWeight: "bold"
                    }}>
                      Most Popular
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                padding: "16px",
                background: ORANGE,
                color: NAVY,
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Payment Form */}
        {step === 2 && (
          <form onSubmit={handlePayment} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "10px", marginBottom: "30px" }}>
              <h3 style={{ marginBottom: "20px" }}>Your Information</h3>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="John Doe"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "10px", marginBottom: "30px" }}>
              <h3 style={{ marginBottom: "20px" }}>Payment Details</h3>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Card Number</label>
                <input
                  type="text"
                  value={card.number}
                  onChange={(e) => setCard({...card, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                  placeholder="4242 4242 4242 4242"
                  maxLength="16"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 4) {
                        const formatted = val.length <= 2 ? val : val.slice(0,2) + "/" + val.slice(2);
                        setCard({...card, expiry: formatted});
                      }
                    }}
                    placeholder="12/25"
                    maxLength="5"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "white",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>CVC</label>
                  <input
                    type="text"
                    value={card.cvc}
                    onChange={(e) => setCard({...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                    placeholder="123"
                    maxLength="4"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "white",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>

              <div style={{
                padding: "16px",
                background: "rgba(0,255,100,0.1)",
                border: "1px solid rgba(0,255,100,0.3)",
                borderRadius: "6px",
                fontSize: "13px",
                opacity: 0.8
              }}>
                💡 <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future date and any 3-digit CVC.
              </div>
            </div>

            {error && (
              <div style={{
                padding: "15px",
                background: `rgba(220,38,38,0.2)`,
                border: `1px solid ${RED}`,
                borderRadius: "6px",
                color: RED,
                marginBottom: "20px",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            {/* Add-Ons */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Optional Add-Ons</div>
              {addonOptions.map(ao => (
                <div key={ao.id} style={{ background: addons[ao.id] ? "rgba(245,158,11,0.10)" : "rgba(255,255,255,0.04)", border: `1px solid ${addons[ao.id] ? "#f59e0b" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 26 }}>{ao.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{ao.name}</span>
                        <span style={{ fontSize: 10, background: "#f59e0b", color: "#000", borderRadius: 4, padding: "2px 7px", fontWeight: 800 }}>{ao.badge}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{ao.tagline}</div>
                      <div style={{ fontSize: 11, color: "rgba(245,158,11,0.7)" }}>{ao.partners}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>${ao.pricePerSeat}/seat/mo</div>
                      <button onClick={() => setAddons(a => ({ ...a, [ao.id]: !a[ao.id] }))} style={{ marginTop: 6, padding: "5px 14px", borderRadius: 6, border: `1px solid ${addons[ao.id] ? "#f59e0b" : "rgba(255,255,255,0.3)"}`, background: addons[ao.id] ? "#f59e0b" : "transparent", color: addons[ao.id] ? "#000" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {addons[ao.id] ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  </div>
                  {addons[ao.id] && ao.id === "dashcam" && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Number of cameras:</span>
                      <button onClick={() => setAddons(a => ({ ...a, dashcamSeats: Math.max(1, a.dashcamSeats - 1) }))} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer" }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{addons.dashcamSeats}</span>
                      <button onClick={() => setAddons(a => ({ ...a, dashcamSeats: a.dashcamSeats + 1 }))} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer" }}>+</button>
                      <span style={{ marginLeft: "auto", fontWeight: 800, color: "#f59e0b" }}>+${(addons.dashcamSeats * 12.99).toFixed(2)}/mo</span>
                    </div>
                  )}
                  {addons[ao.id] && ao.id === "voice" && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Choose your device:</div>
                      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                        {[{ id: "phone", label: "📱 Phone", desc: "App pre-loaded" }, { id: "tablet", label: "📟 Tablet", desc: "Larger in-cab screen" }].map(d => (
                          <button key={d.id} onClick={() => setAddons(a => ({ ...a, voiceDevice: d.id }))} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${addons.voiceDevice === d.id ? "#f59e0b" : "rgba(255,255,255,0.2)"}`, background: addons.voiceDevice === d.id ? "rgba(245,158,11,0.15)" : "transparent", color: addons.voiceDevice === d.id ? "#f59e0b" : "rgba(255,255,255,0.7)", cursor: "pointer", textAlign: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{d.label}</div>
                            <div style={{ fontSize: 11, opacity: 0.7 }}>{d.desc}</div>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Drivers:</span>
                        <button onClick={() => setAddons(a => ({ ...a, voiceSeats: Math.max(1, a.voiceSeats - 1) }))} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer" }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{addons.voiceSeats}</span>
                        <button onClick={() => setAddons(a => ({ ...a, voiceSeats: a.voiceSeats + 1 }))} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer" }}>+</button>
                        <span style={{ marginLeft: "auto", fontWeight: 800, color: "#f59e0b" }}>+${(addons.voiceSeats * 8.99).toFixed(2)}/mo</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              padding: "20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              marginBottom: "30px",
              borderLeft: `4px solid ${ORANGE}`
            }}>
              <div style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.7 }}>Plan Selected</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: ORANGE }}>
                {getPlanName()} — ${getPlanPrice().toFixed(2)}/mo
              </div>
              {addons.dashcam && (
                <div style={{ marginTop: 8, fontSize: 14, color: "#f59e0b" }}>
                  + AI Dashcam ({addons.dashcamSeats} camera{addons.dashcamSeats > 1 ? "s" : ""}) — +${(addons.dashcamSeats * 12.99).toFixed(2)}/mo
                </div>
              )}
              {addons.voice && (
                <div style={{ marginTop: 8, fontSize: 14, color: "#f59e0b" }}>
                  + Fleet Voice · {addons.voiceDevice === "phone" ? "📱 Phone" : "📟 Tablet"} · {addons.voiceSeats} driver{addons.voiceSeats > 1 ? "s" : ""} — +${(addons.voiceSeats * 8.99).toFixed(2)}/mo
                </div>
              )}
              {addonTotal > 0 && (
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                  Total: ${(getPlanPrice() + addonTotal).toFixed(2)}/mo
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px",
                  background: loading ? "rgba(255,107,53,0.5)" : ORANGE,
                  color: NAVY,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
