import { spawnSync } from 'node:child_process';

const [databaseName, target] = process.argv.slice(2);

if (!databaseName || !['local', 'remote'].includes(target)) {
  console.error('Usage: node scripts/apply-d1-migrations.mjs <database-name> <local|remote>');
  process.exit(1);
}

const result = spawnSync('npx', ['wrangler', 'd1', 'migrations', 'apply', databaseName, `--${target}`], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
