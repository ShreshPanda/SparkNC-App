# SparkNC Background System

**Project:** SparkNC v1 — Visual & UX Redesign Phase 0  
**Date:** 2026-08-26  
**Status:** Design-only blueprint

---

## 1. Purpose

Backgrounds are a primary design tool in SparkNC. They create depth, brand identity, and visual rhythm. The background system is intentionally varied across screens but always uses the same color and shape language.

---

## 2. Background Modes

### 2.1 Mode 1 — Clean

**Use for:** Tasks, Settings, utility interfaces, forms, Messages, Notifications, Admin.

**Light treatment:**
- Base: `#F7F8FA`.
- A very subtle `navy` 5% top tint (0–80 pt) for title legibility.
- Content on `surface` cards or plain `surface` rows.
- No gradients, no images, no glows.

**Dark treatment:**
- Base: `#02080F`.
- `surface` and `surfaceSubtle` for cards and rows.
- Borders create depth; no shadows.

**Visual goal:** reduce noise so the user can act quickly.

---

### 2.2 Mode 2 — Atmospheric

**Use for:** Dashboard, Home, Onboarding.

**Light treatment:**
- A large top gradient from `navy` `#071A33` (100% opacity at top) to `blue` `#0B5FFF` (10% opacity) and finally to `#F7F8FA` (0% opacity at ~240 pt).
- The gradient is placed behind the hero area only; the rest of the screen returns to `clean`.
- A very large, low-opacity circle (80–120 pt) can float in the upper-right as an abstract shape.

**Dark treatment:**
- Deep navy `#02080F`.
- A `blue` glow from the top-right, created with a radial gradient at 15% opacity.
- `surface` cards sit on top with a subtle translucent `navy` tint.

**Visual goal:** welcoming, energetic, personalized.

---

### 2.3 Mode 3 — Immersive

**Use for:** Growth, major achievements, presentation moments, Progress.

**Light treatment:**
- Top section: `navy` → `green` gradient that fades to white.
- A radial `green` glow behind the progress ring at 12% opacity.
- The glow is not static; it may pulse subtly.

**Dark treatment:**
- Deep navy `#02080F`.
- A `green` radial glow from the center-left.
- Progress ring has a `green` inner glow.
- `surface` cards are translucent `navy` at 85% opacity.

**Visual goal:** reward, reflection, deep focus.

---

### 2.4 Mode 4 — Editorial

**Use for:** Portfolio, Journey, reflection screens, selected profile moments.

**Light treatment:**
- Base: `#FAFBFC` with a warm paper tint.
- Full-width alternating sections of `navy` 5% (`#F2F4F7`) and `#FFFFFF`.
- Large typography and whitespace; backgrounds are flat, not gradients.
- Accent blocks (e.g., a quote) can use `yellow` soft background (`#FFF8DD`) at full width.

**Dark treatment:**
- Base: `#071A33`.
- Alternating sections of `navy` 800 `#0E1D33` and `navy` 700 `#132944`.
- Large type is allowed on these flat sections.

**Visual goal:** read like a premium magazine; let the words and numbers be the visuals.

---

### 2.5 Mode 5 — Discovery

**Use for:** Opportunities, Events, featured content.

**Light treatment:**
- Top: a full-width image or color field.
- If no image: a large `blue` → `yellow` gradient at the top (subtle, 8–12% opacity).
- Below the hero: `#F7F8FA` clean background.
- Thumbnail or event images can be left or right aligned.

**Dark treatment:**
- Top: deep `navy` with a `blue` gradient overlay on any image.
- Below: `navy` 900.

**Visual goal:** invite exploration, feel open and aspirational.

---

### 2.6 Mode 6 — Ambient AI

**Use for:** AI companion.

**Light treatment:**
- A slow-shifting mesh gradient: `navy` → `blue` → `green` with very low opacity (8–15%).
- The gradient is behind a centered Spark orb.
- The bottom of the screen is calmer to keep messages readable.

**Dark treatment:**
- Deep navy with the same gradient, but at 20–30% opacity.
- The Spark orb glows with a `blue` + `green` halo.

**Visual goal:** the app is alive and listening, but never distracting.

---

### 2.7 Mode 7 — Data

**Use for:** Analytics, Leadership, Admin.

**Light treatment:**
- Base: `#F7F8FA`.
- One full-width `navy` 5% section for the main hero/metric.
- Charts use `primary` / `success` / `highlight` as accent lines/bars only.
- No background images, no gradients on charts.

**Dark treatment:**
- Base: `#02080F`.
- `navy` 800 section for the hero.
- Chart lines are bright and controlled.

**Visual goal:** calm, credible, executive.

---

## 3. Gradient System

### 3.1 Approved Gradients

All gradients are restrained. They should not be decorative noise.

| Gradient | Colors | Usage |
|---|---|---|
| Discovery | `navy` → `blue` | Dashboard, onboarding, exploration |
| Growth | `navy` → `green` | Growth, level up, achievements |
| Achievement | `blue` → `green` | Goal completion, major progress |
| Celebration | `green` → `yellow` | Streaks, milestones, Spark moments |
| Major hero | `navy` → `blue` → `green` | Top-level hero, presentation mode |

### 3.2 Gradient Rules

- Gradients are used only in hero or top-level background surfaces, not on small cards.
- Direction: almost always top-to-bottom or top-left to bottom-right.
- Opacity: start full, fade by 60–80% before the first content break.
- In dark mode, gradients are allowed to be more saturated but must not reduce text contrast.

---

## 4. Abstract Shapes

### 4.1 Spark Orb

- A circle with a radial gradient and a soft glow.
- Used on AI and dashboard hero.
- Pulses slowly in ambient mode.

### 4.2 Progress Ring

- A circular stroke that fills with `primary`, `success`, or `highlight`.
- Track: `border` or `surfaceSubtle`.
- Used on Growth, Goals, Progress.

### 4.3 Progress Path

- A thick curved line with dots at milestones.
- Stroke: `border` for future, `primary` for current, `success` for completed.
- Used on Journey and Growth path preview.

### 4.4 Floating Pills

- Small rounded rectangles or capsules that float near heroes.
- Used for `SparkInsight` and quick actions.
- Background: `surface` with a subtle shadow or translucent tint.

### 4.5 Constellation Dots

- Small circles connected by faint lines.
- Used for achievement constellations and milestone clusters.
- Color: `muted` or `primary` depending on state.

---

## 5. Layering Rules

- Backgrounds always sit on `z-index` 0.
- Hero content sits on `z-index` 1–2.
- Floating controls sit on `z-index` 3.
- Overlays, toasts, and modals sit on `z-index` 10+.
- Always ensure text on a gradient has `navy` or `white` color, never `muted` directly on a busy gradient.

---

## 6. Visual Transitions

### 6.1 Screen Entry

- Background should already be in place.
- Foreground content staggers in.
- Gradients do not animate unless entering an immersive screen.

### 6.2 Section Breaks

- Use full-width color changes, not dividers, to signal new sections.
- Keep section padding consistent (`xxl` or `xxxl`).

### 6.3 Scroll Behavior

- Hero gradients remain fixed behind the content as the user scrolls.
- Large titles can shrink to `title2` on scroll for iOS native feel.
- Floating action buttons stay pinned to the bottom.

---

## 7. Dark Mode Background Rules

- Dark mode is not an inversion. It is an intentional atmospheric palette.
- Use `navy` 900 for the root background.
- Use `navy` 800 for cards.
- Use `navy` 700 for grouped sections.
- Glows become more visible because the background is darker.
- Text stays `foreground` and `muted`; do not introduce new grays.

---

## 8. Accessibility

- Never place text over a high-contrast gradient.
- Always place text on a translucent dark or light overlay when on images.
- Respect `prefers-reduced-motion`: disable ambient pulsing and slow shifting.
- Maintain WCAG AA contrast for all text on backgrounds.
