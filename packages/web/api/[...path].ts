import app from "../src/api";

/**
 * Single Vercel Function entry point for the Hono API.
 *
 * Vercel routes every /api/* request here; Hono retains the API's existing
 * `/api` base path and route-level authentication policy.
 */
export default function handler(request: Request) {
  return app.fetch(request);
}
