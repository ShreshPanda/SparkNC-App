# Community Moderation

Community Moderation keeps group collaboration safe by enabling members to report content and giving admins the tools to review, remove, and manage groups.

## Features

- **Report content** — any authenticated member can report a group post with a reason.
- **Review reports** — admins and organization admins see a queue of open reports.
- **Remove content** — moderators can remove posts or lock groups.
- **Manage groups** — moderators can remove entire groups for severe violations.

## Data model

- `group_post_reports` — reports submitted by members.
  - `post_id`, `reporter_id`, `reason`, `details`
  - `status` — `open`, `resolved`, `dismissed`
  - `reviewed_by`, `resolution`
- `moderation_actions` — log of every moderation action.
  - `target_type` — `post` or `group`
  - `action` — `remove`, `warn`, `lock`
  - `moderator_id`, `reason`

## Permissions

- `community.moderate.review` — view and review reports.
- `community.moderate.remove` — remove content and groups.

## API

- `POST /community/reports` — report a post.
- `GET /community/reports` — list reports (moderator).
- `PATCH /community/reports/:id` — update report status (moderator).
- `POST /community/moderate/posts` — apply a moderation action to a post.
- `POST /community/moderate/groups` — remove a group.

## Privacy and safety

- Reports are visible only to users with moderation permissions.
- Moderation actions are logged for audit.
- Removed posts are deleted from `group_posts`; the action record remains for accountability.

## Future work

- Send a notification to the reporter when a report is resolved.
- Escalation workflow to organization admins.
- Automated pre-moderation for high-risk content based on report patterns.
