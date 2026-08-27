// Spark NC Spacing System
// Generous whitespace is part of the brand language.
// Includes both the legacy token names (xs, sm, md...) and an iOS-style numeric scale (space4, space8...).

export const space = {
  space0: 0,
  space2: 2,
  space4: 4,
  space8: 8,
  space12: 12,
  space16: 16,
  space20: 20,
  space24: 24,
  space32: 32,
  space40: 40,
  space48: 48,
  space64: 64,
} as const;

// Legacy aliases — still used throughout the app
export const spacing = {
  xs: space.space4,
  sm: space.space8,
  md: space.space12,
  lg: space.space16,
  xl: space.space24,
  xxl: space.space32,
  xxxl: space.space48,
} as const;

// Spark NC Shape System — rounded, friendly, bold
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

// Spark NC Shadow System — subtle, soft, minimal
// Use only `sm` and `md` for general UI.
export const shadows = {
  none: {},
  sm: {
    shadowColor: 'rgba(7, 26, 51, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: 'rgba(7, 26, 51, 0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: 'rgba(7, 26, 51, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  brand: {
    shadowColor: 'rgba(7, 26, 51, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
