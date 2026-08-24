import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, PageHeader, Button, Badge, Spinner } from "../components/ui/kit";
import { Package, MapPin, DollarSign, Truck, Plus, X } from "lucide-react";

export default function Loads() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", miles: "", rate: "", equipment: "Dry Van", weight: "", pickupDate: "", broker: "" });

  const loads = useQuery({ queryKey: ["loads"], queryFn: async () => (await api.loads.$get()).json() });

  const book = useMutation({
    mutationFn: async (loadId: string) => (await api.loads[":id"].book.$post({ param: { id: loadId }, json: { driverId: session.driverId } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loads"] }),
  });
  const add = useMutation({
    mutationFn: async () => (await api.loads.$post({ json: { ...form, miles: +form.miles, rate: +form.rate, weight: form.weight ? +form.weight : null } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loads"] }); setShowAdd(false); setForm({ origin: "", destination: "", miles: "", rate: "", equipment: "Dry Van", weight: "", pickupDate: "", broker: "" }); },
  });

  if (loads.isLoading) return <Spinner label="Loading load board…" />;
  const rows = loads.data?.loads ?? [];
  const available = rows.filter((l) => l.status !== "booked");
  const canPost = session.role !== "driver";

  return (
    <div>
      <PageHeader
        title="Load Board"
        subtitle="Owner-operator freight — sorted by rate per mile. Book direct, no middleman."
        action={canPost && <Button variant="amber" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Post Load</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><div className="text-xs uppercase text-[#5B6577] font-semibold">Available</div><div className="text-2xl font-bold font-mono-data text-[#0B2A6B] mt-1">{available.length}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-[#5B6577] font-semibold">Avg $/mile</div><div className="text-2xl font-bold font-mono-data text-[#1FA971] mt-1">${(available.reduce((s, l) => s + (l.rpm ?? 0), 0) / (available.length || 1)).toFixed(2)}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-[#5B6577] font-semibold">Best rate</div><div className="text-2xl font-bold font-mono-data text-[#E09E00] mt-1">${Math.max(0, ...available.map((l) => l.rpm ?? 0)).toFixed(2)}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-[#5B6577] font-semibold">Total miles</div><div className="text-2xl font-bold font-mono-data text-[#0B2A6B] mt-1">{available.reduce((s, l) => s + (l.miles ?? 0), 0).toLocaleString()}</div></Card>
      </div>

      <div className="space-y-3">
        {rows.sort((a, b) => (b.rpm ?? 0) - (a.rpm ?? 0)).map((l) => (
          <Card key={l.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[#0E1524] font-bold"><MapPin className="h-4 w-4 text-[#0B2A6B]" />{l.origin} <span className="text-[#5B6577]">→</span> {l.destination}</div>
                  <div className="text-xs text-[#5B6577] mt-1">{l.broker} · {l.equipment} · {l.weight ? `${(l.weight / 1000).toFixed(0)}k lbs` : "—"} · Pickup {l.pickupDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right"><div className="text-xs text-[#5B6577]">Miles</div><div className="font-mono-data font-semibold text-[#0E1524]">{l.miles?.toLocaleString()}</div></div>
                <div className="text-right"><div className="text-xs text-[#5B6577]">Rate</div><div className="font-mono-data font-semibold text-[#0E1524]">${l.rate?.toLocaleString()}</div></div>
                <div className="text-right"><div className="text-xs text-[#5B6577]">$/mile</div><div className="font-mono-data font-bold text-[#1FA971]">${l.rpm?.toFixed(2)}</div></div>
                {l.status === "booked" ? <Badge status="booked" /> : <Button variant="amber" disabled={book.isPending} onClick={() => book.mutate(l.id)}>Book</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <Card className="w-full max-w-lg p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg text-[#0E1524] flex items-center gap-2"><Package className="h-5 w-5 text-[#0B2A6B]" />Post a Load</h2><button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-[#5B6577]" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[["origin", "Origin"], ["destination", "Destination"], ["miles", "Miles"], ["rate", "Rate ($)"], ["weight", "Weight (lbs)"], ["broker", "Broker"], ["pickupDate", "Pickup date"]].map(([k, label]) => (
                <label key={k} className="text-xs font-semibold text-[#5B6577]">{label}
                  <input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm text-[#0E1524] focus:border-[#FFB400] focus:outline-none" />
                </label>
              ))}
              <label className="text-xs font-semibold text-[#5B6577]">Equipment
                <select value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm text-[#0E1524] focus:border-[#FFB400] focus:outline-none">
                  {["Dry Van", "Reefer", "Flatbed", "Tanker", "Step Deck"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            </div>
            <Button variant="amber" className="w-full mt-5" disabled={add.isPending || !form.origin || !form.destination} onClick={() => add.mutate()}>Post Load</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
