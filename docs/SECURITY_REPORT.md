# Security Report — RC1

**Date**: 2026-07-20

## Controls verified

- Passwords use PBKDF2 SHA-256 with a unique random salt and 100,000 iterations.
- Registration now validates a minimum eight-character password.
- Session cookies are HttpOnly, SameSite=Strict, and Secure when requested.
- D1 queries use prepared statement bindings in reviewed repositories.
- Admin and privileged routes use permission middleware backed by D1 roles.
- Audit logs redact sensitive metadata recursively, including nested `apiToken` fields.
- Worker boundary rate limiting is enabled.
- Secrets are expected through Worker secrets and local `.dev.vars`, not `wrangler.jsonc`.

## Findings

- In-memory rate limits are isolate-local; limits are not globally durable across Worker isolates. Use Cloudflare rate limiting, Durable Objects, or KV-backed controls for production abuse protection.
- CORS headers are not explicitly defined. Define a strict allowlist before exposing the web client.
- Input validation is strong for tasks/goals but inconsistent across older controllers that cast `unknown` input directly.
- Audit failure is intentionally non-blocking; configure observability alerts for audit-write failures.
- `wrangler.jsonc` still contains placeholder D1 identifiers; no production deployment can proceed until they are replaced.
- Dependency audit reports 13 moderate transitive Expo vulnerabilities. The available remediation is an Expo SDK 57 major upgrade, which must not be forced during RC1.

## Security readiness

- Authentication and SQL-safety controls: acceptable for staging.
- Authorization: requires seeded production permissions and route-level verification.
- Production status: **Conditional No-Go** pending CORS, durable rate limiting, secrets, and permission-seed verification.
