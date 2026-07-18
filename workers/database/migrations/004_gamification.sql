-- SparkNC D1 gamification columns for users, tasks, and goals
PRAGMA foreign_keys = ON;

-- User XP and streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_total INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TEXT;

-- Task completion / reward columns (idempotent in case the initial schema already defines them)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS xp_reward INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT;

-- Goal completion / reward columns (idempotent in case the initial schema already defines them)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS completed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS xp_reward INTEGER NOT NULL DEFAULT 0;
