import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldX } from "lucide-react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Badge, Button, Card, PageHeader } from "../components/ui/kit";

type Gate = {
  decision: "clear" | "review_required" | "do_not_dispatch";
  blockers: { source: string; severity: "blocker" | "review"; message: string }[];
  disclaimer: string;
};

const label = { clear: "Clear", review_required: "Review required", do_not_dispatch: "Do not dispatch" } as const;

export default function DispatchGatePage() {
  const { session } = useSession();
  const [minutes, setMinutes] = useState(240);
  const check = useMutation({
    mutationFn: async () => {
      const response = await api.dispatch["go-no-go"].$post({ json: { driverId: session.driverId, plannedDriveMinutes: minutes } });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? "Unable to evaluate dispatch readiness");
      return response.json() as Promise<Gate>;
    },
  });
  const result = check.data;
  const isStop = result?.decision === "do_not_dispatch";

  return <div>
    <PageHeader title="Dispatch Go / No-Go" subtitle="A recorded-data gate for HOS, DVIR, and ELD telemetry before assigning a load." />
    <Card className="p-6 max-w-3xl">
      <label className="block text-sm font-medium text-[#F5F5F5] mb-2" htmlFor="planned-drive">Planned driving time (minutes)</label>
      <div className="flex gap-3 items-end">
        <input id="planned-drive" type="number" min="1" value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))} className="w-48 rounded bg-[#0a0a0a] border border-[#333] px-3 py-2 text-[#F5F5F5]" />
        <Button variant="amber" disabled={check.isPending} onClick={() => check.mutate()}>{check.isPending ? "Evaluating…" : "Run safety gate"}</Button>
      </div>
      <p className="mt-3 text-xs text-[#8A8A8A]">Evaluates the signed-in driver’s current recorded HOS, latest DVIR records, and ELD telemetry. Missing data requires review; it is never treated as clear.</p>
    </Card>
    {check.isError && <Card className="p-4 mt-6 border border-[#c96a4c] text-[#f5c0b8]">{check.error.message}</Card>}
    {result && <Card className="p-6 mt-6 max-w-3xl" accent={isStop}>
      <div className="flex items-center gap-3 mb-4">
        {isStop ? <ShieldX className="text-[#ef4444]" /> : result.decision === "clear" ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-[#C9A84C]" />}
        <div><div className="text-xs uppercase tracking-wider text-[#8A8A8A]">Decision</div><div className="text-xl font-bold text-[#F5F5F5]">{label[result.decision as keyof typeof label]}</div></div>
      </div>
      <div className="space-y-3">
        {result.blockers.length ? result.blockers.map((item, index) => <div key={index} className="rounded bg-[#0a0a0a] p-3 flex gap-3"><Badge status={item.severity === "blocker" ? "danger" : "warning"}>{item.source}</Badge><p className="text-sm text-[#d0c5af]">{item.message}</p></div>) : <p className="text-emerald-300">No recorded HOS, DVIR, or telemetry blocker was found for this plan.</p>}
      </div>
      <p className="mt-5 text-xs text-[#8A8A8A]">{result.disclaimer}</p>
    </Card>}
  </div>;
}
