# macOS Deployment Setup

## Required tools

- Node.js LTS and npm
- Git
- A Cloudflare account with Workers and D1 enabled

Verify local tools:

```bash
node --version
npm --version
npx wrangler --version
```

Install project dependencies from the repository root:

```bash
npm install
```

## Local frontend and Worker

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=http://localhost:8787`.
2. Copy `.dev.vars.example` to `.dev.vars` and replace the sample secrets with local values at least 32 characters long.
3. Apply local migrations to a dedicated local D1 name:

   ```bash
   node scripts/apply-d1-migrations.mjs sparknc-local local
   ```

4. In one terminal, start the Worker:

   ```bash
   npx wrangler dev --local
   ```

5. In another terminal, start Expo:

   ```bash
   npm start
   ```

6. Verify the Worker:

   ```bash
   node scripts/check-worker-health.mjs http://localhost:8787
   ```

## macOS safeguards

- `.dev.vars`, `.env.local`, and `.wrangler/` are ignored by Git.
- Do not run D1 `--remote`, deploy, or rollback commands until the Cloudflare account shown by `npx wrangler whoami` is the intended account.
- The provided scripts never delete D1 databases or Workers.
