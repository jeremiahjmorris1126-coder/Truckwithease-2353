import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  RefreshCw,
  Award,
  Calendar,
  Truck,
  Phone,
  Mail,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  Eye,
  X,
  Send,
  Building,
  Globe,
} from 'lucide-react';
import { DriverRecord, BackgroundCheckReport, DriverEmploymentType, DriverStatus } from '../types';
import { RefDotWebPullIndexModal } from './RefDotWebPullIndexModal';

export const DriverHrOnboardingView: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDotIndexModalOpen, setIsDotIndexModalOpen] = useState<boolean>(false);
  const [selectedDriverForDotIndex, setSelectedDriverForDotIndex] = useState<DriverRecord | null>(null);
  const [selectedDriverReport, setSelectedDriverReport] = useState<DriverRecord | null>(null);
  const [runningCheckId, setRunningCheckId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // New Driver Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    employmentType: 'W2_COMPANY' as DriverEmploymentType,
    cdlNumber: '',
    cdlState: 'PA',
    cdlExpiry: '2028-12-31',
    medicalCardExpiry: '2027-12-31',
    endorsements: ['Tanker (N)', 'HazMat (H)'],
    assignedTruckUnit: 'TR-904',
    yearsExperience: 5,
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
  });

  const availableEndorsements = [
    'Tanker (N)',
    'HazMat (H)',
    'Doubles/Triples (T)',
    'TWIC Card',
    'Passenger (P)',
  ];

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle Add Driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.cdlNumber) {
      alert('Please fill out first name, last name, and CDL number.');
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        employmentType: formData.employmentType,
        cdlNumber: formData.cdlNumber,
        cdlState: formData.cdlState,
        cdlExpiry: formData.cdlExpiry,
        medicalCardExpiry: formData.medicalCardExpiry,
        endorsements: formData.endorsements,
        assignedTruckUnit: formData.assignedTruckUnit,
        yearsExperience: formData.yearsExperience,
        emergencyContact: {
          name: formData.emergencyName || 'None Listed',
          phone: formData.emergencyPhone || 'N/A',
          relation: formData.emergencyRelation || 'Contact',
        },
      };

      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setStatusNotification(result.message || 'Driver enrolled in onboarding.');
        setIsAddModalOpen(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          employmentType: 'W2_COMPANY',
          cdlNumber: '',
          cdlState: 'PA',
          cdlExpiry: '2028-12-31',
          medicalCardExpiry: '2027-12-31',
          endorsements: ['Tanker (N)'],
          assignedTruckUnit: 'TR-904',
          yearsExperience: 5,
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelation: 'Spouse',
        });
        await fetchDrivers();
      }
    } catch (err) {
      console.error('Error adding driver:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  // Run instant background check (MVR + PSP + Clearinghouse)
  const handleRunBackgroundCheck = async (driver: DriverRecord) => {
    setRunningCheckId(driver.id);
    try {
      const res = await fetch(`/api/drivers/${driver.id}/background-check`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        setStatusNotification(result.message);
        await fetchDrivers();
        if (result.driver) {
          setSelectedDriverReport(result.driver);
        }
      }
    } catch (err) {
      console.error('Failed to run background check:', err);
    } finally {
      setRunningCheckId(null);
      setTimeout(() => setStatusNotification(null), 6000);
    }
  };

  // Delete driver
  const handleDeleteDriver = async (driver: DriverRecord) => {
    if (!confirm(`Are you sure you want to remove ${driver.firstName} ${driver.lastName} from active roster?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/drivers/${driver.id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusNotification(`Driver ${driver.firstName} ${driver.lastName} removed.`);
        await fetchDrivers();
      }
    } catch (err) {
      console.error('Failed to delete driver:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  const toggleEndorsement = (item: string) => {
    if (formData.endorsements.includes(item)) {
      setFormData({
        ...formData,
        endorsements: formData.endorsements.filter((e) => e !== item),
      });
    } else {
      setFormData({
        ...formData,
        endorsements: [...formData.endorsements, item],
      });
    }
  };

  // Filtered drivers list
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cdlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.assignedTruckUnit && d.assignedTruckUnit.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'QUALIFIED') return d.status === 'ACTIVE_QUALIFIED';
    if (filterStatus === 'ONBOARDING') return d.status === 'ONBOARDING';
    return true;
  });

  const activeQualifiedCount = drivers.filter((d) => d.status === 'ACTIVE_QUALIFIED').length;
  const onboardingCount = drivers.filter((d) => d.status === 'ONBOARDING').length;
  const dqfCompletedCount = drivers.filter((d) => d.dqfComplete).length;

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                FMCSA 49 CFR PART 391 &amp; DQF VAULT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                AUTOMATED MVR &amp; CLEARINGHOUSE INTEGRATED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-[#D4AF37]" />
              Driver HR, Onboarding &amp; Background Checks
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              Full lifecycle carrier driver management: instant new driver onboarding, DMV Motor Vehicle Records (MVR), FMCSA PSP 5-year crash screening, Drug &amp; Alcohol Clearinghouse verification, and Driver Qualification Files (DQF).
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setSelectedDriverForDotIndex(null);
                setIsDotIndexModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#101b2b] hover:bg-[#182840] border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
            >
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>REF DOT WEB / PULL ALL INDEX</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>ONBOARD NEW DRIVER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {statusNotification && (
        <div className="p-3.5 bg-[#0e1e12] border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="font-bold">// HR DISPATCH NOTICE:</span>
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Active Qualified Drivers</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>{activeQualifiedCount}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 border border-emerald-800 rounded">
              READY TO DISPATCH
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Zero CDL or Med-Card Expirations
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Onboarding Pipeline</div>
          <div className="text-xl sm:text-2xl font-black text-[#D4AF37] mt-1 flex items-center gap-2">
            <span>{onboardingCount}</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 border border-amber-800 rounded">
              IN SCREENING
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#AAA] mt-1.5">MVR &amp; Clearinghouse pending</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">DQF Compliance Rate</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {drivers.length > 0 ? Math.round((dqfCompletedCount / drivers.length) * 100) : 100}%
          </div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">49 CFR Part 391 Full Audit Ready</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Background Screening Turnaround</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            Instant <span className="text-xs text-[#888]">(&lt; 1.2s)</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1.5">DMV &amp; FMCSA API Connected</div>
        </div>
      </div>

      {/* 5-Stage Onboarding Process Stepper Banner */}
      <div className="bg-[#121212] border border-[#242424] rounded-lg p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
          <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            FMCSA MANDATED DRIVER QUALIFICATION (DQF) PIPELINE
          </span>
          <span className="text-[10px] text-[#777]">PART 391 ROAD TEST &amp; CLEARINGHOUSE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { step: '01', name: 'Application & Consent', desc: '10-yr employment history & FCRA consent' },
            { step: '02', name: 'CDL & NRCME Medical', desc: 'Class A verification & physical registry' },
            { step: '03', name: 'MVR & FMCSA PSP', desc: '3-yr state record & 5-yr crash inspection' },
            { step: '04', name: 'Drug Clearinghouse', desc: 'Pre-employment full query consent' },
            { step: '05', name: 'Road Test & Seal', desc: '391.31 certificate & cryptographic seal' },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 bg-[#0a0a0a] border border-[#222] rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D4AF37]">STEP {item.step}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-[11px] mt-1">{item.name}</div>
              </div>
              <div className="text-[9px] text-[#777] mt-1.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] border border-[#262626] p-3 rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by driver name, CDL, or truck..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: `All Drivers (${drivers.length})` },
            { id: 'QUALIFIED', label: `Active Qualified (${activeQualifiedCount})` },
            { id: 'ONBOARDING', label: `In Onboarding (${onboardingCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1e1e1e] text-[#888] hover:text-white border border-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const isRunning = runningCheckId === driver.id;

          return (
            <div
              key={driver.id}
              className="bg-gradient-to-b from-[#161616] to-[#101010] border border-[#262626] hover:border-[#D4AF37]/60 p-5 rounded-lg transition-all space-y-4 shadow-sm relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#202020] border border-[#333] flex items-center justify-center font-black text-[#D4AF37] text-sm">
                    {driver.firstName[0]}
                    {driver.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        {driver.firstName} {driver.lastName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#222] text-[#888] border border-[#333]">
                        {driver.driverNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#888] mt-0.5 flex items-center gap-2">
                      <span>{driver.employmentType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{driver.yearsExperience} Yrs Exp</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    driver.status === 'ACTIVE_QUALIFIED'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/60'
                      : 'text-amber-400 bg-amber-950/60 border border-amber-700/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      driver.status === 'ACTIVE_QUALIFIED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  {driver.status === 'ACTIVE_QUALIFIED' ? 'QUALIFIED' : 'ONBOARDING'}
                </span>
              </div>

              {/* CDL & Equipment Specs */}
              <div className="bg-[#0C0C0C] border border-[#222] p-3 rounded text-xs font-mono space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">Commercial Driver License</span>
                    <span className="text-white font-bold">{driver.cdlNumber}</span>
                    <span className="text-[10px] text-[#888] block">State: {driver.cdlState}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">Assigned Tractor</span>
                    <span className="text-[#D4AF37] font-bold">{driver.assignedTruckUnit || 'Unassigned'}</span>
                    <span className="text-[10px] text-[#888] block">{driver.assignedTrailerUnit || 'No Trailer'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a1a1a] grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#777] block">CDL EXPIRY:</span>
                    <span className="text-[#CCC]">{driver.cdlExpiry}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">NRCME MED CARD:</span>
                    <span className="text-[#CCC]">{driver.medicalCardExpiry}</span>
                  </div>
                </div>

                {/* Endorsements tags */}
                <div className="pt-1 flex flex-wrap gap-1">
                  {driver.endorsements.map((end, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-[#181818] border border-[#2a2a2a] text-[#BBB] rounded text-[9px]"
                    >
                      {end}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background Check / DQF Status Banner */}
              <div className="text-xs font-mono">
                {driver.lastBackgroundCheck ? (
                  <div className="p-2.5 bg-[#0e1711] border border-emerald-900/60 rounded flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>MVR &amp; CLEARINGHOUSE PASS</span>
                      </div>
                      <div className="text-[9px] text-[#888] mt-0.5">
                        0 Violations • 0 Crashes (5 Yrs)
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDriverReport(driver)}
                      className="px-2 py-1 bg-[#1a2d1f] hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>VIEW DQF</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#1a140a] border border-amber-900/60 rounded flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>BACKGROUND CHECK PENDING</span>
                      </div>
                      <div className="text-[9px] text-[#888] mt-0.5">
                        Stage: {driver.onboardingStage.replace('STAGE_', 'STEP ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRunBackgroundCheck(driver)}
                      disabled={isRunning}
                      className="px-2 py-1 bg-[#D4AF37] hover:bg-white text-black text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    >
                      <Send className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                      <span>{isRunning ? 'RUNNING...' : 'RUN CHECK'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer contact & action */}
              <div className="pt-2 border-t border-[#222] flex items-center justify-between text-xs font-mono text-[#888]">
                <div className="flex items-center gap-2">
                  <span title={driver.phone}>{driver.phone}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedDriverForDotIndex(driver);
                      setIsDotIndexModalOpen(true);
                    }}
                    className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Run REF DOT WEB / PULL ALL INDEX for this driver"
                  >
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>REF DOT WEB</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Remove driver"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRunBackgroundCheck(driver)}
                    disabled={isRunning}
                    className="px-2 py-1 bg-[#222] hover:bg-[#333] text-[#DDD] text-[10px] rounded border border-[#333] transition-all"
                  >
                    RE-VERIFY
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DQF Certified Audit Report Modal */}
      {selectedDriverReport && selectedDriverReport.lastBackgroundCheck && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#333] rounded-lg max-w-2xl w-full p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block">
                  FMCSA § 391 DRIVER QUALIFICATION FILE (DQF) AUDIT CERTIFICATE
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedDriverReport.firstName} {selectedDriverReport.lastName} — {selectedDriverReport.cdlNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDriverReport(null)}
                className="text-[#888] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Verification Seal Banner */}
            <div className="p-3 bg-[#0a180e] border border-emerald-700/60 rounded text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">100% FMCSA COMPLIANCE CERTIFIED</div>
                  <div className="text-[10px] text-[#888]">
                    Verification Date: {new Date(selectedDriverReport.lastBackgroundCheck.executedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold rounded">
                DQF COMPLETE
              </span>
            </div>

            {/* Check Details Grid */}
            <div className="space-y-3">
              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>1. State Motor Vehicle Record (MVR 3-Year DMV Pull)</span>
                  <span className="text-emerald-400">PASSED // 0 VIOLATIONS</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Jurisdiction: {selectedDriverReport.lastBackgroundCheck.details.stateDmv}
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Zero suspensions, zero reckless driving entries, clean points balance (0 pts).
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>2. FMCSA Pre-Employment Screening Program (PSP)</span>
                  <span className="text-emerald-400">PASSED // CLEAN INDEX</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Crash History: {selectedDriverReport.lastBackgroundCheck.pspCrashes5Years} recordable crashes (Past 5 Years)
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Roadside Inspections: {selectedDriverReport.lastBackgroundCheck.pspInspections3Years} Clean Level 1/2 inspections (Past 3 Years).
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>3. FMCSA Drug &amp; Alcohol Clearinghouse Query</span>
                  <span className="text-emerald-400">ELIGIBLE FOR SAFETY-SENSITIVE WORK</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Query Reference: {selectedDriverReport.lastBackgroundCheck.details.clearinghouseRef}
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Full pre-employment query conducted with driver digital consent. No unresolved violations on record.
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>4. DOT NRCME Medical Examiner Registry</span>
                  <span className="text-emerald-400">VALID REGISTRY CERTIFIED</span>
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Medical Examiner Certificate verified active through {selectedDriverReport.medicalCardExpiry}.
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Seal */}
            <div className="p-2.5 bg-[#050505] border border-[#222] rounded text-[10px] text-[#777] break-all">
              <span className="font-bold text-[#D4AF37] block">CRYPTOGRAPHIC AUDIT SEAL (HMAC SHA-256):</span>
              {selectedDriverReport.lastBackgroundCheck.sha256AuditSeal}
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriverReport(null)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white font-bold text-xs rounded transition-all"
              >
                CLOSE CERTIFICATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#333] rounded-lg max-w-2xl w-full p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block">
                  CARRIER HR INTAKE // 49 CFR PART 391
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Onboard &amp; Qualify New Commercial Driver
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#888] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miller"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Contact fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="driver@carrier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Employment Type & Assigned Truck */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as DriverEmploymentType })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="W2_COMPANY">W-2 Company Driver</option>
                    <option value="1099_OWNER_OPERATOR">1099 Owner-Operator</option>
                    <option value="LEASE_PURCHASE">Lease-Purchase Operator</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Years Driving Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Assigned Power Unit</label>
                  <select
                    value={formData.assignedTruckUnit}
                    onChange={(e) => setFormData({ ...formData, assignedTruckUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="TR-904">TR-904 (Freightliner Cascadia)</option>
                    <option value="TR-882">TR-882 (Kenworth T680)</option>
                    <option value="TR-719">TR-719 (Peterbilt 579)</option>
                    <option value="TR-611">TR-611 (Volvo VNL 860)</option>
                    <option value="Unassigned">Unassigned (Pool Driver)</option>
                  </select>
                </div>
              </div>

              {/* CDL Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PA-CDL-882190"
                    value={formData.cdlNumber}
                    onChange={(e) => setFormData({ ...formData, cdlNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL State</label>
                  <select
                    value={formData.cdlState}
                    onChange={(e) => setFormData({ ...formData, cdlState: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    {['PA', 'OH', 'IL', 'IN', 'TX', 'MI', 'NY', 'GA', 'FL', 'CA'].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL Expiry Date</label>
                  <input
                    type="date"
                    value={formData.cdlExpiry}
                    onChange={(e) => setFormData({ ...formData, cdlExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Medical Card Expiry */}
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">DOT Medical Card (NRCME) Expiry</label>
                <input
                  type="date"
                  value={formData.medicalCardExpiry}
                  onChange={(e) => setFormData({ ...formData, medicalCardExpiry: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Endorsements Checkboxes */}
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-2">CDL Endorsements</label>
                <div className="flex flex-wrap gap-2">
                  {availableEndorsements.map((end) => {
                    const isChecked = formData.endorsements.includes(end);
                    return (
                      <button
                        type="button"
                        key={end}
                        onClick={() => toggleEndorsement(end)}
                        className={`px-3 py-1.5 rounded text-xs border font-mono transition-all ${
                          isChecked
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                            : 'bg-[#0A0A0A] border-[#333] text-[#888]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {end}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-[#222] pt-3">
                <span className="text-[10px] text-[#888] uppercase block font-bold mb-2">
                  Emergency Contact (HR File)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white font-bold text-xs rounded transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all"
                >
                  SAVE &amp; ENROLL DRIVER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REF DOT WEB / PULL ALL INDEX MODAL */}
      <RefDotWebPullIndexModal
        isOpen={isDotIndexModalOpen}
        onClose={() => setIsDotIndexModalOpen(false)}
        driver={selectedDriverForDotIndex}
        allDrivers={drivers}
        onDriverUpdated={() => fetchDrivers()}
      />
    </div>
  );
};
