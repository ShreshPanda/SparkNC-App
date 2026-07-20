-- Sprint 9 Phase 9 — Spark Moments
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS spark_moments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_threshold INTEGER,
  goals_threshold INTEGER,
  tasks_threshold INTEGER,
  community_threshold INTEGER,
  streak_threshold INTEGER,
  triggered_at TEXT,
  acknowledged_at TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spark_moments_user_type ON spark_moments(user_id, type);
CREATE INDEX IF NOT EXISTS idx_spark_moments_triggered ON spark_moments(user_id, triggered_at);

CREATE TABLE IF NOT EXISTS spark_moment_triggers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  moment_id TEXT NOT NULL,
  triggered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (moment_id) REFERENCES spark_moments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spark_moment_triggers_user ON spark_moment_triggers(user_id, moment_id);
