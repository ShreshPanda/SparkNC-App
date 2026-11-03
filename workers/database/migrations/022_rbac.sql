-- S2 RBAC reconciliation: additive + idempotent.
-- Adds the missing lab_leader/board_member role rows and merges new
-- permission strings into existing roles. Each permission is appended by
-- a separately guarded json_insert: it preserves legacy/custom grants and
-- re-running produces no changes. (Written without compound SELECTs —
-- D1 rejects files whose UNION-compound statements exceed its term limit.)
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO roles (id, name, permissions, created_at, updated_at) VALUES
('role_lab_leader', 'lab_leader', '["messages.send","messages.read","events.read"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_board_member', 'board_member', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- student: adds messaging send + achievements + community participation.
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'messages.send') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'messages.send');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'student.achievements.read') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'student.achievements.read');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'student.achievements.update') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'student.achievements.update');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.groups.join') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.groups.join');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.posts.read') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.posts.read');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.posts.create') WHERE name = 'student'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.posts.create');

-- ambassador: adds messaging send + ambassador route permissions + community participation.
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'messages.send') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'messages.send');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'ambassador.dashboard.read') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'ambassador.dashboard.read');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'ambassador.students.read') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'ambassador.students.read');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'ambassador.support.view') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'ambassador.support.view');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'ambassador.support.message') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'ambassador.support.message');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.groups.join') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.groups.join');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.posts.read') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.posts.read');
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'community.posts.create') WHERE name = 'ambassador'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'community.posts.create');

-- location_manager: adds messaging send only (already has events/announcements.manage).
UPDATE roles SET permissions = json_insert(permissions, '$[#]', 'messages.send') WHERE name = 'location_manager'
  AND NOT EXISTS (SELECT 1 FROM json_each(permissions) WHERE value = 'messages.send');

-- lab_leader/board_member rows created above; admin keeps ["*"] untouched.
