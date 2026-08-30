/**
 * THE SEALED LINE — /sealed-line
 *
 * READS (live, every value on this page comes from these round trips)
 *   GET  /api/sealed-line                 REQUIRED — counts, chain head, blockers, assumptions,
 *                                          recent conversations
 *   GET  /api/sealed-line/chain           optional — full replay verifier: every link recomputed
 *                                          from the stored measurements AND the live message text
 *   GET  /api/clock-ledger/open-intervals optional — abandoned open hos_logs rows, what closing
 *                                          each one would recover, and the repairs already logged
 *   POST /api/sealed-line/seal            on click — seals every unsealed sms_messages row
 *   POST /api/sealed-line/answer          on submit — parses a broker ask and returns a legality
 *                                          verdict from the driver's live clock. Sends nothing.
 *   POST /api/clock-ledger/open-intervals/close  on click — closes one stale row at the start of
 *                                          the driver's next interval and logs an audit row.
 *   GET  /api/sealed-line/coverage        optional — per-driver phone/hos_logs coverage: whether a
 *                                          clock can be attached to that driver's messages at all
 *   POST /api/sealed-line/link-driver     on submit — writes a normalized +1XXXXXXXXXX to a driver
 *   POST /api/sealed-line/reseal-unresolved  on click — APPENDS clock-carrying seals for messages
 *                                          sealed earlier with a null clock. Edits nothing.
 *
 * COMPUTES LOCALLY
 *   Round-trip latency per read (timedGet), flagged at >= 3000 ms. Nothing else. Every hash,
 *   minute and verdict rendered here is computed server-side.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   The seal is tamper-EVIDENT, not notarization, not a legal certification, and not a
 *   third-party timestamp authority. It proves stored measurements and message bodies have not
 *   changed since sealing. It does not prove the hos_logs rows were correct when captured.
 *   No prediction, no score, no confidence percentage. TruckWithEase is not an ELD.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Hash, Link2, MessageSquare, Phone, Send, ShieldAlert, Wrench } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Btn, GhostBtn, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const short = (h) => (typeof h === "string" && h.length > 16 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h || "—");
const num = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString());
const hrsOf = (m) => (m === null || m === undefined ? "—" : `${(m / 60).toFixed(2)} h`);
const when = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

async function post(url, body) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  const ms = Math.round(performance.now() - t0);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 400) }; }
  return { ok: res.ok, status: res.status, body: parsed, ms, url, bytes: new Blob([text]).size };
}

export default function SealedLinePage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [reads, setReads] = useState([]);
  const [sl, setSl] = useState(null);
  const [chain, setChain] = useState(null);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const [sealResult, setSealResult] = useState(null);
  const [closeResult, setCloseResult] = useState(null);
  const [ask, setAsk] = useState("can you take 400 more miles and be there by 6?");
  const [driverId, setDriverId] = useState("drv-1");
  const [answer, setAnswer] = useState(null);
  const [cov, setCov] = useState(null);
  const [linkDriverId, setLinkDriverId] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkResult, setLinkResult] = useState(null);
  const [resealResult, setResealResult] = useState(null);
  const [ar, setAr] = useState(null);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const slR = await timedGet("/api/sealed-line");
      if (!alive.current) return;
      const collected = [slR];
      setSl(slR.body);

      const opt = await Promise.allSettled([
        timedGet("/api/sealed-line/chain"),
        timedGet("/api/clock-ledger/open-intervals"),
        timedGet("/api/sealed-line/coverage"),
        timedGet("/api/comms/auto-reply"),
      ]);
      if (!alive.current) return;
      const [chainR, openR, covR, arR] = opt;
      if (chainR.status === "fulfilled") { collected.push(chainR.value); setChain(chainR.value.body); }
      if (openR.status === "fulfilled") { collected.push(openR.value); setOpen(openR.value.body); }
      if (covR.status === "fulfilled") { collected.push(covR.value); setCov(covR.value.body); }
      if (arR.status === "fulfilled") { collected.push(arR.value); setAr(arR.value.body); }

      setReads(collected);
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setError(e && e.message ? e.message : String(e));
      setState("error");
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const doSeal = async () => {
    setBusy("seal");
    const r = await post("/api/sealed-line/seal", {});
    setSealResult(r);
    setReads((prev) => [...prev, r]);
    setBusy(null);
    await load();
  };

  const doClose = async (rowId) => {
    setBusy(`close:${rowId}`);
    const r = await post("/api/clock-ledger/open-intervals/close", { rowId, actor: "web:/sealed-line" });
    setCloseResult(r);
    setReads((prev) => [...prev, r]);
    setBusy(null);
    await load();
  };

  const doLink = async () => {
    setBusy("link");
    const r = await post("/api/sealed-line/link-driver", { driverId: linkDriverId.trim(), phone: linkPhone.trim() });
    setLinkResult(r);
    setReads((prev) => [...prev, r]);
    setBusy(null);
    await load();
  };

  const doReseal = async () => {
    setBusy("reseal");
    const r = await post("/api/sealed-line/reseal-unresolved", {});
    setResealResult(r);
    setReads((prev) => [...prev, r]);
    setBusy(null);
    await load();
  };

  const doAnswer = async () => {
    setBusy("answer");
    const r = await post("/api/sealed-line/answer", { driverId, text: ask, send: false });
    setAnswer(r);
    setReads((prev) => [...prev, r]);
    setBusy(null);
  };

  if (state === "loading") return <div style={page}><Spin label="Reading /api/sealed-line…" /></div>;
  if (state === "error") return <div style={page}><div style={wrap}><Err error={error} onRetry={load} /></div></div>;

  const counts = sl?.counts || {};
  const head = sl?.chain || {};
  const verdict = answer?.body || null;
  const verdictTone = verdict && (verdict.verdict === "fits" ? "gold" : verdict.verdict === "unparsed" || verdict.verdict === "no_clock" ? "dim" : "warn");

  return (
    <div style={page}>
      <Header
        icon={<Link2 size={13} />}
        eyebrow="The Sealed Line"
        title="Every dispatch message,"
        accent="clock-stamped and chained."
        lead="Each message on a fleet number is sealed with the driver's duty clock as of the second that message existed — recomputed from hos_logs intervals, not today's numbers — and linked into an append-only sha256 chain. A detention or refusal dispute replays line by line with the clock proof attached to each line."
      />

      <div style={wrap}>
        <Panel
          title="Chain head"
          icon={<Hash size={15} />}
          note={head.construction}
          right={<Btn onClick={doSeal} disabled={busy === "seal"}>{busy === "seal" ? "Sealing…" : "Seal unsealed messages"}</Btn>}
        >
          <div style={grid(210)}>
            <Stat label="Messages on fleet numbers" value={num(counts.messagesTotal)} sub={`${num(counts.conversations)} conversation(s)`} />
            <Stat label="Sealed" value={num(counts.sealed)} sub={`${num(counts.unsealed)} not yet sealed`} tone={counts.unsealed ? "warn" : "gold"} />
            <Stat label="Sealed with a resolved clock" value={num(counts.sealedWithClock)} sub={`${num(counts.sealedWithoutClock)} sealed with null clock fields and a stated reason — never a fabricated clock`} />
            <Stat label="Chain head seq" value={num(head.headSeq)} sub={short(head.headHash)} />
            <Stat
              label="Replay verified"
              value={chain ? (chain.verified ? "YES" : "NO") : "—"}
              sub={chain ? `${num(chain.rows)} link(s) recomputed${chain.bodyTextChecked ? " + live body text re-hashed" : ""}` : "chain read did not return"}
              tone={chain && !chain.verified ? "warn" : "gold"}
            />
            <Stat label="Clock answers logged" value={num(counts.clockAnswers)} sub="rows in clock_answers" />
          </div>

          <div style={{ marginTop: 16, fontFamily: FM, fontSize: 11.5, color: C.muted, lineHeight: 1.8, wordBreak: "break-all" }}>
            headHash {head.headHash || "—"}
          </div>

          {sealResult ? (
            <div style={{ marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontFamily: FM, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
              POST /api/sealed-line/seal → HTTP {sealResult.status} · {sealResult.bytes} bytes · {sealResult.ms} ms<br />
              sealed this request {num(sealResult.body?.sealedThisRequest)} · already sealed before {num(sealResult.body?.alreadySealedBefore)}<br />
              {sealResult.body?.idempotent}
            </div>
          ) : null}

          {chain && chain.breaks && chain.breaks.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <Missing label={`${chain.breaks.length} CHAIN BREAK(S) REPORTED`} reason={chain.breaks.map((b) => `seq ${b.seq}: ${b.reason}`).join(" · ")} />
            </div>
          ) : null}

          {chain?.verifiedNote ? (
            <p style={{ fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.9, marginTop: 14, marginBottom: 0 }}>{chain.verifiedNote}</p>
          ) : null}
        </Panel>

        <Panel
          title="Verdict engine — read a broker ask against a real clock"
          icon={<MessageSquare size={15} />}
          note="The ask is parsed for miles, hours and a deadline, then answered from 49 CFR 395 arithmetic against that driver's live clock. Nothing is sent to anyone: sending stays on POST /api/comms/messages so Twilio's own SID, status and errors are stored verbatim."
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="driverId"
              style={{ fontFamily: FM, fontSize: 12.5, background: C.black, color: C.white, border: `1px solid ${C.border}`, borderRadius: 3, padding: "10px 12px", width: 130 }}
            />
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="paste the broker's text"
              style={{ flex: "1 1 340px", fontFamily: FB, fontSize: 13.5, background: C.black, color: C.white, border: `1px solid ${C.border}`, borderRadius: 3, padding: "10px 12px" }}
            />
            <Btn onClick={doAnswer} disabled={busy === "answer" || !ask.trim()}>{busy === "answer" ? "Reading…" : "Get verdict"}</Btn>
          </div>

          {verdict ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Tag tone={verdictTone}>{String(verdict.verdict || "—").replace(/_/g, " ")}</Tag>
                {verdict.driver?.name ? <Tag tone="dim">{verdict.driver.name}</Tag> : null}
                {verdict.ask?.parsed?.intent ? <Tag tone="dim">{verdict.ask.parsed.intent.replace(/_/g, " ")}</Tag> : null}
              </div>
              <p style={{ fontFamily: FB, fontSize: 14, color: C.white, lineHeight: 1.9, marginTop: 14, marginBottom: 0 }}>{verdict.verdictReason || "—"}</p>

              <div style={{ ...grid(190), marginTop: 16 }}>
                <Stat label="Driving left" value={hrsOf(verdict.clock?.drivingRemainingMin)} sub="11-hour clock" />
                <Stat label="Window left" value={hrsOf(verdict.clock?.windowRemainingMin)} sub="14-hour window" />
                <Stat label="Cycle left" value={hrsOf(verdict.clock?.cycleRemainingMin)} sub="60 h / 7 days" />
                <Stat label="Break due" value={verdict.clock?.breakDueMin ? `${verdict.clock.breakDueMin} min` : "no"} sub="30-minute break after 8 h driving" tone={verdict.clock?.breakDueMin ? "warn" : "gold"} />
              </div>

              {verdict.draftReply ? (
                <div style={{ marginTop: 16, border: `1px solid ${GOLD}44`, background: `${GOLD}0c`, borderRadius: 4, padding: 14 }}>
                  <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>Draft reply — not sent</div>
                  <p style={{ fontFamily: FB, fontSize: 14, color: C.white, lineHeight: 1.8, margin: "8px 0 0" }}>{verdict.draftReply}</p>
                </div>
              ) : null}

              {Array.isArray(verdict.assumptions) && verdict.assumptions.length > 0 ? (
                <ul style={{ margin: "16px 0 0", paddingLeft: 20, fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.9 }}>
                  {verdict.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              ) : null}

              {Array.isArray(verdict.ask?.parsed?.matchedOn) && verdict.ask.parsed.matchedOn.length > 0 ? (
                <div style={{ marginTop: 12, fontFamily: FM, fontSize: 11.5, color: C.dim, lineHeight: 1.8 }}>
                  parsed on: {verdict.ask.parsed.matchedOn.join(" · ")}
                </div>
              ) : null}

              {answer && !answer.ok ? (
                <div style={{ marginTop: 12 }}>
                  <Missing label={`POST /answer RETURNED HTTP ${answer.status}`} reason={JSON.stringify(answer.body).slice(0, 400)} />
                </div>
              ) : null}
            </div>
          ) : (
            <p style={{ fontFamily: FB, fontSize: 13, color: C.dim, lineHeight: 1.8, marginTop: 14, marginBottom: 0 }}>
              No verdict requested yet. The button posts the text above to /api/sealed-line/answer.
            </p>
          )}
        </Panel>

        <Panel
          title="Sealed lines — replay"
          icon={<Link2 size={15} />}
          note="Each row is one message with the seal that protects it and the clock as it stood at that moment. A null clock means neither end of the message matched a phone number on the drivers table; the body and timestamp are still sealed."
        >
          {!chain || !Array.isArray(chain.entries) || chain.entries.length === 0 ? (
            <Missing label="NO SEALED LINES YET" reason={`sms_messages holds ${num(counts.messagesTotal)} row(s) and ${num(counts.unsealed)} are unsealed. Use "Seal unsealed messages" above. Nothing is invented to fill this table.`} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Seq</th>
                    <th style={th}>When it existed</th>
                    <th style={th}>Direction</th>
                    <th style={th}>Driver</th>
                    <th style={th}>Duty status</th>
                    <th style={{ ...th, textAlign: "right" }}>Driving left</th>
                    <th style={{ ...th, textAlign: "right" }}>Window left</th>
                    <th style={th}>Seal</th>
                    <th style={th}>Chain hash</th>
                  </tr>
                </thead>
                <tbody>
                  {chain.entries.map((e) => (
                    <tr key={e.seq}>
                      <td style={{ ...td, fontFamily: FM }}>{e.seq}</td>
                      <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{when(e.occurredAt)}</td>
                      <td style={td}>{e.direction}</td>
                      <td style={td}>{e.driverName || <span style={{ color: WARN }}>unresolved</span>}</td>
                      <td style={td}>{e.dutyStatusAtMessage || "—"}</td>
                      <td style={tdNum}>{hrsOf(e.drivingRemainingMin)}</td>
                      <td style={tdNum}>{hrsOf(e.windowRemainingMin)}</td>
                      <td style={{ ...td, fontFamily: FM, fontSize: 11 }}>
                        {e.supersedesSealedId
                          ? <span style={{ color: GOLDB }}>clock added later — supersedes {e.supersedesSealedId}</span>
                          : <span style={{ color: C.muted }}>{e.sealReason || "first seal"}</span>}
                      </td>
                      <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>{short(e.chainHash)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {chain && Array.isArray(chain.entries) && chain.entries.some((e) => !e.clockResolved) ? (
            <div style={{ marginTop: 14, fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.9 }}>
              {chain.entries.filter((e) => !e.clockResolved)[0].clockUnresolvedReason}
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Driver ↔ fleet number coverage"
          icon={<Phone size={15} />}
          note={cov?.howMatchingWorks}
          right={<GhostBtn onClick={doReseal}>{busy === "reseal" ? "Appending…" : "Append clocks to unresolved seals"}</GhostBtn>}
        >
          {!cov ? (
            <Missing label="COVERAGE READ DID NOT RETURN" reason="GET /api/sealed-line/coverage was not answered on this load." />
          ) : (
            <>
              <div style={grid(200)}>
                <Stat label="Drivers a clock can be read for" value={`${num(cov.driversClockReadable)} / ${num(cov.drivers)}`} sub="needs a usable phone AND at least one hos_logs row" />
                <Stat label="Without a usable phone" value={num(cov.driversWithoutUsablePhone)} tone={cov.driversWithoutUsablePhone ? "warn" : "gold"} sub="no phone match = sealed body, null clock" />
                <Stat label="Messages matched to a driver" value={`${num(cov.messagesMatchedToADriver)} / ${num(cov.messages)}`} tone={cov.messagesMatchedToADriver < cov.messages ? "warn" : "gold"} sub="matched on the last 10 digits of either end" />
                <Stat label="Sealed rows with no clock" value={num(cov.sealedRowsWithoutAClock)} tone={cov.sealedRowsWithoutAClock ? "warn" : "gold"} sub="fixable by linking the number, then appending" />
              </div>

              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Driver</th>
                      <th style={th}>Phone stored</th>
                      <th style={th}>Normalized</th>
                      <th style={{ ...th, textAlign: "right" }}>hos_logs rows</th>
                      <th style={{ ...th, textAlign: "right" }}>Messages matched</th>
                      <th style={th}>Clock readable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cov.rows || []).map((r) => (
                      <tr key={r.driverId}>
                        <td style={td}>{r.driverName} <span style={{ fontFamily: FM, fontSize: 11, color: C.dim }}>{r.driverId}</span></td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{r.phoneStored || <span style={{ color: WARN }}>none</span>}</td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{r.phoneNormalized || <span style={{ color: WARN }}>{r.phoneProblem}</span>}</td>
                        <td style={tdNum}>{num(r.hosLogRows)}</td>
                        <td style={tdNum}>{num(r.messagesMatched)}</td>
                        <td style={td}>{r.clockReadable ? <Tag>yes</Tag> : <Tag tone="warn">{r.blocks[0] || "no"}</Tag>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {Array.isArray(cov.unmatchedNumbers) && cov.unmatchedNumbers.length > 0 ? (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
                    Numbers on messages that match no driver
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {cov.unmatchedNumbers.map((u) => (
                      <button
                        key={u.last10}
                        type="button"
                        onClick={() => setLinkPhone(u.number)}
                        style={{ fontFamily: FM, fontSize: 12, color: C.white, background: C.black, border: `1px solid ${C.border}`, borderRadius: 3, padding: "8px 12px", cursor: "pointer" }}
                      >
                        {u.number} · {u.messages} msg · {u.directionsSeen.join("/")}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  value={linkDriverId}
                  onChange={(e) => setLinkDriverId(e.target.value)}
                  placeholder="driverId"
                  style={{ fontFamily: FM, fontSize: 12.5, background: C.black, color: C.white, border: `1px solid ${C.border}`, borderRadius: 3, padding: "10px 12px", width: 130 }}
                />
                <input
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  placeholder="phone — 10 digits US"
                  style={{ fontFamily: FM, fontSize: 12.5, background: C.black, color: C.white, border: `1px solid ${C.border}`, borderRadius: 3, padding: "10px 12px", width: 210 }}
                />
                <Btn onClick={doLink} disabled={busy === "link" || !linkDriverId.trim() || !linkPhone.trim()}>{busy === "link" ? "Linking…" : "Link number to driver"}</Btn>
              </div>

              {linkResult ? (
                <div style={{ marginTop: 14, border: `1px solid ${linkResult.ok ? C.border : `${WARN}55`}`, borderRadius: 4, padding: 14, fontFamily: FM, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                  POST /link-driver → HTTP {linkResult.status} · {linkResult.ms} ms<br />
                  {linkResult.ok
                    ? <>{linkResult.body?.driverName}: {linkResult.body?.phoneBefore || "none"} → {linkResult.body?.phoneAfter} · {num(linkResult.body?.hosLogRows)} hos_logs rows<br />{linkResult.body?.note}</>
                    : <span style={{ color: WARN }}>{linkResult.body?.reason}: {linkResult.body?.detail || ""}</span>}
                </div>
              ) : null}

              {resealResult ? (
                <div style={{ marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontFamily: FM, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                  POST /reseal-unresolved → HTTP {resealResult.status} · {resealResult.ms} ms<br />
                  appended {num(resealResult.body?.appendedCount)} · skipped {num(resealResult.body?.skippedCount)} · head seq {num(resealResult.body?.headSeq)}<br />
                  {resealResult.body?.appendOnly}
                  {Array.isArray(resealResult.body?.skipped) && resealResult.body.skipped.length > 0 ? (
                    <><br />{resealResult.body.skipped.map((s2) => `${s2.messageId}: ${s2.reason}`).join(" · ")}</>
                  ) : null}
                </div>
              ) : null}

              {Array.isArray(cov.notClaimed) ? (
                <ul style={{ margin: "16px 0 0", paddingLeft: 20, fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.9 }}>
                  {cov.notClaimed.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              ) : null}
            </>
          )}
        </Panel>

        <Panel
          title="Automatic clock answer on an inbound line"
          icon={<Send size={15} />}
          note={ar ? ar.howToDisable : undefined}
        >
          {!ar ? (
            <Missing label="AUTO-REPLY READ DID NOT RETURN" reason="GET /api/comms/auto-reply was not answered on this load." />
          ) : (
            <>
              <div style={{ fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.85, marginBottom: 14 }}>
                When a broker texts a fleet number, the ask is answered from that driver's duty clock as of the
                message's own timestamp, sent back over the same number through the Twilio REST API (not TwiML, so
                Twilio's own SID, status and error are stored verbatim), and the reply is sealed into the same chain
                as the ask.
              </div>

              <div style={grid(200)}>
                <Stat label="Auto answer" value={ar.enabled ? "ON" : "OFF"} sub={`env ${ar.envVar}`} tone={ar.enabled ? "gold" : "warn"} />
                <Stat label="Twilio configured" value={ar.twilioConfigured ? "YES" : "NO"} sub="credentials present in .env — acceptance is per request" tone={ar.twilioConfigured ? "gold" : "warn"} />
                <Stat label="Decisions recorded" value={num(ar.decisionsRecorded)} sub="rows in clock_answers, sends and refusals alike" />
                <Stat label="Actually sent" value={num(ar.sent)} sub="Twilio accepted the reply" tone={ar.sent ? "gold" : "warn"} />
              </div>

              {Array.isArray(ar.recent) && ar.recent.length > 0 ? (
                <div style={{ overflowX: "auto", marginTop: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>When</th>
                        <th style={th}>Ask</th>
                        <th style={th}>Driver</th>
                        <th style={th}>Verdict</th>
                        <th style={tdNum}>Needed</th>
                        <th style={tdNum}>Legal</th>
                        <th style={th}>Decision</th>
                        <th style={th}>Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ar.recent.map((r) => (
                        <tr key={r.id}>
                          <td style={{ ...td, fontFamily: FM, fontSize: 11.5 }}>{when(r.at)}</td>
                          <td style={{ ...td, maxWidth: 260, color: C.text }}>{r.askText || "—"}</td>
                          <td style={td}>{r.driverId || <span style={{ color: WARN }}>unresolved</span>}</td>
                          <td style={td}><Tag tone={r.verdict === "fits" ? "gold" : "warn"}>{r.verdict}</Tag></td>
                          <td style={tdNum}>{r.hoursNeeded === null || r.hoursNeeded === undefined ? "—" : `${r.hoursNeeded} h`}</td>
                          <td style={tdNum}>{r.hoursAvailable === null || r.hoursAvailable === undefined ? "—" : `${r.hoursAvailable} h`}</td>
                          <td style={td}><Tag tone={r.decision === "sent" ? "gold" : "warn"}>{r.decision}</Tag></td>
                          <td style={{ ...td, fontFamily: FM, fontSize: 11, color: r.error ? WARN : C.dim, maxWidth: 240 }}>
                            {r.twilioSid || r.error || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Missing label="NO DECISIONS YET" reason="No inbound message has reached /api/comms/inbound on this database yet, so there is nothing to show." />
              )}

              {Array.isArray(ar.rules) ? (
                <ul style={{ margin: "16px 0 0", paddingLeft: 20, fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.9 }}>
                  {ar.rules.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              ) : null}

              {ar.notClaimed ? (
                <div style={{ marginTop: 14, fontFamily: FB, fontSize: 12, color: C.dim }}>{ar.notClaimed}</div>
              ) : null}
            </>
          )}
        </Panel>

        <Panel
          title="Stale open duty intervals — repair"
          icon={<Wrench size={15} />}
          note={open?.rule}
        >
          {!open ? (
            <Missing label="OPEN-INTERVAL READ DID NOT RETURN" reason="GET /api/clock-ledger/open-intervals was not answered on this load." />
          ) : (
            <>
              <div style={grid(200)}>
                <Stat label="Open intervals" value={num(open.openIntervals)} sub={`${num(open.currentOpenIntervals)} are current (under ${open.staleOpenHours} h)`} />
                <Stat label="Stale open" value={num(open.staleOpenIntervals)} sub={`older than ${open.staleOpenHours} h — excluded from every clock`} tone={open.staleOpenIntervals ? "warn" : "gold"} />
                <Stat label="Minutes recoverable" value={num(open.minutesRecoverable)} sub={`${num(open.closableNow)} row(s) closable from a neighbouring row`} />
                <Stat label="Repairs logged" value={num(open.repairsLogged)} sub="rows in hos_interval_repairs" />
              </div>

              {Array.isArray(open.rows) && open.rows.length > 0 ? (
                <div style={{ overflowX: "auto", marginTop: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Row</th>
                        <th style={th}>Driver</th>
                        <th style={th}>Status</th>
                        <th style={th}>Started</th>
                        <th style={{ ...th, textAlign: "right" }}>Open for</th>
                        <th style={th}>Close at</th>
                        <th style={{ ...th, textAlign: "right" }}>Minutes recovered</th>
                        <th style={{ ...th, textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {open.rows.map((r) => (
                        <tr key={r.rowId}>
                          <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{r.rowId}</td>
                          <td style={td}>{r.driverName || r.driverId}</td>
                          <td style={td}>{r.status}</td>
                          <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{when(r.startedAtIso)}</td>
                          <td style={{ ...tdNum, color: r.stale ? WARN : C.white }}>{r.openForHours} h</td>
                          <td style={{ ...td, fontFamily: FM, fontSize: 12 }}>{r.suggestedEndIso ? `${when(r.suggestedEndIso)} (${r.suggestedEndSource})` : <span style={{ color: WARN }}>no defensible time</span>}</td>
                          <td style={tdNum}>{num(r.minutesRecoverableIfClosed)}</td>
                          <td style={{ ...td, textAlign: "right" }}>
                            {r.closable
                              ? <GhostBtn onClick={() => doClose(r.rowId)}>{busy === `close:${r.rowId}` ? "Closing…" : "Close row"}</GhostBtn>
                              : <span style={{ fontFamily: FM, fontSize: 11.5, color: C.dim }}>needs a supplied time</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <Missing label="NO OPEN INTERVALS" reason="Every hos_logs row for every driver is closed, so no clock is excluding anything." />
                </div>
              )}

              {closeResult ? (
                <div style={{ marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontFamily: FM, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                  POST /open-intervals/close → HTTP {closeResult.status} · {closeResult.ms} ms<br />
                  {closeResult.ok
                    ? <>minutes recovered {num(closeResult.body?.minutesRecovered)} · close source {closeResult.body?.closeSource} · driving left before {hrsOf(closeResult.body?.clockBefore?.drivingRemainingMin)} → after {hrsOf(closeResult.body?.clockAfter?.drivingRemainingMin)}</>
                    : JSON.stringify(closeResult.body).slice(0, 300)}
                </div>
              ) : null}

              {open.closePolicy ? (
                <p style={{ fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.9, marginTop: 14, marginBottom: 0 }}>{open.closePolicy}</p>
              ) : null}
            </>
          )}
        </Panel>

        <Panel title="Blockers the server reports" icon={<ShieldAlert size={15} />} note="Read straight from /api/sealed-line. Nothing here is hidden or softened.">
          {Array.isArray(sl?.blockers) && sl.blockers.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {sl.blockers.map((b) => (
                <div key={b.key} style={{ border: `1px solid ${b.blocked ? `${WARN}55` : C.border}`, borderRadius: 4, padding: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <Tag tone={b.blocked ? "warn" : "gold"}>{b.blocked ? "blocked" : "clear"}</Tag>
                    <span style={{ fontFamily: FM, fontSize: 11.5, color: C.white, letterSpacing: "0.1em", textTransform: "uppercase" }}>{b.key.replace(/_/g, " ")}</span>
                  </div>
                  <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, margin: 0 }}>{b.detail}</p>
                </div>
              ))}
            </div>
          ) : <Missing label="NO BLOCKER LIST RETURNED" reason="/api/sealed-line did not include a blockers array." />}
        </Panel>

        <Reads reads={reads} onReload={load} />

        <Disclaimer
          items={[
            sl?.claimed || "Tamper-evident: altering a stored measurement or a message body breaks the recomputed link, and /api/sealed-line/chain reports the break.",
            ...(Array.isArray(sl?.notClaimed) ? sl.notClaimed : []),
          ]}
        />
      </div>
    </div>
  );
}
