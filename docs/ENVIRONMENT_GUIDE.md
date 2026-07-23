# Environment and Secrets Guide

## Worker secrets

Set these only with Cloudflare secrets management. Never place them in `wrangler.jsonc`, `.dev.vars.example`, or frontend variables.

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put BETTER_AUTH_SECRET
```

Both must be at least 32 characters. `SESSION_SECRET` is validated at startup. `BETTER_AUTH_SECRET` is also required when `ENVIRONMENT=production`.

## Worker non-secret variables

Configure in `wrangler.jsonc` after replacing placeholders:

- `ENVIRONMENT=production`
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=Strict`
- `BETTER_AUTH_URL=https://<worker-domain>`
- `ALLOWED_ORIGINS=https://<approved-web-origin>`

`ALLOWED_ORIGINS` accepts a comma-separated allowlist. Production origins must be explicit HTTPS origins.

## Local development

Copy `.dev.vars.example` to `.dev.vars`. Keep `COOKIE_SECURE=false` for local HTTP and set `ALLOWED_ORIGINS` to the local Expo origins you use. `.dev.vars` and `.wrangler/` are ignored by Git.

Set the frontend's public endpoint separately in `.env`:

```dotenv
EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=http://localhost:8787
```

Use the deployed HTTPS Worker URL for release builds. Do not expose Worker secrets through `EXPO_PUBLIC_*` variables.
