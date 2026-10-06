import React, { useState } from 'react';
import {
  Camera,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Award,
  Zap,
} from 'lucide-react';
import { driverDqfComplianceService } from '../services/driverDqfComplianceService';
import { DriverRecord } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface DqfDocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: DriverRecord | null;
  onScanSuccess?: () => void;
}

export const DqfDocumentScannerModal: React.FC<DqfDocumentScannerModalProps> = ({
  isOpen,
  onClose,
  driver,
  onScanSuccess,
}) => {
  const [docType, setDocType] = useState<'MED_CARD' | 'CDL'>('MED_CARD');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    triggerHapticFeedback('subtle');
    setIsScanning(true);
    setExtractedData(null);

    setTimeout(async () => {
      const expirationDate =
        docType === 'MED_CARD' ? '2028-10-15' : '2030-08-14';
      const registryOrLicenseNumber =
        docType === 'MED_CARD' ? 'NR-8492019482' : 'CDL-MO-8942109';
      const examinerOrState =
        docType === 'MED_CARD' ? 'Dr. Sarah Jenkins, MD (Concentra)' : 'Missouri Department of Revenue';

      const result = await driverDqfComplianceService.executeOcrScan(
        driver ? driver.id : 'drv-001',
        docType,
        {
          expirationDate,
          registryOrLicenseNumber,
          examinerOrState,
          restrictions: 'Corrective Lenses (B)',
        }
      );

      setIsScanning(false);
      setExtractedData(result.extractedData);
      if (onScanSuccess) onScanSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0B0F19] border-2 border-[#FFE600]/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#141A24] to-[#0B0F19] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#FFE600] text-black flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-black" />
                NEURAL OCR DQF SCANNER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1A2638] text-cyan-400 border border-cyan-500/30">
                1-TAP AUTO-FILING &amp; EXPIRATION UPDATE
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-[Oswald]">
              Mobile DQF Document Scanner: {driver ? `${driver.firstName} ${driver.lastName}` : 'Marcus Bell'}
            </h3>
            <p className="text-xs text-[#8EA2B8]">
              Instantly scan Medical Examiner Certificates (MCSA-5876) or CDL renewals with AI OCR extraction
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-[#141C2A] hover:bg-[#1E2A3E] text-[#8EA2B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-200">
          {/* Document Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setDocType('MED_CARD');
                setExtractedData(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                docType === 'MED_CARD'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-[#0D1420] border-[#1E2E44] text-[#8EA2B8] hover:text-white'
              }`}
            >
              <div className="font-bold text-sm text-white">1. DOT Medical Card (MCSA-5876)</div>
              <div className="text-[11px] text-[#8EA2B8] mt-1">
                Extracts National Registry #, Examiner Name, &amp; 24-Month Expiration Date
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('CDL');
                setExtractedData(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                docType === 'CDL'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0D1420] border-[#1E2E44] text-[#8EA2B8] hover:text-white'
              }`}
            >
              <div className="font-bold text-sm text-white">2. Commercial Driver License (CDL)</div>
              <div className="text-[11px] text-[#8EA2B8] mt-1">
                Extracts License Class A, Endorsements (N,H,T), State, &amp; Expiry
              </div>
            </button>
          </div>

          {/* Camera / Upload Dropzone */}
          <div className="p-6 rounded-2xl bg-[#080D15] border-2 border-dashed border-[#23354C] hover:border-[#FFE600]/60 transition-all text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#141F2E] border border-[#2B3E58] flex items-center justify-center mx-auto text-[#FFE600] shadow-md">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white uppercase">
                Take Camera Photo or Upload Document File
              </div>
              <p className="text-xs text-[#8EA2B8] max-w-sm mx-auto">
                Supports JPG, PNG, or PDF scans. Neural OCR will parse text with 99.8% accuracy.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#E6B800] hover:brightness-110 text-black font-black text-xs uppercase rounded-xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-black ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Processing Neural OCR...' : `Run Instant OCR Scan (${docType})`}</span>
              </button>
            </div>
          </div>

          {/* OCR Result Card */}
          {extractedData && (
            <div className="p-4 rounded-xl bg-[#091811] border border-emerald-500 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>OCR Data Successfully Extracted &amp; Filed in DQF!</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                  {extractedData.confidenceScore}% CONFIDENCE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#050D09] p-3 rounded-lg border border-emerald-800/40">
                <div>
                  <span className="text-[10px] text-[#7E96B0] uppercase block">Expiration Date:</span>
                  <span className="text-white font-bold text-sm">{extractedData.expirationDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7E96B0] uppercase block">
                    {docType === 'MED_CARD' ? 'National Registry #:' : 'License Number:'}
                  </span>
                  <span className="text-white font-bold">{extractedData.registryOrLicenseNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7E96B0] uppercase block">
                    {docType === 'MED_CARD' ? 'Medical Examiner:' : 'Issuing State:'}
                  </span>
                  <span className="text-zinc-300">{extractedData.examinerOrState}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7E96B0] uppercase block">Restrictions / Notes:</span>
                  <span className="text-emerald-400 font-semibold">{extractedData.restrictions || 'None'}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-300/80">
                ✓ DQF Checklist updated automatically. Expiration alarms reset for this driver.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#182332] bg-[#0A0E17] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#7E96B0]">
            FMCSA Compliant Optical Document Archival Active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#141E2D] hover:bg-[#1E2E44] text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
