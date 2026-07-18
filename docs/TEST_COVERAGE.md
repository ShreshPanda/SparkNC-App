# SparkNC Test Coverage Plan

## Philosophy
Every new Sprint 6 feature ships with automated verification. Tests follow the same architecture as the production code: pure logic in services, mocked D1 repositories, and end-to-end smoke tests against `wrangler dev`.

## Tooling
- **Vitest** for unit and integration tests.
- **Fake D1 repository pattern** for fast, deterministic service tests.
- **Cloudflare Workers Vitest pool** for integration tests that need real D1/KV bindings.
- **API smoke tests** using `curl` against `wrangler dev`.

## Test layout
- `workers/__tests__/services/...` — unit tests for services.
- `workers/__tests__/repositories/...` — repository behavior tests.
- `workers/__tests__/middleware/...` — auth, audit, and permission middleware tests.
- `scripts/smoke-tests.sh` — end-to-end API smoke tests.

## Coverage targets

### Authentication
- [x] `AuthService.validateSession` handles missing, expired, and valid sessions.
- [ ] `AuthService.register` rejects invalid email, short password, and duplicates.
- [ ] `AuthService.login` rejects bad credentials and returns a session on success.
- [ ] `AuthService.logout` revokes the session.

### Tasks
- [ ] `TaskService.createTask` stores a task and defaults.
- [ ] `TaskService.completeTask` rewards XP and updates streaks.
- [ ] `TaskService.deleteTask` only deletes owned tasks.

### Goals
- [ ] `GoalService.createGoal` validates and persists.
- [ ] `GoalService.completeGoal` rewards XP.

### Notifications
- [ ] `NotificationEngineService.generateForUser` respects preferences.
- [ ] `NotificationSchedulerService.schedule` skips quiet hours.

### AI
- [ ] `AICompanionService` returns safe, non-judgmental responses.
- [ ] Prompt service never exposes other users' data.

### Analytics
- [ ] `AdminCommandCenterService` aggregates metrics correctly.
- [ ] `AmbassadorCommandCenterService` buckets students by engagement.

### Repositories
- [ ] `BaseRepository` id and timestamp helpers.
- [ ] `AuditLogRepository` persists and lists logs.

### Frontend journeys
- Student: login → dashboard → complete goal → earn XP → growth timeline.
- Ambassador: login → view insights → send message.
- Admin: login → view analytics → generate report.

## Running tests

```bash
# Install dependencies first
npm install

# Backend tests
npx vitest --config workers/vitest.config.ts

# Smoke tests
npx wrangler dev &
./scripts/smoke-tests.sh
```

## Notes
- Vitest environment is set to `node` by default for fast service tests.
- Replace with `@cloudflare/vitest-pool-workers` once Cloudflare Workers bindings are needed.
