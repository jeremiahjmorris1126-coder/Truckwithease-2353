// ============================================================================
// TRUCKWITHEASE LIVE FLEET TICKER & EMERGENCY BROADCAST SERVICE
// Delivers real-time trucking industry news, general breaking news,
// FMCSA / DOT violation updates, NASA Space Weather & NOAA emergency alerts,
// and custom administrative fleet reminders.
// ============================================================================

import {
  saveTickerPreferencesToFirestore,
  fetchTickerPreferencesFromFirestore,
  subscribeToTickerPreferencesFirestore,
  FirestoreTickerPreferences,
} from '../firebase';

export type TickerCategory = 
  | 'TRUCKING_NEWS' 
  | 'DOT_VIOLATION_WATCH' 
  | 'NASA_EMERGENCY_WEATHER' 
  | 'GENERAL_NEWS' 
  | 'FLEET_REMINDER';

export interface TickerItem {
  id: string;
  category: TickerCategory;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL_URGENT';
  title: string;
  source: string;
  timestamp: string;
  actionUrl?: string;
  customAdminPost?: boolean;
  nasaEventType?: string;
  nasaDetail?: string;
  logisticsImpact?: string;
}

export interface TickerPreferences {
  showTruckingNews: boolean;
  showDotAlerts: boolean;
  showNasaWeatherAlerts: boolean;
  showGeneralNews: boolean;
  showFleetReminders: boolean;
  tickerSpeed: 'slow' | 'normal' | 'fast';
  theme: 'gold' | 'amber' | 'emerald';
  isPaused: boolean;
}

const STORAGE_KEY_PREFS = 'twe_fleet_ticker_prefs_v1';
const STORAGE_KEY_CUSTOM_POSTS = 'twe_fleet_ticker_custom_posts_v1';

export const INITIAL_TICKER_ITEMS: TickerItem[] = [
  // 1. Trucking & Freight News
  {
    id: 'tick-truck-01',
    category: 'TRUCKING_NEWS',
    urgency: 'NORMAL',
    title: 'NATIONAL DIESEL AVERAGE: Drops 2.8¢ to $3.824/gal; Midwest refinery output up 1.4%',
    source: 'EIA Diesel Index',
    timestamp: '10m ago',
  },
  {
    id: 'tick-truck-02',
    category: 'TRUCKING_NEWS',
    urgency: 'HIGH',
    title: 'FREIGHT SPOT RATES: Dry Van average climbs +4¢ to $2.44/mile; Reefer surges to $2.88/mile in Southeast corridor',
    source: 'DAT Freight Pulse',
    timestamp: '24m ago',
  },
  {
    id: 'tick-truck-03',
    category: 'TRUCKING_NEWS',
    urgency: 'NORMAL',
    title: 'I-80 WYOMING CORRIDOR: Elk Mountain summit wind sensors report 38 MPH gusts; light high-profile trailers advised caution',
    source: 'WYDOT Corridor Watch',
    timestamp: '42m ago',
  },

  // 2. DOT Violations & FMCSA Updates
  {
    id: 'tick-dot-01',
    category: 'DOT_VIOLATION_WATCH',
    urgency: 'CRITICAL_URGENT',
    title: 'DOT VIOLATION WATCH: CVSA unannounced Brake Safety Sweep active in 12 states; 20% of brake chambers cited for pushrod stroke deficiency',
    source: 'FMCSA Safety Bulletin',
    timestamp: '15m ago',
  },
  {
    id: 'tick-dot-02',
    category: 'DOT_VIOLATION_WATCH',
    urgency: 'HIGH',
    title: 'NEW FMCSA CITATION FOCUS: Clarification issued on 49 CFR § 395.2 Personal Conveyance to safe haven during parking shortage',
    source: 'DOT Regulatory Notice',
    timestamp: '1h ago',
  },
  {
    id: 'tick-dot-03',
    category: 'DOT_VIOLATION_WATCH',
    urgency: 'HIGH',
    title: 'TENNESSEE & GEORGIA SCALES: Heavy Level-I inspections reported on I-24 & I-75 Northbound weigh facilities',
    source: 'Drivewyze PreClear Feed',
    timestamp: '2h ago',
  },

  // 3. NASA Space Weather & Emergency Severe Alerts
  {
    id: 'tick-nasa-01',
    category: 'NASA_EMERGENCY_WEATHER',
    urgency: 'CRITICAL_URGENT',
    title: 'NASA DONKI SPACE WEATHER ALERT: Class M4.2 Solar Flare detected; NOAA Geomagnetic Storm Watch (Kp=5). Potential minor GPS L1/L5 scintillation in upper latitudes',
    source: 'NASA DONKI & NOAA Space Weather',
    timestamp: '18m ago',
  },
  {
    id: 'tick-nasa-02',
    category: 'NASA_EMERGENCY_WEATHER',
    urgency: 'HIGH',
    title: 'NOAA / NASA EONET CORRIDOR HAZARD: High Wind Warning active along I-25 Front Range; 55+ MPH crosswind gust hazard for empty 53ft vans',
    source: 'NASA EONET Satellite Feed',
    timestamp: '35m ago',
  },
  {
    id: 'tick-nasa-03',
    category: 'NASA_EMERGENCY_WEATHER',
    urgency: 'NORMAL',
    title: 'SOLAR RADIATION FLUX: Low-earth satellite constellation telemetry nominal; ground cellular backhaul unaffected',
    source: 'NASA Space Geodesy',
    timestamp: '2h ago',
  },

  // 4. General Breaking News
  {
    id: 'tick-gen-01',
    category: 'GENERAL_NEWS',
    urgency: 'NORMAL',
    title: 'US INFRASTRUCTURE: $180M federal grant allocated for 1,200 new commercial truck parking spaces across key Midwest freight corridors',
    source: 'DOT Press Bureau',
    timestamp: '3h ago',
  },

  // 5. Daily Fleet Reminders & Admin Direct Broadcasts
  {
    id: 'tick-fleet-01',
    category: 'FLEET_REMINDER',
    urgency: 'HIGH',
    title: 'FLEET DIRECTIVE [ADMIN]: Cold weather anti-gel additive mandatory for all units fueling north of I-70. Verify DEF tank levels > 50%',
    source: 'Morrishive Central Dispatch',
    timestamp: 'Today 06:00',
    customAdminPost: true,
  },
  {
    id: 'tick-fleet-02',
    category: 'FLEET_REMINDER',
    urgency: 'NORMAL',
    title: 'DAILY SAFETY REMINDER: Pre-trip air line gladhand seals must be inspected for cracking before dispatch sign-off',
    source: 'Fleet Safety Chief',
    timestamp: 'Today 07:30',
    customAdminPost: true,
  },
];

const DEFAULT_PREFERENCES: TickerPreferences = {
  showTruckingNews: true,
  showDotAlerts: true,
  showNasaWeatherAlerts: true,
  showGeneralNews: true,
  showFleetReminders: true,
  tickerSpeed: 'normal',
  theme: 'gold',
  isPaused: false,
};

type TickerChangeListener = (items: TickerItem[], prefs: TickerPreferences) => void;
const listeners = new Set<TickerChangeListener>();

class FleetTickerService {
  private items: TickerItem[] = [...INITIAL_TICKER_ITEMS];
  private preferences: TickerPreferences = { ...DEFAULT_PREFERENCES };

  constructor() {
    this.loadState();
    this.fetchRealtimeNasaAndDotUpdates();
  }

  private loadState() {
    if (typeof window === 'undefined') return;

    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (savedPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
      }

      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_POSTS);
      if (savedCustom) {
        const customPosts: TickerItem[] = JSON.parse(savedCustom);
        // Prepend custom posts to list
        this.items = [...customPosts, ...INITIAL_TICKER_ITEMS];
      }
    } catch {
      // Fallback
    }

    // Connect to real-time Firestore persistence
    try {
      subscribeToTickerPreferencesFirestore((remotePrefs) => {
        if (remotePrefs) {
          this.preferences = {
            ...this.preferences,
            showTruckingNews: remotePrefs.showTruckingNews ?? this.preferences.showTruckingNews,
            showGeneralNews: remotePrefs.showGeneralNews ?? this.preferences.showGeneralNews,
            showDotAlerts: remotePrefs.showDotAlerts ?? this.preferences.showDotAlerts,
            showNasaWeatherAlerts: remotePrefs.showNasaWeatherAlerts ?? this.preferences.showNasaWeatherAlerts,
            showFleetReminders: remotePrefs.showFleetReminders ?? this.preferences.showFleetReminders,
            tickerSpeed: remotePrefs.tickerSpeed || this.preferences.tickerSpeed,
            theme: remotePrefs.theme || this.preferences.theme,
            isPaused: remotePrefs.isPaused ?? this.preferences.isPaused,
          };
          try {
            localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(this.preferences));
          } catch {
            // Ignore
          }
          this.notify();
        }
      });
    } catch {
      // Fallback to local storage if Firestore offline
    }
  }

  private async fetchRealtimeNasaAndDotUpdates() {
    try {
      // First try our backend proxy which aggregates NASA DONKI & EONET with cache
      const res = await fetch('/api/nasa/alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.alerts) && data.alerts.length > 0) {
          const liveNasaItems: TickerItem[] = data.alerts.map((al: any) => ({
            id: al.id || `nasa-alert-${Math.random().toString(36).substr(2, 9)}`,
            category: 'NASA_EMERGENCY_WEATHER',
            urgency: al.urgency || 'HIGH',
            title: al.title,
            source: al.apiSource || 'NASA Space Weather & Earth Observatory',
            timestamp: al.timestamp ? 'LIVE SATELLITE' : 'RECENT',
            actionUrl: al.sourceUrl,
            nasaEventType: al.eventType,
            nasaDetail: al.detail,
            logisticsImpact: al.logisticsImpact,
          }));

          // Replace existing NASA items with freshly fetched live items
          const nonNasaItems = this.items.filter((i) => i.category !== 'NASA_EMERGENCY_WEATHER');
          // Re-insert custom admin posts first, then live NASA alerts, then non-NASA items
          const customPosts = nonNasaItems.filter((i) => i.customAdminPost);
          const standardItems = nonNasaItems.filter((i) => !i.customAdminPost);

          this.items = [...customPosts, ...liveNasaItems, ...standardItems];
          this.notify();
          return;
        }
      }
    } catch {
      // If backend proxy not ready, fallback to direct DONKI public endpoint
    }

    // Direct client fallback to NASA DONKI
    try {
      const res = await fetch('https://api.nasa.gov/DONKI/notifications?type=all&api_key=DEMO_KEY');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          const newItem: TickerItem = {
            id: `nasa-live-${latest.messageID || Date.now()}`,
            category: 'NASA_EMERGENCY_WEATHER',
            urgency: latest.messageType?.includes('FLR') ? 'CRITICAL_URGENT' : 'HIGH',
            title: `NASA REAL-TIME [${latest.messageType || 'ALERT'}]: ${latest.messageBody?.slice(0, 160).replace(/\n/g, ' ')}...`,
            source: 'NASA DONKI Live Satellite',
            timestamp: 'LIVE SATELLITE',
            nasaEventType: latest.messageType,
            nasaDetail: latest.messageBody,
            logisticsImpact: 'Space weather alert recorded. GPS scintillation and satellite tracking advisory in effect.',
          };
          this.items = [newItem, ...this.items.filter((i) => !i.id.startsWith('nasa-live'))];
          this.notify();
        }
      }
    } catch {
      // NASA Demo key rate limit safe fallback
    }
  }

  public async refreshNasaAlerts(): Promise<number> {
    await this.fetchRealtimeNasaAndDotUpdates();
    return this.items.filter((i) => i.category === 'NASA_EMERGENCY_WEATHER').length;
  }

  public getItems(): TickerItem[] {
    return this.items.filter((item) => {
      if (item.category === 'TRUCKING_NEWS' && !this.preferences.showTruckingNews) return false;
      if (item.category === 'DOT_VIOLATION_WATCH' && !this.preferences.showDotAlerts) return false;
      if (item.category === 'NASA_EMERGENCY_WEATHER' && !this.preferences.showNasaWeatherAlerts) return false;
      if (item.category === 'GENERAL_NEWS' && !this.preferences.showGeneralNews) return false;
      if (item.category === 'FLEET_REMINDER' && !this.preferences.showFleetReminders) return false;
      return true;
    });
  }

  public getAllRawItems(): TickerItem[] {
    return [...this.items];
  }

  public getPreferences(): TickerPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(newPrefs: Partial<TickerPreferences>, persistToFirestore: boolean = true) {
    this.preferences = { ...this.preferences, ...newPrefs };
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(this.preferences));
    } catch {
      // Ignore
    }

    if (persistToFirestore) {
      saveTickerPreferencesToFirestore({
        showTruckingNews: this.preferences.showTruckingNews,
        showGeneralNews: this.preferences.showGeneralNews,
        showDotAlerts: this.preferences.showDotAlerts,
        showNasaWeatherAlerts: this.preferences.showNasaWeatherAlerts,
        showFleetReminders: this.preferences.showFleetReminders,
        tickerSpeed: this.preferences.tickerSpeed,
        theme: this.preferences.theme,
        isPaused: this.preferences.isPaused,
      }).catch((err) => {
        console.warn('[FIRESTORE-TICKER] Async save notice:', err?.message || err);
      });
    }

    this.notify();
  }

  public async savePreferencesToFirestore(): Promise<{ success: boolean; configId?: string }> {
    const res = await saveTickerPreferencesToFirestore({
      showTruckingNews: this.preferences.showTruckingNews,
      showGeneralNews: this.preferences.showGeneralNews,
      showDotAlerts: this.preferences.showDotAlerts,
      showNasaWeatherAlerts: this.preferences.showNasaWeatherAlerts,
      showFleetReminders: this.preferences.showFleetReminders,
      tickerSpeed: this.preferences.tickerSpeed,
      theme: this.preferences.theme,
      isPaused: this.preferences.isPaused,
    });
    return res;
  }

  public addCustomFleetReminder(title: string, urgency: 'NORMAL' | 'HIGH' | 'CRITICAL_URGENT' = 'HIGH'): TickerItem {
    const newItem: TickerItem = {
      id: `custom-post-${Date.now()}`,
      category: 'FLEET_REMINDER',
      urgency,
      title: `FLEET DIRECTIVE: ${title.toUpperCase()}`,
      source: 'Fleet Administrator',
      timestamp: 'Just now',
      customAdminPost: true,
    };

    this.items.unshift(newItem);

    try {
      const customItems = this.items.filter((i) => i.customAdminPost);
      localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(customItems));
    } catch {
      // Ignore
    }

    this.notify();
    return newItem;
  }

  public removeCustomFleetReminder(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    try {
      const customItems = this.items.filter((i) => i.customAdminPost);
      localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(customItems));
    } catch {
      // Ignore
    }
    this.notify();
  }

  public subscribe(listener: TickerChangeListener): () => void {
    listeners.add(listener);
    listener(this.getItems(), this.getPreferences());
    return () => {
      listeners.delete(listener);
    };
  }

  private notify() {
    const activeItems = this.getItems();
    const prefs = this.getPreferences();
    listeners.forEach((l) => {
      try {
        l(activeItems, prefs);
      } catch {
        // Safe
      }
    });
  }
}

export const fleetTickerService = new FleetTickerService();
