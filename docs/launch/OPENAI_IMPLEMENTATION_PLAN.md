# OpenAI Implementation Review & Plan — TruckWithEase

**Date:** August 25, 2026
**Scope:** Review of every OpenAI-related code path in this repo, plus a sequenced plan to fix it.
**Status:** Phases 0, 1, and 2 **SHIPPED and verified Aug 25, 2026** (plan approved by Jeremiah). Phase 3 is still a decision.

### Execution status (updated Aug 25, 2026)

| Phase | Status |
| --- | --- |
| Phase 0 — remove dead/dangerous browser-side OpenAI code | ✅ **SHIPPED** — both service files rewritten as `/api/agent/*` proxies, `getFallbackResponse()` deleted, originals preserved in `docs/launch/`, `POST /api/agent/humanai` added, `GeminiIntegrationPage` key-read removed + palette fixed. Gate: `rg twe_openai_key packages/web/src/web` → 0 |
| Phase 1 — harden the live gateway path | ✅ **SHIPPED except streaming** — timeouts (30s / 15s driving), `maxRetries: 2`, `maxOutputTokens`, typed `AgentFailure`/`AgentResult`, JSON-line usage logging. **`streamText` deliberately deferred** — it changes the chat UI and needs its own click-through verification |
| Phase 2 — real structured outputs | ✅ **SHIPPED** — `generateObject` + Zod for `generateScreeningQuestions()` and `evaluateScreening()`; the `text.slice(text.indexOf(...))` parsing is gone (grep → 0) |
| Phase 3 — does OpenAI enter the stack at all | 🟡 **NARROWED** — voice is off the table (decision #4 resolved). Only two candidates remain |

Gates after Phases 0–2: `bun run build` ✓ 11.04s, `node scripts/crash-audit.mjs` → 0 findings, web 4200 + mobile 4300 → 200.

### About the skills you asked for

You asked me to use an "OpenAI Docs skill" and a "Frontend skill," installing them if missing. Neither exists in this sandbox, and there is no install mechanism — `/home/user/.skills` contains only `app, audio-production, carousel, create-skill, excel, image-slides, pptx-slides, report`, and `create-skill` authors new skills, it is not a registry client. So I used the fallback you specified: `web_search` plus live fetches of `developers.openai.com/api` (every docs page returns clean Markdown if you append `.md` to the URL). All docs claims below are cited to those pages, pulled today.

---

## Bottom line

**There is no working OpenAI implementation in TruckWithEase to optimize.** What exists is:

1. **Two dead browser-side files** that call `api.openai.com` directly from the user's browser. One of them **fabricates fleet statistics and presents them to the user as AI answers** whenever the call fails — which is always, because no OpenAI key is stored anywhere the app reads.
2. **A working AI path that is not OpenAI at all.** `packages/web/src/api/agent/` runs Anthropic (`claude-sonnet-4.6`, `claude-haiku-4.5` in driving mode) through the Vercel AI SDK + AI Gateway. This is the path your 11 `/api/agent/*` endpoints actually use, and it works.

So the real work splits three ways: **delete the dangerous dead code**, **harden the path that actually runs**, and **decide separately whether OpenAI belongs in the stack at all** (Phase 3 — a product decision, not a code task).

Your `sk-proj-42OCNRsz…` key is currently wired to nothing. `grep -c OPENAI_API_KEY .env` returns 0. `routes/vault.ts` L27 previously advertised `label: "OpenAI (voice + TTS)"`; since voice is now settled on Gemini, that label was corrected to `"OpenAI (parked — no code reads this key)"` so the vault stops implying a capability that does not exist.

---

## 1. The current request flow, traced

### 1a. Dead path A — `legacy/services/OpenAIService.js` (54 lines, browser-side)

```
AICharactersPage.jsx (~L1609, "LIVE CHAT WITH OPENAI")  →  askAgent()
  → PocketBase shim → GET /api/settings (platform_settings, key="openai_api_key")
  → fetch("https://api.openai.com/v1/chat/completions") FROM THE BROWSER
     model: gpt-4o-mini, max_tokens: 300, temperature: 0.7
  → any failure → getFallbackResponse()
```

`getFallbackResponse()` returns hardcoded strings including **"All 134 destinations running clean," "47 profit variables recalculated," "SMS delivery at 99.8%," "0 dropped calls."** None of that is measured anywhere in this codebase. It renders in the chat bubble looking exactly like a real answer.

This is the same defect class we already deleted from Fleet Safety Intelligence, the Quantum pages, and the fake voice-bar animation. Same treatment applies.

**Consumers:** `legacy/App.jsx`, `legacy/AICharactersPage.jsx`, `legacy/pages/AgentOrchestrator.jsx`, `legacy/pages/GeminiIntegrationPage.jsx`.

### 1b. Dead path B — `legacy/services/AgentOrchestrator.js` (140 lines, browser-side)

```
AgentOrchestrator.jsx / App.jsx  →  routeToAgent() / runAgentConversation()
  → localStorage.getItem("twe_openai_key")  (or sessionStorage)
  → fetch("https://api.openai.com/v1/chat/completions") FROM THE BROWSER
  → logAgentActivity() → PocketBase collection "agent_activity"  ← never existed
  → runGodDiagnostic() → polls 9 PocketBase collections, computes a "health score"
```

Two separate problems: **a real key placed here is readable from devtools by any user**, and `logAgentActivity()` writes into a collection that has never existed in 44 tables, so it silently fails on every call. `AGENTS` hardcodes `gpt-4o` / `gpt-4o-mini` / `gemini-1.5-pro` — all legacy relative to the current catalog.

### 1c. The live path — `api/agent/` + `api/routes/agent.ts` (**no OpenAI**)

```
POST /api/agent/:endpoint  (routes/agent.ts, 76 lines, 11 POSTs + /status /roster /dot/:state)
  → agent/index.ts (275 lines)
    → hasAI()  = !!AI_GATEWAY_API_KEY && !!AI_GATEWAY_BASE_URL     (gateway.ts L8)
    → false → demoReply()  ← honest, labelled "(demo mode)". Correct behavior. Keep.
    → true  → generateText({ model: gateway("anthropic/claude-sonnet-4.6"), ... })
              driving:true → "anthropic/claude-haiku-4.5"
  → system prompt = `${PLATFORM_GUARDRAILS}\n\n${PERSONA}`, then profile/driving/context appended
```

Prompt structure here is already correct for caching: static guardrails and persona come **first**, per-request data comes **after**. That ordering is exactly what the prompt-caching docs require, so it needs no change — worth stating so nobody "optimizes" it backwards.

**What this path is missing:**

| Gap | Where | Consequence today |
| --- | --- | --- |
| No streaming — `generateText` only | `agent/index.ts` L194, L220, L251 | Chat surfaces sit blank for the full generation. Worst UX defect in the AI feature. `@ai-sdk/react@^4.0.16` is already a dependency, so the client half is free. |
| No timeout / `abortSignal` | all three call sites | A hung gateway hangs the request until the platform kills it. Only `intel.ts` L67, `fuel.ts` L80, `lib/eia-fuel.ts` L49 use `AbortSignal.timeout` anywhere in the API. |
| No explicit `maxRetries` | all three call sites | Running on SDK defaults, undocumented for our purposes, unbounded interaction with the missing timeout. |
| Hand-rolled JSON parsing | `generateScreeningQuestions` (L232), `evaluateScreening` (L263) | `JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1))`. One stray bracket in prose and HR pre-screen silently falls back. |
| `catch → demoReply` swallows everything | L203 and the two fallbacks | A real 500, a bad key, and "no key configured" are **indistinguishable** to you and to the driver. This is the single biggest debuggability problem. |
| No token cap | all three call sites | Unbounded output length on a per-driver-metered product. |
| No usage/cost logging | everywhere | Zero visibility into spend before an Aug 31 launch. |

### 1d. Multimodal today is Gemini, not OpenAI

`api/routes/gemini.ts` (shipped and verified live this session) does OCR on `gemini-3.6-flash` and TTS on `gemini-2.5-flash-preview-tts`. That is the working multimodal path. Any OpenAI multimodal proposal is a *replacement* argument, not a gap-filling one.

---

## 2. What the current OpenAI docs actually say

Pulled today from `developers.openai.com/api/docs` (L1 — official vendor docs).

- **Model catalog** (`/api/docs/models`, `/models/all`): frontier line is **GPT-5.6 Sol** (complex professional work), **GPT-5.6 Terra** (balanced intelligence/cost), **GPT-5.6 Luna** (cost-sensitive). Images: **GPT-Image-2**. Realtime/audio: **GPT-Realtime-2.1** and **2.1 Mini**, **GPT-Realtime-Translate**, **GPT-Live-Transcribe**, **GPT-Audio-1.5**. **`gpt-4o` and `gpt-4o-mini` — the two models hardcoded in our dead files — are legacy relative to this list.**
- **Responses API is the recommended primitive** (`/api/docs/migrate-to-responses`). Agentic by default: one request can invoke `web_search`, `file_search`, `image_generation`, `code_interpreter`, remote MCP servers, plus custom functions. Stateful via `store: true` + `previous_response_id`.
- **Prompt caching** (`/api/docs/prompt-caching`): automatic, **50% discount on cached input tokens, no code change required**. Minimum cacheable prefix **1,024 tokens for GPT-5.6 and later** (2,048 for older). Cache lives ~5–10 min idle, up to ~1 hour. Static content must come first. `prompt_cache_key` can steer routing.
- **Structured Outputs** (`/api/docs/structured-outputs`): `json_schema` with **`"strict": true`** guarantees schema adherence. Responses carry a **`refusal`** field that must be handled separately from content — a refusal is not a parse failure and must not be treated as one.

I have **not** pulled `/api/docs/pricing.md`, so nothing in this document quotes a dollar figure beyond the documented 50% cached-input discount. Pull it before any cost modeling.

---

## 3. The plan

Sequenced. Each phase is independently shippable. Phases 0–2 are **behavior-compatible** except where explicitly noted.

### Phase 0 — Stop the bleeding (½ day, no new provider, no new key)

**Files:** `legacy/services/OpenAIService.js`, `legacy/services/AgentOrchestrator.js`, and their 4 consumers (`legacy/App.jsx`, `legacy/AICharactersPage.jsx`, `legacy/pages/AgentOrchestrator.jsx`, `legacy/pages/GeminiIntegrationPage.jsx`).

Steps:
1. Preserve both originals to `docs/launch/OpenAIService.ORIGINAL.js.txt` and `docs/launch/AgentOrchestrator.ORIGINAL.js.txt` (house convention, ~29 files there already).
2. Rewrite both service files as thin `fetch("/api/agent/...")` wrappers, **keeping the exact export signatures** — `askAgent`, `AGENT_PROMPTS`, `AGENTS`, `routeToAgent`, `runAgentConversation`, `logAgentActivity`, `runGodDiagnostic`. Nothing in the 4 consumer pages needs to change shape.
3. Delete `getFallbackResponse()` entirely. When `hasAI()` is false the server already returns an honest labelled demo reply — that becomes the only fallback.
4. `logAgentActivity()` → no-op returning `{ logged: false, reason: "no agent_activity table" }` until we decide whether we want that table.
5. `runGodDiagnostic()` → call the existing `/api/agent/status` + `/roster` rather than polling 9 PocketBase shim collections.

**Benefit:** removes the last place a real API key could sit in the browser; removes fabricated fleet statistics from a user-facing surface; removes two dead network paths that fail on every call.
**Tradeoff:** the AI Characters chat and the Orchestrator page stop producing instant confident-looking text. Until `AI_GATEWAY_API_KEY` is live they show `(demo mode)`. That is worse-looking and more honest — the same trade you accepted on Fleet Safety.

### Phase 1 — Harden the live gateway path (1 day)

**File:** `packages/web/src/api/agent/index.ts` (three `generateText` call sites), plus `routes/agent.ts` for the streaming endpoints.

| Change | Benefit | Tradeoff |
| --- | --- | --- |
| Add `abortSignal: AbortSignal.timeout(30_000)` (15s when `driving: true`) | A hung provider fails fast with a real message instead of hanging the driver's request | A genuinely slow long answer can now get cut off; the timeout number needs one round of tuning against real latency |
| Add explicit `maxRetries: 2` | Bounded, documented retry behavior instead of SDK defaults | Retries multiply worst-case latency; must be set *under* the timeout budget, not over it |
| Switch chat surfaces to `streamText` + `toDataStreamResponse()`; keep `generateText` for the JSON helpers | Largest perceived-latency win available. `@ai-sdk/react` already installed, so client cost is low | Streaming responses can't be post-validated before the first token reaches the user; needs a client-side error state for a mid-stream failure. Non-chat callers must stay on `generateText` |
| Replace `catch → demoReply` with typed failures: `{ live: false, reason: "no_key" \| "timeout" \| "provider_error", note }` | You can finally tell "not configured" from "broken" in the log and on screen | Slightly more surface area in the response contract; the 4 legacy consumers must tolerate the new field (they ignore unknown keys today, so low risk) |
| Add `maxOutputTokens` per persona (short for driving mode) | Caps cost per call; enforces the "keep it brief while moving" rule already in `DRIVER_ASSISTANT` | A truncated answer is possible on genuinely long compliance explanations; set generously for parked mode |
| Log `usage` (input/output/cached tokens) per call | Cost visibility before Aug 31 | Needs a table or a log sink — small schema decision (see §5) |

**Explicitly not changing:** prompt assembly order. `${PLATFORM_GUARDRAILS}\n\n${PERSONA}` first, then per-request driver profile, is already the cache-friendly ordering the docs prescribe. Leave it.

### Phase 2 — Real structured outputs (½ day)

**File:** `agent/index.ts` — `generateScreeningQuestions()` (L218–232) and `evaluateScreening()` (L249–263).

Replace the `indexOf`/`lastIndexOf` string slicing with `generateObject` + a Zod schema (AI SDK path, provider-agnostic, works with the Anthropic gateway we already have). If OpenAI later enters the stack, the same shape maps to `json_schema` with `strict: true`.

**Benefit:** HR pre-screen stops silently falling back to canned questions because a model wrapped its JSON in prose. Schema violations become explicit errors.
**Tradeoff:** strict schemas reject an otherwise-usable answer that drifts from shape; you need the fallback path to stay in place, and a refusal must be surfaced as a refusal rather than swallowed as a parse error.

### Phase 3 — Does OpenAI enter the stack at all? (decision, not code)

Anthropic-via-gateway already covers text. **Voice was ruled out on Aug 25, 2026 — Gemini TTS stays, OpenAI Realtime declined** (decision #4). That leaves OpenAI as **additive, not corrective**, in exactly two places:

1. ~~**Voice** — GPT-Realtime-2.1 / GPT-Audio-1.5~~ **CLOSED. Gemini TTS stays.** The shipped, verified one-way player on the six mapped Co-Pilot characters is the voice path. No OpenAI Realtime, no second audio provider, no second audio bill.
2. **Images** — GPT-Image-2. No current product need in this app. Lowest priority of the two.
3. **Built-in `web_search` / `file_search`** — the only genuinely interesting one left. Could replace hand-rolled retrieval, and pairs naturally with the HR document storage that has no UI yet. If OpenAI enters the stack at all before Aug 31, this is the reason.

**Non-negotiable if this proceeds:** the key is read server-side only, via `getKeyOrEnv("openai", "OPENAI_API_KEY")` (`routes/vault.ts` L85) — the same pattern `gemini.ts` and `intel.ts` use. It never reaches the browser. That is precisely why Phase 0 has to happen first regardless of this decision.

**Also non-negotiable:** the API is plain Hono (`new Hono().basePath('api')` + `.route(...)`), not oRPC. New routes follow that. No conversion is proposed here.

---

## 4. Validation (lightweight, matching the house style)

Follow the existing pattern — curl, `/tmp/*.json`, `curl -w "%{http_code}"`, no test framework added.

1. **Endpoint shape sweep** — script hitting all 11 `POST /api/agent/*` plus `/status`, `/roster`, `/dot/:state`; assert HTTP 200 and presence of the `live` flag. Run before and after each phase; the diff should be empty for Phases 0–2 except for the new `reason` field.
2. **No-key run** — unset `AI_GATEWAY_API_KEY`, restart tmux (Vite hot-reloads routes but **not** `.env`), assert every endpoint returns `live: false` and text containing `(demo mode)`. Guards against Phase 1 accidentally making a missing key look like an outage.
3. **Timeout injection** — point `AI_GATEWAY_BASE_URL` at a deliberately dead host; assert the request fails in ~30s with `reason: "timeout"`, not a hang.
4. **Streaming smoke** — `curl -N` one chat endpoint, confirm chunks arrive incrementally rather than in one block.
5. **Schema conformance** — call `generateScreeningQuestions` and `evaluateScreening` 5× each, assert every result parses against the Zod schema with zero fallbacks triggered.
6. **Browser-key check** — `grep -rn "api.openai.com\|localStorage.getItem(\"twe_openai" packages/web/src/web` must return 0 after Phase 0. This is the security gate.
7. **Build gate** — `bun run build` (currently ✓ ~11–12s) and `node scripts/crash-audit.mjs` (currently 249 files, 0 findings). Lint is not a gate; the ~2,130 errors are pre-existing legacy.
8. **Visual gate** — Playwright click-through on `/ai-team`, per the pattern at `/tmp/pwv.py`. A screenshot of a loaded page proves nothing about step 2 of a chat flow.

---

## 5. Decisions needed from you before code moves

1. **Phase 3 yes/no** — **OPEN, narrowed.** Does OpenAI join the stack for launch (now only for `web_search`/`file_search`, or GPT-Image-2), or stay parked past Aug 31? Phases 0–2 shipped either way, so this does not block.
2. **`AI_GATEWAY_API_KEY`** — **still OPEN.** It is answering real model calls right now (every verification in Phases 1–2 hit a live model), but you have not said whether that is a funded balance or a trial. Is it live and funded? Every AI surface in the app is in demo mode until it is. This is the single highest-leverage item in this document and it is not a code change.
3. **Usage logging destination** — **still OPEN.** Shipped as stdout JSON lines (`{"evt":"ai_usage",…}`) because that needed no schema change. Do you want a real `ai_usage` table (45th) instead? A table means a `db:push`.
4. ✅ **RESOLVED Aug 25, 2026 — Gemini TTS stays. OpenAI Realtime declined.** Your answer: "we stay on Gemini TTS." No second audio provider. Do not reopen without a new instruction.
5. **`agent_activity`** — **still OPEN.** Shipped as a no-op returning `{ logged: false }`. Do you want a real activity log table, or does the no-op stand?
6. **Timeout budget for driving mode** — **15s is now implemented** (30s parked). Say the word and I'll change the number. You know what a driver will tolerate mid-run better than I do.

---

## Sources (all L1, fetched Aug 25, 2026)

- `https://developers.openai.com/api/docs/models` — current model catalog
- `https://developers.openai.com/api/docs/models/all` — full model list incl. realtime/audio/image
- `https://developers.openai.com/api/docs/migrate-to-responses` — Responses API as recommended primitive, built-in tools, statefulness
- `https://developers.openai.com/api/docs/prompt-caching` — automatic caching, 50% cached-input discount, 1,024-token minimum prefix, ordering requirement
- `https://developers.openai.com/api/docs/structured-outputs` — `json_schema` + `strict: true`, `refusal` field
- `https://developers.openai.com/api/docs/pricing` — **not pulled; pull before quoting any cost figure**

Local copies saved to `/tmp/oai-migrate-to-responses.md`, `/tmp/oai-prompt-caching.md`, `/tmp/oai-structured-outputs.md`.
