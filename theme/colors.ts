// Spark NC Brand Color System
// Derived from the Spark NC logo: deep royal blue, golden yellow, vivid green.

export const spark = {
  navy: '#071A33',
  blue: '#0B5FFF',
  blueHover: '#0A4FD8',
  blueSoft: '#EAF2FF',
  blueTint: '#F4F6FF',

  yellow: '#FFD43B',
  yellowSoft: '#FFF8D6',
  yellowDeep: '#F5C400',

  green: '#18B96B',
  greenSoft: '#E8FAF2',
  greenDeep: '#14A35E',

  // Navy depth scale
  navy900: '#02080F',
  navy800: '#0E1D33',
  navy700: '#132944',
  navy600: '#1E3A5F',
  navy500: '#2A4A70',
  navy400: '#3A5273',
  navy100: '#E5E9EF',
  navy50: '#F4F6FF',

  // Blue depth scale
  blue900: '#0A3FCC',
  blue700: '#4F8CFF',
  blue100: '#EAF2FF',
  blue50: '#F4F6FF',
  blueTranslucent: 'rgba(11, 95, 255, 0.12)',

  // Green depth scale
  green900: '#0F8A53',
  green700: '#4CD495',
  green100: '#E8FAF2',
  green50: '#F0FCF8',
  greenTranslucent: 'rgba(24, 185, 107, 0.12)',

  // Yellow depth scale
  yellow900: '#D9B02A',
  yellow700: '#FFE67A',
  yellow100: '#FFF8DD',
  yellow50: '#FFFDF4',
  yellowTranslucent: 'rgba(255, 212, 59, 0.20)',

  // Glow and translucent tints
  glowPrimary: 'rgba(11, 95, 255, 0.22)',
  glowSuccess: 'rgba(24, 185, 107, 0.22)',
  glowHighlight: 'rgba(255, 212, 59, 0.28)',
  navyTranslucent: 'rgba(7, 26, 51, 0.06)',

  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F2F4F7',
  background: '#F7F8FA',

  textPrimary: '#071A33',
  textBrand: '#071A33',
  textSecondary: '#5B6B82',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  error: '#D92D20',
  errorSoft: '#FEF3F2',
  warning: '#F59E0B',
  info: '#1570EF',
} as const;

// Legacy aliases for backward compatibility with existing code
export const colors = {
  navy: spark.navy,
  white: spark.white,
  spark: spark.green,
  gold: spark.yellow,
  slate: spark.border,
  mist: spark.surfaceSubtle,
  dark: spark.navy,
  muted: spark.textSecondary,
  info: spark.info,
  creative: '#7C56FF',
} as const;

export const lightColors = {
  background: spark.background,
  surface: spark.surface,
  surfaceSubtle: spark.surfaceSubtle,
  foreground: spark.textPrimary,
  card: spark.surface,
  border: spark.border,
  borderStrong: spark.borderStrong,
  primary: spark.blue,
  primaryHover: spark.blueHover,
  primarySoft: spark.blueSoft,
  accent: spark.blue, // Brand blue is the primary accent
  highlight: spark.yellow, // Yellow for special spark moments
  success: spark.green,
  successSoft: spark.greenSoft,
  warning: spark.warning,
  error: spark.error,
  errorSoft: spark.errorSoft,
  muted: spark.textSecondary,
  info: spark.info,
  brand: spark.navy,
  brandYellow: spark.yellow,
  brandGreen: spark.green,

  // Aura depth, glow, and brand tints
  navy: spark.navy,
  navy900: spark.navy900,
  navy800: spark.navy800,
  navy700: spark.navy700,
  navy600: spark.navy600,
  navy100: spark.navy100,
  navy50: spark.navy50,
  navyTranslucent: spark.navyTranslucent,

  blue: spark.blue,
  blue900: spark.blue900,
  blue700: spark.blue700,
  blue100: spark.blue100,
  blue50: spark.blue50,
  blueTranslucent: spark.blueTranslucent,

  green: spark.green,
  green900: spark.green900,
  green700: spark.green700,
  green100: spark.green100,
  green50: spark.green50,
  greenTranslucent: spark.greenTranslucent,

  yellow: spark.yellow,
  yellow900: spark.yellow900,
  yellow700: spark.yellow700,
  yellow100: spark.yellow100,
  yellow50: spark.yellow50,
  yellowTranslucent: spark.yellowTranslucent,

  glowPrimary: spark.glowPrimary,
  glowSuccess: spark.glowSuccess,
  glowHighlight: spark.glowHighlight,
};

export const darkColors = {
  background: '#071A33',
  surface: '#0E1D33',
  surfaceSubtle: '#132944',
  foreground: '#F4F6FF',
  card: '#0E1D33',
  border: '#1E3A5F',
  borderStrong: '#2A4A70',
  primary: '#4F8CFF',
  primaryHover: '#6AA0FF',
  primarySoft: '#132944',
  accent: '#4F8CFF',
  highlight: spark.yellow,
  success: spark.green,
  successSoft: '#0D2E22',
  warning: spark.warning,
  error: '#F87171',
  errorSoft: '#2A1414',
  muted: '#8A9AB0',
  info: '#4F8CFF',
  brand: '#F4F6FF',
  brandYellow: spark.yellow,
  brandGreen: spark.green,

  // Aura depth, glow, and brand tints
  navy: '#071A33',
  navy900: spark.navy900,
  navy800: spark.navy800,
  navy700: spark.navy700,
  navy600: spark.navy600,
  navy100: spark.navy100,
  navy50: spark.navy50,
  navyTranslucent: spark.navyTranslucent,

  blue: '#4F8CFF',
  blue900: spark.blue900,
  blue700: '#4F8CFF',
  blue100: spark.blue100,
  blue50: spark.blue50,
  blueTranslucent: spark.blueTranslucent,

  green: spark.green,
  green900: spark.green900,
  green700: '#4CD495',
  green100: spark.green100,
  green50: spark.green50,
  greenTranslucent: spark.greenTranslucent,

  yellow: spark.yellow,
  yellow900: spark.yellow900,
  yellow700: spark.yellow700,
  yellow100: spark.yellow100,
  yellow50: spark.yellow50,
  yellowTranslucent: spark.yellowTranslucent,

  glowPrimary: 'rgba(79, 140, 255, 0.22)',
  glowSuccess: 'rgba(24, 185, 107, 0.22)',
  glowHighlight: 'rgba(255, 212, 59, 0.28)',
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSubtle: string;
  foreground: string;
  card: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  accent: string;
  highlight: string;
  success: string;
  successSoft: string;
  warning: string;
  error: string;
  errorSoft: string;
  muted: string;
  info: string;
  brand: string;
  brandYellow: string;
  brandGreen: string;

  // Aura depth, brand, and glow tokens
  navy: string;
  navy900: string;
  navy800: string;
  navy700: string;
  navy600: string;
  navy100: string;
  navy50: string;
  navyTranslucent: string;

  blue: string;
  blue900: string;
  blue700: string;
  blue100: string;
  blue50: string;
  blueTranslucent: string;

  green: string;
  green900: string;
  green700: string;
  green100: string;
  green50: string;
  greenTranslucent: string;

  yellow: string;
  yellow900: string;
  yellow700: string;
  yellow100: string;
  yellow50: string;
  yellowTranslucent: string;

  glowPrimary: string;
  glowSuccess: string;
  glowHighlight: string;
};
