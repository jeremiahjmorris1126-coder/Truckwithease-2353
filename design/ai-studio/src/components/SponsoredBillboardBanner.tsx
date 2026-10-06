import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  Settings,
  Fuel,
  CreditCard,
  Wrench,
  Coffee,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  AdCampaign,
  AdCategory,
  getSavedAdCampaigns,
  recordAdImpression,
  recordAdClick,
} from '../services/adCampaignService';

interface SponsoredBillboardBannerProps {
  onOpenAdManager?: () => void;
  isAdmin?: boolean;
  onOpenInquiryModal?: (sponsorName: string) => void;
  className?: string;
}

export const SponsoredBillboardBanner: React.FC<SponsoredBillboardBannerProps> = ({
  onOpenAdManager,
  isAdmin = false,
  onOpenInquiryModal,
  className = '',
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const list = getSavedAdCampaigns().filter((c) => c.status === 'ACTIVE');
    setCampaigns(list);
  }, []);

  const activeFiltered = selectedCategory === 'ALL'
    ? campaigns
    : campaigns.filter((c) => c.category === selectedCategory);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (activeFiltered.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeFiltered.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeFiltered.length]);

  const currentAd: AdCampaign | undefined = activeFiltered[currentIndex % (activeFiltered.length || 1)];

  // Record impression whenever currentAd changes
  useEffect(() => {
    if (currentAd) {
      recordAdImpression(currentAd.id);
    }
  }, [currentAd?.id]);

  const handleNext = () => {
    if (activeFiltered.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeFiltered.length);
    }
  };

  const handlePrev = () => {
    if (activeFiltered.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeFiltered.length) % activeFiltered.length);
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleAction = (ad: AdCampaign) => {
    recordAdClick(ad.id);
    if (ad.actionType === 'MODAL_INQUIRY' && onOpenInquiryModal) {
      onOpenInquiryModal(ad.sponsorName);
    } else if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!currentAd) return null;

  const getCategoryIcon = (cat: AdCategory) => {
    switch (cat) {
      case 'FUEL_DISCOUNT': return <Fuel className="w-3.5 h-3.5 text-[#FFD700]" />;
      case 'FACTORING_FINANCE': return <CreditCard className="w-3.5 h-3.5 text-[#00FF66]" />;
      case 'TIRE_MAINTENANCE': return <Wrench className="w-3.5 h-3.5 text-[#FF9900]" />;
      case 'TRUCK_STOP_AMENITY': return <Coffee className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'BROKER_FREIGHT': return <Truck className="w-3.5 h-3.5 text-[#C084FC]" />;
      default: return <Tag className="w-3.5 h-3.5 text-[#A0AEC0]" />;
    }
  };

  return (
    <div className={`relative w-full rounded-2xl bg-[#090C12] border border-[#222B3D] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.8)] ${className}`}>
      {/* Top Banner Control Strip */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0E131C] border-b border-[#1A2232] gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFD700] text-[10px] font-mono font-bold tracking-wider uppercase">
            <Megaphone className="w-3 h-3" />
            <span>FLEET PARTNER SPOTLIGHT</span>
          </div>
          <span className="text-[11px] font-mono text-[#7C8799] hidden sm:inline">
            Direct carrier rebates &amp; verified commercial perks
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
          {['ALL', 'FUEL_DISCOUNT', 'FACTORING_FINANCE', 'TIRE_MAINTENANCE', 'TRUCK_STOP_AMENITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#FFD700] text-black font-bold'
                  : 'bg-[#141A26] text-[#7C8799] hover:text-[#F0F2F5]'
              }`}
            >
              {cat === 'ALL' ? 'ALL ADS' : cat.split('_')[0]}
            </button>
          ))}
          {isAdmin && onOpenAdManager && (
            <button
              onClick={onOpenAdManager}
              className="ml-2 px-2 py-1 rounded bg-[#1B2332] text-[#FFD700] hover:bg-[#253044] border border-[#FFD700]/30 flex items-center gap-1"
              title="Open Ad Campaign Manager (Admin)"
            >
              <Settings className="w-3 h-3" />
              <span>MANAGE</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Banner Body */}
      <div className="relative p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-[#0A0D15] via-[#0E1420] to-[#0A0D15]">
        {/* Left Sponsor Badge & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#141A26] border border-[#2A3448] flex items-center justify-center shrink-0 shadow-lg text-[#FFD700] p-2">
            {getCategoryIcon(currentAd.category)}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-[#F0F2F5] text-sm sm:text-base tracking-wide">
                {currentAd.sponsorName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/25">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED PARTNER
              </span>
              {currentAd.discountBadge && (
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.35)]">
                  {currentAd.discountBadge}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-snug">
              {currentAd.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#A0AEC0] line-clamp-2 max-w-3xl">
              {currentAd.description}
            </p>

            {currentAd.voucherCode && (
              <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#7C8799]">
                <span>PROMO CODE:</span>
                <button
                  onClick={() => handleCopyVoucher(currentAd.voucherCode!)}
                  className="px-2.5 py-1 rounded bg-[#161D2B] border border-[#FFD700]/40 text-[#FFD700] font-bold flex items-center gap-1.5 hover:bg-[#1E2638] transition-colors"
                  title="Click to copy voucher code"
                >
                  <code>{currentAd.voucherCode}</code>
                  {copiedCode === currentAd.voucherCode ? (
                    <Check className="w-3 h-3 text-[#00FF66]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                {copiedCode === currentAd.voucherCode && (
                  <span className="text-[11px] text-[#00FF66]">Copied to clipboard!</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right CTA & Slider Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleAction(currentAd)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-mono font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{currentAd.callToActionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Slide Navigation Dots & Arrows */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full pt-1">
            <div className="flex items-center gap-1">
              {activeFiltered.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex % activeFiltered.length
                      ? 'w-6 bg-[#FFD700]'
                      : 'w-1.5 bg-[#252D3D] hover:bg-[#3E495F]'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] hover:text-[#F0F2F5] transition-colors"
                aria-label="Previous Ad"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] hover:text-[#F0F2F5] transition-colors"
                aria-label="Next Ad"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
