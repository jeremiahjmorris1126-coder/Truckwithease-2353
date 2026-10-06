import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, Badge, Spinner, PageHeader, Button } from "../components/ui/kit";
import { AlertTriangle } from "lucide-react";

const STATUSES = [
  { key: "off_duty", label: "Off Duty" },
  { key: "sleeper", label: "Sleeper" },
  { key: "driving", label: "Driving" },
  { key: "on_duty", label: "On Duty (ND)" },
];

function ClockBar({ label, used, total, tone }: { label: string; used: number; total: number; tone: string }) {
  const pct = Math.min(100, (used / total) * 100);
  const remaining = Math.max(0, total - used);
  const h = Math.floor(remaining / 60), m = remaining % 60;
  const colors: Record<string, string> = { danger: "bg-[#c96a4c]", warning: "bg-[#C9A84C]", ok: "bg-[#C9A84C]" };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-[#F5F5F5]">{label}</span>
        <span className="font-mono-data font-semibold text-[#C9A84C]">{h}h {m}m left</span>
      </div>
      <div className="h-3 rounded-full bg-[#1C1C1C] overflow-hidden">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function HosPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const driverId = session.driverId;
  const isDriver = session.role === "driver";

  const hos = useQuery({ queryKey: ["hos", driverId], queryFn: async () => (await api.hos[":driverId"].$get({ param: { driverId } })).json() });
  const fleet = useQuery({ queryKey: ["hos-fleet"], enabled: !isDriver, queryFn: async () => (await api.hos.$get()).json() });

  const setStatus = useMutation({
    mutationFn: async (status: string) => (await api.hos[":driverId"].status.$post({ param: { driverId }, json: { status, location: "Current location" } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hos", driverId] }); qc.invalidateQueries({ queryKey: ["hos-fleet"] }); },
  });

  if (hos.isLoading) return <Spinner label="Loading hours…" />;
  const clocks = hos.data?.clocks;
  const violations = hos.data?.violations ?? [];
  const current = hos.data?.logs?.find((l) => !l.endedAt);

  const drivingTone = !clocks ? "ok" : clocks.drivingRemaining <= 0 ? "danger" : clocks.drivingRemaining <= 60 ? "warning" : "ok";
  const windowTone = !clocks ? "ok" : clocks.onDutyWindowRemaining <= 0 ? "danger" : clocks.onDutyWindowRemaining <= 60 ? "warning" : "ok";

  return (
    <div>
      <PageHeader title="Hours of Service / ELD" subtitle="49 CFR Part 395 — live duty clocks & violation watcher" />

      {violations.length > 0 && (
        <Card className="p-4 mb-6" accent>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-[#c96a4c]" /><b className="text-[#F5F5F5]">HOS Watcher</b></div>
          <div className="space-y-1.5">
            {violations.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-sm"><Badge status={v.level} />{v.msg}</div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#F5F5F5]">Current Status</h2>
            <Badge status={current?.status ?? "off_duty"} />
          </div>
          <div className="space-y-5">
            {clocks && <ClockBar label="11-Hour Driving" used={clocks.drivingUsed} total={clocks.limits.driving} tone={drivingTone} />}
            {clocks && <ClockBar label="14-Hour Window" used={clocks.onDutyWindowUsed} total={clocks.limits.onDutyWindow} tone={windowTone} />}
          </div>
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase text-[#8A8A8A] mb-2">Change duty status</div>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <Button key={s.key} variant={current?.status === s.key ? "amber" : "ghost"} disabled={setStatus.isPending} onClick={() => setStatus.mutate(s.key)}>
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-[#F5F5F5] mb-4">Today's Log</h2>
          <div className="space-y-2">
            {(hos.data?.logs ?? []).slice(0, 8).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2"><Badge status={l.status} /><span className="text-[#8A8A8A]">{l.location}</span></div>
                <span className="font-mono-data text-xs text-[#8A8A8A]">
                  {new Date(l.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {l.endedAt ? `–${new Date(l.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : " · now"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {!isDriver && fleet.data && (
        <Card className="mt-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222222]"><h2 className="font-bold text-[#F5F5F5]">Fleet HOS Overview</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#8A8A8A] text-xs uppercase bg-[#0a0a0a]">
              <th className="px-5 py-2.5">Driver</th><th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Driving Left</th><th className="px-5 py-2.5">Window Left</th><th className="px-5 py-2.5">Alerts</th>
            </tr></thead>
            <tbody>
              {fleet.data.fleet.map((f) => (
                <tr key={f.driverId} className="border-t border-[#222222]">
                  <td className="px-5 py-3 font-medium">{f.name}</td>
                  <td className="px-5 py-3"><Badge status={f.status} /></td>
                  <td className="px-5 py-3 font-mono-data">{Math.floor(f.clocks.drivingRemaining / 60)}h {f.clocks.drivingRemaining % 60}m</td>
                  <td className="px-5 py-3 font-mono-data">{Math.floor(f.clocks.onDutyWindowRemaining / 60)}h {f.clocks.onDutyWindowRemaining % 60}m</td>
                  <td className="px-5 py-3">{f.violations.length ? <Badge status="danger">{f.violations.length}</Badge> : <Badge status="success">Clear</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
