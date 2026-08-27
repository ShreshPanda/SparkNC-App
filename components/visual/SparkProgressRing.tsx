// SparkNC Progress Ring
// A circular progress ring with animated fill. Uses two View rings to avoid SVG dependency.

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeProvider';
import { typography } from '../../theme';

interface SparkProgressRingProps {
  progress: number; // 0–1
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  showGlow?: boolean;
  duration?: number;
  children?: React.ReactNode;
}

export function SparkProgressRing({
  progress,
  size = 80,
  stroke = 8,
  color,
  trackColor,
  showGlow = true,
  duration = 800,
  children,
}: SparkProgressRingProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const ringColor = color ?? colors.primary;
  const track = trackColor ?? colors.border;

  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = reduceMotion ? progress : withTiming(progress, { duration });
  }, [progress, reduceMotion, duration, fill]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${fill.value * 360}deg` }],
  }));

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const half = size / 2;

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      {showGlow ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: `${ringColor}30`,
              transform: [{ scale: 1.15 }],
            },
          ]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: track,
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: ringColor,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  inner: { justifyContent: 'center', alignItems: 'center' },
});
