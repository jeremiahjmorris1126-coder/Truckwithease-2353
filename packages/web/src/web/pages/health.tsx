import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { Badge, Spinner } from "../components/ui/kit";
import { FeatureHero, FeatureTabs } from "../components/feature-hero";
import { AgentChat } from "../components/agent-chat";
import {
  HeartPulse, Activity, CalendarClock, Plus, X, Stethoscope, FileText, Sparkles, ShieldCheck, ChevronRight,
} from "lucide-react";

type Tab = "overview" | "vitals" | "cards" | "coach";

const TABS = [
  { id: "overview" as const, label: "Overview", icon: Activity },
  { id: "vitals" as const, label: "Vitals", icon: Stethoscope },
  { id: "cards" as const, label: "Med Cards", icon: FileText },
  { id: "coach" as const, label: "AI Coach", icon: Sparkles },
];

const COACH_PROMPTS = [
  { label: "BP limits", prompt: "What are the FMCSA blood pressure limits for a 2-year medical card?" },
  { label: "Sleep apnea", prompt: "How does FMCSA screen for sleep apnea, and what CPAP compliance is required?" },
  { label: "Eating on the road", prompt: "Give me a healthy truck-stop eating plan that helps my blood pressure." },
  { label: "Exam day prep", prompt: "How should I prepare the day before my DOT physical?" },
];

const VITAL_FIELDS = [
  ["systolic", "Systolic (mmHg)"],
  ["diastolic", "Diastolic (mmHg)"],
  ["weight", "Weight (lb)"],
  ["height", "Height (in)"],
  ["glucose", "Glucose (optional)"],
] as const;

const EMPTY_VITAL = { systolic: "", diastolic: "", weight: "", height: "", glucose: "" };

function bmiOf(weight: number, height: number) {
  return (weight / (height * height)) * 703;
}

function daysUntil(date: string) {
  return Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
}

export default function Health() {
  const { session } = useSession();
  const qc = useQueryClient();
  const id = session.driverId;
  const [tab, setTab] = useState<Tab>("overview");
  const [showVital, setShowVital] = useState(false);
  const [v, setV] = useState(EMPTY_VITAL);

  const data = useQuery({
    queryKey: ["health", id],
    queryFn: async () => (await api["driver-health"][":driverId"].$get({ param: { driverId: id } })).json(),
  });

  const addVital = useMutation({
    mutationFn: async () =>
      (
        await api["driver-health"][":driverId"].vitals.$post({
          param: { driverId: id },
          json: { systolic: +v.systolic, diastolic: +v.diastolic, weight: +v.weight, height: +v.height, glucose: v.glucose ? +v.glucose : undefined },
        })
      ).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health", id] });
      setShowVital(false);
      setV(EMPTY_VITAL);
    },
  });

  if (data.isLoading) return <Spinner label="Loading driver health…" />;
  if (!data.data) return <p className="py-10 text-center text-sm text-[#8A8A8A]">Couldn&apos;t load driver health. Try again.</p>;

  const d = data.data;
  const latest = d.vitals[0];
  const activeCard = d.medCards[0];
  const cardDays = activeCard ? daysUntil(activeCard.expiryDate) : null;
  const alerts = [...d.reminders, ...d.flags];

  const cardStatus =
    cardDays === null ? <Badge status="warning">No med card on file</Badge>
    : cardDays < 0 ? <Badge status="danger">Med card expired</Badge>
    : cardDays <= 60 ? <Badge status="warning">Med card expiring</Badge>
    : <Badge status="success">Med card active</Badge>;

  return (
    <div className="pb-8">
      <FeatureHero
        icon={HeartPulse}
        eyebrow="FMCSA 49 CFR § 391.41"
        status={cardStatus}
        title="Health Chief"
        accent="Wellness & DOT Card"
        description="Medical certification, vitals tracking, and an AI wellness coach built for commercial drivers."
        action={
          <button
            onClick={() => setShowVital(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 font-mono text-xs font-bold uppercase text-[#0a0a0a] transition-colors hover:bg-[#FFD700] md:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Log new vitals
          </button>
        }
      />

      <FeatureTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-8">
            {latest ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Blood pressure" value={`${latest.systolic}/${latest.diastolic}`} unit="mmHg" highlight />
                <Metric label="Weight" value={String(latest.weight)} unit="lb" />
                <Metric label="BMI" value={bmiOf(latest.weight, latest.height).toFixed(1)} />
                <Metric label="Glucose" value={latest.glucose ? String(latest.glucose) : "—"} unit={latest.glucose ? "mg/dL" : undefined} />
              </div>
            ) : (
              <Panel>
                <p className="text-sm text-[#8A8A8A]">No vitals logged yet. Log your first reading to start tracking.</p>
              </Panel>
            )}

            <Panel title="Health flags & certification alerts" icon={ShieldCheck}>
              {alerts.length === 0 ? (
                <p className="py-3 text-sm text-[#8A8A8A]">All clear — no health or certification flags.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {alerts.map((a, i) => (
                    <li key={i} className="flex flex-col gap-2 rounded-lg border border-[#232B3C] bg-[#0D1017] p-3 sm:flex-row sm:items-center">
                      <Badge status={a.level} />
                      <span className="text-sm leading-relaxed text-[#E4E4E7]">{a.msg}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-4">
            <Panel title="Active DOT medical card" icon={FileText} gold>
              {activeCard ? (
                <>
                  <dl className="flex flex-col gap-2 text-sm">
                    <Row label="Expires" value={activeCard.expiryDate} strong />
                    <Row label="Days remaining" value={cardDays! < 0 ? "Expired" : `${cardDays} days`} />
                    <Row label="Examiner" value={activeCard.examiner} />
                    <Row label="Restrictions" value={activeCard.restrictions} />
                  </dl>
                  <button
                    onClick={() => setTab("cards")}
                    className="mt-4 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-[#2D364A] bg-[#1A1F2C] font-mono text-xs font-bold text-[#D4D4D8] transition-colors hover:border-[#C9A84C]"
                  >
                    View all med cards
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#8A8A8A]">No med card on file.</p>
              )}
            </Panel>

            <Panel title="Appointments" icon={CalendarClock}>
              {d.appointments.length === 0 ? (
                <p className="text-sm text-[#8A8A8A]">None scheduled.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {d.appointments.map((a) => (
                    <li key={a.id} className="rounded-lg border border-[#232B3C] bg-[#0D1017] p-3">
                      <div className="text-sm font-medium text-[#F5F5F5]">{a.type}</div>
                      <div className="text-xs text-[#8A8A8A]">{a.date} · {a.provider}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Ask Health Chief" icon={Sparkles}>
              <p className="mb-3 text-sm leading-relaxed text-[#8A8A8A]">DOT physical rules, blood pressure tiers, sleep, and eating on the road.</p>
              <button
                onClick={() => setTab("coach")}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[#C9A84C] font-mono text-xs font-bold uppercase text-[#0a0a0a] transition-colors hover:bg-[#FFD700]"
              >
                Open AI coach
              </button>
            </Panel>
          </div>
        </div>
      )}

      {tab === "vitals" && (
        <Panel title="Vitals history" icon={Stethoscope}>
          {d.vitals.length === 0 ? (
            <p className="text-sm text-[#8A8A8A]">No vitals logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {d.vitals.map((row) => (
                <li key={row.id} className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-[#232B3C] bg-[#0D1017] p-3 text-sm sm:grid-cols-5 sm:items-center">
                  <span className="col-span-2 text-xs text-[#8A8A8A] sm:col-span-1">{new Date(row.at).toLocaleDateString()}</span>
                  <Cell label="BP" value={`${row.systolic}/${row.diastolic}`} />
                  <Cell label="Weight" value={`${row.weight} lb`} />
                  <Cell label="BMI" value={bmiOf(row.weight, row.height).toFixed(1)} />
                  <Cell label="Glucose" value={row.glucose ? String(row.glucose) : "—"} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {d.medCards.length === 0 ? (
            <p className="text-sm text-[#8A8A8A]">No med cards on file.</p>
          ) : (
            d.medCards.map((mc) => (
              <Panel key={mc.id} title="DOT medical card" icon={FileText} gold>
                <dl className="flex flex-col gap-2 text-sm">
                  <Row label="Issued" value={mc.issued} />
                  <Row label="Expires" value={mc.expiryDate} strong />
                  <Row label="Examiner" value={mc.examiner} />
                  <Row label="Restrictions" value={mc.restrictions} />
                </dl>
              </Panel>
            ))
          )}
        </div>
      )}

      {tab === "coach" && (
        <AgentChat
          agent="health-chief"
          icon={HeartPulse}
          name="Health Chief"
          tagline="DOT physical + wellness coach"
          greeting="I'm Health Chief — your DOT-physical and trucker-wellness coach. Ask me about passing your DOT exam, blood pressure, sleep apnea, eating right on the road, or staying certified."
          placeholder="Ask about your DOT physical, BP, sleep…"
          thinking="Health Chief is thinking…"
          quickPrompts={COACH_PROMPTS}
          className="h-[calc(100dvh-300px)] min-h-[460px]"
        />
      )}

      {showVital && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => setShowVital(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-vitals-title"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              addVital.mutate();
            }}
            className="w-full max-w-md rounded-t-2xl border border-[#2B2D3C] bg-[#111218] p-5 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="log-vitals-title" className="font-[Oswald] text-lg font-semibold uppercase tracking-wide text-[#F5F5F5]">Log vitals</h2>
              <button type="button" onClick={() => setShowVital(false)} aria-label="Close" className="flex min-h-11 min-w-11 items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5]">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {VITAL_FIELDS.map(([k, label]) => (
                <label key={k} className="flex flex-col gap-1 text-xs font-semibold text-[#8A8A8A]">
                  {label}
                  <input
                    type="number"
                    inputMode="decimal"
                    required={k !== "glucose"}
                    value={v[k]}
                    onChange={(e) => setV({ ...v, [k]: e.target.value })}
                    className="min-h-11 rounded-lg border border-[#2B2D3C] bg-[#0D1017] px-3 text-base text-[#F5F5F5] focus:border-[#C9A84C] focus:outline-none"
                  />
                </label>
              ))}
            </div>
            {addVital.isError && <p className="mt-3 text-sm text-[#ef4444]">Couldn&apos;t save. Check the values and try again.</p>}
            <button
              type="submit"
              disabled={addVital.isPending}
              className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#C9A84C] font-mono text-sm font-bold uppercase text-[#0a0a0a] transition-colors hover:bg-[#FFD700] disabled:opacity-50"
            >
              {addVital.isPending ? "Saving…" : "Save vitals"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Panel({ title, icon: Icon, gold, children }: { title?: string; icon?: typeof Activity; gold?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border bg-[#11131C] p-4 sm:p-5 ${gold ? "border-[#C9A84C]/40" : "border-[#222736]"}`}>
      {title && (
        <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-[#F5F5F5]">
          {Icon && <Icon className="h-4 w-4 text-[#FFD700]" aria-hidden="true" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Metric({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[#222736] bg-[#11131C] p-3 sm:p-4">
      <div className="font-mono text-[11px] uppercase text-[#8A8A8A]">{label}</div>
      <div className={`mt-1 font-mono text-xl font-black sm:text-2xl ${highlight ? "text-[#FFD700]" : "text-[#F5F5F5]"}`}>
        {value} {unit && <span className="text-xs font-normal text-[#8A8A8A]">{unit}</span>}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#1F2533] pb-2 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[#8A8A8A]">{label}</dt>
      <dd className={`text-right ${strong ? "font-mono font-bold text-[#FFD700]" : "text-[#E4E4E7]"}`}>{value}</dd>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2 sm:block">
      <span className="text-[11px] uppercase text-[#8A8A8A] sm:hidden">{label}</span>
      <span className="font-mono text-[#F5F5F5]">{value}</span>
    </span>
  );
}
