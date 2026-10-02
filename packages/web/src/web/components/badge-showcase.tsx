/**
 * BadgeShowcase — driver achievement grid.
 *
 * Jeremiah's original JSX is preserved verbatim at docs/launch/BadgeShowcase.ORIGINAL.jsx.txt.
 * Logic and the 8 badge keys are unchanged, so `achievements: string[]` still works.
 * Colors were rebranded off the abandoned navy/orange palette onto gold-on-black tokens.
 */
import type { LucideIcon } from "lucide-react";
import { Award, Zap, Target, TrendingUp, Flame, Shield, Truck, DollarSign, Lock } from "lucide-react";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";

export type BadgeKey =
  | "first-load-assigned"
  | "first-route-saved"
  | "five-routes-saved"
  | "ten-stops-rated"
  | "danger-report-filed"
  | "broker-warned"
  | "one-week-user"
  | "fifty-actions";

type BadgeDef = {
  icon: LucideIcon;
  label: string;
  desc: string;
  /** Status accent — used for the small tier pip only, never for the whole card. */
  tier: "bronze" | "silver" | "gold";
};

export const BADGE_DEFINITIONS: Record<BadgeKey, BadgeDef> = {
  "first-load-assigned": { icon: Truck, label: "First Load", desc: "Assigned your first load", tier: "bronze" },
  "first-route-saved": { icon: Target, label: "Route Master", desc: "Saved your first route", tier: "bronze" },
  "five-routes-saved": { icon: TrendingUp, label: "Navigator", desc: "Saved 5+ routes", tier: "silver" },
  "ten-stops-rated": { icon: Award, label: "Scout", desc: "Rated 10+ charge stops", tier: "silver" },
  "danger-report-filed": { icon: Flame, label: "Alert Keeper", desc: "Filed a danger report", tier: "silver" },
  "broker-warned": { icon: Shield, label: "Fleet Protector", desc: "Warned fleet about a bad broker", tier: "gold" },
  "one-week-user": { icon: Zap, label: "Week One", desc: "Active for 1 week", tier: "bronze" },
  "fifty-actions": { icon: DollarSign, label: "Platform Power User", desc: "Completed 50+ actions", tier: "gold" },
};

const TIER_PIP: Record<BadgeDef["tier"], string> = {
  bronze: "#8A6E2F",
  silver: "#C9C4B5",
  gold: GOLD_BRIGHT,
};

export const ALL_BADGE_KEYS = Object.keys(BADGE_DEFINITIONS) as BadgeKey[];

function EarnedBadge({ badgeKey }: { badgeKey: BadgeKey }) {
  const badge = BADGE_DEFINITIONS[badgeKey];
  const Icon = badge.icon;
  return (
    <div className="group relative overflow-hidden rounded-lg border-2 border-twgold bg-twcard p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-8px_rgba(201,168,76,0.55)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ background: "linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)" }}
      />
      <span
        className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
        style={{ background: TIER_PIP[badge.tier] }}
        title={`${badge.tier} tier`}
      />
      <div className="relative mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-twgold/40 bg-twblack">
        <Icon size={24} style={{ color: GOLD_BRIGHT }} />
      </div>
      <div className="relative font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-twgold">
        {badge.label}
      </div>
      <div className="relative mt-1 text-[11px] leading-snug text-white/55">{badge.desc}</div>
    </div>
  );
}

function LockedBadge({ badgeKey }: { badgeKey: BadgeKey }) {
  const badge = BADGE_DEFINITIONS[badgeKey];
  const Icon = badge.icon;
  return (
    <div className="rounded-lg border border-twborder bg-twcard/60 p-4 text-center">
      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-twborder bg-twblack">
        <Icon size={22} className="text-white/20" />
      </div>
      <div className="flex items-center justify-center gap-1 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-white/35">
        <Lock size={10} /> {badge.label}
      </div>
      <div className="mt-1 text-[11px] leading-snug text-white/25">{badge.desc}</div>
    </div>
  );
}

export default function BadgeShowcase({
  achievements = [],
  showLocked = false,
}: {
  achievements?: string[];
  /** Render the unearned badges greyed out so drivers can see what's next. */
  showLocked?: boolean;
}) {
  const earned = achievements.filter((k): k is BadgeKey => k in BADGE_DEFINITIONS);

  if (earned.length === 0 && !showLocked) {
    return (
      <div className="rounded-lg border border-twgold/25 bg-twcard p-6 text-center">
        <Award size={26} className="mx-auto mb-3" style={{ color: GOLD }} />
        <div className="font-heading text-[13px] uppercase tracking-[0.14em] text-twgold">
          Earn badges as you use TruckWithEase
        </div>
        <div className="mt-2 text-[11px] text-white/40">
          Save routes, file reports, help your fleet — every action unlocks a badge.
        </div>
      </div>
    );
  }

  const locked = showLocked ? ALL_BADGE_KEYS.filter((k) => !earned.includes(k)) : [];

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      {earned.map((k) => (
        <EarnedBadge key={k} badgeKey={k} />
      ))}
      {locked.map((k) => (
        <LockedBadge key={k} badgeKey={k} />
      ))}
    </div>
  );
}
