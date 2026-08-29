/**
 * SubscriberAgentPage — /subscriber-agent
 *
 * READS (live, every page load, nothing cached):
 *   GET /api/signup             — plan catalog (source of truth: PLANS in api/routes/signup.ts),
 *                                 roles, signup statuses, trialDays, and the server's own notes
 *                                 about MC validation and the fact that signing up charges nothing.
 *   GET /api/signup/list        — every signup record on file, with status counts.
 *   GET /api/subscriptions/list — every subscription record, status counts, contracted MRR,
 *                                 and the billing block that states live:false.
 *
 * MEASURES LOCALLY:
 *   Round trip of each read with performance.now(). Printed with the HTTP status. One page load,
 *   one sample — not an average, not a percentile.
 *
 * REMOVED IN THIS REWRITE (all of it was hardcoded in the file, none of it came from a server):
 *   - Three invented subscribers presented as the customer base: "Ray Davis / ray@example.com /
 *     Pro / Active / joined 2024-07-15", "Maria Santos / maria@example.com / Solo / Pending /
 *     2024-07-20", "John Miller / john@example.com / Fleet / Active / 2024-06-10", each with
 *     hand-typed profileComplete and bankingVerified booleans and hand-typed feature lists.
 *   - The four stat cards computed off that array (Total Subscribers, Active, Pending,
 *     Fully Aligned) — every number was a count of a literal.
 *   - verifyAlignment(), which "verified" accounts by reading those same typed-in booleans and
 *     printing "All requirements met - profile complete, banking verified, features aligned with
 *     plan". There is no profile-completeness check and no banking data anywhere in this platform,
 *     so nothing could be verified. TruckWithEase stores no bank account and no card; billing is
 *     not live.
 *   - The "+ Add Subscriber" form, which pushed a new object into local React state with
 *     profileComplete: true and bankingVerified: true, wrote nothing to any database, and vanished
 *     on refresh. Real signup rows are created by POST /api/signup.
 *   - The 12-row allFeatures checkbox list, which offered "Factoring Integration" and
 *     "Weigh Station Bypass" as assignable entitlements. Neither exists, and TruckWithEase is not
 *     a bypass provider and is not connected to Drivewyze or PrePass.
 *   - A "resigsFeatures" typo key on the first record, so that row's feature count read undefined
 *     until it crashed the length lookup.
 *   - The off-brand palette: navy #0B2A6B / #081E4D / #06090F, slate #64748B / #94A3B8 / #E2E8F0,
 *     light page background #F8FAFC, orange #FF6B00, amber #FFB400, green #16A34A, red #DC2626,
 *     the amber alert box #FEF3C7 / #FDE68A / #92400E. Also the runtime Google Fonts @import of
 *     Poppins and the emoji icons in the header and tab bar.
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   - No revenue. Contracted MRR is plan value on rows marked active; nothing has been collected.
 *   - No payment provider. AUTUMN_SECRET_KEY is a test key and NODE_ENV is development.
 *   - No banking or payment-method status for anyone, because none is stored.
 *   - No profile-completeness score, no entitlement matrix, no churn or conversion rate.
 *   - No FMCSA authority lookup. MC numbers are format-checked only.
 */

import { useEffect, useRef, useState } from "react";
import {
  Users,
  AlertTriangle,
  Gauge,
  Receipt,
  Tag,
  ClipboardList,
  ShieldOff,
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
const FD = "'Bebas Neue',sans-serif";
const FH = "'Oswald',sans-serif";
const FB = "'Inter',sans-serif";
const FM = "'JetBrains Mono',monospace";

async function timedGet(url) {
  const t0 = performance.now();
  const res = await fetch(url);
  const text = await res.text();
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw Object.assign(new Error((body && body.error) || `HTTP ${res.status}`), {
      status: res.status,
      ms,
    });
  }
  return { body, ms, status: res.status };
}

function Panel({ title, note, right, icon, children }) {
  const Icon = icon;
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        marginBottom: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.nav,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icon ? <Icon size={15} color={GOLD} /> : null}
          <h2
            style={{
              margin: 0,
              font: `500 14px ${FH}`,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLDB,
            }}
          >
            {title}
          </h2>
        </div>
        {right ? <div style={{ font: `400 11px ${FM}`, color: C.dim }}>{right}</div> : null}
      </div>
      <div style={{ padding: 20 }}>
        {note ? (
          <div
            style={{
              font: `400 11px ${FM}`,
              color: C.dim,
              marginBottom: 16,
              letterSpacing: "0.04em",
            }}
          >
            {note}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: "1px dashed #333",
        borderRadius: 4,
        padding: 16,
        background: "rgba(201,106,76,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={14} color={WARN} />
        <span
          style={{
            font: `500 11px ${FH}`,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: WARN,
          }}
        >
          Missing / Not tracked
        </span>
      </div>
      <div style={{ font: `600 15px ${FB}`, color: C.white, marginBottom: 6 }}>{label}</div>
      <div style={{ font: `400 13px/1.65 ${FB}`, color: C.muted }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: "14px 16px",
        background: C.nav,
      }}
    >
      <div style={{ font: `400 34px ${FD}`, color: tone === "warn" ? WARN : GOLDB, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          font: `400 10px ${FH}`,
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
        gap: 24,
        padding: "9px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ font: `400 13px ${FB}`, color: C.muted }}>{k}</span>
      <span
        style={{
          font: mono ? `400 12px ${FM}` : `500 13px ${FB}`,
          color: tone === "warn" ? WARN : tone === "gold" ? GOLDB : C.white,
          textAlign: "right",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div
      style={{
        border: `1px solid ${WARN}`,
        borderRadius: 4,
        padding: 12,
        font: `400 12px ${FM}`,
        color: WARN,
      }}
    >
      {msg}
    </div>
  );
}

function Spin() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <style>{`@keyframes twe-spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          width: 14,
          height: 14,
          border: `2px solid ${C.border}`,
          borderTopColor: GOLD,
          borderRadius: "50%",
          animation: "twe-spin 0.8s linear infinite",
        }}
      />
      <span style={{ font: `400 12px ${FM}`, color: C.dim }}>reading…</span>
    </div>
  );
}

function StatusTag({ s }) {
  const warn = s === "rejected" || s === "cancelled" || s === "past_due";
  return (
    <span
      style={{
        border: `1px solid ${warn ? WARN : C.border}`,
        color: warn ? WARN : GOLD,
        borderRadius: 3,
        padding: "2px 8px",
        font: `400 10px ${FM}`,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {s}
    </span>
  );
}

const money = (n) =>
  typeof n === "number" ? `$${n.toFixed(2)}` : "—";
const when = (s) => (s ? String(s).replace("T", " ").replace(".000Z", "Z") : "—");

export default function SubscriberAgentPage() {
  const alive = useRef(false);
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");
  const [cat, setCat] = useState(null);
  const [signups, setSignups] = useState(null);
  const [subs, setSubs] = useState(null);
  const [probes, setProbes] = useState([]);

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding all results.
    alive.current = true;
    (async () => {
      const results = [];
      const read = async (url, setter) => {
        try {
          const r = await timedGet(url);
          results.push({ url, status: r.status, ms: r.ms, ok: true });
          setter(r.body);
        } catch (e) {
          results.push({ url, status: e.status || 0, ms: e.ms || 0, ok: false, msg: e.message });
          setter(null);
        }
      };
      await read("/api/signup", setCat);
      await read("/api/signup/list", setSignups);
      await read("/api/subscriptions/list", setSubs);
      if (!alive.current) return;
      setProbes(results);
      const bad = results.filter((r) => !r.ok);
      if (bad.length === results.length) {
        setState("error");
        setErr(bad.map((b) => `${b.url} → ${b.msg}`).join(" · "));
      } else {
        setState("ok");
      }
    })();
    return () => {
      alive.current = false;
    };
  }, []);

  const planName = (key) => (cat && cat.plans && cat.plans[key] ? cat.plans[key].name : key || "—");

  return (
    <div style={{ background: C.black, minHeight: "100vh", color: C.white, fontFamily: FB }}>
      {/* HEADER */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg,${C.nav} 0%,${C.black} 100%)`,
          padding: "34px 5% 30px",
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
              padding: "5px 12px",
              marginBottom: 16,
            }}
          >
            <Users size={13} color={GOLD} />
            <span
              style={{
                font: `500 10px ${FH}`,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              Subscriber agent
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 14px",
              font: `400 clamp(34px,7vw,52px) ${FD}`,
              letterSpacing: "0.02em",
              lineHeight: 1.02,
            }}
          >
            EVERY ACCOUNT <span style={{ color: GOLDB }}>ON FILE</span>
          </h1>
          <p style={{ margin: 0, maxWidth: 720, font: `400 14px/1.7 ${FB}`, color: C.muted }}>
            <strong style={{ color: C.white }}>
              This is a record viewer, not a billing console.
            </strong>{" "}
            No card, no bank account and no payment method is stored anywhere in this platform, so
            nothing here can be verified as paid. What you get is every signup row and every
            subscription row exactly as the database holds them, the plan catalog from the pricing
            source of truth, and the server's own statement that billing is not live.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 5% 60px" }}>
        {state === "loading" ? <Spin /> : null}
        {state === "error" ? <Err msg={err} /> : null}

        {state === "ok" ? (
          <>
            {/* MEASURED READS */}
            <Panel
              title="This page load, measured"
              icon={Gauge}
              note="Round trip measured with performance.now() in your browser. Not a stored metric."
            >
              {probes.map((p) => (
                <div
                  key={p.url}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 16,
                    padding: "9px 0",
                    borderBottom: `1px solid ${C.border}`,
                    alignItems: "center",
                  }}
                >
                  <span style={{ font: `400 12px ${FM}`, color: C.white }}>{p.url}</span>
                  <span style={{ font: `400 12px ${FM}`, color: p.ok ? GOLD : WARN }}>
                    HTTP {p.status || "—"}
                  </span>
                  <span
                    style={{
                      font: `400 12px ${FM}`,
                      color: p.ms >= 3000 ? WARN : C.muted,
                      textAlign: "right",
                    }}
                  >
                    {p.ms} ms{p.ms >= 3000 ? " ← slow" : ""}
                  </span>
                </div>
              ))}
              {probes.some((p) => !p.ok) ? (
                <div style={{ marginTop: 14 }}>
                  <Err
                    msg={probes
                      .filter((p) => !p.ok)
                      .map((p) => `${p.url} → ${p.msg}`)
                      .join(" · ")}
                  />
                </div>
              ) : null}
            </Panel>

            {/* BILLING TRUTH */}
            <Panel
              title="Billing state"
              icon={ShieldOff}
              note="GET /api/subscriptions/list → billing block, printed verbatim"
            >
              {subs && subs.billing ? (
                <>
                  <div
                    style={{
                      border: `1px solid ${WARN}`,
                      borderRadius: 4,
                      padding: 14,
                      marginBottom: 16,
                      background: "rgba(201,106,76,0.05)",
                    }}
                  >
                    <div
                      style={{
                        font: `500 10px ${FH}`,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: WARN,
                        marginBottom: 8,
                      }}
                    >
                      The server's own words
                    </div>
                    <div style={{ font: `400 14px/1.65 ${FB}`, color: C.white }}>
                      {subs.billing.note}
                    </div>
                  </div>
                  <Row k="Billing live" v={String(subs.billing.live)} mono tone="warn" />
                  <Row k="Payment provider" v={subs.billing.provider || "none"} mono tone="warn" />
                  <Row
                    k="Contracted MRR (active rows only)"
                    v={money(subs.contractedMrr)}
                    mono
                    tone="gold"
                  />
                  <div style={{ marginTop: 14 }}>
                    <Missing
                      label="No collected revenue figure exists"
                      reason={subs.mrrNote}
                    />
                  </div>
                </>
              ) : (
                <Missing
                  label="Billing block not returned"
                  reason="The subscriptions read failed on this page load, so no billing state can be shown."
                />
              )}
            </Panel>

            {/* SIGNUPS */}
            <Panel
              title="Signups on file"
              icon={ClipboardList}
              right={signups ? `${signups.total} row${signups.total === 1 ? "" : "s"}` : ""}
              note="GET /api/signup/list — the signups table, unfiltered"
            >
              {!signups ? (
                <Err msg="Read failed." />
              ) : signups.total === 0 ? (
                <Missing
                  label="Zero signups"
                  reason="The endpoint answers correctly and returns an empty array. Nothing is shown rather than filling the space with example accounts."
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <Stat value={signups.total} label="Total signups" />
                    {cat && cat.statuses
                      ? cat.statuses.map((s) => (
                          <Stat
                            key={s}
                            value={(signups.counts && signups.counts[s]) || 0}
                            label={s}
                            tone={s === "rejected" ? "warn" : undefined}
                          />
                        ))
                      : null}
                  </div>

                  {signups.signups.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 4,
                        padding: 16,
                        marginBottom: 14,
                        background: C.nav,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                          marginBottom: 12,
                        }}
                      >
                        <span style={{ font: `400 20px ${FD}`, color: GOLDB }}>
                          {s.name || "(no name given)"}
                        </span>
                        <StatusTag s={s.status} />
                        <span style={{ font: `400 11px ${FM}`, color: C.dim }}>{s.id}</span>
                      </div>
                      <Row k="Email" v={s.email} mono />
                      <Row k="Phone" v={s.phone || "—"} mono />
                      <Row k="Company" v={s.company || "—"} />
                      <Row k="Role" v={s.role || "—"} />
                      <Row k="Plan selected" v={planName(s.plan)} tone="gold" />
                      <Row k="Vehicle world" v={s.vehicleWorld || "—"} />
                      <Row k="Fleet size given" v={s.fleetSize == null ? "—" : s.fleetSize} mono />
                      <Row
                        k="MC number (format-checked only)"
                        v={s.mcNumber || "—"}
                        mono
                        tone={s.mcNumber ? undefined : "warn"}
                      />
                      <Row k="DOT number" v={s.dotNumber || "—"} mono />
                      <Row k="Source" v={s.source || "—"} mono />
                      <Row k="Trial code" v={s.trialCode || "none"} mono />
                      <Row k="Created" v={when(s.createdAt)} mono />
                      <Row k="Updated" v={when(s.updatedAt)} mono />
                    </div>
                  ))}

                  {cat && cat.notes ? (
                    <div
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 14,
                        marginTop: 4,
                      }}
                    >
                      {Object.entries(cat.notes).map(([k, v]) => (
                        <div
                          key={k}
                          style={{
                            font: `400 12px/1.7 ${FB}`,
                            color: C.muted,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ color: GOLD, fontFamily: FM, fontSize: 11 }}>{k}</span>{" "}
                          — {v}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </Panel>

            {/* SUBSCRIPTIONS */}
            <Panel
              title="Subscription records"
              icon={Receipt}
              right={subs ? `${subs.total} row${subs.total === 1 ? "" : "s"}` : ""}
              note="GET /api/subscriptions/list — records only; no provider-side subscription exists"
            >
              {!subs ? (
                <Err msg="Read failed." />
              ) : subs.total === 0 ? (
                <Missing
                  label="Zero subscription records"
                  reason="Nobody is subscribed. The table is empty and the page prints nothing rather than a sample account."
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <Stat value={subs.total} label="Records" />
                    {Object.entries(subs.counts || {}).map(([k, v]) => (
                      <Stat
                        key={k}
                        value={v}
                        label={k}
                        tone={k === "cancelled" || k === "past_due" ? "warn" : undefined}
                      />
                    ))}
                  </div>

                  {subs.subscriptions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 4,
                        padding: 16,
                        marginBottom: 14,
                        background: C.nav,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                          marginBottom: 12,
                        }}
                      >
                        <span style={{ font: `400 20px ${FD}`, color: GOLDB }}>
                          {s.accountName}
                        </span>
                        <StatusTag s={s.status} />
                        <span style={{ font: `400 11px ${FM}`, color: C.dim }}>{s.id}</span>
                      </div>
                      <Row k="Contact" v={s.contactEmail} mono />
                      <Row k="Plan" v={planName(s.plan)} tone="gold" />
                      <Row
                        k="Priced at"
                        v={
                          s.pricing
                            ? `${money(s.pricing.unitPrice)} × ${s.pricing.units} ${s.pricing.unit}`
                            : money(s.unitPrice)
                        }
                        mono
                      />
                      <Row
                        k="Monthly plan value"
                        v={s.pricing ? money(s.pricing.monthlyTotal) : "—"}
                        mono
                        tone="gold"
                      />
                      <Row k="Seats" v={s.seats == null ? "—" : s.seats} mono />
                      <Row k="Trucks" v={s.trucks == null ? "—" : s.trucks} mono />
                      <Row k="Trial ends" v={when(s.trialEndsAt)} mono />
                      <Row k="Started" v={when(s.startedAt)} mono />
                      <Row
                        k="Cancelled"
                        v={when(s.cancelledAt)}
                        mono
                        tone={s.cancelledAt ? "warn" : undefined}
                      />
                      <Row k="Cancel reason" v={s.cancelReason || "—"} />
                      <Row
                        k="Payment provider ref"
                        v={s.providerRef || "none — no provider subscription exists"}
                        mono
                        tone="warn"
                      />
                    </div>
                  ))}
                </>
              )}
            </Panel>

            {/* PLAN CATALOG */}
            <Panel
              title="Plan catalog"
              icon={Tag}
              note="GET /api/signup → plans. Source of truth is PLANS in api/routes/signup.ts."
            >
              {!cat ? (
                <Err msg="Read failed." />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
                      gap: 12,
                      marginBottom: 18,
                    }}
                  >
                    {Object.entries(cat.plans).map(([key, p]) => (
                      <div
                        key={key}
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          padding: 16,
                          background: C.nav,
                        }}
                      >
                        <div style={{ font: `400 11px ${FM}`, color: C.dim, marginBottom: 6 }}>
                          {key}
                        </div>
                        <div style={{ font: `500 15px ${FH}`, color: C.white, marginBottom: 8 }}>
                          {p.name}
                        </div>
                        <div style={{ font: `400 30px ${FD}`, color: GOLDB, lineHeight: 1 }}>
                          ${p.unitPrice}
                        </div>
                        <div
                          style={{
                            font: `400 10px ${FH}`,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: C.dim,
                            margin: "6px 0 10px",
                          }}
                        >
                          per {p.unit}
                        </div>
                        <div style={{ font: `400 12px/1.6 ${FB}`, color: C.muted }}>{p.note}</div>
                      </div>
                    ))}
                  </div>
                  <Row k="Free trial" v={`${cat.trialDays} days`} mono tone="gold" />
                  <Row k="Roles offered at signup" v={(cat.roles || []).join(", ")} mono />
                  <Row k="Vehicle worlds" v={(cat.vehicleWorlds || []).join(", ")} mono />
                  <Row k="Signup statuses" v={(cat.statuses || []).join(", ")} mono />
                </>
              )}
            </Panel>

            {/* GAPS */}
            <Panel title="Account alignment" icon={AlertTriangle}>
              <div style={{ display: "grid", gap: 14 }}>
                <Missing
                  label="No profile-completeness check exists"
                  reason="The previous version of this page showed a per-account 'Aligned' badge and printed 'All requirements met — profile complete, banking verified, features aligned with plan'. Those were three hand-typed booleans on three invented accounts. Nothing in this platform scores a profile, so no account can be marked aligned or misaligned."
                />
                <Missing
                  label="No banking or payment-method status for anyone"
                  reason="TruckWithEase stores no bank account, no routing number and no card. The old 'Banking verified' column was a typed-in true/false. Billing is not live, so there is nothing to verify against."
                />
                <Missing
                  label="No per-account entitlement matrix"
                  reason="Features are not assigned per subscriber anywhere in the database. The old 12-checkbox list offered 'Factoring Integration' and 'Weigh Station Bypass' as togglable entitlements — neither is built, and TruckWithEase is not a bypass provider and is not connected to Drivewyze or PrePass."
                />
                <Missing
                  label="No conversion, churn or activation rate"
                  reason="Two signups and one cancelled record are not a rate. Nothing tracks status changes over time, so no funnel percentage can be computed honestly."
                />
              </div>
            </Panel>

            {/* NOT COVERED */}
            <Panel title="What this page does not cover" icon={AlertTriangle}>
              <ol style={{ margin: 0, paddingLeft: 22, font: `400 13px/1.9 ${FB}`, color: C.muted }}>
                <li>
                  <strong style={{ color: C.white }}>No money has moved.</strong> The Autumn key is a
                  test key and NODE_ENV is development. Contracted MRR is plan value, not revenue.
                </li>
                <li>
                  <strong style={{ color: C.white }}>No account creation from this page.</strong> The
                  old "+ Add Subscriber" button only pushed an object into React state. Real rows come
                  from POST /api/signup.
                </li>
                <li>
                  <strong style={{ color: C.white }}>MC numbers are unverified.</strong> Format check
                  only. No FMCSA authority, insurance or operating-status lookup is performed.
                </li>
                <li>
                  <strong style={{ color: C.white }}>Latency here is one sample.</strong> Three reads,
                  this page load, this browser.
                </li>
                <li>
                  <strong style={{ color: C.white }}>These rows include test data.</strong> The
                  addresses ending in @example.com were created while building the signup flow and
                  should be deleted before launch.
                </li>
              </ol>
            </Panel>

            <p
              style={{
                font: `400 11px/1.8 ${FM}`,
                color: C.dim,
                textAlign: "center",
                margin: "6px 0 0",
              }}
            >
              Every value on this page is read live from /api/signup, /api/signup/list and
              /api/subscriptions/list when the page loads. Nothing is cached, averaged or stored.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
