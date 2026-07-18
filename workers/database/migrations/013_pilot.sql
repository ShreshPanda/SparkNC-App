-- Sprint 7: Pilot user management for controlled real-world testing.
CREATE TABLE IF NOT EXISTS pilot_users (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pilot_group TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pilot_users_user_id ON pilot_users(user_id);
CREATE INDEX IF NOT EXISTS idx_pilot_users_group ON pilot_users(pilot_group);
CREATE INDEX IF NOT EXISTS idx_pilot_users_status ON pilot_users(status);
