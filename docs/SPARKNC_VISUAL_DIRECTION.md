# SparkNC Visual Direction

**Project:** SparkNC v1 — Visual & UX Redesign Phase 0  
**Date:** 2026-08-26  
**Status:** Design-only blueprint — no production code

---

## 1. Executive Summary

This document presents three distinct visual directions for SparkNC. Each direction is a complete visual philosophy, not a palette swap. They share the same SparkNC brand colors, typography scale, and accessibility rules, but they differ in composition, energy, and emotional tone.

After the comparison in Section 8, one direction is recommended as the winning foundation for the implementation phase.

---

## 2. Shared Foundation

All three directions are built on the same foundation so the app always feels like SparkNC, regardless of the chosen direction.

### 2.1 Brand Colors

| Color | Hex | Meaning |
|---|---|---|
| Deep Spark Navy | `#071A33` | Foundation, deep backgrounds, premium surfaces, primary text |
| Spark Blue | `#0B5FFF` | Discovery, interaction, information, opportunities |
| Spark Green | `#18B96B` | Growth, progress, success, completion, achievement |
| Spark Yellow | `#FFD43B` | Spark moments, attention, energy, highlights |

### 2.2 Color Depth

Every brand color is expanded into at least five intensities so the same hue can feel bold, soft, atmospheric, or translucent:

| Intensity | Navy | Blue | Green | Yellow |
|---|---|---|---|---|
| Dark | `#02080F` | `#0A3FCC` | `#0F8A53` | `#D9B02A` |
| Base | `#071A33` | `#0B5FFF` | `#18B96B` | `#FFD43B` |
| Muted | `#3A5273` | `#4F8CFF` | `#4CD495` | `#FFE67A` |
| Soft Background | `#E8EDF3` | `#EAF2FF` | `#E8FAF2` | `#FFF8DD` |
| Translucent | `rgba(7,26,51,0.06)` | `rgba(11,95,255,0.12)` | `rgba(24,185,107,0.12)` | `rgba(255,212,59,0.20)` |

### 2.3 Typography

An iOS-native scale, San Francisco style, with tight tracking on large type:

| Token | Size | Weight | Line | Tracking | Use |
|---|---|---|---|---|---|
| `display` | 44 | 800 | 50 | -0.8 | Presentation hero, major numbers |
| `largeTitle` | 34 | 700 | 41 | -0.5 | Screen title, greeting |
| `title1` | 28 | 700 | 34 | -0.3 | Primary section title |
| `title2` | 22 | 700 | 28 | -0.2 | Card headers, hero labels |
| `title3` | 20 | 600 | 26 | -0.2 | Sub-sections |
| `headline` | 17 | 600 | 22 | 0 | List rows, emphasized body |
| `body` | 17 | 400 | 24 | 0 | Primary body text |
| `subheadline` | 15 | 400 | 20 | 0 | Secondary body |
| `callout` | 16 | 500 | 22 | 0 | Inline descriptions |
| `footnote` | 13 | 400 | 18 | 0.1 | Metadata, captions |
| `caption1` | 12 | 500 | 16 | 0.2 | Pills, badges, labels |
| `metric` | 32 | 700 | 38 | -0.5 | Hero metrics |

### 2.4 Spacing

A 4-pt grid with iOS-friendly aliases:

| Token | Value |
|---|---|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `xxxl` | 32 |
| `huge` | 40 |

### 2.5 Accessibility Baseline

- Minimum 44×44 pt touch targets.
- WCAG AA contrast on all text.
- `prefers-reduced-motion` respected.
- Dynamic Type supported.
- VoiceOver labels on all interactive elements.

---

## 3. Direction A — Spark Flow

### 3.1 Philosophy

Energy, movement, progression, and momentum. Spark Flow uses flowing lines, arcs, and gradients to make the user feel like they are moving forward. The interface is alive but not chaotic: every motion has a direction, and every gradient implies momentum.

### 3.2 Visual Character

- Large, sweeping arcs and progress rings.
- Soft horizontal gradients that guide the eye from left to right.
- Layered surfaces that recede in depth.
- Asymmetric hero sections with oversized left-aligned type.
- Floating quick-action pills.
- Subtle motion on every transition.

### 3.3 Background System

| Mode | Treatment | Example Use |
|---|---|---|
| `clean` | `#F7F8FA` with a whisper of `navy` at top | Tasks, Settings |
| `atmospheric` | Soft `navy` → `blue` gradient, top-left to bottom-right | Dashboard, Onboarding |
| `immersive` | Deep navy with green glow, radiating from progress ring | Growth, Achievements |
| `ambient` | Slow-shifting `blue` → `green` mesh gradient | AI |

### 3.4 Hero Concept

Dashboard hero: a full-width gradient field with a large progress arc, the student's name in `largeTitle`, and a single floating Spark insight pill.

### 3.5 Screen Personalities

- **Dashboard:** Momentum — large progress arc, streak, today’s focus.
- **Growth:** Direction — timeline-like path, level, XP ring.
- **Journey:** Flow — flowing path with milestone nodes.
- **Portfolio:** Momentum through identity — large name, story, achievements in a horizontal ribbon.
- **AI:** Drift — ambient gradient with a centered Spark orb and floating suggestions.
- **Tasks:** Swift — clean list with swipe-to-complete and spring feedback.

### 3.6 Motion

- Entry: elements slide up from a slight diagonal angle, suggesting forward motion.
- Spring: friction 6, tension 120.
- Progress: continuous arc fill; numbers spring.
- Press: subtle scale down (0.97) and a light haptic.

### 3.7 Strengths

- Strong sense of progress.
- Memorable, app-store-worthy screenshots.
- Youthful and energetic.

### 3.8 Weaknesses

- High motion demands can be distracting if not gated.
- Complex gradient system can hurt performance on older devices.

---

## 4. Direction B — Spark Editorial

### 4.1 Philosophy

Premium editorial design. The app reads like a personal magazine: oversized typography, generous whitespace, asymmetrical compositions, and strong visual hierarchy. The product says, "This is my story."

### 4.2 Visual Character

- Large, left-aligned titles with negative tracking.
- Wide margins and lots of whitespace.
- Asymmetric hero: one dominant element, one supporting detail.
- Editorial full-width "chapter" sections.
- Minimal card use; content lives on the page like a layout.
- Small, precise typography for labels and captions.
- Strong use of large numerals as graphic elements.

### 4.3 Background System

| Mode | Treatment | Example Use |
|---|---|---|
| `clean` | Off-white `#FAFBFC` with subtle warm paper tone | Tasks, Settings |
| `editorial` | Full-width tinted sections alternating white and `navy` 5% | Portfolio, Reflections |
| `discovery` | Large color field behind a featured opportunity | Opportunities, Events |
| `data` | Minimal light gray with controlled blue/green accents | Analytics, Leadership |

### 4.4 Hero Concept

Dashboard hero: full-bleed "Good morning, [First Name]" in `largeTitle`, a single oversized number (e.g., streak), and a narrow vertical image slot. The next section is a sharp content break.

### 4.5 Screen Personalities

- **Dashboard:** Front page — greeting, one large metric, a featured insight block.
- **Growth:** Essay — large level number, a paragraph of context, a timeline as a visual break.
- **Journey:** Magazine spread — alternating left/right milestone sections.
- **Portfolio:** Profile editorial — large name, tagline, full-width story quote.
- **AI:** Interview — question in large type, reply in a calm bubble.
- **Opportunities:** Featured spread — large image, big title, match score as a graphic.

### 4.6 Motion

- Entry: elements fade and slide up gently; staggered by proximity.
- Transitions: minimal, like turning a page.
- Large numbers: count up with a short ease-out.
- Images: parallax scroll within their frames.

### 4.7 Strengths

- Looks sophisticated and premium.
- Screenshot quality is extremely high.
- Whitespace calms dense features.

### 4.8 Weaknesses

- Requires strong imagery and empty-state illustrations.
- More whitespace means more scrolling for dense admin/ambassador screens.

---

## 5. Direction C — Spark Aura

### 5.1 Philosophy

A more expressive, atmospheric interpretation. SparkNC feels like it is alive around the student. Deep navy environments, subtle glow, layered gradients, abstract Spark shapes, translucent surfaces, and luminous progress indicators.

### 5.2 Visual Character

- Deep `navy` backgrounds as the default, not a dark mode afterthought.
- Soft glow behind heroes and progress rings.
- Layered translucent cards with subtle blur.
- Abstract Spark shapes: orbs, arcs, particles, wave lines.
- AI visual as a soft, pulsing orb.
- Luminous accents: `blue`, `green`, and `yellow` used like light sources.

### 5.3 Background System

| Mode | Treatment | Example Use |
|---|---|---|
| `clean` | `navy` 900 `#02080F` with translucent surface | Tasks, Settings |
| `atmospheric` | `navy` → `blue` radial gradient, glowing top | Dashboard |
| `immersive` | Deep navy with green radial glow | Growth, Achievements |
| `ambient` | Animated `navy` → `blue` → `green` gradient | AI |

### 5.4 Hero Concept

Dashboard hero: a deep navy surface with a radial `blue` glow in the upper corner. A large circular progress ring floats left, the user's name is right-aligned, and a "Spark insight" appears as a glowing pill.

### 5.5 Screen Personalities

- **Dashboard:** Aura — name, ring, glow, and a single highlighted action.
- **Growth:** Constellation — a constellation of milestone dots connected by faint lines.
- **Journey:** Path — a glowing line that bends through stages.
- **Portfolio:** Identity aura — a portrait/avatar with a soft color halo.
- **AI:** Companion — a gently pulsing orb with ambient gradient.
- **Opportunities:** Horizon — an edge-to-edge image with a gradient overlay.

### 5.6 Motion

- Glow: slow, continuous opacity pulsing (only when not reduced motion).
- Entry: elements fade in from 0.9 scale, slightly delayed.
- Progress: rings and lines draw themselves with `Animated` stroke.
- AI orb: slow vertical float and glow cycle.

### 5.7 Strengths

- Extremely memorable in screenshots.
- Dark mode is the default, not a remix.
- Strong emotional and brand identity.

### 5.8 Weaknesses

- Risk of visual heaviness for utility screens (Tasks, Admin).
- More complex to implement in React Native without a blur/gradient library.

---

## 6. Comparison Matrix

| Criterion | Spark Flow | Spark Editorial | Spark Aura |
|---|---|---|---|
| Aesthetic quality | 8 | 9 | 9 |
| Professionalism | 8 | 10 | 9 |
| iOS compatibility | 9 | 9 | 7 |
| SparkNC identity | 8 | 7 | 10 |
| Memorability | 8 | 9 | 10 |
| Usability | 8 | 8 | 7 |
| Scalability | 8 | 8 | 7 |
| Accessibility | 8 | 9 | 7 |
| Animation potential | 10 | 7 | 9 |
| Presentation quality | 9 | 10 | 9 |
| Screenshot quality | 9 | 10 | 10 |
| Visual variation | 9 | 8 | 8 |
| Background quality | 8 | 8 | 10 |
| Brand potential | 8 | 8 | 10 |
| **Average** | **8.4** | **8.6** | **8.8** |

---

## 7. Winning Direction

### 7.1 Recommendation: Spark Aura (with Editorial structure)

Spark Aura is the recommended winning direction because it delivers the strongest brand identity, the most memorable screenshot quality, and a visual language that is distinct from every generic educational dashboard on the App Store. It gives SparkNC an immediate, ownable look: deep navy, soft glow, luminous progress, and an AI orb that users will remember.

However, to avoid the risk of visual heaviness on Tasks and Admin, the implementation should borrow structural principles from **Spark Editorial**:

- Generous whitespace and clear hierarchy.
- Oversized hero type.
- Full-width color sections that create visual breaks.
- Asymmetric, screen-specific compositions.

And it should borrow the motion language from **Spark Flow** for progress and completion moments:

- Forward, directional transitions.
- Spring-based progress animations.
- Light haptics on meaningful actions.

### 7.2 What to Avoid

- Do not make every screen a dark gradient. Use `clean` and `editorial` modes for Tasks, Settings, Calendar, Messages, Notifications, and Admin.
- Do not overuse the AI orb. It belongs on the AI screen and the dashboard hero; do not paste it on every screen.
- Do not turn dark mode into neon. Accents are glows, not lasers.
- Do not over-animating. Aura can breathe; it does not strobe.

### 7.3 Scaling the Direction

1. **Foundation first:** implement the color, type, and spacing tokens, then a reusable `SparkBackground` component with the seven background modes.
2. **Hero components:** build `SparkHero`, `SparkProgressRing`, `SparkOrb`, `SparkPath`, `SparkMetric`, and `SparkEmptyState`.
3. **Screen-by-screen:** redesign each major screen with its assigned background mode and personality.
4. **Motion pass:** add entry, exit, and micro-interactions last.
5. **Presentation mode:** scale type and spacing 1.25×, hide tab bar, and simplify controls.

---

## 8. Implementation Roadmap

| Phase | Focus | Output |
|---|---|---|
| 1 | Token & background system | `theme/backgrounds.ts`, `SparkBackground`, color depth tokens |
| 2 | Shared hero & metric components | `SparkHero`, `SparkProgressRing`, `SparkMetric`, `SparkOrb` |
| 3 | Core screens | Dashboard, Growth, AI, Portfolio, Opportunities |
| 4 | Utility screens | Tasks, Goals, Calendar, Messages, Notifications, Settings |
| 5 | Role screens | Ambassador, Analytics, Impact, Progress, Admin |
| 6 | Motion, haptics, and reduced motion | `SparkMotion` system, final QA |
| 7 | Presentation & screenshot pass | Presentation mode, App Store screenshots |
