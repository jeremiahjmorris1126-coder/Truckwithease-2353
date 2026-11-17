# TruckWithEase: rules for coding agents

## What this project is
- Front end: React + Vite + Tailwind (`src/`), with a service worker in `public/sw.js`.
- Back end: Express in `server.ts`.
- Data and logins: Firestore and Firebase Auth (Google sign-in). Rules live in `firestore.rules`.
- Phone apps: Capacitor (`capacitor.config.json`) bundles the built `dist/` folder.
- Deploy target: Google Cloud Run for the server, Firebase Hosting for the web app, plus Firestore rules. Never Vercel, Render or pm2.

## Rules
1. Describe only what the code actually does. Don't claim features, AI model versions, uptime or speed that nobody has measured.
2. Never call the app FMCSA-registered, FMCSA-certified or FMCSA-compliant. It is not a registered ELD.
3. Many screens use simulated data (mock data, `Math.random()`). Label those screens "Demo data", and never present simulated numbers as real.
4. Never hard-code API keys, analytics IDs or tokens. Use environment variables (see `.env.example`) and Google Secret Manager.
5. Never invent test results. Say exactly what you ran and what happened.
6. Keep `firestore.rules` locked down: no `if true` on driver, DVIR, HOS, asset, repair or toll data.
7. Don't deploy, push to main or change cloud settings without asking the owner first.
