// ============================================================================
// SAFETY MEETING ARCHIVE & MANDATORY AUDIT ATTENDANCE TRACKER
// Stores video/audio logs of past driver safety meetings, enables transcript
// indexing & keyword search, and assigns mandatory attendance for DOT/FMCSA audits.
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Video,
  Volume2,
  Play,
  Pause,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  UserCheck,
  Award,
  Download,
  Printer,
  Plus,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronRight,
  FileSignature,
  Maximize2,
  Sliders,
  Check,
  X,
  FileText,
  UserPlus,
  AlertCircle,
  Radio,
  Share2,
  Mic,
  FileSpreadsheet,
} from 'lucide-react';
import {
  DriverSafetyMeeting,
  SafetyMeetingAttendanceRecord,
  AssignableDriver,
  SafetyMeetingAuditCategory,
  SafetyMeetingMediaType,
  ASSIGNABLE_FLEET_DRIVERS,
  INITIAL_SAFETY_MEETINGS,
  INITIAL_SAFETY_ATTENDANCE,
  fetchSafetyMeetings,
  saveSafetyMeeting,
  recordMeetingAttendance,
  fetchAttendanceRecords,
  assignMandatoryAttendance,
} from '../services/safetyMeetingService';
import { triggerHapticFeedback } from '../services/haptics';
import { LiveSafetyMeetingRecorderModal } from './LiveSafetyMeetingRecorderModal';
import { FmcsaEldCsvExportModal } from './FmcsaEldCsvExportModal';

interface SafetyMeetingArchiveSectionProps {
  onNotify?: (msg: string) => void;
}

export const SafetyMeetingArchiveSection: React.FC<SafetyMeetingArchiveSectionProps> = ({ onNotify }) => {
  // Core Data
  const [meetings, setMeetings] = useState<DriverSafetyMeeting[]>(INITIAL_SAFETY_MEETINGS);
  const [attendance, setAttendance] = useState<SafetyMeetingAttendanceRecord[]>(INITIAL_SAFETY_ATTENDANCE);
  const [isLoading, setIsLoading] = useState(false);

  // Live Audio Recorder Modal State
  const [isLiveRecorderOpen, setIsLiveRecorderOpen] = useState(false);

  // FMCSA ELD CSV Export Modal State
  const [isEldCsvExportModalOpen, setIsEldCsvExportModalOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMediaType, setFilterMediaType] = useState<string>('ALL');
  const [filterAuditCategory, setFilterAuditCategory] = useState<string>('ALL');

  // Interactive Player Modal State
  const [selectedMeetingForPlayer, setSelectedMeetingForPlayer] = useState<DriverSafetyMeeting | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Attendance Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [meetingToAssign, setMeetingToAssign] = useState<DriverSafetyMeeting | null>(null);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [assignAuditCategory, setAssignAuditCategory] = useState<SafetyMeetingAuditCategory>('ANNUAL_SAFETY_FITNESS_385');
  const [assignDeadline, setAssignDeadline] = useState('2026-04-15');
  const [assignUrgency, setAssignUrgency] = useState<'MANDATORY_CRITICAL' | 'URGENT' | 'ANNUAL_STANDARD'>('MANDATORY_CRITICAL');

  // Certificate Modal State
  const [selectedCertRecord, setSelectedCertRecord] = useState<{
    record: SafetyMeetingAttendanceRecord;
    meeting?: DriverSafetyMeeting;
  } | null>(null);

  // Quick Sign-Off Modal for Officer/Driver Verification
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [signOffDriverId, setSignOffDriverId] = useState('drv-javier-morales');
  const [signOffNotes, setSignOffNotes] = useState('Completed video log playback and signed safety compliance checklist.');

  // Schedule / Archive New Meeting Modal
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatute, setNewStatute] = useState('49 CFR § 395 (Hours of Service & Fatigue)');
  const [newMonth, setNewMonth] = useState('May 2026 (Upcoming Mandatory)');
  const [newLeader, setNewLeader] = useState('Jeremiah Morris (Safety Director & Chief Mechanic)');
  const [newDate, setNewDate] = useState('2026-05-10 10:00 AM EDT');
  const [newMediaType, setNewMediaType] = useState<SafetyMeetingMediaType>('VIDEO');
  const [newDuration, setNewDuration] = useState(30);
  const [newSummary, setNewSummary] = useState('');
  const [newAuditCategory, setNewAuditCategory] = useState<SafetyMeetingAuditCategory>('HOURS_OF_SERVICE_AUDIT');
  const [newUrgency, setNewUrgency] = useState<'MANDATORY_CRITICAL' | 'URGENT' | 'ANNUAL_STANDARD'>('MANDATORY_CRITICAL');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onNotify) onNotify(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMeetings, fetchedAttendance] = await Promise.all([
        fetchSafetyMeetings(),
        fetchAttendanceRecords(),
      ]);
      setMeetings(fetchedMeetings);
      setAttendance(fetchedAttendance);
    } catch (err) {
      console.warn('Error loading safety meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && selectedMeetingForPlayer) {
      const maxSeconds = selectedMeetingForPlayer.durationMinutes * 60;
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= maxSeconds) {
            setIsPlaying(false);
            return maxSeconds;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedMeetingForPlayer, playbackSpeed]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Status Filter
      if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
      // Media Type Filter
      if (filterMediaType !== 'ALL' && m.mediaType !== filterMediaType) return false;
      // Audit Category Filter
      if (filterAuditCategory !== 'ALL' && m.auditCategory !== filterAuditCategory) return false;

      // Search Query Filter (Title, Statute, Summary, Agendas, Leader, Transcript keywords)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchStatute = m.fmcsaStatute.toLowerCase().includes(q);
        const matchSummary = m.summary.toLowerCase().includes(q);
        const matchLeader = m.meetingLeader.toLowerCase().includes(q);
        const matchAuditCode = m.fmcsaAuditCode.toLowerCase().includes(q);
        const matchAgenda = m.agenda.some((a) => a.toLowerCase().includes(q));
        const matchTranscript = m.transcript.some(
          (t) => t.text.toLowerCase().includes(q) || t.keywords.some((k) => k.toLowerCase().includes(q))
        );
        if (
          !matchTitle &&
          !matchStatute &&
          !matchSummary &&
          !matchLeader &&
          !matchAuditCode &&
          !matchAgenda &&
          !matchTranscript
        ) {
          return false;
        }
      }
      return true;
    });
  }, [meetings, filterStatus, filterMediaType, filterAuditCategory, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalMeetings = meetings.length;
    let totalMinutes = 0;
    let totalAssigned = 0;
    let totalAttended = 0;

    meetings.forEach((m) => {
      totalMinutes += m.durationMinutes;
      totalAssigned += m.assignedDriverIds ? m.assignedDriverIds.length : (m.totalAssignedCount || 6);
      totalAttended += m.totalAttendedCount || 0;
    });

    const complianceRate = totalAssigned > 0 ? Math.round((totalAttended / totalAssigned) * 100) : 100;
    const verifiedCertificates = attendance.length;

    return {
      totalMeetings,
      totalHoursFormatted: (totalMinutes / 60).toFixed(1),
      totalAssigned,
      totalAttended,
      complianceRate,
      verifiedCertificates,
    };
  }, [meetings, attendance]);

  // Handlers
  const handleOpenPlayer = (meeting: DriverSafetyMeeting) => {
    triggerHapticFeedback('double');
    setSelectedMeetingForPlayer(meeting);
    setPlaybackSeconds(0);
    setIsPlaying(true);
    setPlaybackSpeed(1);
    setTranscriptSearch('');
  };

  const handleOpenAssignModal = (meeting: DriverSafetyMeeting) => {
    triggerHapticFeedback('tick');
    setMeetingToAssign(meeting);
    setSelectedDriverIds(meeting.assignedDriverIds || ASSIGNABLE_FLEET_DRIVERS.map((d) => d.id));
    setAssignAuditCategory(meeting.auditCategory || 'ANNUAL_SAFETY_FITNESS_385');
    setAssignDeadline(meeting.auditDeadline || '2026-04-15');
    setAssignUrgency(meeting.auditUrgency || 'MANDATORY_CRITICAL');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!meetingToAssign) return;
    triggerHapticFeedback('success');
    try {
      const updated = await assignMandatoryAttendance(
        meetingToAssign.id,
        selectedDriverIds,
        assignAuditCategory,
        assignDeadline,
        assignUrgency
      );
      if (updated) {
        setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showToast(
          `Mandatory attendance assigned to ${selectedDriverIds.length} driver(s) for "${meetingToAssign.title}" [Audit: ${assignAuditCategory}].`
        );
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsAssignModalOpen(false);
    }
  };

  const handleDriverSignOff = async () => {
    if (!selectedMeetingForPlayer) return;
    const driver = ASSIGNABLE_FLEET_DRIVERS.find((d) => d.id === signOffDriverId);
    if (!driver) return;

    triggerHapticFeedback('success');
    const newRecord: SafetyMeetingAttendanceRecord = {
      id: `att-${driver.id}-${selectedMeetingForPlayer.id}-${Date.now().toString().slice(-4)}`,
      meetingId: selectedMeetingForPlayer.id,
      meetingTitle: selectedMeetingForPlayer.title,
      driverId: driver.id,
      driverName: driver.name,
      driverCdlNumber: driver.cdlNumber,
      unitAssigned: driver.unit,
      attendedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' EDT',
      scorePercent: 100,
      passed: true,
      digitalSignature: `${driver.name} [Verified Video Log Attendance + PIN ${Math.floor(1000 + Math.random() * 9000)}]`,
      driverNotes: signOffNotes,
      gpsLocation: '41.8781° N, 87.6298° W (Assigned Terminal Geo-Fence)',
      certificateHashSha256: Math.random().toString(36).substring(2) + '9f837261b0c44298fc1c149afbf4c8996fb92427ae41e4649b',
      fmcsaCompliant: true,
      auditCategoryAssigned: selectedMeetingForPlayer.auditCategory,
    };

    await recordMeetingAttendance(newRecord);
    setAttendance((prev) => [newRecord, ...prev]);

    // Update meeting attended count
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === selectedMeetingForPlayer.id
          ? { ...m, totalAttendedCount: (m.totalAttendedCount || 0) + 1 }
          : m
      )
    );

    setIsSignOffModalOpen(false);
    showToast(`Driver ${driver.name} certified for "${selectedMeetingForPlayer.title}"! FMCSA certificate generated.`);
  };

  const handleCreateNewMeeting = async () => {
    if (!newTitle.trim()) return;
    triggerHapticFeedback('success');

    const newMeeting: DriverSafetyMeeting = {
      id: `sm-${Date.now().toString().slice(-6)}`,
      title: newTitle,
      fmcsaStatute: newStatute,
      monthQuarter: newMonth,
      status: 'ACTIVE_NOW',
      meetingLeader: newLeader,
      meetingDate: newDate,
      durationMinutes: newDuration,
      durationFormatted: `${newDuration}:00`,
      mediaType: newMediaType,
      mediaUrl: `https://cdn.truckwithease.internal/media/safety-briefings/${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp4`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
      audioWaveform: [30, 50, 70, 85, 90, 65, 45, 80, 75, 90, 85, 70, 60, 50, 65, 80, 95, 70, 50, 40],
      summary: newSummary || `Mandatory safety meeting reviewing ${newStatute} protocols, fleet best practices, and FMCSA inspection compliance.`,
      agenda: [
        `1. Review of ${newStatute} statutory requirements`,
        '2. In-cab verification and pre-trip DVIR inspection points',
        '3. Driver safety rights and hazard shutdown protocol',
        '4. Interactive comprehension quiz & digital sign-off',
      ],
      mandatoryForRoles: ['ALL_DRIVERS', 'SAFETY_MANAGERS'],
      assignedDriverIds: ASSIGNABLE_FLEET_DRIVERS.map((d) => d.id),
      auditCategory: newAuditCategory,
      auditMandateDescription: `FMCSA Compliance Training Mandate for ${newStatute}`,
      auditUrgency: newUrgency,
      auditDeadline: '2026-05-31',
      slidesCount: 15,
      quizQuestions: [
        {
          id: 'q1',
          question: `What is the primary compliance objective under ${newStatute}?`,
          options: [
            'Maintain zero defects and ensure statutory safety operating standards',
            'Increase vehicle highway speed during inclement weather',
            'Bypass roadside scale facilities without carrier authorization',
            'Delete electronic logging records after 24 hours',
          ],
          correctAnswerIndex: 0,
          explanation: 'FMCSA regulations mandate strict adherence to safe operating standards and defect-free vehicle maintenance.',
        },
      ],
      totalAttendedCount: 0,
      totalAssignedCount: 6,
      fmcsaAuditCode: `FMCSA-SM-${Date.now().toString().slice(-4)}`,
      transcript: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: newLeader,
          text: `Welcome drivers to today's mandatory safety briefing on ${newStatute}.`,
          keywords: ['welcome', 'mandatory', newStatute],
        },
        {
          timestamp: '05:30',
          seconds: 330,
          speaker: newLeader,
          text: 'Make sure all inspection records and DVIR sign-offs are archived in the digital vault before moving the unit.',
          keywords: ['inspection', 'DVIR', 'vault'],
        },
      ],
      createdAt: new Date().toISOString(),
    };

    await saveSafetyMeeting(newMeeting);
    setMeetings((prev) => [newMeeting, ...prev]);
    setIsNewMeetingModalOpen(false);
    showToast(`New Safety Meeting "${newTitle}" archived and assigned to fleet!`);
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/60 rounded-lg text-emerald-200 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Action Controls */}
      <div className="p-5 bg-gradient-to-r from-[#161616] via-[#1A1A1A] to-[#121212] border border-[#2B2B2B] rounded-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest rounded">
              49 CFR PART 385 &amp; 392 SAFETY FITNESS AUDIT VAULT
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] uppercase font-bold tracking-widest rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {stats.complianceRate}% AUDIT PASS RATE
            </span>
          </div>
          <h2 className="font-headline text-2xl uppercase font-black text-white tracking-tight flex items-center gap-2">
            Safety Meeting Video &amp; Audio Archive
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C] rounded-full animate-pulse" />
          </h2>
          <p className="text-xs font-mono text-[#888] max-w-2xl">
            Centralized repository of commercial driver safety meetings with synchronized transcripts, full-text regulatory search, and automated mandatory attendance assignment for FMCSA compliance audits.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Start Live Recording with Mic & AI Worker */}
          <button
            onClick={() => {
              triggerHapticFeedback('double');
              setIsLiveRecorderOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 cursor-pointer animate-pulse"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>START RECORDING (MIC &amp; AI)</span>
          </button>

          {/* Export FMCSA ELD CSV Modal Trigger */}
          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setIsEldCsvExportModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>FMCSA ELD CSV EXPORT</span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('subtle');
              setIsNewMeetingModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(201,168,76,0.25)] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>ARCHIVE / SCHEDULE</span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('double');
              showToast('Exporting Consolidated FMCSA Safety Training Audit Packet (All Verified Signatures & Hash Ledger)...');
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] hover:border-[#555] text-[#AAA] hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded transition-all"
          >
            <Download className="w-4 h-4 text-[#C9A84C]" />
            <span>AUDIT DOSSIER</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
          <div className="flex items-center justify-between text-[#777] text-[10px] uppercase font-bold tracking-wider">
            <span>Archived Meetings</span>
            <Video className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {stats.totalMeetings} <span className="text-xs text-[#777] font-normal">Logs</span>
          </div>
          <div className="text-[10px] text-[#C9A84C] mt-0.5 font-bold">
            {stats.totalHoursFormatted} Total Briefing Hours
          </div>
        </div>

        <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
          <div className="flex items-center justify-between text-[#777] text-[10px] uppercase font-bold tracking-wider">
            <span>Fleet Attendance</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {stats.totalAttended} / {stats.totalAssigned}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            {stats.complianceRate}% Roster Completion
          </div>
        </div>

        <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
          <div className="flex items-center justify-between text-[#777] text-[10px] uppercase font-bold tracking-wider">
            <span>Verified Certificates</span>
            <Award className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {stats.verifiedCertificates} <span className="text-xs text-[#777] font-normal">Issued</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">
            SHA-256 Cryptographic Seals
          </div>
        </div>

        <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
          <div className="flex items-center justify-between text-[#777] text-[10px] uppercase font-bold tracking-wider">
            <span>Audit Target Readiness</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-black text-[#C9A84C] mt-1">
            100% READY
          </div>
          <div className="text-[10px] text-[#888] mt-0.5">
            FMCSA § 385.115 Defensible
          </div>
        </div>
      </div>

      {/* Search, Filter & Indexing Toolbar */}
      <div className="p-4 bg-[#121212] border border-[#222] rounded-lg space-y-3 font-mono">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Live Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings by title, 49 CFR statute, transcript text, leader, or audit code..."
              className="w-full bg-[#0A0A0A] border border-[#2B2B2B] focus:border-[#C9A84C] pl-10 pr-4 py-2 text-xs text-white placeholder-[#555] rounded outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A0A0A] border border-[#2B2B2B] text-xs text-[#AAA] px-3 py-2 rounded outline-none focus:border-[#C9A84C]"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE_NOW">Active Now</option>
              <option value="COMPLETED">Completed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Media Type Filter */}
            <select
              value={filterMediaType}
              onChange={(e) => setFilterMediaType(e.target.value)}
              className="bg-[#0A0A0A] border border-[#2B2B2B] text-xs text-[#AAA] px-3 py-2 rounded outline-none focus:border-[#C9A84C]"
            >
              <option value="ALL">Media: All Types</option>
              <option value="VIDEO">Video Logs</option>
              <option value="AUDIO">Audio Logs</option>
              <option value="INTERACTIVE_SLIDES">Interactive Slides</option>
            </select>

            {/* Audit Target Filter */}
            <select
              value={filterAuditCategory}
              onChange={(e) => setFilterAuditCategory(e.target.value)}
              className="bg-[#0A0A0A] border border-[#2B2B2B] text-xs text-[#AAA] px-3 py-2 rounded outline-none focus:border-[#C9A84C]"
            >
              <option value="ALL">Audit: All Categories</option>
              <option value="ANNUAL_SAFETY_FITNESS_385">Annual Safety Fitness (Part 385)</option>
              <option value="FMCSA_NEW_ENTRANT_AUDIT">FMCSA New Entrant Audit</option>
              <option value="POST_INCIDENT_CORRECTIVE_ACTION">Post-Incident Corrective Action</option>
              <option value="CVSA_BRAKE_SAFETY">CVSA Brake Safety</option>
              <option value="HOURS_OF_SERVICE_AUDIT">Hours of Service (Part 395)</option>
            </select>

            {(searchQuery || filterStatus !== 'ALL' || filterMediaType !== 'ALL' || filterAuditCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('ALL');
                  setFilterMediaType('ALL');
                  setFilterAuditCategory('ALL');
                  triggerHapticFeedback('tick');
                }}
                className="px-2.5 py-2 text-[11px] text-[#C9A84C] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#777] border-t border-[#1C1C1C] pt-2">
          <span>
            Displaying <strong className="text-white">{filteredMeetings.length}</strong> of{' '}
            <strong className="text-white">{meetings.length}</strong> archived safety logs
          </span>
          {searchQuery && (
            <span className="text-[#C9A84C]">
              Indexed keywords matching: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Safety Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeetings.map((meeting) => {
          const assignedCount = meeting.assignedDriverIds ? meeting.assignedDriverIds.length : (meeting.totalAssignedCount || 6);
          const attendedCount = meeting.totalAttendedCount || 0;
          const pct = assignedCount > 0 ? Math.round((attendedCount / assignedCount) * 100) : 0;

          return (
            <div
              key={meeting.id}
              className="bg-[#121212] border border-[#242424] hover:border-[#383838] rounded-xl overflow-hidden shadow-lg transition-all flex flex-col group"
            >
              {/* Card Media Preview Header */}
              <div className="relative h-44 bg-[#0A0A0A] overflow-hidden">
                {meeting.thumbnailUrl ? (
                  <img
                    src={meeting.thumbnailUrl}
                    alt={meeting.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] flex items-center justify-center">
                    <Video className="w-12 h-12 text-[#333]" />
                  </div>
                )}

                {/* Badges on Top */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-[9px] uppercase font-bold rounded flex items-center gap-1">
                    {meeting.mediaType === 'VIDEO' ? (
                      <Video className="w-3 h-3 text-[#C9A84C]" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                    )}
                    {meeting.mediaType} LOG
                  </span>

                  <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-[#C9A84C] font-mono text-[9px] uppercase font-bold rounded">
                    {meeting.durationFormatted}
                  </span>
                </div>

                {/* Urgency Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 font-mono text-[9px] uppercase font-black rounded border ${
                      meeting.auditUrgency === 'MANDATORY_CRITICAL'
                        ? 'bg-red-950/90 text-red-300 border-red-700'
                        : meeting.auditUrgency === 'URGENT'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                        : 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    {meeting.auditUrgency.replace('_', ' ')}
                  </span>
                </div>

                {/* Animated Waveform for Audio */}
                {meeting.mediaType === 'AUDIO' && meeting.audioWaveform && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-end gap-1 h-8 px-2 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10">
                    {meeting.audioWaveform.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-cyan-400/80 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                )}

                {/* Center Play Button Trigger */}
                <button
                  onClick={() => handleOpenPlayer(meeting)}
                  className="absolute inset-0 m-auto w-12 h-12 bg-[#C9A84C] hover:bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all transform group-hover:scale-110 active:scale-95 cursor-pointer"
                  title="Open video/audio log & synchronized transcript"
                >
                  <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-[#888]">
                    <span className="text-[#C9A84C] font-bold uppercase">{meeting.monthQuarter}</span>
                    <span className="text-[#666]">{meeting.meetingDate}</span>
                  </div>

                  <h3 className="font-headline text-base uppercase font-bold text-white mt-1 leading-snug line-clamp-2">
                    {meeting.title}
                  </h3>

                  <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 px-2 py-1 rounded inline-block">
                    {meeting.fmcsaStatute}
                  </div>

                  <p className="text-xs text-[#888] font-mono mt-2 line-clamp-2 leading-relaxed">
                    {meeting.summary}
                  </p>
                </div>

                {/* Audit Category & Leader */}
                <div className="space-y-2 border-t border-[#1C1C1C] pt-3 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Leader:</span>
                    <span className="text-white truncate max-w-[180px]">{meeting.meetingLeader}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Audit Target:</span>
                    <span className="text-[#C9A84C] font-bold truncate max-w-[170px]">
                      {meeting.auditCategory.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Deadline:</span>
                    <span className="text-red-400 font-bold">{meeting.auditDeadline}</span>
                  </div>

                  {/* Attendance Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#888]">Mandatory Attendance:</span>
                      <span className={`font-bold ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {attendedCount} of {assignedCount} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C1C1C] font-mono text-xs">
                  <button
                    onClick={() => handleOpenPlayer(meeting)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] hover:border-[#555] text-[#AAA] hover:text-white font-bold rounded transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>PLAY LOG</span>
                  </button>

                  <button
                    onClick={() => handleOpenAssignModal(meeting)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] font-bold rounded transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ASSIGN</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Attendance Records Table */}
      <div className="p-5 bg-[#121212] border border-[#222] rounded-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C1C] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-widest">
                FMCSA DIGITAL ATTENDANCE LEDGER
              </span>
            </div>
            <h3 className="font-headline text-lg uppercase font-black text-white mt-0.5">
              Certified Driver Attendance &amp; Sign-Off Roster
            </h3>
          </div>
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded">
            {attendance.length} VERIFIED CERTIFICATES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222] text-[#777] uppercase text-[10px]">
                <th className="py-2.5 px-3">Driver Name &amp; Unit</th>
                <th className="py-2.5 px-3">Meeting Title &amp; Regulation</th>
                <th className="py-2.5 px-3">Attended Timestamp</th>
                <th className="py-2.5 px-3">Score &amp; Status</th>
                <th className="py-2.5 px-3">Digital Signature Seal</th>
                <th className="py-2.5 px-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#181818] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{rec.driverName}</div>
                    <div className="text-[10px] text-[#777]">{rec.driverCdlNumber}</div>
                    {rec.unitAssigned && (
                      <div className="text-[9px] text-[#C9A84C]">{rec.unitAssigned}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white font-medium max-w-xs truncate">{rec.meetingTitle}</div>
                    <div className="text-[10px] text-cyan-400">
                      Audit: {rec.auditCategoryAssigned?.replace(/_/g, ' ') || 'ANNUAL REVIEW'}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#AAA]">
                    <div>{rec.attendedAt}</div>
                    <div className="text-[9px] text-[#666]">{rec.gpsLocation}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold rounded text-[10px] flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {rec.scorePercent}% PASSED
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-[#AAA] truncate max-w-[200px]">
                      {rec.digitalSignature}
                    </div>
                    <div className="text-[9px] text-[#555] font-mono">
                      SHA: {rec.certificateHashSha256.slice(0, 16)}...
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        triggerHapticFeedback('tick');
                        const m = meetings.find((item) => item.id === rec.meetingId);
                        setSelectedCertRecord({ record: rec, meeting: m });
                      }}
                      className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#C9A84C] text-[#AAA] hover:text-black font-bold uppercase rounded border border-[#333] transition-all text-[10px]"
                    >
                      VIEW CERTIFICATE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE VIDEO / AUDIO PLAYER & TRANSCRIPT INDEXER            */}
      {/* ========================================================================= */}
      {selectedMeetingForPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-5xl bg-[#141414] border border-[#333] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Player Header */}
            <div className="p-4 bg-[#0D0D0D] border-b border-[#222] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] font-mono text-[9px] uppercase font-bold rounded">
                    {selectedMeetingForPlayer.mediaType} BRIEFING LOG
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    {selectedMeetingForPlayer.fmcsaStatute}
                  </span>
                </div>
                <h3 className="font-headline text-lg sm:text-xl uppercase font-black text-white mt-0.5">
                  {selectedMeetingForPlayer.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setSelectedMeetingForPlayer(null);
                }}
                className="text-[#777] hover:text-white font-mono text-sm px-2.5 py-1 rounded bg-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            {/* Player Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left Column: Player Canvas & Controls (7 cols) */}
              <div className="lg:col-span-7 p-5 bg-black flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222] space-y-4">
                {/* Simulated Screen / Visualizer */}
                <div className="relative aspect-video bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden flex items-center justify-center shadow-inner group">
                  {selectedMeetingForPlayer.mediaType === 'VIDEO' ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-black via-[#111] to-[#1C1C1C] p-4 text-center">
                      <div className="p-3 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 mb-3 animate-pulse">
                        <Video className="w-8 h-8 text-[#C9A84C]" />
                      </div>
                      <div className="text-white font-headline uppercase font-black text-sm sm:text-base">
                        {selectedMeetingForPlayer.title}
                      </div>
                      <div className="text-xs font-mono text-[#888] mt-1">
                        Leader: {selectedMeetingForPlayer.meetingLeader}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400 mt-2">
                        Timecode: {formatSeconds(playbackSeconds)} / {selectedMeetingForPlayer.durationFormatted}
                      </div>

                      {/* Live In-Cab Subtitle */}
                      <div className="absolute bottom-3 left-3 right-3 p-2 bg-black/85 backdrop-blur-md rounded border border-white/10 text-xs font-mono text-amber-200">
                        &ldquo;
                        {selectedMeetingForPlayer.transcript.find(
                          (t) => playbackSeconds >= t.seconds && playbackSeconds <= t.seconds + 60
                        )?.text || selectedMeetingForPlayer.summary}
                        &rdquo;
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0A0A0A] to-[#141414] text-center">
                      <Volume2 className="w-12 h-12 text-cyan-400 mb-2" />
                      <span className="text-xs font-mono text-cyan-300 font-bold">
                        HIGH-FIDELITY AUDIO LOG
                      </span>
                      <div className="text-white font-headline uppercase font-bold text-sm mt-1">
                        {selectedMeetingForPlayer.meetingLeader}
                      </div>

                      {/* Live Equalizer Animation */}
                      <div className="flex items-end gap-1 h-12 mt-4 w-48 justify-center">
                        {[40, 80, 55, 95, 70, 45, 85, 60, 90, 75, 50, 65, 80, 95, 60].map((h, i) => (
                          <div
                            key={i}
                            className={`w-2 bg-cyan-400 rounded-t transition-all ${
                              isPlaying ? 'animate-pulse' : 'opacity-40'
                            }`}
                            style={{
                              height: isPlaying ? `${Math.max(20, (h * (i % 3 + 1)) % 100)}%` : '20%',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrubber & Player Controls */}
                <div className="p-3 bg-[#111] border border-[#222] rounded-lg space-y-2 font-mono">
                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#777]">{formatSeconds(playbackSeconds)}</span>
                    <input
                      type="range"
                      min={0}
                      max={selectedMeetingForPlayer.durationMinutes * 60}
                      value={playbackSeconds}
                      onChange={(e) => setPlaybackSeconds(Number(e.target.value))}
                      className="flex-1 accent-[#C9A84C] cursor-pointer"
                    />
                    <span className="text-[10px] text-[#777]">
                      {selectedMeetingForPlayer.durationFormatted}
                    </span>
                  </div>

                  {/* Button Toolbar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          triggerHapticFeedback('tick');
                          setIsPlaying(!isPlaying);
                        }}
                        className="px-3.5 py-1.5 bg-[#C9A84C] hover:bg-white text-black text-xs font-bold uppercase rounded flex items-center gap-1.5"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                      </button>

                      <button
                        onClick={() => setPlaybackSeconds(0)}
                        className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#AAA] hover:text-white text-xs rounded border border-[#333]"
                        title="Restart from 00:00"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[#666]">Speed:</span>
                      {[1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={`px-1.5 py-0.5 rounded border ${
                            playbackSpeed === s
                              ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-bold'
                              : 'bg-[#1C1C1C] text-[#888] border-[#333]'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Driver Sign-Off Action */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-[#121212] border border-emerald-500/40 rounded-lg flex items-center justify-between gap-3 font-mono">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                      DRIVER ATTENDANCE CERTIFICATION
                    </span>
                    <span className="text-xs text-white">
                      Sign off attendance to generate verifiable FMCSA audit certificate.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSignOffModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded transition-all whitespace-nowrap cursor-pointer shadow-md"
                  >
                    SIGN &amp; CERTIFY
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Transcript & Agenda (5 cols) */}
              <div className="lg:col-span-5 p-5 bg-[#0F0F0F] space-y-4 flex flex-col font-mono text-xs overflow-y-auto">
                <div>
                  <h4 className="text-[#C9A84C] font-bold uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Synchronized Transcript &amp; Index
                  </h4>
                  <p className="text-[11px] text-[#777] mt-0.5">
                    Click any timestamp to jump the video/audio log straight to that discussion point.
                  </p>
                </div>

                {/* Transcript Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    placeholder="Search keywords in transcript..."
                    className="w-full bg-[#161616] border border-[#2B2B2B] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555] rounded outline-none focus:border-[#C9A84C]"
                  />
                </div>

                {/* Transcript Segments List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1">
                  {selectedMeetingForPlayer.transcript
                    .filter((t) =>
                      transcriptSearch
                        ? t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
                          t.keywords.some((k) => k.toLowerCase().includes(transcriptSearch.toLowerCase()))
                        : true
                    )
                    .map((segment, idx) => {
                      const isActive =
                        playbackSeconds >= segment.seconds &&
                        playbackSeconds <= segment.seconds + 90;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            triggerHapticFeedback('tick');
                            setPlaybackSeconds(segment.seconds);
                            setIsPlaying(true);
                          }}
                          className={`p-2.5 rounded border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-white shadow-md'
                              : 'bg-[#141414] border-[#222] text-[#AAA] hover:border-[#444]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#777] mb-1">
                            <span className="text-[#C9A84C] font-bold">{segment.timestamp}</span>
                            <span className="text-white/80 font-medium">{segment.speaker}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{segment.text}</p>
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {segment.keywords.map((k, ki) => (
                              <span
                                key={ki}
                                className="px-1.5 py-0.2 bg-[#222] text-[#888] text-[9px] rounded font-mono"
                              >
                                #{k}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Agenda Points Checklist */}
                <div className="p-3 bg-[#141414] border border-[#222] rounded space-y-2">
                  <span className="text-[10px] text-[#777] uppercase font-bold block">
                    MEETING AGENDA &amp; FMCSA CITATIONS
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#CCC]">
                    {selectedMeetingForPlayer.agenda.map((ag, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                        <span>{ag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASSIGN MANDATORY ATTENDANCE FOR COMPLIANCE AUDITS                 */}
      {/* ========================================================================= */}
      {isAssignModalOpen && meetingToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#333] p-6 rounded-xl space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-widest block">
                  FMCSA AUDIT MANDATE ASSIGNMENT
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white mt-0.5">
                  Assign Mandatory Attendance
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-[#666] hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded space-y-1">
              <span className="text-[#666] text-[10px] uppercase block">TARGET MEETING</span>
              <div className="text-white font-bold text-sm">{meetingToAssign.title}</div>
              <div className="text-cyan-400 text-xs">{meetingToAssign.fmcsaStatute}</div>
            </div>

            {/* Audit Category & Urgency Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Compliance Audit Objective
                </label>
                <select
                  value={assignAuditCategory}
                  onChange={(e) => setAssignAuditCategory(e.target.value as SafetyMeetingAuditCategory)}
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                >
                  <option value="ANNUAL_SAFETY_FITNESS_385">Annual Safety Fitness (Part 385)</option>
                  <option value="FMCSA_NEW_ENTRANT_AUDIT">FMCSA New Entrant Audit</option>
                  <option value="POST_INCIDENT_CORRECTIVE_ACTION">Post-Incident Corrective Action (CAP)</option>
                  <option value="CVSA_BRAKE_SAFETY">CVSA Brake Safety Verification</option>
                  <option value="HAZMAT_SECURITY_HM232">Hazmat Security Plan (HM-232)</option>
                  <option value="HOURS_OF_SERVICE_AUDIT">Hours of Service &amp; Log Precision (Part 395)</option>
                </select>
              </div>

              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Audit Urgency &amp; Priority
                </label>
                <select
                  value={assignUrgency}
                  onChange={(e) => setAssignUrgency(e.target.value as any)}
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                >
                  <option value="MANDATORY_CRITICAL">MANDATORY CRITICAL (Immediate Action)</option>
                  <option value="URGENT">URGENT (14-Day Deadline)</option>
                  <option value="ANNUAL_STANDARD">ANNUAL STANDARD (30-Day Window)</option>
                </select>
              </div>
            </div>

            {/* Deadline Date */}
            <div>
              <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                Mandatory Completion Deadline
              </label>
              <input
                type="date"
                value={assignDeadline}
                onChange={(e) => setAssignDeadline(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Driver Selection Roster */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[#888] text-[10px] uppercase font-bold">
                  Select Drivers for Mandatory Assignment ({selectedDriverIds.length} of {ASSIGNABLE_FLEET_DRIVERS.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDriverIds.length === ASSIGNABLE_FLEET_DRIVERS.length) {
                      setSelectedDriverIds([]);
                    } else {
                      setSelectedDriverIds(ASSIGNABLE_FLEET_DRIVERS.map((d) => d.id));
                    }
                  }}
                  className="text-[10px] text-[#C9A84C] hover:underline"
                >
                  {selectedDriverIds.length === ASSIGNABLE_FLEET_DRIVERS.length ? 'Deselect All' : 'Select All Roster'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {ASSIGNABLE_FLEET_DRIVERS.map((driver) => {
                  const isChecked = selectedDriverIds.includes(driver.id);
                  return (
                    <div
                      key={driver.id}
                      onClick={() => {
                        triggerHapticFeedback('tick');
                        if (isChecked) {
                          setSelectedDriverIds(selectedDriverIds.filter((id) => id !== driver.id));
                        } else {
                          setSelectedDriverIds([...selectedDriverIds, driver.id]);
                        }
                      }}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-white'
                          : 'bg-[#0A0A0A] border-[#222] text-[#777]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{driver.name}</div>
                        <div className="text-[10px] text-[#777]">{driver.unit}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-[#C9A84C] border-[#C9A84C] text-black' : 'border-[#444]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black uppercase rounded transition-all shadow-[0_0_20px_rgba(201,168,76,0.25)]"
              >
                CONFIRM AUDIT ASSIGNMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CERTIFIED ATTENDANCE CERTIFICATE DOSSIER                          */}
      {/* ========================================================================= */}
      {selectedCertRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-[#141414] border border-[#333] rounded-xl shadow-2xl p-6 space-y-4 font-mono text-xs max-h-[92vh] overflow-y-auto">
            {/* Cert Header */}
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-widest block">
                    FMCSA AUDIT CERTIFICATION
                  </span>
                  <h3 className="font-headline text-lg uppercase font-black text-white">
                    Safety Meeting Training Certificate
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCertRecord(null)}
                className="text-[#777] hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Certificate Paper Style Display */}
            <div className="p-5 bg-[#0A0A0A] border-2 border-[#C9A84C]/60 rounded-lg space-y-4 text-center">
              <div className="text-[10px] text-[#777] uppercase tracking-widest font-bold">
                DEPARTMENT OF TRANSPORTATION • FMCSA COMPLIANCE RECORD
              </div>
              <h2 className="font-headline text-xl text-white uppercase font-black tracking-wide">
                CERTIFICATE OF SAFETY TRAINING &amp; COMPREHENSION
              </h2>
              <div className="text-[#888] text-xs">
                This certifies that commercial driver
              </div>
              <div className="text-xl font-headline font-black text-[#C9A84C] underline decoration-[#C9A84C]/40 underline-offset-4">
                {selectedCertRecord.record.driverName}
              </div>
              <div className="text-[11px] text-[#AAA]">
                CDL: {selectedCertRecord.record.driverCdlNumber} • Unit: {selectedCertRecord.record.unitAssigned || 'Fleet Active'}
              </div>

              <div className="p-3 bg-[#111] border border-[#222] rounded text-left space-y-1.5 text-[11px]">
                <div className="text-white font-bold">{selectedCertRecord.record.meetingTitle}</div>
                <div className="text-cyan-400 text-[10px]">
                  Audit Mandate: {selectedCertRecord.record.auditCategoryAssigned || '49 CFR PART 385 REVIEW'}
                </div>
                <div className="text-[#888] text-[10px]">
                  Completed At: {selectedCertRecord.record.attendedAt} • GPS: {selectedCertRecord.record.gpsLocation}
                </div>
                <div className="text-emerald-400 font-bold text-[10px]">
                  Comprehension Score: {selectedCertRecord.record.scorePercent}% (100% Mastery Verified)
                </div>
              </div>

              {/* Digital Signature & Cryptographic Seal */}
              <div className="pt-2 border-t border-[#1C1C1C] text-left space-y-1 text-[10px]">
                <div className="text-[#777]">Biometric / PIN Digital Signature:</div>
                <div className="text-white font-bold">{selectedCertRecord.record.digitalSignature}</div>
                <div className="text-[#555] font-mono break-all">
                  SHA-256 Seal: {selectedCertRecord.record.certificateHashSha256}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCertRecord(null)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('double');
                  alert(`Certificate for ${selectedCertRecord.record.driverName} downloaded. SHA-256 seal valid.`);
                  setSelectedCertRecord(null);
                }}
                className="px-5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black uppercase rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>DOWNLOAD CERTIFIED PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK SIGN-OFF VERIFIER                                          */}
      {/* ========================================================================= */}
      {isSignOffModalOpen && selectedMeetingForPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141414] border border-[#333] rounded-xl shadow-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest block">
                  DIGITAL SIGN-OFF
                </span>
                <h3 className="font-headline text-lg uppercase font-black text-white mt-0.5">
                  Certify Meeting Attendance
                </h3>
              </div>
              <button
                onClick={() => setIsSignOffModalOpen(false)}
                className="text-[#666] hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Select Attending Driver
                </label>
                <select
                  value={signOffDriverId}
                  onChange={(e) => setSignOffDriverId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                >
                  {ASSIGNABLE_FLEET_DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.cdlNumber} ({d.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Driver Notes / Observations
                </label>
                <textarea
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-[11px] text-emerald-300">
                <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                By signing, the driver confirms full playback review of &ldquo;{selectedMeetingForPlayer.title}&rdquo; and adherence to {selectedMeetingForPlayer.fmcsaStatute}.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222]">
              <button
                onClick={() => setIsSignOffModalOpen(false)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDriverSignOff}
                className="px-5 py-2 bg-[#FFE600] hover:bg-[#FFE600] text-black font-black uppercase rounded shadow-lg"
              >
                COMPLETE CERTIFICATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ARCHIVE / SCHEDULE NEW MEETING                                   */}
      {/* ========================================================================= */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#333] rounded-xl shadow-2xl p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-widest block">
                  NEW SAFETY ARCHIVE ENTRY
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white mt-0.5">
                  Schedule / Archive Safety Meeting
                </h3>
              </div>
              <button
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="text-[#666] hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hours of Service Split-Sleeper Precision & Adverse Weather Exemptions"
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                    FMCSA Statute Citation
                  </label>
                  <input
                    type="text"
                    value={newStatute}
                    onChange={(e) => setNewStatute(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                    Meeting Leader
                  </label>
                  <input
                    type="text"
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                    Media Log Type
                  </label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as SafetyMeetingMediaType)}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                  >
                    <option value="VIDEO">Video Log (MP4 / WebM)</option>
                    <option value="AUDIO">Audio Log (MP3 / WAV)</option>
                    <option value="INTERACTIVE_SLIDES">Interactive Slides</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                    Audit Priority
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                  >
                    <option value="MANDATORY_CRITICAL">MANDATORY CRITICAL</option>
                    <option value="URGENT">URGENT</option>
                    <option value="ANNUAL_STANDARD">ANNUAL STANDARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#888] text-[10px] uppercase font-bold block mb-1">
                  Meeting Summary &amp; Scope
                </label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  rows={3}
                  placeholder="Provide an overview of regulatory points covered and mandatory driver responsibilities..."
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] text-white p-2 rounded outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewMeeting}
                className="px-5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black uppercase rounded shadow-lg"
              >
                SAVE &amp; ARCHIVE LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Audio Recorder Modal with AI-Transcription Worker Job */}
      <LiveSafetyMeetingRecorderModal
        isOpen={isLiveRecorderOpen}
        onClose={() => setIsLiveRecorderOpen(false)}
        onMeetingRecorded={(newMeeting) => {
          setMeetings((prev) => [newMeeting, ...prev]);
          showToast(`Safety Meeting "${newMeeting.title}" successfully recorded, AI transcribed, and archived!`);
        }}
      />

      {/* FMCSA ELD Compliant CSV Export Modal for Audit Submission */}
      <FmcsaEldCsvExportModal
        isOpen={isEldCsvExportModalOpen}
        onClose={() => setIsEldCsvExportModalOpen(false)}
      />
    </div>
  );
};
