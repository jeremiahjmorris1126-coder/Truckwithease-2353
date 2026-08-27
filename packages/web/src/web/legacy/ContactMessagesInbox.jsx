/**
 * ContactMessagesInbox — /contact-inbox
 *
 * REWRITTEN 2026-08-25. Original preserved at
 * docs/launch/ContactMessagesInbox.ORIGINAL.jsx.txt
 *
 * The original read and deleted from the PocketBase collection
 * `contact_messages`. That collection is not in SERVER_COLLECTIONS in
 * src/web/lib/pb-shim.ts, so every read and delete resolved to the browser's
 * own localStorage. Effects of that bug:
 *
 *   - No message a customer ever sent could appear here, because nothing
 *     writes to that collection anywhere in the codebase.
 *   - The page polled every 5 seconds and showed a permanently empty inbox,
 *     which reads as "no one has contacted us" rather than "this inbox is
 *     not connected to anything".
 *   - Deleting a message deleted a localStorage row on one browser.
 *
 * This version reads the real support tickets table over
 * GET /api/support/tickets, which is where inbound messages actually land
 * (POST /api/support/tickets). Status changes go through
 * POST /api/support/tickets/:id/status. Delete was removed: there is no
 * delete endpoint, and silently dropping a customer's message is the wrong
 * default for a compliance platform anyway — tickets get closed, not erased.
 */
import { useState, useEffect, useCallback } from "react";

const B = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  gold: "#C9A84C",
  goldBright: "#FFD700",
  goldDim: "#8A6E2F",
  warn: "#c96a4c",
  muted: "#8a8a8a",
  dim: "#666666",
  white: "#FFFFFF",
};

const STATUSES = ["open", "in_progress", "resolved", "closed"];

const STATUS_COLOR = {
  open: B.goldBright,
  in_progress: B.gold,
  resolved: B.goldDim,
  closed: B.dim,
};

function fmt(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ContactMessagesInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (signal) => {
    try {
      const res = await fetch("/api/support/tickets", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setError("");
    } catch (err) {
      if (err.name === "AbortError" || signal?.aborted) return;
      setError(err.message || "request failed");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const t = setInterval(() => load(controller.signal), 20000);
    return () => {
      clearInterval(t);
      controller.abort();
    };
  }, [load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/support/tickets/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    } catch (err) {
      setError(`Status update failed: ${err.message}`);
    } finally {
      setBusyId("");
    }
  };

  const shown =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      style={{
        background: B.black,
        minHeight: "100vh",
        color: B.white,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: B.nav,
          borderBottom: `1px solid ${B.border}`,
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2.6rem",
              letterSpacing: "0.02em",
              margin: 0,
              background: `linear-gradient(135deg,${B.gold} 0%,${B.goldBright} 40%,${B.gold} 70%,${B.goldDim} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SUPPORT INBOX
          </h1>
          <p
            style={{
              color: B.muted,
              fontSize: "0.9rem",
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}
          >
            Live from the support tickets table. Refreshes every 20 seconds.
            Tickets are closed, not deleted — there is no delete endpoint and a
            customer message is a record.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 64px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {["all", ...STATUSES].map((s) => {
            const on = filter === s;
            const n = s === "all" ? tickets.length : counts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "9px 14px",
                  background: on ? B.gold : B.card,
                  color: on ? B.black : B.white,
                  border: `1px solid ${on ? B.gold : B.border}`,
                  borderRadius: 5,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {s.replace("_", " ")} {n}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              background: "rgba(201,106,76,0.08)",
              border: `1px solid ${B.warn}`,
              borderRadius: 6,
              color: B.warn,
              fontSize: "0.88rem",
            }}
          >
            <strong style={{ letterSpacing: "0.04em" }}>
              INBOX UNAVAILABLE — NOTHING WAS READ.
            </strong>{" "}
            {error}. This is a failed request, not an empty inbox. Do not read
            it as "no messages".
          </div>
        )}

        {loading && !tickets.length && !error && (
          <div style={{ color: B.muted, fontSize: "0.9rem" }}>Loading…</div>
        )}

        {!loading && !error && !tickets.length && (
          <div
            style={{
              padding: 22,
              background: B.card,
              border: `1px solid ${B.gold}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                color: B.gold,
                fontSize: "1rem",
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              NO TICKETS ON FILE
            </div>
            <div style={{ color: B.muted, fontSize: "0.88rem", lineHeight: 1.65 }}>
              The table is empty. The connection is working — this is a real
              zero, not a broken read.
            </div>
          </div>
        )}

        {!!shown.length && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selected ? "1fr 1fr" : "1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              {shown.map((t) => {
                const on = selected && selected.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(on ? null : t)}
                    style={{
                      textAlign: "left",
                      background: B.card,
                      border: `1px solid ${on ? B.gold : B.border}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      cursor: "pointer",
                      color: B.white,
                      font: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          color: STATUS_COLOR[t.status] || B.muted,
                          border: `1px solid ${STATUS_COLOR[t.status] || B.border}`,
                          borderRadius: 4,
                          padding: "2px 7px",
                          textTransform: "uppercase",
                        }}
                      >
                        {String(t.status || "unknown").replace("_", " ")}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: B.dim,
                        }}
                      >
                        {t.ticketNumber || t.id}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: B.goldDim,
                        }}
                      >
                        {t.category}
                        {t.priority ? ` · P${t.priority}` : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "1rem",
                        letterSpacing: "0.01em",
                        marginBottom: 4,
                      }}
                    >
                      {t.subject || "(no subject)"}
                    </div>
                    <div
                      style={{
                        color: B.muted,
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {t.body}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: B.dim,
                      }}
                    >
                      {fmt(t.createdAt)}
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div
                style={{
                  background: B.card,
                  border: `1px solid ${B.gold}`,
                  borderRadius: 8,
                  padding: 20,
                  position: "sticky",
                  top: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: B.goldDim,
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  {selected.ticketNumber || selected.id} · {selected.category}
                </div>
                <h2
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "1.3rem",
                    color: B.goldBright,
                    margin: "0 0 14px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {selected.subject || "(no subject)"}
                </h2>

                <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                  {[
                    ["Driver", selected.driverId],
                    ["Email", selected.contactEmail],
                    ["Phone", selected.contactPhone],
                    ["Opened", fmt(selected.createdAt)],
                    ["Updated", fmt(selected.updatedAt)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          color: B.dim,
                          width: 74,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {k}
                      </span>
                      <span style={{ color: v ? B.white : B.dim }}>
                        {v || "not provided"}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: B.black,
                    border: `1px solid ${B.border}`,
                    borderRadius: 6,
                    padding: 14,
                    color: "rgba(255,255,255,0.88)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    marginBottom: 18,
                  }}
                >
                  {selected.body}
                </div>

                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    color: B.dim,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Set status
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATUSES.map((s) => {
                    const on = selected.status === s;
                    return (
                      <button
                        key={s}
                        disabled={on || busyId === selected.id}
                        onClick={() => setStatus(selected.id, s)}
                        style={{
                          padding: "8px 12px",
                          background: on ? B.gold : "transparent",
                          color: on ? B.black : B.gold,
                          border: `1px solid ${B.gold}`,
                          borderRadius: 5,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          cursor: on ? "default" : "pointer",
                          opacity: busyId === selected.id ? 0.5 : 1,
                        }}
                      >
                        {s.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {selected.contactEmail && (
                    <a
                      href={`mailto:${selected.contactEmail}?subject=Re: ${encodeURIComponent(
                        selected.subject || "",
                      )}`}
                      style={{
                        color: B.goldBright,
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        borderBottom: `1px solid ${B.goldDim}`,
                      }}
                    >
                      Reply by email
                    </a>
                  )}
                  {selected.contactPhone && (
                    <a
                      href={`tel:${selected.contactPhone}`}
                      style={{
                        color: B.goldBright,
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        borderBottom: `1px solid ${B.goldDim}`,
                      }}
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
