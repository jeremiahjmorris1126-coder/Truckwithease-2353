import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Card, PageHeader, Button, Badge, Spinner } from "../components/ui/kit";
import { FileText, Download, Clock, ClipboardCheck, Fuel, Route, Trophy } from "lucide-react";

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const head = keys.join(",");
  const body = rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")).join("\n");
  return `${head}\n${body}`;
}
function download(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const drivers = useQuery({ queryKey: ["drivers"], queryFn: async () => (await api.fleet.drivers.$get()).json() });
  const hos = useQuery({ queryKey: ["hos-fleet"], queryFn: async () => (await api.hos.$get()).json() });
  const dvir = useQuery({ queryKey: ["dvir"], queryFn: async () => (await api.dvir.$get()).json() });
  const loads = useQuery({ queryKey: ["loads"], queryFn: async () => (await api.loads.$get()).json() });

  if (drivers.isLoading) return <Spinner label="Building reports…" />;

  const ds = drivers.data?.drivers ?? [];
  const fleet = hos.data?.fleet ?? [];
  const insp = dvir.data?.inspections ?? [];
  const lds = loads.data?.loads ?? [];

  const reportCards = [
    {
      icon: Clock, title: "HOS Compliance Report", tone: "info",
      desc: "Duty-status hours, cycle usage, and violations per driver.",
      count: fleet.reduce((s, f) => s + f.violations.length, 0) + " open violations",
      onExport: () => download("hos-report.csv", toCSV(fleet.map((f) => ({ driver: f.name, truck: f.truckNumber, status: f.status, drivingUsed: f.clocks?.drivingUsed ?? 0, drivingRemaining: f.clocks?.drivingRemaining ?? 0, windowRemaining: f.clocks?.onDutyWindowRemaining ?? 0, violations: f.violations.length })))),
    },
    {
      icon: ClipboardCheck, title: "DVIR Inspection Report", tone: "success",
      desc: "Pre/post-trip inspections, defects, and repair status.",
      count: insp.filter((i) => i.status === "needs_repair").length + " need repair",
      onExport: () => download("dvir-report.csv", toCSV(insp.map((i) => ({ truck: i.truckUnit, type: i.type, status: i.status, defects: (i.defects as string[]).join("; "), date: i.createdAt })))),
    },
    {
      icon: Trophy, title: "Driver Points Report", tone: "warning",
      desc: "EaseRewards points balance and tier per driver.",
      count: ds.reduce((s, d) => s + d.points, 0).toLocaleString() + " total pts",
      onExport: () => download("rewards-report.csv", toCSV(ds.map((d) => ({ driver: d.name, truck: d.truckNumber, tier: d.tier, points: d.points })))),
    },
    {
      icon: Route, title: "Load / Revenue Report", tone: "info",
      desc: "Booked and available loads with rate-per-mile.",
      count: lds.filter((l) => l.status === "booked").length + " booked",
      onExport: () => download("loads-report.csv", toCSV(lds.map((l) => ({ origin: l.origin, destination: l.destination, miles: l.miles, rate: l.rate, rpm: l.rpm, status: l.status })))),
    },
    {
      icon: FileText, title: "Fleet Roster", tone: "info",
      desc: "Complete driver + truck assignment roster.",
      count: ds.length + " drivers",
      onExport: () => download("roster.csv", toCSV(ds.map((d) => ({ name: d.name, truck: d.truckNumber, status: d.status, homeBase: d.homeBase, tier: d.tier })))),
    },
    {
      icon: Fuel, title: "IFTA Mileage Summary", tone: "warning",
      desc: "State-by-state mileage for quarterly IFTA filing.",
      count: "Quarterly",
      onExport: () => download("ifta-summary.csv", toCSV(ds.map((d) => ({ driver: d.name, truck: d.truckNumber, note: "Connect ELD trips for full state breakdown" })))),
    },
  ];

  return (
    <div>
      <PageHeader title="Reports & Exports" subtitle="Every compliance record, downloadable as CSV for audits, IFTA, and leadership." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1C]"><Icon className="h-5 w-5 text-[#C9A84C]" /></div>
                <Badge status={r.tone}>{r.count}</Badge>
              </div>
              <div className="font-bold text-[#F5F5F5]">{r.title}</div>
              <p className="text-xs text-[#8A8A8A] mt-1 flex-1">{r.desc}</p>
              <Button variant="ghost" className="w-full mt-4" onClick={r.onExport}><Download className="h-4 w-4" />Export CSV</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
