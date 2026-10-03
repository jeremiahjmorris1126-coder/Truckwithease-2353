// ============================================================================
// DVIR AUTONOMOUS AGENT VOICE COMMAND & FIELD POPULATION SERVICE
// Enables drivers to populate DVIR fields, log component defects across axles,
// set odometer, unit/trailer IDs, switch inspection types, and sign via voice.
// ============================================================================

export type DvirVoiceActionType =
  | 'RECORD_DEFECT'
  | 'PASS_ITEM'
  | 'PASS_ZONE'
  | 'PASS_ALL'
  | 'SET_FIELD'
  | 'SWITCH_INSPECTION_TYPE'
  | 'SWITCH_ZONE'
  | 'SIGN_INSPECTION'
  | 'NAVIGATE_VIEW';

export interface DvirVoiceAction {
  id: string;
  actionType: DvirVoiceActionType;
  timestamp: string;
  spokenPhrase: string;
  summaryLabel: string;
  spokenResponse: string;
  field?: 'unitNumber' | 'trailerNumber' | 'odometer' | 'driverName' | 'driverNotes' | 'signatureName';
  fieldValue?: string | number;
  zoneIndex?: number;
  zoneTitle?: string;
  itemId?: string;
  itemName?: string;
  severity?: 'OUT_OF_SERVICE' | 'SAFETY_DEFECT' | 'MINOR_COSMETIC';
  defectNote?: string;
  fmcsaStatute?: string;
  targetView?: 'INSPECTION' | 'PRIOR_MEMORY' | 'DISPATCH_WIRE' | 'ROADSIDE_RESCUE' | 'HISTORY_LOGS';
  inspectionType?: 'PRE_TRIP' | 'POST_TRIP';
}

const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

/**
 * Normalizes number words in phrase (e.g. "axle three" -> "axle 3")
 */
function normalizeNumberWords(str: string): string {
  let res = str;
  Object.entries(WORD_TO_NUMBER).forEach(([word, num]) => {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    res = res.replace(reg, String(num));
  });
  return res;
}

/**
 * Parses raw voice transcript and matches it to a specific DVIR action & field update.
 */
export function parseDvirVoiceCommand(spokenRaw: string): DvirVoiceAction | null {
  const original = spokenRaw.trim();
  const clean = normalizeNumberWords(spokenRaw.toLowerCase().trim());
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // --------------------------------------------------------------------------
  // 1. SET UNIT NUMBER (e.g. "Set unit number to 104-E", "Unit number 205", "Tractor 104")
  // --------------------------------------------------------------------------
  const unitMatch = clean.match(/(?:set|change|update)?\s*(?:unit|tractor|truck)\s*(?:number|no|id|#)?\s*(?:to|is|=)?\s*([a-z0-9#-]+)/i);
  if (unitMatch && (clean.includes('unit') || clean.includes('tractor') || clean.includes('truck')) && !clean.includes('tire') && !clean.includes('axle')) {
    const val = unitMatch[1].toUpperCase().startsWith('UNIT') ? unitMatch[1].toUpperCase() : `UNIT #${unitMatch[1].toUpperCase().replace(/^#/, '')}`;
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SET_FIELD',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: `DVIR Unit: ${val}`,
      spokenResponse: `Updated DVIR unit number to ${val}.`,
      field: 'unitNumber',
      fieldValue: val,
    };
  }

  // --------------------------------------------------------------------------
  // 2. SET TRAILER NUMBER (e.g. "Set trailer number to TRL-5390", "Trailer 5390", "Trailer TRL-440")
  // --------------------------------------------------------------------------
  const trailerMatch = clean.match(/(?:set|change|update)?\s*trailer\s*(?:number|no|id|#)?\s*(?:to|is|=)?\s*([a-z0-9#-]+)/i);
  if (trailerMatch && clean.includes('trailer') && !clean.includes('tire') && !clean.includes('tandem') && !clean.includes('brake') && !clean.includes('axle')) {
    const rawVal = trailerMatch[1].toUpperCase().replace(/^#/, '');
    const val = rawVal.startsWith('TRL-') ? rawVal : `TRL-${rawVal}`;
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SET_FIELD',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: `DVIR Trailer: ${val}`,
      spokenResponse: `Updated DVIR trailer number to ${val}.`,
      field: 'trailerNumber',
      fieldValue: val,
    };
  }

  // --------------------------------------------------------------------------
  // 3. SET ODOMETER (e.g. "Set odometer to 143210", "Odometer 145,000", "Mileage 148200")
  // --------------------------------------------------------------------------
  const odoMatch = clean.match(/(?:set|change|update|current)?\s*(?:odometer|mileage|miles|odo)\s*(?:to|is|=)?\s*([0-9,]+)/i);
  if (odoMatch && (clean.includes('odometer') || clean.includes('mileage') || clean.includes('odo'))) {
    const parsedNum = parseInt(odoMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'SET_FIELD',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: `DVIR Odometer: ${parsedNum.toLocaleString()} mi`,
        spokenResponse: `Recorded DVIR odometer at ${parsedNum.toLocaleString()} miles.`,
        field: 'odometer',
        fieldValue: parsedNum,
      };
    }
  }

  // --------------------------------------------------------------------------
  // 4. SET DRIVER NAME (e.g. "Set driver name to Marcus Bell", "Driver name Elena Rostova")
  // --------------------------------------------------------------------------
  const driverMatch = clean.match(/(?:set|change|update)?\s*driver\s*name\s*(?:to|is|=)?\s*([a-z\s]+)/i);
  if (driverMatch && clean.includes('driver name')) {
    const nameVal = driverMatch[1]
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim();
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SET_FIELD',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: `DVIR Driver: ${nameVal}`,
      spokenResponse: `Updated DVIR driver name and digital certification to ${nameVal}.`,
      field: 'driverName',
      fieldValue: nameVal,
    };
  }

  // --------------------------------------------------------------------------
  // 5. ADD DRIVER NOTE / REMARK (e.g. "Add driver note: completed walkaround, tire replaced")
  // --------------------------------------------------------------------------
  const noteMatch = clean.match(/(?:add|set|record|write)?\s*(?:driver\s*)?(?:note|notes|remark|remarks|comment)\s*(?:to|is|:|that)?\s*(.+)/i);
  if (noteMatch && (clean.includes('note') || clean.includes('remark') || clean.includes('comment')) && !clean.includes('defect') && !clean.includes('flat') && !clean.includes('brake')) {
    const noteText = noteMatch[1].trim();
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SET_FIELD',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: `DVIR Driver Note: "${noteText}"`,
      spokenResponse: `Recorded driver remark on inspection ledger.`,
      field: 'driverNotes',
      fieldValue: noteText,
    };
  }

  // --------------------------------------------------------------------------
  // 6. SWITCH INSPECTION TYPE (Pre-Trip vs Post-Trip)
  // --------------------------------------------------------------------------
  if (clean.includes('pre trip') || clean.includes('pretrip') || clean.includes('start pre') || clean.includes('begin pre')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SWITCH_INSPECTION_TYPE',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR Mode: PRE-TRIP Walkaround',
      spokenResponse: 'Pre-trip inspection initiated. Zone 1: Engine Compartment & Steer Axle active.',
      inspectionType: 'PRE_TRIP',
      zoneIndex: 0,
      zoneTitle: 'Engine Compartment & Steer Axle',
    };
  }

  if (clean.includes('post trip') || clean.includes('posttrip') || clean.includes('start post') || clean.includes('end of day dvir') || clean.includes('post trip inspection')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SWITCH_INSPECTION_TYPE',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR Mode: POST-TRIP Walkaround',
      spokenResponse: 'Post-trip inspection initiated. Inspecting all 6 FMCSA walk-around zones.',
      inspectionType: 'POST_TRIP',
      zoneIndex: 0,
      zoneTitle: 'Engine Compartment & Steer Axle',
    };
  }

  // --------------------------------------------------------------------------
  // 7. SPECIFIC COMPONENT DEFECTS & AXLE POPULATION
  // --------------------------------------------------------------------------

  // A. TIRE DEFECTS ON SPECIFIC AXLES (e.g. "Record a flat tire on axle three", "Flat tire on axle 3", "Drive axle flat tire", "Steer tire flat")
  if (
    clean.includes('flat tire') ||
    clean.includes('tire flat') ||
    clean.includes('blowout') ||
    clean.includes('tire blowout') ||
    clean.includes('low tire') ||
    clean.includes('tire tread') ||
    clean.includes('tire pressure') ||
    clean.includes('damaged tire') ||
    clean.includes('tire damage') ||
    (clean.includes('tire') && (clean.includes('record') || clean.includes('defect') || clean.includes('flat') || clean.includes('leak') || clean.includes('broken')))
  ) {
    // Determine axle number or location
    let targetAxle = 3; // default drive axle if unspecified but mentioned axle
    let isSteer = clean.includes('steer') || clean.includes('front') || clean.includes('axle 1') || clean.includes('axle one');
    let isDrive = clean.includes('drive') || clean.includes('tractor') || clean.includes('axle 2') || clean.includes('axle 3') || clean.includes('axle two') || clean.includes('axle three');
    let isTrailer = clean.includes('trailer') || clean.includes('tandem') || clean.includes('rear') || clean.includes('axle 4') || clean.includes('axle 5') || clean.includes('axle four') || clean.includes('axle five');

    if (clean.includes('axle 1')) {
      targetAxle = 1;
      isSteer = true;
    } else if (clean.includes('axle 2')) {
      targetAxle = 2;
      isDrive = true;
    } else if (clean.includes('axle 3')) {
      targetAxle = 3;
      isDrive = true;
    } else if (clean.includes('axle 4')) {
      targetAxle = 4;
      isTrailer = true;
    } else if (clean.includes('axle 5')) {
      targetAxle = 5;
      isTrailer = true;
    }

    if (isSteer) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Steer Axle 1 Tire Failure',
        spokenResponse: 'Logged Out-of-Service defect: Flat tire on Steer Axle 1 (Zone 1). 49 CFR § 393.75 violation logged. Dispatch notified.',
        zoneIndex: 0,
        zoneTitle: 'Engine Compartment & Steer Axle',
        itemId: 'chk-1-6',
        itemName: 'Steer Tires (Tread Depth >= 4/32", Wheels & Lug Nuts)',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Steer Axle 1 Tire flat / tread failure reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.75 (Steer Axle Tires)',
      };
    } else if (isTrailer) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: `DVIR Defect: Trailer Tandem Axle ${targetAxle >= 4 ? targetAxle : '4/5'} Tire Failure`,
        spokenResponse: `Logged Out-of-Service defect: Flat tire on Trailer Tandem Axle ${targetAxle >= 4 ? targetAxle : 4} in Zone 5. Marked on inspection ledger.`,
        zoneIndex: 4,
        zoneTitle: 'Trailer Tandem Axles & Brakes',
        itemId: 'chk-5-3',
        itemName: 'Trailer Wheel Hubs, Oil Caps & Tire Inflation',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Trailer Tandem Axle ${targetAxle} tire flat / pressure loss reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.75 (Trailer Tires & Hubs)',
      };
    } else {
      // Default / Drive Axle 2 or 3
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: `DVIR Defect: Drive Axle ${targetAxle} Flat Tire`,
        spokenResponse: `Logged Out-of-Service defect: Flat tire on Drive Axle ${targetAxle} in Zone 3. Flagged for dispatch and roadside assistance.`,
        zoneIndex: 2,
        zoneTitle: 'Coupling Devices & Tractor Drive Tandems',
        itemId: 'chk-3-4',
        itemName: 'Drive Axle Tires (Tread Depth >= 2/32", Dual Spacing)',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Drive Axle ${targetAxle} flat tire / blowout reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.75 (Drive Axle Tires)',
      };
    }
  }

  // B. BRAKE SYSTEM DEFECTS & AIR LEAKS (e.g. "Record brake leak on axle three", "Gladhand leaking", "Brake chamber cracked")
  if (
    clean.includes('brake leak') ||
    clean.includes('air leak') ||
    clean.includes('brake chamber') ||
    clean.includes('slack adjuster') ||
    clean.includes('gladhand') ||
    clean.includes('brake hose') ||
    clean.includes('low air buzzer') ||
    (clean.includes('brake') && (clean.includes('defect') || clean.includes('fail') || clean.includes('broken') || clean.includes('record') || clean.includes('bad')))
  ) {
    if (clean.includes('gladhand') || clean.includes('air line') || clean.includes('7 way') || clean.includes('7-way') || clean.includes('cable')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Air Lines & Gladhands Leak',
        spokenResponse: 'Logged Out-of-Service defect: Air line or gladhand coupling leak in Zone 3.',
        zoneIndex: 2,
        zoneTitle: 'Coupling Devices & Tractor Drive Tandems',
        itemId: 'chk-3-3',
        itemName: 'Air Lines, Gladhands & 7-Way Electrical Cable',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Gladhand rubber seal / air line leak reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.45',
      };
    } else if (clean.includes('buzzer') || clean.includes('warning light') || clean.includes('compressor') || clean.includes('build rate')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: In-Cab Air Warning / Compressor',
        spokenResponse: 'Logged Safety Defect: Low air warning buzzer or compressor build rate failure in Zone 2.',
        zoneIndex: 1,
        zoneTitle: 'In-Cab Controls, Air System & Emergency Gear',
        itemId: 'chk-2-2',
        itemName: 'Low Air Warning Buzzer & Visual Light Activation',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: In-cab air warning system failure reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.51',
      };
    } else if (clean.includes('trailer') || clean.includes('axle 4') || clean.includes('axle 5')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Trailer Tandem Brakes & Slack Adjuster',
        spokenResponse: 'Logged Out-of-Service defect: Trailer brake chamber or slack adjuster fault in Zone 5.',
        zoneIndex: 4,
        zoneTitle: 'Trailer Tandem Axles & Brakes',
        itemId: 'chk-5-2',
        itemName: 'Trailer Brake Chambers, Hoses & Slack Adjusters',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Trailer brake chamber stroke / hose leak reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.47',
      };
    } else {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Steer Axle Brakes & Pushrod Stroke',
        spokenResponse: 'Logged Out-of-Service defect: Steer axle brake or pushrod stroke fault in Zone 1.',
        zoneIndex: 0,
        zoneTitle: 'Engine Compartment & Steer Axle',
        itemId: 'chk-1-5',
        itemName: 'Steer Axle Brakes, Drums & Slack Adjusters',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Steer axle brake lining / slack adjuster defect reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.47',
      };
    }
  }

  // C. LIGHTING & ELECTRICAL (e.g. "Record broken headlight", "Left turn signal out", "Brake light not working", "Marker lamp out")
  if (
    clean.includes('headlight') ||
    clean.includes('head lamp') ||
    clean.includes('turn signal') ||
    clean.includes('brake light') ||
    clean.includes('tail light') ||
    clean.includes('marker light') ||
    clean.includes('clearance light') ||
    clean.includes('hazard flasher') ||
    clean.includes('license plate light') ||
    (clean.includes('light') && (clean.includes('defect') || clean.includes('out') || clean.includes('broken') || clean.includes('record') || clean.includes('failed')))
  ) {
    if (clean.includes('tail') || clean.includes('brake light') || clean.includes('stop light') || clean.includes('flasher') || clean.includes('hazard')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Rear Tail & Brake Lamp Failure',
        spokenResponse: 'Logged Out-of-Service defect: Rear brake or hazard flasher lamps inoperative in Zone 6.',
        zoneIndex: 5,
        zoneTitle: 'Full Vehicle Lighting & Rear Clearance Circuit',
        itemId: 'chk-6-3',
        itemName: 'Rear Tail, Brake (Stop) & 4-Way Hazard Flashers',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Rear tail / brake light inoperative reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.9 & § 393.11',
      };
    } else if (clean.includes('marker') || clean.includes('clearance') || clean.includes('roof')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Cab Clearance & Marker Lamps',
        spokenResponse: 'Logged Safety Defect: Roof marker or clearance light out in Zone 6.',
        zoneIndex: 5,
        zoneTitle: 'Full Vehicle Lighting & Rear Clearance Circuit',
        itemId: 'chk-6-2',
        itemName: 'Cab Clearance, Roof Marker & Identification Lamps',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Roof clearance / marker lamp burned out reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.11',
      };
    } else {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Headlights & Front Turn Signals',
        spokenResponse: 'Logged Out-of-Service defect: Low beam / high beam headlight or turn signal failure in Zone 6.',
        zoneIndex: 5,
        zoneTitle: 'Full Vehicle Lighting & Rear Clearance Circuit',
        itemId: 'chk-6-1',
        itemName: 'Low & High Beam Headlights, Fog Lamps & Turn Signals',
        severity: 'OUT_OF_SERVICE',
        defectNote: `Voice Defect: Headlight / turn signal failure reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.9',
      };
    }
  }

  // D. ENGINE FLUIDS & BELTS (e.g. "Record oil leak", "Coolant leak", "Frayed belt", "Power steering leak")
  if (clean.includes('oil leak') || clean.includes('coolant leak') || clean.includes('fluid leak') || clean.includes('belt') || clean.includes('hose leak') || clean.includes('water pump')) {
    if (clean.includes('belt') || clean.includes('pulley') || clean.includes('tensioner') || clean.includes('hose')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Drive Belts & Hoses',
        spokenResponse: 'Logged Safety Defect: Alternator or water pump belt / hose defect in Zone 1.',
        zoneIndex: 0,
        zoneTitle: 'Engine Compartment & Steer Axle',
        itemId: 'chk-1-2',
        itemName: 'Drive Belts & Hoses (Alternator, Water Pump, Fan Clutch)',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Frayed drive belt / radiator hose leak reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 396.11',
      };
    } else {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Engine Fluid Levels & Active Leak',
        spokenResponse: 'Logged Safety Defect: Active engine oil, coolant, or power steering leak in Zone 1.',
        zoneIndex: 0,
        zoneTitle: 'Engine Compartment & Steer Axle',
        itemId: 'chk-1-1',
        itemName: 'Engine Fluid Levels (Oil, Coolant, Power Steering)',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Engine fluid leak / low level reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 396.11',
      };
    }
  }

  // E. 5TH WHEEL & COUPLING (e.g. "Fifth wheel jaws open", "Sliding pin retracted", "Fifth wheel loose")
  if (clean.includes('fifth wheel') || clean.includes('5th wheel') || clean.includes('kingpin') || clean.includes('skid plate') || clean.includes('locking pin') || clean.includes('slider pin')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'RECORD_DEFECT',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR Defect: 5th Wheel & Kingpin Locking Jaws',
      spokenResponse: 'Logged Critical Out-of-Service defect: 5th Wheel coupling mechanism failure in Zone 3.',
      zoneIndex: 2,
      zoneTitle: 'Coupling Devices & Tractor Drive Tandems',
      itemId: 'chk-3-1',
      itemName: 'Fifth Wheel Skid Plate & Kingpin Locking Jaws',
      severity: 'OUT_OF_SERVICE',
      defectNote: `Voice Defect: Fifth wheel locking jaws or release handle defect reported by driver ("${original}").`,
      fmcsaStatute: '49 CFR § 393.70 (Coupling Devices)',
    };
  }

  // F. TRAILER BODY & CARGO (e.g. "Landing gear broken", "Cargo door unlatched", "Bolt seal broken", "Trailer side panel")
  if (clean.includes('landing gear') || clean.includes('cargo door') || clean.includes('bolt seal') || clean.includes('conspicuity tape') || clean.includes('reflective tape')) {
    if (clean.includes('landing gear') || clean.includes('crank handle')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Trailer Landing Gear',
        spokenResponse: 'Logged Safety Defect: Landing gear or crank handle mechanism in Zone 4.',
        zoneIndex: 3,
        zoneTitle: 'Trailer Body, Cargo & Landing Gear',
        itemId: 'chk-4-1',
        itemName: 'Trailer Landing Gear, Crank Handle & Crossmembers',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Landing gear crank / support leg issue reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.100',
      };
    } else {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Cargo Doors & Security Seal',
        spokenResponse: 'Logged Safety Defect: Rear cargo door hinges, lock bar, or seal in Zone 4.',
        zoneIndex: 3,
        zoneTitle: 'Trailer Body, Cargo & Landing Gear',
        itemId: 'chk-4-3',
        itemName: 'Cargo Doors, Lock Bars, Hinges & Security Seal',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Rear cargo door / lock bar defect reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.100',
      };
    }
  }

  // G. IN-CAB EMERGENCY GEAR (e.g. "Fire extinguisher missing", "Cracked windshield", "Wipers torn", "Triangles missing")
  if (clean.includes('fire extinguisher') || clean.includes('windshield') || clean.includes('wiper') || clean.includes('triangle') || clean.includes('emergency gear')) {
    if (clean.includes('fire extinguisher') || clean.includes('triangle') || clean.includes('fuse')) {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Fire Extinguisher & Safety Gear',
        spokenResponse: 'Logged Safety Defect: Fire extinguisher, reflective triangles, or spare fuses in Zone 2.',
        zoneIndex: 1,
        zoneTitle: 'In-Cab Controls, Air System & Emergency Gear',
        itemId: 'chk-2-5',
        itemName: 'Fire Extinguisher, Emergency Triangles & Spare Fuses',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Missing / discharged fire extinguisher or safety triangles reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.95 (Emergency Equipment)',
      };
    } else {
      return {
        id: `dvir-voice-${Date.now()}`,
        actionType: 'RECORD_DEFECT',
        timestamp: nowStr,
        spokenPhrase: original,
        summaryLabel: 'DVIR Defect: Windshield Glass & Wipers',
        spokenResponse: 'Logged Safety Defect: Windshield crack or wiper blade failure in Zone 2.',
        zoneIndex: 1,
        zoneTitle: 'In-Cab Controls, Air System & Emergency Gear',
        itemId: 'chk-2-4',
        itemName: 'Windshield, Defroster, Wipers & Mirrors',
        severity: 'SAFETY_DEFECT',
        defectNote: `Voice Defect: Windshield wiper / glass visibility defect reported by driver ("${original}").`,
        fmcsaStatute: '49 CFR § 393.60 & § 393.78',
      };
    }
  }

  // --------------------------------------------------------------------------
  // 8. PASS ACTIONS (e.g. "Pass zone", "Pass all items in zone", "Pass entire inspection", "Clear defects")
  // --------------------------------------------------------------------------
  if (
    clean.includes('pass all') ||
    clean.includes('pass entire') ||
    clean.includes('clear all defects') ||
    clean.includes('all items passed') ||
    clean.includes('all clean') ||
    clean.includes('no defects found')
  ) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'PASS_ALL',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR: All 6 Inspection Zones Passed Clean',
      spokenResponse: 'All 6 walkaround zones verified clean. Zero safety defects flagged.',
    };
  }

  if (clean.includes('pass zone') || clean.includes('zone passed') || clean.includes('clear zone') || clean.includes('zone is good')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'PASS_ZONE',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR: Current Zone Passed',
      spokenResponse: 'Current inspection zone passed without defects. Advancing to next walkaround zone.',
    };
  }

  // --------------------------------------------------------------------------
  // 9. SIGN & CERTIFY DVIR
  // --------------------------------------------------------------------------
  if (
    clean.includes('sign dvir') ||
    clean.includes('submit dvir') ||
    clean.includes('certify dvir') ||
    clean.includes('sign inspection') ||
    clean.includes('complete dvir') ||
    clean.includes('sign and submit')
  ) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'SIGN_INSPECTION',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR: Certified & Signed Electronically',
      spokenResponse: 'Electronic signature applied. 49 CFR § 396.11 DVIR certified and ready for dispatch sync.',
    };
  }

  // --------------------------------------------------------------------------
  // 10. NAVIGATE TO DVIR VIEWS (e.g. "Open roadside rescue", "Check prior day memory", "Open dispatch wire")
  // --------------------------------------------------------------------------
  if (clean.includes('roadside rescue') || clean.includes('call roadside') || clean.includes('roadside directory')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'NAVIGATE_VIEW',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR View: Roadside Heavy Rescue',
      spokenResponse: 'Opening nationwide 24/7 roadside assistance directory.',
      targetView: 'ROADSIDE_RESCUE',
    };
  }

  if (clean.includes('prior day dvir') || clean.includes('prior memory') || clean.includes('yesterday dvir')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'NAVIGATE_VIEW',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR View: Prior-Day Memory Audit',
      spokenResponse: 'Opening prior-day inspection records and mechanic repair certifications.',
      targetView: 'PRIOR_MEMORY',
    };
  }

  if (clean.includes('dvir dispatch') || clean.includes('dvir message') || clean.includes('mechanic wire')) {
    return {
      id: `dvir-voice-${Date.now()}`,
      actionType: 'NAVIGATE_VIEW',
      timestamp: nowStr,
      spokenPhrase: original,
      summaryLabel: 'DVIR View: Dispatch & Maintenance Wire',
      spokenResponse: 'Opening direct fleet maintenance dispatch wire.',
      targetView: 'DISPATCH_WIRE',
    };
  }

  return null;
}

// Global cached latest voice action for seamless tab transitions
let latestDvirVoiceAction: DvirVoiceAction | null = null;

export function getLatestDvirVoiceAction(): DvirVoiceAction | null {
  return latestDvirVoiceAction;
}

export function clearLatestDvirVoiceAction(): void {
  latestDvirVoiceAction = null;
}

/**
 * Dispatches a DVIR voice action event across the browser window.
 */
export function dispatchDvirVoiceAction(action: DvirVoiceAction): void {
  latestDvirVoiceAction = action;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('truckwithease_dvir_voice_action', {
        detail: action,
      })
    );
  }
}

/**
 * Subscribes to DVIR voice action events.
 */
export function subscribeDvirVoiceAction(callback: (action: DvirVoiceAction) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<DvirVoiceAction>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener('truckwithease_dvir_voice_action', handler);
  return () => {
    window.removeEventListener('truckwithease_dvir_voice_action', handler);
  };
}
