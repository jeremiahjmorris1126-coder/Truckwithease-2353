import React, { useState } from "react";
import { pricingPlans, featurePrices, compareRows } from "./PricingTiersConfig";

const NAVY = "#001f3f";
const ORANGE = "#ff6b35";
const AMBER = "#ffc107";
const GREEN = "#4caf50";

export default function PricingPage() {
  const [showFeatures, setShowFeatures] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  return (
    <div style={{ background: NAVY, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
          Simple, Flexible Pricing
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9 }}>
          Choose your plan and add features as you grow. No surprises, no hidden fees.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}
        >
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? ORANGE : "rgba(255,255,255,0.05)",
                border: plan.highlight ? `3px solid ${ORANGE}` : `1px solid rgba(255,255,255,0.1)`,
                borderRadius: "12px",
                padding: "40px 30px",
                position: "relative",
                transform: plan.highlight ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: GREEN,
                    color: NAVY,
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {plan.tag}
                </div>
              )}

              <h3 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
                {plan.name}
              </h3>
              <p style={{ opacity: 0.7, marginBottom: "30px" }}>{plan.description}</p>

              <div style={{ marginBottom: "30px" }}>
                <span style={{ fontSize: "48px", fontWeight: "bold" }}>{plan.price}</span>
                <span style={{ opacity: 0.7, marginLeft: "10px" }}>{plan.period}</span>
              </div>

              <button
                onClick={() => setSelectedTier(plan.id)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: plan.highlight ? NAVY : ORANGE,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "30px",
                  transition: "opacity 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.opacity = "0.8")}
                onMouseOut={(e) => (e.target.style.opacity = "1")}
              >
                {plan.cta}
              </button>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px", opacity: 0.8 }}>
                  ✓ Includes:
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {plan.included.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "14px",
                        marginBottom: "10px",
                        opacity: 0.8,
                      }}
                    >
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                {plan.addOns && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>{plan.addOns}</p>
                  </div>
                )}

                {plan.excluded && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p style={{ fontSize: "13px", opacity: 0.6 }}>⊗ Does not include: {plan.excluded}</p>
                  </div>
                )}

                {plan.hardwareNote && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p style={{ fontSize: "13px", opacity: 0.7, fontStyle: "italic" }}>
                      💡 {plan.hardwareNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Add-Ons for Solo */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "80px" }}>
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            padding: "16px 32px",
            background: ORANGE,
            color: NAVY,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "30px",
            transition: "opacity 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.opacity = "0.8")}
          onMouseOut={(e) => (e.target.style.opacity = "1")}
        >
          {showFeatures ? "Hide" : "Show"} à la carte Features for Solo Plan
        </button>

        {showFeatures && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: "12px",
              padding: "40px",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "30px" }}>
              Add Features to Your Solo Plan
            </h3>
            <p style={{ opacity: 0.8, marginBottom: "30px" }}>
              Start at $29.99/mo and add only what you need. Each feature is independent—no long-term commitment.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {featurePrices.map((feature) => (
                <div
                  key={feature.id}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    padding: "20px",
                    borderRadius: "8px",
                    border: `1px solid rgba(255,255,255,0.1)`,
                  }}
                >
                  <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                    {feature.name}
                  </h4>
                  <p style={{ fontSize: "20px", fontWeight: "bold", color: ORANGE }}>
                    {feature.price} / month
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "40px", padding: "20px", background: "rgba(76, 175, 80, 0.1)", borderRadius: "8px" }}>
              <p style={{ fontSize: "14px", opacity: 0.9 }}>
                💡 <strong>Pro Tip:</strong> Compare Solo + features to Pro ($39.99/mo) and see what saves you money. Most users find Pro includes everything they need.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "40px", textAlign: "center" }}>
          Side-by-Side Comparison
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${ORANGE}` }}>
                <th style={{ padding: "20px", textAlign: "left", fontWeight: "bold" }}>Feature</th>
                <th style={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>Solo</th>
                <th style={{ padding: "20px", textAlign: "center", fontWeight: "bold", background: ORANGE, color: NAVY }}>Pro</th>
                <th style={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>Fleet (Rental)</th>
                <th style={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>Fleet (Owned)</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: `1px solid rgba(255,255,255,0.1)`,
                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <td style={{ padding: "16px", fontWeight: row.feature.includes("Base") ? "bold" : "normal" }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", opacity: 0.8 }}>{row.solo}</td>
                  <td style={{ padding: "16px", textAlign: "center", background: "rgba(255, 107, 53, 0.1)" }}>
                    <strong>{row.pro}</strong>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", opacity: 0.8 }}>{row.fleetRental}</td>
                  <td style={{ padding: "16px", textAlign: "center", opacity: 0.8 }}>{row.fleetOwned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ maxWidth: "800px", margin: "80px auto 0" }}>
        <h3 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "40px", textAlign: "center" }}>
          Questions?
        </h3>
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>Can I switch plans anytime?</h4>
            <p style={{ opacity: 0.8 }}>Yes. Upgrade or downgrade monthly with no penalty. Billing adjusts on your next renewal.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>What if I add a feature then remove it?</h4>
            <p style={{ opacity: 0.8 }}>You're billed monthly. Remove features anytime; your next bill reflects the change.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>Can I upgrade my Fleet rental to owned hardware?</h4>
            <p style={{ opacity: 0.8 }}>Yes. Contact sales to discuss the hardware purchase price and how we handle the transition.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px" }}>
            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>What's included in dedicated support?</h4>
            <p style={{ opacity: 0.8 }}>
              Fleet plans come with a dedicated account manager, onboarding assistance, priority support, and quarterly business reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
