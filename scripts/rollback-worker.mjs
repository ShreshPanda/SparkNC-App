import { spawnSync } from 'node:child_process';

const [environment, versionId] = process.argv.slice(2);

if (!['staging', 'production'].includes(environment)) {
  console.error('Usage: node scripts/rollback-worker.mjs <staging|production> [version-id]');
  process.exit(1);
}

const args = ['wrangler', 'rollback'];
if (versionId) args.push(versionId);
if (environment === 'staging') args.push('--env', 'staging');

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
