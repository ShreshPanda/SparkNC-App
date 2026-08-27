// SparkNC Input
// Theme-aware text input with a subtle surface.

import React from 'react';
import { TextInput, StyleSheet, View, type TextInputProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

interface SparkInputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export function SparkInput({ icon, style, ...rest }: SparkInputProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          { color: colors.foreground },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  icon: { marginRight: spacing.sm },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
