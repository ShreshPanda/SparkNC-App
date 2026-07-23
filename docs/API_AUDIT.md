# API Audit — RC1

**Date**: 2026-07-20

## Architecture

The Worker route registry composes route factories. Route handlers delegate to controllers; controllers construct services and repositories. The intended Route → Controller → Service → Repository → D1 structure is present.

## Fixes completed

- Registered `createCommunityRoutes` and `createFeedbackRoutes` in `workers/api/routes/index.ts`.
- Added a Worker-boundary rate-limit check before route matching.
- Retained standardized success/error envelopes from `workers/index.ts`.
- Confirmed static route matching handles parameter segments and method matching.

## Endpoint controls

- Authentication: controllers generally require `context.userId` for user data.
- Authorization: privileged routes use `requirePermission` and role permissions from D1.
- Validation: task and goal services use Zod; several legacy controllers use direct casts and require further schema coverage.
- Audit logging: mutating and sensitive requests are logged without breaking responses if audit persistence fails.

## Findings

- **Response consistency**: raw `Response` errors are standardized, but controller object errors that do not carry an HTTP status can be returned as HTTP 200. This requires a centralized controller-result mapping before RC2.
- **Query parameters**: the Worker only parses JSON request bodies. GET query parameters are not converted to controller input, so optional filters such as metrics windows must be handled or documented consistently.
- **CORS**: no explicit CORS policy was found at the Worker boundary. This is a production blocker for browser access from a separately hosted Expo web app.
- **Versioning**: router exposes `version: v1` internally, but public paths are not version-prefixed. Freeze the existing API contract for RC1 and plan versioning for a future major release.

## Recommendation

**Conditional No-Go** until CORS behavior and consistent non-2xx error status mapping are verified in a staging Worker.
