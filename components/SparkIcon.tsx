import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spark } from '../theme';

// The Spark — a recurring brand motif derived from the logo's yellow starburst.
// Use sparingly: loading, empty states, achievements, featured markers.
export function SparkIcon({ size = 24, color = spark.yellow, style }: { size?: number; color?: string; style?: any }) {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name="sparkles" size={size} color={color} />
    </View>
  );
}

// Spark badge — small circular brand element for featured/achievement moments
export function SparkBadge({ size = 32, color = spark.yellow, bgColor = spark.blue }: { size?: number; color?: string; bgColor?: string }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Ionicons name="sparkles" size={size * 0.55} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
