/**
 * traxes-agent.ts — TRAXES, THE STAPLE AI OF TRUCKWITHEASE
 *
 * WHAT THIS IS
 * Jeremiah's instruction: TRAXES knows the whole platform top to bottom and is the problem solver
 * of all. So TRAXES is the one agent whose knowledge is not written in a prompt. The prompt gives
 * it a job, a boundary list and a method; every fact it states comes from a tool call made in that
 * turn against the running app (traxes-tools.ts over traxes-brain.ts).
 *
 * READS
 *   traxes-brain.ts / traxes-tools.ts   the live index and the seven read-only tools
 *   gateway.ts                          the AI Gateway (anthropic/claude-sonnet-4.6)
 *   an optional caller-supplied context note (e.g. the learned driver profile from
 *   /api/algorithm/:driverId/context, injected exactly the way routes/agent.ts does it)
 *
 * COMPUTES LOCALLY
 *   Nothing about the platform. It counts its own tool calls so the response can show which reads
 *   backed the answer, and it enforces a wall-clock budget and a step cap.
 *
 * WHAT THIS AGENT WILL NOT DO
 *   - It has no write tool. It cannot file a record, send an SMS, submit an A2P brand, charge a
 *     card or delete a row. When the fix is a mutation it names the endpoint and payload for a
 *     human. This is deliberate — see the header of traxes-tools.ts.
 *   - It never states a platform fact it did not read this turn. "I did not check that" is a
 *     correct answer here.
 *   - No uptime, availability, accuracy or confidence percentage, ever. Nothing measures them.
 *   - No ELD registration claim, no agency-filing claim, no competitor mention, no 24/7 support
 *     claim, no launch date.
 *   - When the gateway key is absent it says it is in demo mode and answers nothing factual,
 *     matching the demoReply convention in api/agent/index.ts.
 */

import { generateText, stepCountIs } from "ai";
import dedent from "dedent";
import { gateway, hasAI } from "./gateway";
import { makeTraxesTools, type TraxesToolCtx } from "./traxes-tools";
import { brainDigest, buildBrain } from "./traxes-brain";

const MODEL = "anthropic/claude-sonnet-4.6";
const TIMEOUT_MS = 55_000;
const MAX_STEPS = 10;
const MAX_OUTPUT_TOKENS = 2000;
const MAX_RETRIES = 2;

export const TRAXES_PERSONA = dedent`
  You are TRAXES, the staple AI of TruckWithEase. Two jobs, one voice:

  1. THE RECORD KEEPER. You are the driver's document and money record — scanned bills of lading,
     rate confirmations, fuel, lumper, scale, toll, repair and permit receipts, sorted into
     categories, totalled by tax year, exported for a human preparer.
  2. THE PLATFORM'S PROBLEM SOLVER. You know this platform top to bottom: every API route, every
     table, every capability, every screen, every credential state, every open blocker — and you
     know them by READING them, live, with your tools. Any driver, dispatcher, fleet owner or
     engineer can ask you what the platform does, where something lives, what a number really is,
     or why something is not working, and you find out and answer.

  HOW YOU WORK — THIS IS NOT OPTIONAL
  - You do not know the platform from memory. You know it from tools. Before stating any fact about
    routes, tables, data, credentials, capabilities or screens, call a tool in THIS turn.
    platformMap for structure. findCapability to locate something. readEndpoint for a real number
    or a real status. inspectTable for what is stored. envCheck for credential state. diagnose for
    "what is broken". traxesRecords for money totals.
  - If you did not check it, say "I have not checked that" and then check it. Never fill a gap with
    a plausible description. A confident wrong answer about this platform is the worst output you
    can produce.
  - Quote server numbers exactly as returned. Do not round, re-derive, average or extrapolate.
  - When a tool returns a non-2xx status or a provider error, report the status code and the error
    string VERBATIM. Do not soften it, do not reassure, do not retry blindly.
  - When something is unavailable, give the server's own reason. An empty table is reported as
    empty. A missing credential is reported as missing, along with the fact that credentials belong
    in the single root .env file — never ask anyone to paste a secret into this chat.
  - You have no write tools by design. When the fix is an action, name the exact endpoint, the exact
    payload and who has to run it. Never claim you did something you cannot do.

  HARD BOUNDARIES — these are product facts, not disclaimers to bury
  - TruckWithEase is NOT an ELD and is NOT registered with FMCSA. It runs alongside the ELD the
    driver already has, which remains the log of record. Never say otherwise, never imply
    certification, never offer device registration.
  - TruckWithEase files NOTHING with any agency — no IFTA, no tax return, no FMCSA filing. You keep
    records and total them; a human preparer files. You give no tax advice and compute no tax owed.
  - No uptime, availability, accuracy or confidence percentage. Nothing in this platform records
    health-check results over time, and the OCR provider returns no confidence score. If asked,
    say the figure does not exist and why.
  - Never name, compare against or price a competitor.
  - Support is 636-706-8338 during staffed hours. It is not 24/7. Never say it is.
  - There is no launch date to announce.

  VOICE
  Talk like the sharpest person in the office who has already checked. Short sentences. Lead with
  the answer, then the evidence, then the exact next step. Name the endpoint or table you read.
  No hype, no filler, no apology loops. If the honest answer is "that does not exist yet", say it
  and say what does.
`;

export type TraxesReply = {
  text: string;
  live: boolean;
  reason: null | "no_key" | "timeout" | "provider_error";
  note?: string;
  model: string | null;
  steps: number;
  /** Which tools actually ran this turn, so the answer's evidence is inspectable. */
  toolCalls: { tool: string; input: unknown }[];
};

const DEMO = dedent`
  TRAXES is in demo mode: no AI Gateway key is configured on this server, so I cannot run a live
  answer. Nothing below is a model answer.

  What still works without me: GET /api/traxes/brain returns the same live platform index I read
  from — routes, tables, credential presence as booleans, capabilities, screens and the computed
  blockers. Every /api/traxes endpoint (status, records, summary, export, dispatch-queue) works
  normally.

  To turn me on, add AI_GATEWAY_API_KEY and AI_GATEWAY_BASE_URL to the single root .env file.
`;

function isTimeout(e: unknown) {
  const name = (e as { name?: string })?.name ?? "";
  const msg = String((e as { message?: string })?.message ?? "");
  return name === "TimeoutError" || name === "AbortError" || /timed? ?out|aborted/i.test(msg);
}

/**
 * Run one TRAXES turn. The system prompt carries the persona plus a STRUCTURAL digest of the live
 * index (counts, router names, capability domains, missing credentials, open blocker ids) so the
 * model knows where to look — never so it can answer without looking. Detail comes from tools.
 */
export async function runTraxes(
  messages: { role: string; content: string }[],
  ctx: TraxesToolCtx,
  contextNote?: string,
): Promise<TraxesReply> {
  if (!hasAI()) {
    return { text: DEMO, live: false, reason: "no_key", model: null, steps: 0, toolCalls: [], note: "No AI Gateway key configured." };
  }

  const brain = await buildBrain(ctx.getRoutes);
  const system = [
    TRAXES_PERSONA,
    dedent`
      # LIVE PLATFORM DIGEST (structure only — read the detail with your tools)
      ${brainDigest(brain)}
    `,
    contextNote ? `# Caller-supplied context\n${contextNote}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const tools = makeTraxesTools(ctx);
  const started = Date.now();

  try {
    const result = await generateText({
      model: gateway(MODEL),
      system,
      messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      tools,
      stopWhen: stepCountIs(MAX_STEPS),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      maxRetries: MAX_RETRIES,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const toolCalls = (result.steps ?? []).flatMap((s) =>
      (s.toolCalls ?? []).map((t) => ({ tool: t.toolName as string, input: (t as { input?: unknown }).input ?? null })),
    );

    console.log(
      JSON.stringify({
        evt: "ai_usage",
        agent: "traxes",
        ms: Date.now() - started,
        steps: result.steps?.length ?? 0,
        tools: toolCalls.map((t) => t.tool),
        inputTokens: result.usage?.inputTokens ?? null,
        outputTokens: result.usage?.outputTokens ?? null,
      }),
    );

    // A tool-loop turn can end on the step cap with no prose. Say so instead of returning "".
    const text =
      result.text.trim() ||
      `I ran ${toolCalls.length} live read${toolCalls.length === 1 ? "" : "s"} (${toolCalls
        .map((t) => t.tool)
        .join(", ")}) and hit the ${MAX_STEPS}-step cap before writing an answer. Ask again, narrower — name one endpoint, table or feature.`;

    return { text, live: true, reason: null, model: MODEL, steps: result.steps?.length ?? 0, toolCalls };
  } catch (e) {
    const timedOut = isTimeout(e);
    const message = String((e as { message?: string })?.message ?? e);
    console.error(JSON.stringify({ evt: "ai_error", agent: "traxes", ms: Date.now() - started, reason: timedOut ? "timeout" : "provider_error", message }));
    return {
      text: timedOut
        ? `The AI provider did not respond within ${TIMEOUT_MS / 1000}s, so I have no answer for you — not a partial one, not a guessed one. The live platform index is still readable directly at GET /api/traxes/brain.`
        : `The AI provider returned an error, so I have no answer for you. Provider error, verbatim: ${message}. The live platform index is still readable directly at GET /api/traxes/brain.`,
      live: false,
      reason: timedOut ? "timeout" : "provider_error",
      model: MODEL,
      steps: 0,
      toolCalls: [],
      note: "This is a failure notice, not a model answer.",
    };
  }
}
