/**
 * SupplierAdminPanel — /admin/suppliers
 *
 * READS (live, every round trip measured with performance.now()):
 *   GET /api/signup            → plan catalog (PLANS in api/routes/signup.ts), trial days
 *   GET /api/subscriptions/list → the only real hardware/plan commitments on file
 *   GET /api/signup/list        → inbound signups (fleet size = hardware demand signal)
 *   GET /api/support            → the real inquiry channels (phone/email/hours/categories)
 *   GET /api/support/tickets    → real tickets; HARDWARE category is what this page owns
 *
 * COMPUTES LOCALLY:
 *   Hardware exposure per subscription row from the plan of record:
 *     fleet_lease  = $49.99/truck/mo, hardware lease included (no one-time charge)
 *     fleet_owned  = $59.99/driver/mo + $600/truck one-time hardware
 *   Nothing else. No revenue total is printed for orders that do not exist.
 *
 * REMOVED IN THIS REWRITE (all of it was fake):
 *   - `import PocketBase from 'pocketbase'` and `new PocketBase()` — the PocketBase
 *     backend does not exist. Every read below hit a dead client.
 *   - Reads of four collections that exist in NO database, here or anywhere:
 *     `supplier_orders`, `supplier_inquiries`, `supplier_submitted_orders`,
 *     `fleet_notifications`. All four always returned empty, so the page rendered
 *     an admin console for a supply chain that was never built.
 *   - The five stat cards computed off those empty arrays: Total Orders,
 *     Awaiting Action, Activated, "Monthly Revenue" ($0.00 presented as revenue),
 *     Open Inquiries.
 *   - `handleApproveAndNotify()` — wrote `admin_verified:true` +
 *     `activation_status:'Activated'` to a nonexistent collection and then told the
 *     operator "Your ELD license order ... has been approved and activated. Your
 *     drivers can now log in and begin using TruckWithEase." TruckWithEase is NOT
 *     a registered ELD and sells no ELD license, so this text was a compliance
 *     liability on top of being a no-op.
 *   - `sendSmsNotification()` and the whole SMS modal — it took a phone number,
 *     "logged" a message to `fleet_notifications`, then displayed "Text
 *     Notification Sent ... has been notified at <number>". No SMS was ever sent.
 *     No Twilio send exists in this codebase.
 *   - `saveOrder()` / `saveInquiryNote()` — PocketBase updates that always failed,
 *     with local state mutated as if they had succeeded.
 *   - The invented status vocabulary Pending / Confirmed / Activated / On Hold /
 *     Cancelled and its purple/blue/green/orange badge palette.
 *   - "⚡ AGENT SUBMITTED" / "✓ ADMIN VERIFIED" badges and the claim that a
 *     "Hardware Agent" completes orders and hands them over for approval.
 *   - Fabricated per-order fields: `queue_ref`, `supplier_confirmation_code`,
 *     `configured_for`, `supplier_name` — no supplier is integrated.
 *   - Palette: #020817 #0a1628 #0d1f35 #020c1b #1e3a5f #0f2640 #f97316 #ea580c
 *     #fb923c #4ade80 #60a5fa #a78bfa #f87171 #94a3b8 #64748b #475569 #334155,
 *     Courier New body font, emoji icons ⚡ ✓ ● ⚙.
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   - No supplier is integrated. There is no supplier catalog, no purchase order,
 *     no order status pipeline and no supplier API in this platform.
 *   - Nothing on this page sends email or SMS. Contacting a fleet is manual.
 *   - No revenue figure: billing is not live (AUTUMN_SECRET_KEY is a test key).
 *   - TruckWithEase is not a registered ELD and sells no ELD license.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone,
  Truck,
  Users,
  LifeBuoy,
  Clock,
  Gauge,
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
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: note ? 6 : 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {icon}
          <h2
            style={{
              margin: 0,
              fontFamily: FH,
              fontSize: 15,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 600,
            }}
          >
            {title}
          </h2>
        </div>
        {right}
      </div>
      {note ? (
        <div
          style={{
            fontFamily: FM,
            fontSize: 11.5,
            color: C.dim,
            marginBottom: 14,
            wordBreak: "break-all",
          }}
        >
          {note}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: "1px dashed #333333",
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 10,
        background: "#121212",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <AlertTriangle style={{ width: 14, height: 14, color: WARN }} />
        <span
          style={{
            fontFamily: FH,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: WARN,
            textTransform: "uppercase",
          }}
        >
          Missing / Not tracked
        </span>
      </div>
      <div style={{ fontFamily: FB, fontSize: 14, color: C.white, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: FD,
          fontSize: 34,
          lineHeight: 1,
          color: tone === "warn" ? WARN : tone === "bright" ? GOLDB : C.white,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FH,
          fontSize: 10.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.dim,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        padding: "7px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontFamily: FB, fontSize: 13, color: C.muted }}>{k}</span>
      <span
        style={{
          fontFamily: mono ? FM : FB,
          fontSize: 13,
          color: tone === "warn" ? WARN : tone === "gold" ? GOLDB : C.white,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Tag({ text, tone }) {
  const col = tone === "warn" ? WARN : tone === "gold" ? GOLDB : C.muted;
  return (
    <span
      style={{
        display: "inline-block",
        border: `1px solid ${col}`,
        color: col,
        borderRadius: 4,
        padding: "2px 8px",
        fontFamily: FH,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
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
        fontFamily: FM,
        fontSize: 12.5,
        color: WARN,
        border: `1px solid ${WARN}`,
        borderRadius: 8,
        padding: "10px 12px",
        background: "#170f0d",
      }}
    >
      {msg}
    </div>
  );
}

function Spin() {
  return (
    <>
      <style>{`@keyframes twe-spin{to{transform:rotate(360deg)}}`}</style>
      <RefreshCw
        style={{ width: 14, height: 14, color: GOLD, animation: "twe-spin 1s linear infinite" }}
      />
    </>
  );
}

const money = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? `$${n.toFixed(2)}`
    : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime())
    ? String(d)
    : t.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/** Hardware exposure implied by the plan of record. No supplier is involved. */
function hardwareFor(sub) {
  if (sub.plan === "fleet_lease") {
    return {
      model: "Leased — included in $49.99/truck/mo",
      oneTime: 0,
      trucks: sub.trucks ?? null,
    };
  }
  if (sub.plan === "fleet_owned") {
    const trucks = sub.trucks ?? null;
    return {
      model: "Owned — $600/truck one-time",
      oneTime: trucks ? trucks * 600 : null,
      trucks,
    };
  }
  return { model: "No hardware on this plan", oneTime: 0, trucks: null };
}

export default function SupplierAdminPanel() {
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");
  const [reads, setReads] = useState([]);
  const [plans, setPlans] = useState(null);
  const [trialDays, setTrialDays] = useState(null);
  const [subs, setSubs] = useState(null);
  const [signups, setSignups] = useState(null);
  const [support, setSupport] = useState(null);
  const [tickets, setTickets] = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding results.
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = async () => {
    setState("loading");
    setErr("");
    setReads([]);
    const log = [];
    const push = (url, r, e) => {
      log.push({
        url,
        status: e ? e.status || 0 : r.status,
        ms: e ? e.ms || 0 : r.ms,
        error: e ? e.message : null,
      });
      if (alive.current) setReads([...log]);
    };
    const get = async (url) => {
      try {
        const r = await timedGet(url);
        push(url, r, null);
        return r.body;
      } catch (e) {
        push(url, null, e);
        return null;
      }
    };

    const cat = await get("/api/signup");
    const subList = await get("/api/subscriptions/list");
    const sgnList = await get("/api/signup/list");
    const sup = await get("/api/support");
    const tks = await get("/api/support/tickets");

    if (!alive.current) return;
    if (!cat && !subList && !sgnList && !sup && !tks) {
      setErr("All five reads failed. See the status codes above.");
      setState("error");
      return;
    }
    setPlans(cat?.plans || null);
    setTrialDays(typeof cat?.trialDays === "number" ? cat.trialDays : null);
    setSubs(subList);
    setSignups(sgnList);
    setSupport(sup);
    setTickets(tks);
    setState("ok");
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subRows = subs?.subscriptions || [];
  const sgnRows = signups?.signups || [];
  const ticketRows = tickets?.tickets || [];
  const hardwareTickets = ticketRows.filter((t) => t.category === "HARDWARE");

  const trucksCommitted = subRows.reduce((s, r) => s + (r.trucks || 0), 0);
  const activeSubs = subRows.filter((r) => r.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FB }}>
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: "34px 24px 30px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "5px 13px",
              marginBottom: 16,
            }}
          >
            <Package style={{ width: 13, height: 13, color: GOLD }} />
            <span
              style={{
                fontFamily: FH,
                fontSize: 10.5,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              Hardware &amp; supplier admin
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: FD,
              fontSize: "clamp(34px, 7vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "0.01em",
            }}
          >
            SUPPLIER <span style={{ color: GOLDB }}>ADMIN</span>
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 820,
              fontSize: 15,
              lineHeight: 1.65,
              color: C.muted,
            }}
          >
            No supplier is integrated with TruckWithEase. There is no supplier catalog, no
            purchase order table and no order pipeline in this platform. What this page shows is
            the real thing underneath it: the hardware commitments implied by plans on file, the
            inbound demand from signups, and the hardware support tickets that actually exist.
            Everything here is read live from this server.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 70px" }}>
        {/* Reads */}
        <Panel
          title="Measured reads"
          icon={<Gauge style={{ width: 15, height: 15, color: GOLD }} />}
          note="Each row is a real HTTP round trip from this browser to this server, timed with performance.now()."
          right={
            <button
              onClick={load}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: GOLD,
                padding: "7px 13px",
                cursor: "pointer",
                fontFamily: FH,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {state === "loading" ? <Spin /> : <RefreshCw style={{ width: 13, height: 13 }} />}
              Re-read
            </button>
          }
        >
          <div style={{ fontFamily: FM, fontSize: 12.5 }}>
            {reads.length === 0 ? (
              <span style={{ color: C.dim }}>waiting…</span>
            ) : (
              reads.map((r) => (
                <div
                  key={r.url}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "6px 0",
                    borderBottom: `1px solid ${C.border}`,
                    color: r.error ? WARN : C.white,
                  }}
                >
                  <span style={{ wordBreak: "break-all" }}>{r.url}</span>
                  <span style={{ whiteSpace: "nowrap", color: r.error ? WARN : C.muted }}>
                    {r.status || "ERR"} / {r.ms} ms{r.ms >= SLOW_MS ? " ← slow" : ""}
                    {r.error ? ` — ${r.error}` : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        {state === "error" && <Err msg={err} />}

        {state === "ok" && (
          <>
            {/* Counts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <Stat value={subRows.length} label="Subscription records on file" />
              <Stat value={activeSubs} label="Active subscriptions" tone={activeSubs ? "bright" : "warn"} />
              <Stat value={trucksCommitted} label="Trucks named on those records" />
              <Stat value={sgnRows.length} label="Signups on file" />
              <Stat value={hardwareTickets.length} label="Hardware tickets" />
            </div>

            {/* Supplier reality */}
            <Panel
              title="Supplier pipeline"
              icon={<Package style={{ width: 15, height: 15, color: GOLD }} />}
            >
              <Missing
                label="Supplier orders"
                reason="No supplier_orders table exists in this database (60 tables, none supplier-related), and no /api/supplier route is mounted. The previous version of this page read a PocketBase collection that never existed, so it always displayed an empty order list as if orders were simply pending."
              />
              <Missing
                label="Supplier catalog, confirmation codes and queue references"
                reason="No supplier is integrated. There is no product catalog, no supplier confirmation code and no order queue. The removed version invented queue_ref, supplier_confirmation_code and supplier_name fields."
              />
              <Missing
                label="Approve / activate actions"
                reason="Removed. The previous button wrote 'Activated' to a nonexistent collection and told the operator the fleet's drivers could now log in. TruckWithEase is not a registered ELD and sells no ELD license, so no activation of that kind exists to grant."
              />
              <Missing
                label="Email or SMS from this page"
                reason="Removed. The previous SMS modal collected a phone number and displayed 'Text Notification Sent' without sending anything — there is no SMS send path in this codebase. Contacting a fleet is manual, from your own email or phone."
              />
            </Panel>

            {/* Hardware terms of record */}
            <Panel
              title="Hardware terms of record"
              icon={<Truck style={{ width: 15, height: 15, color: GOLD }} />}
              note="Source: PLANS in packages/web/src/api/routes/signup.ts, read live via GET /api/signup. This is the pricing every page must quote."
            >
              {plans ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {Object.entries(plans).map(([key, p]) => (
                    <div
                      key={key}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                        background: "#121212",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "baseline",
                        }}
                      >
                        <span style={{ fontFamily: FH, fontSize: 14, letterSpacing: "0.1em", color: C.white }}>
                          {p.name}
                        </span>
                        <span style={{ fontFamily: FM, fontSize: 13, color: GOLDB }}>
                          ${p.unitPrice.toFixed(2)} / {p.unit}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>{p.note}</div>
                      <div style={{ fontFamily: FM, fontSize: 11.5, color: C.dim, marginTop: 4 }}>
                        key: {key}
                      </div>
                    </div>
                  ))}
                  <Row
                    k="Free trial"
                    v={trialDays === null ? "—" : `${trialDays} days`}
                    mono
                    tone="gold"
                  />
                </div>
              ) : (
                <Missing label="Plan catalog" reason="GET /api/signup did not answer on this load." />
              )}
            </Panel>

            {/* Subscriptions = the only real commitments */}
            <Panel
              title="Hardware commitments on file"
              icon={<Users style={{ width: 15, height: 15, color: GOLD }} />}
              note="GET /api/subscriptions/list — subscription records are the only place a truck count and a hardware model are actually recorded."
            >
              {subRows.length === 0 ? (
                <Missing
                  label="Subscription records"
                  reason="The subscriptions table is empty, so no truck count and no hardware model is committed anywhere."
                />
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {subRows.map((s) => {
                    const hw = hardwareFor(s);
                    return (
                      <div
                        key={s.id}
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: "14px 16px",
                          background: "#121212",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <span style={{ fontFamily: FH, fontSize: 15, letterSpacing: "0.08em" }}>
                            {s.accountName || "—"}
                          </span>
                          <Tag
                            text={s.status || "unknown"}
                            tone={s.status === "active" ? "gold" : "warn"}
                          />
                        </div>
                        <Row k="Record id" v={s.id} mono />
                        <Row k="Contact" v={s.contactEmail || "—"} mono />
                        <Row k="Plan" v={s.plan || "—"} mono />
                        <Row k="Trucks" v={s.trucks ?? "—"} mono />
                        <Row k="Seats" v={s.seats ?? "—"} mono />
                        <Row
                          k="Monthly"
                          v={
                            s.pricing
                              ? `${money(s.pricing.unitPrice)} x ${s.pricing.units} ${s.pricing.unit} = ${money(s.pricing.monthlyTotal)}`
                              : "—"
                          }
                          mono
                          tone="gold"
                        />
                        <Row k="Hardware model" v={hw.model} />
                        <Row
                          k="One-time hardware"
                          v={hw.oneTime === null ? "— (truck count not recorded)" : money(hw.oneTime)}
                          mono
                        />
                        <Row k="Started" v={fmtDate(s.startedAt)} mono />
                        <Row k="Trial ends" v={fmtDate(s.trialEndsAt)} mono />
                        <Row
                          k="Cancelled"
                          v={s.cancelledAt ? `${fmtDate(s.cancelledAt)} — reason: ${s.cancelReason || "none given"}` : "—"}
                          mono
                          tone={s.cancelledAt ? "warn" : undefined}
                        />
                        <Row
                          k="Payment provider ref"
                          v={s.providerRef || "none — no provider subscription exists"}
                          mono
                          tone="warn"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {subs?.billing ? (
                <div style={{ marginTop: 14 }}>
                  <Row k="Billing live" v={String(subs.billing.live)} mono tone="warn" />
                  <Row k="Billing provider" v={subs.billing.provider || "none"} mono />
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
                    {subs.billing.note}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 14 }}>
                <Missing
                  label="Revenue from hardware"
                  reason="No money has moved. Billing is not live, so any dollar figure here would be contracted value at best. The removed version printed a 'Monthly Revenue' card totalling nonexistent orders."
                />
              </div>
            </Panel>

            {/* Demand signal */}
            <Panel
              title="Inbound demand"
              icon={<Truck style={{ width: 15, height: 15, color: GOLD }} />}
              note="GET /api/signup/list — fleetSize on a signup is the only hardware demand signal collected today."
            >
              {sgnRows.length === 0 ? (
                <Missing
                  label="Signups"
                  reason="No signups on file, so there is no inbound hardware demand to size."
                />
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {sgnRows.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "13px 15px",
                        background: "#121212",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontFamily: FH, fontSize: 14, letterSpacing: "0.08em" }}>
                          {g.name || "—"}
                        </span>
                        <Tag text={g.status || "new"} tone="warn" />
                      </div>
                      <Row k="Email" v={g.email || "—"} mono />
                      <Row k="Phone" v={g.phone || "—"} mono />
                      <Row k="Company" v={g.company || "—"} />
                      <Row k="Plan requested" v={g.plan || "—"} mono />
                      <Row k="Role" v={g.role || "—"} mono />
                      <Row k="Fleet size stated" v={g.fleetSize ?? "—"} mono tone="gold" />
                      <Row k="Source" v={g.source || "—"} mono />
                      <Row k="Received" v={fmtDate(g.createdAt)} mono />
                    </div>
                  ))}
                  <div style={{ fontSize: 13, color: WARN, lineHeight: 1.6 }}>
                    Rows on @example.com addresses are verification test data, not customers.
                  </div>
                </div>
              )}
            </Panel>

            {/* Real inquiries */}
            <Panel
              title="Hardware inquiries"
              icon={<LifeBuoy style={{ width: 15, height: 15, color: GOLD }} />}
              note="GET /api/support/tickets — real tickets. The HARDWARE category is the one this desk owns."
            >
              {ticketRows.length === 0 ? (
                <Missing
                  label="Support tickets"
                  reason="No tickets on file at all, so there are no hardware inquiries to work."
                />
              ) : hardwareTickets.length === 0 ? (
                <>
                  <Missing
                    label="Hardware-category tickets"
                    reason={`${ticketRows.length} ticket(s) exist, none in the HARDWARE category.`}
                  />
                  <div style={{ marginTop: 8 }}>
                    {ticketRows.map((t) => (
                      <Row
                        key={t.id}
                        k={`${t.ticketNumber} — ${t.category}`}
                        v={`${t.status} · ${fmtDate(t.createdAt)}`}
                        mono
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {hardwareTickets.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "13px 15px",
                        background: "#121212",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontFamily: FM, fontSize: 13, color: GOLDB }}>
                          {t.ticketNumber}
                        </span>
                        <Tag text={t.status || "open"} tone="warn" />
                      </div>
                      <Row k="Subject" v={t.subject || "—"} />
                      <Row k="Body" v={t.body || "—"} />
                      <Row k="Priority" v={t.priority || "—"} mono />
                      <Row k="Contact" v={t.contactEmail || t.contactPhone || "—"} mono />
                      <Row k="Opened" v={fmtDate(t.createdAt)} mono />
                      <Row k="Resolution" v={t.resolution || "— not resolved"} mono />
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Contact channels */}
            <Panel
              title="How a fleet actually reaches you"
              icon={<Phone style={{ width: 15, height: 15, color: GOLD }} />}
              note="GET /api/support — the live support configuration. Replies go out from your own email or phone, not from this page."
            >
              {support ? (
                <>
                  <Row k="Support email" v={support.email || "—"} mono />
                  <Row k="Billing email" v={support.billingEmail || "—"} mono />
                  <Row k="Phone" v={support.phone || "—"} mono tone="gold" />
                  <Row k="Open right now" v={String(support.openNow)} mono tone={support.openNow ? "gold" : "warn"} />
                  <Row k="Today" v={`${support.today || "—"} · ${support.todayHours || "—"}`} mono />
                  <Row k="Timezone" v={support.timezone || "—"} mono />
                  {support.categories?.HARDWARE ? (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          fontFamily: FH,
                          fontSize: 11,
                          letterSpacing: "0.2em",
                          color: GOLD,
                          textTransform: "uppercase",
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Clock style={{ width: 13, height: 13, color: GOLD }} />
                        Hardware category, as the server defines it
                      </div>
                      <Row k="Name" v={support.categories.HARDWARE.name} />
                      <Row k="Description" v={support.categories.HARDWARE.description} />
                      <Row k="Priority" v={support.categories.HARDWARE.priority} mono />
                      <Row k="Target response" v={support.categories.HARDWARE.targetResponse} />
                      <Row k="Route" v={support.categories.HARDWARE.route} mono />
                    </div>
                  ) : null}
                </>
              ) : (
                <Missing label="Support configuration" reason="GET /api/support did not answer on this load." />
              )}
            </Panel>

            {/* Limits */}
            <Panel
              title="What this page does not cover"
              icon={<AlertTriangle style={{ width: 15, height: 15, color: WARN }} />}
            >
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: C.muted,
                }}
              >
                <li>
                  No supplier is integrated. Ordering hardware today is a phone call or an email you
                  make yourself — nothing on this screen places, tracks or confirms an order.
                </li>
                <li>
                  No email and no SMS is sent from here. There is no send path in the codebase for
                  either.
                </li>
                <li>
                  No revenue and no collected payment. Billing is not live; the only figures shown
                  are contracted plan value from records on file.
                </li>
                <li>
                  Hardware serial numbers, shipment tracking, install status and RMA history are not
                  stored anywhere in this platform.
                </li>
                <li>
                  TruckWithEase is not a registered ELD and sells no ELD license. Any hardware sold
                  is telematics hardware, priced at $600/truck one-time or leased inside the Fleet
                  plan.
                </li>
              </ol>
            </Panel>

            <div
              style={{
                fontFamily: FM,
                fontSize: 11.5,
                color: C.dim,
                lineHeight: 1.7,
                borderTop: `1px solid ${C.border}`,
                paddingTop: 16,
              }}
            >
              Every value on this page came from a live read of this server on this page load. Where
              a number does not exist, this page prints MISSING / NOT TRACKED with the reason instead
              of a zero or a placeholder.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
