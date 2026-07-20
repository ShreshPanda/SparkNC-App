# SparkNC Design System

> **Source of truth for UI tokens + component behavior.**
>
> This design system is intentionally prescriptive so every screen feels cohesive, premium, and fast.

---

## 1) Color palette
Colors are defined as semantic tokens (not raw hex everywhere).

### Core
- **Primary**: `brand` (action/CTA, highlights)
- **Secondary**: supportive accents (chips, secondary buttons)
- **Background**: `bg` (app surfaces)
- **Surface**: `surface` (cards, elevated panels)
- **Text**: `text` (primary), `mutedText` (secondary)
- **Border**: `border` (hairline boundaries)
- **Success/Warning/Error/Info**: semantic feedback colors

> Implementation note: use `theme/colors.ts` for the authoritative token values; this doc defines the intended roles.

### Status colors (semantic)
- Success: confirmations, positive XP, resolved states
- Warning: attention needed (validation, soft errors)
- Error: destructive or blocking issues
- Info: guidance, neutral notifications

---

## 2) Typography
Semantic hierarchy (map to your existing `theme/typography.ts`):
- `display` / `h1`: highest-level screen headers
- `h2`: section titles
- `body`: default reading text
- `caption`: helper text, metadata
- `label`: form labels
- `mono`: technical identifiers (IDs, codes) if needed

Rules:
- Prefer one font family family; vary only size/weight/line-height.
- Body text must meet contrast requirements in both light/dark.

---

## 3) Spacing
Use the spacing scale tokens (see `theme/spacing.ts`) and follow these layout rules:
- App padding: consistent page gutters.
- Section spacing: vertical rhythm (headers/cards).
- Component internal padding: standardized per component type.

Guideline:
- Avoid arbitrary margins; if you need a new spacing token, add it once.

---

## 4) Corner radius
Use a small set of radius tokens:
- `radius-sm`: inputs, small chips
- `radius-md`: cards, dialogs
- `radius-lg`: elevated panels, large containers

Rules:
- Chips look slightly more rounded than cards.
- Buttons follow the same radius as inputs for consistency.

---

## 5) Elevation
Define elevation levels (shadow/overlay):
- `e1`: subtle cards
- `e2`: dialogs/sheets
- `e3`: top-level overlays (rare)

Rules:
- Prefer subtle elevation over heavy shadows (premium minimal look).
- Ensure elevation is visible in both themes.

---

## 6) Cards
Cards are the primary content container.

Behavior:
- Always have: border (or surface), padding, consistent radius.
- Loading: skeletons inside cards.
- Empty: card can host empty-state illustration/copy.

Card types:
- **Standard card** (default)
- **Action card** (clickable whole area)
- **Info card** (read-only details)

---

## 7) Buttons
Button types:
- **Primary**: main CTA
- **Secondary**: secondary actions
- **Tertiary/Text**: low emphasis actions
- **Destructive**: delete/irreversible operations

States:
- Default
- Hover/Focus (web)
- Pressed
- Disabled
- Loading (spinner + disabled)

Rules:
- Primary is used for the single most important next action.
- Avoid multiple primary buttons on one view.

---

## 8) Inputs
Input types:
- Text
- Textarea
- Select (if used)
- Search input
- Date/time pickers trigger

States:
- Default
- Focus
- Disabled
- Error (with helper message)
- Success (optional for inline validation)

Rules:
- Show inline helper/error text; never only color.
- Use consistent left icon/right icon spacing.

---

## 9) Navigation
Navigation components:
- Bottom tabs (mobile primary)
- Top bar / header (web/tablet)
- Secondary drawers/sheets (context actions)

Rules:
- Active tab uses semantic highlight color.
- Navigation items have readable labels (not just icons).

---

## 10) Icons
Rules:
- Icons are consistent in stroke width/size.
- Use semantic icon meanings (e.g., check, warning, message).
- Provide accessible labels for icon-only buttons.

---

## 11) Animations
Motion philosophy: responsive and subtle.

### Motion timing
- Micro transitions: 120–180ms
- Navigation transitions: 200–280ms
- Modal/sheet open/close: 220–320ms

### Transitions
- Prefer opacity + slight translate.
- Avoid long easing curves.

---

## 12) Loading states
Patterns:
- Skeleton lines inside cards
- Inline spinners for buttons
- Full-page skeleton for first load

Rules:
- Loading states must not shift layout drastically.

---

## 13) Error states
Patterns:
- Inline field error for validation issues
- Card-level error with retry
- Global error banner for systemic failures

Rules:
- Always provide a recovery action (Retry / Go back / Contact support) where appropriate.

---

## 14) Success states
Patterns:
- Toast + subtle confirmation
- Inline success indicator
- Streak/XP celebratory micro-animation (short)

Rules:
- Success must not be disruptive; keep it minimal.

---

## 15) Empty states
Patterns:
- Empty card with title + guidance
- CTA button to create/subscribe

Rules:
- Empty states should teach the user the “next best action.”

---

## 16) Responsive behavior
- Mobile: bottom tabs; modals/sheets for secondary actions.
- Web: top bar + side/table patterns where useful.
- Keep touch targets at least 44px.

---

## 17) Accessibility
- Sufficient color contrast.
- Support screen readers with accessible labels.
- Focus states visible on web.
- Reduced motion: respect OS preference.

---

## 18) Dark mode
All tokens must have light/dark equivalents. Never use fixed-color literals for text/background.

Rules:
- In dark mode, keep surfaces slightly lighter than background with subtle borders.

---

## 19) Component behavior
General component contracts:
- Every component exposes: `loading`, `disabled`, and `onPress`/handlers.
- Components handle accessibility: label props, focus order, and announcements where needed.
- Errors never swallow underlying details; they render safe messages to users.

---

## 20) Implementation alignment
Use existing theme modules:
- `theme/colors.ts`
- `theme/spacing.ts`
- `theme/typography.ts`
- `providers/ThemeProvider.tsx`

If you add tokens, add them once and update the mapping in theme files.

## 21) Premium polish (Sprint 8)
- Use 1px hairline borders with `border` tokens for a light, precise look.
- Cards should have generous internal padding and consistent corner radii (`radius-md`).
- Avoid heavy shadows; prefer subtle opacity or border shifts for elevation.
- Maintain a clear "one primary action" rule on every screen.
- Empty states are full card-height with an icon, friendly title, and a single next action.
- Loading states use skeleton blocks that mirror final content to prevent layout shift.
- Touch targets are at least 44x44px; buttons have at least 12px vertical padding.
- All spacing uses the theme scale; no arbitrary margins.
- Dark mode preserves the same visual hierarchy with surfaces slightly lighter than the background.

