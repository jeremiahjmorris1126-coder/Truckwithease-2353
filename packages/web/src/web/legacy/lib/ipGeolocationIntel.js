// IP Geolocation Intelligence — thin client over /api/intel
//
// The original (docs/launch/ipGeolocationIntel.ORIGINAL.js.txt) was a hardcoded
// `mockGeoData` object containing three entries: 8.8.8.8, 1.1.1.1 and "default".
// Every other IP on earth silently resolved to the "default" record, so the
// page reported a confident location, ISP, timezone and currency for addresses
// it had never looked at. Callers had no way to tell.
//
// This version calls the server proxy, which holds the APIFreaks key
// server-side. When no key is connected it returns `live: false` and says so
// instead of handing back a fake city.

const API = "/api/intel";

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

const NO_PROVIDER =
  "No IP intelligence provider is connected. Add an APIFreaks key in the API Key Vault to resolve real addresses.";

function normalize(ip, payload) {
  const d = payload?.data ?? {};
  const live = Boolean(payload?.live);
  return {
    ip,
    type: ip.includes(":") ? "ipv6" : "ipv4",
    hostname: d.hostname ?? null,
    country: d.country?.code ?? d.country_code ?? null,
    country_code: d.country?.code ?? d.country_code ?? null,
    country_name: d.country?.name ?? d.country_name ?? null,
    region: d.region?.code ?? d.region ?? null,
    region_name: d.region?.name ?? d.region_name ?? null,
    city: d.city?.name ?? d.city ?? null,
    latitude: d.location?.latitude ?? d.latitude ?? null,
    longitude: d.location?.longitude ?? d.longitude ?? null,
    timezone: d.timezone?.id ?? d.timezone ?? null,
    timezone_offset: d.timezone?.offset ?? null,
    isp: d.connection?.isp ?? d.isp ?? null,
    asn: d.connection?.asn ?? d.asn ?? null,
    organization: d.connection?.organization ?? null,
    currency: d.currency?.code ?? null,
    is_vpn: d.security?.is_vpn ?? null,
    is_proxy: d.security?.is_proxy ?? null,
    is_tor: d.security?.is_tor ?? null,
    is_hosting: d.security?.is_hosting ?? null,
    live,
    source: payload?.source ?? "unknown",
    note: live ? null : NO_PROVIDER,
  };
}

/** Resolve an IPv4/IPv6 address. Returns nulls with a note when not live. */
export async function resolveIPLocation(ipAddress) {
  if (!ipAddress) return { ip: null, live: false, note: "No IP supplied." };
  try {
    const payload = await get(`/ip/${encodeURIComponent(ipAddress)}`);
    return normalize(ipAddress, payload);
  } catch (e) {
    return { ip: ipAddress, live: false, error: e.message, note: NO_PROVIDER };
  }
}

/**
 * Threat flags for an IP. Previously derived from the mock record, so it always
 * came back clean. Now it reports the provider's security block, or `unknown`.
 */
export async function checkIPThreats(ipAddress) {
  const geo = await resolveIPLocation(ipAddress);
  if (!geo.live) {
    return {
      ip: ipAddress,
      threatLevel: "unknown",
      isVPN: null,
      isProxy: null,
      isTor: null,
      isHosting: null,
      flags: [],
      live: false,
      note: NO_PROVIDER + " Do not read this as clean.",
    };
  }
  const flags = [];
  if (geo.is_tor) flags.push("tor");
  if (geo.is_vpn) flags.push("vpn");
  if (geo.is_proxy) flags.push("proxy");
  if (geo.is_hosting) flags.push("datacenter");
  return {
    ip: ipAddress,
    threatLevel: geo.is_tor ? "high" : flags.length ? "elevated" : "low",
    isVPN: geo.is_vpn,
    isProxy: geo.is_proxy,
    isTor: geo.is_tor,
    isHosting: geo.is_hosting,
    flags,
    live: true,
    note: null,
  };
}

/** Country → default content language. Static mapping, correct offline. */
const COUNTRY_LANGUAGE = {
  US: "en", CA: "en", GB: "en", AU: "en", IE: "en", NZ: "en",
  MX: "es", ES: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  BR: "pt", PT: "pt", FR: "fr", DE: "de", AT: "de", CH: "de",
  IT: "it", NL: "nl", PL: "pl", SE: "sv", NO: "no", DK: "da",
  JP: "ja", CN: "zh", TW: "zh", KR: "ko", IN: "en", TH: "th",
  VN: "vi", ID: "id", PH: "en", SA: "ar", AE: "ar", EG: "ar",
};

const COUNTRY_CURRENCY = {
  US: "USD", CA: "CAD", MX: "MXN", GB: "GBP", AU: "AUD", NZ: "NZD",
  BR: "BRL", JP: "JPY", CN: "CNY", IN: "INR", CH: "CHF", SE: "SEK",
  NO: "NOK", DK: "DKK", PL: "PLN", KR: "KRW", AE: "AED", SA: "SAR",
};

const EU = new Set(["ES","PT","FR","DE","AT","IT","NL","BE","IE","FI","GR","PL","SE","DK","CZ","HU","RO","SK","SI","HR","BG","EE","LV","LT","LU","MT","CY"]);

/**
 * Geo-targeted content hints. Serviceability is now explicit: this platform
 * operates on North American freight authority, so anything outside US/CA/MX
 * is reported as out-of-area rather than being handed local pricing.
 */
export async function geoTargetContent(ipAddress) {
  const geo = await resolveIPLocation(ipAddress);
  const cc = geo.country_code;
  if (!geo.live || !cc) {
    return {
      ip: ipAddress,
      country: null,
      language: "en",
      currency: "USD",
      serviceable: null,
      gdprApplies: null,
      live: false,
      note: NO_PROVIDER + " Falling back to en / USD.",
    };
  }
  return {
    ip: ipAddress,
    country: cc,
    countryName: geo.country_name,
    region: geo.region_name,
    city: geo.city,
    timezone: geo.timezone,
    language: COUNTRY_LANGUAGE[cc] ?? "en",
    currency: geo.currency ?? COUNTRY_CURRENCY[cc] ?? "USD",
    serviceable: cc === "US" || cc === "CA" || cc === "MX",
    serviceNote:
      cc === "US" || cc === "CA" || cc === "MX"
        ? null
        : `${geo.country_name ?? cc} is outside North American freight authority. This platform does not serve it.`,
    gdprApplies: EU.has(cc),
    live: true,
  };
}

/**
 * Kept for call-site compatibility. Payment risk is scored server-side now —
 * this delegates so there is exactly one scoring implementation.
 */
export async function validateCheckoutRisk(ipAddress, orderValue) {
  const res = await fetch(`${API}/checkout/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ipAddress: ipAddress ?? null, amount: orderValue ?? null }),
  });
  if (!res.ok) {
    return {
      ipAddress,
      riskScore: null,
      riskLevel: "unknown",
      recommendation: "verify",
      note: "Screening unavailable. Verify manually.",
    };
  }
  return res.json();
}

/** WHOIS on a domain, via the server proxy. */
export async function resolveDomainWhois(domain) {
  try {
    return await get(`/whois/${encodeURIComponent(domain)}`);
  } catch (e) {
    return { live: false, error: e.message, note: NO_PROVIDER };
  }
}

/** Whether live intel is available at all — use this to gate the UI. */
export async function intelStatus() {
  try {
    return await get("/status");
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
