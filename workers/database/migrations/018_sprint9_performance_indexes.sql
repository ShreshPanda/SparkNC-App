-- Sprint 9 Phase 2 — Production performance indexes
PRAGMA foreign_keys = ON;

-- Journey and portfolio lookups
CREATE INDEX IF NOT EXISTS idx_journey_events_user_date ON journey_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journey_events_user_category ON journey_events(user_id, category);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_type ON portfolio(user_id, type);

-- Activity and engagement high-traffic lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type_created ON activity_logs(activity_type, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- School scoped analytics
CREATE INDEX IF NOT EXISTS idx_users_school_role ON users(school_id, role);

-- Events and attendance
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_user ON event_attendees(event_id, user_id);

-- Audit log for compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action ON audit_logs(actor_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Conversation threads
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_pair ON conversation_participants(conversation_id, user_id);
