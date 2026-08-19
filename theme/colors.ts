// Spark NC Brand Color System
// Derived from the Spark NC logo: deep royal blue, golden yellow, vivid green.

export const spark = {
  blue: '#08257C',
  blueHover: '#061D63',
  blueSoft: '#EEF2FF',
  blueTint: '#F4F6FF',

  yellow: '#FFD51F',
  yellowSoft: '#FFF8D6',
  yellowDeep: '#F5C400',

  green: '#00B86B',
  greenSoft: '#E8FAF2',
  greenDeep: '#00A35E',

  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F8FC',
  background: '#FFFFFF',

  textPrimary: '#101828',
  textBrand: '#08257C',
  textSecondary: '#667085',
  textInverse: '#FFFFFF',

  border: '#E4E7EC',
  borderStrong: '#D0D5DD',

  error: '#D92D20',
  errorSoft: '#FEF3F2',
  warning: '#DC8600',
  info: '#1570EF',
} as const;

// Legacy aliases for backward compatibility with existing code
export const colors = {
  navy: spark.blue,
  white: spark.white,
  spark: spark.green,
  gold: spark.yellow,
  slate: spark.border,
  mist: spark.surfaceSubtle,
  dark: '#0B0F1A',
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
  brand: spark.blue,
  brandYellow: spark.yellow,
  brandGreen: spark.green,
};

export const darkColors = {
  background: '#0B0F1A',
  surface: '#141A2E',
  surfaceSubtle: '#1A2138',
  foreground: '#F4F6FF',
  card: '#141A2E',
  border: '#2A3454',
  borderStrong: '#3A4670',
  primary: '#3B6FFF',
  primaryHover: '#2B5FEE',
  primarySoft: '#1A2138',
  accent: '#3B6FFF',
  highlight: spark.yellow,
  success: spark.green,
  successSoft: '#0D2E22',
  warning: spark.warning,
  error: '#F87171',
  errorSoft: '#2A1414',
  muted: '#8896B8',
  brand: '#3B6FFF',
  brandYellow: spark.yellow,
  brandGreen: spark.green,
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
  brand: string;
  brandYellow: string;
  brandGreen: string;
};
