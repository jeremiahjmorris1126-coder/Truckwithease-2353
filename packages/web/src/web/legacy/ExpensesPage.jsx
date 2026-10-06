import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const EXPENSES = [
  { id: 1, date: "Jul 12", category: "Fuel",    icon: "⛽", desc: "Pilot - Exit 220",          amount: 312.40, deductible: true },
  { id: 2, date: "Jul 11", category: "Meals",   icon: "🍔", desc: "Cracker Barrel - I-40",     amount: 18.75,  deductible: true },
  { id: 3, date: "Jul 10", category: "Tolls",   icon: "🛣️", desc: "IL Tollway",                amount: 22.00,  deductible: true },
  { id: 4, date: "Jul 10", category: "Fuel",    icon: "⛽", desc: "Love's - Exit 11",          amount: 288.90, deductible: true },
  { id: 5, date: "Jul 9",  category: "Repairs", icon: "🔧", desc: "Peterbilt dealer - wiper",  amount: 45.00,  deductible: true },
  { id: 6, date: "Jul 9",  category: "Lodging", icon: "🛏️", desc: "Super 8 - Joplin MO",      amount: 72.00,  deductible: true },
  { id: 7, date: "Jul 8",  category: "Phone",   icon: "📱", desc: "Verizon business plan",     amount: 85.00,  deductible: true },
  { id: 8, date: "Jul 7",  category: "Fuel",    icon: "⛽", desc: "Flying J - Exit 48",        amount: 291.50, deductible: true },
];

const CATEGORIES = [
  { id: "Fuel",      icon: "⛽", label: "Fuel" },
  { id: "Tolls",     icon: "🛣️", label: "Tolls" },
  { id: "Meals",     icon: "🍔", label: "Meals" },
  { id: "Repairs",   icon: "🔧", label: "Repairs" },
  { id: "Lodging",   icon: "🛏️", label: "Lodging" },
  { id: "Phone",     icon: "📱", label: "Phone" },
  { id: "Permits",   icon: "📋", label: "Permits" },
  { id: "Wash",      icon: "🚛", label: "Truck Wash" },
  { id: "Health",    icon: "💊", label: "Health" },
  { id: "Supplies",  icon: "📦", label: "Supplies" },
  { id: "Insurance", icon: "🔒", label: "Insurance" },
  { id: "Other",     icon: "📊", label: "Other" },
];

const CATEGORY_COLORS = {
  Fuel: "#FF6B00", Tolls: "#8B5CF6", Meals: "#F59E0B", Repairs: "#EF4444",
  Lodging: "#3B82F6", Phone: "#10B981", Permits: "#6366F1", Wash: "#14B8A6",
  Health: "#EC4899", Supplies: "#F97316", Insurance: "#84CC16", Other: "#94A3B8"
};

const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
const deductibleAmt = EXPENSES.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0);
const taxSavings = deductibleAmt * 0.22;

function getCategoryTotals() {
  const totals = {};
  EXPENSES.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState("log");
  const [selectedCategory, setSelectedCategory] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [deductible, setDeductible] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expenses, setExpenses] = useState(EXPENSES);

  function handleLog(e) {
    e.preventDefault();
    if (!amount) return;
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    const newExp = {
      id: Date.now(),
      date: "Jul 12",
      category: selectedCategory,
      icon: cat?.icon || "📊",
      desc: description || selectedCategory,
      amount: parseFloat(amount),
      deductible,
    };
    setExpenses(prev => [newExp, ...prev]);
    setShowSuccess(true);
    setAmount("");
    setDescription("");
    setTimeout(() => setShowSuccess(false), 3000);
  }

  const catTotals = getCategoryTotals();
  const totalWithNew = expenses.reduce((s, e) => s + e.amount, 0);
  const deductibleWithNew = expenses.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0);
  const taxSavingsWithNew = deductibleWithNew * 0.22;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ep-root { font-family: 'Poppins', sans-serif; background: #f5f7fb; color: ${DARK}; min-height: 100vh; }
        .ep-nav { position: sticky; top: 0; z-index: 100; background: ${NAVY2}; border-bottom: 3px solid ${GREEN}; display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 60px; }
        .ep-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1rem; color: #fff; text-decoration: none; }
        .ep-nav-logo img { width: 32px; height: 32px; object-fit: contain; }
        .ep-nav-title { color: #6ee7b7; font-size: 1rem; font-weight: 700; }
        .ep-nav-links { margin-left: auto; display: flex; gap: 16px; align-items: center; }
        .ep-nav-links a { color: #aab4cc; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: color 0.2s; }
        .ep-nav-links a:hover { color: #6ee7b7; }
        .ep-header { background: ${NAVY}; padding: 28px 32px; }
        .ep-header-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .ep-header-sub { font-size: 0.8rem; color: #aab4cc; margin-bottom: 24px; }
        .ep-stats { display: flex; gap: 20px; flex-wrap: wrap; }
        .ep-stat-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 16px 20px; min-width: 160px; }
        .ep-stat-val { font-family: 'DM Mono', monospace; font-size: 1.5rem; font-weight: 700; color: #fff; display: block; margin-bottom: 4px; }
        .ep-stat-key { font-size: 0.68rem; color: #aab4cc; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .ep-tabs { background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; padding: 0 32px; }
        .ep-tab { padding: 14px 0; margin-right: 32px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; color: #778; transition: all 0.2s; }
        .ep-tab.active { color: ${NAVY}; border-bottom-color: ${GREEN}; }
        .ep-body { max-width: 1100px; margin: 0 auto; padding: 28px 24px; display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }
        .ep-main { flex: 1; min-width: 300px; }

        /* Log Expense Tab */
        .ep-cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
        .ep-cat-tile { background: #fff; border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s; }
        .ep-cat-tile:hover { border-color: #c8d4e8; background: #f6f8ff; }
        .ep-cat-tile.selected { border-color: ${GREEN}; background: #f0fdf4; }
        .ep-cat-icon { font-size: 1.5rem; }
        .ep-cat-label { font-size: 0.62rem; font-weight: 700; color: #445; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .ep-form-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; }
        .ep-form-title { font-size: 0.9rem; font-weight: 700; color: ${NAVY}; margin-bottom: 16px; }
        .ep-amount-wrap { display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 14px; transition: border-color 0.2s; }
        .ep-amount-wrap:focus-within { border-color: ${GREEN}; }
        .ep-amount-prefix { background: #f0fdf4; border-right: 2px solid #e2e8f0; padding: 14px 16px; font-size: 1.4rem; font-weight: 800; color: ${GREEN}; font-family: 'DM Mono', monospace; }
        .ep-amount-input { flex: 1; border: none; outline: none; font-family: 'DM Mono', monospace; font-size: 1.6rem; font-weight: 700; color: ${DARK}; padding: 14px 16px; background: #fff; }
        .ep-amount-input::placeholder { color: #ccd; }
        .ep-form-row { display: flex; gap: 12px; margin-bottom: 14px; }
        .ep-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.82rem; padding: 10px 12px; outline: none; color: ${DARK}; transition: border-color 0.2s; }
        .ep-input:focus { border-color: ${GREEN}; }
        .ep-deductible-row { display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
        .ep-deductible-label { font-size: 0.8rem; font-weight: 700; color: ${GREEN}; }
        .ep-deductible-sub { font-size: 0.65rem; color: #555; margin-top: 2px; }
        .ep-toggle { display: flex; gap: 6px; }
        .ep-toggle-btn { padding: 5px 14px; border-radius: 20px; font-family: 'Poppins', sans-serif; font-size: 0.72rem; font-weight: 700; border: 1.5px solid #ccd; background: #fff; color: #778; cursor: pointer; transition: all 0.2s; }
        .ep-toggle-btn.yes.active { background: ${GREEN}; border-color: ${GREEN}; color: #fff; }
        .ep-toggle-btn.no.active { background: #ff6b6b; border-color: #ff6b6b; color: #fff; }
        .ep-log-btn { width: 100%; background: ${GREEN}; border: none; color: #fff; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 0.9rem; padding: 14px; border-radius: 10px; cursor: pointer; transition: opacity 0.2s; }
        .ep-log-btn:hover { opacity: 0.88; }
        .ep-success { background: #f0fdf4; border: 2px solid ${GREEN}; border-radius: 10px; padding: 14px; text-align: center; margin-top: 12px; animation: fadeInUp 0.3s ease; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ep-success-pts { font-size: 1.3rem; font-weight: 900; color: ${GREEN}; }
        .ep-success-sub { font-size: 0.75rem; color: #555; margin-top: 4px; }

        /* This Month Tab */
        .ep-month-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .ep-month-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .ep-month-stat-val { font-family: 'DM Mono', monospace; font-size: 1.4rem; font-weight: 700; display: block; margin-bottom: 4px; }
        .ep-month-stat-key { font-size: 0.68rem; color: #778; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .ep-expense-list { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
        .ep-expense-item { display: flex; align-items: center; gap: 14px; padding: 13px 18px; border-bottom: 1px solid #f0f2f8; }
        .ep-expense-item:last-child { border-bottom: none; }
        .ep-expense-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .ep-expense-info { flex: 1; }
        .ep-expense-desc { font-size: 0.82rem; font-weight: 600; color: ${DARK}; }
        .ep-expense-meta { font-size: 0.68rem; color: #aab; margin-top: 2px; }
        .ep-expense-right { text-align: right; }
        .ep-expense-amount { font-family: 'DM Mono', monospace; font-size: 0.95rem; font-weight: 700; color: ${DARK}; }
        .ep-deductible-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; background: #dcfce7; color: ${GREEN}; margin-top: 4px; display: inline-block; }
        .ep-ai-tip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px; }
        .ep-ai-tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .ep-ai-dot { width: 8px; height: 8px; border-radius: 50%; background: ${GREEN}; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .ep-ai-label { font-size: 0.68rem; font-weight: 800; color: ${NAVY}; text-transform: uppercase; letter-spacing: 1px; }
        .ep-ai-text { font-size: 0.8rem; color: #334; line-height: 1.5; }
        .ep-donut { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
        .ep-donut-title { font-size: 0.82rem; font-weight: 700; color: ${NAVY}; margin-bottom: 14px; }
        .ep-legend { display: flex; flex-direction: column; gap: 8px; }
        .ep-legend-item { display: flex; align-items: center; gap: 10px; }
        .ep-legend-color { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; }
        .ep-legend-name { font-size: 0.75rem; color: #445; font-weight: 600; flex: 1; }
        .ep-legend-bar-wrap { flex: 2; height: 8px; background: #f0f2f8; border-radius: 4px; overflow: hidden; }
        .ep-legend-bar { height: 100%; border-radius: 4px; }
        .ep-legend-val { font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 700; color: #445; min-width: 55px; text-align: right; }

        .ep-traxes-cta { background: ${NAVY}; border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .ep-traxes-text { flex: 1; }
        .ep-traxes-title { font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .ep-traxes-sub { font-size: 0.75rem; color: #aab4cc; }
        .ep-traxes-btn { background: ${AMBER}; color: ${DARK}; border: none; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 0.8rem; padding: 10px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap; text-decoration: none; }

        @media (max-width: 700px) {
          .ep-cat-grid { grid-template-columns: repeat(3, 1fr); }
          .ep-body { padding: 16px; gap: 16px; }
          .ep-month-stats { grid-template-columns: 1fr; }
          .ep-stats { gap: 12px; }
          .ep-stat-card { min-width: 120px; }
          .ep-nav-links { display: none; }
          .ep-header { padding: 20px 16px; }
        }
      `}</style>
      <div className="ep-root">
        <nav className="ep-nav">
          <a href="/" className="ep-nav-logo">
            <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
            <span>TruckWithEase</span>
          </a>
          <span className="ep-nav-title">🧾 Expense Tracker</span>
          <div className="ep-nav-links">
            <a href="/traxes">Traxes</a>
            <a href="/#pricing" style={{ background: '#FFB400', color: '#06090F', padding: '6px 14px', borderRadius: 7, fontWeight: 800 }}>Free Trial</a>
            <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>← Back</a>
          </div>
        </nav>

        <div className="ep-header">
          <div className="ep-header-title">Expense Tracker</div>
          <div className="ep-header-sub">Track every dollar. Keep more of what you earn.</div>
          <div className="ep-stats">
            <div className="ep-stat-card">
              <span className="ep-stat-val">${totalWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <span className="ep-stat-key">Total This Month</span>
            </div>
            <div className="ep-stat-card">
              <span className="ep-stat-val" style={{ color: "#6ee7b7" }}>${deductibleWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <span className="ep-stat-key">Deductible Amount</span>
            </div>
            <div className="ep-stat-card">
              <span className="ep-stat-val" style={{ color: AMBER }}>${taxSavingsWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <span className="ep-stat-key">Tax Savings Est.</span>
            </div>
            <div className="ep-stat-card">
              <span className="ep-stat-val">{new Set(expenses.map(e => e.category)).size}</span>
              <span className="ep-stat-key">Categories Tracked</span>
            </div>
          </div>
        </div>

        <div className="ep-tabs">
          <div className={`ep-tab${activeTab === "log" ? " active" : ""}`} onClick={() => setActiveTab("log")}>➕ Log Expense</div>
          <div className={`ep-tab${activeTab === "month" ? " active" : ""}`} onClick={() => setActiveTab("month")}>📊 This Month</div>
        </div>

        <div className="ep-body">
          <div className="ep-main">
            {activeTab === "log" && (
              <>
                <div className="ep-cat-grid" style={{ marginBottom: 16 }}>
                  {CATEGORIES.map(cat => (
                    <div
                      key={cat.id}
                      className={`ep-cat-tile${selectedCategory === cat.id ? " selected" : ""}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span className="ep-cat-icon">{cat.icon}</span>
                      <span className="ep-cat-label">{cat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="ep-form-section">
                  <div className="ep-form-title">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.icon} Log {selectedCategory} Expense
                  </div>
                  <form onSubmit={handleLog}>
                    <div className="ep-amount-wrap">
                      <span className="ep-amount-prefix">$</span>
                      <input
                        className="ep-amount-input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="ep-form-row">
                      <input
                        className="ep-input"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                      />
                      <input
                        className="ep-input"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="ep-deductible-row">
                      <div>
                        <div className="ep-deductible-label">✅ Tax Deductible</div>
                        <div className="ep-deductible-sub">IRS Schedule C — 100% deductible for owner-operators</div>
                      </div>
                      <div className="ep-toggle">
                        <button
                          type="button"
                          className={`ep-toggle-btn yes${deductible ? " active" : ""}`}
                          onClick={() => setDeductible(true)}
                        >Yes</button>
                        <button
                          type="button"
                          className={`ep-toggle-btn no${!deductible ? " active" : ""}`}
                          onClick={() => setDeductible(false)}
                        >No</button>
                      </div>
                    </div>
                    <button type="submit" className="ep-log-btn">
                      🧾 Log Expense + Earn Traxes Points
                    </button>
                  </form>
                  {showSuccess && (
                    <div className="ep-success">
                      <div className="ep-success-pts">+50 Traxes Points Earned! 🎉</div>
                      <div className="ep-success-sub">Expense logged successfully. Keep tracking to maximize your tax savings.</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "month" && (
              <>
                <div className="ep-month-stats">
                  <div className="ep-month-stat">
                    <span className="ep-month-stat-val" style={{ color: DARK }}>${totalWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    <span className="ep-month-stat-key">Total Spent</span>
                  </div>
                  <div className="ep-month-stat">
                    <span className="ep-month-stat-val" style={{ color: GREEN }}>${deductibleWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    <span className="ep-month-stat-key">Deductible</span>
                  </div>
                  <div className="ep-month-stat">
                    <span className="ep-month-stat-val" style={{ color: AMBER }}>${taxSavingsWithNew.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    <span className="ep-month-stat-key">Tax Savings @ 22%</span>
                  </div>
                </div>

                <div className="ep-expense-list">
                  {expenses.map(exp => (
                    <div key={exp.id} className="ep-expense-item">
                      <div className="ep-expense-icon" style={{ background: (CATEGORY_COLORS[exp.category] || "#94A3B8") + "22" }}>
                        {exp.icon}
                      </div>
                      <div className="ep-expense-info">
                        <div className="ep-expense-desc">{exp.desc}</div>
                        <div className="ep-expense-meta">{exp.date} · {exp.category}</div>
                      </div>
                      <div className="ep-expense-right">
                        <div className="ep-expense-amount">-${exp.amount.toFixed(2)}</div>
                        {exp.deductible && <span className="ep-deductible-badge">Deductible</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ep-ai-tip">
                  <div className="ep-ai-tip-header">
                    <div className="ep-ai-dot"></div>
                    <span className="ep-ai-label">Traxes Tip</span>
                  </div>
                  <div className="ep-ai-text">
                    You've spent <strong>$892</strong> on fuel this month. Based on your route patterns, you may be able to reduce this by <strong>$180</strong> by fueling at Love's vs. Pilot on your usual run — I'll alert you next time you're near Exit 11.
                  </div>
                </div>

                <div className="ep-donut">
                  <div className="ep-donut-title">Spending by Category</div>
                  <div className="ep-legend">
                    {Object.entries(catTotals)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amt]) => {
                        const pct = Math.round((amt / totalExpenses) * 100);
                        return (
                          <div key={cat} className="ep-legend-item">
                            <div className="ep-legend-color" style={{ background: CATEGORY_COLORS[cat] || "#94A3B8" }}></div>
                            <span className="ep-legend-name">{cat}</span>
                            <div className="ep-legend-bar-wrap">
                              <div className="ep-legend-bar" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] || "#94A3B8" }}></div>
                            </div>
                            <span className="ep-legend-val">${amt.toFixed(0)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Traxes CTA */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
          <div className="ep-traxes-cta">
            <div className="ep-traxes-text">
              <div className="ep-traxes-title">💰 Turn Every Dollar Into Rewards with Traxes</div>
              <div className="ep-traxes-sub">Earn points on every expense you log. Redeem for fuel discounts, gear, and more.</div>
            </div>
            <a href="/traxes" className="ep-traxes-btn">Explore Traxes →</a>
          </div>
        </div>
      </div>
    </>
  );
}
