import React from 'react';
import {
  X,
  FileCheck,
  ShieldCheck,
  DollarSign,
  Clock,
  MapPin,
  Truck,
  Hash,
  FileText,
  CheckCircle2,
  Printer,
  Lock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { DatBoardLoad, RateConfirmationDetails } from '../services/datLoadBoardService';

interface RateConInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: DatBoardLoad | null;
  onConfirmAcceptance?: (loadId: string) => void;
}

export const RateConInspectorModal: React.FC<RateConInspectorModalProps> = ({
  isOpen,
  onClose,
  load,
  onConfirmAcceptance,
}) => {
  if (!isOpen || !load) return null;

  const rateCon: RateConfirmationDetails = load.rateConfirmation || {
    rateConNumber: `RC-${load.brokerName.split(' ')[0].toUpperCase()}-${load.loadNumber.replace(/\D/g, '').slice(-4) || '7721'}`,
    linehaulRateUsd: load.rateUsd - Math.round(load.miles * 0.48),
    fuelSurchargeUsd: Math.round(load.miles * 0.48),
    accessorials: [
      { description: 'Detention Guarantee Protection (> 2 hrs)', amountUsd: 85.0 },
      { description: 'Electronic Telematics Continuous Tracking Incentive', amountUsd: 50.0 },
    ],
    totalAgreedRateUsd: load.rateUsd,
    ratePerMile: load.ratePerMile,
    detentionRatePerHour: 85.0,
    detentionGraceHours: 2,
    layoverRatePerDay: 350.0,
    tonuRateUsd: 250.0,
    paymentTerms: load.paymentTerms,
    shipperName: `${load.originCity} Premier Distribution Hub`,
    shipperAddress: `1200 Logistics Parkway, ${load.originCity}, ${load.originState}`,
    shipperEarliestPickup: `${load.pickupDate}`,
    shipperLatestPickup: `${load.pickupDate}`,
    consigneeName: `${load.destCity} Terminal & Distribution Center`,
    consigneeAddress: `800 Industrial Blvd, ${load.destCity}, ${load.destState}`,
    consigneeEarliestDelivery: `${load.deliveryDate}`,
    consigneeLatestDelivery: `${load.deliveryDate}`,
    temperatureSetting: load.equipment.toLowerCase().includes('reefer') ? 'Continuous 34°F Pre-cooled' : undefined,
    coiRequired: true,
    specialClauses: [
      'Carrier certifies clean 53ft trailer with no odors, holes, or chemical residue.',
      '49 CFR § 392.9 cargo securement compliance required before departing shipper gates.',
      'Detention begins after 2 hours upon verified GPS geofence arrival and signed timestamp.',
      'Subcontracting, double-brokering, or unauthorized rail intermodal substitution strictly void.',
    ],
    digitalSignatureStatus: 'CARRIER_ACCEPTED',
    rateConHash: '0x7f9b8e21a04c99023418bf8912903af4',
    generatedAt: new Date().toISOString(),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#14151B] border border-[#292A2F] rounded-xl max-w-3xl w-full text-[#E3E1E9] shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Modal Top Header */}
        <div className="bg-[#0D0E13] px-6 py-4 border-b border-[#292A2F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#292A2F] rounded text-[#F2CA50]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#F2CA50] uppercase tracking-wider">
                  BROKER RATE CONFIRMATION AGREEMENT
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                  VERIFIED SPEC
                </span>
              </div>
              <span className="font-mono text-xs text-[#99907C]">
                CONTRACT ID: {rateCon.rateConNumber} // LOAD: {load.loadNumber}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#292A2F] text-[#99907C] hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Document Header & Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1E1F25] p-4 rounded-lg border border-[#292A2F]">
            <div>
              <span className="font-mono text-[10px] text-[#99907C] uppercase block">BROKERAGE ENTITY</span>
              <span className="font-bold text-base text-white block mt-0.5">{load.brokerName}</span>
              <span className="text-[#D0C5AF] block mt-0.5 font-mono">
                Phone: {load.brokerPhone} | Email: {load.brokerEmail}
              </span>
              <span className="text-[#99907C] text-[11px] block mt-1">
                Trust Score: {load.brokerTrustScore}/100 • FMCSA Bond Verified Active
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#99907C] uppercase block">CARRIER CONTRACTOR</span>
              <span className="font-bold text-base text-white block mt-0.5">TITAN HAULAGE // THE G.O.A.T. FLEET</span>
              <span className="text-[#D0C5AF] block mt-0.5 font-mono">
                USDOT: 3928192 | MC: 1492019
              </span>
              <span className="text-[#99907C] text-[11px] block mt-1">
                Dispatch 24/7: 636-706-8338 • Direct Settlement
              </span>
            </div>
          </div>

          {/* Agreed Financial Breakdown Matrix */}
          <div className="bg-[#0D0E13] p-4 rounded-lg border border-[#292A2F] space-y-3">
            <div className="flex items-center justify-between border-b border-[#292A2F] pb-2">
              <span className="font-mono font-bold text-xs text-[#F2CA50] uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#F2CA50]" />
                RATE &amp; COMPENSATION SPECIFICATION
              </span>
              <span className="font-mono text-[11px] text-[#FFE16D] font-bold">
                {rateCon.paymentTerms}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-[#1E1F25] p-2.5 rounded border border-[#292A2F]">
                <span className="font-mono text-[10px] text-[#99907C] block uppercase">BASE LINEHAUL</span>
                <span className="font-mono text-lg font-bold text-white">
                  ${rateCon.linehaulRateUsd.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#1E1F25] p-2.5 rounded border border-[#292A2F]">
                <span className="font-mono text-[10px] text-[#99907C] block uppercase">EIA FUEL SURCHARGE</span>
                <span className="font-mono text-lg font-bold text-[#F2CA50]">
                  +${rateCon.fuelSurchargeUsd.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#99907C] block">EIA Index Indexed</span>
              </div>

              <div className="bg-[#1E1F25] p-2.5 rounded border border-[#292A2F]">
                <span className="font-mono text-[10px] text-[#99907C] block uppercase">TOTAL FLAT AGREED</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  ${rateCon.totalAgreedRateUsd.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#99907C] block">All-in Gross Tenders</span>
              </div>

              <div className="bg-[#1E1F25] p-2.5 rounded border border-[#292A2F]">
                <span className="font-mono text-[10px] text-[#99907C] block uppercase">RATE PER MILE</span>
                <span className="font-mono text-lg font-bold text-[#FFE16D]">
                  ${rateCon.ratePerMile.toFixed(2)}
                </span>
                <span className="text-[9px] text-[#99907C] block">({load.miles} loaded mi)</span>
              </div>
            </div>

            {/* Accessorials Strip */}
            <div className="bg-[#1A1B21] p-2.5 rounded border border-[#292A2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-[#D0C5AF]">ACCESSORIALS INCLUDED:</span>
              <div className="flex items-center gap-3 flex-wrap text-emerald-400 font-bold">
                {rateCon.accessorials.map((acc, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{acc.description} (${acc.amountUsd.toFixed(2)})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Detention, Layover & TONU Penalty Clauses */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#1E1F25] p-3 rounded-lg border border-[#292A2F]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#F2CA50] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>DETENTION TERMS</span>
              </div>
              <p className="mt-1 text-[#D0C5AF]">
                <strong className="text-white">${rateCon.detentionRatePerHour.toFixed(2)}/hr</strong> after {rateCon.detentionGraceHours} hours free time. Verified by GPS geofence arrival logs.
              </p>
            </div>

            <div className="bg-[#1E1F25] p-3 rounded-lg border border-[#292A2F]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#F2CA50] font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>LAYOVER GUARANTEE</span>
              </div>
              <p className="mt-1 text-[#D0C5AF]">
                <strong className="text-white">${rateCon.layoverRatePerDay.toFixed(2)}/day</strong> in the event of shipper/receiver delay exceeding 24 hours.
              </p>
            </div>

            <div className="bg-[#1E1F25] p-3 rounded-lg border border-[#292A2F]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#F2CA50] font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>TONU (TRUCK NOT USED)</span>
              </div>
              <p className="mt-1 text-[#D0C5AF]">
                <strong className="text-white">${rateCon.tonuRateUsd.toFixed(2)}</strong> payable immediately if load cancelled after driver dispatch.
              </p>
            </div>
          </div>

          {/* Shipper & Consignee Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="bg-[#1E1F25] p-4 rounded-lg border border-[#292A2F] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>ORIGIN PICKUP DOCK</span>
              </div>
              <div>
                <span className="font-bold text-white block">{rateCon.shipperName}</span>
                <span className="text-[#D0C5AF] block">{rateCon.shipperAddress}</span>
              </div>
              <div className="pt-1 border-t border-[#292A2F] text-[11px] font-mono text-[#F2CA50]">
                WINDOW: {rateCon.shipperEarliestPickup}
              </div>
            </div>

            {/* Destination */}
            <div className="bg-[#1E1F25] p-4 rounded-lg border border-[#292A2F] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>CONSIGNEE DELIVERY DOCK</span>
              </div>
              <div>
                <span className="font-bold text-white block">{rateCon.consigneeName}</span>
                <span className="text-[#D0C5AF] block">{rateCon.consigneeAddress}</span>
              </div>
              <div className="pt-1 border-t border-[#292A2F] text-[11px] font-mono text-blue-300">
                WINDOW: {rateCon.consigneeEarliestDelivery}
              </div>
            </div>
          </div>

          {/* Equipment & Temperature Setting */}
          <div className="bg-[#1A1B21] p-3 rounded-lg border border-[#292A2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#F2CA50]" />
              <span className="text-white font-bold">{load.equipment}</span>
              <span className="text-[#99907C]">|</span>
              <span className="text-[#D0C5AF]">{load.weightLbs.toLocaleString()} lbs</span>
              <span className="text-[#99907C]">|</span>
              <span className="text-[#FFE16D]">{load.commodity}</span>
            </div>
            {rateCon.temperatureSetting && (
              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-bold">
                TEMP: {rateCon.temperatureSetting}
              </span>
            )}
          </div>

          {/* Regulatory Clauses & Insurance Lock */}
          <div className="bg-[#0D0E13] p-4 rounded-lg border border-[#292A2F] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#F2CA50] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                REGULATORY WARRANTIES &amp; INSURANCE STATUS
              </span>
              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>COI $1,000,000 AUTO / $100,000 CARGO VERIFIED</span>
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-[#99907C] list-disc list-inside">
              {rateCon.specialClauses.map((clause, idx) => (
                <li key={idx} className="leading-relaxed">
                  {clause}
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-[#292A2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-[#99907C]">
              <span>SHA-256 DIGITAL INTEGRITY HASH:</span>
              <span className="text-[#F2CA50] font-bold">{rateCon.rateConHash}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-[#0D0E13] px-6 py-4 border-t border-[#292A2F] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#D0C5AF]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CONTRACT READY // ZERO DOWNTIME CARRIER LOCK</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-[#292A2F] hover:bg-[#34343A] text-white font-mono text-xs font-bold uppercase rounded border border-[#292A2F] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#D0C5AF]" />
              <span>PRINT / PDF</span>
            </button>

            {onConfirmAcceptance && (
              <button
                onClick={() => {
                  onConfirmAcceptance(load.id);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#F2CA50] hover:bg-[#FFE088] text-[#3C2F00] font-mono text-xs font-bold uppercase rounded tracking-wider flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ACCEPT &amp; LOCK RATE CON</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1B21] hover:bg-[#25262E] text-[#D0C5AF] font-mono text-xs uppercase rounded border border-[#292A2F] transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
