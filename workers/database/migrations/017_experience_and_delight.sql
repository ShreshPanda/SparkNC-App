-- Sprint 8: Experience, delight, and portfolio tables.

CREATE TABLE IF NOT EXISTS journey_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  badge TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journey_events_user_date ON journey_events(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journey_events_category ON journey_events(user_id, category);

CREATE TABLE IF NOT EXISTS portfolio (
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  metadata TEXT,
  PRIMARY KEY (user_id, type, id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user_type ON portfolio(user_id, type);
CREATE INDEX IF NOT EXISTS idx_portfolio_date ON portfolio(user_id, date DESC);

CREATE TABLE IF NOT EXISTS delight_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  delivered_at TEXT NOT NULL,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_delight_events_user ON delight_events(user_id, delivered_at DESC);
