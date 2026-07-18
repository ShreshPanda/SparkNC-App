# Architecture Audit - Sprint 2.5

This audit reviews the repository for deployment-readiness and identifies issues that are safe to fix now or should be addressed in a future sprint.

## Findings

### 1. Better Auth remains optional
- `workers/auth/betterAuth.ts` is imported and checked in `workers/index.ts`, but the custom session authentication in `workers/api/services/authService.ts` is the active system.
- `auth.isConfigured` is reported by the health endpoint for diagnostics only.
- **Recommendation:** Remove Better Auth if it will not be used, or fully integrate it for third-party auth. Do not leave it partially wired.

### 2. `workers/database/schema/users.sql` is not a migration
- `users.sql` is a reference file that diverges from `workers/database/migrations/001_initial.sql` (it defines `goals.status` and `tasks.status`, but the migration uses `completed`).
- D1 is built from the numbered migrations, not this file.
- **Recommendation:** Either keep `users.sql` strictly as a reference and align it to the migration output, or delete it to avoid confusion.

### 3. `BaseRepository.createId` uses `Math.random`
- `BaseRepository` generates IDs with `Math.random().toString(36).slice(2, 10)`, which is not cryptographically strong.
- **Recommendation:** Use `crypto.randomUUID()` with a prefix, e.g. `${prefix}-${crypto.randomUUID()}`, in `workers/api/repositories/baseRepository.ts`.

### 4. Gamification migration idempotency fixed
- `004_gamification.sql` previously repeated columns already defined in `001_initial.sql`.
- **Fixed:** All `ALTER TABLE` statements now use `ADD COLUMN IF NOT EXISTS`.

### 5. Task index fixed
- `001_initial.sql` previously created an index on `tasks(status)`, a column that does not exist.
- **Fixed:** Index now targets `tasks(completed)`.

### 6. No dedicated Worker TypeScript configuration
- `tsconfig.json` extends `expo/tsconfig.base` and is optimized for the Expo frontend.
- Worker files use modern globals (`Promise`, `Set`, `String.prototype.includes`) and the current configuration causes lint errors when `node_modules` is not installed.
- **Recommendation:** Add a `workers/tsconfig.json` that targets `es2022` and is referenced by `wrangler typecheck` if strict worker typechecking is needed.

### 7. Session cookies are bearer tokens, not signed
- `buildSessionCookie` places the raw session ID in the cookie. The `SESSION_SECRET` is validated at startup but is not used to sign or encrypt the cookie.
- **Recommendation:** Add HMAC signing of the session ID with `SESSION_SECRET` in `AuthService`, or store a signed token in the cookie and verify it on each request. This improves resilience to session ID guessing or replay.

### 8. Missing indexes for common queries
- Tasks and goals are frequently filtered by `user_id` and `completed`.
- **Recommendation:** Add composite indexes in a future migration:
  - `CREATE INDEX IF NOT EXISTS idx_tasks_user_id_completed ON tasks(user_id, completed);`
  - `CREATE INDEX IF NOT EXISTS idx_goals_user_id_completed ON goals(user_id, completed);`

### 9. Controllers contain some direct `Response.json` errors
- `auth.ts` controllers return raw `Response` objects for errors. `workers/index.ts` now standardizes these into the `{ success, error, timestamp, requestId }` envelope.
- **Recommendation:** Keep controller error handling as-is for now; the central envelope handler keeps responses consistent without redesigning controllers.

### 10. `events` and `messages` routes are placeholders
- Routes are registered in `workers/api/routes/index.ts`, but the underlying persistence/services are not complete.
- **Recommendation:** Implement `events` and `messages` CRUD in Sprint 3 if they are required for the dashboard/calendar features.

### 11. `cloudflareService` uses runtime `globalThis.process.env`
- This works in Expo because Metro polyfills `process.env` at build time from `.env` files.
- **Recommendation:** Verify that `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` is correctly inlined for web and native builds. No change needed if the existing Expo env pipeline is used.

### 12. `AppShell` and screens use theme tokens correctly
- Frontend screens reference `colors.card`, `colors.border`, `colors.accent`, etc. from the `ThemeProvider`.
- No hardcoded `#ffffff` backgrounds remain in the updated tab screens.

### 13. No circular imports detected
- The dependency graph is straightforward: `routes -> controllers -> services -> repositories` and `services -> validators`.

### 14. No dead code found
- All updated controllers, services, repositories, and routes are referenced by the registry or exported for direct use.

## Safe changes made

- `wrangler.jsonc` created with D1 binding placeholders.
- `.dev.vars.example` and `.env.example` created/updated.
- `workers/index.ts` now validates environment, logs requests, and returns a standard `{ success, data, error, timestamp, requestId }` envelope.
- `workers/api/controllers/health.ts` verifies the D1 connection.
- `workers/api/services/logger.ts` added with environment-aware logging and automatic redaction of sensitive keys.
- `services/cloudflareService.ts` updated to parse the new envelope.
- `workers/database/migrations/001_initial.sql` and `004_gamification.sql` made idempotent/consistent.

## Recommendations for Sprint 3

1. Add `workers/tsconfig.json` with `es2022` lib and `moduleResolution: bundler`.
2. HMAC-sign session cookies using `SESSION_SECRET`.
3. Align or remove `workers/database/schema/users.sql`.
4. Add composite indexes for `tasks(user_id, completed)` and `goals(user_id, completed)`.
5. Implement `events` and `messages` persistence if needed.
6. Decide the fate of Better Auth and remove or integrate it.

---

# Architecture Audit - Sprint 3

This section reviews the connected-ecosystem work added in Sprint 3.

## What was added

- **Role and permission system**: `RoleRepository`, `RoleService`, `PermissionService`, `PermissionMiddleware`.
- **Event system**: full CRUD, RSVP with `event_attendees`, scoped by `school_id`.
- **Messaging system**: conversations, participants, messages, per-conversation read status.
- **Announcement system**: scoped announcements and `announcement_reads` read receipts.
- **Notification system**: per-user notifications with read state.
- **Frontend screens**: `Calendar`, `Messages`, `Notifications`, `Admin` integrated through `cloudflareService`.
- **Database**: `005_organization.sql` migration adds all new tables, indexes, foreign keys, and role seed data.

## Findings

### 1. Separation of concerns is preserved
- Controllers (`events.ts`, `messages.ts`, `announcements.ts`, `notifications.ts`) remain thin and D1-free.
- Business validation lives in services (`eventService.ts`, `messageService.ts`, `announcementService.ts`, `notificationService.ts`).
- Data access lives in repositories (`EventRepository.ts`, `MessageRepository.ts`, `AnnouncementRepository.ts`, `NotificationRepository.ts`).
- Permission enforcement is in middleware (`permission.ts`), not controllers.

### 2. TypeScript/lib errors are environmental
- The Worker code uses `Promise`, `Set`, `String.prototype.includes`, and array `includes`. These are valid at runtime in the Workers JS runtime but the IDE lints against an ES5 target. Adding `workers/tsconfig.json` with `target: es2022` resolves the warnings.

### 3. Auth context extended correctly
- `AuthContext` now includes `schoolId`, pulled from `users.school_id` and propagated through `workers/index.ts` to controllers.
- This lets event and announcement services scope content without extra DB calls.

### 4. API contracts are consistent
- All new controllers return either data objects or standard `Response.json({ error })` objects.
- `workers/index.ts` already wraps these in the `{ success, data, error, timestamp, requestId }` envelope.
- `cloudflareService.ts` methods are typed against `shared/types.ts` and consume the envelope.

### 5. Migration is idempotent
- `005_organization.sql` uses `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- Role seed data uses `INSERT OR IGNORE` so it can be re-applied safely.

### 6. Remaining gaps
- `notifications` are created by an admin endpoint only; automatic notification triggers from task/event/message/announcement lifecycle events are not wired yet.
- No push provider integration (iOS, Android, web) is present; the repository infrastructure is ready for it.
- `workers/database/schema/users.sql` still diverges from the migration files.
- `AppShell` links are correct but the `settings` tab no longer exists.

## Safe changes made in Sprint 3

- All new repositories, services, controllers, and routes follow the existing route -> controller -> service -> repository -> database pattern.
- `shared/types.ts` enriched with `attendeeCount`, `unreadCount`, and refined ecosystem types.
- `cloudflareService.ts` expanded to cover events, conversations, messages, announcements, and notifications.
- Frontend screens use theme tokens, `useTheme`, loading indicators, and error text.

## Recommendations for Sprint 4

1. Add `workers/tsconfig.json` with `es2022` lib and `moduleResolution: bundler`.
2. HMAC-sign session cookies and align `SESSION_SECRET` usage.
3. Align or remove `workers/database/schema/users.sql`.
4. Add composite indexes for `tasks(user_id, completed)` and `goals(user_id, completed)`.
5. Wire automatic notification creation in `TaskService`, `EventService`, `MessageService`, and `AnnouncementService`.
6. Add push provider integration points for iOS, Android, and web.
7. Add unit tests for repositories and services.
8. Remove or fully integrate `workers/auth/betterAuth.ts`.
