import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, Badge, Spinner, PageHeader, Button } from "../components/ui/kit";
import { ClipboardCheck, Plus, X, Check } from "lucide-react";

export default function DvirPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [vehicleType, setVehicleType] = useState<"tractor" | "trailer">("tractor");
  const [type, setType] = useState<"pre_trip" | "post_trip">("pre_trip");
  const [defects, setDefects] = useState<string[]>([]);

  const items = useQuery({ queryKey: ["dvir-items"], queryFn: async () => (await api.dvir.items.$get()).json() });
  const list = useQuery({ queryKey: ["dvir"], queryFn: async () => (await api.dvir.$get()).json() });

  const submit = useMutation({
    mutationFn: async () => (await api.dvir.$post({ json: {
      driverId: session.driverId, truckUnit: "T-104", type, vehicleType,
      odometer: 412500, location: "Current location", defects, signature: session.name,
    } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dvir"] }); setShowForm(false); setDefects([]); },
  });
  const resolve = useMutation({
    mutationFn: async (id: string) => (await api.dvir[":id"].resolve.$post({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dvir"] }),
  });

  if (list.isLoading) return <Spinner label="Loading inspections…" />;
  const checklistItems = (vehicleType === "tractor" ? items.data?.tractor : items.data?.trailer) ?? [];

  return (
    <div>
      <PageHeader title="DVIR — Vehicle Inspections" subtitle="49 CFR 396.11 / 396.13 · pre & post-trip"
        action={<Button variant="amber" onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" />New Inspection</Button>} />

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex rounded-lg border border-[#222222] overflow-hidden">
              {(["tractor", "trailer"] as const).map((v) => (
                <button key={v} onClick={() => { setVehicleType(v); setDefects([]); }} className={`px-4 py-2 text-sm font-medium capitalize ${vehicleType === v ? "bg-[#C9A84C] text-[#0a0a0a]" : "text-[#8A8A8A]"}`}>{v}</button>
              ))}
            </div>
            <div className="flex rounded-lg border border-[#222222] overflow-hidden">
              {([["pre_trip", "Pre-Trip"], ["post_trip", "Post-Trip"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setType(v)} className={`px-4 py-2 text-sm font-medium ${type === v ? "bg-[#C9A84C] text-[#0a0a0a]" : "text-[#8A8A8A]"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="text-sm text-[#8A8A8A] mb-3">Tap any item that has a <b>defect</b>. Leave clear if OK.</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {checklistItems.map((it) => {
              const bad = defects.includes(it);
              return (
                <button key={it} onClick={() => setDefects((d) => bad ? d.filter((x) => x !== it) : [...d, it])}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm text-left ${bad ? "border-[#c96a4c] bg-[#c96a4c]/5 text-[#c96a4c]" : "border-[#222222] hover:border-[#C9A84C]"}`}>
                  {it}
                  {bad ? <X className="h-4 w-4" /> : <Check className="h-4 w-4 text-[#C9A84C]" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="amber" disabled={submit.isPending} onClick={() => submit.mutate()}>
              {submit.isPending ? "Submitting…" : `Sign & Submit${defects.length ? ` (${defects.length} defects)` : " — All Clear"}`}
            </Button>
            <span className="text-sm text-[#8A8A8A]">Signed as <b>{session.name}</b></span>
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {(list.data?.inspections ?? []).map((insp) => (
          <Card key={insp.id} className="p-4" accent={insp.hasDefects}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <ClipboardCheck className={`h-5 w-5 ${insp.hasDefects ? "text-[#c96a4c]" : "text-[#C9A84C]"}`} />
                <div>
                  <div className="font-semibold text-[#F5F5F5]">{insp.truckUnit} · <span className="capitalize">{insp.vehicleType}</span> · {insp.type.replace("_", "-")}</div>
                  <div className="text-xs text-[#8A8A8A]">{new Date(insp.createdAt).toLocaleString()} · {insp.signature}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={insp.status} />
                {insp.status === "needs_repair" && (
                  <Button variant="ghost" onClick={() => resolve.mutate(insp.id)} disabled={resolve.isPending}>Mark Repaired</Button>
                )}
              </div>
            </div>
            {insp.hasDefects && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(insp.defects as string[]).map((d) => <span key={d} className="rounded-full bg-[#c96a4c]/10 text-[#c96a4c] px-2.5 py-0.5 text-xs font-medium">{d}</span>)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
