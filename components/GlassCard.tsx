import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { colors as rawColors, spacing } from '../theme';

type GlassCardProps = ViewProps & { intensity?: 'low' | 'medium' | 'high' };

export function GlassCard({ children, style, intensity = 'medium', ...rest }: GlassCardProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const alpha = intensity === 'high' ? 0.82 : intensity === 'low' ? 0.55 : 0.7;
  const bgBase = isDark ? [17, 24, 39] : [255, 255, 255];
  const borderBase = isDark ? [51, 65, 85] : [226, 232, 240];

  const backgroundColor = `rgba(${bgBase[0]}, ${bgBase[1]}, ${bgBase[2]}, ${alpha})`;
  const borderColor = `rgba(${borderBase[0]}, ${borderBase[1]}, ${borderBase[2]}, ${intensity === 'high' ? 0.7 : 0.45})`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          shadowColor: isDark ? '#000' : rawColors.navy,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    overflow: 'hidden',
  },
});
