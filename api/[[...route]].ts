/**
 * Vercel serverless entry for the TruckWithEase API.
 *
 * This project's own server (packages/web/src/server.ts) is a long-lived
 * Bun.serve process — that model does not run on Vercel. On Vercel the built
 * SPA is served from the CDN (see vercel.json) and every /api/* request lands
 * here instead.
 *
 * The Hono app is defined with .basePath('api'), so it already matches the full
 * /api/... path. hono/vercel's handle(app) returns a Web-standard
 * (req: Request) => Response handler, which Vercel's Node.js runtime invokes
 * directly. Node runtime (not edge) is required because the data layer uses the
 * `pg` driver.
 *
 * The catch-all filename [[...route]] means this one function receives every
 * path under /api, matching how the app is mounted as a single Hono instance.
 */
import { handle } from "hono/vercel";
import app from "../packages/web/src/api/index";

export const config = { runtime: "nodejs" };

export default handle(app);
