# Next Task

## Sprint 6 handoff

Sprint 6 — Scale, Reliability, AI — is complete. All planned phases have been implemented and documented:
- Complete Security & Audit System
- Real Testing Infrastructure
- Push Notification Infrastructure
- Advanced AI Personalization
- Multi-school Organization Scaling
- Community Collaboration System
- AI-Powered Growth Narrative
- Performance Optimization
- Offline Support & Sync
- Accessibility & Inclusion
- Leadership Package

Review the new docs before continuing:
- `docs/TEST_COVERAGE.md`
- `docs/ORGANIZATION_ARCHITECTURE.md`
- `docs/PERFORMANCE_GUIDE.md`
- `docs/ACCESSIBILITY_GUIDE.md`
- `docs/SPARKNC_PLATFORM_PROPOSAL.md`
- `docs/SPARKNC_DEMO_SCRIPT.md`
- `docs/SPRINT_STATE.md`

## Next priorities

1. **Tooling & Verification**
   - Run `npm install` and verify `workers` and Expo projects typecheck cleanly.
   - Apply all D1 migrations from `001` through `012`.
   - Use `wrangler dev` to smoke-test every new endpoint, especially `/community/*`, `/audit`, and the centrally logged admin/ambassador/analytics paths.

2. **Push Notifications**
   - Implement real `NotificationProvider` implementations for iOS (APNs), Android (FCM), and web (Web Push).
   - Wire `PushNotificationService.sendToUser()` into notification generation and scheduling.
   - Add `POST /notifications/push-token` registration route and call it from the mobile app.

3. **Community & Organization**
   - Seed `community.*` permissions into the `roles` table.
   - Test group creation, joining, posting, and moderation flows end to end.
   - Add `locations` table and `users.location_id` population for full `OrganizationService` scoping.

4. **Testing**
   - Expand Vitest coverage for tasks, goals, notifications, AI companion, analytics, and repositories.
   - Add frontend journey tests with React Native Testing Library.

5. **Release**
   - Export the Expo web build (`npx expo export --platform web`) and run EAS builds for iOS/Android.
   - Deploy the Worker and Expo app with `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` set to production.
   - Conduct the leadership demo using `docs/SPARKNC_DEMO_SCRIPT.md`.
