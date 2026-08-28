import { Hono } from 'hono';
import { cors } from "hono/cors";
import { fleet } from "./routes/fleet";
import { hos } from "./routes/hos";
import { dvir } from "./routes/dvir";
import { loads } from "./routes/loads";
import { chat } from "./routes/chat";
import { rewards } from "./routes/rewards";
import { fuel } from "./routes/fuel";
import { tolls } from "./routes/tolls";
import { health } from "./routes/health";
import { agentRoutes } from "./routes/agent";
import { hr } from "./routes/hr";
import { mechanic } from "./routes/mechanic";
import { maintenance } from "./routes/maintenance";
import { incidents } from "./routes/incidents";
import { branding } from "./routes/branding";
import { settings } from "./routes/settings";
import { dispatch } from "./routes/dispatch";
import { eld } from "./routes/eld";
import { recovery } from "./routes/recovery";
import { fleetIntel } from "./routes/fleet-intel";
import { vault } from "./routes/vault";
import { intel } from "./routes/intel";
import { integrity } from "./routes/integrity";
import { support } from "./routes/support";
import { ride } from "./routes/ride";
import { accessibility } from "./routes/accessibility";
import { licensing } from "./routes/licensing";
import { signup } from "./routes/signup";
import { subscriptions } from "./routes/subscriptions";
import { a2p } from "./routes/a2p";
import { twilio } from "./routes/twilio";
import { storage } from "./routes/storage";
import { captions } from "./routes/captions";
import { gemini } from "./routes/gemini";
import { safety } from "./routes/safety";
import { fleetMemory } from "./routes/fleet-memory";
import { routing } from "./routes/routing";
import { weather } from "./routes/weather";
import { weekReview } from "./routes/week-review";
import { azuga } from "./routes/azuga";
import { vatRates } from "./routes/vat-rates";
import { algorithm } from "./routes/algorithm";
import { traxes } from "./routes/traxes";
import { integrations } from "./routes/integrations";
import { email } from "./routes/email";

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route("/fleet", fleet)
  .route("/hos", hos)
  .route("/dvir", dvir)
  .route("/loads", loads)
  .route("/chat", chat)
  .route("/rewards", rewards)
  .route("/fuel", fuel)
  .route("/tolls", tolls)
  .route("/driver-health", health)
  .route("/agent", agentRoutes)
  .route("/hr", hr)
  .route("/mechanic", mechanic)
  .route("/maintenance", maintenance)
  .route("/incidents", incidents)
  .route("/branding", branding)
  .route("/settings", settings)
  .route("/vault", vault)
  .route("/intel", intel)
  .route("/integrity", integrity)
  .route("/dispatch", dispatch)
  .route("/eld", eld)
  .route("/recovery", recovery)
  .route("/fleet-intel", fleetIntel)
  .route("/support", support)
  .route("/ride", ride)
  .route("/signup", signup)
  .route("/subscriptions", subscriptions)
  .route("/a2p", a2p)
  .route("/accessibility", accessibility)
  .route("/licensing", licensing).route("/twilio", twilio)
  .route("/storage", storage)
  .route("/gemini", gemini)
  .route("/captions", captions)
  .route("/safety", safety)
  .route("/fleet-memory", fleetMemory)
  .route("/routing", routing)
  .route("/weather", weather)
  .route("/week-review", weekReview)
  .route("/azuga", azuga)
  .route("/vat-rates", vatRates)
  .route("/algorithm", algorithm)
  .route("/traxes", traxes)
  .route("/integrations", integrations)
  .route("/email", email);

export type AppType = typeof app;
export default app;
