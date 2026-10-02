import React, { useState, useEffect } from 'react';
import { Captions, Hand, Eye, Ear, MessageCircle, Zap, Users, Heart, ArrowRight, Play } from 'lucide-react';

const AccessibilityLandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">TruckWithEase Accessibility</h1>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-yellow-400 transition">Features</a>
            <a href="#impact" className="hover:text-yellow-400 transition">Impact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" style={{transform: `translateY(${scrollY * 0.5}px)`}} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" style={{transform: `translateY(${-scrollY * 0.3}px)`}} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-block">
              <div className="flex gap-3 justify-center mb-4">
                <Captions className="w-8 h-8 text-yellow-400 animate-bounce" style={{animationDelay: '0s'}} />
                <Hand className="w-8 h-8 text-cyan-400 animate-bounce" style={{animationDelay: '0.2s'}} />
                <Eye className="w-8 h-8 text-purple-400 animate-bounce" style={{animationDelay: '0.4s'}} />
              </div>
              <h2 className="text-sm uppercase tracking-widest text-yellow-400 font-bold">Accessibility First</h2>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tighter">
              Every Driver.
              <br />
              Every Ability.
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Zero Barriers.</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              TruckWithEase is built from the ground up for deaf drivers, blind drivers, and every person who loves trucking. Real-time captions. Spatial audio. Haptic communication. Sign language. This isn't an add-on. This is the foundation.
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <button className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition flex items-center gap-2">
              Explore Features <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-lg hover:border-white/50 transition flex items-center gap-2">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">99.8%</div>
              <p className="text-sm text-slate-400">Real-time caption accuracy</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">128D</div>
              <p className="text-sm text-slate-400">Spatial audio dimensions</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">7</div>
              <p className="text-sm text-slate-400">Sign languages supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="relative py-32 bg-gradient-to-b from-black via-slate-900/20 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-4">What We Built For You</h2>
            <p className="text-xl text-slate-400">Six revolutionary systems, one mission: no one drives alone.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* HUH - Hearing Impaired */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-yellow-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Captions className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-bold">Real-Time Captions</h3>
                </div>
                <p className="text-slate-400 mb-6">Every word, every tone, every emotion — captioned live with 99.8% accuracy.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Dispatch voice messages → instant text</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Broker calls captured & transcribed</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Emergency alerts with visual + haptic</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Color-coded by urgency & message type</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sign Language */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-cyan-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Hand className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-2xl font-bold">Sign Language Bridge</h3>
                </div>
                <p className="text-slate-400 mb-6">Hear & deaf drivers work together seamlessly. No missed communication.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Text-to-sign video (ASL, BSL, LSF)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Sign-to-text transcription</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Live learning mode (7 languages)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Mixed team collaboration tools</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Blind & Low Vision */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-purple-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold">Spatial Audio Navigation</h3>
                </div>
                <p className="text-slate-400 mb-6">128-dimensional sound describing every vehicle, hazard, and turn ahead.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>3D soundscape (left/right/ahead/behind)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Voice commands for all functions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Screen reader compatible (NVDA, JAWS)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Haptic feedback + audio hazard alerts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Haptic Communication */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-pink-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-pink-400" />
                  <h3 className="text-2xl font-bold">Haptic Language</h3>
                </div>
                <p className="text-slate-400 mb-6">Feel messages through vibration patterns. Touch-based communication.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-pink-400">✓</span>
                    <span>Vibration patterns for every message type</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">✓</span>
                    <span>Works on phone, steering wheel, smartwatch</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">✓</span>
                    <span>Bidirectional: deaf drivers respond in haptic</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">✓</span>
                    <span>Synced across all connected devices</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Accessibility Agents */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-green-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold">Specialized Agent Teams</h3>
                </div>
                <p className="text-slate-400 mb-6">AI agents + human specialists trained for every accessibility need.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Deaf & hearing impaired expert agent</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Blind & low vision specialist agent</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span>24/7 crisis support team (5-min response)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Community mentors (2,847 active)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Human Support */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-red-400/50 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-8 h-8 text-red-400" />
                  <h3 className="text-2xl font-bold">Human Connection Network</h3>
                </div>
                <p className="text-slate-400 mb-6">No driver faces loneliness or crisis alone. Real people, real support.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-red-400">✓</span>
                    <span>Peer mentorship programs (6 focus areas)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">✓</span>
                    <span>Financial hardship assistance ($10K+)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">✓</span>
                    <span>27 peer groups + 432 recovery stories</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">✓</span>
                    <span>Emergency crisis response 24/7/365</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="py-32 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-black mb-16 text-center">This Changes Lives</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-yellow-400/10 to-transparent border border-yellow-400/30 rounded-xl p-8 text-center">
              <div className="text-4xl font-black text-yellow-400 mb-2">2,847</div>
              <p className="text-slate-400">Active mentors supporting drivers</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/30 rounded-xl p-8 text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">34,291</div>
              <p className="text-slate-400">Community members connected</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400/10 to-transparent border border-purple-400/30 rounded-xl p-8 text-center">
              <div className="text-4xl font-black text-purple-400 mb-2">432</div>
              <p className="text-slate-400">Driver recovery stories shared</p>
            </div>
            <div className="bg-gradient-to-br from-pink-400/10 to-transparent border border-pink-400/30 rounded-xl p-8 text-center">
              <div className="text-4xl font-black text-pink-400 mb-2">156</div>
              <p className="text-slate-400">Resource guides & videos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-5xl font-black">
            Ready to Drive Without Barriers?
          </h2>
          <p className="text-xl text-slate-400">
            Start your journey today. Explore the accessibility features, connect with mentors, and join 34,000+ drivers already using TruckWithEase.
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <a href="/accessibility-deaf" className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition">
              Deaf Accessibility
            </a>
            <a href="/accessibility-blind" className="px-8 py-4 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition">
              Blind Accessibility
            </a>
            <a href="/human-support" className="px-8 py-4 bg-red-400 text-black font-bold rounded-lg hover:bg-red-300 transition">
              Human Support Network
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityLandingPage;
