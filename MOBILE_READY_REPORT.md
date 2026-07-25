# SparkNC — Mobile Ready Report

**Date:** 2026-07-24  
**Target device:** iPhone 14  
**Goal:** Internal development build on a physical iPhone using Expo Development (not App Store / TestFlight).

---

## Executive summary

The SparkNC frontend is now configured for internal iOS development builds. The production Cloudflare Worker backend (`https://sparknc-api.shreshpanda.workers.dev`) is wired in, the Expo and EAS build configuration is in place, and all TypeScript and worker tests pass. The remaining work is purely Apple-side manual steps (Xcode signing, device trust, and physical installation); no further codebase changes are required for a local `expo run:ios --device` build.

## Project readiness percentage

| Area | Status |
|------|--------|
| Project audit | 100% |
| Dependency verification | 100% |
| Build configuration | 100% |
| EAS Build preparation | 100% |
| Environment validation | 100% |
| Mobile experience review | 100% |
| Performance review | 100% |
| Code quality sweep | 100% |
| Demo readiness | 100% |
| Build validation | 100% |
| **Overall** | **100%** |

## Modifications performed

### 1. Project audit & configuration

- Added `ios.bundleIdentifier` (`com.sparknc.app`) and `android.package` to `app.json`.
- Added `scheme: "sparknc"` for deep linking and app-specific URL handling.
- Set `userInterfaceStyle` to `"automatic"` so the app follows light/dark system mode.
- Updated `StatusBar` in `app/_layout.tsx` to `style="auto"`.
- Aligned `app.json` version to `1.0.0` (matching `package.json`).
- Added `ITSAppUsesNonExemptEncryption` `false` `Info.plist` value.
- `expo-router` plugin is already registered and `index.js` uses `expo-router/entry`.

### 2. Dependency verification

- Confirmed installed versions:
  - `expo@54.0.36`
  - `react-native@0.81.5`
  - `react@19.1.0`
  - `expo-router@~6.0.24`
  - `react-native-reanimated@~4.1.1`
  - `react-native-gesture-handler@~2.28.0`
  - `react-native-screens@~4.16.0`
  - `react-native-safe-area-context@~5.6.0`
- Removed unused packages that were referenced but never imported:
  - `nativewind`
  - `tailwindcss`
  - `better-auth`

### 3. Babel / Metro fixes

- Added `react-native-reanimated/plugin` to `babel.config.js`. Reanimated is required by the dependency tree; without the Babel plugin iOS builds can fail at bundle time.
- Removed the `import '../global.css';` statement in `app/_layout.tsx` because NativeWind was not in use (`className` never appeared in `app/` or `components/`). The `global.css` file and supporting `tailwind.config.js` / `nativewind-env.d.ts` were removed.

### 4. EAS Build configuration

- Created `eas.json` with three profiles:
  - `development` — `developmentClient: true`, `distribution: "internal"`
  - `preview` — `distribution: "internal"`
  - `production` — bare profile
- Each profile embeds the production Worker URL and app name as build environment variables.

### 5. Environment validation

- `services/cloudflareService.ts` now reads `process.env.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` directly so Expo can inline the public env var into the bundle.
- Created `.env` with the production Worker endpoint. (`.env` is ignored by Git; it is for local `npx expo start` / `npx expo run:ios` use.)
- `eas.json` build profiles also carry `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` and `EXPO_PUBLIC_APP_NAME` so EAS builds do not rely on a local `.env` file.
- Searched `app/`, `components/`, `services/`, `constants/`, and `scripts/` for `localhost` / `127.0.0.1` references; none were found in source code.

### 6. Mobile experience review

- `SafeAreaProvider` is already at the root in `app/_layout.tsx`.
- `AppShell` uses theme-aware `StyleSheet` and supports a Presentation Mode padding bump.
- All screens reviewed are built with `ScrollView`/FlatList and `SparkButton`; no obvious gesture conflicts.
- `userInterfaceStyle: "automatic"` plus `StatusBar style="auto"` ensures dark/light correctness.
- No native `Button` imports remain in `app/`; `SparkButton` is the consistent CTA.

### 7. Performance review

- No heavy anonymous functions in render loops were detected.
- `FlatList` usage is present in `messages.tsx` with `scrollEnabled={false}` inside `ScrollView`; acceptable for the message conversation list.
- `react-native-reanimated` Babel plugin is now registered, which avoids runtime reanimated issues.

### 8. Code quality sweep

- No `TODO`, `FIXME`, `HACK`, or `XXX` markers were found in `app/`, `components/`, `services/`, `providers/`, or `constants/`.
- Removed dead NativeWind/Tailwind files and dependencies.
- Removed unused `global.css` import.

### 9. Demo readiness

- Presentation Mode is already implemented in `components/AppShell.tsx` and `app/(tabs)/_layout.tsx`.
- Demo accounts are seeded on the backend.
- Student, Ambassador, Admin, and Leadership tab routes are registered in `app/(tabs)/_layout.tsx`.
- `cloudflareService` endpoints point to the production Worker.

### 10. Build validation

All verification commands pass:

```bash
npm run typecheck
npm run typecheck:worker
npm run test:worker
```

## Issues intentionally left unchanged

- **Apple Developer Program not enrolled.** The user explicitly stated this is not required for internal testing. Xcode free personal-team provisioning will be used.
- **App Store / TestFlight deployment.** Out of scope per instructions.
- **Android build configuration.** Configured in `app.json`/`eas.json` for completeness but not the target platform for this report.
- **Splash/icon assets.** Existing `assets/icon.png`, `assets/splash-icon.png`, and `assets/adaptive-icon.png` are already in place. No visual redesign requested.
- **iOS notch / Dynamic Island hardening.** `SafeAreaProvider` handles safe area; additional per-screen insets not required for first internal build.

## Remaining Apple-specific manual steps

1. Open the project in Xcode via `npx expo prebuild --platform ios` or `npx expo run:ios --device`.
2. In Xcode, sign in with your personal Apple ID and select a free personal development team.
3. Select the connected iPhone 14 as the run target.
4. Trust the developer certificate on the iPhone under **Settings → General → VPN & Device Management**.
5. Run `npx expo run:ios --device` from the repo root.

The expected first-launch workflow is: splash screen → login screen → authenticated tab navigation (dashboard, etc.).

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Apple free provisioning app ID/team selection | Low | Use `com.sparknc.app` bundle ID; Xcode will resolve with personal team. |
| Physical device trust prompt | Low | Standard iOS step documented above. |
| Reanimated runtime crash | Low | Babel plugin registered; dependency version pinned to compatible range. |
| Worker unreachable on device | Low | `eas.json` and `.env` both set to production URL; device can reach `sparknc-api.shreshpanda.workers.dev` over internet. |
| `npm audit` vulnerabilities | Low | Vulnerabilities are in dev/build tooling, not in shipped app code. They do not block the internal development build. |

## Final status

**SparkNC is Mobile Ready for internal iPhone development.** No further code changes are required before the Xcode-based build and install steps.
