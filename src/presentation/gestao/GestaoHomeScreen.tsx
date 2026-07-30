import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ChevronRight, ClipboardCheck, Clock, ShieldCheck, Users } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { justificativaUseCases } from "../../app/dependencies";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { canAccessGestao, roleLabel } from "../../shared/utils/roles";
import { useAuthStore } from "../auth/authStore";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { UserSummaryCard } from "../components/UserSummaryCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "GestaoHome">;

type ActionCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  badge?: string;
  onPress: () => void;
};

function ActionCard({ title, subtitle, icon, badge, onPress }: ActionCardProps) {
  return (
    <InfoCard onPress={onPress} style={styles.actionCard}>
      <View style={styles.actionHeader}>
        <View style={styles.actionIcon}>{icon}</View>
        <ChevronRight color={colors.muted} size={18} />
      </View>
      <View style={styles.actionTextBlock}>
        <View style={styles.actionTitleRow}>
          <Text style={styles.actionTitle}>{title}</Text>
          {badge ? <StatusBadge label={badge} tone="warning" /> : null}
        </View>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </InfoCard>
  );
}

export function GestaoHomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const permitido = canAccessGestao(user);

  const pendenciasQuery = useQuery({
    enabled: permitido,
    queryKey: ["gestao", "justificativas", "pendentes-resumo"],
    queryFn: () => justificativaUseCases.listarJustificativas({ status: "Aguardando", limit: 20, skip: 0, sort: true }),
    refetchOnMount: "always",
  });

  const pendentes = pendenciasQuery.data?.length ?? 0;

  if (!permitido) {
    return (
      <Screen scroll>
        <MobileHeader canGoBack onBack={navigation.goBack} title="Gestão" />
        <InfoCard>
          <View style={styles.forbiddenIcon}>
            <ShieldCheck color={colors.danger} size={24} />
          </View>
          <Text style={styles.forbiddenTitle}>Acesso não permitido</Text>
          <Text style={styles.forbiddenText}>Seu perfil atual não possui permissão para acessar os recursos de gestão.</Text>
        </InfoCard>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Gestão" subtitle="Operação do ponto" />

      <View style={styles.stack}>
        <UserSummaryCard user={user} compact statusLabel={roleLabel(user?.tipo_usuario)} />

        <InfoCard>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <Briefcase color={colors.primary} size={24} />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Fluxo de gestão</Text>
              <Text style={styles.heroSubtitle}>Consulte colaboradores, acompanhe banco de horas e responda solicitações de ajuste.</Text>
            </View>
          </View>
        </InfoCard>

        <View style={styles.actionsStack}>
          <ActionCard
            icon={<Users color={colors.primary} size={24} />}
            onPress={() => navigation.navigate("GestaoColaboradores")}
            subtitle="Buscar por nome, e-mail ou matrícula e abrir o detalhe do ponto."
            title="Colaboradores"
          />

          <ActionCard
            badge={pendentes > 0 ? String(pendentes) : undefined}
            icon={<ClipboardCheck color={colors.primary} size={24} />}
            onPress={() => navigation.navigate("GestaoJustificativas", undefined)}
            subtitle="Aprovar ou reprovar inclusões e remoções solicitadas pelos colaboradores."
            title="Justificativas"
          />

          <ActionCard
            icon={<Clock color={colors.primary} size={24} />}
            onPress={() => navigation.navigate("GestaoColaboradores")}
            subtitle="Selecione um colaborador para ver saldo diário, mensal e ajustes."
            title="Banco de horas"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
  },
  heroSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  actionsStack: {
    gap: spacing.md,
  },
  actionCard: {
    minHeight: 128,
  },
  actionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  actionTextBlock: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  actionTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  actionSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  forbiddenIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: 20,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 56,
  },
  forbiddenTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  forbiddenText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});


