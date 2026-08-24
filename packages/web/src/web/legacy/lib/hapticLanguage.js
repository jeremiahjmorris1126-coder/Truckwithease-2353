/**
 * Haptic Language Engine
 * Converts text, speech, and real-time communication into vibration patterns
 * that deaf drivers can "read" through touch. Bidirectional communication.
 */

// Vibration pattern structure: [duration_ms, pause_ms, repeat_count]
// Example: [100, 50, 2] = 100ms vibrate, 50ms pause, repeat 2x = "vi-bra-te"

const HAPTIC_ALPHABET = {
  // Emergency signals (high urgency)
  'DANGER': [500, 200, 3],           // long-long-long (SOS pattern)
  'ACCIDENT': [200, 100, 5],         // rapid-rapid-rapid-rapid-rapid
  'EMERGENCY': [1000, 500, 1],       // one long sustained pulse
  'STOP': [300, 100, 4],             // four quick pulses
  
  // Urgency levels (embedded in all messages)
  'CRITICAL': [400, 100, 3],         // three medium pulses = critical
  'HIGH': [300, 150, 2],             // two pulses = high priority
  'NORMAL': [150, 100, 1],           // one pulse = normal
  'LOW': [100, 200, 1],              // long pause after = low priority
  
  // Message types
  'LOAD_ASSIGNED': [100, 50, 2, 150, 100, 1],      // double-beat, pause, single (meaningful pattern)
  'BROKER_ALERT': [200, 100, 3, 150, 200, 2],      // three quick, pause, two medium (warning rhythm)
  'DISPATCH_CALL': [150, 100, 2, 100, 100, 2],     // pattern = incoming call
  'WEATHER_WARNING': [100, 100, 3, 200, 100, 1],   // variable = changing conditions
  'ROUTE_UPDATE': [100, 50, 1, 100, 50, 1, 100, 50, 1], // three singles = new info
  'MESSAGE_RECEIVED': [100, 100, 1],                // simple, like a bell
  
  // Direction/Navigation (spatial encoding)
  'TURN_LEFT': [200, 100, 1],       // one medium = left turn
  'TURN_RIGHT': [100, 100, 1],      // one short = right turn
  'GO_STRAIGHT': [150, 50, 1],      // one medium-short = straight
  'REVERSE': [100, 50, 2, 50, 100, 1], // short-short pattern = backing up
  
  // Action confirmations (driver responding)
  'ACK_YES': [100, 50, 2],          // two short = "yes, understood"
  'ACK_NO': [200, 200, 2],          // two long = "no, negative"
  'ACK_READY': [100, 50, 1, 100, 50, 1, 100, 50, 1], // three singles = "ready to go"
};

// Emotion/Tone encoding (overlaid on messages)
const HAPTIC_EMOTION = {
  'CALM': { intensity: 0.5, rhythm: 'steady' },      // smooth, even pulses
  'URGENT': { intensity: 1.0, rhythm: 'rapid' },     // fast, intense
  'CONFUSED': { intensity: 0.6, rhythm: 'irregular' }, // uneven timing
  'CONFIDENT': { intensity: 0.8, rhythm: 'steady' },   // strong and consistent
  'HESITANT': { intensity: 0.4, rhythm: 'slow' },      // slow, gentle
};

/**
 * Convert a text message to haptic pattern
 * @param {string} text - The message
 * @param {string} urgency - 'critical', 'high', 'normal', 'low'
 * @param {string} emotion - 'calm', 'urgent', 'confused', 'confident', 'hesitant'
 * @returns {object} - { pattern: array, duration: ms, description: string }
 */
export function textToHaptic(text, urgency = 'normal', emotion = 'calm') {
  let pattern = [];
  let totalDuration = 0;

  // Start with urgency marker
  if (HAPTIC_ALPHABET[urgency.toUpperCase()]) {
    pattern = [...HAPTIC_ALPHABET[urgency.toUpperCase()]];
  }

  // Determine base timing from emotion
  const emotionData = HAPTIC_EMOTION[emotion] || HAPTIC_EMOTION['calm'];
  const baseIntensity = emotionData.intensity;

  // Encode message type if it matches a known pattern
  const textUpper = text.toUpperCase();
  for (const [key, hapticPattern] of Object.entries(HAPTIC_ALPHABET)) {
    if (textUpper.includes(key)) {
      pattern = [...hapticPattern];
      break;
    }
  }

  // If no pattern matched, encode message length as morse-like rhythm
  if (pattern.length === 0) {
    const wordCount = text.split(' ').length;
    const charCount = text.length;

    // Long messages: short-long-short pattern (information incoming)
    // Short messages: just single or double pulse (quick info)
    if (charCount > 50) {
      pattern = [100, 50, 1, 200, 50, 1, 100, 50, 1]; // three-part = long message
    } else if (charCount > 20) {
      pattern = [100, 50, 1, 150, 50, 1]; // two-part = medium message
    } else {
      pattern = [100, 100, 1]; // one-part = short message
    }

    // Add intensity modifier for character length
    pattern = pattern.map(val => Math.round(val * baseIntensity));
  }

  // Calculate total duration
  totalDuration = pattern.reduce((a, b) => a + b, 0);

  return {
    pattern,
    duration: totalDuration,
    description: `${urgency} - ${emotion}`,
    text: text.substring(0, 50),
  };
}

/**
 * Create a haptic conversation pattern
 * Alternates between incoming and outgoing to create dialogue feel
 * @param {string} incomingText - Message from dispatcher/hearing person
 * @param {string} incomingUrgency - Urgency level of incoming
 * @returns {object} - { incoming: pattern, outgoing: pattern, both: pattern }
 */
export function createHapticDialogue(incomingText, incomingUrgency = 'normal') {
  const incomingPattern = textToHaptic(incomingText, incomingUrgency, 'calm');
  
  // Outgoing is always acknowledgment (deaf driver responding)
  const outgoingPattern = {
    pattern: [100, 50, 2], // two short = "I got it"
    duration: 250,
    description: 'acknowledgment',
  };

  // Combined pattern: incoming + pause + outgoing
  const combinedPattern = [
    ...incomingPattern.pattern,
    300, // long pause between messages
    ...outgoingPattern.pattern,
  ];

  return {
    incoming: incomingPattern,
    outgoing: outgoingPattern,
    both: { pattern: combinedPattern, duration: incomingPattern.duration + 300 + outgoingPattern.duration },
  };
}

/**
 * Trigger haptic feedback on device
 * Uses native Vibration API (all modern phones support this)
 * @param {array} pattern - Vibration pattern [vibrate_ms, pause_ms, ...]
 * @returns {boolean} - Success/failure
 */
export function triggerHaptic(pattern) {
  if (!navigator.vibrate) {
    console.warn('Haptic feedback not supported on this device');
    return false;
  }

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (err) {
    console.error('Haptic trigger failed:', err);
    return false;
  }
}

/**
 * Stop any ongoing haptic feedback
 */
export function stopHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
}

/**
 * Decode incoming haptic pattern and return what it means
 * (for educational/testing purposes)
 * @param {array} pattern - The vibration pattern received
 * @returns {string} - Best guess at meaning
 */
export function decodeHaptic(pattern) {
  if (!pattern || pattern.length === 0) return 'No pattern';

  const patternStr = pattern.join('-');

  // Check against known patterns
  for (const [key, knownPattern] of Object.entries(HAPTIC_ALPHABET)) {
    const knownStr = knownPattern.join('-');
    if (patternStr.includes(knownStr) || knownStr.includes(patternStr)) {
      return key;
    }
  }

  // Analyze pattern shape
  const totalOn = pattern.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const totalOff = pattern.filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0);
  const pulseCount = Math.ceil(pattern.length / 2);

  if (totalOn > 1000) return 'CRITICAL';
  if (pulseCount > 4) return 'RAPID_ALERT';
  if (totalOff > totalOn * 2) return 'SLOW_INFO';
  return 'COMMUNICATION';
}

/**
 * Convert speech/voice to haptic
 * Analyzes speech characteristics and creates matching haptic rhythm
 * @param {string} audioText - Transcribed text from speech
 * @param {number} speechRate - Words per minute (typically 120-150)
 * @param {string} tone - 'urgent', 'calm', 'questioning'
 * @returns {object} - Haptic pattern
 */
export function speechToHaptic(audioText, speechRate = 130, tone = 'calm') {
  const wordCount = audioText.split(' ').length;
  const estimatedDuration = (wordCount / speechRate) * 60000; // ms

  // Map speech characteristics to haptic intensity
  const intensity = tone === 'urgent' ? 1.0 : tone === 'questioning' ? 0.7 : 0.6;
  
  // Create rhythm that matches speech pacing
  const basePulseDuration = Math.round(100 * intensity);
  const pauseDuration = Math.round(50 * intensity);
  
  // Build pattern proportional to speech length
  const patternLength = Math.min(Math.ceil(wordCount / 2), 10);
  let pattern = [];
  for (let i = 0; i < patternLength; i++) {
    pattern.push(basePulseDuration, pauseDuration);
  }

  return {
    pattern,
    duration: pattern.reduce((a, b) => a + b, 0),
    speechRate,
    tone,
    description: `Voice: ${audioText.substring(0, 40)}...`,
  };
}

/**
 * Create bidirectional haptic exchange
 * Deaf driver can "send" a haptic response that hearing drivers receive as tone
 * @param {array} hapticPattern - The pattern deaf driver "sends"
 * @returns {object} - Encoded meaning + tone description for hearing side
 */
export function hapticToTone(hapticPattern) {
  const meaning = decodeHaptic(hapticPattern);
  const duration = hapticPattern.reduce((a, b) => a + b, 0);
  const pulseCount = Math.ceil(hapticPattern.length / 2);
  
  // Map haptic characteristics to vocal tone for hearing driver
  let tone = 'neutral';
  if (pulseCount > 5) tone = 'urgent';
  else if (pulseCount === 1) tone = 'acknowledgment';
  else if (duration > 500) tone = 'emphasis';

  return {
    meaning,
    tone,
    intensity: pulseCount,
    description: `[HAPTIC MESSAGE]: ${meaning} (${tone} tone)`,
  };
}

/**
 * Library of common trucking-specific patterns
 * Pre-built for instant use
 */
export const TRUCKING_PATTERNS = {
  'LOAD_READY': [100, 50, 2, 150, 50, 1, 100, 50, 1],        // Load is prepared
  'DISPATCH_INCOMING': [200, 100, 1, 150, 100, 1],           // New dispatch call
  'BROKER_FLAGGED': [200, 100, 3],                           // Broker warning (three pulses)
  'FUEL_ALERT': [150, 100, 2, 200, 100, 1],                  // Need fuel soon
  'HOS_WARNING': [100, 50, 3, 100, 50, 1],                   // Hours of service warning
  'ARRIVAL_APPROACHING': [100, 100, 1, 150, 50, 1, 100, 100, 1], // Near destination
  'DELIVERY_COMPLETE': [100, 50, 1, 100, 50, 1, 100, 50, 1, 200, 100, 2], // Success pattern
  'BREAKDOWN_ALERT': [500, 200, 2],                          // Vehicle breakdown
  'WEATHER_SEVERE': [200, 100, 4, 100, 100, 1],              // Severe weather ahead
  'TOLL_AHEAD': [150, 100, 1, 150, 100, 1],                  // Toll approaching
  'REST_AREA_NEXT_EXIT': [100, 50, 2, 100, 50, 2],           // Rest stop nearby
  'ALL_CLEAR': [100, 50, 1, 100, 50, 1, 100, 50, 1, 100, 50, 1], // Safe to proceed
};
