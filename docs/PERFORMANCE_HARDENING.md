# Performance Hardening

## Implemented

- D1 indexes cover high-traffic task, goal, event, message, audit, community, journey, portfolio, notification, and observability lookups.
- Repository queries explicitly select columns except where a legacy single-record query remains; list queries use bounded limits where implemented.
- Slow Worker requests above 300 ms are captured in `slow_queries`.
- Worker bundle minification is enabled.
- The frontend and Worker use strict TypeScript checks.

## Validation before pilot

1. Run the user journeys for registration, login, task creation/completion, goals, events, notifications, and admin access against staging.
2. Inspect metrics after the run for slow-request paths.
3. Run `EXPLAIN QUERY PLAN` against any slow D1 query and add a migration-backed index only when the access pattern warrants it.
4. Export the Expo web build and inspect its size before release.

## Constraints

Caching is not enabled because no cache binding is configured. Add caching only after measuring a stable read-heavy endpoint and defining invalidation behavior.
