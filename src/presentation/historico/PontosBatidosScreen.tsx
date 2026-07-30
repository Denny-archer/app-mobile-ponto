import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Check, Download, FilePlus2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { justificativaUseCases, pontoUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import type { Justificativa } from "../../domain/justificativas/entities/Justificativa";
import type { Batida } from "../../domain/ponto/entities/Batida";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatDateShort, formatTime, toApiDateTime, toISODate } from "../../shared/utils/dateTime";
import { getUltimaBatida } from "../../shared/utils/ponto";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { BatidaRow } from "../components/BatidaRow";
import { InfoCard } from "../components/InfoCard";
import { JustificativaModal } from "../components/JustificativaModal";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { UserSummaryCard } from "../components/UserSummaryCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "PontosBatidos">;
type ModalMode = "inclusao" | "remocao";
type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

function normalizeText(value: string | number) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tipoLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

function tipoJustificativaLabel(tipo: string) {
  const normalized = normalizeText(tipo);
  if (normalized.includes("remoc")) return "Remoção";
  if (normalized.includes("inclus")) return "Inclusão";
  return tipo;
}

function statusInfo(status: string | number): { label: string; tone: StatusTone } {
  if (status === 1) return { label: "Aguardando validação", tone: "warning" };
  if (status === 2) return { label: "Aprovado", tone: "success" };
  if (status === 3) return { label: "Reprovado", tone: "danger" };

  const normalized = normalizeText(status);
  if (normalized.includes("aguard")) return { label: "Aguardando validação", tone: "warning" };
  if (normalized.includes("aprov")) return { label: "Aprovado", tone: "success" };
  if (normalized.includes("reprov")) return { label: "Reprovado", tone: "danger" };

  return { label: String(status), tone: "neutral" };
}

function sortByNewest<T extends { criado_em: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
}

function JustificativaRow({ justificativa }: { justificativa: Justificativa }) {
  const status = statusInfo(justificativa.status);

  return (
    <View style={styles.justificativaRow}>
      <View style={styles.justificativaHeader}>
        <View style={styles.justificativaTitleArea}>
          <Text style={styles.justificativaTipo}>{tipoJustificativaLabel(justificativa.tipo)}</Text>
          <Text numberOfLines={2} style={styles.justificativaTexto}>{justificativa.texto}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>

      <View style={styles.justificativaMetaBlock}>
        <Text style={styles.justificativaMeta}>
          Referência: {formatDateShort(justificativa.data_requerida)} às {formatTime(justificativa.data_requerida)}
        </Text>
        <Text style={styles.justificativaMeta}>
          Enviada: {formatDateShort(justificativa.criado_em)} às {formatTime(justificativa.criado_em)}
        </Text>
        {justificativa.validador ? (
          <Text style={styles.justificativaMeta}>Validador: {justificativa.validador}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function PontosBatidosScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? 0;
  const today = toISODate();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("inclusao");
  const [selectedBatida, setSelectedBatida] = useState<Batida | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const batidasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["batidas-dia", userId, today],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: userId, dataInicio: today, dataFim: today }),
    refetchInterval: 30000,
  });

  const justificativasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["justificativas-dia", userId, today],
    queryFn: () => justificativaUseCases.listarJustificativas({
      idRequerente: userId,
      dataRequerida: toApiDateTime(today, "00:00"),
      limit: 50,
    }),
    refetchInterval: 30000,
  });

  const batidas = [...(batidasQuery.data ?? [])].sort((a, b) => new Date(a.data_batida).getTime() - new Date(b.data_batida).getTime());
  const justificativas = sortByNewest(justificativasQuery.data ?? []);
  const requestBatidasRemocao = useCallback(() => batidasQuery.refetch(), [batidasQuery.refetch]);
  const ultimaBatida = getUltimaBatida(batidas);
  const pendentes = justificativas.filter((item) => statusInfo(item.status).tone === "warning").length;

  function openInclusao() {
    setSelectedBatida(null);
    setModalMode("inclusao");
    setModalVisible(true);
  }

  function openRemocao(batida: Batida) {
    setSelectedBatida(batida);
    setModalMode("remocao");
    setModalVisible(true);
  }

  async function refreshDayData() {
    await queryClient.invalidateQueries({ queryKey: ["justificativas-dia"] });
    await queryClient.invalidateQueries({ queryKey: ["batidas-dia"] });
    await queryClient.invalidateQueries({ queryKey: ["saldo-dia"] });
  }

  async function handleInclusao(input: { dataRequerida: string; texto: string }) {
    try {
      setSubmitting(true);
      await justificativaUseCases.solicitarInclusao(input);
      setModalVisible(false);
      await refreshDayData();
      Alert.alert("Solicitação enviada", "A justificativa ficou aguardando validação.");
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível enviar a justificativa.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemocao(input: { idBatida: number; texto: string }) {
    try {
      setSubmitting(true);
      await justificativaUseCases.solicitarRemocao(input);
      setModalVisible(false);
      await refreshDayData();
      Alert.alert("Solicitação enviada", "A justificativa de remoção ficou aguardando validação.");
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível enviar a justificativa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Pontos batidos" subtitle={formatDateLong(new Date())} action="more" />

      <View style={styles.stack}>
        <UserSummaryCard user={user} compact statusLabel="OK" />

        <InfoCard>
          <View style={styles.lastCardHeader}>
            <View>
              <Text style={styles.mutedLabel}>Última batida</Text>
              <Text style={styles.lastTime}>{ultimaBatida ? formatTime(ultimaBatida.data_batida) : "--:--"}</Text>
              <Text style={styles.mutedLabel}>{ultimaBatida ? tipoLabel(ultimaBatida.tipo) : "Nenhum registro hoje"}</Text>
            </View>
            <View style={styles.checkCircle}>
              <Check color={colors.white} size={30} />
            </View>
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Batidas de hoje</Text>
            <Text style={styles.countLabel}>{batidas.length} registros</Text>
          </View>

          <View style={styles.list}>
            {batidas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma batida registrada hoje.</Text>
            ) : (
              batidas.map((batida, index) => (
                <BatidaRow
                  atual={index === batidas.length - 1}
                  batida={batida}
                  key={batida.id}
                  onPress={() => openRemocao(batida)}
                />
              ))
            )}
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Justificativas do dia</Text>
            <Text style={styles.countLabel}>{pendentes > 0 ? `${pendentes} pendente${pendentes > 1 ? "s" : ""}` : `${justificativas.length} solicitações`}</Text>
          </View>

          <View style={styles.justificativasList}>
            {justificativasQuery.isLoading ? (
              <Text style={styles.emptyText}>Carregando justificativas...</Text>
            ) : justificativasQuery.isError ? (
              <Text style={styles.errorText}>Não foi possível carregar as justificativas.</Text>
            ) : justificativas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma justificativa enviada para hoje.</Text>
            ) : (
              justificativas.map((justificativa) => (
                <JustificativaRow justificativa={justificativa} key={justificativa.id} />
              ))
            )}
          </View>
        </InfoCard>

        <View style={styles.actionsBlock}>
          <AppButton
            leftIcon={<FilePlus2 color={colors.white} size={17} />}
            onPress={openInclusao}
            title="Solicitar justificativa"
          />
          <AppButton
            leftIcon={<Download color={colors.white} size={17} />}
            onPress={() => navigation.navigate("RelatorioMensal")}
            title="Baixar relatório"
            variant="primary"
          />
        </View>
      </View>

      <JustificativaModal
        batidasRemocao={batidas}
        loading={submitting}
        loadingBatidas={batidasQuery.isFetching}
        mode={modalMode}
        onClose={() => setModalVisible(false)}
        onRequestBatidas={requestBatidasRemocao}
        onSubmitInclusao={handleInclusao}
        onSubmitRemocao={handleRemocao}
        selectedBatida={selectedBatida}
        visible={modalVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  lastCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mutedLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  lastTime: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 36,
    marginVertical: 2,
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  cardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  countLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  list: {
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
  justificativasList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  justificativaRow: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.md,
  },
  justificativaHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  justificativaTitleArea: {
    flex: 1,
  },
  justificativaTipo: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  justificativaTexto: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  justificativaMetaBlock: {
    gap: 2,
    marginTop: spacing.sm,
  },
  justificativaMeta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  actionsBlock: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
