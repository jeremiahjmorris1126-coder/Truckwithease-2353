import React, { useState, useEffect } from 'react';
import {
  X,
  Megaphone,
  Plus,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointerClick,
  Sparkles,
  ShieldAlert,
  Tag,
  Calendar,
  CheckCircle2,
  Fuel,
  CreditCard,
  Wrench,
  Coffee,
  Truck,
  Filter,
} from 'lucide-react';
import {
  AdCampaign,
  AdCategory,
  AdPlacement,
  TargetAudience,
  getSavedAdCampaigns,
  saveAdCampaigns,
  createAdCampaign,
  updateAdCampaign,
  deleteAdCampaign,
  calculateAdPerformanceMetrics,
} from '../services/adCampaignService';

interface AdCampaignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const AdCampaignManagerModal: React.FC<AdCampaignManagerModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'CREATE' | 'ANALYTICS'>('CAMPAIGNS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State
  const [sponsorName, setSponsorName] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [category, setCategory] = useState<AdCategory>('FUEL_DISCOUNT');
  const [placement, setPlacement] = useState<AdPlacement>('OVERVIEW_BILLBOARD');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [callToActionLabel, setCallToActionLabel] = useState('Claim Offer');
  const [targetUrl, setTargetUrl] = useState('https://truckwithease.com');
  const [voucherCode, setVoucherCode] = useState('');
  const [sponsorRate, setSponsorRate] = useState<number>(100);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCampaigns(getSavedAdCampaigns());
    }
  }, [isOpen]);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleStatus = (camp: AdCampaign) => {
    const nextStatus = camp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = updateAdCampaign(camp.id, { status: nextStatus });
    if (updated) {
      setCampaigns(getSavedAdCampaigns());
      showNotice(`Campaign "${camp.sponsorName}" marked ${nextStatus}.`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete campaign for ${name}?`)) {
      deleteAdCampaign(id);
      setCampaigns(getSavedAdCampaigns());
      showNotice(`Deleted campaign "${name}".`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim() || !title.trim()) {
      alert('Sponsor Name and Campaign Title are required.');
      return;
    }

    createAdCampaign({
      sponsorName: sponsorName.trim(),
      title: title.trim(),
      tagline: tagline.trim() || title.trim(),
      description: description.trim(),
      discountBadge: discountBadge.trim() || undefined,
      category,
      placement,
      targetAudience,
      callToActionLabel: callToActionLabel.trim() || 'Learn More',
      targetUrl: targetUrl.trim() || 'https://truckwithease.com',
      actionType: voucherCode.trim() ? 'VOUCHER_CLAIM' : 'LINK',
      voucherCode: voucherCode.trim() || undefined,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      priority: 8,
      sponsorRatePerDayUsd: Number(sponsorRate) || 50,
    });

    setCampaigns(getSavedAdCampaigns());
    setActiveTab('CAMPAIGNS');
    showNotice(`Successfully published ad campaign for ${sponsorName}!`);

    // Reset Form
    setSponsorName('');
    setTitle('');
    setTagline('');
    setDescription('');
    setDiscountBadge('');
    setVoucherCode('');
  };

  if (!isOpen) return null;

  const metrics = calculateAdPerformanceMetrics(campaigns);
  const filteredCampaigns = categoryFilter === 'ALL'
    ? campaigns
    : campaigns.filter((c) => c.category === categoryFilter);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#090C10] border border-[#252D3D] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2638] bg-[#0E131C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#F0F2F5] tracking-wide">
                  Fleet Ad &amp; Sponsor Campaign Manager
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-[#7C8799] font-mono">
                Manage in-cab discount banners, sponsor billboards, and partner click analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] hover:text-[#F0F2F5] hover:bg-[#1E2638] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RBAC Gate Check */}
        {!isAdmin ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Access Restricted</h3>
            <p className="text-sm text-[#A0AEC0] max-w-md">
              Ad Campaign &amp; Sponsor Inventory Management is restricted to Administrator personnel. Fleet drivers cannot configure commercials.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#FFD700] font-mono text-xs hover:bg-[#1E2638]"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            {/* Notification Toast */}
            {notification && (
              <div className="bg-[#FFD700] text-black px-4 py-2 text-xs font-mono font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {notification}
                </span>
                <button onClick={() => setNotification(null)}>✕</button>
              </div>
            )}

            {/* Performance Metric Ribbons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-5 py-3 bg-[#0A0E15] border-b border-[#1A2230]">
              <div className="p-2.5 rounded-lg bg-[#101520] border border-[#1E2638]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7C8799] uppercase">
                  <span>Active Ads</span>
                  <Megaphone className="w-3 h-3 text-[#FFD700]" />
                </div>
                <div className="text-lg font-mono font-extrabold text-[#F0F2F5] mt-1">
                  {metrics.totalActiveCampaigns}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#101520] border border-[#1E2638]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7C8799] uppercase">
                  <span>Total Views</span>
                  <Eye className="w-3 h-3 text-[#38BDF8]" />
                </div>
                <div className="text-lg font-mono font-extrabold text-[#F0F2F5] mt-1">
                  {metrics.totalImpressions.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#101520] border border-[#1E2638]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7C8799] uppercase">
                  <span>CTA Clicks</span>
                  <MousePointerClick className="w-3 h-3 text-[#00FF66]" />
                </div>
                <div className="text-lg font-mono font-extrabold text-[#00FF66] mt-1">
                  {metrics.totalClicks.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#101520] border border-[#1E2638]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7C8799] uppercase">
                  <span>Average CTR</span>
                  <TrendingUp className="w-3 h-3 text-[#C084FC]" />
                </div>
                <div className="text-lg font-mono font-extrabold text-[#C084FC] mt-1">
                  {metrics.averageCtrPercent}%
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-[#101520] border border-[#FFD700]/30 shadow-[0_0_12px_rgba(255,215,0,0.06)]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#FFD700] uppercase">
                  <span>Sponsor Run</span>
                  <DollarSign className="w-3 h-3 text-[#FFD700]" />
                </div>
                <div className="text-lg font-mono font-extrabold text-[#FFD700] mt-1">
                  ${metrics.totalProjectedRevenueUsd.toLocaleString()}<span className="text-[10px] text-[#A0AEC0]">/mo</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-[#1A2230] bg-[#0E131C]">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('CAMPAIGNS')}
                  className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
                    activeTab === 'CAMPAIGNS'
                      ? 'border-[#FFD700] text-[#FFD700] bg-[#141A26]'
                      : 'border-transparent text-[#7C8799] hover:text-[#F0F2F5]'
                  }`}
                >
                  Active Inventory ({campaigns.length})
                </button>
                <button
                  onClick={() => setActiveTab('CREATE')}
                  className={`px-4 py-2 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    activeTab === 'CREATE'
                      ? 'border-[#FFD700] text-[#FFD700] bg-[#141A26]'
                      : 'border-transparent text-[#7C8799] hover:text-[#F0F2F5]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Sponsor Campaign
                </button>
              </div>

              {activeTab === 'CAMPAIGNS' && (
                <div className="flex items-center gap-2 pb-2">
                  <Filter className="w-3.5 h-3.5 text-[#7C8799]" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-2 py-1 rounded"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="FUEL_DISCOUNT">Fuel Discounts</option>
                    <option value="FACTORING_FINANCE">Factoring / Capital</option>
                    <option value="TIRE_MAINTENANCE">Tire &amp; Maintenance</option>
                    <option value="TRUCK_STOP_AMENITY">Truck Stop Amenities</option>
                    <option value="BROKER_FREIGHT">Broker Freight</option>
                  </select>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {activeTab === 'CAMPAIGNS' && (
                <div className="space-y-3">
                  {filteredCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="p-4 rounded-xl bg-[#0D1117] border border-[#202738] hover:border-[#FFD700]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Left Details */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-[#141923] border border-[#252D3D] flex items-center justify-center shrink-0">
                          {getCategoryIcon(camp.category)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#F0F2F5] text-sm">{camp.sponsorName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#182030] text-[#7C8799] border border-[#2A3448]">
                              {camp.category.replace('_', ' ')}
                            </span>
                            {camp.discountBadge && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                                {camp.discountBadge}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                camp.status === 'ACTIVE'
                                  ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/30'
                              }`}
                            >
                              {camp.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-[#A0AEC0]">{camp.title}</h4>
                          <p className="text-[11px] text-[#636E82] line-clamp-1">{camp.tagline}</p>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-[#7C8799] pt-1">
                            <span>Views: <strong className="text-[#F0F2F5]">{camp.impressions}</strong></span>
                            <span>Clicks: <strong className="text-[#00FF66]">{camp.clicks}</strong></span>
                            <span>CTR: <strong className="text-[#C084FC]">{camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(1) : 0}%</strong></span>
                            <span>Rate: <strong className="text-[#FFD700]">${camp.sponsorRatePerDayUsd}/day</strong></span>
                            {camp.voucherCode && (
                              <span>Code: <code className="text-[#FFD700] bg-[#141A26] px-1 py-0.5 rounded">{camp.voucherCode}</code></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                            camp.status === 'ACTIVE'
                              ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-400 hover:bg-yellow-950/50'
                              : 'bg-green-950/30 border-green-500/40 text-green-400 hover:bg-green-950/50'
                          }`}
                          title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                        >
                          {camp.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{camp.status === 'ACTIVE' ? 'Pause' : 'Enable'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(camp.id, camp.sponsorName)}
                          className="p-2 rounded-lg bg-red-950/30 border border-red-500/40 text-red-400 hover:bg-red-950/50 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'CREATE' && (
                <form onSubmit={handleCreate} className="space-y-4 max-w-2xl mx-auto bg-[#0D1117] p-6 rounded-xl border border-[#202738]">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#1E2638]">
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    <h3 className="text-sm font-mono font-bold text-[#F0F2F5] uppercase">
                      Register Fleet Partner Commercial
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Sponsor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g. TA Petro / Speedco"
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as AdCategory)}
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      >
                        <option value="FUEL_DISCOUNT">Fuel Discount / Card</option>
                        <option value="FACTORING_FINANCE">Factoring &amp; Quick Pay</option>
                        <option value="TIRE_MAINTENANCE">Tires &amp; Roadside Service</option>
                        <option value="TRUCK_STOP_AMENITY">Truck Stop Amenities &amp; Parking</option>
                        <option value="BROKER_FREIGHT">Dedicated Broker Freight</option>
                        <option value="SAFETY_COMPLIANCE">Safety &amp; Compliance Hardware</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                      Campaign Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 35¢/Gal Cash Fuel Discount at All Petro Locations"
                      className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                      Sub-Headline / Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Zero transaction fees with automated TruckWithEase billing"
                      className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                      Full Offer Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe redemption guidelines, minimum fuel gallons, or qualifying carrier criteria..."
                      className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Discount Badge
                      </label>
                      <input
                        type="text"
                        value={discountBadge}
                        onChange={(e) => setDiscountBadge(e.target.value)}
                        placeholder="e.g. SAVE $0.35/GAL"
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Voucher Promo Code
                      </label>
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="e.g. TWE-PETRO-26"
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Sponsor Rate ($/Day)
                      </label>
                      <input
                        type="number"
                        value={sponsorRate}
                        onChange={(e) => setSponsorRate(Number(e.target.value))}
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Call-To-Action Button
                      </label>
                      <input
                        type="text"
                        value={callToActionLabel}
                        onChange={(e) => setCallToActionLabel(e.target.value)}
                        placeholder="e.g. Claim Discount Card"
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                        Target URL / Action Link
                      </label>
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('CAMPAIGNS')}
                      className="px-4 py-2 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] font-mono text-xs hover:text-[#F0F2F5]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:opacity-95"
                    >
                      Publish Campaign
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#1E2638] bg-[#0E131C] flex items-center justify-between text-xs text-[#7C8799] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                All campaigns synced with In-Cab Driver Feed and Fleet Billboard
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] hover:bg-[#1E2638] text-xs font-mono"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
