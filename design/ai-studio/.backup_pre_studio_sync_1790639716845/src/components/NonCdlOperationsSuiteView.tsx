import React, { useState, useMemo } from 'react';
import {
  Truck,
  ShieldCheck,
  Scale,
  Compass,
  Clock,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  Maximize2,
  Layers,
  Info,
  DollarSign,
  MapPin,
  Check,
  Download,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { TabType, UserRoleType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface NonCdlOperationsSuiteViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  userRole?: UserRoleType;
}

interface VehiclePreset {
  id: string;
  name: string;
  category: 'BOX_TRUCK' | 'HOTSHOT' | 'SPRINTER_CARGO';
  truckTareLbs: number;
  trailerTareLbs: number;
  gvwrRatingLbs: number;
  gcwrRatingLbs: number;
  deckLengthFt: number;
  deckWidthIn: number;
  cargoCubeCuFt: number;
  liftgateMaxLbs?: number;
  maxPalletPositions: number;
  typicalMpg: number;
}

const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: 'freightliner-26ft',
    name: 'Freightliner M2 106 (26ft Box Truck w/ 3,000 lb Liftgate)',
    category: 'BOX_TRUCK',
    truckTareLbs: 13800,
    trailerTareLbs: 0,
    gvwrRatingLbs: 25999,
    gcwrRatingLbs: 25999,
    deckLengthFt: 26,
    deckWidthIn: 102,
    cargoCubeCuFt: 1800,
    liftgateMaxLbs: 3000,
    maxPalletPositions: 12,
    typicalMpg: 10.5,
  },
  {
    id: 'ram-hotshot-40ft',
    name: 'Ram 3500 Dually + 40ft Gooseneck Hotshot (Non-CDL Derated)',
    category: 'HOTSHOT',
    truckTareLbs: 9100,
    trailerTareLbs: 7600,
    gvwrRatingLbs: 14000,
    gcwrRatingLbs: 25900,
    deckLengthFt: 40,
    deckWidthIn: 102,
    cargoCubeCuFt: 0,
    liftgateMaxLbs: 0,
    maxPalletPositions: 18,
    typicalMpg: 12.8,
  },
  {
    id: 'ford-transit-highroof',
    name: 'Ford Transit 350 Extended High Roof Cargo Van',
    category: 'SPRINTER_CARGO',
    truckTareLbs: 6200,
    trailerTareLbs: 0,
    gvwrRatingLbs: 11000,
    gcwrRatingLbs: 15000,
    deckLengthFt: 14,
    deckWidthIn: 70,
    cargoCubeCuFt: 487,
    liftgateMaxLbs: 0,
    maxPalletPositions: 3,
    typicalMpg: 16.5,
  },
  {
    id: 'international-24ft',
    name: 'International MV607 (24ft Box Truck w/ Railgate)',
    category: 'BOX_TRUCK',
    truckTareLbs: 12900,
    trailerTareLbs: 0,
    gvwrRatingLbs: 25999,
    gcwrRatingLbs: 25999,
    deckLengthFt: 24,
    deckWidthIn: 96,
    cargoCubeCuFt: 1550,
    liftgateMaxLbs: 2500,
    maxPalletPositions: 10,
    typicalMpg: 11.2,
  },
];

interface PalletItem {
  id: number;
  loaded: boolean;
  weightLbs: number;
  description: string;
  securement: string;
}

interface TimecardEntry {
  dayLabel: string;
  dateStr: string;
  startDuty: string;
  endDuty: string;
  totalDutyHours: number;
  totalDrivingHours: number;
  homeTerminal: string;
  maxAirMiles: number;
  isCompliant: boolean;
}

export const NonCdlOperationsSuiteView: React.FC<NonCdlOperationsSuiteViewProps> = ({
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'weight-sentinel' | 'short-haul-timecard' | 'cargo-cube' | 'dvir-inspection' | 'roadside-shield' | 'profit-calculator'
  >('weight-sentinel');

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('freightliner-26ft');
  const vehicle = useMemo(
    () => VEHICLE_PRESETS.find((v) => v.id === selectedVehicleId) || VEHICLE_PRESETS[0],
    [selectedVehicleId]
  );

  const [driverEquipWeight, setDriverEquipWeight] = useState<number>(300);
  const [fuelGallons, setFuelGallons] = useState<number>(50);

  const [pallets, setPallets] = useState<PalletItem[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      loaded: i < 8,
      weightLbs: 950,
      description: i < 8 ? ("Pallet #" + (i + 1) + " - Active Freight") : 'Empty Position',
      securement: '2-INCH STRAP (3,333 LB WLL)',
    }))
  );

  const palletTotalWeight = useMemo(() => {
    return pallets.filter((p) => p.loaded).reduce((acc, p) => acc + p.weightLbs, 0);
  }, [pallets]);

  const fuelWeightLbs = Math.round(fuelGallons * 7.1);
  const totalTareWeight = vehicle.truckTareLbs + vehicle.trailerTareLbs;
  const currentGrossWeight = totalTareWeight + driverEquipWeight + fuelWeightLbs + palletTotalWeight;
  const ceilingWeight = 26000;
  const marginRemainingLbs = ceilingWeight - currentGrossWeight;
  const isOverweightCeiling = currentGrossWeight >= 26001;
  const isCautionWeight = currentGrossWeight >= 24500 && !isOverweightCeiling;

  const [homeBase] = useState('St. Louis Terminal, MO (38.6270 N, 90.1994 W)');
  const [currentDestination, setCurrentDestination] = useState('Columbia, MO (Central Logistics)');
  const [directAirMiles, setDirectAirMiles] = useState<number>(98.4);
  const [drivingRoadMiles] = useState<number>(121.6);
  const [clockInTime] = useState('06:30 AM');
  const [currentDutyHours] = useState<number>(8.25);
  const [isShiftLogged, setIsShiftLogged] = useState(false);

  const isShortHaulExempt = directAirMiles <= 150;
  const hoursRemainingIn14 = Math.max(0, 14 - currentDutyHours);

  const [timecardHistory] = useState<TimecardEntry[]>([
    { dayLabel: 'TODAY', dateStr: new Date().toLocaleDateString(), startDuty: '06:30 AM', endDuty: 'IN PROGRESS', totalDutyHours: 8.25, totalDrivingHours: 6.5, homeTerminal: 'St. Louis Terminal, MO', maxAirMiles: 98.4, isCompliant: true },
    { dayLabel: 'YESTERDAY', dateStr: new Date(Date.now() - 86400000).toLocaleDateString(), startDuty: '06:45 AM', endDuty: '06:15 PM', totalDutyHours: 11.5, totalDrivingHours: 8.0, homeTerminal: 'St. Louis Terminal, MO', maxAirMiles: 112.0, isCompliant: true },
    { dayLabel: '2 DAYS AGO', dateStr: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), startDuty: '07:00 AM', endDuty: '05:30 PM', totalDutyHours: 10.5, totalDrivingHours: 7.25, homeTerminal: 'St. Louis Terminal, MO', maxAirMiles: 84.5, isCompliant: true },
    { dayLabel: '3 DAYS AGO', dateStr: new Date(Date.now() - 86400000 * 3).toLocaleDateString(), startDuty: '06:15 AM', endDuty: '07:00 PM', totalDutyHours: 12.75, totalDrivingHours: 8.5, homeTerminal: 'St. Louis Terminal, MO', maxAirMiles: 142.1, isCompliant: true },
  ]);

  const [dvirItems, setDvirItems] = useState([
    { id: 1, label: 'Hydraulic Liftgate: Cylinders, Valves, Safety Latch and Remote Cord', passed: true },
    { id: 2, label: 'Rear Roll-Up / Barn Doors: Hinges, Springs, Cables, Locking Mechanism', passed: true },
    { id: 3, label: 'Cargo Box Interior: E-Track Rails, Floor Integrity, No Leaks', passed: true },
    { id: 4, label: 'Cargo Securement: WLL Straps, Chains, Edge Protectors (49 CFR 393.102)', passed: true },
    { id: 5, label: 'Hotshot Gooseneck Ball (2-5/16 in): Lock Pin, Breakaway Cable, Battery Check', passed: true },
    { id: 6, label: 'Trailer Brake Controller: In-Cab Gain and Manual Slide Test', passed: true },
    { id: 7, label: 'Tires: Steer 4/32 in, Drive/Trailer 2/32 in, Lug Nuts and Hub Oil', passed: true },
    { id: 8, label: 'In-Cab Safety Kit: Fire Extinguisher (5/10 B:C), 3 Triangles (49 CFR 393.95)', passed: true },
    { id: 9, label: 'DOT Medical Card: Physical MCSA-5876 in Arm Reach (49 CFR 391.41)', passed: true },
  ]);

  const [dvirSigned, setDvirSigned] = useState(false);
  const [isShieldModalOpen, setIsShieldModalOpen] = useState(false);

  const [freightRate, setFreightRate] = useState<number>(1450);
  const [tripMiles, setTripMiles] = useState<number>(420);
  const [deadheadMiles, setDeadheadMiles] = useState<number>(45);
  const [fuelPricePerGal, setFuelPricePerGal] = useState<number>(3.75);
  const [tollCost, setTollCost] = useState<number>(32);
  const [accessorialFee, setAccessorialFee] = useState<number>(125);

  const totalMiles = tripMiles + deadheadMiles;
  const gallonsNeeded = totalMiles / vehicle.typicalMpg;
  const fuelExpense = gallonsNeeded * fuelPricePerGal;
  const totalRevenue = freightRate + accessorialFee;
  const netEarnings = totalRevenue - fuelExpense - tollCost;
  const netRatePerMile = (netEarnings / Math.max(1, totalMiles)).toFixed(2);
  const grossRatePerMile = (totalRevenue / Math.max(1, tripMiles)).toFixed(2);

  const handleTogglePallet = (id: number) => {
    triggerHapticFeedback('tick');
    setPallets((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, loaded: !p.loaded, description: !p.loaded ? ("Pallet #" + id + " - Active Freight") : 'Empty Spot' }
          : p
      )
    );
  };

  const handleToggleDvir = (id: number) => {
    triggerHapticFeedback('tick');
    setDvirItems((prev) => prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item)));
  };

  const handleSignDvir = () => {
    triggerHapticFeedback('success');
    setDvirSigned(true);
    alert('NON-CDL PRE-TRIP DVIR SIGNED AND RECORDED TO PERSISTENT LEDGER (49 CFR 396.11)');
  };

  return (
    <div className="w-full flex flex-col gap-6 text-[#F1F5F9] font-['Inter',sans-serif]">
      {/* 1. TOP HEADER & OPERATIONAL CLASSIFICATION STRIP */}
      <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A24] to-[#122417] border border-[#4ADE80]/50 flex items-center justify-center text-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.25)] shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Rajdhani'] font-bold text-xl sm:text-2xl uppercase tracking-wider text-[#F1F5F9]">
                Non-CDL 26K Commercial Fleet Suite
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-['Chakra_Petch'] font-bold bg-[#1B3824] text-[#86EFAC] border border-[#4ADE80]/40 uppercase tracking-widest">
                FMCSA 10,001 - 26,000 LBS
              </span>
            </div>
            <p className="text-xs text-[#94A39A] font-['Inter'] mt-0.5">
              Statutory 49 CFR Parts 390-396 Protection | 26,000 LB Ceiling Sentinel | 150 Air-Mile Short-Haul | Specialized DVIR
            </p>
          </div>
        </div>

        {/* Vehicle Preset Selector & Roadside Shield Trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-[#0A0E0B] border border-[#2D3F32] text-xs font-['Chakra_Petch'] font-semibold text-[#F1F5F9] px-3 py-2 rounded-lg focus:border-[#4ADE80] outline-none"
          >
            {VEHICLE_PRESETS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsShieldModalOpen(true)}
            className="btn-mil-coyote text-xs px-3.5 py-2 flex items-center gap-2 shadow-sm shrink-0"
            title="Open 1-Tap Roadside Inspection Shield for DOT Officers"
          >
            <ShieldCheck className="w-4 h-4 text-[#0A0F0B]" />
            <span>ROADSIDE SHIELD</span>
          </button>
        </div>
      </div>

      {/* 2. STATUTORY ALERT & WEIGHT COMPLIANCE SUMMARY BANNER */}
      <div
        className={"p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all " +
          (isOverweightCeiling
            ? 'bg-[#450A0A]/90 border-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.4)]'
            : isCautionWeight
            ? 'bg-[#382B12]/80 border-amber-500/70 text-[#FDE68A]'
            : 'bg-[#141C16] border-[#2D3F32] text-[#F1F5F9]')}
      >
        <div className="flex items-center gap-3">
          <div
            className={"w-10 h-10 rounded-lg flex items-center justify-center shrink-0 " +
              (isOverweightCeiling ? 'bg-red-950 text-red-400' : isCautionWeight ? 'bg-amber-950 text-amber-400' : 'bg-[#1C3622] text-[#4ADE80]')}
          >
            {isOverweightCeiling ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            ) : isCautionWeight ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-['Chakra_Petch'] uppercase tracking-widest font-bold">
              {isOverweightCeiling
                ? 'CRITICAL DEFCON 1: 26,001 LB CEILING BREACHED!'
                : isCautionWeight
                ? 'WARNING: WITHIN 1,500 LBS OF 26,000 LB NON-CDL CEILING'
                : 'LEGAL NON-CDL OPERATION VERIFIED (UNDER 26,000 LBS GCWR)'}
            </div>
            <div className="text-sm font-['Inter'] font-semibold mt-0.5">
              Current Combined Weight: <span className="font-['JetBrains_Mono'] font-bold">{currentGrossWeight.toLocaleString()} lbs</span> / 26,000 lbs Max
              {' | '}
              <span className={isOverweightCeiling ? 'text-red-200' : 'text-[#86EFAC]'}>
                {marginRemainingLbs >= 0 ? (marginRemainingLbs.toLocaleString() + " lbs safety margin remaining") : (Math.abs(marginRemainingLbs).toLocaleString() + " LBS OVER LEGAL CEILING")}
              </span>
            </div>
          </div>
        </div>

        {isOverweightCeiling && (
          <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-red-500/60 text-xs font-['Chakra_Petch'] text-red-200">
            49 CFR 383.23 Violation: Mandatory Class A/B CDL Required
          </div>
        )}
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: 'weight-sentinel', label: '26K Weight Sentinel', icon: Scale, badge: (marginRemainingLbs >= 0 ? '+' : '') + marginRemainingLbs + ' LBS' },
          { id: 'short-haul-timecard', label: '150 Air-Mile Timecard', icon: Compass, badge: isShortHaulExempt ? 'EXEMPT' : 'RODS' },
          { id: 'cargo-cube', label: 'Box & Hotshot Floorplan', icon: Layers, badge: pallets.filter((p) => p.loaded).length + '/' + pallets.length + ' POS' },
          { id: 'dvir-inspection', label: 'Non-CDL DVIR Inspector', icon: ClipboardCheck, badge: dvirSigned ? 'SIGNED' : 'PENDING' },
          { id: 'roadside-shield', label: 'Roadside Statutory Shield', icon: ShieldCheck, badge: 'OFFICER' },
          { id: 'profit-calculator', label: 'Non-CDL Freight RPM', icon: DollarSign, badge: '$' + netRatePerMile + '/MI' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHapticFeedback('tick');
                setActiveSubTab(tab.id as any);
              }}
              className={"flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-['Chakra_Petch'] font-bold uppercase transition-all shrink-0 active:scale-95 " +
                (isActive
                  ? 'bg-gradient-to-r from-[#1E3A24] via-[#2D5837] to-[#1A3420] text-[#E8F5E9] border border-[#4ADE80]/50 shadow-[0_0_15px_rgba(74,222,128,0.25)]'
                  : 'bg-[#111813] hover:bg-[#16221A] text-[#94A39A] hover:text-[#F1F5F9] border border-[#2B3D30]')}
            >
              <Icon className={"w-4 h-4 " + (isActive ? 'text-[#4ADE80]' : 'text-[#64748B]')} />
              <span>{tab.label}</span>
              <span
                className={"text-[9px] font-['JetBrains_Mono'] px-1.5 py-0.2 rounded font-bold " +
                  (isActive
                    ? 'bg-[#0A0E0B] text-[#4ADE80] border border-[#4ADE80]/30'
                    : 'bg-[#0E1511] text-[#94A39A] border border-[#233327]')}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: 26K WEIGHT CEILING SENTINEL */}
      {activeSubTab === 'weight-sentinel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Configuration Panel */}
          <div className="lg:col-span-7 flex flex-col gap-5 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-[#1E2D22] pb-3">
              <div>
                <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9]">
                  Non-CDL Tare & Payload Breakdown
                </h3>
                <span className="text-xs text-[#94A39A]">
                  49 CFR 383.5 Commercial Motor Vehicle Weight Definition
                </span>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-[#4ADE80] bg-[#142017] px-2 py-1 rounded border border-[#2B4030]">
                CEILING: 26,000 LBS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">
                  Truck Tare / Empty Weight
                </div>
                <div className="text-lg font-['JetBrains_Mono'] font-bold text-[#F1F5F9] mt-0.5">
                  {vehicle.truckTareLbs.toLocaleString()} lbs
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">{vehicle.name.split('(')[0]}</div>
              </div>

              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">
                  Trailer Tare Weight
                </div>
                <div className="text-lg font-['JetBrains_Mono'] font-bold text-[#F1F5F9] mt-0.5">
                  {vehicle.trailerTareLbs > 0 ? (vehicle.trailerTareLbs.toLocaleString() + ' lbs') : 'N/A (Straight Truck)'}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  {vehicle.category === 'HOTSHOT' ? '40ft Gooseneck Flatbed' : 'Integrated Cargo Box'}
                </div>
              </div>

              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="flex items-center justify-between text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">
                  <span>Fuel Allowance (@ 7.1 lb/gal)</span>
                  <span className="text-[#4ADE80] font-['JetBrains_Mono']">{fuelGallons} GAL</span>
                </div>
                <div className="text-lg font-['JetBrains_Mono'] font-bold text-[#F1F5F9] mt-0.5">
                  {fuelWeightLbs.toLocaleString()} lbs
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fuelGallons}
                  onChange={(e) => setFuelGallons(Number(e.target.value))}
                  className="w-full mt-2 accent-[#4ADE80]"
                />
              </div>

              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="flex items-center justify-between text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">
                  <span>Driver & Equipment</span>
                  <span className="text-[#E5B869] font-['JetBrains_Mono']">{driverEquipWeight} LBS</span>
                </div>
                <div className="text-lg font-['JetBrains_Mono'] font-bold text-[#F1F5F9] mt-0.5">
                  {driverEquipWeight} lbs
                </div>
                <input
                  type="range"
                  min="150"
                  max="500"
                  step="25"
                  value={driverEquipWeight}
                  onChange={(e) => setDriverEquipWeight(Number(e.target.value))}
                  className="w-full mt-2 accent-[#E5B869]"
                />
              </div>
            </div>

            <div className="bg-[#141C16] p-4 rounded-xl border border-[#2D3F32] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-['Chakra_Petch'] text-xs uppercase font-bold text-[#F1F5F9]">
                  Total Active Cargo Payload
                </span>
                <span className="font-['JetBrains_Mono'] font-bold text-[#4ADE80] text-sm">
                  {palletTotalWeight.toLocaleString()} lbs
                </span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Synchronized with the {pallets.filter((p) => p.loaded).length} active pallets loaded on the floorplan.
              </p>
              <div className="w-full h-2.5 bg-[#0A0E0B] rounded-full overflow-hidden border border-[#233327]">
                <div
                  className={"h-full transition-all duration-300 " +
                    (isOverweightCeiling ? 'bg-red-500' : isCautionWeight ? 'bg-amber-400' : 'bg-[#4ADE80]')}
                  style={{ width: Math.min(100, (currentGrossWeight / ceilingWeight) * 100) + '%' }}
                />
              </div>
            </div>
          </div>

          {/* Right Visual Gauge */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase tracking-widest font-bold">
                COMBINED GROSS WEIGHT
              </span>

              <div
                className={"font-['JetBrains_Mono'] font-bold text-4xl sm:text-5xl mt-2 " +
                  (isOverweightCeiling ? 'text-red-400' : isCautionWeight ? 'text-amber-400' : 'text-[#4ADE80]')}
              >
                {currentGrossWeight.toLocaleString()}
                <span className="text-lg font-normal text-[#94A39A] ml-1.5">LBS</span>
              </div>

              <div className="w-full mt-4 pt-4 border-t border-[#1E2D22] flex items-center justify-between text-xs font-['Chakra_Petch']">
                <span className="text-[#94A39A]">LEGAL CEILING:</span>
                <span className="text-[#F1F5F9] font-['JetBrains_Mono'] font-bold">26,000 LBS</span>
              </div>

              <div className="w-full mt-2 flex items-center justify-between text-xs font-['Chakra_Petch']">
                <span className="text-[#94A39A]">SAFE BUFFER:</span>
                <span
                  className={"font-['JetBrains_Mono'] font-bold " +
                    (isOverweightCeiling ? 'text-red-400' : 'text-[#86EFAC]')}
                >
                  {marginRemainingLbs >= 0 ? ('+' + marginRemainingLbs.toLocaleString() + ' LBS') : (marginRemainingLbs.toLocaleString() + ' LBS')}
                </span>
              </div>

              <div className="w-full mt-4 p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] text-left text-xs space-y-1.5 font-['Inter']">
                <div className="font-bold text-[#E5B869] font-['Chakra_Petch'] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>Why the 26,000 LB Limit Matters:</span>
                </div>
                <p className="text-[11px] text-[#94A39A] leading-relaxed">
                  Under 49 CFR 383.5, crossing 26,001 lbs automatically classifies the vehicle as a Class A or Class B Commercial Motor Vehicle. Non-CDL drivers caught above 26,000 lbs face immediate roadside out-of-service orders, driver license suspension, and misdemeanor citations.
                </p>
              </div>
            </div>

            <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9]">Floorplan Pallet Editor</div>
                <div className="text-[11px] text-[#94A39A]">Adjust individual skid positions & weights</div>
              </div>
              <button
                onClick={() => setActiveSubTab('cargo-cube')}
                className="btn-mil-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <span>OPEN FLOORPLAN</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 150 AIR-MILE SHORT-HAUL & 14-HOUR TIMECARD */}
      {activeSubTab === 'short-haul-timecard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-5 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-[#1E2D22] pb-3">
              <div>
                <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9]">
                  150 Air-Mile Exemption Radar (49 CFR 395.1(e)(1))
                </h3>
                <span className="text-xs text-[#94A39A]">
                  Statutory Non-ELD Exemption for Drivers Returning to Normal Work Reporting Location
                </span>
              </div>
              <span
                className={"text-[10px] font-['Chakra_Petch'] font-bold px-2 py-0.5 rounded border " +
                  (isShortHaulExempt
                    ? 'bg-[#1B3824] text-[#86EFAC] border-[#4ADE80]/40'
                    : 'bg-[#450A0A] text-red-200 border-red-500/50')}
              >
                {isShortHaulExempt ? '150-MI EXEMPT' : 'RODS REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Home Work Reporting Location</span>
                </div>
                <div className="text-xs font-['Inter'] font-semibold text-[#F1F5F9] mt-1">{homeBase}</div>
                <div className="text-[10px] text-[#64748B] mt-0.5 font-['JetBrains_Mono']">Origin Radial Anchor (0.0 Mi)</div>
              </div>

              <div className="bg-[#0E1410] p-3.5 rounded-lg border border-[#233327]">
                <div className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>Farthest Destination Today</span>
                </div>
                <input
                  type="text"
                  value={currentDestination}
                  onChange={(e) => setCurrentDestination(e.target.value)}
                  className="bg-[#0A0E0B] border border-[#2D3F32] rounded px-2 py-1 text-xs text-[#F1F5F9] w-full mt-1 font-['Inter']"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1410] border border-[#233327] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-['Chakra_Petch'] uppercase text-[#94A39A]">Direct Air-Miles (Radial Vector):</span>
                  <div className="text-2xl font-['JetBrains_Mono'] font-bold text-[#F1F5F9]">
                    {directAirMiles.toFixed(1)} <span className="text-sm font-normal text-[#94A39A]">AIR MILES</span>
                    <span className="text-xs text-[#64748B] ml-2">({drivingRoadMiles.toFixed(1)} Driving Road Miles)</span>
                  </div>
                </div>

                <button
                  onClick={() => setDirectAirMiles((prev) => (prev > 150 ? 98.4 : 168.2))}
                  className="btn-mil-secondary text-[11px] px-2.5 py-1.5"
                  title="Toggle radial boundary test"
                >
                  <RotateCcw className="w-3 h-3 text-[#4ADE80]" />
                  <span>{isShortHaulExempt ? 'Simulate Exceeding 150mi' : 'Reset to 98mi'}</span>
                </button>
              </div>

              <div className="w-full h-3 bg-[#0A0E0B] rounded-full overflow-hidden border border-[#233327] relative">
                <div
                  className={"h-full transition-all duration-300 " +
                    (isShortHaulExempt ? 'bg-[#4ADE80]' : 'bg-red-500')}
                  style={{ width: Math.min(100, (directAirMiles / 150) * 100) + '%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#94A39A]">
                <span>0 AIR MILES (ORIGIN)</span>
                <span className="text-red-400 font-bold">150 AIR MILES (172.6 ROAD MILES CEILING)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141C16] border border-[#2D3F32] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-[#E5B869]" />
                <div>
                  <div className="text-xs font-['Chakra_Petch'] font-bold uppercase text-[#F1F5F9]">
                    14-Hour Work Window (49 CFR 395.1(e)(1)(ii))
                  </div>
                  <div className="text-xs text-[#94A39A]">
                    Clock-in: <span className="text-[#F1F5F9] font-['JetBrains_Mono']">{clockInTime}</span> | Elapsed: <span className="text-[#E5B869] font-['JetBrains_Mono'] font-bold">{currentDutyHours}h</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-['JetBrains_Mono'] font-bold text-[#86EFAC]">
                  {hoursRemainingIn14.toFixed(1)} HOURS REMAINING
                </div>
                <div className="text-[10px] text-[#94A39A]">Must return to terminal by 08:30 PM</div>
              </div>
            </div>
          </div>

          {/* Right 7-Day Timecard Records */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-[#1E2D22] pb-3">
              <div>
                <h4 className="font-['Rajdhani'] font-bold text-base uppercase text-[#F1F5F9]">
                  7-Day True Timecard Ledger
                </h4>
                <span className="text-[11px] text-[#94A39A]">
                  Mandatory 6-Month FMCSA Retention (§ 395.1(e)(1)(iii))
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHapticFeedback('success');
                  alert('Timecard Ledger exported as FMCSA compliance audit CSV.');
                }}
                className="btn-mil-secondary text-[11px] px-2.5 py-1 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
              {timecardHistory.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0E1410] border border-[#233327] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-['Chakra_Petch']">
                    <span className="font-bold text-[#F1F5F9]">{item.dayLabel} ({item.dateStr})</span>
                    <span className="text-[#4ADE80] font-['JetBrains_Mono'] font-bold bg-[#142017] px-1.5 py-0.2 rounded border border-[#2B4030]">
                      {item.totalDutyHours}h DUTY / {item.totalDrivingHours}h DRIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#94A39A] font-['JetBrains_Mono']">
                    <span>Shift: {item.startDuty} - {item.endDuty}</span>
                    <span>Max Radius: {item.maxAirMiles} Air Mi</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                triggerHapticFeedback('success');
                setIsShiftLogged(true);
                alert('Today shift logged into non-CDL timecard record with cryptographic timestamp.');
              }}
              className="btn-mil-primary text-xs py-2 w-full flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#4ADE80]" />
              <span>{isShiftLogged ? 'Shift Logged to FMCSA Ledger' : 'Sign and Complete Today Timecard'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CARGO CUBE & PALLET FLOORPLAN OPTIMIZER */}
      {activeSubTab === 'cargo-cube' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1E2D22] pb-3">
              <div>
                <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9]">
                  {vehicle.name} Cargo Floorplan
                </h3>
                <span className="text-xs text-[#94A39A]">
                  Deck: {vehicle.deckLengthFt}ft Length x {vehicle.deckWidthIn}in Width | {vehicle.maxPalletPositions} Standard GMA Pallet Spots (48x40 in)
                </span>
              </div>
              <span className="text-xs font-['JetBrains_Mono'] text-[#4ADE80] font-bold">
                {pallets.filter((p) => p.loaded).length} / {pallets.length} Loaded ({palletTotalWeight.toLocaleString()} lbs)
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase px-2">
              <span>CAB / FRONT WALL (STEER AXLE)</span>
              <span>REAR ROLL-UP / LIFTGATE (DRIVE / TRAILER AXLE)</span>
            </div>

            <div className="bg-[#090D0A] p-4 rounded-xl border border-[#233327] flex flex-col gap-3">
              <div className="grid grid-cols-6 gap-2.5">
                {Array.from({ length: 6 }).map((_, colIdx) => {
                  const p1 = pallets[colIdx * 2];
                  const p2 = pallets[colIdx * 2 + 1];
                  return (
                    <div key={colIdx} className="flex flex-col gap-2">
                      <div className="text-[9px] font-['JetBrains_Mono'] text-center text-[#64748B]">ROW {colIdx + 1}</div>
                      {p1 && (
                        <div
                          onClick={() => handleTogglePallet(p1.id)}
                          className={"h-24 rounded-lg p-2 flex flex-col justify-between cursor-pointer border transition-all select-none " +
                            (p1.loaded
                              ? 'bg-[#182B1E] border-[#4ADE80]/60 text-[#E8F5E9] shadow-[0_0_12px_rgba(74,222,128,0.18)]'
                              : 'bg-[#0E1410] border-[#233327] text-[#64748B] hover:border-[#354D3B]')}
                        >
                          <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono']">
                            <span className="font-bold"># {p1.id}</span>
                            <span className={p1.loaded ? 'text-[#4ADE80]' : 'text-slate-600'}>
                              {p1.loaded ? 'LOADED' : 'EMPTY'}
                            </span>
                          </div>
                          <div className="text-[10px] font-['Inter'] font-semibold truncate leading-tight">
                            {p1.loaded ? (p1.weightLbs + ' lbs') : 'Click to Load'}
                          </div>
                          <div className="text-[8px] font-['JetBrains_Mono'] text-[#94A39A] truncate">
                            {p1.loaded ? p1.securement : 'Available'}
                          </div>
                        </div>
                      )}

                      {p2 && (
                        <div
                          onClick={() => handleTogglePallet(p2.id)}
                          className={"h-24 rounded-lg p-2 flex flex-col justify-between cursor-pointer border transition-all select-none " +
                            (p2.loaded
                              ? 'bg-[#182B1E] border-[#4ADE80]/60 text-[#E8F5E9] shadow-[0_0_12px_rgba(74,222,128,0.18)]'
                              : 'bg-[#0E1410] border-[#233327] text-[#64748B] hover:border-[#354D3B]')}
                        >
                          <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono']">
                            <span className="font-bold"># {p2.id}</span>
                            <span className={p2.loaded ? 'text-[#4ADE80]' : 'text-slate-600'}>
                              {p2.loaded ? 'LOADED' : 'EMPTY'}
                            </span>
                          </div>
                          <div className="text-[10px] font-['Inter'] font-semibold truncate leading-tight">
                            {p2.loaded ? (p2.weightLbs + ' lbs') : 'Click to Load'}
                          </div>
                          <div className="text-[8px] font-['JetBrains_Mono'] text-[#94A39A] truncate">
                            {p2.loaded ? p2.securement : 'Available'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141C16] border border-[#2D3F32] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4ADE80] shrink-0" />
                <div>
                  <div className="font-bold text-[#F1F5F9] font-['Chakra_Petch'] uppercase">
                    FMCSA 49 CFR 393.102 Cargo Securement Formula
                  </div>
                  <div className="text-[#94A39A] text-[11px]">
                    Aggregate Working Load Limit (WLL) must equal at least 50% of cargo weight.
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-['Chakra_Petch'] text-[#94A39A]">REQUIRED WLL:</span>
                <div className="font-['JetBrains_Mono'] font-bold text-[#86EFAC] text-sm">
                  {Math.round(palletTotalWeight * 0.5).toLocaleString()} LBS MINIMUM
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md flex flex-col gap-4">
              <h4 className="font-['Rajdhani'] font-bold text-base uppercase text-[#F1F5F9] border-b border-[#1E2D22] pb-2">
                Quick Pallet Weight Tuner
              </h4>
              <p className="text-xs text-[#94A39A]">
                Click any pallet on the floorplan to toggle. Adjust standard weight per skid:
              </p>

              <div className="space-y-3">
                {[500, 800, 1000, 1250, 1500].map((wt) => (
                  <button
                    key={wt}
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      setPallets((prev) => prev.map((p) => (p.loaded ? { ...p, weightLbs: wt } : p)));
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0E1410] border border-[#233327] hover:border-[#4ADE80] text-xs font-['Chakra_Petch'] transition-all"
                  >
                    <span className="text-[#F1F5F9]">Set All Loaded to {wt} lbs</span>
                    <span className="text-[#4ADE80] font-['JetBrains_Mono'] font-bold">
                      {(wt * pallets.filter((p) => p.loaded).length).toLocaleString()} lbs Total
                    </span>
                  </button>
                ))}
              </div>

              {vehicle.liftgateMaxLbs ? (
                <div className="p-3 rounded-lg bg-[#141A15] border border-[#2D3F32] text-xs space-y-1">
                  <div className="text-[#E5B869] font-['Chakra_Petch'] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#E5B869]" />
                    <span>Liftgate Hydraulic Rating: {vehicle.liftgateMaxLbs.toLocaleString()} lbs</span>
                  </div>
                  <p className="text-[11px] text-[#94A39A]">
                    Ensure single skid weight does not exceed the tuckunder/railgate maximum rating during customer loading.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NON-CDL SPECIALIZED DVIR INSPECTOR */}
      {activeSubTab === 'dvir-inspection' && (
        <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E2D22] pb-3">
            <div>
              <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9]">
                Non-CDL Pre-Trip & Post-Trip Inspection (49 CFR 396.11 & 396.13)
              </h3>
              <span className="text-xs text-[#94A39A]">
                Specialized safety verification for Box Trucks, Roll-up Doors, Hydraulic Liftgates, and Gooseneck Hotshots
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-['Chakra_Petch'] text-[#94A39A]">STATUS:</span>
              <span
                className={"text-xs font-['Chakra_Petch'] font-bold px-2 py-0.5 rounded border " +
                  (dvirSigned
                    ? 'bg-[#1B3824] text-[#86EFAC] border-[#4ADE80]/40'
                    : 'bg-[#382B12] text-[#FDE68A] border-amber-500/40')}
              >
                {dvirSigned ? 'CERTIFIED & SAVED' : 'AWAITING SIGNATURE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dvirItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleDvir(item.id)}
                className={"p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all select-none " +
                  (item.passed
                    ? 'bg-[#0E1511] border-[#2D4532] text-[#F1F5F9]'
                    : 'bg-[#3A0D0D] border-red-500/60 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.25)]')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={"w-6 h-6 rounded flex items-center justify-center shrink-0 border " +
                      (item.passed ? 'bg-[#1C3622] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-red-950 text-red-400 border-red-500')}
                  >
                    {item.passed ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-['Inter'] font-semibold leading-snug">{item.label}</span>
                </div>
                <span className="text-[10px] font-['Chakra_Petch'] font-bold shrink-0 ml-2">
                  {item.passed ? 'PASS' : 'DEFECT'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1E2D22] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#94A39A]">
              Driver Certification: Under 49 CFR 396.13, driver certifies all safety-critical components are in safe operating condition.
            </div>

            <button
              onClick={handleSignDvir}
              className="btn-mil-primary px-5 py-2.5 text-xs flex items-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
              <span>{dvirSigned ? 'Re-Sign DVIR Inspection' : 'Sign and Complete Daily DVIR'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: ROADSIDE STATUTORY SHIELD */}
      {activeSubTab === 'roadside-shield' && (
        <div className="bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#1E2D22] pb-3">
            <div>
              <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9]">
                Official Roadside Statutory Shield (CVSA / State Trooper Display)
              </h3>
              <span className="text-xs text-[#94A39A]">
                1-Tap Certified Documentation Proving Non-CDL Exemption & Full FMCSA Compliance
              </span>
            </div>
            <button
              onClick={() => setIsShieldModalOpen(true)}
              className="btn-mil-coyote text-xs px-4 py-2 flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>FULL SCREEN OFFICER MODE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0E1410] border border-[#233327] flex flex-col gap-2">
              <div className="text-[10px] font-['Chakra_Petch'] text-[#4ADE80] uppercase tracking-wider font-bold">
                1. VEHICLE CLASSIFICATION
              </div>
              <div className="text-sm font-['Inter'] font-bold text-[#F1F5F9]">NON-CDL COMMERCIAL VEHICLE</div>
              <div className="text-xs text-[#94A39A] space-y-1 font-['JetBrains_Mono']">
                <div>Registered GCWR: {vehicle.gcwrRatingLbs.toLocaleString()} lbs</div>
                <div>Statutory Ceiling: 26,000 lbs</div>
                <div>CDL Requirement: EXEMPT (49 CFR 383.5)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1410] border border-[#233327] flex flex-col gap-2">
              <div className="text-[10px] font-['Chakra_Petch'] text-[#4ADE80] uppercase tracking-wider font-bold">
                2. DRIVER QUALIFICATION (DQF)
              </div>
              <div className="text-sm font-['Inter'] font-bold text-[#F1F5F9]">DQF 49 CFR 391.51 ACTIVE</div>
              <div className="text-xs text-[#94A39A] space-y-1 font-['JetBrains_Mono']">
                <div>DOT Medical Card: VALID (391.41)</div>
                <div>Road Test Cert: ON FILE (391.31)</div>
                <div>Annual MVR Review: PASSED (391.25)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1410] border border-[#233327] flex flex-col gap-2">
              <div className="text-[10px] font-['Chakra_Petch'] text-[#4ADE80] uppercase tracking-wider font-bold">
                3. HOURS OF SERVICE STATUS
              </div>
              <div className="text-sm font-['Inter'] font-bold text-[#F1F5F9]">150 AIR-MILE SHORT-HAUL</div>
              <div className="text-xs text-[#94A39A] space-y-1 font-['JetBrains_Mono']">
                <div>Exemption Rule: 49 CFR 395.1(e)(1)</div>
                <div>Timecard Records: 7-DAY VERIFIED</div>
                <div>14-Hour Window: COMPLIANT</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NON-CDL FREIGHT & RPM CALCULATOR */}
      {activeSubTab === 'profit-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-4 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md">
            <h3 className="font-['Rajdhani'] font-bold text-lg uppercase tracking-wide text-[#F1F5F9] border-b border-[#1E2D22] pb-2">
              Non-CDL Trip Profitability Solver
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">Gross Rate ($)</label>
                <input
                  type="number"
                  value={freightRate}
                  onChange={(e) => setFreightRate(Number(e.target.value))}
                  className="w-full mt-1 bg-[#0A0E0B] border border-[#2D3F32] rounded p-2 text-sm font-['JetBrains_Mono'] text-[#F1F5F9]"
                />
              </div>

              <div>
                <label className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">Loaded Trip Miles</label>
                <input
                  type="number"
                  value={tripMiles}
                  onChange={(e) => setTripMiles(Number(e.target.value))}
                  className="w-full mt-1 bg-[#0A0E0B] border border-[#2D3F32] rounded p-2 text-sm font-['JetBrains_Mono'] text-[#F1F5F9]"
                />
              </div>

              <div>
                <label className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">Deadhead Miles</label>
                <input
                  type="number"
                  value={deadheadMiles}
                  onChange={(e) => setDeadheadMiles(Number(e.target.value))}
                  className="w-full mt-1 bg-[#0A0E0B] border border-[#2D3F32] rounded p-2 text-sm font-['JetBrains_Mono'] text-[#F1F5F9]"
                />
              </div>

              <div>
                <label className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase">Liftgate / Accessorial Fee ($)</label>
                <input
                  type="number"
                  value={accessorialFee}
                  onChange={(e) => setAccessorialFee(Number(e.target.value))}
                  className="w-full mt-1 bg-[#0A0E0B] border border-[#2D3F32] rounded p-2 text-sm font-['JetBrains_Mono'] text-[#F1F5F9]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111713] border border-[#2D3F32] rounded-xl p-5 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-['Chakra_Petch'] text-[#94A39A] uppercase tracking-widest font-bold">
                ESTIMATED NET EARNINGS
              </span>
              <div className="text-3xl font-['JetBrains_Mono'] font-bold text-[#86EFAC] mt-1">
                {"$" + netEarnings.toFixed(2)}
              </div>
              <div className="text-xs text-[#94A39A] mt-0.5">
                Net RPM: <span className="text-[#4ADE80] font-['JetBrains_Mono'] font-bold">{"$" + netRatePerMile + "/mi"}</span> (All Miles) | Gross RPM: <span className="text-[#E5B869] font-['JetBrains_Mono'] font-bold">{"$" + grossRatePerMile + "/mi"}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1E2D22] space-y-2 text-xs font-['JetBrains_Mono']">
                <div className="flex justify-between text-[#94A39A]">
                  <span>Total Revenue:</span>
                  <span className="text-[#F1F5F9]">{"$" + totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#94A39A]">
                  <span>{"Fuel Burn (" + vehicle.typicalMpg + " MPG):"}</span>
                  <span className="text-red-400">{"-$" + fuelExpense.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#94A39A]">
                  <span>Estimated Tolls:</span>
                  <span className="text-red-400">{"-$" + tollCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('goat')}
              className="btn-mil-coyote w-full text-xs py-2.5 mt-4 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-[#0A0F0B]" />
              <span>SEARCH G.O.A.T. NON-CDL FREIGHT</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: ROADSIDE STATUTORY SHIELD */}
      {isShieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-[#0E1410] border-2 border-[#4ADE80] rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(74,222,128,0.35)] flex flex-col gap-6 text-[#F1F5F9]">
            <div className="flex items-center justify-between border-b border-[#233327] pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#4ADE80]" />
                <div>
                  <h2 className="font-['Rajdhani'] font-bold text-2xl uppercase tracking-wider text-[#FFFFFF]">
                    Commercial Motor Vehicle Statutory Shield
                  </h2>
                  <div className="text-xs text-[#86EFAC] font-['Chakra_Petch']">
                    FMCSA 49 CFR 383.5 & 395.1(e)(1) NON-CDL ROADSIDE VERIFICATION
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-mil-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsShieldModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#141C16] border border-[#2D3F32] hover:bg-[#1A261D] text-xs font-['Chakra_Petch']"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141C16] border border-[#2D3F32] text-xs leading-relaxed font-['Inter'] space-y-1">
              <div className="font-bold text-[#E5B869] font-['Chakra_Petch']">OFFICER INSPECTION MEMORANDUM:</div>
              <p className="text-[#CBD5E1]">
                This vehicle is operated as a Non-CDL Commercial Motor Vehicle with a registered Gross Combination Weight Rating (GCWR) not exceeding 26,000 lbs. Driver holds a valid standard Driver License and is certified compliant with all applicable Federal Motor Carrier Safety Regulations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['JetBrains_Mono']">
              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">USDOT NUMBER & CARRIER</div>
                <div className="text-[#F1F5F9] font-bold">USDOT #3928192 | TITAN CARRIER SERVICES</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">EQUIPMENT & REGISTERED WEIGHT</div>
                <div className="text-[#F1F5F9] font-bold">{vehicle.name.split('(')[0]} (GCWR: {vehicle.gcwrRatingLbs.toLocaleString()} lbs)</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">DOT MEDICAL CERTIFICATE (391.41)</div>
                <div className="text-[#4ADE80] font-bold">VALID MCSA-5876 ON FILE (NRCME #8491823)</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">ROAD TEST CERTIFICATE (391.31)</div>
                <div className="text-[#4ADE80] font-bold">EMPLOYER ROAD TEST CERTIFIED & ACTIVE</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">HOS SHORT-HAUL STATUS (395.1(e))</div>
                <div className="text-[#4ADE80] font-bold">150 AIR-MILE RADIUS ACTIVE ({directAirMiles} MI MAX)</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0E0B] border border-[#233327] space-y-1">
                <div className="text-[10px] text-[#94A39A] font-['Chakra_Petch']">TODAY PRE-TRIP DVIR (396.11)</div>
                <div className="text-[#4ADE80] font-bold">PASSED & DIGITALLY SIGNED (0 DEFECTS)</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#64748B] font-['JetBrains_Mono']">
              TRUCKWITHEASE / MORRISHIVE SOVEREIGN TELEMATICS MESH - TAMPER-PROOF RECORD VERIFICATION
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
