/**
 * GeminiService — Google Gemini AI integration for TruckWithEase
 * Express Mode: gemini-2.0-flash — fastest response, highest throughput
 * Standard Mode: gemini-1.5-pro — deep reasoning, complex analysis
 */

const GEMINI_KEY_STORAGE = 'twe_gemini_key';
const GEMINI_MODE_STORAGE = 'twe_gemini_mode'; // 'express' | 'standard'

export function getGeminiKey() {
  return sessionStorage.getItem(GEMINI_KEY_STORAGE) || localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function setGeminiKey(key) {
  sessionStorage.setItem(GEMINI_KEY_STORAGE, key);
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
}

export function hasGeminiKey() {
  return !!getGeminiKey();
}

export function getGeminiMode() {
  return localStorage.getItem(GEMINI_MODE_STORAGE) || 'express';
}

export function setGeminiMode(mode) {
  localStorage.setItem(GEMINI_MODE_STORAGE, mode);
}

export function isExpressMode() {
  return getGeminiMode() === 'express';
}

/**
 * Model selector — Express = gemini-2.0-flash (fastest), Standard = gemini-1.5-pro (deepest)
 */
function getModel() {
  return isExpressMode() ? 'gemini-2.0-flash' : 'gemini-1.5-pro';
}

/**
 * Generation config — Express = lean and fast, Standard = thorough
 */
function getGenerationConfig(override = {}) {
  const express = isExpressMode();
  return {
    temperature: express ? 0.5 : 0.7,
    topK: express ? 20 : 40,
    topP: express ? 0.85 : 0.95,
    maxOutputTokens: express ? 2048 : 4096,
    ...override,
  };
}

/**
 * Core Gemini API call — auto-selects model based on Express Mode setting
 */
async function callGemini(prompt, systemInstruction = '', imageBase64 = null, configOverride = {}) {
  const key = getGeminiKey();
  if (!key) throw new Error('Gemini API key not configured');

  const model = getModel();
  const parts = [];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: getGenerationConfig(configOverride),
  };

  // systemInstruction supported on both models
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Fleet Intelligence Query — natural language answers about fleet data
 */
export async function askFleetIntelligence(question, fleetContext = {}) {
  const system = `You are the TruckWithEase Fleet Intelligence AI. You have deep knowledge of 
trucking regulations, DOT compliance, FMCSA rules, HOS regulations, ELD requirements, 
freight markets, and fleet management best practices. Answer concisely and accurately.
Fleet context: ${JSON.stringify(fleetContext)}`;
  return callGemini(question, system);
}

/**
 * Document Analysis — reads BOL, CDL, DOT records from image
 */
export async function analyzeDocument(imageBase64, documentType = 'general') {
  const system = `You are a trucking document analyst. Extract all key information from this ${documentType} document.
Return structured data including: document type, key fields, dates, ID numbers, compliance status, and any flags or issues.`;
  return callGemini(`Analyze this ${documentType} document and extract all information.`, system, imageBase64);
}

/**
 * Predictive Lane Intelligence — which lanes will be most profitable
 */
export async function predictLaneProfitability(laneData) {
  const system = `You are a freight market analyst with access to real-time market data. 
Analyze the provided lane data and predict profitability trends. Consider: seasonal patterns, 
fuel costs, driver availability, shipper reliability, and market demand.`;
  const prompt = `Analyze these lanes and predict the top 3 most profitable opportunities for the next 30 days: ${JSON.stringify(laneData)}`;
  return callGemini(prompt, system);
}

/**
 * Driver Coaching — personalized coaching based on HOS and safety data
 */
export async function generateDriverCoaching(driverData) {
  const system = `You are a professional truck driver coach and safety expert. 
Provide personalized, actionable coaching based on the driver's performance data. 
Be encouraging but direct. Focus on safety, compliance, and earnings improvement.`;
  const prompt = `Generate personalized coaching advice for this driver: ${JSON.stringify(driverData)}`;
  return callGemini(prompt, system);
}

/**
 * Compliance Risk Assessment — predict CSA score impact
 */
export async function assessComplianceRisk(fleetData) {
  const system = `You are an FMCSA compliance expert. Analyze fleet data and identify 
compliance risks before they become violations. Reference current DOT regulations and CSA scoring methodology.`;
  const prompt = `Assess the compliance risk for this fleet and provide specific recommendations: ${JSON.stringify(fleetData)}`;
  return callGemini(prompt, system);
}

/**
 * Multi-modal: Analyze a photo of a truck or accident scene
 */
export async function analyzeVehiclePhoto(imageBase64, context = '') {
  const system = `You are a fleet maintenance expert and accident investigator. 
Analyze vehicle photos for: damage assessment, maintenance needs, safety violations, 
load securement issues, or accident documentation. Be thorough and specific.`;
  return callGemini(`Analyze this vehicle photo. Context: ${context}`, system, imageBase64);
}

/**
 * Express Mode — quick single-question trucking answers, optimized for speed
 */
export async function expressQuery(question) {
  const system = `You are a fast-response trucking AI assistant. Give direct, accurate answers. 
No fluff. Trucking expertise: DOT, FMCSA, HOS, ELD, loads, dispatch, fuel, maintenance, compliance.`;
  return callGemini(question, system, null, { temperature: 0.3, maxOutputTokens: 512 });
}

/**
 * Route Weather Intelligence — storm/hazard warnings along a specific truck route
 */
export async function analyzeRouteWeather(origin, destination, weatherData = {}) {
  const system = `You are a truck route safety analyst. Evaluate weather conditions along commercial truck routes.
Flag: ice, high winds (>40mph for high-profile vehicles), heavy rain, fog, extreme heat, and road closures.
Always include safety recommendations and alternative routing suggestions.`;
  const prompt = `Analyze weather conditions for a truck route from ${origin} to ${destination}. Weather data: ${JSON.stringify(weatherData)}. 
Provide: 1) Overall safety rating, 2) Specific hazards by segment, 3) Recommended timing, 4) Alternative routes if needed.`;
  return callGemini(prompt, system);
}

/**
 * Load Profit Intelligence — should the driver take this load?
 */
export async function analyzeLoadProfit(loadData) {
  const system = `You are a freight profitability expert. Analyze loads for true profitability after all costs.
Consider: fuel, tolls, driver pay, deadhead miles, detention risk, broker reliability, and market rates.`;
  const prompt = `Should this driver take this load? Provide a clear YES/NO recommendation with profit breakdown: ${JSON.stringify(loadData)}`;
  return callGemini(prompt, system, null, { temperature: 0.2 });
}

/**
 * Maintenance Diagnosis — AI-powered fault analysis from symptoms or DTC codes
 */
export async function diagnoseTruckFault(symptoms, truckBrand = '', dtcCodes = []) {
  const system = `You are a master certified diesel technician with 30+ years experience on all major truck brands.
Diagnose faults accurately. Provide: root cause, severity (1-10), immediate action required, estimated repair cost range, and step-by-step fix procedure.`;
  const prompt = `Diagnose this truck issue. Brand: ${truckBrand}. DTC Codes: ${dtcCodes.join(', ')}. Symptoms: ${symptoms}`;
  return callGemini(prompt, system);
}

export default {
  getGeminiKey,
  setGeminiKey,
  hasGeminiKey,
  getGeminiMode,
  setGeminiMode,
  isExpressMode,
  askFleetIntelligence,
  analyzeDocument,
  predictLaneProfitability,
  generateDriverCoaching,
  assessComplianceRisk,
  analyzeVehiclePhoto,
  expressQuery,
  analyzeRouteWeather,
  analyzeLoadProfit,
  diagnoseTruckFault,
};
