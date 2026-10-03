import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Fuel,
  Flame,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { MOCK_IFTA_RECORD } from '../data/mockData';
import { IftaQuarterRecord } from '../types';

interface IftaViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const IftaView: React.FC<IftaViewProps> = ({ onNavigateToTab }) => {
  const [iftaData, setIftaData] = useState<IftaQuarterRecord>(MOCK_IFTA_RECORD);
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 2026');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  // New Fuel Receipt State
  const [fuelState, setFuelState] = useState('OH');
  const [gallonsPumped, setGallonsPumped] = useState('180');
  const [stationName, setStationName] = useState('Pilot Travel Center #412');
  const [pricePerGal, setPricePerGal] = useState('3.89');

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const gallons = parseFloat(gallonsPumped) || 100;

    // Update the state's tax-paid gallons
    setIftaData((prev) => {
      const updatedJurisdictions = prev.jurisdictions.map((j) => {
        if (j.stateCode === fuelState) {
          const newTaxPaid = j.taxPaidGallons + gallons;
          const newNetTaxable = j.taxableGallons - newTaxPaid;
          const newNetTaxDue = +(newNetTaxable * j.taxRate).toFixed(2);
          return {
            ...j,
            taxPaidGallons: newTaxPaid,
            netTaxableGallons: newNetTaxable,
            netTaxDue: newNetTaxDue,
          };
        }
        return j;
      });

      const newTotalGallons = prev.totalGallons + gallons;
      const newMpg = +(prev.totalMiles / newTotalGallons).toFixed(2);
      const newTotalNetDue = +updatedJurisdictions
        .reduce((sum, j) => sum + j.netTaxDue, 0)
        .toFixed(2);

      return {
        ...prev,
        totalGallons: newTotalGallons,
        fleetMpg: newMpg,
        totalNetTaxDue: newTotalNetDue,
        jurisdictions: updatedJurisdictions,
      };
    });

    setIsFuelModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // INTERNATIONAL FUEL TAX AGREEMENT (IFTA)
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest">
              BASE STATE: PENNSYLVANIA (PA)
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl uppercase text-white font-black tracking-tight mt-1 flex items-center gap-2">
            IFTA Fuel Tax &amp; Mileage Audit
            <span className="inline-block w-2 h-2 bg-[#C9A84C]" />
          </h1>
          <p className="text-xs font-mono text-[#888] mt-1">
            Automated multi-jurisdictional GPS mileage logging, fuel receipt reconciliation, and quarterly tax return generation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('fuel-idle')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#282828] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>FUEL / IDLE HEATMAP</span>
            </button>
          )}
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4 text-[#C9A84C]" />
            <span>RECORD FUEL RECEIPT</span>
          </button>
          <button
            onClick={() => alert(`Quarterly IFTA Tax Return for ${selectedQuarter} exported with all jurisdictional schedules.`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            <Download className="w-4 h-4 text-black" />
            <span>EXPORT IFTA AUDIT PDF</span>
          </button>
        </div>
      </div>

      {/* Quarter Selector & High-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-[#141414] border border-[#222]">
          <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
            TOTAL FLEET MILES ({selectedQuarter})
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">
              {iftaData.totalMiles.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#666]">MI</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#555]">
            Via GPS Telematics &amp; ELD
          </div>
        </div>

        <div className="p-4 bg-[#141414] border border-[#222]">
          <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
            TOTAL GALLONS CONSUMED
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">
              {iftaData.totalGallons.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#666]">GAL</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#555]">
            Diesel #2 Fuel Poured
          </div>
        </div>

        <div className="p-4 bg-[#141414] border border-[#222]">
          <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
            FLEET AVERAGE MPG
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A84C]">
              {iftaData.fleetMpg}
            </span>
            <span className="text-xs font-mono text-[#666]">MPG</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-400">
            Compliant calculation ratio
          </div>
        </div>

        <div className="p-4 bg-[#141414] border border-[#222]">
          <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
            NET IFTA TAX DUE / (CREDIT)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-mono font-black ${
              iftaData.totalNetTaxDue > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              ${Math.abs(iftaData.totalNetTaxDue).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#666]">
              {iftaData.totalNetTaxDue > 0 ? 'DUE' : 'CREDIT'}
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#555]">
            Due Date: October 31, 2026
          </div>
        </div>
      </div>

      {/* State-by-State Jurisdictional Table */}
      <div className="p-5 bg-[#141414] border border-[#222] space-y-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div>
            <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
              SCHEDULE A: JURISDICTIONAL BREAKDOWN
            </span>
            <h3 className="font-headline text-lg uppercase font-black text-white mt-0.5">
              Multi-State Distance &amp; Fuel Tax Reconciliation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2025'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                  selectedQuarter === q
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'bg-[#0A0A0A] text-[#777] border border-[#222] hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#222] text-[#777] text-[10px] uppercase">
                <th className="py-2.5 px-3">State / Jurisdiction</th>
                <th className="py-2.5 px-3 text-right">Taxable Miles</th>
                <th className="py-2.5 px-3 text-right">Taxable Gal</th>
                <th className="py-2.5 px-3 text-right">Paid Gal</th>
                <th className="py-2.5 px-3 text-right">Net Gal</th>
                <th className="py-2.5 px-3 text-right">Tax Rate</th>
                <th className="py-2.5 px-3 text-right">Net Tax Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {iftaData.jurisdictions.map((j) => (
                <tr key={j.stateCode} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#0A0A0A] border border-[#333] flex items-center justify-center text-[10px] text-[#C9A84C]">
                      {j.stateCode}
                    </span>
                    <span>{j.stateName}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-white font-semibold">
                    {j.taxableMiles.toLocaleString()} mi
                  </td>
                  <td className="py-3 px-3 text-right text-[#AAA]">
                    {j.taxableGallons.toLocaleString()} gal
                  </td>
                  <td className="py-3 px-3 text-right text-[#AAA]">
                    {j.taxPaidGallons.toLocaleString()} gal
                  </td>
                  <td className={`py-3 px-3 text-right font-bold ${
                    j.netTaxableGallons > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {j.netTaxableGallons > 0 ? `+${j.netTaxableGallons}` : j.netTaxableGallons}
                  </td>
                  <td className="py-3 px-3 text-right text-[#888]">
                    ${j.taxRate.toFixed(3)}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-black ${
                    j.netTaxDue > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {j.netTaxDue > 0 ? `$${j.netTaxDue.toFixed(2)}` : `($${Math.abs(j.netTaxDue).toFixed(2)})`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#333] bg-[#0A0A0A] font-bold text-white">
                <td className="py-3 px-3 uppercase text-[11px]">Quarter Summary Total</td>
                <td className="py-3 px-3 text-right">{iftaData.totalMiles.toLocaleString()} mi</td>
                <td className="py-3 px-3 text-right">{iftaData.totalGallons.toLocaleString()} gal</td>
                <td className="py-3 px-3 text-right">
                  {iftaData.jurisdictions.reduce((s, j) => s + j.taxPaidGallons, 0).toLocaleString()} gal
                </td>
                <td className="py-3 px-3 text-right">-</td>
                <td className="py-3 px-3 text-right">-</td>
                <td className="py-3 px-3 text-right text-[#C9A84C] font-black text-sm">
                  ${iftaData.totalNetTaxDue.toFixed(2)} USD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Record Fuel Receipt Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#141414] border border-[#333] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
                  IFTA FUEL RECONCILIATION
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white">
                  Record Fuel Purchase
                </h3>
              </div>
              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="text-[#666] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFuel} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#888] uppercase mb-1">State Purchased</label>
                <select
                  value={fuelState}
                  onChange={(e) => setFuelState(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                >
                  {iftaData.jurisdictions.map((j) => (
                    <option key={j.stateCode} value={j.stateCode}>
                      {j.stateCode} - {j.stateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#888] uppercase mb-1">Gallons Pumped</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={gallonsPumped}
                  onChange={(e) => setGallonsPumped(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#888] uppercase mb-1">Truck Stop / Vendor</label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] p-2.5 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9A84C] text-black font-black uppercase text-xs hover:bg-white transition-colors"
                >
                  Reconcile Fuel Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
