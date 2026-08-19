import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePresentation } from '../providers/PresentationProvider';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

export function AppShell({ title, children, transparent }: { title: string; children: React.ReactNode; transparent?: boolean }) {
  const { colors } = useTheme();
  const { enabled } = usePresentation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        !transparent && { backgroundColor: colors.background },
        enabled && styles.containerPresentation,
        { paddingTop: insets.top + spacing.sm },
      ]}
    >
      {enabled ? (
        <View style={styles.demoHint}>
          <View style={[styles.demoPill, { backgroundColor: colors.highlight }]}>
            <Text style={[styles.demoPillText, { color: colors.foreground }]}>Demo mode</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.header}>
        <Text style={[enabled ? styles.titleLarge : styles.title, { color: colors.brand ?? colors.foreground }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  containerPresentation: { padding: spacing.xl },
  header: { marginBottom: spacing.lg, gap: spacing.sm },
  title: { ...typography.title },
  titleLarge: { ...typography.display },
  demoHint: { alignItems: 'center', marginBottom: spacing.md },
  demoPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  demoPillText: { ...typography.caption, fontWeight: '700' },
});
