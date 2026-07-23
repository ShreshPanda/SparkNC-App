import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'wrangler.jsonc',
  'workers/index.ts',
  '.dev.vars.example',
  '.env.example',
  'workers/database/migrations/001_initial.sql',
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));
if (missing.length > 0) {
  console.error(`Missing required deployment files: ${missing.join(', ')}`);
  process.exit(1);
}

const migrationDirectory = join(root, 'workers/database/migrations');
const migrations = readdirSync(migrationDirectory)
  .filter((file) => /^\d{3}_.+\.sql$/.test(file))
  .sort();
const expected = migrations.map((file, index) => String(index + 1).padStart(3, '0'));
const actual = migrations.map((file) => file.slice(0, 3));
if (migrations.length === 0 || expected.some((value, index) => value !== actual[index])) {
  console.error('D1 migrations must use a contiguous three-digit sequence starting at 001.');
  process.exit(1);
}

const config = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
const worker = readFileSync(join(root, 'workers/index.ts'), 'utf8');
const failures = [];

if (!config.includes('"migrations_dir": "workers/database/migrations"')) failures.push('Wrangler D1 migrations_dir is missing.');
if (!config.includes('"binding": "DB"')) failures.push('Wrangler DB binding is missing.');
if (!config.includes('"staging"')) failures.push('Wrangler staging environment is missing.');
if (!worker.includes('Missing or too short SESSION_SECRET')) failures.push('Worker SESSION_SECRET startup validation is missing.');
if (!worker.includes("url.pathname === '/health'")) failures.push('Worker health endpoint is missing.');

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Deployment readiness checks passed: ${migrations.length} ordered D1 migrations, DB binding, staging config, environment validation, and health endpoint found.`);
console.log('Cloudflare placeholders remain by design until you create or bind SparkNC D1 databases and domains.');
