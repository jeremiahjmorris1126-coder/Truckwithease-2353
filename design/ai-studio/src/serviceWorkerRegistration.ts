// ============================================================================
// SERVICE WORKER REGISTRATION & BACKGROUND SYNC ORCHESTRATOR
// Registers public/sw.js and triggers Background Sync when connection restores
// ============================================================================

export function registerServiceWorker(onSyncTriggered?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New TruckWithEase service worker version available.');
            }
          });
        }
      });

      // Request background sync registration if available
      if ('sync' in registration) {
        try {
          await (registration as any).sync.register('sync-eld-hos-logs');
        } catch {
          // Background sync not supported in this browser
        }
      }

      // Listen to postMessage triggers from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'AUTO_SYNC_REQUESTED') {
          if (onSyncTriggered) {
            onSyncTriggered();
          }
        }
      });
    } catch (err) {
      console.warn('Service worker registration error (normal in sandbox/private mode):', err);
    }
  });
}

export function triggerServiceWorkerSync(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({ type: 'TRIGGER_ELD_SYNC' });
    }
    if ('sync' in registration) {
      try {
        (registration as any).sync.register('sync-eld-hos-logs').catch(() => {});
      } catch {}
    }
  }).catch(() => {});
}
