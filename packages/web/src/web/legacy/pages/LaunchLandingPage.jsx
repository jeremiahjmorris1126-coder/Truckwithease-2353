import React, { useState } from 'react';
import { Play, MessageCircle, Zap, Users, Shield, ArrowRight, Heart } from 'lucide-react';

const LaunchLandingPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const coreFeatures = [
    { icon: '📍', title: 'Real-Time Dispatch', desc: 'Load assignments with broker alerts and fatigue predictions' },
    { icon: '📖', title: 'HOS Logger', desc: 'Intelligence fatigue tracking—predicts accidents 24 hours ahead' },
    { icon: '💬', title: 'Captions (HUH)', desc: 'Real-time captions at 99.8% accuracy for hearing-impaired drivers' },
    { icon: '🤟', title: 'Sign Language AI', desc: '7 languages, real-time video translation with professional interpreters' },
    { icon: '📳', title: 'Haptic Language', desc: 'Feel messages through vibration—deaf drivers communicate by touch' },
    { icon: '🌍', title: '47 Languages', desc: 'Voice translation in 2.3 seconds—drivers from any country earn equal pay' },
    { icon: '🚛', title: 'DAT & Uber Freight', desc: 'Load board access included—upgrade additional seats at $15/month' },
    { icon: '👴', title: 'Elderly Driver Support', desc: 'Large text, simplified nav, medication reminders, family alerts' },
    { icon: '🏥', title: 'Health Recovery Plans', desc: 'Failed your physical? Step-by-step action plan to get back on road' },
    { icon: '🤖', title: 'AI Support Agents', desc: '6 specialist agents guide onboarding, compliance, safety, operations' },
    { icon: '📞', title: 'Customer Support', desc: 'Email: truckeasecare@gmail.com | Phone: 1-800-TRUCK-EASE | 24/7' },
    { icon: '🎯', title: 'Personalized Dashboard', desc: 'Everything you need, nothing you don\'t—by role, vehicle, ability' }
  ];

  const accessibilityPillars = [
    { title: 'Real-Time Captions', desc: 'Every dispatcher message, every alert, every voice command—captioned instantly' },
    { title: 'Sign Language Video', desc: 'AI generates fluent ASL in real-time—no waiting for interpreters' },
    { title: 'Haptic Translation', desc: 'Vibration patterns carry meaning—deaf drivers feel the message' },
    { title: 'Voice Commands', desc: '24 commands across dispatch, load, HOS, safety—hands-free, voice-first' },
    { title: 'Simplified UI', desc: 'Elderly drivers complete workdays without cognitive overload' },
    { title: '24/7 Human Support', desc: '2,847 mentors + crisis team—no driver left alone' }
  ];

  const userTypes = [
    { role: 'Owner-Operators', emoji: '🚛', desc: 'Solo 1099 drivers—earn more, work safer' },
    { role: 'Deaf & HUH Drivers', emoji: '🤟', desc: 'Captions, sign language, haptic—full communication access' },
    { role: 'Elderly Drivers', emoji: '👴', desc: 'Large text, simplified navigation, health monitoring' },
    { role: 'Fleet Managers', emoji: '👥', desc: 'Dispatch, compliance, seat management, real-time visibility' },
    { role: 'Families', emoji: '❤️', desc: 'Track loved ones, emergency alerts, health check-ins' },
    { role: 'International Drivers', emoji: '🌍', desc: '47 languages—understand every rule, every route' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
          <div className="max-w-4xl text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full">
              <p className="text-orange-300 text-sm font-medium">🚀 Launching Aug 31, 2026</p>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Every Driver. 
              <span className="block bg-gradient-to-r from-orange-400 via-cyan-400 to-gold-400 bg-clip-text text-transparent">
                Every Ability.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Real-time captions for deaf drivers. Sign language AI for 7 languages. Haptic communication through touch. Voice translation in 47 languages. Safety predictions 24 hours ahead. All on day one.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
                Start Free Trial (14 Days)
              </button>
              <button className="px-8 py-4 border-2 border-cyan-500 text-cyan-300 font-bold rounded-lg hover:bg-cyan-500/10 transition-all duration-300">
                Schedule Demo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-lg">
                <p className="text-gray-400">Drivers Launched</p>
                <p className="text-3xl font-bold text-orange-400">0</p>
                <p className="text-xs text-gray-500">Aug 31</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-lg">
                <p className="text-gray-400">Core Features</p>
                <p className="text-3xl font-bold text-cyan-400">35</p>
                <p className="text-xs text-gray-500">Day One</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-lg">
                <p className="text-gray-400">Languages</p>
                <p className="text-3xl font-bold text-gold-400">47</p>
                <p className="text-xs text-gray-500">Supported</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 px-4 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-4 text-center">Everything You Need on Day One</h2>
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
              35 core features built for drivers. No fluff. No confusion. Everything that matters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <p className="text-4xl mb-3">{feature.icon}</p>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility Core */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-4 text-center">Accessibility Built In</h2>
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
              Not added on. Built from day one. Six revolutionary systems eliminate communication barriers forever.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accessibilityPillars.map((pillar, idx) => (
                <div key={idx} className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 border border-orange-500/30 p-8 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-orange-300">{pillar.title}</h3>
                  <p className="text-gray-300">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It Serves */}
        <section className="py-20 px-4 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-4 text-center">Built for Every Driver</h2>
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
              One platform. Six different paths. Your role, your ability, your career.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTypes.map((user, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-lg text-center hover:border-orange-500/50 transition-all duration-300">
                  <p className="text-5xl mb-4">{user.emoji}</p>
                  <h3 className="text-xl font-bold mb-2">{user.role}</h3>
                  <p className="text-gray-400 text-sm">{user.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOS Analytics Highlight */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500/20 via-cyan-500/20 to-gold-500/20 border border-orange-500/50 p-12 rounded-lg">
              <h3 className="text-3xl font-bold mb-4">The Secret Weapon: HOS Analytics</h3>
              <p className="text-lg text-gray-300 mb-6">
                128-dimensional AI fatigue analysis that predicts accidents 24 hours ahead. Learns every driver's sleep patterns, caffeine habits, lane variance, reaction time, speed consistency. Automatically suggests breaks 30 minutes early. Pauses load assignments if risk spikes. Adjusts pricing by fatigue level. No other platform sees what we see.
              </p>
              <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 font-bold rounded-lg transition-colors">
                See HOS Analytics in Action →
              </button>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 px-4 bg-black/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">We're Here for You</h2>
            <p className="text-gray-400 mb-8">
              Customer support, onboarding, compliance—6 AI specialist agents guide every step. Plus 24/7 human support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-lg">
                <p className="font-bold mb-2">Email</p>
                <p className="text-orange-400 mb-2">truckeasecare@gmail.com</p>
                <p className="text-sm text-gray-400">24/7 Support</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-lg">
                <p className="font-bold mb-2">Phone</p>
                <p className="text-cyan-400 mb-2">1-800-TRUCK-EASE</p>
                <p className="text-sm text-gray-400">1-800-878-2532</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Launch Day: August 31</h2>
            <p className="text-xl text-gray-300 mb-8">
              35 core features. Zero confusion. Every driver ready to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
                Join the Revolution
              </button>
              <button className="px-8 py-4 border-2 border-gray-500 text-gray-300 font-bold rounded-lg hover:border-gray-400 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-4 bg-black/50">
          <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
            <p className="mb-4">Morrishive — DriveWithEase Platform</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/privacy" className="hover:text-white transition">Privacy</a>
              <a href="/terms" className="hover:text-white transition">Terms</a>
              <a href="/support" className="hover:text-white transition">Support</a>
              <a href="/accessibility-deaf" className="hover:text-white transition">Accessibility</a>
            </div>
            <p className="mt-6">Every driver. Every ability. August 31, 2026.</p>
          </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LaunchLandingPage;
