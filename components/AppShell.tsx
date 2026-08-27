import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePresentation } from '../providers/PresentationProvider';
import { useTheme } from '../providers/ThemeProvider';
import { backgroundColors, type BackgroundMode } from '../theme/backgrounds';
import { SparkBackground } from './visual/SparkBackground';
import { radius, spacing, typography } from '../theme';

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
  transparent?: boolean;
  mode?: BackgroundMode;
  overline?: string;
  trailing?: React.ReactNode;
};

export function AppShell({ title, children, transparent, mode, overline, trailing }: AppShellProps) {
  const { colors, mode: themeMode } = useTheme();
  const { enabled } = usePresentation();
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark';
  const base = isDark ? backgroundColors.dark : backgroundColors.light;
  const backgroundColor = mode ? base[mode] : transparent ? undefined : colors.background;

  const Header = (
    <View style={styles.header}>
      {overline ? <Text style={[styles.overline, { color: colors.muted }]}>{overline}</Text> : null}
      {title ? (
        <View style={styles.titleRow}>
          <Text style={[enabled ? styles.titleLarge : styles.title, { color: colors.foreground }]}>{title}</Text>
          {trailing}
        </View>
      ) : null}
    </View>
  );

  const Content = (
    <View style={[
      styles.container,
      !backgroundColor && !mode && { backgroundColor: transparent ? undefined : colors.background },
      enabled && styles.containerPresentation,
      { paddingTop: insets.top + spacing.sm },
    ]}>
      {enabled ? (
        <View style={styles.demoHint}>
          <View style={[styles.demoPill, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.demoPillText, { color: colors.primary }]}>Demo mode</Text>
          </View>
        </View>
      ) : null}
      {Header}
      {children}
    </View>
  );

  if (mode) {
    return (
      <SparkBackground mode={mode} insetTop={insets.top}>
        {Content}
      </SparkBackground>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  containerPresentation: { padding: spacing.xl },
  header: { marginBottom: spacing.md, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.largeTitle },
  titleLarge: { ...typography.display },
  overline: { ...typography.caption1, textTransform: 'uppercase' },
  demoHint: { alignItems: 'center', marginBottom: spacing.md },
  demoPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  demoPillText: { ...typography.caption1, fontWeight: '700' },
});
