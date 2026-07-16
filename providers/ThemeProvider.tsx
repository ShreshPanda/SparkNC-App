import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: typeof lightColors | typeof darkColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme() ?? 'light';
  const [mode, setMode] = useState<ThemeMode>(systemTheme === 'dark' ? 'dark' : 'light');

  const colors = useMemo(() => (mode === 'dark' ? darkColors : lightColors), [mode]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      toggleTheme: () => setMode((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [colors, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
