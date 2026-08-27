import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { SessionProvider } from "./lib/session";
import { Shell } from "./components/shell";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

import Index from "./pages/index";
const Landing = lazy(() => import("./pages/landing"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const HOS = lazy(() => import("./pages/hos"));
const FleetMap = lazy(() => import("./pages/map"));
const DVIR = lazy(() => import("./pages/dvir"));
const Fuel = lazy(() => import("./pages/fuel"));
const Tolls = lazy(() => import("./pages/tolls"));
const Health = lazy(() => import("./pages/health"));
const FleetChief = lazy(() => import("./pages/fleet-chief"));
const HR = lazy(() => import("./pages/hr"));
const Rewards = lazy(() => import("./pages/rewards"));
const Loads = lazy(() => import("./pages/loads"));
const Chat = lazy(() => import("./pages/chat"));
const Reports = lazy(() => import("./pages/reports"));
const Billing = lazy(() => import("./pages/billing"));
const Badges = lazy(() => import("./pages/badges"));
// Recovered launch build — 253 pages behind its own path router.
// Handles every route not claimed by the live-backend /app/* pages below.
const LegacyApp = lazy(() => import("./legacy/App.jsx"));

function RouteFallback() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "grid", placeItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 34, height: 34, border: "3px solid #222222", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "twe-spin .7s linear infinite" }} />
        <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12, color: "#C9A84C" }}>Loading</div>
      </div>
      <style>{"@keyframes twe-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

function App() {
  return (
    <Provider>
      <SessionProvider>
        <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/legacy-home" component={Index} />
          <Route path="/app" component={() => <AppShell><Dashboard /></AppShell>} />
          <Route path="/app/hos" component={() => <AppShell><HOS /></AppShell>} />
          <Route path="/app/map" component={() => <AppShell><FleetMap /></AppShell>} />
          <Route path="/app/dvir" component={() => <AppShell><DVIR /></AppShell>} />
          <Route path="/app/fuel" component={() => <AppShell><Fuel /></AppShell>} />
          <Route path="/app/tolls" component={() => <AppShell><Tolls /></AppShell>} />
          <Route path="/app/health" component={() => <AppShell><Health /></AppShell>} />
          <Route path="/app/fleet-chief" component={() => <AppShell><FleetChief /></AppShell>} />
          <Route path="/app/rewards" component={() => <AppShell><Rewards /></AppShell>} />
          <Route path="/app/loads" component={() => <AppShell><Loads /></AppShell>} />
          <Route path="/app/chat" component={() => <AppShell><Chat /></AppShell>} />
          <Route path="/app/reports" component={() => <AppShell><Reports /></AppShell>} />
          <Route path="/app/badges" component={() => <Badges />} />
          <Route path="/app/pricing" component={() => <Billing />} />
          <Route path="/app/billing" component={() => <Billing />} />
          {/* Everything else falls through to the recovered launch build. */}
          <Route component={LegacyApp} />
        </Switch>
        </Suspense>
        {/* Do not remove — off by default, activated by parent iframe via postMessage */}
        {import.meta.env.DEV && <AgentFeedback />}
        {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
        {<RunableBadge />}
      </SessionProvider>
    </Provider>
  );
}

export default App;
