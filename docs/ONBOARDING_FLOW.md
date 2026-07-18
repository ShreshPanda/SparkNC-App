# Onboarding Flow

The onboarding flow captures a student's goals, interests, growth areas, and preferred support style so that SparkNC can personalize the dashboard, AI companion, goals, and notifications.

## Collected data

- **Goals** — short-term objectives the student wants to focus on.
- **Interests** — topics or activities the student cares about.
- **Growth areas** — skills or habits they want to improve.
- **Support style** — `gentle`, `direct`, `structured`, or `casual`. Used to tune AI companion tone and notification phrasing.

## Data model

Table `onboarding_profiles` stores one profile per user. JSON arrays are stringified for D1 compatibility.

## Personalization

- `OnboardingService.personalizePrompt()` supplies the AI companion with the user's goals, growth areas, and support style.
- Goals seed the initial goals list if the user has not created any.
- Interests can be used to filter events, community groups, and recommendations.
- Support style is stored for future notification-tone and coaching-tone configuration.

## API

- `POST /onboarding` — save or update the profile.
- `GET /onboarding/me` — get current user's profile.
- `GET /onboarding/complete` — check whether onboarding is finished.

## Frontend flow

The onboarding screen is located at `app/onboarding.tsx`. It collects inputs across a few steps and submits the complete profile at the end. The app can route new users to `/onboarding` until `completedAt` is set.

## Privacy

Onboarding data is owned by the student, never used for classification or profiling, and never shared with ambassadors or admins beyond high-level interest tags if explicitly consented.
