import { PageHeader, Card, Button } from "../components/ui/kit";
import { Check, Truck, Users, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "solo", name: "Solo", price: 19.99, unit: "/mo", icon: Truck, popular: false,
    tagline: "Owner-operators running their own truck.",
    features: ["HOS / ELD logging (49 CFR 395)", "State-aware DOT AI Watcher", "Pre-trip DVIR inspections", "Live GPS tracking", "Fuel Finder + price compare", "EaseRewards loyalty points", "Load board access", "PDF / CSV exports"],
  },
  {
    id: "pro", name: "Pro", price: 34.99, unit: "/mo", icon: Sparkles, popular: true,
    tagline: "Owner-operators who want every edge.",
    features: ["Everything in Solo", "$100 in-app Fuel Card", "PrePass weigh-station bypass", "Fleet Chief AI (truck + trailer)", "Health Chief AI wellness coach", "Toll cost + cheapest-route engine", "Digital permit book", "Priority support"],
  },
  {
    id: "fleet", name: "Fleet", price: 24.99, unit: "/seat/mo", icon: Building2, popular: false,
    tagline: "Carriers managing multiple trucks.",
    features: ["Everything in Pro", "Fleet admin dashboard", "Live map of all trucks", "Dispatch ↔ driver chat", "Custom reports + attachments", "Driver assignment + truck numbers", "Compliance alerts across fleet", "Volume pricing available"],
  },
];

export default function Pricing() {
  return (
    <div>
      <PageHeader title="Plans & Pricing" subtitle='No contracts. Cancel anytime. 30-day free trial on every plan. Drive Smart. Stay Compliant.' />

      <div className="rounded-xl bg-[#FFB400]/10 border border-[#FFB400]/30 px-5 py-3 mb-6 text-sm text-[#0E1524] flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#E09E00]" />
        <span><b>~60% below Motive</b> — and the only compliance app with built-in driver loyalty rewards. Optional annual plan saves another 15%.</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className={`p-6 flex flex-col relative ${p.popular ? "ring-2 ring-[#FFB400]" : ""}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FFB400] px-3 py-1 text-xs font-bold text-[#0E1524]">MOST POPULAR</span>}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FA]"><Icon className="h-5 w-5 text-[#0B2A6B]" /></div>
                <span className="font-bold text-lg text-[#0E1524]">{p.name}</span>
              </div>
              <p className="text-sm text-[#5B6577] mb-4 min-h-[40px]">{p.tagline}</p>
              <div className="mb-5">
                <span className="text-4xl font-bold font-mono-data text-[#0B2A6B]">${p.price}</span>
                <span className="text-sm text-[#5B6577]">{p.unit}</span>
              </div>
              <Button variant={p.popular ? "amber" : "primary"} className="w-full mb-5">Start 30-day free trial</Button>
              <ul className="space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#0E1524]"><Check className="h-4 w-4 text-[#1FA971] shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FA]"><Users className="h-5 w-5 text-[#0B2A6B]" /></div>
          <div>
            <div className="font-bold text-[#0E1524]">Add the dashcam bundle</div>
            <div className="text-sm text-[#5B6577]">Records video, syncs to the app, cloud storage + incident clips. The Motive killer.</div>
          </div>
        </div>
        <Button variant="ghost">Add hardware</Button>
      </Card>
    </div>
  );
}
