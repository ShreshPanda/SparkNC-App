const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('Usage: node scripts/check-worker-health.mjs <worker-url>');
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
const endpoints = ['/health', '/version', '/status'];

for (const endpoint of endpoints) {
  const response = await fetch(`${normalizedBaseUrl}${endpoint}`);
  const body = await response.json().catch(() => null);
  if (!response.ok || !body || body.success !== true) {
    console.error(`${endpoint} failed with HTTP ${response.status}.`);
    process.exit(1);
  }

  if (endpoint === '/health' && body.data?.status !== 'ok') {
    console.error(`/health returned status ${String(body.data?.status)}.`);
    process.exit(1);
  }

  console.log(`${endpoint} passed (HTTP ${response.status}, request ID ${body.requestId ?? 'not provided'}).`);
}
