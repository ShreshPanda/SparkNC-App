# Security Hardening

## Implemented controls

- **Authentication:** Passwords use PBKDF2-SHA-256 with a random salt and 100,000 iterations. Sessions are server-side, expire after seven days, and are revoked on logout.
- **Authorization:** Protected routes use role permissions stored in D1. The metrics endpoint requires `admin.executive.view`.
- **Registration:** Public registration always assigns the `student` role; clients cannot self-assign privileged roles.
- **Cookies:** Session cookies are `HttpOnly`, `SameSite=Strict`, have `Max-Age`, and add `Secure` when `COOKIE_SECURE=true`.
- **CORS:** Requests with browser origins are checked against `ALLOWED_ORIGINS`; preflight is handled explicitly and credentials are allowed only for an approved origin.
- **Rate limiting:** The Worker boundary limits requests by connecting IP and path before routing.
- **Audit logs:** Mutating and selected sensitive reads are recorded with sensitive metadata redacted recursively.
- **Errors:** External responses use standard error envelopes and unexpected exceptions return a sanitized message with an `X-Request-Id` correlation value.

## Required release validation

1. Confirm all production secrets are stored in Cloudflare and not committed.
2. Attempt an unapproved cross-origin request and confirm a `403` response.
3. Confirm a newly registered account has role `student`.
4. Verify an unauthenticated request to `/metrics` receives `401`, and a non-authorized role receives `403`.
5. Verify production cookies contain `HttpOnly`, `SameSite=Strict`, and `Secure`.

## Residual risk

The current in-memory rate limiter is per Worker isolate. Before a broad public launch, configure a distributed edge rate-limiting control if consistent global abuse protection is required.
