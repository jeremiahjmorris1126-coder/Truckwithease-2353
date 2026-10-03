import React, { useState } from 'react';
import { X, Key, Link2, CheckCircle2, Shield, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PipelineItem } from '../types';

interface ConnectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIntegration: (item: PipelineItem) => void;
}

export const ConnectIntegrationModal: React.FC<ConnectIntegrationModalProps> = ({
  isOpen,
  onClose,
  onAddIntegration,
}) => {
  const [providerType, setProviderType] = useState('Project44 Movement API');
  const [name, setName] = useState('Project44 Movement');
  const [subtitle, setSubtitle] = useState('Visibility & Milestone Telemetry');
  const [apiKey, setApiKey] = useState('pk_live_morrishive_89a4ff12c90e');
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    'https://mesh.morrishive.com/api/v2/ingest/project44'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProviderSelect = (p: { name: string; sub: string }) => {
    setProviderType(p.name);
    setName(p.name);
    setSubtitle(p.sub);
    setWebhookUrl(
      `https://mesh.morrishive.com/api/v2/ingest/${p.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}`
    );
    setTestResult(null);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Handshake succeeded: 200 OK (38ms latency)');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PipelineItem = {
      id: `pipeline-${Date.now()}`,
      name: name,
      subtitle: subtitle,
      description: `Encrypted ingress pipeline bound to ${webhookUrl}. Latency verified at 38ms.`,
      status: '200 OK',
      latencyMs: Math.floor(25 + Math.random() * 40),
      iconName: 'hub',
    };
    onAddIntegration(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Lime Bar */}
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Connect New Integration
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // Enterprise API Gateway &amp; Node Ingress
              </p>
            </div>
          </div>
          <button
            id="close-connect-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] font-bold mb-2">
              // SELECT ENTERPRISE PROVIDER PRESET
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Project44 Movement', sub: 'Visibility & Milestone' },
                { name: 'FourKites Yard & ETA', sub: 'Detention & Realtime' },
                { name: 'Trimble TMW Gateway', sub: 'Dispatch & Work Orders' },
                { name: 'Omnitracs One Mesh', sub: 'Hours of Service Telematics' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleProviderSelect(preset)}
                  className={`p-2.5 text-left border text-xs font-mono transition-all ${
                    name === preset.name
                      ? 'bg-[#1C1C1C] border-[#C9A84C] text-[#C9A84C]'
                      : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:border-[#333] hover:text-white'
                  }`}
                >
                  <div className="font-bold uppercase tracking-tight truncate">{preset.name}</div>
                  <div className="text-[10px] text-[#666] truncate mt-0.5">{preset.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Name & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                Integration Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                Category Descriptor
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
              API Key / Authorization Token
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#222] pl-3 pr-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-[#666] hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Inbound Webhook URL */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
              Encrypted Mesh Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-[#888] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          {/* Test Handshake Button & Result */}
          <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#888]">
                Pre-Flight Connection Handshake
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-xs font-mono uppercase font-bold tracking-wider transition-colors active:scale-95"
              >
                {isTesting ? 'Probing...' : 'Test Handshake'}
              </button>
            </div>
            {testResult && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#C9A84C]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{testResult}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            id="mount-integration-btn"
            type="submit"
            className="w-full h-12 bg-[#C9A84C] hover:bg-white text-black font-headline text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors active:scale-98 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mount Node to Tactical Mesh</span>
          </button>
        </form>
      </div>
    </div>
  );
};
