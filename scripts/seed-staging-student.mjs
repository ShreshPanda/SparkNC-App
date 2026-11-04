// Staging-only test-student provisioner. Creates/updates the dedicated QA
// account `testingID` on sparknc-staging ONLY. Fail-closed: refuses to run
// against any other database or without explicit acknowledgement.
//
// Usage: STAGING_SEED_ACK=yes node scripts/seed-staging-student.mjs
//
// The phrase 'testing' is provisioned directly (hash written to users), so
// the login path's hash-compare accepts it while claim/reset still enforce
// validateAccessPhrase (>=3 segments) on every normal account. If the test
// account is ever reset, re-run this script to restore `testing`.

import { spawnSync } from 'node:child_process';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const ACCOUNT_ID = '35029a91f01dd1772f64528574b3080d';
const DB_NAME = 'sparknc-staging';
const DB_ID = 'd5f2cccc-9ea6-494d-acbd-f2bae09d4d1b';
const PUBLIC_ID = 'testingID';
const PHRASE = 'testing';
const SCHOOL_ID = 'smk-test-school';
const USER_ID = 'smk-test-student';

if (process.env.STAGING_SEED_ACK !== 'yes') {
  console.error('Refusing to run without STAGING_SEED_ACK=yes');
  process.exit(1);
}

const wrangler = (args) => {
  const r = spawnSync('npx', ['wrangler', ...args], {
    encoding: 'utf8',
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
  });
  if (r.status !== 0) throw new Error(`wrangler failed: ${r.stderr || r.stdout}`);
  return r.stdout;
};

// 1. Verify database identity — name and ID must both match staging.
const list = wrangler(['d1', 'list']);
if (!list.includes(DB_NAME) || !list.includes(DB_ID)) {
  throw new Error(`Staging DB not confirmed in ${ACCOUNT_ID}. Aborting.`);
}
if (!wrangler(['d1', 'execute', DB_NAME, '--remote', '--env', 'staging', '--command',
  'SELECT 1 FROM student_public_ids LIMIT 0', '--json'])) {
  throw new Error('Cannot query staging DB.');
}
console.log(`Confirmed target: ${DB_NAME} (${DB_ID})`);

// 2. Hash with the exact production format: pbkdf2:<iterations>:<base64>
const salt = randomBytes(16).toString('base64');
const hash = `pbkdf2:100000:${pbkdf2Sync(PHRASE, Buffer.from(salt, 'base64'), 100000, 32, 'sha256').toString('base64')}`;
const now = new Date().toISOString();

// 3. Idempotent upsert: dedicated test school + user + public_id row.
const stmts = [
  `INSERT OR IGNORE INTO schools (id, name, slug, created_at, updated_at)
   VALUES ('${SCHOOL_ID}', 'QA Test School', '${SCHOOL_ID}', '${now}', '${now}')`,
  `INSERT INTO users (id, email, name, role, school_id, is_active, password_hash, password_salt, created_at, updated_at)
   VALUES ('${USER_ID}', '${USER_ID}@test.sparknc', 'QA Test Student', 'student', '${SCHOOL_ID}', 1, '${hash}', '${salt}', '${now}', '${now}')
   ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash, password_salt=excluded.password_salt, is_active=1`,
  `INSERT OR REPLACE INTO student_public_ids (public_id, user_id, created_at)
   VALUES ('${PUBLIC_ID}', '${USER_ID}', '${now}')`,
];
for (const sql of stmts) {
  wrangler(['d1', 'execute', DB_NAME, '--remote', '--env', 'staging', '--command', sql]);
}

const check = wrangler(['d1', 'execute', DB_NAME, '--remote', '--env', 'staging', '--command',
  `SELECT public_id FROM student_public_ids WHERE public_id='${PUBLIC_ID}' COLLATE NOCASE`, '--json']);
if (!check.includes(PUBLIC_ID)) throw new Error('Provisioning verification failed.');
console.log(`Provisioned: ${PUBLIC_ID} / phrase '${PHRASE}' on ${DB_NAME}`);
