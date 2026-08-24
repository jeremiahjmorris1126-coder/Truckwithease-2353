import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Badge, Loading } from "../components/ui";

const DRIVER_ID = "drv-1";

type FuelResp = {
  stations: { id: string; brand: string; name: string; lat: number; lng: number; price: number; amenities: string[]; distance?: number }[];
  cheapestId: string; live: boolean; source: string; region: string; period: string | null; avg: number | null;
};

export default function Fuel() {
  const [loc, setLoc] = useState<{ lat: number; lng: number; state?: string | null } | null>(null);

  const stations = useQuery({ queryKey: ["m-fuel", loc], queryFn: async () => {
    const query = loc ? { lat: String(loc.lat), lng: String(loc.lng), ...(loc.state ? { state: loc.state } : {}) } : {};
    const r = await api.fuel.stations.$get({ query });
    return (await r.json()) as FuelResp;
  } });

  const useMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      let state: string | null = null;
      try {
        const s = (await (await api.fuel.state.$get({ query: { lat: String(latitude), lng: String(longitude) } })).json()) as { state: string | null };
        state = s.state ?? null;
      } catch { /* ignore */ }
      setLoc({ lat: latitude, lng: longitude, state });
    } catch { /* ignore */ }
  };
  const card = useQuery({ queryKey: ["m-card"], queryFn: async () => (await api.fuel.card[":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });

  if (stations.isLoading) return <Loading label="Finding fuel…" />;
  const list = stations.data?.stations ?? [];
  const cheapestId = stations.data?.cheapestId;
  const live = stations.data?.live;
  const sorted = [...list].sort((a, b) => a.price - b.price);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {card.data?.card && (
        <Card style={{ backgroundColor: C.navy }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.cardLabelLight}>TWE Fuel Card · Pro</Text>
              <Text style={styles.cardNumber}>{card.data.card.number}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.cardLabelLight}>Balance</Text>
              <Text style={styles.cardBalance}>${card.data.card.balance.toFixed(2)}</Text>
            </View>
          </View>
        </Card>
      )}

      <TouchableOpacity style={styles.locBtn} onPress={useMyLocation}>
        <Ionicons name="location" size={16} color={C.navy} />
        <Text style={styles.locBtnText}>Use My Location</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={styles.h}>Nearby diesel</Text>
        <Badge status={live ? "success" : "warning"}>{live ? "● LIVE · EIA" : "Estimate"}</Badge>
      </View>
      {live && stations.data?.avg != null && (
        <Text style={styles.srcNote}>
          {stations.data?.region} avg ${stations.data?.avg?.toFixed(2)}/gal{stations.data?.period ? ` · wk of ${stations.data?.period}` : ""} · U.S. EIA
        </Text>
      )}

      {sorted.map((s) => {
        const cheap = s.id === cheapestId;
        return (
          <Card key={s.id} accent={cheap} style={cheap ? { borderColor: C.amber } : undefined}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <View style={styles.rowGap}>
                  <Text style={styles.brand}>{s.brand}</Text>
                  {cheap && <Badge status="warning">Cheapest</Badge>}
                </View>
                <Text style={styles.name}>{s.name}</Text>
                <View style={styles.amen}>
                  {(s.amenities as string[]).map((a) => (
                    <View key={a} style={styles.amenPill}><Text style={styles.amenText}>{a}</Text></View>
                  ))}
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.price, cheap && { color: C.amberDark }]}>${s.price.toFixed(2)}</Text>
                <Text style={styles.gal}>/gal</Text>
                {"distance" in s && (s as any).distance != null && (
                  <View style={[styles.rowGap, { marginTop: 6 }]}><Ionicons name="location-outline" size={13} color={C.muted} /><Text style={styles.dist}>{(s as any).distance} mi</Text></View>
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h: { fontSize: 16, fontWeight: "800", color: C.ink },
  locBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.navyTint, borderRadius: 10, paddingVertical: 10 },
  locBtnText: { fontSize: 13, fontWeight: "700", color: C.navy },
  srcNote: { fontSize: 11, color: C.muted, marginTop: -6 },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 15, fontWeight: "800", color: C.ink },
  name: { fontSize: 13, color: C.muted, marginTop: 2 },
  amen: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  amenPill: { backgroundColor: C.navyTint, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  amenText: { fontSize: 10, color: C.navy, fontWeight: "600" },
  price: { fontSize: 24, fontWeight: "800", color: C.navy, fontFamily: "monospace" },
  gal: { fontSize: 11, color: C.muted },
  dist: { fontSize: 12, color: C.muted },
  cardLabelLight: { fontSize: 11, color: "#C7D3EC", fontWeight: "600" },
  cardNumber: { fontSize: 15, color: "#fff", fontWeight: "700", fontFamily: "monospace", marginTop: 4 },
  cardBalance: { fontSize: 24, color: C.amber, fontWeight: "800", fontFamily: "monospace", marginTop: 4 },
});
