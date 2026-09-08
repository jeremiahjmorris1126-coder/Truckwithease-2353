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
  const unavailable = !session.driverId;

  return (
    <div>
      <PageHeader title="Dispatch Chat" subtitle="Direct line between dispatch and the road — live, per fleet." />
      <Card className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#222634] bg-[#08090c]">
          <MessageSquare className="h-4 w-4 text-[#d4af37]" />
          <span className="font-bold text-sm text-[#e3e2e6]">Fleet Channel</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#d4af37]"><span className="h-2 w-2  bg-[#d4af37] animate-pulse" />Live</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.isError ? <p className="text-sm text-[#ef4444] text-center py-10">Messages could not be loaded. Refresh to retry.</p> : msgs.isLoading ? <Spinner /> : rows.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-10">No messages yet. Say hello to the fleet.</p>
          ) : rows.map((m) => {
            const mine = m.fromId === session.driverId && m.fromName === session.name;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] ${mine ? "items-end" : ""}`}>
                  <div className={`text-[11px] mb-1 ${mine ? "text-right text-[#94a3b8]" : "text-[#94a3b8]"}`}>{m.fromName}</div>
                  <div className={` px-4 py-2.5 text-sm ${mine ? "bg-[#d4af37] text-[#08090c]" : "bg-[#08090c] text-[#e3e2e6]"}`}>{m.body}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="border-t border-[#222634] p-3 space-y-2">
          {unavailable ? <p className="text-xs text-[#eab308]">Claim your driver profile to send messages.</p> : null}
          {send.isError ? <p className="text-xs text-[#ef4444]">Message was not sent. Try again.</p> : null}
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send.mutate(q)} disabled={send.isPending || unavailable} className="flex items-center gap-1  border border-[#222634] px-2.5 py-1 text-xs text-[#94a3b8] hover:border-[#d4af37] hover:text-[#e3e2e6]"><Zap className="h-3 w-3 text-[#d4af37]" />{q}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(text); }} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={unavailable ? "Claim your driver profile before messaging…" : "Message the fleet…"} className="flex-1  border border-[#222634] px-3 py-2.5 text-sm focus:border-[#d4af37] focus:outline-none" />
            <Button variant="amber" type="submit" disabled={send.isPending || unavailable}><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
