import React, { useState } from 'react';
import {
  Award,
  Gift,
  Zap,
  CheckCircle,
  TrendingUp,
  Tag,
  Fuel,
  ShieldCheck,
  Target,
  Lock,
  RefreshCw,
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface RewardItem {
  id: string;
  category: 'fuel' | 'subscription' | 'merch' | 'wellness' | 'tech';
  title: string;
  desc: string;
  cost: number;
}

interface PointActivity {
  id: string;
  note: string;
  at: string;
  points: number;
}

interface DriverBadge {
  id: string;
  label: string;
  desc: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: any;
  unlocked: boolean;
  unlockedAt?: string;
}

export const EaseRewardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'badges'>('rewards');
  const [points, setPoints] = useState<number>(14850);
  const [redeemedAlert, setRedeemedAlert] = useState<string | null>(null);

  // Rewards Catalog
  const CATALOG: RewardItem[] = [
    {
      id: 'fuel-25',
      category: 'fuel',
      title: "$25 Pilot Flying J / Love's Fuel Credit",
      desc: 'Instant barcode redeemable at pump or fuel desk across 800+ national travel centers.',
      cost: 2500,
    },
    {
      id: 'sub-50',
      category: 'subscription',
      title: '$50 Truckwithease Subscription Credit',
      desc: 'Applied automatically to your next monthly or annual carrier fleet OS invoice.',
      cost: 4000,
    },
    {
      id: 'dot-exam',
      category: 'wellness',
      title: 'Free Annual DOT Physical Voucher',
      desc: 'Accepted at 540+ Concentra & CareNow certified occupational health clinics nationwide.',
      cost: 5000,
    },
    {
      id: 'parka-vis',
      category: 'merch',
      title: 'High-Visibility Thermal Winter Fleet Parka',
      desc: 'Class 3 ANSI certified heavy-duty waterproof safety parka with Truckwithease emblem.',
      cost: 3200,
    },
    {
      id: 'blueparrott',
      category: 'tech',
      title: 'BlueParrott B450-XT Noise-Cancelling Headset',
      desc: 'Industry standard 96% background noise cancellation for crystal-clear dispatch & family calls.',
      cost: 12000,
    },
    {
      id: 'satellite-wifi',
      category: 'tech',
      title: '1-Month In-Cab Satellite Wi-Fi Voucher',
      desc: 'High-speed nationwide data connectivity for your sleeper berth and in-cab navigation display.',
      cost: 6500,
    },
  ];

  // Point Activity History
  const [history, setHistory] = useState<PointActivity[]>([
    {
      id: 'h-1',
      note: 'Clean CVSA Level 1 DOT Roadside Inspection (No Violations)',
      at: '2026-09-22',
      points: 500,
    },
    {
      id: 'h-2',
      note: '500 Consecutive Safe Highway Miles Logged',
      at: '2026-09-21',
      points: 100,
    },
    {
      id: 'h-3',
      note: 'Complete Mandatory Pre-Trip DVIR with Tire Pressure Scan',
      at: '2026-09-21',
      points: 50,
    },
    {
      id: 'h-4',
      note: 'Warned Fleet of Roadside Hazard & Construction Backup (I-80 MM 142)',
      at: '2026-09-19',
      points: 75,
    },
    {
      id: 'h-5',
      note: 'Redeemed: $25 Love’s Fuel Credit Card',
      at: '2026-09-15',
      points: -2500,
    },
    {
      id: 'h-6',
      note: 'Filed Bad Broker / Unpaid 6-Hour Detention Report',
      at: '2026-09-12',
      points: 120,
    },
  ]);

  // Driver Badges
  const [badges] = useState<DriverBadge[]>([
    {
      id: 'first-load-assigned',
      label: 'First Load',
      desc: 'Assigned and dispatched your first commercial freight load',
      tier: 'bronze',
      icon: Award,
      unlocked: true,
      unlockedAt: 'Aug 2025',
    },
    {
      id: 'first-route-saved',
      label: 'Route Master',
      desc: 'Saved your first low-bridge avoidance route corridor',
      tier: 'bronze',
      icon: Target,
      unlocked: true,
      unlockedAt: 'Aug 2025',
    },
    {
      id: 'five-routes-saved',
      label: 'Navigator',
      desc: 'Saved 5+ optimized multistate freight routes',
      tier: 'silver',
      icon: TrendingUp,
      unlocked: true,
      unlockedAt: 'Sep 2025',
    },
    {
      id: 'danger-report-filed',
      label: 'Alert Keeper',
      desc: 'Filed an active roadside hazard or low-clearance radar alert',
      tier: 'silver',
      icon: Flame,
      unlocked: true,
      unlockedAt: 'Oct 2025',
    },
    {
      id: 'broker-warned',
      label: 'Fleet Protector',
      desc: 'Warned the carrier network about a predatory broker or slow dock',
      tier: 'gold',
      icon: ShieldCheck,
      unlocked: true,
      unlockedAt: 'Dec 2025',
    },
    {
      id: 'zero-defect-streak',
      label: 'Zero Defect Streak',
      desc: 'Logged 20 consecutive clean pre-trip DVIRs without safety citations',
      tier: 'gold',
      icon: CheckCircle,
      unlocked: true,
      unlockedAt: 'Jan 2026',
    },
    {
      id: 'week-one-user',
      label: 'Week One Pioneer',
      desc: 'Active for 7 consecutive days on the Truckwithease network',
      tier: 'bronze',
      icon: Zap,
      unlocked: true,
      unlockedAt: 'Aug 2025',
    },
    {
      id: 'fifty-actions',
      label: 'Platform Power User',
      desc: 'Completed 50+ loads, inspections, and dispatch synchronizations',
      tier: 'gold',
      icon: Sparkles,
      unlocked: true,
      unlockedAt: 'Feb 2026',
    },
    {
      id: 'million-miler',
      label: 'Million Miler Elite',
      desc: 'Surpassed 1,000,000 incident-free highway miles with zero log falsifications',
      tier: 'diamond',
      icon: Award,
      unlocked: false,
    },
  ]);

  const handleRedeem = (item: RewardItem) => {
    if (points < item.cost) return;
    const newPoints = points - item.cost;
    setPoints(newPoints);
    setRedeemedAlert(`Successfully redeemed: ${item.title}! Check your fleet email for redemption credentials.`);
    setHistory([
      {
        id: `h-${Date.now()}`,
        note: `Redeemed: ${item.title}`,
        at: new Date().toISOString().substring(0, 10),
        points: -item.cost,
      },
      ...history,
    ]);

    setTimeout(() => {
      setRedeemedAlert(null);
    }, 6000);
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const nextTierPoints = 20000;
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#111218] border border-[#2B2D3C] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_20px_rgba(201,168,76,0.25)] shrink-0">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C9A84C] font-bold uppercase tracking-widest">
                DRIVER LOYALTY ECOSYSTEM
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#FFD700] uppercase">
                GOLD TIER FLEET
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans mt-0.5">
              EaseRewards <span className="text-[#FFD700]">&amp; Driver Badges</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA0B4] mt-1 max-w-xl">
              The first real driver loyalty program built into a commercial compliance OS. Every mile, clean inspection day, and fill-up earns points redeemable for fuel and subscription credits.
            </p>
          </div>
        </div>

        {/* Counter Summary Strip */}
        <div className="flex items-center gap-3 bg-[#151924] border border-[#242D3E] p-3 rounded-xl">
          <div className="text-right font-mono">
            <div className="text-[10px] text-zinc-400 uppercase">AVAILABLE BALANCE</div>
            <div className="text-2xl font-black text-[#FFD700]">{points.toLocaleString()} PTS</div>
          </div>
        </div>
      </div>

      {/* Redeemed Banner Alert */}
      {redeemedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1 font-bold">{redeemedAlert}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-[#222432] gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'rewards'
              ? 'border-[#C9A84C] text-[#FFD700] bg-[#C9A84C]/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Gift className={`w-4 h-4 ${activeTab === 'rewards' ? 'text-[#FFD700]' : 'text-zinc-500'}`} />
          Points &amp; Rewards Catalog
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'badges'
              ? 'border-[#C9A84C] text-[#FFD700] bg-[#C9A84C]/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Award className={`w-4 h-4 ${activeTab === 'badges' ? 'text-[#FFD700]' : 'text-zinc-500'}`} />
          Driver Badges ({unlockedCount} / {badges.length} Unlocked)
        </button>
      </div>

      {activeTab === 'rewards' && (
        <>
          {/* Top Tier Status & How You Earn Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tier Card (4 Cols) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#1A1810] via-[#12110D] to-[#0A0A0A] border-2 border-[#C9A84C]/50 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 text-[#C9A84C] mb-1">
                  <Award className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFD700]">
                    GOLD DRIVER TIER
                  </span>
                </div>
                <div className="text-5xl font-black font-mono text-white mt-2">
                  {points.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">points active &amp; ready</div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#332A18]">
                <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1.5">
                  <span>Gold Tier</span>
                  <span className="text-[#FFD700] font-bold">Platinum Tier @ 20,000 pts</span>
                </div>
                <div className="h-2 rounded-full bg-[#201D16] overflow-hidden border border-[#3E3522]">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9A84C] to-[#FFD700] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-2">
                  {(nextTierPoints - points).toLocaleString()} points to next tier (Unlocks 1.5x Multiplier)
                </div>
              </div>
            </div>

            {/* How You Earn Rules (8 Cols) */}
            <div className="lg:col-span-8 bg-[#11131C] border border-[#222736] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 font-mono font-bold text-sm text-white">
                <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
                HOW DRIVERS EARN EASEREWARDS POINTS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {[
                  { action: 'Clean CVSA Level 1-3 Inspection', pts: '+500 PTS', desc: 'Zero violations logged on DOT inspection report' },
                  { action: 'Daily Pre-Trip & Post-Trip DVIR', pts: '+50 PTS', desc: 'Same-day 49 CFR § 396.11 signed inspection' },
                  { action: 'On-Time Freight Delivery', pts: '+150 PTS', desc: 'Arrive within receiver scheduled appointment window' },
                  { action: '500 Safe Driving Miles', pts: '+100 PTS', desc: 'Logged with zero harsh braking or HOS violations' },
                  { action: 'Roadside Danger / Radar Alert', pts: '+75 PTS', desc: 'Warn fellow drivers of bridge hazards or accidents' },
                  { action: 'Predatory Broker / Detention Report', pts: '+120 PTS', desc: 'File verified detention clock proof' },
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#151924] border border-[#232B3C] rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{rule.action}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{rule.desc}</div>
                    </div>
                    <span className="font-black text-[#FFD700] shrink-0 text-sm ml-2">
                      {rule.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white uppercase tracking-tight font-mono">
                REDEEM YOUR EASEREWARDS POINTS
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                1-Touch Instant Digital Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG.map((item) => {
                const canAfford = points >= item.cost;
                return (
                  <div
                    key={item.id}
                    className={`bg-[#11131C] border rounded-xl p-5 flex flex-col justify-between transition-all ${
                      canAfford
                        ? 'border-[#283246] hover:border-[#C9A84C]'
                        : 'border-[#1C202C] opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#181D29] border border-[#252E42] flex items-center justify-center text-[#FFD700]">
                          {item.category === 'fuel' ? (
                            <Fuel className="w-5 h-5 text-[#FFD700]" />
                          ) : item.category === 'subscription' ? (
                            <Tag className="w-5 h-5 text-[#C9A84C]" />
                          ) : (
                            <Gift className="w-5 h-5 text-[#FFD700]" />
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#1A1F2C] text-zinc-300 border border-[#273044]">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm">{item.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1C202C] flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#FFD700]">
                        {item.cost.toLocaleString()} PTS
                      </span>
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-colors ${
                          canAfford
                            ? 'bg-[#C9A84C] hover:bg-[#FFD700] text-black shadow-[0_0_10px_rgba(201,168,76,0.3)]'
                            : 'bg-[#181C26] text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Now' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History Ledger */}
          <div className="bg-[#11131C] border border-[#222736] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-[#222736]">
              <h2 className="font-mono font-bold text-sm text-white">POINTS TRANSACTION HISTORY</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0C12] text-zinc-400 uppercase border-b border-[#222736]">
                  <tr>
                    <th className="p-4">ACTIVITY DESCRIPTION</th>
                    <th className="p-4">DATE</th>
                    <th className="p-4 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181C26]">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[#151924] transition-colors">
                      <td className="p-4 text-zinc-200 font-medium">{h.note}</td>
                      <td className="p-4 text-zinc-400">{h.at}</td>
                      <td
                        className={`p-4 text-right font-black ${
                          h.points >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {h.points >= 0 ? `+${h.points}` : h.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DRIVER BADGES & ACHIEVEMENTS */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-[#11131C] border border-[#222736] rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#FFD700] text-xs font-mono font-bold">
                <Award className="w-4 h-4" />
                VERIFIED OPERATIONAL ACHIEVEMENTS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-sans mt-0.5">
                Class A Driver Badges
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Earned strictly from real activity: booked loads, submitted DVIRs, and highway safety milestones. Never manually handed out.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#FFD700] font-bold">
                {unlockedCount} / {badges.length} UNLOCKED
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-5 border text-center transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                    b.unlocked
                      ? 'bg-gradient-to-b from-[#181C26] to-[#0E1017] border-[#C9A84C]/60 shadow-[0_0_20px_rgba(201,168,76,0.15)]'
                      : 'bg-[#0E1017]/80 border-[#1F2536] opacity-60'
                  }`}
                >
                  {/* Tier indicator pill */}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      b.tier === 'diamond'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : b.tier === 'gold'
                        ? 'bg-[#C9A84C]/20 text-[#FFD700] border border-[#C9A84C]/40'
                        : b.tier === 'silver'
                        ? 'bg-zinc-700/30 text-zinc-300 border border-zinc-600'
                        : 'bg-amber-900/30 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {b.tier}
                  </span>

                  <div className="my-2">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 mb-3 ${
                        b.unlocked
                          ? 'bg-[#181C26] border-[#FFD700] text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                          : 'bg-[#10131B] border-zinc-700 text-zinc-600'
                      }`}
                    >
                      {b.unlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-6 h-6" />}
                    </div>

                    <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
                      {b.label}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xs">
                      {b.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1C202E] w-full text-[10px] font-mono">
                    {b.unlocked ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked: {b.unlockedAt}
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Criteria Not Yet Met
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
