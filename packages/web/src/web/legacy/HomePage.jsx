import { useState, useEffect } from 'react';
import { ArrowRight, Truck, Shield, Zap, BarChart3, Users, Layers } from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-black font-bold" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">TruckWithEase</span>
          </div>
          <a href="/signup" className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
            Start Free Trial
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Gradient background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Logo centered at top */}
          <div className="flex justify-center mb-12">
            <img src="/static/twe-logo.png" alt="Morrishive TruckWithEase" className="max-w-sm h-auto" />
          </div>

          {/* Main headline */}
          <h1 className="text-7xl font-black leading-tight mb-6 tracking-tight text-center">
            <span className="block text-white">YOU'RE NOT</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">ALONE ON THE ROAD</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed text-center">
            Fleet management built by truckers. FMCSA-registered ELDs. Live HOS compliance. AI safety coaching that prevents violations before they happen. Move smarter. Earn more.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mb-16 justify-center">
            <a href="/signup" className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-yellow-500/40 transition-all flex items-center gap-2 group">
              Start Your Free 14-Day Trial
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/sales" className="px-8 py-4 border-2 border-yellow-500/50 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/10 transition-all">
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-8 text-sm text-gray-400 mb-20 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              FMCSA Registered ELDs
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              40% Cheaper Than Samsara
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              Break Even by Month 6
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-gray-950/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-16 text-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Built for Fleets That Move</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'HOS & ELD Sync', desc: 'Geotab integration auto-logs hours. Alerts 1 hour before violations.' },
              { icon: Zap, title: 'AI Dispatch', desc: 'Route matching sees 5 factors: profit, HOS, location, fuel, driver pref.' },
              { icon: BarChart3, title: 'Driver Earnings', desc: 'Real-time visibility: load rate minus fuel = actual profit.' },
              { icon: Users, title: 'Safety Coaching', desc: 'Safety Sam learns each driver. Prevents incidents before they happen.' },
              { icon: Layers, title: 'Full Compliance', desc: 'FMCSA, DOT, IFTA, permits. Audit-proof reporting for inspections.' },
              { icon: Truck, title: 'Predictive Maintenance', desc: 'Engine data predicts failures 2-7 days early. Zero unexpected downtime.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 border border-yellow-500/20 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 hover:border-yellow-500/40 hover:bg-gray-900/70 transition-all group">
                <feature.icon size={28} className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Simple Pricing. Full Power.</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">Start with HOS logging on any device. Add features as you grow. No hardware required — optional ELD integration available.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tier: 'Solo', price: '$29.99/mo', features: ['HOS / ELD Logger (app)', 'Pre-Trip DVIR', 'DOT AI Watcher', 'Fuel Finder & Parking', 'Download to iOS, Android, Mac'], highlight: false },
              { tier: 'Pro', price: '$39.99/mo', features: ['Everything in Solo', 'Load Board Access', 'Dispatch Routing', 'Fuel Card Integration', 'Cinema Video Library', 'Priority Support'], highlight: true },
              { tier: 'Fleet', price: '$49.99/mo', features: ['Everything in Pro', 'Multi-driver Admin (up to 10 trucks)', 'HOS Overview & Status', 'Bulk DVIR Reports', 'Safety Scorecards', 'Optional ELD Hardware Rental'], highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`p-8 rounded-xl border-2 transition-all ${plan.highlight ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 transform scale-105' : 'border-gray-700 bg-gray-950/50'}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.tier}</h3>
                <p className="text-3xl font-black text-yellow-400 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className={`block w-full py-3 text-center rounded-lg font-bold transition-all ${plan.highlight ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-lg hover:shadow-yellow-500/40' : 'border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'}`}>
                  Start Free Trial
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">Ready to Scale?</h2>
          <p className="text-xl text-gray-300 mb-8">Your first fleet breaks even by month 2. Get 100 fleets running and you're at $4,500/month profit.</p>
          <a href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-yellow-500/40 transition-all text-lg">
            Join the Revolution
            <ArrowRight size={24} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 bg-gray-950/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2026 TruckWithEase. Built for drivers.</p>
          <a href="mailto:truckwithease@gmail.com" className="hover:text-yellow-400 transition-colors">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
