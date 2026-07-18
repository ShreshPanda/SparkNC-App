# Next Task

## Sprint 7 handoff

Sprint 7 — Launch, Validation & Real-World Adoption — is complete. All planned phases have been implemented and documented:
- Production Deployment Runbook
- Pilot Management System
- First-Time User Experience
- AI Memory System
- Real Push Notification Delivery
- Engagement Analytics
- Ambassador Student Support System
- Community Moderation
- Performance Validation (Load Testing)
- Leadership Demo Experience

Review the new docs before continuing:
- `docs/PRODUCTION_RUNBOOK.md`
- `docs/PILOT_SYSTEM.md`
- `docs/ONBOARDING_FLOW.md`
- `docs/AI_MEMORY_SYSTEM.md`
- `docs/PUSH_NOTIFICATIONS.md`
- `docs/ENGAGEMENT_ANALYTICS.md`
- `docs/AMBASSADOR_OPERATIONS.md`
- `docs/COMMUNITY_MODERATION.md`
- `docs/LOAD_TESTING.md`
- `docs/SPARKNC_LEADERSHIP_DEMO.md`
- `docs/SPRINT_STATE.md`

## Next priorities

1. **Tooling & Verification**
   - Run `npm install` and verify `workers` and Expo projects typecheck cleanly.
   - Apply all D1 migrations from `001` through `016`.
   - Use `wrangler dev` to smoke-test every new endpoint, especially `/pilot/*`, `/onboarding`, `/ai/memory`, `/analytics/engagement`, `/ambassador/student-support`, and `/community/moderate/*`.

2. **Permissions & Secrets**
   - Seed `pilot.manage`, `pilot.view`, `community.moderate.review`, `community.moderate.remove`, `ambassador.support.view`, and `ambassador.support.message` permissions into the `roles` table.
   - Set `EXPO_ACCESS_TOKEN` via `wrangler secret put` and register `ExpoPushProvider` in `workers/index.ts`.
   - Verify no secrets are committed.

3. **Testing**
   - Expand Vitest coverage for pilot, onboarding, AI memory, engagement analytics, student support, and moderation repositories/services.
   - Add frontend onboarding and push-token flow tests with React Native Testing Library.

4. **Performance Validation**
   - Run the `docs/LOAD_TESTING.md` 100/500/1000-user validation in staging.
   - Review `PerformanceMonitoringService` timings and add indexes or caching for any slow queries.

5. **Release**
   - Export the Expo web build (`npx expo export --platform web`) and run EAS builds for iOS/Android.
   - Deploy the Worker and Expo app with `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` set to production.
   - Conduct the end-to-end leadership demo using `docs/SPARKNC_LEADERSHIP_DEMO.md`.
