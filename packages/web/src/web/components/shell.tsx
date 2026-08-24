import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Clock, Map, ClipboardCheck, Fuel, Route, HeartPulse,
  Wrench, Trophy, Package, MessageSquare, FileText, CreditCard, Truck,
  ChevronDown, Shield,
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
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 twe-navy-grad text-white flex flex-col sticky top-0 h-screen">
        <Link to="/app" className="flex items-center gap-2 px-5 h-16 border-b border-[#163B7E]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB400]">
            <Truck className="h-5 w-5 text-[#0B2A6B]" />
          </div>
          <span className="text-lg font-bold">Truck<span className="text-[#FFB400]">WithEase</span></span>
        </Link>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {nav.map((n) => {
            const active = loc === n.to;
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-[#FFB400] text-[#0E1524] font-semibold" : "text-[#C7D3EC] hover:bg-[#103574] hover:text-white"}`}>
                <Icon className="h-[18px] w-[18px]" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#163B7E] text-[11px] text-[#8FA6D4]">
          Drive Smart. Stay Compliant.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E2E7F0] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-[#5B6577]">
            <Shield className="h-4 w-4 text-[#1FA971]" />
            <span>Demo mode — full access, no login wall</span>
          </div>
          {/* Role switcher */}
          <div className="relative">
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm hover:bg-[#EEF2FA]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2A6B] text-white text-xs font-bold">{session.name[0]}</span>
              <span className="font-medium text-[#0E1524]">{session.name}</span>
              <span className="rounded bg-[#EEF2FA] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#5B6577]">{session.role}</span>
              <ChevronDown className="h-4 w-4 text-[#5B6577]" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E2E7F0] bg-white shadow-lg py-1 z-30">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase text-[#5B6577]">Switch role (demo)</div>
                {ROLES.map((r) => (
                  <button key={r.role} onClick={() => { setSession({ role: r.role, driverId: r.driverId, name: r.name }); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#EEF2FA] ${session.role === r.role ? "text-[#0B2A6B] font-semibold" : "text-[#0E1524]"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
