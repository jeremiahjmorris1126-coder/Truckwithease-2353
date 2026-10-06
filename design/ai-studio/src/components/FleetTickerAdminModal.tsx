import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Newspaper,
  ShieldAlert,
  Sun,
  AlertTriangle,
  Send,
  Trash2,
  Sliders,
  CheckCircle2,
  Zap,
  Globe,
  Gauge,
  Sparkles,
  CloudUpload,
  CloudCheck,
  Check,
} from 'lucide-react';
import {
  fleetTickerService,
  TickerPreferences,
  TickerItem,
} from '../services/fleetTickerService';
import { saveTickerPreferencesToFirestore } from '../firebase';

interface FleetTickerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const FleetTickerAdminModal: React.FC<FleetTickerAdminModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [prefs, setPrefs] = useState<TickerPreferences>(fleetTickerService.getPreferences());
  const [items, setItems] = useState<TickerItem[]>(fleetTickerService.getAllRawItems());
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderUrgency, setNewReminderUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL_URGENT'>('HIGH');
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrefs(fleetTickerService.getPreferences());
      setItems(fleetTickerService.getAllRawItems());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (categoryKey: keyof TickerPreferences, displayName: string, value: boolean) => {
    const updated = { ...prefs, [categoryKey]: value };
    setPrefs(updated);
    fleetTickerService.updatePreferences({ [categoryKey]: value });
    onShowToast(`CATEGORY ${displayName.toUpperCase()}: ${value ? 'ACTIVE (DISPLAYING)' : 'MUTED (HIDDEN)'}`);
  };

  const handleSetSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    setPrefs((prev) => ({ ...prev, tickerSpeed: speed }));
    fleetTickerService.updatePreferences({ tickerSpeed: speed });
    onShowToast(`TICKER SCROLL SPEED SET TO ${speed.toUpperCase()}`);
  };

  const handleSetTheme = (theme: 'gold' | 'amber' | 'emerald') => {
    setPrefs((prev) => ({ ...prev, theme }));
    fleetTickerService.updatePreferences({ theme });
    onShowToast(`TICKER VISUAL THEME: ${theme.toUpperCase()}`);
  };

  const handleSaveAllToFirestore = async () => {
    setIsSavingToFirestore(true);
    try {
      const res = await fleetTickerService.savePreferencesToFirestore();
      if (res.success) {
        const timeStr = new Date().toLocaleTimeString();
        setLastSavedTimestamp(timeStr);
        onShowToast(`FIRESTORE SYNC: Category preferences securely saved to database at ${timeStr}`);
      } else {
        onShowToast('FIRESTORE SYNC: Saved locally, remote cloud commit queued.');
      }
    } catch (err: any) {
      onShowToast('FIRESTORE SYNC: Saved locally.');
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handlePostReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;

    fleetTickerService.addCustomFleetReminder(newReminderText.trim(), newReminderUrgency);
    setItems(fleetTickerService.getAllRawItems());
    setNewReminderText('');
    onShowToast('FLEET DIRECTIVE BROADCASTED TO ALL ACTIVE DRIVER COCKPITS');
  };

  const handleDeleteCustomItem = (id: string) => {
    fleetTickerService.removeCustomFleetReminder(id);
    setItems(fleetTickerService.getAllRawItems());
    onShowToast('BROADCAST REMINDER REMOVED FROM TICKER');
  };

  const customPosts = items.filter((i) => i.customAdminPost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn font-mono text-xs">
      <div
        className="bg-[#0C0E14] border-2 border-[#D4AF37] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111319] border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#FFE08A] to-[#D4AF37] flex items-center justify-center text-black font-black">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                Live Fleet Ticker &amp; Broadcast Center
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  FIRESTORE PERSISTENT
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Configure real-time news, DOT violation alerts, NASA satellite feeds, and driver reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 max-h-[70vh]">
          {/* Post New Fleet Announcement Form */}
          <form onSubmit={handlePostReminder} className="bg-[#111319] p-4 rounded-xl border border-[#D4AF37]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                Broadcast Instant Reminder To All Drivers
              </span>
              <span className="text-[9px] text-[#D4AF37]">Runs continuously across fleet</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="e.g., Mandatory tire chain check at Elk Mountain or Fuel only at Love's Exit 142..."
                className="w-full px-3 py-2 rounded-lg bg-black border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37]"
              />

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase">Priority:</span>
                  {(['NORMAL', 'HIGH', 'CRITICAL_URGENT'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setNewReminderUrgency(urg)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                        newReminderUrgency === urg
                          ? urg === 'CRITICAL_URGENT'
                            ? 'bg-rose-600 text-white shadow'
                            : urg === 'HIGH'
                            ? 'bg-amber-500 text-black shadow'
                            : 'bg-emerald-600 text-white shadow'
                          : 'bg-black text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {urg.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newReminderText.trim()}
                  className="px-4 py-1.5 rounded bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold uppercase text-[10px] shadow active:scale-95 disabled:opacity-40 transition-all"
                >
                  Post To Fleet Ticker
                </button>
              </div>
            </div>
          </form>

          {/* 4 Specific Category Toggles (Trucking, Regular, DOT, NASA) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                1. Category Feeds (Firestore Synchronized)
              </span>
              <span className="text-[9px] text-[#FFE08A] font-mono">
                TOGGLE INDIVIDUAL CHANNELS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Category 1: Trucking News */}
              <div className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                prefs.showTruckingNews ? 'bg-[#111319] border-amber-500/60' : 'bg-[#08090C] border-slate-900 opacity-65'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white text-xs block">Trucking News</strong>
                      <span className="px-1 py-0.2 rounded text-[8px] bg-amber-950 text-amber-300 font-bold border border-amber-800">
                        DIESEL &amp; FREIGHT
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Diesel averages, spot rates, corridor status</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.showTruckingNews}
                  onChange={(e) => handleToggleCategory('showTruckingNews', 'Trucking News', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Category 2: Regular News */}
              <div className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                prefs.showGeneralNews ? 'bg-[#111319] border-blue-500/60' : 'bg-[#08090C] border-slate-900 opacity-65'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white text-xs block">Regular News</strong>
                      <span className="px-1 py-0.2 rounded text-[8px] bg-blue-950 text-blue-300 font-bold border border-blue-800">
                        NATIONAL
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Highway infrastructure, grants, economy</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.showGeneralNews}
                  onChange={(e) => handleToggleCategory('showGeneralNews', 'Regular News', e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Category 3: DOT Violation Alerts */}
              <div className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                prefs.showDotAlerts ? 'bg-[#111319] border-rose-500/60' : 'bg-[#08090C] border-slate-900 opacity-65'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white text-xs block">DOT Violations Watch</strong>
                      <span className="px-1 py-0.2 rounded text-[8px] bg-rose-950 text-rose-300 font-bold border border-rose-800">
                        FMCSA / CVSA
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Brake safety blitz, scale house checks, HOS</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.showDotAlerts}
                  onChange={(e) => handleToggleCategory('showDotAlerts', 'DOT Violations', e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Category 4: NASA Space Weather & Severe Corridor Events */}
              <div className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                prefs.showNasaWeatherAlerts ? 'bg-[#111319] border-purple-500/60' : 'bg-[#08090C] border-slate-900 opacity-65'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white text-xs block">NASA Space &amp; Weather</strong>
                      <span className="px-1 py-0.2 rounded text-[8px] bg-purple-950 text-purple-300 font-bold border border-purple-800">
                        API LIVE
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Solar flares, GPS telemetry drift, high winds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      onShowToast('PINGING NASA SATELLITE API...');
                      const count = await fleetTickerService.refreshNasaAlerts();
                      setItems(fleetTickerService.getAllRawItems());
                      onShowToast(`NASA API SYNC COMPLETE: ${count} ACTIVE SPACE & CORRIDOR ALERTS`);
                    }}
                    className="px-2 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-700/50 text-[9px] font-bold text-purple-300 hover:text-white transition-colors"
                    title="Force immediate refresh from NASA DONKI and EONET APIs"
                  >
                    SYNC
                  </button>
                  <input
                    type="checkbox"
                    checked={prefs.showNasaWeatherAlerts}
                    onChange={(e) => handleToggleCategory('showNasaWeatherAlerts', 'NASA Space & Weather', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Bonus Admin Directives Stream */}
              <div className={`p-3 rounded-xl border transition-colors flex items-center justify-between sm:col-span-2 ${
                prefs.showFleetReminders ? 'bg-[#111319] border-emerald-500/60' : 'bg-[#08090C] border-slate-900 opacity-65'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white text-xs block">Daily Fleet Directives &amp; Reminders</strong>
                      <span className="px-1 py-0.2 rounded text-[8px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                        ADMIN DISPATCH
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Instant driver instructions, cold-weather SOPs, and fleet notices</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.showFleetReminders}
                  onChange={(e) => handleToggleCategory('showFleetReminders', 'Fleet Directives', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Speed & Visual Theme Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            {/* Speed */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ticker Scroll Speed:</span>
              <div className="flex items-center gap-1.5">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSetSpeed(spd)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      prefs.tickerSpeed === spd
                        ? 'bg-[#D4AF37] text-black shadow'
                        : 'bg-black text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Color Scheme:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'gold', label: 'Obsidian Gold', color: 'border-[#D4AF37] text-[#D4AF37]' },
                  { id: 'amber', label: 'Caution Amber', color: 'border-amber-500 text-amber-400' },
                  { id: 'emerald', label: 'Clean Emerald', color: 'border-emerald-500 text-emerald-400' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleSetTheme(th.id as any)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                      prefs.theme === th.id ? `${th.color} bg-white/5 shadow` : 'border-slate-800 text-slate-400 bg-black'
                    }`}
                  >
                    {th.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Custom Admin Directives List */}
          {customPosts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Active Admin Directives ({customPosts.length})
              </span>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {customPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-2.5 rounded-lg bg-[#111319] border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 truncate">
                      <span className="text-white text-[11px] font-bold block truncate">{post.title}</span>
                      <span className="text-[9px] text-slate-400">{post.timestamp} · {post.urgency}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCustomItem(post.id)}
                      className="p-1 rounded bg-black text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove directive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save to Firestore & Apply */}
        <div className="bg-[#111319] border-t border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Active Streams: <strong className="text-emerald-400">{fleetTickerService.getItems().length} Items In Rotation</strong></span>
            {lastSavedTimestamp && (
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3" />
                Synced: {lastSavedTimestamp}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Explicit Save to Firestore Button */}
            <button
              type="button"
              disabled={isSavingToFirestore}
              onClick={handleSaveAllToFirestore}
              className="shadow-[0_0_15px_rgba(255,230,0,0.45)] flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#FFD700] border border-[#FFE600] text-black font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
              title="Save all category toggles directly to Firestore Database"
            >
              {isSavingToFirestore ? (
                <>
                  <div className="w-3 h-3 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Save to Firestore</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                handleSaveAllToFirestore();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold uppercase text-[10px] shadow active:scale-95 transition-all"
            >
              Save &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

