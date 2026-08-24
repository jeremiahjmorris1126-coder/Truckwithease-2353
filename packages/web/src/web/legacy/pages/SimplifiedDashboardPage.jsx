import React, { useState } from 'react';
import { ChevronRight, MessageCircle, Zap, MapPin, Heart, Shield, Users } from 'lucide-react';

const SimplifiedDashboardPage = () => {
  const [userType, setUserType] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const driverCards = [
    {
      id: 'loads',
      title: 'Find Loads',
      action: 'See what\'s available today',
      description: 'Browse loads from DAT and Uber Freight. Pick one. Go.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'safety',
      title: 'Hours Safe',
      action: 'Check your fatigue level',
      description: 'We predict if you\'re getting tired. Breaks suggested automatically.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'captions',
      title: 'Messages Clear',
      action: 'See every dispatch message captioned',
      description: 'Real-time captions at 99.8% accuracy. You hear everything.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'language',
      title: 'Speak Your Language',
      action: 'Everything translated',
      description: 'Messages, routes, rules—all in your native language instantly.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'help',
      title: 'Need Help?',
      action: 'Talk to someone right now',
      description: 'Email, phone, chat—24/7. We\'re here.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'family',
      title: 'Family Knows You\'re Safe',
      action: 'They see your location, your status',
      description: 'Simple alerts. No stress. They know you\'re okay.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    }
  ];

  const dispatcherCards = [
    {
      id: 'assign',
      title: 'Assign Loads',
      action: 'Pick a driver. Send a load.',
      description: 'See who\'s available. Who\'s tired. Who\'s safe to drive.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'safety-check',
      title: 'Safety Check',
      action: 'Know before it happens',
      description: 'Quantum AI predicts fatigue 24 hours ahead. Prevent accidents.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'broker-alerts',
      title: 'Broker Flags',
      action: 'Know who pays late',
      description: 'We track bad brokers. You stay clear.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Ready',
      action: 'Deaf? Elderly? All supported.',
      description: 'Captions, large text, haptic alerts—your team works as one.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'reports',
      title: 'See Everything',
      action: 'Real-time team status',
      description: 'Who\'s safe. Who\'s tired. Who\'s profitable. All at a glance.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'compliance',
      title: 'Compliance Done',
      action: 'Automatic HOS tracking',
      description: 'DOT rules handled. You focus on the business.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    }
  ];

  const managerCards = [
    {
      id: 'team',
      title: 'Manage Your Team',
      action: 'See everyone. Know their status.',
      description: 'Who\'s working. Who\'s safe. Who\'s tired. One dashboard.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'profit',
      title: 'Make More Money',
      action: 'Smarter load routing',
      description: 'Tax-adjusted pricing. Fuel-optimized routes. Real profit numbers.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'safety-fleet',
      title: 'Keep Everyone Safe',
      action: 'Predict problems before they happen',
      description: 'Fatigue detection. Accident prevention. Insurance savings.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'seats',
      title: 'Load Board Seats',
      action: 'Manage DAT and Uber Freight access',
      description: 'Add drivers. Upgrade seats. Simple controls.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'training',
      title: 'Training & Compliance',
      action: 'Keep your team certified',
      description: 'HOS rules. Safety drills. Automatic alerts when certifications expire.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'analytics',
      title: 'Understand Your Business',
      action: 'Real metrics. Real decisions.',
      description: 'Revenue per driver. Safety scores. Compliance status. Clear.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    }
  ];

  const elderlyCards = [
    {
      id: 'simple',
      title: 'Simple & Clear',
      action: 'Big text. Simple buttons.',
      description: 'No confusing menus. Everything you need, right in front.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'reminders',
      title: 'Medication Reminders',
      action: 'Never forget again',
      description: 'Automatic alerts for your meds, meals, rest breaks.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'family-check',
      title: 'Family Checks In',
      action: 'They see you\'re safe',
      description: 'One-click to let them know you\'re okay.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'voice',
      title: 'Talk Instead of Type',
      action: 'Just speak. We understand.',
      description: 'Voice commands. No typing. No complicated gestures.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'support-senior',
      title: 'Real People Help',
      action: 'Anytime you need us',
      description: 'No robots. No wait. Talk to someone who cares.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    },
    {
      id: 'health',
      title: 'Health Stays Private',
      action: 'Your data is yours',
      description: 'Medication tracking, health alerts—all private and secure.',
      color: 'bg-slate-800',
      border: 'border-slate-600'
    }
  ];

  const deafCards = [
    {
      id: 'captions-deaf',
      icon: '📖',
      title: 'Every Word Captioned',
      action: 'See everything that\'s said',
      description: '99.8% accuracy. Real-time. Every message, every alert.',
      color: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/50'
    },
    {
      id: 'sign-language',
      icon: '🤟',
      title: 'AI Sign Language',
      action: 'Messages in ASL',
      description: '7 languages. Fluent signing. Professional interpreters.',
      color: 'from-green-500/20 to-teal-600/20',
      border: 'border-green-500/50'
    },
    {
      id: 'haptic',
      icon: '📳',
      title: 'Feel the Message',
      action: 'Vibrations carry meaning',
      description: 'Different patterns for different alerts. You feel what\'s happening.',
      color: 'from-purple-500/20 to-pink-600/20',
      border: 'border-purple-500/50'
    },
    {
      id: 'alerts-visual',
      icon: '🎨',
      title: 'Visual Alerts',
      action: 'See danger, see urgency',
      description: 'Color-coded alerts. Flashing for emergencies. You never miss anything.',
      color: 'from-orange-500/20 to-red-600/20',
      border: 'border-orange-500/50'
    },
    {
      id: 'communication',
      icon: '💬',
      title: 'Communicate Freely',
      action: 'Deaf driver ↔ Hearing dispatcher',
      description: 'Type or sign. They see it. They respond. Full communication.',
      color: 'from-blue-500/20 to-indigo-600/20',
      border: 'border-blue-500/50'
    },
    {
      id: 'community',
      icon: '👥',
      title: 'Deaf Community',
      action: 'You\'re not alone',
      description: '2,847 deaf drivers. Mentors. Support. You belong here.',
      color: 'from-pink-500/20 to-rose-600/20',
      border: 'border-pink-500/50'
    }
  ];

  const getCards = () => {
    switch(userType) {
      case 'driver': return driverCards;
      case 'dispatcher': return dispatcherCards;
      case 'manager': return managerCards;
      case 'elderly': return elderlyCards;
      case 'deaf': return deafCards;
      default: return [];
    }
  };

  const getRoleLabel = () => {
    const labels = {
      driver: 'Solo Driver',
      dispatcher: 'Dispatcher',
      manager: 'Fleet Manager',
      elderly: 'Elderly Driver',
      deaf: 'Deaf Driver'
    };
    return labels[userType] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">DriveWithEase</h1>
              {userType && <p className="text-sm text-gray-400">{getRoleLabel()}</p>}
            </div>
            {userType && (
              <button
                onClick={() => setUserType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                Change Role
              </button>
            )}
          </div>
        </div>

        {/* Role Selector */}
        {!userType ? (
          <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
            <div className="max-w-2xl text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">What's Your Role?</h2>
              <p className="text-xl text-gray-400">We'll show you exactly what you need. Nothing more.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                { id: 'driver', emoji: '🚛', label: 'Solo Driver', desc: 'Owner-operator or company driver' },
                { id: 'dispatcher', emoji: '📦', label: 'Dispatcher', desc: 'Assign loads and manage drivers' },
                { id: 'manager', emoji: '👥', label: 'Fleet Manager', desc: 'Run the whole operation' },
                { id: 'elderly', emoji: '👴', label: 'Elderly Driver', desc: 'Simple interface, big text' },
                { id: 'deaf', emoji: '🤟', label: 'Deaf Driver', desc: 'Captions, signing, haptic alerts' }
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => setUserType(role.id)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 p-8 rounded-lg transition-all duration-300 group text-center"
                >
                  <p className="text-5xl mb-4">{role.emoji}</p>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400">{role.label}</h3>
                  <p className="text-sm text-gray-400">{role.desc}</p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold mb-4">Your Dashboard</h2>
                <p className="text-gray-400">Six things you can do. Pick one and start.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCards().map(card => (
                  <button
                    key={card.id}
                    onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
                    className={`text-left ${card.color} border ${card.border} p-6 transition-all duration-300 hover:border-white/50 group`}
                  >
                    <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-300 font-semibold mb-2">{card.action}</p>
                    
                    {activeCard === card.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400">{card.description}</p>
                        <button className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-sm font-bold w-full transition-colors">
                          Get Started
                        </button>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Simple Footer */}
        <footer className="border-t border-white/10 py-8 px-4 bg-black/50 text-center text-sm text-gray-400">
          <p>Need help? Email truckeasecare@gmail.com or call 1-800-TRUCK-EASE</p>
          <p className="mt-4">DriveWithEase—one platform. Your way to drive.</p>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default SimplifiedDashboardPage;
