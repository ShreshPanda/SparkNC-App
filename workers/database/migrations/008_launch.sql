-- Sprint 5 Launch Quality & Scale additions

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  send_deadlines INTEGER NOT NULL DEFAULT 1,
  send_streak_alerts INTEGER NOT NULL DEFAULT 1,
  send_events INTEGER NOT NULL DEFAULT 1,
  send_messages INTEGER NOT NULL DEFAULT 1,
  send_recommendations INTEGER NOT NULL DEFAULT 1,
  quiet_hours_start INTEGER NOT NULL DEFAULT 22,
  quiet_hours_end INTEGER NOT NULL DEFAULT 8,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
