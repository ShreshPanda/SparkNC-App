import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface ConfettiProps {
  active: boolean;
  onDone?: () => void;
  count?: number;
  duration?: number;
}

const { width } = Dimensions.get('window');

export function Confetti({ active, onDone, count = 40, duration = 2200 }: ConfettiProps) {
  const anims = useRef<Animated.Value[]>([]);
  const particles = useMemo(() => {
    const palette = ['#22c55e', '#fbbf24', '#3b82f6', '#a855f7', '#ef4444', '#0f172a'];
    return Array.from({ length: count }).map((_, i) => ({
      color: palette[i % palette.length],
      left: Math.random() * width,
      delay: Math.random() * 400,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 120,
      fall: 250 + Math.random() * 250,
    }));
  }, [count]);

  if (anims.current.length !== count) {
    anims.current = Array.from({ length: count }).map(() => new Animated.Value(0));
  }

  useEffect(() => {
    if (!active) return;
    const animsToStart = anims.current.slice(0, count);
    const animation = Animated.stagger(
      60,
      animsToStart.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: duration + particles[i].delay,
          useNativeDriver: true,
        })
      )
    );
    animation.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => {
      animation.stop();
      animsToStart.forEach((a) => a.setValue(0));
    };
  }, [active, count, duration, onDone, particles]);

  if (!active) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="none">
      {particles.map((p, i) => {
        const anim = anims.current[i];
        const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, p.fall] });
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotation + 720}deg`] });
        const opacity = anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 4,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
