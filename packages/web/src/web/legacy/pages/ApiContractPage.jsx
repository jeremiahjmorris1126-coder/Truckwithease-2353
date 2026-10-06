/**
 * THE API CONTRACT — /api-contract
 *
 * READS (live, every value on this page comes from these round trips)
 *   GET /api/openapi/summary   REQUIRED — endpoint and path counts, per-tag breakdown, what the
 *                               document does NOT claim
 *   GET /api/openapi.json      REQUIRED — the OpenAPI 3.1 document itself, browsed here by tag
 *
 * COMPUTES LOCALLY
 *   Round-trip latency per read, the document's byte size, the tag filter and the text search.
 *   Nothing else. Every path, method and description shown here came out of the document.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   The document is generated from the app's own live route table, so it cannot list an endpoint
 *   that is not mounted. It does NOT model request or response bodies — Hono's route table does
 *   not carry them, and inventing them would produce a contract that lies. Most operations carry
 *   a mechanical summary, not a hand-written one. Authentication is enforced on only part of this
 *   surface today, so an operation with no security requirement is NOT proven to be public.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, Copy, Download, FileJson, Search, ShieldAlert } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Btn, GhostBtn, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const num = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString());

const METHOD_TONE = {
  GET: GOLD,
  POST: GOLDB,
  PUT: GOLDB,
  PATCH: GOLDB,
  DELETE: WARN,
};

export default function ApiContractPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [reads, setReads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [spec, setSpec] = useState(null);
  const [specBytes, setSpecBytes] = useState(0);
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const [s, d] = await Promise.all([
        timedGet("/api/openapi/summary"),
        timedGet("/api/openapi.json"),
      ]);
      // timedGet THROWS on a non-2xx or non-JSON response and returns no `ok` field, so reaching
      // this line already means both reads succeeded. Do not test s.ok here.
      setReads([s, d]);
      setSummary(s.body);
      setSpec(d.body);
      setSpecBytes(d.bytes ?? 0);
      setState("ready");
    } catch (e) {
      setError(e.message || String(e));
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Flatten the document into rows once, then filter locally. */
  const operations = useMemo(() => {
    if (!spec?.paths) return [];
    const rows = [];
    for (const [path, ops] of Object.entries(spec.paths)) {
      for (const [method, op] of Object.entries(ops || {})) {
        rows.push({
          path,
          method: method.toUpperCase(),
          tag: (op?.tags && op.tags[0]) || "root",
          summary: op?.summary || "",
          description: op?.description || "",
          curated: !String(op?.description || "").startsWith("Behaviour not documented"),
          params: (op?.parameters || []).map((p) => p.name),
        });
      }
    }
    return rows.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  }, [spec]);

  const tags = useMemo(() => {
    const counts = {};
    for (const r of operations) counts[r.tag] = (counts[r.tag] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [operations]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return operations.filter((r) => {
      if (tag !== "all" && r.tag !== tag) return false;
      if (!needle) return true;
      return (
        r.path.toLowerCase().includes(needle) ||
        r.summary.toLowerCase().includes(needle) ||
        r.method.toLowerCase() === needle
      );
    });
  }, [operations, tag, q]);

  const curatedRows = useMemo(() => operations.filter((r) => r.curated), [operations]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/api/openapi.json`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  if (state === "loading") return <div style={page}><div style={wrap}><Spin label="Reading the contract…" /></div></div>;
  if (state === "error") return <div style={page}><div style={wrap}><Err error={error} onRetry={load} /></div></div>;

  return (
    <div style={page}>
      <div style={wrap}>
        <Header
          icon={<FileJson size={18} color={GOLD} />}
          eyebrow="INTEGRATION"
          title="THE API CONTRACT"
          accent="OPENAPI 3.1"
          lead="Generated from the running app's own route table — not hand-written. It cannot list an endpoint that is not mounted, and it does not pretend to describe bodies it cannot measure."
        />

        <Reads reads={reads} onReload={load} />

        <div style={{ ...grid(200), marginTop: 16 }}>
          <Stat label="Operations" value={num(summary?.endpoints)} sub={`${num(summary?.paths)} paths`} tone="gold" />
          <Stat label="Tags" value={num(summary?.tags)} sub="one per route group" />
          <Stat label="Hand-written descriptions" value={num(summary?.curatedDescriptions)} sub={`of ${num(summary?.endpoints)} operations`} />
          <Stat label="Document size" value={`${(specBytes / 1024).toFixed(1)} KB`} sub={`spec version ${summary?.version ?? "—"}`} />
        </div>

        <Panel
          title="THE DOCUMENT"
          note="served live at /api/openapi.json — paste this URL into Swagger, Postman or Insomnia"
          icon={<Code2 size={16} color={GOLD} />}
          right={<Tag tone="dim">{summary?.openapi ?? "3.1.0"}</Tag>}
        >
          <p style={{ color: C.white, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, margin: 0, wordBreak: "break-all" }}>
            {typeof window !== "undefined" ? `${window.location.origin}/api/openapi.json` : "/api/openapi.json"}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Btn onClick={copyUrl}>{copied ? "Copied" : "Copy spec URL"}</Btn>
            <GhostBtn href="/api/openapi.json">Open raw JSON</GhostBtn>
            <GhostBtn href="/api/openapi/summary">Open summary</GhostBtn>
          </div>
          <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
            Regenerated on every request from the live route table, so adding or removing a route changes
            this document with no separate step. Better Auth's own <span style={{ color: C.white }}>/api/auth/*</span> surface is
            excluded — that library documents itself.
          </p>
        </Panel>

        <Panel
          title="WHAT THIS CONTRACT DOES NOT CLAIM"
          note="notClaimed[] from GET /api/openapi/summary — read straight off the server"
          icon={<ShieldAlert size={16} color={WARN} />}
        >
          {Array.isArray(summary?.notClaimed) && summary.notClaimed.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {summary.notClaimed.map((n, i) => (
                <li key={i} style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.8 }}>{n}</li>
              ))}
            </ul>
          ) : (
            <Missing label="NOT RETURNED" reason="The server did not return notClaimed[] on this read." />
          )}
          <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
            Publish this document privately. Authentication is enforced on only part of this surface today,
            so a public spec would be a map of every unprotected route.
          </p>
        </Panel>

        <Panel
          title="ENDPOINTS BY GROUP"
          note="counted off the document, not a stored list"
          icon={<Code2 size={16} color={GOLD} />}
          right={<Tag tone="dim">{tags.length} groups</Tag>}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setTag("all")}
              style={{
                background: tag === "all" ? GOLD : "transparent",
                color: tag === "all" ? C.black : C.white,
                border: `1px solid ${tag === "all" ? GOLD : C.border}`,
                borderRadius: 3, padding: "6px 11px", cursor: "pointer",
                fontFamily: FM, fontSize: 11.5, letterSpacing: "0.06em",
              }}
            >
              ALL {operations.length}
            </button>
            {tags.map(([name, count]) => (
              <button
                key={name}
                onClick={() => setTag(name)}
                style={{
                  background: tag === name ? GOLD : "transparent",
                  color: tag === name ? C.black : C.white,
                  border: `1px solid ${tag === name ? GOLD : C.border}`,
                  borderRadius: 3, padding: "6px 11px", cursor: "pointer",
                  fontFamily: FM, fontSize: 11.5, letterSpacing: "0.06em",
                }}
              >
                {name} {count}
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          title="OPERATIONS"
          note="paths{} from GET /api/openapi.json"
          icon={<Search size={16} color={GOLD} />}
          right={<Tag tone="dim">{shown.length} shown</Tag>}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by path, summary or method…"
            style={{
              width: "100%", background: C.black, color: C.white,
              border: `1px solid ${C.border}`, borderRadius: 3,
              padding: "10px 12px", fontFamily: FM, fontSize: 13, marginBottom: 12,
            }}
          />
          {shown.length === 0 ? (
            <Missing label="NO MATCHES" reason="No operation in the document matches that filter." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 84 }}>Method</th>
                    <th style={th}>Path</th>
                    <th style={th}>Summary</th>
                    <th style={{ ...th, width: 96 }}>Described</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.slice(0, 400).map((r) => (
                    <tr key={`${r.method} ${r.path}`}>
                      <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: METHOD_TONE[r.method] ?? C.white, letterSpacing: "0.06em" }}>
                        {r.method}
                      </td>
                      <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{r.path}</td>
                      <td style={{ ...td, color: r.curated ? C.white : C.muted }}>{r.summary || "—"}</td>
                      <td style={{ ...td, fontFamily: FM, fontSize: 11 }}>
                        {r.curated
                          ? <span style={{ color: GOLD }}>written</span>
                          : <span style={{ color: C.muted }}>mechanical</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shown.length > 400 && (
                <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, marginTop: 10, marginBottom: 0 }}>
                  Showing the first 400 of {shown.length}. Narrow the filter to see the rest.
                </p>
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="OPERATIONS WITH A REAL DESCRIPTION"
          note="the only ones whose behaviour is documented rather than merely listed"
          icon={<Download size={16} color={GOLD} />}
          right={<Tag tone="gold">{curatedRows.length}</Tag>}
        >
          {curatedRows.length === 0 ? (
            <Missing label="NONE" reason="The document returned no hand-written descriptions." />
          ) : (
            curatedRows.map((r) => (
              <div key={`${r.method} ${r.path}-doc`} style={{ borderTop: `1px solid ${C.border}`, padding: "12px 0" }}>
                <p style={{ margin: 0, fontFamily: FM, fontSize: 12, color: METHOD_TONE[r.method] ?? C.white }}>
                  {r.method} <span style={{ color: C.white }}>{r.path}</span>
                </p>
                <p style={{ margin: "6px 0 0", fontFamily: FH, fontSize: 14, color: GOLDB, letterSpacing: "0.04em" }}>
                  {r.summary}
                </p>
                <p style={{ margin: "6px 0 0", fontFamily: FB, fontSize: 13, lineHeight: 1.75, color: C.white }}>
                  {r.description}
                </p>
              </div>
            ))
          )}
        </Panel>

        <Disclaimer
          items={[
            "This document describes the API's shape. It is not a service-level or availability commitment.",
            "Request and response bodies are not modeled, so a 200 here does not tell an integrator what fields come back.",
            "TruckWithEase is not an ELD and is not FMCSA-registered. It is compliance and fleet software that runs alongside the ELD a driver already has.",
          ]}
        />
      </div>
    </div>
  );
}
