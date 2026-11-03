import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Regression guard for staging/production separation (S4.3.2). Asserts on
// the raw committed config so a future edit that conflates environments
// fails loudly instead of silently shipping staging traffic to prod.

const ROOT = join(__dirname, '..', '..');
const wrangler = readFileSync(join(ROOT, 'wrangler.jsonc'), 'utf8');
const eas = JSON.parse(readFileSync(join(ROOT, 'eas.json'), 'utf8'));

const stagingBlock = wrangler.match(/"staging"\s*:\s*\{[\s\S]*?\n\t\}/)?.[0] ?? '';
const prodDatabaseIds = [...wrangler.matchAll(/"database_id"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
const stagingUrl = eas.build.staging?.env?.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL;
const prodUrl = eas.build.production?.env?.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL;

describe('staging/production environment separation', () => {
  it('staging env uses staging values and cannot bind production D1', () => {
    expect(stagingBlock).toContain('"ENVIRONMENT": "staging"');
    expect(prodDatabaseIds[0]).not.toBe(prodDatabaseIds[1]); // distinct bindings
    expect(prodDatabaseIds[0]).toBe('ac09ed8a-0ba3-4d4e-88b4-3fed3d8bca73'); // production
    expect(prodDatabaseIds[1]).toBe('d5f2cccc-9ea6-494d-acbd-f2bae09d4d1b'); // sparknc-staging
  });

  it('staging is configured for cross-site cookies and localhost Expo web origins', () => {
    expect(stagingBlock).toContain('"COOKIE_SAMESITE": "None"');
    expect(stagingBlock).toContain('"COOKIE_SECURE": "true"');
    expect(stagingBlock).toContain('http://localhost:8081');
    expect(stagingBlock).toContain('http://localhost:19006');
    expect(stagingBlock).not.toContain('sparknc-api.shreshpanda.workers.dev'); // no prod URL leakage
  });

  it('production vars are unchanged and keep Strict cookies', () => {
    expect(wrangler).toContain('"ENVIRONMENT": "production"');
    const prodBlock = wrangler.split('"env"')[0];
    expect(prodBlock).toContain('"COOKIE_SAMESITE": "Strict"');
    expect(prodBlock).toContain('ac09ed8a-0ba3-4d4e-88b4-3fed3d8bca73');
  });

  it('EAS staging profile points at the staging worker; production is untouched', () => {
    expect(stagingUrl).toBe('https://sparknc-api-staging.shreshpanda.workers.dev');
    expect(prodUrl).toBe('https://sparknc-api.shreshpanda.workers.dev');
    expect(stagingUrl).not.toBe(prodUrl);
    expect(eas.build.development.env.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL).toBe(prodUrl);
    expect(eas.build.preview.env.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL).toBe(prodUrl);
  });

  it('no secrets are embedded in committed environment configuration', () => {
    for (const text of [wrangler, JSON.stringify(eas)]) {
      expect(text).not.toMatch(/[0-9a-f]{64}/i); // hex secrets
      expect(text).not.toContain('SESSION_SECRET=');
      expect(text).not.toContain('_KEY=');
    }
  });
});
