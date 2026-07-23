import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { colors as baseColors, spacing } from '../theme';

export function SparkCard({ children, style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: baseColors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
