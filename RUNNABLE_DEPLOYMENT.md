# TruckWithEase — Deployment Guide (Runable → Live)

**Prepared:** August 24, 2026 · **Launch target:** August 31, 2026
**Repo:** `/home/user/twe` (private GitHub: `jeremiahjmorris1126-coder/truckwithease`, branch `main`)

---

## Executive Summary

The web app is deployable today. Publishing is a button in the Runable UI, the Turso database is already live with all 43 tables pushed, and the build is clean (`bun run build` ✓, crash audit 249 files / 0 findings).

Three things must be fixed **before** you press publish, and one of them is permanent-once-shipped:

1. **The Android/iOS package id is `com.truckwithease_twe1.runable`.** Google Play locks a package name forever on first publish. Your own spec says it should be `com.truckwithease.app`. Change it now or live with the scaffolding name for the life of the app.
2. **The mobile app points at a dead server.** `packages/mobile/app.json` → `extra.apiUrl` is `https://truckwi-0p0ovfn-preview-4200.runable.site/`, a stale preview slug. Your live app id is `truckwi-bhnknc6`. A shipped build would call nothing.
3. **Two Google Maps API keys are compiled into the public web bundle** and are in git history. Anyone who loads the site can read them and spend your Google billing.

Nothing about payments is live either — `AUTUMN_SECRET_KEY` is a `am_sk_test_` key, so you can launch, take signups, and start trials, but you cannot collect a dollar until you swap in a live key.

---

## Key Findings

- **Web: ready.** Backend, database, 43 tables, ~30 API route files, 253-page UI, gold-on-black homepage at `/`. Verified running on port 4200 this session.
- **Mobile: not ready to publish.** Wrong API host, placeholder Maps keys in `app.json`, permanent package id still set to the scaffold value, and only 8 original screens exist.
- **Money: not connected.** Test-mode Autumn key. Signups work and are stored; no card is collected and nothing is charged. Every billing API response already says so explicitly — don't remove those flags before payments are real.
- **Texting (A2P 10DLC): your brand is FILED AND APPROVED — the campaign is what's left.** Brand `BNc2bb637f13c79bc10c8045ee264e55e6` (TCR id `B1FOSW1`, STANDARD, identity VERIFIED) was filed Aug 9 and approved by Aug 15 — read live from Twilio's BrandRegistrations API, not typed in. Both Trust Hub bundles exist: Customer Profile `BU4549acfd8133b61444347b175b50f5c0` ("Morrishive-Truckwithease", twilio-approved) and A2P Trust Product `BU601f5d0973c78d75e3fe5c39354470d5`. It is now stored on registration `a2p_mt7lwm07n964mr` via `POST /api/a2p/:id/link-brand`, and `POST /api/a2p/:id/refresh` reads back `approved`. **What still blocks driver texting:** no messaging campaign is registered on Messaging Service `MG28e60cf43e25de692677cca0c6d9dedc` (`/Compliance/Usa2p` returns an empty list) and `+16363175798` is not attached to that service. Register the campaign (use case, sample messages, opt-in language) in the Twilio console — that carries the remaining carrier review clock. Do **not** run `POST /api/a2p/:id/submit` on this row: it files a *new* brand and would duplicate an approved one.

---

## 1. Pre-Flight Blockers

Work top to bottom. Items 1–3 are launch-blocking; 4–5 are launch-blocking only for mobile.

| # | Item | Where | Effort | Risk if skipped |
|---|------|-------|--------|-----------------|
| 1 | Restrict/rotate 2 Google Maps keys | 5 source files + git history | 10 min | Public keys, your card |
| 2 | `NODE_ENV=development` → `production` | `.env` | 1 min | Dev behavior in prod |
| 3 | Live Autumn key (`am_sk_live_…`) | `.env` | Depends on Autumn | No revenue |
| 4 | ~~`extra.apiUrl` → live host~~ | `packages/mobile/app.json` | **DONE Aug 24** | Now `truckwi-bhnknc6`; re-point to the custom domain at publish |
| 5 | ~~Package id~~ | `packages/mobile/app.json` | **DONE Aug 24** | Now `com.truckwithease.app` on both platforms |
| 6 | Real Google Maps keys for mobile | `packages/mobile/app.json` | 10 min | Both still `REPLACE_WITH_GOOGLE_MAPS_KEY` — maps dead in the app |

### 1.1 Google Maps keys — do this first

Two keys, both compiled into the browser bundle:

- `AIzaSyAtgo9lKS-…qbboE` → `legacy/StatePatrolPage.jsx`, `legacy/TripPlannerPage.jsx`, `legacy/LoadBoardMapAgentPage.jsx`
- `AIzaSyBWlIo4ZSmkKWW1Z9QViAReZ7M561SxBlU` → `legacy/maps-config.js`, `legacy/pages/AndroidNativeSetupPage.jsx`

A browser-side Maps key is *always* visible — that part is normal and unavoidable. What is not normal is that these are unrestricted. In console.cloud.google.com → **Credentials**, for each key set:

- **Application restrictions:** HTTP referrers → your production domain and `*.runable.site`
- **API restrictions:** only Maps JavaScript, Places, Directions, Geocoding — whatever those pages actually call
- **Budget alert** on the project so a leak has a ceiling

They are also committed in git history across 6 tracked files. The repo is private, which contains the exposure — **do not flip it public until the keys are rotated.**

### 1.2 Environment

`.env` holds 26 variables (the 26th is `APIFREAKS_API_KEY`). All are already correct for preview. The ones that change for production:

```
NODE_ENV=production                  # currently: development
AUTUMN_SECRET_KEY=am_sk_live_…       # currently: am_sk_test_
WEBSITE_URL=https://<your-domain>    # currently: the preview URL
```

Leave alone (Runable manages them): `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AI_GATEWAY_*`, `APPLICATION_ID`, `VITE_APPLICATION_ID`, `RUNABLE_URL`, `VITE_RUNABLE_AUTH_ISSUER`, `BETTER_AUTH_SECRET`.

**File storage now runs on your own iDrive e2 account**, not Runable's Tigris bucket. `S3_ENDPOINT=https://s3.us-midwest-1.idrivee2.com`, `S3_REGION=us-midwest-1`, `S3_FORCE_PATH_STYLE=true`, `S3_BUCKET=truckwithease`, plus your e2 access key and secret. The old Tigris values are commented out one line above each replacement — the Tigris bucket held **0 objects** when the switch was made, so nothing needed migrating and the switch is reversible by uncommenting. Uploads are verified end to end: presigned `PUT` returned 200, the file read back byte-for-byte through a presigned `GET`, and the delete removed it. `GET /api/storage/health` makes a real call to the bucket. Credentials stay server-side; the browser only ever receives a URL that expires in 10 minutes.

`.env` is **not** committed — verified against the commit and full history. It never should be. Production values get set in the platform's environment settings, not in the repo.

---

## 2. Publishing the Web App

Publishing, custom domains, and environment settings are handled through the Runable platform UI — there is no CLI step and no server for you to rent. The sequence:

1. **Verify the build locally.** `cd /home/user/twe/packages/web && bun run build` → must exit ✓. Current initial JS is 505.80 kB (159.04 kB gzipped), down from 8.6 MB.
2. **Set production env vars** in the platform's settings for this app (the three from §1.2).
3. **Publish** from the platform UI.
4. **Attach the custom domain** in the platform UI. It will give you the DNS records to enter.
5. **Point DNS at IONOS.** IONOS is DNS only. Ignore every IONOS "deploy your site" or "export" instruction — you are not hosting there. Add the records the platform gives you and nothing else.
6. **Wait for the certificate.** DNS + TLS typically settle within an hour, sometimes longer.

### Post-deploy verification

Run these against the live domain, not localhost. Every one should return HTTP 200 and JSON:

```bash
D=https://yourdomain.com
curl -s -o /dev/null -w "%{http_code} /\n"           $D/
curl -s -o /dev/null -w "%{http_code} /signup\n"     $D/signup
curl -s "$D/api/signup"        | head -c 400; echo
curl -s "$D/api/subscriptions" | head -c 400; echo
curl -s "$D/api/a2p"           | head -c 400; echo
curl -s "$D/api/accessibility" | head -c 200; echo
curl -s "$D/api/licensing"     | head -c 200; echo
```

Then do the one test that matters: **open `/signup` in a real browser and click all the way through to submit.** That path crashed on a click once already (an undeclared `C.gold` reference) and a plain page-load screenshot did not catch it. A 201 response and a new row in `signups` is the pass condition.

Note: `/api/rpc/*` returning 404 is **expected**. This API is plain Hono, not oRPC. That is deliberate — not a fault to fix.

---

## 3. Publishing the Mobile App

**Never build the mobile app in this sandbox** — an Expo native build will kill it. Builds are triggered from the **publish option in the mobile preview dashboard** after you connect your Expo account there. That produces the `.aab` for Play and `.ipa` for the App Store.

### Fix `app.json` before any build

```jsonc
{
  "expo": {
    "android": { "package": "com.truckwithease.app" },      // was com.truckwithease_twe1.runable — PERMANENT after first publish
    "ios":     { "bundleIdentifier": "com.truckwithease.app" },
    "extra":   { "apiUrl": "https://yourdomain.com/" },     // was a dead preview slug
    "android": { "config": { "googleMaps": { "apiKey": "<restricted Android key>" } } },
    "ios":     { "config": { "googleMapsApiKey": "<restricted iOS key>" } }
  }
}
```

Both Maps entries currently read `REPLACE_WITH_GOOGLE_MAPS_KEY`, so maps in the mobile app do not work at all. Mobile keys must be restricted by **package name + SHA-1 fingerprint** (Android) and **bundle id** (iOS) — different restriction type from the web key.

`packages/mobile/lib/api.ts` resolves `Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL`, so fixing `extra.apiUrl` is sufficient — no code change needed.

### Accounts — status as of Aug 24

| Item | Status | What's left |
|------|--------|-------------|
| Google Play Developer | **Have it** | Connect it when you trigger the Android build |
| Apple Developer Program | **Have it** | Team ID + signing handled at build time |
| Twilio | **Have it** | Credentials wired into `.env` and verified live against the Twilio API on Aug 24 |
| A2P 10DLC brand | **Approved** (`BNc2bb637f13c79bc10c8045ee264e55e6`, TCR `B1FOSW1`) | Already paid and vetted. Nothing more to do — do not re-file |
| A2P 10DLC campaign | Not registered | ~$10–15/mo + a carrier review clock. Register it on Messaging Service `MG28e60cf43e25de692677cca0c6d9dedc` and attach `+16363175798`. This is the last real texting blocker |
| Autumn live key | Test key in place | Swap `am_sk_test_` → `am_sk_live_` |
| FMCSA ELD registration | In progress | 60–90 days; will land after launch |
| Google Maps keys (mobile) | Placeholders | Create Android + iOS restricted keys |

**The account bottleneck is gone.** Nothing on the store side blocks you now. The only item with a multi-week clock left is the 10DLC campaign — start it today, because carriers, not Twilio, control that timeline, and until it clears you cannot legally send application-to-person SMS to drivers.

**Twilio is wired.** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_PHONE_NUMBER` are in `.env`. `GET /api/a2p/twilio/health` makes a real call to Twilio and returns account status — it came back `active`, Full account, sending number `+16363175798`. The remaining step is on the Twilio side: create a Trust Hub Customer Profile and an A2P Trust Product bundle in the console, then attach their `BU...` SIDs with `POST /api/a2p/:id/bundles`. Twilio rejects every brand registration without them.

**Domain verification.** Twilio issues `twilio-domain-verification=...` tokens for link shortening and organization verification. The app page **`/twilio-setup`** (alias `/twillo-setup`) stores each token and prints the exact record to add at IONOS — type `TXT`, host `@`, value `twilio-domain-verification=<token>`. The **Check DNS** button runs a real `resolveTxt` against the apex, the record host and `_twilio.<domain>`, and marks the token verified only when the exact string is found in public DNS. The final verification click still happens in the Twilio console — the app cannot do it for you. Two tokens are already loaded, seeded against `truckhaven.com`; change the domain on the page if that is wrong.

Install dependencies with `bunx expo install`, never `bun add`, or the native build will break on version mismatches.

---

## 4. The Database

Turso (libSQL), already provisioned and live at `libsql://f6169c1f-d1fb-4b26-…`. Schema is at `packages/web/src/api/database/schema.ts`, **43 tables, all pushed**. Migrations are `bun run db:push` from `packages/web`.

**Before launch, decide what to do with the verification rows.** These are real records I created while proving the endpoints work:

```
sgn_mt7lwcbazzcg7z, sgn_mt7mpvm2fkfllr        (signups)
trl_mt7lwcgc14vzod  → code TWE-5JVHPV         (trial link)
sub_mt7lwcp1ytwa89                            (subscription, cancelled)
bcase_mt7lwcy87we253                          (billing case)
a2p_mt7lwm07n964mr                            (a2p registration)
acc_mt7mxv593mr5o6, hap_mt7mxv9pq2rih4,
areq_mt7mxvefptg5l1, lbl_mt7mxvkvt07gtj       (accessibility / licensing)
```

Keep them as proof the pipeline works, or purge them so your first real signup is signup #1. Your call — but don't let them sit in a subscriber count you show a customer.

**Backups:** Turso handles point-in-time restore at the platform level. There is no in-repo backup job. Before any `db:push` that drops or renames a column, take a manual snapshot.

---

## 5. Rollback

| Failure | Response |
|---------|----------|
| Bad frontend deploy | Re-publish the previous build from the platform UI |
| Bad schema change | Restore Turso point-in-time, then re-push the previous `schema.ts` |
| Leaked key | Delete the key in Google Cloud immediately; a restricted key with a budget cap fails safe |
| Mobile build broken in store | You cannot un-publish a version — ship a patch build. Another reason the package id must be right the first time |

The safest sequencing is: publish web → verify → run for a few days on real signups → then submit mobile. Web is reversible in minutes. A store submission is not.

---

## 6. What Is Honest About This Launch

Every one of these is already enforced in the API responses. Don't let a UI change quietly contradict them:

- **No card is collected and nobody has been charged.** `subscriptions.provider` and `providerRef` are null across the board. Every billing response carries `billing: { live: false, provider: null, note: … }`. A "cancel" returns `providerCancelled: false`; a "refund" returns `moneyMoved: false`.
- **MC numbers and EINs are format checks only** — 5–8 digits and 9 digits respectively. Not an FMCSA authority lookup, not an IRS lookup. Every response says so.
- **A2P now files through Twilio for real.** Your credentials are in `.env` and verified against the Twilio API (account active). `POST /api/a2p/:id/submit` posts a real brand registration to Twilio and stores the returned brand SID; `POST /api/a2p/:id/refresh` reads the real status back. What it still needs from you: the two Trust Hub bundle SIDs Twilio requires before it will accept any brand — created once in the Twilio console, then attached with `POST /api/a2p/:id/bundles`. Without them the submit stops at `ready` and names the missing one. Marking a row `approved` without a real brand id still returns 400 — by design.
- **Fatigue scores need 10+ telemetry samples.** `eld_telemetry` has 0 rows, so every driver returns `insufficientData` on `/api/fleet-intel/hos`. The UI will look empty. That is correct, and better than a fabricated score.
- **Accident risk is `null`.** There is no crash dataset and no model. HOS exposure is substituted with the methodology stated.
- **Load board licensing is not resold.** No agreement with DAT, Uber Freight, or Truckstop exists; seats are tracked, not purchased.
- **Competitor pricing on the homepage** (Samsara $800+, Motive $600, DAT $160) is footnoted as indicative published list pricing, not quotes. I asked for your source twice and never got one. If a competitor complains, that footnote is your only defense — get the source or cut the numbers.
- **The ELD claim** now reads "registration in progress… not yet on the FMCSA registered list." Do not restore "FMCSA REGISTERED" until it is true.

---

## 7. Known Gaps at Launch

Not blockers, but you should know what a user can hit:

- **Safety Score engine does not exist.** No `safety_scores` or `speeding_events` tables. `DriverScorecardPage` renders against nothing. Roughly a day of work.
- **`legacy/lib/loadBoardLicensing.js` still writes to PocketBase in 12 places.** The table and `/api/licensing` are built; the lib is not yet rewired, so that UI saves nothing.
- **Supplier module deferred at your instruction.** `SupplierAdminPanel.jsx` saves nothing.
- **`AppShell` is still the old amber-on-light chrome** — which is why `/app/billing` and `/app/badges` bypass it. Off-brand pages remaining: `SupplierAdminPanel`, `StartupDataAgent`, `StatePatrolPage`, `QuantumDispatchCore`, `QuantumRoutingEngine`, `RevenueForecastPage`, `ResponsibleUseOnboardingPage`.
- **Real auth (Better Auth) is deferred.**
- **APIFreaks is now live.** The key is in `.env` and `/api/intel/*` returns `live: true, source: "apifreaks"` — verified against real responses (WHOIS on `twilio.com` returned MarkMonitor and a 2007-10-26 create date; IP lookup on `8.8.8.8` returned Mountain View, CA). The endpoint paths and parameter names in the code were wrong and are corrected: auth is the `apiKey` query parameter (APIFreaks rejects the `X-API-Key` header), geolocation is `/v1.0/geolocation/lookup?ip=`, WHOIS is `/v1.0/domain/whois/live?domainName=`, timezone is `/v1.0/geolocation/timezone?ip=`, plus a new `/api/intel/domain-availability/:domain`. APIFreaks resolves timezone by IP only, so `/api/intel/timezone` now refuses lat/lng with a 400 instead of returning the server's own timezone. The checkout screener still fails closed by design.
- **i18n:** 46 languages listed, safety messages translated into 10.
- **`bun run lint` reports ~2,130 errors** across 372 legacy files. All pre-existing. `bun run build` is the gate, not lint.

---

## 8. Launch Sequence (7 days out)

| Day | Action |
|-----|--------|
| Today | Restrict both web Google Maps keys (and rotate them — both are public in the built bundle and in git history). Register the A2P **campaign** in the Twilio console and attach `+16363175798` to Messaging Service `MG28e60cf43e25de692677cca0c6d9dedc` — the brand is already approved, so the campaign is the only clock left. |
| Day 2 | Create Android + iOS Maps keys and drop them into `app.json` (package id, bundle id and `apiUrl` already fixed). Twilio needs nothing further from you on the brand or the bundles — both bundles are on the approved brand and stored in the app. |
| Day 2 | Add both Twilio TXT records at IONOS (`/twilio-setup` prints them verbatim), then hit **Check DNS** on that page and finish verification in the Twilio console. DNS can take a few hours to propagate, so start it the same day. |
| Day 3 | Get the live Autumn key. Set production env vars. Purge or keep test rows. |
| Day 4 | Publish web. Attach the custom domain. Update the IONOS DNS records. |
| Day 5 | Run the verification curls + a real browser signup on the live domain. |
| Day 6 | Push the outstanding commits to GitHub (71 uncommitted files, everything since `bcbc983`). Trigger the mobile build from the preview dashboard. |
| Day 7 | Submit to Play. Apple review takes longer — expect it to land after Aug 31. |

Pushing to GitHub:

```bash
cd /home/user/twe && set -a && . /home/user/.gh-token.env && set +a && \
git -c credential.helper= \
    -c http.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)" \
    push origin main
```

---

## Methodology

Everything above was read out of the live repository at `/home/user/twe` on August 24, 2026 — `.env` (26 variables), `packages/mobile/app.json`, `packages/mobile/lib/api.ts`, `packages/web/src/api/database/schema.ts`, the mounted route files, and `git log`/`git status`. API behavior claims come from curl responses recorded during build verification, and the `/signup` flow was driven end-to-end with Playwright against real Chrome (zero page errors, live POST returned 201).

You already hold the Google Play and Apple Developer memberships, so their fees are not a launch cost here. A2P 10DLC fees vary by provider and campaign type — the figures given are typical ranges, not quotes. Runable platform steps are described as UI actions because that is how publishing and custom domains work; no CLI equivalent is invented here.

**Limitations:** I have no visibility into your Google Cloud console, your Autumn account, or your DNS zone, so items 1.1, 1.2, and the DNS step are described but unverified. The competitor pricing on the homepage remains unsourced.
