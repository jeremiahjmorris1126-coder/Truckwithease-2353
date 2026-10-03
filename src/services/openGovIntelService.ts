/**
 * TRUCK WITH EASE - OPEN GOVERNMENT & FREIGHT PUBLIC DATA SERVICE
 * Ingests live data from:
 * 1. NOAA / National Weather Service (api.weather.gov)
 * 2. FMCSA SAFER Public Safety Database (safer.fmcsa.dot.gov)
 * 3. US National Diesel Fuel Benchmark & FSC Matrix
 */

export interface NwsHighwayAlert {
  id: string;
  event: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  corridor: string;
  area: string;
  headline: string;
  instruction: string;
  effective: string;
  expires: string;
}

export interface FmcsaCarrierRecord {
  success: boolean;
  usdot: string;
  legalName: string;
  dbaName: string;
  operatingStatus: string;
  entityType: string;
  safetyRating: string;
  powerUnits: number;
  drivers: number;
  mcs150Date: string;
  outOfServiceRates: {
    vehicleOosRate: string;
    driverOosRate: string;
    hazmatOosRate: string;
  };
  verifiedBy: string;
}

export interface DieselFuelIndex {
  success: boolean;
  nationalAveragePerGallon: number;
  effectiveWeek: string;
  regionalPaddAverages: {
    PADD_1_EAST_COAST: number;
    PADD_2_MIDWEST: number;
    PADD_3_GULF_COAST: number;
    PADD_4_ROCKY_MOUNTAIN: number;
    PADD_5_WEST_COAST: number;
  };
  fuelSurchargeMatrix: {
    basePeg: number;
    standardMpg: number;
    recommendedFscPerMile: number;
    note: string;
  };
}

class OpenGovIntelService {
  private alertsCache: NwsHighwayAlert[] = [];
  private lastAlertsFetch = 0;

  async getLiveHighwayAlerts(corridor?: string, severity?: string): Promise<NwsHighwayAlert[]> {
    const now = Date.now();
    if (this.alertsCache.length > 0 && now - this.lastAlertsFetch < 60000 && !corridor && !severity) {
      return this.alertsCache;
    }

    try {
      const params = new URLSearchParams();
      if (corridor && corridor !== 'ALL') params.append('corridor', corridor);
      if (severity && severity !== 'ALL') params.append('severity', severity);

      const res = await fetch(`/api/open-intel/nws-alerts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.alertsCache = data.alerts || [];
        this.lastAlertsFetch = now;
        return this.alertsCache;
      }
    } catch (e) {
      console.warn('[OpenGovIntel] NWS fetch error:', e);
    }
    return this.alertsCache;
  }

  async verifyCarrierSafer(usdot: string): Promise<FmcsaCarrierRecord | null> {
    try {
      const res = await fetch(`/api/open-intel/fmcsa-carrier/${encodeURIComponent(usdot)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[OpenGovIntel] SAFER verify error:', e);
    }
    return null;
  }

  async getDieselIndex(): Promise<DieselFuelIndex | null> {
    try {
      const res = await fetch('/api/open-intel/diesel-index');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[OpenGovIntel] Diesel index error:', e);
    }
    return null;
  }
}

export const openGovIntelService = new OpenGovIntelService();
