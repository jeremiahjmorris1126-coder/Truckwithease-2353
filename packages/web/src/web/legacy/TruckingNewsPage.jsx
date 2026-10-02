/**
 * TruckingNewsPage — rebuilt Aug 26, 2026.
 *
 * Removed fabricated content (original preserved at docs/launch/TruckingNewsPage.ORIGINAL.jsx.txt):
 *  1. NEWS — ten fully invented articles with invented headlines, timestamps and
 *     specifics, attributed to real named outlets (FMCSA.dot.gov, DAT Freight, Land Line,
 *     Overdrive, FreightWaves, Fleet Owner, OOIDA, Pilot Flying J). They invented
 *     regulatory facts — a 2026 split-sleeper amendment "effective September 1", an ELD
 *     exemption tier "ending October 1", a telemedicine DOT-physical rule, a 68 mph
 *     speed-limiter comment deadline, "$3.07/gal" diesel, "spot rates up 12%",
 *     "Amazon Freight Net-7 terms", a "12¢/gal" Pilot programme. Deleted entirely.
 *  2. WEATHER_ALERTS — three invented state alerts (a tornado watch "until 8PM CT",
 *     "road surface temps exceeding 140°F", a chain law "lifted"). Real weather lives on
 *     /weather, which is backed by the National Weather Service. This page links there
 *     instead of re-inventing alerts.
 *  3. The "🔴 LIVE" / "BREAKING" badge system, driven by a hardcoded `hot:true` flag on
 *     the invented articles. A scripted list is never labelled live.
 *  4. The browser-side feed attempt through api.rss2json.com — a third-party proxy called
 *     from the client with no key, a 5s timeout, Promise.any, and a silent fallback to the
 *     invented NEWS array while the nav still showed a green "LIVE" pill. Category colors
 *     were assigned by `i % 3`, so the color meant nothing.
 *  5. The hardcoded "DOT TIP OF THE DAY".
 *
 * There is no news provider on this platform: /api/news is not built and not mounted, and
 * no article feed is licensed. The page now probes that endpoint and reports the raw HTTP
 * status it gets back, renders MISSING / NOT TRACKED for the article feed, and gives real
 * outbound links to the outlets' own front pages, clearly marked as external.
 *
 * Restyled from navy/orange/amber/green/red/purple on #F0F4FA to gold-on-black.
 */

import { useState, useEffect } from "react";
import {
  Newspaper,
  ExternalLink,
  AlertTriangle,
  CloudSun,
  ShieldAlert,
  FileText,
  Fuel,
  ParkingSquare,
  Zap,
  RefreshCw,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const WARN = "#c96a4c";

/**
 * Outbound links only. Every one is an outlet's own front page or the agency's own site —
 * no headline, date, or claim is reproduced here, because nothing on this platform reads
 * these sites.
 */
const SOURCES = [
  {
    name: "FMCSA Newsroom",
    org: "U.S. Federal Motor Carrier Safety Administration",
    url: "https://www.fmcsa.dot.gov/newsroom",
    kind: "Regulator — primary source",
  },
  {
    name: "FMCSA Regulations",
    org: "U.S. Federal Motor Carrier Safety Administration",
    url: "https://www.fmcsa.dot.gov/regulations",
    kind: "Regulator — rule text",
  },
  {
    name: "Federal Register — DOT",
    org: "U.S. Government Publishing Office",
    url: "https://www.federalregister.gov/agencies/federal-motor-carrier-safety-administration",
    kind: "Regulator — proposed & final rules",
  },
  {
    name: "OOIDA / Land Line",
    org: "Owner-Operator Independent Drivers Association",
    url: "https://landline.media/",
    kind: "Trade press",
  },
  {
    name: "Overdrive",
    org: "Randall Reilly",
    url: "https://www.overdriveonline.com/",
    kind: "Trade press",
  },
  {
    name: "Commercial Carrier Journal",
    org: "Randall Reilly",
    url: "https://www.ccjdigital.com/",
    kind: "Trade press",
  },
  {
    name: "FreightWaves",
    org: "FreightWaves Inc.",
    url: "https://www.freightwaves.com/",
    kind: "Market press",
  },
  {
    name: "EIA Diesel Price Report",
    org: "U.S. Energy Information Administration",
    url: "https://www.eia.gov/petroleum/gasdiesel/",
    kind: "Government data — weekly",
  },
  {
    name: "CVSA Announcements",
    org: "Commercial Vehicle Safety Alliance",
    url: "https://www.cvsa.org/news/",
    kind: "Inspection & enforcement",
  },
];

/** Internal pages that carry real, verifiable data. Every path checked against App.jsx. */
const INTERNAL = [
  { label: "Weather", href: "/weather", icon: CloudSun, note: "National Weather Service, keyless, US only" },
  { label: "State Patrol Intel", href: "/state-patrol", icon: ShieldAlert, note: "State enforcement reference" },
  { label: "Permit Book", href: "/permit-book", icon: FileText, note: "Your permit records" },
  { label: "Fuel Finder", href: "/fuel-finder", icon: Fuel, note: "EIA diesel price data" },
  { label: "Parking", href: "/parking", icon: ParkingSquare, note: "Parking lookup" },
  { label: "Weigh Bypass", href: "/bypass", icon: Zap, note: "Bypass reference" },
];

function Panel({ title, note, children, right }) {
  return (
    <section className="border border-[#222] bg-[#161616]">
      <header className="flex items-start justify-between gap-4 border-b border-[#222] px-5 py-4">
        <div>
          <h2 className="font-[Oswald] text-sm uppercase tracking-[0.22em] text-white">{title}</h2>
          {note && <p className="mt-1 font-[Inter] text-[11px] leading-snug text-[#666]">{note}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div className="border border-dashed border-[#333] bg-[#0f0f0f] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={13} style={{ color: WARN }} />
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em]" style={{ color: WARN }}>
          Missing / Not tracked
        </span>
      </div>
      <p className="mt-2 font-[Oswald] text-xs uppercase tracking-[0.16em] text-white">{label}</p>
      <p className="mt-1 font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">{reason}</p>
    </div>
  );
}

export default function TruckingNewsPage() {
  // Probe the endpoint a news feed would live on and report exactly what comes back.
  // Nothing is mounted at /api/news, so this is expected to be a 404 — the point is that
  // the page shows the real status instead of pretending a feed exists.
  const [probe, setProbe] = useState({ state: "loading" });

  const runProbe = () => {
    setProbe({ state: "loading" });
    const started = Date.now();
    fetch("/api/news/status", { headers: { accept: "application/json" } })
      .then(async (r) => {
        const body = await r.text();
        setProbe({
          state: "done",
          httpStatus: r.status,
          contentType: r.headers.get("content-type") || "—",
          latencyMs: Date.now() - started,
          bodyHead: body.slice(0, 120),
        });
      })
      .catch((e) => setProbe({ state: "error", error: String(e?.message || e) }));
  };

  useEffect(() => {
    runProbe();
  }, []);

  const configured = probe.state === "done" && probe.httpStatus === 200;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-[Inter] text-white">
      {/* Header band */}
      <header className="border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-2 border border-[#222] bg-[#0f0f0f] px-2.5 py-1 w-fit">
            <Newspaper size={12} style={{ color: GOLD }} />
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Industry sources
            </span>
          </div>
          <h1 className="mt-4 font-[Bebas_Neue] text-5xl leading-none tracking-wide">
            TRUCKING <span style={{ color: GOLD_BRIGHT }}>NEWS</span>
          </h1>
          <p className="mt-3 max-w-2xl font-[Inter] text-sm leading-relaxed text-[#8a8a8a]">
            TruckWithEase does not publish news and does not license an article feed. This page is a
            directory of the primary sources — the regulator, the Federal Register, the trade press
            and the government price data — plus the pages inside TruckWithEase that carry real data.
            Every link below leaves the app.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="border px-2 py-1 font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em]"
              style={{ borderColor: WARN, color: WARN }}
            >
              No feed connected
            </span>
            <span className="font-[Inter] text-[11px] text-[#666]">
              Nothing on this page is a live headline.
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-6 py-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Panel
            title="Article feed"
            note="Source: GET /api/news/status — probed live from this page"
            right={
              <button
                onClick={runProbe}
                className="flex items-center gap-1.5 border border-[#222] bg-[#0f0f0f] px-3 py-1.5 font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a] transition hover:border-[#C9A84C] hover:text-white"
              >
                <RefreshCw size={11} /> Re-probe
              </button>
            }
          >
            {probe.state === "loading" && (
              <p className="font-[JetBrains_Mono] text-xs text-[#666]">Probing /api/news/status…</p>
            )}

            {probe.state === "error" && (
              <p className="font-[JetBrains_Mono] text-xs" style={{ color: WARN }}>
                Probe failed: {probe.error}
              </p>
            )}

            {probe.state === "done" && (
              <>
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["HTTP status", String(probe.httpStatus)],
                    ["Latency", `${probe.latencyMs} ms`],
                    ["Content-type", probe.contentType.split(";")[0]],
                  ].map(([k, v]) => (
                    <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2">
                      <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">
                        {k}
                      </div>
                      <div className="mt-1 font-[JetBrains_Mono] text-sm text-white">{v}</div>
                    </div>
                  ))}
                </div>

                {configured ? (
                  <p className="font-[Inter] text-xs leading-relaxed text-[#8a8a8a]">
                    A news route answered 200. It is not wired into this page yet — the UI is
                    deliberately not rendering articles until the provider and its licence are
                    confirmed.
                  </p>
                ) : (
                  <Missing
                    label="Headlines, summaries, timestamps, per-article sources"
                    reason={
                      "No news provider is connected and no article feed is licensed. /api/news is not built and not mounted, so the endpoint above returns " +
                      probe.httpStatus +
                      ". The previous version of this page shipped ten invented articles attributed to FMCSA, DAT, Land Line, Overdrive and FreightWaves, and fell back to them silently behind a green LIVE badge. Those were deleted rather than restyled. Use the source links to the right — they go to the publishers directly."
                    }
                  />
                )}
              </>
            )}
          </Panel>

          <Panel
            title="Primary sources"
            note="Outbound links to the publishers' own sites. TruckWithEase does not read, cache, or summarise these — clicking leaves the app."
          >
            <ul className="divide-y divide-[#222]">
              {SOURCES.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start justify-between gap-4 py-3 transition hover:bg-[#0f0f0f]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-[Oswald] text-sm uppercase tracking-[0.12em] text-white group-hover:text-[#FFD700]">
                          {s.name}
                        </span>
                        <ExternalLink size={11} className="text-[#666]" />
                      </div>
                      <div className="mt-0.5 font-[Inter] text-[11px] text-[#8a8a8a]">{s.org}</div>
                    </div>
                    <span className="shrink-0 border border-[#222] px-2 py-0.5 font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.16em] text-[#666]">
                      {s.kind}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            title="Real data inside the app"
            note="Pages that read a live source rather than a canned list."
          >
            <div className="space-y-2">
              {INTERNAL.map((it) => {
                const Icon = it.icon;
                return (
                  <a
                    key={it.href}
                    href={it.href}
                    className="flex items-start gap-3 border border-[#222] bg-[#0f0f0f] px-3 py-2.5 transition hover:border-[#C9A84C]"
                  >
                    <Icon size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <div>
                      <div className="font-[Oswald] text-xs uppercase tracking-[0.14em] text-white">
                        {it.label}
                      </div>
                      <div className="mt-0.5 font-[Inter] text-[11px] leading-snug text-[#8a8a8a]">
                        {it.note}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </Panel>

          <Panel title="Weather &amp; road alerts" note="Not duplicated here on purpose.">
            <Missing
              label="State weather and road-condition alerts on this page"
              reason="This page used to carry three invented state alerts. Real weather is on /weather, which pulls from the National Weather Service. Duplicating it here would mean maintaining a second, unsourced copy."
            />
            <a
              href="/weather"
              className="mt-3 flex items-center justify-center gap-2 border px-4 py-2 font-[Oswald] text-xs uppercase tracking-[0.18em] transition hover:bg-[#161616]"
              style={{ borderColor: GOLD, color: GOLD_BRIGHT }}
            >
              <CloudSun size={13} /> Open weather
            </a>
          </Panel>

          <Panel title="What would make this a real feed" note="Open, not built.">
            <ol className="space-y-2 font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">1 ·</span> A licensed
                provider or an outlet's own RSS with permission to redistribute.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">2 ·</span> A
                server-side route at /api/news that holds the key and does the fetching — the browser
                must never call a third-party proxy directly.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">3 ·</span> Per-article
                source attribution and the publisher's real timestamp, passed through untouched.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">4 ·</span> An empty
                state on failure. Never a fallback to stored articles behind a LIVE badge.
              </li>
            </ol>
          </Panel>
        </div>
      </main>

      <footer className="border-t border-[#222] px-6 py-6">
        <div className="mx-auto max-w-6xl font-[Inter] text-[11px] leading-relaxed text-[#666]">
          TruckWithEase is not a news publisher and does not verify third-party reporting. Regulatory
          decisions should be made against the rule text on fmcsa.dot.gov or the Federal Register, not
          against a summary.{" "}
          <a href="/" className="underline hover:text-white">
            Back to dashboard
          </a>
        </div>
      </footer>
    </div>
  );
}
