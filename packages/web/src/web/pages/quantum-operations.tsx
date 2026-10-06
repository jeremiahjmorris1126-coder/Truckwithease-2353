import { useEffect, useState } from "react";
import { Card, Missing, PageHeader, Badge } from "../components/ui/kit";

type Suggestion = { assetId: string; title: string; action: string; priority: string };
type Scenario = { id: string; title: string; basis: string; suggestions: Suggestion[] };
type Operations = { note: string; snapshot: { assets: number; trucks: number; openMaintenance: number }; scenarios: Scenario[] };

export default function QuantumOperations() {
  const [data, setData] = useState<Operations | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/quantum-operations").then(async r => { if (!r.ok) throw Error(); return r.json(); }).then(setData).catch(() => setError("Operations analysis is unavailable right now.")); }, []);
  return <div><PageHeader title="Quantum Operations" subtitle="Parallel fleet scenarios from your stored operational data." />
    {error && <Missing label="OPERATIONS ANALYSIS UNAVAILABLE" reason={error} />}
    {!data && !error && <Card className="p-6 text-[#94a3b8]">Preparing fleet scenarios…</Card>}
    {data && <><Card className="p-5 mb-6" accent><p className="text-sm text-[#d0c5af]">{data.note}</p><div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><strong className="text-2xl text-[#ffd700]">{data.snapshot.assets}</strong><p className="text-xs text-[#94a3b8]">assets</p></div><div><strong className="text-2xl text-[#ffd700]">{data.snapshot.trucks}</strong><p className="text-xs text-[#94a3b8]">trucks</p></div><div><strong className="text-2xl text-[#ffd700]">{data.snapshot.openMaintenance}</strong><p className="text-xs text-[#94a3b8]">service items</p></div></div></Card>
      <div className="grid gap-5 lg:grid-cols-2">{data.scenarios.map(s => <Card key={s.id} className="p-5"><h2 className="font-bold text-[#e3e2e6]">{s.title}</h2><p className="mt-1 text-xs text-[#94a3b8]">Based on {s.basis}.</p><div className="mt-4 space-y-3">{s.suggestions.length ? s.suggestions.map(x => <div key={`${x.assetId}-${x.title}`} className=" border border-[#222634] p-3"><div className="flex justify-between gap-3"><strong className="text-sm text-[#e3e2e6]">{x.title}</strong><Badge status={x.priority === "next" ? "warning" : "available"}>{x.priority}</Badge></div><p className="mt-2 text-sm text-[#d0c5af]">{x.action}</p></div>) : <Missing label="NO CURRENT ITEMS" reason="Continue recording asset and maintenance details to build the next operational scenario." />}</div></Card>)}</div></>}
  </div>;
}
