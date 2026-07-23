import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { usePresentation } from '../../providers/PresentationProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, spacing, typography } from '../../theme';
import type { NotificationPreference } from '../../shared/types';

const defaultPrefs: NotificationPreference = {
  sendDeadlines: true,
  sendStreakAlerts: true,
  sendEvents: true,
  sendMessages: true,
  sendRecommendations: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  timezone: 'America/New_York',
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { enabled: presentationMode, toggle: togglePresentation } = usePresentation();
  const [prefs, setPrefs] = useState<NotificationPreference>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getNotificationPreferences();
      setPrefs({ ...defaultPrefs, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(update: Partial<NotificationPreference>) {
    const next = { ...prefs, ...update };
    setPrefs(next);
    try {
      setSaving(true);
      setSaved(false);
      await cloudflareService.updateNotificationPreferences(update);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await authService.signOut();
    } finally {
      // Navigation will redirect through auth gate on next render.
    }
  }

  function toggle(field: keyof NotificationPreference) {
    return (value: boolean) => save({ [field]: value });
  }

  if (loading) {
    return (
      <AppShell title="Settings">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        {saved ? <Text style={[styles.success, { color: colors.success }]}>Saved</Text> : null}
        {saving ? <Text style={[styles.body, { color: colors.muted }]}>Saving…</Text> : null}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Notification Preferences</Text>

          <ToggleRow label="Deadline reminders" value={prefs.sendDeadlines} onValueChange={toggle('sendDeadlines')} colors={colors} />
          <ToggleRow label="Streak alerts" value={prefs.sendStreakAlerts} onValueChange={toggle('sendStreakAlerts')} colors={colors} />
          <ToggleRow label="Event updates" value={prefs.sendEvents} onValueChange={toggle('sendEvents')} colors={colors} />
          <ToggleRow label="Message alerts" value={prefs.sendMessages} onValueChange={toggle('sendMessages')} colors={colors} />
          <ToggleRow label="Recommendations" value={prefs.sendRecommendations} onValueChange={toggle('sendRecommendations')} colors={colors} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Presentation</Text>
          <ToggleRow
            label="Presentation mode"
            value={presentationMode}
            onValueChange={togglePresentation}
            colors={colors}
          />
          <Text style={[styles.caption, { color: colors.muted }]}>
            Enlarges headers and hides navigation links while presenting.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Account</Text>
          <Pressable onPress={logout} style={[styles.button, { backgroundColor: colors.highlight }]}>
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  colors,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.body, { color: colors.foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={colors.accent} trackColor={{ false: colors.border, true: colors.accent }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.md },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
  buttonText: { color: colors.white, fontWeight: '700' },
  success: { ...typography.body },
  error: { ...typography.body },
});
