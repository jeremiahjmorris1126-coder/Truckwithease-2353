import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Download,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  insurancePartnersService,
  NATIONWIDE_INSURANCE_PARTNERS,
  InsuranceAgencyPartner,
  TelematicsUnderwritingProfile,
} from '../services/insurancePartnersService';
import {
  SyncInsuranceDiscounts,
  CarrierDiscountSyncResult,
} from '../services/InsuranceProviderIntegration';

interface InsurancePartnersViewProps {
  onShowToast?: (msg: string) => void;
}

export const InsurancePartnersView: React.FC<InsurancePartnersViewProps> = ({ onShowToast }) => {
  const [fleetSize, setFleetSize] = useState<number>(4);
  const [harshBraking, setHarshBraking] = useState<number>(0.3);
  const [speedCompliance, setSpeedCompliance] = useState<number>(96.5);
  const [hosPurity, setHosPurity] = useState<number>(99.5);
  const [dvirPassRate, setDvirPassRate] = useState<number>(98.0);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<CarrierDiscountSyncResult | null>(null);

  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const profile: TelematicsUnderwritingProfile = insurancePartnersService.calculateUnderwritingScore(
    fleetSize,
    harshBraking,
    speedCompliance,
    hosPurity,
    dvirPassRate
  );

  const handleSyncDiscounts = async () => {
    setIsSyncing(true);
    try {
      const res = await SyncInsuranceDiscounts('4109822', { fleetSize });
      setSyncResult(res);
      if (onShowToast) {
        onShowToast(`Verified ${res.maxRateReductionPct}% max rate reduction across ${res.partnerOffers.length} agencies!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredPartners = NATIONWIDE_INSURANCE_PARTNERS.filter((p) => {
    const matchesState =
      stateFilter === 'ALL' ||
      p.licensedStates.includes('ALL_50_STATES') ||
      p.licensedStates.includes(stateFilter);
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.headquarters.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesQuery;
  });

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans text-white">
      {/* Top Banner */}
      <div className="border-b border-[#222] pb-5 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#FFD700]" />
                NATIONWIDE TELEMATICS UNDERWRITING NETWORK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase">
                15% – 35% FLEET PREMIUM CREDITS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-[#FFD700]" />
              Insurance Agency Partners &amp; Telematics Discounts
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl mt-1">
              Connect your verified J1939 CAN-bus engine telematics, HOS log purity, and clean DVIR records directly with certified commercial insurance underwriters nationwide to slash annual fleet premiums by up to 35%.
            </p>
          </div>

          <button
            onClick={handleSyncDiscounts}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-bold font-mono text-xs uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'INTERROGATING AGENCIES...' : 'SYNC INSURANCE DISCOUNTS (DOT #4109822)'}</span>
          </button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className="bg-[#0c1322] border border-emerald-800/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                TELEMATICS UNDERWRITING CERTIFIED: {syncResult.telematicsTier} ({syncResult.maxRateReductionPct}% MAXIMUM RATE REDUCTION)
              </div>
              <div className="text-neutral-400 text-[11px] mt-0.5">
                Calculated across {syncResult.partnerOffers.length} nationwide underwriters. Top recommended partner: <strong className="text-emerald-400">{syncResult.recommendedPartner.partnerName}</strong>.
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded bg-emerald-900/40 border border-emerald-700/60 text-emerald-300 font-black text-sm whitespace-nowrap">
            -{syncResult.maxRateReductionPct}% MAX CREDIT
          </div>
        </div>
      )}

      {/* Sliders and Savings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0e121d] border border-[#1d273d] p-5 rounded-2xl space-y-5 font-mono">
          <div className="flex items-center justify-between border-b border-[#1c263c] pb-3">
            <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Live Telematics Underwriting Modulator
            </span>
            <span className="text-[11px] text-neutral-400">
              USDOT #4109822 // Dynamic Score Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Fleet Size:</span>
                <span className="text-[#FFD700] font-bold">{fleetSize} Power Units</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-[#FFD700] bg-[#1a2336] rounded-lg h-2"
              />
              <span className="text-[10px] text-neutral-500">Benchmark commercial liability: ~$11,000/unit/yr</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Harsh Braking Index:</span>
                <span className="text-emerald-400 font-bold">{harshBraking} / 1,000 mi</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={harshBraking}
                onChange={(e) => setHarshBraking(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-[#1a2336] rounded-lg h-2"
              />
              <span className="text-[10px] text-neutral-500">FMCSA safety threshold: &lt; 0.5 per 1,000 miles</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Speed Limit Compliance:</span>
                <span className="text-cyan-400 font-bold">{speedCompliance}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                step="0.5"
                value={speedCompliance}
                onChange={(e) => setSpeedCompliance(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-[#1a2336] rounded-lg h-2"
              />
              <span className="text-[10px] text-neutral-500">% of transit miles within legal speed envelope</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>HOS Log Purity Factor:</span>
                <span className="text-purple-400 font-bold">{hosPurity}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="100"
                step="0.1"
                value={hosPurity}
                onChange={(e) => setHosPurity(Number(e.target.value))}
                className="w-full accent-purple-400 bg-[#1a2336] rounded-lg h-2"
              />
              <span className="text-[10px] text-neutral-500">Zero 11h/14h statutory form &amp; manner citations</span>
            </div>
          </div>
        </div>

        {/* Dynamic Savings Card */}
        <div className="bg-[#0e121d] border border-[#1d273d] p-5 rounded-2xl flex flex-col justify-between font-mono space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>COMPOSITE SAFETY SCORE:</span>
              <span className="text-white font-bold text-base">{profile.compositeSafetyScore} / 100</span>
            </div>

            <div className="w-full bg-[#0a0e17] h-3 rounded-full overflow-hidden border border-[#222]">
              <div
                className="bg-gradient-to-r from-[#FFD700] via-cyan-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${profile.compositeSafetyScore}%` }}
              />
            </div>

            <div className="pt-2">
              <span className="px-2.5 py-1 rounded bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 text-xs font-black uppercase tracking-wider">
                {profile.tier}
              </span>
            </div>
          </div>

          <div className="bg-[#121828] border border-[#1e2a44] p-4 rounded-xl space-y-1 text-center">
            <span className="text-[11px] text-neutral-400 uppercase">Estimated Fleet Annual Savings</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              -${profile.estimatedAnnualSavingsUsd.toLocaleString()} USD
            </div>
            <span className="text-[10px] text-neutral-500">
              {profile.effectiveRateReductionPct}% Rate Credit
            </span>
          </div>

          <button
            onClick={() => {
              if (onShowToast) onShowToast('Official Underwriting Certificate generated!');
            }}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#FFD700]" />
            <span>DOWNLOAD CERTIFICATE</span>
          </button>
        </div>
      </div>

      {/* Agency Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e121d] border border-[#1d273d] p-3 rounded-xl font-mono text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-[#FFD700]" />
            <span className="text-white font-bold uppercase">Nationwide Insurance Agency Directory ({filteredPartners.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search agency, state, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#080b12] border border-[#222e47] rounded text-white text-xs focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-[#080b12] border border-[#222e47] rounded px-2.5 py-1.5 text-neutral-300 text-xs focus:outline-none"
            >
              <option value="ALL">All 50 States</option>
              <option value="TX">Texas (TX)</option>
              <option value="CA">California (CA)</option>
              <option value="IL">Illinois (IL)</option>
              <option value="TN">Tennessee (TN)</option>
              <option value="NC">North Carolina (NC)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-[#0e121d] border border-[#1d273d] hover:border-[#2f3f60] p-5 rounded-2xl space-y-4 transition-all hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">{partner.name}</h3>
                    <span className="text-[11px] text-neutral-400">{partner.headquarters} • {partner.rating}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-xs">
                    UP TO {partner.maxDiscountPct}% OFF
                  </span>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {partner.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {partner.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded bg-[#141b2c] border border-[#222f4c] text-neutral-300 text-[10px]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1c263c] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Savings / Unit:</span>
                  <span className="text-emerald-400 font-bold">~${partner.averageAnnualSavingsPerTruckUsd.toLocaleString()} USD / yr</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={partner.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-lg bg-[#FFD700] hover:bg-[#E5C100] text-black font-bold text-xs uppercase transition-colors text-center"
                  >
                    Request Partner Quote
                  </a>

                  <a
                    href={partner.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1e273e] text-neutral-300 border border-[#222f4c]"
                    title="Agency Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
