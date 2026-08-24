import { useEffect, useMemo, useRef, useState } from "react";
import {
  APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary,
} from "@vis.gl/react-google-maps";

export type FleetPos = {
  id: string; truckNumber: string; name: string;
  lat: number | null; lng: number | null; status: string; speed?: number | null;
};

const NAVY = "#0B2A6B";
const AMBER = "#FFB400";
const GREEN = "#1FA971";

// Dark navy map style to match the brand
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d1b3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1b3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8fa6d4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1b2f5e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a447e" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#FFB400" }, { weight: 0.3 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#071733" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a447e" }] },
];

function TrafficLayer({ on }: { on: boolean }) {
  const map = useMap();
  const layerRef = useRef<google.maps.TrafficLayer | null>(null);
  useEffect(() => {
    if (!map) return;
    if (!layerRef.current) layerRef.current = new google.maps.TrafficLayer();
    layerRef.current.setMap(on ? map : null);
    return () => { layerRef.current?.setMap(null); };
  }, [map, on]);
  return null;
}

function RouteToTruck({ dest }: { dest: { lat: number; lng: number } | null }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [renderer, setRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new routesLib.DirectionsRenderer({
      map, suppressMarkers: true,
      polylineOptions: { strokeColor: AMBER, strokeWeight: 5, strokeOpacity: 0.9 },
    });
    setRenderer(r);
    return () => r.setMap(null);
  }, [routesLib, map]);

  useEffect(() => {
    if (!routesLib || !renderer || !dest) { renderer?.setDirections({ routes: [] } as any); return; }
    // Route from a nominal dispatch/home-base origin to the selected truck.
    const origin = { lat: 38.627, lng: -90.199 }; // St. Louis HQ
    const svc = new routesLib.DirectionsService();
    svc.route(
      { origin, destination: dest, travelMode: google.maps.TravelMode.DRIVING },
      (res, status) => { if (status === "OK" && res) renderer.setDirections(res); },
    );
  }, [routesLib, renderer, dest]);

  return null;
}

function truckPin(active: boolean, driving: boolean) {
  const bg = active ? AMBER : driving ? GREEN : "#ffffff";
  const fg = active ? NAVY : driving ? "#ffffff" : NAVY;
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 999, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,.4)", border: active ? `2px solid ${NAVY}` : "none",
      transform: active ? "scale(1.15)" : "scale(1)", transition: "transform .15s",
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
        <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    </div>
  );
}

function MapInner({ positions, selected, onSelect, traffic, mapType }: {
  positions: FleetPos[]; selected: string | null; onSelect: (id: string) => void;
  traffic: boolean; mapType: "roadmap" | "satellite";
}) {
  const map = useMap();
  const valid = positions.filter((p) => p.lat != null && p.lng != null);

  // Fit bounds once we have trucks
  useEffect(() => {
    if (!map || valid.length === 0) return;
    const b = new google.maps.LatLngBounds();
    valid.forEach((p) => b.extend({ lat: p.lat!, lng: p.lng! }));
    map.fitBounds(b, 80);
  }, [map, valid.length]);

  const sel = valid.find((p) => p.id === selected);

  return (
    <>
      <TrafficLayer on={traffic} />
      <RouteToTruck dest={sel ? { lat: sel.lat!, lng: sel.lng! } : null} />
      {valid.map((p) => (
        <AdvancedMarker key={p.id} position={{ lat: p.lat!, lng: p.lng! }} onClick={() => onSelect(p.id)} title={p.truckNumber}>
          {truckPin(p.id === selected, p.status === "driving")}
        </AdvancedMarker>
      ))}
    </>
  );
}

export function FleetMap(props: {
  positions: FleetPos[]; selected: string | null; onSelect: (id: string) => void;
  traffic: boolean; mapType: "roadmap" | "satellite";
}) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const center = useMemo(() => ({ lat: 38.9, lng: -90.0 }), []);
  if (!key) return null;

  return (
    <APIProvider apiKey={key}>
      <Map
        mapId="twe-fleet"
        defaultCenter={center}
        defaultZoom={6}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeId={props.mapType}
        styles={props.mapType === "roadmap" ? MAP_STYLE : undefined}
        style={{ width: "100%", height: "100%" }}
      >
        <MapInner {...props} />
      </Map>
    </APIProvider>
  );
}
