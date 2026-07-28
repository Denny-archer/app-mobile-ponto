import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

type AppButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ title, variant = "primary", loading = false, disabled, leftIcon, style, ...props }: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textStyle = variant === "primary" || variant === "danger" ? styles.lightText : styles.darkText;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === "primary" || variant === "danger" ? colors.white : colors.primary} /> : leftIcon}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: "#E8F1FF",
    borderColor: "#E8F1FF",
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
  },
  lightText: {
    color: colors.white,
  },
  darkText: {
    color: colors.primary,
  },
});