import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Truck,
  Compass,
  DollarSign,
  Scale,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Plus,
  Lock,
  Volume2,
  Navigation,
  FileCheck
} from 'lucide-react';
import {
  ALL_50_STATES_TOLL_DATA,
  getAllStatesSummary,
  getTollDataByState,
  StateTollProfile,
  TollFacility,
} from '../data/tollStationsAllStates';
import {
  PRECLEAR_WEIGH_STATIONS,
  INITIAL_DRIVEWYZE_VEHICLES,
  DrivewyzeWeighStation,
  DrivewyzeEnrolledVehicle,
  DrivewyzeBypassDecision,
  drivewyzeManager,
  DrivewyzeApiCallResult,
} from '../services/drivewyzeService';
import {
  auth,
  googleSignIn,
  saveUserTollPassport,
  getUserTollPassport,
  saveDrivewyzeEnrollment,
} from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface TollsAndBypassViewProps {
  onBackToCommand?: () => void;
}

export const TollsAndBypassView: React.FC<TollsAndBypassViewProps> = ({ onBackToCommand }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'all-states' | 'drivewyze' | 'maps-grounding' | 'calculator' | 'passport'
  >('all-states');

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // 50-State Toll Directory State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [filterHasTollsOnly, setFilterHasTollsOnly] = useState(true);
  const [filterTransponder, setFilterTransponder] = useState<string>('all');
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({ NY: true, PA: true, TX: true, FL: true });

  // Drivewyze PreClear State
  const [enrolledVehicles, setEnrolledVehicles] = useState<DrivewyzeEnrolledVehicle[]>(INITIAL_DRIVEWYZE_VEHICLES);
  const [selectedStation, setSelectedStation] = useState<DrivewyzeWeighStation>(PRECLEAR_WEIGH_STATIONS[0]);
  const [bypassMode, setBypassMode] = useState<'BYPASS_GREEN' | 'PULL_IN_RED'>('BYPASS_GREEN');
  const [grossWeightLbs, setGrossWeightLbs] = useState<number>(78450);
  const [steerWeightLbs, setSteerWeightLbs] = useState<number>(11820);
  const [driveWeightLbs, setDriveWeightLbs] = useState<number>(33410);
  const [trailerWeightLbs, setTrailerWeightLbs] = useState<number>(33220);
  const [issScore, setIssScore] = useState<number>(18);
  const [currentDecision, setCurrentDecision] = useState<DrivewyzeBypassDecision | null>(null);
  const [isSimulatingBypass, setIsSimulatingBypass] = useState(false);
  const [apiSandboxResult, setApiSandboxResult] = useState<DrivewyzeApiCallResult | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    unitNumber: 'UNIT-112 (2025 Volvo VNL 860)',
    vin: '4V4NC9EH5RN829112',
    usdot: '3819284',
    licensePlate: 'V9102-IL',
    plateState: 'IL',
    makeModelYear: '2025 Volvo VNL 860 (D13 Turbo Compound)',
  });

  // Google Maps Grounding State
  const [mapsQuery, setMapsQuery] = useState('I-80 Pennsylvania to Ohio toll plazas and weigh stations');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<{
    source: string;
    markdownText: string;
    places: Array<{
      title: string;
      uri: string;
      address?: string;
      reviewSnippets?: string[];
    }>;
  } | null>(null);

  // Route Toll Calculator State
  const [calcCorridor, setCalcCorridor] = useState('I-80 Midwest to East Coast');
  const [calcAxles, setCalcAxles] = useState<number>(5);
  const [calcTransponder, setCalcTransponder] = useState('E-ZPass');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // User Toll Passport Form State
  const [tollPassport, setTollPassport] = useState({
    ezPassNumber: '0220192847291',
    sunPassNumber: '048291048201',
    fastrakNumber: '0182947192',
    txTagNumber: '09819284102',
    bestpassFleetId: 'BP-FLEET-38192',
    prepassPlusId: 'PP-928104',
    primaryTransponder: 'E-ZPass & Bestpass',
    defaultAxles: 5,
  });
  const [passportSavedSuccess, setPassportSavedSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const saved = await getUserTollPassport(u.uid);
        if (saved) {
          setTollPassport((prev) => ({ ...prev, ...saved }));
        }
      }
    });
    return () => unsub();
  }, []);

  // Evaluate initial bypass decision on load
  useEffect(() => {
    handleRunBypassDecision();
  }, [selectedStation, grossWeightLbs, steerWeightLbs, driveWeightLbs, trailerWeightLbs, issScore]);

  const summary = getAllStatesSummary();

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      await googleSignIn();
    } catch (err) {
      console.error('Sign-in notice:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleStateExpand = (stateCode: string) => {
    setExpandedStates((prev) => ({
      ...prev,
      [stateCode]: !prev[stateCode],
    }));
  };

  const handleRunBypassDecision = () => {
    setIsSimulatingBypass(true);
    const decision = drivewyzeManager.evaluateBypassDecision(
      selectedStation,
      {
        steerLbs: steerWeightLbs,
        driveLbs: driveWeightLbs,
        trailerLbs: trailerWeightLbs,
      },
      issScore
    );
    setCurrentDecision(decision);
    setIsSimulatingBypass(false);
  };

  const playChime = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio context restricted in background
    }
  };

  const handleTestApiSandbox = async (apiType: 'VEHICLES' | 'INSIGHTS' | 'COMPLIANCE') => {
    setTestingApi(true);
    try {
      const res = await drivewyzeManager.testDrivewyzeApiEndpoint(apiType);
      setApiSandboxResult(res);
    } catch (err) {
      console.error('API sandbox notice:', err);
    } finally {
      setTestingApi(false);
    }
  };

  const handleEnrollVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const added = drivewyzeManager.enrollVehicle(newVehicleForm);
    setEnrolledVehicles(drivewyzeManager.getEnrolledVehicles());

    if (user) {
      await saveDrivewyzeEnrollment(added);
    }

    setShowEnrollModal(false);
  };

  const handleSavePassport = async () => {
    if (user) {
      const ok = await saveUserTollPassport({
        userId: user.uid,
        ...tollPassport,
      });
      if (ok) {
        setPassportSavedSuccess(true);
        setTimeout(() => setPassportSavedSuccess(false), 3500);
      }
    } else {
      localStorage.setItem('twe_user_toll_passport', JSON.stringify(tollPassport));
      setPassportSavedSuccess(true);
      setTimeout(() => setPassportSavedSuccess(false), 3500);
    }
  };

  const handleExecuteMapsGrounding = async () => {
    setMapsLoading(true);
    try {
      let lat = 41.25;
      let lng = -81.5;

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 2000 }
          );
        });
      }

      const res = await fetch('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await res.json();
      setMapsResult(data);
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  const handleCalculateRouteTolls = async () => {
    setCalcLoading(true);
    try {
      const res = await fetch('/api/tolls/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor: calcCorridor,
          axles: calcAxles,
          transponderType: calcTransponder,
        }),
      });
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      console.error('Calc route tolls error:', err);
    } finally {
      setCalcLoading(false);
    }
  };

  // Filtered states based on search & region
  const filteredStates = ALL_50_STATES_TOLL_DATA.filter((state) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      state.stateName.toLowerCase().includes(q) ||
      state.stateCode.toLowerCase().includes(q) ||
      state.primaryAgencies.some((a) => a.name.toLowerCase().includes(q) || a.acronym.toLowerCase().includes(q)) ||
      state.majorFacilities.some((f) => f.name.toLowerCase().includes(q) || f.highway.toLowerCase().includes(q)) ||
      state.acceptedTransponders.some((t) => t.toLowerCase().includes(q));

    const matchesRegion = selectedRegion === 'all' || state.region === selectedRegion;
    const matchesTollsOnly = !filterHasTollsOnly || state.hasTollFacilities;
    const matchesTransponder =
      filterTransponder === 'all' ||
      state.acceptedTransponders.some((t) => t.toLowerCase().includes(filterTransponder.toLowerCase()));

    return matchesSearch && matchesRegion && matchesTollsOnly && matchesTransponder;
  });

  return (
    <div className="min-h-screen bg-black text-amber-500 font-sans pb-24">
      {/* Top Header & Telemetry Strip */}
      <div className="border-b border-amber-500/30 bg-black/90 sticky top-16 z-30 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500 text-black rounded tracking-widest uppercase">
                ALL 50 STATES + DRIVEWYZE
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE RADAR ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Nationwide Toll Stations & Drivewyze PreClear Hub
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Comprehensive access to all US toll turnpikes, cashless AET bridges, Drivewyze weigh station bypasses & Google Maps grounding.
            </p>
          </div>

          {/* Quick Metrics & Auth Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className="text-neutral-400">Toll Facilities:</span>{' '}
              <span className="text-amber-400 font-bold">{summary.statesWithTollFacilities} States</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className="text-neutral-400">PreClear Sites:</span>{' '}
              <span className="text-emerald-400 font-bold">900+ Stations</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[140px]">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.2 rounded">FIRESTORE SYNC</span>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                {authLoading ? 'Connecting...' : 'Sign In With Google'}
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all-states', label: '50-STATE TOLL STATIONS', icon: Compass, count: summary.statesWithTollFacilities },
            { id: 'drivewyze', label: 'DRIVEWYZE PRECLEAR & WEIGH STATIONS', icon: Radio, count: '900+' },
            { id: 'maps-grounding', label: 'GOOGLE MAPS GROUNDING RADAR', icon: MapPin, badge: 'GEMINI 3.8' },
            { id: 'calculator', label: 'ROUTE TOLL CALCULATOR', icon: DollarSign },
            { id: 'passport', label: 'DRIVER TOLL PASSPORT & CLOUD SYNC', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      active ? 'bg-black text-amber-400' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-black ${
                      active ? 'bg-black text-emerald-400' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* ========================================================================= */}
        {/* TAB 1: 50-STATE TOLL STATIONS & CORRIDOR DIRECTORY */}
        {/* ========================================================================= */}
        {activeSubTab === 'all-states' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by state, highway (I-80, I-95), turnpike, agency, or transponder (E-ZPass, SunPass, Bestpass)..."
                    className="w-full bg-black border border-neutral-800 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Region Select */}
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-neutral-400">Region:</span>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="bg-black border border-neutral-800 text-amber-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Regions</option>
                      <option value="Northeast">Northeast</option>
                      <option value="Mid-Atlantic">Mid-Atlantic</option>
                      <option value="Southeast">Southeast</option>
                      <option value="Midwest">Midwest</option>
                      <option value="Plains">Plains</option>
                      <option value="South">South & Texas</option>
                      <option value="Mountain">Mountain</option>
                      <option value="West Coast">West Coast</option>
                      <option value="Non-Contiguous">Non-Contiguous</option>
                    </select>
                  </div>

                  {/* Transponder Filter */}
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-neutral-400">Transponder:</span>
                    <select
                      value={filterTransponder}
                      onChange={(e) => setFilterTransponder(e.target.value)}
                      className="bg-black border border-neutral-800 text-amber-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Networks</option>
                      <option value="E-ZPass">E-ZPass</option>
                      <option value="SunPass">SunPass</option>
                      <option value="FasTrak">FasTrak</option>
                      <option value="TxTag">TxTag / TollTag</option>
                      <option value="Bestpass">Bestpass Interoperable</option>
                      <option value="I-PASS">I-PASS</option>
                      <option value="K-TAG">K-TAG / PikePass</option>
                    </select>
                  </div>

                  {/* Toggle Has Tolls Only */}
                  <button
                    onClick={() => setFilterHasTollsOnly(!filterHasTollsOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                      filterHasTollsOnly
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-black text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {filterHasTollsOnly ? 'Active Toll Roads Only' : 'Show All 50 States'}
                  </button>
                </div>
              </div>

              {/* Quick Filter Counts */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400 mt-4 pt-3 border-t border-neutral-900">
                <div>
                  Showing <span className="text-white font-bold">{filteredStates.length}</span> of 51 jurisdictions
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Cashless AET: {summary.cashlessAetStates} states
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    E-ZPass: {summary.ezPassCompatibleStates} states
                  </span>
                </div>
              </div>
            </div>

            {/* States Directory Accordion Cards */}
            <div className="space-y-4">
              {filteredStates.map((state) => {
                const isExpanded = !!expandedStates[state.stateCode];

                return (
                  <div
                    key={state.stateCode}
                    className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden transition-all shadow-md"
                  >
                    {/* Header Strip */}
                    <div
                      onClick={() => handleToggleStateExpand(state.stateCode)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-neutral-950 hover:bg-neutral-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center font-black font-mono text-lg text-white">
                          {state.stateCode}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-bold text-white tracking-tight">{state.stateName}</h2>
                            <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800 text-neutral-300">
                              {state.region}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-mono rounded font-bold ${
                                state.systemType === 'All-Electronic (Cashless AET)'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : state.systemType === 'No Active Toll Roads'
                                  ? 'bg-neutral-900 text-neutral-500'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {state.systemType}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-2">
                            <span>
                              {state.hasTollFacilities
                                ? `${state.majorFacilities.length} Major Facilities Cataloged`
                                : 'Toll-Free Interstate Corridors'}
                            </span>
                            {state.hasTollFacilities && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400">
                                  Transponders: {state.acceptedTransponders.slice(0, 3).join(', ')}
                                  {state.acceptedTransponders.length > 3 ? '...' : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {state.hasTollFacilities && (
                          <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                            <span className="text-emerald-400 font-bold">
                              {state.bestpassInteroperable ? 'Bestpass ✓' : ''}
                            </span>
                            <span className="text-neutral-400">
                              {state.ezPassInteroperable ? 'E-ZPass ✓' : ''}
                            </span>
                          </div>
                        )}
                        <div className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-neutral-800/80 bg-neutral-900/30 space-y-6">
                        {state.hasTollFacilities ? (
                          <>
                            {/* Primary Agencies Strip */}
                            <div>
                              <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                                Operating Toll Authorities & Commercial Portals:
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {state.primaryAgencies.map((agency) => (
                                  <div
                                    key={agency.acronym}
                                    className="bg-black border border-neutral-800 rounded-lg p-3 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-amber-400">
                                          {agency.acronym}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 font-mono">{agency.phone}</span>
                                      </div>
                                      <div className="text-sm font-semibold text-white mt-1">{agency.name}</div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-800/80">
                                      <a
                                        href={agency.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-neutral-300 hover:text-amber-400 flex items-center gap-1 font-mono"
                                      >
                                        Official Site <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <span className="text-neutral-600">|</span>
                                      <a
                                        href={agency.portalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold"
                                      >
                                        Payment Portal <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Accepted Transponders Badges */}
                            <div>
                              <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                Accepted Electronic Transponder Tags:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {state.acceptedTransponders.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 text-xs font-mono rounded-md bg-neutral-900 border border-neutral-700 text-white flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Major Facilities Table */}
                            {state.majorFacilities.length > 0 && (
                              <div>
                                <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                                  Major Turnpikes, Bridges & Toll Corridors:
                                </div>
                                <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                                  <table className="w-full text-left text-xs font-mono">
                                    <thead className="bg-black text-neutral-400 border-b border-neutral-800">
                                      <tr>
                                        <th className="py-2.5 px-3">FACILITY</th>
                                        <th className="py-2.5 px-3">HIGHWAY</th>
                                        <th className="py-2.5 px-3">5-AXLE TRUCK TOLL</th>
                                        <th className="py-2.5 px-3">VIDEO SURCHARGE</th>
                                        <th className="py-2.5 px-3">SYSTEM</th>
                                        <th className="py-2.5 px-3">NOTES</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-900">
                                      {state.majorFacilities.map((fac, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-900/50">
                                          <td className="py-3 px-3 font-bold text-white">{fac.name}</td>
                                          <td className="py-3 px-3 text-amber-400">{fac.highway}</td>
                                          <td className="py-3 px-3 text-emerald-400 font-bold">
                                            {fac.typical5AxleTruckToll}
                                          </td>
                                          <td className="py-3 px-3 text-red-400 font-bold">
                                            {fac.videoTollSurcharge}
                                          </td>
                                          <td className="py-3 px-3 text-neutral-300">
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800">
                                              {fac.cashlessStatus}
                                            </span>
                                          </td>
                                          <td className="py-3 px-3 text-neutral-400 font-sans text-xs max-w-xs">
                                            {fac.notes}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Trucker Advisories & Cost Tips */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-3.5">
                                <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider mb-1.5">
                                  <AlertTriangle className="w-4 h-4 text-red-400" />
                                  Statutory Commercial Advisories:
                                </div>
                                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                                  {state.truckerAdvisories.map((adv, idx) => (
                                    <li key={idx}>{adv}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3.5">
                                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                                  <DollarSign className="w-4 h-4 text-emerald-400" />
                                  Discount & Transponder Strategy:
                                </div>
                                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                                  {state.discountTips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="bg-black border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                              <CheckCircle2 className="w-4 h-4" /> 100% Toll-Free Interstate Network
                            </div>
                            <p>{state.truckerAdvisories[0] || 'No state-managed toll facilities in this jurisdiction.'}</p>
                            <div className="text-xs text-neutral-500 font-mono">
                              No electronic transponder required for intrastate transit. IFTA fuel tax reporting applies normally.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DRIVEWYZE PRECLEAR & WEIGH STATIONS INTEGRATION */}
        {/* ========================================================================= */}
        {activeSubTab === 'drivewyze' && (
          <div className="space-y-6">
            {/* Live In-Cab PreClear Signal Simulator */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      DRIVEWYZE PRECLEAR VIRTUAL IN-CAB SIGNAL
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Approaching Weigh Station Radar & WIM Adjudication
                  </h2>
                </div>

                {/* Station Selector */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-neutral-400">Target Station:</span>
                  <select
                    value={selectedStation.id}
                    onChange={(e) => {
                      const st = PRECLEAR_WEIGH_STATIONS.find((s) => s.id === e.target.value);
                      if (st) setSelectedStation(st);
                    }}
                    className="bg-black border border-neutral-700 text-amber-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {PRECLEAR_WEIGH_STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.highway} {s.direction}) - {s.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* In-Cab HUD Signal Card */}
              {currentDecision && (
                <div
                  className={`rounded-2xl p-6 border-2 transition-all shadow-2xl relative overflow-hidden ${
                    currentDecision.decision === 'BYPASS_GREEN'
                      ? 'bg-gradient-to-br from-emerald-950/80 via-black to-emerald-950/40 border-emerald-500 shadow-emerald-500/20'
                      : 'bg-gradient-to-br from-red-950/80 via-black to-red-950/40 border-red-500 shadow-red-500/20'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/60 border border-white/10 text-white">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        <span>DISTANCE TO WEIGH STATION: {currentDecision.distanceToStationMiles} MILES</span>
                      </div>

                      <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        {currentDecision.decision === 'BYPASS_GREEN' ? (
                          <span className="text-emerald-400 flex items-center gap-3">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            BYPASS APPROVED
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-3">
                            <AlertTriangle className="w-10 h-10 text-red-400 animate-bounce" />
                            PULL IN FOR INSPECTION
                          </span>
                        )}
                      </div>

                      <p className="text-base text-neutral-200 max-w-2xl font-medium">
                        {currentDecision.decisionMessage}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono pt-2">
                        <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300">
                          Facility: <strong className="text-white">{currentDecision.stationName}</strong>
                        </span>
                        <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300">
                          WIM Gross: <strong className="text-amber-400">{currentDecision.wimGrossLbs.toLocaleString()} lbs</strong>
                        </span>
                        <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300">
                          Carrier ISS Score: <strong className="text-emerald-400">{currentDecision.issScore} ({currentDecision.issStatus})</strong>
                        </span>
                        <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300">
                          CVISN Token: <strong className="text-white">{currentDecision.bypassToken}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Audio Test Button & Signal Light */}
                    <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                      <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 ${
                          currentDecision.decision === 'BYPASS_GREEN'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                            : 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
                        }`}
                      >
                        {currentDecision.decision === 'BYPASS_GREEN' ? '✓' : '!'}
                      </div>
                      <button
                        onClick={() => playChime(currentDecision.audioFrequencyHz)}
                        className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer border border-neutral-700"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        Play Cab Chime ({currentDecision.audioFrequencyHz} Hz)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Weight & ISS Test Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800">
                <div>
                  <label className="text-xs font-mono text-neutral-400 flex justify-between">
                    <span>Gross Weight:</span>
                    <strong className="text-amber-400">{(steerWeightLbs + driveWeightLbs + trailerWeightLbs).toLocaleString()} lbs</strong>
                  </label>
                  <input
                    type="range"
                    min="35000"
                    max="86000"
                    step="500"
                    value={steerWeightLbs + driveWeightLbs + trailerWeightLbs}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const steer = 11800;
                      const remaining = total - steer;
                      setSteerWeightLbs(steer);
                      setDriveWeightLbs(Math.round(remaining * 0.5));
                      setTrailerWeightLbs(Math.round(remaining * 0.5));
                    }}
                    className="w-full accent-amber-500 mt-2"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Federal legal max: 80,000 lbs</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400 flex justify-between">
                    <span>Steer Axle:</span>
                    <strong className="text-white">{steerWeightLbs.toLocaleString()} lbs</strong>
                  </label>
                  <input
                    type="range"
                    min="9000"
                    max="14000"
                    step="100"
                    value={steerWeightLbs}
                    onChange={(e) => setSteerWeightLbs(Number(e.target.value))}
                    className="w-full accent-amber-500 mt-2"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Max 12,000 - 12,500 lbs</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400 flex justify-between">
                    <span>Drive Tandem:</span>
                    <strong className="text-white">{driveWeightLbs.toLocaleString()} lbs</strong>
                  </label>
                  <input
                    type="range"
                    min="15000"
                    max="38000"
                    step="200"
                    value={driveWeightLbs}
                    onChange={(e) => setDriveWeightLbs(Number(e.target.value))}
                    className="w-full accent-amber-500 mt-2"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Max 34,000 lbs</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400 flex justify-between">
                    <span>Carrier ISS Score:</span>
                    <strong className={issScore <= 49 ? 'text-emerald-400' : 'text-red-400'}>
                      {issScore} ({issScore <= 49 ? 'PASS' : issScore <= 74 ? 'OPTIONAL' : 'INSPECT'})
                    </strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={issScore}
                    onChange={(e) => setIssScore(Number(e.target.value))}
                    className="w-full accent-amber-500 mt-2"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">1-49 = Pass, 75-100 = Mandatory Inspect</div>
                </div>
              </div>
            </div>

            {/* Enrolled Fleet Vehicles & Cloud Registry */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Active Enrolled Drivewyze Fleet Units</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    PreClear bypass credentials registered with USDOT #3819284 & state commercial vehicle screening databases.
                  </p>
                </div>
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-transform active:scale-95 cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" /> Enroll Tractor in Drivewyze
                </button>
              </div>

              <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">UNIT</th>
                      <th className="py-2.5 px-3">VIN</th>
                      <th className="py-2.5 px-3">PLATE</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">BYPASSES</th>
                      <th className="py-2.5 px-3">DIESEL SAVED</th>
                      <th className="py-2.5 px-3">TIME RECOVERED</th>
                      <th className="py-2.5 px-3">LAST BYPASS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {enrolledVehicles.map((veh) => (
                      <tr key={veh.id} className="hover:bg-neutral-900/50">
                        <td className="py-3 px-3 font-bold text-white">{veh.unitNumber}</td>
                        <td className="py-3 px-3 text-neutral-400">{veh.vin}</td>
                        <td className="py-3 px-3 text-amber-400">{veh.licensePlate} ({veh.plateState})</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {veh.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">{veh.totalBypassesGranted} bypasses</td>
                        <td className="py-3 px-3 text-amber-400">{veh.estimatedFuelSavedGallons} gal</td>
                        <td className="py-3 px-3 text-neutral-300">{veh.estimatedTimeSavedMinutes} min</td>
                        <td className="py-3 px-3 text-neutral-400 text-[11px] truncate max-w-xs">{veh.lastStationName || 'In Transit'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Public Drivewyze Developer API Console */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      DRIVEWYZE PUBLIC DEVELOPER API SANDBOX
                    </span>
                    <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.2 rounded">REST API v1</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Live API Telemetry & Endpoints Probe
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleTestApiSandbox('VEHICLES')}
                    disabled={testingApi}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Probe Vehicle API
                  </button>
                  <button
                    onClick={() => handleTestApiSandbox('INSIGHTS')}
                    disabled={testingApi}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Probe Insights API
                  </button>
                  <button
                    onClick={() => handleTestApiSandbox('COMPLIANCE')}
                    disabled={testingApi}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Probe Compliance API
                  </button>
                </div>
              </div>

              {apiSandboxResult ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between bg-black p-3 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                        HTTP {apiSandboxResult.status} {apiSandboxResult.statusText}
                      </span>
                      <span className="text-neutral-400">{apiSandboxResult.method}</span>
                      <span className="text-amber-400 font-bold">{apiSandboxResult.endpoint}</span>
                    </div>
                    <div className="text-neutral-400">
                      Latency: <strong className="text-emerald-400">{apiSandboxResult.durationMs} ms</strong>
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="text-neutral-500 text-[11px] mb-1">// API Response Payload (JSON)</div>
                    <pre className="text-emerald-400 text-xs whitespace-pre-wrap">
                      {JSON.stringify(apiSandboxResult.responsePayload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-black border border-dashed border-neutral-800 rounded-lg p-8 text-center text-xs font-mono text-neutral-500">
                  Click any probe button above to test live connectivity against Drivewyze developer endpoints.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GOOGLE MAPS GROUNDING RADAR (Gemini gemini-3.8-flash) */}
        {/* ========================================================================= */}
        {activeSubTab === 'maps-grounding' && (
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500 text-black rounded tracking-widest uppercase">
                    GOOGLE MAPS GROUNDING
                  </span>
                  <span className="text-xs font-mono text-neutral-400">Gemini gemini-3.8-flash</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  Corridor Google Maps Radar
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Query real-time Google Maps data for toll plazas, commercial CAT scales, weigh stations, and truck parking along any freight route.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    placeholder="Enter corridor e.g. I-80 Pennsylvania to Ohio, I-95 Florida, or weigh stations near me..."
                    className="w-full bg-black border border-neutral-800 focus:border-amber-500 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleExecuteMapsGrounding}
                  disabled={mapsLoading}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  <RefreshCw className={`w-4 h-4 ${mapsLoading ? 'animate-spin' : ''}`} />
                  {mapsLoading ? 'Grounding with Google Maps...' : 'Search Google Maps'}
                </button>
              </div>

              {/* Preset Corridor Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-900 text-xs font-mono">
                <span className="text-neutral-500">Quick Corridors:</span>
                {[
                  'I-80 Pennsylvania to Ohio toll plazas and weigh stations',
                  'I-95 New Jersey to Florida toll gantries and scales',
                  'I-35 Texas toll roads and commercial weigh stations',
                  'I-90 Illinois Tollway and Indiana Toll Road plazas',
                  'California Bay Area FasTrak bridges and Banning scales',
                ].map((corridor) => (
                  <button
                    key={corridor}
                    onClick={() => {
                      setMapsQuery(corridor);
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded border border-neutral-800 transition-colors cursor-pointer text-[11px]"
                  >
                    {corridor.split(' ')[0]} {corridor.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Presentation */}
            {mapsResult ? (
              <div className="space-y-6">
                {/* AI Markdown Analysis */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> GROUNDED WITH GOOGLE MAPS
                    </span>
                    <span className="text-xs font-mono text-neutral-500">Source: {mapsResult.source}</span>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
                    {mapsResult.markdownText}
                  </div>
                </div>

                {/* Extracted Clickable Place Cards */}
                <div>
                  <h3 className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Verified Google Maps Locations ({mapsResult.places?.length || 0} Places Grounded):
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mapsResult.places?.map((place, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-white leading-snug">{place.title}</h4>
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          </div>
                          {place.address && (
                            <div className="text-xs text-neutral-400 font-mono mt-1">{place.address}</div>
                          )}

                          {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {place.reviewSnippets.map((snippet, sIdx) => (
                                <p key={sIdx} className="text-xs text-neutral-300 bg-black/60 p-2 rounded border border-neutral-800/80 italic">
                                  "{snippet}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-900">
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-white px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors"
                          >
                            Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-12 text-center">
                <MapPin className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Google Maps Grounding Engine Ready</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-4">
                  Click 'Search Google Maps' above to retrieve live verified toll plazas, weigh station inspection bays, and CAT scales along your highway corridor.
                </p>
                <button
                  onClick={handleExecuteMapsGrounding}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-lg text-xs font-bold font-mono cursor-pointer"
                >
                  Run Initial Corridor Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ROUTE TOLL CALCULATOR & DETOUR ECONOMICS */}
        {/* ========================================================================= */}
        {activeSubTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white">Commercial Toll & Detour Economics Calculator</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Calculate total transponder costs vs Pay-By-Plate video rates, compare against detour diesel consumption and driver HOS duty hours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="text-xs font-mono text-neutral-400">Target Freight Corridor:</label>
                  <select
                    value={calcCorridor}
                    onChange={(e) => setCalcCorridor(e.target.value)}
                    className="w-full bg-black border border-neutral-700 text-amber-400 rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="I-80 Midwest to East Coast">I-80 Indiana to Pennsylvania</option>
                    <option value="PA Turnpike Mainline">PA Turnpike (Ohio border to NJ border)</option>
                    <option value="I-95 Northeast Corridor">I-95 NY Thruway / GW Bridge / NJ Turnpike</option>
                    <option value="Texas Mega Loop">Texas SH-130 / PGBT / Houston Beltway 8</option>
                    <option value="Florida Turnpike">Florida Turnpike (Wildwood to Miami)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">Vehicle Axles:</label>
                  <select
                    value={calcAxles}
                    onChange={(e) => setCalcAxles(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-700 text-amber-400 rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value={2}>2 Axles (Bobtail / Hotshot)</option>
                    <option value={3}>3 Axles (Tri-Axle Straight)</option>
                    <option value={4}>4 Axles</option>
                    <option value={5}>5 Axles (Standard Class 8 Tractor-Trailer)</option>
                    <option value={6}>6 Axles</option>
                    <option value={7}>7+ Axles (Heavy Haul / Lowboy)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">Mounted Transponder:</label>
                  <select
                    value={calcTransponder}
                    onChange={(e) => setCalcTransponder(e.target.value)}
                    className="w-full bg-black border border-neutral-700 text-amber-400 rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="E-ZPass">E-ZPass (NY / PA / OH / IN / IL)</option>
                    <option value="Bestpass">Bestpass Fleet Multi-State</option>
                    <option value="SunPass Pro">SunPass PRO (FL / E-ZPass states)</option>
                    <option value="TxTag / TollTag">TxTag / NTTA TollTag</option>
                    <option value="None / Pay By Mail">None (Pay By Plate / Video Mail)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCalculateRouteTolls}
                  disabled={calcLoading}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-transform active:scale-95 shadow-md"
                >
                  {calcLoading ? 'Computing Economics...' : 'Calculate Toll vs Detour Margin'}
                </button>
              </div>
            </div>

            {/* Economics Output Card */}
            {calcResult && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      CORRIDOR ECONOMIC REPORT
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{calcResult.corridor}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-neutral-400">Transponder Discount:</span>
                    <div className="text-2xl font-black text-emerald-400">
                      {calcResult.tollCosts.transponderDiscountPercent} OFF
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black border border-neutral-800 rounded-lg p-4">
                    <div className="text-xs font-mono text-neutral-400">Toll with In-Cab Transponder:</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      ${calcResult.tollCosts.transponderCost}
                    </div>
                    <div className="text-xs text-neutral-500 font-mono mt-2">
                      Immediate automated clearance at highway speeds
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 rounded-lg p-4">
                    <div className="text-xs font-mono text-neutral-400">Tolls by Mail (Video Invoice):</div>
                    <div className="text-2xl font-black text-red-400 mt-1">
                      ${calcResult.tollCosts.cashCost}
                    </div>
                    <div className="text-xs text-neutral-500 font-mono mt-2">
                      Includes penalty fees & video billing markup
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 rounded-lg p-4">
                    <div className="text-xs font-mono text-neutral-400">Alternate Detour Expense:</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      ${calcResult.detourEconomics.totalDetourExpense}
                    </div>
                    <div className="text-xs text-neutral-500 font-mono mt-2">
                      {calcResult.detourEconomics.detourMiles} extra miles • {calcResult.detourEconomics.detourDieselGallons} gal diesel • {calcResult.detourEconomics.detourMinutes} min delay
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                    TruckWithEase Dispatch Verdict:
                  </div>
                  <p className="text-sm text-neutral-200 font-medium">
                    {calcResult.recommendation.verdict}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DRIVER TOLL PASSPORT & FIREBASE CLOUD SYNC */}
        {/* ========================================================================= */}
        {activeSubTab === 'passport' && (
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      COMMERCIAL DRIVER NATIONWIDE TOLL PASSPORT
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded">
                      FIREBASE FIRESTORE SYNC
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Transponder Credentials & Multi-State Account Storage
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Store active transponder serials for instant in-cab recognition and roadside audit compliance.
                  </p>
                </div>

                {user ? (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Connected as {user.email}
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold font-mono cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign In to Sync to Cloud
                  </button>
                )}
              </div>

              {passportSavedSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg text-xs font-mono flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Driver Toll Passport saved successfully to Firebase Firestore!
                </div>
              )}

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-neutral-400">E-ZPass Transponder Serial #:</label>
                  <input
                    type="text"
                    value={tollPassport.ezPassNumber}
                    onChange={(e) => setTollPassport({ ...tollPassport, ezPassNumber: e.target.value })}
                    placeholder="e.g. 0220192847291"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Accepted in 19 states (NY, PA, NJ, OH, IN, IL, etc.)</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">SunPass / SunPass PRO ID #:</label>
                  <input
                    type="text"
                    value={tollPassport.sunPassNumber}
                    onChange={(e) => setTollPassport({ ...tollPassport, sunPassNumber: e.target.value })}
                    placeholder="e.g. 048291048201"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Florida, Georgia, North Carolina</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">California FasTrak Transponder ID:</label>
                  <input
                    type="text"
                    value={tollPassport.fastrakNumber}
                    onChange={(e) => setTollPassport({ ...tollPassport, fastrakNumber: e.target.value })}
                    placeholder="e.g. 0182947192"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Bay Area bridges & Southern CA Toll Roads</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">TxTag / NTTA TollTag #:</label>
                  <input
                    type="text"
                    value={tollPassport.txTagNumber}
                    onChange={(e) => setTollPassport({ ...tollPassport, txTagNumber: e.target.value })}
                    placeholder="e.g. 09819284102"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Texas statewide, Oklahoma, Kansas</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">Bestpass Fleet Transponder ID:</label>
                  <input
                    type="text"
                    value={tollPassport.bestpassFleetId}
                    onChange={(e) => setTollPassport({ ...tollPassport, bestpassFleetId: e.target.value })}
                    placeholder="e.g. BP-FLEET-38192"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">100% nationwide consolidated billing</div>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400">PrePass Plus / Horizon ID:</label>
                  <input
                    type="text"
                    value={tollPassport.prepassPlusId}
                    onChange={(e) => setTollPassport({ ...tollPassport, prepassPlusId: e.target.value })}
                    placeholder="e.g. PP-928104"
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 text-xs font-mono mt-1.5 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Combined weigh station + toll transponder</div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSavePassport}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-lg text-xs font-bold font-mono cursor-pointer transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  Save Transponder Passport to Firebase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Enroll New Vehicle in Drivewyze */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white">Enroll Tractor in Drivewyze PreClear</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollVehicleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400">Unit Name & Number:</label>
                <input
                  type="text"
                  value={newVehicleForm.unitNumber}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, unitNumber: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 mt-1 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400">VIN (17 Characters):</label>
                <input
                  type="text"
                  value={newVehicleForm.vin}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vin: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 mt-1 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400">License Plate:</label>
                  <input
                    type="text"
                    value={newVehicleForm.licensePlate}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, licensePlate: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 mt-1 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400">Plate State:</label>
                  <input
                    type="text"
                    value={newVehicleForm.plateState}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, plateState: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 mt-1 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400">Make, Model & Powertrain:</label>
                <input
                  type="text"
                  value={newVehicleForm.makeModelYear}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, makeModelYear: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-700 text-white rounded-lg p-2.5 mt-1 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Register in PreClear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
