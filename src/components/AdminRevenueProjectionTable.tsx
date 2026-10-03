import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  UserMinus,
  Percent,
  Download,
  RotateCcw,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

export interface MonthlyProjectionRow {
  monthIndex: number;
  monthName: string;
  startingUsers: number;
  newUsers: number;
  churnedUsers: number;
  endingUsers: number;
  churnRate: number; // percentage, e.g. 2.5
  subscriptionRevenue: number;
  addonRevenue: number;
  totalRevenue: number;
  cumulativeRevenue: number;
  growthRatePct: number;
}

interface AdminRevenueProjectionTableProps {
  initialBasePrice?: number;
}

export const AdminRevenueProjectionTable: React.FC<AdminRevenueProjectionTableProps> = ({
  initialBasePrice = 49,
}) => {
  // Configurable Projection Parameters
  const [startingUsers, setStartingUsers] = useState<number>(145);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(8.5); // %
  const [baseChurnRate, setBaseChurnRate] = useState<number>(2.4); // %
  const [subPricePerUser, setSubPricePerUser] = useState<number>(initialBasePrice);
  const [addonArpu, setAddonArpu] = useState<number>(24.5); // Addon services: Twilio telecom, DVIR audits, factoring
  const [scenario, setScenario] = useState<'conservative' | 'baseline' | 'aggressive'>('baseline');
  const [isExported, setIsExported] = useState(false);

  // Apply Pre-configured Scenarios
  const handleApplyScenario = (preset: 'conservative' | 'baseline' | 'aggressive') => {
    setScenario(preset);
    triggerHapticFeedback('tick');
    if (preset === 'conservative') {
      setMonthlyGrowthRate(4.8);
      setBaseChurnRate(3.8);
      setAddonArpu(18.0);
    } else if (preset === 'baseline') {
      setMonthlyGrowthRate(8.5);
      setBaseChurnRate(2.4);
      setAddonArpu(24.5);
    } else {
      setMonthlyGrowthRate(14.2);
      setBaseChurnRate(1.6);
      setAddonArpu(34.0);
    }
  };

  // Reset to Baseline
  const handleReset = () => {
    triggerHapticFeedback('tick');
    setStartingUsers(145);
    setMonthlyGrowthRate(8.5);
    setBaseChurnRate(2.4);
    setSubPricePerUser(initialBasePrice);
    setAddonArpu(24.5);
    setScenario('baseline');
  };

  // Generate 12-Month Projection Rows
  const { rows, summary } = useMemo(() => {
    const monthNames = [
      'Month 1 (Oct 2026)',
      'Month 2 (Nov 2026)',
      'Month 3 (Dec 2026)',
      'Month 4 (Jan 2027)',
      'Month 5 (Feb 2027)',
      'Month 6 (Mar 2027)',
      'Month 7 (Apr 2027)',
      'Month 8 (May 2027)',
      'Month 9 (Jun 2027)',
      'Month 10 (Jul 2027)',
      'Month 11 (Aug 2027)',
      'Month 12 (Sep 2027)',
    ];

    const resultRows: MonthlyProjectionRow[] = [];
    let currentUsers = startingUsers;
    let runningCumulativeRev = 0;
    let prevTotalRev = 0;

    for (let i = 0; i < 12; i++) {
      // Natural slight seasonal variation in churn (e.g. winter weather/holiday shifts in Dec/Jan)
      const seasonalChurnFactor = i === 2 || i === 3 ? 1.15 : i === 8 || i === 9 ? 0.9 : 1.0;
      const effectiveChurnRate = +(baseChurnRate * seasonalChurnFactor).toFixed(2);

      const newUsersCount = Math.max(1, Math.round(currentUsers * (monthlyGrowthRate / 100)));
      const churnedUsersCount = Math.max(0, Math.round(currentUsers * (effectiveChurnRate / 100)));
      const endingUsersCount = Math.max(1, currentUsers + newUsersCount - churnedUsersCount);

      const subRev = Math.round(endingUsersCount * subPricePerUser);
      const addonRev = Math.round(endingUsersCount * addonArpu);
      const totalRev = subRev + addonRev;

      runningCumulativeRev += totalRev;

      const growthRate = i === 0 ? 0 : +(((totalRev - prevTotalRev) / prevTotalRev) * 100).toFixed(1);
      prevTotalRev = totalRev;

      resultRows.push({
        monthIndex: i + 1,
        monthName: monthNames[i],
        startingUsers: currentUsers,
        newUsers: newUsersCount,
        churnedUsers: churnedUsersCount,
        endingUsers: endingUsersCount,
        churnRate: effectiveChurnRate,
        subscriptionRevenue: subRev,
        addonRevenue: addonRev,
        totalRevenue: totalRev,
        cumulativeRevenue: runningCumulativeRev,
        growthRatePct: growthRate,
      });

      // Advance for next month
      currentUsers = endingUsersCount;
    }

    const total12MoRevenue = runningCumulativeRev;
    const finalMonthMRR = resultRows[11]?.totalRevenue || 0;
    const finalUserCount = resultRows[11]?.endingUsers || 0;
    const totalNewUsers = resultRows.reduce((sum, r) => sum + r.newUsers, 0);
    const totalChurnedUsers = resultRows.reduce((sum, r) => sum + r.churnedUsers, 0);
    const avgChurnRate = +(resultRows.reduce((sum, r) => sum + r.churnRate, 0) / 12).toFixed(2);
    const arpu = subPricePerUser + addonArpu;
    // Customer Lifetime Value = ARPU / (Monthly Churn Rate / 100)
    const ltv = Math.round(arpu / (avgChurnRate / 100));

    return {
      rows: resultRows,
      summary: {
        total12MoRevenue,
        finalMonthMRR,
        finalUserCount,
        netUserGain: finalUserCount - startingUsers,
        totalNewUsers,
        totalChurnedUsers,
        avgChurnRate,
        ltv,
      },
    };
  }, [startingUsers, monthlyGrowthRate, baseChurnRate, subPricePerUser, addonArpu]);

  // Max revenue for bar scaling
  const maxMonthlyRevenue = useMemo(() => {
    return Math.max(...rows.map((r) => r.totalRevenue), 1);
  }, [rows]);

  // Export to CSV
  const handleExportCSV = () => {
    triggerHapticFeedback('success');
    const headers = [
      'Month',
      'Starting Users',
      'New Users',
      'Churned Users',
      'Ending Users',
      'Churn Rate (%)',
      'Subscription Revenue ($)',
      'Addon Revenue ($)',
      'Total Monthly Revenue ($)',
      'Cumulative Revenue ($)',
      'MoM Growth (%)',
    ];

    const csvRows = rows.map((r) => [
      `"${r.monthName}"`,
      r.startingUsers,
      r.newUsers,
      r.churnedUsers,
      r.endingUsers,
      r.churnRate,
      r.subscriptionRevenue,
      r.addonRevenue,
      r.totalRevenue,
      r.cumulativeRevenue,
      r.growthRatePct,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `truckwithease_12mo_revenue_forecast_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 3500);
  };

  return (
    <div id="admin-revenue-projection-container" className="space-y-6 font-mono">
      {/* 1. TOP HEADER & SCENARIO SELECTOR */}
      <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#202230] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#D4AF37] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                12-Month Financial Engine
              </span>
              <span className="text-xs text-[#7E8B9B]">|</span>
              <span className="text-xs text-[#8E92A4]">TruckWithEase SaaS Commercial Model</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1.5 flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-[#C9A84C]" />
              Subscriptions &amp; Revenue Projection Model
            </h2>
            <p className="text-xs text-[#8E92A4] mt-1 max-w-2xl">
              Breakdown of projected subscription revenue, expected carrier account count, and monthly churn rate over the next 12 months with interactive modeling parameters.
            </p>
          </div>

          {/* Action Buttons & Scenario Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-[#0B0C10] border border-[#262838] p-1">
              <button
                onClick={() => handleApplyScenario('conservative')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  scenario === 'conservative'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                Conservative
              </button>
              <button
                onClick={() => handleApplyScenario('baseline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  scenario === 'baseline'
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                Baseline
              </button>
              <button
                onClick={() => handleApplyScenario('aggressive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  scenario === 'aggressive'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                Aggressive
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-[#181A24] hover:bg-[#202230] border border-[#2B2E3E] text-[#A0A4B8] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              title="Reset parameters to baseline defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-[#C9A84C] hover:bg-[#D4AF37] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-105 flex items-center gap-1.5"
            >
              {isExported ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{isExported ? 'CSV Exported' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE MODEL CONTROLS STRIP */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Starting Users */}
          <div className="p-3 bg-[#0B0C10] border border-[#222432] rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold flex items-center justify-between">
              <span>Starting Carriers</span>
              <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                step="5"
                value={startingUsers}
                onChange={(e) => setStartingUsers(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#161822] border border-[#3A3D52] rounded-lg px-2 py-1 text-white font-bold text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <span className="text-[11px] text-[#8E92A4]">Fleets</span>
            </div>
            <span className="text-[10px] text-[#666]">Active Month 1 baseline</span>
          </div>

          {/* Monthly Growth Rate */}
          <div className="p-3 bg-[#0B0C10] border border-[#222432] rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold flex items-center justify-between">
              <span>Monthly Growth</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={monthlyGrowthRate}
                onChange={(e) => setMonthlyGrowthRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full bg-[#161822] border border-[#3A3D52] rounded-lg px-2 py-1 text-emerald-300 font-bold text-sm focus:border-emerald-400 focus:outline-none"
              />
              <span className="text-[11px] text-emerald-400 font-bold">% MoM</span>
            </div>
            <span className="text-[10px] text-[#666]">New organic fleet adds</span>
          </div>

          {/* Monthly Churn Rate */}
          <div className="p-3 bg-[#0B0C10] border border-[#222432] rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold flex items-center justify-between">
              <span>Monthly Churn</span>
              <UserMinus className="w-3.5 h-3.5 text-rose-400" />
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.1"
                max="25"
                step="0.1"
                value={baseChurnRate}
                onChange={(e) => setBaseChurnRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full bg-[#161822] border border-[#3A3D52] rounded-lg px-2 py-1 text-rose-300 font-bold text-sm focus:border-rose-400 focus:outline-none"
              />
              <span className="text-[11px] text-rose-400 font-bold">% /mo</span>
            </div>
            <span className="text-[10px] text-[#666]">Target standard &lt; 3.0%</span>
          </div>

          {/* Base Sub Price */}
          <div className="p-3 bg-[#0B0C10] border border-[#222432] rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold flex items-center justify-between">
              <span>Base Sub / User</span>
              <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#C9A84C] font-bold">$</span>
              <input
                type="number"
                min="9"
                step="1"
                value={subPricePerUser}
                onChange={(e) => setSubPricePerUser(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full bg-[#161822] border border-[#3A3D52] rounded-lg px-2 py-1 text-white font-bold text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <span className="text-[10px] text-[#8E92A4]">/mo</span>
            </div>
            <span className="text-[10px] text-[#666]">Platform core license</span>
          </div>

          {/* Add-on & Telecom ARPU */}
          <div className="p-3 bg-[#0B0C10] border border-[#222432] rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold flex items-center justify-between">
              <span>Add-on ARPU</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-cyan-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={addonArpu}
                onChange={(e) => setAddonArpu(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#161822] border border-[#3A3D52] rounded-lg px-2 py-1 text-cyan-300 font-bold text-sm focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-[10px] text-[#8E92A4]">/mo</span>
            </div>
            <span className="text-[10px] text-[#666]">Twilio line, DVIR, exports</span>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total 12-Month Projected Revenue */}
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold tracking-wider">
              12-Mo Projected ARR
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${summary.total12MoRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              12 Mo Run
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#8E92A4] flex items-center justify-between border-t border-[#1E202C] pt-2">
            <span>Month 12 Exit MRR:</span>
            <span className="text-[#C9A84C] font-bold">${summary.finalMonthMRR.toLocaleString()}/mo</span>
          </div>
        </div>

        {/* Expected User Count */}
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold tracking-wider">
              Expected Active Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {summary.finalUserCount.toLocaleString()}
            </span>
            <span className="text-xs text-blue-400 font-bold">
              +{summary.netUserGain} net ({+((summary.netUserGain / startingUsers) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#8E92A4] flex items-center justify-between border-t border-[#1E202C] pt-2">
            <span>Starting Base:</span>
            <span className="text-white font-bold">{startingUsers} carriers</span>
          </div>
        </div>

        {/* Average Monthly Churn Rate */}
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold tracking-wider">
              Average Churn Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {summary.avgChurnRate}%
            </span>
            <span className="text-xs text-rose-400 font-bold">
              {summary.totalChurnedUsers} lost
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#8E92A4] flex items-center justify-between border-t border-[#1E202C] pt-2">
            <span>New Adds:</span>
            <span className="text-emerald-400 font-bold">+{summary.totalNewUsers} gross</span>
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7E8B9B] uppercase font-bold tracking-wider">
              Customer LTV
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${summary.ltv.toLocaleString()}
            </span>
            <span className="text-xs text-[#A0A4B8]">
              ~{Math.round(100 / summary.avgChurnRate)} mos
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#8E92A4] flex items-center justify-between border-t border-[#1E202C] pt-2">
            <span>Blended ARPU:</span>
            <span className="text-white font-bold">${subPricePerUser + addonArpu}/carrier/mo</span>
          </div>
        </div>
      </div>

      {/* 3. SUMMARY TABLE: 12-MONTH BREAKDOWN */}
      <div className="bg-[#121318] border border-[#262838] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-[#202230] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151722]/70">
          <div>
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A84C]" />
              12-Month Detailed Projections Table
            </h3>
            <p className="text-xs text-[#8E92A4]">
              Month-by-month financial pacing, user additions, churn dynamics, and trajectory for FY 2026-2027.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8E92A4]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              New Additions
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              Monthly Churn
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#C5C8D8]">
            <thead className="bg-[#0B0C10] text-[#7E8B9B] uppercase font-bold text-[10px] border-b border-[#222432]">
              <tr>
                <th className="py-3 px-3.5">Month</th>
                <th className="py-3 px-3 text-right">Start Users</th>
                <th className="py-3 px-3 text-right text-emerald-400">New (+)</th>
                <th className="py-3 px-3 text-right text-rose-400">Churn (-)</th>
                <th className="py-3 px-3 text-right text-white font-bold">End Users</th>
                <th className="py-3 px-3 text-right">Churn Rate</th>
                <th className="py-3 px-3 text-right hidden sm:table-cell">Sub Revenue</th>
                <th className="py-3 px-3 text-right hidden md:table-cell">Addon Revenue</th>
                <th className="py-3 px-3 text-right text-[#C9A84C] font-bold">Total Monthly</th>
                <th className="py-3 px-3 text-right hidden lg:table-cell">Cumulative</th>
                <th className="py-3 px-3.5 text-right">Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1C28]">
              {rows.map((row) => {
                const barPercent = Math.max(8, Math.round((row.totalRevenue / maxMonthlyRevenue) * 100));
                return (
                  <tr
                    key={row.monthIndex}
                    className="hover:bg-[#181A26]/80 transition-colors group"
                  >
                    {/* Month Name */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#1C1E2C] border border-[#2E3144] flex items-center justify-center text-[10px] text-[#A0A4B8]">
                          {row.monthIndex}
                        </span>
                        <span>{row.monthName}</span>
                      </div>
                    </td>

                    {/* Starting Users */}
                    <td className="py-3 px-3 text-right font-mono text-[#A0A4B8]">
                      {row.startingUsers.toLocaleString()}
                    </td>

                    {/* New Users */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                      +{row.newUsers}
                    </td>

                    {/* Churned Users */}
                    <td className="py-3 px-3 text-right font-mono text-rose-400">
                      -{row.churnedUsers}
                    </td>

                    {/* Ending Users */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {row.endingUsers.toLocaleString()}
                    </td>

                    {/* Churn Rate % */}
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.churnRate <= 2.2
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : row.churnRate <= 3.2
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {row.churnRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Sub Revenue */}
                    <td className="py-3 px-3 text-right font-mono text-[#A0A4B8] hidden sm:table-cell">
                      ${row.subscriptionRevenue.toLocaleString()}
                    </td>

                    {/* Addon Revenue */}
                    <td className="py-3 px-3 text-right font-mono text-cyan-300 hidden md:table-cell">
                      ${row.addonRevenue.toLocaleString()}
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#E5C158] whitespace-nowrap">
                      ${row.totalRevenue.toLocaleString()}
                    </td>

                    {/* Cumulative Revenue */}
                    <td className="py-3 px-3 text-right font-mono text-[#8E92A4] hidden lg:table-cell">
                      ${row.cumulativeRevenue.toLocaleString()}
                    </td>

                    {/* Trajectory Bar */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 sm:w-20 bg-[#0B0C10] h-2 rounded-full overflow-hidden border border-[#252838]">
                          <div
                            className="bg-gradient-to-r from-[#C9A84C] to-[#E5C158] h-full rounded-full transition-all duration-300"
                            style={{ width: `${barPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono w-10 text-right">
                          {row.growthRatePct > 0 ? `+${row.growthRatePct}%` : 'Base'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Summary Row */}
            <tfoot className="bg-[#0B0C10] border-t-2 border-[#2B2D40] text-white font-bold">
              <tr>
                <td className="py-3.5 px-3.5 uppercase tracking-wider text-[11px] text-[#C9A84C]">
                  12-Month Totals / Averages
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-[#A0A4B8]">
                  {startingUsers} (Base)
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-400">
                  +{summary.totalNewUsers}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-rose-400">
                  -{summary.totalChurnedUsers}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-white text-sm">
                  {summary.finalUserCount.toLocaleString()}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-amber-300">
                  {summary.avgChurnRate}% avg
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-[#A0A4B8] hidden sm:table-cell">
                  ${rows.reduce((sum, r) => sum + r.subscriptionRevenue, 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-cyan-300 hidden md:table-cell">
                  ${rows.reduce((sum, r) => sum + r.addonRevenue, 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-[#C9A84C] text-sm whitespace-nowrap">
                  ${summary.total12MoRevenue.toLocaleString()}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-white hidden lg:table-cell">
                  ${summary.total12MoRevenue.toLocaleString()}
                </td>
                <td className="py-3.5 px-3.5 text-right text-[10px] text-emerald-400 uppercase tracking-wider">
                  +{+(((summary.finalMonthMRR - rows[0].totalRevenue) / rows[0].totalRevenue) * 100).toFixed(0)}% Growth
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MODEL ASSUMPTIONS & COMPLIANCE FOOTNOTE */}
        <div className="p-4 bg-[#0E0F14] border-t border-[#202230] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#7E8B9B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Projections modeled on statutory motor carrier fleet licenses with automatic monthly card/ACH processing, FMCSA audit compliance telemetry, and Twilio voice/SMS add-ons.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[#8E92A4]">
            <span>MRR Exit: <strong className="text-white">${summary.finalMonthMRR.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Net Fleet Gain: <strong className="text-emerald-400">+{summary.netUserGain}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
