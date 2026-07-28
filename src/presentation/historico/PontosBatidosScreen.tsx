import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Check, Download, FilePlus2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";

import { justificativaUseCases, pontoUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import type { Batida } from "../../domain/ponto/entities/Batida";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatTime, toISODate } from "../../shared/utils/dateTime";
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

function tipoLabel(tipo: string) {
  return tipo === "E" ? "Entrada" : tipo === "S" ? "Saída" : tipo;
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
  });

  const batidas = [...(batidasQuery.data ?? [])].sort((a, b) => new Date(a.data_batida).getTime() - new Date(b.data_batida).getTime());
  const ultimaBatida = getUltimaBatida(batidas);

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

  async function handleInclusao(input: { dataRequerida: string; texto: string }) {
    try {
      setSubmitting(true);
      await justificativaUseCases.solicitarInclusao(input);
      setModalVisible(false);
      Alert.alert("Solicitação enviada", "A justificativa de inclusão foi registrada para análise.");
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
      await queryClient.invalidateQueries({ queryKey: ["batidas-dia"] });
      Alert.alert("Solicitação enviada", "A justificativa de remoção foi registrada para análise.");
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

      <JustificativaModal
        loading={submitting}
        mode={modalMode}
        onClose={() => setModalVisible(false)}
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
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
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
});