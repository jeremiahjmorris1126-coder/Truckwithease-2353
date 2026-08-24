import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "admin" | "dispatch" | "driver" | "hr";
export type Session = { role: Role; driverId: string; name: string };

const DEFAULT: Session = { role: "admin", driverId: "drv-1", name: "Dispatch Admin" };

const Ctx = createContext<{ session: Session; setSession: (s: Session) => void }>({
  session: DEFAULT,
  setSession: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>(() => {
    try {
      const raw = localStorage.getItem("twe_session");
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT;
  });
  const setSession = (s: Session) => {
    setSessionState(s);
    localStorage.setItem("twe_session", JSON.stringify(s));
  };
  useEffect(() => {
    localStorage.setItem("twe_session", JSON.stringify(session));
  }, [session]);
  return <Ctx.Provider value={{ session, setSession }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
