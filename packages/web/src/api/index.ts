import { Hono } from 'hono';
import { cors } from "hono/cors";
import { fleet } from "./routes/fleet";
import { assets } from "./routes/assets";
import { quantumOperations } from "./routes/quantum-operations";
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
import { comms } from "./routes/comms";
import { checkr } from "./routes/checkr";
import { sealedLine } from "./routes/sealedline";
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
import { intelligence } from "./routes/intelligence";
import { clockLedger } from "./routes/clockledger";
import { traxes } from "./routes/traxes";
import { traxesAI } from "./routes/traxes-ai";
import { integrations } from "./routes/integrations";
import { email } from "./routes/email";
import { fleetio } from "./routes/fleetio";
import { dataIndex } from "./routes/dataindex";
import { bridges } from "./routes/bridges";
import { dispatchZero } from "./routes/dispatchzero";
import { auth } from "./auth";
import { sessionRoute } from "./routes/session";
import { functionsIndex } from "./routes/functions";
import { openapiRoutes } from "./routes/openapi";
import { responsibleUseRoute } from "./routes/responsibleuse";
import { hapticRoute } from "./routes/haptic";
import { profit } from "./routes/profit";
import { voice } from "./routes/voice";
import { command } from "./routes/command";
import { requireSession } from "./middleware/session";

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  // The guard explicitly allows Better Auth and the minimal public onboarding surface.
  .use("*", requireSession)
  // Better Auth owns /api/auth/*. Registered before every feature route so a
  // sign-in request never falls through to a feature router.
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route("/fleet", fleet)
  .route("/assets", assets)
  .route("/quantum-operations", quantumOperations)
  .route("/hos", hos)
  .route("/dvir", dvir)
  .route("/loads", loads)
  .route("/profit", profit)
  .route("/voice", voice)
  .route("/command", command)
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
  .route("/comms", comms)
  .route("/checkr", checkr)
  .route("/sealed-line", sealedLine)
  .route("/storage", storage)
  .route("/gemini", gemini)
  .route("/captions", captions)
  .route("/safety", safety)
  .route("/fleet-memory", fleetMemory)
  .route("/routing", routing)
  .route("/weather", weather)
  .route("/voice", voice)
  .route("/week-review", weekReview)
  .route("/azuga", azuga)
  .route("/vat-rates", vatRates)
  .route("/algorithm", algorithm)
  .route("/intelligence", intelligence)
  .route("/clock-ledger", clockLedger)
  .route("/traxes", traxes)
  .route("/integrations", integrations)
  .route("/email", email)
  .route("/fleetio", fleetio)
  .route("/data-index", dataIndex)
  .route("/bridges", bridges)
  .route("/dispatch-zero", dispatchZero)
  .route("/session", sessionRoute)
  .route("/responsible-use", responsibleUseRoute)
  .route("/haptic", hapticRoute)
  .route("/weight-check", weightCheck)
  .route("/design-system", designSystem)
  .route("/medical-examiner", medicalExaminer)
  // The function index reads the app's OWN registered route table at request time. It cannot
  // import `app` (circular), so it takes a getter that is resolved lazily, after construction.
  .route("/functions", functionsIndex(() => app.routes as { method: string; path: string }[]))
  // TRAXES as the platform's AI. Same lazy-getter contract as the function index: it reads the
  // app's own live route table so it can never describe an endpoint that is not mounted.
  .route("/traxes", traxesAI(() => app.routes as { method: string; path: string }[]))
  // OpenAPI 3.1 contract, generated off the same live route table so the spec cannot describe an
  // endpoint that is not mounted.
  .route("/", openapiRoutes(() => app.routes as { method: string; path: string }[]));

export type AppType = typeof app;
export default app;
