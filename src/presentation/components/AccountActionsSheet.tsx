import { ChevronRight, KeyRound, LogOut, X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type AccountActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
};

export function AccountActionsSheet({ visible, onClose, onChangePassword, onLogout }: AccountActionsSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modalContainer}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />

        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Conta e segurança</Text>
            <Pressable
              accessibilityLabel="Fechar opções da conta"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X color={colors.text} size={22} />
            </Pressable>
          </View>

          <Pressable
            accessibilityHint="Abre a tela para alterar sua senha"
            accessibilityLabel="Alterar senha"
            accessibilityRole="button"
            onPress={onChangePassword}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={styles.actionIcon}>
              <KeyRound color={colors.primary} size={21} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Alterar senha</Text>
              <Text style={styles.actionSubtitle}>Atualize sua credencial de acesso</Text>
            </View>
            <ChevronRight color={colors.muted} size={20} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            accessibilityHint="Encerra sua sessão neste aparelho"
            accessibilityLabel="Sair da conta"
            accessibilityRole="button"
            onPress={onLogout}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={[styles.actionIcon, styles.dangerIcon]}>
              <LogOut color={colors.danger} size={21} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.dangerText]}>Sair da conta</Text>
              <Text style={styles.actionSubtitle}>Encerrar esta sessão neste aparelho</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: colors.overlay,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  action: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 44,
  },
  dangerIcon: {
    backgroundColor: colors.dangerSoft,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
  },
  actionSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 3,
  },
  dangerText: {
    color: colors.danger,
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  pressed: {
    backgroundColor: colors.pressed,
    opacity: 0.85,
  },
});