import React, { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const NAVY = "#001f3f";
const ORANGE = "#ff6b35";
const GREEN = "#4caf50";
const RED = "#dc2626";
const AMBER = "#ffc107";

export default function SupportAgentBilling() {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [newCase, setNewCase] = useState({
    fleet: "",
    email: "",
    issue: "",
    type: "subscription",
    description: ""
  });
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const issueTypes = [
    { id: "subscription", label: "Subscription Change / Upgrade" },
    { id: "billing-error", label: "Billing Error / Duplicate Charge" },
    { id: "refund", label: "Refund Request" },
    { id: "payment-failed", label: "Payment Failed" },
    { id: "invoice", label: "Invoice / Receipt Issue" },
    { id: "hardware", label: "Hardware Rental / Return" },
    { id: "trial", label: "Trial Extension" },
    { id: "discount", label: "Discount / Promotion Code" },
    { id: "downgrade", label: "Plan Downgrade" },
    { id: "cancel", label: "Cancellation" }
  ];

  const handleBillingIssue = async () => {
    if (!newCase.fleet || !newCase.email || !newCase.description) {
      setResponse("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const billingCase = await pb.collection("billing_cases").create({
        fleet_name: newCase.fleet,
        fleet_email: newCase.email,
        issue_type: newCase.type,
        description: newCase.description,
        status: "open",
        created_at: new Date().toISOString(),
        agent: "Billing Support",
        resolution: "",
        notes: ""
      });

      const resolution = generateBillingResolution(newCase);
      
      const updated = await pb.collection("billing_cases").update(billingCase.id, {
        resolution: resolution.action,
        notes: JSON.stringify(resolution.details)
      });

      setCases([...cases, updated]);
      setResponse(resolution.action);
      setActiveCase(updated.id);
      setNewCase({ fleet: "", email: "", issue: "", type: "subscription", description: "" });
    } catch (err) {
      setResponse("Error creating case. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBillingResolution = (billingCase) => {
    const resolutions = {
      subscription: {
        action: "📈 Subscription Upgrade/Change Approved\n\nProcess:\n1. Confirm new plan tier (Solo $29.99, Pro $39.99, Fleet $49.99+)\n2. Verify payment method on file is current\n3. Pro-rate current billing cycle\n4. Update billing effective immediately\n5. Send confirmation email with new invoice\n6. Fleet gets access to new features instantly",
        details: {
          timeline: "Immediate",
          proRating: "Yes - adjust for days remaining",
          invoice: "New invoice generated",
          features: "Activate within 60 seconds"
        }
      },
      "billing-error": {
        action: "🔍 Billing Error Investigation\n\nDiagnosis & Resolution:\n1. Retrieve subscription and recent charges\n2. Verify no duplicate transactions exist\n3. If duplicate found: Initiate refund immediately\n4. Check if payment processor issue (Stripe timeout)\n5. Contact processor if needed for reversal\n6. Provide itemized receipt showing all charges\n7. Credit account if billing error was our fault",
        details: {
          refund: "48 hours if approved",
          documentation: "Full audit trail provided",
          credits: "Applied to next billing cycle if requested",
          prevention: "Enable payment alerts"
        }
      },
      refund: {
        action: "💳 Refund Request Processing\n\nApproval Criteria:\n• Within 30 days of purchase: Full refund (minus $50 processing fee if mid-cycle)\n• 30-90 days: 50% refund\n• 90+ days: Service provided, no refund (upgrade/downgrade option offered)\n\nProcess:\n1. Verify purchase date and amount\n2. Check contract terms and cancellation clause\n3. Approve/deny and document reason\n4. Process refund to original payment method\n5. Confirm transaction within 24 hours\n6. Send refund receipt",
        details: {
          processing: "3-5 business days",
          method: "Original payment method",
          fee: "$50 mid-cycle cancellation fee may apply",
          alternative: "Plan downgrade offered as option"
        }
      },
      "payment-failed": {
        action: "❌ Payment Failed - Recovery Steps\n\nRoot Cause & Fix:\n1. Check card decline reason (insufficient funds, expired, fraud hold)\n2. Contact customer with decline code\n3. Request updated card information\n4. Retry payment immediately\n5. If retry fails: Escalate to fraud investigation\n6. Provide grace period (7 days) to update payment\n7. Suspend service if unpaid after grace period\n8. Send daily reminder emails during grace period",
        details: {
          graceperiod: "7 days to update payment",
          reminders: "Sent daily after day 3",
          suspension: "Service paused until payment resolves",
          manual: "Can process payment manually via admin"
        }
      },
      invoice: {
        action: "📄 Invoice / Receipt Issue Resolution\n\nCommon Issues & Fixes:\n• Missing invoice: Regenerate and email immediately\n• Wrong amount shown: Verify against subscription record and correction\n• Tax calculated wrong: Recalculate based on fleet location\n• Invoice for cancelled service: Explain billing to cancellation date\n• Need alternative format: Provide PDF, CSV, or custom report\n\nAction:\n1. Pull invoice from billing history\n2. Cross-check against subscription records\n3. Correct any discrepancies\n4. Email corrected invoice to fleet",
        details: {
          delivery: "Within 2 hours via email",
          formats: "PDF, CSV, or plain text available",
          taxation: "Calculated per fleet location",
          archival: "All invoices archived for 7 years"
        }
      },
      hardware: {
        action: "📱 Hardware Rental / Return Management\n\nRental Process:\n1. Confirm hardware included in Fleet plan (Rental vs. Owned)\n2. Track tablet & ELD serial numbers\n3. Shipping address confirmed\n4. Devices shipped within 24 hours\n5. Tracking number provided to fleet\n6. Delivery confirmation required\n\nReturn Process (if downgrading from Fleet to Pro):\n1. Schedule pickup with logistics partner\n2. Provide prepaid shipping label\n3. Confirm receipt and device condition\n4. Prorated refund if applicable\n5. Credit returned to subscription",
        details: {
          shipping: "24-hour fulfillment",
          tracking: "Real-time tracking provided",
          return: "Prepaid return shipping label",
          condition: "Devices inspected upon return",
          restocking: "Returned devices refurbished and redeployed"
        }
      },
      trial: {
        action: "⏱️ Trial Extension Request\n\nEligibility:\n• First-time users only\n• Extension granted once per account\n• Max 7 additional days (total 21 days free)\n\nProcess:\n1. Verify customer never paid (trial-only account)\n2. Check trial expiration date\n3. Extend billing date by 7 days\n4. Send confirmation to fleet\n5. Offer discount code for conversion (10% off first 3 months)",
        details: {
          eligible: "First-time trial users",
          extension: "+7 days maximum",
          offer: "10% discount for 3-month commitment",
          conversion: "Follow-up call on day 20 (before expiration)"
        }
      },
      discount: {
        action: "🎁 Promotion Code / Discount Processing\n\nDiscount Rules:\n• Volume discount: $50+ monthly → 5% off, $100+ monthly → 10% off\n• Loyalty discount: Renewed 3+ times → 10% off\n• Early-pay discount: Pay annually → 15% off\n• Referral credit: $200 credit per referred fleet\n• Partnership discount: Pre-approved partners → case-by-case\n\nProcess:\n1. Validate code is active and not expired\n2. Verify customer is eligible\n3. Apply discount to next billing cycle\n4. Send confirmation with new total\n5. Document discount reason in account notes",
        details: {
          volume: "5-10% based on MRR",
          loyalty: "10% for 3+ year customers",
          annual: "15% for year-upfront payment",
          referral: "$200 credit per new customer",
          combined: "Max discount 20% (cannot stack all)"
        }
      },
      downgrade: {
        action: "📉 Plan Downgrade Processing\n\nDowngrade Options:\n• Fleet → Pro: Lose multi-fleet admin, keep all features\n• Pro → Solo: Keep essentials, remove dispatch/fuel/factoring\n• Solo → Free: Limited to 1 driver, no support\n\nProcess:\n1. Confirm new plan tier and effective date\n2. Verify no conflicts (e.g., fleet with 5+ trucks can't use Solo)\n3. Pro-rate current cycle\n4. Remove features not in new tier\n5. Send confirmation with new billing\n6. Data preserved (no deletion)",
        details: {
          effective: "Immediate or next billing cycle (customer choice)",
          prorate: "Credit for remaining days if downgrading mid-cycle",
          data: "All historical data preserved",
          upgrade: "Can upgrade anytime"
        }
      },
      cancel: {
        action: "⚠️ Cancellation - Retention Attempt\n\nBefore cancelling, try:\n1. Ask reason for cancellation (feedback loop)\n2. Offer pause instead of cancel (freeze 30 days, resume later)\n3. Offer downgrade to lower-cost tier\n4. Present customer success report (ROI achieved)\n5. Offer special retention discount (15% off next 6 months)\n\nIf customer still wants to cancel:\n1. Verify effective date (end of cycle or immediate)\n2. Process refund per refund policy\n3. Remove access after final billing\n4. Preserve data (archived 6 months, then deleted)\n5. Send offboarding checklist\n6. Schedule exit interview in 30 days",
        details: {
          pause: "30-day free pause option",
          discount: "15% retention offer",
          refund: "Per refund policy based on days used",
          data: "Archived 6 months, then auto-deleted",
          feedback: "Exit survey to improve service"
        }
      }
    };

    return resolutions[billingCase.type] || resolutions.subscription;
  };

  const resolveCase = async (caseId) => {
    try {
      const updated = await pb.collection("billing_cases").update(caseId, {
        status: "resolved",
        resolved_at: new Date().toISOString()
      });
      setCases(cases.map(c => c.id === caseId ? updated : c));
      setActiveCase(null);
      setResponse("Case resolved and closed. Customer notified via email.");
    } catch (err) {
      console.error(err);
    }
  };

  const activeData = cases.find(c => c.id === activeCase);

  return (
    <div style={{ background: NAVY, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "10px" }}>
          💰 Billing & Account Support Agent
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "40px" }}>
          Manage subscriptions, process refunds, handle disputes. Every billing issue resolved with transparency.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* New Case Form */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>New Billing Case</h2>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Fleet Name</label>
              <input
                type="text"
                value={newCase.fleet}
                onChange={(e) => setNewCase({ ...newCase, fleet: e.target.value })}
                placeholder="e.g., Smith Fleet Corp"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Fleet Email</label>
              <input
                type="email"
                value={newCase.email}
                onChange={(e) => setNewCase({ ...newCase, email: e.target.value })}
                placeholder="billing@fleet.com"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Issue Type</label>
              <select
                value={newCase.type}
                onChange={(e) => setNewCase({ ...newCase, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              >
                {issueTypes.map(type => (
                  <option key={type.id} value={type.id} style={{ background: NAVY }}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>Details</label>
              <textarea
                value={newCase.description}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                placeholder="What is the customer asking for? Any special circumstances?"
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button
              onClick={handleBillingIssue}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "rgba(255,107,53,0.5)" : ORANGE,
                color: NAVY,
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Processing..." : "Process Case"}
            </button>
          </div>

          {/* Active Case & Resolution */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>Resolution & Action Items</h2>

            {activeData ? (
              <div>
                <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>{activeData.fleet_name}</h3>
                  <p style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>
                    {activeData.fleet_email} • {activeData.issue_type.replace(/-/g, " ").toUpperCase()}
                  </p>
                  <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: activeData.status === "resolved" ? GREEN : AMBER,
                    color: NAVY,
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {activeData.status === "resolved" ? "✓ Resolved" : "🔄 Open"}
                  </div>
                </div>

                {activeData.resolution && (
                  <div style={{ marginBottom: "25px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: ORANGE }}>📋 Resolution Plan</h4>
                    <p style={{ fontSize: "13px", opacity: 0.8, whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {activeData.resolution}
                    </p>
                  </div>
                )}

                {activeData.notes && (
                  <div style={{ marginBottom: "25px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: GREEN }}>📌 Details & Timeline</h4>
                    <div style={{ fontSize: "13px", opacity: 0.8, background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "6px" }}>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                        {JSON.stringify(JSON.parse(activeData.notes), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {activeData.status !== "resolved" && (
                  <button
                    onClick={() => resolveCase(activeData.id)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: GREEN,
                      color: NAVY,
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    ✓ Mark as Resolved
                  </button>
                )}
              </div>
            ) : (
              <p style={{ opacity: 0.6, textAlign: "center", paddingTop: "40px" }}>
                Create a new case to see resolution plan and action items here.
              </p>
            )}
          </div>
        </div>

        {/* Open Cases */}
        {cases.length > 0 && (
          <div style={{ marginTop: "40px", background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>Open & Recent Cases</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {cases.slice(-10).reverse().map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveCase(c.id)}
                  style={{
                    background: activeCase === c.id ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)",
                    border: activeCase === c.id ? `2px solid ${ORANGE}` : "1px solid rgba(255,255,255,0.1)",
                    padding: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>
                    {c.fleet_name}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
                    {c.issue_type.replace(/-/g, " ").charAt(0).toUpperCase() + c.issue_type.replace(/-/g, " ").slice(1)}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6 }}>
                    {c.status === "resolved" ? "✓ Resolved" : "🔄 Open"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
