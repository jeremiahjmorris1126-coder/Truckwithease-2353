import type { ReactNode } from "react";

export function Card({ children, className = "", accent = false }: { children: ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl bg-white border border-[#E2E7F0] shadow-sm ${accent ? "border-l-4 border-l-[#FFB400]" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "navy" }: { label: string; value: ReactNode; sub?: string; tone?: "navy" | "amber" | "success" | "danger" }) {
  const tones: Record<string, string> = {
    navy: "text-[#0B2A6B]", amber: "text-[#E09E00]", success: "text-[#1FA971]", danger: "text-[#E0322B]",
  };
  return (
    <Card className="p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6577]">{label}</div>
      <div className={`mt-2 text-3xl font-bold font-mono-data ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-[#5B6577]">{sub}</div>}
    </Card>
  );
}

const badgeTones: Record<string, string> = {
  driving: "bg-[#1FA971]/12 text-[#1FA971]",
  on_duty: "bg-[#FFB400]/15 text-[#B27C00]",
  sleeper: "bg-[#0B2A6B]/10 text-[#0B2A6B]",
  off_duty: "bg-[#5B6577]/12 text-[#5B6577]",
  success: "bg-[#1FA971]/12 text-[#1FA971]",
  warning: "bg-[#FFB400]/15 text-[#B27C00]",
  danger: "bg-[#E0322B]/12 text-[#E0322B]",
  info: "bg-[#0B2A6B]/10 text-[#0B2A6B]",
  active: "bg-[#1FA971]/12 text-[#1FA971]",
  maintenance: "bg-[#FFB400]/15 text-[#B27C00]",
  out_of_service: "bg-[#E0322B]/12 text-[#E0322B]",
  available: "bg-[#1FA971]/12 text-[#1FA971]",
  booked: "bg-[#5B6577]/12 text-[#5B6577]",
  needs_repair: "bg-[#E0322B]/12 text-[#E0322B]",
  submitted: "bg-[#1FA971]/12 text-[#1FA971]",
  resolved: "bg-[#0B2A6B]/10 text-[#0B2A6B]",
};

export function Badge({ status, children }: { status?: string; children?: ReactNode }) {
  const tone = status ? badgeTones[status] ?? "bg-[#5B6577]/12 text-[#5B6577]" : "bg-[#5B6577]/12 text-[#5B6577]";
  const label = children ?? status?.replace(/_/g, " ");
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone}`}>{label}</span>;
}

export function Button({ children, variant = "primary", className = "", ...props }: { children: ReactNode; variant?: "primary" | "amber" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-[#0B2A6B] text-white hover:bg-[#071E4E]",
    amber: "bg-[#FFB400] text-[#0E1524] hover:bg-[#E09E00] font-semibold",
    ghost: "bg-transparent text-[#0B2A6B] hover:bg-[#EEF2FA] border border-[#E2E7F0]",
    danger: "bg-[#E0322B] text-white hover:bg-[#c22a24]",
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0E1524]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#5B6577]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[#5B6577]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E2E7F0] border-t-[#FFB400]" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
