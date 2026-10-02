// SerpAPI Service — powers broker reputation lookup and road closure alerts
// Key is stored in sessionStorage under 'serpapi_key' after user enters it at /twilio-setup
// All calls go to SerpAPI's JSON endpoint — results are parsed client-side

const SERPAPI_BASE = "https://serpapi.com/search.json";

// Pre-configured key — activated and ready
const PRELOADED_KEY = "3033c5a14e767898561c3d1faee144b7e3204d6fd611c195d04f29d7b6c32e6c";

function getKey() {
  // Use session-stored key if present, otherwise fall back to pre-configured
  return sessionStorage.getItem("serpapi_key") || PRELOADED_KEY;
}

export function hasSerpKey() {
  return true; // pre-configured key always available
}

export function saveSerpKey(key) {
  sessionStorage.setItem("serpapi_key", key);
}

// Search Google for broker/shipper reputation
export async function lookupBrokerReputation(companyName) {
  const key = getKey();
  if (!key) return null;

  const query = `${companyName} trucking broker reviews complaints DOT FMCSA`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${key}&num=5`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const results = (data.organic_results || []).slice(0, 4).map(r => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
      source: r.displayed_link,
    }));

    // Scan snippets for red flags
    const redFlags = [];
    const allText = results.map(r => (r.title + " " + r.snippet).toLowerCase()).join(" ");
    if (allText.includes("complaint") || allText.includes("scam") || allText.includes("fraud")) redFlags.push("Complaints found");
    if (allText.includes("double broker")) redFlags.push("Double-brokering reported");
    if (allText.includes("slow pay") || allText.includes("nonpayment") || allText.includes("didn't pay")) redFlags.push("Payment issues reported");
    if (allText.includes("revoked") || allText.includes("suspended") || allText.includes("out of service")) redFlags.push("DOT authority concerns");

    const score = redFlags.length === 0 ? "CLEAN" : redFlags.length === 1 ? "CAUTION" : "HIGH RISK";

    return { results, redFlags, score, query };
  } catch {
    return null;
  }
}

// Search for road closures and alerts on a corridor
export async function lookupRoadAlerts(origin, destination) {
  const key = getKey();
  if (!key) return null;

  const query = `road closure construction accident I-${origin} to ${destination} today 2026`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${key}&num=6&tbm=nws`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Try news results first, fall back to organic
    const raw = data.news_results || data.organic_results || [];
    const alerts = raw.slice(0, 5).map(r => ({
      title: r.title,
      snippet: r.snippet || r.source || "",
      link: r.link,
      date: r.date || "Recent",
      source: r.source?.name || r.displayed_link || "Web",
    }));

    // Classify severity
    const allText = alerts.map(a => (a.title + " " + a.snippet).toLowerCase()).join(" ");
    let severity = "CLEAR";
    if (allText.includes("closure") || allText.includes("closed")) severity = "CLOSURE";
    else if (allText.includes("accident") || allText.includes("crash") || allText.includes("crash")) severity = "INCIDENT";
    else if (allText.includes("construction") || allText.includes("delay")) severity = "DELAY";
    else if (allText.includes("weather") || allText.includes("storm") || allText.includes("ice") || allText.includes("snow")) severity = "WEATHER";

    return { alerts, severity, origin, destination };
  } catch {
    return null;
  }
}

// Quick news search for freight market intel
export async function lookupFreightNews(topic = "trucking freight rates 2026") {
  const key = getKey();
  if (!key) return null;

  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(topic)}&api_key=${key}&num=6&tbm=nws`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const news = (data.news_results || data.organic_results || []).slice(0, 5).map(r => ({
      title: r.title,
      snippet: r.snippet || "",
      link: r.link,
      date: r.date || "Recent",
      source: r.source?.name || r.displayed_link || "Web",
    }));
    return { news, topic };
  } catch {
    return null;
  }
}
