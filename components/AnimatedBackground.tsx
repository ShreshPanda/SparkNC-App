import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { colors as rawColors } from '../theme/colors';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

const ORB_COUNT = 4;

export function AnimatedBackground({ children, intensity = 'medium' }: AnimatedBackgroundProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const anims = useRef<Animated.Value[]>([]);
  const loops = useRef<Animated.CompositeAnimation[]>([]);

  if (anims.current.length === 0) {
    for (let i = 0; i < ORB_COUNT; i++) {
      anims.current.push(new Animated.Value(0));
    }
  }

  useEffect(() => {
    loops.current = anims.current.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000 + i * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 6000 + i * 1500,
            useNativeDriver: true,
          }),
        ]),
      )
    );
    loops.current.forEach((l) => l.start());
    return () => {
      loops.current.forEach((l) => l.stop());
    };
  }, []);

  const palette = isDark
    ? [colors.accent, colors.highlight, rawColors.info, rawColors.creative]
    : ['#22c55e', '#fbbf24', '#3b82f6', '#a855f7'];

  const sizeBase = intensity === 'high' ? 420 : intensity === 'low' ? 260 : 340;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        {anims.current.map((anim, i) => {
          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
          const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.12, 0.28, 0.12],
          });
          const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, -20] });

          const size = sizeBase + (i % 2) * 80;
          const top = [10, 35, 55, 20][i];
          const left = [10, 50, 20, 55][i];

          return (
            <Animated.View
              key={i}
              style={[
                styles.orb,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  top: `${top}%`,
                  left: `${left}%`,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  backgroundColor: palette[i % palette.length],
                  opacity,
                  transform: [{ scale }, { translateX }, { translateY }],
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: {
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});
