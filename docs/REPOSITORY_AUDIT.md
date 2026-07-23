# Repository Audit — RC1

**Date**: 2026-07-20  
**Scope**: Application, Worker, migrations, tests, configuration, and documentation

## Scores

| Area | Score | Notes |
| --- | ---: | --- |
| Architecture | 86% | Route → Controller → Service → Repository structure is used across the Worker. |
| Maintainability | 78% | Clear folder boundaries; duplicated D1 typing and legacy modules remain. |
| Repository health | 76% | Typechecks pass after cleanup; deployment and D1 migration execution remain unverified. |

## Inventory

- Expo application: `app/`, `components/`, `providers/`, `services/`, `theme/`, `shared/`.
- Worker: `workers/index.ts`, 40 route modules, 40 controller modules, 68 service modules, 38 repositories, 20 migrations.
- Test suites: `workers/__tests__/` and `workers/tests/`.

## Findings and cleanup completed

- Fixed unresolved merge-conflict markers in `README.md`.
- Registered previously unreachable community and student-feedback route factories in `workers/api/routes/index.ts`.
- Corrected nested component imports that pointed into `app/` instead of root shared modules.
- Removed the onboarding TODO and wired the screen to `POST /onboarding` through `cloudflareService`.
- Added strict `SyncApi` typing for the offline sync service.
- Added semantic `success` and `error` color tokens used by existing screens.
- Reconciled stale repository queries with canonical `xp_total`, `current_streak`, and `longest_streak` schema columns.
- Corrected migration indexes that referenced missing columns or absent tables.
- Updated the password migration to be idempotent with the initial schema.

## Technical debt

- Worker modules repeatedly declare local D1 interfaces instead of importing one canonical database type.
- `workers/api/middleware/authz.ts` is a legacy synchronous shim. Runtime routes use `middleware/permission.ts`; remove the legacy shim after verifying no external imports.
- `PerformanceMonitoringService` retains in-memory metrics and is not connected to persisted observability tables.
- `SyncService` is not referenced by the app and profile synchronization has no Worker profile-update endpoint.
- The `routeRegistry` display map is incomplete compared with executable `modules`; it should not be treated as an OpenAPI contract.
- Some analytics repositories still need a second query-level review against production data semantics.

## Remaining recommendations

1. Introduce a shared Worker D1 type and eliminate `any` context casts incrementally.
2. Execute migrations against a disposable local D1 database before production application.
3. Generate an OpenAPI document from route definitions rather than maintaining a partial registry map.
4. Add coverage for routes, authorization boundaries, and repositories before RC2.
5. Remove or finish unused offline-sync integration before general availability.
