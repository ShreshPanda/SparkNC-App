import { spawnSync } from 'node:child_process';

const [environment, mode] = process.argv.slice(2);

if (!['staging', 'production'].includes(environment) || !['dry-run', 'deploy'].includes(mode)) {
  console.error('Usage: node scripts/deploy-worker.mjs <staging|production> <dry-run|deploy>');
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
