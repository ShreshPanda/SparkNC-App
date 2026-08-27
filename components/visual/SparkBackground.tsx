// SparkNC Background System
// Per-screen background component for the 7 approved Aura modes.
// Uses only React Native primitives (no blur, no linear-gradient dependency).

import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { backgroundColors, backgroundGlows, backgroundGradients, type BackgroundMode } from '../../theme/backgrounds';
import { useReducedMotion } from 'react-native-reanimated';

interface SparkBackgroundProps {
  mode: BackgroundMode;
  children: React.ReactNode;
  insetTop?: number;
}

const screen = Dimensions.get('window');

function GradientStop({ color, top, height }: { color: string; top: number; height: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height,
        backgroundColor: color,
      }}
      pointerEvents="none"
    />
  );
}

function GlowOrb({
  color,
  size,
  top,
  left,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      pointerEvents="none"
    />
  );
}

export function SparkBackground({ mode, children, insetTop = 0 }: SparkBackgroundProps) {
  const { mode: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const reduceMotion = useReducedMotion();

  const base = isDark ? backgroundColors.dark : backgroundColors.light;
  const backgroundColor = base[mode] ?? base.base;

  const gradient = isDark ? backgroundGradients[mode].dark : backgroundGradients[mode].light;
  const glows = isDark ? backgroundGlows[mode].dark : backgroundGlows[mode].light;

  const gradientHeight = 260;
  const stopHeight = gradient.length ? gradientHeight / gradient.length : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {gradient.map((color, i) => (
        <GradientStop
          key={i}
          color={color}
          top={insetTop + i * stopHeight}
          height={stopHeight}
        />
      ))}

      {!reduceMotion &&
        glows?.map((glow, i) => {
          const top = glow.top * screen.height;
          const left = glow.left * screen.width;
          return <GlowOrb key={i} color={glow.color} size={glow.size} top={top} left={left} />;
        })}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
