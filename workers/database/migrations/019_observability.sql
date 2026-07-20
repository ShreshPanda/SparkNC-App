-- Sprint 9 Phase 6 — Observability tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS request_metrics (
  id TEXT PRIMARY KEY,
  request_id TEXT,
  method TEXT,
  path TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  user_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_request_metrics_path_created ON request_metrics(path, created_at);
CREATE INDEX IF NOT EXISTS idx_request_metrics_status ON request_metrics(status_code, created_at);

CREATE TABLE IF NOT EXISTS slow_queries (
  id TEXT PRIMARY KEY,
  operation TEXT,
  query TEXT,
  duration_ms INTEGER,
  request_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slow_queries_operation_created ON slow_queries(operation, created_at);

CREATE TABLE IF NOT EXISTS error_logs (
  id TEXT PRIMARY KEY,
  request_id TEXT,
  path TEXT,
  method TEXT,
  message TEXT,
  stack TEXT,
  user_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_logs_path_created ON error_logs(path, created_at);
