import { PageHeader, Card, Button } from "../components/ui/kit";
import { Check, Truck, Users, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "solo", name: "Solo", price: 29.99, unit: "/driver/mo", icon: Truck, popular: false,
    tagline: "Owner-operators running their own truck.",
    features: ["HOS / ELD logging (49 CFR 395)", "State-aware DOT AI Watcher", "Pre-trip DVIR inspections", "Live GPS tracking", "Fuel Finder + price compare", "EaseRewards loyalty points", "Load board access", "PDF / CSV exports"],
  },
  {
    id: "pro", name: "Pro", price: 39.99, unit: "/driver/mo", icon: Sparkles, popular: true,
    tagline: "Owner-operators who want every edge.",
    features: ["Everything in Solo", "$100 in-app Fuel Card", "Weigh-station bypass account setup guidance", "Fleet Chief AI (truck + trailer)", "Health Chief AI wellness coach", "Toll cost + cheapest-route engine", "Digital permit book", "Priority support"],
  },
  {
    id: "fleet", name: "Fleet", price: 49.99, unit: "/truck/mo", icon: Building2, popular: false,
    tagline: "Carriers managing multiple trucks.",
    features: ["Everything in Pro", "Fleet admin dashboard", "Live map of all trucks", "Dispatch ↔ driver chat", "Custom reports + attachments", "Driver assignment + truck numbers", "Compliance alerts across fleet", "Volume pricing available"],
  },
];

export default function Pricing() {
  return (
    <div>
      <PageHeader title="Plans & Pricing" subtitle='No contracts. Cancel anytime. 14-day free trial on every plan. Drive Smart. Stay Compliant.' />

      <div className="rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-5 py-3 mb-6 text-sm text-[#F5F5F5] flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#FFD700]" />
        <span><b>Fleet at $49.99/truck/mo includes the hardware lease</b>; hardware-owned is $59.99/driver/mo with a $600/truck one-time cost. We do not quote other vendors' prices — compare against your own invoice.</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className={`p-6 flex flex-col relative ${p.popular ? "ring-2 ring-[#C9A84C]" : ""}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-bold text-[#0a0a0a]">MOST POPULAR</span>}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1C]"><Icon className="h-5 w-5 text-[#C9A84C]" /></div>
                <span className="font-bold text-lg text-[#F5F5F5]">{p.name}</span>
              </div>
              <p className="text-sm text-[#8A8A8A] mb-4 min-h-[40px]">{p.tagline}</p>
              <div className="mb-5">
                <span className="text-4xl font-bold font-mono-data text-[#C9A84C]">${p.price}</span>
                <span className="text-sm text-[#8A8A8A]">{p.unit}</span>
              </div>
              <Button variant={p.popular ? "amber" : "primary"} className="w-full mb-5">Start 14-day free trial</Button>
              <ul className="space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#F5F5F5]"><Check className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1C]"><Users className="h-5 w-5 text-[#C9A84C]" /></div>
          <div>
            <div className="font-bold text-[#F5F5F5]">Add the dashcam bundle</div>
            <div className="text-sm text-[#8A8A8A]">Records video, syncs to the app, cloud storage + incident clips.</div>
          </div>
        </div>
        <Button variant="ghost">Add hardware</Button>
      </Card>
    </div>
  );
}
