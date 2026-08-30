/**
 * FunctionIndexPage — /entitled and /function-index
 *
 * WHAT THIS PAGE IS
 * Jeremiah's instruction: "go through all the functions TruckwithEASE will be able to offer,
 * index all the design/webdev/programmer/truck,car,bike = can not duplicate. Add AI/HUMAN
 * functions who read algorithms = capability/trust with the users."
 *
 * READS (live, round trip measured with performance.now()):
 *   GET /api/functions → the whole index, computed server-side on every request:
 *        - endpoints[]     every method+path actually registered on the running Hono app
 *        - capabilities[]  one row per function, each carrying its OWN evidence
 *                          (endpoint mounted? table exists and has rows? credential present?)
 *                          and a status COMPUTED from that evidence
 *        - duplicates      collision counts on id and on (name + world)
 *        - counts          totals by status, vehicle world, discipline and AI/HUMAN/ALGORITHM
 *
 * COMPUTES LOCALLY:
 *   Filtering and sorting only. Every number displayed comes from the response above.
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   1. No uptime, availability or "no downtime" percentage. Nothing in this platform records
 *      health-check results over time, so no such figure can be honest. It renders as MISSING.
 *   2. No comparison against another application. No competitor price, no self-score, no
 *      "us vs them" grid — that comparison exists as a source-cited internal document only.
 *   3. "live" means the endpoint is mounted, its tables exist and hold rows, and its
 *      credentials are present. It does NOT mean the feature is finished or polished.
 *   4. TruckWithEase is not an FMCSA-registered ELD and files nothing with any agency.
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ListTree,
  RefreshCw,
  AlertTriangle,
  Truck,
  Car,
  Bike,
  Brain,
  User,
  Sigma,
  ShieldCheck,
  Copy,
  Server,
  Layers,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDB = "#FFD700";
const WARN = "#c96a4c";
const C = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  white: "#f5f5f5",
  muted: "#8a8a8a",
  dim: "#666666",
};
const FD = "'Bebas Neue', Impact, sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', ui-monospace, monospace";

const SLOW_MS = 3000;

async function timedGet(url) {
  const t0 = performance.now();
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, ms });
  }
  return { body, ms, status: res.status };
}

/* ------------------------------- primitives ------------------------------- */

function Panel({ title, note, right, icon, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "18px 20px 20px",
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: FH,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            {icon}
            {title}
          </h2>
          {note ? (
            <p
              style={{
                margin: "7px 0 0",
                fontFamily: FB,
                fontSize: 12.5,
                lineHeight: 1.6,
                color: C.muted,
                maxWidth: 860,
              }}
            >
              {note}
            </p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: `1px dashed #333`,
        borderRadius: 8,
        padding: "14px 16px",
        background: "#121212",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: FH,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: WARN,
        }}
      >
        <AlertTriangle size={14} />
        MISSING / NOT TRACKED
      </div>
      <div style={{ marginTop: 8, fontFamily: FB, fontSize: 13.5, color: C.white }}>{label}</div>
      <div style={{ marginTop: 5, fontFamily: FB, fontSize: 12.5, lineHeight: 1.6, color: C.muted }}>
        {reason}
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  const color = tone === "warn" ? WARN : tone === "bright" ? GOLDB : GOLD;
  return (
    <div
      style={{
        background: C.nav,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "13px 15px",
        minWidth: 128,
      }}
    >
      <div style={{ fontFamily: FD, fontSize: 34, lineHeight: 1, color }}>{value}</div>
      <div
        style={{
          marginTop: 6,
          fontFamily: FH,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Tag({ text, tone }) {
  const map = {
    live: { fg: "#0a0a0a", bg: GOLDB, bd: GOLDB },
    built_empty: { fg: GOLD, bg: "transparent", bd: GOLD },
    needs_key: { fg: WARN, bg: "transparent", bd: WARN },
    not_built: { fg: C.muted, bg: "transparent", bd: "#333" },
    plain: { fg: C.muted, bg: "transparent", bd: "#2c2c2c" },
    gold: { fg: GOLD, bg: "transparent", bd: GOLD },
  };
  const t = map[tone] || map.plain;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 4,
        border: `1px solid ${t.bd}`,
        background: t.bg,
        color: t.fg,
        fontFamily: FM,
        fontSize: 10.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Err({ msg }) {
  return (
    <div
      style={{
        border: `1px solid ${WARN}`,
        borderRadius: 8,
        padding: "12px 14px",
        background: "#160f0d",
        fontFamily: FM,
        fontSize: 12.5,
        color: WARN,
        wordBreak: "break-word",
      }}
    >
      {msg}
    </div>
  );
}

function Spin() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 13,
        height: 13,
        border: `2px solid ${C.border}`,
        borderTopColor: GOLD,
        borderRadius: "50%",
        animation: "twe-spin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes twe-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

const KIND_ICON = {
  ai: <Brain size={13} />,
  human: <User size={13} />,
  algorithm: <Sigma size={13} />,
};
const WORLD_ICON = {
  truck: <Truck size={13} />,
  car: <Car size={13} />,
  bike: <Bike size={13} />,
};

/* --------------------------------- page ---------------------------------- */

export default function FunctionIndexPage() {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [reads, setReads] = useState([]);
  const [error, setError] = useState(null);

  const [world, setWorld] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [kind, setKind] = useState("all");
  const [showScreens, setShowScreens] = useState(false);
  const [status, setStatus] = useState("all");
  const [showEndpoints, setShowEndpoints] = useState(false);

  const alive = useRef(true);

  async function load() {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const r = await timedGet("/api/functions");
      if (!alive.current) return;
      setData(r.body);
      setReads([{ url: "/api/functions", status: r.status, ms: r.ms }]);
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setError(`GET /api/functions failed — ${e.message}`);
      setReads([{ url: "/api/functions", status: e.status || 0, ms: e.ms || 0 }]);
      setState("error");
    }
  }

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding results.
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, []);

  const caps = data?.capabilities ?? [];

  const filtered = useMemo(
    () =>
      caps.filter(
        (c) =>
          (world === "all" || (c.worlds || []).includes(world)) &&
          (discipline === "all" || (c.disciplines || []).includes(discipline)) &&
          (kind === "all" || c.kind === kind) &&
          (status === "all" || c.status === status),
      ),
    [caps, world, discipline, kind, status],
  );

  const byDomain = useMemo(() => {
    const m = new Map();
    for (const c of filtered) {
      if (!m.has(c.domain)) m.set(c.domain, []);
      m.get(c.domain).push(c);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const btn = (active) => ({
    padding: "6px 11px",
    borderRadius: 5,
    border: `1px solid ${active ? GOLD : C.border}`,
    background: active ? "rgba(201,168,76,0.13)" : C.nav,
    color: active ? GOLDB : C.muted,
    fontFamily: FH,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  });

  const FilterRow = ({ label, value, setValue, options }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 9 }}>
      <span
        style={{
          fontFamily: FH,
          fontSize: 10.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.dim,
          width: 92,
        }}
      >
        {label}
      </span>
      <button type="button" style={btn(value === "all")} onClick={() => setValue("all")}>
        all
      </button>
      {options.map((o) => (
        <button key={o} type="button" style={btn(value === o)} onClick={() => setValue(o)}>
          {WORLD_ICON[o] || KIND_ICON[o] || null}
          {o.replace("_", " ")}
        </button>
      ))}
    </div>
  );

  const counts = data?.counts;

  return (
    <div style={{ background: C.black, minHeight: "100vh", color: C.white, fontFamily: FB }}>
      {/* ---------------------------- header band ---------------------------- */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: "34px 22px 30px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              fontFamily: FH,
              fontSize: 10.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            <ListTree size={13} />
            Function index / entitled
          </div>
          <h1
            style={{
              margin: "16px 0 0",
              fontFamily: FD,
              fontSize: "clamp(34px, 7vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "0.01em",
            }}
          >
            EVERY FUNCTION, WITH ITS OWN <span style={{ color: GOLDB }}>EVIDENCE</span>
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              maxWidth: 900,
              fontSize: 14,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            One deduplicated index of everything TruckWithEase does, tagged by vehicle world
            (truck / car / bike), by discipline (design / webdev / programmer) and by who performs
            it (AI / HUMAN / ALGORITHM). Each row's status is computed on this request from three
            measurable facts: is the endpoint mounted on the running server, does its table exist
            and hold rows, and is its credential present. Nothing here is a status somebody typed.
            No uptime percentage is published and no other application is scored — both reasons are
            stated below.
          </p>
          <a
            href="/entitled-index"
            style={{
              display: "inline-block",
              marginTop: 16,
              fontFamily: FH,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: GOLDB,
              borderBottom: `1px solid ${GOLD}`,
              textDecoration: "none",
            }}
          >
            Data index (tables, rows, filings) →
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 22px 70px" }}>
        {/* ------------------------- measured reads ------------------------- */}
        <Panel
          title="Measured reads"
          icon={<Server size={14} />}
          note="Every round trip this page made, with the HTTP status and a performance.now() measurement. The server also reports how long its own introspection took."
          right={
            <button
              type="button"
              onClick={load}
              style={{
                ...btn(false),
                borderColor: GOLD,
                color: GOLDB,
              }}
            >
              {state === "loading" ? <Spin /> : <RefreshCw size={12} />} re-read
            </button>
          }
        >
          {reads.length === 0 ? (
            <div style={{ fontFamily: FM, fontSize: 12.5, color: C.dim }}>reading…</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FM, fontSize: 12.5 }}>
              <tbody>
                {reads.map((r) => (
                  <tr key={r.url} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "8px 6px", color: C.white }}>{r.url}</td>
                    <td style={{ padding: "8px 6px", color: r.status === 200 ? GOLD : WARN }}>
                      {r.status || "ERR"}
                    </td>
                    <td style={{ padding: "8px 6px", color: r.ms >= SLOW_MS ? WARN : C.muted }}>
                      {r.ms} ms{r.ms >= SLOW_MS ? " ← slow" : ""}
                    </td>
                  </tr>
                ))}
                {data ? (
                  <tr style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "8px 6px", color: C.muted }}>
                      server-side introspection (routes + live table counts)
                    </td>
                    <td style={{ padding: "8px 6px", color: C.muted }}>—</td>
                    <td
                      style={{
                        padding: "8px 6px",
                        color: data.measuredMs >= SLOW_MS ? WARN : C.muted,
                      }}
                    >
                      {data.measuredMs} ms{data.measuredMs >= SLOW_MS ? " ← slow" : ""}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
          {state === "error" && error ? (
            <div style={{ marginTop: 12 }}>
              <Err msg={error} />
            </div>
          ) : null}
        </Panel>

        {state === "ok" && counts ? (
          <>
            {/* ---------------------------- totals ---------------------------- */}
            <Panel
              title="Totals"
              icon={<Sigma size={14} />}
              note="Counted from the response of GET /api/functions. 'live' means mounted + tables hold rows + credential present — it does not mean finished."
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Stat value={counts.capabilities} label="functions indexed" tone="bright" />
                <Stat value={counts.endpoints} label="endpoints measured" />
                <Stat value={counts.byStatus.live} label="live" />
                <Stat value={counts.byStatus.built_empty} label="built, no rows" />
                <Stat value={counts.byStatus.needs_key} label="needs credential" tone="warn" />
                <Stat value={counts.byStatus.not_built} label="not built" tone="warn" />
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                {(data.vocabulary?.worlds ?? []).map((w) => (
                  <Stat
                    key={w}
                    value={`${counts.byWorld[w].live}/${counts.byWorld[w].total}`}
                    label={`${w} live / total`}
                  />
                ))}
                {(data.vocabulary?.disciplines ?? []).map((d) => (
                  <Stat
                    key={d}
                    value={`${counts.byDiscipline[d].live}/${counts.byDiscipline[d].total}`}
                    label={`${d} live / total`}
                  />
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                {(data.vocabulary?.kinds ?? []).map((k) => (
                  <Stat key={k} value={counts.byKind[k]} label={`${k} functions`} />
                ))}
              </div>
            </Panel>

            {/* -------------------------- duplicates -------------------------- */}
            <Panel
              title="Duplication check"
              icon={<Copy size={14} />}
              note="You said it can not duplicate, so this is computed on every request instead of asserted: repeated capability ids, and the same function name claimed twice for the same vehicle world."
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Stat
                  value={data.duplicates.idCollisions.length}
                  label="id collisions"
                  tone={data.duplicates.idCollisions.length ? "warn" : "bright"}
                />
                <Stat
                  value={data.duplicates.nameWorldCollisions.length}
                  label="name+world collisions"
                  tone={data.duplicates.nameWorldCollisions.length ? "warn" : "bright"}
                />
                <Stat
                  value={data.duplicates.duplicateEndpointRegistrations}
                  label="repeated route regs"
                />
              </div>
              <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.65, color: C.muted }}>
                {data.duplicates.note}
              </p>
              {data.duplicates.idCollisions.length || data.duplicates.nameWorldCollisions.length ? (
                <div style={{ marginTop: 10 }}>
                  <Err
                    msg={`Collisions: ${[
                      ...data.duplicates.idCollisions,
                      ...data.duplicates.nameWorldCollisions,
                    ].join(", ")}`}
                  />
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: FH,
                    fontSize: 11.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: GOLDB,
                  }}
                >
                  <ShieldCheck size={14} /> zero duplicates, proven on this request
                </div>
              )}
            </Panel>

            {/* ------------------- what is not published --------------------- */}
            <Panel
              title="Not published on this page"
              icon={<AlertTriangle size={14} />}
              note="Two things you asked about cannot be honestly rendered here. Both reasons come straight from the server response."
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Missing label="Uptime / “no downtime” percentage" reason={data.missing.uptime} />
                <Missing label="Comparison against similar applications" reason={data.missing.comparison} />
              </div>
            </Panel>

            {/* ---------------------------- filters --------------------------- */}
            <Panel
              title="Filter the index"
              icon={<ListTree size={14} />}
              note={`Showing ${filtered.length} of ${caps.length} functions.`}
            >
              <FilterRow label="World" value={world} setValue={setWorld} options={data.vocabulary.worlds} />
              <FilterRow
                label="Discipline"
                value={discipline}
                setValue={setDiscipline}
                options={data.vocabulary.disciplines}
              />
              <FilterRow label="Performed by" value={kind} setValue={setKind} options={data.vocabulary.kinds} />
              <FilterRow
                label="Status"
                value={status}
                setValue={setStatus}
                options={["live", "built_empty", "needs_key", "not_built"]}
              />
            </Panel>

            {/* ------------------------- the index ---------------------------- */}
            {byDomain.length === 0 ? (
              <Panel title="No match" icon={<ListTree size={14} />}>
                <Missing
                  label="No function matches these filters."
                  reason="Widen a filter. The index is not empty — the combination you picked is."
                />
              </Panel>
            ) : (
              byDomain.map(([domain, rows]) => (
                <Panel
                  key={domain}
                  title={domain}
                  icon={<ListTree size={14} />}
                  note={`${rows.length} function${rows.length === 1 ? "" : "s"} in this domain.`}
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    {rows.map((c) => (
                      <article
                        key={c.id}
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          background: C.nav,
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ minWidth: 260, flex: 1 }}>
                            <h3
                              style={{
                                margin: 0,
                                fontFamily: FH,
                                fontSize: 15,
                                fontWeight: 600,
                                color: C.white,
                                letterSpacing: "0.02em",
                              }}
                            >
                              {c.name}
                            </h3>
                            <div style={{ marginTop: 5, fontFamily: FM, fontSize: 11, color: C.dim }}>
                              {c.id}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            <Tag text={c.status.replace("_", " ")} tone={c.status} />
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 8px",
                                borderRadius: 4,
                                border: `1px solid ${GOLD}`,
                                color: GOLD,
                                fontFamily: FM,
                                fontSize: 10.5,
                                textTransform: "uppercase",
                              }}
                            >
                              {KIND_ICON[c.kind]} {c.kind}
                            </span>
                            {(c.worlds || []).map((w) => (
                              <span
                                key={w}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  border: `1px solid #2c2c2c`,
                                  color: C.muted,
                                  fontFamily: FM,
                                  fontSize: 10.5,
                                  textTransform: "uppercase",
                                }}
                              >
                                {WORLD_ICON[w]} {w}
                              </span>
                            ))}
                            {(c.disciplines || []).map((d) => (
                              <Tag key={d} text={d} tone="plain" />
                            ))}
                          </div>
                        </div>

                        <p style={{ margin: "11px 0 0", fontSize: 13.5, lineHeight: 1.65, color: C.white }}>
                          {c.what}
                        </p>

                        <p
                          style={{
                            margin: "9px 0 0",
                            fontSize: 12.5,
                            lineHeight: 1.65,
                            color: C.muted,
                            borderLeft: `2px solid ${GOLD}`,
                            paddingLeft: 11,
                          }}
                        >
                          <strong style={{ color: GOLD, fontFamily: FH, letterSpacing: "0.1em" }}>
                            TRUST:{" "}
                          </strong>
                          {c.trust}
                        </p>

                        <div
                          style={{
                            marginTop: 11,
                            paddingTop: 10,
                            borderTop: `1px solid ${C.border}`,
                            display: "grid",
                            gap: 6,
                            fontFamily: FM,
                            fontSize: 11.5,
                          }}
                        >
                          <div style={{ color: C.dim }}>
                            STATUS REASON: <span style={{ color: C.muted }}>{c.statusReason}</span>
                          </div>
                          {c.evidence.endpoints.length ? (
                            <div style={{ color: C.dim }}>
                              ENDPOINTS:{" "}
                              {c.evidence.endpoints.map((e) => (
                                <span key={e.path} style={{ color: e.mounted ? GOLD : WARN, marginRight: 10 }}>
                                  {e.path} {e.mounted ? "mounted" : "NOT MOUNTED"}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {c.evidence.pages?.length ? (
                            <div style={{ color: C.dim }}>
                              SCREENS:{" "}
                              {c.evidence.pages.map((pg) => (
                                <span
                                  key={pg.path}
                                  style={{ color: pg.routed ? GOLD : WARN, marginRight: 10 }}
                                >
                                  {pg.path} {pg.routed ? "routed" : "NOT ROUTED"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: C.dim }}>
                              SCREENS: <span style={{ color: C.muted }}>none claimed yet — this function is served by the API only.</span>
                            </div>
                          )}
                          {c.evidence.tables.length ? (
                            <div style={{ color: C.dim }}>
                              TABLES:{" "}
                              {c.evidence.tables.map((t) => (
                                <span
                                  key={t.table}
                                  style={{
                                    color: !t.exists ? WARN : t.rows > 0 ? GOLD : C.muted,
                                    marginRight: 10,
                                  }}
                                >
                                  {t.table} {!t.exists ? "MISSING" : `${t.rows} rows`}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {c.evidence.envKeys.length ? (
                            <div style={{ color: C.dim }}>
                              CREDENTIALS (presence only, never a value):{" "}
                              {c.evidence.envKeys.map((e) => (
                                <span
                                  key={e.key}
                                  style={{ color: e.present ? GOLD : WARN, marginRight: 10 }}
                                >
                                  {e.key} {e.present ? "present" : "ABSENT"}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </Panel>
              ))
            )}

            {/* --------------------------- screens ---------------------------- */}
            {data.screens ? (
              data.screens.checked ? (
                <Panel
                  title="Screens routed in the app"
                  icon={<Layers size={14} />}
                  note={`${data.screens.totalRouted} page routes read out of ${data.screens.source} at request time. ${data.screens.claimedByAFunction} of them are claimed by an indexed function. The rest are listed below, not hidden.`}
                  right={
                    <button type="button" style={btn(showScreens)} onClick={() => setShowScreens((v) => !v)}>
                      {showScreens ? "hide" : `show ${data.screens.unclaimed.length} unclaimed`}
                    </button>
                  }
                >
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                    <Stat value={data.screens.totalRouted} label="screens routed" tone="bright" />
                    <Stat value={data.screens.claimedByAFunction} label="claimed by a function" />
                    <Stat value={data.screens.unclaimed.length} label="not claimed yet" />
                    <Stat value={data.screens.declaredButNotRouted.length} label="declared but dead" />
                  </div>
                  {data.screens.declaredButNotRouted.length ? (
                    <div style={{ color: WARN, fontFamily: FM, fontSize: 12, marginBottom: 10 }}>
                      DECLARED BUT NOT ROUTED: {data.screens.declaredButNotRouted.join(", ")}
                    </div>
                  ) : null}
                  {showScreens ? (
                    <div
                      style={{
                        maxHeight: 420,
                        overflowY: "auto",
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        padding: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 7,
                      }}
                    >
                      {data.screens.unclaimed.map((pg) => (
                        <span
                          key={pg}
                          style={{
                            fontFamily: FM,
                            fontSize: 11.5,
                            color: C.muted,
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            padding: "3px 7px",
                          }}
                        >
                          {pg}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p style={{ color: C.dim, fontSize: 12.5, lineHeight: 1.7, margin: "12px 0 0" }}>
                    {data.screens.note}
                  </p>
                </Panel>
              ) : (
                <Panel title="Screens routed in the app" icon={<Layers size={14} />}>
                  <Missing
                    label="SCREEN LIST NOT READ"
                    reason={`The route table could not be read on the server: ${data.screens.error}`}
                  />
                </Panel>
              )
            ) : null}

            {/* ------------------------- endpoint list ------------------------ */}
            <Panel
              title="Measured endpoint list"
              icon={<Server size={14} />}
              note={`${data.endpoints.length} deduplicated method+path pairs, read off the running Hono app at request time (not a hand-kept list), across ${data.domains.length} route domains.`}
              right={
                <button type="button" style={btn(showEndpoints)} onClick={() => setShowEndpoints((v) => !v)}>
                  {showEndpoints ? "hide" : "show all"}
                </button>
              }
            >
              {showEndpoints ? (
                <div
                  style={{
                    maxHeight: 520,
                    overflowY: "auto",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FM, fontSize: 12 }}>
                    <tbody>
                      {data.endpoints.map((e) => (
                        <tr key={`${e.method} ${e.path}`} style={{ borderTop: `1px solid ${C.border}` }}>
                          <td style={{ padding: "6px 10px", color: GOLD, width: 70 }}>{e.method}</td>
                          <td style={{ padding: "6px 10px", color: C.white }}>{e.path}</td>
                          <td style={{ padding: "6px 10px", color: C.dim, width: 150 }}>{e.domain}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {data.domains.map((d) => (
                    <Tag key={d} text={d} tone="gold" />
                  ))}
                </div>
              )}
            </Panel>

            {/* ----------------------- does not cover ------------------------ */}
            <Panel title="What this page does not cover" icon={<AlertTriangle size={14} />}>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: C.muted,
                }}
              >
                <li>
                  No uptime, availability or "no downtime" figure — nothing records health-check
                  results over time, and one 200 measured today is not uptime.
                </li>
                <li>
                  No comparison to another application: no competitor price, no self-score, no
                  us-vs-them grid anywhere in the product.
                </li>
                <li>
                  "live" is a wiring fact, not a quality judgement. A live row can still be an ugly
                  screen or a thin feature.
                </li>
                <li>
                  Credentials are reported as present/absent only. No key value is returned by the
                  API or rendered here, ever.
                </li>
                <li>
                  TruckWithEase is not an FMCSA-registered ELD, and it files nothing with any
                  agency — no IFTA, no 2290, no tax return.
                </li>
                <li>
                  The car and bike worlds are deliberately narrower than truck: HOS, DVIR and
                  federal weight rules apply to trucks only, and rows say so rather than claiming
                  parity.
                </li>
              </ol>
            </Panel>

            <p style={{ fontSize: 12, lineHeight: 1.7, color: C.dim, marginTop: 18 }}>
              Generated {data.generatedAt}. Every status on this page was computed during that
              request from the running server's route table, the live database, and credential
              presence. If a router is unmounted or a table is emptied, these rows change on the
              next read.
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
