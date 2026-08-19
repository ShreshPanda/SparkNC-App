-- Production scalability indexes for 1000+ users
PRAGMA foreign_keys = ON;

-- User engagement and streak lookups
CREATE INDEX IF NOT EXISTS idx_users_last_activity_at ON users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_xp_total ON users(xp_total);

-- Task/Goal list ordering per user with creation time for fast recent-first pagination
CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_created_at ON goals(user_id, created_at DESC);

-- Due-date awareness for deadline-driven notifications
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
