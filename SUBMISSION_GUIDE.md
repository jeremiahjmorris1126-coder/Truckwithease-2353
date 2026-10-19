# Store Submission Guide

Validate secrets first: `bun run validate:env <mobile|desktop-mac|desktop-win|all>`.
All secrets are documented in `.env.template`; set them as CI secrets and never commit values.
The Google Maps mobile key is injected by `packages/mobile/app.config.js` from `GOOGLE_MAPS_MOBILE_API_KEY`.

> Before submitting: **rotate** the Google Maps key that previously appeared in `packages/mobile/app.json` git history,
> restrict the new key by bundle ID / package name, and replace the placeholder `ascAppId` in `packages/mobile/eas.json`.
> The privacy policy URL in `app.json` (`/privacy`) must resolve publicly.

| Script | Purpose |
|---|---|
| `bun run build:mobile:ios` | EAS iOS production build |
| `bun run build:mobile:android` | EAS Android AAB production build |
| `bun run build:desktop:mac` | macOS dmg/zip, signed + notarized |
| `bun run build:desktop:windows` | Windows NSIS installer |
| `bun run build:desktop:linux` | AppImage, deb, rpm |
| `bun run build:all` | Everything (needs per-OS runners; use the GitHub workflow) |

The workflow `.github/workflows/release-builds.yml` runs these on tags `v*` or manually.

## iOS (App Store)
1. Apple Developer Program account; create app `com.truckwithease.app` in App Store Connect.
2. `cd packages/mobile && bunx eas-cli login && bunx eas-cli credentials` (distribution cert + provisioning profile).
3. `bun run build:mobile:ios`, then `bunx eas-cli submit --platform ios`.
- [ ] Bundle ID, version, buildNumber set (auto-incremented by EAS)
- [ ] 1024x1024 icon, screenshots, description, keywords, category
- [ ] Privacy policy URL, App Privacy (location data) answers, age rating
- [ ] Review contact and demo account

## Android (Google Play)
1. Play Console account; create app `com.truckwithease.app`.
2. `bun run build:mobile:android` (EAS manages the upload keystore); first upload must be manual, then `eas submit --platform android` with a service account key.
- [ ] versionCode increments, AAB uploaded
- [ ] 512x512 icon, feature graphic, screenshots
- [ ] Data safety form (location), content rating, privacy policy URL
- [ ] Target API level meets Play requirement

## macOS
Needs Developer ID Application certificate exported as `.p12` (base64 into `CSC_LINK`, password in `CSC_KEY_PASSWORD`),
plus `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` for notarization.
Add `packages/desktop/build/icon.icns`. For the Mac App Store, add a `mas` target and provisioning profile.
- [ ] Signed, notarized (`spctl -a -vv TruckWithEase.app`), hardened runtime
- [ ] Icon present, dmg/zip tested on x64 and arm64

## Windows
Code signing certificate (`WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`); add `packages/desktop/build/icon.ico`.
- [ ] Installer signed (avoids SmartScreen warnings), installs/uninstalls cleanly
- [ ] For Microsoft Store, add an `appx` target

## Linux
Add icons in `packages/desktop/build/icons/`.
- [ ] AppImage, deb, rpm launch on a clean distro
- [ ] Publish via GitHub Releases (auto-update feed configured under `publish`)
