import { StyleSheet, Text, View } from "react-native";

import type { User } from "../../domain/auth/entities/User";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusBadge } from "./StatusBadge";

function initials(name?: string) {
  if (!name) return "--";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase();
}

type UserSummaryCardProps = {
  user: User | null;
  compact?: boolean;
  statusLabel?: string;
};

export function UserSummaryCard({ user, compact = false, statusLabel }: UserSummaryCardProps) {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(user?.nome)}</Text>
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>{user?.nome ?? "Colaborador"}</Text>
        <Text numberOfLines={1} style={styles.meta}>{user?.email ?? ""}</Text>
      </View>
      {statusLabel ? <StatusBadge label={statusLabel} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  compact: {
    paddingVertical: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  meta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
});