/**
 * StatePatrolPage — rebuilt Aug 26, 2026.
 *
 * Removed fabricated content (original preserved at docs/launch/StatePatrolPage.ORIGINAL.jsx.txt):
 *  1. STATE_DATA — invented per-state law for five states: speed limits, weight limits, HOS
 *     statements ("Texas permits certain agricultural exemptions within 150 air miles",
 *     "California mandates 30-min rest break after 8 hrs"), named weigh-station locations,
 *     and specific restrictions ("No trucks over 26,000 lbs on I-270 inner loop after 7am",
 *     "Oklahoma allows 90,000 lbs GVW on designated turnpike routes"). None of it was read
 *     from a state DOT source and some of it is wrong. Deleted — a driver planning a load
 *     against an invented weight limit is the most dangerous thing this app could do.
 *  2. INCIDENTS — seven invented reports with invented reporters ("Trucker Mike", "Ray Davis",
 *     "James Miller", "Weather Wayne", "MODOT Alert"), invented mile markers, ages
 *     ("18 min ago"), verification counts, and specifics: "MHP laser enforcement — 3 stops
 *     confirmed", "multiple trucks cited for 73 in 65", a bridge closure with a detour,
 *     "PrePass bypass active". No driver-report table and no state DOT feed exist. Deleted.
 *  3. The AI chat — a setTimeout that waited 1,400 ms with a typing indicator and then
 *     returned a canned string built out of the invented STATE_DATA, presented as
 *     "Checking live state patrol data". It called nothing. Deleted rather than rewired: an
 *     LLM must not be the source of a state weight limit or speed limit.
 *  4. The opening chat message claiming "2 verified speed enforcement reports near mile 190
 *     EB in the last hour" and "Joplin is open, 12-minute wait".
 *  5. The incident report form, which had no endpoint behind it — submitting did nothing.
 *  6. The Google Maps import (GOOGLE_MAPS_KEY). The Maps Embed API returns HTTP 403 for the
 *     current key, verified Aug 26, 2026.
 *
 * What is left is real: the federal limits (FHWA, cited), outbound links to each state's own
 * DOT and permit office, and honest MISSING blocks for everything this platform does not have.
 *
 * Restyled from navy #0B1120/#111c2e/#1e3a6e with orange and slate text to gold-on-black.
 */

import { useState } from "react";
import {
  ShieldAlert,
  ExternalLink,
  AlertTriangle,
  Scale,
  CloudSun,
  Radio,
  FileText,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const WARN = "#c96a4c";

/**
 * Federal limits only. Source: FHWA Bridge Formula / Federal-Aid Highway weight limits,
 * 23 U.S.C. 127. These are the federal maximums on the Interstate System — states set their
 * own limits on non-Interstate roads and issue their own permits, which is why no per-state
 * number appears anywhere on this page.
 */
const FEDERAL = [
  ["Gross vehicle weight", "80,000 lb"],
  ["Single axle", "20,000 lb"],
  ["Tandem axle", "34,000 lb"],
];

/** Official state sources. Every URL is a state agency's own site — no numbers reproduced. */
const STATE_LINKS = [
  { code: "MO", name: "Missouri", agency: "MoDOT Motor Carrier Services", url: "https://www.modot.org/motor-carrier-services" },
  { code: "TX", name: "Texas", agency: "TxDMV Motor Carriers", url: "https://www.txdmv.gov/motor-carriers" },
  { code: "CA", name: "California", agency: "Caltrans Truck Services", url: "https://dot.ca.gov/programs/traffic-operations/truck-services" },
  { code: "IL", name: "Illinois", agency: "IDOT Commercial Vehicle Permits", url: "https://idot.illinois.gov/transportation-system/local-transportation-partners/county-engineers-and-local-public-agencies/permits/index" },
  { code: "OK", name: "Oklahoma", agency: "ODOT Size & Weight Permits", url: "https://oklahoma.gov/odot/business-center/size-and-weight-permits.html" },
  { code: "TN", name: "Tennessee", agency: "TDOT Oversize / Overweight", url: "https://www.tn.gov/tdot/oversize-overweight-permits.html" },
  { code: "AR", name: "Arkansas", agency: "ARDOT Permits", url: "https://www.ardot.gov/divisions/permits/" },
  { code: "KS", name: "Kansas", agency: "KDOT Oversize Permits", url: "https://www.ksdot.gov/burconsmain/burconsproj/oversize.asp" },
  { code: "CO", name: "Colorado", agency: "CDOT Permits & Chain Law", url: "https://www.codot.gov/business/permits" },
  { code: "AZ", name: "Arizona", agency: "ADOT Commercial Permits", url: "https://azdot.gov/motor-vehicles/professional-services/commercial-permits" },
];

const NATIONAL_LINKS = [
  { name: "FMCSA Regulations", org: "Federal Motor Carrier Safety Administration", url: "https://www.fmcsa.dot.gov/regulations" },
  { name: "FHWA Truck Size & Weight", org: "Federal Highway Administration", url: "https://ops.fhwa.dot.gov/freight/sw/index.htm" },
  { name: "CVSA Inspection Programs", org: "Commercial Vehicle Safety Alliance", url: "https://www.cvsa.org/programs/" },
  { name: "511 Traveler Information", org: "State 511 directory (FHWA)", url: "https://ops.fhwa.dot.gov/511/" },
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
        <span
          className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em]"
          style={{ color: WARN }}
        >
          Missing / Not tracked
        </span>
      </div>
      <p className="mt-2 font-[Oswald] text-xs uppercase tracking-[0.16em] text-white">{label}</p>
      <p className="mt-1 font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">{reason}</p>
    </div>
  );
}

export default function StatePatrolPage() {
  const [filter, setFilter] = useState("");

  const states = STATE_LINKS.filter((s) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-[Inter] text-white">
      <header className="border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex w-fit items-center gap-2 border border-[#222] bg-[#0f0f0f] px-2.5 py-1">
            <ShieldAlert size={12} style={{ color: GOLD }} />
            <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              Enforcement &amp; permits
            </span>
          </div>
          <h1 className="mt-4 font-[Bebas_Neue] text-5xl leading-none tracking-wide">
            STATE <span style={{ color: GOLD_BRIGHT }}>PATROL</span>
          </h1>
          <p className="mt-3 max-w-2xl font-[Inter] text-sm leading-relaxed text-[#8a8a8a]">
            TruckWithEase does not have a law-enforcement, weigh-station, or state DOT data
            connection. This page carries the federal limits — which are published and citable —
            and sends you to each state's own permit office for anything state-specific. It does
            not tell you where the troopers are.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="border px-2 py-1 font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em]"
              style={{ borderColor: WARN, color: WARN }}
            >
              No enforcement feed
            </span>
            <span className="font-[Inter] text-[11px] text-[#666]">
              Nothing here is a live report.
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-6 py-8 lg:grid-cols-[1fr_1fr]">
        <Panel
          title="Federal limits"
          note="Source: FHWA / 23 U.S.C. 127 — federal maximums on the Interstate System"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {FEDERAL.map(([k, v]) => (
              <div key={k} className="border border-[#222] bg-[#0f0f0f] px-3 py-2.5">
                <div className="font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.18em] text-[#666]">
                  {k}
                </div>
                <div className="mt-1 font-[JetBrains_Mono] text-lg" style={{ color: GOLD_BRIGHT }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 border border-[#222] bg-[#0f0f0f] p-4">
            <Scale size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
            <p className="font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">
              Axle-group weights are also governed by the Bridge Formula, which depends on the
              spacing between your axles — the numbers above are ceilings, not a pass. Non-Interstate
              routes, bridges, seasonal frost laws and local ordinances can all be lower. Run your
              specific configuration through the weight guidance in Load Chief, and permit anything
              above these limits with the state.
            </p>
          </div>
        </Panel>

        <Panel title="Enforcement intel" note="Named honestly. Nothing is generated to fill the gap.">
          <div className="space-y-3">
            <Missing
              label="Speed traps, patrol locations, enforcement activity"
              reason="No law-enforcement data source exists and driver reports are not being collected on this platform yet — the Community Bulletin Board has no API route and no table. The old version of this page listed seven reports with named reporters, mile markers and 'verified' counts that were entirely invented."
            />
            <Missing
              label="Weigh-station status and wait times"
              reason="No weigh-station status feed and no PrePass or Drivewyze connection exists. The old page showed 'Joplin open, 12-minute average wait, PrePass bypass active'."
            />
            <Missing
              label="Per-state speed limits, weight limits and restrictions"
              reason="No state DOT data source is connected. The old page hardcoded speed and weight numbers plus restriction statements for five states, unsourced and partly wrong. Use the state links below — those go to the agency that actually sets the rule."
            />
            <Missing
              label="Road closures, work zones, incident alerts"
              reason="No state 511 or DOT event feed is connected. The 511 directory is linked under national sources."
            />
          </div>
        </Panel>

        <Panel
          title="State permit offices"
          note="Outbound links to each state's own agency. Clicking leaves the app. TruckWithEase does not read or cache these sites."
          right={
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="w-28 border border-[#222] bg-[#0f0f0f] px-2 py-1.5 font-[JetBrains_Mono] text-[11px] text-white outline-none placeholder:text-[#666] focus:border-[#C9A84C]"
            />
          }
        >
          {states.length === 0 ? (
            <p className="font-[JetBrains_Mono] text-xs text-[#666]">
              No match. Only 10 states are linked here; the rest are not — check that state's DOT
              site directly.
            </p>
          ) : (
            <ul className="divide-y divide-[#222]">
              {states.map((s) => (
                <li key={s.code}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-3 py-3 transition hover:bg-[#0f0f0f]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="border border-[#222] px-2 py-0.5 font-[JetBrains_Mono] text-[10px] tracking-[0.14em]"
                        style={{ color: GOLD }}
                      >
                        {s.code}
                      </span>
                      <div>
                        <div className="font-[Oswald] text-sm uppercase tracking-[0.12em] text-white group-hover:text-[#FFD700]">
                          {s.name}
                        </div>
                        <div className="font-[Inter] text-[11px] text-[#8a8a8a]">{s.agency}</div>
                      </div>
                    </div>
                    <ExternalLink size={12} className="shrink-0 text-[#666]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 font-[Inter] text-[11px] leading-relaxed text-[#666]">
            Only these 10 states are linked. The other 40 are not covered here — that is a gap, not
            a claim that they have no restrictions.
          </p>
        </Panel>

        <div className="space-y-5">
          <Panel title="National sources" note="Federal agencies and the 511 directory.">
            <ul className="divide-y divide-[#222]">
              {NATIONAL_LINKS.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-3 py-3 transition hover:bg-[#0f0f0f]"
                  >
                    <div>
                      <div className="font-[Oswald] text-sm uppercase tracking-[0.12em] text-white group-hover:text-[#FFD700]">
                        {l.name}
                      </div>
                      <div className="font-[Inter] text-[11px] text-[#8a8a8a]">{l.org}</div>
                    </div>
                    <ExternalLink size={12} className="shrink-0 text-[#666]" />
                  </a>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="What is real inside the app" note="Pages backed by a named source.">
            <div className="space-y-2">
              {[
                { href: "/weather", label: "Weather", icon: CloudSun, note: "National Weather Service, keyless" },
                { href: "/permit-book", label: "Permit Book", icon: FileText, note: "Your own permit records" },
                { href: "/walkie-talkie", label: "Fleet comms", icon: Radio, note: "Your fleet's real messages" },
              ].map((l) => {
                const Icon = l.icon;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className="flex items-start gap-3 border border-[#222] bg-[#0f0f0f] px-3 py-2.5 transition hover:border-[#C9A84C]"
                  >
                    <Icon size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <div>
                      <div className="font-[Oswald] text-xs uppercase tracking-[0.14em] text-white">
                        {l.label}
                      </div>
                      <div className="mt-0.5 font-[Inter] text-[11px] leading-snug text-[#8a8a8a]">
                        {l.note}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </Panel>

          <Panel title="To make this page real" note="Open, not built.">
            <ol className="space-y-2 font-[Inter] text-[11px] leading-relaxed text-[#8a8a8a]">
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">1 ·</span> Driver
                reports need a table, a submit route, expiry by category, and moderation — reports
                with no verification and no age are worse than nothing.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">2 ·</span> Road
                closures and work zones need per-state 511 feeds; formats differ by state and several
                require a key.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">3 ·</span> Weigh-station
                bypass needs an actual PrePass or Drivewyze agreement. There is none today.
              </li>
              <li>
                <span className="font-[JetBrains_Mono] text-[10px] text-[#666]">4 ·</span> Per-state
                limits should be entered from the state's published tables with the citation stored
                alongside each value — never generated by a model.
              </li>
            </ol>
          </Panel>
        </div>
      </main>

      <footer className="border-t border-[#222] px-6 py-6">
        <div className="mx-auto max-w-6xl font-[Inter] text-[11px] leading-relaxed text-[#666]">
          Reference only, not legal advice. Verify limits, permits and restrictions with the state
          agency before you roll. TruckWithEase does not report your location to law enforcement and
          does not receive enforcement data.{" "}
          <a href="/" className="underline hover:text-white">
            Back to dashboard
          </a>
        </div>
      </footer>
    </div>
  );
}
