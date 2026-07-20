import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { typography } from '../theme';

interface CelebrationOverlayProps {
  title?: string;
  subtitle?: string;
  visible: boolean;
  onComplete?: () => void;
}

export function CelebrationOverlay({ title = 'Great work!', subtitle = 'Keep the momentum going.', visible, onComplete }: CelebrationOverlayProps) {
  const { colors } = useTheme();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    const enter = Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true });
    const exit = Animated.timing(opacity, { toValue: 0, duration: 300, delay: 1500, useNativeDriver: true });
    enter.start(() => exit.start(() => onComplete?.()));
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity, backgroundColor: `${colors.background}E6` }]}>
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Text style={styles.icon}>🎉</Text>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 12, zIndex: 100 },
  badge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 40 },
  title: { ...typography.title },
  subtitle: { ...typography.body },
});
