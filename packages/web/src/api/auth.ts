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

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  plugins: [
    ...runableManagedAuth({
      applicationId: process.env.APPLICATION_ID!,
      issuer: process.env.VITE_RUNABLE_AUTH_ISSUER!,
    }),
    expo(),
  ],
});
