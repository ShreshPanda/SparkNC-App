import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['workers/__tests__/**/*.test.ts'],
    // When @cloudflare/vitest-pool-workers is installed, replace environment with:
    // pool: '@cloudflare/vitest-pool-workers',
    // poolOptions: { workers: { wrangler: { configPath: './wrangler.jsonc' } } },
  },
});
