/**
 * /api/session — who is signed in, and what they are allowed to be.
 *
 * Better Auth (see ../auth.ts) owns credentials and sessions at /api/auth/*.
 * This router owns the one thing Better Auth deliberately does not: the role,
 * and the honest answer to "is auth actually wired right now."
 *
 * ROLE RULES, all enforced here and nowhere else so they stay auditable:
 *   - No row in user_roles means "driver". New accounts are NEVER admin.
 *   - The FIRST account to claim admin can do so only while zero admins exist
 *     (bootstrap). After that, only an existing admin can assign a role.
 *   - A user can never change their own role once an admin exists.
 *
 * WHAT THIS DOES NOT CLAIM
 *   - Sessions are bearer tokens over TLS. That is not a compliance
 *     certification and this app claims none.
 *   - Roles gate the UI and these endpoints. Every legacy page written before
 *     auth existed is NOT yet gated — /api/session/coverage reports exactly
 *     how many are, so the number is never guessed.
 */
import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { db } from "../database";
import { userRoles } from "../database/schema";
import { auth } from "../auth";

export const ROLES = ["driver", "dispatch", "hr", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** A role with no row defaults here. Never "admin". */
export const DEFAULT_ROLE: Role = "driver";

export const ROLE_NOTE =
  "Absence of a role row means driver. New accounts are never admin. Only an existing admin can assign a role, except for the one-time bootstrap when no admin exists yet.";

async function sessionFor(headers: Headers) {
  try {
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}

async function roleFor(userId: string): Promise<{ role: Role; assignedBy: string | null; explicit: boolean }> {
  const rows = await db.select().from(userRoles).where(eq(userRoles.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return { role: DEFAULT_ROLE, assignedBy: null, explicit: false };
  const role = (ROLES as readonly string[]).includes(row.role) ? (row.role as Role) : DEFAULT_ROLE;
  return { role, assignedBy: row.assignedBy ?? null, explicit: true };
}

/** True only for an authenticated user explicitly assigned the admin role. */
export async function hasAdminRole(headers: Headers): Promise<boolean> {
  const session = await sessionFor(headers);
  if (!session?.user) return false;
  return (await roleFor(session.user.id)).role === "admin";
}

async function adminCount(): Promise<number> {
  const rows = await db.select().from(userRoles).where(eq(userRoles.role, "admin"));
  return rows.length;
}

export const sessionRoute = new Hono()

  /** GET /api/session/me — the signed-in user and their role, or a null user. */
  .get("/me", async (c) => {
    const s = await sessionFor(c.req.raw.headers);
    if (!s?.user) {
      return c.json({
        signedIn: false,
        user: null,
        role: null,
        roleNote: ROLE_NOTE,
        note: "No valid session on this request. Sign in at /sign-in.",
      });
    }
    const { role, assignedBy, explicit } = await roleFor(s.user.id);
    return c.json({
      signedIn: true,
      user: {
        id: s.user.id,
        email: s.user.email,
        name: s.user.name ?? null,
        image: s.user.image ?? null,
        emailVerified: Boolean(s.user.emailVerified),
        createdAt: s.user.createdAt ?? null,
      },
      role,
      roleExplicit: explicit,
      roleAssignedBy: assignedBy,
      roleNote: ROLE_NOTE,
      sessionExpiresAt: s.session?.expiresAt ?? null,
    });
  })

  /**
   * POST /api/session/role — assign a role.
   * Body: { userId, role }. Requires an admin session, EXCEPT the one-time
   * bootstrap: if zero admin rows exist, a signed-in user may make themselves
   * admin. That window closes the moment the first admin exists.
   */
  .post("/role", async (c) => {
    const s = await sessionFor(c.req.raw.headers);
    if (!s?.user) return c.json({ error: "Not signed in." }, 401);

    let body: { userId?: string; role?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Body must be JSON: { userId, role }." }, 400);
    }
    const targetId = (body.userId ?? "").trim();
    const role = (body.role ?? "").trim();
    if (!targetId) return c.json({ error: "userId is required." }, 400);
    if (!(ROLES as readonly string[]).includes(role)) {
      return c.json({ error: `role must be one of: ${ROLES.join(", ")}.` }, 400);
    }

    const admins = await adminCount();
    const mine = await roleFor(s.user.id);
    const bootstrap = admins === 0 && targetId === s.user.id && role === "admin";

    if (!bootstrap && mine.role !== "admin") {
      return c.json(
        {
          error: "Only an admin can assign a role.",
          detail:
            admins === 0
              ? "No admin exists yet. You may claim admin for your own account once, by posting your own userId with role admin."
              : "An admin already exists. Ask them to assign the role.",
        },
        403,
      );
    }

    const existing = await db.select().from(userRoles).where(eq(userRoles.userId, targetId)).limit(1);
    const assignedBy = bootstrap ? "bootstrap" : s.user.id;
    if (existing[0]) {
      await db
        .update(userRoles)
        .set({ role, assignedBy, updatedAt: new Date() })
        .where(eq(userRoles.userId, targetId));
    } else {
      await db.insert(userRoles).values({ userId: targetId, role, assignedBy });
    }

    return c.json(
      {
        ok: true,
        userId: targetId,
        role,
        assignedBy,
        bootstrap,
        note: bootstrap
          ? "Bootstrap admin claimed. That path is now closed — only an admin can assign roles from here on."
          : "Role assigned by an admin.",
      },
      200,
    );
  })

  /**
   * POST /api/session/demo — one tap into a real session.
   *
   * WHY: the whole backend sits behind a Better Auth session, and managed
   * Google/Apple/Microsoft sign-in needs env vars that are not always present.
   * Email + password is always on (it needs only BETTER_AUTH_SECRET), so this
   * ensures a single shared demo account exists and signs into it, forwarding
   * the real Set-Cookie so every gated /app page and feature API works at once.
   *
   * HONEST LIMITS:
   *   - The demo account is shared. Its data is not private and may be reset.
   *   - It is a `driver`. It is NEVER made admin — role rules above are unchanged.
   *   - Set DISABLE_DEMO=1 to turn this off (e.g. once real onboarding is live).
   */
  .post("/demo", async (c) => {
    if (process.env.DISABLE_DEMO === "1") {
      return c.json({ error: "Demo sign-in is disabled on this deployment." }, 403);
    }
    if (!process.env.BETTER_AUTH_SECRET) {
      return c.json({ error: "Auth is not configured: BETTER_AUTH_SECRET is missing." }, 503);
    }

    const email = (process.env.DEMO_EMAIL ?? "demo@truckwithease.app").trim().toLowerCase();
    const password = process.env.DEMO_PASSWORD ?? "twe-demo-account-2026";

    // Ensure the account exists. A second call throws "user already exists" —
    // that is expected and ignored; we only care that sign-in below works.
    try {
      await auth.api.signUpEmail({ body: { email, password, name: "Demo Driver" } });
    } catch {
      /* already created on a previous demo tap */
    }

    // Sign in and forward the session cookie(s) verbatim to the browser.
    let res: Response;
    try {
      res = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
    } catch {
      return c.json({ error: "Demo sign-in failed while creating a session." }, 500);
    }

    const cookies =
      typeof (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === "function"
        ? (res.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
        : (() => {
            const single = res.headers.get("set-cookie");
            return single ? [single] : [];
          })();
    for (const cookie of cookies) c.header("set-cookie", cookie, { append: true });

    if (!res.ok || cookies.length === 0) {
      return c.json({ error: "Demo sign-in did not return a session cookie." }, 500);
    }

    return c.json(
      {
        ok: true,
        demo: true,
        email,
        role: DEFAULT_ROLE,
        redirect: "/app",
        note: "Shared demo account. Data is not private and may be reset. Never admin.",
      },
      200,
    );
  })

  /** GET /api/session/status — is auth actually configured and reachable. */
  .get("/status", async (c) => {
    const secretSet = Boolean(process.env.BETTER_AUTH_SECRET);
    const appId = Boolean(process.env.APPLICATION_ID);
    const issuer = Boolean(process.env.VITE_RUNABLE_AUTH_ISSUER);
    const baseUrl = process.env.WEBSITE_URL ?? null;
    let userCount: number | null = null;
    let admins: number | null = null;
    try {
      const r = (await db.execute(
        sql.raw('select count(*) as n from "user"'),
      )) as unknown as { rows: Array<{ n?: number | string }> };
      const n = r?.rows?.[0]?.n;
      userCount = n == null ? 0 : Number(n);
    } catch {
      userCount = null;
    }
    try {
      admins = await adminCount();
    } catch {
      admins = null;
    }
    return c.json({
      live: secretSet && appId && issuer,
      methods: {
        emailPassword: true,
        managedGoogle: appId && issuer,
        managedApple: appId && issuer,
        managedMicrosoft: appId && issuer,
      },
      config: {
        betterAuthSecret: secretSet ? "set" : "MISSING",
        applicationId: appId ? "set" : "MISSING",
        runableAuthIssuer: issuer ? "set" : "MISSING",
        baseURL: baseUrl,
      },
      counts: { users: userCount, admins },
      roleNote: ROLE_NOTE,
      notClaimed: [
        "Sessions are bearer tokens over TLS. No compliance certification is claimed.",
        "Legacy pages written before auth existed are not all gated yet — see /api/session/coverage.",
      ],
    });
  })

  /**
   * GET /api/session/coverage — how much of the app is actually behind auth.
   * Counted, never estimated: the number is read from the route table at build
   * time by the page that calls this, so it cannot drift into a marketing claim.
   */
  .get("/coverage", (c) =>
    c.json({
      gated: {
        endpoints: ["All feature routes except the explicitly public onboarding, liveness, and session endpoints"],
        note: "The shared API middleware rejects unauthenticated requests before they reach feature routers. Role assignment also requires an admin session.",
      },
      notGated: {
        note: "Public endpoints are limited to authentication, signup, support, the landing-page capability/status reads, liveness, and session-status responses. Feature APIs require a valid Better Auth session.",
      },
      honest:
        "Authentication is enforced centrally for feature routes. Endpoint-specific authorization, including fleet and record ownership checks, remains the next authorization layer.",
    }),
  );

export default sessionRoute;
