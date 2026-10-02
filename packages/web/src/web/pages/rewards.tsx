import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Badge, Spinner } from "../components/ui/kit";
import { FeatureHero, FeatureTabs } from "../components/feature-hero";
import {
  Gift, Award, Fuel, Tag, Package, TrendingUp, Target, Flame, ShieldCheck, Zap, Sparkles, Star, Lock, CheckCircle,
} from "lucide-react";

type Tab = "rewards" | "badges";

const CAT_ICON: Record<string, typeof Fuel> = { subscription: Tag, fuel: Fuel, partner: Gift, merch: Package };

// Display copy for the badge keys the API knows. Earned status always comes
// from GET /api/rewards/:driverId/badges — nothing here marks a badge earned.
const BADGE_META: Record<string, { label: string; desc: string; icon: typeof Award }> = {
  "first-load-assigned": { label: "First Load", desc: "Booked your first load", icon: Award },
  "first-route-saved": { label: "Route Master", desc: "Saved your first route", icon: Target },
  "five-routes-saved": { label: "Navigator", desc: "Saved 5 or more routes", icon: TrendingUp },
  "ten-stops-rated": { label: "Stop Critic", desc: "Rated 10 truck stops", icon: Star },
  "danger-report-filed": { label: "Alert Keeper", desc: "Reported a defect on a DVIR", icon: Flame },
  "broker-warned": { label: "Fleet Protector", desc: "Warned drivers about a broker", icon: ShieldCheck },
  "one-week-user": { label: "Week One", desc: "Active for 7 days", icon: Zap },
  "fifty-actions": { label: "Power User", desc: "50+ loads, inspections, and trips", icon: Sparkles },
};

export default function Rewards() {
  const { session } = useSession();
  const qc = useQueryClient();
  const id = session.driverId;
  const [tab, setTab] = useState<Tab>("rewards");
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const acct = useQuery({ queryKey: ["rewards", id], queryFn: async () => (await api.rewards[":driverId"].$get({ param: { driverId: id } })).json() });
  const cat = useQuery({ queryKey: ["rewards-catalog"], queryFn: async () => (await api.rewards.catalog.$get()).json() });
  const badges = useQuery({
    queryKey: ["rewards-badges", id],
    queryFn: async () => {
      const res = await api.rewards[":driverId"].badges.$get({ param: { driverId: id } });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const redeem = useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await api.rewards[":driverId"].redeem.$post({ param: { driverId: id }, json: { rewardId } });
      const body = await res.json();
      if (!res.ok || !("redeemed" in body)) throw new Error("error" in body ? body.error : "Redeem failed");
      return body;
    },
    onSuccess: (body) => {
      setRedeemed(`Redeemed: ${body.redeemed.title}`);
      qc.invalidateQueries({ queryKey: ["rewards", id] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  if (acct.isLoading || cat.isLoading) return <Spinner label="Loading EaseRewards…" />;
  if (!acct.data) return <p className="py-10 text-center text-sm text-[#8A8A8A]">Couldn&apos;t load your rewards. Try again.</p>;

  const a = acct.data;
  const catalog = cat.data?.catalog ?? [];
  const earnRules = cat.data?.earnRules ?? [];
  const pct = a.nextTier ? Math.min(100, Math.round((a.points / a.nextTier.at) * 100)) : 100;
  const earned = new Set(badges.data?.achievements ?? []);
  const allBadges = badges.data?.all ?? Object.keys(BADGE_META);

  const tabs = [
    { id: "rewards" as const, label: "Points & rewards", icon: Gift },
    { id: "badges" as const, label: `Badges (${earned.size}/${allBadges.length})`, icon: Award },
  ];

  return (
    <div className="pb-8">
      <FeatureHero
        icon={Gift}
        eyebrow="Driver loyalty"
        status={<Badge status="info">{a.tier} tier</Badge>}
        title="EaseRewards"
        accent="& Driver Badges"
        description="Miles, clean compliance days, DVIRs, and fill-ups earn points you can redeem for fuel and subscription credits."
        action={
          <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#242D3E] bg-[#151924] px-4 py-3 md:w-auto md:flex-col md:items-end md:gap-0">
            <span className="font-mono text-[11px] uppercase text-[#8A8A8A]">Available balance</span>
            <span className="font-mono text-2xl font-black text-[#FFD700]">{a.points.toLocaleString()} pts</span>
          </div>
        }
      />

      {redeemed && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-xl border border-[#C9A84C]/50 bg-[#C9A84C]/10 p-4 text-sm text-[#F5F5F5]">
          <CheckCircle className="h-5 w-5 shrink-0 text-[#FFD700]" aria-hidden="true" />
          <span className="flex-1">{redeemed}</span>
          <button onClick={() => setRedeemed(null)} className="min-h-11 px-2 font-mono text-xs uppercase text-[#8A8A8A] hover:text-[#F5F5F5]">Dismiss</button>
        </div>
      )}
      {redeem.isError && (
        <p role="alert" className="mb-5 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-4 text-sm text-[#fca5a5]">{redeem.error.message}</p>
      )}

      <FeatureTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "rewards" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-5 lg:grid-cols-12">
            <section className="flex flex-col justify-between rounded-2xl border-2 border-[#C9A84C]/50 bg-[#12110D] p-5 lg:col-span-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#FFD700]">
                  <Award className="h-5 w-5" aria-hidden="true" />
                  {a.tier} driver tier
                </div>
                <div className="mt-2 font-mono text-5xl font-black text-[#F5F5F5]">{a.points.toLocaleString()}</div>
                <div className="font-mono text-xs text-[#8A8A8A]">points ready to redeem</div>
              </div>
              {a.nextTier ? (
                <div className="mt-6 border-t border-[#332A18] pt-4">
                  <div className="mb-1.5 flex justify-between font-mono text-xs text-[#D4D4D8]">
                    <span>{a.tier}</span>
                    <span className="font-bold text-[#FFD700]">{a.nextTier.name} @ {a.nextTier.at.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-[#3E3522] bg-[#201D16]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-[#FFD700]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-[#8A8A8A]">{(a.nextTier.at - a.points).toLocaleString()} points to {a.nextTier.name}</div>
                </div>
              ) : (
                <div className="mt-6 border-t border-[#332A18] pt-4 font-mono text-xs text-[#FFD700]">Top tier reached</div>
              )}
            </section>

            <section className="rounded-2xl border border-[#222736] bg-[#11131C] p-4 sm:p-5 lg:col-span-8">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-[#F5F5F5]">
                <TrendingUp className="h-4 w-4 text-[#FFD700]" aria-hidden="true" />
                How you earn
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {earnRules.map((r) => (
                  <li key={r.action} className="flex items-center justify-between gap-3 rounded-lg border border-[#232B3C] bg-[#151924] p-3">
                    <span className="text-sm text-[#E4E4E7]">{r.action}</span>
                    <span className="shrink-0 font-mono text-xs font-black text-[#FFD700]">{r.points}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section>
            <h2 className="mb-3 font-[Oswald] text-lg font-semibold uppercase tracking-wide text-[#F5F5F5]">Redeem your points</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((r) => {
                const Icon = CAT_ICON[r.category] ?? Gift;
                const affordable = a.points >= r.cost;
                return (
                  <li key={r.id} className={`flex flex-col rounded-xl border bg-[#11131C] p-4 ${affordable ? "border-[#283246]" : "border-[#1C202C]"}`}>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#252E42] bg-[#181D29]">
                        <Icon className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                      </div>
                      <Badge status={r.category === "fuel" ? "warning" : "info"}>{r.category}</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-[#F5F5F5]">{r.title}</h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-[#8A8A8A]">{r.desc}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#1C202C] pt-3">
                      <span className="font-mono text-sm font-bold text-[#FFD700]">{r.cost.toLocaleString()} pts</span>
                      <button
                        onClick={() => redeem.mutate(r.id)}
                        disabled={!affordable || redeem.isPending}
                        className={`flex min-h-11 items-center gap-1.5 rounded-lg px-4 font-mono text-xs font-bold uppercase transition-colors ${
                          affordable ? "bg-[#C9A84C] text-[#0a0a0a] hover:bg-[#FFD700]" : "cursor-not-allowed bg-[#181C26] text-[#6B6B6B]"
                        }`}
                      >
                        {!affordable && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
                        {affordable ? "Redeem" : "Locked"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#222736] bg-[#11131C]">
            <h2 className="border-b border-[#222736] p-4 font-mono text-xs font-bold uppercase tracking-wide text-[#F5F5F5]">Points activity</h2>
            {a.history.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8A8A8A]">No activity yet — start driving to earn.</p>
            ) : (
              <ul>
                {a.history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 border-t border-[#181C26] px-4 py-3 first:border-0">
                    <div className="min-w-0">
                      <div className="text-sm text-[#E4E4E7]">{h.note}</div>
                      <div className="text-xs text-[#8A8A8A]">{new Date(h.at).toLocaleDateString()}</div>
                    </div>
                    <span className={`shrink-0 font-mono text-sm font-black ${h.points >= 0 ? "text-[#FFD700]" : "text-[#ef4444]"}`}>
                      {h.points >= 0 ? "+" : ""}{h.points.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "badges" && (
        <section>
          <p className="mb-4 text-sm leading-relaxed text-[#8A8A8A]">Badges are earned only from real activity — booked loads, DVIRs, and trips. They can&apos;t be granted by hand.</p>
          {badges.isLoading ? (
            <Spinner label="Loading badges…" />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {allBadges.map((key) => {
                const meta = BADGE_META[key] ?? { label: key, desc: "", icon: Award };
                const Icon = meta.icon;
                const has = earned.has(key);
                return (
                  <li key={key} className={`flex flex-col items-center rounded-xl border p-4 text-center ${has ? "border-[#C9A84C]/50 bg-[#12110D]" : "border-[#1C202C] bg-[#11131C]"}`}>
                    <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full border ${has ? "border-[#C9A84C] bg-[#C9A84C]/15 text-[#FFD700]" : "border-[#2B2D3C] text-[#4B4B4B]"}`}>
                      {has ? <Icon className="h-6 w-6" aria-hidden="true" /> : <Lock className="h-5 w-5" aria-hidden="true" />}
                    </div>
                    <div className={`text-sm font-bold ${has ? "text-[#F5F5F5]" : "text-[#8A8A8A]"}`}>{meta.label}</div>
                    <div className="mt-0.5 text-xs leading-snug text-[#8A8A8A]">{meta.desc}</div>
                    <span className="sr-only">{has ? "Earned" : "Locked"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
