import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

export default function LoginScreen() {
  const { colors } = useTheme();

  return (
    <AppShell title="Welcome back">
      <View style={styles.card}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Sign in to SparkNC</Text>
        <Text style={[styles.body, { color: colors.muted }]}>Premium workspace for students and leaders.</Text>
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable style={[styles.button, { backgroundColor: colors.accent }]}> 
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </Link>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: 20, backgroundColor: '#ffffff' },
  heading: { ...typography.heading },
  body: { ...typography.body },
  button: { paddingVertical: spacing.md, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '700' },
});
