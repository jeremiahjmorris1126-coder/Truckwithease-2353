import React, { useState } from 'react';
import { X, Terminal, Copy, Check, Filter, RefreshCw, Send } from 'lucide-react';
import { WebhookLog } from '../types';

interface WebhookLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WebhookLog[];
  onAddMockLog: (log: WebhookLog) => void;
}

export const WebhookLogsModal: React.FC<WebhookLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onAddMockLog,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSource = selectedSource === 'ALL' || log.source === selectedSource;
    const matchesSearch =
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.payloadPreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateWebhook = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;

    const newLog: WebhookLog = {
      id: `wh-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeStr,
      source: 'Highway',
      event: 'carrier.telemetry.mesh_sync',
      status: 200,
      latencyMs: Math.floor(20 + Math.random() * 45),
      payloadPreview: JSON.stringify({
        carrier: 'Titan Carrier Services',
        dot: '3928192',
        sync_result: 'success',
        nodes_acknowledged: 4,
        auth_sig: '0x' + Math.random().toString(16).substring(2, 10),
      }),
      signature:
        'sha256=' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    onAddMockLog(newLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Top Bar */}
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Live Webhook Inspector
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // Real-time Ingestion Stream · HMAC-SHA256 Verified
              </p>
            </div>
          </div>
          <button
            id="close-webhook-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-3 border-b border-[#222] bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-2">
          {/* Source filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono py-0.5">
            <Filter className="w-3.5 h-3.5 text-[#666] mr-1 shrink-0" />
            {['ALL', 'Highway', 'Samsara', 'Geotab', 'GIS Engine', 'Sentinel'].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 py-1 uppercase font-bold tracking-wider transition-colors whitespace-nowrap ${
                  selectedSource === src
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'text-[#888] hover:text-[#C9A84C] bg-[#1C1C1C] border border-[#222]'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateWebhook}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-xs font-mono uppercase font-bold tracking-wider text-[#C9A84C] active:scale-95 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Send Test Ping</span>
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#666] uppercase tracking-wider">
              No webhooks matching filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0A0A0A] border border-[#222] font-mono text-xs space-y-2 hover:border-[#333] transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-[#C9A84C] font-black text-[10px] uppercase tracking-wider">
                      {log.source}
                    </span>
                    <span className="text-white font-bold">{log.event}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#888]">
                    <span className="px-1.5 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 text-[10px] font-black">
                      {log.status} OK
                    </span>
                    <span className="text-[#C9A84C] font-bold">{log.latencyMs}MS</span>
                    <span className="text-[#666]">{log.timestamp}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#141414] border border-[#222] text-[#999] text-[11px] break-all leading-relaxed">
                  {log.payloadPreview}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#666] pt-0.5">
                  <span className="truncate max-w-[280px]">
                    SIG: {log.signature.substring(0, 32)}...
                  </span>
                  <button
                    onClick={() => handleCopy(log.id, log.payloadPreview)}
                    className="flex items-center gap-1.5 text-[#C9A84C] hover:text-white px-2.5 py-1 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] transition-colors font-bold uppercase tracking-wider"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#C9A84C]" />
                        <span className="text-[#C9A84C]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 border-t border-[#222] bg-[#111] flex items-center justify-between text-xs font-mono text-[#888]">
          <span>{filteredLogs.length} Events in buffer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] hover:text-[#C9A84C] text-white uppercase font-bold tracking-wider transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
