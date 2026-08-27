import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Card, PageHeader, Button, Badge, Spinner } from "../components/ui/kit";
import { HeartPulse, Activity, CalendarClock, Send, Plus, X, Stethoscope } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "overview" | "vitals" | "cards" | "coach";

export default function Health() {
  const { session } = useSession();
  const qc = useQueryClient();
  const id = session.driverId;
  const [tab, setTab] = useState<Tab>("overview");
  const [showVital, setShowVital] = useState(false);
  const [v, setV] = useState({ systolic: "", diastolic: "", weight: "", height: "", glucose: "" });

  const data = useQuery({ queryKey: ["health", id], queryFn: async () => (await api["driver-health"][":driverId"].$get({ param: { driverId: id } })).json() });

  const addVital = useMutation({
    mutationFn: async () => (await api["driver-health"][":driverId"].vitals.$post({ param: { driverId: id }, json: { systolic: +v.systolic, diastolic: +v.diastolic, weight: +v.weight, height: +v.height, glucose: v.glucose ? +v.glucose : undefined } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["health", id] }); setShowVital(false); setV({ systolic: "", diastolic: "", weight: "", height: "", glucose: "" }); },
  });

  // Coach chat
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: "I'm Health Chief — your DOT-physical and trucker-wellness coach. Ask me about passing your DOT exam, blood pressure, sleep apnea, eating right on the road, staying certified — anything." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function sendCoach(t: string) {
    if (!t.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const res = await api.agent["health-chief"].$post({ json: { messages: next } });
      const d = await res.json();
      setMessages([...next, { role: "assistant", content: d.text }]);
    } catch { setMessages([...next, { role: "assistant", content: "Connection hiccup — try again." }]); }
    finally { setBusy(false); }
  }

  if (data.isLoading) return <Spinner label="Loading driver health…" />;
  const d = data.data!;
  const latest = d.vitals[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" }, { id: "vitals", label: "Vitals" }, { id: "cards", label: "Med Cards" }, { id: "coach", label: "Health Chief AI" },
  ];

  return (
    <div>
      <PageHeader title="Driver Health" subtitle="DOT med cards, vitals, and 49 CFR 391 compliance — plus an AI wellness coach built for the road." />

      <div className="flex gap-1 mb-5 border-b border-[#222222]">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-[#8A8A8A] hover:text-[#F5F5F5]"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5" accent>
              <div className="flex items-center gap-2 mb-4 font-bold text-[#F5F5F5]"><Activity className="h-5 w-5 text-[#c96a4c]" />Health Flags</div>
              {d.flags.length === 0 && d.reminders.length === 0 ? (
                <p className="text-sm text-[#8A8A8A] py-4 text-center">All clear — no health or certification flags.</p>
              ) : (
                <div className="space-y-2">
                  {d.reminders.map((r, i) => <div key={`r${i}`} className="flex items-center gap-3 rounded-lg bg-[#0a0a0a] px-3 py-2.5"><Badge status={r.level} /><span className="text-sm text-[#F5F5F5]">{r.msg}</span></div>)}
                  {d.flags.map((f, i) => <div key={`f${i}`} className="flex items-center gap-3 rounded-lg bg-[#0a0a0a] px-3 py-2.5"><Badge status={f.level} /><span className="text-sm text-[#F5F5F5]">{f.msg}</span></div>)}
                </div>
              )}
            </Card>
            {latest && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4"><div className="text-xs uppercase text-[#8A8A8A] font-semibold">Blood Pressure</div><div className="text-2xl font-bold font-mono-data text-[#C9A84C] mt-1">{latest.systolic}/{latest.diastolic}</div></Card>
                <Card className="p-4"><div className="text-xs uppercase text-[#8A8A8A] font-semibold">Weight</div><div className="text-2xl font-bold font-mono-data text-[#C9A84C] mt-1">{latest.weight} <span className="text-sm">lb</span></div></Card>
                <Card className="p-4"><div className="text-xs uppercase text-[#8A8A8A] font-semibold">BMI</div><div className="text-2xl font-bold font-mono-data text-[#C9A84C] mt-1">{((latest.weight / (latest.height * latest.height)) * 703).toFixed(1)}</div></Card>
              </div>
            )}
          </div>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 font-bold text-[#F5F5F5]"><CalendarClock className="h-5 w-5 text-[#C9A84C]" />Appointments</div>
            {d.appointments.length === 0 ? <p className="text-sm text-[#8A8A8A]">None scheduled.</p> : (
              <div className="space-y-2">
                {d.appointments.map((a) => <div key={a.id} className="rounded-lg bg-[#0a0a0a] px-3 py-2.5"><div className="text-sm font-medium text-[#F5F5F5]">{a.type}</div><div className="text-xs text-[#8A8A8A]">{a.date} · {a.provider}</div></div>)}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "vitals" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
            <h2 className="font-bold text-[#F5F5F5]">Vitals History</h2>
            <Button variant="amber" onClick={() => setShowVital(true)}><Plus className="h-4 w-4" />Log Vitals</Button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#8A8A8A] text-xs uppercase bg-[#0a0a0a]"><th className="px-5 py-2.5">Date</th><th className="px-5 py-2.5">BP</th><th className="px-5 py-2.5">Weight</th><th className="px-5 py-2.5">BMI</th><th className="px-5 py-2.5">Glucose</th></tr></thead>
            <tbody>
              {d.vitals.map((row) => (
                <tr key={row.id} className="border-t border-[#222222]">
                  <td className="px-5 py-3 text-[#8A8A8A]">{new Date(row.at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-mono-data text-[#F5F5F5]">{row.systolic}/{row.diastolic}</td>
                  <td className="px-5 py-3 font-mono-data text-[#F5F5F5]">{row.weight} lb</td>
                  <td className="px-5 py-3 font-mono-data text-[#F5F5F5]">{((row.weight / (row.height * row.height)) * 703).toFixed(1)}</td>
                  <td className="px-5 py-3 font-mono-data text-[#F5F5F5]">{row.glucose ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "cards" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {d.medCards.length === 0 ? <p className="text-sm text-[#8A8A8A]">No med cards on file.</p> : d.medCards.map((mc) => (
            <Card key={mc.id} className="p-5" accent>
              <div className="flex items-center gap-2 mb-3 font-bold text-[#F5F5F5]"><Stethoscope className="h-5 w-5 text-[#C9A84C]" />DOT Medical Card</div>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-[#8A8A8A]">Issued</dt><dd className="font-mono-data text-[#F5F5F5]">{mc.issued}</dd></div>
                <div className="flex justify-between"><dt className="text-[#8A8A8A]">Expires</dt><dd className="font-mono-data text-[#F5F5F5]">{mc.expiryDate}</dd></div>
                <div className="flex justify-between"><dt className="text-[#8A8A8A]">Examiner</dt><dd className="text-[#F5F5F5]">{mc.examiner}</dd></div>
                <div className="flex justify-between"><dt className="text-[#8A8A8A]">Restrictions</dt><dd className="text-[#F5F5F5]">{mc.restrictions}</dd></div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      {tab === "coach" && (
        <Card className="flex flex-col h-[calc(100vh-280px)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#222222] bg-[#C9A84C] text-[#0a0a0a]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A84C]"><HeartPulse className="h-4 w-4 text-[#C9A84C]" /></div>
            <div><div className="font-bold text-sm">Health Chief</div><div className="text-[11px] text-[#C9C9C9]">DOT Physical + Wellness Coach</div></div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]"><HeartPulse className="h-4 w-4 text-[#C9A84C]" /></div>}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#C9A84C] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#F5F5F5]"}`}>{m.content}</div>
              </div>
            ))}
            {busy && <div className="text-sm text-[#8A8A8A] pl-11">Health Chief is thinking…</div>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-[#222222] p-3">
            <form onSubmit={(e) => { e.preventDefault(); sendCoach(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your DOT physical, BP, sleep, diet…" className="flex-1 rounded-lg border border-[#222222] px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none" />
              <Button variant="amber" type="submit" disabled={busy}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>
      )}

      {showVital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowVital(false)}>
          <Card className="w-full max-w-md p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg text-[#F5F5F5]">Log Vitals</h2><button onClick={() => setShowVital(false)}><X className="h-5 w-5 text-[#8A8A8A]" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[["systolic", "Systolic"], ["diastolic", "Diastolic"], ["weight", "Weight (lb)"], ["height", "Height (in)"], ["glucose", "Glucose (opt)"]].map(([k, label]) => (
                <label key={k} className="text-xs font-semibold text-[#8A8A8A]">{label}
                  <input type="number" value={(v as any)[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-[#222222] px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#C9A84C] focus:outline-none" />
                </label>
              ))}
            </div>
            <Button variant="amber" className="w-full mt-5" disabled={addVital.isPending || !v.systolic || !v.diastolic || !v.weight || !v.height} onClick={() => addVital.mutate()}>Save</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
