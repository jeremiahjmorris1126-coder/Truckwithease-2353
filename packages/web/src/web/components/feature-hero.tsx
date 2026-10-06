import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function FeatureHero({
  icon: Icon,
  eyebrow,
  title,
  accent,
  description,
  status,
  action,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  status?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#2B2D3C] bg-[#111218] p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/15 text-[#FFD700]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#C9A84C]">{eyebrow}</span>
            {status}
          </div>
          <h1 className="mt-1 text-balance font-[Oswald] text-2xl font-semibold uppercase leading-tight tracking-wide text-[#F5F5F5] sm:text-3xl">
            {title} {accent && <span className="text-[#FFD700]">{accent}</span>}
          </h1>
          <p className="mt-1 max-w-xl text-pretty text-sm leading-relaxed text-[#9AA0B4]">{description}</p>
        </div>
      </div>
      {action && <div className="flex w-full md:w-auto">{action}</div>}
    </header>
  );
}

export function FeatureTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon: LucideIcon }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" className="-mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-[#222432] px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`-mb-px flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-4 font-mono text-xs font-bold uppercase tracking-wide transition-colors sm:text-sm ${
              isActive ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#FFD700]" : "border-transparent text-[#8A8A8A] hover:text-[#F5F5F5]"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
