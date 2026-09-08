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
 *   is now gold #d4af37 / bright gold #ffd700 on black #08090c, cards #13151b,
 *   nav #0d0e12, borders #222634 — the launch brand.
 * - The green #1FA971 shield next to "Demo mode". The status line itself is
 *   accurate and stays, but it now reads in gold-on-black and says plainly that
 *   there is no login wall yet rather than dressing it as a healthy state.
 *
 * No claim on this chrome is new. Nothing here reports a number.
 */
import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Map, ClipboardCheck, Fuel, Route, HeartPulse,
  Wrench, Trophy, Package, MessageSquare, FileText, CreditCard, Truck, Boxes, BrainCircuit,
  ChevronDown, ShieldAlert,
} from "lucide-react";
import { useSession, type Role } from "../lib/session";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/hos", label: "HOS / ELD", icon: Clock, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/map", label: "Fleet Map", icon: Map, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/dvir", label: "DVIR", icon: ClipboardCheck, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/fuel", label: "Fuel Finder", icon: Fuel, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/tolls", label: "Tolls", icon: Route, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/health", label: "Driver Health", icon: HeartPulse, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/fleet-chief", label: "Fleet Chief AI", icon: Wrench, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/assets", label: "Fleet Assets", icon: Boxes, roles: ["admin", "dispatch"] },
  { to: "/app/quantum-operations", label: "Quantum Operations", icon: BrainCircuit, roles: ["admin", "dispatch"] },
  { to: "/app/rewards", label: "EaseRewards", icon: Trophy, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/loads", label: "Load Board", icon: Package, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/chat", label: "Dispatch Chat", icon: MessageSquare, roles: ["admin", "dispatch", "driver"] },
  { to: "/app/reports", label: "Reports", icon: FileText, roles: ["admin", "dispatch"] },
  { to: "/app/pricing", label: "Plans", icon: CreditCard, roles: ["admin", "dispatch", "driver"] },
];

const ROLES: { role: Role; driverId: string; name: string; label: string }[] = [
  { role: "admin", driverId: "drv-1", name: "Fleet Admin", label: "Fleet Admin" },
  { role: "dispatch", driverId: "drv-1", name: "Dispatcher", label: "Dispatcher" },
  { role: "driver", driverId: "drv-1", name: "Marcus Bell", label: "Driver — Marcus Bell (T-104)" },
  { role: "hr", driverId: "drv-1", name: "HR Manager", label: "HR Manager" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { session, setSession } = useSession();
  const [open, setOpen] = useState(false);
  const nav = NAV.filter((n) => n.roles.includes(session.role));

  return (
    <div className="min-h-screen bg-[#08090c] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gradient-to-b from-[#13151b] via-[#0d0e12] to-[#08090c] border-r border-[#222634] text-[#e3e2e6] flex flex-col sticky top-0 h-screen">
        <Link to="/app" className="flex items-center gap-2 px-5 h-16 border-b border-[#222634]">
          <div className="flex h-8 w-8 items-center justify-center  bg-gradient-to-br from-[#A9762A] via-[#ffd700] to-[#F5E79E]">
            <Truck className="h-5 w-5 text-[#08090c]" />
          </div>
          <span className="text-lg font-[Oswald] font-semibold uppercase tracking-[0.06em]">
            Truck<span className="text-[#ffd700]">WithEase</span>
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
                className={`flex items-center gap-3  px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#d4af37] text-[#08090c] font-semibold"
                    : "text-[#d0c5af] hover:bg-[#1a1b21] hover:text-[#ffd700]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#222634] font-[Oswald] text-[10px] uppercase tracking-[0.22em] text-[#94a3b8]">
          Drive Smart. Stay Compliant.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0d0e12] border-b border-[#222634] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
            <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
            <span>
              <span className="font-[Oswald] uppercase tracking-[0.18em] text-[11px] text-[#ef4444]">No login wall</span>
              <span className="mx-2 text-[#333]">|</span>
              Every role is open to anyone with the URL. Real accounts are not built yet.
            </span>
          </div>
          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2  border border-[#222634] bg-[#13151b] px-3 py-2 text-sm hover:border-[#d4af37] transition-colors"
            >
              <span className="flex h-6 w-6 items-center justify-center  bg-[#d4af37] text-[#08090c] text-xs font-bold">
                {session.name[0]}
              </span>
              <span className="font-medium text-[#e3e2e6]">{session.name}</span>
              <span className="rounded bg-[#1a1b21] border border-[#222634] px-1.5 py-0.5 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4af37]">
                {session.role}
              </span>
              <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64  border border-[#222634] bg-[#13151b] shadow-lg shadow-black/60 py-1 z-30">
                <div className="px-3 py-2 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                  Switch role
                </div>
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setSession({ role: r.role, driverId: r.driverId, name: r.name });
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#1a1b21] transition-colors ${
                      session.role === r.role ? "text-[#ffd700] font-semibold" : "text-[#d0c5af]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <div className="px-3 pt-2 pb-1 mt-1 border-t border-[#222634] text-[11px] leading-snug text-[#666666]">
                  Switching role changes what this browser shows. It is not authentication.
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
