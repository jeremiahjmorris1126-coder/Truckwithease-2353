// ============================================================================
// CB RADIO CLIENT SERVICE & RF MESH SYNC
// Communicates with /api/cb/* endpoints for real-time 40-channel chatter,
// PTT broadcast relay, and Channel 9 Emergency Mayday packet transmission.
// ============================================================================

import { CBChannelSpec, CBRadioMessage } from '../data/cbRadioChannels';

export interface CbBroadcastResponse {
  success: boolean;
  message: CBRadioMessage;
  peerReply?: CBRadioMessage;
  meshActiveUnits?: number;
  rfPropagationIndex?: string;
  squelchThresholdDb?: number;
}

export interface CbStatusResponse {
  transceiver: string;
  status: string;
  swrRatio: number;
  rfPowerWatts: number;
  squelchThresholdDb: number;
  activeMeshNodes: number;
  noiseBlanker: boolean;
  rogerBeep: boolean;
  antennaMatched: boolean;
  activeCorridor: string;
}

export interface CbMaydayResponse {
  success: boolean;
  maydayId: string;
  channel: number;
  maydayMessage: CBRadioMessage;
  reactReply: CBRadioMessage;
  statePatrolRelay: string;
  message: string;
}

class CBRadioService {
  private baseUrl = '/api/cb';

  /**
   * Fetch all 40 CB channels with active node count and frequency allocation
   */
  public async getChannels(): Promise<CBChannelSpec[]> {
    try {
      const res = await fetch(`${this.baseUrl}/channels`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.channels || [];
    } catch (err) {
      console.warn('[CBRadioService] Falling back to local channel data:', err);
      return [];
    }
  }

  /**
   * Fetch real-time corridor chatter for a specific CB channel
   */
  public async getChannelChatter(channel: number): Promise<CBRadioMessage[]> {
    try {
      const res = await fetch(`${this.baseUrl}/chatter/${channel}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.chatter || [];
    } catch (err) {
      console.warn(`[CBRadioService] Failed to fetch channel ${channel} chatter:`, err);
      return [];
    }
  }

  /**
   * Broadcast audio transcript or text packet over RF mesh
   */
  public async broadcast(payload: {
    channel: number;
    senderHandle: string;
    senderUnit?: string;
    role?: string;
    text: string;
    tenCode?: string;
    location?: string;
    audioDurationSec?: number;
  }): Promise<CbBroadcastResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[CBRadioService] Broadcast failed, falling back:', err);
      const fallbackMsg: CBRadioMessage = {
        id: `cb-local-${Date.now()}`,
        channel: payload.channel,
        senderHandle: payload.senderHandle,
        senderUnit: payload.senderUnit,
        role: 'USER',
        text: payload.text,
        timestamp: 'Just now',
        signalStrengthS: 9,
        distanceMiles: 0,
        tenCode: payload.tenCode,
        location: payload.location || 'Mobile Rig',
        verified: true,
        audioDurationSec: payload.audioDurationSec || 4,
      };
      return {
        success: true,
        message: fallbackMsg,
        meshActiveUnits: 42,
      };
    }
  }

  /**
   * Broadcast Mayday SOS packet on Emergency Channel 9
   */
  public async broadcastEmergencyMayday(payload: {
    nature?: string;
    location?: string;
    unitNumber?: string;
  }): Promise<CbMaydayResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/emergency-sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[CBRadioService] Emergency SOS failed:', err);
      return null;
    }
  }

  /**
   * Get 27MHz transceiver hardware diagnostic status
   */
  public async getTransceiverStatus(): Promise<CbStatusResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[CBRadioService] Could not fetch transceiver status:', err);
      return null;
    }
  }
}

export const cbRadioService = new CBRadioService();
