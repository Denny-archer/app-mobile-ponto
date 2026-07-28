import { StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value ?? "-"}</Text>
    </View>
  );
}

export function ContaScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Screen scroll>
      <Text style={styles.title}>Conta</Text>

      <InfoCard title={user?.nome ?? "Usuário"} subtitle={user?.email ?? ""}>
        <DetailRow label="ID" value={user?.id} />
        <DetailRow label="Matrícula" value={user?.matricula} />
        <DetailRow label="Perfil" value={user?.tipo_usuario} />
        <DetailRow label="Cargo" value={user?.cargo} />
      </InfoCard>

      <View style={styles.footer}>
        <AppButton onPress={() => { void signOut(); }} title="Sair" variant="danger" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  detailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
  },
  footer: {
    marginTop: spacing.xl,
  },
});