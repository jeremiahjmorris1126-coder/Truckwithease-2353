import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, Stat, Badge, Spinner, PageHeader } from "../components/ui/kit";
import { AlertTriangle, Truck, Clock, ClipboardCheck, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { session } = useSession();
  const drivers = useQuery({ queryKey: ["drivers"], queryFn: async () => (await api.fleet.drivers.$get()).json() });
  const hosFleet = useQuery({ queryKey: ["hos-fleet"], queryFn: async () => (await api.hos.$get()).json() });
  const dvir = useQuery({ queryKey: ["dvir"], queryFn: async () => (await api.dvir.$get()).json() });
  const trucks = useQuery({ queryKey: ["trucks"], queryFn: async () => (await api.fleet.trucks.$get()).json() });

  if (drivers.isLoading || hosFleet.isLoading) return <Spinner label="Loading fleet…" />;

  const ds = drivers.data?.drivers ?? [];
  const driving = ds.filter((d) => d.status === "driving").length;
  const allViolations = (hosFleet.data?.fleet ?? []).flatMap((f) => f.violations.map((v) => ({ ...v, name: f.name })));
  const needsRepair = (dvir.data?.inspections ?? []).filter((i) => i.status === "needs_repair");
  const maint = (trucks.data?.trucks ?? []).filter((t) => t.status === "maintenance").length;

  return (
    <div>
      <PageHeader
        title={session.role === "driver" ? `Welcome back, ${session.name.split(" ")[0]}` : "Fleet Command"}
        subtitle={session.role === "driver" ? "Your compliance at a glance" : "Live status across your fleet"}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Active Drivers" value={ds.length} sub={`${driving} currently driving`} />
        <Stat label="HOS Alerts" value={allViolations.length} tone={allViolations.length ? "danger" : "success"} sub="Across fleet" />
        <Stat label="DVIR Repairs" value={needsRepair.length} tone={needsRepair.length ? "danger" : "success"} sub="Awaiting service" />
        <Stat label="In Maintenance" value={maint} tone={maint ? "amber" : "success"} sub="Trucks down" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="p-5 lg:col-span-2" accent>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#E0322B]" />
            <h2 className="font-bold text-[#0E1524]">Compliance Alerts</h2>
          </div>
          {allViolations.length === 0 && needsRepair.length === 0 ? (
            <p className="text-sm text-[#5B6577] py-6 text-center">All clear — no active compliance issues. </p>
          ) : (
            <div className="space-y-2">
              {allViolations.map((v, i) => (
                <div key={`v${i}`} className="flex items-center gap-3 rounded-lg bg-[#F4F6FB] px-3 py-2.5">
                  <Badge status={v.level} />
                  <span className="text-sm text-[#0E1524]"><b>{v.name}:</b> {v.msg}</span>
                </div>
              ))}
              {needsRepair.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg bg-[#F4F6FB] px-3 py-2.5">
                  <Badge status="danger" />
                  <span className="text-sm text-[#0E1524]"><b>{r.truckUnit}:</b> DVIR defect — {(r.defects as string[]).join(", ")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick links */}
        <Card className="p-5">
          <h2 className="font-bold text-[#0E1524] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: "/app/hos", label: "Log Hours (HOS)", icon: Clock },
              { to: "/app/dvir", label: "Start Inspection", icon: ClipboardCheck },
              { to: "/app/map", label: "Live Fleet Map", icon: Truck },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.to} to={q.to} className="flex items-center justify-between rounded-lg border border-[#E2E7F0] px-3 py-2.5 hover:border-[#FFB400] hover:bg-[#FFB400]/5 transition-colors">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-[#0E1524]"><Icon className="h-4 w-4 text-[#0B2A6B]" />{q.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#5B6577]" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Driver roster */}
      <Card className="mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E7F0]"><h2 className="font-bold text-[#0E1524]">Driver Roster</h2></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#5B6577] text-xs uppercase tracking-wide bg-[#F4F6FB]">
              <th className="px-5 py-2.5 font-semibold">Driver</th>
              <th className="px-5 py-2.5 font-semibold">Truck</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
              <th className="px-5 py-2.5 font-semibold">Home Base</th>
              <th className="px-5 py-2.5 font-semibold">Tier</th>
              <th className="px-5 py-2.5 font-semibold text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {ds.map((d) => (
              <tr key={d.id} className="border-t border-[#E2E7F0] hover:bg-[#F4F6FB]">
                <td className="px-5 py-3 font-medium text-[#0E1524]">{d.name}</td>
                <td className="px-5 py-3 font-mono-data text-[#5B6577]">{d.truckNumber}</td>
                <td className="px-5 py-3"><Badge status={d.status} /></td>
                <td className="px-5 py-3 text-[#5B6577]">{d.homeBase}</td>
                <td className="px-5 py-3 capitalize text-[#5B6577]">{d.tier}</td>
                <td className="px-5 py-3 text-right font-mono-data text-[#E09E00] font-semibold">{d.points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
