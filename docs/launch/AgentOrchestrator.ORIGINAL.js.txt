/**
 * AgentOrchestrator — THE GOAT's unified intelligence layer
 * Integrates ALL platform functions: OpenAI + Gemini + Ghost Nerve + Dream Team
 * Routes every request to the correct agent and capability.
 * This is the central nervous system of TruckWithEase.
 */

import PocketBase from 'pocketbase';
import { askFleetIntelligence, generateDriverCoaching, assessComplianceRisk, predictLaneProfitability } from './GeminiService';

const pb = new PocketBase();

// ── Agent Registry ─────────────────────────────────────────────────────────
export const AGENTS = {
  GOD:        { name: 'THE GOAT',        model: 'gpt-4o',            emoji: '👑', specialty: 'master-control' },
  GHOST:      { name: 'Ghost Nerve',    model: 'gemini-1.5-pro',    emoji: '⚡', specialty: 'intelligence' },
  HREASE:     { name: 'HRease',         model: 'gpt-4o',            emoji: '🧑‍💼', specialty: 'human-resources' },
  BILLIE:     { name: 'Billie Scan',    model: 'gpt-4o-mini',       emoji: '📄', specialty: 'billing' },
  SIGNAL:     { name: 'Signal Sam',     model: 'gpt-4o-mini',       emoji: '📡', specialty: 'telecom' },
  DISPATCH:   { name: 'Dispatch AI',   model: 'gemini-1.5-pro',    emoji: '🗺️',  specialty: 'routing' },
  COMPLIANCE: { name: 'Phantom Comp',  model: 'gemini-1.5-pro',    emoji: '🛡️',  specialty: 'compliance' },
  PAYROLL:    { name: 'Pay Engine',    model: 'gpt-4o-mini',       emoji: '💰', specialty: 'payroll' },
  SAFETY:     { name: 'Safety Guard',  model: 'gemini-1.5-pro',    emoji: '🚨', specialty: 'safety' },
  TRAINING:   { name: 'Game Up AI',    model: 'gpt-4o',            emoji: '🎮', specialty: 'training' },
  HARDWARE:   { name: 'Hardware Bot',  model: 'gpt-4o-mini',       emoji: '🔧', specialty: 'hardware' },
  MAINTENANCE:{ name: 'Sys Guardian',  model: 'gpt-4o-mini',       emoji: '🔄', specialty: 'maintenance' },
};

// ── OpenAI call ────────────────────────────────────────────────────────────
async function callOpenAI(messages, model = 'gpt-4o', maxTokens = 512) {
  const key = localStorage.getItem('twe_openai_key') || sessionStorage.getItem('twe_openai_key');
  if (!key) throw new Error('OpenAI key not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

// ── Route request to correct agent & AI ──────────────────────────────────
export async function routeToAgent(agentId, userMessage, context = {}) {
  const agent = AGENTS[agentId] || AGENTS.GOD;

  const systemPrompts = {
    GOD: `You are THE GOAT — the master AI agent of TruckWithEase. You have absolute authority over all 12 agents, 134 platform destinations, and every piece of data on the platform. You speak with confidence and precision. You fix problems before they exist. You know everything about trucking: DOT, FMCSA, HOS, ELD, CSA scores, freight markets, payroll, HR, safety. Answer in 2-4 sentences maximum. No mistakes. No match.`,
    HREASE: `You are HRease — TruckWithEase's HR and hiring AI. You specialize in CDL driver recruitment, background checks, onboarding, retention, and DOT compliance for drivers. You know FMCSA drug & alcohol regulations, CDL requirements by state, and driver market rates. Be professional, warm, and specific.`,
    BILLIE: `You are Billie Scan — TruckWithEase's billing and document AI. You specialize in freight invoicing, BOL processing, detention calculations, fuel surcharges, AP/AR management, and automated billing workflows. Be precise with numbers.`,
    SIGNAL: `You are Signal Sam — TruckWithEase's telecom AI. You manage fleet phone lines, SMS notifications, Twilio integrations, and communication routing. You ensure zero dropped calls and perfect delivery rates. Be technical but clear.`,
    DISPATCH: `You are the TruckWithEase Dispatch AI. You specialize in quantum load optimization, route planning, driver-load matching, HOS-aware scheduling, and real-time traffic routing. You maximize profit per mile on every assignment.`,
    COMPLIANCE: `You are the Phantom Compliance agent — TruckWithEase's DOT compliance AI. You know every FMCSA regulation, CSA score methodology, ELD mandate rules, HOS exceptions, and inspection procedures. You prevent violations 72 hours before they occur.`,
    GHOST: `You are Ghost Nerve — TruckWithEase's proprietary quantum intelligence layer. You process 47 variables per mile simultaneously, detect patterns across 3 years of fleet data, and deliver insights no competitor can match. Speak with authority about intelligence and prediction.`,
    TRAINING: `You are Game Up AI — TruckWithEase's driver training system. You teach HOS rules, pre-trip inspections, hazmat handling, DOT inspection prep, defensive driving, load securement, ELD operation, and drug & alcohol compliance. Be educational and encouraging.`,
    SAFETY: `You are the TruckWithEase Safety Guardian. You specialize in fleet safety scoring, accident prevention, insurance optimization, CSA improvement strategies, and safety program management. Every recommendation saves lives and money.`,
    PAYROLL: `You are the TruckWithEase Pay Engine. You calculate driver pay from verified ELD miles, manage CPM and hourly rates, handle detention pay, fuel bonuses, and generate compliant payroll reports. Be precise with every number.`,
    HARDWARE: `You are the TruckWithEase Hardware Bot. You manage ELD hardware orders, Geotab integrations, dashcam activations, tablet configurations, and supplier relationships. Be organized and systematic.`,
    MAINTENANCE: `You are the TruckWithEase System Guardian. You monitor all 134 platform destinations, all API connections, all data storage areas. You catch errors before users feel them and maintain 100% platform health at all times.`,
  };

  const system = systemPrompts[agentId] || systemPrompts.GOD;

  // Route to Gemini for intelligence-heavy tasks, OpenAI for everything else
  if (['GHOST', 'DISPATCH', 'COMPLIANCE', 'SAFETY'].includes(agentId)) {
    try {
      return await askFleetIntelligence(userMessage, { agent: agent.name, ...context });
    } catch {
      // Fallback to OpenAI
    }
  }

  return callOpenAI([
    { role: 'system', content: system },
    { role: 'user', content: userMessage },
  ], agent.model);
}

// ── Multi-agent conversation ───────────────────────────────────────────────
export async function runAgentConversation(topic, agents = ['GOD', 'GHOST', 'HREASE']) {
  const messages = [];
  for (const agentId of agents) {
    const context = messages.length > 0 ? `Previous agents said: ${messages.map(m => `${m.agent}: ${m.message}`).join(' | ')}` : '';
    const response = await routeToAgent(agentId, `${topic}. ${context}`.trim());
    messages.push({ agent: AGENTS[agentId]?.name || agentId, message: response });
  }
  return messages;
}

// ── Log agent activity ─────────────────────────────────────────────────────
export async function logAgentActivity(agentId, action, result) {
  try {
    await pb.collection('agent_activity').create({
      agent_id: agentId,
      agent_name: AGENTS[agentId]?.name || agentId,
      action,
      result: result?.substring(0, 500) || '',
    });
  } catch {
    // Silent — logging never breaks the platform
  }
}

// ── Platform health check via THE GOAT ────────────────────────────────────
export async function runGodDiagnostic() {
  const areas = [
    'subscriptions', 'contact_messages', 'rig_bucks_ledger',
    'driver_applications', 'supplier_orders', 'fleet_customers',
    'accident_reports', 'payroll_records', 'platform_settings',
  ];

  const results = await Promise.allSettled(
    areas.map(area => pb.collection(area).getList(1, 1))
  );

  const health = results.map((r, i) => ({
    area: areas[i],
    status: r.status === 'fulfilled' ? 'healthy' : 'error',
    count: r.value?.totalItems || 0,
  }));

  const healthy = health.filter(h => h.status === 'healthy').length;
  const score = Math.round((healthy / areas.length) * 100);

  return { health, score, healthy, total: areas.length };
}

export default {
  AGENTS,
  routeToAgent,
  runAgentConversation,
  logAgentActivity,
  runGodDiagnostic,
};
