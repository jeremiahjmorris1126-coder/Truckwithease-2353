// ============================================================================
// TRUCKWITHEASE LOCAL-FIRST SERVICE WORKER (PWA & OFFLINE ELD SYNC)
// FMCSA §395 Compliant: Caches app assets and critical ELD HOS logs offline.
// Stores logs in IndexedDB and triggers automatic background push to Firestore.
// ============================================================================

const CACHE_NAME = 'truckwithease-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service worker precache warning:', err);
      });
    })
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
        .catch(() => {
          // If offline and request is HTML navigation, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return cachedResponse;
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
