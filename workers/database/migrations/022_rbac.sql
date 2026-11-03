-- S2 RBAC reconciliation: additive + idempotent.
-- Adds the missing lab_leader/board_member role rows and merges new
-- permission strings into existing roles via UNION (json_each + DISTINCT
-- semantics) so legacy/custom grants are preserved. Re-running produces
-- no changes.
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO roles (id, name, permissions, created_at, updated_at) VALUES
('role_lab_leader', 'lab_leader', '["messages.send","messages.read","events.read"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_board_member', 'board_member', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- student: adds messaging send + achievements + community participation.
UPDATE roles SET permissions = (
  SELECT json_group_array(value) FROM (
    SELECT value FROM json_each(permissions)
    UNION
    SELECT 'messages.send'
    UNION SELECT 'student.achievements.read'
    UNION SELECT 'student.achievements.update'
    UNION SELECT 'community.groups.join'
    UNION SELECT 'community.posts.read'
    UNION SELECT 'community.posts.create'
  )
) WHERE name = 'student';

-- ambassador: adds messaging send + ambassador route permissions + community participation.
UPDATE roles SET permissions = (
  SELECT json_group_array(value) FROM (
    SELECT value FROM json_each(permissions)
    UNION
    SELECT 'messages.send'
    UNION SELECT 'ambassador.dashboard.read'
    UNION SELECT 'ambassador.students.read'
    UNION SELECT 'ambassador.support.view'
    UNION SELECT 'ambassador.support.message'
    UNION SELECT 'community.groups.join'
    UNION SELECT 'community.posts.read'
    UNION SELECT 'community.posts.create'
  )
) WHERE name = 'ambassador';

-- location_manager: adds messaging send only (already has events/announcements.manage).
UPDATE roles SET permissions = (
  SELECT json_group_array(value) FROM (
    SELECT value FROM json_each(permissions)
    UNION
    SELECT 'messages.send'
  )
) WHERE name = 'location_manager';

-- lab_leader/board_member rows created above; admin keeps ["*"] untouched.
