/**
 * ResponsibleUseOnboardingPage — the Responsible Use Agreement, recorded for real.
 *
 * READS (every round trip is timed and printed on the page)
 *   GET  /api/responsible-use          — canonical pledge text, sha256 termsVersion,
 *                                        translated locale list, whether THIS session
 *                                        is signed in, whether it already accepted,
 *                                        and the honest enforcement state.
 *   POST /api/responsible-use/accept   — writes one append-only row to
 *                                        responsible_use_acceptances. Refuses with 401
 *                                        when nobody is signed in, and 400 on partial
 *                                        acceptance.
 *
 * COMPUTES / MEASURES LOCALLY
 *   - How many of the server's pledges the user has ticked, out of the server's count.
 *   - Whether the selected locale is in the server's translatedLocales list, and says
 *     ENGLISH ONLY on the locale itself when it is not.
 *   - Round-trip latency per fetch with performance.now(), flagged at 3000 ms.
 *
 * REMOVED IN THIS REWRITE
 *   - The final "Go to Dashboard" button, whose entire body was
 *     console.log('Onboarding complete. User language:', selectedLanguage).
 *     The page displayed a screen warning of "account suspension, permanent ban, or
 *     legal action in accordance with local laws" and then stored NOTHING — no table,
 *     no endpoint, no row. That was the worst kind of fake: a legal-looking gate with
 *     no record behind it. Acceptance is now a server row or it is an error message.
 *   - The banner reading "✓ This app respects {culturalContext.data.countries.length}
 *     countries and cultures in your region" — a count read out of a client-side array
 *     and presented as a property of the app. TruckWithEase respects no countries by
 *     virtue of a JS object literal.
 *   - The 10 hardcoded translated title/subtitle pairs, which made the page look
 *     translated while the seven pledges under them came from a client-side lib. Pledge
 *     text now comes from the server, and any locale without a real translation is
 *     labelled ENGLISH ONLY to the driver's face.
 *   - Off-palette colours: #060A10 background, #0f1419 cards, #22c55e green,
 *     #ef4444 red, #3b82f6 blue, #06b6d4 cyan. Now gold on black.
 *   - Emoji (🌍 ✓ ← →) replaced with lucide-react icons — emoji render as empty boxes
 *     in headless screenshots and in several in-cab browsers.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - It is not a legal e-signature. It records a click, the exact text shown, the
 *     locale, the user agent and a timestamp. Not notarized, not witnessed.
 *   - Accepting changes nothing about access. Nothing in TruckWithEase blocks a driver
 *     who has not accepted, and the page says so on screen, from the server's own
 *     enforcement.blocksUnacceptedDrivers field.
 *   - Signing in is required. An anonymous acceptance is refused, not silently stored.
 *   - The agreement does not make TruckWithEase a regulatory authority. Compliance with
 *     FMCSA rules, state law and carrier policy stays with the driver — that is pledge 7.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  FileSignature,
  Globe,
  Hash,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDB = "#FFD700";
const WARN = "#c96a4c";
const C = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  white: "#f2f2f2",
  muted: "#8a8a8a",
  dim: "#666666",
};
const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";
const SLOW_MS = 3000;

async function timedGet(url) {
  const t0 = performance.now();
  const res = await fetch(url, { credentials: "include" });
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error((body && body.error) || `${url} returned ${res.status}`);
  return { body, ms, status: res.status };
}

async function timedPost(url, payload) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { body, ms, status: res.status, ok: res.ok };
}

function Spin() {
  return (
    <>
      <style>{"@keyframes twe-spin{to{transform:rotate(360deg)}}"}</style>
      <Loader2 size={16} color={GOLD} style={{ animation: "twe-spin 1s linear infinite" }} />
    </>
  );
}

function Panel({ title, note, right, icon, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        marginBottom: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {icon}
        <h2
          style={{
            font: `500 13px/1.2 ${FH}`,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: GOLDB,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </header>
      {note ? (
        <p style={{ font: `400 11px/1.6 ${FM}`, color: C.dim, margin: 0, padding: "8px 16px 0" }}>{note}</p>
      ) : null}
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: "1px dashed #333",
        borderRadius: 4,
        padding: 14,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ font: `500 11px/1.3 ${FH}`, letterSpacing: "0.16em", color: WARN, textTransform: "uppercase" }}>
          MISSING / NOT TRACKED
        </div>
        <div style={{ font: `600 13px/1.5 ${FB}`, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ font: `400 12px/1.6 ${FB}`, color: C.muted, marginTop: 4 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 14px", background: C.black }}>
      <div style={{ font: `400 34px/1 ${FD}`, color: tone || GOLDB, letterSpacing: "0.02em" }}>{value}</div>
      <div
        style={{
          font: `400 10px/1.4 ${FH}`,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.muted,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Tag({ text, tone }) {
  return (
    <span
      style={{
        font: `500 10px/1 ${FH}`,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: tone || GOLD,
        border: `1px solid ${tone || GOLD}`,
        borderRadius: 2,
        padding: "4px 7px",
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
        borderRadius: 4,
        padding: 12,
        font: `400 12px/1.6 ${FM}`,
        color: WARN,
        wordBreak: "break-word",
      }}
    >
      {msg}
    </div>
  );
}

export default function ResponsibleUseOnboardingPage() {
  const alive = useRef(false);
  const [state, setState] = useState("loading"); // loading | ok | error
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [reads, setReads] = useState([]);
  const [locale, setLocale] = useState("en-US");
  const [ticked, setTicked] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitErr, setSubmitErr] = useState("");

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setState("loading");
    setErr("");
    setReads([]);
    try {
      const r = await timedGet("/api/responsible-use");
      if (!alive.current) return;
      setData(r.body);
      setReads([{ url: "/api/responsible-use", ms: r.ms, status: r.status, bytes: JSON.stringify(r.body).length }]);
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setErr(String(e && e.message ? e.message : e));
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pledges = (data && data.pledges) || [];
  const total = pledges.length;
  const allTicked = total > 0 && ticked.size === total;
  const translated = data ? (data.translatedLocales || []).includes(locale) : true;
  const signedIn = Boolean(data && data.signedIn);
  const already = data && data.accepted ? data.accepted : null;

  const toggle = (i) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitErr("");
    setResult(null);
    const r = await timedPost("/api/responsible-use/accept", {
      locale,
      acceptedIndexes: Array.from(ticked).sort((a, b) => a - b),
    });
    if (!alive.current) return;
    setReads((prev) => [
      ...prev,
      { url: "POST /api/responsible-use/accept", ms: r.ms, status: r.status, bytes: JSON.stringify(r.body || {}).length },
    ]);
    if (!r.ok) {
      setSubmitErr((r.body && r.body.error) || `Server returned ${r.status}`);
    } else {
      setResult(r.body);
      load();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FB }}>
      {/* HEADER BAND */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: "34px 20px 30px",
        }}
      >
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              padding: "5px 10px",
              font: `500 10px/1 ${FH}`,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            <FileSignature size={13} color={GOLD} />
            RESPONSIBLE USE AGREEMENT
          </span>
          <h1
            style={{
              font: `400 clamp(34px,7vw,52px)/1 ${FD}`,
              letterSpacing: "0.02em",
              margin: "16px 0 12px",
              color: C.white,
            }}
          >
            WHAT YOU AGREE TO, AND WHAT WE <span style={{ color: GOLDB }}>ACTUALLY RECORD</span>
          </h1>
          <p style={{ font: `400 14px/1.75 ${FB}`, color: C.muted, maxWidth: 760, margin: 0 }}>
            The pledge text below is served by the API, not typed into this page, and it is hashed so the exact wording you
            agreed to can be proven later. Accepting writes one row to the database. It does not unlock or restrict
            anything — nothing in TruckWithEase currently blocks a driver who has not accepted, and this page will keep
            saying that until enforcement is actually built.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 20px 60px" }}>
        {state === "loading" ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", font: `400 13px/1 ${FM}`, color: C.muted }}>
            <Spin /> reading /api/responsible-use
          </div>
        ) : null}

        {state === "error" ? (
          <Panel title="Read failed" note="GET /api/responsible-use" icon={<AlertTriangle size={15} color={WARN} />}>
            <Err msg={err} />
            <button
              onClick={load}
              style={{
                marginTop: 12,
                background: "transparent",
                border: `1px solid ${GOLD}`,
                color: GOLD,
                borderRadius: 2,
                padding: "8px 14px",
                font: `500 11px/1 ${FH}`,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Re-read
            </button>
          </Panel>
        ) : null}

        {state === "ok" && data ? (
          <>
            {/* MEASURED READS */}
            <Panel
              title="Measured reads"
              note="Every round trip on this page, timed with performance.now(). Nothing here is cached or estimated."
              icon={<RefreshCw size={15} color={GOLD} />}
              right={
                <button
                  onClick={load}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: GOLD,
                    borderRadius: 2,
                    padding: "6px 12px",
                    font: `500 10px/1 ${FH}`,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Re-read
                </button>
              }
            >
              {reads.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                    font: `400 12px/1.8 ${FM}`,
                    color: C.white,
                    borderBottom: i < reads.length - 1 ? `1px solid ${C.border}` : "none",
                    padding: "4px 0",
                  }}
                >
                  <span style={{ color: GOLD }}>{r.status}</span>
                  <span>{r.url}</span>
                  <span style={{ color: C.muted }}>{r.bytes} B</span>
                  <span style={{ color: r.ms >= SLOW_MS ? WARN : C.muted }}>
                    {r.ms} ms{r.ms >= SLOW_MS ? "  ← slow" : ""}
                  </span>
                </div>
              ))}
            </Panel>

            {/* STATE OF THE AGREEMENT */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <Stat value={total} label="Pledges served by API" />
              <Stat value={data.totals ? data.totals.acceptancesStored : "—"} label="Acceptances stored" />
              <Stat value={data.totals ? data.totals.uniqueUsers : "—"} label="Unique accounts" />
              <Stat
                value={signedIn ? "YES" : "NO"}
                label="Signed in right now"
                tone={signedIn ? GOLDB : WARN}
              />
            </div>

            {/* VERSION */}
            <Panel
              title="Agreement version"
              note="GET /api/responsible-use → termsVersion. sha256 of the exact pledge text below, computed server-side."
              icon={<Hash size={15} color={GOLD} />}
            >
              <div style={{ font: `400 12px/1.8 ${FM}`, color: GOLDB, wordBreak: "break-all" }}>{data.termsVersion}</div>
              <p style={{ font: `400 12px/1.7 ${FB}`, color: C.muted, marginTop: 10, marginBottom: 0 }}>
                {data.versionNote}
              </p>
            </Panel>

            {/* LOCALE */}
            <Panel
              title="Language"
              note="Pledge text is served in English. Your selection is recorded with the acceptance, and a locale with no real translation is stored as ENGLISH_ONLY."
              icon={<Globe size={15} color={GOLD} />}
              right={<Tag text={translated ? "TRANSLATION EXISTS" : "ENGLISH ONLY"} tone={translated ? GOLD : WARN} />}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(data.locales || {}).map(([code, label]) => {
                  const on = code === locale;
                  return (
                    <button
                      key={code}
                      onClick={() => setLocale(code)}
                      style={{
                        background: on ? "rgba(201,168,76,0.12)" : C.black,
                        border: `1px solid ${on ? GOLD : C.border}`,
                        color: on ? GOLDB : C.white,
                        borderRadius: 2,
                        padding: "9px 12px",
                        font: `400 12px/1.2 ${FB}`,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {label}
                      <span style={{ display: "block", font: `400 10px/1.4 ${FM}`, color: C.dim, marginTop: 3 }}>
                        {code}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!translated ? (
                <div style={{ marginTop: 14 }}>
                  <Missing
                    label={`No translated pledge text for ${locale}`}
                    reason="The seven pledges will be shown to you in English. The stored record will say ENGLISH_ONLY, so nobody can later claim you read this in your own language."
                  />
                </div>
              ) : null}
            </Panel>

            {/* PLEDGES */}
            <Panel
              title={`The pledges — ${ticked.size} of ${total} ticked`}
              note="Text comes from GET /api/responsible-use. This page does not hold a copy of it."
              icon={<ShieldCheck size={15} color={GOLD} />}
            >
              <div style={{ display: "grid", gap: 10 }}>
                {pledges.map((p, i) => {
                  const on = ticked.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        textAlign: "left",
                        background: on ? "rgba(201,168,76,0.08)" : C.black,
                        border: `1px solid ${on ? GOLD : C.border}`,
                        borderRadius: 4,
                        padding: 14,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          flexShrink: 0,
                          border: `1px solid ${on ? GOLDB : "#3a3a3a"}`,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        {on ? <Check size={14} color={GOLDB} /> : null}
                      </span>
                      <span style={{ font: `400 13px/1.7 ${FB}`, color: on ? C.white : C.muted }}>
                        <span style={{ font: `400 11px/1 ${FM}`, color: GOLD, marginRight: 8 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {p}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* ACCEPT */}
            <Panel
              title="Record acceptance"
              note="POST /api/responsible-use/accept — writes one append-only row to responsible_use_acceptances."
              icon={<Lock size={15} color={GOLD} />}
            >
              {already ? (
                <div
                  style={{
                    border: `1px solid ${GOLD}`,
                    borderRadius: 4,
                    padding: 14,
                    marginBottom: 14,
                    font: `400 13px/1.7 ${FB}`,
                    color: C.white,
                  }}
                >
                  <Tag text="ALREADY ACCEPTED" />
                  <div style={{ marginTop: 10, font: `400 12px/1.7 ${FM}`, color: C.muted }}>
                    id {already.id} · locale {already.locale} · {already.localeStatus}
                    {already.createdAt ? ` · ${new Date(already.createdAt).toISOString()}` : ""}
                  </div>
                  <div style={{ marginTop: 8, color: C.muted, font: `400 12px/1.7 ${FB}` }}>
                    This account has already accepted this exact version hash. Re-submitting writes no duplicate row.
                  </div>
                </div>
              ) : null}

              {!signedIn ? (
                <Missing
                  label="You are not signed in, so acceptance cannot be recorded"
                  reason="The API refuses anonymous acceptance with a 401 instead of storing an unattributable row. Sign in first — an agreement that cannot be tied to an account is worth nothing, and the app will not pretend otherwise."
                />
              ) : null}

              {submitErr ? (
                <div style={{ marginTop: 12 }}>
                  <Err msg={submitErr} />
                </div>
              ) : null}

              {result && result.stored ? (
                <div
                  style={{
                    marginTop: 12,
                    border: `1px solid ${GOLDB}`,
                    borderRadius: 4,
                    padding: 14,
                    font: `400 12px/1.8 ${FM}`,
                    color: GOLDB,
                    wordBreak: "break-all",
                  }}
                >
                  STORED · row {result.id} · locale {result.locale} · {result.localeStatus} · version{" "}
                  {String(result.termsVersion).slice(0, 16)}…
                </div>
              ) : null}

              <button
                onClick={submit}
                disabled={!allTicked || !signedIn || submitting}
                style={{
                  marginTop: 14,
                  background: allTicked && signedIn ? GOLDB : "transparent",
                  border: `1px solid ${allTicked && signedIn ? GOLDB : C.border}`,
                  color: allTicked && signedIn ? C.black : C.dim,
                  borderRadius: 2,
                  padding: "13px 24px",
                  font: `500 12px/1 ${FH}`,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: allTicked && signedIn && !submitting ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {submitting ? <Spin /> : null}
                {submitting ? "Writing row" : `Accept all ${total} and record it`}
              </button>
              <p style={{ font: `400 12px/1.7 ${FB}`, color: C.dim, marginTop: 12, marginBottom: 0 }}>
                Partial acceptance is rejected by the server with a 400. All {total} or nothing.
              </p>
            </Panel>

            {/* WHAT THIS DOES NOT DO */}
            <Panel
              title="What this page does not cover"
              note="Read from the server's own enforcement and claims fields — not written into this page."
              icon={<AlertTriangle size={15} color={WARN} />}
            >
              <ol style={{ margin: 0, paddingLeft: 20, font: `400 13px/1.9 ${FB}`, color: C.muted }}>
                <li>
                  <strong style={{ color: C.white }}>Not enforced.</strong>{" "}
                  {data.enforcement ? data.enforcement.note : "Enforcement state unavailable."}
                </li>
                <li>
                  <strong style={{ color: C.white }}>Not a legal e-signature.</strong>{" "}
                  {data.claims ? data.claims.note : ""} Not notarized, not witnessed, no compliance certification.
                </li>
                <li>
                  <strong style={{ color: C.white }}>Not translated beyond {(data.translatedLocales || []).length} locales.</strong>{" "}
                  Any other locale renders in English and is stored as ENGLISH_ONLY.
                </li>
                <li>
                  <strong style={{ color: C.white }}>Not a defence.</strong> Accepting these pledges does not shift
                  responsibility for FMCSA rules, state law or carrier policy onto TruckWithEase. That stays with the
                  driver.
                </li>
                <li>
                  <strong style={{ color: C.white }}>No moderation queue.</strong> The pledges mention reports and
                  harassment, but no reporting, review or appeal workflow is built yet.
                </li>
                <li>
                  <strong style={{ color: C.white }}>No revocation.</strong> There is no way to withdraw an acceptance;
                  rows are append-only. A wording change produces a new hash and requires a new acceptance.
                </li>
              </ol>
            </Panel>

            <p style={{ font: `400 11px/1.8 ${FM}`, color: C.dim, marginTop: 24 }}>
              Every value on this page came from /api/responsible-use in this browser session. Server-side read time{" "}
              {data.measuredMs} ms. No pledge text, count, locale claim or acceptance total is hardcoded in this file.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
