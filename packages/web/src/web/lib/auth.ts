/**
 * Better Auth browser client for TruckWithEase.
 *
 * Talks to our own server at /api/auth/* (see src/api/auth.ts). Google / Apple /
 * Microsoft go through Runable managed auth, so THIS REPO HOLDS NO PROVIDER
 * SECRET — only the public applicationId and issuer, both of which are
 * deliberately VITE_-prefixed because they are identifiers, not credentials.
 *
 * WHAT THIS DOES NOT DO
 *   - It does not read or store any provider API key. No credential input on
 *     any page, ever. That rule is unchanged.
 *   - It does not decide roles. The role comes from GET /api/session/me, which
 *     is the only place role logic lives.
 */
import { createAuthClient } from "better-auth/react";
import { managedAuthClient } from "@runablehq/managed-auth/client";

const config = {
  applicationId: import.meta.env.VITE_APPLICATION_ID,
  issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER,
};

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_WEBSITE_URL ?? window.location.origin,
  basePath: "/api/auth",
  plugins: [managedAuthClient(config)],
});

/** The bearer token, or "" when signed out. Used for our plain-fetch API calls. */
export function authToken(): string {
  try {
    return authClient.managedAuth.getToken() ?? "";
  } catch {
    return "";
  }
}

/** fetch() with the bearer attached when we have one. */
export async function authFetch(url: string, init: RequestInit = {}) {
  const t = authToken();
  const headers = new Headers(init.headers ?? {});
  if (t) headers.set("Authorization", `Bearer ${t}`);
  return fetch(url, { ...init, headers });
}

export type MeResponse = {
  signedIn: boolean;
  user: { id: string; email: string; name: string | null; image: string | null } | null;
  role: "driver" | "dispatch" | "hr" | "admin" | null;
  roleNote: string;
};

/** Server-side truth for who this is and what role they hold. */
export async function fetchMe(): Promise<MeResponse> {
  const r = await authFetch("/api/session/me");
  if (!r.ok) throw new Error(`GET /api/session/me returned ${r.status}`);
  return (await r.json()) as MeResponse;
}
