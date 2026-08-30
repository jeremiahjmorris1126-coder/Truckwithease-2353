import { generateText, generateObject, streamText } from "ai";
import { z } from "zod";
import dedent from "dedent";
import { gateway, hasAI } from "./gateway";
import { DRIVER_ASSISTANT, PLATFORM_GUARDRAILS, DRIVING_MODE } from "./driver-assistant";
import {
  THE_GOAT,
  ROAD_AGENT,
  GHOST_NERVE,
  FLEET_MIND,
  NEURAL_SAFETY,
  FINANCE_ALERT,
  MEMORY_AGENT,
  PAGE_GUARDIAN,
} from "./personas";

const FLEET_CHIEF = dedent`
  You are "Fleet Chief" — a master truck & trailer diesel mechanic and fleet advisor inside TruckWithEase.
  You are prolific in BOTH tractor AND trailer repair: engines (Cummins X15, Detroit DD15, PACCAR MX-13),
  aftertreatment/DPF/DEF, air brakes & brake chambers, wheel ends, fifth wheel, axles, landing gear,
  reefer units (Thermo King, Carrier), trailer electrical/7-way, ABS, suspension (air ride, spring),
  dry van/flatbed/tanker/reefer specifics. You give real mechanic-level diagnosis by make/model/year.
  Always: 1) most likely cause, 2) how to confirm, 3) fix + rough parts/labor, 4) is it safe/legal to drive
  (cite FMCSA 396 out-of-service criteria when relevant). Be direct and practical, like a shop foreman.
  Keep answers tight. Use short sections. Never invent torque specs — say "check OEM spec".
`;

const HEALTH_CHIEF = dedent`
  You are "Health Chief" — the smartest DOT-physical and trucker-wellness coach in the industry, inside TruckWithEase.
  You know 49 CFR 391.41 physical qualification standards cold: blood pressure cert windows (Stage 1/2/3,
  disqualifying at >=180/110), BMI & sleep apnea screening, diabetes/insulin, vision/hearing, medications.
  You coach realistic road-life wellness: eating at truck stops, sleep, exercise in a cab, hydration, fatigue.
  Always clarify you are not a doctor and DOT cert decisions belong to a certified medical examiner.
  Be encouraging, specific, and practical for a working driver.
`;

const HUMANAI = dedent`
  You are "HumanAI" — the HR Manager for a trucking company, embedded in TruckWithEase.
  You carry the knowledge of a masters-credentialed HR professional (SHRM-SCP and PHR),
  specialized in DOT/FMCSA-regulated trucking workforce management. You are precise,
  compliant, and human — protective of both the company and the driver.

  Your expertise:
  - Driver qualification files (49 CFR 391): application, MVR, road test, previous-employer
    safety history (391.23), annual review, medical certification, Clearinghouse queries.
  - Hiring & pre-screen interviews: role-appropriate, legal (no protected-class questions),
    behavioral + situational, verifying experience, gaps, accidents, violations, motivations.
  - Occurrence & progressive discipline: documenting violations, accidents, complaints,
    coaching, commendations; defensible written records; CSA/BASIC awareness.
  - Background & screening: MVR, criminal, employment verification, PSP, FMCSA Clearinghouse,
    drug/alcohol testing (49 CFR 382), FCRA-compliant adverse-action process.
  - Payroll for drivers: cents-per-mile vs hourly vs salary, detention/layover pay, per diem,
    multi-state withholding basics, pay statements. (You explain; a CPA/payroll processor files taxes.)
  - Cost vs revenue per run and per driver: revenue minus fuel, pay, tolls, maintenance, other.

  Always: be specific and actionable, cite the relevant CFR when it matters, flag legal risk,
  and never give an illegal or discriminatory recommendation. When you lack a data point, ask for it.
  You are not a lawyer; recommend counsel for adverse actions, terminations, and disputes.
  Keep answers tight and well-structured. Speak like a seasoned HR director who knows trucking.
`;

function demoReply(agent: string, prompt: string) {
  if (agent === "driver-assistant") {
    return dedent`
      **Driver Assistant (demo mode)** — add an AI Gateway key for full answers.

      On "${prompt.slice(0, 80)}": I cannot confirm live hours, parking, or road conditions
      without a data connection. Safest next step is to check your ELD for remaining drive time
      and pick a stop with confirmed capacity before you get tight on hours.
    `;
  }
  if (agent === "humanai") {
    return dedent`
      **HumanAI (demo mode)** — add an AI Gateway key for full answers.

      On "${prompt.slice(0, 80)}": As your HR manager, I'd anchor this in the driver qualification
      file (49 CFR 391) and keep everything documented and defensible. Tell me the driver or
      candidate and the specific situation — hiring, an occurrence, background, or payroll — and
      I'll give you the compliant next step, the paperwork you need, and any legal risk to watch.
    `;
  }
  if (agent === "health-chief") {
    return dedent`
      **Health Chief (demo mode)** — add an AI Gateway key for full answers.

      On "${prompt.slice(0, 80)}": For DOT purposes, blood pressure under 140/90 keeps you at a full 2-year card.
      140–159/90–99 is Stage 1 (still certifiable, monitor it). 160–179/100–109 is Stage 2 (one-time 1-year cert).
      180/110 or higher is disqualifying until controlled. Hydrate, cut the truck-stop sodium, walk 10 min every
      fuel stop. Not medical advice — your certified examiner makes the call.
    `;
  }
  const DEMOS: Record<string, string> = {
    "the-goat": `As the final authority here, I rank by exposure: out-of-service risk first, then DOT-recordable exposure, then cost. Give me the section to scan — incidents, drivers, maintenance, loads, or money — and upload your fleet procedure document and I'll enforce it clause by clause against 49 CFR.`,
    "road-agent": `I don't have live traffic or weather feeds in demo mode, and I won't call a road clear on my own authority. Check 511 and the state DOT for the corridor, then give me origin, destination, trailer type and your height/weight and I'll build the brief around it.`,
    "ghost-nerve": `No fleet telemetry connected in demo mode, so there's nothing real to flag. Wire up fuel, DEF, DVIR and inspection history and I'll baseline each unit against itself and surface drift before it becomes a breakdown.`,
    "intelligence-mind": `Every answer I give normalizes per mile, per truck, per week — raw totals lie when your miles change. Send revenue, fuel, maintenance and pay data and I'll show the trend, the driver behind it, and what it's worth in dollars per mile.`,
    "neural-safety": `Highest-risk item first, always. In demo mode I have no logs to score. Connect HOS, inspections and speed events and I'll give you a composite 0-100 with speeding normalized per 100 miles and violations as a weekly rate — not raw counts that punish your hardest-running driver.`,
    "finance-alert": `Priority order is cash runway, receivables aging, revenue dip, then cost spike. One rule I never break: I don't recommend deferring a safety-critical repair to protect cash — you park the truck instead. Connect your invoices and expenses and I'll date the day it gets tight.`,
    "memory-agent": `I hold durable facts, fleet history and your preferences so every other agent stops asking twice. I don't store card numbers, SSNs, medical detail beyond DOT cert status, or keys. Tell me what to remember and I'll restate it as one durable fact.`,
    "page-guardian": `No health-check results in context, so I have nothing to report — and I won't call a route healthy without one. Triage order when I do: pages a driver hits rolling (HOS, DVIR, SOS, fuel, loads), then compliance, then admin.`,
  };
  if (DEMOS[agent]) {
    return dedent`
      **${agent} (demo mode)** — add an AI Gateway key for full answers.

      On "${prompt.slice(0, 80)}": ${DEMOS[agent]}
    `;
  }
  return dedent`
    **Fleet Chief (demo mode)** — add an AI Gateway key for full answers.

    On "${prompt.slice(0, 80)}": Start with the most common cause, confirm before throwing parts at it, and check
    FMCSA 396 out-of-service criteria before you roll. Give me the make/model/year and the symptom (codes, noise,
    when it happens) and I'll walk you through diagnosis, the fix, and whether it's safe to drive.
  `;
}

export type AgentId =
  | "driver-assistant"
  | "fleet-chief"
  | "health-chief"
  | "humanai"
  | "the-goat"
  | "road-agent"
  | "ghost-nerve"
  | "intelligence-mind"
  | "neural-safety"
  | "finance-alert"
  | "memory-agent"
  | "page-guardian";

const SYSTEMS: Record<AgentId, string> = {
  // The driver assistant IS the governing spec — guardrails are already inside it.
  "driver-assistant": DRIVER_ASSISTANT,
  // Specialists narrow the topic; they never relax the platform guardrails.
  "fleet-chief": `${PLATFORM_GUARDRAILS}\n\n${FLEET_CHIEF}`,
  "health-chief": `${PLATFORM_GUARDRAILS}\n\n${HEALTH_CHIEF}`,
  humanai: `${PLATFORM_GUARDRAILS}\n\n${HUMANAI}`,
  "the-goat": `${PLATFORM_GUARDRAILS}\n\n${THE_GOAT}`,
  "road-agent": `${PLATFORM_GUARDRAILS}\n\n${ROAD_AGENT}`,
  "ghost-nerve": `${PLATFORM_GUARDRAILS}\n\n${GHOST_NERVE}`,
  "intelligence-mind": `${PLATFORM_GUARDRAILS}\n\n${FLEET_MIND}`,
  "neural-safety": `${PLATFORM_GUARDRAILS}\n\n${NEURAL_SAFETY}`,
  "finance-alert": `${PLATFORM_GUARDRAILS}\n\n${FINANCE_ALERT}`,
  "memory-agent": `${PLATFORM_GUARDRAILS}\n\n${MEMORY_AGENT}`,
  "page-guardian": `${PLATFORM_GUARDRAILS}\n\n${PAGE_GUARDIAN}`,
};

/**
 * Raw composed system prompt for an agent, guardrails included.
 * Used by /api/integrity to hash and verify each agent server-side.
 */
export function agentSystemPrompt(agent: AgentId): string {
  return SYSTEMS[agent];
}

/** Display names + blurbs for the /ai-team roster page. */
export const AGENT_ROSTER: { id: AgentId; name: string; role: string }[] = [
  { id: "the-goat", name: "THE GOAT", role: "Supreme master agent — scans the operation, enforces your fleet procedure, final authority" },
  { id: "fleet-chief", name: "INDEX=MECHANIC / Fleet Chief", role: "Master tractor & trailer diesel diagnosis, out-of-service calls" },
  { id: "driver-assistant", name: "Driver Assistant", role: "In-cab co-pilot — hours, routing, parking, hands-free" },
  { id: "road-agent", name: "Road Agent", role: "Traffic, weather, construction and congestion in one road brief" },
  { id: "neural-safety", name: "Neural Safety", role: "HOS violations, inspection failures, accident-risk behavior patterns" },
  { id: "health-chief", name: "Health Chief", role: "DOT physical standards and road-life wellness coaching" },
  { id: "humanai", name: "HumanAI", role: "HR manager — driver qualification files, hiring, discipline, payroll" },
  { id: "finance-alert", name: "Finance Alert", role: "Cash runway, slow-pay brokers, revenue dips and cost spikes" },
  { id: "intelligence-mind", name: "Fleet Mind", role: "Deep trend analysis across revenue, performance, cost and exposure" },
  { id: "ghost-nerve", name: "Ghost Nerve", role: "Predictive anomaly layer — catches drift before it becomes a breakdown" },
  { id: "memory-agent", name: "Memory Management", role: "The platform's memory — keeps every agent on your fleet's real history" },
  { id: "page-guardian", name: "Page Guardian", role: "Background monitor — catches broken pages before a driver hits one" },
];

export type RunOpts = {
  /** Vehicle is in motion — force short, voice-shaped, no-screen answers. */
  driving?: boolean;
  /** Saved driver profile (height, weight, axles, hazmat, remaining hours...). */
  profile?: Record<string, unknown> | null;
};

function buildSystem(agent: AgentId, contextNote?: string, opts?: RunOpts) {
  let system = SYSTEMS[agent];
  if (opts?.profile && Object.keys(opts.profile).length) {
    system += `\n\n# Driver profile on file\n${JSON.stringify(opts.profile, null, 2)}\nUse these values. Do not ask for anything already listed here. If a value needed for a routing or weight decision is missing, ask for that one value before answering.`;
  }
  if (opts?.driving) system += `\n\n${DRIVING_MODE}`;
  if (contextNote) system += `\n\n${contextNote}`;
  return system;
}

/**
 * Why a request produced a fallback instead of a model answer.
 * Before this existed, a real 500, a provider timeout and "no key configured" were all
 * indistinguishable — every failure went through the same `catch -> demoReply`.
 */
export type AgentFailure = "no_key" | "timeout" | "provider_error" | null;

export type AgentResult = {
  text: string;
  /** True only when a model actually answered. */
  live: boolean;
  reason: AgentFailure;
  note?: string;
};

/** Wall-clock budget for one agent call. Driving mode is tighter: a driver will not wait. */
const TIMEOUT_MS = 30_000;
const DRIVING_TIMEOUT_MS = 15_000;
/** Bounded retries. Must stay well inside the timeout budget above. */
const MAX_RETRIES = 2;
/** Output caps. Driving mode is voice-shaped and short by design (see DRIVING_MODE). */
const MAX_TOKENS = 1600;
const DRIVING_MAX_TOKENS = 400;

function isTimeout(e: unknown) {
  const name = (e as { name?: string })?.name ?? "";
  const msg = String((e as { message?: string })?.message ?? "");
  return name === "TimeoutError" || name === "AbortError" || /timed? ?out|aborted/i.test(msg);
}

async function runDetailed(
  agent: AgentId,
  messages: { role: string; content: string }[],
  contextNote?: string,
  opts?: RunOpts,
): Promise<AgentResult> {
  const system = buildSystem(agent, contextNote, opts);
  const last = messages[messages.length - 1]?.content ?? "";

  if (!hasAI()) {
    return {
      text: demoReply(agent, last),
      live: false,
      reason: "no_key",
      note: "No AI Gateway key configured — this is a demo-mode answer, not a model answer.",
    };
  }

  const driving = !!opts?.driving;
  const started = Date.now();

  try {
    const { text, usage } = await generateText({
      // Haiku in driving mode: answers must land fast when the wheels are turning.
      model: gateway(driving ? "anthropic/claude-haiku-4.5" : "anthropic/claude-sonnet-4.6"),
      system,
      messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      maxOutputTokens: driving ? DRIVING_MAX_TOKENS : MAX_TOKENS,
      maxRetries: MAX_RETRIES,
      abortSignal: AbortSignal.timeout(driving ? DRIVING_TIMEOUT_MS : TIMEOUT_MS),
    });

    // Cost visibility. `cachedInputTokens` is what prompt caching actually saved us.
    console.log(
      JSON.stringify({
        evt: "ai_usage",
        agent,
        driving,
        ms: Date.now() - started,
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        cachedInputTokens: (usage as { cachedInputTokens?: number } | undefined)?.cachedInputTokens ?? null,
      }),
    );

    return { text, live: true, reason: null };
  } catch (e) {
    const timedOut = isTimeout(e);
    console.error(
      JSON.stringify({
        evt: "ai_error",
        agent,
        driving,
        ms: Date.now() - started,
        reason: timedOut ? "timeout" : "provider_error",
        message: String((e as { message?: string })?.message ?? e),
      }),
    );
    return {
      text: demoReply(agent, last),
      live: false,
      reason: timedOut ? "timeout" : "provider_error",
      note: timedOut
        ? `The AI provider did not respond within ${(driving ? DRIVING_TIMEOUT_MS : TIMEOUT_MS) / 1000}s. This is a fallback answer, not a model answer.`
        : "The AI provider returned an error. This is a fallback answer, not a model answer.",
    };
  }
}

/**
 * Streaming form. Same system prompt, same model choice, same timeout/retry/token budget as
 * runDetailed — the only difference is that tokens leave the server as they arrive instead of
 * after the whole answer is built. Chat surfaces use this; every JSON helper stays on generateText.
 *
 * Failure handling is deliberately different from runDetailed: once the first token has been
 * flushed we cannot retract it, so a mid-stream provider failure appends an honest marker line
 * rather than silently swapping in a demo answer. A failure *before* the first token still
 * degrades to the same demoReply path.
 */
async function streamDetailed(
  agent: AgentId,
  messages: { role: string; content: string }[],
  contextNote?: string,
  opts?: RunOpts,
): Promise<{ stream: ReadableStream<Uint8Array>; live: boolean; reason: AgentFailure; note?: string }> {
  const system = buildSystem(agent, contextNote, opts);
  const last = messages[messages.length - 1]?.content ?? "";
  const enc = new TextEncoder();

  if (!hasAI()) {
    const text = demoReply(agent, last);
    return {
      stream: new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(enc.encode(text));
          ctrl.close();
        },
      }),
      live: false,
      reason: "no_key",
      note: "No AI Gateway key configured — this is a demo-mode answer, not a model answer.",
    };
  }

  const driving = !!opts?.driving;
  const started = Date.now();

  const result = streamText({
    model: gateway(driving ? "anthropic/claude-haiku-4.5" : "anthropic/claude-sonnet-4.6"),
    system,
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    maxOutputTokens: driving ? DRIVING_MAX_TOKENS : MAX_TOKENS,
    maxRetries: MAX_RETRIES,
    abortSignal: AbortSignal.timeout(driving ? DRIVING_TIMEOUT_MS : TIMEOUT_MS),
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      let chars = 0;
      try {
        for await (const chunk of result.textStream) {
          chars += chunk.length;
          ctrl.enqueue(enc.encode(chunk));
        }
        const usage = await result.usage.catch(() => undefined);
        console.log(
          JSON.stringify({
            evt: "ai_usage",
            agent,
            driving,
            streamed: true,
            ms: Date.now() - started,
            chars,
            inputTokens: usage?.inputTokens ?? null,
            outputTokens: usage?.outputTokens ?? null,
            cachedInputTokens: (usage as { cachedInputTokens?: number } | undefined)?.cachedInputTokens ?? null,
          }),
        );
      } catch (e) {
        const timedOut = isTimeout(e);
        console.error(
          JSON.stringify({
            evt: "ai_error",
            agent,
            driving,
            streamed: true,
            ms: Date.now() - started,
            chars,
            reason: timedOut ? "timeout" : "provider_error",
            message: String((e as { message?: string })?.message ?? e),
          }),
        );
        // Never fabricate the rest of the answer. Say the stream broke.
        ctrl.enqueue(
          enc.encode(
            chars === 0
              ? demoReply(agent, last)
              : `\n\n[Answer cut off — ${timedOut ? "the AI provider stopped responding" : "the AI provider returned an error"}. Nothing above this line was invented, but the answer is incomplete. Ask again.]`,
          ),
        );
      }
      ctrl.close();
    },
    cancel() {
      // Client navigated away or hit stop; nothing to clean up beyond letting the signal fire.
    },
  });

  return { stream, live: true, reason: null };
}

/** Back-compatible string form. Callers that only need the text keep working unchanged. */
async function run(agent: AgentId, messages: { role: string; content: string }[], contextNote?: string, opts?: RunOpts) {
  return (await runDetailed(agent, messages, contextNote, opts)).text;
}

/**
 * Schemas for the two structured-output helpers. Previously both parsed JSON by slicing
 * text between the first and last bracket, so one stray bracket in prose silently dropped
 * HR pre-screen back to canned questions.
 */
const ScreeningQuestionsSchema = z.object({
  questions: z.array(z.string()).min(1).max(12).describe("Legally-compliant pre-screen interview questions"),
});

const ScreeningEvaluationSchema = z.object({
  score: z.number().min(0).max(100).describe("Job-relevant fit score"),
  recommendation: z.enum(["advance", "hold", "reject"]),
  summary: z.string().describe("2-4 sentence summary of the candidate against the role"),
  redFlags: z.array(z.string()).describe("Job-relevant concerns; empty array if none"),
});

/** AI-generated pre-screen interview question set for a role. Demo fallback included. */
async function generateScreeningQuestions(position: string, experience?: string) {
  const fallback = [
    `How many years of verifiable Class A experience do you have, and on what equipment (dry van, reefer, flatbed, tanker)?`,
    `In the last 3 years, have you had any preventable accidents, moving violations, or out-of-service events? Please explain each.`,
    `Walk me through how you manage your 70-hour/8-day clock and your ELD on a typical week.`,
    `Describe a time weather or a mechanical issue threatened your delivery. What did you do?`,
    `Do you have any endorsements (Hazmat, Tanker, Doubles)? Are they current?`,
    `Why are you leaving your current carrier, and what are you looking for in your next role?`,
    `Are you able to pass a DOT physical, drug screen, and FMCSA Clearinghouse query?`,
  ];
  if (!hasAI()) return fallback;
  try {
    // Schema-validated instead of slicing JSON out of prose with indexOf/lastIndexOf.
    const { object } = await generateObject({
      model: gateway("anthropic/claude-sonnet-4.6"),
      schema: ScreeningQuestionsSchema,
      system: HUMANAI,
      maxRetries: MAX_RETRIES,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      prompt: dedent`
        Generate 7 legally-compliant pre-screen interview questions for a "${position}" role at a trucking company.
        ${experience ? `Candidate reports about ${experience} years experience — tailor a couple of questions to probe that.` : ""}
        Rules: no questions about protected classes (age, race, religion, disability, family, national origin).
        Cover: experience/equipment, safety record, HOS/ELD competence, situational judgment, endorsements,
        motivation/fit, and ability to pass DOT physical + drug screen + Clearinghouse.
      `,
    });
    return object.questions.length ? object.questions.map(String) : fallback;
  } catch {
    return fallback;
  }
}

/** AI evaluation of a completed screening transcript. Demo fallback included. */
async function evaluateScreening(position: string, transcript: { q: string; a: string }[]) {
  const answered = transcript.filter((t) => t.a?.trim()).length;
  const fallback = {
    score: Math.min(90, 50 + answered * 6),
    recommendation: answered >= transcript.length - 1 ? "advance" : "hold",
    summary: `Candidate completed ${answered}/${transcript.length} questions for the ${position} role. Responses cover experience and safety at a screening level. Add an AI Gateway key for a full scored evaluation, then verify with MVR, PSP, and previous-employer safety history (49 CFR 391.23).`,
    redFlags: answered < transcript.length ? ["Incomplete answers — follow up on skipped questions"] : [],
  };
  if (!hasAI()) return fallback;
  try {
    // Schema-validated. The recommendation enum can no longer come back as free text.
    const { object } = await generateObject({
      model: gateway("anthropic/claude-sonnet-4.6"),
      schema: ScreeningEvaluationSchema,
      system: HUMANAI,
      maxRetries: MAX_RETRIES,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      prompt: dedent`
        Evaluate this pre-screen interview for a "${position}" role. Transcript (JSON):
        ${JSON.stringify(transcript)}
        Score fit 0-100, give a recommendation of exactly "advance", "hold", or "reject",
        a 2-4 sentence summary, and a list of red flags (empty if none).
        Judge only job-relevant, legal factors.
      `,
    });
    return {
      score: object.score,
      recommendation: object.recommendation,
      summary: object.summary,
      redFlags: object.redFlags,
    };
  } catch {
    return fallback;
  }
}

export { run as runAgent, runDetailed as runAgentDetailed, streamDetailed as streamAgent, generateScreeningQuestions, evaluateScreening };
