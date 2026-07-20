import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

interface PortfolioRecord {
  type: string;
  title: string;
  description?: string;
  date?: string;
}

interface PortfolioSummary {
  xp: number;
  streak: number;
  projects: PortfolioRecord[];
  goals: PortfolioRecord[];
  achievements: PortfolioRecord[];
  events: PortfolioRecord[];
  skills: PortfolioRecord[];
  certificates: PortfolioRecord[];
  leadership: PortfolioRecord[];
  community: PortfolioRecord[];
}

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/portfolio');
      const json = await response.json().catch(() => ({}));
      setPortfolio(json.portfolio ?? samplePortfolio());
    } catch {
      setPortfolio(samplePortfolio());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Portfolio">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  const p = portfolio!;

  return (
    <AppShell title="Portfolio">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <View style={[styles.stats, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{p.xp}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{p.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Streak</Text>
          </View>
        </View>

        <Section title="Projects" items={p.projects} colors={colors} />
        <Section title="Goals completed" items={p.goals} colors={colors} />
        <Section title="Achievements" items={p.achievements} colors={colors} />
        <Section title="Events attended" items={p.events} colors={colors} />
        <Section title="Skills" items={p.skills} colors={colors} />
        <Section title="Certificates" items={p.certificates} colors={colors} />
        <Section title="Leadership" items={p.leadership} colors={colors} />
        <Section title="Community" items={p.community} colors={colors} />
      </ScrollView>
    </AppShell>
  );
}

function Section({ title, items, colors }: { title: string; items: PortfolioRecord[]; colors: any }) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Nothing here yet.</Text>
      ) : (
        items.map((item) => (
          <View key={`${item.type}-${item.title}`} style={styles.item}>
            <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
            {item.description ? <Text style={[styles.itemDesc, { color: colors.muted }]}>{item.description}</Text> : null}
            {item.date ? <Text style={[styles.itemDate, { color: colors.muted }]}>{new Date(item.date).toLocaleDateString()}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

function samplePortfolio(): PortfolioSummary {
  return {
    xp: 540,
    streak: 12,
    projects: [{ type: 'project', title: 'Community Impact Project', description: 'Led a fundraising campaign.', date: '2025-11-15' }],
    goals: [{ type: 'goal', title: 'Complete 20 tasks', description: 'Built consistent study habits.', date: '2025-10-30' }],
    achievements: [{ type: 'achievement', title: 'First Steps', description: 'Unlocked first achievement.', date: '2025-09-20' }],
    events: [{ type: 'event', title: 'SparkNC Kickoff', date: '2025-09-10' }],
    skills: [{ type: 'skill', title: 'Public Speaking' }, { type: 'skill', title: 'Project Management' }],
    certificates: [{ type: 'certificate', title: 'Leadership Foundations', date: '2025-12-01' }],
    leadership: [{ type: 'leadership', title: 'Ambassador' }],
    community: [{ type: 'community', title: 'Top Contributor' }],
  };
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stats: { flexDirection: 'row', padding: spacing.md, borderRadius: 20, borderWidth: 1 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption },
  section: { padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  heading: { ...typography.heading },
  empty: { ...typography.body },
  item: { paddingVertical: spacing.xs },
  itemTitle: { ...typography.body, fontWeight: '600' },
  itemDesc: { ...typography.body },
  itemDate: { ...typography.caption },
  error: { ...typography.body },
});
