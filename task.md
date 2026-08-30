# TruckWithEase — build queue

## Done
- De-Quantum sweep: 0 occurrences in packages/web/src. /api/quantum -> /api/intelligence. 9 pages renamed. Old /quantum-* URLs now 404 by design.
- Clock Ledger hash-chain persistence (clock_ledger_entries), /api/clock-ledger/chain verifies from genesis.
- Fleet telecommunications: /api/comms + /comms page. Tables fleet_phone_numbers, sms_conversations, sms_messages.
- twilio.ts DNS instructions moved from IONOS to Cloudflare.
- ELD pages honest rewrite: TruckWithEaseELDPage.jsx rewritten off live /api/eld (new GET /api/eld index route added). ELDHardwareMarketingPage.jsx and MorrishiveELDRevolutionPage.jsx deleted; all 9 URLs fold into the one page. Killed: FMCSA-REGISTERED badge, 12-layer engine, 2.4 trillion permutations, 72h violation prediction, invented device rows/specs/prices, competitor comparison table, "only ELD in the world". Originals preserved at docs/launch/*.ORIGINAL.jsx.txt.
  - Note: /hardware-bundle now resolves to the ELD page (it already did before — the deleted marketing page shadowed HardwareSoftwareBundle at App.jsx:508, which stays dead).
- TRAXES as the platform AI. It is never handed a written description of the platform; it re-measures the platform every request.
  - api/agent/traxes-brain.ts — builds the brain from app.routes (live Hono route table), sqlite_master + real COUNT(*) per table, process.env presence booleans + documented-shape checks, the CAPS registry and legacy/App.jsx. 30s cache. Blockers computed from those measurements, each carrying severity / what / evidence / fix / owner.
  - api/agent/traxes-tools.ts — 7 read-only tools: platformMap, findCapability, readEndpoint (parameter-free live GETs only), inspectTable, envCheck, diagnose, traxesRecords. No write tool by design: a wrong answer costs nothing, a wrong write costs money and trust. When the fix is a mutation TRAXES names the endpoint and payload for a human.
  - api/agent/traxes-agent.ts — persona + runTraxes, sonnet-4.6, 10-step cap, ai_usage/ai_error logging.
  - api/routes/traxes-ai.ts — GET /api/traxes/brain (published so anyone can audit what TRAXES can see before trusting an answer) and POST /api/traxes/ai.
  - /traxes page: panel 0 "Ask TRAXES anything about this platform" (every answer prints the tools that actually ran; an answer with no tool call says so) and panel 7 "What TRAXES can see" (counts, credential present-count, blockers with evidence and fix). Scan pipeline panels 1-6 untouched.
  - functions.ts: capability row traxes-platform-ai added, so TRAXES finds itself through its own findCapability.
  - Verified live: build clean, /brain 200 (362 routes / 59 routers / 66 tables / 67 capabilities / 493 screens, 21 of 22 credentials present, 6 blockers), /ai 200 with real tool evidence, /traxes renders with 0 console errors.
  - Fixed: brain's a2p query selected a non-existent brand_status column; verified against pragma table_info and changed to `status`. The a2p-unreadable blocker is now correctly a2p-no-campaign.

## Blocked on Jeremiah
- TWILIO_ACCOUNT_SID in .env is a Google API key (AIzaSy...). Twilio returns 401 "Authentication Error - invalid username" (code 20003). Needs the real AC... SID from console.twilio.com. Surfaced by /comms and by the TRAXES brain as the one blocking issue.
- No A2P 10DLC campaign attached to MG28e60cf43e25de692677cca0c6d9dedc. US SMS will be carrier-filtered. Do NOT auto-file — costs money, triggers vetting.
- Checkr key pasted earlier returns 401. Needs the Live Secret Key.
- Inbound SMS only works once the app is on a public https host (webhook -> /api/comms/inbound).
- Twilio domain-verification TXT record for truckwithease.com not yet published in Cloudflare DNS.

## Next
1. Port the STALE_OPEN_HOURS guard from clockledger.ts (excludes open hos_logs intervals older than 24h and counts them in integrity.excludedOpenIntervals) into intelligence.ts computeClocks, which still has no guard and produced impossible clock totals for drv-1. Expose the excluded count.
2. Three `ionos` string hits remain in packages/web/src outside twilio.ts. Find them; fix if user-facing.
3. Consider declaring idx_sms_conv_pair in schema.ts for parity with the database (it exists in the DB only).
