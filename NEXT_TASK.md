# Next Task

## Sprint 9 handoff

Sprint 9 — Launch Candidate, Production & Pilot Readiness — is complete. All planned phases have been implemented and documented:
- Complete deployment
- Performance optimization
- Reliability
- Security audit
- Complete testing
- Observability
- Pilot analytics
- First-time experience
- Spark moments
- Final product review
- v1.0 release package

Review the new docs before continuing:
- `docs/PRODUCTION_ENVIRONMENT.md`
- `docs/DEPLOYMENT_VALIDATION.md`
- `docs/PERFORMANCE_OPTIMIZATION.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY_AUDIT.md`
- `docs/TEST_REPORT.md`
- `docs/OBSERVABILITY.md`
- `docs/PILOT_OPERATIONS_DASHBOARD.md`
- `docs/FIRST_TIME_EXPERIENCE.md`
- `docs/SPARK_MOMENTS.md`
- `docs/FINAL_REVIEW.md`
- `docs/VERSION_1_RELEASE_NOTES.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/SPRINT_STATE.md`

## Next priorities

1. **Tooling & Verification**
   - Run `npm install` and verify `workers` and Expo projects typecheck cleanly.
   - Apply all D1 migrations from `001` through `020`.
   - Use `wrangler dev` to smoke-test `/metrics`, `/pilot/operations`, `/spark-moments`, plus earlier Sprint 8 endpoints.

2. **Permissions & Secrets**
   - Seed `admin.executive.view`, `admin.pilot.view`, `pilot.*`, `community.moderate.*`, and `ambassador.support.*` permissions into the `roles` table.
   - Set `EXPO_ACCESS_TOKEN` via `wrangler secret put` and register `ExpoPushProvider` in `workers/index.ts`.
   - Verify no secrets are committed.

3. **Frontend integration**
   - Connect `GrowthDashboard` into `app/(tabs)/dashboard.tsx` and bind widgets to live data.
   - Wire `app/(tabs)/journey.tsx` and `app/(tabs)/portfolio.tsx` to `cloudflareService`.
   - Trigger Spark Moments on task/goal completion and milestone events.

4. **Testing**
   - Expand Vitest coverage for repositories, services, and controllers.
   - Add React Native Testing Library tests for dashboard, journey, and portfolio screens.

5. **Performance & Release**
   - Run the `docs/LOAD_TESTING.md` 100/500/1000-user validation in staging.
   - Export the Expo web build (`npx expo export --platform web`) and run EAS builds for iOS/Android.
   - Deploy the Worker and Expo app with `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` set to production.
   - Conduct the end-to-end leadership demo using `docs/LEADERSHIP_PRESENTATION.md`.
