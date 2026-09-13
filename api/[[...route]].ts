/** Vercel catch-all for every `/api/*` request. */
import { handle } from "hono/vercel";
import app from "../packages/web/src/api/index";

export const config = { runtime: "nodejs" };

export default handle(app);
