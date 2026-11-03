import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [environment, mode] = process.argv.slice(2);

if (!['staging', 'production'].includes(environment) || !['dry-run', 'deploy'].includes(mode)) {
  console.error('Usage: node scripts/deploy-worker.mjs <staging|production> <dry-run|deploy>');
  process.exit(1);
}

// Fail closed: the staging D1 binding must be a real database_id that is
// NOT the production one. Placeholders like <YOUR_STAGING_D1_DATABASE_ID>
// must never reach `wrangler deploy`.
const config = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const databaseIds = [...config.matchAll(/"database_id"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
const [productionId, stagingId] = databaseIds;

if (environment === 'staging') {
  const problems = [];
  if (!stagingId) problems.push('No staging d1_databases.database_id found in wrangler.jsonc env.staging.');
  else {
    if (stagingId.includes('<')) problems.push(`Staging database_id is still a placeholder: ${stagingId}`);
    if (stagingId === productionId) problems.push('Staging database_id matches production — staging must bind its own D1 database.');
  }
  if (/"ALLOWED_ORIGINS"\s*:\s*"[^"]*</.test(config.match(/"staging"\s*:\s*\{[\s\S]*\}/)?.[0] ?? '')) {
    problems.push('Staging ALLOWED_ORIGINS still contains a placeholder.');
  }
  if (problems.length) {
    console.error(`Staging is not deployable:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
}
if (environment === 'production' && productionId?.includes('<')) {
  console.error('Production database_id is still a placeholder.');
  process.exit(1);
}

const args = ['wrangler', 'deploy'];
if (environment === 'staging') args.push('--env', 'staging');
if (mode === 'dry-run') args.push('--dry-run');

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
