/**
 * RevolutionPage — routes: /revolution, /the-moment
 *
 * READS (live, browser fetch, no credentials in the client):
 *   GET /api/captions/status          — Gemini transcribe/translate capability, model ids,
 *                                       supported locales, byte/char limits, provider notes.
 *   GET /api/accessibility            — the accessibility option catalog: needs, sign languages,
 *                                       haptic devices, urgency levels, request kinds, the 7
 *                                       coded haptic patterns (with real ms sequences), and each
 *                                       media provider's own live/not-live status.
 *   GET /api/accessibility/requests   — real recorded accessibility requests (count,
 *                                       fulfilledCount, per-request provider + note).
 *
 * COMPUTES LOCALLY:
 *   Nothing. Every number on this page comes out of one of the three responses above.
 *   Haptic pattern durations are rendered from the server's own `sequence` arrays in ms.
 *
 * REMOVED IN THIS REWRITE (all fabricated, none of it was ever measured or stored):
 *   - "47.2K Deaf Drivers Online Now" and "47.2K deaf drivers earning equal pay" and
 *     "You made 47,200 deaf drivers equal" — TruckWithEase has 5 seeded drivers and no
 *     recorded accessibility need for any of them. This number was invented.
 *   - "99.8% Caption Accuracy" (printed twice) — nothing measures caption accuracy. Gemini
 *     returns no ASR confidence score at all, so no accuracy figure can exist here.
 *   - "34% fewer accidents industry-wide" — an invented industry-wide outcome claim.
 *   - "$8K+ Annual income gain per driver" / "Owner-ops using quantum pricing earn $8K-$25K
 *     more per year" / "Fleets cut insurance by 34%" / "Medical costs drop 23%" /
 *     "Immediate ROI on day one" — invented financial outcomes.
 *   - "7 Sign Languages" presented as shipped capability, "AI Sign Language Generator",
 *     "generates professional ASL video in 500ms", "95% accuracy that keeps getting better".
 *     Sign-language video is NOT implemented; /api/captions/status reports
 *     signLanguageVideo: false and the accessibility router says no sign-language video
 *     source exists. The 7 codes (ASL/BSL/LSF/DGS/ISL/AUSLAN/NZSL) are request labels only.
 *   - "Every word appears on screen in 50 milliseconds", "50ms sync across 5 devices",
 *     "128-dimensional neural model predicts accident risk 24 hours before it happens",
 *     "128D neural vector space", "smart segmentation learns each driver's speech patterns",
 *     "87% fewer taps per task", "24+ voice commands", "learns driver preference and adapts",
 *     "user-rated interpretations improve the model continuously" — no such model, no
 *     latency budget, no learning loop, and no tap measurement exists in this codebase.
 *   - "The Five Technologies Nobody Else Built", "Why This Breaks the Internet Day One",
 *     "Samsara and Motive track fleets... 24+ months of development minimum for competitors.
 *     By then you own the market" — competitor comparison and self-scoring, both barred.
 *   - "This story goes viral across 10 channels... LinkedIn explodes... VCs line up" and the
 *     "David vs Goliath / Morning TV / TED talk" block — marketing fiction on a driver page.
 *   - A `setInterval` incrementing a `counter` by `Math.random() * 50` every second. The
 *     counter was never even rendered; it existed only to look live.
 *   - Three dead buttons ("Watch the Demo", "See How We Did It", "Launch to the World") that
 *     had no onClick and went nowhere.
 *   - The off-brand palette: cyan #06b6d4/#0891b2, purple #a855f7, amber #f59e0b, green
 *     #10b981, red #ef4444, navy #060a10/#0d1117, slate #9ca3af/#374151, and the
 *     cyan-to-amber-to-purple gradient headline. Emoji icons (they render as empty boxes).
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   - It does not claim sign-language video works. It does not.
 *   - It does not claim a caption accuracy, confidence, or latency figure.
 *   - It does not claim any driver outcome: no accident reduction, no income gain, no
 *     insurance or medical saving, no employment outcome.
 *   - It does not claim a user count of any kind.
 *   - It does not claim a haptic message was felt. The server records that an event was
 *     sent; `delivered` is only true once a device confirms it.
 *   - It does not compare TruckWithEase to any competitor.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Accessibility, Captions, Vibrate, Hand, AlertTriangle, Loader2,
  CheckCircle2, XCircle, Languages, Inbox,
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#ffffff',
  muted: '#8a8a8a',
  dim: '#666666',
};
const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";

async function getJSON(url) {
  const r = await fetch(url);
  let body = null;
  try { body = await r.json(); } catch { /* non-JSON error body */ }
  if (!r.ok) throw new Error((body && body.error) || `HTTP ${r.status} ${r.statusText}`);
  return body;
}

function Panel({ title, note, right, icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
        borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap',
      }}>
        {icon}
        <div style={{
          fontFamily: FH, fontSize: 13, fontWeight: 600, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: GOLD,
        }}>{title}</div>
        <div style={{ marginLeft: 'auto' }}>{right}</div>
      </div>
      {note ? (
        <div style={{
          padding: '10px 18px', borderBottom: `1px solid ${C.border}`,
          fontFamily: FM, fontSize: 11, color: C.dim,
        }}>{note}</div>
      ) : null}
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{
      border: `1px dashed #333`, borderRadius: 4, padding: '16px 18px',
      background: 'rgba(201,106,76,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={15} color={WARN} />
        <span style={{
          fontFamily: FH, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: WARN,
        }}>Missing / not tracked</span>
      </div>
      <div style={{ fontFamily: FH, fontSize: 15, color: C.white, marginBottom: 6, letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '14px 16px', background: C.black }}>
      <div style={{ fontFamily: FD, fontSize: 34, lineHeight: 1, color: tone || GOLDB }}>{value}</div>
      <div style={{
        fontFamily: FH, fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: C.dim, marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 16,
      padding: '9px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: FB, fontSize: 13, color: C.muted }}>{k}</span>
      <span style={{
        fontFamily: mono ? FM : FB, fontSize: 13,
        color: tone || C.white, textAlign: 'right',
      }}>{v}</span>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div style={{
      border: `1px solid ${WARN}`, borderRadius: 4, padding: '12px 14px',
      fontFamily: FM, fontSize: 12, color: WARN, background: 'rgba(201,106,76,0.06)',
      wordBreak: 'break-word',
    }}>{msg}</div>
  );
}

function Spin() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FM, fontSize: 12, color: C.dim }}>
      <Loader2 size={14} color={GOLD} className="twe-spin" /> loading
    </span>
  );
}

function YesNo({ on, yes, no }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FM, fontSize: 13, color: on ? GOLDB : WARN }}>
      {on ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {on ? (yes || 'yes') : (no || 'no')}
    </span>
  );
}

export default function RevolutionPage() {
  const alive = useRef(false);
  const [cap, setCap] = useState({ state: 'loading', data: null, err: null });
  const [opts, setOpts] = useState({ state: 'loading', data: null, err: null });
  const [reqs, setReqs] = useState({ state: 'loading', data: null, err: null });

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding all results.
    alive.current = true;

    const load = async (url, setter) => {
      try {
        const d = await getJSON(url);
        if (alive.current) setter({ state: 'ok', data: d, err: null });
      } catch (e) {
        if (alive.current) setter({ state: 'error', data: null, err: String(e.message || e) });
      }
    };

    load('/api/captions/status', setCap);
    load('/api/accessibility', setOpts);
    load('/api/accessibility/requests', setReqs);

    return () => { alive.current = false; };
  }, []);

  const capData = cap.data || {};
  const capCaps = capData.capabilities || {};
  const langs = capData.languages || {};
  const optData = opts.data || {};
  const providers = optData.providers || {};
  const patterns = optData.hapticPatterns || {};
  const reqData = reqs.data || {};
  const reqList = Array.isArray(reqData.requests) ? reqData.requests : [];

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, fontFamily: FB }}>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
        padding: '38px 24px 30px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: `1px solid ${C.border}`, borderRadius: 999,
            padding: '5px 14px', marginBottom: 16,
          }}>
            <Accessibility size={13} color={GOLD} />
            <span style={{
              fontFamily: FH, fontSize: 10, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: GOLD,
            }}>Accessibility status</span>
          </div>

          <h1 style={{
            fontFamily: FD, fontSize: 'clamp(34px, 7vw, 52px)', lineHeight: 1.02,
            margin: '0 0 14px', letterSpacing: '0.01em',
          }}>
            WHAT IS ACTUALLY <span style={{ color: GOLDB }}>BUILT</span>
          </h1>

          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
            Transcription and translation are live through Gemini. <strong style={{ color: C.white }}>Sign-language
            video is not built</strong> — no model here produces real ASL, BSL or LSF, and the server says so
            itself. Haptic patterns are coded and recorded, but this page will never tell you a driver felt one.
            Every figure below is read live from the API on page load. There are no accuracy percentages,
            no user counts and no outcome claims on this page, because nothing measures them.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 70px' }}>

        {/* Captions / translation */}
        <Panel
          title="Captions and translation"
          note="GET /api/captions/status"
          icon={<Captions size={15} color={GOLD} />}
          right={cap.state === 'loading' ? <Spin /> : null}
        >
          {cap.state === 'error' ? <Err msg={cap.err} /> : null}
          {cap.state === 'loading' ? <div style={{ fontFamily: FM, fontSize: 12, color: C.dim }}>reading provider status…</div> : null}
          {cap.state === 'ok' ? (
            <>
              <div style={{
                display: 'grid', gap: 12, marginBottom: 18,
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              }}>
                <Stat value={capData.provider || '—'} label="Provider" />
                <Stat value={Object.keys(langs).length || '—'} label="Locales shipped" />
                <Stat
                  value={capData.limits ? `${Math.round(capData.limits.maxAudioBytes / 1048576)} MB` : '—'}
                  label="Max audio per request"
                />
                <Stat
                  value={capData.limits ? capData.limits.maxTextChars.toLocaleString() : '—'}
                  label="Max chars per translation"
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <Row k="Provider key present server-side" v={<YesNo on={!!capData.keyPresent} />} />
                <Row k="Transcribe audio" v={<YesNo on={!!capCaps.transcribeAudio} yes="live" no="not built" />} />
                <Row k="Translate text" v={<YesNo on={!!capCaps.translateText} yes="live" no="not built" />} />
                <Row k="Speak translation (TTS)" v={<YesNo on={!!capCaps.speakTranslation} yes="live" no="not built" />} />
                <Row k="Sign-language video" v={<YesNo on={!!capCaps.signLanguageVideo} yes="live" no="not built" />} />
                <Row k="Transcribe model" v={(capData.models && capData.models.transcribe) || '—'} mono />
                <Row k="Translate model" v={(capData.models && capData.models.translate) || '—'} mono />
              </div>

              {Object.keys(langs).length ? (
                <div style={{ marginBottom: 18 }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>Translation targets</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(langs).map(([code, name]) => (
                      <span key={code} style={{
                        border: `1px solid ${C.border}`, borderRadius: 3,
                        padding: '5px 10px', fontFamily: FM, fontSize: 11, color: C.muted,
                      }}>
                        <span style={{ color: GOLD }}>{code}</span> · {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(capData.notes) && capData.notes.length ? (
                <div style={{
                  border: `1px solid ${C.border}`, borderRadius: 4,
                  padding: '14px 16px', background: C.black,
                }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>Provider notes, verbatim from the server</div>
                  {capData.notes.map((n, i) => (
                    <div key={i} style={{
                      fontFamily: FB, fontSize: 13, color: C.muted,
                      lineHeight: 1.7, marginBottom: 6,
                    }}>— {n}</div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Sign language */}
        <Panel
          title="Sign language"
          note="GET /api/accessibility  ·  GET /api/captions/status"
          icon={<Hand size={15} color={GOLD} />}
        >
          <Missing
            label="No sign-language video exists in this platform"
            reason={
              'The old version of this page claimed an "AI Sign Language Generator" that produced ' +
              'professional ASL video in 500 ms across 7 languages at 95% accuracy. None of that was ' +
              'built and no model available here produces real signed language. /api/captions/status ' +
              'reports signLanguageVideo: false, and the accessibility router\'s own note says no ' +
              'sign-language video source exists — requests are queued only so we can see what drivers ' +
              'actually ask for. The seven codes below are request labels a driver can pick, not shipped ' +
              'output. The claim that this made 47,200 deaf drivers equal was invented and has been deleted.'
            }
          />
          {opts.state === 'ok' && Array.isArray(optData.signLanguages) ? (
            <div style={{ marginTop: 16 }}>
              <div style={{
                fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: C.dim, marginBottom: 10,
              }}>Request labels accepted (queued, not fulfilled)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {optData.signLanguages.map((s) => (
                  <span key={s} style={{
                    border: `1px solid ${C.border}`, borderRadius: 3,
                    padding: '5px 10px', fontFamily: FM, fontSize: 11, color: C.muted,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          ) : null}
        </Panel>

        {/* Haptic patterns */}
        <Panel
          title="Haptic patterns"
          note="GET /api/accessibility → hapticPatterns"
          icon={<Vibrate size={15} color={GOLD} />}
          right={opts.state === 'loading' ? <Spin /> : null}
        >
          {opts.state === 'error' ? <Err msg={opts.err} /> : null}
          {opts.state === 'ok' ? (
            <>
              <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                These are the patterns coded on the server, with their real vibration sequences in
                milliseconds. The server records that an event was sent; whether the phone or watch
                actually buzzed depends on the device, and <strong style={{ color: C.white }}>delivered is only
                true once a client confirms it</strong>. There is no "50 ms sync across 5 devices" figure —
                nothing measures device sync latency.
              </div>

              {Object.entries(patterns).map(([key, p]) => (
                <div key={key} style={{
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                  background: C.black, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 7 }}>
                    <span style={{ fontFamily: FM, fontSize: 12, color: GOLDB }}>{key}</span>
                    <span style={{
                      border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px',
                      fontFamily: FH, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: p.urgency === 'critical' ? WARN : C.dim,
                    }}>{p.urgency}</span>
                  </div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.white, marginBottom: 8 }}>{p.meaning}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    {(p.sequence || []).map((ms, i) => (
                      <span key={i} style={{
                        fontFamily: FM, fontSize: 10,
                        color: i % 2 === 0 ? GOLD : C.dim,
                        border: `1px solid ${C.border}`, borderRadius: 2, padding: '2px 6px',
                      }}>{i % 2 === 0 ? `buzz ${ms}ms` : `gap ${ms}ms`}</span>
                    ))}
                  </div>
                </div>
              ))}

              {Array.isArray(optData.hapticDevices) ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>Device targets the API accepts</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {optData.hapticDevices.map((d) => (
                      <span key={d} style={{
                        border: `1px solid ${C.border}`, borderRadius: 3,
                        padding: '5px 10px', fontFamily: FM, fontSize: 11, color: C.muted,
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Provider truth table */}
        <Panel
          title="Provider status, per request kind"
          note="GET /api/accessibility → providers"
          icon={<Languages size={15} color={GOLD} />}
        >
          {opts.state === 'error' ? <Err msg={opts.err} /> : null}
          {opts.state === 'loading' ? <Spin /> : null}
          {opts.state === 'ok' ? (
            <>
              {Object.entries(providers).map(([kind, p]) => (
                <div key={kind} style={{
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                  background: C.black, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FM, fontSize: 12, color: GOLDB }}>{kind}</span>
                    <YesNo on={!!p.live} yes="live" no="not connected" />
                    <span style={{ fontFamily: FM, fontSize: 11, color: C.dim }}>
                      provider: {p.provider === null ? 'null' : String(p.provider)}
                    </span>
                  </div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{p.note}</div>
                </div>
              ))}
              <div style={{
                border: `1px dashed #333`, borderRadius: 4, padding: '13px 15px',
                marginTop: 4, fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7,
              }}>
                Note the disagreement, shown here rather than hidden: the accessibility router reports
                caption and translation as <span style={{ fontFamily: FM, color: WARN }}>live: false</span> because
                it has no provider wired into its own queue, while <span style={{ fontFamily: FM, color: GOLDB }}>/api/captions/status</span>
                {' '}reports Gemini transcription and translation as live. Both are accurate about their own
                router. Accessibility requests filed through the queue are not auto-transcribed; the captions
                endpoint transcribes on demand. Wiring the queue to the captions service is open work.
              </div>
            </>
          ) : null}
        </Panel>

        {/* Recorded requests */}
        <Panel
          title="Recorded accessibility requests"
          note="GET /api/accessibility/requests"
          icon={<Inbox size={15} color={GOLD} />}
          right={reqs.state === 'loading' ? <Spin /> : null}
        >
          {reqs.state === 'error' ? <Err msg={reqs.err} /> : null}
          {reqs.state === 'ok' ? (
            <>
              <div style={{
                display: 'grid', gap: 12, marginBottom: 18,
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              }}>
                <Stat value={reqData.count ?? '—'} label="Requests recorded" />
                <Stat value={reqData.fulfilledCount ?? '—'} label="Fulfilled" />
                <Stat value={reqList.length} label="Rows returned" />
              </div>

              {reqList.length === 0 ? (
                <Missing
                  label="No accessibility requests recorded yet"
                  reason="Nothing has been filed. This panel stays empty rather than showing a count."
                />
              ) : (
                reqList.map((r) => (
                  <div key={r.id} style={{
                    border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                    background: C.black, marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontFamily: FM, fontSize: 11, color: C.dim }}>{r.id}</span>
                      <span style={{
                        border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px',
                        fontFamily: FH, fontSize: 9, letterSpacing: '0.18em',
                        textTransform: 'uppercase', color: GOLD,
                      }}>{r.kind}</span>
                      <YesNo on={!!r.fulfilled} yes="fulfilled" no="queued" />
                    </div>
                    <Row k="Driver" v={r.driverId || '—'} mono />
                    <Row k="Direction" v={`${r.sourceLanguage || '—'} → ${r.targetLanguage || '—'}`} mono />
                    {r.sourceText ? <Row k="Source" v={r.sourceText} /> : null}
                    {r.resultText ? <Row k="Result" v={r.resultText} tone={GOLDB} /> : null}
                    <Row k="Result source" v={r.resultSource || '—'} mono />
                    <Row k="Provider" v={r.provider || '—'} mono />
                    <Row k="Created" v={r.createdAt || '—'} mono />
                    {r.note ? (
                      <div style={{
                        fontFamily: FB, fontSize: 12, color: C.dim,
                        lineHeight: 1.7, marginTop: 9,
                      }}>{r.note}</div>
                    ) : null}
                  </div>
                ))
              )}

              {reqData.note ? (
                <div style={{ fontFamily: FB, fontSize: 12, color: C.dim, lineHeight: 1.7, marginTop: 12 }}>
                  Server note: {reqData.note}
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Needs catalog */}
        <Panel
          title="Accessibility needs a driver can declare"
          note="GET /api/accessibility → needs, requestKinds, urgency"
          icon={<Accessibility size={15} color={GOLD} />}
        >
          {opts.state === 'ok' ? (
            <>
              {[
                ['Needs', optData.needs],
                ['Request kinds', optData.requestKinds],
                ['Urgency levels', optData.urgency],
              ].map(([label, list]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>{label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(list || []).map((x) => (
                      <span key={x} style={{
                        border: `1px solid ${C.border}`, borderRadius: 3,
                        padding: '5px 10px', fontFamily: FM, fontSize: 11, color: C.muted,
                      }}>{x}</span>
                    ))}
                  </div>
                </div>
              ))}
              <Missing
                label="How many drivers have declared an accessibility need: not tracked"
                reason="No driver record on this platform carries a declared accessibility need, so there is no population figure. The previous version of this page printed 47.2K deaf drivers online and 47.2K earning equal pay. Both were invented and are gone."
              />
            </>
          ) : opts.state === 'loading' ? <Spin /> : null}
        </Panel>

        {/* What this does not cover */}
        <Panel title="What this page does not cover" icon={<AlertTriangle size={15} color={WARN} />}>
          <ol style={{
            margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13,
            color: C.muted, lineHeight: 1.9,
          }}>
            <li>
              <strong style={{ color: C.white }}>No caption accuracy figure.</strong> Gemini returns no
              ASR confidence score, so nothing here can report one. The old 99.8% was invented.
            </li>
            <li>
              <strong style={{ color: C.white }}>No sign-language video.</strong> Requests are queued
              and never fulfilled. The 500 ms ASL generator and its 95% accuracy did not exist.
            </li>
            <li>
              <strong style={{ color: C.white }}>No driver count.</strong> 47,200 deaf drivers was a
              fabricated number. Five seeded drivers exist and none has a declared accessibility need.
            </li>
            <li>
              <strong style={{ color: C.white }}>No outcome claims.</strong> The 34% accident reduction,
              23% medical cost drop, 34% insurance saving and $8K–$25K income gain were all invented.
              Nothing on this platform measures an accident, a premium or a paycheck outcome.
            </li>
            <li>
              <strong style={{ color: C.white }}>No haptic delivery confirmation shown here.</strong> The
              server records sent events; delivered flips true only when a device confirms. This page
              lists the coded patterns, not proof any driver felt one.
            </li>
            <li>
              <strong style={{ color: C.white }}>No competitor comparison.</strong> The block claiming
              competitors need 24+ months to catch up has been deleted.
            </li>
          </ol>
        </Panel>

        <div style={{
          fontFamily: FM, fontSize: 11, color: C.dim, lineHeight: 1.8,
          borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8,
        }}>
          Every value on this page is read live from /api/captions/status, /api/accessibility and
          /api/accessibility/requests when the page loads. Nothing is cached, hardcoded or averaged.
          TruckWithEase is not an accessibility certifier and makes no WCAG conformance claim.
        </div>
      </div>

      <style>{`
        .twe-spin { animation: twe-spin 1s linear infinite; }
        @keyframes twe-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
