import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressBar({ progress, height = 6, color, trackColor }: ProgressBarProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.accent;
  const track = trackColor ?? colors.border;
  const width = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: track }]}>
      <View style={[styles.fill, { width: `${width}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 3, overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
});
