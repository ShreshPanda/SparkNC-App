# SparkNC Implementation Plan

**Project:** SparkNC v1 — Visual & UX Redesign  
**Winning direction:** Spark Aura + Editorial Structure  
**Date:** 2026-08-26  
**Status:** Design blueprint → implementation audit. No code modifications yet.

---

## 1. Executive Summary

The Spark Aura + Editorial direction has been selected. It gives SparkNC a premium, ownable, iOS-native visual identity: deep navy, soft glows, luminous progress, editorial whitespace, and asymmetric compositions.

This plan is the bridge from the design blueprint to execution. It inventories the existing architecture, identifies every component and screen that must change, and recommends the safest, lowest-risk implementation order.

Key takeaways:

- The design-token layer is mostly in place but needs additions for gradients, glow, and background depth.
- The shared component layer needs several new primitives (`SparkBackground`, `SparkHero`, `SparkOrb`, `SparkProgressRing`, `SparkBadge`, `SparkAvatar`, `SparkInput`, `SparkSegmentedControl`, `SparkEmptyState`, `SparkShimmer`, `SparkToast`) and significant upgrades to `AppShell`, `SparkButton`, `SparkCard`, `SparkListRow`, `SparkMetric`.
- The screen layer needs visual restructuring, not architectural changes. No new dependencies, navigation, or backend APIs are required.
- The biggest risks are performance (gradients, blur, continuous animations) and dark-mode contrast. These are addressable with the code-first asset and motion strategies below.

---

## 2. Design-System Implementation Plan

### 2.1 Foundation Audit

| Token area | Existing file | Status | Required work |
|---|---|---|---|
| Colors | `theme/colors.ts` | **NEEDS MODIFICATION** | Add deep navy tints (`navy900`, `navy800`, `navy700`), gradient palette, translucent glow colors, and soft backgrounds for each brand color. Keep `ThemeColors` type intact. |
| Typography | `theme/typography.ts` | **EXISTS / GOOD** | Scale is ready. Add `Spark` branded display weight usage guidance; preserve legacy aliases. |
| Spacing | `theme/spacing.ts` | **EXISTS / GOOD** | Numeric and legacy scales are ready. Add `space0` and `space64` for extreme hero gaps if needed. |
| Radius | `theme/spacing.ts` | **EXISTS / GOOD** | Values are ready. Add `radiusHero` alias if desired. |
| Shadows | `theme/spacing.ts` | **NEEDS REDUCTION** | `lg` and `brand` shadows should be deprecated for Aura. Only `sm` and `md` are needed. |
| Motion | `theme/motion.ts` | **EXISTS / GOOD** | Timings and springs are ready. Add `easing` curves and `ReducedMotion` hooks in a later component layer. |
| Surfaces | `theme/surfaces.ts` | **NEEDS MODIFICATION** | Add `hero` / `editorial` / `glass` / `metric` variants. Remove hardcoded `backgroundColor` assumptions. |
| Glow | *(none)* | **NEW** | Add `glow.ts` with `SparkGlow`, `SparkOrbGlow`, `SparkHalo` presets. |
| Gradients | *(none)* | **NEW** | Add `gradients.ts` with approved gradient arrays for `expo-linear-gradient` or pure `View` overlays. |
| Backgrounds | *(none)* | **NEW** | Add `backgrounds.ts` with the 7 background modes and a `SparkBackground` component. |

### 2.2 Design System Inventory

| Area | Existing | Needs Modification | New Component | No Change |
|---|---|---|---|---|
| **Colors** | `colors.ts` | ✅ Add tints/alphas | — | — |
| **Typography** | `typography.ts` | — | `SparkText` (optional) | ✅ |
| **Spacing** | `spacing.ts` | — | — | ✅ |
| **Radii** | `spacing.ts` | — | — | ✅ |
| **Shadows** | `spacing.ts` | ✅ Reduce to sm/md | — | — |
| **Glow** | — | — | ✅ `theme/glow.ts` | — |
| **Gradients** | — | — | ✅ `theme/gradients.ts` | — |
| **Backgrounds** | — | — | ✅ `theme/backgrounds.ts` + `SparkBackground` | — |
| **Icons** | `Ionicons` | ✅ Map to design system | — | — |
| **Buttons** | `SparkButton` | ✅ Press/variants | — | — |
| **Inputs** | *(inline)* | — | ✅ `SparkInput` | — |
| **Cards** | `SparkCard` | ✅ Hero/flat/glass | — | — |
| **Lists** | `SparkListRow` | ✅ Press feedback / leading / trailing | — | — |
| **Sheets** | *(none)* | — | ✅ `SparkSheet` | — |
| **Navigation** | `AppShell` / `Tabs` | ✅ Shell only (no nav change) | — | — |
| **Progress** | `ProgressBar`, `ProgressRing` | ✅ Glow/animation | `SparkProgressRing` | — |
| **Charts** | `HeatmapWidget`, `StatsWidget` | ✅ Styling only | — | — |
| **Badges** | `SparkIcon` / `SparkBadge` | ✅ Shape/label | `SparkBadge` | — |
| **Avatars** | *(none)* | — | ✅ `SparkAvatar` | — |
| **Empty states** | `EmptyState` | ✅ New visual | `SparkEmptyState` | — |
| **Loading** | `Skeleton`, `Shimmer` | ✅ Reduce opacity, use theme | `SparkSkeleton` / `SparkShimmer` | — |
| **Error states** | inline text | — | ✅ `SparkError` / `SparkToast` | — |
| **Animations** | `AnimatedWrapper`, `AnimatedNumber` | ✅ Reanimated springs | `SparkMotion` hooks | — |
| **Haptics** | `HapticPressable` | ✅ Replace Vibration with `expo-haptics` later | `useHaptics` | — |

---

## 3. Component Inventory

| Component | Current location | Current purpose | Current visual problem | Recommended change | Reusable? | Priority |
|---|---|---|---|---|---|---|
| `SparkButton` | `components/SparkButton.tsx` | Primary actions, links, success/danger | Uses `Animated` not Reanimated; aggressive onPress scale | Migrate to `react-native-reanimated` spring, add `icon` support, refine `secondary` style | ✅ | P0 |
| `SparkCard` | `components/SparkCard.tsx` | Base elevated/grouped/flat card | No hero, glass, or full-bleed variants | Add `hero`, `glass`, `editorial`, `transparent` variants; keep `elevated`/`grouped`/`flat` | ✅ | P0 |
| `SparkListRow` | `components/SparkListRow.tsx` | Tappable list rows | No press feedback, no swipe, caption uses muted | Add press-ripple `Animated.View`, support `trailingAction`, badge, and 44pt target | ✅ | P0 |
| `SparkMetric` | `components/SparkMetric.tsx` | Numeric tile | Always a card; no glow or large metric layout | Add `glow` variant, `trend` support, and `display` scale | ✅ | P0 |
| `AppShell` | `components/AppShell.tsx` | Screen wrapper with title | Title is fixed, no subtitle, no hero slot, no background mode | Evolve into `SparkShell` with `backgroundMode`, `largeTitle`, `trailing`, and `transparent` support | ✅ | P0 |
| `TodaysSpark` | `components/TodaysSpark.tsx` | Rotating insight card | Hardcoded `borderRadius: 20`, uses `typography.caption` not `caption1` | Convert to `SparkHero` / `SparkInsight` with aura glow and iOS tokens | ✅ | P1 |
| `EmptyState` | `components/EmptyState.tsx` | Empty state | `title2` too large, hardcoded icon pill | Rename `SparkEmptyState`, add `illustration` slot and smaller type | ✅ | P1 |
| `AnimatedBackground` | `components/AnimatedBackground.tsx` | Full-screen moving orbs | 4 expensive `Animated` loops; too busy for Aura | Deprecate. Use `SparkBackground` per screen with reduced, themed ambient shapes | ⚠️ | P2 |
| `ProgressRing` (components/ProgressRing.tsx) | `components/ProgressRing.tsx` | SVG-based ring via `Image` | Inline SVG string, no animation, hardcoded colors | Rewrite as `SparkProgressRing` with `react-native-svg` paths, animated stroke, glow | ✅ | P1 |
| `ProgressRing` (components/dashboard/ProgressRing.tsx) | `components/dashboard/ProgressRing.tsx` | Dashboard-specific | Duplicate ring; not theme-aware | Consolidate into `SparkProgressRing` | ❌ | P1 |
| `ProgressBar` | `components/ProgressBar.tsx` | Linear progress | Hardcoded `borderRadius: 3`, no spring fill | Update to use `radius` tokens, `Animated` width spring | ✅ | P1 |
| `AnimatedNumber` | `components/AnimatedNumber.tsx` | Count-up number | Works; can be improved with `useReducedMotion` | Add `useAnimation()` gating | ✅ | P2 |
| `FadeIn` | `components/AnimatedWrapper.tsx` | Fade/slide wrapper | Uses `Animated` not Reanimated; no reduce-motion gating | Replace with `react-native-reanimated` fade + `useAnimation()` gating | ✅ | P0 |
| `Confetti` | `components/Confetti.tsx` | Celebration particles | Works but not themed to new color palette | Update palette to navy/blue/green/yellow; add reduce-motion off switch | ✅ | P2 |
| `CelebrationOverlay` | `components/CelebrationOverlay.tsx` | Achievement overlay | Uses emoji, hardcoded `zIndex`, `typography.title` | Redesign with `SparkBadge`, `SparkIcon`, branded palette | ✅ | P2 |
| `Skeleton` | `components/Skeleton.tsx` | Placeholder bar | Works; use `colors.border` background | Wrap in `SparkSkeleton` with theme-aware shape | ✅ | P2 |
| `Shimmer` | `components/Shimmer.tsx` | Shimmer overlay | Hardcoded colors, no theme | Theme-aware `SparkShimmer` | ✅ | P2 |
| `SparkIcon` / `SparkBadge` | `components/SparkIcon.tsx` | Brand icon and badge | Good start; expand to sizes and `SparkIcon` sizes | Add size scale and `filled` variants | ✅ | P2 |
| `StreakWidget` | `components/StreakWidget.tsx` | Streak card | Hardcoded styles, uses old `SparkCard` | Fold into `SparkMetric` or `SparkHero` | ⚠️ | P2 |
| `XPWidget` | `components/XPWidget.tsx` | XP card | Hardcoded inline bar | Fold into `SparkMetric` or `SparkHero` | ⚠️ | P2 |
| `GlassCard` | `components/GlassCard.tsx` | Blur/glass card | No actual blur; just a card with border | Decide: implement true `SparkGlassCard` with `BlurView` (medium risk) or remove (recommend remove for Aura) | ⚠️ | P3 |
| `HapticPressable` | `components/HapticPressable.tsx` | Vibration wrapper | Uses `Vibration.vibrate` on every press, not iOS haptics | Replace with `useHaptics` hook and optional `expo-haptics` later | ✅ | P1 |

### 3.1 Visual Repetition Sources

- `SparkCard` / `GlassCard` / `StreakWidget` / `XPWidget` all define their own card surfaces. Consolidate under `SparkCard` and `SparkMetric`.
- `ProgressRing` and `components/dashboard/ProgressRing.tsx` are two different progress rings. Consolidate into `SparkProgressRing`.
- `ActivityIndicator` appears in many screens directly. Wrap in `SparkLoading` or `SparkSkeleton`.
- Inline `TextInput` and `Pressable` styles across `tasks`, `goals`, `admin`, `settings`. Consolidate under `SparkInput`, `SparkButton`, `SparkListRow`.
- `AnimatedBackground` is currently applied globally but will fight the Aura per-screen backgrounds. Remove from `onboarding` and `dashboard` and replace with `SparkBackground`.

---

## 4. Screen Inventory

| Screen | Role(s) | Current implementation | Design direction | Background mode | Hero treatment | Major visual components | New components required | Animation requirements | Asset requirements | Navigation requirements | Priority | Estimated complexity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dashboard** | All | `AppShell` + `ScrollView`, `AnimatedBackground`, `SparkCard`, `TodaysSpark`, `ProgressBar`, `EmptyState` | Aura: large greeting, Today’s Spark hero, progress ring, full-width sections | `atmospheric` | Greeting + name, progress ring, streak, school, Today’s Spark | `AppShell`, `ScrollView`, `SparkCard`, `SparkButton`, `ProgressBar` | `SparkBackground`, `SparkHero`, `SparkProgressRing`, `SparkMetric`, `SparkInsight` | Hero stagger, ring draw, number count-up, list stagger | Spark orb/ring, streak flame icon | None | P0 | High |
| **Tasks** | Student | `AppShell` + `FlatList`, `SparkCard`, inline `TextInput`, `Pressable` completion | Clean, minimal, fast action | `clean` | Large title + segmented control | `SparkCard`, `TextInput`, `SparkButton`, `Pressable` | `SparkInput`, `SparkListRow`, `SparkSegmentedControl`, `SparkEmptyState` | Row spring-in, swipe-to-complete, success flash | Empty-state illustration | None | P0 | Medium |
| **Goals** | Student | `AppShell` + `ScrollView`, `SparkCard`, `SparkButton`, inline forms | Editorial: active goal hero, path, suggestions | `editorial` | Active goal title + progress ring | `SparkCard`, `SparkButton`, `TextInput`, `ProgressBar` | `SparkProgressRing`, `SparkTimeline`, `SparkChip`, `SparkInput`, `SparkEmptyState` | Ring fill, path draw, milestone pop | Empty-state path illustration | None | P0 | High |
| **Growth** | Student | `AppShell` + `ScrollView`, `SparkCard`, `SparkMetric` | Immersive: large level/XP ring, timeline, glow | `immersive` | `GROWTH` caption + `Momentum` + progress ring | `SparkCard`, `SparkMetric`, `SparkButton` | `SparkBackground`, `SparkProgressRing`, `SparkTimeline`, `SparkMetric` | Ring draw, glow pulse, timeline stagger | Glow, ring, timeline path | None | P0 | High |
| **Journey** | Student | `AppShell` + `ScrollView`, month `SparkCard` timeline | Editorial: alternating full-width sections, large type | `editorial` | Stage path title | `SparkCard`, `SparkButton`, `EmptyState` | `SparkPath`, `SparkSection`, `SparkEmptyState` | Path draw, section stagger | Path line, dots | None | P1 | Medium |
| **Portfolio** | Student | `AppShell` + `ScrollView`, many `SparkCard` sections | Editorial: large name, quote, achievement ribbon | `editorial` | Name + tagline + avatar | `SparkCard`, `Ionicons`, `SparkButton` | `SparkAvatar`, `SparkBadge`, `SparkSection`, `SparkMonogram` | Hero fade, ribbon scroll, stagger | Avatar placeholder, badge icons | None | P1 | Medium |
| **AI / Spark** | All | `AppShell` + `ScrollView`, prompt grid, chat history | Ambient: centered orb, floating prompts, messages | `ambient` | Pulsing `SparkOrb` + `Your growth companion` | `SparkCard`, `TextInput`, `Pressable` | `SparkOrb`, `SparkBackground`, `SparkMessageBubble`, `SparkInput` | Orb float, prompt stagger, message slide | Orb glow, message shapes | None | P0 | High |
| **Opportunities** | Student | Only in `dashboard.tsx` list | Discovery: featured image hero, list below | `discovery` | Featured opportunity card with image overlay | `SparkCard`, `Ionicons` | `SparkFeaturedCard`, `SparkChip`, `SparkListRow` | Parallax image, list stagger | Featured image fallback, category icons | May need tab or More link | P1 | Medium |
| **Calendar** | All | `AppShell` + `ScrollView`, day groups, event list | Clean, time-focused | `clean` | `Today, August 26` + event count | `SparkCard`, `TextInput` (if add) | `SparkListRow`, `SparkSection`, `SparkChip` | Date count-up, row stagger | Calendar dot icons | None | P1 | Low |
| **Messages** | All | `AppShell` + `FlatList` | Clean, minimal, conversation | `clean` | `Messages` large title | `SparkCard`, `Pressable`, `TextInput` | `SparkAvatar`, `SparkListRow`, `SparkInput`, `SparkEmptyState` | Unread dot bounce, slide | Avatar placeholders | None | P1 | Low |
| **Notifications** | All | `AppShell` + `FlatList`, grouped by category | Clean, grouped, priority | `clean` | `Notifications` + mark all | `SparkCard`, `SparkButton` | `SparkListRow`, `SparkBadge`, `SparkEmptyState` | Stagger, dismiss slide | Bell/z icon | None | P1 | Low |
| **Settings** | All | `AppShell` + `ScrollView`, `SparkCard` groups, switches | Clean, iOS grouped table | `clean` | `Settings` large title | `SparkCard`, `SparkListRow`? | `SparkListRow`, `SparkSection`, `SparkSwitch` (retheme) | Row press fade, toasts | None | None | P1 | Medium |
| **Profile** | All | `AppShell` + `ScrollView`, user info | Editorial mini-portfolio | `editorial` | Name, avatar, role | `SparkCard` | `SparkAvatar`, `SparkListRow` | Fade | Avatar | None | P2 | Low |
| **Achievements** | Student | `AppShell` + `ScrollView`, badge list | Aura/glow: grid of badges | `immersive` | Achievement count | `SparkCard`, `Ionicons` | `SparkBadge`, `SparkGrid` | Pop in, glow | Badge shapes | None | P2 | Medium |
| **Feedback** | All | `AppShell` + `ScrollView`, form | Clean, simple form | `clean` | `Feedback` title | `SparkCard`, `TextInput`, `SparkButton` | `SparkInput`, `SparkTextArea` | None | None | None | P2 | Low |
| **Ambassador** | Ambassador | `AppShell` + `ScrollView`, student cards, status pills | Editorial + clean: focus hero, student rows | `editorial` | Today’s Focus for 3 students | `SparkCard`, `SparkButton` | `SparkAvatar`, `SparkListRow`, `SparkBadge`, `SparkTimeline` | Stagger, status pop | Status icons | None | P1 | High |
| **Ambassador Feedback** | Ambassador | `AppShell` + form | Clean form | `clean` | Title + student context | `SparkCard`, `TextInput` | `SparkInput`, `SparkTextArea` | None | None | None | P2 | Low |
| **Analytics** | Leadership | `AppShell` + `ScrollView`, metric grid, charts | Data mode: KPIs, line/bar charts | `data` | Program overview + 3 metrics | `SparkCard`, `SparkMetric` | `SparkChart` (retheme), `SparkMetric` | Count-up, chart draw | Chart series colors | None | P1 | High |
| **Impact** | Leadership | `AppShell` + `ScrollView`, large metric, insight list | Data/immersive: one big number | `data` or `immersive` | Oversized impact metric | `SparkCard`, `SparkMetric` | `SparkMetric` (large), `SparkListRow` | Count-up, glow | Impact ring | None | P1 | Medium |
| **Progress** | Leadership/Student | `AppShell` + `ScrollView`, XP/level info | Immersive: level and ring | `immersive` | `Level 7` + `740 / 1,000 XP` | `SparkCard`, `ProgressBar`? | `SparkProgressRing`, `SparkMetric` | Ring draw, count | Ring | None | P1 | Medium |
| **Showcase** | Leadership | `AppShell` + `ScrollView`, demo data, charts | Data/editorial: demo leadership metrics | `data` | Leadership demo | `SparkCard` | `SparkChart`, `SparkMetric` | Count-up | None | P2 | Medium |
| **Admin** | Admin | `AppShell` + `ScrollView`, forms for users/events/announcements | Clean, functional, minimal | `clean` | `Admin` large title | `SparkCard`, `TextInput`, `SparkButton` | `SparkInput`, `SparkListRow`, `SparkToast` | Form entry, toast slide | None | None | P2 | Medium |
| **More** | All | `AppShell` + `ScrollView`, role-aware grid of links | Clean overflow / navigation hub | `clean` | `More` title or role context | `SparkCard`, `SparkListRow` | `SparkListRow`, `SparkSection` | Row stagger | None | None | P1 | Low |
| **Onboarding** | All (auth) | `ScrollView` over `AnimatedBackground`, `GlassCard` steps | Aura/welcome: simple steps, calm | `atmospheric` | `Let’s build your spark` | `GlassCard`, `ProgressBar`, `SparkButton` | `SparkBackground`, `SparkInput`, `SparkProgressBar` | Fade in, step transition | None | None | P2 | Medium |

---

## 5. Asset Inventory

### 5.1 Code-first visual components (preferred)

| Asset | Component | Why code-first | Priority |
|---|---|---|---|
| Spark orb | `SparkOrb` | Can be built with `View` + `borderRadius: 999` + `Animated` opacity | P0 |
| Glows | `SparkGlow`, `SparkHalo` | Translucent `View` circles, low cost | P0 |
| Progress ring | `SparkProgressRing` | `react-native-svg` or two `View` rings | P0 |
| Progress path | `SparkProgressPath` | `View` lines + dots | P1 |
| Constellation dots | `SparkDotField` | `View` circles + lines | P1 |
| Badges | `SparkBadge` | `View` + `Ionicons` | P1 |
| Avatar | `SparkAvatar` | `View` circle with initials/image | P1 |
| Streak flame | `Ionicons` `flame` | Built-in icon | P0 |

### 5.2 SVG assets

| Asset | Screen | Priority |
|---|---|---|
| `empty-tasks.svg` | Tasks, Dashboard | P1 |
| `empty-goals.svg` | Goals, Journey | P1 |
| `empty-portfolio.svg` | Portfolio | P2 |
| `empty-messages.svg` | Messages | P2 |
| `empty-notifications.svg` | Notifications | P2 |
| `empty-opportunities.svg` | Opportunities fallback | P2 |
| `sparknc-logo.svg` | App icon, splash | P2 |

### 5.3 Static image assets

| Asset | Use | Priority |
|---|---|---|
| `icon.png` / `splash-icon.png` / `adaptive-icon.png` | App icon and splash. Should be redesigned to new color palette. | P2 (production) |
| Featured opportunity images | `Opportunities` hero. Use real data first. | P2 |

### 5.4 Generated visual assets

- No AI-generated images are required.
- Gradients and glows are generated by components.
- Noise texture for dark mode `immersive` can be a tiny PNG tile (128×128, 2% opacity) if desired, but avoid if possible.

### 5.5 Existing assets that can be reused

- `Ionicons` are sufficient.
- `AnimatedNumber`, `Skeleton`, `Shimmer` can be rethemed.
- `Confetti` palette updated.

---

## 6. Animation Inventory

| Interaction | Current | Required | Risk | Strategy |
|---|---|---|---|---|
| Screen entry | `FadeIn` with `Animated` | Reanimated fade/slide, stagger, reduce-motion gating | Low | Replace `AnimatedWrapper` with Reanimated `FadeIn` |
| Button press | `Animated.spring` scale 0.97 | Reanimated spring, opacity 0.85 | Low | Update `SparkButton` |
| List row press | No feedback | `Animated.View` background opacity + scale | Low | Update `SparkListRow` |
| Task completion | `Animated` bounce + `Vibration.vibrate` | Spring out + green check + medium haptic | Low | Add `SparkTaskRow` |
| Progress ring fill | Static SVG `Image` | `Animated` SVG stroke draw | Medium | `SparkProgressRing` with `react-native-svg` |
| Number count | `AnimatedNumber` works | Add `useReducedMotion` | Low | Gating in `AnimatedNumber` |
| Hero stagger | `FadeIn` with delay | `expo-router` + Reanimated stagger | Low | Use `SparkHero` |
| Ambient orb float | `Animated` loops in `AnimatedBackground` | Single slow float/glow, reduced-motion off | Low-Medium | `SparkOrb` with `useReducedMotion` |
| Background gradient shift | Not present | Slow CSS gradient position shift, dark mode only | Medium | Use `Animated.Value` or `expo-linear-gradient` if installed |
| Confetti | `Confetti.tsx` | Themed colors, reduce-motion off | Low | Update `Confetti` palette |
| Celebration overlay | `CelebrationOverlay` | Branded badge + spark icon | Low | Redesign |
| Pull-to-refresh | Native `RefreshControl` | Keep, but tint color consistent | Low | Theme tint |
| Toast / snackbar | Not present | `SparkToast` slide up | Low | New component |

---

## 7. Navigation Considerations

- **Do not change the Expo Router file structure.** All screens exist in `app/(tabs)/`.
- **Do not add or remove tabs.** The `more` tab remains the overflow.
- `AppShell` (or new `SparkShell`) should continue to wrap each screen and accept `transparent` for backgrounds.
- Presentation mode is already in `PresentationProvider`. `SparkShell` must respect it by enlarging type and hiding the tab bar.
- The tab bar in `app/(tabs)/_layout.tsx` should only receive visual tuning: active/inactive icon states, label weight, height, safe area. No route changes.
- Avoid a second `NavigationContainer`; the root `Stack` in `app/_layout.tsx` is correct.

---

## 8. Role Considerations

- **Student:** primary audience. All visual work starts here.
- **Ambassador:** needs a dashboard-style but warm screen. Inherit `SparkCard`, `SparkListRow`, `SparkBadge`.
- **Leadership (Analytics, Impact, Showcase):** needs data mode. Inherit `SparkMetric`, `SparkChart`, `SparkListRow`.
- **Admin:** needs clean, high-contrast, accessible forms. No visual flourishes.
- **Presentation Mode:** scale all type and spacing by a multiplier, hide tab bar, enlarge hero, reduce controls.

---

## 9. Performance Considerations

| Treatment | Risk | Mitigation |
|---|---|---|
| **Blur** | High on low-end iPhones if using `BlurView` | Avoid blur except for presentation overlays; use translucent `View` colors instead. |
| **Gradients** | Low if done with `View` overlays or `expo-linear-gradient` | Precompute gradient arrays; avoid per-frame updates. |
| **Shadows** | Low | Use only `sm`/`md`; omit in dark mode. |
| **Glow** | Low | Use static translucent `View`s; pulse only one element at a time. |
| **Large images** | Medium on featured opportunities | Lazy load, use `contentFit`, and always overlay gradient for text. |
| **Animations** | Medium if JS-driven | Use `react-native-reanimated` with native driver. Avoid `setState` in loops. |
| **Particle effects** | Medium-High on `Confetti` | Limit to 24 particles, short duration, disable on reduced motion. |
| **Scrolling** | Low | Use `FlatList` with `getItemLayout`, `removeClippedSubviews` for long lists. |
| **Charts** | Low-Medium | Keep charts simple (Spark lines/bars); avoid heavy charting libraries. |

---

## 10. Accessibility Considerations

- All new touch targets must be ≥ 44×44 pt.
- Use `useReducedMotion` from `AnimationProvider` to disable ambient float, gradient shift, confetti, and large entry animations.
- Respect Dynamic Type: use `typography` tokens and allow scaling.
- VoiceOver: every `SparkListRow`, `SparkButton`, `SparkInput` needs `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`.
- Color contrast: `primary`/`success`/`error` on `surface` must pass WCAG AA. Test Aura dark mode for contrast.
- Focus order: hero → sections → list → action. Avoid trapping focus in animation overlays.
- Presentation mode: still accessible; keep semantic structure.

---

## 11. Risk Assessment

### 11.1 LOW RISK

- Token additions to `colors.ts`.
- Refining `SparkButton`, `SparkCard`, `SparkListRow`, `SparkMetric`.
- Updating typography/spacing in screen styles.
- Re-theming empty/loading states.

### 11.2 MEDIUM RISK

- Migrating `AnimatedBackground` to per-screen `SparkBackground` (could leave stale imports).
- Replacing `ProgressRing` with `react-native-svg` version (ensure `react-native-svg` is available or use `View` fallback).
- Adding `SparkHero` and full-width color blocks (could break `AppShell` padding expectations).
- `Confetti` and ambient orb performance on older devices.

### 11.3 HIGH RISK

- Introducing `expo-linear-gradient` or `BlurView` without a fallback. The project currently does not include them in `package.json`.
- Changing `AppShell` to support transparent/background-mode could affect every screen.
- Over-animating with `react-native-reanimated` while also using `Animated` in the same component.
- Breaking role routing or presentation mode if `SparkShell` is not a drop-in replacement for `AppShell`.
- iOS/Android build issues if `react-native-svg` or `expo-haptics` is added later without native rebuild.

---

## 12. Implementation Order

### Phase 0: Foundation (no screens yet)

1. `theme/colors.ts` — add navy tints, translucent glow colors, gradient palette.
2. `theme/gradients.ts` — define approved gradient arrays.
3. `theme/glow.ts` — define glow presets.
4. `theme/backgrounds.ts` — define 7 background mode configs.
5. `theme/surfaces.ts` — add hero/glass/editorial variants.

### Phase 1: Core Visual Primitives

6. `SparkBackground` — per-screen background mode component.
7. `SparkOrb` / `SparkGlow` — brand ambient visuals.
8. `SparkProgressRing` — consolidated ring with animation.
9. `SparkButton` — Reanimated spring, icon support.
10. `SparkCard` — hero/glass/flat/editorial variants.
11. `SparkListRow` — press feedback, 44pt target, badge.
12. `SparkMetric` — glow, large, trend.

### Phase 2: Shell & Navigation

13. `SparkShell` (drop-in for `AppShell`) — background mode, large title, hero slot.
14. Tab bar visual polish in `app/(tabs)/_layout.tsx`.
15. `FadeIn` / `SparkMotion` with `useAnimation` gating.

### Phase 3: Student Core

16. `Dashboard` — `SparkBackground`, `SparkHero`, `SparkProgressRing`.
17. `Tasks` — `SparkInput`, `SparkListRow`, swipe/complete.
18. `Goals` — `SparkProgressRing`, `SparkTimeline`, `SparkChip`.
19. `Growth` — `SparkBackground` immersive, `SparkProgressRing`, `SparkTimeline`.
20. `AI` — `SparkOrb`, `SparkBackground` ambient, message bubbles.

### Phase 4: Student Discovery & Identity

21. `Journey` — `SparkPath`, `SparkSection`.
22. `Portfolio` — `SparkAvatar`, `SparkBadge`, `SparkSection`.
23. `Opportunities` — `SparkFeaturedCard`, `SparkChip`.
24. `Calendar`, `Messages`, `Notifications`, `Settings`, `Profile` — `SparkListRow`, `SparkSection`, `SparkEmptyState`.

### Phase 5: Role Screens

25. `Ambassador`, `Analytics`, `Impact`, `Progress`, `Showcase` — inherit primitives.
26. `Admin`, `Ambassador Feedback`, `Feedback` — clean forms.
27. `Achievements` — badge grid.

### Phase 6: Presentation & Motion

28. `PresentationProvider` integration with `SparkShell`.
29. Final motion/haptics pass.
30. `Confetti`, `CelebrationOverlay` retheme.

### Phase 7: Validation

31. Typecheck.
32. Worker tests.
33. Manual light/dark walkthrough per role.
34. Performance profiling on iPhone SE / 12 / 14.

---

## 13. Definition of Done

- All screens render with the new Spark Aura visual language.
- No inline `fontSize`, `borderRadius`, `padding`, or hex colors remain in screen files.
- `typecheck` and `test:worker` pass.
- Light and dark modes are visually correct.
- Reduced motion is respected.
- All touch targets are ≥ 44×44 pt.
- No new backend/API/navigation changes introduced.

---

## 14. Validation Checklist

- [ ] `npm run typecheck` passes.
- [ ] `npm run test:worker` passes.
- [ ] `npm run typecheck:worker` passes.
- [ ] Light mode looks correct on Dashboard, Tasks, Goals, Growth, AI.
- [ ] Dark mode looks correct on the same screens.
- [ ] Presentation mode scales type and hides tab bar.
- [ ] Student, Ambassador, Leadership, and Admin roles see correct screens.
- [ ] Login, onboarding, and tab navigation still work.
- [ ] Cloudflare data loads on each screen.
- [ ] Task/goal completion provides haptic and animation feedback.
- [ ] Reduced motion disables ambient orb, confetti, and staggered entry.
- [ ] No console errors or warnings from removed components.
- [ ] iOS build runs on simulator and physical device.
- [ ] Android build compiles and runs (if desired).
