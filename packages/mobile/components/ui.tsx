import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { C, toneColor } from "../lib/theme";

export function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.accent, style]}>{children}</View>;
}

export function Stat({ label, value, tone = "navy", sub }: { label: string; value: string | number; tone?: "navy" | "amber" | "success" | "danger"; sub?: string }) {
  const colors = { navy: C.navy, amber: C.amberDark, success: C.success, danger: C.danger };
  return (
    <Card style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: colors[tone] }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Card>
  );
}

export function Badge({ status, children }: { status?: string; children?: ReactNode }) {
  const col = status ? toneColor[status] ?? C.muted : C.muted;
  const label = children ?? status?.replace(/_/g, " ");
  return (
    <View style={[styles.badge, { backgroundColor: col + "22" }]}>
      <Text style={[styles.badgeText, { color: col }]}>{label}</Text>
    </View>
  );
}

export function Button({ label, onPress, variant = "primary", disabled, style }: { label: string; onPress?: () => void; variant?: "primary" | "amber" | "ghost" | "danger"; disabled?: boolean; style?: ViewStyle }) {
  const bg = { primary: C.navy, amber: C.amber, ghost: "transparent", danger: C.danger }[variant];
  const fg = variant === "amber" ? C.ink : variant === "ghost" ? C.navy : "#fff";
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1, borderWidth: variant === "ghost" ? 1 : 0, borderColor: C.border }, style]}>
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={C.amber} size="large" />
      {label ? <Text style={styles.loadingText}>{label}</Text> : null}
    </View>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.h1}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  accent: { borderLeftWidth: 4, borderLeftColor: C.amber },
  statLabel: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  statSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  btn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontWeight: "700" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  loadingText: { color: C.muted, fontSize: 14 },
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4 },
});
