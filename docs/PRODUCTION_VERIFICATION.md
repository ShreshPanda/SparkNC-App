# Production Verification

Run after `npm run deploy:worker` and before directing pilot users to SparkNC.

## Platform endpoints

```bash
node scripts/check-worker-health.mjs https://<deployed-worker-domain>
```

Expected: `/health`, `/version`, and `/status` return HTTP 200 JSON envelopes. `/health` must show `data.status: "ok"`, `data.database: "connected"`, and version `1.0.0-rc2`.

## Authentication and authorization

- Register a new pilot student and confirm the returned role is `student`.
- Log in, call `/auth/me` using the session, and log out. The subsequent `/auth/me` request must return `401`.
- Confirm a student receives `401` when not signed in and `403` when signed in without permission for admin, metrics, and ambassador-only routes.

## Functional staging/pilot matrix

| Area | Expected result |
| --- | --- |
| Tasks and goals | Signed-in student can create, update, complete, list, and delete only their records. |
| Journey and portfolio | Signed-in student can retrieve their own journey and portfolio data. |
| Events | Public event listing works; protected management operations require the configured permission. |
| Messaging | Student can list their conversations and send messages within authorization rules. |
| Notifications | Student can read notifications and change their preferences. |
| AI | Signed-in student receives the configured AI response paths without server errors. |
| Dashboard | Student dashboard and insights load only for the signed-in user. |
| Admin and ambassador | Access is denied unless a seeded role has the required permission. |
| Offline sync | Queue an offline change, reconnect to the Worker URL, and confirm successful sync without duplicate records. |
| Push notifications | Register a real Expo push token and validate delivery only if the production push provider is configured. |
| Metrics | Unauthenticated access returns `401`; an authorized executive role receives the metrics dashboard. |

## Browser and mobile checks

- Verify the production web origin appears exactly in `ALLOWED_ORIGINS`; an unapproved origin must return `403`.
- Verify the web app and API use HTTPS subdomains of the same registrable domain; `SameSite=Strict` intentionally does not support cross-site session cookies.
- Verify the session cookie contains `HttpOnly`, `SameSite=Strict`, `Max-Age`, and `Secure` in production web traffic.
- Verify iOS and Android use the configured `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` without source changes. Native session state is held in memory by `cloudflareService.ts`, so confirm login again after a cold restart.

## Observability and pilot gate

- Verify a response includes `X-Request-Id` and that the ID is searchable in Worker logs.
- Confirm `/metrics` reflects test traffic for an authorized account.
- Record the Worker version ID printed by deployment and the D1 database name used.
- Do not launch the pilot if health is degraded, migrations are missing, auth fails, or any core flow returns a `5xx` response.
