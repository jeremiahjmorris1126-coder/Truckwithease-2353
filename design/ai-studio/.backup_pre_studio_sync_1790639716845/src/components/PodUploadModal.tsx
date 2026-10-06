import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  DollarSign,
  MapPin,
  Calendar,
  ShieldCheck,
  Cpu,
  X,
  FileCheck,
  Clock,
  Truck,
  CreditCard,
  Send,
  Building,
} from 'lucide-react';
import {
  DatBoardLoad,
  FactoringPacket,
  generateFactoringPacket,
} from '../services/datLoadBoardService';

interface PodUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: DatBoardLoad | null;
  onPodSubmitted: (loadId: string, packet: FactoringPacket, fileName: string) => void;
}

export const PodUploadModal: React.FC<PodUploadModalProps> = ({
  isOpen,
  onClose,
  load,
  onPodSubmitted,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiverName, setReceiverName] = useState('Michael Davies (Dock Foreman)');
  const [deliveryNotes, setDeliveryNotes] = useState('Signed clean with zero OS&D (Over, Short, Damaged). All seals intact.');
  const [factoringPartner, setFactoringPartner] = useState<'TriumphPay' | 'RTS Financial' | 'OTR Solutions' | 'Apex Capital'>('TriumphPay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedPacket, setGeneratedPacket] = useState<FactoringPacket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !load) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUseMockSignedBol = () => {
    const mockFile = new File(['Proof of Delivery Stamped'], `signed_bol_${load.loadNumber}.pdf`, {
      type: 'application/pdf',
    });
    setSelectedFile(mockFile);
  };

  const handleSubmitPodAndFactor = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const packet = generateFactoringPacket(load, factoringPartner);
      setGeneratedPacket(packet);
      setIsProcessing(false);
      setIsCompleted(true);
      onPodSubmitted(load.id, packet, selectedFile?.name || `signed_pod_${load.loadNumber}.pdf`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="bg-[#121318] border border-[#292A2F] rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#292A2F] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Proof of Delivery (POD) &amp; Factoring Gateway
                </h2>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-800">
                  INSTANT SETTLEMENT
                </span>
              </div>
              <p className="text-xs text-[#99907C] mt-0.5">
                Upload consignee-stamped Bill of Lading or Delivery Receipt to unlock instant 2-hr QuickPay / Factoring advance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white hover:bg-[#1E1F25] rounded-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Load Target Summary */}
        <div className="bg-[#1A1B21] border border-[#292A2F] rounded-lg p-3.5 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#F2CA50] text-[#3C2F00] font-bold rounded">
                {load.loadNumber}
              </span>
              <span className="font-bold text-white text-sm">
                {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#99907C] block text-[10px]">GROSS LINEHAUL:</span>
              <span className="text-[#F2CA50] font-bold text-base">${load.rateUsd.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[#D0C5AF] text-[11px]">
            Broker: <strong className="text-white">{load.brokerName}</strong> • Equipment: {load.equipment} • Distance: {load.miles} mi
          </div>
        </div>

        {!isCompleted ? (
          <>
            {/* File Upload Zone */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-[#D0C5AF] uppercase font-bold">
                1. Upload Consignee Stamped Document (BOL / Delivery Receipt):
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#292A2F] hover:border-[#F2CA50] rounded-xl p-5 text-center cursor-pointer bg-[#16171D] transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <Upload className="w-6 h-6 text-[#F2CA50]" />
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click to Upload Signed Delivery Document (PDF / Photo)'}
                  </span>
                  <span className="text-[11px] text-[#99907C]">
                    Driver smartphone photo, digital e-BOL, or gate physical stamp
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUseMockSignedBol}
                  className="text-[11px] font-mono text-[#F2CA50] hover:underline"
                >
                  [ Auto-Attach Test Signed POD Document ]
                </button>
              </div>
            </div>

            {/* Consignee Sign-Off & Verification Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#99907C] block uppercase mb-1">
                  Receiver Signature Name:
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-[#1A1B21] border border-[#292A2F] rounded p-2 text-white outline-none focus:border-[#F2CA50]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#99907C] block uppercase mb-1">
                  Factoring / QuickPay Partner:
                </label>
                <select
                  value={factoringPartner}
                  onChange={(e: any) => setFactoringPartner(e.target.value)}
                  className="w-full bg-[#1A1B21] border border-[#292A2F] rounded p-2 text-[#F2CA50] font-bold outline-none focus:border-[#F2CA50]"
                >
                  <option value="TriumphPay">TriumphPay (2-Hour Direct Wire)</option>
                  <option value="RTS Financial">RTS Financial (Immediate Fuel Card Fund)</option>
                  <option value="OTR Solutions">OTR Solutions (True Non-Recourse Factoring)</option>
                  <option value="Apex Capital">Apex Capital (Same Day ACH)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#99907C] block uppercase mb-1">
                  Delivery Receipt Inspection Notes:
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-[#1A1B21] border border-[#292A2F] rounded p-2 text-white outline-none focus:border-[#F2CA50]"
                />
              </div>
            </div>

            {/* Instant Factoring Calculation Strip */}
            <div className="bg-[#16171D] border border-[#292A2F] p-3 rounded-lg font-mono text-xs space-y-1">
              <div className="flex justify-between text-[#99907C]">
                <span>Gross Linehaul Invoice:</span>
                <span className="text-white">${load.rateUsd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#99907C]">
                <span>Advance Fee (2.0% QuickPay):</span>
                <span className="text-amber-400">-${(load.rateUsd * 0.02).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#292A2F] pt-1 text-sm font-bold">
                <span className="text-[#F2CA50]">Net Payout to Carrier Account:</span>
                <span className="text-emerald-400 font-black">
                  ${(load.rateUsd * 0.98).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-[#292A2F] pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#1E1F25] hover:bg-[#292A2F] text-[#D0C5AF] hover:text-white font-mono text-xs font-bold uppercase rounded transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitPodAndFactor}
                disabled={!selectedFile || isProcessing}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-black uppercase tracking-wider rounded transition-all shadow flex items-center gap-2 disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>ENCRYPTING &amp; SUBMITTING FACTORING PACKET...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT POD &amp; REQUEST IMMEDIATE FACTORING</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Submission Completed Screen */
          <div className="bg-[#16171D] border border-emerald-500/60 rounded-xl p-5 text-center space-y-4 font-mono text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                PROOF OF DELIVERY CERTIFIED &amp; FACTORING FUNDED
              </h3>
              <p className="text-[#D0C5AF] text-xs mt-1">
                Packet transmitted to {factoringPartner}. Rate con and stamped POD cryptographically locked.
              </p>
            </div>

            {generatedPacket && (
              <div className="bg-[#121318] p-3 rounded-lg border border-[#292A2F] text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#99907C]">CONFIRMATION CODE:</span>
                  <span className="text-[#F2CA50] font-bold">{generatedPacket.confirmationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#99907C]">FUNDING DESTINATION:</span>
                  <span className="text-white">Titan Fleet Operating Account (Direct Wire)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#99907C]">NET DISBURSED:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${generatedPacket.netPayoutUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#F2CA50] hover:bg-[#FFE088] text-[#3C2F00] font-mono text-xs font-black uppercase rounded shadow transition-all"
            >
              CLOSE &amp; RETURN TO LOAD BOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
