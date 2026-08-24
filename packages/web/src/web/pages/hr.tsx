import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Card, PageHeader, Button, Badge, Spinner } from "../components/ui/kit";
import {
  Users, AlertTriangle, FolderOpen, DollarSign, TrendingUp, ClipboardList,
  ShieldCheck, Send, Plus, X, Download, FileText, Bot,
} from "lucide-react";

type Tab = "dashboard" | "people" | "occurrences" | "screening" | "documents" | "background" | "payroll" | "profit";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "people", label: "People", icon: Users },
  { id: "occurrences", label: "Occurrences", icon: AlertTriangle },
  { id: "screening", label: "AI Screening", icon: ClipboardList },
  { id: "background", label: "Background", icon: ShieldCheck },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "profit", label: "Profitability", icon: TrendingUp },
];

const money = (n: number) => `$${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HR() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const status = useQuery({ queryKey: ["hr-status"], queryFn: async () => (await api.hr.status.$get()).json() });

  return (
    <div>
      <PageHeader
        title="HumanAI HR Manager"
        subtitle="Masters-credentialed AI HR for trucking — hiring, records, occurrences, background, payroll & profitability."
        action={status.data && <Badge status={status.data.live ? "success" : "warning"}>{status.data.live ? "AI Live" : "Demo mode"}</Badge>}
      />

      <div className="grid xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <div className="flex flex-wrap gap-1 mb-5 border-b border-[#E2E7F0]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-[#FFB400] text-[#0B2A6B]" : "border-transparent text-[#5B6577] hover:text-[#0E1524]"}`}>
                  <Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>

          {tab === "dashboard" && <Dashboard onNav={setTab} />}
          {tab === "people" && <People />}
          {tab === "occurrences" && <Occurrences />}
          {tab === "screening" && <Screening />}
          {tab === "background" && <Background />}
          {tab === "documents" && <Documents />}
          {tab === "payroll" && <Payroll />}
          {tab === "profit" && <Profitability />}
        </div>

        <AskHumanAI />
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ onNav }: { onNav: (t: Tab) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["hr-summary"], queryFn: async () => (await api.hr.summary.$get()).json() });
  if (isLoading || !data) return <Spinner label="Loading HR overview…" />;
  const s = data;
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Headcount" value={s.headcount} sub={`${s.activeDrivers} active`} />
        <Stat label="In Pipeline" value={s.prospects} sub="prospects / applicants" tone="amber" />
        <Stat label="Open Occurrences" value={s.openOccurrences} sub={`${s.criticalOccurrences} major/critical`} tone={s.criticalOccurrences ? "danger" : "navy"} />
        <Stat label="Docs Expiring" value={s.expiringDocs} sub="within 45 days" tone={s.expiringDocs ? "danger" : "success"} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6577] mb-3">Fleet Profitability (recent runs)</div>
          <div className="flex items-end gap-6">
            <div><div className="text-2xl font-bold font-mono-data text-[#1FA971]">{money(s.profit.revenue)}</div><div className="text-xs text-[#5B6577]">Revenue</div></div>
            <div><div className="text-2xl font-bold font-mono-data text-[#E0322B]">{money(s.profit.cost)}</div><div className="text-xs text-[#5B6577]">Cost</div></div>
            <div><div className="text-2xl font-bold font-mono-data text-[#0B2A6B]">{money(s.profit.net)}</div><div className="text-xs text-[#5B6577]">Net</div></div>
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => onNav("profit")}>View breakdown</Button>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6577] mb-3">Last Payroll</div>
          {s.lastPayroll ? (
            <div>
              <div className="text-2xl font-bold font-mono-data text-[#0B2A6B]">{money(s.lastPayroll.totalGross ?? 0)}</div>
              <div className="text-xs text-[#5B6577]">gross · {s.lastPayroll.headcount} employees · {s.lastPayroll.periodStart} → {s.lastPayroll.periodEnd}</div>
              <Badge status={s.lastPayroll.status === "finalized" ? "success" : "warning"}>{s.lastPayroll.status}</Badge>
            </div>
          ) : <div className="text-sm text-[#5B6577]">No payroll runs yet.</div>}
          <Button variant="ghost" className="mt-4 w-full" onClick={() => onNav("payroll")}>Run payroll</Button>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = "navy" }: { label: string; value: React.ReactNode; sub?: string; tone?: "navy" | "amber" | "success" | "danger" }) {
  const tones: Record<string, string> = { navy: "text-[#0B2A6B]", amber: "text-[#E09E00]", success: "text-[#1FA971]", danger: "text-[#E0322B]" };
  return (
    <Card className="p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6577]">{label}</div>
      <div className={`mt-2 text-3xl font-bold font-mono-data ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-[#5B6577]">{sub}</div>}
    </Card>
  );
}

/* ---------------- People ---------------- */
function People() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["hr-people"], queryFn: async () => (await api.hr.people.$get()).json() });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", type: "prospect", position: "Company Driver", phone: "", email: "", cdlState: "MO", payType: "mileage", payRate: 0.55, yearsExperience: 0 });
  const create = useMutation({
    mutationFn: async () => (await api.hr.people.$post({ json: form })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hr-people"] }); qc.invalidateQueries({ queryKey: ["hr-summary"] }); setShow(false); setForm({ ...form, name: "", phone: "", email: "" }); },
  });
  if (isLoading || !data) return <Spinner label="Loading people…" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-[#5B6577]">{data.people.length} records</div>
        <Button variant="amber" onClick={() => setShow(true)}><Plus className="h-4 w-4" />Add person</Button>
      </div>
      {show && (
        <Card className="p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name"><input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Type"><select className={inp} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="prospect">Prospect</option><option value="driver">Driver</option><option value="employee">Employee</option></select></Field>
            <Field label="Position"><input className={inp} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
            <Field label="Phone"><input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><input className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="CDL State"><input className={inp} value={form.cdlState} onChange={(e) => setForm({ ...form, cdlState: e.target.value })} /></Field>
            <Field label="Pay type"><select className={inp} value={form.payType} onChange={(e) => setForm({ ...form, payType: e.target.value })}><option value="mileage">Per mile</option><option value="hourly">Hourly</option><option value="salary">Salary</option></select></Field>
            <Field label={`Pay rate (${form.payType === "mileage" ? "$/mi" : form.payType === "hourly" ? "$/hr" : "$/yr"})`}><input type="number" step="0.01" className={inp} value={form.payRate} onChange={(e) => setForm({ ...form, payRate: +e.target.value })} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="amber" disabled={!form.name || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Saving…" : "Save"}</Button>
            <Button variant="ghost" onClick={() => setShow(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FB] text-[#5B6577] text-xs uppercase"><tr>
            <th className="text-left px-4 py-2.5">Name</th><th className="text-left px-4 py-2.5">Position</th>
            <th className="text-left px-4 py-2.5">Type</th><th className="text-left px-4 py-2.5">Status</th>
            <th className="text-right px-4 py-2.5">Pay</th>
          </tr></thead>
          <tbody>
            {data.people.map((p: any) => (
              <tr key={p.id} className="border-t border-[#E2E7F0] hover:bg-[#F9FBFE]">
                <td className="px-4 py-2.5 font-semibold text-[#0E1524]">{p.name}<div className="text-xs font-normal text-[#5B6577]">{p.homeBase || p.email}</div></td>
                <td className="px-4 py-2.5 text-[#5B6577]">{p.position}</td>
                <td className="px-4 py-2.5"><Badge status="info">{p.type}</Badge></td>
                <td className="px-4 py-2.5"><Badge status={p.status === "active" ? "active" : p.status === "terminated" ? "danger" : "warning"}>{p.status}</Badge></td>
                <td className="px-4 py-2.5 text-right font-mono-data">{p.payType === "mileage" ? `$${p.payRate}/mi` : p.payType === "hourly" ? `$${p.payRate}/hr` : money(p.payRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- Occurrences ---------------- */
function Occurrences() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["hr-occ"], queryFn: async () => (await api.hr.occurrences.$get()).json() });
  const { data: people } = useQuery({ queryKey: ["hr-people"], queryFn: async () => (await api.hr.people.$get()).json() });
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ personId: "", category: "coaching", severity: "minor", title: "", description: "", actionTaken: "", occurredOn: new Date().toISOString().slice(0, 10) });
  const create = useMutation({
    mutationFn: async () => (await api.hr.occurrences.$post({ json: f })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hr-occ"] }); qc.invalidateQueries({ queryKey: ["hr-summary"] }); setShow(false); setF({ ...f, title: "", description: "", actionTaken: "" }); },
  });
  const sevTone = (s: string) => s === "critical" || s === "major" ? "danger" : s === "moderate" ? "warning" : "info";
  const nameOf = (id: string) => people?.people.find((p: any) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-[#5B6577]">{data?.occurrences.length ?? 0} logged</div>
        <Button variant="amber" onClick={() => setShow(true)}><Plus className="h-4 w-4" />Log occurrence</Button>
      </div>
      {show && (
        <Card className="p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Person"><select className={inp} value={f.personId} onChange={(e) => setF({ ...f, personId: e.target.value })}><option value="">Select…</option>{people?.people.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Category"><select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["violation", "accident", "complaint", "coaching", "commendation", "attendance", "drug_alcohol"].map((x) => <option key={x} value={x}>{x.replace("_", "/")}</option>)}</select></Field>
            <Field label="Severity"><select className={inp} value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>{["minor", "moderate", "major", "critical"].map((x) => <option key={x} value={x}>{x}</option>)}</select></Field>
            <Field label="Date"><input type="date" className={inp} value={f.occurredOn} onChange={(e) => setF({ ...f, occurredOn: e.target.value })} /></Field>
            <Field label="Title" full><input className={inp} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Description" full><textarea className={inp} rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <Field label="Action taken" full><input className={inp} value={f.actionTaken} onChange={(e) => setF({ ...f, actionTaken: e.target.value })} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="amber" disabled={!f.personId || !f.title || create.isPending} onClick={() => create.mutate()}>Save</Button>
            <Button variant="ghost" onClick={() => setShow(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      <div className="space-y-2">
        {data?.occurrences.map((o: any) => (
          <Card key={o.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#0E1524]">{o.title}</span>
                  <Badge status={sevTone(o.severity)}>{o.severity}</Badge>
                  <Badge status="info">{o.category}</Badge>
                </div>
                <div className="text-sm text-[#5B6577] mt-1">{nameOf(o.personId)} · {o.occurredOn} · reported by {o.reportedBy}</div>
                {o.description && <p className="text-sm text-[#0E1524] mt-2">{o.description}</p>}
                {o.actionTaken && <p className="text-xs text-[#5B6577] mt-1"><strong>Action:</strong> {o.actionTaken}</p>}
              </div>
              <Badge status={o.status === "resolved" ? "resolved" : "warning"}>{o.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- AI Screening ---------------- */
function Screening() {
  const qc = useQueryClient();
  const { data: list } = useQuery({ queryKey: ["hr-screen"], queryFn: async () => (await api.hr.screenings.$get()).json() });
  const [candidate, setCandidate] = useState("");
  const [position, setPosition] = useState("Company Driver");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const gen = useMutation({
    mutationFn: async () => (await api.hr.screenings.questions.$post({ json: { position } })).json(),
    onSuccess: (d: any) => { setQuestions(d.questions); setAnswers(new Array(d.questions.length).fill("")); setResult(null); },
  });
  const submit = useMutation({
    mutationFn: async () => (await api.hr.screenings.$post({ json: { candidateName: candidate, position, transcript: questions.map((q, i) => ({ q, a: answers[i] ?? "" })) } })).json(),
    onSuccess: (d: any) => { setResult(d.screening); qc.invalidateQueries({ queryKey: ["hr-screen"] }); },
  });
  const recTone = (r: string) => r === "advance" ? "success" : r === "reject" ? "danger" : "warning";

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#0E1524]"><Bot className="h-4 w-4 text-[#FFB400]" />Run an AI pre-screen interview</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Candidate name"><input className={inp} value={candidate} onChange={(e) => setCandidate(e.target.value)} /></Field>
          <Field label="Position"><input className={inp} value={position} onChange={(e) => setPosition(e.target.value)} /></Field>
        </div>
        <Button variant="amber" className="mt-3" disabled={gen.isPending} onClick={() => gen.mutate()}>{gen.isPending ? "Generating…" : "Generate interview questions"}</Button>

        {questions.length > 0 && (
          <div className="mt-4 space-y-3">
            {questions.map((q, i) => (
              <div key={i}>
                <div className="text-sm font-medium text-[#0E1524]">{i + 1}. {q}</div>
                <textarea className={inp + " mt-1"} rows={2} placeholder="Candidate's answer…" value={answers[i] ?? ""} onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }} />
              </div>
            ))}
            <Button variant="primary" disabled={!candidate || submit.isPending} onClick={() => submit.mutate()}>{submit.isPending ? "Scoring…" : "Score & save screening"}</Button>
          </div>
        )}

        {result && (
          <Card className="p-4 mt-4" accent>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold font-mono-data text-[#0B2A6B]">{result.score}</span>
              <span className="text-xs text-[#5B6577]">fit score</span>
              <Badge status={recTone(result.recommendation)}>{result.recommendation}</Badge>
            </div>
            <p className="text-sm text-[#0E1524]">{result.summary}</p>
            {JSON.parse(result.redFlags ?? "[]").length > 0 && (
              <ul className="mt-2 text-xs text-[#E0322B] list-disc pl-5">{JSON.parse(result.redFlags).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
            )}
          </Card>
        )}
      </Card>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-[#5B6577]">Past screenings</div>
        {list?.screenings.map((s: any) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between">
              <div><span className="font-semibold text-[#0E1524]">{s.candidateName}</span> <span className="text-sm text-[#5B6577]">· {s.position}</span></div>
              <div className="flex items-center gap-2"><span className="font-mono-data font-bold text-[#0B2A6B]">{s.score}</span><Badge status={recTone(s.recommendation)}>{s.recommendation}</Badge></div>
            </div>
            <p className="text-sm text-[#5B6577] mt-1">{s.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Background ---------------- */
function Background() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["hr-bg"], queryFn: async () => (await api.hr.background.$get()).json() });
  const { data: people } = useQuery({ queryKey: ["hr-people"], queryFn: async () => (await api.hr.people.$get()).json() });
  const [show, setShow] = useState(false);
  const ALL = ["mvr", "criminal", "employment", "drug", "psp", "clearinghouse"];
  const [f, setF] = useState({ personId: "", ssnLast4: "", dob: "", licenseState: "MO", consent: false, checkTypes: ["mvr", "criminal", "employment", "drug"] });
  const create = useMutation({
    mutationFn: async () => (await api.hr.background.$post({ json: f })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hr-bg"] }); setShow(false); },
  });
  const nameOf = (id: string) => people?.people.find((p: any) => p.id === id)?.name ?? id;
  const adjTone = (a: string) => a === "clear" ? "success" : a === "adverse" ? "danger" : "warning";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-[#5B6577]">Structured FCRA-compliant intake. Reports are templated pending a real provider (e.g. Checkr) — no adverse action until results return.</div>
        <Button variant="amber" onClick={() => setShow(true)}><Plus className="h-4 w-4" />New request</Button>
      </div>
      {show && (
        <Card className="p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Person"><select className={inp} value={f.personId} onChange={(e) => setF({ ...f, personId: e.target.value })}><option value="">Select…</option>{people?.people.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="License state"><input className={inp} value={f.licenseState} onChange={(e) => setF({ ...f, licenseState: e.target.value })} /></Field>
            <Field label="SSN (last 4)"><input maxLength={4} className={inp} value={f.ssnLast4} onChange={(e) => setF({ ...f, ssnLast4: e.target.value })} /></Field>
            <Field label="Date of birth"><input type="date" className={inp} value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-[#5B6577] mb-1">Checks to run</div>
            <div className="flex flex-wrap gap-2">
              {ALL.map((x) => (
                <button key={x} onClick={() => setF({ ...f, checkTypes: f.checkTypes.includes(x) ? f.checkTypes.filter((c) => c !== x) : [...f.checkTypes, x] })}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${f.checkTypes.includes(x) ? "bg-[#0B2A6B] text-white border-[#0B2A6B]" : "border-[#E2E7F0] text-[#5B6577]"}`}>{x.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-[#0E1524]">
            <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            Signed FCRA disclosure & authorization on file
          </label>
          <div className="flex gap-2 mt-3">
            <Button variant="amber" disabled={!f.personId || create.isPending} onClick={() => create.mutate()}>Submit request</Button>
            <Button variant="ghost" onClick={() => setShow(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      <div className="space-y-2">
        {data?.backgroundChecks.map((b: any) => {
          const findings = JSON.parse(b.findings ?? "{}");
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#0E1524]">{nameOf(b.personId)}</div>
                <div className="flex items-center gap-2"><Badge status={b.status === "complete" ? "success" : "warning"}>{b.status}</Badge><Badge status={adjTone(b.adjudication)}>{b.adjudication}</Badge></div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">{JSON.parse(b.checkTypes ?? "[]").map((c: string) => <span key={c} className="rounded bg-[#EEF2FA] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#5B6577]">{c}</span>)}</div>
              {Object.keys(findings).length > 0 && (
                <div className="mt-3 space-y-1.5">{Object.entries(findings).map(([k, v]) => <div key={k} className="text-sm"><span className="font-semibold capitalize text-[#0B2A6B]">{k}:</span> <span className="text-[#5B6577]">{v as string}</span></div>)}</div>
              )}
              <p className="text-xs text-[#5B6577] mt-2 border-t border-[#E2E7F0] pt-2">{b.reportSummary}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Documents ---------------- */
function Documents() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["hr-docs"], queryFn: async () => (await api.hr.documents.$get()).json() });
  const { data: people } = useQuery({ queryKey: ["hr-people"], queryFn: async () => (await api.hr.people.$get()).json() });
  const fileRef = useRef<HTMLInputElement>(null);
  const [personId, setPersonId] = useState("");
  const [category, setCategory] = useState("misc");
  const upload = useMutation({
    mutationFn: async (payload: any) => (await api.hr.documents.$post({ json: payload })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hr-docs"] }); qc.invalidateQueries({ queryKey: ["hr-summary"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => (await api.hr.documents[":id"].$delete({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hr-docs"] }),
  });
  const nameOf = (id: string) => people?.people.find((p: any) => p.id === id)?.name ?? id;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !personId) return;
    const reader = new FileReader();
    reader.onload = () => upload.mutate({ personId, category, name: file.name, dataUrl: String(reader.result), sizeBytes: file.size });
    reader.readAsDataURL(file);
  }
  const expiring = (d: any) => d.expiresOn && new Date(d.expiresOn) <= new Date(Date.now() + 45 * 86400000);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-bold text-[#0E1524] mb-3">Upload a document</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Person"><select className={inp} value={personId} onChange={(e) => setPersonId(e.target.value)}><option value="">Select…</option>{people?.people.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Category"><select className={inp} value={category} onChange={(e) => setCategory(e.target.value)}>{["cdl", "medical_card", "contract", "application", "background", "mvr", "w4", "misc"].map((x) => <option key={x} value={x}>{x.replace("_", " ")}</option>)}</select></Field>
          <div className="flex items-end"><Button variant="amber" disabled={!personId || upload.isPending} onClick={() => fileRef.current?.click()}>{upload.isPending ? "Uploading…" : "Choose file"}</Button><input ref={fileRef} type="file" hidden onChange={onFile} /></div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FB] text-[#5B6577] text-xs uppercase"><tr>
            <th className="text-left px-4 py-2.5">Document</th><th className="text-left px-4 py-2.5">Person</th>
            <th className="text-left px-4 py-2.5">Category</th><th className="text-left px-4 py-2.5">Expires</th><th className="px-4 py-2.5"></th>
          </tr></thead>
          <tbody>
            {data?.documents.map((d: any) => (
              <tr key={d.id} className="border-t border-[#E2E7F0] hover:bg-[#F9FBFE]">
                <td className="px-4 py-2.5"><div className="flex items-center gap-2 font-medium text-[#0E1524]"><FileText className="h-4 w-4 text-[#0B2A6B]" />{d.name}</div></td>
                <td className="px-4 py-2.5 text-[#5B6577]">{nameOf(d.personId)}</td>
                <td className="px-4 py-2.5"><Badge status="info">{d.category?.replace("_", " ")}</Badge></td>
                <td className="px-4 py-2.5">{d.expiresOn ? <span className={expiring(d) ? "text-[#E0322B] font-semibold" : "text-[#5B6577]"}>{d.expiresOn}</span> : <span className="text-[#5B6577]">—</span>}</td>
                <td className="px-4 py-2.5 text-right">
                  {d.dataUrl && <a href={d.dataUrl} download={d.name} className="inline-flex text-[#0B2A6B] hover:text-[#FFB400] mr-3"><Download className="h-4 w-4" /></a>}
                  <button onClick={() => del.mutate(d.id)} className="text-[#5B6577] hover:text-[#E0322B]"><X className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- Payroll ---------------- */
function Payroll() {
  const qc = useQueryClient();
  const { data: runs } = useQuery({ queryKey: ["hr-payroll"], queryFn: async () => (await api.hr.payroll.$get()).json() });
  const [lines, setLines] = useState<any[]>([]);
  const [period, setPeriod] = useState({ periodStart: "", periodEnd: "" });
  const [preview, setPreview] = useState<any>(null);

  const suggest = useMutation({
    mutationFn: async () => (await api.hr.payroll.suggest.$get()).json(),
    onSuccess: (d: any) => setLines(d.lines),
  });
  const doPreview = useMutation({
    mutationFn: async () => (await api.hr.payroll.preview.$post({ json: { lines } })).json(),
    onSuccess: (d: any) => setPreview(d),
  });
  const runPayroll = useMutation({
    mutationFn: async () => (await api.hr.payroll.run.$post({ json: { ...period, lines, finalize: true } })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hr-payroll"] }); qc.invalidateQueries({ queryKey: ["hr-summary"] }); setPreview(null); setLines([]); },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-bold text-[#0E1524] mb-3">New payroll run</div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <Field label="Period start"><input type="date" className={inp} value={period.periodStart} onChange={(e) => setPeriod({ ...period, periodStart: e.target.value })} /></Field>
          <Field label="Period end"><input type="date" className={inp} value={period.periodEnd} onChange={(e) => setPeriod({ ...period, periodEnd: e.target.value })} /></Field>
          <div className="flex items-end"><Button variant="ghost" onClick={() => suggest.mutate()}>Auto-build from miles</Button></div>
        </div>
        {lines.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[#5B6577] text-xs uppercase"><tr><th className="text-left py-2">Employee</th><th className="text-left py-2">Type</th><th className="text-right py-2">Units</th><th className="text-right py-2">Rate</th></tr></thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={l.personId} className="border-t border-[#E2E7F0]">
                      <td className="py-2 font-medium text-[#0E1524]">{l.personName}</td>
                      <td className="py-2 text-[#5B6577]">{l.payType}</td>
                      <td className="py-2 text-right"><input type="number" className="w-24 rounded border border-[#E2E7F0] px-2 py-1 text-right font-mono-data" value={l.units} onChange={(e) => { const n = [...lines]; n[i] = { ...l, units: +e.target.value }; setLines(n); }} /></td>
                      <td className="py-2 text-right"><input type="number" step="0.01" className="w-24 rounded border border-[#E2E7F0] px-2 py-1 text-right font-mono-data" value={l.rate} onChange={(e) => { const n = [...lines]; n[i] = { ...l, rate: +e.target.value }; setLines(n); }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" disabled={doPreview.isPending} onClick={() => doPreview.mutate()}>Preview</Button>
              <Button variant="amber" disabled={!period.periodStart || !period.periodEnd || runPayroll.isPending} onClick={() => runPayroll.mutate()}>{runPayroll.isPending ? "Running…" : "Finalize payroll"}</Button>
            </div>
          </>
        )}
        {preview && (
          <Card className="p-4 mt-3" accent>
            <div className="flex gap-6 mb-3">
              <div><div className="text-xl font-bold font-mono-data text-[#0B2A6B]">{money(preview.totalGross)}</div><div className="text-xs text-[#5B6577]">Gross</div></div>
              <div><div className="text-xl font-bold font-mono-data text-[#1FA971]">{money(preview.totalNet)}</div><div className="text-xs text-[#5B6577]">Net</div></div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-[#5B6577] text-xs uppercase"><tr><th className="text-left py-1">Employee</th><th className="text-right py-1">Gross</th><th className="text-right py-1">Deductions</th><th className="text-right py-1">Net</th></tr></thead>
              <tbody>{preview.statements.map((s: any) => (
                <tr key={s.personId} className="border-t border-[#E2E7F0]"><td className="py-1.5">{s.personName}</td><td className="py-1.5 text-right font-mono-data">{money(s.gross)}</td><td className="py-1.5 text-right font-mono-data text-[#E0322B]">-{money(s.totalDeductions)}</td><td className="py-1.5 text-right font-mono-data font-bold">{money(s.net)}</td></tr>
              ))}</tbody>
            </table>
          </Card>
        )}
      </Card>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-[#5B6577]">Payroll history</div>
        {runs?.runs.map((r: any) => (
          <Card key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#0E1524]">{r.periodStart} → {r.periodEnd}</div>
              <div className="text-xs text-[#5B6577]">{r.headcount} employees · gross {money(r.totalGross)} · net {money(r.totalNet)}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={r.status === "finalized" ? "success" : "warning"}>{r.status}</Badge>
              <a href={`/api/hr/payroll/${r.id}/export`} className="inline-flex items-center gap-1 text-sm text-[#0B2A6B] hover:text-[#FFB400]"><Download className="h-4 w-4" />CSV</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Profitability ---------------- */
function Profitability() {
  const { data } = useQuery({ queryKey: ["hr-profit"], queryFn: async () => (await api.hr.profitability.$get()).json() });
  if (!data) return <Spinner label="Loading profitability…" />;
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E7F0] text-sm font-bold text-[#0E1524]">Per-driver profitability</div>
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FB] text-[#5B6577] text-xs uppercase"><tr>
            <th className="text-left px-4 py-2.5">Driver</th><th className="text-right px-4 py-2.5">Runs</th><th className="text-right px-4 py-2.5">Miles</th>
            <th className="text-right px-4 py-2.5">Revenue</th><th className="text-right px-4 py-2.5">Cost</th><th className="text-right px-4 py-2.5">Net</th><th className="text-right px-4 py-2.5">Margin</th>
          </tr></thead>
          <tbody>{data.drivers.map((d: any) => (
            <tr key={d.driverName} className="border-t border-[#E2E7F0]">
              <td className="px-4 py-2.5 font-semibold text-[#0E1524]">{d.driverName}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">{d.runs}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">{d.miles.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right font-mono-data text-[#1FA971]">{money(d.revenue)}</td>
              <td className="px-4 py-2.5 text-right font-mono-data text-[#E0322B]">{money(d.cost)}</td>
              <td className="px-4 py-2.5 text-right font-mono-data font-bold">{money(d.net)}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">{d.margin}%</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E7F0] text-sm font-bold text-[#0E1524]">Per-run detail</div>
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FB] text-[#5B6577] text-xs uppercase"><tr>
            <th className="text-left px-4 py-2.5">Lane</th><th className="text-left px-4 py-2.5">Driver</th><th className="text-right px-4 py-2.5">Mi</th>
            <th className="text-right px-4 py-2.5">Rev</th><th className="text-right px-4 py-2.5">RPM</th><th className="text-right px-4 py-2.5">CPM</th><th className="text-right px-4 py-2.5">Net</th>
          </tr></thead>
          <tbody>{data.runs.map((r: any) => (
            <tr key={r.id} className="border-t border-[#E2E7F0]">
              <td className="px-4 py-2.5 text-[#0E1524]">{r.origin} → {r.destination}</td>
              <td className="px-4 py-2.5 text-[#5B6577]">{r.driverName}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">{r.miles}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">{money(r.revenue)}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">${r.rpm}</td>
              <td className="px-4 py-2.5 text-right font-mono-data">${r.cpm}</td>
              <td className={`px-4 py-2.5 text-right font-mono-data font-bold ${r.net >= 0 ? "text-[#1FA971]" : "text-[#E0322B]"}`}>{money(r.net)}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- Ask HumanAI (persistent chat) ---------------- */
type Msg = { role: "user" | "assistant"; content: string };
function AskHumanAI() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "I'm HumanAI, your HR manager. Ask me about hiring, driver qualification files (49 CFR 391), documenting an occurrence, background checks, payroll, or run profitability — I can see your live roster." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const res = await api.hr.chat.$post({ json: { messages: next } });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection hiccup — try that again." }]);
    } finally { setBusy(false); }
  }

  const SUGGESTIONS = [
    "What's in a complete driver qualification file?",
    "Draft a written warning for a late check-in.",
    "Is a 3-year-old speeding ticket disqualifying?",
    "How do I run FCRA-compliant background checks?",
  ];

  return (
    <Card className="flex flex-col h-[calc(100vh-190px)] xl:sticky xl:top-24 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E7F0] bg-[#0B2A6B] text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB400]"><Users className="h-4 w-4 text-[#0B2A6B]" /></div>
        <div><div className="font-bold text-sm">HumanAI</div><div className="text-[11px] text-[#C7D3EC]">SHRM-SCP · Trucking HR</div></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B2A6B]"><Users className="h-4 w-4 text-[#FFB400]" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#0B2A6B] text-white" : "bg-[#F4F6FB] text-[#0E1524]"}`}>{m.content}</div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="space-y-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="w-full text-left rounded-lg border border-[#E2E7F0] px-3 py-1.5 text-xs text-[#5B6577] hover:border-[#FFB400] hover:text-[#0E1524]">{s}</button>
            ))}
          </div>
        )}
        {busy && <div className="flex gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B2A6B]"><Users className="h-4 w-4 text-[#FFB400]" /></div><div className="rounded-2xl bg-[#F4F6FB] px-3 py-2.5"><div className="flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B6577]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B6577] [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5B6577] [animation-delay:300ms]" /></div></div></div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[#E2E7F0] p-2.5">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask HumanAI…" className="flex-1 rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm focus:border-[#FFB400] focus:outline-none" />
          <Button variant="amber" type="submit" disabled={busy}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </Card>
  );
}

const inp = "w-full rounded-lg border border-[#E2E7F0] px-3 py-2 text-sm focus:border-[#FFB400] focus:outline-none";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="block text-xs font-medium text-[#5B6577] mb-1">{label}</span>{children}</label>;
}

const Sparkles_ = Sparkles; // keep import referenced if unused elsewhere
