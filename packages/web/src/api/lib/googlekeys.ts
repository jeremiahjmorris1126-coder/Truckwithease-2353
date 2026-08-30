/**
 * Per-API Google key selection.
 *
 * WHY THIS EXISTS: the two Google keys on this project (project number
 * 405307027459) do NOT have the same API restrictions, and no single key
 * covers everything the app needs. Measured live on 2026-08-30:
 *
 *   VITE_GOOGLE_MAPS_KEY   Directions OK | Geocoding DENIED | Places DENIED
 *   GOOGLE_PLACES_API_KEY  Directions DENIED | Geocoding OK | Places OK
 *
 * So a single `GOOGLE_MAPS_KEY || VITE_GOOGLE_MAPS_KEY` read — which is what
 * routing.ts and dispatchzero.ts used to do — can only ever get one of the
 * three working. This module picks the key per API family instead, and always
 * honours an explicit override first so that when one key is finally
 * unrestricted for all three, setting GOOGLE_MAPS_KEY makes it win everywhere
 * and this file needs no edit.
 *
 * Nothing here probes Google. Selection is by declared env, not by guessing,
 * and callers report the key's own error verbatim when a call is refused.
 */

const clean = (v: string | undefined) => (v || "").replace(/^"|"$/g, "").trim();

const env = () => ({
  explicit: clean(process.env.GOOGLE_MAPS_KEY),
  browser: clean(process.env.VITE_GOOGLE_MAPS_KEY),
  places: clean(process.env.GOOGLE_PLACES_API_KEY),
  directions: clean(process.env.GOOGLE_DIRECTIONS_KEY),
  geocoding: clean(process.env.GOOGLE_GEOCODING_KEY),
});

/** Google API families this app calls. */
export type GoogleApi = "directions" | "geocoding" | "places";

/**
 * The key to use for one API family. Order: a purpose-specific override, then
 * GOOGLE_MAPS_KEY (the "one key that does everything" slot), then the key
 * measured to work for that family, then anything present.
 */
export function googleKeyFor(api: GoogleApi): string {
  const e = env();
  const chain: string[] =
    api === "directions"
      ? [e.directions, e.explicit, e.browser, e.places]
      : api === "geocoding"
        ? [e.geocoding, e.explicit, e.places, e.browser]
        : [e.explicit, e.places, e.browser];
  return chain.find((k) => k.length > 0) || "";
}

/** Which env var name won for this API family — for diagnostics, never the key. */
export function googleKeySourceFor(api: GoogleApi): string | null {
  const e = env();
  const named: Array<[string, string]> =
    api === "directions"
      ? [["GOOGLE_DIRECTIONS_KEY", e.directions], ["GOOGLE_MAPS_KEY", e.explicit], ["VITE_GOOGLE_MAPS_KEY", e.browser], ["GOOGLE_PLACES_API_KEY", e.places]]
      : api === "geocoding"
        ? [["GOOGLE_GEOCODING_KEY", e.geocoding], ["GOOGLE_MAPS_KEY", e.explicit], ["GOOGLE_PLACES_API_KEY", e.places], ["VITE_GOOGLE_MAPS_KEY", e.browser]]
        : [["GOOGLE_MAPS_KEY", e.explicit], ["GOOGLE_PLACES_API_KEY", e.places], ["VITE_GOOGLE_MAPS_KEY", e.browser]];
  return named.find(([, v]) => v.length > 0)?.[0] ?? null;
}

/** Masked fingerprint so two keys can be told apart without exposing either. */
export function maskKey(k: string): string | null {
  if (!k) return null;
  return k.length <= 16 ? `${k.slice(0, 4)}…` : `${k.slice(0, 10)}…${k.slice(-6)}`;
}

/** What key each API family will use right now. Contains no key material. */
export function googleKeyReport() {
  const apis: GoogleApi[] = ["directions", "geocoding", "places"];
  return {
    projectNumber: "405307027459",
    projectNumberSource:
      "Read from Google's own 403 body on places.googleapis.com: details[].metadata.consumer = projects/405307027459. The project display name is not exposed by any API and is not claimed here.",
    perApi: apis.map((api) => {
      const key = googleKeyFor(api);
      return { api, envVar: googleKeySourceFor(api), key: maskKey(key), configured: key.length > 0 };
    }),
    note:
      "Each API family is sent the key whose Google Cloud API restrictions allow it. Set GOOGLE_MAPS_KEY to a single key unrestricted for Directions + Geocoding + Places and it takes priority for all three.",
  };
}
