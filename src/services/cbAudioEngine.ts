// ============================================================================
// CB RADIO AUDIO ENGINE & MICROPHONE DSP SERVICE
// Web Audio API & Speech Synthesis / Speech Recognition for authentic CB Transceiver
// Includes Squelch Noise, Bandpass Filters, Roger Beeps, Mic Clicks & Spectrum Analyzers
// ============================================================================

export interface CBAudioEngineState {
  isMicActive: boolean;
  isTransmitting: boolean;
  isReceiving: boolean;
  squelchLevel: number; // 0 to 100
  volumeLevel: number; // 0 to 100
  rfGainLevel: number; // 0 to 100
  micGainLevel: number; // 0 to 100
  noiseBlanker: boolean;
  rogerBeepEnabled: boolean;
  audioModulationRms: number; // 0 to 1
  signalStrengthS: number; // 0 to 9 (+30)
  swrRatio: number; // 1.0 to 3.0
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}

class CBAudioEngine {
  private audioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private micBandpassFilter: BiquadFilterNode | null = null;
  private micGainNode: GainNode | null = null;
  private micAnalyser: AnalyserNode | null = null;

  // Master output & squelch noise
  private masterGainNode: GainNode | null = null;
  private squelchGainNode: GainNode | null = null;
  private noiseSourceNode: AudioBufferSourceNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  // Speech Recognition
  private recognition: any = null;
  private isSpeechRecognizing = false;

  // State
  private squelchThreshold = 35; // 0-100
  private volume = 75; // 0-100
  private micGain = 80; // 0-100
  private rfGain = 90; // 0-100
  private rogerBeep = true;
  private noiseBlanker = true;

  private isTransmitting = false;
  private isReceiving = false;
  private currentRms = 0;
  private animFrameId: number | null = null;

  // Callbacks
  private onStateChangeCallbacks: Set<(state: Partial<CBAudioEngineState>) => void> = new Set();
  private onTranscriptCallbacks: Set<(text: string, isFinal: boolean) => void> = new Set();

  constructor() {
    // Lazy init audio context on first user interaction
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public subscribe(cb: (state: Partial<CBAudioEngineState>) => void) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  public onTranscript(cb: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallbacks.add(cb);
    return () => this.onTranscriptCallbacks.delete(cb);
  }

  // ==========================================
  // MICROPHONE CAPTURE & DSP CHAIN
  // ==========================================
  public async startMicrophone(): Promise<boolean> {
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // keep authentic ambient radio feel
          autoGainControl: true,
        },
      });

      this.micStream = stream;
      this.micSourceNode = this.audioCtx.createMediaStreamSource(stream);

      // CB Carbon / Dynamic Mic 300Hz-3.2kHz Bandpass Filter
      this.micBandpassFilter = this.audioCtx.createBiquadFilter();
      this.micBandpassFilter.type = 'bandpass';
      this.micBandpassFilter.frequency.value = 1750; // Center freq
      this.micBandpassFilter.Q.value = 1.2;

      // Mic Gain
      this.micGainNode = this.audioCtx.createGain();
      this.micGainNode.gain.value = this.micGain / 50;

      // Mic Analyser for real-time VU meter & scope
      this.micAnalyser = this.audioCtx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.6;

      this.micSourceNode.connect(this.micBandpassFilter);
      this.micBandpassFilter.connect(this.micGainNode);
      this.micGainNode.connect(this.micAnalyser);

      this.startAnalyserLoop();
      this.initSpeechRecognition();

      return true;
    } catch (err) {
      console.warn('[CB Radio] Microphone access not granted or unavailable:', err);
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopSpeechRecognition();
  }

  // ==========================================
  // PUSH-TO-TALK (PTT) TRANSMISSION CONTROLS
  // ==========================================
  public startTransmission() {
    this.initAudioContext();
    this.isTransmitting = true;
    this.playMicClickSound(true);

    if (this.recognition && !this.isSpeechRecognizing) {
      try {
        this.recognition.start();
        this.isSpeechRecognizing = true;
      } catch {
        // Recognition already running or error
      }
    }

    this.notifyState();
  }

  public stopTransmission() {
    this.isTransmitting = false;
    this.playMicClickSound(false);

    if (this.rogerBeep) {
      setTimeout(() => {
        this.playRogerBeepSound();
      }, 80);
    }

    if (this.recognition && this.isSpeechRecognizing) {
      try {
        this.recognition.stop();
        this.isSpeechRecognizing = false;
      } catch {
        // Ignore
      }
    }

    this.notifyState();
  }

  // ==========================================
  // SYNTHESIZED SOUND EFFECTS
  // ==========================================
  public playMicClickSound(isKeyDown: boolean) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = isKeyDown ? 600 : 450;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isKeyDown ? 180 : 120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

    gain.gain.setValueAtTime((this.volume / 100) * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playRogerBeepSound() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Classic 1000Hz K-Tone Roger Beep with slight tone shift
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);
    osc.frequency.setValueAtTime(1000, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime((this.volume / 100) * 0.4, now + 0.01);
    gain.gain.setValueAtTime((this.volume / 100) * 0.4, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playSquelchTail(durationMs: number = 220) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Generate white noise burst
    const bufferSize = this.audioCtx.sampleRate * (durationMs / 1000);
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.0;

    const gain = this.audioCtx.createGain();
    const vol = (this.volume / 100) * 0.25;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + durationMs / 1000);
  }

  // ==========================================
  // INCOMING VOICE CHATTER / SPEECH SYNTHESIS
  // ==========================================
  public speakIncomingMessage(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Play squelch burst before message
    this.playSquelchTail(160);

    this.isReceiving = true;
    this.notifyState();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Quick trucker cadence
      utterance.pitch = 0.95;

      // Pick standard male/female english voice
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google')) || voices[0];
      if (usVoice) utterance.voice = usVoice;

      utterance.onend = () => {
        this.isReceiving = false;
        if (this.rogerBeep) {
          this.playRogerBeepSound();
        } else {
          this.playSquelchTail(120);
        }
        this.notifyState();
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isReceiving = false;
        this.notifyState();
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    }, 200);
  }

  // ==========================================
  // SPEECH RECOGNITION (VOICE TRANSCRIPTION)
  // ==========================================
  private initSpeechRecognition() {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const text = final || interim;
        this.onTranscriptCallbacks.forEach((cb) => cb(text, !!final));
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('[CB Speech Recognition]', event.error);
        }
      };

      this.recognition.onend = () => {
        this.isSpeechRecognizing = false;
      };
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
    }
  }

  private stopSpeechRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.isSpeechRecognizing = false;
      } catch {}
    }
  }

  // ==========================================
  // REAL-TIME VISUALIZER LOOP
  // ==========================================
  private startAnalyserLoop() {
    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);

    const updateLoop = () => {
      let rms = 0;

      if (this.isTransmitting && this.micAnalyser) {
        this.micAnalyser.getByteFrequencyData(freqData);
        this.micAnalyser.getByteTimeDomainData(timeData);

        // Compute RMS
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sum += norm * norm;
        }
        rms = Math.min(1, Math.sqrt(sum / timeData.length) * (this.micGain / 50));
      } else if (this.isReceiving) {
        // Simulated incoming signal fluctuation
        rms = 0.5 + Math.random() * 0.35;
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.floor(100 + Math.random() * 140);
          timeData[i] = Math.floor(128 + (Math.random() * 40 - 20));
        }
      } else {
        // Ambient background noise based on squelch vs rfGain
        const squelchOpen = this.squelchThreshold < 20;
        const baseNoise = squelchOpen ? 0.08 + Math.random() * 0.06 : 0.01;
        rms = baseNoise;
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = squelchOpen ? Math.floor(Math.random() * 40) : 0;
          timeData[i] = 128;
        }
      }

      this.currentRms = rms;

      // Compute Signal Strength S-meter (0 to 9 +30dB)
      let sUnit = 0;
      if (this.isTransmitting) {
        sUnit = 9 + rms * 3; // Red zone on transmit (Power PEP)
      } else if (this.isReceiving) {
        sUnit = 7 + rms * 4;
      } else {
        sUnit = Math.max(0, (100 - this.squelchThreshold) / 25);
      }

      const swr = this.isTransmitting ? 1.1 + (1 - this.micGain / 100) * 0.3 : 1.0;

      const state: CBAudioEngineState = {
        isMicActive: !!this.micStream,
        isTransmitting: this.isTransmitting,
        isReceiving: this.isReceiving,
        squelchLevel: this.squelchThreshold,
        volumeLevel: this.volume,
        rfGainLevel: this.rfGain,
        micGainLevel: this.micGain,
        noiseBlanker: this.noiseBlanker,
        rogerBeepEnabled: this.rogerBeep,
        audioModulationRms: rms,
        signalStrengthS: Math.min(12, sUnit),
        swrRatio: parseFloat(swr.toFixed(2)),
        frequencyData: freqData,
        timeDomainData: timeData,
      };

      this.onStateChangeCallbacks.forEach((cb) => cb(state));
      this.animFrameId = requestAnimationFrame(updateLoop);
    };

    updateLoop();
  }

  // ==========================================
  // HARDWARE KNOB / SWITCH SETTERS
  // ==========================================
  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(100, val));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.volume / 100;
    }
  }

  public setSquelch(val: number) {
    this.squelchThreshold = Math.max(0, Math.min(100, val));
  }

  public setMicGain(val: number) {
    this.micGain = Math.max(0, Math.min(100, val));
    if (this.micGainNode) {
      this.micGainNode.gain.value = this.micGain / 50;
    }
  }

  public setRfGain(val: number) {
    this.rfGain = Math.max(0, Math.min(100, val));
  }

  public toggleRogerBeep() {
    this.rogerBeep = !this.rogerBeep;
    return this.rogerBeep;
  }

  public toggleNoiseBlanker() {
    this.noiseBlanker = !this.noiseBlanker;
    return this.noiseBlanker;
  }

  private notifyState() {
    // Immediate callback trigger
    this.onStateChangeCallbacks.forEach((cb) =>
      cb({
        isTransmitting: this.isTransmitting,
        isReceiving: this.isReceiving,
        rogerBeepEnabled: this.rogerBeep,
        noiseBlanker: this.noiseBlanker,
        volumeLevel: this.volume,
        squelchLevel: this.squelchThreshold,
        micGainLevel: this.micGain,
        rfGainLevel: this.rfGain,
      })
    );
  }
}

export const cbAudioEngine = new CBAudioEngine();
