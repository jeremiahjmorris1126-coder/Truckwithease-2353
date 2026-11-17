// ============================================================================
// TRUCKWITHEASE LOCAL-FIRST SERVICE WORKER (PWA & OFFLINE LOG SYNC)
// Caches the app shell so it opens offline. HOS logs themselves are stored in
// IndexedDB by src/services (eldIndexedDbService / eldFirestoreSyncService);
// this worker only tells open windows when to retry the Firestore sync.
// ============================================================================

const CACHE_NAME = 'truckwithease-pwa-v2';
// Only files that really exist in public/ or the build output.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
];

const BROADCAST_CHANNEL_NAME = 'truckwithease_eld_sync';
let syncBroadcastChannel = null;

try {
  if (typeof BroadcastChannel !== 'undefined') {
    syncBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable in some older WebWorkers
}

// ----------------------------------------------------------------------------
// 1. INSTALL & PRECACHE STATIC ASSETS
// ----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache each file on its own: cache.addAll() is all-or-nothing, so one
      // missing file used to leave the whole offline cache empty.
      Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset))).then((results) => {
        results.forEach((result, i) => {
          if (result.status === 'rejected') {
            console.error('Service worker could not precache ' + STATIC_ASSETS[i] + ':', result.reason);
          }
        });
      })
    )
  );
});

// ----------------------------------------------------------------------------
// 2. ACTIVATE & CLEAN OLD CACHES
// ----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ----------------------------------------------------------------------------
// 3. FETCH STRATEGY: LOCAL-FIRST / STALE-WHILE-REVALIDATE
// ----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or Firebase / API proxy requests from HTTP cache
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline. For page loads, fall back to the cached app shell.
          // (caches.match() returns a Promise, so `a || b` never reached b before.)
          if (event.request.mode === 'navigate') {
            const shell = (await caches.match('/index.html')) || (await caches.match('/'));
            if (shell) return shell;
          }
          // respondWith() must always get a Response, never undefined.
          return cachedResponse || Response.error();
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ----------------------------------------------------------------------------
// 4. BACKGROUND SYNC API (Triggered when cellular connection restores)
// ----------------------------------------------------------------------------
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-eld-hos-logs' || event.tag === 'sync-offline-telematics') {
    event.waitUntil(notifyClientsToSync());
  }
});

// ----------------------------------------------------------------------------
// 5. MESSAGE COMMUNICATION WITH CLIENT WINDOWS
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_ELD_SYNC') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  
  if (syncBroadcastChannel) {
    try {
      syncBroadcastChannel.postMessage({
        type: 'AUTO_SYNC_REQUESTED',
        timestamp: Date.now(),
        source: 'SERVICE_WORKER_BACKGROUND_SYNC',
      });
    } catch (e) {
      console.warn('BroadcastChannel error in SW:', e);
    }
  }

  clients.forEach((client) => {
    client.postMessage({
      type: 'AUTO_SYNC_REQUESTED',
      timestamp: Date.now(),
      source: 'SERVICE_WORKER_BACKGROUND_SYNC',
    });
  });
}
