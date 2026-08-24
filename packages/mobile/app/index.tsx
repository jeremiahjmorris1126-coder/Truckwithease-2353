import { ScrollView, View, Text, StyleSheet, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Stat, Badge, Loading } from "../components/ui";

const DRIVER_ID = "drv-1"; // demo driver (Marcus Bell, T-104)

export default function Dashboard() {
  const router = useRouter();
  const driver = useQuery({ queryKey: ["m-driver"], queryFn: async () => (await api.fleet.drivers.$get()).json() });
  const hos = useQuery({ queryKey: ["m-hos"], queryFn: async () => (await api.hos[":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });
  const health = useQuery({ queryKey: ["m-health"], queryFn: async () => (await api["driver-health"][":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });

  if (driver.isLoading || hos.isLoading) return <Loading label="Loading your cab…" />;

  const me = (driver.data?.drivers ?? []).find((d) => d.id === DRIVER_ID);
  const clocks = hos.data?.clocks;
  const violations = hos.data?.violations ?? [];
  const flags = health.data?.flags ?? [];
  const reminders = health.data?.reminders ?? [];
  const drivingH = clocks ? (clocks.drivingRemaining / 60).toFixed(1) : "—";
  const windowH = clocks ? (clocks.onDutyWindowRemaining / 60).toFixed(1) : "—";

  const quick: { label: string; icon: keyof typeof Ionicons.glyphMap; to: string }[] = [
    { label: "Log Hours", icon: "time-outline", to: "/hos" },
    { label: "Inspection", icon: "clipboard-outline", to: "/dvir" },
    { label: "Find Fuel", icon: "flame-outline", to: "/fuel" },
    { label: "Fleet Chief", icon: "construct-outline", to: "/chief" },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => { driver.refetch(); hos.refetch(); health.refetch(); }} />}>
      <View>
        <Text style={styles.greet}>Welcome back, {me?.name.split(" ")[0] ?? "Driver"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Text style={styles.truck}>{me?.truckNumber}</Text>
          <Badge status={me?.status} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat label="Drive Left" value={`${drivingH}h`} tone={clocks && clocks.drivingRemaining < 60 ? "danger" : "success"} sub="of 11h" />
        <Stat label="Window Left" value={`${windowH}h`} tone={clocks && clocks.onDutyWindowRemaining < 60 ? "danger" : "navy"} sub="of 14h" />
        <Stat label="Points" value={me?.points.toLocaleString() ?? "0"} tone="amber" sub={me?.tier} />
      </View>

      {(violations.length > 0 || flags.length > 0 || reminders.length > 0) && (
        <Card accent>
          <View style={styles.rowGap}><Ionicons name="warning-outline" size={18} color={C.danger} /><Text style={styles.cardTitle}>Alerts</Text></View>
          <View style={{ gap: 8, marginTop: 10 }}>
            {violations.map((v, i) => <AlertRow key={`v${i}`} level={v.level} msg={v.msg} />)}
            {reminders.map((r, i) => <AlertRow key={`r${i}`} level={r.level} msg={r.msg} />)}
            {flags.map((f, i) => <AlertRow key={`f${i}`} level={f.level} msg={f.msg} />)}
          </View>
        </Card>
      )}

      <Card>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quick.map((q) => (
            <View key={q.to} style={styles.quickItem} onTouchEnd={() => router.push(q.to as any)}>
              <View style={styles.quickIcon}><Ionicons name={q.icon} size={22} color={C.navy} /></View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.rowGap}><Ionicons name="shield-checkmark-outline" size={18} color={C.success} /><Text style={styles.cardTitle}>Drive Smart. Stay Compliant.</Text></View>
        <Text style={styles.body}>Your compliance, GPS, fuel, tolls, and two AI experts — all in one app. Tap More for tolls, health, rewards, loads, and chat.</Text>
      </Card>
    </ScrollView>
  );
}

function AlertRow({ level, msg }: { level: string; msg: string }) {
  return (
    <View style={styles.alertRow}>
      <Badge status={level} />
      <Text style={styles.alertText}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  greet: { fontSize: 22, fontWeight: "800", color: C.ink },
  truck: { fontFamily: "monospace", color: C.muted, fontSize: 14 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 8 },
  body: { fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 19 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.bg, borderRadius: 10, padding: 10 },
  alertText: { flex: 1, fontSize: 13, color: C.ink },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  quickItem: { width: "47%", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.bg, borderRadius: 10, padding: 12 },
  quickIcon: { height: 38, width: 38, borderRadius: 9, backgroundColor: C.navyTint, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 13, fontWeight: "600", color: C.ink },
});
