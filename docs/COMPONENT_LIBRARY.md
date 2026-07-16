# SparkNC Component Library

> **Source of truth for reusable UI components and expected behavior.**
>
> This library documents components that should exist (or their equivalents) so every feature is consistent.

---

## Component contract rules (global)
All components should:
- Accept `disabled`, `loading` where appropriate
- Use design tokens from `DESIGN_SYSTEM`
- Provide accessibility labels for icon-only controls
- Provide deterministic loading/empty/error behaviors when they own UI states

---

## Buttons
### `PrimaryButton`
- Primary CTA styling
- Loading spinner support
- Disabled and focus states

### `SecondaryButton`
- Secondary emphasis

### `DestructiveButton`
- Red semantic styling

---

## Cards
### `StandardCard`
- Default container with radius and padding

### `ActionCard`
- Entire card is clickable
- Includes hover/press feedback (web/mobile)

---

## Task cards
### `TaskCard`
- Displays task title, status, due date (if available)
- Shows completion affordance (checkbox/button)
- XP/points indicator (if enabled)

### `TaskListItem`
- Compact list row version

---

## Goal cards
### `GoalCard`
- Displays goal title, progress bar, streak/XP (optional)
- Includes quick actions (edit, view)

---

## Profile cards
### `ProfileCard`
- User avatar, name, role
- Optional stats (XP, streak)

---

## Navigation bars
### `TopBar`
- Screen title + optional actions
- Includes search input slot where applicable

### `BottomTabs`
- Primary navigation
- Active tab highlight

### `SearchBar`
- Debounced input
- Clear button

---

## Floating actions
### `FloatingActionButton (FAB)`
- Used for contextual create actions
- Supports loading/disabled

---

## Dialogs & sheets
### `Dialog`
- Confirmation/inputs in a modal
- Focus trap and dismiss semantics

### `BottomSheet`
- Mobile-friendly secondary panel
- Handles safe-area spacing

---

## Forms
### `FormField`
- Label + input + helper/error message

### `TextInput`
- Standard text input with icon support

### `DatePickerField`
- Trigger pattern with selected date display

---

## Calendar widgets
### `CalendarWidget`
- Monthly view (for future)
- Select date

### `ScheduleTimeline`
- Used for week/day timeline view

---

## Progress / gamification widgets
### `ProgressBar`
- Goal progress percent

### `XPWidget`
- Displays XP gained/total

### `StreakWidget`
- Displays streak count and last active

---

## Notifications and messaging
### `NotificationCard`
- Title + timestamp + category
- Optional CTA action

### `MessageBubble`
- Chat-like bubble
- Supports sender styling and timestamps

---

## Admin tables
### `AdminTable`
- Column headers, filters, pagination slots
- Safe empty state

---

## Implementation alignment
Use theme tokens and patterns from:
- `docs/DESIGN_SYSTEM.md`
- `docs/UX_PRINCIPLES.md`

When adding a component:
- add to this library doc
- implement with deterministic states
- add tests if it owns behavior beyond rendering

