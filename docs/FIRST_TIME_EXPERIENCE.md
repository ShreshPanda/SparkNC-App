# First-Time Experience

This document captures the onboarding-critical first five minutes of SparkNC.

## Entry points

- `app/(auth)/signup.tsx` — account creation
- `app/(auth)/login.tsx` — authentication
- `app/onboarding.tsx` — personalization flow
- `app/(tabs)/dashboard.tsx` — first home view
- `app/(tabs)/tasks.tsx` — first action suggestion
- `app/(tabs)/goals.tsx` — first goal creation
- `app/(tabs)/ai.tsx` — first AI companion interaction
- `app/(tabs)/achievements.tsx` — first recognition

## Review findings

### Signup / Login
- Clear CTAs and input labels.
- Password visibility toggle should be added.
- Loading and error states need alignment with design tokens.

### Onboarding
- `app/onboarding.tsx` collects goals, interests, growth areas, and support style.
- Needs to be wired to `POST /onboarding`.
- Needs progress indicator and skip option.
- Celebration should fire on completion.

### Dashboard
- `GrowthDashboard` widgets provide a rich first impression once wired.
- Empty states should explain the value of the next action.

### First task / goal
- Quick-create affordances should be visible above the fold.
- Default suggestions lower friction.

### First AI interaction
- Greet with the student's name and support style.
- Suggest goal-based questions.

### First achievement
- Show a small overlay and feed item.
- Helps students feel progress immediately.

## Recommendations

1. Wire `app/onboarding.tsx` to `cloudflareService`.
2. Add `CelebrationOverlay` after completing onboarding and first goal.
3. Add progress indicator to onboarding.
4. Default the first AI message to a goal-driven prompt.
5. Ensure empty states have a primary CTA.

## Success metric

A new user should be able to create an account, complete onboarding, view a personalized dashboard, and complete or create a goal within five minutes.
