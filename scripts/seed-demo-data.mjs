#!/usr/bin/env node
/**
 * Seed the production Cloudflare Worker with the DC1 demo dataset.
 *
 * Usage:
 *   DEMO_SEED_SECRET=your-secret npm run seed:demo
 *
 * The secret must match the DEMO_SEED_SECRET Worker secret.
 */

const WORKER_URL = process.env.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://sparknc-api.shreshpanda.workers.dev';
const SEED_SECRET = process.env.DEMO_SEED_SECRET;

if (!SEED_SECRET) {
  console.error('Error: DEMO_SEED_SECRET is not set.');
  console.error('Set it before running: DEMO_SEED_SECRET=your-secret npm run seed:demo');
  process.exit(1);
}

async function main() {
  const url = `${WORKER_URL}/demo/seed`;
  console.log(`Seeding demo data at ${url} ...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Seed-Key': SEED_SECRET,
    },
    body: JSON.stringify({}),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    console.error(`Seed failed: ${response.status} ${response.statusText}`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log('Seed succeeded:');
  console.log(JSON.stringify(json, null, 2));
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
