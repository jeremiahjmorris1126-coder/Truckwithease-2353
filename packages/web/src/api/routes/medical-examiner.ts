/**
 * /api/medical-examiner — a DEEP-LINK BUILDER into the official FMCSA National
 * Registry of Certified Medical Examiners. It constructs the canonical search URL
 * from a location the caller supplies. It stores nothing and scrapes nothing.
 *
 * WHY THIS ROUTER EXISTS
 *   The capability was declared with endpoints:[] and tables:[], so the function
 *   index reported it "not_built". The National Registry cannot legally be scraped
 *   or mirrored, so there is deliberately no local examiner list. This endpoint is
 *   the honest middle: it builds the exact official URL to send a driver to, and it
 *   labels itself as a link, not a directory.
 *
 * WHAT THIS IS NOT
 *   - It is NOT an examiner directory. No name, address or availability is stored
 *     or returned. The only real data lives on the FMCSA site this links to.
 *   - It does NOT confirm a given examiner is currently certified. Only the live
 *     registry does that, which is exactly why this hands the driver off to it.
 */
import { Hono } from "hono";

/** The official, public search page for the National Registry. */
export const NATIONAL_REGISTRY_BASE = "https://nationalregistry.fmcsa.dot.gov/search-medical-examiners";

const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
]);

/**
 * buildRegistryUrl — assembles the official search URL from an optional location.
 * Only well-formed inputs become query params; anything unrecognised is dropped
 * rather than guessed, and the caller is told what was ignored.
 */
export function buildRegistryUrl(input: { zip?: string; state?: string; miles?: number }) {
  const params = new URLSearchParams();
  const ignored: string[] = [];

  if (input.zip !== undefined) {
    const zip = String(input.zip).trim();
    if (/^\d{5}$/.test(zip)) params.set("zip", zip);
    else ignored.push(`zip "${input.zip}" (must be 5 digits)`);
  }

  if (input.state !== undefined) {
    const st = String(input.state).trim().toUpperCase();
    if (US_STATES.has(st)) params.set("state", st);
    else ignored.push(`state "${input.state}" (must be a 2-letter US state)`);
  }

  if (input.miles !== undefined) {
    const m = Number(input.miles);
    if (Number.isFinite(m) && m > 0 && m <= 500) params.set("radius", String(Math.round(m)));
    else ignored.push(`miles "${input.miles}" (must be 1-500)`);
  }

  const qs = params.toString();
  return { url: qs ? `${NATIONAL_REGISTRY_BASE}?${qs}` : NATIONAL_REGISTRY_BASE, ignored };
}

export const medicalExaminer = new Hono()

  /** GET /api/medical-examiner — the base registry link and how to build a located one. */
  .get("/", (c) => {
    return c.json({
      what: "Deep-link builder into the official FMCSA National Registry of Certified Medical Examiners.",
      officialRegistry: NATIONAL_REGISTRY_BASE,
      build: "GET /api/medical-examiner/search?zip=68101 or ?state=NE&miles=50",
      why: "The National Registry cannot be scraped or mirrored, so no examiner list is stored here. This sends a driver to the live, authoritative source.",
      claims: {
        storesExaminers: false,
        confirmsCertification: false,
        confirmsCertificationNote: "Only the live FMCSA registry can confirm an examiner is currently certified.",
      },
    });
  })

  /** GET /api/medical-examiner/search — build a located deep link. */
  .get("/search", (c) => {
    const zip = c.req.query("zip");
    const state = c.req.query("state");
    const miles = c.req.query("miles");
    const { url, ignored } = buildRegistryUrl({ zip, state, miles: miles ? Number(miles) : undefined });
    return c.json({
      url,
      officialRegistry: NATIONAL_REGISTRY_BASE,
      located: url !== NATIONAL_REGISTRY_BASE,
      ignored,
      note:
        ignored.length > 0
          ? "Some inputs were dropped because they were not well-formed; the link still works but is broader than requested."
          : "This is a link into the official registry. Nothing about examiners is stored or returned here.",
    });
  });

export default medicalExaminer;
