-- S3a enrollment foundation: additive + idempotent.
-- Adds rosters, roster_entries, invitations, and access_reset_requests.
-- Reuses users, schools, roles, and audit_logs. Only token/code hashes are
-- ever stored — no plaintext credentials.
PRAGMA foreign_keys = ON;

-- A lab-leader-owned roster within one school.
CREATE TABLE IF NOT EXISTS rosters (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rosters_school_id ON rosters(school_id);
CREATE INDEX IF NOT EXISTS idx_rosters_created_by ON rosters(created_by);

-- Verified identity slots. Names are intentionally NOT unique — duplicate
-- names are legal; import-time duplicate detection is a service concern.
CREATE TABLE IF NOT EXISTS roster_entries (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','revoked')),
  claim_code_hash TEXT UNIQUE,
  claimed_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (roster_id) REFERENCES rosters(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (claimed_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_roster_entries_roster_id ON roster_entries(roster_id);
CREATE INDEX IF NOT EXISTS idx_roster_entries_school_id ON roster_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_roster_entries_status ON roster_entries(status);
CREATE INDEX IF NOT EXISTS idx_roster_entries_claimed_user ON roster_entries(claimed_user_id);

-- Invitations. token_hash/code_hash store ONLY cryptographic hashes.
-- kind = 'individual' binds to exactly one roster entry.
-- kind = 'school_link' is a school-wide link and never carries identity —
-- it still requires a roster-entry claim code at claim time.
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  roster_entry_id TEXT,
  school_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('individual','school_link')),
  token_hash TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  claimed_at TEXT,
  claimed_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (roster_entry_id) REFERENCES roster_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invitations_school_id ON invitations(school_id);
CREATE INDEX IF NOT EXISTS idx_invitations_entry ON invitations(roster_entry_id);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

-- At most one active (unclaimed, unrevoked) individual invitation per
-- roster entry. One-time claim enforcement: services must claim via
-- UPDATE ... WHERE claimed_at IS NULL AND revoked_at IS NULL.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_one_active_per_entry
  ON invitations(roster_entry_id)
  WHERE roster_entry_id IS NOT NULL AND claimed_at IS NULL AND revoked_at IS NULL;

-- One-time access-phrase resets initiated by authorized staff.
-- Stores reset-token hashes only; target user must be re-verified in
-- service code (student role + same school).
CREATE TABLE IF NOT EXISTS access_reset_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_requests_user_id ON access_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_requests_school_id ON access_reset_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_reset_requests_expires_at ON access_reset_requests(expires_at);

-- At most one active reset per user.
CREATE UNIQUE INDEX IF NOT EXISTS idx_reset_one_active_per_user
  ON access_reset_requests(user_id)
  WHERE used_at IS NULL AND revoked_at IS NULL;

-- lab_leader: enrollment management permissions (additive, guarded
-- json_insert — preserves all existing/custom strings, idempotent on
-- re-run, no compound SELECTs which exceed D1's term limit).
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'roster.manage') WHERE name = 'lab_leader'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'roster.manage');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'invitations.manage') WHERE name = 'lab_leader'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'invitations.manage');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'students.reset_access') WHERE name = 'lab_leader'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'students.reset_access');
