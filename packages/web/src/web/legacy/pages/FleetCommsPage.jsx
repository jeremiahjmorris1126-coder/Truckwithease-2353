/**
 * FLEET COMMUNICATIONS — /comms
 *
 * READS (every value on this page comes from these round trips)
 *   GET  /api/comms                 REQUIRED — Twilio account state, the numbers actually on
 *                                   the account, their assignments, and the live A2P 10DLC
 *                                   campaign state for the configured Messaging Service
 *   GET  /api/comms/conversations   threads this app has sent to or received from
 *   GET  /api/comms/conversations/:id  the messages in one thread
 *   GET  /api/comms/available?areaCode=  Twilio number search (only when the operator searches)
 *
 * WRITES (all explicit, all operator-initiated)
 *   POST /api/comms/assign          bind a number already on the account to a fleet or driver
 *   POST /api/comms/assign/:id/unassign   local unbind only — Twilio still owns and bills it
 *   POST /api/comms/send            send one SMS through Twilio
 *   POST /api/comms/purchase        buy a number — spends real money, double confirmation
 *
 * COMPUTES LOCALLY
 *   Round-trip latency per read (timedGet). Nothing else. Every number, status string and
 *   error string shown here was produced by Twilio or by the server, never by this file.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   Not delivery. Twilio accepting a message means queued, not received. The status shown is
 *   the last status Twilio reported, with the time it was read.
 *   Not compliance. If no approved A2P 10DLC campaign is attached, that is shown as a blocker
 *   at the top of the page, in the operator's face, not buried.
 *   No uptime figure, no delivery rate, no response-time promise. Support is not 24/7.
 *   TruckWithEase is not an ELD, is not registered with FMCSA, and files nothing with any agency.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, MessageSquare, Phone, Search, Send, ShieldAlert, UserCheck } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer, Btn, GhostBtn,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const input = {
  background: "#0d0d0d",
  border: `1px solid ${C.border}`,
  color: C.white,
  fontFamily: FM,
  fontSize: 13,
  padding: "9px 11px",
  borderRadius: 4,
  outline: "none",
  width: "100%",
};

const label = { color: C.muted, fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 };

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { ok: res.ok, status: res.status, body: json };
}

/** Renders a server or Twilio failure verbatim. No paraphrasing, no softening. */
function ProviderError({ result }) {
  if (!result || result.ok) return null;
  const b = result.body || {};
  const bits = [
    b.error || b.twilioError || b.message || `HTTP ${result.status}`,
    b.twilioCode ? `Twilio code ${b.twilioCode}` : null,
    b.moreInfo || null,
  ].filter(Boolean);
  return (
    <div style={{ marginTop: 10, border: `1px solid ${WARN}`, background: "rgba(201,106,76,0.08)", padding: "10px 12px", borderRadius: 4 }}>
      <div style={{ color: WARN, fontFamily: FM, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
        Provider rejected this — exact response
      </div>
      {bits.map((t, i) => (
        <div key={i} style={{ color: C.white, fontFamily: FM, fontSize: 12, lineHeight: 1.6 }}>{String(t)}</div>
      ))}
    </div>
  );
}

export default function FleetCommsPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [reads, setReads] = useState([]);
  const [ov, setOv] = useState(null);
  const [threads, setThreads] = useState(null);
  const alive = useRef(false);

  // thread view
  const [openId, setOpenId] = useState(null);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState("");
  const [sendResult, setSendResult] = useState(null);
  const [sending, setSending] = useState(false);

  // new message
  const [toNumber, setToNumber] = useState("");

  // number search
  const [areaCode, setAreaCode] = useState("");
  const [avail, setAvail] = useState(null);
  const [searching, setSearching] = useState(false);

  // assignment form
  const [assignNumber, setAssignNumber] = useState("");
  const [assignLabel, setAssignLabel] = useState("");
  const [assignType, setAssignType] = useState("fleet");
  const [assignName, setAssignName] = useState("");
  const [assignResult, setAssignResult] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const ovR = await timedGet("/api/comms");
      if (!alive.current) return;
      const collected = [ovR];
      setOv(ovR.body);
      const cR = await timedGet("/api/comms/conversations").catch(() => null);
      if (!alive.current) return;
      if (cR) { collected.push(cR); setThreads(cR.body); }
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

  const openThread = useCallback(async (id) => {
    setOpenId(id);
    setThread(null);
    setSendResult(null);
    const r = await timedGet(`/api/comms/conversations/${id}`).catch(() => null);
    if (!alive.current) return;
    if (r) {
      setThread(r.body);
      setToNumber(r.body?.conversation?.peerNumber || "");
      await post(`/api/comms/conversations/${id}/read`);
    }
  }, []);

  const doSend = useCallback(async () => {
    if (!draft.trim() || !toNumber.trim()) return;
    setSending(true);
    setSendResult(null);
    const r = await post("/api/comms/send", { to: toNumber, body: draft });
    if (!alive.current) return;
    setSending(false);
    setSendResult(r);
    if (r.ok) {
      setDraft("");
      const id = r.body?.conversationId;
      if (id) await openThread(id);
      const cR = await timedGet("/api/comms/conversations").catch(() => null);
      if (cR && alive.current) setThreads(cR.body);
    }
  }, [draft, toNumber, openThread]);

  const doSearch = useCallback(async () => {
    setSearching(true);
    setAvail(null);
    const q = areaCode.replace(/\D/g, "");
    const r = await timedGet(`/api/comms/available${q ? `?areaCode=${q}` : ""}`).catch((e) => ({ body: { error: String(e) } }));
    if (!alive.current) return;
    setSearching(false);
    setAvail(r.body);
  }, [areaCode]);

  const doAssign = useCallback(async () => {
    setAssignResult(null);
    const r = await post("/api/comms/assign", {
      phoneNumber: assignNumber,
      label: assignLabel || null,
      assignedToType: assignType,
      assignedToName: assignName || null,
    });
    if (!alive.current) return;
    setAssignResult(r);
    if (r.ok) { setAssignNumber(""); setAssignLabel(""); setAssignName(""); load(); }
  }, [assignNumber, assignLabel, assignType, assignName, load]);

  const doUnassign = useCallback(async (id) => {
    await post(`/api/comms/assign/${id}/unassign`);
    if (alive.current) load();
  }, [load]);

  const connected = Boolean(ov?.connected);
  const a2p = ov?.a2p ?? null;

  return (
    <div style={page}>
      <div style={wrap}>
        <Header
          icon={<Phone size={26} color={GOLDB} />}
          eyebrow="TruckWithEase / Telecommunications"
          title="FLEET"
          accent="COMMUNICATIONS"
          lead="Phone numbers assigned to the fleet through Twilio, and every text sent or received against them. Numbers are listed only when Twilio confirms they are on the account. Sends report Twilio's own status and Twilio's own errors — nothing here is simulated."
        />

        {state === "loading" && <Spin label="Reading /api/comms…" />}
        {state === "error" && <Err error={error} onRetry={load} />}

        {state === "ok" && ov && (
          <>
            {/* ── Blockers first. Never buried. ─────────────────────────── */}
            {!connected && (
              <div style={{ marginTop: 4 }}>
                <Missing
                  label="TWILIO NOT CONNECTED — NOTHING ON THIS PAGE CAN SEND"
                  reason={[
                    ov.reason,
                    ov.twilioError ? `Twilio said: ${ov.twilioError}` : null,
                    ov.httpStatus ? `HTTP ${ov.httpStatus}` : null,
                    ov.accountSid ? `The TWILIO_ACCOUNT_SID currently in .env is "${ov.accountSid}". A Twilio Account SID always begins with AC and is 34 characters.` : null,
                  ].filter(Boolean).join(" · ")}
                />
              </div>
            )}

            {connected && a2p && !a2p.canSendUsA2p && (
              <Panel
                title="A2P 10DLC — NOT CLEARED FOR US SMS"
                note="live read of the Messaging Service compliance resource"
                icon={<ShieldAlert size={16} color={WARN} />}
                right={<Tag tone="warn">{String(a2p.campaignStatus).toUpperCase()}</Tag>}
              >
                <p style={{ color: C.white, fontFamily: FB, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  {a2p.blocker}
                </p>
                <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                  Messaging Service {a2p.messagingServiceSid || "—"} · campaign {a2p.campaignSid || "none"}.
                  Registering a campaign costs money and triggers vetting, so this app will not file one on its own.
                </p>
              </Panel>
            )}

            {connected && ov.trialAccount && (
              <div style={{ marginTop: 14 }}>
                <Missing
                  label="TRIAL TWILIO ACCOUNT"
                  reason="Twilio reports this account type as Trial. Trial accounts can only text numbers verified in the Twilio console, and Twilio prepends its trial notice to every message."
                />
              </div>
            )}

            {/* ── Account ──────────────────────────────────────────────── */}
            <div style={{ ...grid(200), marginTop: 16 }}>
              <Stat label="Twilio account" value={connected ? "Connected" : "Not connected"} sub={ov.accountSid || "no SID"} tone={connected ? "gold" : "warn"} />
              <Stat label="Numbers on account" value={connected ? String(ov.counts?.owned ?? 0) : "—"} sub={connected ? `${ov.unassigned ?? 0} unassigned` : "unknown until connected"} />
              <Stat label="Assigned in TruckWithEase" value={String(ov.counts?.assignments ?? 0)} sub="fleet, driver or dispatch" />
              <Stat label="Threads / messages" value={`${ov.counts?.conversations ?? 0} / ${ov.counts?.messages ?? 0}`} sub="stored in this app" />
              <Stat
                label="Price per line"
                value={ov.pricing?.display ?? "$10.50"}
                sub={ov.pricing?.per ?? "line / month"}
                tone="gold"
              />
            </div>

            <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
              {ov.pricing?.label ?? "$10.50 per line per month"}, billed to {ov.pricing?.billedTo ?? "the subscribing fleet"}.
              These lines are for internal fleet communication — the fleet assigns each line to one of its own
              drivers or dispatchers so they can text each other. They are not used to contact brokers, shippers
              or the public.
            </p>

            {/* ── Numbers ──────────────────────────────────────────────── */}
            <Panel
              title="NUMBERS ON THE TWILIO ACCOUNT"
              note="numbers[] from GET /api/comms — a live read, not a stored list"
              icon={<Phone size={16} color={GOLD} />}
              right={<Tag tone="dim">{connected ? `${ov.numbers?.length ?? 0} numbers` : "unavailable"}</Tag>}
            >
              {!connected ? (
                <Missing label="NO NUMBER LIST" reason="Twilio credentials are not working, so this app cannot prove which numbers exist. It will not display a list it cannot verify." />
              ) : (ov.numbers?.length ?? 0) === 0 ? (
                <Missing label="NO NUMBERS ON THIS ACCOUNT" reason="Twilio returned zero incoming phone numbers. Search below and buy one before any messaging is possible." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Number</th>
                        <th style={th}>Friendly name</th>
                        <th style={th}>SMS</th>
                        <th style={th}>Voice</th>
                        <th style={th}>Inbound webhook</th>
                        <th style={th}>Assigned to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ov.numbers.map((n) => (
                        <tr key={n.sid}>
                          <td style={{ ...td, fontFamily: FM }}>{n.phoneNumber}</td>
                          <td style={td}>{n.friendlyName || "—"}</td>
                          <td style={td}>{n.smsCapable ? <Tag tone="gold">yes</Tag> : <Tag tone="warn">no</Tag>}</td>
                          <td style={td}>{n.voiceCapable ? <Tag tone="dim">yes</Tag> : "—"}</td>
                          <td style={td}>
                            {n.webhookWired ? <Tag tone="gold">wired to this app</Tag> : <span style={{ color: C.muted, fontFamily: FM, fontSize: 11.5 }}>{n.smsUrl || "not set — inbound texts will not appear here"}</span>}
                          </td>
                          <td style={td}>
                            {n.assignment
                              ? <>{n.assignment.label || n.assignment.assignedToName || n.assignment.assignedToType}<div style={{ color: C.dim, fontFamily: FM, fontSize: 10.5 }}>{n.assignment.assignedToType}</div></>
                              : <span style={{ color: C.dim }}>unassigned</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* ── Assign ───────────────────────────────────────────────── */}
            <Panel
              title="ASSIGN A NUMBER TO THE FLEET"
              note="POST /api/comms/assign — rejected unless Twilio confirms the number is on the account"
              icon={<UserCheck size={16} color={GOLD} />}
            >
              <div style={{ ...grid(190) }}>
                <div>
                  <span style={label}>Number (E.164)</span>
                  <input style={input} value={assignNumber} onChange={(e) => setAssignNumber(e.target.value)} placeholder="+16365550123" />
                </div>
                <div>
                  <span style={label}>Label</span>
                  <input style={input} value={assignLabel} onChange={(e) => setAssignLabel(e.target.value)} placeholder="Dispatch line" />
                </div>
                <div>
                  <span style={label}>Assigned to</span>
                  <select style={input} value={assignType} onChange={(e) => setAssignType(e.target.value)}>
                    <option value="fleet">Fleet</option>
                    <option value="driver">Driver</option>
                    <option value="dispatch">Dispatch</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div>
                  <span style={label}>Name (optional)</span>
                  <input style={input} value={assignName} onChange={(e) => setAssignName(e.target.value)} placeholder="Marcus Webb" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn onClick={doAssign} disabled={!assignNumber.trim() || !connected}>Assign number</Btn>
              </div>
              <ProviderError result={assignResult} />
              {assignResult?.ok && (
                <p style={{ color: GOLDB, fontFamily: FM, fontSize: 12, marginTop: 10, marginBottom: 0 }}>
                  Assigned {assignResult.body?.number?.phoneNumber}{assignResult.body?.reassigned ? " (reassigned)" : ""}.
                </p>
              )}

              {(ov.assignments?.length ?? 0) > 0 && (
                <div style={{ overflowX: "auto", marginTop: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Number</th>
                        <th style={th}>Label</th>
                        <th style={th}>Type</th>
                        <th style={th}>Name</th>
                        <th style={th}>Status</th>
                        <th style={th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ov.assignments.map((a) => (
                        <tr key={a.id}>
                          <td style={{ ...td, fontFamily: FM }}>{a.phoneNumber}</td>
                          <td style={td}>{a.label || "—"}</td>
                          <td style={td}>{a.assignedToType}</td>
                          <td style={td}>{a.assignedToName || "—"}</td>
                          <td style={td}>{a.status === "active" ? <Tag tone="gold">active</Tag> : <Tag tone="dim">released</Tag>}</td>
                          <td style={td}>
                            {a.status === "active" && <GhostBtn onClick={() => doUnassign(a.id)}>Unassign</GhostBtn>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ color: C.muted, fontFamily: FM, fontSize: 11, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                    Unassigning removes the number from the fleet inside TruckWithEase only. Twilio keeps the number and keeps billing for it until it is released in the Twilio console.
                  </p>
                </div>
              )}
            </Panel>

            {/* ── Search numbers ───────────────────────────────────────── */}
            <Panel
              title="FIND A NUMBER TO BUY"
              note="GET /api/comms/available — searching is free, buying is not"
              icon={<Search size={16} color={GOLD} />}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ minWidth: 160 }}>
                  <span style={label}>Area code</span>
                  <input style={input} value={areaCode} onChange={(e) => setAreaCode(e.target.value)} placeholder="636" />
                </div>
                <Btn onClick={doSearch} disabled={!connected || searching}>{searching ? "Searching…" : "Search Twilio"}</Btn>
              </div>
              {avail?.available?.length > 0 && (
                <div style={{ overflowX: "auto", marginTop: 14 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Number</th>
                        <th style={th}>Locality</th>
                        <th style={th}>Region</th>
                        <th style={th}>SMS</th>
                        <th style={th}>Voice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {avail.available.map((n) => (
                        <tr key={n.phoneNumber}>
                          <td style={{ ...td, fontFamily: FM }}>{n.phoneNumber}</td>
                          <td style={td}>{n.locality || "—"}</td>
                          <td style={td}>{n.region || "—"}</td>
                          <td style={td}>{n.sms ? "yes" : "no"}</td>
                          <td style={td}>{n.voice ? "yes" : "no"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ color: C.muted, fontFamily: FM, fontSize: 11, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                    Buying is deliberately not a button on this page. It charges the Twilio account, so it runs through
                    POST /api/comms/purchase with confirm:true — a decision, not a click.
                  </p>
                </div>
              )}
              {avail && !avail.available?.length && (
                <div style={{ marginTop: 12 }}>
                  <Missing
                    label="NO RESULTS"
                    reason={avail.twilioError ? `Twilio said: ${avail.twilioError}` : "Twilio returned no available numbers for that search."}
                  />
                </div>
              )}
            </Panel>

            {/* ── Messaging ────────────────────────────────────────────── */}
            <Panel
              title="MESSAGES"
              note="threads from GET /api/comms/conversations — only real sends and real inbound webhooks appear"
              icon={<MessageSquare size={16} color={GOLD} />}
              right={<Tag tone="dim">{threads?.total ?? 0} threads · {threads?.unread ?? 0} unread</Tag>}
            >
              <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 300px) 1fr", gap: 16, alignItems: "start" }}>
                <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 12 }}>
                  {(threads?.conversations?.length ?? 0) === 0 ? (
                    <p style={{ color: C.muted, fontFamily: FM, fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
                      {threads?.note || "No threads yet."}
                    </p>
                  ) : (
                    threads.conversations.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openThread(t.id)}
                        style={{
                          display: "block", width: "100%", textAlign: "left", background: openId === t.id ? "#161616" : "transparent",
                          border: `1px solid ${openId === t.id ? GOLD : "transparent"}`, borderRadius: 4, padding: "9px 10px",
                          marginBottom: 6, cursor: "pointer",
                        }}
                      >
                        <div style={{ color: C.white, fontFamily: FH, fontSize: 13.5 }}>{t.peerName || t.peerNumber}</div>
                        <div style={{ color: C.dim, fontFamily: FM, fontSize: 10.5 }}>{t.peerNumber} · via {t.fleetNumber}</div>
                        {t.lastMessagePreview && (
                          <div style={{ color: C.muted, fontFamily: FB, fontSize: 12, marginTop: 4 }}>{t.lastMessagePreview.slice(0, 60)}</div>
                        )}
                        {t.unreadInbound > 0 && <div style={{ marginTop: 5 }}><Tag tone="gold">{t.unreadInbound} unread</Tag></div>}
                      </button>
                    ))
                  )}
                </div>

                <div>
                  {thread?.messages?.length > 0 && (
                    <div style={{ maxHeight: 340, overflowY: "auto", marginBottom: 14 }}>
                      {thread.messages.map((m) => (
                        <div key={m.id} style={{ marginBottom: 10, textAlign: m.direction === "outbound" ? "right" : "left" }}>
                          <div style={{
                            display: "inline-block", maxWidth: "80%", textAlign: "left",
                            background: m.direction === "outbound" ? "rgba(201,168,76,0.10)" : "#141414",
                            border: `1px solid ${m.direction === "outbound" ? GOLD : C.border}`,
                            borderRadius: 6, padding: "8px 11px",
                          }}>
                            <div style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.body}</div>
                            <div style={{ color: m.errorCode ? WARN : C.dim, fontFamily: FM, fontSize: 10.5, marginTop: 5 }}>
                              {m.direction} · {m.twilioStatus || "unknown"}
                              {m.errorCode ? ` · Twilio ${m.errorCode}${m.errorMessage ? `: ${m.errorMessage}` : ""}` : ""}
                              {m.twilioSid ? ` · ${m.twilioSid}` : " · no Twilio SID — never accepted"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <span style={label}>To (E.164)</span>
                      <input style={input} value={toNumber} onChange={(e) => setToNumber(e.target.value)} placeholder="+13145550123" />
                    </div>
                    <div>
                      <span style={label}>Message</span>
                      <textarea style={{ ...input, minHeight: 84, fontFamily: FB, fontSize: 13.5 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type the message Twilio will actually send." />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Btn onClick={doSend} disabled={sending || !connected || !draft.trim() || !toNumber.trim()}>
                        {sending ? "Sending…" : "Send through Twilio"}
                      </Btn>
                      <span style={{ color: C.muted, fontFamily: FM, fontSize: 11 }}>
                        {draft.length} chars · {Math.max(1, Math.ceil(draft.length / 153))} segment{draft.length > 153 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ProviderError result={sendResult} />
                  {sendResult?.ok && (
                    <p style={{ color: GOLDB, fontFamily: FM, fontSize: 12, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                      {sendResult.body?.meaning}
                    </p>
                  )}
                </div>
              </div>
            </Panel>

            <Panel
              title="HOW INBOUND WORKS"
              note="stated plainly so nobody assumes texts arrive by magic"
              icon={<AlertTriangle size={16} color={GOLD} />}
            >
              <p style={{ color: C.white, fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, margin: 0 }}>
                A driver's reply reaches this app only if that number's SMS webhook points at
                <span style={{ fontFamily: FM, color: GOLDB }}> /api/comms/inbound</span> on a host Twilio can reach over the public internet.
                Until the app is deployed on a public https host, inbound replies land in the Twilio console and not here. That is a
                deployment fact, not a bug, and the table above shows per number whether the webhook is wired.
              </p>
            </Panel>

            <Disclaimer
              items={[
                "Twilio accepting a message means queued, not delivered. Delivery is reported only as the last status Twilio returned.",
                "US application-to-person SMS is filtered by the carriers until an approved 10DLC campaign is attached to the Messaging Service. This app reads that state and shows it; it does not register anything on its own, because filing costs money and triggers vetting.",
                "Unassigning a number here does not release it at Twilio, and does not stop Twilio billing for it.",
                "No delivery rate, no uptime figure and no response-time promise is claimed anywhere on this page.",
                "TruckWithEase is not an ELD, is not registered with FMCSA, and files nothing with any agency.",
              ]}
            />

            <Reads reads={reads} onReload={load} />
          </>
        )}
      </div>
    </div>
  );
}
