// Spark NC Surface System
// Reusable surface shape and spacing presets. Color is applied by components using theme tokens.

import { radius, shadows, spacing } from './spacing';

export const surfaces = {
  hero: {
    padding: spacing.xl,
    borderRadius: radius.xxl,
    gap: spacing.md,
  },
  elevated: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.sm,
  },
  grouped: {
    padding: 0,
    borderRadius: radius.lg,
    gap: 0,
    overflow: 'hidden' as const,
  },
  listRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 56,
  },
  metric: {
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  metricLarge: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'flex-start' as const,
    gap: spacing.sm,
  },
  editorial: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  action: {
    padding: spacing.md,
    borderRadius: radius.md,
    minHeight: 52,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  input: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
  },
} as const;
