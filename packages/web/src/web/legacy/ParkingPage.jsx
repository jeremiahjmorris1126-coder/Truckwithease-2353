/**
 * ParkingPage — REBUILT 2026-08-27
 *
 * WHAT WAS DELETED FROM THE ORIGINAL AND WHY
 * (original preserved verbatim at docs/launch/ParkingPage.ORIGINAL.jsx.txt, md5 ef2b852cf932b4ed32982066f83d1e8a)
 *
 * 1. PARKING_SPOTS — 8 completely invented parking locations presented as live data. Every one of
 *    them named a REAL business at a REAL exit and then invented its facts: "Pilot Flying J #0441,
 *    Exit 220, 38 open spaces of 60, 12 showers, ~5 min wait", "Love's Travel Stop Exit 11, 14 of
 *    40", "Flying J #0882 Exit 48, 42 of 65, 18 showers, ~3 min", "TA Petro #193 Exit 61, 55 of 80,
 *    20 showers, ~2 min", "Petro Stopping Center Exit 42, 28 of 45". None of it came from anywhere.
 *    A driver with 20 minutes of clock left, routing to a lot because this screen said 42 spaces
 *    were open, is the exact failure this page must never cause. Open-space counts are the single
 *    most safety-critical number in this app after weight limits, and we had them hardcoded.
 *
 * 2. The invented SAFETY claims. "Walmart Supercenter ... 🚫 NOT safe for overnight — 3 theft
 *    reports this month. Do not park here." There were no theft reports. We invented crime data
 *    about a named, real, identifiable business at a specific exit. That is defamation risk on top
 *    of being false. Also deleted: the "⚠️ Theft Risk" badge, the safe:true/false flag driving it,
 *    and "Walmart lots have the highest truck theft rate of any parking type" (unsourced).
 *
 * 3. nearbyMotels — invented hotels with invented nightly rates and invented star ratings
 *    ("La Quinta Inn Texarkana, 0.8 mi, $79/nt, 4.1", "Drury Inn & Suites $109/nt 4.5",
 *    "Motel 6 Joplin $54/nt 3.6"). Real brands, fabricated prices and scores.
 *
 * 4. DRIVER_HOS = { driveLeft:"2h 15m", windowLeft:"3h 40m", action:"STOP NEEDED IN ~135 MI" } —
 *    a hardcoded fake clock, and the comment in the source literally said "Current HOS simulation".
 *    It drove a red full-width "HOS ALERT" banner at the top of the page. A fabricated hours-of-
 *    service warning is worse than no warning: it trains the driver to ignore the real one.
 *    Replaced with the actual clock from GET /api/hos.
 *
 * 5. The fake AI chat ("🤖 AI Parking Navigator — HOS-Aware"). A setTimeout waiting 900ms behind a
 *    chat bubble, then returning one of five canned strings built from the invented spot list —
 *    "Best overnight options on your corridor: 1️⃣ Flying J #0882 (Exit 48 · 42 spaces...)". It
 *    called no model and no API. It also opened with an unprompted claim that 3 safe spots were
 *    confirmed in range. Deleted rather than rewired: an LLM must never be the source of whether a
 *    parking space physically exists.
 *
 * 6. PIN_POSITIONS / SPOT_COORDS — hand-placed map pins and hardcoded lat/lngs for the 8 invented
 *    lots, plus the Google Maps loader and the "Google Maps powering live parking locations"
 *    loading caption. The Maps Embed API returns HTTP 403 for our key, so that map never drew
 *    anything; the caption claimed a live source behind a permanently broken map.
 *
 * 7. Off-brand paint: navy #0B2A6B/#081E4D/#06090F/#0C1628/#0f1f3d/#1e3a6e, amber #FFB400,
 *    orange #FF6B00, green #16A34A, red #DC2626, slate #94a3b8/#e2e8f0/#64748b, Poppins/DM Mono.
 *
 * WHAT IS REAL ON THIS PAGE NOW
 * - GET /api/hos — the driver's actual drive-time and on-duty clocks and actual violations.
 * - Range math from those real seconds against a speed the driver types in himself.
 * - Outbound links to the agencies that actually publish truck parking availability.
 * - Everything we cannot source renders as MISSING / NOT TRACKED with the reason.
 */

import { useState, useEffect, useMemo } from "react";
import {
  ParkingSquare, AlertTriangle, ExternalLink, Clock, RefreshCw,
  Gauge, MapPin, ShieldQuestion, Link2,
} from "lucide-react";

const DRIVER_ID = "drv-1";

/* ---------------------------------------------------------------- house kit */

function Panel({ title, note, right, children }) {
  return (
    <section style={{ background: "#161616", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: "#F5F5F5", margin: 0 }}>{title}</h2>
          {note && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#8a8a8a", lineHeight: 1.6 }}>{note}</p>}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: "#131313" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <AlertTriangle size={13} color="#c96a4c" />
        <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c96a4c" }}>
          Missing / Not tracked
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#F5F5F5", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#8a8a8a", lineHeight: 1.6 }}>{reason}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "8px 0", borderBottom: "1px solid #1c1c1c" }}>
      <span style={{ fontSize: 12, color: "#8a8a8a" }}>{k}</span>
      <span style={{ fontSize: 12, color: tone || "#F5F5F5", fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a8a", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = {
  width: "100%", background: "#0f0f0f", border: "1px solid #222", borderRadius: 8,
  padding: "10px 12px", color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13, outline: "none",
};

function hhmm(sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return "—";
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/* ------------------------------------------------------- real outside sources
 * Every entry below is a government or public-agency program that actually
 * publishes truck parking information. We link to their own front page and
 * reproduce no counts, no availability and no claims of our own.            */

const SOURCES = [
  { name: "Trucks Park Here (MAASTO TPIMS)", scope: "8-state Midwest corridor", url: "https://trucksparkhere.com/", what: "Federally funded multi-state real-time truck parking availability system." },
  { name: "FHWA — Truck Parking", scope: "National", url: "https://ops.fhwa.dot.gov/freight/infrastructure/truck_parking/index.htm", what: "Federal program page, including the Jason's Law survey work." },
  { name: "BTS — Truck Stop Parking dataset", scope: "National", url: "https://data-usdot.opendata.arcgis.com/datasets/usdot::truck-stop-parking/about", what: "USDOT open geospatial inventory of truck parking locations." },
  { name: "FDOT Truck Parking Availability System", scope: "Florida", url: "https://www.fdot.gov/rail/studies/truck-parking", what: "State system covering Florida interstates." },
  { name: "NMDOT TPAS", scope: "New Mexico / I-10", url: "https://www.dot.nm.gov/travel-information/trucking-industry/tpas/", what: "I-10 corridor availability detection." },
  { name: "AZ511", scope: "Arizona / I-10", url: "https://az511.gov/", what: "Carries I-10 truck parking availability across AZ, CA, NM and TX." },
  { name: "FHWA 511 directory", scope: "All states", url: "https://ops.fhwa.dot.gov/511/", what: "Every state's own traveler-information line and site." },
];

const INTERNAL = [
  { href: "/hos", label: "Hours of Service", desc: "The clock this page reads" },
  { href: "/trip-planner", label: "Trip Planner", desc: "Range, fuel and toll math" },
  { href: "/weather", label: "Weather", desc: "Live NWS conditions" },
  { href: "/fuel-finder", label: "Fuel Finder", desc: "Live EIA diesel averages" },
  { href: "/state-patrol", label: "State & Federal Limits", desc: "Federal weight limits, cited" },
  { href: "/breakdown", label: "Breakdown / SOS", desc: "If you cannot make a stop" },
];

/* ------------------------------------------------------------------- page */

export default function ParkingPage() {
  const [hos, setHos] = useState({ state: "loading", data: null, error: "" });
  const [mph, setMph] = useState("58");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let dead = false;
    setHos((p) => ({ ...p, state: "loading" }));
    fetch("/api/hos")
      .then(async (r) => {
        const body = await r.text();
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${body.slice(0, 160)}`);
        return JSON.parse(body);
      })
      .then((j) => {
        if (dead) return;
        const me = (j.fleet || []).find((f) => f.driverId === DRIVER_ID) || (j.fleet || [])[0] || null;
        setHos({ state: me ? "ok" : "error", data: me, error: me ? "" : "No driver rows returned by /api/hos." });
      })
      .catch((e) => { if (!dead) setHos({ state: "error", data: null, error: String(e.message || e) }); });
    return () => { dead = true; };
  }, [reload]);

  const me = hos.data;
  const driveLeft = me?.clocks?.drivingRemaining ?? null;
  const windowLeft = me?.clocks?.onDutyWindowRemaining ?? null;

  const range = useMemo(() => {
    const v = parseFloat(mph);
    if (!Number.isFinite(v) || v <= 0 || driveLeft === null) return null;
    return (driveLeft / 3600) * v;
  }, [mph, driveLeft]);

  const outOfHours = driveLeft !== null && driveLeft <= 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>

      {/* header band */}
      <div style={{ borderBottom: "1px solid #222", background: "linear-gradient(to bottom, #111, #0a0a0a)", padding: "34px 28px 26px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #222", borderRadius: 6, padding: "4px 10px", marginBottom: 14 }}>
            <ParkingSquare size={12} color="#C9A84C" />
            <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C9A84C" }}>Parking &amp; Rest</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, letterSpacing: "0.01em", margin: 0 }}>
            TRUCK <span style={{ color: "#FFD700" }}>PARKING</span>
          </h1>
          <p style={{ maxWidth: 760, marginTop: 14, fontSize: 14, lineHeight: 1.75, color: "#c9c9c9" }}>
            This page tells you how far your <strong style={{ color: "#F5F5F5" }}>real</strong> remaining hours will carry you, and
            points you at the agencies that actually publish live space counts. It does not list lots or show open
            spaces, because TruckWithEase has no parking availability feed. Anything we cannot source is marked
            missing rather than filled in.
          </p>
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #333", borderRadius: 6, padding: "5px 11px", background: "#131313" }}>
            <ShieldQuestion size={12} color="#c96a4c" />
            <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c96a4c" }}>
              No space counts — we have no feed
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 60px", display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(430px, 1fr))" }}>

        {/* real clock */}
        <Panel
          title="Your hours right now"
          note="GET /api/hos — the same clock the HOS page reads. Not a simulation."
          right={
            <button onClick={() => setReload((n) => n + 1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #333", color: "#C9A84C", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "Oswald, sans-serif", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <RefreshCw size={11} /> Refresh
            </button>
          }
        >
          {hos.state === "loading" && <div style={{ fontSize: 13, color: "#8a8a8a" }}>Reading /api/hos…</div>}

          {hos.state === "error" && (
            <div style={{ border: "1px solid #3a2420", background: "#1a1210", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={13} color="#c96a4c" />
                <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c96a4c" }}>Clock unavailable</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c9c9c9", wordBreak: "break-all" }}>{hos.error}</div>
              <div style={{ fontSize: 12, color: "#8a8a8a", marginTop: 8 }}>No range is shown while the clock is unreadable. We will not guess it.</div>
            </div>
          )}

          {hos.state === "ok" && me && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[
                  { l: "Drive time left", v: hhmm(driveLeft), warn: outOfHours },
                  { l: "14-hr window left", v: hhmm(windowLeft), warn: windowLeft !== null && windowLeft <= 0 },
                ].map((c) => (
                  <div key={c.l} style={{ background: "#111", border: `1px solid ${c.warn ? "#3a2420" : "#222"}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: c.warn ? "#c96a4c" : "#FFD700" }}>{c.v}</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8a8a", marginTop: 4 }}>{c.l}</div>
                  </div>
                ))}
              </div>

              <Row k="Driver" v={`${me.name} · ${me.truckNumber}`} />
              <Row k="Duty status" v={String(me.status || "—").toUpperCase()} mono />
              <Row k="Driving used" v={hhmm(me.clocks?.drivingUsed)} mono />
              <Row k="On-duty window used" v={hhmm(me.clocks?.onDutyWindowUsed)} mono />

              {Array.isArray(me.violations) && me.violations.length > 0 && (
                <div style={{ marginTop: 14, border: "1px solid #3a2420", background: "#1a1210", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c96a4c", marginBottom: 8 }}>
                    Live from /api/hos — {me.violations.length} open
                  </div>
                  {me.violations.map((v, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#e6c8bd", lineHeight: 1.6, marginBottom: 4 }}>• {v.msg}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>

        {/* range math */}
        <Panel
          title="How far your clock reaches"
          note="Straight arithmetic on your real remaining drive seconds and a speed you type. No traffic, terrain or weather model."
        >
          <Field label="Your realistic average speed (mph)">
            <input style={inputCls} value={mph} onChange={(e) => setMph(e.target.value)} inputMode="decimal" placeholder="58" />
          </Field>

          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "18px 16px", textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: outOfHours ? "#c96a4c" : "#FFD700", lineHeight: 1 }}>
              {range === null ? "—" : `${Math.round(range)}`}
            </div>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a8a", marginTop: 8 }}>
              Miles you can legally still drive
            </div>
          </div>

          {outOfHours && (
            <div style={{ border: "1px solid #3a2420", background: "#1a1210", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Clock size={13} color="#c96a4c" />
                <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c96a4c" }}>Zero drive time left</span>
              </div>
              <div style={{ fontSize: 12, color: "#c9c9c9", lineHeight: 1.65 }}>
                Your clock says zero, so the range above is zero. Park where you are if it is legal and safe to do so.
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: "#8a8a8a", lineHeight: 1.65 }}>
            <Gauge size={13} color="#8a8a8a" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              This is clock arithmetic, not a compliance ruling. TruckWithEase is not a registered ELD. Give yourself a
              cushion — the number above is the legal ceiling, not a target.
            </span>
          </div>
        </Panel>

        {/* what we don't have */}
        <Panel title="What this page does not do" note="Stated plainly so nobody plans a load around a capability that is not here.">
          <Missing
            label="Live open-space counts"
            reason="TruckWithEase has no parking availability feed. There is no /api/parking route and no vendor contract. The state systems linked to the right publish real counts for the corridors they cover — use those."
          />
          <Missing
            label="Lot directory (names, exits, amenities)"
            reason="We have no licensed truck-stop dataset. The USDOT BTS Truck Stop Parking layer is public and would fill this, but importing and keeping it current is real work that has not been done."
          />
          <Missing
            label="Safety, lighting, camera and theft data"
            reason="No sourced dataset exists for us. Inventing crime statistics about a named business is not something this app will do — the previous version of this page did exactly that and it has been removed."
          />
          <Missing
            label="Map"
            reason="The Google Maps Embed API returns HTTP 403 for our key and Places returns API_KEY_SERVICE_BLOCKED. Until those two APIs are enabled on the key, no map on this platform will draw."
          />
          <Missing
            label="Reservations"
            reason="No booking integration. We would never show a space as held without a confirmation from whoever owns the lot."
          />
        </Panel>

        {/* real sources */}
        <Panel
          title="Where real availability lives"
          note="Public agency programs that actually publish truck parking information. Links only — we reproduce none of their numbers."
        >
          {SOURCES.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none", border: "1px solid #222", background: "#111", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F5F5F5" }}>{s.name}</span>
                <ExternalLink size={12} color="#C9A84C" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 5px" }}>
                <MapPin size={11} color="#8a8a8a" />
                <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9A84C" }}>{s.scope}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8a8a8a", lineHeight: 1.6 }}>{s.what}</div>
            </a>
          ))}
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65, marginTop: 10 }}>
            Coverage is partial nationwide. Most states still publish nothing in real time, which is the actual reason
            this screen is thin — not an oversight in the app.
          </div>
        </Panel>

        {/* internal */}
        <Panel title="Related pages" note="Other screens in the app backed by a named source.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {INTERNAL.map((l) => (
              <a key={l.href} href={l.href}
                style={{ display: "block", textDecoration: "none", border: "1px solid #222", background: "#111", borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#F5F5F5" }}>{l.label}</span>
                  <Link2 size={11} color="#C9A84C" style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 10, color: "#8a8a8a", marginTop: 3 }}>{l.desc}</div>
              </a>
            ))}
          </div>
        </Panel>

        {/* what would make it real */}
        <Panel title="What would make this page real" note="In order of what actually helps a driver at 9pm.">
          {[
            "Import the USDOT BTS Truck Stop Parking layer into a parking_locations table — that alone gives a real directory of lots with real coordinates, no vendor needed.",
            "Consume the state TPIMS/TPAS feeds for the corridors that publish them and show their counts with their timestamp and their name attached.",
            "Turn on driver-sourced reports (the road_danger_reports table that has been offered twice) so a driver can mark a lot full and it expires on its own after a few hours.",
            "Enable Maps Embed + Places on the Google key so lots can be plotted and routed to.",
            "Only after all of the above: an assistant that reads those real sources. Never one that answers from a model's memory.",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#C9A84C", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 12, color: "#c9c9c9", lineHeight: 1.65 }}>{t}</span>
            </div>
          ))}
        </Panel>
      </div>

      <div style={{ borderTop: "1px solid #222", padding: "20px 28px 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", fontSize: 11, color: "#666", lineHeight: 1.75 }}>
          TruckWithEase does not track parking availability, does not rate the safety of any lot, and does not reserve
          spaces. The hours shown are read from this platform's own logs and are not a substitute for a registered ELD
          or for your own record of duty status.
        </div>
      </div>
    </div>
  );
}
