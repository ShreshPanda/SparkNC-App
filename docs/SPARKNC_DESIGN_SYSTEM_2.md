# SparkNC Design System 2.0

**Version:** UI/UX 2.0 — iOS-first, premium, App Store-ready.  
**Last updated:** 2026-08-25

---

## 1. Design Philosophy

SparkNC 2.0 should feel like one coherent, premium iPhone product. The interface is built around **clarity, energy, and progress**. It is visually confident but never loud, youthful but never childish, and data-rich but never dense.

Three guiding principles:

1. **One product.** Every screen should look and behave like it came from the same design team.
2. **Information with hierarchy.** The most important thing should be visibly dominant. Everything else supports it.
3. **Touch and motion that feels native.** Interactions should feel inevitable, responsive, and alive in the way iOS users expect.

---

## 2. Color System

### 2.1 Brand Foundation

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#071A33` | Primary text, deep backgrounds, major headings, premium hero surfaces |
| `blue` | `#0B5FFF` | Links, primary buttons, interactive elements, informational states |
| `green` | `#18B96B` | Progress, success, completed goals, positive growth, achievements |
| `yellow` | `#FFD43B` | Spark moments, highlights, special opportunities, important attention states |

### 2.2 Light Mode

| Token | Hex | Purpose |
|---|---|---|
| `background` | `#F7F8FA` | App root behind all content |
| `surface` | `#FFFFFF` | Cards, sheets, input fields, elevated surfaces |
| `surfaceSubtle` | `#F2F4F7` | Secondary grouped backgrounds, subtle hero fills |
| `foreground` | `#071A33` | Primary text, headings, icons |
| `muted` | `#5B6B82` | Secondary text, captions, timestamps, placeholders |
| `card` | `#FFFFFF` | Primary card surface |
| `border` | `#E5E7EB` | Subtle dividers, borders, separators |
| `borderStrong` | `#D1D5DB` | Active input borders, focus rings |
| `primary` | `#0B5FFF` | Primary interactive / link color |
| `primaryHover` | `#0A4FD8` | Pressed / hovered primary |
| `primarySoft` | `#EAF2FF` | Soft primary background for pills, icons, badges |
| `accent` | `#0B5FFF` | Same as `primary` by default; used for accents |
| `success` | `#18B96B` | Success states, completed tasks, positive actions |
| `successSoft` | `#E8FAF2` | Soft green backgrounds |
| `highlight` | `#FFD43B` | Attention moments, spark badges, featured calls |
| `warning` | `#F59E0B` | Caution, due-soon, warnings |
| `error` | `#D92D20` | Errors, destructive actions |
| `errorSoft` | `#FEF3F2` | Soft error backgrounds |
| `info` | `#1570EF` | Informational links, secondary blue accents |
| `brand` | `#071A33` | Brand navy for hero and deep accents |

### 2.3 Dark Mode

| Token | Hex | Purpose |
|---|---|---|
| `background` | `#071A33` | App root background |
| `surface` | `#0E1D33` | Cards, sheets, inputs |
| `surfaceSubtle` | `#132944` | Secondary grouped backgrounds |
| `foreground` | `#F4F6FF` | Primary text |
| `muted` | `#8A9AB0` | Secondary text |
| `card` | `#0E1D33` | Primary card surface |
| `border` | `#1E3A5F` | Subtle dividers and borders |
| `borderStrong` | `#2A4A70` | Active inputs, focus |
| `primary` | `#4F8CFF` | Interactive / links |
| `primaryHover` | `#6AA0FF` | Pressed / hovered primary |
| `primarySoft` | `#132944` | Soft primary background |
| `accent` | `#4F8CFF` | Default accent |
| `success` | `#18B96B` | Success states |
| `successSoft` | `#0D2E22` | Soft green backgrounds |
| `highlight` | `#FFD43B` | Attention moments |
| `warning` | `#F59E0B` | Warnings |
| `error` | `#F87171` | Errors |
| `errorSoft` | `#2A1414` | Soft error backgrounds |
| `info` | `#4F8CFF` | Informational blue accents |
| `brand` | `#F4F6FF` | Brand light for hero and deep accents |

### 2.4 Semantic Rules

- Use `navy/foreground` for text, `blue/primary` for interaction, `green/success` for progress, `yellow/highlight` for spark moments.
- Avoid applying brand colors to every element. Default to neutrals; use color as a signal.
- Gradients are allowed only in the hero surface and should be extremely subtle.

---

## 3. Typography

System font stack, San Francisco on iOS. Tight negative letter spacing for large titles; neutral or positive for body.

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `largeTitle` | 34 | 700 | 41 | -0.5 | Screen hero, top-level greetings |
| `title1` | 28 | 700 | 34 | -0.3 | Primary screen titles |
| `title2` | 22 | 700 | 28 | -0.2 | Section titles, card headers |
| `title3` | 20 | 600 | 26 | -0.2 | Sub-section titles |
| `headline` | 17 | 600 | 22 | 0 | List row primary text, emphasized body |
| `body` | 17 | 400 | 24 | 0 | Primary body text |
| `callout` | 16 | 500 | 22 | 0 | Inline highlights, descriptions |
| `subheadline` | 15 | 400 | 20 | 0 | Secondary body |
| `footnote` | 13 | 400 | 18 | 0.1 | Metadata, timestamps |
| `caption1` | 12 | 500 | 16 | 0.2 | Pills, badges, labels |
| `caption2` | 11 | 500 | 14 | 0.2 | Micro labels, tab text |
| `metric` | 32 | 700 | 38 | -0.5 | Hero metrics |
| `metricLarge` | 44 | 800 | 50 | -0.8 | Splash numbers |

### 3.1 Legacy Aliases

To avoid a mass rewrite, keep these aliases:

- `display` → `metricLarge`
- `title` → `title1`
- `heading` → `title2`
- `subheading` → `title3`
- `bodyMedium` / `bodyBrand` → `body` + weight override
- `captionBrand` → `caption1`
- `label` → `headline`
- `labelSmall` → `caption1`

---

## 4. Spacing & Shape

### 4.1 Spacing Scale

| Token | Value |
|---|---|
| `space2` | 2 |
| `space4` | 4 |
| `space8` | 8 |
| `space12` | 12 |
| `space16` | 16 |
| `space20` | 20 |
| `space24` | 24 |
| `space32` | 32 |
| `space40` | 40 |
| `space48` | 48 |

The legacy `spacing.xs/md/lg` aliases remain mapped to the nearest values.

### 4.2 Radius

| Token | Value | Usage |
|---|---|---|
| `radiusSmall` | 8 | Compact pills, small chips |
| `radiusMedium` | 12 | Buttons, small cards, inputs |
| `radiusLarge` | 16 | Grouped cards, sheets |
| `radiusXLarge` | 20 | Primary cards, hero surfaces |
| `radiusPill` | 999 | Pills, avatars, badges |
| `radiusFull` | 999 | Circular buttons |

### 4.3 Shadows

Shadows should be extremely restrained. Use only `sm` and `md`. Avoid `lg` and `brand` for general UI.

| Token | Values |
|---|---|
| `shadowSm` | y:1, blur:4, opacity:0.04 |
| `shadowMd` | y:2, blur:8, opacity:0.06 |

In dark mode, shadows are generally omitted; use `border` for depth.

---

## 5. Surfaces

### 5.1 Hero Surface

- Large, singular, no border.
- Large title, supportive subheadline, one primary action.
- Use for Today’s Spark, major achievements, and premium insights.
- Padding: `space24` or `space32`.
- Background: `surfaceSubtle` or a very subtle gradient.

### 5.2 Elevated Card

- White or `surface` background.
- `radiusXLarge` (20), subtle border, optional `shadowSm`.
- Use for grouped information that needs to stand out.

### 5.3 Grouped List / Section

- `radiusLarge` (16) container with `padding: 0`.
- Rows inside with left/right `space16` padding and `space16` vertical.
- `separator` component between rows, indented for leading icons.
- Used for Tasks, Settings, Notifications, Goals.

### 5.4 List Row

- Leading: optional icon (28pt in 36pt pill), or avatar.
- Title: `headline`.
- Subtitle: `subheadline` / `footnote` in `muted`.
- Trailing: chevron, detail text, or action pill.
- Height: 44pt minimum; 60pt for two-line rows.

### 5.5 Metric Tile

- Centered or left-aligned number.
- `metric` size, `caption1` label in `muted`.
- Optional micro-trend or spark indicator.
- 1/3 or 1/2 grid width.

### 5.6 Timeline Item

- Vertical stem with dot.
- Dot: 10pt or 14pt.
- Stem: 2pt, `border` color.
- Card to the right, 16pt gap.

### 5.7 Action Surface

- One clear CTA, minimal decoration.
- `primary` button or tappable row.
- Avoid stacking multiple competing actions.

### 5.8 Glass Surface

- Reserved for overlays, floating controls, presentation mode, and hero moments only.
- Use `GlassCard` sparingly.

---

## 6. Component Library

### 6.1 Core Components

| Component | Responsibility |
|---|---|
| `SparkCard` | Base card with `variant` prop: `elevated`, `grouped`, `flat` |
| `SparkButton` | Primary, secondary, success, danger, muted, link variants. 52pt min height. Spring press. |
| `SparkHeader` | iOS-style header with large-title support, leading/trailing actions, safe-area insets. |
| `SparkListRow` | Tappable row with leading, title, subtitle, trailing, separator-aware. |
| `SparkMetric` | Numeric tile with label, optional trend, optional icon. |
| `SparkProgress` | Progress bar and ring, color and track color from theme. |
| `SparkBadge` / `SparkChip` | Status, category, priority pills. |
| `SparkAvatar` | Avatar with placeholder and status. |
| `SparkEmptyState` | Empty state with icon, title, message, optional CTA. |
| `SparkSkeleton` | Shimmer/placeholder for lists and cards. |
| `SparkHero` | Today’s Spark and premium hero surfaces. |
| `SparkSection` | Grouped section with header and optional footer. |
| `SparkTimeline` | Vertical timeline with dots, stems, and cards. |
| `SparkInsight` | Quick action / insight pill. |

### 6.2 Component Rules

- Components read from `useTheme()`; no hardcoded colors.
- All touchable components are at least 44×44 pt.
- All pressable components have a spring scale or opacity press effect.
- List rows use `Pressable` with `accessibilityRole` and `accessibilityLabel`.

---

## 7. Layout

### 7.1 Screen Padding

- Side padding: `space16` (compact) or `space20` (standard).
- Top padding from `SparkHeader` + safe area.
- Inter-section gap: `space24`.
- Inner-card row gap: `space16`.

### 7.2 Safe Areas

- All screens use `useSafeAreaInsets` from `react-native-safe-area-context`.
- Avoid hardcoded `paddingBottom` or `paddingTop` values.

### 7.3 Responsive

- Avoid `width: '30%'` magic numbers; use flex or grid counts.
- Metric grids use 2 or 3 columns with `flex: 1`.
- Portrait-first; landscape is not a primary target but should not crash.

---

## 8. Motion

### 8.1 Timing

| Token | Duration | Use |
|---|---|---|
| `fast` | 150ms | Press feedback, switches, small state changes |
| `medium` | 300ms | Card transitions, fades, list entry |
| `slow` | 500ms | Hero entry, page transitions, major reveals |

### 8.2 Easing

- `easeOut` for opacity and scale.
- `spring` (friction 6, tension 120) for navigation and card entry.
- `linear` for loops only.

### 8.3 Motion Rules

- Use `useReducedMotion` to disable large animations.
- Avoid bouncing everything.
- Avoid continuous motion unless it is a loading or celebration.
- One animation at a time; do not layer competing motion.

---

## 9. Haptics

Haptics are meaningful, not decorative.

- Light impact on row tap.
- Medium impact on success/completion (task, goal, milestone).
- Heavy impact on major achievements.
- No haptic on every button press.

---

## 10. Iconography

- Use `Ionicons` consistently (already established).
- Default icon size: 24pt for tab bar, 22pt for leading icons, 18pt for trailing detail.
- Stroke weight should feel consistent; prefer `outline` for inactive and `filled` for active states.
- All icons need semantic labels in `accessibilityLabel`.

---

## 11. Accessibility

- Minimum 44×44 pt touch targets.
- Dynamic Type: use `typography` tokens and allow system scaling.
- VoiceOver: every control has a `label` and a `hint` where the action is not obvious.
- Color: `primary` / `success` / `error` must pass WCAG AA on `surface`.
- Reduce motion: respect `useReducedMotion` for entry/exit animations.

---

## 12. Dark Mode

- Dark mode is not an inversion. It is an intentional palette.
- Use `surface`/`surfaceSubtle` for depth, not shadows.
- Keep `primary` bright (`#4F8CFF`) for links and controls.
- Text remains high-contrast (`foreground` / `muted`).

---

## 13. Presentation Mode

When `PresentationProvider.enabled` is `true`:

- `SparkHeader` uses `title1` → `display` scale.
- Tab bar hidden.
- `spacing` and `typography` scale by a `presentationMultiplier` (1.25x).
- Cards use stronger borders and no hairline shadows.
- Charts and metrics use larger text.
- Minimal on-screen controls; primary CTA only.

---

## 14. Using the Design System

### 14.1 Import Path

```ts
import { colors, spacing, typography, radius, shadows, motion } from '../theme';
```

### 14.2 In Components

```tsx
const { colors } = useTheme();
<Text style={[typography.headline, { color: colors.foreground }]}>{title}</Text>
```

### 14.3 No Hardcoded Values

Do not use literal hex, `fontSize`, `borderRadius`, or `padding` in screen files. If a token does not exist, add it to the design system first.

---

## 15. Migration Notes

1. This design system supersedes the original `docs/DESIGN_SYSTEM.md` for new work.
2. Legacy tokens (`typography.title`, `spacing.lg`, etc.) remain as aliases to avoid a mass rename.
3. New components should use the iOS-style names (`headline`, `title2`, `space16`).
4. Old screens can be migrated screen-by-screen as they are redesigned.
