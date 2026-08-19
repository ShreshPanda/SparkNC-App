// Spark NC Typography System
// Geometric, bold, friendly — complementing the logo's rounded geometric style.
// Uses system font (San Francisco on iOS) which is geometric and clean,
// with strong weights matching the logo's visual weight.

export const typography = {
  // Display — large hero numbers and splash moments
  display: { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -0.5 },

  // Title — screen headers, main headings
  title: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.3 },
  titleBrand: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.3 },

  // Heading — section headers, card titles
  heading: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, letterSpacing: -0.2 },
  headingBrand: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, letterSpacing: -0.2 },

  // Subheading — secondary headings
  subheading: { fontSize: 17, fontWeight: '600' as const, lineHeight: 23 },

  // Body — primary readable text
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodyBrand: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },

  // Caption — metadata, timestamps, labels
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  captionBrand: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },

  // Label — buttons, tags, pills
  label: { fontSize: 14, fontWeight: '700' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelSmall: { fontSize: 12, fontWeight: '700' as const, lineHeight: 16, letterSpacing: 0.3 },

  // Metric — large numbers for stats
  metric: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38, letterSpacing: -0.5 },
  metricLarge: { fontSize: 44, fontWeight: '800' as const, lineHeight: 50, letterSpacing: -0.8 },
} as const;
