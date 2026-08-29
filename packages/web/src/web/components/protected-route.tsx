/**
 * ProtectedRoute — gates a route behind a real Better Auth session.
 *
 * Reads the reactive session from authClient (bearer token, /api/auth/*).
 * No session -> redirect to /sign-in. It does NOT check role: role checks
 * belong on the server, and /api/session/coverage states plainly that
 * server-side authorization across the other routers is not finished yet.
 */
import { Redirect } from "wouter";
import type { ReactNode } from "react";
import { authClient } from "../lib/auth";

const GOLD = "#C9A84C";

function Waiting() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "grid", placeItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            border: "3px solid #222222",
            borderTopColor: GOLD,
            borderRadius: "50%",
            animation: "twe-spin .7s linear infinite",
          }}
        />
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: 12,
            color: GOLD,
          }}
        >
          Checking session
        </div>
      </div>
      <style>{"@keyframes twe-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <Waiting />;
  if (!session) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

export default ProtectedRoute;
