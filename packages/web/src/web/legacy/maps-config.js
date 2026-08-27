// Google Maps client config.
//
// The key comes from the root .env as VITE_GOOGLE_MAPS_KEY. Never hardcode it here.
//
// STRIPPED Aug 25, 2026 — this file previously exported 12 non-Maps functions that
// called Vision, Speech-to-Text, Natural Language, Translate, Roads, Route
// Optimization, Document AI, Sheets, Drive and FCM directly from the browser using
// the Maps key: analyzeImageVision, transcribeAudio, analyzeText, translateText,
// snapToRoads, getSpeedLimits, optimizeRoutes, processDocument, appendToSheet,
// readSheet, uploadToDrive, sendPushNotification. Plus getCloudKey/setCloudKey,
// which read an API key pasted into localStorage, and checkGoogleAPIs(), which
// health-checked those dead endpoints. All removed:
//   - the current Maps key is restricted to Maps APIs only, so every one 403s
//   - none of them were imported anywhere in the app
//   - processDocument pointed at a Document AI processor that does not exist
//   - a credential must never be pasted into or stored in the browser
// Document OCR runs server-side at POST /api/gemini/ocr. Use that instead.
//
// NOTE: the functions below use the Maps JavaScript API (Directions, Distance
// Matrix, Geocoder, Places, Elevation services). Each of those APIs must be
// enabled on the key separately, or the call fails at runtime.

export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

const GOOGLE_LIBS = 'places,geometry,drawing';

// Load the Maps + Places + Geometry script once and reuse
let _loaded = false;
export function loadGoogleMaps() {
  if (_loaded || document.querySelector('script[data-maps]')) { _loaded = true; return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=${GOOGLE_LIBS}`;
    s.async = true;
    s.defer = true;
    s.dataset.maps = "1";
    s.onload = () => { _loaded = true; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Directions API ──────────────────────────────────────────────────────────
export async function getDirections(origin, destination, waypoints = [], mode = 'DRIVING') {
  await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const svc = new window.google.maps.DirectionsService();
    svc.route({
      origin,
      destination,
      waypoints: waypoints.map(w => ({ location: w, stopover: true })),
      travelMode: window.google.maps.TravelMode[mode],
    }, (result, status) => {
      if (status === 'OK') resolve(result);
      else reject(new Error(`Directions failed: ${status}`));
    });
  });
}

// ─── Distance Matrix API ─────────────────────────────────────────────────────
export async function getDistanceMatrix(origins, destinations) {
  await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const svc = new window.google.maps.DistanceMatrixService();
    svc.getDistanceMatrix({
      origins,
      destinations,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
    }, (result, status) => {
      if (status === 'OK') resolve(result);
      else reject(new Error(`Distance Matrix failed: ${status}`));
    });
  });
}

// ─── Geocoding API ───────────────────────────────────────────────────────────
export async function geocodeAddress(address) {
  await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const gc = new window.google.maps.Geocoder();
    gc.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng(), formatted: results[0].formatted_address });
      } else reject(new Error(`Geocoding failed: ${status}`));
    });
  });
}

// ─── Places Autocomplete (truck-stop / fuel-station aware) ───────────────────
export async function searchNearby(lat, lng, type = 'gas_station', radius = 50000) {
  await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const map = new window.google.maps.Map(document.createElement('div'));
    const svc = new window.google.maps.places.PlacesService(map);
    svc.nearbySearch({
      location: { lat, lng },
      radius,
      type,
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) resolve(results);
      else reject(new Error(`Places search failed: ${status}`));
    });
  });
}

// ─── Elevation API — grade/incline for fuel burn estimation ─────────────────
export async function getElevation(lat, lng) {
  await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const svc = new window.google.maps.ElevationService();
    svc.getElevationForLocations({ locations: [{ lat, lng }] }, (results, status) => {
      if (status === 'OK' && results[0]) resolve(results[0].elevation);
      else reject(new Error(`Elevation failed: ${status}`));
    });
  });
}

// ─── Street View Static API — delivery address photo preview ─────────────────
export function getStreetViewUrl(lat, lng, width = 640, height = 480, heading = 0, pitch = 0) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${GOOGLE_MAPS_KEY}`;
}

export function getStreetViewUrlByAddress(address, width = 640, height = 480) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}`;
}
