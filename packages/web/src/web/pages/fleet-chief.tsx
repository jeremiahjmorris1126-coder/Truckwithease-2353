import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Card, PageHeader, Button, Badge } from "../components/ui/kit";
import { Wrench, Send, Truck, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "My 2020 Freightliner Cascadia throws a DEF pressure fault — where do I start?",
  "Reefer unit won't hold temp on a Carrier X4 7300 — troubleshoot it.",
  "Trailer ABS light stays on after air-up. What do I check?",
  "How do I inspect fifth wheel play during a pre-trip?",
];

export default function FleetChief() {
  const status = useQuery({ queryKey: ["agent-status"], queryFn: async () => (await api.agent.status.$get()).json() });
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "I'm Fleet Chief — your on-call master mechanic for trucks AND trailers. Tell me the make, model, year and the symptom, and I'll walk you through it like I'm standing at the bay with you." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await api.agent["fleet-chief"].$post({ json: { messages: next } });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection hiccup — try that again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Fleet Chief AI"
        subtitle="Master-level diagnostics for tractors and trailers — real mechanic answers by make, model, year."
        action={status.data && <Badge status={status.data.live ? "success" : "warning"}>{status.data.live ? "AI Live" : "Demo mode"}</Badge>}
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#222222] bg-[#C9A84C] text-[#0a0a0a]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A84C]"><Wrench className="h-4 w-4 text-[#C9A84C]" /></div>
            <div><div className="font-bold text-sm">Fleet Chief</div><div className="text-[11px] text-[#C9C9C9]">Truck + Trailer Mechanic</div></div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]"><Wrench className="h-4 w-4 text-[#C9A84C]" /></div>}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#C9A84C] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#F5F5F5]"}`}>{m.content}</div>
              </div>
            ))}
            {busy && <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]"><Wrench className="h-4 w-4 text-[#C9A84C]" /></div><div className="rounded-2xl bg-[#0a0a0a] px-4 py-3"><div className="flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-[#8A8A8A]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#8A8A8A] [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#8A8A8A] [animation-delay:300ms]" /></div></div></div>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-[#222222] p-3">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe the truck/trailer and the problem…" className="flex-1 rounded-lg border border-[#222222] px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none" />
              <Button variant="amber" type="submit" disabled={busy}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#F5F5F5]"><Sparkles className="h-4 w-4 text-[#C9A84C]" />Try asking</div>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={busy} className="w-full text-left rounded-lg border border-[#222222] px-3 py-2 text-xs text-[#8A8A8A] hover:border-[#C9A84C] hover:text-[#F5F5F5] transition-colors">{s}</button>
              ))}
            </div>
          </Card>
          <Card className="p-4" accent>
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-[#F5F5F5]"><Truck className="h-4 w-4 text-[#C9A84C]" />Covers everything</div>
            <p className="text-xs text-[#8A8A8A] leading-relaxed">Engines, aftertreatment/DEF, air brakes, electrical, HVAC — plus reefer units, axles, landing gear, fifth wheel, brake chambers, trailer electrical, and dry van / flatbed / tanker / reefer specifics.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
