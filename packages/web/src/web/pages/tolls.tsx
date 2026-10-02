import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, Spinner, PageHeader, Button, Badge } from "../components/ui/kit";
import { Route, Zap } from "lucide-react";

type Tab = "estimate" | "log" | "perk";

export default function TollsPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("estimate");
  const [roadId, setRoadId] = useState("il-tri");
  const [miles, setMiles] = useState(120);
  const [estimate, setEstimate] = useState<any>(null);
  const [compare, setCompare] = useState<any>(null);

  const roads = useQuery({ queryKey: ["toll-roads"], queryFn: async () => (await api.tolls.roads.$get()).json() });
  const expenses = useQuery({ queryKey: ["toll-exp", session.driverId], queryFn: async () => (await api.tolls.expenses[":driverId"].$get({ param: { driverId: session.driverId } })).json() });
  const tier = session.role === "driver" ? "pro" : "fleet";
  const transponder = useQuery({ queryKey: ["transponder", session.driverId], queryFn: async () => (await api.tolls.transponder[":driverId"].$get({ param: { driverId: session.driverId }, query: { tier } })).json() });

  const doEstimate = useMutation({
    mutationFn: async () => {
      const est = await (await api.tolls.estimate.$post({ json: { roadId, miles, axles: 5 } })).json();
      const cmp = await (await api.tolls.compare.$post({ json: { roadId, miles } })).json();
      return { est, cmp };
    },
    onSuccess: (d) => { setEstimate(d.est); setCompare(d.cmp); },
  });
  const logExp = useMutation({
    mutationFn: async () => {
      const road = roads.data?.roads.find((r) => r.id === roadId);
      return (await api.tolls.expenses[":driverId"].$post({ param: { driverId: session.driverId }, json: { road: road?.name, state: road?.state, amount: estimate?.withPrePass ?? estimate?.gross ?? 0 } })).json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["toll-exp"] }),
  });
  const activate = useMutation({
    mutationFn: async () => (await api.tolls.transponder[":driverId"].activate.$post({ param: { driverId: session.driverId } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transponder"] }),
  });

  if (roads.isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Tolls" subtitle="Estimate cost, compare routes, log expenses for IFTA" />
      <div className="flex gap-1 mb-5 bg-[#1C1C1C] rounded-lg p-1 w-fit">
        {([["estimate", "Cost Estimator"], ["log", "Expense Log"], ["perk", "PrePass Perk"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab === k ? "bg-[#161616] text-[#C9A84C] shadow-sm" : "text-[#8A8A8A]"}`}>{l}</button>
        ))}
      </div>

      {tab === "estimate" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-bold mb-4">Estimate a route</h2>
            <label className="text-sm font-medium text-[#8A8A8A]">Toll road</label>
            <select value={roadId} onChange={(e) => setRoadId(e.target.value)} className="w-full mt-1 mb-3 rounded-lg border border-[#222222] px-3 py-2 text-sm">
              {roads.data?.roads.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <label className="text-sm font-medium text-[#8A8A8A]">Miles on toll road</label>
            <input type="number" value={miles} onChange={(e) => setMiles(Number(e.target.value))} className="w-full mt-1 mb-4 rounded-lg border border-[#222222] px-3 py-2 text-sm font-mono-data" />
            <Button variant="amber" className="w-full" disabled={doEstimate.isPending} onClick={() => doEstimate.mutate()}>Calculate (5-axle)</Button>
          </Card>
          {estimate && (
            <div className="space-y-4">
              <Card className="p-6" accent>
                <div className="text-sm text-[#8A8A8A]">{estimate.road} · {estimate.miles} mi</div>
                <div className="mt-2 flex items-end gap-4">
                  <div><div className="text-xs text-[#8A8A8A] uppercase">Standard</div><div className="text-2xl font-bold font-mono-data text-[#F5F5F5]">${estimate.gross}</div></div>
                  <div><div className="text-xs text-[#8A8A8A] uppercase">With PrePass</div><div className="text-2xl font-bold font-mono-data text-[#C9A84C]">${estimate.withPrePass}</div></div>
                  <div><div className="text-xs text-[#8A8A8A] uppercase">You save</div><div className="text-2xl font-bold font-mono-data text-[#FFD700]">${estimate.saved}</div></div>
                </div>
                <Button variant="ghost" className="mt-4" disabled={logExp.isPending} onClick={() => logExp.mutate()}>Log to expenses</Button>
              </Card>
              {compare && (
                <Card className="p-6">
                  <h3 className="font-bold mb-3">Toll vs Toll-Free</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-[#0a0a0a] p-3"><div className="text-[#8A8A8A]">Toll route</div><div className="font-mono-data font-bold">${compare.tollRoute.cost}</div><div className="text-xs">{compare.tollRoute.miles} mi</div></div>
                    <div className="rounded-lg bg-[#0a0a0a] p-3"><div className="text-[#8A8A8A]">Toll-free</div><div className="font-mono-data font-bold">${compare.freeRoute.cost} fuel</div><div className="text-xs">+{compare.freeRoute.addedMin} min</div></div>
                  </div>
                  <div className="mt-3 text-sm">Recommendation: <Badge status={compare.recommendation === "toll-free" ? "success" : "info"}>{compare.recommendation}</Badge></div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "log" && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222222] flex justify-between items-center">
            <h2 className="font-bold">Toll Expenses</h2>
            <span className="font-mono-data font-bold text-[#C9A84C]">Total: ${expenses.data?.total ?? 0}</span>
          </div>
          {(expenses.data?.expenses ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8A8A8A]">No toll expenses logged yet. Estimate a route and log it.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#8A8A8A] text-xs uppercase bg-[#0a0a0a]"><th className="px-5 py-2.5">Date</th><th className="px-5 py-2.5">Road</th><th className="px-5 py-2.5">State</th><th className="px-5 py-2.5 text-right">Amount</th></tr></thead>
              <tbody>{expenses.data?.expenses.map((e) => (
                <tr key={e.id} className="border-t border-[#222222]"><td className="px-5 py-3 font-mono-data">{e.date}</td><td className="px-5 py-3">{e.road}</td><td className="px-5 py-3">{e.state}</td><td className="px-5 py-3 text-right font-mono-data">${e.amount.toFixed(2)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "perk" && (
        <Card className="p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-2"><Zap className="h-5 w-5 text-[#C9A84C]" /><h2 className="font-bold">PrePass Transponder Bundle</h2></div>
          {transponder.data?.eligible === false ? (
            <p className="text-sm text-[#8A8A8A]">{transponder.data.reason} Switch to a Pro/Fleet role to preview.</p>
          ) : transponder.data?.active ? (
            <div>
              <Badge status="success">Active</Badge>
              <div className="mt-3 font-mono-data text-lg">Tag: {transponder.data.tag}</div>
              <p className="mt-2 text-sm text-[#8A8A8A]">Weigh-station bypass + ~18% toll discount enabled.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#8A8A8A] mb-3">Discounted PrePass at <b className="font-mono-data">${transponder.data?.price}</b>/mo (retail ${transponder.data?.retail}). Doubles as weigh-station bypass.</p>
              <Button variant="amber" disabled={activate.isPending} onClick={() => activate.mutate()}>Activate PrePass</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
