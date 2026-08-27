/**
 * kit.tsx — the shared primitives every /app/* page renders through.
 *
 * Rebuilt 2026-08-26 for brand compliance. What was removed and why:
 *
 * - `Card` was `bg-white border-[#E2E7F0]` and its accent rail was amber
 *   #FFB400. Against the black shell this read as a light-mode app pasted into
 *   a dark frame. Now #161616 on #222222 with a gold rail.
 * - `Stat` tones were navy #0B2A6B / amber #E09E00 / green #1FA971 / red
 *   #E0322B, and labels were slate #5B6577. Now gold, bright gold, and the
 *   single brand warn colour #c96a4c. There is no green "good" tone — a number
 *   is a number, the kit does not editorialise it.
 * - `Badge` carried 17 tones built on navy/amber/green/red at 10-15% opacity on
 *   white. Rebuilt on #1C1C1C with gold, muted grey, and #c96a4c only.
 * - `Button` variants were navy primary, amber secondary, slate ghost. Now gold
 *   primary, bright-gold accent, bordered ghost, #c96a4c danger.
 * - `PageHeader` title was #0E1524 near-black text (invisible on a black
 *   background) with slate subtitle. Now Bebas Neue in #F5F5F5 over gold-tagged
 *   Oswald, matching the five rebuilt legacy pages.
 * - `Spinner` track/ring was #E2E7F0 / amber. Now #222222 / gold.
 *
 * Nothing here holds data. No component invents, defaults, or rounds a value —
 * `Missing` renders the absence explicitly instead of showing 0.
 */
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function Card({ children, className = "", accent = false }: { children: ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl bg-[#161616] border border-[#222222] ${accent ? "border-l-4 border-l-[#C9A84C]" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "navy" }: { label: string; value: ReactNode; sub?: string; tone?: "navy" | "amber" | "success" | "danger" }) {
  // Tone names kept so the 13 existing pages keep compiling; the paint is brand.
  const tones: Record<string, string> = {
    navy: "text-[#F5F5F5]",
    amber: "text-[#FFD700]",
    success: "text-[#C9A84C]",
    danger: "text-[#c96a4c]",
  };
  return (
    <Card className="p-5">
      <div className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A8A8A]">{label}</div>
      <div className={`mt-2 text-3xl font-bold font-mono-data ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-[#8A8A8A]">{sub}</div>}
    </Card>
  );
}

const gold = "bg-[#1C1C1C] border border-[#C9A84C]/40 text-[#C9A84C]";
const bright = "bg-[#1C1C1C] border border-[#FFD700]/40 text-[#FFD700]";
const muted = "bg-[#1C1C1C] border border-[#222222] text-[#8A8A8A]";
const warn = "bg-[#1C1C1C] border border-[#c96a4c]/45 text-[#c96a4c]";

const badgeTones: Record<string, string> = {
  driving: bright,
  on_duty: gold,
  sleeper: muted,
  off_duty: muted,
  success: gold,
  warning: warn,
  danger: warn,
  info: muted,
  active: bright,
  maintenance: warn,
  out_of_service: warn,
  available: gold,
  booked: muted,
  needs_repair: warn,
  submitted: gold,
  resolved: muted,
};

export function Badge({ status, children }: { status?: string; children?: ReactNode }) {
  const tone = status ? badgeTones[status] ?? muted : muted;
  const label = children ?? status?.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {label}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }: { children: ReactNode; variant?: "primary" | "amber" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-[#C9A84C] text-[#0a0a0a] font-semibold hover:bg-[#FFD700]",
    amber: "bg-gradient-to-r from-[#A9762A] via-[#FFD700] to-[#C9A84C] text-[#0a0a0a] font-semibold hover:brightness-110",
    ghost: "bg-transparent text-[#C9A84C] border border-[#222222] hover:border-[#C9A84C] hover:text-[#FFD700]",
    danger: "bg-transparent text-[#c96a4c] border border-[#c96a4c]/50 hover:bg-[#c96a4c]/10",
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-[#222222]">
      <div>
        <h1 className="font-[Bebas_Neue] text-4xl leading-none tracking-[0.02em] text-[#F5F5F5]">{title}</h1>
        {subtitle && (
          <p className="mt-2 font-[Oswald] text-[11px] uppercase tracking-[0.22em] text-[#8A8A8A]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[#8A8A8A]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#222222] border-t-[#C9A84C]" />
      {label && <span className="font-[Oswald] text-[11px] uppercase tracking-[0.22em]">{label}</span>}
    </div>
  );
}

/**
 * Missing — the house pattern for an absent metric. A missing number renders as
 * MISSING / NOT TRACKED plus the reason it is missing. Never 0, never 100.
 */
export function Missing({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#333333] bg-[#111111] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#c96a4c]" />
        <span className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c96a4c]">
          Missing / Not tracked
        </span>
      </div>
      <div className="mt-2 font-[Oswald] text-sm uppercase tracking-[0.1em] text-[#F5F5F5]">{label}</div>
      <p className="mt-1 text-[13px] leading-snug text-[#8A8A8A]">{reason}</p>
    </div>
  );
}
