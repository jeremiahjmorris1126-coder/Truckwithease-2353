/**
 * ============================================================================
 * TRUCKWITHEASE™ SAE J1939 CAN-BUS PGN & SPN DECODER SERVICE
 * Decodes 29-bit Arbitration IDs and 8-byte Hex Payloads into human-readable
 * commercial vehicle telematics parameters (RPM, Fuel Rate, Oil Pressure, etc.)
 * Standard: SAE J1939-71 (Vehicle Application Layer) / FMCSA 49 CFR § 395.26
 * ============================================================================
 */

export interface DecodedSpnParameter {
  spn: number;
  name: string;
  bytePosition: string;
  bitRange?: string;
  rawHex: string;
  rawInteger: number;
  resolution: string;
  offset: string;
  decodedValue: number | string | boolean;
  unit: string;
  formattedDisplay: string;
  status: 'VALID' | 'ERROR' | 'NOT_AVAILABLE' | 'OUT_OF_RANGE';
  category: 'ENGINE' | 'FUEL' | 'PRESSURES' | 'TEMPS' | 'ODOMETER' | 'ELECTRICAL' | 'FAULTS' | 'GENERAL';
}

export interface DecodedCanFrameResult {
  arbitrationIdHex: string;
  priority: number;
  extendedDataPage: number;
  dataPage: number;
  pduFormat: number;
  pduSpecific: number;
  pgn: number;
  pgnHex: string;
  pgnAcronym: string;
  pgnName: string;
  sourceAddress: number;
  sourceAddressHex: string;
  sourceAddressName: string;
  rawPayloadHex: string;
  bytes: number[];
  parameters: DecodedSpnParameter[];
  fmcsaComplianceImpact?: string;
}

export interface J1939PgnPresetFrame {
  id: string;
  title: string;
  pgn: number;
  acronym: string;
  arbIdHex: string;
  payloadHex: string;
  description: string;
}

// Known SAE J1939 Source Addresses
export const J1939_SOURCE_ADDRESSES: Record<number, string> = {
  0: 'Engine #1 (ECM)',
  1: 'Engine #2',
  3: 'Transmission #1 (TCU)',
  11: 'Brakes - System Controller (ABS)',
  17: 'Cruise Control',
  33: 'Body Controller',
  49: 'Cab Controller - Primary',
  249: 'Off-Board Diagnostic Tool / ELD Transponder (0xF9)',
  254: 'Null Address / Unassigned',
  255: 'Global Broadcast Address',
};

// Preset catalog of realistic CAN Hex Frames
export const J1939_PRESET_FRAMES: J1939PgnPresetFrame[] = [
  {
    id: 'eec1-nominal',
    title: 'EEC1 — Engine Speed & Torque (1440 RPM, 62% Torque)',
    pgn: 61444,
    acronym: 'EEC1',
    arbIdHex: '0x0CF00400',
    payloadHex: 'F0 3E 00 2D FF FF FF FF',
    description: 'PGN 61444 Electronic Engine Controller 1. Engine Speed: 1,440.0 RPM, Actual Torque: 62%, Engine Torque Mode: Speed Control.',
  },
  {
    id: 'lfe-fuel-rate',
    title: 'LFE1 — Fuel Economy & Fuel Rate (7.8 GPH / 7.2 MPG)',
    pgn: 65266,
    acronym: 'LFE1',
    arbIdHex: '0x18FEF200',
    payloadHex: '78 02 10 32 FF FF 5A 00',
    description: 'PGN 65266 Fuel Economy. Engine Fuel Rate: 31.6 L/h (8.35 GPH), Instant Fuel Economy: 3.12 km/L (7.34 MPG), Throttle: 45%.',
  },
  {
    id: 'efl-oil-pressure',
    title: 'EFL/P1 — Oil Pressure & Fluid Level (46 PSI Oil Pressure)',
    pgn: 65263,
    acronym: 'EFL/P1',
    arbIdHex: '0x18FEEF00',
    payloadHex: 'FF FF C8 4F FF FF FF FF',
    description: 'PGN 65263 Engine Fluid Level & Pressure. Engine Oil Pressure: 316 kPa (45.8 PSI), Oil Level: 80.0%.',
  },
  {
    id: 'ccvs-speed-65',
    title: 'CCVS — Wheel-Based Road Speed (65.2 MPH Cruise)',
    pgn: 65265,
    acronym: 'CCVS',
    arbIdHex: '0x18FEF100',
    payloadHex: 'F7 A8 68 00 00 00 FF FF',
    description: 'PGN 65265 Cruise Control / Vehicle Speed. Road Speed: 104.9 km/h (65.2 MPH), Brake Switch: Released, Parking Brake: Off.',
  },
  {
    id: 'et1-coolant',
    title: 'ET1 — Engine Coolant Temperature (194°F Nominal)',
    pgn: 65262,
    acronym: 'ET1',
    arbIdHex: '0x18FEEE00',
    payloadHex: '82 FF 98 00 FF FF FF FF',
    description: 'PGN 65262 Engine Temperature 1. Engine Coolant Temp: 90°C (194.0°F), Engine Oil Temp: 112°C (233.6°F).',
  },
  {
    id: 'vd-odometer',
    title: 'VD — Cumulative Vehicle Odometer (482,914.8 Miles)',
    pgn: 65248,
    acronym: 'VD',
    arbIdHex: '0x18FEE000',
    payloadHex: 'F0 4E 5E 00 FF FF FF FF',
    description: 'PGN 65248 Vehicle Distance. High-Resolution Total Odometer: 777,178.0 km (482,914.8 Miles).',
  },
  {
    id: 'hours-run-time',
    title: 'HOURS — Engine Operating Run Hours (11,482.3 Hours)',
    pgn: 65257,
    acronym: 'HOURS',
    arbIdHex: '0x18FEE900',
    payloadHex: '6E 82 03 00 FF FF FF FF',
    description: 'PGN 65257 Engine Hours & Revolutions. Total Engine Run Hours: 11,482.3 hrs.',
  },
  {
    id: 'vep-battery',
    title: 'VEP — Vehicle Electrical Power & Battery (13.9 VDC)',
    pgn: 65271,
    acronym: 'VEP',
    arbIdHex: '0x18FEF700',
    payloadHex: 'FF FF FF FF 16 01 FF FF',
    description: 'PGN 65271 Electrical Potential. Battery System Voltage: 13.90 VDC (Alternator active).',
  },
  {
    id: 'dm1-active-dtc',
    title: 'DM1 — Active Fault Codes (MIL Lamp ON, SPN 3251 FMI 2)',
    pgn: 65226,
    acronym: 'DM1',
    arbIdHex: '0x18FECA00',
    payloadHex: '44 FF B3 0C 02 01 FF FF',
    description: 'PGN 65226 Active Diagnostic Trouble Codes. Malfunction Indicator Lamp (MIL): ON, Amber Warning: ON, SPN 3251 FMI 2.',
  },
  {
    id: 'dash-def-fuel',
    title: 'DD — Dash Display (Fuel Level 78%, DEF Tank 86%)',
    pgn: 65276,
    acronym: 'DD',
    arbIdHex: '0x18FEFC00',
    payloadHex: 'C3 FF D7 FF FF FF FF FF',
    description: 'PGN 65276 Dash Display. Fuel Level: 78.0%, DEF Catalyst Tank Level: 86.0%.',
  },
];

/**
 * Parses raw hex string into array of numbers (e.g. "F0 3E 00 2D" -> [0xF0, 0x3E, 0x00, 0x2D])
 */
export const parseHexPayloadBytes = (hexStr: string): number[] => {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const byteHex = clean.substr(i, 2);
    if (byteHex.length === 2) {
      bytes.push(parseInt(byteHex, 16));
    }
  }
  while (bytes.length < 8) {
    bytes.push(0xFF);
  }
  return bytes.slice(0, 8);
};

/**
 * Decodes 29-bit CAN Arbitration ID
 */
export const decodeCanArbitrationId = (canIdInput: string | number) => {
  let idNum = 0;
  if (typeof canIdInput === 'string') {
    const clean = canIdInput.replace(/^0x/i, '').trim();
    idNum = parseInt(clean, 16) || 0;
  } else {
    idNum = canIdInput;
  }

  const priority = (idNum >> 26) & 0x07;
  const extendedDataPage = (idNum >> 25) & 0x01;
  const dataPage = (idNum >> 24) & 0x01;
  const pduFormat = (idNum >> 16) & 0xFF;
  const pduSpecific = (idNum >> 8) & 0xFF;
  const sourceAddress = idNum & 0xFF;

  let pgn = 0;
  if (pduFormat < 240) {
    // PDU1 format (destination specific) -> PGN = (DP << 16) | (PF << 8)
    pgn = (dataPage << 16) | (pduFormat << 8);
  } else {
    // PDU2 format (broadcast) -> PGN = (DP << 16) | (PF << 8) | PS
    pgn = (dataPage << 16) | (pduFormat << 8) | pduSpecific;
  }

  const pgnHex = '0x' + pgn.toString(16).toUpperCase().padStart(4, '0');
  const arbIdHex = '0x' + idNum.toString(16).toUpperCase().padStart(8, '0');
  const sourceAddressHex = '0x' + sourceAddress.toString(16).toUpperCase().padStart(2, '0');
  const sourceAddressName = J1939_SOURCE_ADDRESSES[sourceAddress] || `ECU Device (Addr ${sourceAddressHex})`;

  return {
    idNum,
    arbIdHex,
    priority,
    extendedDataPage,
    dataPage,
    pduFormat,
    pduSpecific,
    pgn,
    pgnHex,
    sourceAddress,
    sourceAddressHex,
    sourceAddressName,
  };
};

/**
 * Decodes any J1939 CAN frame given an Arbitration ID and 8-byte Hex payload
 */
export const decodeJ1939CanFrame = (
  arbitrationIdInput: string | number,
  payloadHexInput: string
): DecodedCanFrameResult => {
  const canIdInfo = decodeCanArbitrationId(arbitrationIdInput);
  const bytes = parseHexPayloadBytes(payloadHexInput);
  const rawPayloadHex = bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

  const pgn = canIdInfo.pgn;
  const parameters: DecodedSpnParameter[] = [];
  let pgnAcronym = `PGN ${pgn}`;
  let pgnName = `Proprietary / Vendor J1939 Parameter Group`;
  let fmcsaComplianceImpact = 'Auxiliary vehicle sensor telemetry frame.';

  // =========================================================================
  // 1. PGN 61444 (0xF004) — EEC1: Electronic Engine Controller 1
  // =========================================================================
  if (pgn === 61444) {
    pgnAcronym = 'EEC1';
    pgnName = 'Electronic Engine Controller 1';
    fmcsaComplianceImpact = 'FMCSA § 395.26 Engine Power Status & Automated Motion Detection.';

    // SPN 899: Engine Torque Mode (Byte 1, Bits 1-4)
    const torqueModeRaw = bytes[0] & 0x0F;
    const torqueModes: Record<number, string> = {
      0: 'Low Idle Governor',
      1: 'Accelerator Pedal / Operator Demand',
      2: 'Cruise Control System',
      3: 'PTO Governor Active',
      4: 'Road Speed Governor',
      5: 'ASR / Traction Control',
      15: 'Not Available / Default',
    };
    parameters.push({
      spn: 899,
      name: 'Engine Torque Mode',
      bytePosition: 'Byte 1',
      bitRange: 'Bits 1-4',
      rawHex: '0x' + torqueModeRaw.toString(16).toUpperCase(),
      rawInteger: torqueModeRaw,
      resolution: 'State Mode (4 bits)',
      offset: '0',
      decodedValue: torqueModes[torqueModeRaw] || `Mode Code ${torqueModeRaw}`,
      unit: '',
      formattedDisplay: torqueModes[torqueModeRaw] || `Mode Code ${torqueModeRaw}`,
      status: 'VALID',
      category: 'ENGINE',
    });

    // SPN 513: Actual Engine - Percent Torque (Byte 2)
    const torqueRaw = bytes[1];
    const torquePct = torqueRaw - 125;
    parameters.push({
      spn: 513,
      name: 'Actual Engine - Percent Torque',
      bytePosition: 'Byte 2',
      bitRange: 'Bits 1-8',
      rawHex: '0x' + torqueRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: torqueRaw,
      resolution: '1 %/bit',
      offset: '-125 %',
      decodedValue: torqueRaw === 0xFF ? 'Not Available' : torquePct,
      unit: '%',
      formattedDisplay: torqueRaw === 0xFF ? 'N/A' : `${torquePct} %`,
      status: torqueRaw === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ENGINE',
    });

    // SPN 190: Engine Speed (Bytes 3-4, 0.125 RPM/bit)
    const rpmRaw = (bytes[3] << 8) | bytes[2];
    const engineRpm = rpmRaw * 0.125;
    parameters.push({
      spn: 190,
      name: 'Engine Speed (RPM)',
      bytePosition: 'Bytes 3-4',
      bitRange: '16-bit unsigned (Little Endian)',
      rawHex: `0x${bytes[3].toString(16).padStart(2, '0')}${bytes[2].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: rpmRaw,
      resolution: '0.125 RPM/bit',
      offset: '0 RPM',
      decodedValue: rpmRaw === 0xFFFF ? 'Error' : Math.round(engineRpm * 10) / 10,
      unit: 'RPM',
      formattedDisplay: rpmRaw === 0xFFFF ? 'N/A' : `${engineRpm.toFixed(1)} RPM`,
      status: rpmRaw === 0xFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ENGINE',
    });

    // SPN 1483: Source Address of Controlling Device (Byte 5)
    const saControlling = bytes[4];
    parameters.push({
      spn: 1483,
      name: 'Source Address of Controlling Device',
      bytePosition: 'Byte 5',
      rawHex: '0x' + saControlling.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: saControlling,
      resolution: '1 SA/bit',
      offset: '0',
      decodedValue: J1939_SOURCE_ADDRESSES[saControlling] || `0x${saControlling.toString(16).toUpperCase()}`,
      unit: '',
      formattedDisplay: J1939_SOURCE_ADDRESSES[saControlling] || `0x${saControlling.toString(16).toUpperCase()}`,
      status: saControlling === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ENGINE',
    });

    // SPN 2432: Engine Demand - Percent Torque (Byte 8)
    const demandTorqueRaw = bytes[7];
    const demandTorquePct = demandTorqueRaw - 125;
    parameters.push({
      spn: 2432,
      name: 'Engine Demand - Percent Torque',
      bytePosition: 'Byte 8',
      rawHex: '0x' + demandTorqueRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: demandTorqueRaw,
      resolution: '1 %/bit',
      offset: '-125 %',
      decodedValue: demandTorqueRaw === 0xFF ? 'Not Available' : demandTorquePct,
      unit: '%',
      formattedDisplay: demandTorqueRaw === 0xFF ? 'N/A' : `${demandTorquePct} %`,
      status: demandTorqueRaw === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ENGINE',
    });
  }

  // =========================================================================
  // 2. PGN 65266 (0xFEF2) — LFE1: Fuel Economy & Fuel Rate
  // =========================================================================
  else if (pgn === 65266) {
    pgnAcronym = 'LFE1';
    pgnName = 'Fuel Economy (Liquid Fuel)';
    fmcsaComplianceImpact = 'IFTA fuel consumption tracking & instantaneous duty cycle thermal load.';

    // SPN 183: Engine Fuel Rate (Bytes 1-2, 0.05 L/h per bit)
    const fuelRateRaw = (bytes[1] << 8) | bytes[0];
    const fuelRateLph = fuelRateRaw * 0.05;
    const fuelRateGph = fuelRateLph * 0.264172;
    parameters.push({
      spn: 183,
      name: 'Engine Fuel Rate',
      bytePosition: 'Bytes 1-2',
      bitRange: '16-bit unsigned',
      rawHex: `0x${bytes[1].toString(16).padStart(2, '0')}${bytes[0].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: fuelRateRaw,
      resolution: '0.05 L/h per bit',
      offset: '0 L/h',
      decodedValue: fuelRateRaw === 0xFFFF ? 'Not Available' : Math.round(fuelRateGph * 100) / 100,
      unit: 'GPH (US Gal/hr)',
      formattedDisplay: fuelRateRaw === 0xFFFF ? 'N/A' : `${fuelRateGph.toFixed(2)} GPH (${fuelRateLph.toFixed(1)} L/h)`,
      status: fuelRateRaw === 0xFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'FUEL',
    });

    // SPN 184: Instantaneous Fuel Economy (Bytes 3-4, 1/512 km/L per bit)
    const instEconRaw = (bytes[3] << 8) | bytes[2];
    const instEconKmL = instEconRaw * (1.0 / 512.0);
    const instEconMpg = instEconKmL * 2.35215;
    parameters.push({
      spn: 184,
      name: 'Instantaneous Fuel Economy',
      bytePosition: 'Bytes 3-4',
      bitRange: '16-bit unsigned',
      rawHex: `0x${bytes[3].toString(16).padStart(2, '0')}${bytes[2].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: instEconRaw,
      resolution: '1/512 km/L per bit',
      offset: '0 km/L',
      decodedValue: instEconRaw === 0xFFFF ? 'Not Available' : Math.round(instEconMpg * 10) / 10,
      unit: 'MPG',
      formattedDisplay: instEconRaw === 0xFFFF ? 'N/A' : `${instEconMpg.toFixed(1)} MPG (${instEconKmL.toFixed(2)} km/L)`,
      status: instEconRaw === 0xFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'FUEL',
    });

    // SPN 51: Throttle Position % (Byte 7, 0.4%/bit)
    const throttleRaw = bytes[6];
    const throttlePct = throttleRaw * 0.4;
    parameters.push({
      spn: 51,
      name: 'Engine Throttle Position',
      bytePosition: 'Byte 7',
      rawHex: '0x' + throttleRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: throttleRaw,
      resolution: '0.4 %/bit',
      offset: '0 %',
      decodedValue: throttleRaw === 0xFF ? 'Not Available' : Math.round(throttlePct),
      unit: '%',
      formattedDisplay: throttleRaw === 0xFF ? 'N/A' : `${throttlePct.toFixed(1)} %`,
      status: throttleRaw === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ENGINE',
    });
  }

  // =========================================================================
  // 3. PGN 65263 (0xFEEF) — EFL/P1: Engine Fluid Level & Pressure 1
  // =========================================================================
  else if (pgn === 65263) {
    pgnAcronym = 'EFL/P1';
    pgnName = 'Engine Fluid Level & Pressure 1';
    fmcsaComplianceImpact = 'Internal engine lubrication health & critical low-oil malfunction detection.';

    // SPN 98: Engine Oil Level % (Byte 3, 0.4%/bit)
    const oilLevelRaw = bytes[2];
    const oilLevelPct = oilLevelRaw * 0.4;
    parameters.push({
      spn: 98,
      name: 'Engine Oil Level',
      bytePosition: 'Byte 3',
      rawHex: '0x' + oilLevelRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: oilLevelRaw,
      resolution: '0.4 %/bit',
      offset: '0 %',
      decodedValue: oilLevelRaw === 0xFF ? 'Not Available' : Math.round(oilLevelPct),
      unit: '%',
      formattedDisplay: oilLevelRaw === 0xFF ? 'N/A' : `${oilLevelPct.toFixed(1)} %`,
      status: oilLevelRaw === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'PRESSURES',
    });

    // SPN 100: Engine Oil Pressure (Byte 4, 4 kPa/bit = ~0.5801 PSI/bit)
    const oilPressRaw = bytes[3];
    const oilPressKpa = oilPressRaw * 4.0;
    const oilPressPsi = oilPressKpa * 0.145038;
    parameters.push({
      spn: 100,
      name: 'Engine Oil Pressure',
      bytePosition: 'Byte 4',
      rawHex: '0x' + oilPressRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: oilPressRaw,
      resolution: '4 kPa/bit (~0.58 PSI/bit)',
      offset: '0 kPa',
      decodedValue: oilPressRaw === 0xFF ? 'Not Available' : Math.round(oilPressPsi),
      unit: 'PSI',
      formattedDisplay: oilPressRaw === 0xFF ? 'N/A' : `${oilPressPsi.toFixed(1)} PSI (${oilPressKpa} kPa)`,
      status: oilPressRaw === 0xFF ? 'NOT_AVAILABLE' : oilPressPsi < 20 ? 'OUT_OF_RANGE' : 'VALID',
      category: 'PRESSURES',
    });
  }

  // =========================================================================
  // 4. PGN 65265 (0xFEF1) — CCVS: Cruise Control & Vehicle Speed
  // =========================================================================
  else if (pgn === 65265) {
    pgnAcronym = 'CCVS';
    pgnName = 'Cruise Control / Vehicle Speed';
    fmcsaComplianceImpact = 'FMCSA 49 CFR § 395.26 5.0 MPH Automatic Driving Duty Transition Threshold.';

    // SPN 597: Brake Switch (Byte 1, Bits 5-6)
    const brakeBit = (bytes[0] >> 4) & 0x03;
    const brakeStatus = brakeBit === 1 ? 'PRESSED / ACTIVE' : brakeBit === 0 ? 'RELEASED' : 'Error / N/A';
    parameters.push({
      spn: 597,
      name: 'Brake Switch Status',
      bytePosition: 'Byte 1',
      bitRange: 'Bits 5-6',
      rawHex: '0x' + brakeBit.toString(16).toUpperCase(),
      rawInteger: brakeBit,
      resolution: '2-bit state',
      offset: '0',
      decodedValue: brakeStatus,
      unit: '',
      formattedDisplay: brakeStatus,
      status: 'VALID',
      category: 'GENERAL',
    });

    // SPN 84: Wheel-Based Vehicle Speed (Bytes 2-3, 1/256 km/h per bit)
    const speedRaw = (bytes[2] << 8) | bytes[1];
    const speedKmh = speedRaw * (1.0 / 256.0);
    const speedMph = speedKmh * 0.621371;
    parameters.push({
      spn: 84,
      name: 'Wheel-Based Vehicle Speed',
      bytePosition: 'Bytes 2-3',
      bitRange: '16-bit unsigned',
      rawHex: `0x${bytes[2].toString(16).padStart(2, '0')}${bytes[1].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: speedRaw,
      resolution: '1/256 km/h per bit',
      offset: '0 km/h',
      decodedValue: speedRaw === 0xFFFF ? 'Not Available' : Math.round(speedMph * 10) / 10,
      unit: 'MPH',
      formattedDisplay: speedRaw === 0xFFFF ? 'N/A' : `${speedMph.toFixed(1)} MPH (${speedKmh.toFixed(1)} km/h)`,
      status: speedRaw === 0xFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'GENERAL',
    });

    // SPN 70: Parking Brake Switch (Byte 1, Bits 3-4)
    const pbBit = (bytes[0] >> 2) & 0x03;
    const pbStatus = pbBit === 1 ? 'SET / ENGAGED' : pbBit === 0 ? 'RELEASED / OFF' : 'N/A';
    parameters.push({
      spn: 70,
      name: 'Parking Brake Switch',
      bytePosition: 'Byte 1',
      bitRange: 'Bits 3-4',
      rawHex: '0x' + pbBit.toString(16).toUpperCase(),
      rawInteger: pbBit,
      resolution: '2-bit state',
      offset: '0',
      decodedValue: pbStatus,
      unit: '',
      formattedDisplay: pbStatus,
      status: 'VALID',
      category: 'GENERAL',
    });
  }

  // =========================================================================
  // 5. PGN 65262 (0xFEEE) — ET1: Engine Temperature 1
  // =========================================================================
  else if (pgn === 65262) {
    pgnAcronym = 'ET1';
    pgnName = 'Engine Temperature 1';
    fmcsaComplianceImpact = 'Powertrain thermal envelope monitoring and severe overheat fault trigger.';

    // SPN 110: Engine Coolant Temperature (Byte 1, 1°C/bit, Offset -40°C)
    const coolantRaw = bytes[0];
    const coolantC = coolantRaw - 40;
    const coolantF = (coolantC * 9.0 / 5.0) + 32.0;
    parameters.push({
      spn: 110,
      name: 'Engine Coolant Temperature',
      bytePosition: 'Byte 1',
      rawHex: '0x' + coolantRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: coolantRaw,
      resolution: '1 °C/bit',
      offset: '-40 °C',
      decodedValue: coolantRaw === 0xFF ? 'Not Available' : Math.round(coolantF),
      unit: '°F',
      formattedDisplay: coolantRaw === 0xFF ? 'N/A' : `${coolantF.toFixed(1)} °F (${coolantC} °C)`,
      status: coolantRaw === 0xFF ? 'NOT_AVAILABLE' : coolantF > 220 ? 'OUT_OF_RANGE' : 'VALID',
      category: 'TEMPS',
    });

    // SPN 175: Engine Oil Temperature 1 (Bytes 3-4, 0.03125 °C/bit, Offset -273 °C)
    const oilTempRaw = (bytes[3] << 8) | bytes[2];
    const oilTempC = (oilTempRaw * 0.03125) - 273;
    const oilTempF = (oilTempC * 9.0 / 5.0) + 32.0;
    parameters.push({
      spn: 175,
      name: 'Engine Oil Temperature',
      bytePosition: 'Bytes 3-4',
      rawHex: `0x${bytes[3].toString(16).padStart(2, '0')}${bytes[2].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: oilTempRaw,
      resolution: '0.03125 °C/bit',
      offset: '-273 °C',
      decodedValue: oilTempRaw === 0xFFFF ? 'Not Available' : Math.round(oilTempF),
      unit: '°F',
      formattedDisplay: oilTempRaw === 0xFFFF ? 'N/A' : `${oilTempF.toFixed(1)} °F (${oilTempC.toFixed(0)} °C)`,
      status: oilTempRaw === 0xFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'TEMPS',
    });
  }

  // =========================================================================
  // 6. PGN 65248 (0xFEE0) — VD: Vehicle Distance / Cumulative Odometer
  // =========================================================================
  else if (pgn === 65248) {
    pgnAcronym = 'VD';
    pgnName = 'Vehicle Distance (Odometer)';
    fmcsaComplianceImpact = 'FMCSA § 395.26 High-Resolution Monotonic Cumulative Odometer Baseline.';

    // SPN 245: Total Vehicle Distance / Odometer (Bytes 1-4, 0.125 km/bit)
    const odoRaw = ((bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]) >>> 0;
    const odoKm = odoRaw * 0.125;
    const odoMiles = odoKm * 0.621371;
    parameters.push({
      spn: 245,
      name: 'Total Vehicle Distance (Odometer)',
      bytePosition: 'Bytes 1-4',
      bitRange: '32-bit unsigned (Little Endian)',
      rawHex: `0x${bytes[3].toString(16).padStart(2, '0')}${bytes[2].toString(16).padStart(2, '0')}${bytes[1].toString(16).padStart(2, '0')}${bytes[0].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: odoRaw,
      resolution: '0.125 km/bit (~0.0776 mi/bit)',
      offset: '0 km',
      decodedValue: odoRaw === 0xFFFFFFFF ? 'Not Available' : Math.round(odoMiles * 10) / 10,
      unit: 'Miles',
      formattedDisplay: odoRaw === 0xFFFFFFFF ? 'N/A' : `${odoMiles.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miles (${odoKm.toLocaleString()} km)`,
      status: odoRaw === 0xFFFFFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ODOMETER',
    });
  }

  // =========================================================================
  // 7. PGN 65257 (0xFEE9) — HOURS: Engine Hours & Revolutions
  // =========================================================================
  else if (pgn === 65257) {
    pgnAcronym = 'HOURS';
    pgnName = 'Total Engine Hours & Revolutions';
    fmcsaComplianceImpact = 'FMCSA § 395.26 Engine Operating Run Hours Audit Timestamp Anchor.';

    // SPN 247: Total Engine Hours (Bytes 1-4, 0.05 hr/bit)
    const hrsRaw = ((bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]) >>> 0;
    const totalHrs = hrsRaw * 0.05;
    parameters.push({
      spn: 247,
      name: 'Total Engine Operating Hours',
      bytePosition: 'Bytes 1-4',
      bitRange: '32-bit unsigned',
      rawHex: `0x${bytes[3].toString(16).padStart(2, '0')}${bytes[2].toString(16).padStart(2, '0')}${bytes[1].toString(16).padStart(2, '0')}${bytes[0].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: hrsRaw,
      resolution: '0.05 hr/bit (3 minutes/bit)',
      offset: '0 hr',
      decodedValue: hrsRaw === 0xFFFFFFFF ? 'Not Available' : Math.round(totalHrs * 10) / 10,
      unit: 'Hours',
      formattedDisplay: hrsRaw === 0xFFFFFFFF ? 'N/A' : `${totalHrs.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Hours`,
      status: hrsRaw === 0xFFFFFFFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'ODOMETER',
    });
  }

  // =========================================================================
  // 8. PGN 65271 (0xFEF7) — VEP: Vehicle Electrical Power
  // =========================================================================
  else if (pgn === 65271) {
    pgnAcronym = 'VEP';
    pgnName = 'Vehicle Electrical Power (Battery System)';
    fmcsaComplianceImpact = 'Continuous power compliance & alternator charging verification.';

    // SPN 168: Electrical Potential (Bytes 5-6, 0.05 V/bit)
    const vRaw = (bytes[5] << 8) | bytes[4];
    const volts = vRaw * 0.05;
    parameters.push({
      spn: 168,
      name: 'Battery System Voltage',
      bytePosition: 'Bytes 5-6',
      bitRange: '16-bit unsigned',
      rawHex: `0x${bytes[5].toString(16).padStart(2, '0')}${bytes[4].toString(16).padStart(2, '0')}`.toUpperCase(),
      rawInteger: vRaw,
      resolution: '0.05 V/bit',
      offset: '0 V',
      decodedValue: vRaw === 0xFFFF ? 'Not Available' : Math.round(volts * 100) / 100,
      unit: 'VDC',
      formattedDisplay: vRaw === 0xFFFF ? 'N/A' : `${volts.toFixed(2)} VDC`,
      status: vRaw === 0xFFFF ? 'NOT_AVAILABLE' : volts < 11.8 ? 'OUT_OF_RANGE' : 'VALID',
      category: 'ELECTRICAL',
    });
  }

  // =========================================================================
  // 9. PGN 65226 (0xFECA) — DM1: Active Diagnostic Trouble Codes
  // =========================================================================
  else if (pgn === 65226) {
    pgnAcronym = 'DM1';
    pgnName = 'Active Diagnostic Trouble Codes & MIL';
    fmcsaComplianceImpact = 'FMCSA § 395.22 Diagnostic Malfunction Lamp & Check Engine Inspection Alert.';

    const milLamp = (bytes[0] & 0x40) !== 0;
    const amberLamp = (bytes[0] & 0x10) !== 0;
    const redStopLamp = (bytes[0] & 0x04) !== 0;

    parameters.push({
      spn: 1213,
      name: 'Malfunction Indicator Lamp (MIL)',
      bytePosition: 'Byte 1',
      bitRange: 'Bits 7-8',
      rawHex: '0x' + (bytes[0] & 0xC0).toString(16).toUpperCase(),
      rawInteger: bytes[0] & 0xC0,
      resolution: 'Lamp State',
      offset: '0',
      decodedValue: milLamp ? 'ACTIVE / ON (WARNING)' : 'OFF (NOMINAL)',
      unit: '',
      formattedDisplay: milLamp ? 'ILLUMINATED (WARNING ON)' : 'OFF (NOMINAL)',
      status: milLamp ? 'OUT_OF_RANGE' : 'VALID',
      category: 'FAULTS',
    });

    parameters.push({
      spn: 624,
      name: 'Amber Warning Lamp',
      bytePosition: 'Byte 1',
      bitRange: 'Bits 5-6',
      rawHex: '0x' + (bytes[0] & 0x30).toString(16).toUpperCase(),
      rawInteger: bytes[0] & 0x30,
      resolution: 'Lamp State',
      offset: '0',
      decodedValue: amberLamp ? 'ACTIVE (ON)' : 'OFF',
      unit: '',
      formattedDisplay: amberLamp ? 'ON (WARNING)' : 'OFF',
      status: amberLamp ? 'OUT_OF_RANGE' : 'VALID',
      category: 'FAULTS',
    });

    // Parse SPN / FMI if DTC payload present (Bytes 3-6)
    if (bytes[2] !== 0xFF && bytes[2] !== 0x00) {
      const spnLow = bytes[2];
      const spnMid = bytes[3];
      const spnHi = (bytes[4] >> 5) & 0x07;
      const parsedSpn = (spnHi << 16) | (spnMid << 8) | spnLow;
      const parsedFmi = bytes[4] & 0x1F;
      const occurrenceCount = bytes[5] & 0x7F;

      parameters.push({
        spn: parsedSpn,
        name: `Active Diagnostic Trouble Code: SPN ${parsedSpn} FMI ${parsedFmi}`,
        bytePosition: 'Bytes 3-6',
        rawHex: `${bytes[2].toString(16)} ${bytes[3].toString(16)} ${bytes[4].toString(16)} ${bytes[5].toString(16)}`.toUpperCase(),
        rawInteger: parsedSpn,
        resolution: 'SPN (19-bit) / FMI (5-bit)',
        offset: '0',
        decodedValue: `SPN ${parsedSpn} FMI ${parsedFmi} (Occurrences: ${occurrenceCount})`,
        unit: '',
        formattedDisplay: `SPN ${parsedSpn} FMI ${parsedFmi} (Count: ${occurrenceCount})`,
        status: 'OUT_OF_RANGE',
        category: 'FAULTS',
      });
    }
  }

  // =========================================================================
  // 10. PGN 65276 (0xFEFC) — DD: Dash Display (Fuel & DEF Level)
  // =========================================================================
  else if (pgn === 65276) {
    pgnAcronym = 'DD';
    pgnName = 'Dash Display (Fuel & DEF Level)';
    fmcsaComplianceImpact = 'Pre-trip DVIR fluid level baseline & DEF aftertreatment compliance.';

    // SPN 96: Fuel Level % (Byte 1, 0.4%/bit)
    const fuelLvlRaw = bytes[0];
    const fuelLvlPct = fuelLvlRaw * 0.4;
    parameters.push({
      spn: 96,
      name: 'Fuel Level 1',
      bytePosition: 'Byte 1',
      rawHex: '0x' + fuelLvlRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: fuelLvlRaw,
      resolution: '0.4 %/bit',
      offset: '0 %',
      decodedValue: fuelLvlRaw === 0xFF ? 'Not Available' : Math.round(fuelLvlPct),
      unit: '%',
      formattedDisplay: fuelLvlRaw === 0xFF ? 'N/A' : `${fuelLvlPct.toFixed(1)} %`,
      status: fuelLvlRaw === 0xFF ? 'NOT_AVAILABLE' : fuelLvlPct < 15 ? 'OUT_OF_RANGE' : 'VALID',
      category: 'FUEL',
    });

    // SPN 1761: Catalyst Tank Level / DEF Level (Byte 3, 0.4%/bit)
    const defLvlRaw = bytes[2];
    const defLvlPct = defLvlRaw * 0.4;
    parameters.push({
      spn: 1761,
      name: 'Diesel Exhaust Fluid (DEF) Tank Level',
      bytePosition: 'Byte 3',
      rawHex: '0x' + defLvlRaw.toString(16).padStart(2, '0').toUpperCase(),
      rawInteger: defLvlRaw,
      resolution: '0.4 %/bit',
      offset: '0 %',
      decodedValue: defLvlRaw === 0xFF ? 'Not Available' : Math.round(defLvlPct),
      unit: '%',
      formattedDisplay: defLvlRaw === 0xFF ? 'N/A' : `${defLvlPct.toFixed(1)} %`,
      status: defLvlRaw === 0xFF ? 'NOT_AVAILABLE' : 'VALID',
      category: 'FUEL',
    });
  }

  // =========================================================================
  // 11. Generic Fallback Decoder for Unknown PGNs
  // =========================================================================
  else {
    parameters.push({
      spn: 0,
      name: `Raw J1939 Frame Data (${pgnName})`,
      bytePosition: 'Bytes 1-8',
      rawHex: rawPayloadHex,
      rawInteger: 0,
      resolution: 'Byte array',
      offset: '0',
      decodedValue: rawPayloadHex,
      unit: 'Hex Bytes',
      formattedDisplay: rawPayloadHex,
      status: 'VALID',
      category: 'GENERAL',
    });
  }

  return {
    arbitrationIdHex: canIdInfo.arbIdHex,
    priority: canIdInfo.priority,
    extendedDataPage: canIdInfo.extendedDataPage,
    dataPage: canIdInfo.dataPage,
    pduFormat: canIdInfo.pduFormat,
    pduSpecific: canIdInfo.pduSpecific,
    pgn,
    pgnHex: canIdInfo.pgnHex,
    pgnAcronym,
    pgnName,
    sourceAddress: canIdInfo.sourceAddress,
    sourceAddressHex: canIdInfo.sourceAddressHex,
    sourceAddressName: canIdInfo.sourceAddressName,
    rawPayloadHex,
    bytes,
    parameters,
    fmcsaComplianceImpact,
  };
};

// Adapter for backwards-compatibility with server.ts
export const j1939Decoder = {
  decodeFrame: (canIdHex: string, payloadHex: string) => {
    const res = decodeJ1939CanFrame(canIdHex, payloadHex);
    return {
      rawCanIdHex: res.arbitrationIdHex,
      arbitrationIdDecimal: parseInt(res.arbitrationIdHex, 16) || 0,
      priority: res.priority,
      edp: res.extendedDataPage,
      dp: res.dataPage,
      pgn: res.pgn,
      pgnAcronym: res.pgnAcronym,
      pgnLabel: res.pgnName,
      sourceAddress: res.sourceAddress,
      sourceDevice: res.sourceAddressName,
      payloadHex: res.rawPayloadHex,
      payloadBytes: res.bytes,
      timestamp: new Date().toISOString(),
      decodedSpns: (res.parameters || []).map((s: DecodedSpnParameter) => ({
        spn: s.spn,
        name: s.name,
        value: s.decodedValue,
        unit: s.unit,
        rawBytes: s.rawHex,
        bitLength: 16,
        resolution: s.resolution,
        offset: 0,
        status: s.status,
        description: s.formattedDisplay,
      })),
    };
  }
};

export const J1939_SIMULATION_PRESETS = J1939_PRESET_FRAMES.map(p => ({
  id: p.id,
  name: p.title,
  description: p.description,
  canIdHex: p.arbIdHex,
  payloadHex: p.payloadHex,
  category: 'NOMINAL',
}));
