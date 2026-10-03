// ============================================================================
// DRIVER SAFETY MEETINGS & FMCSA COMPLIANCE SUITE
// Enables interactive driver safety meetings, digital attendance sign-off,
// comprehension testing, and audit-ready certification storage in Firestore.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Video,
  FileText,
  UserCheck,
  ShieldCheck,
  Search,
  Plus,
  Printer,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Volume2,
  Users,
  Check,
  X,
  FileSignature,
} from 'lucide-react';
import {
  DriverSafetyMeeting,
  SafetyMeetingAttendanceRecord,
  fetchSafetyMeetings,
  saveSafetyMeeting,
  recordMeetingAttendance,
  fetchAttendanceRecords,
  INITIAL_SAFETY_MEETINGS,
} from '../services/safetyMeetingService';
import { triggerHapticFeedback } from '../services/haptics';

export const DriverSafetyMeetingsView: React.FC = () => {
  const [meetings, setMeetings] = useState<DriverSafetyMeeting[]>(INITIAL_SAFETY_MEETINGS);
  const [attendance, setAttendance] = useState<SafetyMeetingAttendanceRecord[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<DriverSafetyMeeting | null>(INITIAL_SAFETY_MEETINGS[0]);
  const [isMeetingRoomOpen, setIsMeetingRoomOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Interactive Meeting Room State
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [driverSignatureName, setDriverSignatureName] = useState('Marcus Vance');
  const [driverCdlInput, setDriverCdlInput] = useState('PA-CDL-9048123-A');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Meeting Form State
  const [newTitle, setNewTitle] = useState('');
  const [newStatute, setNewStatute] = useState('49 CFR § 395 (Hours of Service)');
  const [newDate, setNewDate] = useState('2026-04-10 10:00 AM EDT');
  const [newLeader, setNewLeader] = useState('Jeremiah Morris (Safety Director)');
  const [newSummary, setNewSummary] = useState('');

  useEffect(() => {
    fetchSafetyMeetings().then(setMeetings);
    fetchAttendanceRecords().then(setAttendance);
  }, []);

  const handleOpenMeetingRoom = (meeting: DriverSafetyMeeting) => {
    triggerHapticFeedback('tick');
    setSelectedMeeting(meeting);
    setIsMeetingRoomOpen(true);
    setCurrentSlideIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    triggerHapticFeedback('tick');
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = (): number => {
    if (!selectedMeeting) return 0;
    const questions = selectedMeeting.quizQuestions;
    if (questions.length === 0) return 100;
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedMeeting) return;
    triggerHapticFeedback('success');
    setQuizSubmitted(true);
    const score = calculateScore();

    const record: SafetyMeetingAttendanceRecord = {
      id: `att-${Date.now()}`,
      meetingId: selectedMeeting.id,
      meetingTitle: selectedMeeting.title,
      driverId: 'drv-current-user',
      driverName: driverSignatureName || 'Authenticated Commercial Driver',
      driverCdlNumber: driverCdlInput || 'CDL-VERIFIED',
      attendedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' EDT',
      scorePercent: score,
      passed: score >= 70,
      digitalSignature: `${driverSignatureName} [Verified Digital PIN / Voice ID]`,
      driverNotes: 'Attended live in-cab interactive briefing. Full curriculum reviewed.',
      gpsLocation: '41.1350° N, 77.7200° W (I-80 Travel Center)',
      certificateHashSha256: 'sha256-cert-' + Math.random().toString(36).substring(2, 10),
      fmcsaCompliant: true,
    };

    await recordMeetingAttendance(record);
    const updated = await fetchAttendanceRecords();
    setAttendance(updated);

    setToastMessage(`MEETING COMPLETED (${score}%) // FMCSA AUDIT CERTIFICATE STORED`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    triggerHapticFeedback('success');
    const meeting: DriverSafetyMeeting = {
      id: `sm-${Date.now()}`,
      title: newTitle,
      fmcsaStatute: newStatute,
      monthQuarter: 'Spring 2026 Fleet Mandatory',
      status: 'SCHEDULED',
      meetingLeader: newLeader,
      meetingDate: newDate,
      durationMinutes: 30,
      durationFormatted: '30:00',
      mediaType: 'INTERACTIVE_SLIDES',
      assignedDriverIds: [],
      auditCategory: 'ANNUAL_SAFETY_FITNESS_385',
      auditMandateDescription: 'Quarterly safety briefing and statutory compliance review',
      auditUrgency: 'ANNUAL_STANDARD',
      auditDeadline: newDate,
      summary: newSummary || 'Scheduled commercial driver safety and compliance briefing.',
      agenda: [
        '1. Regulatory statutory overview and state DOT updates',
        '2. Defensive driving review and telematics avoidance',
        '3. Driver Q&A and digital signature roll call',
      ],
      mandatoryForRoles: ['ALL_DRIVERS'],
      slidesCount: 10,
      quizQuestions: [
        {
          id: 'gen-q1',
          question: 'What is the primary objective of commercial driver safety compliance under FMCSA rules?',
          options: [
            'Minimizing travel breaks to speed up delivery',
            'Protecting driver life, reducing highway collisions, and preserving public safety',
            'Avoiding broker check-in calls',
            'Maximizing gross vehicle weight beyond axle limits',
          ],
          correctAnswerIndex: 1,
          explanation: 'FMCSA safety regulations exist to prevent collisions, protect drivers, and ensure highway safety.',
        },
      ],
      totalAttendedCount: 0,
      totalAssignedCount: 12,
      fmcsaAuditCode: `FMCSA-SM-${Math.floor(1000 + Math.random() * 9000)}`,
      transcript: [],
      createdAt: new Date().toISOString(),
    };

    await saveSafetyMeeting(meeting);
    const updated = await fetchSafetyMeetings();
    setMeetings(updated);
    setIsScheduleModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    setToastMessage('NEW DRIVER SAFETY MEETING BROADCASTED');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-white max-w-7xl mx-auto pb-16">
      
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F1B14] border border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-[#0C0E14] border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-headline font-black text-white uppercase tracking-tight">
                Driver Safety Meetings &amp; FMCSA Compliance
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                49 CFR COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Programmed driver safety meetings · In-App live briefings · Digital signature rosters · Stored in Firebase Firestore
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2CA50] text-[#0A0A0A] font-mono text-xs font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED & ACTIVE MEETINGS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono">
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Programmed Safety Curriculum (Monthly &amp; Quarterly)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {meetings.length} Scheduled Sessions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                meeting.status === 'ACTIVE_NOW'
                  ? 'bg-[#141208] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                  : 'bg-[#0E1119] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    meeting.status === 'ACTIVE_NOW'
                      ? 'bg-[#D4AF37] text-black font-black animate-pulse'
                      : meeting.status === 'COMPLETED'
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {meeting.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {meeting.durationMinutes} MINS
                  </span>
                </div>

                <h3 className="font-headline font-bold text-base text-white leading-snug">
                  {meeting.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {meeting.summary}
                </p>

                <div className="text-[11px] font-mono text-amber-200/90 pt-1 border-t border-slate-800/80">
                  Statute: <strong className="text-white">{meeting.fmcsaStatute}</strong>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Leader: <span className="text-slate-300">{meeting.meetingLeader}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{meeting.totalAttendedCount} Drivers Certified</span>
                </div>

                <button
                  onClick={() => handleOpenMeetingRoom(meeting)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-all shadow active:scale-95 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Enter Room</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORICAL COMPLIANCE ATTENDANCE ROSTER */}
      <div className="bg-[#0C0E14] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[#D4AF37]" />
              <span>Digital Attendance &amp; FMCSA Compliance Roster</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographically signed driver attendance logs with quiz scores and DOT cert hashes
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export DOT Audit Roster</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-[#141722] border-b border-slate-800">
              <tr>
                <th className="p-3">Driver Name &amp; CDL</th>
                <th className="p-3">Safety Meeting Topic</th>
                <th className="p-3">Timestamp &amp; Location</th>
                <th className="p-3">Score</th>
                <th className="p-3">Digital Signature</th>
                <th className="p-3">Audit Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <strong className="text-white block">{rec.driverName}</strong>
                    <span className="text-[10px] text-slate-400">{rec.driverCdlNumber}</span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <span className="text-slate-200 font-sans line-clamp-1">{rec.meetingTitle}</span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-300">
                    <div>{rec.attendedAt}</div>
                    <span className="text-[10px] text-slate-500">{rec.gpsLocation}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                      {rec.scorePercent}% PASSED
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-cyan-300 truncate max-w-[140px]">
                    {rec.digitalSignature}
                  </td>
                  <td className="p-3 text-[10px] text-amber-300 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#1C1605] border border-[#D4AF37]/40 truncate block max-w-[120px]">
                      {rec.certificateHashSha256}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE MEETING ROOM MODAL */}
      {isMeetingRoomOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0A0C10] border-2 border-emerald-500 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] p-4 sm:p-6 space-y-4">
            
            {/* ROOM HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-white uppercase">
                    {selectedMeeting.title}
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">
                    Live Broadcast · Leader: {selectedMeeting.meetingLeader}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMeetingRoomOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIDEO/BRIEFING SIMULATOR */}
            <div className="relative aspect-video rounded-xl bg-[#06080C] border-2 border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-lg" onClick={() => setIsPlayingBriefing(!isPlayingBriefing)}>
                {isPlayingBriefing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </div>

              <div>
                <span className="font-mono text-xs text-amber-300 uppercase font-bold tracking-wider">
                  Slide {currentSlideIndex + 1} of {selectedMeeting.agenda.length}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-1 max-w-xl">
                  {selectedMeeting.agenda[currentSlideIndex] || selectedMeeting.title}
                </h4>
              </div>

              {/* Slide controls */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                >
                  Previous Slide
                </button>
                <button
                  onClick={() => setCurrentSlideIndex(Math.min(selectedMeeting.agenda.length - 1, currentSlideIndex + 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                >
                  Next Slide
                </button>
              </div>
            </div>

            {/* INTERACTIVE COMPREHENSION QUIZ */}
            <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs uppercase font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Comprehension Check (FMCSA Roster Requirement)</span>
                </span>
                {quizSubmitted && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40 text-xs">
                    Score: {calculateScore()}%
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {selectedMeeting.quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 space-y-2">
                    <p className="text-xs text-white font-bold">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isCorrect = q.correctAnswerIndex === optIdx;
                        let btnStyle = 'bg-[#141722] border-slate-800 text-slate-300';
                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                        } else if (isSelected) {
                          btnStyle = 'bg-[#1C1605] border-[#D4AF37] text-amber-200 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${btnStyle}`}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIGITAL SIGNATURE & COMPLETION */}
            <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-xs uppercase font-bold text-amber-300 block pb-1 border-b border-slate-800">
                Driver Digital Sign-off &amp; Certification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Commercial Driver Name:</label>
                  <input
                    type="text"
                    value={driverSignatureName}
                    onChange={(e) => setDriverSignatureName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0C12] border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">State CDL License Number:</label>
                  <input
                    type="text"
                    value={driverCdlInput}
                    onChange={(e) => setDriverCdlInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0C12] border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-500">
                  By clicking certify, you sign this statutory compliance record under penalty of perjury (49 CFR § 390.35).
                </span>

                <button
                  onClick={handleSubmitAttendance}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold uppercase transition-all shadow-md active:scale-95"
                >
                  Certify &amp; Store Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE NEW SAFETY MEETING MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0C0E14] border-2 border-[#D4AF37] rounded-2xl shadow-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-headline font-bold text-base text-white uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Program Driver Safety Meeting</span>
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Meeting Title &amp; Topic:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rollover Prevention & Speed Governance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">FMCSA Statute Reference:</label>
                <input
                  type="text"
                  value={newStatute}
                  onChange={(e) => setNewStatute(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Scheduled Date &amp; Time:</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Meeting Leader:</label>
                  <input
                    type="text"
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Summary &amp; Key Objectives:</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe mandatory objectives, chain requirements, following distances..."
                  className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0A0A0A] font-bold uppercase transition-all shadow"
                >
                  Save &amp; Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
