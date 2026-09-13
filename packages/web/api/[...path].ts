/** Vercel catch-all for every `/api/*` request when this workspace is deployed. */
import { handle } from "hono/vercel";
import app from "../src/api/index";

export const config = { runtime: "nodejs" };

export default handle(app);
