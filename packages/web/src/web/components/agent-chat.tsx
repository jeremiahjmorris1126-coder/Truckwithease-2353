import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Send } from "lucide-react";
import { api } from "../lib/api";

type Msg = { role: "user" | "assistant"; content: string };
export type QuickPrompt = { label: string; prompt: string };

/**
 * Chat console for the server-side AI agents. Every message goes to
 * POST /api/agent/<agent>, which runs through the AI Gateway on the server —
 * no model key ever reaches the browser.
 */
export function AgentChat({
  agent,
  icon: Icon,
  name,
  tagline,
  greeting,
  placeholder,
  thinking,
  quickPrompts = [],
  className = "",
}: {
  agent: "fleet-chief" | "health-chief";
  icon: LucideIcon;
  name: string;
  tagline: string;
  greeting: string;
  placeholder: string;
  thinking: string;
  quickPrompts?: QuickPrompt[];
  className?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const route = agent === "fleet-chief" ? api.agent["fleet-chief"] : api.agent["health-chief"];
      const res = await route.$post({ json: { messages: next } });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection hiccup — try that again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`flex flex-col overflow-hidden rounded-2xl border border-[#222736] bg-[#11131C] ${className}`} aria-label={`${name} chat`}>
      <div className="flex items-center gap-3 border-b border-[#222B3D] bg-[#161B26] px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/20 text-[#FFD700]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-[#F5F5F5]">{name}</h2>
          <p className="truncate font-mono text-[11px] text-[#8A8A8A]">{tagline}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/20 text-[#FFD700]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "bg-[#C9A84C] font-medium text-[#0a0a0a]" : "border border-[#262E40] bg-[#181D29] text-[#E4E4E7]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 pl-10 font-mono text-xs text-[#8A8A8A]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD700]" />
            {thinking}
          </div>
        )}
      </div>

      {quickPrompts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-[#1F2533] bg-[#12151E] px-4 py-2">
          {quickPrompts.map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.prompt)}
              disabled={busy}
              className="min-h-11 whitespace-nowrap rounded-lg border border-[#283348] bg-[#1B212E] px-3 font-mono text-xs text-[#D4D4D8] transition-colors hover:border-[#C9A84C] hover:text-[#F5F5F5] disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-[#222B3D] bg-[#141822] p-3"
      >
        <label htmlFor={`${agent}-input`} className="sr-only">
          Message {name}
        </label>
        <input
          id={`${agent}-input`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
          }}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#222B3D] bg-[#0D1017] px-4 text-base text-[#F5F5F5] placeholder:text-[#6B6B6B] focus:border-[#C9A84C] focus:outline-none sm:text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#C9A84C] text-[#0a0a0a] transition-colors hover:bg-[#FFD700] disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
