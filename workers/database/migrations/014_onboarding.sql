-- Sprint 7: Onboarding profiles to personalize the first-time experience.
CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  goals TEXT, -- JSON array of goal strings
  interests TEXT, -- JSON array of interests
  growth_areas TEXT, -- JSON array of growth area strings
  support_style TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user_id ON onboarding_profiles(user_id);
