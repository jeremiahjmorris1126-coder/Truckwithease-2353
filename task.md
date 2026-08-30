# De-Quantum sweep — TruckWithEase

Goal: zero occurrences of "quantum" in packages/web/src (product naming, routes, pages, functions).

## Done
- api/routes/quantum.ts -> intelligence.ts, export `intelligence`, naming block removed,
  surface ids/names/pages renamed, endpoints -> /api/intelligence/fatigue. Clean.
- api/index.ts -> imports intelligence, mounts /intelligence. Clean.
- Page files renamed (git mv):
  QuantumIntegrationHub.jsx -> IntegrationHubPage.jsx
  QuantumMindPage.jsx -> FleetMindPage.jsx
  QuantumNervePage.jsx -> DriverNervePage.jsx
  QuantumNexusPage.jsx -> DispatchNexusPage.jsx
  pages/QuantumHOSAnalyticsDashboard.jsx -> pages/HOSAnalyticsDashboard.jsx
  pages/QuantumFleetIntelligencePage.jsx -> pages/FleetIntelligencePage.jsx
  pages/QuantumRoutingEngine.jsx -> pages/RoutingEnginePage.jsx
  pages/QuantumDispatchCore.jsx -> pages/DispatchCorePage.jsx
  pages/DriverAssistanceQuantumPage.jsx -> pages/DriverAssistancePage.jsx
- legacy/App.jsx imports + routes updated. Clean.
  New canonical routes: /routing-engine /dispatch-nexus|/nexus /hos-analytics|/fatigue-analysis
  /integration-hub /dispatch-core /nerve /mind|/unified /fleet-intelligence|/industry-ai

## In progress
- Rewrite page bodies: IntegrationHubPage, FleetMindPage, DriverNervePage, DispatchNexusPage,
  ClockLedgerPage (remove "ON THE WORD QUANTUM" panels, read /api/intelligence).
- Then sweep remaining ~380 text occurrences in legacy pages/libs/api.

## Then
- bun run build, curl /api/intelligence, /api/intelligence/fatigue, /api/clock-ledger[/chain]
- screenshot verify, commit+push
- Next item after: Twilio fleet phone numbers + in-app messaging (A2P campaign blocker)
