-- Sprint 9 Phase 2 — Production performance indexes
PRAGMA foreign_keys = ON;

-- Journey and portfolio lookups
CREATE INDEX IF NOT EXISTS idx_journey_events_user_date ON journey_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journey_events_user_category ON journey_events(user_id, category);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_type ON portfolio(user_id, type);

-- Delight and spark moments
CREATE INDEX IF NOT EXISTS idx_delight_events_user_type ON delight_events(user_id, type);
CREATE INDEX IF NOT EXISTS idx_delight_events_created ON delight_events(created_at);

-- Activity and engagement high-traffic lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_sent ON notifications(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read_status);

-- School/location scoped analytics
CREATE INDEX IF NOT EXISTS idx_users_school_location_role ON users(school_id, location_id, role);
CREATE INDEX IF NOT EXISTS idx_users_organization_role ON users(organization_id, role);

-- Events and attendance
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_user ON event_attendees(event_id, user_id);

-- Audit log for compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Message threads
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_threads_participants ON message_thread_participants(thread_id, user_id);
