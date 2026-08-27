// SparkNC Empty State Illustrations
// Lightweight, abstract visuals for priority empty states.
// All shapes are built from React Native Views — no external assets or SVG.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

const SIZE = 96;

export function EmptyTasksIllustration() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: colors.border }]} />
      <View style={[styles.checkShort, { backgroundColor: colors.success }]} />
      <View style={[styles.checkLong, { backgroundColor: colors.success }]} />
    </View>
  );
}

export function EmptyGrowthIllustration() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.stem, { backgroundColor: colors.success }]} />
      <View style={[styles.leaf, styles.leafLeft, { backgroundColor: colors.success }]} />
      <View style={[styles.leaf, styles.leafRight, { backgroundColor: colors.success }]} />
      <View style={[styles.seed, { backgroundColor: colors.muted }]} />
    </View>
  );
}

export function EmptyJourneyIllustration() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.path, { borderColor: colors.border }]} />
      <View style={[styles.dot, { backgroundColor: colors.muted, left: 16 }]} />
      <View style={[styles.dot, { backgroundColor: colors.primary, left: 42 }]} />
      <View style={[styles.dot, { backgroundColor: colors.success, left: 68 }]} />
    </View>
  );
}

export function EmptyPortfolioIllustration() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.canvas, { borderColor: colors.border }]}>
        <View style={[styles.spark, { backgroundColor: colors.primary }]} />
        <View style={[styles.flare, styles.flare1, { backgroundColor: colors.primary }]} />
        <View style={[styles.flare, styles.flare2, { backgroundColor: colors.success }]} />
      </View>
    </View>
  );
}

export function EmptyAchievementsIllustration() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.ray, { backgroundColor: colors.muted }]} />
      <View style={[styles.ray, { backgroundColor: colors.muted, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.ray, { backgroundColor: colors.muted, transform: [{ rotate: '90deg' }] }]} />
      <View style={[styles.ray, { backgroundColor: colors.muted, transform: [{ rotate: '135deg' }] }]} />
      <View style={[styles.starCenter, { backgroundColor: colors.highlight }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  checkShort: {
    position: 'absolute',
    width: 14,
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    left: 36,
    top: 48,
  },
  checkLong: {
    position: 'absolute',
    width: 28,
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    left: 44,
    top: 44,
  },
  stem: {
    position: 'absolute',
    width: 4,
    height: 30,
    borderRadius: 2,
    top: 28,
  },
  leaf: {
    position: 'absolute',
    width: 16,
    height: 10,
    borderRadius: 8,
    top: 34,
  },
  leafLeft: {
    left: 34,
    transform: [{ rotate: '-30deg' }],
  },
  leafRight: {
    right: 34,
    transform: [{ rotate: '30deg' }],
  },
  seed: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 22,
  },
  path: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 42,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  canvas: {
    width: 68,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spark: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flare: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  flare1: {
    transform: [{ rotate: '45deg' }],
  },
  flare2: {
    transform: [{ rotate: '-45deg' }],
  },
  ray: {
    position: 'absolute',
    width: 28,
    height: 4,
    borderRadius: 2,
  },
  starCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
