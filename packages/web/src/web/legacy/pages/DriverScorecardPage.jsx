import { useCallback, useEffect, useState } from 'react';

// Driver Scorecard — reads /api/safety, which is a real scoring engine.
//
// What this page used to be (preserved at docs/launch/DriverScorecardPage.ORIGINAL.jsx.txt):
//   five hard-coded drivers ("Ray Davis 96", "John Miller 78"), a pulsing
//   "LIVE SCORING" dot next to them, and a client-side weighted average of
//   those constants. No scoring engine existed anywhere in the codebase.
//
// What it is now: every number comes from POST/GET /api/safety, computed from
// hos_logs, dvir_inspections, hr_occurrences, speeding_events and
// eld_telemetry. Rules that must not be softened:
//   * A component with no source rows renders as MISSING with the reason, not
//     as 100 and not as 0.
//   * A driver without enough data shows NO SCORE, not a placeholder number.
//   * Accident risk is never shown as a percentage. The engine returns null and
//     this page prints why.
//   * "Load demo history" writes clearly-marked DEMO rows for the seeded demo
//     drivers only, and the banner says so while they are loaded.

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const NAV = '#111111';
const BORDER = '#222222';
const WARN = '#c96a4c';
const MUTED = '#8a8a8a';
const DIM = '#666666';

const COMPONENT_LABELS = {
  speeding: { label: 'Speeding', icon: '🚨', source: 'speeding_events + ELD odometer' },
  hos: { label: 'HOS Discipline', icon: '⏱️', source: 'hos_logs (completed days only)' },
  violations: { label: 'Violations & Accidents', icon: '⚖️', source: 'hr_occurrences' },
  dvir: { label: 'DVIR Pairing', icon: '🔧', source: 'dvir_inspections' },
  fatigue: { label: 'Fatigue (inverted)', icon: '😴', source: 'eld_telemetry' },
};

const GRADE_COLOR = (grade) => {
  if (grade === 'platinum' || grade === 'gold') return GOLD_BRIGHT;
  if (grade === 'silver') return GOLD;
  return WARN;
};

function Bar({ value }) {
  return (
    <div style={{ height: 6, background: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: `linear-gradient(90deg,#8A6E2F,${GOLD},${GOLD_BRIGHT})` }} />
    </div>
  );
}

export default function DriverScorecardPage() {
  const [fleet, setFleet] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState(null);
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [demoNote, setDemoNote] = useState('');

  const loadFleet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [f, w] = await Promise.all([
        fetch('/api/safety').then((r) => r.json()),
        fetch('/api/safety/weights').then((r) => r.json()),
      ]);
      setFleet(f);
      setWeights(w);
      if (!selectedId && f?.drivers?.length) setSelectedId(f.drivers[0].driverId);
    } catch (e) {
      setError(`Could not reach the scoring API: ${e.message}. Nothing is being shown from cache — this page has no fallback numbers.`);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadFleet(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        const [d, h] = await Promise.all([
          fetch(`/api/safety/${selectedId}`).then((r) => r.json()),
          fetch(`/api/safety/history/${selectedId}`).then((r) => r.json()),
        ]);
        if (!cancelled) { setDetail(d); setHistory(h); }
      } catch (e) {
        if (!cancelled) setError(`Could not load driver detail: ${e.message}`);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const recompute = async () => {
    if (!selectedId) return;
    setBusy('recompute');
    try {
      const r = await fetch(`/api/safety/recompute/${selectedId}`, { method: 'POST' }).then((res) => res.json());
      setDetail((prev) => ({ ...(prev || {}), ...r }));
      const h = await fetch(`/api/safety/history/${selectedId}`).then((res) => res.json());
      setHistory(h);
      await loadFleet();
    } catch (e) {
      setError(`Recompute failed: ${e.message}`);
    } finally {
      setBusy('');
    }
  };

  const loadDemo = async () => {
    setBusy('demo');
    try {
      const r = await fetch('/api/safety/demo-history', { method: 'POST' }).then((res) => res.json());
      setDemoNote(r.alreadyPresent
        ? 'Demo history was already loaded — nothing was duplicated.'
        : `Wrote demo history: ${r.written?.hosLogs ?? 0} HOS logs, ${r.written?.dvirs ?? 0} DVIRs, ${r.written?.speedingEvents ?? 0} speeding events, ${r.written?.telemetry ?? 0} telemetry rows across ${r.drivers} demo drivers.`);
      await loadFleet();
      if (selectedId) {
        const d = await fetch(`/api/safety/${selectedId}`).then((res) => res.json());
        setDetail(d);
      }
    } catch (e) {
      setError(`Demo load failed: ${e.message}`);
    } finally {
      setBusy('');
    }
  };

  const drivers = fleet?.drivers ?? [];
  const isDemoFleet = drivers.some((d) => String(d.driverId).startsWith('drv-'));

  return (
    <div style={{ minHeight: '100vh', background: BLACK, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: NAV, borderBottom: `2px solid ${GOLD}`, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: GOLD_BRIGHT, lineHeight: 1 }}>DRIVER SCORECARD</div>
          <div style={{ fontSize: 12, color: MUTED, letterSpacing: 1 }}>
            COMPUTED SERVER-SIDE FROM HOS LOGS, DVIRs, OCCURRENCES, SPEEDING EVENTS AND ELD TELEMETRY
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={loadFleet} disabled={loading} style={btn(false)}>{loading ? 'Loading…' : 'Refresh'}</button>
          <button onClick={loadDemo} disabled={busy === 'demo'} style={btn(false)}>{busy === 'demo' ? 'Writing…' : 'Load demo history'}</button>
          <button onClick={recompute} disabled={!selectedId || busy === 'recompute'} style={btn(true)}>{busy === 'recompute' ? 'Scoring…' : 'Recompute & save snapshot'}</button>
        </div>
      </div>

      {error && (
        <div style={{ margin: '14px 28px', padding: 14, background: '#1a0f0c', border: `1px solid ${WARN}`, borderRadius: 8, color: WARN, fontSize: 13 }}>{error}</div>
      )}
      {demoNote && (
        <div style={{ margin: '14px 28px', padding: 14, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: MUTED, fontSize: 13 }}>{demoNote}</div>
      )}

      <div style={{ padding: '18px 28px 40px' }}>
        {/* Fleet summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 18 }}>
          <Stat label="Drivers scored" value={fleet ? `${fleet.fleet.driversScored} of ${fleet.fleet.driversTotal}` : '—'} />
          <Stat label={`Fleet average (${fleet?.windowDays ?? 30}-day)`} value={fleet?.fleet.averageScore ?? 'No score'} accent />
          <Stat label="Unscored — not enough data" value={fleet ? fleet.fleet.driversUnscored : '—'} />
          <Stat label="Accident risk" value="Not modeled" />
        </div>

        <div style={{ padding: 14, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.6 }}>
          {fleet?.note}
          {isDemoFleet && (
            <div style={{ marginTop: 8, color: WARN }}>
              This roster is the seeded demo fleet (driver ids drv-1…drv-5). Their records are demo rows, not readings from a truck. Scores below are the real engine running over those demo rows.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,300px) 1fr', gap: 18, alignItems: 'start' }}>
          {/* Roster */}
          <div>
            <div style={{ fontSize: 11, color: DIM, letterSpacing: 2, marginBottom: 10 }}>ROSTER</div>
            {drivers.length === 0 && !loading && (
              <div style={{ padding: 16, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: MUTED, fontSize: 13 }}>
                No drivers on file. Add drivers before scoring — this page invents nobody.
              </div>
            )}
            {drivers.map((d) => {
              const on = d.driverId === selectedId;
              return (
                <button
                  key={d.driverId}
                  onClick={() => setSelectedId(d.driverId)}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 8, padding: '12px 14px',
                    background: on ? '#1a1200' : CARD, border: `1px solid ${on ? GOLD : BORDER}`, borderRadius: 10, color: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: on ? GOLD_BRIGHT : '#fff' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: DIM }}>{d.truckNumber || 'no truck'} · {d.status?.replace('_', ' ')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: d.score === null ? DIM : GRADE_COLOR(d.grade) }}>
                        {d.score === null ? '—' : d.score}
                      </div>
                      <div style={{ fontSize: 10, color: DIM, letterSpacing: 1 }}>{d.score === null ? 'NO DATA' : (d.gradeLabel || '').toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: DIM }}>
                    {d.componentsScored.length}/5 components have data{d.componentsMissing.length ? ` · missing: ${d.componentsMissing.join(', ')}` : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div>
            {!detail && <div style={{ padding: 20, color: MUTED, fontSize: 13 }}>Select a driver.</div>}
            {detail && (
              <>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1, color: GOLD_BRIGHT }}>
                        {detail.driver?.name ?? detail.driverId}
                      </div>
                      <div style={{ fontSize: 12, color: MUTED }}>
                        {detail.driver?.truckNumber || 'no truck'} · {detail.windowDays}-day window · {detail.milesObserved === null ? 'no ELD miles recorded' : `${detail.milesObserved.toLocaleString()} mi of telemetry`}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 54, lineHeight: 1, color: detail.score === null ? DIM : GRADE_COLOR(detail.grade) }}>
                        {detail.score === null ? 'NO SCORE' : detail.score}
                      </div>
                      <div style={{ fontSize: 12, letterSpacing: 2, color: MUTED }}>
                        {detail.score === null ? 'NOT ENOUGH DATA' : (detail.gradeLabel || '').toUpperCase()}
                      </div>
                      {history?.trend !== null && history?.trend !== undefined && (
                        <div style={{ fontSize: 12, color: history.trend >= 0 ? GOLD : WARN, marginTop: 4 }}>
                          {history.trend >= 0 ? '▲' : '▼'} {Math.abs(history.trend)} pts vs oldest saved snapshot
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 14, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{detail.note}</div>
                </div>

                {/* Components */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12, marginBottom: 14 }}>
                  {Object.entries(detail.components || {}).map(([key, comp]) => {
                    const meta = COMPONENT_LABELS[key] || { label: key, icon: '•', source: '' };
                    const w = detail.weights?.[key];
                    return (
                      <div key={key} style={{ background: CARD, border: `1px solid ${comp.score === null ? BORDER : GOLD}`, borderRadius: 10, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{meta.icon}</span>
                          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, color: '#fff' }}>{meta.label}</span>
                          <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: comp.score === null ? DIM : GOLD_BRIGHT }}>
                            {comp.score === null ? 'MISSING' : comp.score}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: DIM, margin: '4px 0 10px' }}>weight {w ?? '—'}% · source: {meta.source}</div>
                        {comp.score !== null && <Bar value={comp.score} />}
                        <div style={{ fontSize: 12, color: comp.score === null ? WARN : MUTED, marginTop: 10, lineHeight: 1.5 }}>{comp.note}</div>
                        {comp.detail && Object.keys(comp.detail).length > 0 && (
                          <div style={{ marginTop: 10, display: 'grid', gap: 4 }}>
                            {Object.entries(comp.detail).filter(([, v]) => v === null || typeof v !== 'object').map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', fontSize: 11, color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
                                <span style={{ flex: 1 }}>{k}</span>
                                <span style={{ color: MUTED }}>{v === null ? 'none' : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Accident risk — deliberately not a number */}
                <div style={{ background: CARD, border: `1px dashed ${WARN}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, color: WARN, marginBottom: 6 }}>ACCIDENT RISK — NOT MODELED</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{detail.accidentRiskNote}</div>
                </div>

                {/* Snapshots */}
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, color: GOLD, marginBottom: 8 }}>SAVED SNAPSHOTS</div>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>{history?.note}</div>
                  {(history?.snapshots ?? []).slice(0, 12).map((s) => (
                    <div key={s.id} style={{ display: 'flex', gap: 10, fontSize: 12, padding: '6px 0', borderTop: `1px solid ${BORDER}`, fontFamily: "'JetBrains Mono', monospace", color: MUTED }}>
                      <span style={{ flex: 1 }}>{new Date(s.computedAt).toLocaleString()}</span>
                      <span style={{ color: s.score === null ? DIM : GOLD_BRIGHT }}>{s.score === null ? 'no score' : s.score}</span>
                      <span style={{ width: 90, textAlign: 'right', color: DIM }}>{s.grade || '—'}</span>
                    </div>
                  ))}
                  {(history?.snapshots ?? []).length === 0 && (
                    <div style={{ fontSize: 12, color: DIM }}>No snapshots saved yet. Nothing is stored until you press Recompute.</div>
                  )}
                </div>

                {weights && (
                  <div style={{ marginTop: 14, fontSize: 11, color: DIM, lineHeight: 1.7 }}>
                    Grade bands: {weights.grades.map((g) => `${g.label} ${g.min}+`).join(' · ')}. A score is produced only when at least {weights.minComponents} of 5 components have records; missing components are excluded and the remaining weights are renormalized, never defaulted.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${accent ? GOLD : BORDER}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: DIM, letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: accent ? GOLD_BRIGHT : '#fff' }}>{value}</div>
    </div>
  );
}

function btn(primary) {
  return {
    cursor: 'pointer',
    padding: '9px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: 0.5,
    border: `1px solid ${GOLD}`,
    background: primary ? 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)' : '#161616',
    color: primary ? '#0a0a0a' : GOLD,
  };
}
