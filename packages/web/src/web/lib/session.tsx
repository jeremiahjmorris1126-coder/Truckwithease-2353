/**
 * Session — the signed-in identity and role for /app, sourced from the server.
 *
 * This USED to be a client-only fiction: it defaulted to an "admin / Dispatch
 * Admin" object in localStorage and a header dropdown let anyone pick any role.
 * That is gone. Real auth exists now — /app/* sits behind a Better Auth session
 * (see components/protected-route.tsx) and the role is decided server-side by
 * GET /api/session/me (see api/routes/session.ts), which is the ONLY place role
 * logic lives. This provider just reflects that truth to the UI.
 *
 * driverId is a deliberate bridge: the auth user is not yet linked to a row in
 * the drivers table, so feature pages that key off a driverId use the seeded
 * demo driver ("drv-1"). Identity, role and access are all real; only the
 * driver-record linkage is still to come.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchMe } from "./auth";

export type Role = "admin" | "dispatch" | "driver" | "hr";
export type Session = {
  role: Role;
  driverId: string;
  name: string;
  email: string | null;
  userId: string | null;
  signedIn: boolean;
  loading: boolean;
};

/** Seeded demo driver record until auth users are linked to driver rows. */
const DRIVER_ID = "drv-1";

/** Pre-fetch placeholder. Never claims admin, never claims to be signed in. */
const LOADING: Session = {
  role: "driver",
  driverId: DRIVER_ID,
  name: "…",
  email: null,
  userId: null,
  signedIn: false,
  loading: true,
};

const Ctx = createContext<{ session: Session; setSession: (s: Partial<Session>) => void; refresh: () => void }>({
  session: LOADING,
  setSession: () => {},
  refresh: () => {},
});

function nameFrom(user: { name: string | null; email: string } | null): string {
  if (!user) return "Guest";
  if (user.name && user.name.trim()) return user.name.trim();
  return user.email.split("@")[0];
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>(LOADING);

  const load = async () => {
    try {
      const me = await fetchMe();
      if (!me.signedIn || !me.user) {
        setSessionState({ ...LOADING, loading: false, signedIn: false, name: "Guest" });
        return;
      }
      setSessionState({
        role: me.role ?? "driver",
        driverId: DRIVER_ID,
        name: nameFrom(me.user),
        email: me.user.email,
        userId: me.user.id,
        signedIn: true,
        loading: false,
      });
    } catch {
      // Network / server error: fail closed to a signed-out, non-admin state.
      setSessionState({ ...LOADING, loading: false, signedIn: false, name: "Guest" });
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Local, display-only merge. Role and identity still come from the server. */
  const setSession = (s: Partial<Session>) => setSessionState((prev) => ({ ...prev, ...s }));

  return <Ctx.Provider value={{ session, setSession, refresh: load }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
