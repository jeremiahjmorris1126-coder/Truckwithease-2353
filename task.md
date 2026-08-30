# TruckWithEase — build queue

## Done
- De-Quantum sweep: 0 occurrences in packages/web/src. /api/quantum -> /api/intelligence. 9 pages renamed. Old /quantum-* URLs now 404 by design.
- Clock Ledger hash-chain persistence (clock_ledger_entries), /api/clock-ledger/chain verifies from genesis.
- Fleet telecommunications: /api/comms + /comms page. Tables fleet_phone_numbers, sms_conversations, sms_messages.
- twilio.ts DNS instructions moved from IONOS to Cloudflare.
- ELD pages honest rewrite: TruckWithEaseELDPage.jsx rewritten off live /api/eld (new GET /api/eld index route added). ELDHardwareMarketingPage.jsx and MorrishiveELDRevolutionPage.jsx deleted; all 9 URLs fold into the one page. Killed: FMCSA-REGISTERED badge, 12-layer engine, 2.4 trillion permutations, 72h violation prediction, invented device rows/specs/prices, Samsara/Motive comparison table, "only ELD in the world". Originals preserved at docs/launch/*.ORIGINAL.jsx.txt.
  - Note: /hardware-bundle now resolves to the ELD page (it already did before — the deleted marketing page shadowed HardwareSoftwareBundle at App.jsx:508, which stays dead).

## Blocked on Jeremiah
- TWILIO_ACCOUNT_SID in .env is a Google API key (AIzaSy...). Twilio returns 401 "Authentication Error - invalid username" (code 20003). Needs the real AC... SID from console.twilio.com.
- No A2P 10DLC campaign attached to MG28e60cf43e25de692677cca0c6d9dedc. US SMS will be carrier-filtered. Do NOT auto-file — costs money, triggers vetting.
- Checkr key pasted earlier returns 401. Needs the Live Secret Key.
- Inbound SMS only works once the app is on a public https host (webhook -> /api/comms/inbound).

## Next
1. TruckWithEaseELDPage.jsx (/twe-eld, /eld, /eld-system, /hardware) — still claims FMCSA-REGISTERED, 12-layer engine, 2.4 trillion permutations, 72h violation prediction, Samsara/Motive comparison table. Full honest rewrite or removal. Same for ELDHardwareMarketingPage.jsx and MorrishiveELDRevolutionPage.jsx.
2. TraxesPage.jsx — remove tax/IFTA filing and "IRS-compliant" claims.
3. Port STALE_OPEN_HOURS guard from clockledger.ts into intelligence.ts computeClocks.
4. Update capability index in functions.ts (add Clock Ledger, Fleet Comms, renamed surfaces).
