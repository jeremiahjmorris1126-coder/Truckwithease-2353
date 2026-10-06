/**
 * ELD — WHAT TRUCKWITHEASE IS AND IS NOT — /eld
 *
 * READS (live, every number on this page comes from these round trips)
 *   GET /api/eld               REQUIRED — auxiliary device registry, telemetry counts,
 *                              driver coverage, orphan-row integrity counts, FMCSA status
 *   GET /api/eld/device-types  optional — the device types the platform will accept
 *   GET /api/hos               optional — duty clocks, shown only to make the point that
 *                              TruckWithEase reads what the driver logs, not the truck's ECM
 *
 * COMPUTES / MEASURES LOCALLY
 *   Round-trip latency per read (timedGet), flagged at >= 3000 ms.
 *   Nothing else. Every figure rendered here is computed server-side in
 *   packages/web/src/api/routes/eld.ts against live rows, or rendered as MISSING
 *   with the server's own reason string.
 *
 * REMOVED IN THIS REWRITE (all of it was fabricated; none of it was ever true)
 *   - "FMCSA-REGISTERED" badge. TruckWithEase is not on eld.fmcsa.dot.gov/List and
 *     no self-certification has been filed.
 *   - "12-layer engine" — there is no such engine, and there never were 12 layers.
 *   - "2.4 trillion route permutations per dispatch" — an invented number.
 *   - "Violation prediction 72 hours ahead" — no model predicts anything 72 hours out.
 *   - Six invented hardware device rows with invented specs, prices and part numbers
 *     for hardware that is not manufactured, stocked or shipped.
 *   - A Samsara / Motive comparison table. No competitor is named or priced anywhere
 *     in this product.
 *   - "The only ELD in the world…" — TruckWithEase is not an ELD at all.
 *   This page also replaces ELDHardwareMarketingPage.jsx and
 *   MorrishiveELDRevolutionPage.jsx, both deleted in the same change. Their nine
 *   URLs all land here so no bookmark dies. The originals are preserved verbatim at
 *   docs/launch/*.ORIGINAL.jsx.txt.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   TruckWithEase is not an ELD. It does not record hours of service as the log of
 *   record, it is not registered with FMCSA, and it cannot be used to satisfy
 *   49 CFR 395.8 on its own. It runs alongside the registered ELD the driver
 *   already has. No accuracy, confidence or uptime percentage is shown. No device
 *   is sold, leased or claimed here. Nothing is filed with any agency.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Ban, Cpu, Gauge, HardDrive, Layers, ShieldAlert, Radio,
} from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const num = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString());
const when = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

const TYPE_LABEL = {
  gps_tracker: "GPS tracker",
  obd2_reader: "OBD-II reader",
  dash_cam: "Dash camera",
  cellular_modem: "Cellular modem",
  steering_wheel_haptic: "Steering-wheel haptic",
  vehicle_seat_haptic: "Seat haptic",
};

/** The line-by-line boundary. Left column is the driver's ELD, right is this product. */
const BOUNDARY = [
  {
    subject: "Hours-of-service log of record",
    eld: "The driver's registered ELD. It is the record a roadside officer and an auditor accept.",
    twe: "Not us. TruckWithEase never becomes the log of record and cannot be presented as one.",
  },
  {
    subject: "FMCSA registration",
    eld: "Listed on eld.fmcsa.dot.gov/List by its manufacturer.",
    twe: "Not registered. No self-certification has been filed. Any page that said otherwise was wrong and has been deleted.",
  },
  {
    subject: "Engine connection (ECM)",
    eld: "Wired into the diagnostic port. Reads engine hours, VIN and odometer directly.",
    twe: "No ECM connection. TruckWithEase reads only what a driver enters and what an auxiliary unit posts to /api/eld/telemetry.",
  },
  {
    subject: "Duty-status changes",
    eld: "Recorded and certified there.",
    twe: "Mirrored for planning and coaching. A change made in TruckWithEase does not amend the ELD record.",
  },
  {
    subject: "Roadside inspection transfer",
    eld: "Handles the eRODS transfer. That stays with the ELD.",
    twe: "Nothing to transfer. TruckWithEase produces no eRODS file.",
  },
  {
    subject: "Fatigue signal",
    eld: "Not scored by most ELDs.",
    twe: "Scored here — from recorded telemetry only, and withheld entirely below the sample floor. It is a coaching signal, not an HOS determination.",
  },
];

function Boundary() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FB, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>Subject</th>
            <th style={th}>The ELD the driver already has</th>
            <th style={th}>TruckWithEase</th>
          </tr>
        </thead>
        <tbody>
          {BOUNDARY.map((r) => (
            <tr key={r.subject}>
              <td style={{ ...td, color: C.white, fontFamily: FH, letterSpacing: "0.06em" }}>{r.subject}</td>
              <td style={{ ...td, color: C.muted, lineHeight: 1.7 }}>{r.eld}</td>
              <td style={{ ...td, color: C.muted, lineHeight: 1.7 }}>{r.twe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TruckWithEaseELDPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [reads, setReads] = useState([]);
  const [eld, setEld] = useState(null);
  const [types, setTypes] = useState(null);
  const [hos, setHos] = useState(null);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const eldR = await timedGet("/api/eld");
      if (!alive.current) return;
      const collected = [eldR];
      setEld(eldR.body);

      const opt = await Promise.allSettled([
        timedGet("/api/eld/device-types"),
        timedGet("/api/hos"),
      ]);
      if (!alive.current) return;
      const [typesR, hosR] = opt;
      if (typesR.status === "fulfilled") { collected.push(typesR.value); setTypes(typesR.value.body); }
      if (hosR.status === "fulfilled") { collected.push(hosR.value); setHos(hosR.value.body); }

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

  const dev = eld?.devices;
  const cov = eld?.coverage;
  const tel = eld?.telemetry;

  return (
    <div style={page}>
      <div style={wrap}>
        <Header
          icon={<Ban size={26} color={GOLDB} />}
          eyebrow="TruckWithEase / ELD"
          title="THIS IS NOT AN"
          accent="ELD"
          lead="TruckWithEase does not record your hours of service, is not registered with FMCSA, and cannot be shown to an officer in place of your logbook device. It runs alongside the ELD you already have. This page draws the line in detail and then shows exactly what hardware, if any, the platform actually has on file."
        />

        {state === "loading" && <Spin label="Reading /api/eld…" />}
        {state === "error" && <Err error={error} onRetry={load} />}

        {state === "ok" && eld && (
          <>
            <Panel
              title="The claim, stated plainly"
              note="whatThisIs string returned by GET /api/eld — the server states it, the page does not compose it"
              icon={<ShieldAlert size={16} color={GOLD} />}
              right={<Tag tone="warn">Not FMCSA registered</Tag>}
            >
              <p style={{ color: C.white, fontFamily: FB, fontSize: 14.5, lineHeight: 1.8, margin: 0 }}>
                {eld.whatThisIs}
              </p>
              <p style={{ color: WARN, fontFamily: FB, fontSize: 13.5, lineHeight: 1.8, marginTop: 14, marginBottom: 0 }}>
                {eld.fmcsa?.note}
              </p>
            </Panel>

            <Panel
              title="Where the ELD ends and TruckWithEase begins"
              note="Static text. Six subjects, stated as a boundary rather than a feature list. No product other than TruckWithEase is named."
              icon={<Layers size={16} color={GOLD} />}
            >
              <Boundary />
            </Panel>

            <Panel
              title="Auxiliary hardware on file"
              note="Rows from eld_devices. These are optional accessories the platform can accept telemetry from — trackers, OBD-II readers, cameras, modems, haptics. None of them is an ELD, none is sold or leased on this page, and a device counts as online only when it posted telemetry inside its own sync window."
              icon={<HardDrive size={16} color={GOLD} />}
            >
              <div style={{ ...grid(200), marginBottom: 18 }}>
                <Stat label="Devices registered" value={num(dev?.total)} sub="rows in eld_devices" />
                <Stat
                  label="Reporting inside sync window"
                  value={num(dev?.online)}
                  sub="counted as online"
                  tone={dev?.online ? "gold" : "warn"}
                />
                <Stat
                  label="Never reported once"
                  value={num(dev?.neverReported)}
                  sub="registered but last_sync is null"
                  tone={dev?.neverReported ? "warn" : "dim"}
                />
                <Stat
                  label="Drivers with a device"
                  value={cov ? `${num(cov.driversWithDevice)} / ${num(cov.driversTotal)}` : "—"}
                  sub={cov?.percent === null ? "no percentage — see below" : `${cov?.percent}% of driver rows`}
                  tone={cov?.percent ? "gold" : "warn"}
                />
              </div>

              {cov?.percentUnavailableReason ? (
                <div style={{ marginBottom: 18 }}>
                  <Missing label="COVERAGE PERCENT UNAVAILABLE" reason={cov.percentUnavailableReason} />
                </div>
              ) : null}

              {dev?.total === 0 ? (
                <Missing
                  label="NO HARDWARE REGISTERED"
                  reason="eld_devices is empty. No tracker, reader, camera, modem or haptic unit has ever been registered to this fleet, so the platform is reading nothing from any truck. That is the honest state, not a loading failure."
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FM, fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={th}>Device</th>
                        <th style={th}>Type</th>
                        <th style={th}>Driver</th>
                        <th style={th}>Status</th>
                        <th style={th}>Last sync</th>
                        <th style={{ ...th, textAlign: "right" }}>Sec since</th>
                        <th style={th}>Online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dev.rows.map((d) => (
                        <tr key={d.id}>
                          <td style={{ ...td, color: C.white }}>{d.deviceSerial}</td>
                          <td style={{ ...td, color: C.muted }}>{TYPE_LABEL[d.deviceType] ?? d.deviceType}</td>
                          <td style={{ ...td, color: C.muted }}>{d.driverId}</td>
                          <td style={{ ...td, color: C.muted }}>{d.status}</td>
                          <td style={{ ...td, color: C.muted }}>{d.neverReported ? "never" : when(d.lastSync)}</td>
                          <td style={tdNum}>{d.secondsSinceSync === null ? "—" : num(d.secondsSinceSync)}</td>
                          <td style={td}>
                            <Tag tone={d.online ? "gold" : "warn"}>{d.online ? "online" : "no"}</Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {eld.integrity?.orphanDeviceCount > 0 ? (
                <div style={{ marginTop: 18 }}>
                  <Missing
                    label={`${eld.integrity.orphanDeviceCount} ORPHAN DEVICE ROW(S)`}
                    reason={`${eld.integrity.orphanNote} IDs: ${eld.integrity.orphanDeviceIds.join(", ")}`}
                  />
                </div>
              ) : (
                <p style={{ fontFamily: FM, fontSize: 11.5, color: C.dim, lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
                  {eld.integrity?.orphanNote}
                </p>
              )}
            </Panel>

            <Panel
              title="Telemetry actually received"
              note="Rows in eld_telemetry. The fatigue scorer refuses to produce a number below the sample floor — a guessed safety score is worse than none, and the original code generated one with Math.random()."
              icon={<Radio size={16} color={GOLD} />}
            >
              <div style={grid(200)}>
                <Stat label="Rows in last 24 h" value={num(tel?.rowsLast24h)} sub="eld_telemetry" tone={tel?.rowsLast24h ? "gold" : "warn"} />
                <Stat label="Sample floor" value={num(tel?.minSamplesForFatigueScore)} sub="below this, no score is produced" />
                <Stat
                  label="Fatigue scoring possible"
                  value={tel?.fatigueScorable ? "YES" : "NO"}
                  sub={tel?.fatigueScorable ? "enough samples in window" : "not enough samples"}
                  tone={tel?.fatigueScorable ? "gold" : "warn"}
                />
                <Stat label="Latest sample" value={tel?.latestRecordedAt ? "SEE BELOW" : "—"} sub={tel?.latestRecordedAt ? when(tel.latestRecordedAt) : "none on record"} tone={tel?.latestRecordedAt ? "gold" : "warn"} />
              </div>

              {tel?.latestUnavailableReason ? (
                <div style={{ marginTop: 18 }}>
                  <Missing label="NO TELEMETRY EVER RECEIVED" reason={tel.latestUnavailableReason} />
                </div>
              ) : null}

              <div style={{ marginTop: 18 }}>
                <div style={{ fontFamily: FH, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
                  Fatigue bands
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FM, fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={th}>Level</th>
                        <th style={{ ...th, textAlign: "right" }}>Score ≤</th>
                        <th style={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(eld.fatigueBands ?? []).map((b) => (
                        <tr key={b.level}>
                          <td style={{ ...td, color: C.white }}>{b.level}</td>
                          <td style={tdNum}>{b.max}</td>
                          <td style={{ ...td, color: C.muted }}>{b.action.replace(/_/g, " ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ fontFamily: FB, fontSize: 12.5, color: C.dim, lineHeight: 1.8, marginTop: 14, marginBottom: 0 }}>
                  A band is a threshold, not a prediction. Nothing here forecasts a violation, and no accuracy or
                  confidence percentage is attached to a fatigue score — none has been measured.
                </p>
              </div>
            </Panel>

            <Panel
              title="What the platform will accept"
              note="Device type list from GET /api/eld/device-types. Accepting a type means the API will store telemetry from it. It does not mean TruckWithEase manufactures, stocks, sells or ships one."
              icon={<Cpu size={16} color={GOLD} />}
            >
              {types?.values?.length ? (
                <div style={grid(220)}>
                  {types.values.map((t) => (
                    <div key={t} style={{ border: `1px solid ${C.border}`, background: C.black, borderRadius: 4, padding: "14px 16px" }}>
                      <div style={{ fontFamily: FH, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: C.white }}>
                        {TYPE_LABEL[t] ?? t}
                      </div>
                      <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 6 }}>{t}</div>
                      <div style={{ fontFamily: FB, fontSize: 12.5, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
                        {dev?.byType?.[t] ? `${dev.byType[t]} registered` : "none registered"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Missing label="DEVICE TYPE LIST UNAVAILABLE" reason="GET /api/eld/device-types did not return successfully on this load." />
              )}
              <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 18, marginBottom: 0 }}>
                No hardware is offered for sale, lease or bundle anywhere in TruckWithEase. There is no price, no part
                number and no shipping date, because there is no device.
              </p>
            </Panel>

            <Panel
              title="Where duty status comes from instead"
              note="GET /api/hos — the same rows the compliance surfaces read. Shown here only to make the source explicit: these are logged entries, not an engine feed."
              icon={<Gauge size={16} color={GOLD} />}
            >
              {hos ? (
                <>
                  <div style={grid(200)}>
                    <Stat
                      label="Drivers with duty rows"
                      value={num(hos.drivers?.length ?? hos.count ?? null)}
                      sub="from hos_logs"
                    />
                    <Stat label="Source" value="LOGGED" sub="driver entries, not ECM reads" tone="dim" />
                  </div>
                  <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 16, marginBottom: 0 }}>
                    Every duty figure in TruckWithEase traces back to a row a person or an app wrote. Nothing is read off
                    an engine control module, because TruckWithEase is not wired to one.
                  </p>
                </>
              ) : (
                <Missing
                  label="HOS READ UNAVAILABLE"
                  reason="GET /api/hos did not return successfully on this load. No duty figure is shown rather than a stale or invented one."
                />
              )}
            </Panel>

            <Disclaimer
              items={[
                "It does not record hours of service as the log of record. Your registered ELD does that, and it stays the device an officer inspects.",
                "It is not registered with FMCSA and does not appear on eld.fmcsa.dot.gov/List. No self-certification has been filed.",
                "It does not connect to the engine control module and reads no VIN, engine hour or odometer value off the truck.",
                "It generates no eRODS file and performs no roadside data transfer.",
                "It sells, leases and ships no hardware. The device types listed are types the API will accept telemetry from, nothing more.",
                "It predicts no violation, on any horizon, and attaches no accuracy or confidence percentage to a fatigue score.",
                "It names no competitor and publishes no comparison against one.",
                "It withholds a fatigue score entirely below the sample floor rather than estimating one.",
              ]}
            />

            <Reads reads={reads} onReload={load} />
          </>
        )}
      </div>
    </div>
  );
}
