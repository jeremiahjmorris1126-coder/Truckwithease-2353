import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { Card, Badge, Spinner, PageHeader, Button } from "../components/ui/kit";
import { Truck, Navigation, MapPin, Layers, Activity } from "lucide-react";
import { FleetMap } from "../components/FleetMap";

const HAS_MAPS = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [traffic, setTraffic] = useState(true);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const positions = useQuery({
    queryKey: ["positions"],
    queryFn: async () => (await api.fleet.positions.$get()).json(),
    refetchInterval: 3000,
  });

  if (positions.isLoading) return <Spinner label="Locating fleet…" />;
  const ps = positions.data?.positions ?? [];
  const sel = ps.find((p) => p.id === selected);

  // Project lat/lng to a US bounding box for the schematic map
  const box = { minLat: 30, maxLat: 44, minLng: -98, maxLng: -80 };
  const project = (lat: number, lng: number) => ({
    x: ((lng - box.minLng) / (box.maxLng - box.minLng)) * 100,
    y: (1 - (lat - box.minLat) / (box.maxLat - box.minLat)) * 100,
  });

  return (
    <div>
      <PageHeader title="Live Fleet Map" subtitle="Real-time truck positions · updates every 3s"
        action={HAS_MAPS ? (
          <div className="flex gap-2">
            <Button variant={traffic ? "amber" : "ghost"} onClick={() => setTraffic((v) => !v)}><Activity className="h-4 w-4" />Traffic</Button>
            <Button variant="ghost" onClick={() => setMapType((v) => v === "roadmap" ? "satellite" : "roadmap")}><Layers className="h-4 w-4" />{mapType === "roadmap" ? "Satellite" : "Map"}</Button>
          </div>
        ) : undefined} />
      {!HAS_MAPS && (
        <div className="rounded-lg bg-[#FFB400]/10 border border-[#FFB400]/30 px-4 py-2.5 text-sm text-[#8B6914] mb-4">
          Add a <b>Google Maps API key</b> (VITE_GOOGLE_MAPS_API_KEY) for the full interactive map with traffic &amp; truck routing. Showing the live schematic tracker below.
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          {HAS_MAPS ? (
            <div className="aspect-[16/10]">
              <FleetMap positions={ps as any} selected={selected} onSelect={setSelected} traffic={traffic} mapType={mapType} />
            </div>
          ) : (
          <div className="relative aspect-[16/10] twe-navy-grad">
            {/* grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i / 12) * 100}%`} x2="100%" y2={`${(i / 12) * 100}%`} stroke="#8FA6D4" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={`v${i}`} x1={`${(i / 16) * 100}%`} y1="0" x2={`${(i / 16) * 100}%`} y2="100%" stroke="#8FA6D4" strokeWidth="0.5" />
              ))}
            </svg>
            {ps.map((p) => {
              if (!p.lat || !p.lng) return null;
              const { x, y } = project(p.lat, p.lng);
              const active = p.id === selected;
              return (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform ${active ? "bg-[#FFB400] scale-125" : p.status === "driving" ? "bg-[#1FA971]" : "bg-white"}`}>
                    <Truck className={`h-4 w-4 ${active ? "text-[#0B2A6B]" : p.status === "driving" ? "text-white" : "text-[#0B2A6B]"}`} />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded bg-[#071E4E] px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100">
                    {p.truckNumber}
                  </div>
                </button>
              );
            })}
          </div>
          )}
        </Card>

        <div className="space-y-3">
          {sel ? (
            <Card className="p-5" accent>
              <div className="flex items-center gap-2 mb-3"><Truck className="h-5 w-5 text-[#0B2A6B]" /><b>{sel.truckNumber}</b><Badge status={sel.status} /></div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-[#5B6577]">Driver</span><span className="font-medium">{sel.name}</span></div>
                <div className="flex justify-between"><span className="text-[#5B6577]">Speed</span><span className="font-mono-data">{Math.round(sel.speed ?? 0)} mph</span></div>
                <div className="flex justify-between"><span className="text-[#5B6577]">Position</span><span className="font-mono-data text-xs">{sel.lat?.toFixed(3)}, {sel.lng?.toFixed(3)}</span></div>
              </div>
              <a href={`https://www.google.com/maps?q=${sel.lat},${sel.lng}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#0B2A6B] text-white py-2 text-sm font-medium">
                <Navigation className="h-4 w-4" />Open in Maps
              </a>
            </Card>
          ) : (
            <Card className="p-5 text-center text-sm text-[#5B6577]"><MapPin className="h-6 w-6 mx-auto mb-2 text-[#FFB400]" />Tap a truck to see details</Card>
          )}
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase text-[#5B6577] mb-2">Fleet ({ps.length})</div>
            <div className="space-y-1">
              {ps.map((p) => (
                <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm ${p.id === selected ? "bg-[#FFB400]/10" : "hover:bg-[#F4F6FB]"}`}>
                  <span className="font-medium">{p.truckNumber}</span>
                  <Badge status={p.status} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
