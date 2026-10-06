import React, { useState } from 'react';
import { Download, Eye, Copy, Check } from 'lucide-react';

export default function BrandingCenter() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSVG = (filename) => {
    const link = document.createElement('a');
    link.href = `/static/${filename}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-3">Brand Identity</h1>
          <p className="text-xl text-cyan-400">Professional logos for TruckWithEase and MorrisHive</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* TruckWithEase Logo Card */}
          <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-12 hover:border-cyan-400 transition-all">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">TruckWithEase</h2>
              <p className="text-cyan-400 text-sm">Fleet Management Platform</p>
            </div>

            {/* Logo Display */}
            <div className="bg-slate-900 rounded-lg p-8 mb-8 flex items-center justify-center min-h-64">
              <img 
                src="/static/twe-logo.png" 
                alt="Morrishive TruckWithEase Logo" 
                className="w-48 h-48"
              />
            </div>

            {/* Logo Details */}
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-slate-400 mb-2">Primary Colors</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-blue-900 rounded border border-cyan-400"></div>
                    <span className="text-white text-sm">#0B2A6B Navy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-orange-600 rounded"></div>
                    <span className="text-white text-sm">#FF6B00 Orange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-cyan-400 rounded"></div>
                    <span className="text-white text-sm">#00D9FF Cyan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => downloadSVG('truckwithease-logo.svg')}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download SVG
              </button>
              <button
                onClick={() => copyToClipboard('/static/truckwithease-logo.svg', 'truck')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {copied === 'truck' ? <Check size={20} /> : <Copy size={20} />}
                {copied === 'truck' ? 'Copied!' : 'Copy Path'}
              </button>
            </div>
          </div>

          {/* MorrisHive Logo Card */}
          <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-12 hover:border-amber-400 transition-all">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">MorrisHive</h2>
              <p className="text-amber-400 text-sm">Connected Intelligence Network</p>
            </div>

            {/* Logo Display */}
            <div className="bg-slate-900 rounded-lg p-8 mb-8 flex items-center justify-center min-h-64">
              <img 
                src="/static/morrishive-logo.svg" 
                alt="MorrisHive Logo" 
                className="w-48 h-48"
              />
            </div>

            {/* Logo Details */}
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-slate-400 mb-2">Primary Colors</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-slate-900 rounded border border-amber-400"></div>
                    <span className="text-white text-sm">#1a1a2e Dark</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-amber-400 rounded"></div>
                    <span className="text-white text-sm">#FFB400 Gold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-orange-600 rounded"></div>
                    <span className="text-white text-sm">#FF6B00 Orange</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => downloadSVG('morrishive-logo.svg')}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download SVG
              </button>
              <button
                onClick={() => copyToClipboard('/static/morrishive-logo.svg', 'hive')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {copied === 'hive' ? <Check size={20} /> : <Copy size={20} />}
                {copied === 'hive' ? 'Copied!' : 'Copy Path'}
              </button>
            </div>
          </div>
        </div>

        {/* Brand Guidelines */}
        <div className="mt-16 bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Brand Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-cyan-400 mb-3">TruckWithEase</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Use on navy, dark, or light backgrounds</li>
                <li>✓ Minimum size: 64px</li>
                <li>✓ Always maintain cyan/orange accent colors</li>
                <li>✓ Clear space minimum: 20px around logo</li>
                <li>✓ Never rotate or distort the logo</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-amber-400 mb-3">MorrisHive</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Use on dark or light backgrounds</li>
                <li>✓ Minimum size: 64px</li>
                <li>✓ Hexagon structure represents connection</li>
                <li>✓ Gold accent is primary highlight color</li>
                <li>✓ Maintains hierarchy and balance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Implementation</h3>
          <div className="space-y-4">
            <div className="bg-slate-900 rounded p-4">
              <p className="text-slate-400 text-sm mb-2">HTML Image Tag</p>
              <code className="text-cyan-400 font-mono text-sm">
                &lt;img src="/static/truckwithease-logo.svg" alt="TruckWithEase" className="w-32 h-32" /&gt;
              </code>
            </div>
            <div className="bg-slate-900 rounded p-4">
              <p className="text-slate-400 text-sm mb-2">CSS Background</p>
              <code className="text-cyan-400 font-mono text-sm">
                background-image: url('/static/truckwithease-logo.svg');
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}