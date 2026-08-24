// Google Maps API key — publishable key, safe in client code
export const GOOGLE_MAPS_KEY = "AIzaSyBWlIo4ZSmkKWW1Z9QViAReZ7M561SxBlU";

// Google Cloud API key — separate key for Vision, Speech, Translate, NLP, Sheets, Drive
// Stored in localStorage so the user can paste it in from the Google APIs page
export function getCloudKey() {
  return localStorage.getItem('google_cloud_key') || GOOGLE_MAPS_KEY;
}
export function setCloudKey(key) {
  localStorage.setItem('google_cloud_key', key.trim());
}

// All Google APIs enabled on this project:
// Maps JavaScript API, Places API, Directions API, Distance Matrix API,
// Geocoding API, Routes API, Elevation API, Time Zone API,
// Vision API (via REST), Speech-to-Text (via REST), Natural Language (via REST),
// Translate API (via REST), YouTube Data API v3,
// Roads API (snapToRoads, speedLimits), Street View Static API,
// Route Optimization API, Document AI API,
// Google Sheets API, Google Drive API, Firebase Cloud Messaging

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

// ─── Vision API (REST) — truck damage / BOL / CDL photo analysis ─────────────
export async function analyzeImageVision(base64Image, features = ['LABEL_DETECTION', 'TEXT_DETECTION', 'OBJECT_LOCALIZATION']) {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${getCloudKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: features.map(f => ({ type: f, maxResults: 20 })),
        }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Vision API error ${res.status}`);
  return res.json();
}

// ─── Speech-to-Text API (REST) — driver voice commands ───────────────────────
export async function transcribeAudio(base64Audio, languageCode = 'en-US', sampleRate = 16000) {
  const res = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${getCloudKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: { encoding: 'WEBM_OPUS', sampleRateHertz: sampleRate, languageCode },
        audio: { content: base64Audio },
      }),
    }
  );
  if (!res.ok) throw new Error(`Speech-to-Text error ${res.status}`);
  return res.json();
}

// ─── Natural Language API (REST) — document / BOL entity extraction ──────────
export async function analyzeText(text, type = 'analyzeEntities') {
  const res = await fetch(
    `https://language.googleapis.com/v1/documents:${type}?key=${getCloudKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: { type: 'PLAIN_TEXT', content: text },
        encodingType: 'UTF8',
      }),
    }
  );
  if (!res.ok) throw new Error(`Natural Language API error ${res.status}`);
  return res.json();
}

// ─── Translate API (REST) — multilingual driver support ──────────────────────
export async function translateText(text, targetLang = 'en', sourceLang = null) {
  const params = new URLSearchParams({ q: text, target: targetLang, key: getCloudKey() });
  if (sourceLang) params.append('source', sourceLang);
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${params}`);
  if (!res.ok) throw new Error(`Translate API error ${res.status}`);
  const data = await res.json();
  return data?.data?.translations?.[0]?.translatedText || text;
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

// ─── API Health Check — ping all endpoints ───────────────────────────────────
export async function checkGoogleAPIs() {
  const results = [];

  const checks = [
    {
      name: 'Maps JavaScript + Places',
      test: async () => { await loadGoogleMaps(); return !!window.google?.maps; },
    },
    {
      name: 'Geocoding',
      test: async () => { const r = await geocodeAddress('Chicago, IL'); return !!r.lat; },
    },
    {
      name: 'Distance Matrix',
      test: async () => { const r = await getDistanceMatrix(['Chicago, IL'], ['Dallas, TX']); return r.rows.length > 0; },
    },
    {
      name: 'Vision API',
      test: async () => {
        const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${getCloudKey()}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests: [{ image: { source: { imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png' } }, features: [{ type: 'LABEL_DETECTION', maxResults: 1 }] }] }),
        });
        return res.ok || res.status === 400; // 400 = API enabled, bad image = OK
      },
    },
    {
      name: 'Natural Language',
      test: async () => {
        const res = await fetch(`https://language.googleapis.com/v1/documents:analyzeEntities?key=${getCloudKey()}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document: { type: 'PLAIN_TEXT', content: 'Truck driver in Chicago.' }, encodingType: 'UTF8' }),
        });
        return res.ok;
      },
    },
    {
      name: 'Translate',
      test: async () => {
        const r = await translateText('Hello driver', 'es');
        return r.length > 0;
      },
    },
    {
      name: 'Speech-to-Text',
      test: async () => {
        const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${getCloudKey()}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' }, audio: { content: '' } }),
        });
        return res.ok || res.status === 400; // 400 = API enabled, empty audio = OK
      },
    },
  ];

  for (const check of checks) {
    const start = Date.now();
    try {
      const ok = await check.test();
      results.push({ name: check.name, status: ok ? 'LIVE' : 'ERROR', ms: Date.now() - start });
    } catch (e) {
      results.push({ name: check.name, status: 'ERROR', error: e.message, ms: Date.now() - start });
    }
  }

  return results;
}

// ─── Roads API — snap GPS coords to roads, get speed limits ──────────────────
export async function snapToRoads(points) {
  // points: array of {lat, lng}
  const path = points.map(p => `${p.lat},${p.lng}`).join('|');
  const res = await fetch(
    `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(path)}&interpolate=true&key=${GOOGLE_MAPS_KEY}`
  );
  if (!res.ok) throw new Error(`Roads API error ${res.status}`);
  return res.json();
}

export async function getSpeedLimits(points) {
  const path = points.map(p => `${p.lat},${p.lng}`).join('|');
  const res = await fetch(
    `https://roads.googleapis.com/v1/speedLimits?path=${encodeURIComponent(path)}&key=${GOOGLE_MAPS_KEY}`
  );
  if (!res.ok) throw new Error(`Speed Limits API error ${res.status}`);
  return res.json();
}

// ─── Street View Static API — delivery address photo preview ─────────────────
export function getStreetViewUrl(lat, lng, width = 640, height = 480, heading = 0, pitch = 0) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${GOOGLE_MAPS_KEY}`;
}

export function getStreetViewUrlByAddress(address, width = 640, height = 480) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}`;
}

// ─── Route Optimization API — multi-stop dispatch routing ────────────────────
export async function optimizeRoutes(shipments, vehicles) {
  // shipments: [{id, pickupLocation, deliveryLocation, loadDemand}]
  // vehicles: [{id, startLocation, endLocation, loadLimit}]
  const res = await fetch(
    `https://routeoptimization.googleapis.com/v1/projects/truckwithease:optimizeTours?key=${GOOGLE_MAPS_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: {
          shipments: shipments.map(s => ({
            pickups: [{ arrivalLocation: { latLng: s.pickupLocation }, duration: '300s' }],
            deliveries: [{ arrivalLocation: { latLng: s.deliveryLocation }, duration: '300s' }],
            loadDemands: { weight: { amount: String(s.loadDemand || 1) } },
          })),
          vehicles: vehicles.map(v => ({
            startLocation: { latLng: v.startLocation },
            endLocation: { latLng: v.endLocation || v.startLocation },
            loadLimits: { weight: { maxLoad: String(v.loadLimit || 48000) } },
          })),
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Route Optimization error ${res.status}`);
  return res.json();
}

// ─── Document AI (REST) — BOL / rate confirmation / POD extraction ───────────
export async function processDocument(base64Content, mimeType = 'application/pdf', processorId = 'general') {
  // processorId must be set up in your Google Cloud project
  const projectId = 'truckwithease';
  const location = 'us';
  const res = await fetch(
    `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process?key=${GOOGLE_MAPS_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawDocument: { content: base64Content, mimeType },
      }),
    }
  );
  if (!res.ok) throw new Error(`Document AI error ${res.status}`);
  return res.json();
}

// ─── Google Sheets API — export reports to Google Sheets ─────────────────────
export async function appendToSheet(spreadsheetId, range, values, accessToken) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`);
  return res.json();
}

export async function readSheet(spreadsheetId, range, accessToken) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`);
  return res.json();
}

// ─── Google Drive API — backup DVIR photos and compliance docs ───────────────
export async function uploadToDrive(fileName, base64Content, mimeType, accessToken, folderId = null) {
  const metadata = { name: fileName, ...(folderId ? { parents: [folderId] } : {}) };
  const boundary = 'multipart_boundary_truckwithease';
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    'Content-Transfer-Encoding: base64',
    '',
    base64Content,
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Authorization': `Bearer ${accessToken}`,
      },
      body,
    }
  );
  if (!res.ok) throw new Error(`Drive API error ${res.status}`);
  return res.json();
}

// ─── Firebase Cloud Messaging — push notifications to drivers ────────────────
export async function sendPushNotification(fcmServerKey, token, title, body, data = {}) {
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${fcmServerKey}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      data,
    }),
  });
  if (!res.ok) throw new Error(`FCM error ${res.status}`);
  return res.json();
}
