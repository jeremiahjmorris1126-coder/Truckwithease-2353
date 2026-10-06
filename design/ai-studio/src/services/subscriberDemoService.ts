/**
 * TRUCKWITHEASE Subscriber & Demo Experience Service
 * 
 * Manages simple sign up, 1-click interactive demo access, pre-seeded fleet state,
 * and guided thorough system testing without barriers.
 */

import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface SubscriberRegistration {
  fullName: string;
  carrierName: string;
  email: string;
  phone?: string;
  fleetSize: '1' | '2-10' | '11-50' | '50+';
  usdotNumber?: string;
  tier: 'TRIAL_14_DAY' | 'FLEET_PRO' | 'ENTERPRISE_SOVEREIGN';
  registeredAtIso: string;
  isDemo: boolean;
}

export interface DemoFleetEnvironment {
  carrierName: string;
  usdotNumber: string;
  primaryUnit: {
    unitNumber: string;
    model: string;
    vin: string;
    speedMph: number;
    rpm: number;
    hosDriveRemaining: string;
    hosShiftWindow: string;
    hosCycleRemaining: string;
  };
  totalFleetUnits: number;
  activeGateways: number;
  status: 'TEST_FLIGHT_ACTIVE' | 'PRODUCTION_ACTIVE';
}

const STORAGE_KEY = 'twe_active_subscriber';
const DEMO_FLAG_KEY = 'twe_is_demo_active';

class SubscriberDemoService {
  private currentSubscriber: SubscriberRegistration | null = null;
  private isDemoActive = false;
  private isSystemTestModalOpen = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      const storedSub = localStorage.getItem(STORAGE_KEY);
      if (storedSub) {
        this.currentSubscriber = JSON.parse(storedSub);
      }
      this.isDemoActive = localStorage.getItem(DEMO_FLAG_KEY) === 'true';
    } catch (e) {
      console.warn('Failed to load subscriber state from localStorage:', e);
    }
  }

  public getSubscriber(): SubscriberRegistration | null {
    return this.currentSubscriber;
  }

  public isDemo(): boolean {
    return this.isDemoActive;
  }

  public isSystemTestOpen(): boolean {
    return this.isSystemTestModalOpen;
  }

  public setSystemTestOpen(open: boolean) {
    this.isSystemTestModalOpen = open;
    this.notify();
  }

  /**
   * Simple 1-Click Instant Demo Launch
   */
  public launchInstantDemo(carrierName?: string): DemoFleetEnvironment {
    this.isDemoActive = true;
    this.currentSubscriber = {
      fullName: 'Demo Operator',
      carrierName: carrierName || 'Thunder Ridge Freight LLC',
      email: 'demo@truckwithease.com',
      phone: '(636) 706-8338',
      fleetSize: '2-10',
      usdotNumber: 'USDOT 3892104',
      tier: 'TRIAL_14_DAY',
      registeredAtIso: new Date().toISOString(),
      isDemo: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentSubscriber));
      localStorage.setItem(DEMO_FLAG_KEY, 'true');
    } catch {
      // ignore
    }

    this.notify();
    return this.getDemoEnvironment();
  }

  /**
   * Register a new subscriber with minimal friction (Simple Sign Up)
   */
  public async registerSubscriber(data: Omit<SubscriberRegistration, 'registeredAtIso' | 'isDemo'>): Promise<SubscriberRegistration> {
    const newSub: SubscriberRegistration = {
      ...data,
      registeredAtIso: new Date().toISOString(),
      isDemo: false,
    };

    this.currentSubscriber = newSub;
    this.isDemoActive = false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSub));
      localStorage.setItem(DEMO_FLAG_KEY, 'false');

      // If user has a Firebase auth account, save to Firestore /users/{userId}
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: newSub.email || auth.currentUser.email || '',
          displayName: newSub.fullName,
          role: 'CARRIER_ADMIN',
          usdot: newSub.usdotNumber || '3892104',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Note on subscriber persistence:', err);
    }

    this.notify();
    return newSub;
  }

  public endDemo() {
    this.isDemoActive = false;
    try {
      localStorage.setItem(DEMO_FLAG_KEY, 'false');
    } catch {
      // ignore
    }
    this.notify();
  }

  public getDemoEnvironment(): DemoFleetEnvironment {
    return {
      carrierName: this.currentSubscriber?.carrierName || 'Thunder Ridge Freight LLC',
      usdotNumber: this.currentSubscriber?.usdotNumber || 'USDOT 3892104',
      primaryUnit: {
        unitNumber: 'UNIT-T104',
        model: '2025 Peterbilt 579 UltraLoft (Cummins X15 500HP)',
        vin: '1XP4D49X5KD294819',
        speedMph: 64.8,
        rpm: 1420,
        hosDriveRemaining: '07h 48m',
        hosShiftWindow: '10h 14m',
        hosCycleRemaining: '58h 32m',
      },
      totalFleetUnits: 8,
      activeGateways: 54,
      status: this.isDemoActive ? 'TEST_FLIGHT_ACTIVE' : 'PRODUCTION_ACTIVE',
    };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const subscriberDemoService = new SubscriberDemoService();
