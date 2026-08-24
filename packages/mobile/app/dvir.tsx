import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Badge, Button, Loading } from "../components/ui";

const DRIVER_ID = "drv-1";
const TRUCK = "T-104";

export default function DVIR() {
  const qc = useQueryClient();
  const [vehicleType, setVehicleType] = useState<"tractor" | "trailer">("tractor");
  const [type, setType] = useState<"pre_trip" | "post_trip">("pre_trip");
  const [defects, setDefects] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<null | { safe: boolean; count: number }>(null);

  const items = useQuery({ queryKey: ["dvir-items"], queryFn: async () => (await api.dvir.items.$get()).json() });
  const history = useQuery({ queryKey: ["dvir-hist"], queryFn: async () => (await api.dvir.driver[":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });

  const submit = useMutation({
    mutationFn: async () => (await api.dvir.$post({ json: { driverId: DRIVER_ID, truckUnit: TRUCK, type, vehicleType, defects, signature: "Marcus Bell" } })).json(),
    onSuccess: () => { setSubmitted({ safe: defects.length === 0, count: defects.length }); setDefects([]); qc.invalidateQueries({ queryKey: ["dvir-hist"] }); qc.invalidateQueries({ queryKey: ["m-hos"] }); },
  });

  if (items.isLoading) return <Loading label="Loading checklist…" />;
  const list = vehicleType === "tractor" ? items.data?.tractor ?? [] : items.data?.trailer ?? [];
  const toggle = (i: string) => setDefects((d) => d.includes(i) ? d.filter((x) => x !== i) : [...d, i]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {submitted && (
        <Card accent style={{ backgroundColor: submitted.safe ? "#EAF7F0" : "#FDECEA" }}>
          <View style={styles.rowGap}>
            <Ionicons name={submitted.safe ? "checkmark-circle" : "alert-circle"} size={20} color={submitted.safe ? C.success : C.danger} />
            <Text style={styles.cardTitle}>{submitted.safe ? "Inspection passed — safe to operate" : `${submitted.count} defect(s) logged — flagged for repair`}</Text>
          </View>
        </Card>
      )}

      <Card>
        <Text style={styles.cardTitle}>New Inspection · {TRUCK}</Text>
        <View style={styles.seg}>
          {(["tractor", "trailer"] as const).map((v) => (
            <TouchableOpacity key={v} style={[styles.segBtn, vehicleType === v && styles.segActive]} onPress={() => { setVehicleType(v); setDefects([]); }}>
              <Text style={[styles.segText, vehicleType === v && styles.segTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.seg}>
          {(["pre_trip", "post_trip"] as const).map((v) => (
            <TouchableOpacity key={v} style={[styles.segBtn, type === v && styles.segActive]} onPress={() => setType(v)}>
              <Text style={[styles.segText, type === v && styles.segTextActive]}>{v.replace("_", "-")}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Tap any item that has a defect</Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {list.map((it) => {
            const bad = defects.includes(it);
            return (
              <TouchableOpacity key={it} style={[styles.item, bad && styles.itemBad]} onPress={() => toggle(it)}>
                <Ionicons name={bad ? "close-circle" : "checkmark-circle-outline"} size={20} color={bad ? C.danger : C.success} />
                <Text style={[styles.itemText, bad && { color: C.danger, fontWeight: "700" }]}>{it}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Button label={defects.length ? `Submit — ${defects.length} defect(s)` : "Submit — all good"} variant={defects.length ? "danger" : "amber"} disabled={submit.isPending} style={{ marginTop: 14 }} onPress={() => submit.mutate()} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent Inspections</Text>
        {history.isLoading ? <Loading /> : (
          <View style={{ marginTop: 10, gap: 8 }}>
            {(history.data?.inspections ?? []).slice(0, 6).map((r) => (
              <View key={r.id} style={styles.histRow}>
                <Badge status={r.status} />
                <Text style={styles.histText}>{r.vehicleType} · {r.type.replace("_", "-")}</Text>
                <Text style={styles.histDefects}>{(r.defects as string[]).length ? `${(r.defects as string[]).length} defect` : "clean"}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  cardTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  seg: { flexDirection: "row", gap: 8, marginTop: 12 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  segActive: { backgroundColor: C.navy, borderColor: C.navy },
  segText: { fontSize: 13, fontWeight: "600", color: C.muted, textTransform: "capitalize" },
  segTextActive: { color: "#fff" },
  item: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 10, backgroundColor: C.bg },
  itemBad: { backgroundColor: "#FDECEA" },
  itemText: { fontSize: 14, color: C.ink },
  histRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  histText: { fontSize: 13, color: C.ink, textTransform: "capitalize", flex: 1 },
  histDefects: { fontSize: 12, color: C.muted },
});
