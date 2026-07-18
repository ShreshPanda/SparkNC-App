# SparkNC Testing Guide

## Philosophy
Every layer of SparkNC — from D1 to the frontend — should be testable in isolation and in integration.

## Backend Testing

### Unit Tests
Write unit tests for repositories and services using Vitest. Example locations:
- `workers/api/repositories/__tests__/healthRepository.test.ts`
- `workers/api/services/__tests__/notificationEngineService.test.ts`

### Test Pattern
```ts
import { describe, it, expect } from 'vitest';
import { NotificationEngineService } from '../services/notificationEngineService';

describe('NotificationEngineService', () => {
  it('generates no notifications when preferences opt out', async () => {
    // inject an in-memory fake repository
    const service = new NotificationEngineService(fakeDb);
    const result = await service.generateForUser('user-1');
    expect(result.generated).toBe(0);
  });
});
```

### API Tests
Use `wrangler dev` and `curl` or a Playwright API test harness:
```bash
curl http://localhost:8787/health
curl http://localhost:8787/version
curl http://localhost:8787/status
```

### Test Checklist
- [ ] `GET /health` returns `status: ok` when D1 is bound.
- [ ] `GET /version` returns `version: 1.5.0`.
- [ ] `GET /status` includes `migrations.tables` with expected table names.
- [ ] `POST /notifications/generate` respects user preferences.
- [ ] `GET /growth-timeline/stats` returns `GrowthStatistics` shape.
- [ ] `POST /ai/reflect` returns a non-judgmental reflection string.
- [ ] Admin endpoints return `403` for non-admin roles.
- [ ] Ambassador endpoints return `403` for non-ambassador roles.

## Frontend Testing

### Component Tests
Use React Native Testing Library:
- `components/__tests__/SparkCard.test.tsx`
- `components/__tests__/EmptyState.test.tsx`

### Critical Flows
- Login → Dashboard → Tasks → Complete Task → XP Update
- Student submits feedback → admin sees insight
- Ambassador views assigned students

### E2E
- Use Expo EAS Build for iOS/Android staging builds.
- Use Playwright for the web export on production build.

## Running Tests

```bash
# Backend unit tests
npm -w workers run test

# Frontend unit tests
npx jest

# API smoke tests
npx wrangler dev &
./scripts/smoke-test.sh
```

## CI/CD Recommendation
1. `npm install` on every PR.
2. Run `wrangler d1 migrations apply --local` in CI.
3. Run backend unit + integration tests.
4. Run `npx expo export --platform web` and `eas build` on release branches.
5. Deploy Worker only after tests pass.
