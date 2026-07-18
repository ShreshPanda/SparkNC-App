-- SparkNC D1 feedback and continuous improvement layer for Sprint 4.5
PRAGMA foreign_keys = ON;

-- Student feedback, check-ins, and feature suggestions
CREATE TABLE IF NOT EXISTS student_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  rating INTEGER,
  feedback_text TEXT,
  sentiment TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_feedback_user ON student_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_category ON student_feedback(category, created_at);

-- Ambassador observations and recommendations
CREATE TABLE IF NOT EXISTS ambassador_feedback (
  id TEXT PRIMARY KEY,
  ambassador_id TEXT NOT NULL,
  student_id TEXT,
  category TEXT NOT NULL,
  observation TEXT NOT NULL,
  suggested_improvement TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ambassador_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ambassador_feedback_ambassador ON ambassador_feedback(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_feedback_category ON ambassador_feedback(category, created_at);

-- Feature request / improvement board
CREATE TABLE IF NOT EXISTS feature_requests (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Submitted',
  created_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category, votes);

-- Insights derived from feedback and activity
CREATE TABLE IF NOT EXISTS feedback_insights (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  scope_id TEXT,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_insights_scope ON feedback_insights(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_feedback_insights_type ON feedback_insights(insight_type, created_at);

-- Generated impact and monthly reports
CREATE TABLE IF NOT EXISTS impact_reports (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  scope_id TEXT,
  report_type TEXT NOT NULL,
  period_start TEXT,
  period_end TEXT,
  metrics TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_impact_reports_scope ON impact_reports(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_impact_reports_type ON impact_reports(report_type, created_at);

-- Continuous improvement recommendations
CREATE TABLE IF NOT EXISTS improvement_recommendations (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  scope_id TEXT,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_improvement_recommendations_scope ON improvement_recommendations(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_improvement_recommendations_status ON improvement_recommendations(status, created_at);
