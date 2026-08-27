// Spark NC Typography System
// iOS-first scale with legacy aliases for backward compatibility.
// Uses the system font (San Francisco on iOS) for a native, premium feel.

export const typography = {
  // iOS-style hierarchy — new primary scale
  display: { fontSize: 44, fontWeight: '800' as const, lineHeight: 50, letterSpacing: -0.8 },
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41, letterSpacing: -0.5 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.2 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26, letterSpacing: -0.2 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22, letterSpacing: 0 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 24, letterSpacing: 0 },
  callout: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22, letterSpacing: 0 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, letterSpacing: 0.1 },
  caption1: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.2 },
  caption2: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 0.2 },
  microLabel: { fontSize: 10, fontWeight: '500' as const, lineHeight: 12, letterSpacing: 0.2 },

  secondaryBody: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0 },

  // Metrics
  metric: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38, letterSpacing: -0.5 },
  metricLarge: { fontSize: 44, fontWeight: '800' as const, lineHeight: 50, letterSpacing: -0.8 },

  // Legacy aliases — kept for existing code
  displayLegacy: { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.3 },
  titleBrand: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.3 },
  heading: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, letterSpacing: -0.2 },
  headingBrand: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, letterSpacing: -0.2 },
  subheading: { fontSize: 17, fontWeight: '600' as const, lineHeight: 23, letterSpacing: 0 },
  bodyMedium: { fontSize: 17, fontWeight: '500' as const, lineHeight: 24, letterSpacing: 0 },
  bodyBrand: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 0 },
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18, letterSpacing: 0 },
  captionBrand: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0 },
  label: { fontSize: 14, fontWeight: '700' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelSmall: { fontSize: 12, fontWeight: '700' as const, lineHeight: 16, letterSpacing: 0.3 },
} as const;
