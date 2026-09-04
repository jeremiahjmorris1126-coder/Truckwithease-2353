import { handle } from "hono/vercel";
import app from "../src/api";

/**
 * Vercel Function adapter for the Hono API.
 *
 * `src/server.ts` remains the local Bun development server. Production requests
 * are served by this function through Vercel's Node.js runtime.
 */
export default handle(app);
