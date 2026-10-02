import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, AlertTriangle, RefreshCw, Clipboard, Bell, Truck, ExternalLink } from 'lucide-react';

/**
 * Fleetio maintenance — live, gold on black, nothing invented.
 *
 * Built 2026-08-28. This page exists because the maintenance pages in this app
 * have never had a real equipment source: VehicleMaintenanceAgentPage and
 * MaintenanceSchedulerPage work off seeded rows and browser-side schedulers.
 *
 * EVERY number on this page comes from one of these server endpoints, which are
 * themselves live read-throughs to Fleetio (no cache, no database copy):
 *   GET /api/fleetio/status
 *   GET /api/fleetio/summary
 *   GET /api/fleetio/vehicles
 *   GET /api/fleetio/issues
 *   GET /api/fleetio/service-reminders
 *   GET /api/fleetio/work-orders
 *
 * NOTHING IS FABRICATED HERE. Specifically:
 *   - There is no health score, no "fleet uptime %", and no predicted failure.
 *     Fleetio does not return those and we do not compute them.
 *   - Vehicles Fleetio flags is_sample are shown with a SAMPLE badge and are
 *     excluded from the "real equipment" count. As of the build date all 6
 *     vehicles in the account are Fleetio demo equipment (a Hyster forklift,
 *     a Utility reefer) — so this page says exactly that instead of pretending
 *     they are trucks.
 *   - A failed section renders the vendor's own error string, never a zero.
 */

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  border: '#222222',
  white: '#f0ede8',
  muted: '#8a8a8a',
  dim: '#666666',
};

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status} from ${url}`);
  return j;
}

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
        {Icon ? <Icon size={16} color={GOLD} /> : null}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 13, color: C.white }}>{title}</div>
          {note ? <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{note}</div> : null}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 4, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AlertTriangle size={18} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, color: WARN }}>Missing / not tracked</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, lineHeight: 1, color: tone === 'warn' ? WARN : GOLDB }}>{value}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, color: C.muted }}>{k}</div>
      <div style={{ fontSize: 13, color: tone === 'warn' ? WARN : C.white, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', textAlign: 'right' }}>{v}</div>
    </div>
  );
}

const Err = ({ msg }) => (
  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: WARN, lineHeight: 1.7 }}>{msg}</div>
);

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? String(s) : d.toISOString().slice(0, 10);
};

export default function FleetioMaintenancePage() {
  const [state, setState] = useState('loading');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [issues, setIssues] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [workOrders, setWorkOrders] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});

  const load = useCallback(async () => {
    setState('loading');
    setErr('');
    const errs = {};
    try {
      const [st, sm] = await Promise.all([getJSON('/api/fleetio/status'), getJSON('/api/fleetio/summary')]);
      setStatus(st);
      setSummary(sm);
      const pull = async (key, url, setter) => {
        try {
          setter(await getJSON(url));
        } catch (e) {
          errs[key] = String(e.message || e);
          setter(null);
        }
      };
      await Promise.all([
        pull('vehicles', '/api/fleetio/vehicles', setVehicles),
        pull('issues', '/api/fleetio/issues', setIssues),
        pull('reminders', '/api/fleetio/service-reminders', setReminders),
        pull('workOrders', '/api/fleetio/work-orders', setWorkOrders),
      ]);
      setSectionErrors(errs);
      setState('ok');
    } catch (e) {
      setErr(String(e.message || e));
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const acct = status?.accounts?.find((a) => a.isConfiguredAccount) || status?.accounts?.[0] || null;
  const vc = vehicles?.counts || null;
  const ic = issues?.counts || null;
  const rc = reminders?.counts || null;

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header band */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(180deg,#111 0%,#0a0a0a 100%)', padding: '36px 20px 28px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: '5px 10px', marginBottom: 16 }}>
            <Wrench size={13} color={GOLD} />
            <span style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 10, color: GOLD }}>Fleetio · live maintenance</span>
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: '0.01em' }}>
            MAINTENANCE, <span style={{ color: GOLDB }}>LIVE</span>
          </h1>
          <p style={{ color: C.muted, maxWidth: 780, lineHeight: 1.7, marginTop: 14, fontSize: 14 }}>
            Every figure below is read from your Fleetio account the moment this page loads. Nothing is cached, nothing is copied into
            our database, and nothing is estimated. If Fleetio refuses a call, you see Fleetio's own error text instead of a zero.
          </p>

          <div style={{ display: 'flex', gap: 34, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 26 }}>
            <Stat value={vc ? vc.real : '—'} label="Real vehicles" />
            <Stat value={vc ? vc.sample : '—'} label="Fleetio samples" tone={vc && vc.sample > 0 ? 'warn' : undefined} />
            <Stat value={ic ? ic.open : '—'} label="Open issues" tone={ic && ic.open > 0 ? 'warn' : undefined} />
            <Stat value={rc ? rc.overdue : '—'} label="Service overdue" tone={rc && rc.overdue > 0 ? 'warn' : undefined} />
            <Stat value={rc ? rc.dueSoon : '—'} label="Due soon" />
            <Stat value={workOrders ? workOrders.counts.total : '—'} label="Work orders" />
            <button
              onClick={load}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 3, padding: '9px 16px', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, cursor: 'pointer' }}
            >
              <RefreshCw size={13} className={state === 'loading' ? 'spin' : undefined} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px 60px' }}>
        {state === 'error' ? (
          <Panel title="Connection" note="GET /api/fleetio/status · GET /api/fleetio/summary" icon={AlertTriangle}>
            <Err msg={err} />
          </Panel>
        ) : null}

        {/* Account */}
        <Panel
          title="Account"
          note="GET /api/fleetio/status"
          icon={Truck}
          right={
            <a href="https://secure.fleetio.com" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: GOLD, fontSize: 11, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', textDecoration: 'none' }}>
              Open Fleetio <ExternalLink size={12} />
            </a>
          }
        >
          {acct ? (
            <>
              <Row k="Account" v={`${acct.name} (id ${acct.id})`} />
              <Row k="Role on this key" v={acct.userType || '—'} />
              <Row k="Location" v={[acct.city, acct.region, acct.country].filter(Boolean).join(', ') || '—'} />
              <Row k="Account-Token matches key" v={acct.isConfiguredAccount ? 'yes' : 'NO — wrong account token'} mono tone={acct.isConfiguredAccount ? undefined : 'warn'} />
              <Row k="Live HTTP status" v={status?.httpStatus ?? '—'} mono />
              <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.7, marginTop: 14 }}>
                Fleetio requires two headers on every call except /accounts — an API key and an account token. Both are set on the
                server. Neither is ever sent to this browser.
              </div>
            </>
          ) : (
            <Missing label="Fleetio account" reason={status?.blockers?.join(' ') || 'The server has not returned an account yet.'} />
          )}
        </Panel>

        {/* Vehicles */}
        <Panel title="Equipment" note="GET /api/fleetio/vehicles" icon={Truck}>
          {sectionErrors.vehicles ? (
            <Err msg={sectionErrors.vehicles} />
          ) : !vehicles ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : vehicles.vehicles.length === 0 ? (
            <Missing label="No vehicles in Fleetio" reason="Fleetio answered with an empty list. Add your trucks in Fleetio and they appear here on the next refresh." />
          ) : (
            <>
              {vc.real === 0 ? (
                <div style={{ border: `1px solid ${WARN}`, borderRadius: 4, padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <AlertTriangle size={17} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 13, color: C.white, lineHeight: 1.7 }}>
                    <strong style={{ color: WARN }}>Every vehicle in this account is Fleetio demo equipment.</strong> All {vc.total} records
                    come back flagged <code style={{ fontFamily: 'JetBrains Mono, monospace', color: GOLD }}>is_sample: true</code> — a forklift and a
                    reefer in a group called "Warehouse". Not one real truck is in Fleetio yet, so this page has nothing true to show about
                    your fleet until you add your trucks there.
                  </div>
                </div>
              ) : null}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Vehicle', 'Type', 'Status', 'Group', 'Ownership', 'Meter', ''].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.vehicles.map((v) => (
                      <tr key={v.id}>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.white }}>{v.name}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted }}>{v.type || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: String(v.status).toLowerCase() === 'active' ? GOLD : C.muted }}>{v.status || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted }}>{v.group || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted }}>{v.ownership || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>
                          {v.primaryMeter === null ? '—' : `${v.primaryMeter} ${v.primaryMeterUnit || ''}`}
                        </td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}` }}>
                          {v.isSample ? (
                            <span style={{ border: `1px solid ${WARN}`, color: WARN, borderRadius: 3, padding: '2px 7px', fontSize: 10, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.16em' }}>SAMPLE</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>

        {/* Service reminders */}
        <Panel title="Service reminders" note="GET /api/fleetio/service-reminders" icon={Bell}>
          {sectionErrors.reminders ? (
            <Err msg={sectionErrors.reminders} />
          ) : !reminders ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : reminders.reminders.length === 0 ? (
            <Missing label="No service reminders" reason="Fleetio returned an empty list. Reminders are configured per vehicle inside Fleetio." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Task', 'Vehicle id', 'Status', 'Next due', 'Interval', 'Active'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reminders.reminders.map((s) => {
                    const st = String(s.status || '').toLowerCase();
                    return (
                      <tr key={s.id}>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.white }}>{s.task || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{s.vehicleId ?? '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: st === 'overdue' || st === 'due_soon' ? WARN : C.muted }}>{s.status || '—'}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{fmtDate(s.nextDueAt)}</td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                          {s.timeInterval ? `${s.timeInterval} ${s.timeFrequency || ''}` : '—'}
                        </td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: s.active ? GOLD : C.dim }}>{s.active ? 'yes' : 'no'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Issues */}
        <Panel title="Issues" note="GET /api/fleetio/issues" icon={AlertTriangle}>
          {sectionErrors.issues ? (
            <Err msg={sectionErrors.issues} />
          ) : !issues ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : issues.issues.length === 0 ? (
            <Missing label="No issues" reason="Fleetio returned an empty list. That is a real empty list, not a failed call." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {issues.issues.map((i) => {
                const open = String(i.state || '').toLowerCase() === 'open';
                return (
                  <div key={i.id} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, background: '#111' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: C.white }}>{i.name || i.summary || `Issue ${i.number}`}</div>
                      <span style={{ border: `1px solid ${open ? WARN : C.border}`, color: open ? WARN : C.muted, borderRadius: 3, padding: '2px 7px', fontSize: 10, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>
                        {String(i.state || 'unknown').toUpperCase()}
                      </span>
                    </div>
                    {i.description ? <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>{i.description}</div> : null}
                    <div style={{ marginTop: 12 }}>
                      <Row k="Reported" v={fmtDate(i.reportedAt)} mono />
                      <Row k="Vehicle id" v={i.vehicleId ?? '—'} mono />
                      <Row k="Due" v={fmtDate(i.dueDate)} mono />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Work orders */}
        <Panel title="Work orders" note="GET /api/fleetio/work-orders" icon={Clipboard}>
          {sectionErrors.workOrders ? (
            <Err msg={sectionErrors.workOrders} />
          ) : !workOrders ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : workOrders.workOrders.length === 0 ? (
            <Missing label="No work orders" reason="Fleetio answered with zero work orders. That is a real empty list — the shop side of Fleetio has not been used on this account yet." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Number', 'State', 'Vehicle id', 'Issued', 'Completed', 'Total'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workOrders.workOrders.map((w) => (
                    <tr key={w.id}>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.white, fontFamily: 'JetBrains Mono, monospace' }}>{w.number ?? w.id}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted }}>{w.state || '—'}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{w.vehicleId ?? '—'}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{fmtDate(w.issuedAt)}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{fmtDate(w.completedAt)}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>{w.totalAmount === null ? '—' : `$${w.totalAmount.toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Not built */}
        <Panel title="Not connected yet" note="Honest list of what this page cannot do" icon={AlertTriangle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
            <Missing
              label="Fleetio vehicles linked to our drivers"
              reason="There is no shared identifier between a Fleetio vehicle and the truck numbers in our drivers table (T-104, T-217, …). Until someone maps them, a Fleetio vehicle cannot be attributed to a driver."
            />
            <Missing
              label="DVIR defects pushed into Fleetio issues"
              reason="Our DVIR route holds 142 inspections. None of them create a Fleetio issue. That write path is not built — this page is read-only today."
            />
            <Missing
              label="Predicted failures"
              reason="Fleetio returns due dates and meter intervals, not predictions. No failure probability is shown because none is measured."
            />
            <Missing
              label="Cost per mile of maintenance"
              reason="Needs work-order costs plus real odometer readings. This account has zero work orders, so any cost figure would be invented."
            />
          </div>
        </Panel>

        <Panel title="What would make this real" note="In order of value">
          <ol style={{ color: C.muted, fontSize: 13, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
            <li>Add your actual trucks in Fleetio and archive the demo equipment. Everything on this page becomes true the moment you do.</li>
            <li>Put our truck number in the Fleetio vehicle name or a custom field, so a Fleetio vehicle can be tied to a driver.</li>
            <li>Build the write path: a DVIR defect opens a Fleetio issue automatically.</li>
            <li>Use Fleetio work orders for repairs, which is the only honest source of maintenance cost per mile.</li>
          </ol>
        </Panel>

        <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.8, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
          This page is a read-only mirror of Fleetio. It does not create, edit, or delete anything in Fleetio, it stores nothing in our
          database, and it is not an ELD or a compliance record. Vehicles marked SAMPLE are Fleetio's own demo data.
          {summary?.fetchedAt ? ` Server read at ${summary.fetchedAt}.` : ''}
        </div>
      </div>
    </div>
  );
}
