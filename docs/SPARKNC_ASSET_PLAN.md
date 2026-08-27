# SparkNC Asset Plan

**Project:** SparkNC v1 — Visual & UX Redesign Phase 0  
**Date:** 2026-08-26  
**Status:** Design-only blueprint

---

## 1. Purpose

This document defines the visual assets needed for SparkNC. Assets should be built in code where possible (CSS gradients, SVG shapes, React Native Views) so they scale across devices and themes. Only a few illustrative moments may require images.

---

## 2. Asset Principles

- Prefer **code-generated assets** over static images.
- All assets must work in **light and dark mode**.
- All assets must respect `prefers-reduced-motion`.
- No generic stock illustrations.
- Every asset must have a clear purpose and named file/identifier.

## 2.1 Phase 9 Asset Pass — Implementation Status

Completed `2026-08-27`.

**Created**
- `components/visual/EmptyIllustration.tsx` — code-generated empty-state visuals (React Native Views, no SVG or images).
  - `EmptyTasksIllustration` for `app/(tabs)/dashboard.tsx` (Home).
  - `EmptyGrowthIllustration` for `app/(tabs)/growth.tsx`.
  - `EmptyJourneyIllustration` for `app/(tabs)/journey.tsx`.
  - `EmptyPortfolioIllustration` for `app/(tabs)/portfolio.tsx`.
  - `EmptyAchievementsIllustration` for `app/(tabs)/achievements.tsx`.
- `SparkEmptyState` now supports an optional `illustration` prop (in addition to `icon`) for larger abstract visuals.

**Reused**
- Existing `SparkOrb`, `SparkProgressRing`, `SparkGlow`, `SparkBackground`, `SparkAvatar`, `SparkBadge` — already in place for AI, Growth, Progress, and identity screens.
- Existing `icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png` — app icon/splash already meet the vector logo intent at the required export sizes.

**Intentionally not created**
- No `SparkProgressPath` or `SparkDotField` added; the current `View`-based dot/stem timelines in `growth.tsx` and `journey.tsx` are lightweight, readable, and meet the existing design.
- No opportunity fallback images; `opportunities.tsx` does not exist and the Discover card on `dashboard.tsx` uses real data and `SparkCard` styling.
- No noise texture, `SparkWave`, or `SparkStarburst`; they were deemed decorative and not necessary for the v1 production feel.
- No custom profile avatars; `SparkAvatar` + `SparkMonogram` intent is already handled by `SparkAvatar` initials.

**Performance considerations**
- All new assets are `View`-based shapes; zero raster images or SVG dependencies added.
- Each illustration is 112×112 pt, self-contained, and only renders when its parent `SparkEmptyState` is mounted.
- No continuous animations added to illustrations; they are static visuals.

---

## 3. Core Brand Assets

### 3.1 SparkNC Logo

| Name | Purpose | Style | Format |
|---|---|---|---|
| `sparknc-logo` | App icon, splash screen | A small abstract spark with navy/blue/green | SVG / vector |
| `sparknc-wordmark` | Login, onboarding, settings | SparkNC wordmark in navy or white | SVG / vector |

### 3.2 App Icon

- A rounded square with a small spark symbol.
- Light: navy background, green + blue spark.
- Dark: navy 900 background, brighter blue + green spark.

---

## 4. Abstract Spark Shapes

These are the building blocks of the UI and should be implemented as components.

### 4.1 SparkOrb

| Name | Purpose | Style | Implementation |
|---|---|---|---|
| `SparkOrb` | AI companion visual, ambient background | Soft pulsing circle with radial gradient and glow | React Native `View` with `borderRadius: 999` + `Animated` opacity/scale |
| `SparkOrbGlow` | Glow behind orb or progress ring | Large blurred circle with low opacity | `View` with `backgroundColor` alpha and `borderRadius: 999` |

### 4.2 Progress Shapes

| Name | Purpose | Style | Implementation |
|---|---|---|---|
| `SparkProgressRing` | Goals, growth, progress | Circular SVG path with stroke | `react-native-svg` `Circle` or hand-coded `View` rings |
| `SparkProgressArc` | Dashboard hero, milestones | Large arc stroke | SVG path or `View` with `borderRadius` and `overflow: 'hidden'` |
| `SparkProgressPath` | Journey, milestones | Thick line with dots | `View` line segments + dots |

### 4.3 Background Shapes

| Name | Purpose | Style | Implementation |
|---|---|---|---|
| `SparkGlow` | Background glows | Large translucent radial circle | `View` with `borderRadius: 999`, low opacity |
| `SparkWave` | Flowing line decoration | Sine-like translucent curve | SVG path |
| `SparkDotField` | Constellation / milestone cluster | Grid of small dots connected by faint lines | `View` circles + lines |
| `SparkGradientMesh` | Ambient AI background | Slow-shifting mesh gradient | `expo-linear-gradient` or CSS gradients on web |

### 4.4 Achievement / Milestone Graphics

| Name | Purpose | Style | Implementation |
|---|---|---|---|
| `SparkBadge` | Achievements, badges | Circular or shield shape with icon | `View` + `Ionicons` |
| `SparkStreakFlame` | Streak indicator | Small flame icon or animated flame | `Ionicons` `flame` or custom SVG |
| `SparkStarburst` | Celebration | Small starburst shape | SVG / `View` with 8 points |

---

## 5. Empty State Illustrations

Each empty state should have a small, abstract, on-brand visual.

| Screen | Asset Name | Description |
|---|---|---|
| No tasks | `empty-tasks` | A calm checkmark and a small dotted line |
| No goals | `empty-goals` | An unfinished path with a single green dot at the start |
| No opportunities | `empty-opportunities` | A small horizon/compass made of lines |
| No portfolio | `empty-portfolio` | A blank canvas with a small spark in the corner |
| No messages | `empty-messages` | Two small speech bubbles with a faint connection |
| No notifications | `empty-notifications` | A quiet bell with a small zzz line |
| No growth | `empty-growth` | A tiny seed with a faint sprout |

**Implementation:** SVG assets, `SparkEmptyState` accepts an `illustration` prop that renders an SVG component. Keep under 120×120 pt.

---

## 6. Opportunity & Event Imagery

### 6.1 Featured Opportunity Images

- Use real event/organization images when available.
- Fallback: a generative color field + abstract Spark shape.
- Always overlay a `navy` → `transparent` gradient to keep text readable.

### 6.2 Event Category Icons

| Category | Icon |
|---|---|
| Event | `calendar` |
| Volunteering | `heart` |
| Club | `people` |
| Internship | `briefcase` |
| Workshop | `construct` |
| Competition | `trophy` |

---

## 7. Profile & Avatar

| Asset | Purpose | Implementation |
|---|---|---|
| `SparkAvatar` | User profile, messages, ambassador list | Circle with initials or image; status dot optional |
| `SparkMonogram` | Portfolio hero when no photo | Large circle with two initials in `largeTitle` size |

---

## 8. Background Assets

### 8.1 Gradient Presets

Stored in `theme/backgrounds.ts`:

```ts
export const gradients = {
  discovery: ['#071A33', '#0B5FFF'],
  growth: ['#071A33', '#18B96B'],
  achievement: ['#0B5FFF', '#18B96B'],
  celebration: ['#18B96B', '#FFD43B'],
  majorHero: ['#071A33', '#0B5FFF', '#18B96B'],
};
```

### 8.2 Noise / Grain

- Optional: a very subtle noise texture for dark mode immersive screens.
- Use a 128×128 PNG tile with 2–3% opacity.
- Apply only to `immersive` and `ambient` modes.
- Respect `prefers-reduced-motion` and avoid on small screens.

---

## 9. Iconography

### 9.1 Icon Family

- Use `Ionicons` for all UI icons.
- Preferred: `outline` for inactive, `filled` for active.
- Sizes: 18 pt trailing, 22 pt leading, 24 pt tab bar, 32 pt empty-state illustration.

### 9.2 Required Icon Mapping

| Concept | Icon(s) |
|---|---|
| Home | `home`, `home-outline` |
| Tasks | `checkmark-circle`, `checkmark-done-circle` |
| Goals | `flag`, `flag-outline` |
| Growth | `flame`, `trending-up` |
| Journey | `map`, `compass` |
| Portfolio | `briefcase`, `person` |
| AI/Spark | `sparkles`, `flash` |
| Opportunities | `search`, `star`, `compass` |
| Calendar | `calendar`, `calendar-clear` |
| Messages | `chatbubble`, `chatbubbles` |
| Notifications | `notifications`, `notifications-outline` |
| Settings | `settings`, `settings-outline` |
| Ambassador | `people`, `people-outline` |
| Analytics | `bar-chart`, `pie-chart` |
| Impact | `pulse`, `globe` |
| Admin | `shield`, `lock-closed` |

---

## 10. Asset Implementation Priority

| Priority | Asset | Rationale |
|---|---|---|
| P0 | `SparkOrb`, `SparkProgressRing`, `SparkGlow` | Required for hero and AI |
| P0 | `SparkBackground` component with all 7 modes | Unifies every screen |
| P1 | `SparkBadge`, `SparkAvatar`, `SparkEmptyState` illustrations | Polishes identity and empty states |
| P1 | `SparkProgressPath`, `SparkDotField` | Journey and milestones |
| P2 | Noise texture, `SparkWave`, `SparkStarburst` | Final polish and celebrations |
| P2 | Opportunity fallback images | Only if no real images available |

---

## 11. File Organization

```
components/
  visual/
    SparkOrb.tsx
    SparkGlow.tsx
    SparkProgressRing.tsx
    SparkProgressPath.tsx
    SparkDotField.tsx
    SparkBackground.tsx
theme/
  backgrounds.ts
  gradients.ts
assets/
  illustrations/
    empty-tasks.svg
    empty-goals.svg
    ...
  noise/
    noise-dark.png
```

---

## 12. Notes

- No 3D assets.
- No custom fonts beyond the system San Francisco stack.
- All animations are code-driven.
- SVGs should be optimized and not contain embedded bitmaps.
