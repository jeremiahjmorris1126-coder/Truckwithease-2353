import { Link } from "wouter";
import {
  Truck, Clock, MapPin, ClipboardCheck, Fuel, Route, HeartPulse, Wrench,
  Trophy, ShieldCheck, ArrowRight, Check, Sparkles, Brain, Camera,
} from "lucide-react";

const FEATURES = [
  { icon: Clock, title: "HOS / ELD Logging", desc: "FMCSA-compliant electronic logs (49 CFR 395). Auto duty-status, cycle clocks, break tracking." },
  { icon: ShieldCheck, title: "State DOT AI Watcher", desc: "Location-aware, proactive compliance. Chain laws, speed limits, weigh stations — before you cross the line." },
  { icon: ClipboardCheck, title: "Pre-Trip DVIR", desc: "DOT inspection for tractor and trailer. Log defects, track repairs, stay road-legal." },
  { icon: MapPin, title: "Live GPS + Truck Routing", desc: "Real-time fleet map, bridge heights, weight restrictions, turn-by-turn built for big rigs." },
  { icon: Fuel, title: "Fuel Finder", desc: "Live diesel prices, cheapest station highlighted, in-app fuel card for Pro drivers." },
  { icon: Route, title: "Toll & IFTA Suite", desc: "Toll cost estimator, cheapest-route engine, PrePass bypass, quarterly IFTA-ready mileage." },
  { icon: Wrench, title: "Fleet Chief AI", desc: "Master mechanic for trucks AND trailers — diagnose by make, model, year. Real answers." },
  { icon: HeartPulse, title: "Health Chief AI", desc: "DOT-physical coach that keeps you certified — BP, sleep apnea, wellness on the road." },
  { icon: Trophy, title: "EaseRewards", desc: "The first loyalty program built into a compliance app. Every mile earns fuel + subscription credits." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#0E1524]">
      {/* Nav */}
      <header className="sticky top-0 z-30 twe-navy-grad text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB400]"><Truck className="h-5 w-5 text-[#0B2A6B]" /></div>
            <span className="text-lg font-bold">Truck<span className="text-[#FFB400]">WithEase</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#C7D3EC]">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#why" className="hover:text-white">Why us</a>
            <Link to="/app/pricing" className="hover:text-white">Pricing</Link>
          </nav>
          <Link to="/app" className="rounded-lg bg-[#FFB400] px-4 py-2 text-sm font-semibold text-[#0E1524] hover:bg-[#E09E00]">Open App</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="twe-navy-grad text-white">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#FFD778] mb-6">
            <Sparkles className="h-3.5 w-3.5" />No contracts · Cancel anytime · ~60% below Motive
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Everything a Class A driver needs — <span className="text-[#FFB400]">in one app.</span>
          </h1>
          <p className="mt-5 text-lg text-[#C7D3EC] max-w-2xl mx-auto">
            HOS, ELD, DVIR, live GPS, fuel, tolls, and state-aware DOT compliance — with two AI experts riding shotgun. Drive Smart. Stay Compliant.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 rounded-lg bg-[#FFB400] px-6 py-3 font-semibold text-[#0E1524] hover:bg-[#E09E00]">Start free 30-day trial <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/app" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-semibold text-white hover:bg-white/10">Explore the demo</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#8FA6D4]">
            {["FMCSA ELD compliant", "State-aware DOT AI", "Built-in loyalty rewards"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#1FA971]" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Best-in-class in every gap the others miss</h2>
          <p className="mt-3 text-[#5B6577] max-w-2xl mx-auto">One subscription replaces a glovebox full of apps and devices.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl bg-white border border-[#E2E7F0] p-6 hover:border-[#FFB400] hover:shadow-md transition-all">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B2A6B]"><Icon className="h-5 w-5 text-[#FFB400]" /></div>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-[#5B6577]">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="bg-white border-y border-[#E2E7F0]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold">Why drivers switch to TruckWithEase</h2>
            <div className="mt-6 space-y-4">
              {[
                { icon: Brain, t: "Two AI experts on board", d: "Fleet Chief diagnoses trucks and trailers like a master mechanic. Health Chief keeps your DOT card current." },
                { icon: Trophy, t: "You actually get rewarded", d: "Every mile, clean day, and fill-up earns points — redeemable for real fuel and subscription credits." },
                { icon: ShieldCheck, t: "Compliance that's proactive", d: "State-aware DOT AI warns you before a violation, not after the ticket." },
                { icon: Camera, t: "Dashcam bundle option", d: "Records video, syncs to the app, cloud storage + incident clips. The Motive killer, without the Motive price." },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.t} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFB400]/15"><Icon className="h-5 w-5 text-[#E09E00]" /></div>
                    <div><div className="font-semibold">{r.t}</div><p className="text-sm text-[#5B6577] mt-0.5">{r.d}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl twe-navy-grad text-white p-8">
            <div className="text-sm font-semibold uppercase tracking-wide text-[#FFB400]">Simple pricing</div>
            <div className="mt-4 space-y-3">
              {[["Solo", "$19.99", "/mo"], ["Pro", "$34.99", "/mo"], ["Fleet", "$24.99", "/seat"]].map(([n, p, u]) => (
                <div key={n} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                  <span className="font-medium">{n}</span>
                  <span className="font-mono-data font-bold text-[#FFB400]">{p}<span className="text-xs text-[#8FA6D4]">{u}</span></span>
                </div>
              ))}
            </div>
            <Link to="/app/pricing" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#FFB400] px-4 py-3 font-semibold text-[#0E1524] hover:bg-[#E09E00]">See full plans <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-3 text-center text-xs text-[#8FA6D4]">30-day free trial · No contracts · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to drive smart?</h2>
        <p className="mt-3 text-[#5B6577]">Open the full demo — no login, no card, full access.</p>
        <Link to="/app" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B2A6B] px-6 py-3 font-semibold text-white hover:bg-[#071E4E]">Open TruckWithEase <ArrowRight className="h-4 w-4" /></Link>
      </section>

      <footer className="border-t border-[#E2E7F0] py-8 text-center text-sm text-[#5B6577]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0B2A6B]"><Truck className="h-3.5 w-3.5 text-[#FFB400]" /></div>
          <span className="font-bold text-[#0E1524]">Truck<span className="text-[#E09E00]">WithEase</span></span>
        </div>
        Drive Smart. Stay Compliant. · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
