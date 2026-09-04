/**
 * Shell — the shared /app/* chrome.
 *
 * Rebuilt 2026-08-26 for brand compliance. What was removed and why:
 *
 * - Off-brand palette, top to bottom. The sidebar was `twe-navy-grad` (a class
 *   that HAS NO CSS DEFINITION anywhere in the repo — it rendered as no
 *   background at all), the logo tile and active-nav pill were amber #FFB400,
 *   the header was `bg-white` with #E2E7F0 borders and #5B6577 slate text, the
 *   avatar was navy #0B2A6B, and hover states were #103574 / #EEF2FA. All of it
 *   is now gold #C9A84C / bright gold #FFD700 on black #0a0a0a, cards #161616,
 *   nav #111111, borders #222222 — the launch brand.
 * - The green #1FA971 shield next to "Demo mode". The status line was rewritten
 *   again once real auth landed: it no longer claims "no login wall". Every
 *   /app route is now behind a Better Auth session, so the header states the
 *   signed-in identity and role (both sourced from GET /api/session/me) and
 *   offers a real Sign Out. The old client-side role switcher is gone — role is
 *   decided on the server and cannot be toggled from this browser.
 *
 * No claim on this chrome is new. Nothing here reports a number.
 */
import { Link, useLocation } from "wouter";
import { type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Map, ClipboardCheck, Fuel, Route, HeartPulse,
  Wrench, Trophy, Package, MessageSquare, FileText, CreditCard, Truck,
  ShieldCheck, LogOut,
} from "lucide-react";
import { useSession } from "../lib/session";
import { authClient } from "../lib/auth";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/hos", label: "HOS / ELD", icon: Clock, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/map", label: "Fleet Map", icon: Map, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/dvir", label: "DVIR", icon: ClipboardCheck, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/fuel", label: "Fuel Finder", icon: Fuel, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/tolls", label: "Tolls", icon: Route, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/health", label: "Driver Health", icon: HeartPulse, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/fleet-chief", label: "Fleet Chief AI", icon: Wrench, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/rewards", label: "EaseRewards", icon: Trophy, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/loads", label: "Load Board", icon: Package, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/chat", label: "Dispatch Chat", icon: MessageSquare, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/reports", label: "Reports", icon: FileText, roles: ["admin", "dispatch"] },
  { to: "/app/pricing", label: "Plans", icon: CreditCard, roles: ["admin", "dispatch", "driver"] },
];

export function Shell({ children }: { children: ReactNode }) {
  const [loc, navigate] = useLocation();
  const { session } = useSession();
  const nav = NAV.filter((n) => n.roles.includes(session.role));

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch {
      /* even if the network call fails, drop the user back to the wall */
    }
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gradient-to-b from-[#161616] via-[#111111] to-[#0a0a0a] border-r border-[#222222] text-[#F5F5F5] flex flex-col sticky top-0 h-screen">
        <Link to="/app" className="flex items-center gap-2 px-5 h-16 border-b border-[#222222]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#A9762A] via-[#FFD700] to-[#F5E79E]">
            <Truck className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <span className="text-lg font-[Oswald] font-semibold uppercase tracking-[0.06em]">
            Truck<span className="text-[#FFD700]">WithEase</span>
          </span>
        </Link>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {nav.map((n) => {
            const active = loc === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#C9A84C] text-[#0a0a0a] font-semibold"
                    : "text-[#C9C9C9] hover:bg-[#1C1C1C] hover:text-[#FFD700]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#222222] font-[Oswald] text-[10px] uppercase tracking-[0.22em] text-[#8A8A8A]">
          Drive Smart. Stay Compliant.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
            <ShieldCheck className="h-4 w-4 text-[#C9A84C]" />
            <span>
              <span className="font-[Oswald] uppercase tracking-[0.18em] text-[11px] text-[#C9A84C]">Signed in</span>
              <span className="mx-2 text-[#333]">|</span>
              Every /app route is behind a real account. Your role is assigned on the server.
            </span>
          </div>
          {/* Real signed-in identity + sign out. Role is server-assigned; it cannot be toggled here. */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#222222] bg-[#161616] px-3 py-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A84C] text-[#0a0a0a] text-xs font-bold">
                {(session.name?.[0] ?? "?").toUpperCase()}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-medium text-[#F5F5F5]">{session.name}</span>
                {session.email && (
                  <span className="text-[11px] text-[#8A8A8A]">{session.email}</span>
                )}
              </span>
              <span className="rounded bg-[#1C1C1C] border border-[#222222] px-1.5 py-0.5 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
                {session.role}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-lg border border-[#222222] bg-[#161616] px-3 py-2 text-sm text-[#C9C9C9] hover:border-[#C9A84C] hover:text-[#FFD700] transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
