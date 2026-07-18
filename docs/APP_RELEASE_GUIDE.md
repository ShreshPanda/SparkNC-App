# SparkNC App Release Guide

## Overview
This guide covers building, signing, and distributing the SparkNC Expo app for iOS, Android, and web.

## Configuration

### `app.json`
- Verify `version` matches the deployed Worker version (e.g., `1.5.0`).
- Set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` in your `.env` and EAS environment.
- Ensure `orientation` and `userInterfaceStyle` match design tokens.

### Icons & Splash
- `assets/icon.png` — app icon (1024x1024).
- `assets/adaptive-icon.png` + `assets/splash-icon.png` — Android adaptive icon and splash.
- `assets/favicon.png` — web favicon.

## iOS
1. Register app identifier in Apple Developer portal.
2. Configure EAS credentials:
   ```bash
   npx eas-cli credentials
   ```
3. Build:
   ```bash
   npx eas build --platform ios
   ```
4. Submit to TestFlight for internal testing, then App Store review.

## Android
1. Create keystore or let EAS manage credentials:
   ```bash
   npx eas build --platform android
   ```
2. Download `aab` and upload to Google Play Console.
3. Configure `adaptiveIcon` background color in `app.json`.

## Web
1. Export web build:
   ```bash
   npx expo export --platform web
   ```
2. Deploy `dist` to Cloudflare Pages, Vercel, or AWS S3 + CloudFront.
3. Ensure `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` is set in the hosting environment.

## Release Checklist
- [ ] `app.json` version updated.
- [ ] Worker `APP_VERSION` matches `app.json` version.
- [ ] `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` points to production Worker.
- [ ] D1 migrations applied to production.
- [ ] Icons and splash screens verified on real devices.
- [ ] Smoke tests pass on iOS, Android, and web.
- [ ] Apple App Store and Google Play metadata updated.
- [ ] Privacy policy and terms of service URLs provided to stores.
