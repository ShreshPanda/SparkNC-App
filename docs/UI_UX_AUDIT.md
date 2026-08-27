# SparkNC UI/UX Audit — iOS-First Premium Overhaul

**Project:** SparkNC UI/UX 2.0  
**Goal:** Move from a functional but visually inconsistent MVP to a cohesive, premium, iOS-native App Store-ready experience.  
**Date:** 2026-08-25  
**Auditor:** Cascade

---

## 1. Executive Summary

SparkNC has a solid functional foundation. The backend is real, role-based routing is present, and the core feature set (tasks, goals, growth, portfolio, AI, opportunities, messaging, etc.) is already wired up. The biggest gap today is **visual and interaction consistency**. Every screen implements its own card, button, list row, and spacing patterns. The app does not yet feel like one product; it feels like a collection of screens.

The top priorities for the overhaul are:

1. **Centralized, iOS-aligned design tokens** (color, type, spacing, surfaces, motion).
2. **A shared surface and component library** so every screen reuses the same primitives.
3. **A navigation and header system** that feels native to iPhone.
4. **A dashboard that feels like a personalized home**, not a grid of widgets.
5. **Accessibility and performance regressions fixed** as we polish.

---

## 2. Scope

Audited directories:

- `app/` — all routes, stacks, tab layout
- `components/` — shared components and dashboard sub-components
- `providers/` — Theme, Presentation, Animation, Query
- `theme/` — color, spacing, typography, shadows
- `services/` and `shared/` — data contracts only; not modified

All existing backend functionality, role-based screens, and presentation mode must be preserved. This audit focuses only on presentation and interaction.

---

## 3. Strengths

- **Real backend integration.** No mock data fallbacks in the primary screens. Data flows through `authService`, `cloudflareService`, and `QueryProvider`.
- **Role-based routing is present.** Tab layout uses `href: null` for hidden role tabs; `more.tsx` acts as an overflow.
- **Shared primitives exist.** `SparkCard`, `SparkButton`, `EmptyState`, `AppShell`, `ProgressBar`, `AnimatedNumber`, `FadeIn`, `Confetti` are already extracted.
- **Accessibility is partially implemented.** `accessibilityRole`, `accessibilityLabel`, `accessibilityState` appear in most touched components.
- **Presentation mode is isolated** behind `PresentationProvider` and respected by the tab bar and `AppShell`.
- **Motion is partially present.** `FadeIn`, `AnimatedNumber`, `Confetti`, `SparkButton` scale, haptics, and completion bounce are good starting points.
- **Theme switching is in place.** `ThemeProvider` supports light/dark with real tokens.

---

## 4. Critical Weaknesses

### 4.1 No single source of truth for surfaces

Almost every screen redefines card, row, and input styling. `SparkCard` is a generic rounded card, but screens override `borderRadius`, `padding`, and `borderWidth` locally.

Examples:

- `app/(tabs)/tasks.tsx` — `borderRadius: 12` input, `borderRadius: 16` card, `borderRadius: 12` action buttons.
- `app/(tabs)/goals.tsx` — `borderRadius: 16` card, `borderRadius: 12` suggestion buttons.
- `app/(tabs)/ai.tsx` — `borderRadius: 16` insight cards, `borderRadius: 999` send button, `width: '47%'` grid cells.
- `app/(tabs)/settings.tsx` — `borderRadius: 20` card, `borderRadius: 12` sign-out button.
- `app/(tabs)/growth.tsx` — `width: '30%'` stat pills, `borderRadius: 3` progress, `borderRadius: 7` timeline dots.

This produces slightly different radii, padding, and shadows on every screen, which is the main driver of the “not one product” feeling.

### 4.2 Typography is not used consistently

`typography.ts` already defines a scale, but many screens override `fontSize` and `fontWeight` inline. `dashboard.tsx` sets `greeting: { fontSize: 34 }`, `growth.tsx` uses `fontSize: 20` for pill values, `ai.tsx` sets `insightTitle` to `body + fontWeight: '700'`, etc. The scale is not enforced.

### 4.3 Color semantics are mixed

- `colors.accent` is used for both primary actions and decorative accents, causing brand-color confusion.
- `colors.highlight` (yellow) is used for sign-out in `settings.tsx`, which reads as a success/CTA, not a destructive action.
- `app/(tabs)/ai.tsx` imports the legacy `colors` object from `theme/colors` to set icon pill colors, bypassing the theme.
- `colors.info` was just added to support the new iOS link style; it was missing from the `ThemeColors` type and dark palette, which caused build errors.

### 4.4 Card-heavy information architecture

Most screens wrap every chunk of content in a card. Dashboard, Growth, Settings, and AI all stack cards vertically. The iOS-first direction calls for **surfaces that match the content**, not cards everywhere: plain hero titles, grouped list rows, metric tiles, timeline items, and action surfaces.

### 4.5 AppShell is not yet an iOS header

`components/AppShell.tsx` renders a plain `Text` title at the top with `marginBottom` and a demo pill. It does not support:

- large iOS-style navigation title
- inline subtitle
- back button / leading action
- trailing actions
- translucent/blur header
- search or segmented controls

Every screen reuses the same top-level padding, which makes many screens feel boxed in.

### 4.6 Tab bar is functional but not premium

`app/(tabs)/_layout.tsx` uses a standard Expo `Tabs` with a 84pt height and bold labels. The “More” tab is a catch-all grid of hidden screens, which is not an iOS-native pattern. Active states are color-only and not visually emphasized beyond tint.

### 4.7 Empty states are inconsistent

`components/EmptyState.tsx` uses an icon pill, centered text, and a generic button. Some screens use it, others render plain `<Text>No … yet</Text>`. Button text color inside `EmptyState` uses `colors.foreground` on `colors.accent`, which can fail contrast in some themes.

### 4.8 Feedback and loading states are abrupt

- Most loading is `ActivityIndicator` in the center of the screen.
- No skeleton placeholders except `components/Skeleton.tsx` and `Shimmer.tsx`, which are underused.
- `settings.tsx` shows simultaneous `saving` and `saved` inline text with no transition.
- No reduced-motion gating for animations.

### 4.9 Interaction quality varies

- `SparkButton` has `Vibration.vibrate(30)` on every press, which can feel aggressive.
- List rows in `tasks.tsx` and `goals.tsx` are not individually pressable; they expose explicit buttons that dominate the layout.
- Dashboard task completion uses a scale bounce but no completion haptic.
- No spring-based navigation transitions.

### 4.10 AI screen feels like a generic chat

`app/(tabs)/ai.tsx` is organized as a grid of quick prompts followed by a chat history. It lacks the calm, coach-like hierarchy requested: proactive insight → quick prompts → conversation. Bubble layout is also not message-app native.

### 4.11 Settings and Admin are bare forms

`settings.tsx` is a stack of cards with switches and a yellow sign-out button. It needs iOS-style grouped sections, plain rows, and clear hierarchy. Admin screens likely need the same treatment (not yet inspected in full, but pattern is consistent).

### 4.12 Dashboard hero is better but still too dense

After the recent dashboard simplification, the layout is cleaner, but the iOS-style pass introduced a grouped card. It is a good start, but the dashboard still needs:

- a true “Today’s Spark” hero
- clear separation between hero, progress, focus, and quick access
- better empty/loading state
- more meaningful metric grouping

---

## 5. Duplicated Patterns

| Pattern | Found in | Should become |
|---|---|---|
| Card with border + shadow | Most screens | `SparkCard` variants (elevated, grouped, listRow) |
| Inline form with 2-3 `TextInput`s | `tasks.tsx`, `goals.tsx` | `SparkInput` or a bottom-sheet form |
| Row with check/complete/delete | `tasks.tsx`, `goals.tsx`, `dashboard.tsx` | `SparkListRow` with swipe/press actions |
| Stat/value pill | `growth.tsx`, `dashboard.tsx` | `SparkMetric` tile |
| Timeline dot/stem | `growth.tsx`, `journey.tsx` (assumed) | `SparkTimeline` |
| Quick-action insight card | `ai.tsx`, `dashboard.tsx` | `SparkInsight` |
| Progress bar + label | `growth.tsx`, `goals.tsx`, `dashboard.tsx` | `SparkProgress` |
| Empty state with icon + text | Several | `SparkEmptyState` (consistent style) |
| `ActivityIndicator` loading | Several | `SparkSkeleton` or section-aware loading |

---

## 6. Screens Needing the Most Work

In order of effort and impact:

1. **Dashboard** — highest ROI; needs a true home surface, Today’s Spark, and metric hierarchy.
2. **Tasks & Goals** — need native list rows, faster completion, and better empty states.
3. **AI** — needs to feel like a coach, not a chatbot.
4. **Growth / Journey / Portfolio** — need storytelling hierarchy and less card density.
5. **Settings** — needs iOS grouped-table treatment.
6. **Navigation / AppShell** — affects every screen; should be done early.
7. **Ambassador / Leadership / Admin** — last, because they can inherit the new primitives once built.

---

## 7. Recommended Design System

A single design-system package inside `theme/` and `components/`:

- `theme/colors.ts` — semantic color tokens aligned with the new SparkNC brand.
- `theme/typography.ts` — iOS-style hierarchy (Large Title, Title, Headline, Body, Callout, etc.) plus legacy aliases.
- `theme/spacing.ts` — 4-48pt scale plus `radius` and `shadows`.
- `theme/motion.ts` — duration, easing, and spring presets (new).
- `theme/surfaces.ts` — style maps for hero, elevated, listRow, metric, timeline, action, glass (new).
- `components/Spark*` — a complete shared library.

---

## 8. Component Changes

### Keep and evolve

- `SparkCard` — split into `elevated`, `grouped`, `listRow` variants; remove one-off overrides.
- `SparkButton` — refine variants; reduce vibration; add `default` iOS blue style.
- `AppShell` — evolve into `SparkHeader` + safe-area shell with iOS large titles and action slots.
- `EmptyState` — improve contrast, add CTA, and use semantic colors.
- `ProgressBar` — keep, rename/re-export as `SparkProgress`.
- `AnimatedNumber` — keep, use in metric tiles.
- `FadeIn` — keep, add `slideUp` and `layout` variants.

### Add new

- `SparkListRow` — pressable tappable row with chevron, leading icon, and trailing detail.
- `SparkMetric` — numeric tile with label, optional trend, and micro-animation.
- `SparkHero` — large insight/hero surface for Today’s Spark.
- `SparkSection` — grouped section with iOS-style header and divider-aware rows.
- `SparkInsight` — a quick action/insight pill.
- `SparkChip` / `SparkBadge` — for categories, status, and priority.
- `SparkAvatar` — for messages, community, and profile.
- `SparkSheet` — for bottom-sheet forms and modal flows.
- `SparkSkeleton` — replace center loaders.
- `SparkEmptyState` — wrapper around `EmptyState` with consistent CTA.

### Avoid

- `GlassCard` — keep for overlays/presentation only; do not use for primary content.
- `XPWidget`, `StreakWidget` — fold into `SparkMetric` tiles.

---

## 9. Navigation Recommendations

- Keep Expo Router; do not add `NavigationContainer`.
- Keep `RootLayout` as-is but enhance `Tabs` appearance.
- Move hidden-role screens from the catch-all “More” tab into **role-aware tab bars** or a `More` sheet.
- Add `presentation` support to the tab bar (already present; refine styling).
- Add `SparkHeader` with large-title support for stack screens.
- Use `router.push()` and `router.back()` consistently; prefer modal presentation for forms.

---

## 10. Animation & Motion

- Introduce a shared `motion.ts` with three durations: `fast` (150ms), `medium` (300ms), `slow` (500ms).
- Use spring for card/hero entry, ease for opacity, ease-out for navigation.
- Add `ReduceMotion` check before running large animations.
- Replace `Vibration` on every `SparkButton` press with lighter haptics on **meaningful** actions only.
- Use layout animations for list insert/delete where possible.

---

## 11. Accessibility Considerations

- Minimum 44×44 point touch targets.
- Use `accessibilityRole` and `accessibilityLabel` consistently.
- Add `accessibilityHint` for non-obvious actions.
- Respect `useReducedMotion` from `AnimationProvider` (or add it).
- Ensure `colors.info` / `colors.primary` meet contrast on both light and dark backgrounds.
- Test focus order in stack modals and sheets.

---

## 12. Performance Considerations

- Memoize heavy list renders with `React.memo` where it provides value.
- Avoid inline style objects in list rows; use `StyleSheet`.
- Keep `Promise.all` for parallel API calls.
- Images/avatars should use `contentFit` and not block layout.
- Do not increase bundle size with new third-party UI libraries; prefer existing primitives.

---

## 13. Files with Inline Styles to Fix

High-priority cleanup (sample, not exhaustive):

- `app/(tabs)/tasks.tsx` — hardcoded `borderRadius: 12/16`, action buttons, `colors.white` text.
- `app/(tabs)/goals.tsx` — hardcoded `borderRadius: 16/12`, inline `colors.highlight + '20'` alpha hack.
- `app/(tabs)/ai.tsx` — hardcoded `width: '47%'`, `borderRadius: 16/4/999`, chat bubbles.
- `app/(tabs)/settings.tsx` — `borderRadius: 20/12`, yellow sign-out, no row component.
- `app/(tabs)/growth.tsx` — `width: '30%'`, `fontSize: 20`, `borderRadius: 3/4/7`.
- `app/(tabs)/dashboard.tsx` — mostly tokenized after recent pass, but still custom hero/priority styles.

A full visual consistency pass will search for all `borderRadius:`, `fontSize:`, and `padding:` inline values after the component system is built.

---

## 14. Conclusion

SparkNC is not a broken app; it is a feature-complete app that needs a **cohesive presentation layer**. The most important work is to give every screen the same surface language, typography, color semantics, and motion. The audit suggests a phased approach, starting with the shared design system and navigation, then the Dashboard, then the remaining high-touch screens.

The next artifact should be the updated design-system document, followed by token implementation and the `Spark*` component library.
