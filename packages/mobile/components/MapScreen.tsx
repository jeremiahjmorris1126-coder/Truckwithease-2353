import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Badge } from "./ui";

// react-native-maps only works on native (iOS/Android), not web.
const isNative = Platform.OS === "ios" || Platform.OS === "android";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MapView: any = null, Marker: any = null, PROVIDER_GOOGLE: any = undefined;
if (isNative) {
  const m = require("react-native-maps");
  MapView = m.default;
  Marker = m.Marker;
  PROVIDER_GOOGLE = m.PROVIDER_GOOGLE;
}

type Pos = { id: string; truckNumber: string; name: string; lat: number | null; lng: number | null; status: string; speed?: number | null };

export default function MapScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [traffic, setTraffic] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);

  const positions = useQuery({
    queryKey: ["m-positions"],
    queryFn: async () => (await api.fleet.positions.$get()).json() as Promise<{ positions: Pos[] }>,
    refetchInterval: 3000,
  });
  const ps = (positions.data?.positions ?? []).filter((p) => p.lat != null && p.lng != null);
  const sel = ps.find((p) => p.id === selected);

  useEffect(() => {
    if (!isNative) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({});
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (isNative && mapRef.current && ps.length > 0) {
      mapRef.current.fitToCoordinates(
        ps.map((p) => ({ latitude: p.lat!, longitude: p.lng! })),
        { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true },
      );
    }
  }, [ps.length]);

  const navigate = (p: Pos) => {
    const url = Platform.select({
      ios: `maps://?daddr=${p.lat},${p.lng}`,
      android: `google.navigation:q=${p.lat},${p.lng}`,
      default: `https://www.google.com/maps?q=${p.lat},${p.lng}`,
    });
    if (url) Linking.openURL(url);
  };

  // ---- Web fallback (Expo web preview): live list, no native map ----
  if (!isNative) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={styles.webNote}>
          <Ionicons name="information-circle-outline" size={16} color={C.navy} />
          <Text style={styles.webNoteText}>Interactive Google Map runs on the installed iOS/Android app. Live positions below.</Text>
        </View>
        {ps.map((p) => (
          <Card key={p.id} accent={p.id === selected}>
            <TouchableOpacity onPress={() => setSelected(p.id)} style={styles.row}>
              <View style={styles.pin}><Ionicons name="car" size={18} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tn}>{p.truckNumber} · {p.name}</Text>
                <Text style={styles.meta}>{Math.round(p.speed ?? 0)} mph · {p.lat?.toFixed(3)}, {p.lng?.toFixed(3)}</Text>
              </View>
              <Badge status={p.status === "driving" ? "success" : "warning"}>{p.status}</Badge>
            </TouchableOpacity>
            {p.id === selected && (
              <TouchableOpacity style={styles.navBtn} onPress={() => navigate(p)}>
                <Ionicons name="navigate" size={16} color="#fff" /><Text style={styles.navText}>Navigate</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}
      </ScrollView>
    );
  }

  // ---- Native Google Map ----
  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        mapType={mapType}
        showsTraffic={traffic}
        showsUserLocation
        initialRegion={{ latitude: me?.lat ?? 38.9, longitude: me?.lng ?? -90.0, latitudeDelta: 4, longitudeDelta: 4 }}
      >
        {ps.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat!, longitude: p.lng! }}
            title={`${p.truckNumber} · ${p.name}`}
            description={`${Math.round(p.speed ?? 0)} mph · ${p.status}`}
            pinColor={p.id === selected ? "#FFB400" : p.status === "driving" ? "#1FA971" : "#0B2A6B"}
            onPress={() => setSelected(p.id)}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrl, traffic && styles.ctrlOn]} onPress={() => setTraffic((v) => !v)}>
          <Ionicons name="pulse" size={18} color={traffic ? "#0B2A6B" : "#fff"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrl} onPress={() => setMapType((v) => (v === "standard" ? "satellite" : "standard"))}>
          <Ionicons name="layers" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Selected card */}
      {sel && (
        <View style={styles.selCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selTitle}>{sel.truckNumber} · {sel.name}</Text>
            <Text style={styles.selMeta}>{Math.round(sel.speed ?? 0)} mph · {sel.status}</Text>
          </View>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigate(sel)}>
            <Ionicons name="navigate" size={16} color="#fff" /><Text style={styles.navText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  webNote: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: C.navyTint, borderRadius: 10, padding: 12 },
  webNoteText: { flex: 1, fontSize: 12, color: C.navy },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  pin: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.navy, alignItems: "center", justifyContent: "center" },
  tn: { fontSize: 14, fontWeight: "700", color: C.ink },
  meta: { fontSize: 12, color: C.muted, marginTop: 2, fontFamily: "monospace" },
  navBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.navy, borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  navText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  controls: { position: "absolute", top: 16, right: 16, gap: 10 },
  ctrl: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.navy, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4 },
  ctrlOn: { backgroundColor: C.amber },
  selCard: { position: "absolute", bottom: 20, left: 16, right: 16, backgroundColor: "#fff", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8 },
  selTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  selMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
});
