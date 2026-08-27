// IP WHOIS / ownership intelligence — thin client over /api/intel
//
// WHAT THIS FILE USED TO BE (preserved at docs/launch/ipWhoisIntel.ORIGINAL.js.txt):
// a hardcoded `whoisData` object holding two fabricated records — 8.8.8.8 (Google)
// and 1.1.1.1 (Cloudflare) — complete with invented admin/tech/abuse contacts and
// hand-typed `raw_whois` blobs. Every other IP in the world silently fell through
// to `whoisData["8.8.8.8"]`, so looking up a broker's IP returned Google LLC with
// abuse@google.com and a matching-looking ARIN record. `scanIPBlockForThreats()`
// filtered a hardcoded list of three fake "flagged" addresses in 8.8.8.0/24 and
// reported a threat percentage off it. There were no network calls in the file.
//
// WHAT IT IS NOW: a client over the server-side intel proxy, which holds the
// APIFreaks key (never in the browser bundle). Real IP ownership comes from the
// ASN/company record: RIR, AS number, AS name, allocating organization, allocation
// date, company name/type/domain. Anything the provider does not give us is
// returned as null with a `note` saying why — never as a plausible-looking guess.
//
// NOT AVAILABLE from our provider, and therefore always null here:
//   - registry admin / tech / abuse contact records (needs a real RIR WHOIS feed)
//   - raw WHOIS text
//   - CIDR block boundaries for an arbitrary IP
//   - per-IP abuse/threat reputation inside a block
// Export names and call signatures are unchanged so IPWhoisPage.jsx keeps working.

const API = "/api/intel";

export const registries = {
  ARIN: { name: "American Registry for Internet Numbers", region: "North America" },
  RIPE: { name: "Réseaux IP Européens Network Coordination Centre", region: "Europe/Middle East/Central Asia" },
  RIPE_NCC: { name: "Réseaux IP Européens Network Coordination Centre", region: "Europe/Middle East/Central Asia" },
  APNIC: { name: "Asia-Pacific Network Information Centre", region: "Asia Pacific" },
  LACNIC: { name: "Latin America and Caribbean Network Information Centre", region: "Latin America/Caribbean" },
  AFRINIC: { name: "African Network Information Centre", region: "Africa" },
};

const NO_CONTACTS =
  "Registry contact records (admin/tech/abuse) require a live RIR WHOIS feed. Our provider returns ASN and company ownership only, so these are reported as unavailable rather than guessed.";
const NO_BLOCK =
  "CIDR block boundaries for an arbitrary IP require a live RIR WHOIS feed. Not available from our provider.";
const NO_THREAT =
  "Per-IP abuse reputation inside a block requires a threat-intelligence feed. Not connected. The previous version of this screen filtered a hardcoded list of three fake addresses.";

async function get(path) {
  try {
    const res = await fetch(API + path);
    const body = await res.json().catch(() => null);
    if (!res.ok || !body) {
      return { live: false, note: `Intel API returned ${res.status}.`, data: null };
    }
    return { live: !!body.live, note: body.note || null, data: body.data ?? null };
  } catch (err) {
    return { live: false, note: `Intel API unreachable: ${err?.message || "network error"}`, data: null };
  }
}

/**
 * IP ownership lookup. Returns real ASN/company ownership when the provider
 * answers, and nulls with a note when it does not. Never substitutes a
 * different IP's record for the one that was asked about.
 */
export async function lookupIPWhois(ipAddress) {
  const r = await get(`/ip/${encodeURIComponent(ipAddress)}`);
  const asn = r.data?.network?.asn || null;
  const company = r.data?.network?.company || null;
  const registryCode = asn?.rir || null;

  return {
    ip: ipAddress,
    live: r.live,
    source: r.live ? "apifreaks" : "unavailable",
    note: r.live ? NO_CONTACTS : r.note || "No ownership data returned for this address.",
    registry: registryCode,
    registry_info: registryCode ? registries[registryCode] || null : null,
    owner: company?.name || asn?.organization || null,
    organization: asn?.organization || company?.name || null,
    company_type: company?.type || null,
    company_domain: company?.domain || asn?.domain || null,
    as_number: asn?.as_number || null,
    as_name: asn?.asn_name || null,
    as_type: asn?.type || null,
    ipv4_routes: asn?.num_of_ipv4_routes || null,
    country: r.data?.location?.country_code2 || asn?.country || null,
    created: asn?.date_allocated || null,
    updated: null,
    description: asn ? `${asn.asn_name || asn.organization || "AS"} (${asn.as_number || "?"})` : null,
    // Not available from this provider — reported as missing, never invented.
    cidr: null,
    cidr_size: null,
    ip_range: null,
    contacts: { admin: null, tech: null, abuse: null, note: NO_CONTACTS },
    whois_server: null,
    raw_whois: null,
  };
}

/**
 * Abuse contact. Our provider does not expose registry abuse contacts, so this
 * returns null for the email and points the user at the registry's own lookup
 * instead of handing back a fabricated address like abuse@google.com.
 */
export async function getAbuseContact(ipAddress) {
  const whois = await lookupIPWhois(ipAddress);
  const registryLookup = {
    ARIN: "https://search.arin.net/rdap/?query=",
    RIPE: "https://apps.db.ripe.net/db-web-ui/query?searchtext=",
    RIPE_NCC: "https://apps.db.ripe.net/db-web-ui/query?searchtext=",
    APNIC: "https://wq.apnic.net/static/search.html?query=",
    LACNIC: "https://query.milacnic.lacnic.net/search?id=",
    AFRINIC: "https://afrinic.net/whois?query=",
  };

  return {
    ip: ipAddress,
    live: whois.live,
    owner: whois.owner,
    organization: whois.organization,
    registry: whois.registry,
    abuse_email: null,
    abuse_phone: null,
    note: NO_CONTACTS,
    registry_lookup_url: whois.registry
      ? (registryLookup[whois.registry] || null) && registryLookup[whois.registry] + encodeURIComponent(ipAddress)
      : null,
    report_template: `Abuse Report for IP ${ipAddress}
Owner (per ASN record): ${whois.owner || "unknown"}
Organization: ${whois.organization || "unknown"}
AS: ${whois.as_number || "unknown"} ${whois.as_name || ""}
Registry: ${whois.registry || "unknown"}

Send to: look up the current abuse contact at the registry link above.
This platform does not have a registry contact feed and will not guess an address.

Incident Details:
[Describe the suspicious activity]

Date/Time: [When it occurred]
Evidence: [Screenshots, logs, etc]`,
  };
}

/**
 * Ownership verification against the ASN/company record. Returns
 * verified: null (not false) when we have no ownership data — an unknown is not
 * a failed match, and a broker should not be flagged over a missing lookup.
 */
export async function verifyIPOwnership(ipAddress, claimedOwner) {
  const whois = await lookupIPWhois(ipAddress);
  const claim = String(claimedOwner || "").trim().toLowerCase();
  const known = [whois.owner, whois.organization, whois.as_name, whois.company_domain]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

  let verified = null;
  let match = "no_data";
  if (claim && known.length) {
    if (known.some((v) => v === claim)) {
      verified = true;
      match = "exact";
    } else if (known.some((v) => v.includes(claim) || claim.includes(v))) {
      verified = true;
      match = "partial";
    } else {
      verified = false;
      match = "none";
    }
  }

  return {
    ip: ipAddress,
    live: whois.live,
    claimed_owner: claimedOwner,
    actual_owner: whois.owner,
    organization: whois.organization,
    as_number: whois.as_number,
    verified,
    match_type: match,
    registry: whois.registry,
    cidr: null,
    note:
      verified === null
        ? whois.note
        : "Matched against the ASN/company ownership record, not a registry WHOIS record. A partial match means the names overlap, not that identity is proven.",
  };
}

/** Block/allocation details. Our provider gives no CIDR boundaries — all null. */
export async function getIPBlockInfo(ipAddress) {
  const whois = await lookupIPWhois(ipAddress);
  return {
    ip: ipAddress,
    live: false,
    cidr: null,
    size: null,
    start_ip: null,
    end_ip: null,
    owner: whois.owner,
    organization: whois.organization,
    country: whois.country,
    registry: whois.registry,
    as_number: whois.as_number,
    ipv4_routes: whois.ipv4_routes,
    allocated: whois.created,
    last_updated: null,
    description: whois.description,
    note: NO_BLOCK,
  };
}

/** Threat scan across a block. No feed is connected, so nothing is reported. */
export async function scanIPBlockForThreats(ipAddress) {
  const block = await getIPBlockInfo(ipAddress);
  return {
    ip: ipAddress,
    live: false,
    available: false,
    cidr: null,
    total_ips: null,
    flagged_count: null,
    flagged_ips: [],
    threat_percentage: null,
    owner: block.owner,
    recommendation: null,
    note: NO_THREAT,
  };
}
