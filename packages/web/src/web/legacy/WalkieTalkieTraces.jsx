/**
 * WalkieTalkieTraces — rebuilt Aug 26, 2026.
 *
 * Removed fabricated content (was hardcoded in the original, preserved at
 * docs/launch/WalkieTalkieTraces.ORIGINAL.jsx.txt):
 *  1. Three fake broadcast messages from "Mike Chen" / "Sarah Johnson" /
 *     "Carlos Rodriguez" with invented locations and "2 min ago" timestamps.
 *     Now reads the real messages table through GET /api/chat, and the
 *     broadcast box actually POSTs to /api/chat.
 *  2. Three fake driver "traces" with invented HOS log counts (48/52/56),
 *     invented violation counts and hardcoded "Compliant" statuses. Now built
 *     from GET /api/fleet/drivers + GET /api/hos (real clocks + real violations).
 *  3. "Documents on File" lists with "✓ Verified" stamps — there is no
 *     per-driver document table, so this renders NOT TRACKED with a reason.
 *  4. The entire "Story Blogs" tab (two invented blog posts with fake upload
 *     filenames and a publish button that did nothing). No blogs table exists;
 *     the tab was deleted rather than restyled.
 *  5. Fleet dashboard tiles "47 Total Drivers / 46 Compliant / 1 Flagged /
 *     3 Violations" — all invented. Now computed from the rows actually
 *     returned by the API.
 *  6. The report button's alert() that claimed a report was "generated and
 *     ready to download". It now downloads a JSON file containing only values
 *     read from the API.
 *
 * Restyled from amber/green/red/slate to the gold-on-black brand palette.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Radio, FileText, BarChart3, MapPin, AlertTriangle, CheckCircle, Download, Send, RefreshCw, Clock } from 'lucide-react';

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const WARN = '#c96a4c';

const TABS = [
  { id: 'comms', label: 'Comms', icon: Radio },
  { id: 'traces', label: 'Driver Traces', icon: MapPin },
  { id: 'compliance', label: 'Fleet Compliance', icon: BarChart3 },
];

const mins = (secs) => (secs == null ? null : Math.round(secs / 60));
const hrs = (secs) => (secs == null ? '—' : `${Math.floor(secs / 3600)}h ${Math.round((secs % 3600) / 60)}m`);

function Missing({ label, reason }) {
  return (
    <div className="rounded border border-[#222] bg-[#0f0f0f] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#666]">{label}</p>
      <p className="font-[Oswald] text-sm text-[#8a8a8a]">MISSING / NOT TRACKED</p>
      <p className="mt-1 text-[11px] leading-snug text-[#666]">{reason}</p>
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const d = Math.max(0, Date.now() - t);
  const m = Math.round(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hr ago`;
  return `${Math.round(h / 24)} days ago`;
}

export default function WalkieTalkieTraces() {
  const [activeTab, setActiveTab] = useState('comms');

  const [messages, setMessages] = useState([]);
  const [msgState, setMsgState] = useState('loading'); // loading | ok | error
  const [msgError, setMsgError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const [drivers, setDrivers] = useState([]);
  const [hosFleet, setHosFleet] = useState([]);
  const [fleetState, setFleetState] = useState('loading');
  const [fleetError, setFleetError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadMessages = useCallback(async () => {
    setMsgState('loading');
    try {
      const r = await fetch('/api/chat');
      if (!r.ok) throw new Error(`GET /api/chat returned ${r.status}`);
      const j = await r.json();
      setMessages(Array.isArray(j.messages) ? j.messages : []);
      setMsgState('ok');
    } catch (e) {
      setMsgError(String(e.message || e));
      setMsgState('error');
    }
  }, []);

  const loadFleet = useCallback(async () => {
    setFleetState('loading');
    try {
      const [dr, hr] = await Promise.all([fetch('/api/fleet/drivers'), fetch('/api/hos')]);
      if (!dr.ok) throw new Error(`GET /api/fleet/drivers returned ${dr.status}`);
      if (!hr.ok) throw new Error(`GET /api/hos returned ${hr.status}`);
      const dj = await dr.json();
      const hj = await hr.json();
      setDrivers(Array.isArray(dj.drivers) ? dj.drivers : []);
      setHosFleet(Array.isArray(hj.fleet) ? hj.fleet : []);
      setFleetState('ok');
    } catch (e) {
      setFleetError(String(e.message || e));
      setFleetState('error');
    }
  }, []);

  useEffect(() => { loadMessages(); loadFleet(); }, [loadMessages, loadFleet]);

  const traces = useMemo(() => {
    const byId = new Map(hosFleet.map((f) => [f.driverId, f]));
    return drivers.map((d) => {
      const h = byId.get(d.id) || null;
      const v = h?.violations ?? [];
      return {
        id: d.id,
        driver: d.name,
        truck: d.truckNumber,
        status: d.status,
        homeBase: d.homeBase,
        lastSeen: d.lastSeen,
        clocks: h?.clocks ?? null,
        violations: v,
        danger: v.filter((x) => x.level === 'danger').length,
        warning: v.filter((x) => x.level === 'warning').length,
      };
    });
  }, [drivers, hosFleet]);

  const totals = useMemo(() => {
    const withHos = traces.filter((t) => t.clocks);
    return {
      drivers: traces.length,
      hosTracked: withHos.length,
      clean: withHos.filter((t) => t.violations.length === 0).length,
      flagged: withHos.filter((t) => t.warning > 0 && t.danger === 0).length,
      violating: withHos.filter((t) => t.danger > 0).length,
      openViolations: traces.reduce((n, t) => n + t.violations.length, 0),
    };
  }, [traces]);

  const send = async () => {
    const body = messageInput.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fromId: 'dispatch', fromName: 'Dispatch', toId: null, body }),
      });
      if (!r.ok) throw new Error(`POST /api/chat returned ${r.status}`);
      setMessageInput('');
      await loadMessages();
    } catch (e) {
      setMsgError(String(e.message || e));
    } finally {
      setSending(false);
    }
  };

  const downloadTrace = (t) => {
    const payload = {
      generatedAt: new Date().toISOString(),
      source: 'GET /api/fleet/drivers + GET /api/hos',
      driver: { id: t.id, name: t.driver, truck: t.truck, status: t.status, homeBase: t.homeBase, lastSeen: t.lastSeen },
      hosClocks: t.clocks,
      violations: t.violations,
      documentsOnFile: null,
      documentsNote: 'Not tracked — no per-driver document table exists yet.',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-${t.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header band */}
      <div className="border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-[#C9A84C]/40 px-2 py-1">
                <Radio size={13} style={{ color: GOLD }} />
                <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                  Dispatch Channel
                </span>
              </div>
              <h1 className="font-[Bebas_Neue] text-5xl leading-none tracking-wide md:text-6xl">
                WALKIE TALKIE <span style={{ color: GOLD_BRIGHT }}>TRACES</span>
              </h1>
              <p className="mt-2 max-w-2xl font-[Inter] text-sm text-[#8a8a8a]">
                Fleet-wide broadcast log and per-driver compliance trace. Every number on this page is read
                live from the database — nothing is estimated or filled in.
              </p>
            </div>
            <button
              onClick={() => { loadMessages(); loadFleet(); }}
              className="flex items-center gap-2 rounded-sm border border-[#C9A84C]/50 px-4 py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-1 border-t border-[#222] pt-4">
            {TABS.map((t) => {
              const on = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] transition ${
                    on ? 'bg-[#C9A84C] text-black' : 'border border-[#222] bg-[#161616] text-[#8a8a8a] hover:text-white'
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* COMMS */}
        {activeTab === 'comms' && (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="mb-4 font-[Oswald] text-sm uppercase tracking-[0.24em] text-[#8a8a8a]">
                Broadcast log — messages table
              </h2>

              {msgState === 'loading' && (
                <div className="rounded border border-[#222] bg-[#161616] p-8 text-center font-[JetBrains_Mono] text-xs text-[#666]">
                  Loading messages…
                </div>
              )}

              {msgState === 'error' && (
                <div className="rounded border p-4" style={{ borderColor: WARN }}>
                  <p className="font-[Oswald] text-sm uppercase tracking-wider" style={{ color: WARN }}>Messages unavailable</p>
                  <p className="mt-1 font-[JetBrains_Mono] text-xs text-[#8a8a8a]">{msgError}</p>
                </div>
              )}

              {msgState === 'ok' && messages.length === 0 && (
                <div className="rounded border border-[#222] bg-[#161616] p-8 text-center">
                  <p className="font-[Oswald] text-sm uppercase tracking-wider text-[#8a8a8a]">No messages yet</p>
                  <p className="mt-1 text-xs text-[#666]">The channel is empty. Send the first broadcast below.</p>
                </div>
              )}

              {msgState === 'ok' && messages.length > 0 && (
                <div className="space-y-2">
                  {[...messages].reverse().map((m) => (
                    <div key={m.id} className="border-l-2 bg-[#161616] px-4 py-3" style={{ borderColor: m.fromId === 'dispatch' ? GOLD : '#222' }}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-[Oswald] text-sm uppercase tracking-wider text-white">{m.fromName}</span>
                        <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">
                          {timeAgo(m.createdAt)} · {m.toId ? `→ ${m.toId}` : 'ALL DRIVERS'}
                        </span>
                      </div>
                      <p className="mt-1 font-[Inter] text-sm text-[#d4d4d4]">{m.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 border border-[#222] bg-[#161616] p-4">
                <label className="mb-2 block font-[Oswald] text-[11px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                  Broadcast to all drivers
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                    placeholder="Type a message…"
                    className="flex-1 border border-[#222] bg-[#0f0f0f] px-3 py-2 font-[Inter] text-sm text-white outline-none transition placeholder:text-[#666] focus:border-[#C9A84C]"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !messageInput.trim()}
                    className="flex items-center gap-2 bg-[#C9A84C] px-5 py-2 font-[Oswald] text-xs uppercase tracking-[0.2em] text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending' : 'Send'}
                  </button>
                </div>
                <p className="mt-2 font-[JetBrains_Mono] text-[10px] text-[#666]">
                  Writes a real row to the messages table via POST /api/chat. No SMS is sent — the A2P campaign is not filed yet.
                </p>
              </div>
            </div>

            <aside className="space-y-3">
              <h2 className="font-[Oswald] text-sm uppercase tracking-[0.24em] text-[#8a8a8a]">Channel facts</h2>
              <div className="border border-[#222] bg-[#161616] p-4">
                <p className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">Messages stored</p>
                <p className="font-[Bebas_Neue] text-4xl" style={{ color: GOLD_BRIGHT }}>
                  {msgState === 'ok' ? messages.length : '—'}
                </p>
              </div>
              <div className="border border-[#222] bg-[#161616] p-4">
                <p className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">Last activity</p>
                <p className="font-[Oswald] text-lg text-white">
                  {msgState === 'ok' && messages.length ? timeAgo(messages[messages.length - 1].createdAt) : '—'}
                </p>
              </div>
              <Missing
                label="Push-to-talk voice"
                reason="Not built. Live audio needs a WebRTC/SIP channel and a carrier-attached number; the A2P campaign is not filed."
              />
            </aside>
          </div>
        )}

        {/* TRACES */}
        {activeTab === 'traces' && (
          <div>
            <h2 className="mb-4 font-[Oswald] text-sm uppercase tracking-[0.24em] text-[#8a8a8a]">
              Driver traces — drivers table joined to live HOS clocks
            </h2>

            {fleetState === 'loading' && (
              <div className="rounded border border-[#222] bg-[#161616] p-8 text-center font-[JetBrains_Mono] text-xs text-[#666]">
                Loading fleet…
              </div>
            )}

            {fleetState === 'error' && (
              <div className="rounded border p-4" style={{ borderColor: WARN }}>
                <p className="font-[Oswald] text-sm uppercase tracking-wider" style={{ color: WARN }}>Fleet data unavailable</p>
                <p className="mt-1 font-[JetBrains_Mono] text-xs text-[#8a8a8a]">{fleetError}</p>
              </div>
            )}

            {fleetState === 'ok' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {traces.map((t) => (
                  <div key={t.id} className="border border-[#222] bg-[#161616] p-4 transition hover:border-[#C9A84C]/60">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-[Oswald] text-lg uppercase tracking-wide text-white">{t.driver}</h3>
                        <p className="font-[JetBrains_Mono] text-[11px] text-[#666]">
                          {t.truck || 'no unit'} · {t.homeBase || 'no home base'}
                        </p>
                      </div>
                      {t.danger > 0 ? (
                        <AlertTriangle size={18} style={{ color: WARN }} />
                      ) : t.violations.length > 0 ? (
                        <AlertTriangle size={18} style={{ color: GOLD }} />
                      ) : t.clocks ? (
                        <CheckCircle size={18} style={{ color: GOLD_BRIGHT }} />
                      ) : null}
                    </div>

                    {t.clocks ? (
                      <div className="mb-3 space-y-1 font-[JetBrains_Mono] text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#666]">Driving used</span>
                          <span className="text-white">{hrs(t.clocks.drivingUsed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">Driving left</span>
                          <span style={{ color: t.clocks.drivingRemaining === 0 ? WARN : GOLD_BRIGHT }}>
                            {mins(t.clocks.drivingRemaining)} min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">14-hr window left</span>
                          <span style={{ color: t.clocks.onDutyWindowRemaining === 0 ? WARN : GOLD_BRIGHT }}>
                            {mins(t.clocks.onDutyWindowRemaining)} min
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <Missing label="HOS clocks" reason="This driver has no HOS log rows, so no clock can be computed." />
                      </div>
                    )}

                    <div className="mb-3 flex items-center justify-between border-t border-[#222] pt-2 font-[JetBrains_Mono] text-[11px]">
                      <span className="text-[#666]">Open violations</span>
                      <span style={{ color: t.violations.length ? WARN : GOLD_BRIGHT }}>{t.violations.length}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelected(t)}
                        className="flex-1 border border-[#C9A84C]/50 py-2 font-[Oswald] text-[11px] uppercase tracking-[0.18em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
                      >
                        Full record
                      </button>
                      <button
                        onClick={() => downloadTrace(t)}
                        title="Download this trace as JSON"
                        className="border border-[#222] px-3 py-2 text-[#8a8a8a] transition hover:border-[#C9A84C]/50 hover:text-[#C9A84C]"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div>
            <h2 className="mb-4 font-[Oswald] text-sm uppercase tracking-[0.24em] text-[#8a8a8a]">
              Fleet compliance — counted from returned rows
            </h2>

            {fleetState !== 'ok' ? (
              <div className="rounded border border-[#222] bg-[#161616] p-8 text-center font-[JetBrains_Mono] text-xs text-[#666]">
                {fleetState === 'loading' ? 'Loading fleet…' : fleetError}
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    ['Drivers on file', totals.drivers],
                    ['With HOS data', totals.hosTracked],
                    ['No violations', totals.clean],
                    ['Warnings only', totals.flagged],
                    ['Hard violations', totals.violating],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-[#222] bg-[#161616] p-4">
                      <p className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#666]">{label}</p>
                      <p className="font-[Bebas_Neue] text-4xl" style={{ color: GOLD_BRIGHT }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="border border-[#222] bg-[#161616] p-5">
                    <h3 className="mb-3 font-[Oswald] text-sm uppercase tracking-[0.2em] text-white">Open violations</h3>
                    {totals.openViolations === 0 ? (
                      <p className="font-[Inter] text-sm text-[#8a8a8a]">
                        No HOS violations across {totals.hosTracked} tracked driver(s).
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {traces.filter((t) => t.violations.length).map((t) => (
                          <div key={t.id} className="border-l-2 pl-3" style={{ borderColor: t.danger ? WARN : GOLD }}>
                            <p className="font-[Oswald] text-sm uppercase tracking-wide text-white">
                              {t.driver} <span className="text-[#666]">{t.truck}</span>
                            </p>
                            {t.violations.map((v, i) => (
                              <p key={i} className="font-[Inter] text-xs" style={{ color: v.level === 'danger' ? WARN : '#8a8a8a' }}>
                                {v.msg}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Missing
                      label="Document files per driver"
                      reason="No per-driver document table exists. HR documents are keyed to HR people records, not to driver records, so nothing can be counted here."
                    />
                    <Missing
                      label="DOT audit certification"
                      reason="TruckWithEase is not a registered ELD provider, so no audit-ready certification can be claimed."
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4" onClick={() => setSelected(null)}>
          <div
            className="mx-auto my-8 max-w-2xl border border-[#C9A84C]/60 bg-[#111] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between border-b border-[#222] pb-4">
              <div>
                <h3 className="font-[Bebas_Neue] text-3xl tracking-wide">{selected.driver}</h3>
                <p className="font-[JetBrains_Mono] text-[11px] text-[#666]">
                  {selected.id} · {selected.truck || 'no unit'} · status {selected.status}
                </p>
              </div>
              <span className="flex items-center gap-1 font-[JetBrains_Mono] text-[10px] text-[#666]">
                <Clock size={12} /> seen {timeAgo(selected.lastSeen)}
              </span>
            </div>

            {selected.clocks ? (
              <div className="mb-5 grid grid-cols-2 gap-3 font-[JetBrains_Mono] text-xs">
                {[
                  ['Driving used', hrs(selected.clocks.drivingUsed)],
                  ['Driving remaining', `${mins(selected.clocks.drivingRemaining)} min`],
                  ['On-duty window used', hrs(selected.clocks.onDutyWindowUsed)],
                  ['On-duty remaining', `${mins(selected.clocks.onDutyWindowRemaining)} min`],
                ].map(([k, v]) => (
                  <div key={k} className="border border-[#222] bg-[#161616] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#666]">{k}</p>
                    <p className="text-white">{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-5">
                <Missing label="HOS clocks" reason="No HOS log rows exist for this driver." />
              </div>
            )}

            <div className="mb-5">
              <p className="mb-2 font-[Oswald] text-[11px] uppercase tracking-[0.2em] text-[#8a8a8a]">Violations</p>
              {selected.violations.length === 0 ? (
                <p className="font-[Inter] text-sm text-[#8a8a8a]">None returned by the HOS engine.</p>
              ) : (
                selected.violations.map((v, i) => (
                  <p key={i} className="font-[Inter] text-sm" style={{ color: v.level === 'danger' ? WARN : GOLD }}>
                    [{v.level}] {v.msg}
                  </p>
                ))
              )}
            </div>

            <div className="mb-5">
              <Missing
                label="Documents on file"
                reason="No per-driver document table exists yet, so no medical card, licence or insurance record can be listed or verified."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadTrace(selected)}
                className="flex flex-1 items-center justify-center gap-2 bg-[#C9A84C] py-3 font-[Oswald] text-xs uppercase tracking-[0.2em] text-black"
              >
                <FileText size={14} /> Download trace JSON
              </button>
              <button
                onClick={() => setSelected(null)}
                className="border border-[#222] px-5 py-3 font-[Oswald] text-xs uppercase tracking-[0.2em] text-[#8a8a8a] transition hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
