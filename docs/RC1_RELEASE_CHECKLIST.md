# RC1 Release Checklist

## Production deployment readiness

- [x] Root and Worker TypeScript checks pass.
- [x] Worker unit tests pass.
- [x] Wrangler v4 is installed and config migration directory placement is corrected.
- [ ] Replace D1 placeholders in `wrangler.jsonc` with the actual database name and ID.
- [ ] Apply migrations `001`–`020` to a clean local D1 database.
- [ ] Apply migrations to staging D1.
- [ ] Run `wrangler deploy --dry-run` with staging configuration.
- [ ] Configure Worker secrets: `SESSION_SECRET`, `BETTER_AUTH_SECRET`, `EXPO_ACCESS_TOKEN` as required.

## Security readiness

- [x] Password hashing, session validation, prepared queries, audit sanitization, RBAC middleware, and local rate limiting are present.
- [ ] Implement strict CORS allowlist for the Expo web origin.
- [ ] Seed and verify production permissions, including admin/pilot/ambassador/moderation grants.
- [ ] Adopt a durable global rate-limit control or document Cloudflare edge rule coverage.
- [ ] Resolve or formally accept 13 moderate Expo transitive dependency findings.

## Performance readiness

- [x] Query indexes audited and corrected.
- [ ] Persist Worker request timings, errors, and slow queries in production.
- [ ] Run 100/500/1000-user staging load tests.
- [ ] Record Worker latency and Expo bundle-size results.

## Accessibility readiness

- [x] Root typecheck validates UI code.
- [ ] Test screen-reader labels, contrast, dynamic text, and focus behavior on iOS/Android/web.
- [ ] Verify reduced-motion and offline states on device.

## Documentation readiness

- [x] RC1 audit and release documents exist.
- [ ] Update operational documentation with real staging/production endpoints after provisioning.

## Leadership demo and pilot readiness

- [x] Pilot and leadership guides exist.
- [ ] Execute end-to-end leader, ambassador, and student demo accounts against staging.
- [ ] Validate analytics, observability, onboarding, messaging, and Spark Moments with pilot data.

## Version recommendation

**Current recommendation: No-Go for RC2 promotion.**

Promote RC1 to RC2 only when D1 migrations, deploy dry run, CORS, secrets/permissions, and staging smoke tests have completed successfully.
