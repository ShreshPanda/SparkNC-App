import React from 'react';
import { Image, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { colors } from '../theme';

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: ColorValue;
  trackColor?: ColorValue;
  label?: string;
};

export function ProgressRing({ progress, size = 80, strokeWidth = 8, color = colors.spark, trackColor = colors.slate, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const dashOffset = circumference * (1 - clamped / 100);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${String(trackColor)}" stroke-width="${strokeWidth}" fill="transparent"/><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${String(color)}" stroke-width="${strokeWidth}" fill="transparent" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" />
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  labelContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
});
