# Route Inventory (S2 audit artifact)
Generated from workers/api/routes/*.ts. Columns: method, path, auth class, permission, ownership, scope enforcement, evidence.
Auth classes: PUBLIC (no session), AUTH (authenticated() in workers/index.ts), PERM (authenticated + requirePermission).
Infra endpoints handled before dispatch: GET /health, /version, /status (public, bypass env validation).

| Method | Path | Auth | Permission | Ownership | Scope | Evidence |
|---|---|---|---|---|---|---|
| GET | /achievements | PERM | student.achievements.read | userId-scoped | - | routes/achievements.ts |
| POST | /achievements/check | PERM | student.achievements.update | userId-scoped | - | routes/achievements.ts |
| GET | /achievements/recognition | PERM | student.achievements.read | userId-scoped | - | routes/achievements.ts |
| POST | /activity/session | AUTH | - | userId-scoped | - | routes/activity.ts |
| GET | /activity/stats | AUTH | - | userId-scoped | - | routes/activity.ts |
| POST | /admin/announcements | PERM | admin.announcements.create | role-permission | - | routes/admin.ts |
| POST | /admin/events | PERM | admin.events.create | role-permission | - | routes/admin.ts |
| GET | /admin/overview | PERM | admin.overview.read | role-permission | - | routes/admin.ts |
| GET | /admin/program-analytics | PERM | admin.analytics.read | role-permission | - | routes/admin.ts |
| GET | /admin/student-support | PERM | admin.students.support | role-permission | - | routes/admin.ts |
| GET | /admin/users | PERM | admin.users.read | role-permission | - | routes/admin.ts |
| POST | /ai/chat | AUTH | - | userId-scoped | - | routes/ai.ts |
| POST | /ai/growth | AUTH | - | userId-scoped | - | routes/ai.ts |
| GET | /ai/memory | AUTH | - | userId-scoped | - | routes/aiMemory.ts |
| POST | /ai/memory | AUTH | - | userId-scoped | - | routes/aiMemory.ts |
| DELETE | /ai/memory/:id | AUTH | - | userId-scoped | - | routes/aiMemory.ts |
| PATCH | /ai/memory/:id/disable | AUTH | - | userId-scoped | - | routes/aiMemory.ts |
| POST | /ai/plan | AUTH | - | userId-scoped | - | routes/ai.ts |
| POST | /ai/recommend | AUTH | - | userId-scoped | - | routes/ai.ts |
| POST | /ai/reflect | AUTH | - | userId-scoped | - | routes/ai.ts |
| GET | /ambassador/command-center | PERM | ambassador.students.read | role-permission | ambassador_assignments | routes/ambassador.ts |
| GET | /ambassador/dashboard | PERM | ambassador.dashboard.read | role-permission | ambassador_assignments | routes/ambassador.ts |
| GET | /ambassador/feedback | AUTH | - | userId-scoped | ambassador_assignments | routes/ambassadorFeedback.ts |
| POST | /ambassador/feedback | AUTH | - | userId-scoped | ambassador_assignments | routes/ambassadorFeedback.ts |
| GET | /ambassador/student-support | PERM | ambassador.support.view | role-permission | ambassador_assignments | routes/ambassadorSupport.ts |
| POST | /ambassador/student-support | PERM | ambassador.support.message | role-permission | ambassador_assignments | routes/ambassadorSupport.ts |
| GET | /analytics/engagement | PERM | admin.analytics.view | role-permission | - | routes/engagementAnalytics.ts |
| GET | /analytics/features | PERM | admin.analytics.view | role-permission | - | routes/engagementAnalytics.ts |
| GET | /analytics/overview | AUTH | - | role-permission | - | routes/analytics.ts |
| GET | /analytics/retention | PERM | admin.analytics.view | role-permission | - | routes/engagementAnalytics.ts |
| GET | /analytics/school/:id | AUTH | - | role-permission | ⚠ no caller-school match (admin-only) | routes/analytics.ts |
| POST | /analytics/snapshot/organization | AUTH | - | role-permission | - | routes/analytics.ts |
| POST | /analytics/snapshot/school/:id | AUTH | - | role-permission | - | routes/analytics.ts |
| GET | /announcements | AUTH | - | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| POST | /announcements | PERM | announcements.manage | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| DELETE | /announcements/:id | PERM | announcements.manage | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| GET | /announcements/:id | AUTH | - | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| PUT | /announcements/:id | PERM | announcements.manage | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| POST | /announcements/:id/read | AUTH | - | audience/membership | isVisible school filter + scoped-role write check (S2d) | routes/announcements.ts |
| GET | /audit | AUTH | - | role-permission | - | routes/audit.ts |
| POST | /audit | AUTH | - | role-permission | - | routes/audit.ts |
| POST | /auth/login | PUBLIC | - | - | - | routes/auth.ts |
| POST | /auth/logout | PUBLIC | - | - | - | routes/auth.ts |
| GET | /auth/me | AUTH | - | - | - | routes/auth.ts |
| POST | /auth/register | PUBLIC | - | - | - | routes/auth.ts |
| GET | /community/groups | AUTH | - | audience/membership | group membership (isMember) | routes/community.ts |
| POST | /community/groups | PERM | community.groups.create | audience/membership | group membership (isMember) | routes/community.ts |
| POST | /community/groups/:id/join | PERM | community.groups.join | audience/membership | group membership (isMember) | routes/community.ts |
| GET | /community/groups/:id/posts | PERM | community.posts.read | audience/membership | group membership (isMember) | routes/community.ts |
| POST | /community/groups/:id/posts | PERM | community.posts.create | audience/membership | group membership (isMember) | routes/community.ts |
| POST | /community/moderate/groups | PERM | community.moderate.remove | audience/membership | group membership (isMember) | routes/communityModeration.ts |
| POST | /community/moderate/posts | PERM | community.moderate.remove | audience/membership | group membership (isMember) | routes/communityModeration.ts |
| GET | /community/reports | PERM | community.moderate.review | audience/membership | group membership (isMember) | routes/communityModeration.ts |
| POST | /community/reports | AUTH | - | audience/membership | group membership (isMember) | routes/communityModeration.ts |
| PATCH | /community/reports/:id | PERM | community.moderate.review | audience/membership | group membership (isMember) | routes/communityModeration.ts |
| GET | /conversations | AUTH | - | conversation_participants pair | - | routes/messages.ts |
| GET | /conversations/:id | AUTH | - | conversation_participants pair | - | routes/messages.ts |
| GET | /conversations/:id/messages | AUTH | - | conversation_participants pair | - | routes/messages.ts |
| POST | /conversations/:id/read | AUTH | - | conversation_participants pair | - | routes/messages.ts |
| GET | /delight | AUTH | - | userId-scoped | - | routes/delight.ts |
| GET | /demo | PUBLIC | - | role-permission | - | routes/demo.ts |
| POST | /demo/seed | PUBLIC | - | role-permission | - | routes/demoSeed.ts |
| GET | /events | AUTH | - | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| POST | /events | PERM | events.manage | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| DELETE | /events/:id | PERM | events.manage | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| GET | /events/:id | AUTH | - | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| PUT | /events/:id | PERM | events.manage | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| GET | /events/:id/attendees | PERM | events.manage | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| POST | /events/:id/register | AUTH | - | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| POST | /events/:id/unregister | AUTH | - | audience/membership | school_id audience filter + scoped-role write check (S2d) | routes/events.ts |
| GET | /executive/dashboard | PERM | admin.executive.view | role-permission | - | routes/executive.ts |
| GET | /feature-requests | AUTH | - | userId-scoped | - | routes/featureRequests.ts |
| POST | /feature-requests | AUTH | - | userId-scoped | - | routes/featureRequests.ts |
| POST | /feature-requests/:id/status | AUTH | - | userId-scoped | - | routes/featureRequests.ts |
| POST | /feature-requests/:id/vote | AUTH | - | userId-scoped | - | routes/featureRequests.ts |
| GET | /feedback | AUTH | - | userId-scoped | - | routes/feedback.ts |
| POST | /feedback | AUTH | - | userId-scoped | - | routes/feedback.ts |
| GET | /feedback/all | AUTH | - | userId-scoped | - | routes/feedback.ts |
| POST | /feedback/analyze | AUTH | - | userId-scoped | - | routes/feedbackAnalysis.ts |
| GET | /feedback/insights | AUTH | - | userId-scoped | - | routes/feedbackAnalysis.ts |
| GET | /goals | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| POST | /goals | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| DELETE | /goals/:id | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| GET | /goals/:id | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| PUT | /goals/:id | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| POST | /goals/:id/complete | AUTH | - | user_id scoped (repository) | - | routes/goals.ts |
| GET | /growth-timeline | AUTH | - | userId-scoped | - | routes/growth.ts |
| POST | /growth-timeline/generate | AUTH | - | userId-scoped | - | routes/growth.ts |
| GET | /growth-timeline/stats | AUTH | - | userId-scoped | - | routes/growth.ts |
| GET | /growth-timeline/story | AUTH | - | userId-scoped | - | routes/growth.ts |
| GET | /impact-analytics | AUTH | - | role-permission | - | routes/impactAnalytics.ts |
| GET | /impact-reports | AUTH | - | role-permission | - | routes/impactReports.ts |
| POST | /impact-reports/generate | AUTH | - | role-permission | - | routes/impactReports.ts |
| GET | /insights | AUTH | - | userId-scoped | - | routes/insights.ts |
| GET | /insights/dashboard | AUTH | - | userId-scoped | - | routes/insights.ts |
| POST | /insights/generate | AUTH | - | userId-scoped | - | routes/insights.ts |
| GET | /journey | AUTH | - | userId-scoped | - | routes/journey.ts |
| POST | /messages | PERM | messages.send | conversation_participants pair | - | routes/messages.ts |
| GET | /metrics | PERM | admin.executive.view | role-permission | - | routes/metrics.ts |
| GET | /notifications | AUTH | - | userId-scoped | - | routes/notifications.ts |
| POST | /notifications | PERM | notifications.send | userId-scoped | - | routes/notifications.ts |
| POST | /notifications/:id/read | AUTH | - | userId-scoped | - | routes/notifications.ts |
| POST | /notifications/generate | AUTH | - | userId-scoped | - | routes/notifications.ts |
| GET | /notifications/preferences | AUTH | - | userId-scoped | - | routes/notifications.ts |
| POST | /notifications/preferences | AUTH | - | userId-scoped | - | routes/notifications.ts |
| POST | /notifications/read-all | AUTH | - | userId-scoped | - | routes/notifications.ts |
| GET | /notifications/schedule | AUTH | - | userId-scoped | - | routes/notifications.ts |
| GET | /onboarding | AUTH | - | userId-scoped | - | routes/onboarding.ts |
| POST | /onboarding | AUTH | - | userId-scoped | - | routes/onboarding.ts |
| GET | /onboarding/complete | AUTH | - | userId-scoped | - | routes/onboarding.ts |
| GET | /opportunities | AUTH | - | userId-scoped | - | routes/opportunities.ts |
| GET | /pilot/groups | PERM | pilot.manage | role-permission | - | routes/pilot.ts |
| POST | /pilot/groups | PERM | pilot.manage | role-permission | - | routes/pilot.ts |
| GET | /pilot/me | AUTH | - | userId-scoped | - | routes/pilot.ts |
| GET | /pilot/operations | PERM | admin.pilot.view | role-permission | - | routes/pilotOperations.ts |
| GET | /pilot/participants | PERM | pilot.manage | role-permission | - | routes/pilot.ts |
| POST | /pilot/participants | PERM | pilot.manage | role-permission | - | routes/pilot.ts |
| PATCH | /pilot/participants/:id | PERM | pilot.manage | role-permission | - | routes/pilot.ts |
| GET | /portfolio | AUTH | - | userId-scoped | - | routes/portfolio.ts |
| GET | /recommendations | AUTH | - | userId-scoped | - | routes/improvementRecommendations.ts |
| POST | /recommendations/:id/status | AUTH | - | userId-scoped | - | routes/improvementRecommendations.ts |
| POST | /recommendations/generate | AUTH | - | userId-scoped | - | routes/improvementRecommendations.ts |
| GET | /schools/:id | AUTH | - | role-permission | - | routes/schools.ts |
| GET | /spark-moments | AUTH | - | userId-scoped | - | routes/sparkMoments.ts |
| POST | /spark-moments/trigger | AUTH | - | userId-scoped | - | routes/sparkMoments.ts |
| GET | /tasks | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| POST | /tasks | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| DELETE | /tasks/:id | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| GET | /tasks/:id | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| PUT | /tasks/:id | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| POST | /tasks/:id/complete | AUTH | - | user_id scoped (repository) | - | routes/tasks.ts |
| GET | /users/:id | AUTH | - | stub (no data) | - | routes/users.ts |

Total: 132 dispatched routes + 3 infra endpoints.
