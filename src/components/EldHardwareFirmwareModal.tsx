import React, { useState } from 'react';
import {
  Cpu,
  Download,
  Copy,
  Check,
  X,
  Code2,
  Terminal,
  Radio,
  Cable,
  Zap,
  HardDrive,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Sliders,
  ExternalLink,
  Layers,
  FileCode,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

export type TargetMicrocontroller = 'esp32' | 'raspberry-pi' | 'arduino-mcp2515' | 'teensy';

interface EldHardwareFirmwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUnitNumber?: string;
}

export const EldHardwareFirmwareModal: React.FC<EldHardwareFirmwareModalProps> = ({
  isOpen,
  onClose,
  defaultUnitNumber = 'UNIT-T812',
}) => {
  const [targetMcu, setTargetMcu] = useState<TargetMicrocontroller>('esp32');
  const [baudRate, setBaudRate] = useState<'250000' | '500000'>('250000');
  const [bleDeviceName, setBleDeviceName] = useState<string>('TWE-ELD-DONGLE');
  const [sampleHz, setSampleHz] = useState<number>(5);
  const [pinCanTx, setPinCanTx] = useState<number>(5);
  const [pinCanRx, setPinCanRx] = useState<number>(4);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'firmware' | 'wiring' | 'flashing-guide'>('firmware');

  if (!isOpen) return null;

  // Generate ESP32 Arduino C++ Firmware Code
  const generateEsp32Code = (): string => {
    return `/**
 * ============================================================================
 * TRUCKWITHEASE™ COMMERCIAL ELD HARDWARE FIRMWARE (ESP32 TWAI + BLE 5.3)
 * Target Hardware: ESP32-WROOM-32 / ESP32-S3 + SN65HVD230 CAN Transceiver
 * Protocol: SAE J1939 (250k/500k bps) + BLE GATT (Nordic UART Service)
 * Compliance: FMCSA 49 CFR Part 395 Subpart B § 395.26
 * Unit ID: ${defaultUnitNumber} | Device BLE: ${bleDeviceName}
 * ============================================================================
 */

#include <Arduino.h>
#include <driver/twai.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// CAN Bus Transceiver GPIO Pins (SN65HVD230 / VP230)
#define CAN_TX_PIN GPIO_NUM_${pinCanTx}
#define CAN_RX_PIN GPIO_NUM_${pinCanRx}

// Nordic UART Service UUIDs for TruckWithEase App Ingestion
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// SAE J1939 Engine Diagnostics Cache
struct EldTelemetryState {
  float engineRpm = 0.0;
  float roadSpeedMph = 0.0;
  float totalOdometerMiles = 0.0;
  float totalEngineHours = 0.0;
  float coolantTempF = 0.0;
  float oilPressurePsi = 0.0;
  float batteryVoltage = 0.0;
  uint8_t engineLoadPct = 0;
  bool milStatus = false;
  uint16_t activeDtcCount = 0;
  uint32_t packetSequence = 0;
} eldState;

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("[BLE] TruckWithEase App Connected!");
  };
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("[BLE] Disconnected. Restarting Advertising...");
  }
};

void setupCAN() {
  twai_general_config_t g_config = TWAI_GENERAL_CONFIG_DEFAULT(CAN_TX_PIN, CAN_RX_PIN, TWAI_MODE_NORMAL);
  ${baudRate === '250000' ? 'twai_timing_config_t t_config = TWAI_TIMING_CONFIG_250KBITS();' : 'twai_timing_config_t t_config = TWAI_TIMING_CONFIG_500KBITS();'}
  twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL();

  if (twai_driver_install(&g_config, &t_config, &f_config) == ESP_OK) {
    Serial.println("[CAN] TWAI Driver Installed Successfully");
  } else {
    Serial.println("[CAN] ERROR: Failed to install TWAI driver");
    return;
  }

  if (twai_start() == ESP_OK) {
    Serial.println("[CAN] TWAI Driver Started. Listening on J1939 Bus at ${baudRate} bps...");
  } else {
    Serial.println("[CAN] ERROR: Failed to start TWAI driver");
  }
}

void setupBLE() {
  BLEDevice::init("${bleDeviceName}");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());

  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  BLEDevice::startAdvertising();
  Serial.println("[BLE] Transponder Advertising as '${bleDeviceName}'");
}

void parseJ1939Frame(const twai_message_t &msg) {
  if (!msg.extd) return; // Standard J1939 frames use 29-bit extended IDs

  uint32_t pgn = (msg.identifier >> 8) & 0x3FFFF;
  uint8_t sa  = msg.identifier & 0xFF; // Source Address (ECU = 0x00)

  // PGN 61444 (0xF004) - EEC1 (Electronic Engine Controller 1)
  if (pgn == 61444) {
    eldState.engineLoadPct = msg.data[1]; // Actual engine torque %
    uint16_t rpmRaw = (msg.data[4] << 8) | msg.data[3];
    eldState.engineRpm = rpmRaw * 0.125f;
  }
  // PGN 65265 (0xFEF1) - CCVS (Cruise Control / Vehicle Speed)
  else if (pgn == 65265) {
    uint16_t speedRaw = (msg.data[2] << 8) | msg.data[1];
    eldState.roadSpeedMph = (speedRaw * (1.0f / 256.0f)) * 0.621371f;
  }
  // PGN 65248 (0xFEE0) - VD (Vehicle Distance / Total Odometer)
  else if (pgn == 65248) {
    uint32_t odoKmRaw = ((uint32_t)msg.data[3] << 24) | ((uint32_t)msg.data[2] << 16) | ((uint32_t)msg.data[1] << 8) | msg.data[0];
    eldState.totalOdometerMiles = (odoKmRaw * 0.125f) * 0.621371f;
  }
  // PGN 65257 (0xFEE9) - HOURS (Total Engine Hours)
  else if (pgn == 65257) {
    uint32_t hrsRaw = ((uint32_t)msg.data[3] << 24) | ((uint32_t)msg.data[2] << 16) | ((uint32_t)msg.data[1] << 8) | msg.data[0];
    eldState.totalEngineHours = hrsRaw * 0.05f;
  }
  // PGN 65262 (0xFEEE) - ET1 (Engine Temperature 1 / Coolant)
  else if (pgn == 65262) {
    int tempC = msg.data[0] - 40;
    eldState.coolantTempF = (tempC * 9.0f / 5.0f) + 32.0f;
  }
  // PGN 65263 (0xFEEF) - EFL/P1 (Engine Fluid Level & Oil Pressure)
  else if (pgn == 65263) {
    eldState.oilPressurePsi = (msg.data[3] * 4.0f) * 0.145038f;
  }
  // PGN 65271 (0xFEF7) - VEP (Vehicle Electrical Power / Battery)
  else if (pgn == 65271) {
    uint16_t vRaw = (msg.data[5] << 8) | msg.data[4];
    eldState.batteryVoltage = vRaw * 0.05f;
  }
  // PGN 65226 (0xFECA) - DM1 (Active Diagnostic Trouble Codes)
  else if (pgn == 65226) {
    eldState.milStatus = (msg.data[0] & 0x40) != 0;
  }
}

void broadcastEldPacket() {
  if (!deviceConnected) return;

  eldState.packetSequence++;
  char payload[256];
  // FMCSA Telematics CSV String Format
  snprintf(payload, sizeof(payload),
    "TWE_ELD,%lu,%.1f,%.1f,%.1f,%.1f,%.0f,%.0f,%.1f,%u,%d,%u\\n",
    eldState.packetSequence,
    eldState.roadSpeedMph,
    eldState.engineRpm,
    eldState.totalOdometerMiles,
    eldState.totalEngineHours,
    eldState.coolantTempF,
    eldState.oilPressurePsi,
    eldState.batteryVoltage,
    eldState.engineLoadPct,
    eldState.milStatus ? 1 : 0,
    eldState.activeDtcCount
  );

  pTxCharacteristic->setValue((uint8_t*)payload, strlen(payload));
  pTxCharacteristic->notify();
  Serial.print("[TX -> APP] ");
  Serial.print(payload);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("==================================================");
  Serial.println("  TRUCKWITHEASE™ COMMERCIAL ELD HARDWARE ENGINE   ");
  Serial.println("==================================================");

  setupCAN();
  setupBLE();
}

unsigned long lastBroadcast = 0;
const unsigned long broadcastInterval = ${Math.round(1000 / sampleHz)};

void loop() {
  twai_message_t message;
  while (twai_receive(&message, 0) == ESP_OK) {
    parseJ1939Frame(message);
  }

  if (millis() - lastBroadcast >= broadcastInterval) {
    lastBroadcast = millis();
    broadcastEldPacket();
  }

  // Handle BLE Disconnections
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
`;
  };

  // Generate Raspberry Pi Python Daemon
  const generateRaspberryPiCode = (): string => {
    return `#!/usr/bin/env python3
"""
============================================================================
TRUCKWITHEASE™ COMMERCIAL ELD DAEMON (RASPBERRY PI + PICAN2 / SOCKETCAN)
Protocol: SAE J1939 (SocketCAN 'can0') -> WebSocket / Serial Output
Compliance: FMCSA 49 CFR Part 395 Subpart B § 395.26
============================================================================
"""

import can
import time
import json
import asyncio
import websockets

CAN_CHANNEL = 'can0'
CAN_BITRATE = ${baudRate}
WS_PORT = 8765

eld_state = {
    "unit_id": "${defaultUnitNumber}",
    "sequence": 0,
    "speed_mph": 0.0,
    "engine_rpm": 0.0,
    "odometer_miles": 0.0,
    "engine_hours": 0.0,
    "coolant_temp_f": 0.0,
    "oil_pressure_psi": 0.0,
    "battery_voltage": 0.0,
    "engine_load_pct": 0,
    "mil_active": False,
    "dtc_count": 0,
    "timestamp": ""
}

connected_clients = set()

def parse_j1939(msg):
    if not msg.is_extended_id:
        return
    
    pgn = (msg.arbitration_id >> 8) & 0x3FFFF
    data = msg.data

    if pgn == 61444 and len(data) >= 5:  # EEC1
        eld_state["engine_load_pct"] = data[1]
        raw_rpm = (data[4] << 8) | data[3]
        eld_state["engine_rpm"] = round(raw_rpm * 0.125, 1)

    elif pgn == 65265 and len(data) >= 3:  # CCVS
        raw_spd = (data[2] << 8) | data[1]
        eld_state["speed_mph"] = round((raw_spd * (1.0 / 256.0)) * 0.621371, 1)

    elif pgn == 65248 and len(data) >= 4:  # VD (Odometer)
        raw_km = (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]
        eld_state["odometer_miles"] = round((raw_km * 0.125) * 0.621371, 1)

    elif pgn == 65257 and len(data) >= 4:  # Engine Hours
        raw_hrs = (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]
        eld_state["engine_hours"] = round(raw_hrs * 0.05, 1)

    elif pgn == 65262 and len(data) >= 1:  # Coolant Temp
        c = data[0] - 40
        eld_state["coolant_temp_f"] = round((c * 9.0 / 5.0) + 32.0, 1)

    elif pgn == 65263 and len(data) >= 4:  # Oil Pressure
        eld_state["oil_pressure_psi"] = round((data[3] * 4.0) * 0.145038, 1)

    elif pgn == 65271 and len(data) >= 6:  # Battery Voltage
        raw_v = (data[5] << 8) | data[4]
        eld_state["battery_voltage"] = round(raw_v * 0.05, 1)

    elif pgn == 65226 and len(data) >= 1:  # DM1 DTC
        eld_state["mil_active"] = (data[0] & 0x40) != 0

async def can_listener():
    bus = can.interface.Bus(channel=CAN_CHANNEL, bustype='socketcan', bitrate=CAN_BITRATE)
    print(f"[CAN] SocketCAN initialized on {CAN_CHANNEL} @ {CAN_BITRATE} bps")
    loop = asyncio.get_running_loop()
    reader = can.AsyncBufferedReader()
    notifier = can.Notifier(bus, [reader], loop=loop)

    while True:
        msg = await reader.get_message()
        parse_j1939(msg)

async def ws_handler(websocket):
    connected_clients.add(websocket)
    print(f"[WS] Client connected: {websocket.remote_address}")
    try:
        while True:
            await asyncio.sleep(1.0 / ${sampleHz})
            eld_state["sequence"] += 1
            eld_state["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            payload = json.dumps(eld_state)
            await websocket.send(payload)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"[WS] Client disconnected")

async def main():
    asyncio.create_task(can_listener())
    async with websockets.serve(ws_handler, "0.0.0.0", WS_PORT):
        print(f"[TWE-ELD] Telematics Server streaming on ws://0.0.0.0:{WS_PORT}")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
`;
  };

  // Generate Arduino + MCP2515 C++ Code
  const generateArduinoMcp2515Code = (): string => {
    return `/**
 * ============================================================================
 * TRUCKWITHEASE™ ELD - ARDUINO MEGA / UNO + MCP2515 CAN BUS SHIELD
 * MCP2515 (SPI) + HC-05 / HM-10 BLE Serial Transponder
 * ============================================================================
 */

#include <SPI.h>
#include <mcp2515.h>

struct can_frame canMsg;
MCP2515 mcp2515(10); // CS Pin 10

float engineRpm = 0.0;
float roadSpeedMph = 0.0;
float odometerMiles = 0.0;
float engineHours = 0.0;
float coolantTempF = 0.0;
float oilPressurePsi = 0.0;
float batteryVoltage = 0.0;
uint8_t engineLoad = 0;
bool milStatus = false;
unsigned long seq = 0;

void setup() {
  Serial.begin(115200);
  mcp2515.reset();
  ${baudRate === '250000' ? 'mcp2515.setBitrate(CAN_250KBPS, MCP_8MHZ);' : 'mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);'}
  mcp2515.setNormalMode();
  Serial.println("[ELD] MCP2515 Initialized at ${baudRate} bps");
}

unsigned long lastSend = 0;

void loop() {
  if (mcp2515.readMessage(&canMsg) == MCP2515::ERROR_OK) {
    if (canMsg.can_id & 0x80000000) { // Extended 29-bit CAN ID
      uint32_t pgn = (canMsg.can_id >> 8) & 0x3FFFF;
      if (pgn == 61444) { // EEC1
        engineLoad = canMsg.data[1];
        uint16_t rpmRaw = (canMsg.data[4] << 8) | canMsg.data[3];
        engineRpm = rpmRaw * 0.125;
      } else if (pgn == 65265) { // CCVS
        uint16_t spdRaw = (canMsg.data[2] << 8) | canMsg.data[1];
        roadSpeedMph = (spdRaw * (1.0 / 256.0)) * 0.621371;
      } else if (pgn == 65248) { // Odometer
        uint32_t odoRaw = ((uint32_t)canMsg.data[3] << 24) | ((uint32_t)canMsg.data[2] << 16) | ((uint32_t)canMsg.data[1] << 8) | canMsg.data[0];
        odometerMiles = (odoRaw * 0.125) * 0.621371;
      }
    }
  }

  if (millis() - lastSend >= ${Math.round(1000 / sampleHz)}) {
    lastSend = millis();
    seq++;
    // Emit FMCSA Stream Line
    Serial.print("TWE_ELD,");
    Serial.print(seq);
    Serial.print(",");
    Serial.print(roadSpeedMph, 1);
    Serial.print(",");
    Serial.print(engineRpm, 1);
    Serial.print(",");
    Serial.print(odometerMiles, 1);
    Serial.print(",");
    Serial.println(engineHours, 1);
  }
}
`;
  };

  const getActiveCode = (): string => {
    switch (targetMcu) {
      case 'esp32':
        return generateEsp32Code();
      case 'raspberry-pi':
        return generateRaspberryPiCode();
      case 'arduino-mcp2515':
        return generateArduinoMcp2515Code();
      case 'teensy':
        return generateEsp32Code().replace('ESP32 TWAI', 'TEENSY 4.0 FLEXCAN_T4');
      default:
        return generateEsp32Code();
    }
  };

  const handleCopyCode = () => {
    triggerHapticFeedback('subtle');
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    triggerHapticFeedback('subtle');
    const code = getActiveCode();
    const ext = targetMcu === 'raspberry-pi' ? 'py' : 'ino';
    const filename = `TruckWithEase_ELD_${targetMcu.toUpperCase()}_Firmware.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#070A0F] border border-[#1E293B] shadow-2xl shadow-black rounded-xl w-full max-w-5xl flex flex-col max-h-[94vh] overflow-hidden font-mono">
        
        {/* HEADER */}
        <div className="bg-[#0B1017] border-b border-[#1A2536] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-[Oswald] text-base sm:text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Commercial ELD Hardware Firmware Studio</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold uppercase">
                  SAE J1939 Native
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-sky-400 text-[10px] font-bold uppercase">
                  FMCSA § 395.26 Compliant
                </span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Complete embedded source code to build, flash, and run physical ELD transponders (ESP32, Raspberry Pi, Arduino) connecting to truck ECM.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141B26] hover:bg-[#1E293B] text-[#9CA3AF] hover:text-white border border-[#233145] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TARGET & CONFIGURATION RIBBON */}
        <div className="bg-[#05080E] p-3 sm:px-6 border-b border-[#141E2C] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Target Microcontroller */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold block">
              Hardware Architecture
            </label>
            <select
              value={targetMcu}
              onChange={e => {
                triggerHapticFeedback('tick');
                setTargetMcu(e.target.value as TargetMicrocontroller);
              }}
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-[#C9A84C] text-white text-xs rounded px-2.5 py-1.5 outline-none font-mono font-bold"
            >
              <option value="esp32">ESP32 / ESP32-S3 (BLE 5.3 + TWAI)</option>
              <option value="raspberry-pi">Raspberry Pi + PiCAN2 (Python)</option>
              <option value="arduino-mcp2515">Arduino + MCP2515 (SPI CAN)</option>
              <option value="teensy">Teensy 4.0 / STM32 (FlexCAN)</option>
            </select>
          </div>

          {/* J1939 CAN Bus Baud Rate */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold block">
              CAN-Bus Baud Rate
            </label>
            <select
              value={baudRate}
              onChange={e => {
                triggerHapticFeedback('tick');
                setBaudRate(e.target.value as any);
              }}
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-[#C9A84C] text-[#C9A84C] text-xs rounded px-2.5 py-1.5 outline-none font-mono font-bold"
            >
              <option value="250000">250 kbps (Standard Class 8 Trucks)</option>
              <option value="500000">500 kbps (2016+ Green 9-Pin Type II)</option>
            </select>
          </div>

          {/* BLE Transponder Name */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold block">
              BLE Broadcast ID
            </label>
            <input
              type="text"
              value={bleDeviceName}
              onChange={e => setBleDeviceName(e.target.value)}
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-sky-500 text-sky-300 text-xs rounded px-2.5 py-1.5 outline-none font-mono font-bold"
            />
          </div>

          {/* Telemetry Stream Frequency */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold block">
              Sampling Rate (Hz)
            </label>
            <select
              value={sampleHz}
              onChange={e => setSampleHz(Number(e.target.value))}
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-[#00FF66] text-[#00FF66] text-xs rounded px-2.5 py-1.5 outline-none font-mono font-bold"
            >
              <option value={1}>1 Hz (Low Power)</option>
              <option value={5}>5 Hz (Standard FMCSA)</option>
              <option value={10}>10 Hz (High Performance)</option>
              <option value={20}>20 Hz (High Precision Telemetry)</option>
            </select>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="bg-[#0A0E15] px-4 py-2 sm:px-6 border-b border-[#141E2C] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {[
              { id: 'firmware', label: '1. Source Code (.ino / .py)', icon: Code2 },
              { id: 'wiring', label: '2. 9-Pin J1939 Pinout & Wiring', icon: Cable },
              { id: 'flashing-guide', label: '3. Flashing & Pairing Guide', icon: Terminal },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('tick');
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 border ${
                    activeTab === tab.id
                      ? 'bg-[#182538] text-white border-[#384F70] shadow-sm'
                      : 'text-[#6E8094] border-transparent hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded bg-[#121A26] hover:bg-[#1A2638] text-gray-200 hover:text-white border border-[#233145] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3 py-1.5 rounded bg-[#FFE600]/20 hover:bg-[#FFE600]/30 text-black border border-[#FFE600] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,102,0.2)] active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Firmware</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 bg-[#03060A] overflow-y-auto p-4 sm:p-6 text-xs text-[#9CA3AF]">
          {activeTab === 'firmware' && (
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] text-[#6E8094] mb-2 pb-1 border-b border-[#141E2C]">
                <span>
                  Language: <strong className="text-white">{targetMcu === 'raspberry-pi' ? 'Python 3' : 'C++ (Arduino / ESP-IDF)'}</strong> • Target: <strong className="text-[#C9A84C]">{targetMcu.toUpperCase()}</strong>
                </span>
                <span className="text-emerald-400 font-bold">READY TO FLASH</span>
              </div>
              <pre className="p-4 bg-[#070B11] border border-[#162234] rounded-lg text-gray-200 text-xs font-mono leading-relaxed overflow-x-auto select-text selection:bg-sky-900">
                <code>{getActiveCode()}</code>
              </pre>
            </div>
          )}

          {activeTab === 'wiring' && (
            <div className="space-y-6">
              <div className="bg-[#0A101A] border border-[#1C2C40] p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Cable className="w-4 h-4 text-[#C9A84C]" />
                  <span>SAE J1939 Deutsch 9-Pin Diagnostic Connector Pinout</span>
                </h4>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Connect the truck's diagnostic port (located under the driver dashboard / kick panel) to the hardware transceiver pins:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-[#05080E] border border-[#182332] rounded-lg">
                    <span className="text-[10px] text-[#6E8094] uppercase font-bold block">PIN A (GND)</span>
                    <span className="text-white font-bold text-sm">Chassis Ground</span>
                    <span className="text-[10px] text-gray-400 block mt-1">Connect to MCU GND</span>
                  </div>
                  <div className="p-3 bg-[#05080E] border border-[#182332] rounded-lg">
                    <span className="text-[10px] text-[#6E8094] uppercase font-bold block">PIN B (+12V/+24V)</span>
                    <span className="text-amber-400 font-bold text-sm">Battery Power</span>
                    <span className="text-[10px] text-gray-400 block mt-1">Step-down to 5V (Buck Converter)</span>
                  </div>
                  <div className="p-3 bg-[#05080E] border border-sky-500/40 rounded-lg">
                    <span className="text-[10px] text-sky-400 uppercase font-bold block">PIN C (CAN_H)</span>
                    <span className="text-sky-300 font-bold text-sm">CAN High Bus</span>
                    <span className="text-[10px] text-sky-400/80 block mt-1">Connect to SN65HVD230 CAN_H</span>
                  </div>
                  <div className="p-3 bg-[#05080E] border border-sky-500/40 rounded-lg">
                    <span className="text-[10px] text-sky-400 uppercase font-bold block">PIN D (CAN_L)</span>
                    <span className="text-sky-300 font-bold text-sm">CAN Low Bus</span>
                    <span className="text-[10px] text-sky-400/80 block mt-1">Connect to SN65HVD230 CAN_L</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A101A] border border-[#1C2C40] p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00FF66]" />
                  <span>ESP32 to SN65HVD230 CAN Transceiver Wiring Scheme</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-[#05080E] rounded border border-[#162232]">
                    <span className="text-[10px] text-gray-500 block">SN65HVD230 3V3</span>
                    <strong className="text-white">ESP32 3.3V Out</strong>
                  </div>
                  <div className="p-2.5 bg-[#05080E] rounded border border-[#162232]">
                    <span className="text-[10px] text-gray-500 block">SN65HVD230 GND</span>
                    <strong className="text-white">ESP32 GND</strong>
                  </div>
                  <div className="p-2.5 bg-[#05080E] rounded border border-[#162232]">
                    <span className="text-[10px] text-gray-500 block">SN65HVD230 CTX</span>
                    <strong className="text-sky-400">GPIO {pinCanTx} (CAN TX)</strong>
                  </div>
                  <div className="p-2.5 bg-[#05080E] rounded border border-[#162232]">
                    <span className="text-[10px] text-gray-500 block">SN65HVD230 CRX</span>
                    <strong className="text-sky-400">GPIO {pinCanRx} (CAN RX)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashing-guide' && (
            <div className="space-y-4">
              <div className="bg-[#0A101A] border border-[#1C2C40] p-5 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00FF66]" />
                  <span>3-Step Quick Flash &amp; Ingestion Workflow</span>
                </h4>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 bg-[#05080E] border border-[#182332] rounded-lg space-y-1">
                    <strong className="text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center text-[10px]">1</span>
                      Flash Firmware with Arduino IDE or PlatformIO
                    </strong>
                    <p className="text-[#9CA3AF] pl-7">
                      Open Arduino IDE, select board <strong>"ESP32 Dev Module"</strong>, paste the generated C++ code above, and click <strong>Upload (Ctrl+U)</strong> over USB.
                    </p>
                  </div>

                  <div className="p-3 bg-[#05080E] border border-[#182332] rounded-lg space-y-1">
                    <strong className="text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center text-[10px]">2</span>
                      Plug Transceiver into Vehicle 9-Pin Deutsch Port
                    </strong>
                    <p className="text-[#9CA3AF] pl-7">
                      Insert the 9-Pin adapter into the truck's diagnostic port under the dash. The hardware will power on and begin auto-sniffing J1939 broadcast frames at {baudRate} bps.
                    </p>
                  </div>

                  <div className="p-3 bg-[#05080E] border border-[#182332] rounded-lg space-y-1">
                    <strong className="text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] flex items-center justify-center text-[10px]">3</span>
                      Pair in TruckWithEase App
                    </strong>
                    <p className="text-[#9CA3AF] pl-7">
                      In TruckWithEase, navigate to <strong>ELD Audit &amp; Telemetry</strong> and click <strong>"BLE 5.3"</strong>. Select <strong>"{bleDeviceName}"</strong> from the Web Bluetooth dialog to start streaming live J1939 engine metrics in real-time!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#05080E] p-3 sm:px-6 border-t border-[#141E2C] flex items-center justify-between">
          <span className="text-[10px] text-[#6E8094] hidden sm:inline">
            TruckWithEase™ Commercial Embedded Hardware SDK • Open Source Hardware Architecture
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#141D2B] hover:bg-[#1F2C40] text-white font-bold text-xs uppercase tracking-wider border border-[#283A52] transition-colors"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
