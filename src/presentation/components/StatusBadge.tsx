import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type StatusBadgeProps = {
  label: string;
  tone?: "success" | "info" | "warning" | "danger" | "neutral";
};

export function StatusBadge({ label, tone = "success" }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, styles[`${tone}Text` as const]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 11,
  },
  success: { backgroundColor: colors.successSoft },
  info: { backgroundColor: "#E8F1FF" },
  warning: { backgroundColor: colors.warningSoft },
  danger: { backgroundColor: colors.dangerSoft },
  neutral: { backgroundColor: colors.surfaceMuted },
  successText: { color: colors.primary },
  infoText: { color: colors.blue },
  warningText: { color: colors.warning },
  dangerText: { color: colors.danger },
  neutralText: { color: colors.muted },
});