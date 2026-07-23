-- Sprint 6 Phase 8 — Performance optimization indexes
PRAGMA foreign_keys = ON;

-- Existing tables from earlier migrations; add missing high-traffic indexes.
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_goals_user_completed ON goals(user_id, completed);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON messages(recipient_id, read_status);

CREATE INDEX IF NOT EXISTS idx_growth_events_user_type ON growth_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_growth_events_user_time ON growth_events(user_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON student_feedback(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_insights_type_created ON feedback_insights(insight_type, created_at);

CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date, scope, scope_id);

CREATE INDEX IF NOT EXISTS idx_group_posts_created ON group_posts(group_id, created_at);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
