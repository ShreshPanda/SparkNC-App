# SparkNC UX Principles

> **Source of truth for interaction and UX behavior.**
>
> These principles prevent inconsistent UX drift across screens.

---

## 1) Interaction philosophy
- **Fast-feeling UX**: show immediate feedback on every user action.
- **Cognitive friction minimization**: reduce steps for primary workflows.
- **One obvious next action**: avoid multiple competing CTAs.

---

## 2) Animation philosophy
- Animations should communicate state, not decorate.
- Keep motion subtle, consistent, and fast.
- Respect reduced motion.

---

## 3) Navigation philosophy
- Use consistent navigation patterns across platforms.
- Primary navigation should be reachable within one tap (mobile) or one scan (web).
- Back behavior must be predictable.

---

## 4) Micro-interactions
Examples:
- Button press feedback
- Toggle state with immediate color/label update
- Progress updates animate only slightly
- “Completed” confetti is short and optional

---

## 5) Feedback
Feedback types:
- Inline validation messages
- Toast/banner for completed actions
- Loading indicators for network operations

Rules:
- Never silently fail.
- Always provide recovery actions.

---

## 6) Haptics (mobile)
Use haptics sparingly:
- Light haptic for successful toggles
- Medium haptic for completion milestones (XP/streak)
- Avoid haptics on every keystroke.

---

## 7) Empty states
Empty states must:
- explain what’s missing
- offer the next best action
- match the component’s visual container (card vs page)

---

## 8) Loading experiences
Use the right loading level:
- Button loading: spinner + disable
- Section loading: skeleton in cards
- Page loading: full skeleton with stable layout

---

## 9) Delight moments
Delight is allowed only when it is:
- fast
- consistent
- non-blocking
- accessible (reduced motion support)

Examples:
- Streak increment micro-animation
- XP gain tick on task completion

---

## 10) Accessibility
Consistency rules:
- focus order
- readable text
- high contrast
- accessible labels
- reduced motion

---

## 11) Consistency rules
- Copy tone: friendly, professional, never slang-y.
- Date/time formatting: consistent across app.
- Status vocabulary: use stable terms (e.g., “In progress”, “Completed”).

---

## 12) Implementation alignment
This doc complements:
- `docs/DESIGN_SYSTEM.md`
- `docs/COMPONENT_LIBRARY.md`
- `docs/PRODUCT_BIBLE.md`

Any UX decision must map back to these principles.

## 13) Premium motion
- Every motion should explain state change, never just decorate.
- Use the motion tokens from `AnimationProvider` so all durations/easings are consistent.
- Screen entrances fade/slide in over 220–280ms.
- Card entrances stagger 40–80ms apart for a crafted feel.
- Celebrate milestones with short, optional animations that auto-dismiss.
- Always honor reduced-motion by disabling translation/scale and using simple opacity only.

## 14) Haptics & audio
- Light haptic on toggle success.
- Medium haptic on milestone completions (XP, streak, goal).
- No sound by default; only use audio if user explicitly enables it.

## 15) Premium delight
- Delight moments are small, fast, and non-blocking.
- Examples: welcome-back greeting, birthday badge, streak flame pulse, XP counter tick.
- Never let delight interrupt primary workflows or accessibility tools.

