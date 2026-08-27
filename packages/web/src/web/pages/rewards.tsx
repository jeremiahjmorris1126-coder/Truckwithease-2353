import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, PageHeader, Button, Badge, Spinner } from "../components/ui/kit";
import { Trophy, Fuel, Tag, Gift, Package, TrendingUp } from "lucide-react";

const CAT_ICON: Record<string, typeof Fuel> = { subscription: Tag, fuel: Fuel, partner: Gift, merch: Package };

export default function Rewards() {
  const { session } = useSession();
  const qc = useQueryClient();
  const id = session.driverId;
  const acct = useQuery({ queryKey: ["rewards", id], queryFn: async () => (await api.rewards[":driverId"].$get({ param: { driverId: id } })).json() });
  const cat = useQuery({ queryKey: ["rewards-catalog"], queryFn: async () => (await api.rewards.catalog.$get()).json() });

  const redeem = useMutation({
    mutationFn: async (rewardId: string) => (await api.rewards[":driverId"].redeem.$post({ param: { driverId: id }, json: { rewardId } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rewards", id] }); qc.invalidateQueries({ queryKey: ["drivers"] }); },
  });

  if (acct.isLoading || cat.isLoading) return <Spinner label="Loading EaseRewards…" />;
  const a = acct.data!;
  const catalog = cat.data?.catalog ?? [];
  const earnRules = cat.data?.earnRules ?? [];
  const pct = a.nextTier ? Math.min(100, Math.round((a.points / a.nextTier.at) * 100)) : 100;

  return (
    <div>
      <PageHeader title="EaseRewards" subtitle="The first real driver loyalty program built into a compliance app. Every mile, clean day, and fill-up earns points." />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 lg:col-span-1 twe-navy-grad text-white">
          <div className="flex items-center gap-2 text-[#C9A84C] mb-1"><Trophy className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wide">{a.tier} Tier</span></div>
          <div className="text-5xl font-bold font-mono-data mt-2">{a.points.toLocaleString()}</div>
          <div className="text-sm text-[#C9C9C9]">points available</div>
          {a.nextTier && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-[#C9C9C9] mb-1"><span>{a.tier}</span><span>{a.nextTier.name} @ {a.nextTier.at.toLocaleString()}</span></div>
              <div className="h-2 rounded-full bg-[#222222] overflow-hidden"><div className="h-full bg-[#C9A84C]" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 font-bold text-[#F5F5F5]"><TrendingUp className="h-5 w-5 text-[#C9A84C]" />How you earn</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {earnRules.map((r) => (
              <div key={r.action} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-3 py-2.5">
                <span className="text-sm text-[#F5F5F5]">{r.action}</span>
                <span className="text-xs font-semibold font-mono-data text-[#FFD700]">{r.points}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-[#F5F5F5] mb-3">Redeem your points</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {catalog.map((r) => {
          const Icon = CAT_ICON[r.category] ?? Gift;
          const affordable = a.points >= r.cost;
          return (
            <Card key={r.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1C]"><Icon className="h-5 w-5 text-[#C9A84C]" /></div>
                <Badge status={r.category === "fuel" ? "warning" : "info"}>{r.category}</Badge>
              </div>
              <div className="font-bold text-[#F5F5F5]">{r.title}</div>
              <p className="text-xs text-[#8A8A8A] mt-1 flex-1">{r.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono-data font-bold text-[#C9A84C]">{r.cost.toLocaleString()} pts</span>
                <Button variant={affordable ? "amber" : "ghost"} disabled={!affordable || redeem.isPending} onClick={() => redeem.mutate(r.id)}>
                  {affordable ? "Redeem" : "Locked"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222222]"><h2 className="font-bold text-[#F5F5F5]">Points Activity</h2></div>
        {a.history.length === 0 ? (
          <p className="text-sm text-[#8A8A8A] py-8 text-center">No activity yet — start driving to earn.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {a.history.map((h) => (
                <tr key={h.id} className="border-t border-[#222222]">
                  <td className="px-5 py-3 text-[#F5F5F5]">{h.note}</td>
                  <td className="px-5 py-3 text-[#8A8A8A] text-xs">{new Date(h.at).toLocaleDateString()}</td>
                  <td className={`px-5 py-3 text-right font-mono-data font-semibold ${h.points >= 0 ? "text-[#C9A84C]" : "text-[#c96a4c]"}`}>{h.points >= 0 ? "+" : ""}{h.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
