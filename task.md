# TruckWithEase — Recovery & Merge Tracker

Launch target: **Aug 31, 2026**

## What happened

morrishive.com went down. Two partial sources existed, each missing the other's half:

- **0075 zip** — working Hono + Drizzle + Turso backend, 15 web pages, 8 mobile screens. No real UI.
- **launch-ready tarball** (pulled from morrishive.com, 3.19 MB) — the real product: 293 files,
  127K LOC, 253 pages. No backend, imports PocketBase, calls the dead api.truckwithease.com.

Plan: merge the launch UI into the working backend rather than rebuild either.

## Done

- [x] Recovered `truckwithease-launch-ready.tar.gz` off morrishive.com → `/home/user/recover/app/`
- [x] Copied 296 files into `packages/web/src/web/legacy/` (structure preserved so relative imports resolve)
- [x] Removed `legacy/main.jsx` and `legacy/index.css` (double React mount + Tailwind 3 `@config`)
- [x] PocketBase shim `src/web/lib/pb-shim.ts` — covers all 393 call sites, localStorage-backed,
      `SERVER_COLLECTIONS` proxies drivers/trucks/loads/dvir/hos to the real Hono API
- [x] `src/web/lib/pb.ts` — shared instance re-export so `../lib/pb`, `@/lib/pb`, `./lib/pb` all resolve
- [x] Aliased `pocketbase` → shim in `vite.config.ts`
- [x] Fixed 13 files with bogus `icon:*` imports → `lucide-react`
- [x] Gold-on-black theme in `styles.css` + Tailwind 4 `@theme` tokens for legacy `tw*` classes
- [x] Bebas Neue + Oswald added to `index.html`
- [x] Mounted `legacy/App.jsx` as a Wouter catch-all in `app.tsx` — serves all 491 legacy paths
- [x] **`bun run build` green** — 2,114 modules, no unresolved imports
- [x] Visual verification: `/command`, `/dispatch`, `/traxes` render correctly in gold-on-black
- [x] `design.md` rewritten (was still describing the abandoned navy/amber plan)

## Performance (done)

- [x] All 229 legacy page imports in `App.jsx` converted to `React.lazy` dynamic imports
- [x] Managed `/app/*` pages lazy-loaded; landing page stays eager for fast first paint
- [x] `<Suspense>` boundary + gold-on-black `RouteFallback` spinner in `app.tsx`
- [x] Result: **8,599 KB -> 505 KB** initial JS (159 KB gzip). Each route now pulls only its own
      chunk (most 10-90 KB). Verified `/command`, `/dispatch`, `/traxes` still render.

## AI Driver Assistant (done)

Spec source: "TruckWithEase AI Agent Instructions" PDF. Implemented in
`src/api/agent/driver-assistant.ts`:

- [x] `DRIVER_ASSISTANT` — the full governing prompt, verbatim from the spec
- [x] `PLATFORM_GUARDRAILS` — safety/accuracy/privacy/priority rules now prepended to
      **every** specialist (Fleet Chief, Health Chief, HumanAI). A persona narrows the topic,
      it never relaxes the guardrails.
- [x] `DRIVING_MODE` — when the client reports the vehicle moving: max 2 sentences,
      voice-shaped, no markdown, no screen interaction. Switches to Haiku 4.5 for latency.
- [x] Driver profile injection — saved vehicle specs (height, weight, axles, hazmat,
      remaining hours) go into the system prompt so the agent never re-asks and never
      routes without them
- [x] `POST /api/agent/driver-assistant` accepting `{ messages, driving, profile }`;
      `driving`/`profile` also added to fleet-chief and health-chief

Enforced from the spec: never guess about hours/restrictions/bridge heights/parking/ELD;
say "I cannot confirm that yet"; never claim FMCSA ELD compliance (registration pending);
confirmation required before booking, routing, ELD status changes, or purchases;
priority order safety > compliance > cargo > ETA > parking > fuel > cost > convenience.

## Brand assets (done)

Logo reconstructed clean from the Canva screen photo, rebuilt as both a stacked mark and a
wide horizontal nav lockup. All 124 legacy `/static/*` logo references now resolve — files were
created at the paths the recovered code already expects, so no page edits were needed.
`favicon.ico` and `og-image.png` rebuilt from the new mark. Full inventory + usage rules in
`design.md`. Verified: `/command` and `/traxes` now render the gold logo instead of broken-image
icons; `bun run build` green.

## Next

- [ ] `/` still serves the old managed amber-on-light landing, not the gold-on-black brand.
      Decide: restyle it, or hand `/` to the legacy router.
- [ ] Emoji/glyph tofu boxes in the legacy sidebar — needs a fallback emoji font
- [ ] Migrate collections to Turso incrementally: add to `SERVER_COLLECTIONS`, build the Hono route
- [x] Code-split — main chunk 8.6 MB -> **505 KB** (1.58 MB -> 159 KB gzip), 293 route chunks
- [ ] Mobile still has only the original 8 screens; recovered package is web/PWA only.
      Read `references/mobile.md` first; extend `packages/mobile/app/_layout.tsx` **in place**
      (`ErrorBoundary` + `OneDollarStatsProvider` imports must survive lint)

## Blocked on Jeremiah

- [ ] **Google Maps keys** — two keys sit in plaintext in the public bundle on morrishive.com
      (`AIzaSyAtgo9lKS...`, `AIzaSyBWlIo4ZS...`). Unconfirmed whether they're restricted.
      Live billing risk. Restrict or rotate.
- [ ] **Samsara** — no API credentials yet; partner OAuth via the App Marketplace takes weeks
- [ ] **Autumn payments** — still a test key (`am_sk_test_...`), needs the live key
- [ ] Real auth (Better Auth) — deferred, see `references/authentication.md`

## Platform-doc gaps — backend built (Aug 24, 2026)

Diffed the Aug 2026 platform reference doc against the running tree. Result: every
route it names exists in `legacy/App.jsx` except `/driver-profile`. The real gap was
persistence — those pages wrote to localStorage through the PocketBase shim.

Built the 5 tables the doc claims + Hono routes, and pointed the shim at them:

| Table | Route | Notes |
|---|---|---|
| `mechanic_sessions` | `/api/mechanic` | DVIR memory (prior-day diff → NEW DAMAGE), insurance flag, auto work order |
| `maintenance_records` (30 cols) | `/api/maintenance` | PM Planner (20 intervals), work orders, Asset Health Index |
| `accident_reports` | `/api/incidents` | 8-step protocol, per-step completion, FMCSA compliance gap flags |
| `fleet_branding` | `/api/branding` | 16 modules, white-label gated at 10+ assets |
| `platform_settings` | `/api/settings` | 15 integrations, secrets never returned to client |

Wired in `pb-shim.ts` `SERVER_COLLECTIONS`, so existing pages hit Turso with no page edits.
Schema pushed (`db:push`), `bun run build` green, all 7 endpoints verified 200.

Still NOT built (named in the doc, no code): THE GOAT, Ghost Nerve, Quantum Mind,
Neural Safety, Finance Alert, Memory Management, Page Guardian agents — pages exist,
personas do not. Safety score engine still missing (`safety_scores`, `speeding_events`).

## Crash audit

`scripts/crash-audit.mjs` — ported from Jeremiah's legacy verify script, kept only the
three real checks (file-scope forward refs, hooks after conditional return, missing
export default). Dropped REQUIRED_PAGES/PAGES_SUBDIR (stale flat-src paths) and
REQUIRED_CONSTANTS (NAVY/ORANGE/AMBER — abandoned palette). 249 files, 0 findings.
Run `node scripts/crash-audit.mjs --strict` to fail on findings.

His legacy `deploy.cjs` is dead — do not port. It copies dist/index.html + dist/assets
to /home/www/aibuilder-db9c0 (IONOS), i.e. a frontend-only deploy with no API, which is
what broke morrishive.com.

## AI agent personas — built (Aug 24, 2026)

The platform doc names 8 agents; only 4 had prompts. Added the missing 7 (+ Page Guardian)
in `packages/web/src/api/agent/personas.ts`, each composed with `PLATFORM_GUARDRAILS`.

| Agent | Page route | API route |
|---|---|---|
| THE GOAT (supreme master) | `/ai-team` | `POST /api/agent/the-goat` (accepts `context`) |
| Road Agent | `/road-agent` | `POST /api/agent/road-agent` |
| Ghost Nerve | `/ghost-nerve`, `/quantum-nerve` | `POST /api/agent/ghost-nerve` |
| Quantum Mind | `/quantum-mind`, `/mind` | `POST /api/agent/quantum-mind` |
| Neural Safety | `/neural-safety`, `/safety-core` | `POST /api/agent/neural-safety` |
| Finance Alert | `/finance-alert-agent` | `POST /api/agent/finance-alert` |
| Memory Management | `/memory-management-agent` | `POST /api/agent/memory-agent` |
| Page Guardian | (background, no page) | `POST /api/agent/page-guardian` |

Also added `GET /api/agent/roster` (12-agent roster w/ names + roles) and `AGENT_ROSTER`
exported from `agent/index.ts` for the `/ai-team` page.

Hard rules written into the prompts (deliberate, keep them):
- THE GOAT quotes the fleet procedure clause it enforces; federal minimum wins when the
  fleet's own procedure is weaker. Never invents a CFR or a clause it wasn't given.
- Road Agent will not call a road clear/closed/chained on its own authority — no live feeds.
- Ghost Nerve baselines a unit against itself, never a fleet average; failures are "risk"
  with a confidence level, never certainties.
- Finance Alert never recommends deferring a safety-critical repair to protect cash — park it.
- Neural Safety normalizes speeding per 100 miles and violations as a weekly rate.
- Memory Agent refuses to store card numbers, SSNs, medical detail past DOT cert status, keys.
- Page Guardian won't call a route healthy or broken without a check result in context.

Verified: `bun run build` green (main chunk unchanged at 505.15 KB / 158.91 KB gzip).
All 8 new POST routes + `/roster` return 200 with `live: true` (real model answers, not demo
fallbacks). THE GOAT tested on a real accident scenario — it led with the §382.303
post-accident test window and flagged the missed 8-hour alcohol window.

Still missing: the Safety Score engine behind Neural Safety (no `safety_scores` or
`speeding_events` tables, no `safety.ts` route, no persisted scorecards — `DriverScorecardPage`
renders on nothing). Personas can reason, but there's no stored data to reason over yet.
