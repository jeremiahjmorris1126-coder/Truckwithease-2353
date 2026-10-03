// ============================================================================
// TRUCKWITHEASE™ ENTERPRISE — AD CAMPAIGN & SPONSOR MANAGEMENT SERVICE
// Enterprise ad inventory, fleet sponsorship tiers, in-cab discount banners,
// and real-time impression/click-through telemetry.
// ============================================================================

export type AdCategory =
  | 'FUEL_DISCOUNT'
  | 'BROKER_FREIGHT'
  | 'TIRE_MAINTENANCE'
  | 'FACTORING_FINANCE'
  | 'TRUCK_STOP_AMENITY'
  | 'SAFETY_COMPLIANCE';

export type AdPlacement =
  | 'OVERVIEW_BILLBOARD'
  | 'DISPATCH_BANNER'
  | 'IN_CAB_FOOTER'
  | 'GLOBAL_BANNER';

export type TargetAudience =
  | 'ALL'
  | 'OWNER_OPERATOR'
  | 'COMPANY_FLEET_DRIVER'
  | 'DISPATCHER_ADMIN';

export interface AdCampaign {
  id: string;
  sponsorName: string;
  sponsorLogoUrl?: string;
  category: AdCategory;
  title: string;
  tagline: string;
  description: string;
  discountBadge?: string; // e.g. "SAVE $0.42/GAL" or "ZERO FEE 30 DAYS"
  callToActionLabel: string;
  targetUrl: string;
  actionType: 'LINK' | 'MODAL_INQUIRY' | 'VOUCHER_CLAIM';
  voucherCode?: string;
  placement: AdPlacement;
  targetAudience: TargetAudience;
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  priority: number; // 1-10 (higher displays more frequently)
  sponsorRatePerDayUsd: number;
}

const STORAGE_KEY = 'twe_ad_campaigns_v1';

export const INITIAL_AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'camp-loves-fuel-2026',
    sponsorName: "Love's Travel Stops",
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=160&auto=format&fit=crop&q=80',
    category: 'FUEL_DISCOUNT',
    title: "Love's Express Fleet Rebate — Exclusive TruckWithEase Discount",
    tagline: 'Instant $0.42/gal pump rebate on bulk diesel across 650+ nationwide travel stops.',
    description: 'Direct RFID pump authorization through TruckWithEase telematics integration. Zero card-swipe delay and automatic IFTA fuel tax ledger entry.',
    discountBadge: 'SAVE $0.42 / GAL',
    callToActionLabel: 'Activate Fleet Fuel Card',
    targetUrl: 'https://www.loves.com/fleet-solutions',
    actionType: 'VOUCHER_CLAIM',
    voucherCode: 'TWE-LOVES-2026',
    placement: 'OVERVIEW_BILLBOARD',
    targetAudience: 'ALL',
    status: 'ACTIVE',
    impressions: 4829,
    clicks: 342,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    priority: 10,
    sponsorRatePerDayUsd: 125,
  },
  {
    id: 'camp-apex-factoring-2026',
    sponsorName: 'Apex Capital Factoring',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=160&auto=format&fit=crop&q=80',
    category: 'FACTORING_FINANCE',
    title: 'Same-Day Freight Bill Factoring with 98% Advance Rates',
    tagline: 'Zero hidden reserve fees. Fuel advances available within 15 minutes of POD submission.',
    description: 'Seamless integration with TruckWithEase RateCon & BOL document scanner. Upload freight bills directly from the cab for instant cash flow.',
    discountBadge: '1.25% FLAT RATE',
    callToActionLabel: 'Calculate Factoring Advance',
    targetUrl: 'https://www.apexcapitalcorp.com',
    actionType: 'MODAL_INQUIRY',
    voucherCode: 'APEX-TWE-SAME-DAY',
    placement: 'OVERVIEW_BILLBOARD',
    targetAudience: 'OWNER_OPERATOR',
    status: 'ACTIVE',
    impressions: 3120,
    clicks: 198,
    startDate: '2026-09-10',
    endDate: '2026-11-30',
    priority: 8,
    sponsorRatePerDayUsd: 95,
  },
  {
    id: 'camp-bridgestone-tires-2026',
    sponsorName: 'Bridgestone Commercial Fleet Services',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=160&auto=format&fit=crop&q=80',
    category: 'TIRE_MAINTENANCE',
    title: 'Commercial Steer & Drive Tire Mesh — 24/7 Mobile Tire Replacement',
    tagline: 'Nationwide roadside tire assistance with average 44-minute emergency roll time.',
    description: 'Guaranteed OEM casing retreads and new radial steering tires. Instant dispatch through TruckWithEase Maintenance & Roadside module.',
    discountBadge: '15% OFF TIRES',
    callToActionLabel: 'Locate Nearest Service Center',
    targetUrl: 'https://www.commercial.bridgestone.com',
    actionType: 'LINK',
    voucherCode: 'BRIDGESTONE-FLEET-15',
    placement: 'OVERVIEW_BILLBOARD',
    targetAudience: 'ALL',
    status: 'ACTIVE',
    impressions: 2650,
    clicks: 147,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    priority: 7,
    sponsorRatePerDayUsd: 85,
  },
  {
    id: 'camp-pilot-amenities-2026',
    sponsorName: 'Pilot Flying J',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=160&auto=format&fit=crop&q=80',
    category: 'TRUCK_STOP_AMENITY',
    title: 'Reserved Truck Parking & Hot Shower Credits for TruckWithEase Drivers',
    tagline: 'Guaranteed reserved parking stall reservations booked 24 hours in advance via in-cab HUD.',
    description: 'Never hunt for parking on a ticking 14-hour clock. Direct integration with FMCSA HOS rest break timers for hassle-free compliance.',
    discountBadge: 'FREE SHOWER & COFFEE',
    callToActionLabel: 'Reserve Night Parking',
    targetUrl: 'https://pilotflyingj.com/rewards',
    actionType: 'LINK',
    voucherCode: 'PILOT-TWE-REST',
    placement: 'IN_CAB_FOOTER',
    targetAudience: 'COMPANY_FLEET_DRIVER',
    status: 'ACTIVE',
    impressions: 5410,
    clicks: 489,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    priority: 9,
    sponsorRatePerDayUsd: 110,
  },
  {
    id: 'camp-coyote-dedicated-2026',
    sponsorName: 'Coyote Logistics / UPS Supply Chain',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=160&auto=format&fit=crop&q=80',
    category: 'BROKER_FREIGHT',
    title: 'High-Paying Dedicated Reefer & Dry Van Lanes (Midwest & Southeast)',
    tagline: 'Average $3.18/mile with quick-pay terms and zero factoring deductions.',
    description: 'Contracted freight corridors for 53ft trailers. Instant one-click load locking via Goat Load Board integration.',
    discountBadge: '$3.18 / MILE AVG',
    callToActionLabel: 'View Available Dedicated Lanes',
    targetUrl: 'https://www.coyote.com',
    actionType: 'LINK',
    placement: 'DISPATCH_BANNER',
    targetAudience: 'OWNER_OPERATOR',
    status: 'ACTIVE',
    impressions: 4120,
    clicks: 378,
    startDate: '2026-09-15',
    endDate: '2026-10-31',
    priority: 8,
    sponsorRatePerDayUsd: 130,
  }
];

export function getSavedAdCampaigns(): AdCampaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAdCampaigns(INITIAL_AD_CAMPAIGNS);
      return INITIAL_AD_CAMPAIGNS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[AdCampaignService] Failed to read from localStorage, using initial data:', err);
    return INITIAL_AD_CAMPAIGNS;
  }
}

export function saveAdCampaigns(campaigns: AdCampaign[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (err) {
    console.error('[AdCampaignService] Failed to save ad campaigns:', err);
  }
}

export function recordAdImpression(campaignId: string): void {
  try {
    const campaigns = getSavedAdCampaigns();
    const target = campaigns.find((c) => c.id === campaignId);
    if (target) {
      target.impressions += 1;
      saveAdCampaigns(campaigns);
    }
  } catch (err) {
    console.error('[AdCampaignService] Error recording impression:', err);
  }
}

export function recordAdClick(campaignId: string): void {
  try {
    const campaigns = getSavedAdCampaigns();
    const target = campaigns.find((c) => c.id === campaignId);
    if (target) {
      target.clicks += 1;
      saveAdCampaigns(campaigns);
    }
  } catch (err) {
    console.error('[AdCampaignService] Error recording click:', err);
  }
}

export function createAdCampaign(campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks'>): AdCampaign {
  const campaigns = getSavedAdCampaigns();
  const newCampaign: AdCampaign = {
    ...campaign,
    id: `camp-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    impressions: 0,
    clicks: 0,
  };
  campaigns.unshift(newCampaign);
  saveAdCampaigns(campaigns);
  return newCampaign;
}

export function updateAdCampaign(campaignId: string, updates: Partial<AdCampaign>): AdCampaign | null {
  const campaigns = getSavedAdCampaigns();
  const idx = campaigns.findIndex((c) => c.id === campaignId);
  if (idx === -1) return null;
  campaigns[idx] = { ...campaigns[idx], ...updates };
  saveAdCampaigns(campaigns);
  return campaigns[idx];
}

export function deleteAdCampaign(campaignId: string): boolean {
  const campaigns = getSavedAdCampaigns();
  const filtered = campaigns.filter((c) => c.id !== campaignId);
  if (filtered.length === campaigns.length) return false;
  saveAdCampaigns(filtered);
  return true;
}

export interface AdPerformanceMetrics {
  totalActiveCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtrPercent: number;
  totalProjectedRevenueUsd: number;
}

export function calculateAdPerformanceMetrics(campaigns: AdCampaign[]): AdPerformanceMetrics {
  const active = campaigns.filter((c) => c.status === 'ACTIVE');
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const averageCtrPercent = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const totalProjectedRevenueUsd = active.reduce((acc, c) => acc + c.sponsorRatePerDayUsd * 30, 0);

  return {
    totalActiveCampaigns: active.length,
    totalImpressions,
    totalClicks,
    averageCtrPercent: parseFloat(averageCtrPercent.toFixed(2)),
    totalProjectedRevenueUsd,
  };
}
