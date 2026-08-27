# SparkNC Screen Designs

**Project:** SparkNC v1 — Visual & UX Redesign Phase 0  
**Date:** 2026-08-26  
**Status:** Design-only blueprint

---

## 1. How to Use This Document

This is a screen-by-screen visual blueprint for the winning direction: **Spark Aura with Editorial structure**. Each screen is described by its dominant visual idea, background, composition, typography, content, and motion. The goal is to give an engineer enough information to implement the screen without guessing.

---

## 2. Dashboard / Home

### Visual personality
Atmospheric, energetic, personalized. The dashboard is the signature SparkNC experience. It should feel like a home, not a dashboard.

### Background
`atmospheric` mode. A soft `navy` → `blue` gradient that starts at the top edge and fades to white (`#F7F8FA`) by the first content break. In dark mode, the gradient stays deep navy and the blue glow intensifies.

### Composition
1. **Greeting** (top-left, full width):  
   `Good morning, Shresh` — `largeTitle`, left-aligned.  
   `Let’s make today count.` — `subheadline`, `muted`.

2. **Today’s Spark hero** (full-width, edge-to-edge color field):  
   A large gradient surface, 160–200 pt tall, with:  
   - Large `SparkProgressRing` on the left (today focus progress, ~80 pt).  
   - Title: `YOUR SPARK` — `caption1`, `navy` or `white`.  
   - Primary insight: one line, `headline`.  
   - One floating `SparkButton` or `SparkInsight` pill as CTA.

3. **Today** section (grouped rows):  
   `TODAY` — section header, `caption1`, muted.  
   `SparkListRow` of 1–2 most important tasks, plus a quick-add row.

4. **Your Progress** (full-width tinted section):  
   A green-flushed section with a large metric (e.g., `7‑day streak`) and a small spark line.

5. **Discover** (card, not a list of cards):  
   A single featured opportunity row with an image, title, and match score.

### Motion
- Hero slides in first.
- Sections stagger upward by 60–100 ms.
- Progress ring draws with `Animated` stroke.

---

## 3. Tasks

### Visual personality
Minimal, focused, efficient. The task screen should let the user act and move on.

### Background
`clean` mode. `#F7F8FA` (light) or deep navy 900 (dark). No gradients.

### Composition
1. **Large title** (top):  
   `Tasks` — `largeTitle`.  
   `Inbox` / `Today` / `Upcoming` — `SparkSegmentedControl` or `SparkChip` row below.

2. **Quick-add input** (full-width, subtle):  
   `SparkInput` with a `+` icon, `surfaceSubtle` background, no heavy border.

3. **Task list** (grouped `SparkCard` variant `grouped`):  
   `SparkListRow` with leading circle (empty or checkmark), title, subtitle, trailing priority dot.  
   Completed tasks use `success` check and `muted` text.

4. **Empty state**:  
   `SparkEmptyState` with an `checkmark-circle` icon, `All caught up`, and a calm message.

### Motion
- Rows spring in with a tiny delay.
- Swipe-to-complete: the row fades to the right and a green check scales.
- Completion: a brief success haptic and a `successSoft` flash.

---

## 4. Goals

### Visual personality
Clean, motivating, achievement-oriented. Communicate where the student is, where they are going, and what to do next.

### Background
`editorial` mode. Off-white with alternating `navy` 5% full-width sections. Goal progress is the dominant visual idea.

### Composition
1. **Hero**:  
   `YOUR GOALS` — `caption1`.  
   `Where you’re going` — `title1`.  
   Large `SparkProgressRing` or segmented ring showing active / completed.

2. **Active goal card** (one large card, not a grid):  
   Title, progress bar, next step, `SparkButton`.

3. **Goal path** (vertical `SparkTimeline`):  
   3–5 milestones as dots on a vertical line. Active milestone is highlighted.

4. **Suggestions** (horizontal `SparkChip` row):  
   `Build leadership`, `Volunteer`, `Join a club`.

### Motion
- Ring fills on entry.
- Milestones pop in from the path.
- Completion: the ring glows briefly and a confetti burst is optional.

---

## 5. Growth

### Visual personality
Immersive, reflective, progress-focused. Growth is personal development, not analytics.

### Background
`immersive` mode. Deep navy with a soft green radial glow behind the progress ring. In light mode, use a `navy` → `green` gradient at the top that fades to white.

### Composition
1. **Hero** (full-width, edge-to-edge):  
   `GROWTH` — `caption1`, `muted` or `white`.  
   `Momentum` — `largeTitle`.  
   Large `SparkProgressRing` centered or left.  
   `LEVEL 7` and `740 / 1,000 XP` — `metric` / `subheadline`.

2. **Insight card**:  
   A single `SparkCard` with a growth observation:  
   `You’ve completed 5 tasks in a row. Keep the streak.`

3. **Journey preview** (small path):  
   4 stages: `Discover` → `Participate` → `Build` → `Lead`.  
   Active stage is `primary` / `green`; inactive are `muted`.

4. **Recent activity**:  
   A short list of `SparkTimeline` rows: `+120 XP`, `Goal completed`, `Streak started`.

### Motion
- The ring draws in.
- The glow behind the ring pulses slowly.
- The path lights up from left to right.

---

## 6. Journey

### Visual personality
Visual, directional, transformational. The journey should be a memorable, story-like path.

### Background
`editorial` mode. Alternating full-width sections: white, then a soft `navy` 5% for the next stage, then white. Each stage is a visual break.

### Composition
1. **Hero**:  
   `YOUR JOURNEY` — `caption1`.  
   `Start → Discover → Participate → Build → Lead` — large, left-aligned `title1`.

2. **Stage sections** (one per stage, full-width):  
   - Stage number (e.g., `01`) as an oversized `metric` in `muted`.
   - Stage title: `DISCOVER` — `title2`.
   - Short description: `body`.
   - 1–2 example actions as `SparkListRow`.

3. **Path line** (vertical or S-curve):  
   A thick, colored line that connects stages. Completed segments are `green`; current is `blue`; future are `border`.

### Motion
- Each stage reveals as it enters the viewport.
- The connecting line draws downward.
- Current stage has a subtle glow.

---

## 7. Portfolio

### Visual personality
Personal, editorial, identity-driven. It should feel shareable.

### Background
`editorial` mode. Light with full-width tinted `navy` 5% sections. Large whitespace.

### Composition
1. **Profile hero**:  
   `Shresh Panda` — `largeTitle`.  
   `Builder · Leader · Learner` — `headline` / `primary`.  
   A circular avatar or monogram with a subtle ring.

2. **Your Story** (full-width section):  
   A quote-style block:  
   `I joined SparkNC to grow as a leader and build things that matter.` — `title3`, italic.

3. **Achievement ribbon** (horizontal scroll):  
   3–5 `SparkCard` tiles with badges and labels.

4. **Skills / Projects / Impact** (grouped sections):  
   `SparkListRow` for each, with value on the right.

### Motion
- Name and tags fade in first.
- Story section slides up.
- Horizontal ribbon can be swiped; items spring on scroll.

---

## 8. AI (Spark)

### Visual personality
Ambient, intelligent, conversational. AI is not a chatbot; it is a growth companion.

### Background
`ambient` mode. An `navy` → `blue` → `green` slow-shifting mesh gradient. The bottom is calmer.

### Composition
1. **Spark orb hero**:  
   A centered, softly pulsing `SparkOrb` (60–80 pt).  
   `SPARK` — `caption1`, centered.  
   `Your growth companion` — `title2`, centered.

2. **Prompts** (floating pill grid or 2×2):  
   `Focus`, `Grow`, `Explore`, `Reflect`, `Ask Spark`.

3. **Proactive insights**:  
   `I noticed something.` — `headline`.  
   A `SparkCard` with an insight and a follow-up button.

4. **Conversation** (bottom):  
   Minimal message bubbles. User: right-aligned white pill. Spark: left-aligned `surfaceSubtle` pill.

### Motion
- Orb pulses gently (respect reduced motion).
- Prompts float in with a stagger.
- New messages slide up from the bottom.

---

## 9. Opportunities

### Visual personality
Exploratory, visual, discovery-oriented. Avoid generic lists.

### Background
`discovery` mode. Edge-to-edge color field behind the featured opportunity. Below: clean `surface`.

### Composition
1. **Hero**:  
   `DISCOVER` — `caption1`.  `Opportunities picked for you` — `title1`.  `See all` — small trailing action.

2. **Featured opportunity** (full-width, image-led):  
   Image with `navy` gradient overlay.  
   Title: `title2`, white.  
   Match score: `metric` badge.  
   `Why this fits you` — `footnote`, white.  
   `Explore →` — text CTA.

3. **Categories** (horizontal `SparkChip` row):  
   `Events`, `Volunteering`, `Clubs`, `Internships`.

4. **More opportunities** (vertical list, not a grid of cards):  
   `SparkListRow` with thumbnail, title, date, match pill.

### Motion
- Hero image parallax on scroll.
- Categories spring in from the left.
- List rows stagger upward.

---

## 10. Calendar

### Visual personality
Organized, calm, time-oriented.

### Background
`clean` mode. Light background with one `navy` 5% full-width section for the current day.

### Composition
1. **Hero**:  
   `CALENDAR` — `caption1`.  `Today, August 26` — `title1`.  Small event count.

2. **Today’s events** (full-width tinted section):  
   `SparkListRow` with a colored dot (blue for event, green for goal, yellow for spark), time, and title.

3. **Upcoming events** (grouped rows):  
   Date headers (`SparkSection` header) with `SparkListRow` events.

4. **Add event** (floating `SparkButton` at bottom):  
   `+ New event`.

### Motion
- Hero date counts up briefly.
- New events slide in when added.
- Dot colors animate on category change.

---

## 11. Messages

### Visual personality
Social, minimal, conversational.

### Background
`clean` mode. Very light or very dark. No gradients.

### Composition
1. **Large title**:  `Messages` — `largeTitle`.

2. **Search / filter** (subtle, optional):  
   `SparkInput` placeholder `Search messages`.

3. **Conversation list** (grouped rows):  
   `SparkListRow` with avatar, name, last message preview, timestamp, unread dot.

4. **Floating compose** (bottom-right):  
   A `SparkButton` circle with `create` icon.

### Motion
- Unread dot bounces in.
- New messages slide in from the right.
- Pull-to-refresh has a spring.

---

## 12. Notifications

### Visual personality
Clear, prioritized, lightweight.

### Background
`clean` mode. Background `surface` with grouped sections.

### Composition
1. **Large title**:  `Notifications` — `largeTitle`.  Mark all as read — small trailing link.

2. **Grouped by category** (`TODAY`, `GROWTH`, `OPPORTUNITIES`, `COMMUNITY`, `SYSTEM`):  
   Each group is a `SparkCard` with `SparkListRow` entries.  
   Priority notifications use `highlight` dot or `primary` left bar.  
   Swipe to dismiss or mark read.

3. **Empty state**:  
   `SparkEmptyState` with `notifications-off` icon.

### Motion
- Section rows stagger.
- Dismiss slides right with a fade.
- Unread dot pulses once on entry.

---

## 13. Analytics (Leadership)

### Visual personality
Data-rich but elegant.

### Background
`data` mode. Minimal neutral with controlled accents.

### Composition
1. **Hero KPI**:  
   `ANALYTICS` — `caption1`.  `Program overview` — `title1`.  
   3 metric tiles in a row: total students, active, engagement rate.

2. **Trend chart**:  
   A simple line or bar chart with `primary` / `green` / `highlight` series.  
   Axis and labels are `footnote`, muted.

3. **Insight cards**:  
   1–2 `SparkCard` rows with a leading insight number and a sentence explaining it.

### Motion
- Metrics count up.
- Chart draws from left to right.
- Insights fade in.

---

## 14. Impact

### Visual personality
Large-scale and visually meaningful.

### Background
`data` or `immersive` depending on screen. For Impact, use a soft `green` full-width hero behind the main statistic.

### Composition
1. **Hero metric**:  
   `YOUR IMPACT` — `caption1`.  A single oversized `metricLarge` number: e.g., `87%`.  A sentence below explaining the number.

2. **Secondary metrics**:  
   2–3 `SparkMetric` tiles.

3. **Insight list**:  
   `SparkListRow` with `+` or `↑` leading icons, explaining what the data means.

### Motion
- Large number counts up on entry.
- Green glow behind the hero metric pulses.
- Insight rows stagger in.

---

## 15. Progress

### Visual personality
Personal progress, calm, motivating.

### Background
`immersive` mode. Deep navy with a `blue` glow. Or `editorial` light mode with a large number.

### Composition
1. **Hero**:  
   `YOUR PROGRESS` — `caption1`.  `Level 7` — `metricLarge`.  `740 / 1,000 XP` — `body`.

2. **XP ring / streak**:  
   `SparkProgressRing` with streak inside.

3. **Achievements and insights**:  
   `SparkCard` with recent milestones and a short AI-style insight.

### Motion
- Level number springs in.
- Ring draws.
- Achievements pop.

---

## 16. Ambassador

### Visual personality
Professional, human, student-centered. A command center that feels warm, not corporate.

### Background
`editorial` mode. Clean with a `blue` or `green` hero for Today’s Focus.

### Composition
1. **Today’s Focus hero**:  
   `TODAY’S FOCUS` — `caption1`.  `3 students need attention` — `title1`.  `2 thriving` — `subheadline`.  A `SparkButton` to view all.

2. **Student cards** (one per student):  
   `SparkCard` with:  
   - Name / email.  
   - Status pill (needs attention = red, thriving = green, at risk = yellow).  
   - Quick action `SparkChip`s: `Recommend goal`, `Celebrate`, `Follow up`.

3. **Recent activity**:  
   A short `SparkTimeline` of latest actions.

### Motion
- Hero slides in.
- Student cards stagger.
- Status pills pop on entry.

---

## 17. Admin

### Visual personality
Functional, structured, efficient.

### Background
`clean` mode. No gradients, minimal cards.

### Composition
1. **Large title**:  `Admin` — `largeTitle`.

2. **User management** (grouped `SparkCard`):  
   `SparkListRow` for each user with name, email, role.

3. **Create event** (grouped `SparkCard` with form):  
   `SparkInput` for title, start, end, location.  `SparkButton`.

4. **Create announcement** (grouped `SparkCard` with form):  
   Title, body, scope, optional school ID.  `SparkButton`.

5. **Confirmation toasts** at the bottom:  
   `success` / `error` `SparkToast`.

### Motion
- Forms slide in from the bottom on modal open.
- Save button has a loading state.
- Toasts slide up.

---

## 18. Empty State Guidelines

Every empty state must answer:

1. **What is missing?**  
2. **Why it matters.**  
3. **What to do next.**

Use `SparkEmptyState` with a small abstract visual, not just an icon. Examples:

- **No tasks:** An `checkmark-circle` icon with `All caught up` and `Add your first task` CTA.
- **No goals:** An unfinished path graphic with `Start your first goal`.
- **No opportunities:** A discovery compass/horizon graphic with `Check back soon`.
- **No portfolio:** An empty canvas graphic with `Your story starts here`.

---

## 19. Loading State Guidelines

- Use `SparkSkeleton` for list and card content.
- Use `SparkShimmer` for hero and metric areas.
- Never show a centered spinner on a full screen unless the entire app is loading.
- Show content-aware skeletons: a placeholder for each content block.
