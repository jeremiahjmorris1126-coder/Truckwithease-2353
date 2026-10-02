import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import { C } from "../lib/theme";
import { Card, Badge, Button, Loading } from "../components/ui";

const DRIVER_ID = "drv-1";
type Panel = "hub" | "rewards" | "health" | "loads" | "chat";

export default function More() {
  const [panel, setPanel] = useState<Panel>("hub");
  if (panel === "rewards") return <Rewards back={() => setPanel("hub")} />;
  if (panel === "health") return <Health back={() => setPanel("hub")} />;
  if (panel === "loads") return <Loads back={() => setPanel("hub")} />;
  if (panel === "chat") return <Chat back={() => setPanel("hub")} />;

  const links: { key: Panel; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "rewards", label: "EaseRewards", desc: "Points, tier & redeem", icon: "trophy-outline" },
    { key: "health", label: "Driver Health", desc: "Med card, vitals & coach", icon: "heart-outline" },
    { key: "loads", label: "Load Board", desc: "Book freight by $/mile", icon: "cube-outline" },
    { key: "chat", label: "Dispatch Chat", desc: "Message home base", icon: "chatbubbles-outline" },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {links.map((l) => (
        <TouchableOpacity key={l.key} onPress={() => setPanel(l.key)}>
          <Card>
            <View style={styles.linkRow}>
              <View style={styles.linkIcon}><Ionicons name={l.icon} size={22} color={C.navy} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>{l.label}</Text>
                <Text style={styles.linkDesc}>{l.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      <Card style={{ backgroundColor: C.navy }}>
        <Text style={styles.ctaTitle}>Drive Smart. Stay Compliant.</Text>
        <Text style={styles.ctaBody}>TruckWithEase — no contracts, cancel anytime. ~60% below Motive.</Text>
      </Card>
    </ScrollView>
  );
}

function BackBar({ back, title }: { back: () => void; title: string }) {
  return (
    <TouchableOpacity style={styles.backBar} onPress={back}>
      <Ionicons name="chevron-back" size={20} color={C.navy} />
      <Text style={styles.backText}>{title}</Text>
    </TouchableOpacity>
  );
}

function Rewards({ back }: { back: () => void }) {
  const qc = useQueryClient();
  const acct = useQuery({ queryKey: ["m-rewards"], queryFn: async () => (await api.rewards[":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });
  const cat = useQuery({ queryKey: ["m-rewards-cat"], queryFn: async () => (await api.rewards.catalog.$get()).json() });
  const redeem = useMutation({
    mutationFn: async (rewardId: string) => (await api.rewards[":driverId"].redeem.$post({ param: { driverId: DRIVER_ID }, json: { rewardId } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["m-rewards"] }); qc.invalidateQueries({ queryKey: ["m-driver"] }); },
  });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <BackBar back={back} title="EaseRewards" />
      {acct.isLoading ? <Loading /> : (
        <>
          <Card style={{ backgroundColor: C.navy }}>
            <Text style={styles.ctaBody}>{acct.data?.tier} Tier</Text>
            <Text style={styles.pointsBig}>{acct.data?.points.toLocaleString()}</Text>
            <Text style={styles.ctaBody}>points available</Text>
          </Card>
          {(cat.data?.catalog ?? []).map((r) => {
            const ok = (acct.data?.points ?? 0) >= r.cost;
            return (
              <Card key={r.id}>
                <Text style={styles.linkLabel}>{r.title}</Text>
                <Text style={styles.linkDesc}>{r.desc}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <Text style={styles.pointsCost}>{r.cost.toLocaleString()} pts</Text>
                  <View style={{ width: 120 }}><Button label={ok ? "Redeem" : "Locked"} variant={ok ? "amber" : "ghost"} disabled={!ok || redeem.isPending} onPress={() => redeem.mutate(r.id)} /></View>
                </View>
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function Health({ back }: { back: () => void }) {
  const data = useQuery({ queryKey: ["m-health-full"], queryFn: async () => (await api["driver-health"][":driverId"].$get({ param: { driverId: DRIVER_ID } })).json() });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <BackBar back={back} title="Driver Health" />
      {data.isLoading ? <Loading /> : (
        <>
          {(data.data?.flags ?? []).concat(data.data?.reminders ?? []).length === 0 ? (
            <Card><Text style={styles.linkDesc}>All clear — no health or certification flags.</Text></Card>
          ) : (
            <Card accent>
              <Text style={styles.linkLabel}>Health Flags</Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                {data.data?.reminders.map((r, i) => <View key={`r${i}`} style={styles.alertRow}><Badge status={r.level} /><Text style={styles.alertText}>{r.msg}</Text></View>)}
                {data.data?.flags.map((f, i) => <View key={`f${i}`} style={styles.alertRow}><Badge status={f.level} /><Text style={styles.alertText}>{f.msg}</Text></View>)}
              </View>
            </Card>
          )}
          {(data.data?.medCards ?? []).map((mc) => (
            <Card key={mc.id} accent>
              <Text style={styles.linkLabel}>DOT Medical Card</Text>
              <Text style={styles.kv}>Expires: {mc.expiryDate}</Text>
              <Text style={styles.kv}>Examiner: {mc.examiner}</Text>
              <Text style={styles.kv}>Restrictions: {mc.restrictions}</Text>
            </Card>
          ))}
          {data.data?.vitals[0] && (
            <Card>
              <Text style={styles.linkLabel}>Latest Vitals</Text>
              <Text style={styles.kv}>BP: {data.data.vitals[0].systolic}/{data.data.vitals[0].diastolic}</Text>
              <Text style={styles.kv}>Weight: {data.data.vitals[0].weight} lb</Text>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Loads({ back }: { back: () => void }) {
  const qc = useQueryClient();
  const loads = useQuery({ queryKey: ["m-loads"], queryFn: async () => (await api.loads.$get()).json() });
  const book = useMutation({
    mutationFn: async (id: string) => (await api.loads[":id"].book.$post({ param: { id }, json: { driverId: DRIVER_ID } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["m-loads"] }),
  });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <BackBar back={back} title="Load Board" />
      {loads.isLoading ? <Loading /> : [...(loads.data?.loads ?? [])].sort((a, b) => (b.rpm ?? 0) - (a.rpm ?? 0)).map((l) => (
        <Card key={l.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.linkLabel}>{l.origin} → {l.destination}</Text>
            <Text style={styles.rpm}>${l.rpm?.toFixed(2)}/mi</Text>
          </View>
          <Text style={styles.linkDesc}>{l.broker} · {l.equipment} · {l.miles?.toLocaleString()} mi · ${l.rate?.toLocaleString()}</Text>
          <View style={{ marginTop: 10 }}>
            {l.status === "booked" ? <Badge status="booked" /> : <Button label="Book Load" variant="amber" disabled={book.isPending} onPress={() => book.mutate(l.id)} />}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

function Chat({ back }: { back: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const msgs = useQuery({ queryKey: ["m-chat"], queryFn: async () => (await api.chat.$get()).json(), refetchInterval: 4000 });
  const send = useMutation({
    mutationFn: async (body: string) => (await api.chat.$post({ json: { fromId: DRIVER_ID, fromName: "Marcus Bell", body } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["m-chat"] }); setText(""); },
  });
  const QUICK = ["On my way", "Stopped for break", "Delivered", "Need help"];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <BackBar back={back} title="Dispatch Chat" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {QUICK.map((q) => <TouchableOpacity key={q} style={styles.quickChip} onPress={() => send.mutate(q)}><Text style={styles.quickChipText}>{q}</Text></TouchableOpacity>)}
      </View>
      {msgs.isLoading ? <Loading /> : (msgs.data?.messages ?? []).map((m) => {
        const mine = m.fromId === DRIVER_ID;
        return (
          <View key={m.id} style={[styles.chatRow, mine && { alignItems: "flex-end" }]}>
            <Text style={styles.chatName}>{m.fromName}</Text>
            <View style={[styles.chatBubble, mine ? { backgroundColor: C.navy } : { backgroundColor: "#fff", borderWidth: 1, borderColor: C.border }]}>
              <Text style={[styles.chatText, mine && { color: "#fff" }]}>{m.body}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkIcon: { height: 42, width: 42, borderRadius: 10, backgroundColor: C.navyTint, alignItems: "center", justifyContent: "center" },
  linkLabel: { fontSize: 15, fontWeight: "800", color: C.ink },
  linkDesc: { fontSize: 13, color: C.muted, marginTop: 2 },
  ctaTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  ctaBody: { fontSize: 13, color: "#C7D3EC", marginTop: 4 },
  backBar: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  backText: { fontSize: 15, fontWeight: "700", color: C.navy },
  pointsBig: { fontSize: 40, fontWeight: "800", color: C.amber, fontFamily: "monospace", marginTop: 4 },
  pointsCost: { fontSize: 15, fontWeight: "800", color: C.navy, fontFamily: "monospace" },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.bg, borderRadius: 10, padding: 10 },
  alertText: { flex: 1, fontSize: 13, color: C.ink },
  kv: { fontSize: 13, color: C.muted, marginTop: 4 },
  rpm: { fontSize: 15, fontWeight: "800", color: C.success, fontFamily: "monospace" },
  quickChip: { backgroundColor: "#fff", borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  quickChipText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  chatRow: { gap: 3 },
  chatName: { fontSize: 11, color: C.muted },
  chatBubble: { maxWidth: "80%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  chatText: { fontSize: 14, color: C.ink },
});
