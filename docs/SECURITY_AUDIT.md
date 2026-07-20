# Security Audit — Sprint 9

## Scope

This audit covers the SparkNC Cloudflare Worker backend, Expo frontend, deployment configuration, and data layer as of the end of Sprint 9. It identifies controls, gaps, and remediation steps before pilot launch.

## Strengths

- **Layered authorization**: controllers use `requirePermission` middleware and `createAuthContext` checks.
- **Audit logging**: `AuditLogService` records sensitive actions; failures are non-blocking.
- **Secret hygiene**: `wrangler.jsonc` contains no secrets; `SESSION_SECRET`, `BETTER_AUTH_SECRET`, and `EXPO_ACCESS_TOKEN` are set as Wrangler secrets.
- **Cookie security**: `COOKIE_SAMESITE=Strict` and `COOKIE_SECURE=true` for production.
- **Standardized responses**: `workers/index.ts` wraps all responses with `requestId` and sanitized error messages.
- **Input shape**: most new services accept typed inputs from controllers rather than direct `any` payloads.
- **Route guards**: `admin.executive.view` and other permission strings are enforced at the route level.

## Gaps and remediation

| Area | Risk | Remediation |
| --- | --- | --- |
| Rate limiting | None implemented | Add `workers/api/middleware/rateLimit.ts` and apply to auth/public endpoints |
| Input validation | Zod schemas exist but are not wired to all controllers | Audit each controller; add `InputValidationService` normalization |
| SQL injection | All repository queries use parameterized `bind` values | Continue enforcing parameterized queries; never interpolate strings |
| CSRF | Cookies used for auth | Ensure `SameSite=Strict` and validate `Origin` header on mutating requests |
| Error exposure | `err.message` may leak internal details | In production, return generic `Internal server error` and log the real error |
| Secret rotation | No documented rotation cadence | Add 90-day rotation policy in `docs/PRODUCTION_RUNBOOK.md` |
| Audit completeness | Not every route uses `isSensitiveRequest` | Update `isSensitiveRequest` prefix list as new admin routes are added |
| Rate of brute force on auth | No account lockout | Add exponential backoff on failed login attempts |
| Dependency vulnerabilities | Not audited | Run `npm audit` in CI before every deploy |
| Content Security Policy | Not enforced | Add CSP headers for web deployments on Cloudflare Pages |

## Recommendations before pilot

1. Implement and wire the rate-limit middleware on `/auth/*`, `/feedback`, and public endpoints.
2. Add `InputValidationService` sanitization to all controllers accepting user data.
3. Replace raw `err.message` in production responses with generic messages.
4. Run `npm audit` and resolve critical/high issues.
5. Document incident response and secret rotation in `docs/PRODUCTION_RUNBOOK.md`.
6. Enable Cloudflare security features (WAF, bot management, DDoS protection) at the zone level.

## Compliance

- Audit logs are retained in `audit_logs` table.
- No sensitive PII is logged to metrics, slow-query, or error tables.
- `user_id` references are indexed and foreign-key constrained where appropriate.

## Sign-off

- Audit completed: 2026-07-27
- Status: **Actionable items remaining** before pilot launch
