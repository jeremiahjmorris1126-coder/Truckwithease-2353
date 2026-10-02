/**
 * TWKIT — the shared house-pattern scaffolding used by the rewritten pages.
 *
 * Every rewritten page in this app was carrying its own identical copies of
 * Panel / Missing / Tag / Stat / timedGet / Wordmark. This is that same code in
 * one place so the Intelligence family cannot drift apart visually. It is presentation
 * only. It fetches nothing on its own and invents no value: `timedGet` reports the
 * real HTTP status, the real byte count and the real elapsed milliseconds, and
 * throws a decorated Error on anything that is not 2xx.
 *
 * Brand: gold on black. No navy, no orange, no emoji, no runtime font @import.
 */
import { AlertTriangle, RefreshCw } from "lucide-react";

export const GOLD = "#C9A84C";
export const GOLDB = "#FFD700";
export const WARN = "#c96a4c";
export const C = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  white: "#f2f2f2",
  muted: "#8a8a8a",
  dim: "#666666",
};
export const FD = "'Bebas Neue', sans-serif";
export const FH = "'Oswald', sans-serif";
export const FB = "'Inter', sans-serif";
export const FM = "'JetBrains Mono', monospace";
export const SLOW_MS = 3000;

/** GET with a measured round trip. Throws a decorated Error on non-2xx. */
export async function timedGet(url) {
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(url, { headers: { accept: "application/json" } });
  } catch (e) {
    const err = new Error(`Network error reaching ${url}: ${e.message}`);
    err.status = 0; err.ms = Math.round(performance.now() - t0); err.url = url;
    throw err;
  }
  const text = await res.text();
  const ms = Math.round(performance.now() - t0);
  if (!res.ok) {
    const err = new Error(`${url} returned HTTP ${res.status}. ${text.slice(0, 300)}`);
    err.status = res.status; err.ms = ms; err.url = url;
    throw err;
  }
  let body;
  try { body = JSON.parse(text); }
  catch {
    const err = new Error(`${url} returned HTTP ${res.status} but the body is not JSON: ${text.slice(0, 200)}`);
    err.status = res.status; err.ms = ms; err.url = url;
    throw err;
  }
  return { body, ms, status: res.status, url, bytes: new Blob([text]).size };
}

export function Wordmark({ size = 20 }) {
  return (
    <span style={{ fontFamily: FD, fontSize: size, letterSpacing: "0.06em", color: C.white, lineHeight: 1 }}>
      TRUCK<span style={{ color: GOLDB }}>WITH</span>EASE
    </span>
  );
}

export function Panel({ title, note, right, icon, children }) {
  return (
    <section style={{ border: `1px solid ${C.border}`, background: C.card, borderRadius: 4, marginBottom: 22 }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {icon ? <span style={{ color: GOLD, display: "flex" }}>{icon}</span> : null}
          <h2 style={{ fontFamily: FH, fontSize: 14, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: C.white, margin: 0 }}>{title}</h2>
        </div>
        {right}
      </header>
      {note ? (
        <p style={{ margin: 0, padding: "10px 18px", borderBottom: `1px solid ${C.border}`, fontFamily: FM, fontSize: 11.5, color: C.muted, lineHeight: 1.7 }}>{note}</p>
      ) : null}
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

export function Missing({ label = "MISSING / NOT TRACKED", reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 4, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: FH, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: WARN }}>{label}</div>
        {reason ? <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.7 }}>{reason}</div> : null}
      </div>
    </div>
  );
}

export function Tag({ children, tone = "gold" }) {
  const col = tone === "warn" ? WARN : tone === "dim" ? C.dim : GOLD;
  return (
    <span style={{
      display: "inline-block", fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em",
      textTransform: "uppercase", color: col, border: `1px solid ${col}44`, background: `${col}12`,
      borderRadius: 3, padding: "3px 8px", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function Stat({ label, value, sub, tone }) {
  const col = tone === "warn" ? WARN : tone === "dim" ? C.dim : GOLDB;
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.black, borderRadius: 4, padding: "14px 16px" }}>
      <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }}>{label}</div>
      <div style={{ fontFamily: FD, fontSize: 34, color: col, lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ fontFamily: FB, fontSize: 12, color: C.dim, marginTop: 4, lineHeight: 1.6 }}>{sub}</div> : null}
    </div>
  );
}

export function Btn({ children, onClick, href, disabled }) {
  const style = {
    display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FH, fontSize: 12,
    letterSpacing: "0.16em", textTransform: "uppercase", color: disabled ? C.dim : C.black,
    background: disabled ? "transparent" : GOLD, border: `1px solid ${disabled ? C.border : GOLD}`,
    borderRadius: 3, padding: "9px 16px", cursor: disabled ? "not-allowed" : "pointer", textDecoration: "none",
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button type="button" onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

export function GhostBtn({ children, onClick, href }) {
  const style = {
    display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FH, fontSize: 12,
    letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, background: "transparent",
    border: `1px solid ${GOLD}55`, borderRadius: 3, padding: "9px 16px", cursor: "pointer", textDecoration: "none",
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button type="button" onClick={onClick} style={style}>{children}</button>;
}

export function Err({ error, onRetry }) {
  return (
    <div style={{ border: `1px solid ${WARN}55`, background: "#1a1010", borderRadius: 4, padding: 18 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <AlertTriangle size={16} color={WARN} />
        <span style={{ fontFamily: FH, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: WARN }}>Read failed</span>
      </div>
      <pre style={{ fontFamily: FM, fontSize: 12, color: C.white, whiteSpace: "pre-wrap", margin: "0 0 14px", lineHeight: 1.7 }}>
        {String(error?.message || error)}
      </pre>
      {onRetry ? <GhostBtn onClick={onRetry}><RefreshCw size={13} /> Retry</GhostBtn> : null}
    </div>
  );
}

export function Spin({ label = "Reading the server…" }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center", fontFamily: FM, fontSize: 12.5, color: C.muted, letterSpacing: "0.1em" }}>
      {label}
    </div>
  );
}

/** Page header band. `eyebrow` gets a lucide icon, `accent` is the gold phrase in the title. */
export function Header({ icon, eyebrow, title, accent, lead }) {
  return (
    <header style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`, padding: "34px 0 30px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px" }}>
        <a href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: 22 }}><Wordmark size={19} /></a>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${GOLD}44`,
          borderRadius: 999, padding: "5px 13px", marginBottom: 16,
        }}>
          <span style={{ color: GOLD, display: "flex" }}>{icon}</span>
          <span style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD }}>{eyebrow}</span>
        </div>
        <h1 style={{ fontFamily: FD, fontSize: "clamp(38px,7vw,68px)", lineHeight: 1.02, color: C.white, margin: "0 0 14px", letterSpacing: "0.02em" }}>
          {title} <span style={{ color: GOLDB }}>{accent}</span>
        </h1>
        <p style={{ fontFamily: FB, fontSize: 15.5, color: C.muted, lineHeight: 1.85, maxWidth: 780, margin: 0 }}>{lead}</p>
      </div>
    </header>
  );
}

/** The measured-reads table every rewritten page carries. */
export function Reads({ reads, onReload }) {
  return (
    <Panel
      title="Measured reads"
      note="Every HTTP round trip this page made, with the status the server returned, the body size and the elapsed time measured in the browser."
      right={<GhostBtn onClick={onReload}><RefreshCw size={13} /> Re-read</GhostBtn>}
    >
      {reads.length === 0 ? <Missing label="NO READS RECORDED" reason="The page has not completed a request yet." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FM, fontSize: 12 }}>
            <thead>
              <tr>
                {["Endpoint", "Status", "Bytes", "ms"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Endpoint" ? "left" : "right", padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.muted, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 10.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reads.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.white }}>{r.url}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: r.status >= 200 && r.status < 300 ? GOLD : WARN, textAlign: "right" }}>{r.status || "ERR"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: C.muted, textAlign: "right" }}>{r.bytes ?? "—"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, color: r.ms >= SLOW_MS ? WARN : C.muted, textAlign: "right" }}>
                    {r.ms}{r.ms >= SLOW_MS ? "  ← slow" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/** The standing platform disclaimer. Identical wording on every page that carries it. */
export function Disclaimer({ items }) {
  return (
    <Panel title="What this page does not do">
      <ol style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 2 }}>
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ol>
      <p style={{ fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.9, marginTop: 18, marginBottom: 0, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        TruckWithEase is compliance and fleet management software that runs alongside the ELD a driver already has.
        It is not an ELD, it is not registered with FMCSA, and it files nothing with any agency.
      </p>
    </Panel>
  );
}

export const page = { minHeight: "100vh", background: C.black, color: C.white, fontFamily: FB };
export const wrap = { maxWidth: 1180, margin: "0 auto", padding: "30px 22px 70px" };
export const grid = (min = 200) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 14 });
export const th = { textAlign: "left", padding: "9px 10px", borderBottom: `1px solid ${C.border}`, color: C.muted, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 10.5, fontFamily: FM };
export const td = { padding: "9px 10px", borderBottom: `1px solid ${C.border}`, color: C.white, fontFamily: FB, fontSize: 13 };
export const tdNum = { ...td, textAlign: "right", fontFamily: FM, fontSize: 12.5 };
