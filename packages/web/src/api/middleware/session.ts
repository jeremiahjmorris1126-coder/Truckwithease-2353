import type { MiddlewareHandler } from "hono";
import { auth } from "../auth";

/** Routes required before a user has a session (sign-in, onboarding, liveness). */
const PUBLIC_GET_PATHS = new Set([
  "/ping",
  "/health",
  "/signup",
  "/support",
  "/functions",
  "/integrations/status",
  "/session/me",
  "/session/status",
  "/session/coverage",
  // Pure reference / computation tools — no user data, safe to read unauthenticated.
  "/weight-check",
  "/design-system",
  "/design-system/tokens.css",
  "/medical-examiner",
  "/medical-examiner/search",
  // Road weather — keyless National Weather Service data, no user scoping.
  "/weather",
  "/weather/cities",
]);

function apiPath(path: string) {
  return path.replace(/^\/api(?=\/|$)/, "") || "/";
}

/** POST routes reachable before a session exists (onboarding + demo sign-in + calculators). */
const PUBLIC_POST_PATHS = new Set([
  "/signup",
  "/session/demo",
  // Federal weight math — pure calculators over caller-supplied numbers, no data.
  "/weight-check/bridge-formula",
  "/weight-check/check",
  // Route weather — NWS forecast at each caller-supplied stop, no user data.
  "/weather/route",
]);

function isPublicRequest(method: string, path: string) {
  if (path.startsWith("/auth/")) return true;
  if (method === "GET" && PUBLIC_GET_PATHS.has(path)) return true;
  return method === "POST" && PUBLIC_POST_PATHS.has(path);
}

/**
 * Enforces a Better Auth session for feature routes. Better Auth accepts either
 * its session cookie (web) or the managed-auth bearer token (Expo/web clients).
 */
export const requireSession: MiddlewareHandler = async (c, next) => {
  const path = apiPath(c.req.path);
  if (isPublicRequest(c.req.method, path)) return next();

  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session?.user) return next();
  } catch {
    // Treat invalid, expired, and missing tokens uniformly.
  }

  return c.json(
    {
      error: "Authentication required.",
      signIn: "/api/auth/sign-in/email",
    },
    401,
  );
};
