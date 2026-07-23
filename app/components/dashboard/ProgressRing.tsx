import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { spacing, typography } from '../../../theme';

interface ProgressRingProps {
  progress: number; // 0–1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({ progress, size = 160, strokeWidth = 14, label, sublabel }: ProgressRingProps) {
  const { colors } = useTheme();
  const percentage = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);
  const half = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.progress,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: colors.accent,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: `${-90 + percentage * 360}deg` }],
            opacity: percentage > 0 ? 1 : 0,
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={[styles.value, { color: colors.foreground }]}>{Math.round(percentage * 100)}%</Text>
        {label ? <Text style={[styles.label, { color: colors.muted }]}>{label}</Text> : null}
        {sublabel ? <Text style={[styles.sublabel, { color: colors.muted }]}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute' },
  progress: { position: 'absolute' },
  center: { alignItems: 'center', gap: spacing.xs },
  value: { ...typography.title },
  label: { ...typography.caption },
  sublabel: { ...typography.caption, opacity: 0.7 },
});
