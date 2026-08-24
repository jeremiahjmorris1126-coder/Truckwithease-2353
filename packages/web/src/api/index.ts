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
  .route("/settings", settings);

export type AppType = typeof app;
export default app;
