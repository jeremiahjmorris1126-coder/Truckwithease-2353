import { useState, useEffect, useCallback } from "react";

/**
 * Growth Command.
 *
 * Reads three real endpoints and counts what is actually in the database:
 *   GET /api/signup/list          — real sign-up rows
 *   GET /api/subscriptions/list   — real subscription rows + contracted MRR
 *   GET /api/signup/trial-links   — real trial invite codes and their use counts
 *
 * The previous version shipped hardcoded constants and presented them as the
 * platform's traffic: 12,847 visitors, 847 trial sign-ups, +34%/+61% deltas,
 * 12-point sparklines, a ten-row top-pages table (/traxes 3,420 views), a
 * traffic-source split (38% direct, 27% Google, 17% Facebook Groups), a
 * per-feature usage table with average session minutes, and a five-step
 * conversion funnel. None of it came from anywhere — a comment claimed it was
 * "populated from analytics_events in production" and no analytics_events
 * table has ever existed. It also built its own `new PocketBase()` client and
 * read collections (analytics_events, ad_campaigns, signups) that no server
 * serves. All of it is gone.
 *
 * There is no web analytics collector on this platform. Traffic, sessions,
 * page views, referral sources and funnel drop-off render NOT TRACKED with the
 * reason, because measuring them requires a collector that has not been built.
 * Nothing on this page falls back to 0 as if 0 were a measurement.
 */

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const CARD2 = "#111111";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const PLAN_LABEL = {
  solo: "Solo",
  pro: "Pro",
  fleet_lease: "Fleet (lease)",
  fleet_owned: "Fleet (owned)",
};

const NOT_TRACKED = [
  {
    metric: "Site visitors / unique users",
    why: "No web analytics collector is installed. There is no table that records a page view, so any visitor count would be invented.",
  },
  {
    metric: "Page views per session, session length",
    why: "Requires client-side session instrumentation that has not been built.",
  },
  {
    metric: "Traffic sources (direct, search, social, referral)",
    why: "Referrer is never captured or stored on any request.",
  },
  {
    metric: "Top pages by views",
    why: "Same reason — no page-view events exist to rank.",
  },
  {
    metric: "Per-feature usage and average minutes per feature",
    why: "No feature-level event tracking. The old table listed ten features with user counts and session minutes; every figure was typed by hand.",
  },
  {
    metric: "Conversion funnel and drop-off rates",
    why: "A funnel needs a visitor count at the top. Without a collector there is no top of funnel, only the sign-up rows below.",
  },
  {
    metric: "Week-over-week growth deltas",
    why: "Deltas need at least two comparable periods of real measurement. The platform has not launched, so there is no history to compare.",
  },
  {
    metric: "Ad campaign spend and performance",
    why: "No ad account is connected and no campaign has run. The old page read an ad_campaigns collection that no server serves.",
  },
];

const styles = `
  .gcp *, .gcp *::before, .gcp *::after { box-sizing: border-box; }
  .gcp { min-height: 100vh; background: ${BLACK}; color: #e8e8e8; font-family: 'Inter', system-ui, sans-serif; }

  .gcp-nav { position: sticky; top: 0; z-index: 100; padding: 16px 5%; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: rgba(17,17,17,0.96); border-bottom: 1px solid ${BORDER}; backdrop-filter: blur(10px); }
  .gcp-nav-t { font-family: 'Bebas Neue', 'Oswald', sans-serif; letter-spacing: 1.5px; font-size: 1.9rem; color: ${GOLDBR}; line-height: 1; }
  .gcp-nav-s { color: ${MUTED}; font-size: 0.78rem; margin-top: 4px; max-width: 620px; line-height: 1.5; }
  .gcp-refresh { background: transparent; border: 1px solid ${BORDER}; color: ${GOLD}; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; padding: 8px 14px; cursor: pointer; letter-spacing: 0.5px; }
  .gcp-refresh:hover { border-color: ${GOLD}; color: ${GOLDBR}; }
  .gcp-refresh:disabled { opacity: 0.5; cursor: default; }

  .gcp-body { max-width: 1140px; margin: 0 auto; padding: 30px 5% 80px; }
  .gcp-sec { margin-top: 34px; }
  .gcp-h { font-family: 'Oswald', sans-serif; font-size: 0.82rem; letter-spacing: 1.6px; color: ${GOLD}; margin: 0 0 12px; text-transform: uppercase; }
  .gcp-h-warn { color: ${WARN}; }

  .gcp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); gap: 12px; }
  .gcp-kpi { background: ${CARD}; border: 1px solid ${BORDER}; padding: 18px; }
  .gcp-kpi-l { font-size: 0.7rem; letter-spacing: 1px; color: ${DIM}; text-transform: uppercase; }
  .gcp-kpi-v { font-family: 'Bebas Neue', 'Oswald', sans-serif; font-size: 2.5rem; line-height: 1.1; color: ${GOLDBR}; margin-top: 8px; }
  .gcp-kpi-v.na { font-size: 1.15rem; color: ${WARN}; letter-spacing: 1px; padding-top: 12px; }
  .gcp-kpi-n { font-size: 0.72rem; color: ${MUTED}; margin-top: 8px; line-height: 1.55; }

  .gcp-card { background: ${CARD}; border: 1px solid ${BORDER}; padding: 20px; }
  .gcp-card2 { background: ${CARD2}; border: 1px solid ${BORDER}; padding: 20px; }

  .gcp-tbl { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .gcp-tbl th { text-align: left; font-family: 'Oswald', sans-serif; font-size: 0.68rem; letter-spacing: 1.1px; color: ${DIM}; text-transform: uppercase; padding: 0 12px 10px 0; border-bottom: 1px solid ${BORDER}; white-space: nowrap; }
  .gcp-tbl td { padding: 11px 12px 11px 0; border-bottom: 1px solid #1a1a1a; color: #cfcfcf; vertical-align: top; }
  .gcp-tbl td.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: ${GOLD}; }

  .gcp-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .gcp-bar-l { flex: 0 0 140px; font-size: 0.78rem; color: #cfcfcf; }
  .gcp-bar-t { flex: 1; height: 9px; background: #1c1c1c; border: 1px solid ${BORDER}; }
  .gcp-bar-f { height: 100%; background: linear-gradient(90deg, #A9762A, ${GOLDBR}); }
  .gcp-bar-n { flex: 0 0 46px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: ${GOLD}; }

  .gcp-nt { border-left: 2px solid ${WARN}; padding: 12px 0 12px 14px; margin-bottom: 12px; }
  .gcp-nt-m { font-family: 'Oswald', sans-serif; font-size: 0.86rem; color: #e0e0e0; letter-spacing: 0.3px; }
  .gcp-nt-b { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700; color: ${WARN}; border: 1px solid ${WARN}55; background: ${WARN}14; padding: 2px 7px; margin-left: 8px; white-space: nowrap; }
  .gcp-nt-w { font-size: 0.76rem; color: ${MUTED}; margin-top: 6px; line-height: 1.6; }

  .gcp-note { font-size: 0.78rem; color: ${MUTED}; line-height: 1.7; }
  .gcp-err { border: 1px solid ${WARN}55; background: ${WARN}12; color: #e8c4b4; padding: 14px; font-size: 0.8rem; line-height: 1.6; }
  .gcp-foot { border-top: 1px solid ${BORDER}; margin-top: 40px; padding-top: 20px; text-align: center; color: ${DIM}; font-size: 0.74rem; line-height: 1.7; }
`;

export default function GrowthCommandPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, subRes, tRes] = await Promise.all([
        fetch("/api/signup/list"),
        fetch("/api/subscriptions/list"),
        fetch("/api/signup/trial-links"),
      ]);
      if (!sRes.ok || !subRes.ok || !tRes.ok) {
        throw new Error(
          `API returned ${sRes.status}/${subRes.status}/${tRes.status}`
        );
      }
      const [s, sub, t] = await Promise.all([
        sRes.json(),
        subRes.json(),
        tRes.json(),
      ]);
      setData({
        signups: s.signups || [],
        subscriptions: sub.subscriptions || [],
        subCounts: sub.counts || {},
        contractedMrr: sub.contractedMrr,
        mrrNote: sub.mrrNote,
        trialLinks: t.trialLinks || [],
        fetchedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signups = data?.signups || [];
  const subs = data?.subscriptions || [];
  const links = data?.trialLinks || [];

  const byPlan = signups.reduce((a, r) => {
    const k = r.plan || "unspecified";
    a[k] = (a[k] || 0) + 1;
    return a;
  }, {});
  const bySource = signups.reduce((a, r) => {
    const k = r.source || "unspecified";
    a[k] = (a[k] || 0) + 1;
    return a;
  }, {});
  const maxSource = Math.max(1, ...Object.values(bySource));
  const activeSubs = subs.filter((r) => r.status === "active").length;
  const trialInvitesUsed = links.reduce((a, l) => a + (l.uses || 0), 0);
  const trialInvitesOffered = links.reduce((a, l) => a + (l.maxUses || 0), 0);

  return (
    <div className="gcp">
      <style>{styles}</style>

      <div className="gcp-nav">
        <div>
          <div className="gcp-nav-t">GROWTH COMMAND</div>
          <div className="gcp-nav-s">
            Counted from real rows in the database. There is no analytics
            collector on this platform, so traffic, sessions and funnel metrics
            are listed as NOT TRACKED rather than estimated.
          </div>
        </div>
        <button className="gcp-refresh" onClick={load} disabled={loading}>
          {loading ? "LOADING…" : "REFRESH"}
        </button>
      </div>

      <div className="gcp-body">
        {error && (
          <div className="gcp-err">
            Could not read the growth endpoints: {error}. Nothing is shown
            below rather than showing a stale or invented number.
          </div>
        )}

        {data && (
          <>
            <div className="gcp-sec">
              <h2 className="gcp-h">Measured — real rows</h2>
              <div className="gcp-grid">
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Sign-up rows</div>
                  <div className="gcp-kpi-v">{signups.length}</div>
                  <div className="gcp-kpi-n">
                    Every row in the signups table, including internal test
                    rows. Not deduplicated by person.
                  </div>
                </div>
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Subscription rows</div>
                  <div className="gcp-kpi-v">{subs.length}</div>
                  <div className="gcp-kpi-n">
                    {activeSubs} marked active
                    {Object.entries(data.subCounts).length
                      ? ` · ${Object.entries(data.subCounts)
                          .map(([k, v]) => `${v} ${k}`)
                          .join(", ")}`
                      : ""}
                    .
                  </div>
                </div>
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Contracted MRR</div>
                  <div className="gcp-kpi-v">
                    ${Number(data.contractedMrr || 0).toFixed(2)}
                  </div>
                  <div className="gcp-kpi-n">
                    {data.mrrNote ||
                      "Sum of monthly plan value for rows marked active. Contracted value, not collected cash — no payment processor is live."}
                  </div>
                </div>
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Trial invites redeemed</div>
                  <div className="gcp-kpi-v">{trialInvitesUsed}</div>
                  <div className="gcp-kpi-n">
                    Out of {trialInvitesOffered} offered across {links.length}{" "}
                    invite {links.length === 1 ? "code" : "codes"}.
                  </div>
                </div>
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Paying customers</div>
                  <div className="gcp-kpi-v na">NOT TRACKED</div>
                  <div className="gcp-kpi-n">
                    No payment processor is live, so no payment has ever
                    settled. A subscription row is an intent to bill, not a
                    collected dollar.
                  </div>
                </div>
                <div className="gcp-kpi">
                  <div className="gcp-kpi-l">Churn rate</div>
                  <div className="gcp-kpi-v na">NOT TRACKED</div>
                  <div className="gcp-kpi-n">
                    Churn needs billing periods that have opened and closed.
                    None have.
                  </div>
                </div>
              </div>
            </div>

            <div className="gcp-sec">
              <h2 className="gcp-h">Sign-ups by plan interest</h2>
              <div className="gcp-card">
                {Object.keys(byPlan).length === 0 ? (
                  <div className="gcp-note">
                    No sign-up rows yet. This fills in the moment one lands.
                  </div>
                ) : (
                  Object.entries(byPlan)
                    .sort((a, b) => b[1] - a[1])
                    .map(([plan, n]) => (
                      <div className="gcp-bar" key={plan}>
                        <div className="gcp-bar-l">
                          {PLAN_LABEL[plan] || plan}
                        </div>
                        <div className="gcp-bar-t">
                          <div
                            className="gcp-bar-f"
                            style={{
                              width: `${(n / signups.length) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="gcp-bar-n">{n}</div>
                      </div>
                    ))
                )}
                <div className="gcp-note" style={{ marginTop: 14 }}>
                  Plan selected on the sign-up form. It records interest at the
                  moment of sign-up, not a purchase.
                </div>
              </div>
            </div>

            <div className="gcp-sec">
              <h2 className="gcp-h">Where sign-ups came from</h2>
              <div className="gcp-card">
                {Object.keys(bySource).length === 0 ? (
                  <div className="gcp-note">No sign-up rows yet.</div>
                ) : (
                  Object.entries(bySource)
                    .sort((a, b) => b[1] - a[1])
                    .map(([src, n]) => (
                      <div className="gcp-bar" key={src}>
                        <div className="gcp-bar-l">{src}</div>
                        <div className="gcp-bar-t">
                          <div
                            className="gcp-bar-f"
                            style={{ width: `${(n / maxSource) * 100}%` }}
                          />
                        </div>
                        <div className="gcp-bar-n">{n}</div>
                      </div>
                    ))
                )}
                <div className="gcp-note" style={{ marginTop: 14 }}>
                  This is the <strong>source field written on the sign-up
                  row</strong> — which form or invite code the person came
                  through. It is not web referrer data and it cannot tell you
                  what channel drove the visit.
                </div>
              </div>
            </div>

            <div className="gcp-sec">
              <h2 className="gcp-h">Trial invite codes</h2>
              <div className="gcp-card">
                {links.length === 0 ? (
                  <div className="gcp-note">No trial invite codes created.</div>
                ) : (
                  <table className="gcp-tbl">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Label</th>
                        <th>Plan</th>
                        <th>Days</th>
                        <th>Used</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((l) => (
                        <tr key={l.id}>
                          <td className="mono">{l.code}</td>
                          <td>{l.label || "—"}</td>
                          <td>{PLAN_LABEL[l.plan] || l.plan}</td>
                          <td className="mono">{l.trialDays}</td>
                          <td className="mono">
                            {l.uses}/{l.maxUses}
                          </td>
                          <td>
                            {l.exhausted
                              ? "exhausted"
                              : l.expired
                                ? "expired"
                                : l.active
                                  ? "active"
                                  : "inactive"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="gcp-sec">
              <h2 className="gcp-h gcp-h-warn">
                Not tracked — and why
              </h2>
              <div className="gcp-card2">
                {NOT_TRACKED.map((r) => (
                  <div className="gcp-nt" key={r.metric}>
                    <div className="gcp-nt-m">
                      {r.metric}
                      <span className="gcp-nt-b">NOT TRACKED</span>
                    </div>
                    <div className="gcp-nt-w">{r.why}</div>
                  </div>
                ))}
                <div className="gcp-note" style={{ marginTop: 16 }}>
                  <strong style={{ color: GOLD }}>What would fix this:</strong>{" "}
                  one analytics events table plus a small client hook that
                  records page views and named feature events, then these
                  metrics become real counts instead of blanks. Until that
                  exists, this page will keep saying NOT TRACKED rather than
                  print a number.
                </div>
              </div>
            </div>

            <div className="gcp-foot">
              Read live from /api/signup/list, /api/subscriptions/list and
              /api/signup/trial-links at{" "}
              {new Date(data.fetchedAt).toLocaleString()}.
              <br />
              Counts include internal test rows. No payment processor is live —
              no figure on this page represents money received.
            </div>
          </>
        )}

        {!data && !error && loading && (
          <div className="gcp-note" style={{ marginTop: 30 }}>
            Reading real rows…
          </div>
        )}
      </div>
    </div>
  );
}
