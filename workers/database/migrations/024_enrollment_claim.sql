-- S3c enrollment claim pipeline: additive + idempotent.
-- Adds student public IDs, verification grants, enrollment claim records,
-- the claim probe scratch table, reset consumption markers, and durable
-- rate-limit counters. No existing table is altered: legacy users keep
-- email-only login and are never assigned a public ID. Only hashes are
-- stored — no raw bearer tokens.
PRAGMA foreign_keys = ON;

-- Student-facing public IDs. A separate table (not a users column) so
-- legacy accounts are untouched: a row exists only for claimed students.
CREATE TABLE IF NOT EXISTS student_public_ids (
  public_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Single-use, short-lived verification grants. Issued only after a valid
-- claim code is presented; binds invitation + roster entry + school
-- server-side. token_hash is the SHA-256 of the bearer token — the raw
-- token is never stored. attempt_id records the unique nonce of the
-- consuming claim attempt.
CREATE TABLE IF NOT EXISTS verification_grants (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  invitation_id TEXT NOT NULL,
  roster_entry_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  attempt_id TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (roster_entry_id) REFERENCES roster_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_grants_invitation ON verification_grants(invitation_id);
CREATE INDEX IF NOT EXISTS idx_grants_expires_at ON verification_grants(expires_at);
CREATE INDEX IF NOT EXISTS idx_grants_inv_active ON verification_grants(invitation_id) WHERE used_at IS NULL;

-- The claim record: at most one enrollment per roster entry (PK), per
-- user, and per grant. Inserted conditionally inside the atomic claim
-- batch; its existence is what marks an entry as enrolled.
-- Enrollment history is an audit trail: rows must never be hard-deleted
-- through ordinary roster or invitation management. Lifecycle changes
-- use revocation/status transitions on roster_entries and invitations
-- instead; the ON DELETE CASCADEs below exist only for true entity
-- deletion (e.g., school/user removal), not routine administration.
CREATE TABLE IF NOT EXISTS enrollments (
  roster_entry_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  invitation_id TEXT NOT NULL,
  grant_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (roster_entry_id) REFERENCES roster_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (grant_id) REFERENCES verification_grants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_invitation ON enrollments(invitation_id);

-- Fail-forcing scratch table. A conditional "INSERT ... SELECT NULL WHERE
-- NOT EXISTS (<prerequisite>)" raises a NOT NULL violation — aborting the
-- whole D1 batch — exactly when the prerequisite is missing. The column is
-- deliberately NOT an INTEGER PRIMARY KEY (those alias rowid and accept
-- NULL). This table must always remain empty.
CREATE TABLE IF NOT EXISTS claim_probe (
  v TEXT NOT NULL
);

-- Reset-token consumption markers. The PK on token_hash makes a consumed
-- reset token impossible to consume twice; nonce binds consumption to one
-- attempt so a prior consumption can never satisfy a later attempt.
CREATE TABLE IF NOT EXISTS reset_consumptions (
  token_hash TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  consumed_at TEXT NOT NULL
);

-- Durable fixed-window rate-limit counters shared across Worker isolates.
-- Enforced via INSERT ... ON CONFLICT DO UPDATE ... RETURNING count; a
-- rejected request still keeps its increment.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key, window_start)
);
