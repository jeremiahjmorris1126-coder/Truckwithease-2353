import React, { useState } from "react";

const NAVY = "#001f3f";
const ORANGE = "#ff6b35";
const GREEN = "#4caf50";
const RED = "#dc2626";
const AMBER = "#ffc107";

export default function FinancialModelDashboard() {
  const [metrics, setMetrics] = useState({
    trialConversionRate: 80,
    averageCustomerLifetime: 18,
    hardwareCostPerUnit: 180,
    hardwareRentalMonthlyMargin: 12,
    monthlyTargetMRR: 80000,
    targetProfitMargin: 35
  });

  const [projection, setProjection] = useState(null);

  const calculateFinancials = () => {
    const { trialConversionRate, averageCustomerLifetime, hardwareCostPerUnit, hardwareRentalMonthlyMargin, monthlyTargetMRR, targetProfitMargin } = metrics;

    // Plan mix assumptions (% of customer base)
    const soloPercentage = 0.25; // 25% Solo
    const proPercentage = 0.50;  // 50% Pro
    const fleetRentalPercentage = 0.15; // 15% Fleet Rental
    const fleetOwnedPercentage = 0.10; // 10% Fleet Owned

    // Monthly pricing
    const soloPrice = 29.99;
    const proPrice = 39.99;
    const fleetRentalPrice = 49.99; // up to 10 trucks
    const fleetOwnedPrice = 59.99; // per seat, avg 5 trucks

    // Average fleet sizes
    const avgFleetSizeRental = 5; // 5 trucks per fleet rental
    const avgFleetSizeOwned = 5; // 5 trucks per fleet owned

    // Calculate customers needed to hit MRR target
    const soloMRRPerCustomer = soloPrice;
    const proMRRPerCustomer = proPrice;
    const fleetRentalMRRPerCustomer = fleetRentalPrice * avgFleetSizeRental;
    const fleetOwnedMRRPerCustomer = fleetOwnedPrice * avgFleetSizeOwned;

    const blendedARPU = (soloMRRPerCustomer * soloPercentage) +
                        (proMRRPerCustomer * proPercentage) +
                        (fleetRentalMRRPerCustomer * fleetRentalPercentage) +
                        (fleetOwnedMRRPerCustomer * fleetOwnedPercentage);

    const customersNeeded = Math.ceil(monthlyTargetMRR / blendedARPU);

    // Churn calculation (assumes linear across customer lifetime)
    const monthlyChurnRate = (1 / averageCustomerLifetime) * 100;

    // CAC (Customer Acquisition Cost) - typical SaaS is 1-3x monthly ARPU
    const cacMultiple = 2;
    const customerAcquisitionCost = blendedARPU * cacMultiple;

    // Operating costs (monthly, at target MRR)
    // Typical SaaS: 40% COGS, 25% Sales/Marketing, 15% R&D, 10% G&A
    const cogsCost = monthlyTargetMRR * 0.40; // Includes hardware, support, infrastructure
    const salesMarketingCost = monthlyTargetMRR * 0.25;
    const rdCost = monthlyTargetMRR * 0.15;
    const gaCost = monthlyTargetMRR * 0.10;
    const totalOperatingCosts = cogsCost + salesMarketingCost + rdCost + gaCost;

    // Hardware costs (hardware rental only)
    const hardwareUnitsNeeded = customersNeeded * fleetRentalPercentage * avgFleetSizeRental;
    const monthlyHardwareDepreciation = (hardwareUnitsNeeded * hardwareCostPerUnit) / 36; // 3-year depreciation
    const monthlyHardwareMargin = hardwareUnitsNeeded * hardwareRentalMonthlyMargin;
    const netHardwareProfit = monthlyHardwareMargin - monthlyHardwareDepreciation;

    // EBITDA and Profit
    const monthlyEBITDA = monthlyTargetMRR - totalOperatingCosts;
    const monthlyProfit = monthlyEBITDA + netHardwareProfit;
    const actualProfitMargin = (monthlyProfit / monthlyTargetMRR) * 100;

    // Payback period (months to recover CAC)
    const contributionPerCustomer = blendedARPU * ((100 - monthlyChurnRate) / 100); // account for churn
    const paybackMonths = Math.ceil(customerAcquisitionCost / contributionPerCustomer);

    // Annual projections
    const annualMRR = monthlyTargetMRR * 12;
    const annualProfit = monthlyProfit * 12;
    const annualTrialsNeeded = Math.ceil(customersNeeded / (trialConversionRate / 100));

    // Breakeven analysis
    const breakEvenMRR = totalOperatingCosts + monthlyHardwareDepreciation;
    const breakEvenCustomers = Math.ceil(breakEvenMRR / blendedARPU);

    setProjection({
      // Market & Customer Metrics
      customersNeeded,
      trialsNeeded: annualTrialsNeeded,
      conversionRate: trialConversionRate,
      churnRate: monthlyChurnRate.toFixed(2),
      paybackMonths,
      cacPerCustomer: customerAcquisitionCost.toFixed(2),
      blendedARPU: blendedARPU.toFixed(2),

      // Hardware Economics
      hardwareUnitsNeeded: Math.ceil(hardwareUnitsNeeded),
      monthlyHardwareMargin: monthlyHardwareMargin.toFixed(2),
      monthlyHardwareDepreciation: monthlyHardwareDepreciation.toFixed(2),
      netHardwareProfit: netHardwareProfit.toFixed(2),

      // Revenue & Costs
      monthlyTargetMRR: monthlyTargetMRR.toFixed(2),
      monthlyCOGS: cogsCost.toFixed(2),
      monthlySalesMarketing: salesMarketingCost.toFixed(2),
      monthlyRD: rdCost.toFixed(2),
      monthlyGA: gaCost.toFixed(2),
      totalOperatingCosts: totalOperatingCosts.toFixed(2),

      // Profitability
      monthlyEBITDA: monthlyEBITDA.toFixed(2),
      monthlyProfit: monthlyProfit.toFixed(2),
      actualProfitMargin: actualProfitMargin.toFixed(1),
      targetProfitMargin: targetProfitMargin,

      // Annual
      annualMRR: annualMRR.toFixed(2),
      annualProfit: annualProfit.toFixed(2),

      // Breakeven
      breakEvenMRR: breakEvenMRR.toFixed(2),
      breakEvenCustomers
    });
  };

  return (
    <div style={{ background: NAVY, color: "white", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "10px" }}>
          📊 Financial Model Dashboard
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "40px" }}>
          Real-time unit economics for TruckWithEase. Watch how each metric impacts profitability and breakeven.
        </p>

        {/* Input Controls */}
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "12px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "25px" }}>Model Inputs</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Trial Conversion Rate: {metrics.trialConversionRate}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={metrics.trialConversionRate}
                onChange={(e) => setMetrics({ ...metrics, trialConversionRate: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>How many trial users convert to paid</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Avg Customer Lifetime: {metrics.averageCustomerLifetime} months
              </label>
              <input
                type="range"
                min="6"
                max="48"
                value={metrics.averageCustomerLifetime}
                onChange={(e) => setMetrics({ ...metrics, averageCustomerLifetime: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>How long customers stay subscribed</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Hardware Cost per Unit: ${metrics.hardwareCostPerUnit}
              </label>
              <input
                type="range"
                min="100"
                max="400"
                value={metrics.hardwareCostPerUnit}
                onChange={(e) => setMetrics({ ...metrics, hardwareCostPerUnit: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>Tablet + ELD sourcing cost</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Hardware Rental Margin: ${metrics.hardwareRentalMonthlyMargin}/mo per unit
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={metrics.hardwareRentalMonthlyMargin}
                onChange={(e) => setMetrics({ ...metrics, hardwareRentalMonthlyMargin: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>Your profit per hardware rental monthly</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Target Monthly MRR: ${metrics.monthlyTargetMRR.toLocaleString()}
              </label>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={metrics.monthlyTargetMRR}
                onChange={(e) => setMetrics({ ...metrics, monthlyTargetMRR: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>Monthly recurring revenue goal</p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
                Target Profit Margin: {metrics.targetProfitMargin}%
              </label>
              <input
                type="range"
                min="15"
                max="60"
                value={metrics.targetProfitMargin}
                onChange={(e) => setMetrics({ ...metrics, targetProfitMargin: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "5px" }}>Your profitability goal</p>
            </div>
          </div>

          <button
            onClick={calculateFinancials}
            style={{
              width: "100%",
              padding: "14px",
              background: ORANGE,
              color: NAVY,
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "25px"
            }}
          >
            Calculate Projections
          </button>
        </div>

        {/* Results */}
        {projection && (
          <>
            {/* Key Metrics Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "40px"
            }}>
              <div style={{ background: "rgba(76,175,80,0.15)", border: "1px solid " + GREEN, padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Annual Profit</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: GREEN }}>
                  ${parseFloat(projection.annualProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div style={{ background: "rgba(255,107,53,0.15)", border: "1px solid " + ORANGE, padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Profit Margin</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: ORANGE }}>
                  {projection.actualProfitMargin}%
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>Target: {projection.targetProfitMargin}%</div>
              </div>

              <div style={{ background: "rgba(100,200,255,0.15)", border: "1px solid #64c8ff", padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Customers Needed</div>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                  {projection.customersNeeded.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>@{projection.blendedARPU}/mo avg</div>
              </div>

              <div style={{ background: "rgba(255,193,7,0.15)", border: "1px solid " + AMBER, padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Payback Period</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: AMBER }}>
                  {projection.paybackMonths} mo
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>CAC recovery time</div>
              </div>

              <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid " + RED, padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Monthly Churn</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: RED }}>
                  {projection.churnRate}%
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>Based on {metrics.averageCustomerLifetime}mo lifetime</div>
              </div>

              <div style={{ background: "rgba(76,175,80,0.15)", border: "1px solid " + GREEN, padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>Breakeven</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: GREEN }}>
                  ${parseFloat(projection.breakEvenMRR).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>{projection.breakEvenCustomers} customers</div>
              </div>
            </div>

            {/* Detailed P&L */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>Monthly P&L @ ${metrics.monthlyTargetMRR.toLocaleString()}/mo MRR</h3>
                
                <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                    <span>Subscription Revenue</span>
                    <span style={{ fontWeight: "bold", color: GREEN }}>+${projection.monthlyTargetMRR}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", opacity: 0.7 }}>
                    <span>Hardware Rental Margin</span>
                    <span>+${projection.monthlyHardwareMargin}</span>
                  </div>
                </div>

                <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "13px", opacity: 0.8 }}>Operating Costs</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span>COGS (40%)</span>
                    <span style={{ color: RED }}>-${projection.monthlyCOGS}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span>Sales & Marketing (25%)</span>
                    <span style={{ color: RED }}>-${projection.monthlySalesMarketing}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span>R&D (15%)</span>
                    <span style={{ color: RED }}>-${projection.monthlyRD}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span>G&A (10%)</span>
                    <span style={{ color: RED }}>-${projection.monthlyGA}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span>Hardware Depreciation</span>
                    <span style={{ color: RED }}>-${projection.monthlyHardwareDepreciation}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold" }}>
                  <span>Monthly Profit</span>
                  <span style={{ color: parseFloat(projection.monthlyProfit) > 0 ? GREEN : RED }}>
                    ${projection.monthlyProfit}
                  </span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>Customer Acquisition Economics</h3>
                
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "8px" }}>Blended ARPU (Avg Revenue Per User)</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: ORANGE }}>
                    ${projection.blendedARPU}/month
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "5px" }}>
                    25% Solo ($29.99) + 50% Pro ($39.99) + 15% Fleet Rental + 10% Fleet Owned
                  </div>
                </div>

                <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "8px" }}>Customer Acquisition Cost</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: AMBER }}>
                    ${projection.cacPerCustomer}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "5px" }}>
                    2x ARPU (typical SaaS CAC spend)
                  </div>
                </div>

                <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "8px" }}>Payback Period</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: GREEN }}>
                    {projection.paybackMonths} months
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "5px" }}>
                    Time to recover CAC from gross margin
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "8px" }}>Trials Needed (Annual)</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: GREEN }}>
                    {projection.trialsNeeded.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "5px" }}>
                    @ {projection.conversionRate}% conversion rate
                  </div>
                </div>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>What-If Sensitivity</h3>
              
              <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "20px" }}>
                <strong>If conversion goes up 10%:</strong> Need {Math.ceil(projection.trialsNeeded * 0.9).toLocaleString()} trials instead of {projection.trialsNeeded.toLocaleString()}
              </div>
              
              <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "20px" }}>
                <strong>If customer lifetime extends to 24 months:</strong> Monthly churn drops to {(1 / 24 * 100).toFixed(2)}% and profit margin improves by ~5% (less re-acquisition spend)
              </div>

              <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "20px" }}>
                <strong>If hardware cost drops to ${Math.max(100, metrics.hardwareCostPerUnit - 50)}:</strong> Hardware margin improves by ${((50 / 36) * (projection.customersNeeded * 0.15 * 5)).toFixed(0)}/month
              </div>

              <div style={{ fontSize: "13px", opacity: 0.8 }}>
                <strong>At ${(parseFloat(projection.breakEvenMRR)).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo MRR:</strong> Business breaks even. Every additional $1 of MRR flows 30-40% to profit above that.
              </div>
            </div>
          </>
        )}

        {!projection && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            padding: "60px 30px",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📊</div>
            <p style={{ fontSize: "16px", opacity: 0.8 }}>
              Adjust the inputs above and click "Calculate Projections" to see your financial model.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
