/**
 * EntitledIndexPage — REBUILT AS A DATA INDEX 2026-08-28
 * Routes: /entitled-index, /index, /master-hub, /entitled  (App.jsx)
 * Original preserved at docs/launch/EntitledIndexPage.ORIGINAL.jsx.txt
 *
 * JEREMIAH'S INSTRUCTION
 * "The entitled index equals ALL DATA not documents. Anything ever reported filed equals a
 * function we can add to be better than Samsara or any trucking app."
 *
 * So this page no longer shows documents, tiles, or capability blurbs. It shows three counts
 * of real things and one diff:
 *
 *   ALL DATA      Every table in the live Turso database — real names, real row counts, real
 *                 column counts, read fresh on every request via PRAGMA and COUNT(*).
 *   EVERY FILING  Every record a US motor carrier reports, files, or must produce in an audit.
 *   THE DIFF      Each filing matched to a real table. Where no table backs it, the row turns
 *                 into a named function to build. That gap list is the roadmap.
 *
 * WHAT WAS REMOVED FROM THE PREVIOUS VERSION
 * - The four-panel operating hub (loads/HR/medical/telemetry). It was accurate but it was a
 *   dashboard, not an index. Those tools still live on their own pages.
 * - Everything that described a capability instead of counting one.
 *
 * WHAT THIS PAGE REFUSES TO DO
 * - It does not claim TruckWithEase files anything with any government agency. It does not.
 * - It does not claim ELD registration. TruckWithEase is not a registered ELD.
 * - It never names, scores, or prices a competitor. The gap list stands on its own.
 * - Retention periods and CFR cites are only the ones verified 2026-08-28 against eCFR, the
 *   FMCSA CSA Safety Planner, FMCSA registration pages and IFTA Inc. Unverified fields render
 *   as an em dash, never a guess.
 *
 * DATA SOURCES (all real, all server-side)
 * - GET /api/data-index/summary   counts across tables and filings
 * - GET /api/data-index/tables    live SQLite introspection of all tables
 * - GET /api/data-index/filed     the filing catalog with computed coverage
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Database, AlertTriangle, Loader2, RefreshCw, FileWarning, Layers,
  CheckCircle2, CircleDashed, Search, Hammer, BookOpen,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

async function getJSON(url) {
  const r = await fetch(url);
  let j = null;
  try { j = await r.json(); } catch { /* non-JSON body */ }
  if (!r.ok) throw new Error(j?.error || `${r.status} ${r.statusText}`);
  return j;
}

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <section style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, marginBottom: 20 }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
        borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap",
      }}>
        {Icon ? <Icon size={16} color={GOLD} /> : null}
        <h2 style={{
          margin: 0, font: "600 13px/1 Oswald, sans-serif", letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#e8e8e8",
        }}>{title}</h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </header>
      {note ? (
        <p style={{
          margin: 0, padding: "10px 18px", borderBottom: `1px solid ${BORDER}`,
          font: "400 12px/1.6 Inter, sans-serif", color: DIM,
        }}>{note}</p>
      ) : null}
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 4, padding: 14, margin: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <AlertTriangle size={14} color={WARN} />
        <span style={{
          font: "600 11px/1 Oswald, sans-serif", letterSpacing: "0.2em",
          textTransform: "uppercase", color: WARN,
        }}>Missing / Not tracked</span>
      </div>
      <div style={{ font: "600 13px/1.4 Inter, sans-serif", color: "#ddd", marginBottom: 4 }}>{label}</div>
      <div style={{ font: "400 12px/1.6 Inter, sans-serif", color: MUTED }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ minWidth: 108 }}>
      <div style={{
        font: "400 34px/1 'Bebas Neue', sans-serif", letterSpacing: "0.04em",
        color: tone === "warn" ? WARN : tone === "gold" ? GOLDBR : "#f0f0f0",
      }}>{value}</div>
      <div style={{
        font: "500 10px/1.3 Oswald, sans-serif", letterSpacing: "0.2em",
        textTransform: "uppercase", color: DIM, marginTop: 4,
      }}>{label}</div>
    </div>
  );
}

const STATUS_STYLE = {
  live: { label: "LIVE DATA", color: "#C9A84C", icon: CheckCircle2 },
  "table-empty": { label: "TABLE EMPTY", color: MUTED, icon: CircleDashed },
  gap: { label: "NO TABLE — GAP", color: WARN, icon: FileWarning },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.gap;
  const Icon = s.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px",
      border: `1px solid ${s.color}55`, borderRadius: 3, color: s.color,
      font: "600 9px/1 Oswald, sans-serif", letterSpacing: "0.16em", whiteSpace: "nowrap",
    }}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

export default function EntitledIndexPage() {
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableCounts, setTableCounts] = useState(null);
  const [filed, setFiled] = useState([]);
  const [filedCounts, setFiledCounts] = useState(null);
  const [sources, setSources] = useState([]);
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("all");
  const [tab, setTab] = useState("filings");

  const load = useCallback(async () => {
    setState("loading"); setErr("");
    try {
      const [s, t, f] = await Promise.all([
        getJSON("/api/data-index/summary"),
        getJSON("/api/data-index/tables"),
        getJSON("/api/data-index/filed"),
      ]);
      setSummary(s);
      setTables(t.tables || []); setTableCounts(t.counts || null);
      setFiled(f.records || []); setFiledCounts(f.counts || null); setSources(f.sources || []);
      setState("ok");
    } catch (e) {
      setErr(e.message || String(e)); setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filedView = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return filed.filter((r) => {
      if (only !== "all" && r.status !== only) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        r.what.toLowerCase().includes(needle) ||
        (r.table || "").toLowerCase().includes(needle) ||
        (r.gapFunction || "").toLowerCase().includes(needle)
      );
    });
  }, [filed, q, only]);

  const tablesView = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = needle
      ? tables.filter((t) => t.table.toLowerCase().includes(needle) || t.domain.toLowerCase().includes(needle))
      : tables;
    return [...rows].sort((a, b) => b.rows - a.rows || a.table.localeCompare(b.table));
  }, [tables, q]);

  const byDomain = useMemo(() => {
    const m = new Map();
    for (const t of tables) {
      const d = m.get(t.domain) || { domain: t.domain, tables: 0, rows: 0, columns: 0 };
      d.tables += 1; d.rows += t.rows; d.columns += t.columns;
      m.set(t.domain, d);
    }
    return [...m.values()].sort((a, b) => b.rows - a.rows);
  }, [tables]);

  const gaps = useMemo(() => filed.filter((r) => r.status === "gap" && r.gapFunction), [filed]);

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 16px", background: tab === id ? "#1d1d1d" : "transparent",
        border: `1px solid ${tab === id ? GOLD : BORDER}`, borderRadius: 3, cursor: "pointer",
        color: tab === id ? GOLDBR : MUTED,
        font: "600 11px/1 Oswald, sans-serif", letterSpacing: "0.18em", textTransform: "uppercase",
      }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        .di-row:hover{background:#1a1a1a}
        table.di{width:100%;border-collapse:collapse}
        table.di th{font:600 10px/1 Oswald,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#666;text-align:left;padding:9px 10px;border-bottom:1px solid #222}
        table.di td{font:400 12px/1.5 Inter,sans-serif;color:#ccc;padding:9px 10px;border-bottom:1px solid #1a1a1a;vertical-align:top}
        .mono{font-family:'JetBrains Mono',monospace;font-size:11px}`}</style>

      {/* HEADER BAND */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: "linear-gradient(180deg,#111,#0a0a0a)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 22px 24px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px",
            border: `1px solid ${BORDER}`, borderRadius: 3, color: GOLD,
            font: "600 10px/1 Oswald, sans-serif", letterSpacing: "0.24em", textTransform: "uppercase",
          }}>
            <Database size={12} /> Entitled Index
          </span>

          <h1 style={{
            margin: "16px 0 10px", font: "400 52px/0.95 'Bebas Neue', sans-serif",
            letterSpacing: "0.02em", color: "#f2f2f2",
          }}>
            ALL <span style={{ color: GOLDBR }}>DATA</span>. EVERY FILING. THE GAP BETWEEN THEM.
          </h1>

          <p style={{ margin: "0 0 20px", maxWidth: 900, font: "400 14px/1.7 Inter, sans-serif", color: MUTED }}>
            Not a document list and not a feature grid. This counts every table in the live database,
            lists every record a motor carrier ever reports or files, and matches one to the other.
            Every row marked <strong style={{ color: WARN }}>NO TABLE — GAP</strong> is a function that
            does not exist yet, named exactly, with the filing that justifies building it. That is the
            build list.
          </p>

          {state === "ok" && summary ? (
            <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-end" }}>
              <Stat value={summary.data.tables} label="Tables" />
              <Stat value={summary.data.rows.toLocaleString()} label="Rows live" tone="gold" />
              <Stat value={summary.data.columns} label="Columns" />
              <Stat value={summary.filings.total} label="Filing types" />
              <Stat value={summary.filings.live} label="Backed by data" tone="gold" />
              <Stat value={summary.filings.gap} label="No table yet" tone="warn" />
              <button
                onClick={load}
                style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 15px", background: "transparent", border: `1px solid ${GOLD}`,
                  borderRadius: 3, color: GOLDBR, cursor: "pointer",
                  font: "600 11px/1 Oswald, sans-serif", letterSpacing: "0.18em", textTransform: "uppercase",
                }}
              ><RefreshCw size={13} /> Refresh</button>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 22px 60px" }}>

        {state === "loading" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 40, color: MUTED }}>
            <Loader2 size={16} className="spin" /> Introspecting the live database…
          </div>
        ) : null}

        {state === "error" ? (
          <Panel title="Index unavailable" icon={AlertTriangle}>
            <div style={{ color: WARN, font: "400 13px/1.6 Inter, sans-serif" }}>
              The server returned: <span className="mono">{err}</span>
            </div>
          </Panel>
        ) : null}

        {state === "ok" ? (
          <>
            {/* CONTROLS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
              {tabBtn("filings", `Filings (${filed.length})`)}
              {tabBtn("data", `Data tables (${tables.length})`)}
              {tabBtn("build", `Build list (${gaps.length})`)}
              <div style={{
                marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
                border: `1px solid ${BORDER}`, borderRadius: 3, padding: "7px 11px", background: CARD,
              }}>
                <Search size={13} color={DIM} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search filings, tables, functions…"
                  style={{
                    background: "transparent", border: "none", outline: "none", color: "#ddd",
                    font: "400 12px/1 Inter, sans-serif", width: 240,
                  }}
                />
              </div>
            </div>

            {/* ------------------------------------------------ FILINGS */}
            {tab === "filings" ? (
              <>
                <Panel
                  title="Everything a carrier reports or files"
                  icon={BookOpen}
                  note="GET /api/data-index/filed — status is computed from live COUNT(*) on the backing table, never asserted. LIVE DATA means rows exist right now. TABLE EMPTY means the schema is there and nothing has been written. NO TABLE means we do not store this at all."
                  right={
                    <div style={{ display: "flex", gap: 6 }}>
                      {["all", "live", "table-empty", "gap"].map((k) => (
                        <button key={k} onClick={() => setOnly(k)}
                          style={{
                            padding: "5px 10px", background: only === k ? "#1d1d1d" : "transparent",
                            border: `1px solid ${only === k ? GOLD : BORDER}`, borderRadius: 3,
                            color: only === k ? GOLDBR : DIM, cursor: "pointer",
                            font: "600 9px/1 Oswald, sans-serif", letterSpacing: "0.14em", textTransform: "uppercase",
                          }}>{k === "all" ? "All" : STATUS_STYLE[k].label}</button>
                      ))}
                    </div>
                  }
                >
                  {filedCounts ? (
                    <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
                      <Stat value={filedCounts.total} label="Filing types" />
                      <Stat value={filedCounts.live} label="Live data" tone="gold" />
                      <Stat value={filedCounts.tableEmpty} label="Schema, no rows" />
                      <Stat value={filedCounts.gap} label="Not stored at all" tone="warn" />
                    </div>
                  ) : null}

                  <div style={{ overflowX: "auto" }}>
                    <table className="di">
                      <thead>
                        <tr>
                          <th style={{ width: "22%" }}>Record</th>
                          <th style={{ width: "26%" }}>What it is</th>
                          <th>Cadence</th>
                          <th>Retention</th>
                          <th>Cite</th>
                          <th>Backing table</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filedView.map((r) => (
                          <tr key={r.id} className="di-row">
                            <td style={{ color: "#eee", fontWeight: 600 }}>{r.name}
                              <div style={{ color: DIM, fontWeight: 400, fontSize: 11, marginTop: 3 }}>{r.filedWith}</div>
                            </td>
                            <td style={{ color: MUTED }}>{r.what}</td>
                            <td>{r.cadence || <span style={{ color: DIM }}>—</span>}</td>
                            <td>{r.retention || <span style={{ color: DIM }}>—</span>}</td>
                            <td className="mono" style={{ color: r.cite ? MUTED : DIM }}>{r.cite || "—"}</td>
                            <td className="mono" style={{ color: r.table ? GOLD : DIM }}>
                              {r.table || "—"}
                              {r.rows !== null && r.rows !== undefined
                                ? <span style={{ color: DIM }}> · {r.rows} rows</span> : null}
                            </td>
                            <td><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filedView.length === 0 ? (
                      <div style={{ padding: 20, color: DIM, font: "400 12px Inter, sans-serif" }}>No filings match that filter.</div>
                    ) : null}
                  </div>
                </Panel>

                <Panel title="Where the retention periods and citations came from" icon={BookOpen}
                  note="Only verified fields are populated. Anything unverified renders as an em dash rather than a guess.">
                  <ul style={{ margin: 0, paddingLeft: 18, font: "400 12px/1.9 Inter, sans-serif", color: MUTED }}>
                    {sources.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Panel>
              </>
            ) : null}

            {/* ------------------------------------------------ DATA TABLES */}
            {tab === "data" ? (
              <>
                <Panel title="Data by domain" icon={Layers}
                  note="GET /api/data-index/tables — PRAGMA table_info and COUNT(*) executed against Turso on every request. Nothing cached, nothing hardcoded.">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
                    {byDomain.map((d) => (
                      <div key={d.domain} style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: 13 }}>
                        <div style={{
                          font: "600 10px/1 Oswald, sans-serif", letterSpacing: "0.18em",
                          textTransform: "uppercase", color: GOLD, marginBottom: 8,
                        }}>{d.domain}</div>
                        <div style={{ font: "400 28px/1 'Bebas Neue', sans-serif", color: "#f0f0f0" }}>
                          {d.rows.toLocaleString()}
                        </div>
                        <div style={{ font: "400 11px/1.5 Inter, sans-serif", color: DIM, marginTop: 3 }}>
                          rows · {d.tables} tables · {d.columns} columns
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Every table in the database" icon={Database}
                  note={tableCounts
                    ? `${tableCounts.tables} tables · ${tableCounts.rows.toLocaleString()} rows · ${tableCounts.columns} columns · ${tableCounts.empty} tables hold zero rows.`
                    : undefined}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="di">
                      <thead>
                        <tr>
                          <th>Table</th><th>Domain</th><th>Rows</th><th>Cols</th><th>What reads it</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tablesView.map((t) => (
                          <tr key={t.table} className="di-row">
                            <td className="mono" style={{ color: GOLD }}>{t.table}</td>
                            <td>{t.domain}</td>
                            <td style={{ color: t.rows > 0 ? "#eee" : DIM, fontWeight: t.rows > 0 ? 600 : 400 }}>
                              {t.rows}
                            </td>
                            <td style={{ color: MUTED }}>{t.columns}</td>
                            <td className="mono" style={{ color: t.powers ? MUTED : WARN }}>
                              {t.powers || "nothing reads it"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </>
            ) : null}

            {/* ------------------------------------------------ BUILD LIST */}
            {tab === "build" ? (
              <>
                <Panel title="The build list — filings with nothing behind them" icon={Hammer}
                  note="Every item below is a filing a carrier is already responsible for, that this platform does not store. Each one is written as the concrete function to build, not as a feature idea.">
                  {gaps.map((r, i) => (
                    <div key={r.id} style={{
                      border: `1px solid ${BORDER}`, borderRadius: 4, padding: 15,
                      marginBottom: 12, background: "#131313",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ font: "400 22px/1 'Bebas Neue', sans-serif", color: DIM, minWidth: 26 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ font: "600 14px/1.3 Inter, sans-serif", color: GOLDBR }}>{r.name}</span>
                        <StatusBadge status={r.status} />
                        {r.cite ? <span className="mono" style={{ color: DIM }}>{r.cite}</span> : null}
                      </div>
                      <div style={{ font: "400 12px/1.7 Inter, sans-serif", color: MUTED, marginBottom: 8 }}>
                        {r.what}
                      </div>
                      <div style={{
                        borderLeft: `2px solid ${GOLD}`, paddingLeft: 12,
                        font: "400 13px/1.7 Inter, sans-serif", color: "#ddd",
                      }}>
                        {r.gapFunction}
                      </div>
                    </div>
                  ))}
                </Panel>

                <Panel title="Also incomplete — schema exists, nothing writes to it" icon={FileWarning}>
                  {filed.filter((r) => r.status === "table-empty").map((r) => (
                    <Missing key={r.id} label={`${r.name} → ${r.table} (0 rows)`}
                      reason={r.gapFunction || "The table is defined but no page or route has ever written a row to it."} />
                  ))}
                  {filed.filter((r) => r.status === "live" && r.gapFunction).map((r) => (
                    <div key={r.id} style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 12 }}>
                      <div style={{ font: "600 12px/1.4 Inter, sans-serif", color: "#ddd", marginBottom: 4 }}>
                        {r.name} — has data, still incomplete
                      </div>
                      <div style={{ font: "400 12px/1.6 Inter, sans-serif", color: MUTED }}>{r.gapFunction}</div>
                    </div>
                  ))}
                </Panel>
              </>
            ) : null}

            {/* FOOTER DISCLAIMER */}
            <div style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: 16, background: CARD, marginTop: 8,
            }}>
              <div style={{
                font: "600 10px/1 Oswald, sans-serif", letterSpacing: "0.2em",
                textTransform: "uppercase", color: DIM, marginBottom: 8,
              }}>What this page is not</div>
              <p style={{ margin: 0, font: "400 12px/1.8 Inter, sans-serif", color: MUTED }}>
                TruckWithEase does not file anything with FMCSA, the IRS, IFTA, or any state agency, and
                nothing on this page submits a form. Storing a record here does not satisfy a legal
                retention requirement on its own. TruckWithEase is not a registered ELD. Retention
                periods and CFR citations are reproduced from public federal sources for orientation
                only and are not legal advice — verify against eCFR and your base jurisdiction before
                relying on them. Counts are read live from the database at the moment you loaded this
                page; a table showing zero rows means exactly that.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
