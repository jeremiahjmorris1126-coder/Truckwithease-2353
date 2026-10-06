import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Badge } from "../components/ui/kit";
import { FeatureHero } from "../components/feature-hero";
import { AgentChat } from "../components/agent-chat";
import { Wrench, Cpu, AlertTriangle } from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Trailer ABS light", prompt: "Trailer ABS light stays on after air-up. What do I check?" },
  { label: "Fifth wheel play", prompt: "How do I inspect fifth wheel play during a pre-trip inspection?" },
  { label: "DEF pressure fault", prompt: "My 2020 Freightliner Cascadia throws a DEF pressure fault — where do I start?" },
  { label: "Reefer temp drop", prompt: "Reefer unit won't hold temp on a Carrier X4 7300 — troubleshoot it." },
  { label: "Air brake cut-out", prompt: "Walk me through the air brake governor cut-out test and the low air warning." },
  { label: "X15 SPN 3556", prompt: "Cummins X15 throws SPN 3556 FMI 5. Is a derate coming, and what do I check first?" },
];

const SUBSYSTEMS = [
  { name: "Engines & fuel systems", detail: "Detroit DD15, Cummins X15, PACCAR MX-13, Volvo D13" },
  { name: "Aftertreatment & DEF", detail: "DPF regen, SCR dosing, NOx and temperature sensors" },
  { name: "Air brakes", detail: "Governor, air dryer, brake chambers, slack adjusters" },
  { name: "Reefer units", detail: "Carrier Transicold X4 / Vector, Thermo King Precedent" },
  { name: "Coupling & fifth wheel", detail: "Locking jaws, kingpin, slide pins, mounting brackets" },
  { name: "Trailer electrical & ABS", detail: "J560 7-way harness, WABCO and Bendix TABS ECUs" },
];

export default function FleetChief() {
  const status = useQuery({ queryKey: ["agent-status"], queryFn: async () => (await api.agent.status.$get()).json() });

  return (
    <div className="pb-8">
      <FeatureHero
        icon={Wrench}
        eyebrow="Heavy-duty diagnostics"
        status={status.data && <Badge status={status.data.live ? "success" : "warning"}>{status.data.live ? "AI live" : "Demo mode"}</Badge>}
        title="Fleet Chief AI"
        accent="Truck & Trailer Mechanic"
        description="Shop-level troubleshooting for Class 8 tractors and trailers by make, model, year, and J1939 fault code."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <AgentChat
          agent="fleet-chief"
          icon={Wrench}
          name="Fleet Chief"
          tagline="Truck + trailer master mechanic"
          greeting="I'm Fleet Chief — your on-call master mechanic for trucks and trailers. Tell me the make, model, year, and the symptom or SPN/FMI code, and I'll walk you through it like I'm standing at the bay with you."
          placeholder="Describe the symptom or fault code…"
          thinking="Fleet Chief is working through the fault tree…"
          quickPrompts={QUICK_PROMPTS}
          className="h-[calc(100dvh-280px)] min-h-[480px] lg:col-span-8 lg:h-[680px]"
        />

        <div className="flex flex-col gap-5 lg:col-span-4">
          <section className="rounded-2xl border border-[#C9A84C]/40 bg-[#11131C] p-4 sm:p-5">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-[#FFD700]">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              Systems covered
            </h2>
            <ul className="flex flex-col gap-2">
              {SUBSYSTEMS.map((s) => (
                <li key={s.name} className="rounded-lg border border-[#222B3D] bg-[#161B26] p-3">
                  <div className="text-sm font-bold text-[#E4E4E7]">{s.name}</div>
                  <div className="mt-0.5 text-xs text-[#8A8A8A]">{s.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#222736] bg-[#11131C] p-4 sm:p-5">
            <h2 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-[#FFD700]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Roadside safety
            </h2>
            <p className="text-sm leading-relaxed text-[#8A8A8A]">
              Set the parking brakes and chock the wheels before going under any combination. On a highway shoulder, place warning triangles within 10 minutes (49 CFR § 392.22).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
