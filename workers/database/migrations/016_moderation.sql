-- Sprint 7: Community moderation and content reporting.
CREATE TABLE IF NOT EXISTS group_post_reports (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  reviewed_by TEXT,
  resolution TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_group_post_reports_post_id ON group_post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_reports_status ON group_post_reports(status);
CREATE INDEX IF NOT EXISTS idx_group_post_reports_reporter ON group_post_reports(reporter_id);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  action TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_type, target_id);
