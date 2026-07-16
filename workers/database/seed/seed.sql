INSERT OR IGNORE INTO schools (id, name, slug, city, country, created_at, updated_at) VALUES
('school-demo', 'SparkNC Demo School', 'sparknc-demo', 'New York', 'US', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR IGNORE INTO roles (id, name, description, permissions, created_at, updated_at) VALUES
('role-student', 'student', 'Student access to personal planning and messaging', '["read","write"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
('role-ambassador', 'ambassador', 'Ambassador access to programs and community events', '["read","write","manage"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
('role-lab-leader', 'lab_leader', 'Lab leader access to team oversight and activity tracking', '["read","write","manage"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
('role-location-manager', 'location_manager', 'Location manager access to school and event management', '["read","write","manage"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
('role-board-member', 'board_member', 'Board member access to governance and reporting', '["read","write","manage"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
('role-admin', 'admin', 'Full administrative access', '["read","write","manage","admin"]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR IGNORE INTO users (id, email, name, role, school_id, avatar_url, is_active, created_at, updated_at) VALUES
('demo-admin', 'admin@sparknc.app', 'SparkNC Admin', 'admin', 'school-demo', null, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
