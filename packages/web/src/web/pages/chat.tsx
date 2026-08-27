import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, PageHeader, Button, Spinner } from "../components/ui/kit";
import { Send, MessageSquare, Zap } from "lucide-react";

const QUICK = ["On my way", "Stopped for break", "Running late ~30 min", "Delivered", "Need help"];

export default function Chat() {
  const { session } = useSession();
  const qc = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  const msgs = useQuery({
    queryKey: ["chat"],
    queryFn: async () => (await api.chat.$get()).json(),
    refetchInterval: 4000,
  });

  const send = useMutation({
    mutationFn: async (body: string) => (await api.chat.$post({ json: { fromId: session.driverId, fromName: session.name, body } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chat"] }); setText(""); },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.data]);

  const rows = msgs.data?.messages ?? [];

  return (
    <div>
      <PageHeader title="Dispatch Chat" subtitle="Direct line between dispatch and the road — live, per fleet." />
      <Card className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#222222] bg-[#0a0a0a]">
          <MessageSquare className="h-4 w-4 text-[#C9A84C]" />
          <span className="font-bold text-sm text-[#F5F5F5]">Fleet Channel</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#C9A84C]"><span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />Live</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.isLoading ? <Spinner /> : rows.length === 0 ? (
            <p className="text-sm text-[#8A8A8A] text-center py-10">No messages yet. Say hello to the fleet.</p>
          ) : rows.map((m) => {
            const mine = m.fromId === session.driverId && m.fromName === session.name;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] ${mine ? "items-end" : ""}`}>
                  <div className={`text-[11px] mb-1 ${mine ? "text-right text-[#8A8A8A]" : "text-[#8A8A8A]"}`}>{m.fromName}</div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-[#C9A84C] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#F5F5F5]"}`}>{m.body}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="border-t border-[#222222] p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send.mutate(q)} disabled={send.isPending} className="flex items-center gap-1 rounded-full border border-[#222222] px-2.5 py-1 text-xs text-[#8A8A8A] hover:border-[#C9A84C] hover:text-[#F5F5F5]"><Zap className="h-3 w-3 text-[#C9A84C]" />{q}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(text); }} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the fleet…" className="flex-1 rounded-lg border border-[#222222] px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none" />
            <Button variant="amber" type="submit" disabled={send.isPending}><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
