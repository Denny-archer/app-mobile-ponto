import { ChevronLeft, Download, MoreHorizontal } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type MobileHeaderProps = {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  action?: "download" | "more";
  onAction?: () => void;
};

export function MobileHeader({ title, subtitle, canGoBack, onBack, action, onAction }: MobileHeaderProps) {
  const ActionIcon = action === "download" ? Download : MoreHorizontal;

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.iconButton}>
            <ChevronLeft color={colors.text} size={18} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.sideRight}>
        {action ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={[styles.iconButton, action === "download" && styles.blueButton]}>
            <ActionIcon color={action === "download" ? colors.white : colors.text} size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 50,
    paddingBottom: spacing.sm,
  },
  side: {
    alignItems: "flex-start",
    width: 48,
  },
  sideRight: {
    alignItems: "flex-end",
    width: 48,
  },
  titleWrap: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
    textTransform: "capitalize",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  blueButton: {
    backgroundColor: colors.blue,
  },
});