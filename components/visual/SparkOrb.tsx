// SparkNC Orb
// A softly pulsing brand orb for AI and dashboard heroes.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeProvider';

interface SparkOrbProps {
  size?: number;
  color?: string;
  pulse?: boolean;
  glow?: boolean;
}

export function SparkOrb({ size = 72, color, pulse = true, glow = true }: SparkOrbProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const tint = color ?? colors.primary;

  const float = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  if (pulse && !reduceMotion) {
    float.value = withRepeat(withTiming(-8, { duration: 4000 }), -1, true);
    opacity.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {glow ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.glow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: `${tint}40`,
            },
          ]}
        />
      ) : null}
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tint,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    transform: [{ scale: 1.4 }],
    opacity: 0.35,
  },
  orb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});
