import { useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../lib/api";
import { C } from "../lib/theme";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Freightliner Cascadia DEF pressure fault — where do I start?",
  "Reefer won't hold temp on a Carrier X4 7300",
  "Trailer ABS light stays on after air-up",
];

export default function Chief() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: "I'm Fleet Chief — your on-call mechanic for trucks AND trailers. Give me the make, model, year and the symptom." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function send(t: string) {
    if (!t.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next); setInput(""); setBusy(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const res = await api.agent["fleet-chief"].$post({ json: { messages: next } });
      const d = await res.json();
      setMessages([...next, { role: "assistant", content: d.text }]);
    } catch { setMessages([...next, { role: "assistant", content: "Connection hiccup — try again." }]); }
    finally { setBusy(false); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubbleRow, m.role === "user" && { justifyContent: "flex-end" }]}>
            {m.role === "assistant" && <View style={styles.avatar}><Ionicons name="construct" size={16} color={C.amber} /></View>}
            <View style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, m.role === "user" && { color: "#fff" }]}>{m.content}</Text>
            </View>
          </View>
        ))}
        {busy && <Text style={styles.thinking}>Fleet Chief is thinking…</Text>}
        {messages.length <= 1 && (
          <View style={{ gap: 8, marginTop: 8 }}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.sugg} onPress={() => send(s)}>
                <Text style={styles.suggText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput value={input} onChangeText={setInput} placeholder="Describe the truck/trailer problem…" placeholderTextColor={C.muted} style={styles.input} multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(input)} disabled={busy}>
          <Ionicons name="send" size={18} color={C.ink} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  bubbleRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  avatar: { height: 30, width: 30, borderRadius: 8, backgroundColor: C.navy, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "82%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  aiBubble: { backgroundColor: "#fff", borderWidth: 1, borderColor: C.border },
  userBubble: { backgroundColor: C.navy },
  bubbleText: { fontSize: 14, color: C.ink, lineHeight: 20 },
  thinking: { fontSize: 13, color: C.muted, paddingLeft: 38 },
  sugg: { backgroundColor: "#fff", borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12 },
  suggText: { fontSize: 13, color: C.muted },
  inputBar: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: C.border, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.ink, maxHeight: 100 },
  sendBtn: { height: 42, width: 42, borderRadius: 10, backgroundColor: C.amber, alignItems: "center", justifyContent: "center" },
});
