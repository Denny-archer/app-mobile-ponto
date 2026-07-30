import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, ClipboardCheck, RefreshCw, XCircle } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { justificativaUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import type { Justificativa } from "../../domain/justificativas/entities/Justificativa";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateShort, formatTime } from "../../shared/utils/dateTime";
import { canManageJustificativas } from "../../shared/utils/roles";
import { justificativaStatusInfo, tipoJustificativaLabel } from "../../shared/utils/status";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "GestaoJustificativas">;
type StatusFiltro = "Aguardando" | "Aprovado" | "Reprovado" | "Todos";

const filtros: StatusFiltro[] = ["Aguardando", "Todos", "Aprovado", "Reprovado"];

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function JustificativaCard({
  item,
  canRespond,
  loading,
  onResponder,
}: {
  item: Justificativa;
  canRespond: boolean;
  loading: boolean;
  onResponder: (item: Justificativa, resposta: 2 | 3) => void;
}) {
  const status = justificativaStatusInfo(item.status);
  const showActions = canRespond && status.aguardando;

  return (
    <InfoCard style={styles.justificativaCard}>
      <View style={styles.cardTop}>
        <View style={styles.titleBlock}>
          <Text style={styles.tipoText}>{tipoJustificativaLabel(item.tipo)}</Text>
          <Text numberOfLines={1} style={styles.requerenteText}>{item.requerente ?? `Usuário ${item.id_requerente ?? "-"}`}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>

      <Text style={styles.texto}>{item.texto}</Text>

      <View style={styles.metaBlock}>
        <Text style={styles.metaText}>Referência: {formatDateShort(item.data_requerida)} às {formatTime(item.data_requerida)}</Text>
        <Text style={styles.metaText}>Enviada: {formatDateShort(item.criado_em)} às {formatTime(item.criado_em)}</Text>
        {item.departamento_requerente ? <Text style={styles.metaText}>Departamento: {item.departamento_requerente}</Text> : null}
        {item.validador ? <Text style={styles.metaText}>Validador: {item.validador}</Text> : null}
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          <AppButton
            disabled={loading}
            leftIcon={<CheckCircle color={colors.primary} size={16} />}
            onPress={() => onResponder(item, 2)}
            style={styles.actionButton}
            title="Aprovar"
            variant="outline"
          />
          <AppButton
            disabled={loading}
            leftIcon={<XCircle color={colors.white} size={16} />}
            onPress={() => onResponder(item, 3)}
            style={styles.actionButton}
            title="Reprovar"
            variant="danger"
          />
        </View>
      ) : null}
    </InfoCard>
  );
}

export function GestaoJustificativasScreen({ navigation, route }: Props) {
  const user = useAuthStore((state) => state.user);
  const canRespond = canManageJustificativas(user);
  const colaboradorId = route.params?.colaboradorId;
  const colaboradorNome = route.params?.colaboradorNome;
  const [status, setStatus] = useState<StatusFiltro>("Aguardando");

  const justificativasQuery = useQuery({
    queryKey: ["gestao", "justificativas", colaboradorId ?? "todos", status],
    queryFn: () => justificativaUseCases.listarJustificativas({
      idRequerente: colaboradorId,
      status: status === "Todos" ? undefined : status,
      skip: 0,
      limit: 50,
      sort: true,
    }),
    refetchOnMount: "always",
  });

  const responderMutation = useMutation({
    mutationFn: justificativaUseCases.responderJustificativa,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["gestao", "justificativas"] }),
        queryClient.invalidateQueries({ queryKey: ["gestao", "batidas-dia"] }),
        queryClient.invalidateQueries({ queryKey: ["gestao", "saldo-dia"] }),
        queryClient.invalidateQueries({ queryKey: ["gestao", "espelho-mensal"] }),
        queryClient.invalidateQueries({ queryKey: ["batidas-dia"] }),
        queryClient.invalidateQueries({ queryKey: ["saldo-dia"] }),
        queryClient.invalidateQueries({ queryKey: ["justificativas-dia"] }),
      ]);

      Alert.alert(
        variables.resposta === 2 ? "Justificativa aprovada" : "Justificativa reprovada",
        "Os dados relacionados serão atualizados na próxima consulta."
      );
    },
    onError: (error) => {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível responder a justificativa.");
    },
  });

  const justificativas = justificativasQuery.data ?? [];
  const loadingAction = responderMutation.isPending;

  function confirmarResposta(item: Justificativa, resposta: 2 | 3) {
    const aprovar = resposta === 2;
    Alert.alert(
      aprovar ? "Aprovar justificativa?" : "Reprovar justificativa?",
      aprovar
        ? "Se for uma inclusão, a batida será criada pelo backend após a aprovação."
        : "A solicitação ficará reprovada e não alterará o ponto do colaborador.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: aprovar ? "Aprovar" : "Reprovar",
          style: aprovar ? "default" : "destructive",
          onPress: () => responderMutation.mutate({ idJustificativa: item.id, resposta }),
        },
      ]
    );
  }

  return (
    <Screen scroll>
      <MobileHeader
        canGoBack
        onBack={navigation.goBack}
        title="Justificativas"
        subtitle={colaboradorNome ? colaboradorNome : "Gestão de solicitações"}
      />

      <View style={styles.stack}>
        <InfoCard>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <ClipboardCheck color={colors.primary} size={22} />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryTitle}>Solicitações de ponto</Text>
              <Text style={styles.summarySubtitle}>Acompanhe inclusões e remoções solicitadas pelos colaboradores.</Text>
            </View>
          </View>
        </InfoCard>

        <View style={styles.filtersHeader}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {filtros.map((item) => (
              <FilterChip key={item} label={item} onPress={() => setStatus(item)} selected={status === item} />
            ))}
          </ScrollView>
          <Pressable onPress={() => justificativasQuery.refetch()} style={styles.refreshButton}>
            <RefreshCw color={colors.primary} size={18} />
          </Pressable>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>{status === "Todos" ? "Todas" : status}</Text>
          <Text style={styles.resultsSubtitle}>{justificativasQuery.isFetching ? "Atualizando..." : `${justificativas.length} registro${justificativas.length === 1 ? "" : "s"}`}</Text>
        </View>

        {justificativasQuery.isError ? (
          <InfoCard>
            <Text style={styles.errorTitle}>Não foi possível carregar justificativas.</Text>
            <Text style={styles.errorText}>Verifique sua conexão ou suas permissões.</Text>
            <AppButton onPress={() => justificativasQuery.refetch()} title="Tentar novamente" variant="outline" />
          </InfoCard>
        ) : null}

        {!justificativasQuery.isError && justificativas.length === 0 ? (
          <InfoCard>
            <Text style={styles.emptyTitle}>Nenhuma justificativa encontrada</Text>
            <Text style={styles.emptyText}>Troque o filtro de status ou selecione outro colaborador.</Text>
          </InfoCard>
        ) : null}

        <View style={styles.list}>
          {justificativas.map((item) => (
            <JustificativaCard
              canRespond={canRespond}
              item={item}
              key={item.id}
              loading={loadingAction}
              onResponder={confirmarResposta}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  summaryTextBlock: {
    flex: 1,
  },
  summaryTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
  },
  summarySubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  filtersHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.softGreen,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultsTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
  },
  resultsSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  list: {
    gap: spacing.md,
  },
  justificativaCard: {
    gap: spacing.md,
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  tipoText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  requerenteText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  texto: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  metaBlock: {
    gap: 3,
  },
  metaText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  errorText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
