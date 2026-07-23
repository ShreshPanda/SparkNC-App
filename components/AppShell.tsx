import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePresentation } from '../providers/PresentationProvider';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const { enabled } = usePresentation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, enabled && styles.containerPresentation]}>
      {enabled ? (
        <View style={styles.demoHint}>
          <View style={[styles.demoPill, { backgroundColor: colors.highlight }]}>
            <Text style={[styles.demoPillText, { color: colors.foreground }]}>Demo mode</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.header}>
        <Text style={[enabled ? styles.titleLarge : styles.title, { color: colors.foreground }]}>{title}</Text>
        {!enabled ? (
          <View style={styles.links}>
            <Link href="/(tabs)/dashboard" asChild>
              <Pressable>
                <Text style={{ color: colors.accent }}>Dashboard</Text>
              </Pressable>
            </Link>
            <Link href="/(tabs)/profile" asChild>
              <Pressable>
                <Text style={{ color: colors.accent }}>Profile</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  containerPresentation: { padding: spacing.xl },
  header: { marginBottom: spacing.xl, gap: spacing.sm },
  title: { ...typography.title },
  titleLarge: { ...typography.title, fontSize: 40, lineHeight: 48 },
  links: { flexDirection: 'row', gap: spacing.md },
  demoHint: { alignItems: 'center', marginBottom: spacing.md },
  demoPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999 },
  demoPillText: { ...typography.caption, fontWeight: '700' },
});
