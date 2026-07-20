# Reliability

This document outlines the reliability layers introduced in Sprint 9.

## Backend retry

- `workers/api/services/RetryService.ts` provides exponential-backoff retry for transient failures.
- `RetryService.fetchWithRetry` is available for outbound HTTP calls and retries only network/timeout errors.

## Frontend resilience

- `app/lib/retry.ts` wraps asynchronous calls with configurable attempts and backoff.
- `app/lib/requestQueue.ts` provides an `OfflineRequestQueue` for optimistic requests that should be replayed when connectivity returns.

## Graceful failures

- Controllers catch errors and return standardized `{ success: false, error: {...} }` responses via `workers/index.ts`.
- Audit failures are intentionally non-blocking.
- `PerformanceMonitoringService.measure` records timing without throwing.

## Optimistic updates

- UI components may update local state before the network round-trip completes and roll back on failure.
- The offline queue replays mutating requests in order once the device is back online.

## Timeout handling

- `RetryService` defaults to 3 attempts with exponential backoff.
- Consumers can tune `maxAttempts`, `delayMs`, `backoffMultiplier`, and `maxDelayMs`.

## Session recovery

- Better-Auth compatible session cookies are `SameSite=Strict` and `Secure` in production.
- `workers/index.ts` validates `SESSION_SECRET` on startup and returns `503` if missing.

## Conflict resolution

- Mutating endpoints should validate the current state against expected values before applying updates (e.g., `completed=false` for an already-completed task).
- Timestamp-based `updated_at` fields help detect stale writes.

## Future improvements

- Add a Worker-level request timeout wrapper.
- Persist offline queue to `AsyncStorage`.
- Add circuit-breaker for repeatedly failing external calls.
