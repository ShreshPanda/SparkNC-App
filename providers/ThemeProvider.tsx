import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from '../theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialMode(system: 'light' | 'dark' | null): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const params = new URL(window.location.href).searchParams;
      if (params.has('dark')) return 'dark';
      if (params.has('light')) return 'light';
      return 'light';
    } catch {}
  }
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme() ?? 'light';
  const [mode, setMode] = useState<ThemeMode>(() => readInitialMode(systemTheme));

  const colors = useMemo<ThemeColors>(() => (mode === 'dark' ? darkColors : lightColors), [mode]);

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
