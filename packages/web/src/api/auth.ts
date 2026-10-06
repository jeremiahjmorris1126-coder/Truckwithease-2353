/**
 * Better Auth configuration for TruckWithEase.
 *
 * WHY THIS EXISTS
 * Until now there was no login. `/sign-in` rendered the signup page, every
 * browser was treated as the same anonymous visitor, and no request could be
 * attributed to a person. That is the single largest launch blocker: without a
 * real session there is no way to separate a driver from a fleet admin, and no
 * way to say "this driver sealed this dispatch decision."
 *
 * WHAT IS ENABLED
 *   - Email + password (drivers who do not want a Google account)
 *   - Runable managed Google / Apple / Microsoft sign-in (no provider secrets
 *     live in this repo; the broker hands us a short aud-scoped identity JWT
 *     that this server verifies offline against the broker JWKS)
 *
 * WHAT THIS DOES NOT DO
 *   - It does not assign roles. Role assignment lives in routes/session.ts so
 *     the rule is auditable in one place, and every new account defaults to
 *     `driver` — never admin.
 *   - It does not claim any compliance certification. Sessions are bearer
 *     tokens over TLS. That is not SOC 2 and we do not say it is.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { db } from "./database";

const isDev = process.env.NODE_ENV === "development";

/**
 * The canonical origin this server signs sessions for.
 *
 * Cascade, most specific first:
 *   1. WEBSITE_URL                     — Runable-injected canonical origin
 *   2. https://VERCEL_PROJECT_PRODUCTION_URL — stable production domain on Vercel
 *   3. https://VERCEL_URL              — this deployment's URL (Vercel previews)
 *
 * Vercel does not set WEBSITE_URL, so without the Vercel fallbacks a deployed
 * build would have baseURL=undefined and an empty trusted-origin list, and every
 * sign-in would be rejected. The Vercel vars are bare hostnames, so they get an
 * https:// prefix.
 */
function resolveBaseURL(): string | undefined {
  if (process.env.WEBSITE_URL) return process.env.WEBSITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

/**
 * The exact origins allowed to start a session — never a wildcard.
 *
 * Production trusts the canonical origin plus, on Vercel, both the stable
 * production domain and this deployment's own URL (preview deployments live on a
 * different origin than production and each must be trusted). Development
 * additionally trusts localhost and the exact v0 preview origins so sign-in works
 * inside the cross-site preview iframe. We echo the request origin ONLY in
 * development, because the v0 sandbox host is ephemeral and is not always present
 * in the env vars above; production never reflects an arbitrary origin.
 */
function trustedOrigins(request?: Request): string[] {
  const list = new Set<string>();
  const add = (u?: string | null) => {
    if (!u) return;
    try {
      list.add(new URL(u).origin);
    } catch {
      /* not a URL — ignore */
    }
  };

  add(process.env.WEBSITE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (process.env.VERCEL_URL) add(`https://${process.env.VERCEL_URL}`);

  if (isDev) {
    add("http://localhost:3000");
    add("http://localhost:5173");
    add(process.env.V0_RUNTIME_URL);
    add(process.env.V0_DEV_APP_URL);
    add(process.env.V0_BUILD_URL);
    add(process.env.V0_SANDBOX_URL);
    add(request?.headers.get("origin"));
  }

  return [...list];
}

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: resolveBaseURL(),
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  // requireSession runs auth.api.getSession() on every feature request. Without
  // a cache that is a database round trip per request. The cookie cache stores a
  // short-lived signed copy of the session in the cookie, so getSession validates
  // it in-process and only falls back to the database when the cache expires or
  // the session is revoked. maxAge is deliberately short (60s) so role/session
  // revocation still takes effect quickly.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  // Required by the cross-site v0 preview iframe. Without SameSite=None; Secure
  // the browser silently drops the session cookie, so login succeeds but the
  // very next request looks signed out. Production keeps Better Auth's secure
  // first-party defaults (SameSite=Lax).
  ...(isDev
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
  plugins: [
    // Runable managed login (Google/Apple/Microsoft) is only registered when its
    // env vars are actually present. Previously these were `!`-asserted and called
    // unconditionally, so a server without APPLICATION_ID / VITE_RUNABLE_AUTH_ISSUER
    // threw at module load and took the ENTIRE API down with a bare 500. Email +
    // password and the demo session do not depend on managed auth, so they must keep
    // working when it is absent — which is exactly what /api/session/status reports.
    ...(process.env.APPLICATION_ID && process.env.VITE_RUNABLE_AUTH_ISSUER
      ? runableManagedAuth({
          applicationId: process.env.APPLICATION_ID,
          issuer: process.env.VITE_RUNABLE_AUTH_ISSUER,
        })
      : []),
    expo(),
  ],
});
