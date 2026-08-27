# SparkNC Motion Design

**Project:** SparkNC v1 — Visual & UX Redesign Phase 0  
**Date:** 2026-08-26  
**Status:** Design-only blueprint

---

## 1. Motion Philosophy

Motion in SparkNC should feel inevitable, responsive, and iOS-native. It is not decoration. It communicates state, hierarchy, and progression. The app should feel alive, but it should never distract.

---

## 2. Core Principles

1. **Meaningful, not decorative.** Every animation answers a user question: What changed? Where am I? What happened?
2. **Fast and snappy.** Micro-interactions complete in 150 ms. Screen transitions complete in 300 ms. Large hero reveals take 500 ms.
3. **Predictable.** The same gesture produces the same motion everywhere.
4. **Restrained.** One motion at a time. No competing animations.
5. **Accessible.** Respect `prefers-reduced-motion`. Provide instant state changes when reduced motion is enabled.

---

## 3. Timing

| Token | Duration | Use |
|---|---|---|
| `fast` | 150 ms | Press feedback, switches, toggles, status changes |
| `medium` | 300 ms | Card transitions, list entry, fades, navigation transitions |
| `slow` | 500 ms | Hero entry, page transitions, major reveals, celebration |

---

## 4. Easing

| Name | Value | Use |
|---|---|---|
| `easeOut` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Opacity, scale, slide exit |
| `easeIn` | `cubic-bezier(0.4, 0.0, 1, 1)` | Dismiss, collapse |
| `spring` | React Native spring, friction 6, tension 120 | Button press, card entry, navigation pop |
| `linear` | `linear` | Loops (ambient orb, progress indicator) only |

---

## 5. Micro Interactions

### 5.1 Button Press

- Scale to `0.97` over 100 ms.
- Opacity to `0.85` for primary buttons.
- Spring back to `1` on release.
- Haptic: light impact only for meaningful actions (save, confirm, complete). No haptic for every tap.

### 5.2 List Row Tap

- Background opacity changes to `0.05` of `primary` for 150 ms.
- Slight scale: `1` → `0.99` → `1`.
- Haptic: light impact.

### 5.3 Switch / Toggle

- Translate thumb 150 ms with `easeOut`.
- Color change 150 ms.
- Haptic: light impact.

### 5.4 Task / Goal Completion

- Row fades right and scales down.
- A green checkmark scales from `0` to `1` with a spring.
- The progress ring fills with a short `Animated` stroke.
- Confetti / spark burst (optional) for major completions.
- Haptic: medium impact.

---

## 6. Transitions

### 6.1 Screen Entry (Stack)

- Fade from `0` to `1` opacity over 300 ms.
- Slight upward slide: `translateY(8)` → `0` over 300 ms.
- Hero content staggers by 60 ms.
- Use `expo-router` screen transition options.

### 6.2 Screen Entry (Modal / Sheet)

- Sheet slides up from bottom over 350 ms.
- Backdrop fades to `rgba(0,0,0,0.4)` over 300 ms.
- Close: sheet slides down, backdrop fades out.

### 6.3 Tab Switch

- Active tab icon scales from `1` to `1.1` then `1` over 200 ms.
- No cross-fade on screen; content is instant with a subtle opacity fade of 150 ms.

### 6.4 Back Navigation

- Screen slides right and fades over 300 ms.
- Revealed screen scales from `0.98` to `1` with a short ease-out.

---

## 7. Progress & Achievement Animations

### 7.1 Progress Ring

- Stroke draws clockwise over 800 ms with `easeOut`.
- Number inside counts up in sync.
- A soft glow behind the ring pulses once.

### 7.2 Number Count Up

- Count from 0 to value over 600–900 ms.
- Use `AnimatedNumber` with spring or linear interpolation.
- Large numbers take slightly longer.

### 7.3 Streak / Milestone

- A small starburst or flame icon scales up with a spring.
- The number bounces once.
- A brief green or yellow glow appears behind the element.
- Haptic: medium or heavy impact for major milestones.

### 7.4 Goal Path Reveal

- Each milestone dot pops in with a 100 ms stagger.
- The connecting line draws from one dot to the next.
- Current milestone glows subtly.

---

## 8. Hero & Background Motion

### 8.1 Hero Entry

- Background gradient/hero fades in over 400 ms.
- Title slides up from `translateY(12)` and fades in over 500 ms.
- Subtitle and CTA stagger 100 ms behind.
- Hero number or ring draws in over 800 ms.

### 8.2 AI Orb (Ambient)

- Gentle vertical float: `translateY(0)` → `translateY(-8)` → `translateY(0)` over 4 s, linear, infinite.
- Soft glow opacity pulse: `0.6` → `1` → `0.6` over 3 s, linear, infinite.
- **Only active when reduced motion is off.**

### 8.3 Gradient Shift (Ambient AI only)

- `expo-linear-gradient` colors or CSS background position shift slowly over 12 s.
- Very subtle. Must not compete with text.
- **Disable when reduced motion is on.**

---

## 9. List & Scroll Animations

### 9.1 List Entry

- Rows fade in and slide up by 8 pt, staggered 40–60 ms.
- Start only the first 8–10 rows; lazy for below-fold.

### 9.2 Pull-to-Refresh

- Pull icon rotates and bounces.
- Content fades slightly to `0.8` while refreshing.
- New rows slide in at the top.

### 9.3 Infinite / Paged Lists

- Next page rows slide in from bottom, staggered 40 ms.
- A small `SparkSkeleton` row is shown while loading.

---

## 10. Haptics

### 10.1 Haptic Mapping

| Action | Haptic | Notes |
|---|---|---|
| Button press (save, confirm, primary) | `Haptics.impactAsync('light')` | Not on every button |
| Task / goal completion | `Haptics.impactAsync('medium')` | |
| Milestone / level up | `Haptics.impactAsync('heavy')` | Optional `Haptics.notificationAsync('success')` |
| Error | `Haptics.notificationAsync('error')` | |
| Success toast | `Haptics.impactAsync('light')` | |
| Swipe complete | `Haptics.impactAsync('medium')` | |
| Pull to refresh | `Haptics.impactAsync('light')` | |

### 10.2 Haptic Rules

- Never vibrate for longer than 50 ms on micro interactions.
- Never combine vibration and haptics for the same action.
- Disable haptics when the device has haptics disabled.

---

## 11. Reduced Motion

### 11.1 Detection

- Use `useReducedMotion()` from `react-native-reanimated` or the platform `AccessibilityInfo`.
- Store in `AnimationProvider` context for shared access.

### 11.2 Behavior

| Animation | Reduced Motion |
|---|---|
| Hero entry | Instant opacity 1, no slide |
| Ambient orb float | Disabled |
| Gradient shift | Disabled |
| Confetti / spark burst | Disabled, use instant checkmark |
| Progress ring draw | Instant fill |
| Number count up | Instant final value |
| List entry | No stagger, instant render |
| Pull-to-refresh | Standard iOS spinner, no bounce |

---

## 12. Component Animation Specs

| Component | Animation | Duration | Easing |
|---|---|---|---|
| `SparkButton` press | Scale `0.97` | 100 ms | `spring` |
| `SparkCard` entry | Fade + slideY 12 pt | 300 ms | `spring` |
| `SparkListRow` tap | Bg opacity 0.05 | 150 ms | `easeOut` |
| `SparkMetric` number | Count up | 600–900 ms | `easeOut` |
| `SparkProgressRing` | Stroke draw | 800 ms | `easeOut` |
| `SparkOrb` | Float + glow pulse | 3–4 s loop | `linear` |
| `SparkHero` | Title slide + fade | 500 ms | `spring` |
| `SparkEmptyState` | Icon scale | 400 ms | `spring` |
| `SparkToast` | Slide up | 300 ms | `spring` |

---

## 13. Implementation Notes

- Use `react-native-reanimated` for all spring and layout animations.
- Use `Animated` from React Native only for simple loops or `AnimatedNumber`.
- Prefer `LayoutAnimation` for list insert/delete when appropriate.
- Avoid `setState` in animation loops; use shared values.
- Profile on low-end devices; keep animation work off the JS thread where possible.
