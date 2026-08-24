import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, Spinner, PageHeader, Button, Badge } from "../components/ui/kit";
import { Fuel, MapPin, CreditCard, Navigation } from "lucide-react";

export default function FuelPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [usState, setUsState] = useState<string | null>(null);
  const [payFor, setPayFor] = useState<string | null>(null);
  const [gallons, setGallons] = useState(100);

  const stations = useQuery({
    queryKey: ["fuel", coords, usState],
    queryFn: async () => (await api.fuel.stations.$get({
      query: coords
        ? { lat: String(coords.lat), lng: String(coords.lng), ...(usState ? { state: usState } : {}) }
        : {},
    })).json(),
  });
  const card = useQuery({ queryKey: ["fuel-card", session.driverId], queryFn: async () => (await api.fuel.card[":driverId"].$get({ param: { driverId: session.driverId } })).json() });

  const charge = useMutation({
    mutationFn: async (v: { station: string; pricePerGal: number }) =>
      (await api.fuel.card[":driverId"].charge.$post({ param: { driverId: session.driverId }, json: { station: v.station, gallons, pricePerGal: v.pricePerGal } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel-card"] }); setPayFor(null); },
  });

  const resolveState = async (lat: number, lng: number) => {
    try {
      const r = (await (await api.fuel.state.$get({ query: { lat: String(lat), lng: String(lng) } })).json()) as { state: string | null };
      setUsState(r.state ?? null);
    } catch { setUsState(null); }
  };
  const useMyLocation = () => navigator.geolocation?.getCurrentPosition(
    (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); resolveState(p.coords.latitude, p.coords.longitude); },
    () => { setCoords({ lat: 38.627, lng: -90.199 }); setUsState("MO"); },
  );

  if (stations.isLoading) return <Spinner label="Finding diesel…" />;
  const list = stations.data?.stations ?? [];
  const cheapest = stations.data?.cheapestId;

  return (
    <div>
      <PageHeader title="Fuel Finder"
        subtitle={stations.data?.live
          ? `Live diesel · ${stations.data?.source} ${stations.data?.region} avg ${stations.data?.avg?.toFixed(2)}${stations.data?.period ? ` (wk of ${stations.data?.period})` : ""}`
          : "Diesel prices (regional estimate)"}
        action={<Button variant="ghost" onClick={useMyLocation}><MapPin className="h-4 w-4" />Use My Location</Button>} />
      {stations.data?.live && (
        <div className="mb-4 -mt-2"><Badge status="success">● LIVE · U.S. EIA government data</Badge></div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {list.map((s) => (
            <Card key={s.id} className="p-4" accent={s.id === cheapest}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2A6B]/10"><Fuel className="h-5 w-5 text-[#0B2A6B]" /></div>
                  <div>
                    <div className="font-semibold text-[#0E1524] flex items-center gap-2">{s.name} {s.id === cheapest && <Badge status="success">Cheapest</Badge>}</div>
                    <div className="text-xs text-[#5B6577]">{s.brand}{"distance" in s ? ` · ${(s as any).distance} mi` : ""} · {s.amenities.join(" · ")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono-data text-[#0B2A6B]">${s.price.toFixed(2)}</div>
                  <div className="text-[11px] text-[#5B6577] uppercase">per gal</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="ghost" className="w-full"><Navigation className="h-4 w-4" />Navigate</Button>
                </a>
                <Button variant="amber" onClick={() => setPayFor(s.id)}><CreditCard className="h-4 w-4" />Pay with Fuel Card</Button>
              </div>
              {payFor === s.id && (
                <div className="mt-3 flex items-center gap-2 border-t border-[#E2E7F0] pt-3">
                  <input type="number" value={gallons} onChange={(e) => setGallons(Number(e.target.value))} className="w-24 rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm font-mono-data" />
                  <span className="text-sm text-[#5B6577]">gal = <b className="font-mono-data">${(gallons * s.price).toFixed(2)}</b></span>
                  <Button variant="primary" disabled={charge.isPending} onClick={() => charge.mutate({ station: s.name, pricePerGal: s.price })}>Charge</Button>
                  <Button variant="ghost" onClick={() => setPayFor(null)}>Cancel</Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-5 twe-navy-grad text-white">
            <div className="flex items-center gap-2 mb-1"><CreditCard className="h-5 w-5 text-[#FFB400]" /><b>Fuel Card</b></div>
            <div className="text-xs text-[#C7D3EC] mb-4">Pro / Owner-Operator perk</div>
            {card.isLoading ? <div className="text-sm">Loading…</div> : (
              <>
                <div className="font-mono-data text-lg tracking-wider">{card.data?.card.number}</div>
                <div className="mt-3 text-4xl font-bold font-mono-data text-[#FFB400]">${card.data?.card.balance.toFixed(2)}</div>
                <div className="text-xs text-[#C7D3EC]">available balance</div>
                <div className="mt-4 space-y-1.5">
                  {card.data?.card.history.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex justify-between text-xs border-t border-[#163B7E] pt-1.5">
                      <span className="text-[#C7D3EC]">{h.station} · {h.gallons}g</span>
                      <span className="font-mono-data">-${h.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
