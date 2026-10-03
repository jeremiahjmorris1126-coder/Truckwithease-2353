import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';
import { eldFirestoreSyncService } from './services/eldFirestoreSyncService';
import { liveAnalyticsConnectorService } from './services/liveAnalyticsConnectorService';

// Initialize Local-First Service Worker for PWA and Offline ELD Sync
registerServiceWorker(() => {
  eldFirestoreSyncService.syncPendingLogsToFirestore();
});

// Initialize Google Analytics 4 & Cloudflare Edge Client-Side Telemetry
liveAnalyticsConnectorService.initClientTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
