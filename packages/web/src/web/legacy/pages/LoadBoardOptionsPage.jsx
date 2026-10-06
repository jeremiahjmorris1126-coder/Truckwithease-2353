import React, { useState } from 'react';
import { Check, Plus, AlertCircle, TrendingUp } from 'lucide-react';

export default function LoadBoardOptionsPage() {
  const [selectedTier, setSelectedTier] = useState('standard');
  const [customServices, setCustomServices] = useState([]);

  const standardServices = [
    {
      name: 'DAT Freight',
      icon: '📦',
      description: 'Access to 500K+ active loads daily',
      included: true,
      seatsIncluded: 2,
      costPerSeat: '$15/month'
    },
    {
      name: 'Uber Freight',
      icon: '🚚',
      description: 'Real-time peer-to-peer freight network',
      included: true,
      seatsIncluded: 2,
      costPerSeat: '$15/month'
    }
  ];

  const additionalServices = [
    {
      id: 'freightliner_one',
      name: 'Freightliner One',
      icon: '🔗',
      description: 'OEM load network with premium equipment loads',
      costPerMonth: 89,
      seatsIncluded: 1,
      features: ['Equipment-specific loads', 'Premium shipper network', 'Dedicated support'],
      selected: false
    },
    {
      id: 'convoy',
      name: 'Convoy',
      icon: '🌐',
      description: 'Technology-driven carrier network',
      costPerMonth: 79,
      seatsIncluded: 1,
      features: ['Tech-forward loads', 'Flexible pricing', 'Real-time tracking'],
      selected: false
    },
    {
      id: 'loadup',
      name: 'LoadUp',
      icon: '📍',
      description: 'On-demand pickup and delivery loads',
      costPerMonth: 69,
      seatsIncluded: 2,
      features: ['Regional coverage', 'Quick turnarounds', 'Steady work'],
      selected: false
    },
    {
      id: 'amazon_relay',
      name: 'Amazon Relay',
      icon: '🟠',
      description: 'Direct Amazon delivery and pickup loads',
      costPerMonth: 99,
      seatsIncluded: 1,
      features: ['Amazon ecosystem', 'Consistent loads', 'Priority support'],
      selected: false
    },
    {
      id: 'roadway_select',
      name: 'Roadway Select',
      icon: '⚡',
      description: 'YRC freight network integration',
      costPerMonth: 85,
      seatsIncluded: 1,
      features: ['LTL + TL loads', 'Dedicated lanes', 'Business development'],
      selected: false
    },
    {
      id: 'schneider_connect',
      name: 'Schneider Connect',
      icon: '🔴',
      description: 'Schneider logistics carrier portal',
      costPerMonth: 99,
      seatsIncluded: 1,
      features: ['Enterprise loads', 'Managed logistics', 'Priority lanes'],
      selected: false
    }
  ];

  const toggleCustomService = (id) => {
    setCustomServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calculateMonthlyCost = () => {
    let baseCost = 0; // DAT & Uber included
    const additionalCost = customServices.reduce((sum, id) => {
      const service = additionalServices.find(s => s.id === id);
      return sum + (service ? service.costPerMonth : 0);
    }, 0);
    return baseCost + additionalCost;
  };

  const calculateTotalSeats = () => {
    let seats = 4; // 2 DAT + 2 Uber
    customServices.forEach(id => {
      const service = additionalServices.find(s => s.id === id);
      if (service) seats += service.seatsIncluded;
    });
    return seats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Load Board Access</h1>
          <p className="text-xl text-slate-300">
            DAT & Uber Freight included. Add any other network to expand your opportunities.
          </p>
        </div>

        {/* Standard Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">✓ Included with Every Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standardServices.map((service, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{service.icon}</div>
                  <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Included
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{service.description}</p>
                <div className="bg-slate-900/50 rounded p-3">
                  <div className="text-sm text-slate-400 mb-1">Seats included</div>
                  <div className="font-bold text-orange-400">{service.seatsIncluded} seats</div>
                  <div className="text-xs text-slate-500 mt-2">Additional seats: {service.costPerSeat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">+ Add More Networks</h2>
          <p className="text-slate-400 mb-6">Expand your load options. Add any network — no lock-in contracts.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map(service => (
              <div
                key={service.id}
                onClick={() => toggleCustomService(service.id)}
                className={`rounded-lg p-6 cursor-pointer transition border ${
                  customServices.includes(service.id)
                    ? 'bg-cyan-600/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{service.icon}</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">${service.costPerMonth}</div>
                    <div className="text-xs text-slate-500">/month</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1">{service.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{service.description}</p>

                <div className="space-y-2 mb-4">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-cyan-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/50 rounded p-2 mb-4 text-sm">
                  <span className="text-slate-400">{service.seatsIncluded} seat{service.seatsIncluded > 1 ? 's' : ''} included</span>
                </div>

                <button
                  className={`w-full py-2 rounded font-semibold transition ${
                    customServices.includes(service.id)
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {customServices.includes(service.id) ? '✓ Selected' : '+ Add Network'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Fleet Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 rounded p-4">
              <div className="text-sm text-slate-400 mb-2">Networks Active</div>
              <div className="text-3xl font-bold text-orange-400">{customServices.length + 2}</div>
              <div className="text-xs text-slate-500 mt-2">DAT, Uber + {customServices.length} additional</div>
            </div>

            <div className="bg-slate-900/50 rounded p-4">
              <div className="text-sm text-slate-400 mb-2">Total Load Board Seats</div>
              <div className="text-3xl font-bold text-cyan-400">{calculateTotalSeats()}</div>
              <div className="text-xs text-slate-500 mt-2">Drivers that can access simultaneously</div>
            </div>

            <div className="bg-slate-900/50 rounded p-4">
              <div className="text-sm text-slate-400 mb-2">Monthly Cost</div>
              <div className="text-3xl font-bold text-green-400">${calculateMonthlyCost()}</div>
              <div className="text-xs text-slate-500 mt-2">Recurring subscription</div>
            </div>
          </div>

          {/* Breakdown */}
          {customServices.length > 0 && (
            <div className="bg-slate-800/50 rounded p-4 mb-6">
              <div className="text-sm font-semibold text-slate-300 mb-3">Cost Breakdown</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">DAT Freight + Uber Freight</span>
                  <span className="text-slate-300 font-semibold">Included</span>
                </div>
                {customServices.map(id => {
                  const service = additionalServices.find(s => s.id === id);
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-slate-400">{service.name}</span>
                      <span className="text-cyan-400 font-semibold">${service.costPerMonth}/mo</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
              Confirm & Activate
            </button>
            <button className="flex-1 py-3 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold transition">
              Save for Later
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Common Questions</h3>
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-slate-300 mb-1">Can I add networks anytime?</div>
              <p className="text-slate-400 text-sm">Yes. Add or remove additional networks anytime. No contracts, cancel anytime.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">Do I need all of these?</div>
              <p className="text-slate-400 text-sm">No. DAT & Uber Freight give you access to 500K+ loads daily. Add others only if you want more options or specialized freight.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">Can I upgrade seats on any network?</div>
              <p className="text-slate-400 text-sm">Yes. Add additional seats for any network at $15/seat/month.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">What if my drivers are already on these systems?</div>
              <p className="text-slate-400 text-sm">No problem. Your Morrishive licenses manage all access in one place. Your drivers see all their loads in one dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
