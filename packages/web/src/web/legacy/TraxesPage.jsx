import { useState, useEffect, useRef } from "react";

const DARK  = "#06090F";
const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";

function TaxClock() {
  const [count, setCount] = useState(3847);
  useEffect(() => {
    const iv = setInterval(() => setCount(c => c + Math.floor(Math.random() * 18 + 7)), 2800);
    return () => clearInterval(iv);
  }, []);
  return (
    <span style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "2rem" }}>
      ${count.toLocaleString()}
    </span>
  );
}

const INITIAL_MESSAGES = [
  {
    from: "traxes",
    text: "Good morning Ray 👋 I've been busy while you slept. Logged 487 miles yesterday across TX, OK, and AR — that's **$323.82** in deductible mileage at the 2026 IRS rate. Your Q3 running total is now **$28,441** in tracked deductions. What do you need?"
  },
  {
    from: "user",
    text: "What's my biggest tax risk right now?"
  },
  {
    from: "traxes",
    text: "Three things I'm watching:\n\n1) Your **per diem** hasn't been logged since July 9th — that's 9 days of **$69/day** you're leaving on the table (**$621 gone** if you don't capture it).\n\n2) You have **$340 in receipts** from June that aren't categorized — photograph and upload them before quarter-end.\n\n3) Your estimated Q3 payment is **$2,847 due October 15th** — I'll remind you at 30, 14, and 7 days out."
  }
];

const RESPONSES = {
  "deduction|miss|missing|find": `Here are **8 commonly missed trucking deductions** I track for you:\n\n1. **Per Diem Meals** — $69/day federal rate × days away from home. Average driver misses **$4,200/yr**.\n2. **Cell Phone (Business %)** — Typically 85–100% deductible if used for dispatch & navigation. Worth **$720–$1,440/yr**.\n3. **Truck Washes** — Every wash is deductible. At $35/wash × 2/wk = **$3,640/yr**.\n4. **Bedding & Linens (Sleeper)** — Pillows, sheets, blankets for your sleeper cab. **$300–$600/yr**.\n5. **Lumper Fees** — If you pay out-of-pocket, fully deductible. Save receipts religiously.\n6. **Satellite Radio (SiriusXM)** — 100% deductible for business use. **$214/yr**.\n7. **DOT Physical & Medical Card** — 100% deductible. **$150–$300**.\n8. **Association Dues (OOIDA, etc.)** — Fully deductible. **$45–$150/yr**.\n\nI'm already tracking #1, #2, #3, and #5 from your activity. Want me to flag #4, #6, #7, and #8 for you to confirm?`,

  "quarterly|q1|q2|q3|q4|estimated tax|estimate": `Your **2026 Estimated Tax Schedule**:\n\n| Quarter | Due Date | Amount | Status |\n|---------|----------|--------|---------|\n| Q1 | April 15 | $2,614 | ✅ Paid |\n| Q2 | June 16 | $2,731 | ✅ Paid |\n| Q3 | **Oct 15** | **$2,847** | ⚠️ 21 days |\n| Q4 | Jan 15, 2027 | ~$2,900 | Projected |\n\n**Total 2026 estimated:** ~$11,092\n\nYour Q3 figure of **$2,847** is based on your current annualized net income of **$89,400**. That covers both **self-employment tax (15.3%)** and **federal income tax**. I'll send you a reminder on September 24th, October 1st, and October 8th. Want me to help set aside that amount automatically from your next load payment?`,

  "mileage|miles|irs rate": `**2026 IRS Standard Mileage Rate: $0.67/mile**\n\nYour year-to-date breakdown:\n\n- **Total miles logged:** 142,880 mi\n- **Business miles:** 139,204 mi (97.4%)\n- **Total deduction:** $93,267\n\nHow Traxes tracks it: I pull GPS data from your ELD automatically and cross-reference with your load confirmations. Every mile is tagged by state (for IFTA), load, and date.\n\n**Pro tip:** The IRS requires a mileage log showing date, destination, business purpose, and miles. I'm generating this automatically — you'll have a court-ready log at tax time. The standard mileage method is likely better for you than actual expenses this year, saving you approximately **$4,200** vs. the actual-cost method based on your current fuel and maintenance spend.`,

  "per diem|meal|food": `**Trucker Per Diem — The Full Picture**\n\nThe **2026 federal per diem rate** for transportation workers is **$69/day**. Here's what that means for you:\n\n- You can deduct **80%** of per diem days (IRS limitation for transportation workers)\n- Effective deduction: **$55.20/day**\n- At 280 days away from home, that's **$15,456 in deductions**\n\n**Your current status:**\n- Logged through July 9th: 191 days = **$10,531**\n- Missing since July 9th: 9 days = **$497** (80% of $621)\n- Projected year-end total: ~**$15,456**\n\n**How to qualify:** You must be away from your tax home for a period longer than the hours in a single workday, requiring sleep or rest. As an OTR driver, nearly every night qualifies.\n\n**I log this automatically** based on your ELD departure/return data. Tap "Confirm Trips" to approve the 9 missing days in under 60 seconds.`,

  "schedule c|schedule|tax return|file": `**Your Schedule C — Auto-Prepared by Traxes**\n\nCurrent status: **94% complete** ✅\n\nHere's what I've already populated:\n\n✅ **Line 1 – Gross Income:** $89,400 (from load settlements)\n✅ **Line 9 – Car & Truck Expenses:** $93,267 (mileage method)\n✅ **Line 15 – Insurance:** $4,800 (commercial auto + cargo)\n✅ **Line 16 – Interest:** $2,140 (truck loan interest)\n✅ **Line 22 – Supplies:** $1,847\n✅ **Line 24b – Business Meals (Per Diem):** $10,531\n✅ **Line 27a – Other Expenses:** $3,240 (detailed in Part V)\n\n⚠️ **Still needed:**\n- Confirm 9 days of per diem (adds ~$497)\n- Categorize $340 in June receipts\n\n**Estimated net profit:** $34,780\n**Estimated SE tax:** $4,909\n**Estimated income tax:** $3,968\n**Total federal tax liability:** ~$8,877\n\nI'll generate a PDF-ready Schedule C the moment you clear those 2 items.`,

  "fuel|diesel|fuel cost": `**Your Fuel Deduction Breakdown — 2026 YTD**\n\n- **Total diesel purchased:** 32,440 gallons\n- **Average price paid:** $3.84/gal\n- **Total spent:** $124,570\n- **Fully deductible:** $124,570 ✅\n\nNote: Since you're using the **standard mileage method**, fuel is already included in your $0.67/mi rate. If you switched to actual expenses, fuel alone would be $124,570 — but you'd lose the simplicity of mileage method. Based on your numbers, **standard mileage saves you ~$4,200** this year.\n\n**Corridor Intelligence:**\n- Best fuel prices: I-40 East corridor avg **$3.61/gal**\n- Worst: I-95 North avg **$4.12/gal**\n- Estimated savings from my routing suggestions this year: **$847**\n\nAll fuel receipts are being matched to your load reports automatically. 3 receipts from June are still unmatched — tap to review.`,

  "maintenance|repair|truck repair": `**Maintenance & Repairs — What's Deductible**\n\nGood news: **100% of ordinary and necessary maintenance is deductible** when using the actual-expense method. Under standard mileage, it's included in your rate.\n\n**Your 2026 maintenance spend (tracked):**\n| Item | Amount | Status |\n|------|--------|--------|\n| Oil changes (6×) | $840 | ✅ Logged |\n| Tires (2 replaced) | $1,400 | ✅ Logged |\n| Brake service | $980 | ✅ Logged |\n| DOT inspection | $220 | ✅ Logged |\n| Misc. parts | $340 | ⚠️ Uncategorized |\n\n**Total tracked: $3,780**\n\n**Repair vs. Improvement Rule:** Repairs are expensed in the current year. Improvements that extend useful life must be depreciated. Your recent engine work at $980 qualifies as a repair (maintenance, not improvement), so it's fully deductible this year.\n\nI flag anything over $2,500 for review to ensure you're using the right treatment.`,

  "depreciation|section 179|bonus depreciation": `**Section 179 & Bonus Depreciation — Trucking's Best Tax Tool**\n\n**Section 179 (2026):**\n- Maximum deduction: **$1,220,000**\n- Your truck qualifies as 5-year MACRS property\n- If you bought or financed your truck this year, you can deduct the **full purchase price** in Year 1\n\n**Bonus Depreciation (2026):** 40% first-year bonus\n\n**Example for your rig:**\nTruck purchase: $185,000\n- Section 179 deduction: up to $185,000 (full amount)\n- Tax savings at 25% effective rate: **$46,250 saved**\n\n**Your current depreciation:**\n- 2024 truck ($165,000 basis): Year 2 of MACRS — $33,000 standard depreciation OR you elected Section 179 in Year 1.\n\n**Traxes tracks your depreciation schedule automatically.** I'll alert you if buying or trading your truck mid-year creates a depreciation recapture event — that's a tax surprise most drivers don't see coming. I make sure you do.`,

  "home|home office|domicile": `**Home Office for Truckers — The Real Rules**\n\nThis is one of the most misunderstood deductions in trucking. Here's the truth:\n\n**Qualifying criteria:**\n1. You must have a home where your truck returns regularly (your "tax home")\n2. The space must be used **exclusively and regularly** for business administration\n3. OTR drivers can qualify for a smaller deduction — your truck is your primary workplace\n\n**What you can deduct (if you qualify):**\n- Dedicated desk/office space: % of home sq footage × rent or mortgage interest\n- A 150 sq ft office in a 1,500 sq ft home = **10% of home expenses**\n- At $1,200/mo rent: **$1,440/yr deduction**\n\n**Your profile:** Based on your ELD data, you're on the road ~280 days/year. You likely qualify for a **partial home office deduction** for the days you're home doing dispatch, planning, and bookkeeping.\n\n**Traxes tracks your home-base days** automatically. Want me to calculate your exact home office deduction based on your address and ELD return data?`,

  "health|insurance|health insurance": `**Self-Employed Health Insurance Deduction — Massive Win**\n\nAs a self-employed trucker, you can deduct **100% of health, dental, and vision premiums** directly on your Form 1040 — **not** just Schedule C. This is one of the most valuable deductions available to you.\n\n**Key rules:**\n- You (and your family) must not be eligible for employer-sponsored coverage through a spouse\n- Includes premiums for health, dental, vision, and qualifying long-term care\n- Deducted above-the-line — reduces your AGI, which can reduce other tax liabilities too\n\n**Real numbers:**\nIf you're paying **$650/mo** in premiums = **$7,800/yr** fully deductible\nAt your ~25% effective tax rate, that's **$1,950 in tax savings**\n\n**I'm not currently tracking your health insurance premiums.** If you upload your insurance statements, I'll add this deduction immediately. This is likely worth **$1,500–$2,500** for you specifically.\n\nWant me to add a reminder to grab those statements from your insurance portal?`,

  "profit|load profit|best load|best pay": `**Your Load Profitability Analysis — 2026 YTD**\n\n| Load Corridor | Loads | Avg Rate/Mile | Avg Revenue | Fuel Cost | Net/Mile |\n|---------------|-------|---------------|-------------|-----------|----------|\n| TX→IL | 14 | $2.84 | $2,840 | $312 | $2.53 |\n| CA→TX | 9 | $3.12 | $3,744 | $441 | $2.68 |\n| FL→NY | 7 | $3.41 | $4,092 | $398 | $3.05 |\n| Regional TX | 22 | $2.21 | $1,105 | $89 | $2.15 |\n\n**Best load type for you: FL→NY corridor** at **$3.05 net/mile**\n\n**Insights:**\n- Regional Texas loads are dragging your average down by **$0.38/mile**\n- Replacing 10 regional loads with long-haul would add **~$3,800/year in net income**\n- Your best single load this year: 1,240 miles at $3.89/mi = **$4,824 gross**\n\nWant me to generate a full load profitability report you can use when negotiating rates with brokers?`,

  "ifta|fuel tax|state tax": `**IFTA — International Fuel Tax Agreement**\n\nIFTA simplifies fuel tax reporting across 48 states. Here's your current status:\n\n**Q3 2026 (Jul 1 – Sep 30):**\n- States traveled: TX, OK, AR, TN, MO, IL, KY\n- Miles per state tracked: ✅ Auto-logged via ELD\n- Fuel purchased per state: ✅ Matched to receipts\n\n**Q3 Filing due: October 31, 2026**\n\n**Your Q2 IFTA result:** Net **refund of $127** (you over-purchased fuel in TX, a low-tax state, and under-purchased in IL, a high-tax state — Traxes optimized this for Q3)\n\n**States with highest fuel taxes (watch list):**\n- Pennsylvania: 77.7¢/gal\n- California: 68.1¢/gal\n- Illinois: 67.1¢/gal\n\n**I'm building your Q3 IFTA report automatically.** By October 15th, it will be ready to submit — you'll just review and sign. No spreadsheets, no manual state lookups. Want a preview of the Q3 draft now?`,

  "factoring|factor|cash flow": `**Factoring vs. Waiting — Your Cash Flow Picture**\n\n**Current outstanding receivables:**\n| Broker | Amount | Terms | Due Date | Action |\n|--------|--------|-------|----------|--------|\n| Apex Logistics | $3,200 | Net-30 | Jul 28 | — |\n| Bluegrass Freight | $2,100 | Net-45 | Aug 2 | — |\n| SunBelt Carriers | $1,840 | Net-21 | Jul 22 | ✅ Soon |\n\n**Total outstanding: $7,140**\n\n**Factoring option:**\nIf you factored these invoices today at a **3% fee**, you'd receive **$6,926** within 24 hours instead of waiting up to 45 days.\nFactoring cost: **$214** — deductible as a business expense.\n\n**My recommendation:** At your current cash position, you don't need to factor. SunBelt pays Jul 22, covering your Oct 15 estimated tax payment without a cash crunch. **Hold off on factoring this cycle.**\n\nI monitor your cash flow daily and will alert you if factoring becomes the better move. I'll also flag any broker with a pattern of late payments.`,

  "income|revenue|gross|how much": `**Your 2026 Income Summary — YTD**\n\n| Month | Gross Revenue | Expenses | Net Income |\n|-------|--------------|----------|------------|\n| January | $8,240 | $5,820 | $2,420 |\n| February | $7,890 | $5,410 | $2,480 |\n| March | $9,140 | $6,110 | $3,030 |\n| April | $8,670 | $5,740 | $2,930 |\n| May | $9,820 | $6,380 | $3,440 |\n| June | $10,140 | $6,710 | $3,430 |\n| July (MTD) | $6,200 | $4,120 | $2,080 |\n\n**YTD Gross: $60,100**\n**YTD Expenses (deductible): $40,290**\n**YTD Net Income: $19,810**\n**Annualized projection: $89,400**\n\n**Top revenue source:** Long-haul loads (62% of total)\n**Biggest expense category:** Mileage/fuel equivalent ($28,441)\n\nYou're tracking **11% ahead of last year** at this point. Projected year-end net: **$34,780** — putting you in the 22% federal bracket. I'm actively working to push your taxable income below the $32,000 threshold through legal deductions. Want to see the specific moves?`,

  "save|saving|how to save": `**Your Personalized Tax Savings Plan — Top 5 Moves Right Now**\n\n**1. Capture 9 missing per diem days** — $497 in deductions, ~$124 in tax saved. Takes 60 seconds to confirm in Traxes.\n\n**2. Categorize $340 in June receipts** — Full deduction value at stake. Upload photos now before quarter-end.\n\n**3. Add health insurance premiums** — Likely $1,500–$2,500 in additional deductions. Pull your insurance statements.\n\n**4. Review truck depreciation strategy** — If you're planning a truck upgrade in 2026, timing it before Dec 31 triggers **Section 179** and could save you **$10,000–$46,000** in taxes this year.\n\n**5. Open a Solo 401(k) by Dec 31** — As a self-employed trucker, you can contribute up to **$23,500** (under 50) or **$31,000** (50+) to a Solo 401(k). At your income level, this alone could save you **$5,170–$6,820** in taxes.\n\n**Total potential additional savings: $7,291–$49,441** depending on which moves you make.\n\nI've ranked these by impact and ease. Want to start with #1 right now — takes 60 seconds?`
};

function getTraxesResponse(input) {
  const lower = input.toLowerCase();
  for (const [pattern, response] of Object.entries(RESPONSES)) {
    if (new RegExp(pattern).test(lower)) return response;
  }
  return `I can help with that. Let me pull your specific numbers...\n\nBased on your YTD activity, here's what I'm seeing that's relevant to your question:\n\n- **Gross revenue YTD:** $60,100\n- **Tracked deductions:** $28,441\n- **Q3 estimated payment due:** $2,847 (Oct 15)\n- **Schedule C status:** 94% complete\n\nTo give you the most accurate answer, I need a bit more detail. Are you asking about a specific load, a deduction category, your quarterly taxes, or your overall financial position? The more specific you are, the more precise I can be — I have full access to your books.`;
}

function renderMessageText(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j} style={{ color: AMBER }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

function ChatBubble({ msg }) {
  const isUser = msg.from === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "1rem"
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${NAVY}, ${AMBER})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700, color: DARK, flexShrink: 0, marginRight: 10, marginTop: 4
        }}>T</div>
      )}
      <div style={{
        maxWidth: "78%",
        background: isUser ? `linear-gradient(135deg, ${NAVY}, ${NAVY2})` : "rgba(255,255,255,0.05)",
        border: isUser ? "none" : `1px solid rgba(255,180,0,0.18)`,
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        padding: "0.75rem 1rem",
        color: "#E8ECF4",
        fontSize: "0.92rem",
        lineHeight: 1.6,
        fontFamily: "'Poppins', sans-serif"
      }}>
        {!isUser && (
          <div style={{ color: AMBER, fontWeight: 700, fontSize: "0.78rem", marginBottom: "0.3rem", letterSpacing: "0.05em" }}>
            TRAXES AI
          </div>
        )}
        {renderMessageText(msg.text)}
      </div>
      {isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${ORANGE}, ${AMBER})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700, color: DARK, flexShrink: 0, marginLeft: 10, marginTop: 4
        }}>R</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${NAVY}, ${AMBER})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.8rem", fontWeight: 700, color: DARK, flexShrink: 0
      }}>T</div>
      <div style={{
        background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,180,0,0.18)`,
        borderRadius: "4px 18px 18px 18px", padding: "0.75rem 1.2rem",
        display: "flex", gap: 5, alignItems: "center"
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: AMBER,
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  );
}

function DeductionsDashboard() {
  const deductions = [
    { icon: "🛣️", name: "Mileage", amount: "$93,267", status: "on", note: "139,204 mi × $0.67 — auto-logged" },
    { icon: "⛽", name: "Fuel", amount: "$124,570", status: "on", note: "Included in mileage rate (standard method)" },
    { icon: "🍽️", name: "Meals / Per Diem", amount: "$10,531", status: "warn", note: "9 days missing since July 9 — $497 at risk" },
    { icon: "🔧", name: "Maintenance & Repairs", amount: "$3,780", status: "on", note: "$340 in parts still uncategorized" },
    { icon: "🛡️", name: "Insurance", amount: "$4,800", status: "on", note: "Commercial auto + cargo — confirmed" },
    { icon: "📱", name: "Phone / Software", amount: "$1,440", status: "on", note: "85% business use, auto-calculated" },
    { icon: "🚧", name: "Tolls & Parking", amount: "$847", status: "on", note: "EZ-Tag data synced" },
    { icon: "🏠", name: "Home Office", amount: "$0", status: "action", note: "Needs confirmation — potentially $1,440" },
    { icon: "💊", name: "Health Insurance", amount: "$0", status: "action", note: "Upload statements — likely $7,800 deduction" },
    { icon: "📉", name: "Depreciation", amount: "$18,333", status: "on", note: "Year 2 MACRS on 2024 truck" },
    { icon: "📊", name: "IFTA Payments", amount: "$2,140", status: "on", note: "Q1 + Q2 filed, Q3 in progress" },
    { icon: "🚀", name: "Startup Costs", amount: "$0", status: "on", note: "Not applicable — business active 4+ yrs" }
  ];

  const statusConfig = {
    on:     { label: "✓ On Track",       bg: "rgba(22,163,74,0.2)",   color: GREEN },
    warn:   { label: "⚠️ Missing",        bg: "rgba(255,180,0,0.15)",  color: AMBER },
    action: { label: "🔴 Action Required", bg: "rgba(220,38,38,0.15)", color: RED }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
      {deductions.map((d, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "0.9rem 1rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.2rem" }}>{d.icon}</span>
              <span style={{ color: "#C8D0E0", fontWeight: 600, fontSize: "0.9rem" }}>{d.name}</span>
            </div>
            <span style={{
              background: statusConfig[d.status].bg, color: statusConfig[d.status].color,
              borderRadius: 8, padding: "0.15rem 0.5rem", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap"
            }}>{statusConfig[d.status].label}</span>
          </div>
          <div style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.25rem" }}>
            {d.amount}
          </div>
          <div style={{ color: "#7A8BA8", fontSize: "0.78rem" }}>{d.note}</div>
        </div>
      ))}
    </div>
  );
}

function IncomeTab() {
  const months = [
    { m: "Jan", rev: 8240,  exp: 5820, tax: 824 },
    { m: "Feb", rev: 7890,  exp: 5410, tax: 789 },
    { m: "Mar", rev: 9140,  exp: 6110, tax: 914 },
    { m: "Apr", rev: 8670,  exp: 5740, tax: 867 },
    { m: "May", rev: 9820,  exp: 6380, tax: 982 },
    { m: "Jun", rev: 10140, exp: 6710, tax: 1014 },
    { m: "Jul", rev: 6200,  exp: 4120, tax: 620 }
  ];
  const totalRev  = months.reduce((a,b) => a+b.rev, 0);
  const totalExp  = months.reduce((a,b) => a+b.exp, 0);
  const totalTax  = months.reduce((a,b) => a+b.tax, 0);
  const totalNet  = totalRev - totalExp - totalTax;

  const maxRev = Math.max(...months.map(m => m.rev));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Gross Revenue", val: `$${totalRev.toLocaleString()}`, c: "#E8ECF4" },
          { label: "Total Expenses", val: `$${totalExp.toLocaleString()}`, c: RED },
          { label: "Tax Set-Aside", val: `$${totalTax.toLocaleString()}`, c: AMBER },
          { label: "Net Income", val: `$${totalNet.toLocaleString()}`, c: GREEN }
        ].map((s,i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "1rem",
            border: "1px solid rgba(255,255,255,0.07)", textAlign: "center"
          }}>
            <div style={{ color: "#6B7A99", fontSize: "0.75rem", marginBottom: "0.35rem" }}>{s.label}</div>
            <div style={{ color: s.c, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.15rem" }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr>
              {["Month","Gross Revenue","Bar","Expenses","Tax Set-Aside","Net"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", color: "#6B7A99", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600, fontSize: "0.78rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((row,i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.6rem 0.75rem", color: "#C8D0E0", fontWeight: 600 }}>{row.m}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: GREEN, fontFamily: "'DM Mono', monospace" }}>${row.rev.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 0.75rem", minWidth: 100 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(row.rev/maxRev)*100}%`, background: `linear-gradient(90deg, ${NAVY}, ${AMBER})`, borderRadius: 4 }} />
                  </div>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#E05555", fontFamily: "'DM Mono', monospace" }}>${row.exp.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: AMBER, fontFamily: "'DM Mono', monospace" }}>${row.tax.toLocaleString()}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#E8ECF4", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>${(row.rev-row.exp-row.tax).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaxReadinessTab() {
  const docs = [
    { name: "Mileage Log", status: "complete", note: "139,204 mi fully logged via ELD" },
    { name: "1099-NEC Forms", status: "complete", note: "4 received from brokers — all matched" },
    { name: "Fuel Receipts", status: "partial", note: "3 receipts from June still unmatched" },
    { name: "Maintenance Records", status: "complete", note: "All receipts photographed and filed" },
    { name: "Insurance Statements", status: "complete", note: "Annual declarations on file" },
    { name: "Per Diem Log", status: "partial", note: "9 days from July not yet confirmed" },
    { name: "IFTA Filings (Q1+Q2)", status: "complete", note: "Filed and confirmed" },
    { name: "Health Insurance", status: "missing", note: "No premium statements uploaded" },
    { name: "W-9 on File (All Brokers)", status: "complete", note: "7 brokers confirmed" },
    { name: "Estimated Tax Payments", status: "complete", note: "Q1 and Q2 paid — receipts saved" }
  ];

  const statusConfig = {
    complete: { label: "✓ Complete", bg: "rgba(22,163,74,0.2)",   color: GREEN },
    partial:  { label: "⚠️ Partial",  bg: "rgba(255,180,0,0.15)",  color: AMBER },
    missing:  { label: "❌ Missing",  bg: "rgba(220,38,38,0.15)", color: RED }
  };

  const score = 94;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,180,0,0.2)",
          borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180
        }}>
          <div style={{ position: "relative", width: 110, height: 110 }}>
            <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle cx="55" cy="55" r="45" fill="none" stroke={AMBER} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}>
              <div style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.5rem" }}>{score}</div>
              <div style={{ color: "#6B7A99", fontSize: "0.65rem" }}>/ 100</div>
            </div>
          </div>
          <div style={{ color: "#C8D0E0", fontWeight: 700, marginTop: "0.75rem", fontSize: "0.9rem" }}>Tax Readiness</div>
          <div style={{ color: GREEN, fontSize: "0.78rem", marginTop: "0.25rem" }}>Excellent</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ color: "#C8D0E0", fontSize: "0.9rem", marginBottom: "0.25rem", fontWeight: 600 }}>Schedule C Progress</div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "94%", background: `linear-gradient(90deg, ${NAVY}, ${AMBER})`, borderRadius: 5 }} />
          </div>
          <div style={{ color: "#6B7A99", fontSize: "0.8rem" }}>94% — 2 items remaining before final generation</div>
          <div style={{ marginTop: "0.5rem" }}>
            <button style={{
              background: `linear-gradient(135deg, ${NAVY}, ${AMBER})`, color: DARK,
              border: "none", borderRadius: 10, padding: "0.65rem 1.4rem",
              fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Poppins', sans-serif"
            }}>
              📥 Download Tax Package
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.65rem" }}>
        {docs.map((d, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "0.65rem 0.9rem"
          }}>
            <div>
              <div style={{ color: "#C8D0E0", fontSize: "0.88rem", fontWeight: 600 }}>{d.name}</div>
              <div style={{ color: "#6B7A99", fontSize: "0.75rem", marginTop: "0.1rem" }}>{d.note}</div>
            </div>
            <span style={{
              background: statusConfig[d.status].bg, color: statusConfig[d.status].color,
              borderRadius: 8, padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8
            }}>{statusConfig[d.status].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TraxesPage() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [weeklyDeductions, setWeeklyDeductions] = useState(1247);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setWeeklyDeductions(d => d + Math.floor(Math.random() * 12 + 3)), 4200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const sendMessage = (text) => {
    const msg = text || userInput.trim();
    if (!msg) return;
    setUserInput("");
    setChatHistory(prev => [...prev, { from: "user", text: msg }]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getTraxesResponse(msg);
      setChatHistory(prev => [...prev, { from: "traxes", text: response }]);
      setIsTyping(false);
    }, 1400 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickPrompts = [
    "What am I missing?",
    "My quarterly payment?",
    "Best deductions for me",
    "Is my Schedule C ready?",
    "Analyze this week",
    "Compare my loads"
  ];

  const intelligenceCards = [
    { icon: "🛣️", title: "Mileage Sentinel", desc: "Monitoring all 48 states. IRS rate locked at $0.67/mi. Auto-categorizing by state for IFTA.", stat: "142,880 mi logged", statLabel: "YTD" },
    { icon: "⛽", title: "Fuel Intelligence", desc: "Comparing your $/gal against national averages. Best corridor: I-40 East.", stat: "$847 saved", statLabel: "vs. avg driver" },
    { icon: "📅", title: "Tax Calendar", desc: "Next: Q3 estimated Oct 15 · IFTA Q3 due Oct 31 · Schedule C due April 15", stat: "21 days", statLabel: "to Q3 deadline" },
    { icon: "🔍", title: "Receipt Scanner", desc: "23 receipts processed this week. 3 unmatched items flagged for your review.", stat: "23 processed", statLabel: "this week" },
    { icon: "💡", title: "Deduction Engine", desc: "Found 4 new deductions this month most drivers miss. Average driver leaves $4,200/yr unclaimed.", stat: "$4,200/yr", statLabel: "avg unclaimed" },
    { icon: "🏦", title: "Cash Flow Radar", desc: "Net-30 from Apex Logistics due Jul 28. Net-45 from Bluegrass due Aug 2. Factoring available.", stat: "$7,140", statLabel: "outstanding" }
  ];

  const comparisonRows = [
    ["Real-time tracking",  "✓ Automatic",   "Manual daily",      "Monthly review"],
    ["Cost",                "Included",      "Free",              "$1,200–3,000/yr"],
    ["Missed deductions",   "0",             "$4,200+ avg",       "$2,100+ avg"],
    ["IFTA auto-calc",      "✓",             "Manual",            "Extra fee"],
    ["Schedule C",          "Auto-ready",    "Manual",            "You bring docs"],
    ["Response time",       "Instant",       "You",               "2–5 business days"]
  ];

  const tabs = ["Income & Expenses", "Deduction Tracker", "Tax Readiness"];

  return (
    <div style={{
      minHeight: "100vh",
      background: DARK,
      fontFamily: "'Poppins', sans-serif",
      color: "#E8ECF4"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
        ::-webkit-scrollbar-thumb { background: rgba(255,180,0,0.3); border-radius: 3px; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-8px); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .chat-bubble { animation: fadeIn 0.35s ease both; }
        .traxes-btn:hover { opacity: 0.88; transform: translateY(-1px); transition: all 0.2s; }
        .intel-card:hover { border-color: rgba(255,180,0,0.4) !important; transform: translateY(-2px); transition: all 0.2s; }
        .quick-chip:hover { background: rgba(255,180,0,0.2) !important; border-color: ${AMBER} !important; cursor: pointer; }
      `}</style>

      {/* STICKY NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,9,15,0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(255,180,0,0.15)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.5rem"
      }}>
        <a href="/" style={{
          display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
          color: "#E8ECF4", fontSize: "0.88rem", fontWeight: 600
        }}>
          <span style={{ color: AMBER }}>←</span>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 24, height: 24, borderRadius: 4 }} />
          <span style={{ color: AMBER, fontWeight: 700 }}>💎 Traxes</span>
        </a>
        <a href="/signup" style={{
          background: `linear-gradient(135deg, ${NAVY}, ${AMBER})`,
          color: DARK, textDecoration: "none", borderRadius: 8,
          padding: "0.45rem 1.1rem", fontWeight: 700, fontSize: "0.85rem"
        }}>Free Trial</a>
      </nav>

      {/* HERO / COMMAND CENTER */}
      <section style={{
        background: `
          linear-gradient(135deg, ${DARK} 0%, ${NAVY2} 60%, ${DARK} 100%),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)
        `,
        padding: "3rem 1.5rem 2.5rem",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 40% at 30% 50%, rgba(11,42,107,0.5), transparent)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ color: AMBER, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              AI Financial Co-Pilot for Truckers
            </div>
            <h1 style={{
              fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 900, lineHeight: 1,
              background: `linear-gradient(135deg, #E8ECF4 0%, ${AMBER} 60%, ${ORANGE} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: "1.25rem"
            }}>Traxes</h1>
            <div style={{ marginBottom: "1rem" }}>
              <TaxClock />
              <p style={{ color: "#7A8BA8", fontSize: "0.82rem", marginTop: "0.35rem", lineHeight: 1.5 }}>
                In additional deductions found for drivers like you — this year
              </p>
            </div>
            <p style={{ color: "#9BAEC8", fontSize: "1rem", lineHeight: 1.7, maxWidth: 420 }}>
              A master CPA, financial advisor, and tax attorney — combined into one AI that never sleeps, never misses a deduction, and knows your numbers better than you do.
            </p>
          </div>

          {/* LIVE TERMINAL CARD */}
          <div style={{
            background: "rgba(8,30,77,0.7)", border: `1px solid rgba(255,180,0,0.25)`,
            borderRadius: 16, padding: "1.5rem", backdropFilter: "blur(8px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", fontWeight: 700 }}>LIVE — RAY'S DASHBOARD</span>
            </div>

            {[
              {
                label: "Miles logged today",
                value: "487 mi",
                color: GREEN,
                extra: <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: "pulse 2s ease-in-out infinite" }} /><span style={{ color: GREEN, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1rem" }}>487 mi</span></div>
              }
            ].map(() => null)}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#7A8BA8", fontSize: "0.82rem" }}>Miles logged today</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: "pulse 2s ease-in-out infinite" }} />
                  <span style={{ color: GREEN, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>487 mi</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#7A8BA8", fontSize: "0.82rem" }}>Running deductions this week</span>
                <span style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>${weeklyDeductions.toLocaleString()}</span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#7A8BA8", fontSize: "0.82rem" }}>Q3 tax set-aside progress</span>
                  <span style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontSize: "0.82rem" }}>67%</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "67%", background: `linear-gradient(90deg, ${NAVY}, ${AMBER})`, borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#7A8BA8", fontSize: "0.82rem" }}>Next quarterly payment</span>
                <span style={{
                  background: "rgba(255,180,0,0.15)", color: AMBER, borderRadius: 8,
                  padding: "0.15rem 0.6rem", fontWeight: 700, fontSize: "0.8rem"
                }}>Oct 15 · 21 days</span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#7A8BA8", fontSize: "0.82rem" }}>Schedule C status</span>
                  <span style={{ color: GREEN, fontFamily: "'DM Mono', monospace", fontSize: "0.82rem" }}>94%</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "94%", background: `linear-gradient(90deg, ${GREEN}, #34D399)`, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAT SECTION */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
            Talk to <span style={{ color: AMBER }}>Traxes</span>
          </h2>
          <p style={{ color: "#7A8BA8", fontSize: "0.92rem" }}>
            Ask anything about your taxes, deductions, or finances. Traxes knows your books inside out.
          </p>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${NAVY2}, rgba(8,30,77,0.5))`,
          border: `1px solid rgba(255,180,0,0.2)`,
          borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
        }}>
          {/* Chat header */}
          <div style={{
            background: "rgba(8,30,77,0.8)", borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${NAVY}, ${AMBER})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: DARK
            }}>T</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Traxes</div>
              <div style={{ color: GREEN, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, animation: "pulse 2s ease-in-out infinite" }} />
                Online · Monitoring your finances 24/7
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} style={{
            height: 420, overflowY: "auto", padding: "1.25rem",
            display: "flex", flexDirection: "column"
          }}>
            {chatHistory.map((msg, i) => (
              <div key={i} className="chat-bubble"><ChatBubble msg={msg} /></div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Quick chips */}
          <div style={{
            padding: "0.75rem 1.25rem 0",
            display: "flex", flexWrap: "wrap", gap: "0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.05)"
          }}>
            {quickPrompts.map((prompt, i) => (
              <button key={i} className="quick-chip" onClick={() => sendMessage(prompt)} style={{
                background: "rgba(255,180,0,0.08)", border: `1px solid rgba(255,180,0,0.25)`,
                color: AMBER, borderRadius: 20, padding: "0.35rem 0.85rem",
                fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif",
                transition: "all 0.2s"
              }}>{prompt}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", gap: 10 }}>
            <input
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about deductions, quarterly taxes, Schedule C, IFTA..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, padding: "0.75rem 1rem", color: "#E8ECF4",
                fontSize: "0.9rem", outline: "none", fontFamily: "'Poppins', sans-serif"
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isTyping}
              className="traxes-btn"
              style={{
                background: isTyping ? "rgba(255,180,0,0.3)" : `linear-gradient(135deg, ${NAVY}, ${AMBER})`,
                border: "none", borderRadius: 12, padding: "0.75rem 1.25rem",
                color: DARK, fontWeight: 700, fontSize: "0.9rem", cursor: isTyping ? "not-allowed" : "pointer",
                fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap"
              }}
            >
              {isTyping ? "..." : "Ask ➜"}
            </button>
          </div>
        </div>
      </section>

      {/* FINANCIAL DASHBOARD */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 2.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
          Financial <span style={{ color: AMBER }}>Dashboard</span>
        </h2>
        <p style={{ color: "#7A8BA8", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          Your complete financial picture — always up to date.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              background: activeTab === i ? `linear-gradient(135deg, ${NAVY}, ${AMBER})` : "rgba(255,255,255,0.05)",
              border: activeTab === i ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: activeTab === i ? DARK : "#9BAEC8",
              borderRadius: 10, padding: "0.55rem 1.2rem",
              fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", transition: "all 0.2s"
            }}>{tab}</button>
          ))}
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: "1.5rem"
        }}>
          {activeTab === 0 && <IncomeTab />}
          {activeTab === 1 && <DeductionsDashboard />}
          {activeTab === 2 && <TaxReadinessTab />}
        </div>
      </section>

      {/* TRAXES INTELLIGENCE */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 2.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, marginBottom: "0.35rem" }}>
          What Traxes <span style={{ color: AMBER }}>Watches</span>
        </h2>
        <p style={{ color: "#7A8BA8", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          Six always-on financial systems running in the background — so you don't have to.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {intelligenceCards.map((card, i) => (
            <div key={i} className="intel-card" style={{
              background: `linear-gradient(135deg, rgba(8,30,77,0.6), rgba(6,9,15,0.8))`,
              border: "1px solid rgba(255,180,0,0.15)", borderRadius: 16, padding: "1.25rem",
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>{card.icon}</div>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{card.title}</div>
              <div style={{ color: "#7A8BA8", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "0.9rem" }}>{card.desc}</div>
              <div style={{
                background: "rgba(255,180,0,0.08)", borderRadius: 10, padding: "0.6rem 0.8rem",
                display: "flex", alignItems: "baseline", gap: 6
              }}>
                <span style={{ color: AMBER, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.1rem" }}>{card.stat}</span>
                <span style={{ color: "#5A6A88", fontSize: "0.75rem" }}>{card.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 2.5rem" }}>
        <div style={{
          background: `linear-gradient(135deg, ${NAVY2}, rgba(6,9,15,0.9))`,
          border: `1px solid rgba(255,180,0,0.2)`, borderRadius: 20, padding: "2rem", overflow: "hidden"
        }}>
          <h2 style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)", fontWeight: 800, marginBottom: "0.4rem" }}>
            Traxes vs. <span style={{ color: AMBER }}>The Alternatives</span>
          </h2>
          <p style={{ color: "#7A8BA8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            See exactly why 1,247 drivers switched.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr>
                  {["Feature", "Traxes", "DIY Spreadsheet", "Hiring a CPA"].map((h, i) => (
                    <th key={i} style={{
                      padding: "0.75rem 1rem", textAlign: i === 0 ? "left" : "center",
                      background: i === 1 ? "rgba(255,180,0,0.12)" : "transparent",
                      color: i === 1 ? AMBER : "#6B7A99",
                      borderBottom: `2px solid ${i === 1 ? AMBER : "rgba(255,255,255,0.07)"}`,
                      fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.04em",
                      borderLeft: i === 1 ? `1px solid rgba(255,180,0,0.2)` : "none",
                      borderRight: i === 1 ? `1px solid rgba(255,180,0,0.2)` : "none"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        padding: "0.7rem 1rem", textAlign: j === 0 ? "left" : "center",
                        color: j === 0 ? "#C8D0E0" : j === 1 ? (cell === "0" || cell.startsWith("✓") || cell === "Instant" || cell === "Included" || cell === "Auto-ready" ? GREEN : "#E8ECF4") : "#6B7A99",
                        background: j === 1 ? "rgba(255,180,0,0.05)" : "transparent",
                        fontWeight: j === 1 ? 700 : 400,
                        borderLeft: j === 1 ? `1px solid rgba(255,180,0,0.1)` : "none",
                        borderRight: j === 1 ? `1px solid rgba(255,180,0,0.1)` : "none",
                        fontSize: "0.85rem"
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY2} 0%, ${DARK} 100%)`,
        borderTop: `1px solid rgba(255,180,0,0.15)`,
        padding: "4rem 1.5rem", textAlign: "center"
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💎</div>
          <h2 style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.3, marginBottom: "1rem"
          }}>
            Traxes is already working for{" "}
            <span style={{ color: AMBER }}>1,247 drivers</span>.
            <br />Is it working for <span style={{ color: AMBER }}>you</span>?
          </h2>
          <p style={{ color: "#7A8BA8", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            Every day without Traxes is a day your deductions go uncaptured, your quarterly payments go unplanned, and your Schedule C goes unoptimized.
          </p>
          <a href="/signup" className="traxes-btn" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${ORANGE}, ${AMBER})`,
            color: DARK, textDecoration: "none", borderRadius: 14,
            padding: "1rem 2.5rem", fontWeight: 800, fontSize: "1.1rem",
            boxShadow: `0 8px 32px rgba(255,107,0,0.35)`, transition: "all 0.2s"
          }}>
            Start Free Trial →
          </a>
          <p style={{ color: "#4A5A78", fontSize: "0.78rem", marginTop: "1rem" }}>
            No credit card required · Setup in under 2 minutes · Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
