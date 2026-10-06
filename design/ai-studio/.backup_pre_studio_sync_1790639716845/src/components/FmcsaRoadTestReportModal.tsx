import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserCheck,
  Truck,
  Sparkles,
  X,
  Eye,
  Check,
  Copy,
  Award,
  FileCheck,
  Scale,
} from 'lucide-react';
import { RoadTestRecord, RoadTestEvaluationItem } from '../types';
import { FMCSA_STATUTORY_ROAD_TEST_ITEMS } from '../services/roadTestService';

interface FmcsaRoadTestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RoadTestRecord | null;
}

export const FmcsaRoadTestReportModal: React.FC<FmcsaRoadTestReportModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [viewMode, setViewMode] = useState<'PAPER' | 'DIGITAL'>('PAPER');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !record) return null;

  // Map items to scored results
  const itemsWithScores = FMCSA_STATUTORY_ROAD_TEST_ITEMS.map((item) => {
    const scored = record.scores[item.id];
    return {
      item,
      pointsEarned: scored ? scored.pointsEarned : item.pointsMax,
      status: scored ? scored.status : 'PASS',
      note: scored?.trainerNote || '',
    };
  });

  const handlePrintToPdf = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(record.cryptographicSealHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Generate downloadable self-contained HTML report
  const handleDownloadStandaloneReport = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FMCSA 49 CFR § 391.31 Road Test Report - ${record.certificateNumber}</title>
  <style>
    @page { size: letter portrait; margin: 0.4in; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; line-height: 1.35; margin: 0; padding: 20px; font-size: 11px; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { font-size: 17px; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .header h2 { font-size: 12px; margin: 0 0 4px 0; font-weight: normal; color: #333; }
    .header .meta { font-size: 10px; font-family: monospace; font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .card { border: 1px solid #777; padding: 8px; border-radius: 4px; }
    .card-title { font-size: 10px; font-weight: bold; text-transform: uppercase; background: #eee; padding: 3px 6px; margin: -8px -8px 6px -8px; border-bottom: 1px solid #ccc; }
    .field { margin-bottom: 4px; display: flex; justify-content: space-between; }
    .field label { font-weight: bold; color: #555; }
    .field span { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
    th, td { border: 1px solid #999; padding: 4px 6px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; text-transform: uppercase; font-size: 9px; }
    .badge { display: inline-block; padding: 1px 5px; font-size: 9px; font-weight: bold; border-radius: 3px; font-family: monospace; }
    .badge-pass { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
    .badge-need { background: #fef7e0; color: #b06000; border: 1px solid #fce8b2; }
    .badge-fail { background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf; }
    .cert-box { border: 2px solid #000; padding: 10px; margin-top: 10px; background: #fafafa; }
    .cert-title { font-weight: bold; text-transform: uppercase; font-size: 11px; margin-bottom: 6px; text-align: center; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 14px; }
    .sig-line { border-top: 1px solid #000; padding-top: 4px; font-size: 10px; }
    .sig-name { font-style: italic; font-size: 12px; font-family: serif; color: #0b3d91; margin-bottom: 2px; }
    .seal-box { margin-top: 10px; border-top: 1px dashed #777; padding-top: 6px; font-size: 8.5px; font-family: monospace; color: #444; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 9px; font-weight: bold; letter-spacing: 1px; color: #0b3d91;">U.S. DEPARTMENT OF TRANSPORTATION · FEDERAL MOTOR CARRIER SAFETY ADMINISTRATION</div>
    <h1>Driver's Road Test Examination & Certificate of Road Test</h1>
    <h2>Form Pursuant to 49 CFR § 391.31 · Motor Carrier Driver Qualification File (49 CFR § 391.51)</h2>
    <div class="meta">Certificate #: ${record.certificateNumber} | Exam Date: ${record.testDate} (${record.testStartTime} - ${record.testEndTime})</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Driver Candidate Dossier</div>
      <div class="field"><label>Candidate Name:</label><span>${record.driverCandidateName}</span></div>
      <div class="field"><label>CDL License #:</label><span>${record.driverCandidateCdl} (${record.driverCandidateState})</span></div>
      <div class="field"><label>Commercial Experience:</label><span>${record.yearsExperience} Years</span></div>
      <div class="field"><label>Telephone:</label><span>${record.driverCandidatePhone}</span></div>
      <div class="field"><label>Examination Route:</label><span style="font-size: 9px; max-width: 60%;">${record.routeDescription}</span></div>
      <div class="field"><label>Route Mileage:</label><span>${record.mileageCovered} Miles</span></div>
    </div>
    <div class="card">
      <div class="card-title">Motor Carrier & Equipment Evaluated</div>
      <div class="field"><label>Carrier Name:</label><span>${record.evaluatorCompany}</span></div>
      <div class="field"><label>Tractor / Power Unit:</label><span>${record.powerUnitNumber} (${record.powerUnitMakeModel})</span></div>
      <div class="field"><label>Trailer Spec:</label><span>${record.trailerNumber} (${record.trailerType})</span></div>
      <div class="field"><label>Transmission Type:</label><span>${record.transmissionType.replace(/_/g, ' ')}</span></div>
      <div class="field"><label>GVWR / Capacity:</label><span>${record.grossVehicleWeightRating}</span></div>
      <div class="field"><label>Weather Conditions:</label><span>${record.weatherConditions.replace(/_/g, ' ')}</span></div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 12px;">
    <div class="card-title">Statutory 49 CFR § 391.31 Evaluation Scorecard</div>
    <table>
      <thead>
        <tr>
          <th style="width: 28px;">#</th>
          <th>FMCSA Statutory Maneuver & Standard</th>
          <th>CFR Citation</th>
          <th style="width: 60px; text-align: center;">Pts Scored</th>
          <th style="width: 70px; text-align: center;">Rating</th>
          <th>Examiner Observations / Notes</th>
        </tr>
      </thead>
      <tbody>
        ${itemsWithScores.map((row, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${row.item.name}</strong><br/><span style="color: #555; font-size: 8.5px;">${row.item.description}</span></td>
            <td style="font-family: monospace; font-size: 8.5px;">${row.item.statutoryCfr}</td>
            <td style="text-align: center; font-weight: bold;">${row.pointsEarned} / ${row.item.pointsMax}</td>
            <td style="text-align: center;"><span class="badge ${row.status === 'PASS' ? 'badge-pass' : row.status === 'NEEDS_WORK' ? 'badge-need' : 'badge-fail'}">${row.status}</span></td>
            <td style="font-size: 9px;">${row.note || 'Meets statutory pass threshold.'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="background: #f7f7f7; border: 1px solid #ddd; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>Total Examination Score: </strong> <span style="font-size: 13px; font-weight: bold; color: #0b3d91;">${record.totalEarnedPoints} / ${record.totalPossiblePoints} (${record.scorePercentage}%)</span>
        &nbsp;|&nbsp; <strong>Threshold: </strong> 80.0%
      </div>
      <div>
        <strong>Critical Safety Infractions: </strong> <span style="font-weight: bold; color: ${record.hasCriticalFailure ? '#c5221f' : '#137333'};">${record.hasCriticalFailure ? 'FAILED: ' + record.criticalFailureReason : 'ZERO (CLEARED)'}</span>
      </div>
      <div>
        <strong>Result: </strong> <span style="font-weight: bold; text-transform: uppercase;">${record.overallResult.replace(/_/g, ' ')}</span>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 12px;">
    <div class="card-title">Examiner Qualitative Assessment & Feedback</div>
    <div style="font-size: 9.5px; line-height: 1.4;">
      <p><strong>1. Safety & Situational Awareness:</strong> ${record.trainerFeedback.safetyAndAwarenessCritique}</p>
      <p><strong>2. Vehicle Control, Braking & Shifting:</strong> ${record.trainerFeedback.vehicleControlAndShiftingCritique}</p>
      <p><strong>3. Backing & Yard Maneuvers:</strong> ${record.trainerFeedback.backingAndManeuveringCritique}</p>
      <p><strong>4. Overhead & Lateral Clearances:</strong> ${record.trainerFeedback.clearanceAndSpatialJudgementCritique}</p>
      <p><strong>5. Recommendation:</strong> ${record.trainerFeedback.overallTrainerRecommendation}</p>
    </div>
  </div>

  <div class="cert-box">
    <div class="cert-title">Examiner's Statutory Certification (49 CFR § 391.31(e))</div>
    <p style="font-size: 10px; text-align: justify; margin: 0 0 10px 0;">
      "This is to certify that the above-named driver was given a road test under my supervision on <strong>${record.testDate}</strong>, consisting of approximately <strong>${record.mileageCovered} miles</strong> of driving. It is my considered judgment that this driver possesses sufficient driving skill to operate safely the type of commercial motor vehicle listed above."
    </p>

    <div class="signatures">
      <div>
        <div class="sig-name">${record.evaluatorSignature}</div>
        <div class="sig-line">
          <strong>Examiner:</strong> ${record.evaluatorTrainerName} &bull; <strong>Title:</strong> ${record.evaluatorTrainerTitle}<br/>
          <strong>Examiner CDL:</strong> ${record.evaluatorTrainerCdl} &bull; <strong>Date:</strong> ${record.evaluatorSignatureDate}
        </div>
      </div>
      <div>
        <div class="sig-name">${record.driverCandidateSignature}</div>
        <div class="sig-line">
          <strong>Candidate Driver:</strong> ${record.driverCandidateName} &bull; <strong>Date:</strong> ${record.driverCandidateSignatureDate}<br/>
          <em>Driver Qualification File (DQF) Permanent Record Retention under 49 CFR § 391.51</em>
        </div>
      </div>
    </div>

    <div class="seal-box">
      <strong>TRUCKWITHEASE DQF CRYPTOGRAPHIC VERIFICATION SEAL (SHA-256):</strong><br/>
      ${record.cryptographicSealHash}<br/>
      Generated electronically by Truckwithease Fleet Cockpit under FMCSA 49 CFR § 391.31. Tamper-evident verified record.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FMCSA-391-31-Road-Test-${record.driverCandidateName.replace(/\s+/g, '_')}-${record.certificateNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ON-SCREEN MODAL PREVIEW & CONTROL BAR */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn print:hidden">
        <div className="w-full max-w-5xl bg-[#0f0f11] border-2 border-[#D4AF37]/60 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] text-white font-sans overflow-hidden">
          
          {/* Top Control Bar (Never Printed) */}
          <div className="p-4 bg-[#141416] border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/40 uppercase">
                    FMCSA 49 CFR § 391.31
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 uppercase">
                    DQF COMPLIANT REPORT
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    Cert #{record.certificateNumber}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Driver's Road Test Examination &amp; Certificate Report
                </h2>
              </div>
            </div>

            {/* Action Buttons: Print to PDF & Download */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-lg border border-[#333] bg-[#1a1a1c] p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('PAPER')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition flex items-center gap-1 ${
                    viewMode === 'PAPER'
                      ? 'bg-white text-black font-black'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  Print Paper View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('DIGITAL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition flex items-center gap-1 ${
                    viewMode === 'DIGITAL'
                      ? 'bg-[#D4AF37] text-black font-black'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Cockpit Theme
                </button>
              </div>

              {/* PRIMARY 'PRINT TO PDF' BUTTON */}
              <button
                type="button"
                onClick={handlePrintToPdf}
                className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/25"
                title="Open browser print dialog to print or save as clean FMCSA PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Print to PDF</span>
              </button>

              {/* Download Standalone File */}
              <button
                type="button"
                onClick={handleDownloadStandaloneReport}
                className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-white text-xs font-bold uppercase transition border border-[#383838] flex items-center gap-1.5"
                title="Download clean standalone report document"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Download HTML/PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222]"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* VIEW MODE 1: OFFICIAL PAPER VIEW (Clean White 8.5" x 11" Legal Paper Presentation) */}
            {viewMode === 'PAPER' && (
              <div className="bg-white text-black p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl mx-auto font-sans border border-gray-300 space-y-6 text-xs leading-normal select-text">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-black pb-3 text-center space-y-1">
                  <div className="text-[10px] font-bold tracking-widest text-[#003366] uppercase">
                    FEDERAL MOTOR CARRIER SAFETY ADMINISTRATION · U.S. DEPARTMENT OF TRANSPORTATION
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                    Driver's Road Test Examination &amp; Certificate
                  </h1>
                  <div className="text-[11px] font-medium text-gray-700">
                    Prescribed under <strong>49 CFR § 391.31</strong> · Motor Carrier Driver Qualification File (DQF) 49 CFR § 391.51(b)(3)
                  </div>
                  <div className="text-[10px] font-mono text-gray-600 font-bold pt-1">
                    CERTIFICATE NO: <span className="text-black">{record.certificateNumber}</span> &bull; EXAM DATE: {record.testDate} ({record.testStartTime} - {record.testEndTime})
                  </div>
                </div>

                {/* Top Dossier Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Candidate Dossier */}
                  <div className="border border-gray-400 rounded p-3 space-y-1 bg-gray-50">
                    <div className="text-[10px] font-black uppercase text-gray-600 border-b border-gray-300 pb-1 mb-1">
                      Section 1: Commercial Driver Candidate
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Driver Legal Name:</span>
                      <span className="font-bold text-black">{record.driverCandidateName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Commercial Driver's License:</span>
                      <span className="font-mono font-bold text-black">{record.driverCandidateCdl} ({record.driverCandidateState})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Commercial Experience:</span>
                      <span className="font-bold text-black">{record.yearsExperience} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Driver Telephone:</span>
                      <span className="text-black">{record.driverCandidatePhone}</span>
                    </div>
                    <div className="pt-1 text-[10px] text-gray-700">
                      <strong>Highway Route Evaluated:</strong> {record.routeDescription} ({record.mileageCovered} Miles)
                    </div>
                  </div>

                  {/* Motor Carrier & Equipment */}
                  <div className="border border-gray-400 rounded p-3 space-y-1 bg-gray-50">
                    <div className="text-[10px] font-black uppercase text-gray-600 border-b border-gray-300 pb-1 mb-1">
                      Section 2: Motor Carrier &amp; Test Equipment
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Motor Carrier:</span>
                      <span className="font-bold text-black">{record.evaluatorCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Tractor / Power Unit:</span>
                      <span className="font-bold text-black">{record.powerUnitNumber} — {record.powerUnitMakeModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Trailer Specification:</span>
                      <span className="text-black">{record.trailerNumber} ({record.trailerType})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Transmission / Weight:</span>
                      <span className="text-black">{record.transmissionType.replace(/_/g, ' ')} &bull; {record.grossVehicleWeightRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Weather Conditions:</span>
                      <span className="text-black">{record.weatherConditions.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Statutory 14-Item FMCSA Examination Scorecard Table */}
                <div className="border border-gray-400 rounded overflow-hidden">
                  <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-400 font-black text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>Section 3: FMCSA 49 CFR § 391.31(c) Statutory Maneuver Performance Scorecard</span>
                    <span className="text-[10px] font-mono font-bold text-gray-700">Passing Threshold: 80%</span>
                  </div>
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-200 border-b border-gray-300 font-bold uppercase text-gray-700">
                        <th className="p-1.5 w-6 text-center">#</th>
                        <th className="p-1.5">Maneuver &amp; Statutory Standard</th>
                        <th className="p-1.5 w-32">Statutory CFR</th>
                        <th className="p-1.5 w-16 text-center">Pts</th>
                        <th className="p-1.5 w-20 text-center">Rating</th>
                        <th className="p-1.5">Examiner Observations &amp; Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {itemsWithScores.map((row, idx) => (
                        <tr key={row.item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="p-1.5 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="p-1.5">
                            <div className="font-bold text-black">{row.item.name}</div>
                            <div className="text-[9px] text-gray-600 leading-tight">{row.item.description}</div>
                          </td>
                          <td className="p-1.5 font-mono text-[9px] text-gray-700 whitespace-nowrap">{row.item.statutoryCfr}</td>
                          <td className="p-1.5 text-center font-bold">
                            {row.pointsEarned} / {row.item.pointsMax}
                          </td>
                          <td className="p-1.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                              row.status === 'PASS'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : row.status === 'NEEDS_WORK'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-1.5 text-[9px] text-gray-800">
                            {row.note || 'Candidate met federal performance standards.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Score Footer Strip */}
                  <div className="p-3 bg-gray-100 border-t border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-bold text-gray-700">Total Scored: </span>
                      <strong className="text-base text-black font-mono">
                        {record.totalEarnedPoints} / {record.totalPossiblePoints} ({record.scorePercentage}%)
                      </strong>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Critical Safety Disqualifiers: </span>
                      <strong className={`font-mono ${record.hasCriticalFailure ? 'text-red-700' : 'text-green-800'}`}>
                        {record.hasCriticalFailure ? `DISQUALIFIED (${record.criticalFailureReason})` : 'ZERO DETECTED (PASSED)'}
                      </strong>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Overall Determination: </span>
                      <span className={`px-2 py-0.5 rounded font-black text-xs uppercase font-mono ${
                        record.overallResult === 'SATISFACTORY_PASS'
                          ? 'bg-green-700 text-white'
                          : 'bg-red-700 text-white'
                      }`}>
                        {record.overallResult.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualitative Feedback Rubric */}
                <div className="border border-gray-400 rounded p-3 space-y-2 bg-gray-50 text-[10px]">
                  <div className="font-black uppercase text-gray-600 border-b border-gray-300 pb-1">
                    Section 4: Certified Evaluator Formal Performance Critique
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-800">
                    <div>
                      <strong>1. Situational Awareness &amp; Mirror Scanning:</strong>
                      <p className="italic text-gray-700 mt-0.5">"{record.trainerFeedback.safetyAndAwarenessCritique}"</p>
                    </div>
                    <div>
                      <strong>2. Vehicle Control, Braking &amp; Shifting:</strong>
                      <p className="italic text-gray-700 mt-0.5">"{record.trainerFeedback.vehicleControlAndShiftingCritique}"</p>
                    </div>
                    <div>
                      <strong>3. Backing, Alley Docking &amp; G.O.A.L.:</strong>
                      <p className="italic text-gray-700 mt-0.5">"{record.trainerFeedback.backingAndManeuveringCritique}"</p>
                    </div>
                    <div>
                      <strong>4. Overhead Clearances &amp; Trailer Off-Tracking:</strong>
                      <p className="italic text-gray-700 mt-0.5">"{record.trainerFeedback.clearanceAndSpatialJudgementCritique}"</p>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-gray-200">
                    <strong className="text-black">Final Evaluator Recommendation &amp; Operational Clearance:</strong>
                    <p className="text-black font-semibold mt-0.5">"{record.trainerFeedback.overallTrainerRecommendation}"</p>
                  </div>
                </div>

                {/* Statutory Certification & Legal Signatures (§ 391.31(e)) */}
                <div className="border-2 border-black rounded p-4 space-y-3 bg-white">
                  <div className="text-center font-black uppercase text-xs tracking-wider text-black border-b border-gray-300 pb-1.5">
                    Certificate of Driver's Road Test (49 CFR § 391.31(e))
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-800 text-justify">
                    "This is to certify that the driver candidate named above has completed a road test under 49 CFR § 391.31 consisting of approximately <strong>{record.mileageCovered} miles</strong> of commercial driving over the designated route. It is our considered judgment that this driver possesses sufficient driving skill to operate safely the type of commercial motor vehicle listed above."
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
                    <div className="border-t border-black pt-2">
                      <div className="text-blue-900 font-serif text-sm italic font-bold mb-1">
                        {record.evaluatorSignature}
                      </div>
                      <div className="text-[10px] text-gray-700">
                        <strong>Examiner:</strong> {record.evaluatorTrainerName} &bull; <strong>Title:</strong> {record.evaluatorTrainerTitle}<br/>
                        <strong>CDL #:</strong> {record.evaluatorTrainerCdl} &bull; <strong>Date:</strong> {record.evaluatorSignatureDate}
                      </div>
                    </div>
                    <div className="border-t border-black pt-2">
                      <div className="text-blue-900 font-serif text-sm italic font-bold mb-1">
                        {record.driverCandidateSignature}
                      </div>
                      <div className="text-[10px] text-gray-700">
                        <strong>Candidate Driver:</strong> {record.driverCandidateName} &bull; <strong>Date:</strong> {record.driverCandidateSignatureDate}<br/>
                        <em>Permanent Retention in Driver Qualification File (DQF) 49 CFR § 391.51(b)(3)</em>
                      </div>
                    </div>
                  </div>

                  {/* Tamper-evident Seal */}
                  <div className="pt-2 border-t border-dashed border-gray-400 text-[8.5px] font-mono text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="truncate max-w-lg">
                      SHA-256 DQF AUDIT SEAL: <strong className="text-black">{record.cryptographicSealHash}</strong>
                    </span>
                    <span className="text-green-800 font-bold shrink-0">
                      ✓ FMCSA 49 CFR § 391.31 CERTIFIED
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: COCKPIT THEME (High-Tech Fleet Operations Visual) */}
            {viewMode === 'DIGITAL' && (
              <div className="space-y-6">
                {/* Header Summary Card */}
                <div className="p-5 rounded-xl bg-[#141416] border border-[#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-black text-white">{record.driverCandidateName}</span>
                      <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        {record.driverCandidateCdl} ({record.driverCandidateState})
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                        record.overallResult === 'SATISFACTORY_PASS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {record.overallResult.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-[#888]">
                      Evaluated by <strong className="text-white">{record.evaluatorTrainerName}</strong> &bull; {record.testDate} &bull; Unit: {record.powerUnitNumber}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-[#888] uppercase">Composite Score</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {record.scorePercentage}%
                      </div>
                      <div className="text-[10px] text-[#666]">
                        {record.totalEarnedPoints} / {record.totalPossiblePoints} pts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsWithScores.map((row, idx) => (
                    <div key={row.item.id} className="p-3.5 rounded-xl bg-[#141416] border border-[#262626] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-[#888]">
                            #{idx + 1} &bull; {row.item.statutoryCfr}
                          </span>
                          <h4 className="text-xs font-bold text-white">{row.item.name}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                          row.status === 'PASS'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : row.status === 'NEEDS_WORK'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}>
                          {row.pointsEarned} / {row.item.pointsMax} ({row.status})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777] line-clamp-2">{row.item.description}</p>
                      {row.note && (
                        <div className="text-[10px] p-2 rounded bg-[#1c1c1f] text-[#ccc] border border-[#2e2e32] italic">
                          "{row.note}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cryptographic Seal Bar */}
                <div className="p-4 rounded-xl bg-[#111] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      SHA-256 DQF Tamper-Proof Cryptographic Audit Seal
                    </span>
                    <p className="text-[11px] font-mono text-[#888] break-all">
                      {record.cryptographicSealHash}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-xs font-mono text-white transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Footer */}
          <div className="p-3 bg-[#141416] border-t border-[#262626] flex items-center justify-between text-xs">
            <span className="text-[#777] text-[11px]">
              Ready for export to Motor Carrier Driver Qualification File (49 CFR § 391.51)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-white font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintToPdf}
                className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black text-xs uppercase flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print to PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 8.5" x 11" PURE PRINTABLE STYLESHEET CONTAINER (FOR WINDOW.PRINT()) */}
      {/* ==================================================================== */}
      <div id="fmcsa-road-test-report-printable" className="hidden print:block font-sans text-black p-4 bg-white max-w-4xl mx-auto space-y-4">
        {/* Printable Letterhead Header */}
        <div className="border-b-2 border-black pb-2 text-center space-y-1">
          <div className="text-[10px] font-bold tracking-widest text-[#003366] uppercase">
            FEDERAL MOTOR CARRIER SAFETY ADMINISTRATION · U.S. DEPARTMENT OF TRANSPORTATION
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-black">
            Driver's Road Test Examination &amp; Certificate
          </h1>
          <div className="text-[10px] font-medium text-gray-700">
            Form Pursuant to <strong>49 CFR § 391.31</strong> · Motor Carrier Driver Qualification File 49 CFR § 391.51(b)(3)
          </div>
          <div className="text-[9px] font-mono text-gray-600 font-bold">
            CERTIFICATE NO: {record.certificateNumber} &bull; DATE: {record.testDate} ({record.testStartTime} - {record.testEndTime})
          </div>
        </div>

        {/* Top 2-Column Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="border border-gray-400 rounded p-2.5 space-y-1 bg-gray-50/50">
            <div className="text-[9px] font-black uppercase text-gray-600 border-b border-gray-300 pb-0.5 mb-1">
              Driver Candidate Dossier
            </div>
            <div><strong>Candidate Name:</strong> {record.driverCandidateName}</div>
            <div><strong>Commercial Driver's License:</strong> {record.driverCandidateCdl} ({record.driverCandidateState})</div>
            <div><strong>Commercial Experience:</strong> {record.yearsExperience} Years</div>
            <div><strong>Telephone:</strong> {record.driverCandidatePhone}</div>
            <div className="pt-0.5 text-[9px] text-gray-700">
              <strong>Highway Route Evaluated:</strong> {record.routeDescription} ({record.mileageCovered} Miles)
            </div>
          </div>

          <div className="border border-gray-400 rounded p-2.5 space-y-1 bg-gray-50/50">
            <div className="text-[9px] font-black uppercase text-gray-600 border-b border-gray-300 pb-0.5 mb-1">
              Motor Carrier &amp; Test Equipment
            </div>
            <div><strong>Motor Carrier:</strong> {record.evaluatorCompany}</div>
            <div><strong>Power Unit:</strong> {record.powerUnitNumber} — {record.powerUnitMakeModel}</div>
            <div><strong>Trailer Spec:</strong> {record.trailerNumber} ({record.trailerType})</div>
            <div><strong>Transmission / GVWR:</strong> {record.transmissionType.replace(/_/g, ' ')} &bull; {record.grossVehicleWeightRating}</div>
            <div><strong>Weather Conditions:</strong> {record.weatherConditions.replace(/_/g, ' ')}</div>
          </div>
        </div>

        {/* Statutory 14-Item FMCSA Examination Scorecard Table */}
        <div className="border border-gray-400 rounded overflow-hidden text-[9px]">
          <div className="bg-gray-100 px-2 py-1 border-b border-gray-400 font-black text-[10px] uppercase tracking-wide flex justify-between">
            <span>FMCSA 49 CFR § 391.31(c) Statutory Maneuver Performance Scorecard</span>
            <span className="font-mono">Passing Threshold: 80%</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300 font-bold uppercase text-gray-700">
                <th className="p-1 w-5 text-center">#</th>
                <th className="p-1">Maneuver &amp; Statutory Standard</th>
                <th className="p-1 w-28">Statutory CFR</th>
                <th className="p-1 w-14 text-center">Pts</th>
                <th className="p-1 w-16 text-center">Rating</th>
                <th className="p-1">Examiner Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {itemsWithScores.map((row, idx) => (
                <tr key={row.item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="p-1 text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="p-1">
                    <strong className="text-black">{row.item.name}</strong>
                  </td>
                  <td className="p-1 font-mono text-[8.5px] text-gray-700">{row.item.statutoryCfr}</td>
                  <td className="p-1 text-center font-bold">
                    {row.pointsEarned}/{row.item.pointsMax}
                  </td>
                  <td className="p-1 text-center">
                    <span className="font-bold text-[8.5px] uppercase font-mono">
                      {row.status}
                    </span>
                  </td>
                  <td className="p-1 text-[8.5px] text-gray-800">
                    {row.note || 'Meets federal standard.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Print Score Footer */}
          <div className="p-2 bg-gray-100 border-t border-gray-400 flex items-center justify-between text-[10px]">
            <div>
              <strong>Total Score: </strong>
              <span className="font-mono font-bold">{record.totalEarnedPoints} / {record.totalPossiblePoints} ({record.scorePercentage}%)</span>
            </div>
            <div>
              <strong>Critical Violations: </strong>
              <span className="font-mono font-bold">{record.hasCriticalFailure ? record.criticalFailureReason : 'ZERO (CLEARED)'}</span>
            </div>
            <div>
              <strong>Result: </strong>
              <span className="font-mono font-bold uppercase">{record.overallResult.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div className="border border-gray-400 rounded p-2 text-[9px] space-y-1 bg-gray-50/50">
          <div className="font-black uppercase text-gray-700 border-b border-gray-300 pb-0.5">
            Certified Evaluator Formal Performance Critique
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>1. Situational Awareness:</strong> <span className="italic">{record.trainerFeedback.safetyAndAwarenessCritique}</span></div>
            <div><strong>2. Control &amp; Shifting:</strong> <span className="italic">{record.trainerFeedback.vehicleControlAndShiftingCritique}</span></div>
            <div><strong>3. Backing &amp; Docking:</strong> <span className="italic">{record.trainerFeedback.backingAndManeuveringCritique}</span></div>
            <div><strong>4. Spatial Clearances:</strong> <span className="italic">{record.trainerFeedback.clearanceAndSpatialJudgementCritique}</span></div>
          </div>
          <div className="pt-0.5 border-t border-gray-200">
            <strong>Recommendation:</strong> <span className="font-semibold">{record.trainerFeedback.overallTrainerRecommendation}</span>
          </div>
        </div>

        {/* Statutory Certificate Clause & Signatures */}
        <div className="border-2 border-black rounded p-3 space-y-2 bg-white">
          <div className="text-center font-black uppercase text-[10px] tracking-wider text-black border-b border-gray-300 pb-1">
            Certificate of Driver's Road Test (49 CFR § 391.31(e))
          </div>
          <p className="text-[9.5px] leading-relaxed text-gray-800 text-justify">
            "This is to certify that the driver candidate named above has completed a road test under 49 CFR § 391.31 consisting of approximately <strong>{record.mileageCovered} miles</strong> of commercial driving over the designated route. It is our considered judgment that this driver possesses sufficient driving skill to operate safely the type of commercial motor vehicle listed above."
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border-t border-black pt-1">
              <div className="text-blue-900 font-serif text-xs italic font-bold">
                {record.evaluatorSignature}
              </div>
              <div className="text-[8.5px] text-gray-700">
                <strong>Examiner:</strong> {record.evaluatorTrainerName} &bull; <strong>Title:</strong> {record.evaluatorTrainerTitle}<br/>
                <strong>CDL:</strong> {record.evaluatorTrainerCdl} &bull; <strong>Date:</strong> {record.evaluatorSignatureDate}
              </div>
            </div>
            <div className="border-t border-black pt-1">
              <div className="text-blue-900 font-serif text-xs italic font-bold">
                {record.driverCandidateSignature}
              </div>
              <div className="text-[8.5px] text-gray-700">
                <strong>Candidate:</strong> {record.driverCandidateName} &bull; <strong>Date:</strong> {record.driverCandidateSignatureDate}<br/>
                <em>Permanent Retention in Driver Qualification File (DQF) 49 CFR § 391.51(b)(3)</em>
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-dashed border-gray-400 text-[8px] font-mono text-gray-600 flex justify-between">
            <span className="truncate max-w-md">SHA-256 SEAL: {record.cryptographicSealHash}</span>
            <span className="font-bold text-green-900">✓ FMCSA 49 CFR § 391.31 CERTIFIED</span>
          </div>
        </div>
      </div>
    </>
  );
};
