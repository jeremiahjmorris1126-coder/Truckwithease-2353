/**
 * Accessibility agent catalog + platform lock state — server-side.
 *
 * The original exclusiveAgentLock.js shipped a hardcoded key in the browser
 * bundle, and its verifyPlatformIntegrity() returned `true` on all three code
 * paths, so it enforced nothing at all. Its triggerLockout() redirected the
 * browser, which anyone bypasses by disabling JavaScript. validateAgentCode()
 * referenced an undefined `agentType` and threw.
 *
 * What was worth keeping is the content: six accessibility agents with real
 * feature lists that exist nowhere else in the platform. They are served from
 * here. The "lock" is now an honest statement of licence state computed on the
 * server — no secret in the bundle, no client-side redirect theater.
 */

export const AGENT_LOCK_VERSION = "2.0.0-server";

export type AccessibilityAgent = {
  id: string;
  name: string;
  audience: string;
  features: string[];
};

export const ACCESSIBILITY_AGENTS: AccessibilityAgent[] = [
  {
    id: "deaf",
    name: "Deaf & Hearing Impaired Agent",
    audience: "Drivers who are deaf or hard of hearing",
    features: [
      "Real-time captions",
      "Visual alert system (color-coded)",
      "Haptic feedback patterns (6 types)",
      "ASL video explainers",
      "Emergency alert captions",
      "Phone call transcription",
      "Message urgency indicators",
      "Visual traffic and signal status",
    ],
  },
  {
    id: "blind",
    name: "Blind & Low Vision Agent",
    audience: "Drivers and office staff who are blind or low vision",
    features: [
      "Spatial audio cues",
      "Stereo 3D vehicle positioning",
      "Traffic hazard audio alerts",
      "Voice commands (24+)",
      "Screen reader optimization",
      "Haptic lane guidance",
      "Predictive obstacle warnings",
      "Weather audio descriptions",
    ],
  },
  {
    id: "elderly",
    name: "Elderly & Senior Agent",
    audience: "Older drivers and senior staff",
    features: [
      "Large text (18pt minimum)",
      "Simplified navigation",
      "Voice-first interface",
      "Medication reminders",
      "Fall detection",
      "Health monitoring",
      "Family notifications",
      "Cognitive load reduction",
    ],
  },
  {
    id: "crisis",
    name: "Crisis Support Agent",
    audience: "Any driver in an emergency",
    features: [
      "24/7/365 response",
      "Accident coordination",
      "Medical emergency protocols",
      "Mental health de-escalation",
      "Suicide prevention handoff to 988",
      "Domestic violence safe referral",
      "Financial hardship assistance",
      "Escalation to a human, always",
    ],
  },
  {
    id: "mentor",
    name: "Community Mentor Agent",
    audience: "New drivers and drivers in recovery",
    features: [
      "Mentor matching",
      "Peer support groups",
      "Resource guides",
      "Recovery stories",
      "Anonymous board",
      "New-driver onboarding buddy",
      "Route and lane advice from peers",
      "Escalation to crisis support when needed",
    ],
  },
  {
    id: "coordinator",
    name: "Accessibility Coordinator Agent",
    audience: "Platform and fleet administrators",
    features: [
      "WCAG 2.1 AA/AAA audit checklists",
      "ADA compliance tracking",
      "Recurring user testing schedule",
      "Cross-team coordination",
      "Vendor accessibility requirements",
      "Feedback integration",
      "Standards monitoring",
      "Team training material",
    ],
  },
];

/**
 * Honest disclosure attached to the catalog. The original file asserted member
 * counts ("2,847 active mentors", "34,291 community members") that no table in
 * this platform can produce. They are removed rather than served as facts.
 */
export const ACCESSIBILITY_NOTE =
  "These six agents are specified and catalogued, not yet wired to live models. Membership and response-time figures from the original file were removed — no table in this platform can produce them, and inventing them on an accessibility feature is not acceptable.";

export type LockState = {
  version: string;
  licensed: boolean;
  reason: string;
  enforcement: string;
};

/**
 * Server-side licence state. Enforcement that matters happens at the API layer,
 * not by redirecting a browser.
 */
export function lockState(): LockState {
  const licensed = process.env.NODE_ENV !== "production" || Boolean(process.env.APPLICATION_ID);
  return {
    version: AGENT_LOCK_VERSION,
    licensed,
    reason: licensed
      ? "Platform instance is licensed."
      : "No APPLICATION_ID on this instance. Agent endpoints stay available; the catalog is marked unlicensed rather than silently pretending.",
    enforcement:
      "Server-side only. There is no key in the browser bundle and no client redirect — the previous version's lockout was cosmetic and its integrity check returned true unconditionally.",
  };
}
