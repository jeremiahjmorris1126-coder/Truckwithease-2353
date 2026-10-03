import React from 'react';
import { X, Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TacticalNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: TacticalNotification[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const getSeverityIcon = (severity: TacticalNotification['severity']) => {
    switch (severity) {
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#ffc37b]" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-[#4ea8de]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Lime Bar */}
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Tactical Alerts &amp; Notifications
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // Mesh Event Stream
              </p>
            </div>
          </div>
          <button
            id="close-notif-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-[#0A0A0A] border-b border-[#222] flex items-center justify-between font-mono text-xs">
          <span className="text-[#666] uppercase font-bold tracking-wider">
            {notifications.filter((n) => !n.read).length} Unread Alerts
          </span>
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-white uppercase font-bold tracking-wider transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#666] uppercase tracking-wider">
              No active notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border font-mono text-xs transition-all relative ${
                  n.read
                    ? 'bg-[#0A0A0A] border-[#222] opacity-70'
                    : 'bg-[#1C1C1C] border-[#333] shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5">{getSeverityIcon(n.severity)}</span>
                    <div>
                      <div className="font-bold text-white uppercase tracking-tight">{n.title}</div>
                      <div className="text-[11px] text-[#888] mt-1 font-body leading-relaxed">
                        {n.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider whitespace-nowrap">
                    {n.time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[#222] bg-[#111] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] hover:text-[#C9A84C] text-white uppercase font-bold tracking-wider text-xs font-mono transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
