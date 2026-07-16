import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <View style={styles.links}>
          <Link href="/(tabs)/dashboard" asChild>
            <Pressable>
              <Text style={{ color: colors.accent }}>Dashboard</Text>
            </Pressable>
          </Link>
          <Link href="/(tabs)/settings" asChild>
            <Pressable>
              <Text style={{ color: colors.accent }}>Settings</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { marginBottom: spacing.xl, gap: spacing.sm },
  title: { ...typography.title },
  links: { flexDirection: 'row', gap: spacing.md },
});
