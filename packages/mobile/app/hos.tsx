import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Badge, Button, Loading } from "../components/ui";

const DRIVER_ID = "drv-1";
const STATUSES: { key: string; label: string }[] = [
  { key: "off_duty", label: "Off Duty" },
  { key: "sleeper", label: "Sleeper" },
  { key: "driving", label: "Driving" },
  { key: "on_duty", label: "On Duty" },
];

export default function HOS() {
  const qc = useQueryClient();
  const hos = useQuery({ queryKey: ["m-hos"], queryFn: async () => (await api.hos[":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });

  const setStatus = useMutation({
    mutationFn: async (status: string) => (await api.hos[":driverId"].status.$post({ param: { driverId: DRIVER_ID }, json: { status, location: "On route" } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["m-hos"] }); qc.invalidateQueries({ queryKey: ["m-driver"] }); },
  });

  if (hos.isLoading) return <Loading label="Loading logs…" />;
  const clocks = hos.data?.clocks;
  const logs = hos.data?.logs ?? [];
  const violations = hos.data?.violations ?? [];
  const current = logs.find((l) => !l.endedAt);

  const clockRows = clocks ? [
    { label: "Driving remaining", used: clocks.drivingUsed, rem: clocks.drivingRemaining, max: clocks.limits.driving },
    { label: "14-hr window", used: clocks.onDutyWindowUsed, rem: clocks.onDutyWindowRemaining, max: clocks.limits.onDutyWindow },
  ] : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Card>
        <Text style={styles.title}>Current Status</Text>
        <View style={{ marginTop: 10 }}><Badge status={current?.status ?? "off_duty"} /></View>
        <View style={styles.statusGrid}>
          {STATUSES.map((s) => {
            const active = current?.status === s.key;
            return (
              <View key={s.key} style={{ width: "47%" }}>
                <Button label={s.label} variant={active ? "amber" : "ghost"} disabled={setStatus.isPending} onPress={() => setStatus.mutate(s.key)} />
              </View>
            );
          })}
        </View>
      </Card>

      {clockRows.map((r) => {
        const pct = Math.min(100, Math.round((r.used / r.max) * 100));
        const low = r.rem < 60;
        return (
          <Card key={r.label}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.clockLabel}>{r.label}</Text>
              <Text style={[styles.clockValue, { color: low ? C.danger : C.navy }]}>{(r.rem / 60).toFixed(1)}h left</Text>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${pct}%`, backgroundColor: low ? C.danger : C.amber }]} /></View>
            <Text style={styles.clockSub}>{(r.used / 60).toFixed(1)}h used of {(r.max / 60).toFixed(0)}h</Text>
          </Card>
        );
      })}

      {violations.length > 0 && (
        <Card accent>
          <Text style={styles.title}>Violations</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {violations.map((v, i) => (
              <View key={i} style={styles.alertRow}><Badge status={v.level} /><Text style={styles.alertText}>{v.msg}</Text></View>
            ))}
          </View>
        </Card>
      )}

      <Card>
        <Text style={styles.title}>Recent Log</Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {logs.slice(0, 8).map((l) => (
            <View key={l.id} style={styles.logRow}>
              <Badge status={l.status} />
              <Text style={styles.logTime}>{new Date(l.startedAt as any).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>
              <Text style={styles.logLoc}>{l.location ?? ""}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 15, fontWeight: "800", color: C.ink },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  clockLabel: { fontSize: 14, fontWeight: "600", color: C.ink },
  clockValue: { fontSize: 16, fontWeight: "800", fontFamily: "monospace" },
  track: { height: 8, borderRadius: 999, backgroundColor: C.border, marginTop: 10, overflow: "hidden" },
  fill: { height: 8, borderRadius: 999 },
  clockSub: { fontSize: 12, color: C.muted, marginTop: 6 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.bg, borderRadius: 10, padding: 10 },
  alertText: { flex: 1, fontSize: 13, color: C.ink },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logTime: { fontSize: 12, color: C.ink, fontFamily: "monospace" },
  logLoc: { fontSize: 12, color: C.muted, flex: 1 },
});
