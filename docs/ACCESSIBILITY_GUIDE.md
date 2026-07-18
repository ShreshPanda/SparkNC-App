# SparkNC Accessibility & Inclusion Guide

## Principles
- SparkNC must be usable by everyone, including students using screen readers, keyboards, or larger text sizes.
- Accessibility is a feature, not a cleanup task.
- Design tokens and components must support high contrast and dynamic type scaling.

## Screen reader support
- Every interactive element has an `accessibilityLabel` and `accessibilityHint`.
- Images and icons have `accessibilityLabel` when they convey meaning.
- Decorative icons are marked `accessibilityElementsHidden={true}` or `importantForAccessibility="no"`.
- `SparkCard` uses `accessible` and `accessibilityRole="button"` when tappable.
- Lists use `FlatList` with `getItemLayout` and proper `accessibilityRole` for each row.

## Keyboard and web navigation
- Web views support `tabIndex` and visible focus indicators (`focus:ring-2 focus:ring-accent`).
- Buttons and links are reachable in a logical order.
- `Escape` closes modals and menus.
- `Enter` and `Space` activate buttons and cards.

## Visual accessibility
- Use `colors.foreground` and `colors.background` for text and surfaces.
- Minimum 4.5:1 contrast ratio for all body text.
- Minimum 3:1 for large text and UI icons.
- Never rely on color alone to communicate status (add text labels or icons).
- Support `useColorScheme()` and `userInterfaceStyle` changes.

## Font scaling
- Do not lock font sizes (`allowFontScaling` is enabled by default in React Native Text).
- Test with 200% font scale on iOS and Android.
- Use relative spacing (`spacing.md`) so layouts reflow gracefully.
- Avoid fixed heights for text containers.

## Interaction feedback
- Buttons have clear `activeOpacity` and pressed states.
- Touch targets are at least 44 × 44 pt.
- Form errors are announced with `accessibilityLiveRegion="polite"`.
- Loading and empty states are announced to screen readers.

## Inclusive language
- Use growth-focused, non-judgmental copy in the AI companion and notifications.
- Avoid binary or assumptions about identity, ability, or background.
- Write clear, concise labels and avoid jargon.

## Testing checklist
- [ ] Screen reader (VoiceOver / TalkBack) walks through login, dashboard, goals, and growth.
- [ ] Keyboard-only navigation works on web.
- [ ] 200% font scale does not truncate critical text.
- [ ] High contrast mode is readable.
- [ ] Color-blind friendly status indicators.
- [ ] `Skeleton` and `EmptyState` components are announced correctly.

## Component responsibilities
- `SparkCard`: exposes `accessibilityLabel` and `accessibilityRole`.
- `EmptyState`: sets `accessibilityRole="text"` and `accessibilityLiveRegion`.
- `Skeleton`: hidden from screen readers while loading (`accessibilityElementsHidden`).
- `AnimatedWrapper`: respects `prefers-reduced-motion` on web and reduces motion when requested.
