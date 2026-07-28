import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { addMonths, endOfMonth, formatMinutesCompact, formatMonthApiDate, formatMonthName, formatTime, startOfMonth, toISODate } from "../../shared/utils/dateTime";
import { getUltimaBatida, groupTempoPorSemana, sumSaldo, sumTempoTrabalhado } from "../../shared/utils/ponto";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "RelatorioMensal">;

export function RelatorioMensalScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? 0;
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [downloading, setDownloading] = useState(false);

  const dataInicio = useMemo(() => toISODate(startOfMonth(month)), [month]);
  const dataFim = useMemo(() => toISODate(endOfMonth(month)), [month]);

  const espelhoQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["espelho-mensal", userId, dataInicio, dataFim],
    queryFn: () => pontoUseCases.listarEspelho({ idUsuario: userId, dataInicio, dataFim }),
  });

  const batidasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["batidas-mes", userId, dataInicio, dataFim],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: userId, dataInicio, dataFim }),
  });

  const itens = espelhoQuery.data ?? [];
  const totalMinutos = sumTempoTrabalhado(itens);
  const saldoMinutos = sumSaldo(itens);
  const semanas = groupTempoPorSemana(itens);
  const maxSemana = Math.max(...semanas, 1);
  const ultimaBatida = getUltimaBatida(batidasQuery.data ?? []);
  const diasComRegistro = itens.filter((item) => item.tempo_trabalhado && item.tempo_trabalhado !== "00:00").length;

  async function handleDownload() {
    try {
      setDownloading(true);
      const data = encodeURIComponent(formatMonthApiDate(month));
      await downloadAuthenticatedPdf(`/batidas/relatorio-mensal/${userId}?data=${data}`, `relatorio-${userId}-${formatMonthApiDate(month)}.pdf`);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível abrir o relatório.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Relatorio mensal" action="download" onAction={handleDownload} />

      <View style={styles.stack}>
        <View style={styles.monthSelector}>
          <Pressable onPress={() => setMonth((current) => addMonths(current, -1))} style={styles.monthArrow}>
            <ChevronLeft color={colors.text} size={18} />
          </Pressable>
          <View style={styles.monthBox}>
            <Text style={styles.monthLabel}>Mês</Text>
            <Text style={styles.monthValue}>{formatMonthName(month)}</Text>
          </View>
          <View style={styles.monthBox}>
            <Text style={styles.monthLabel}>Ano</Text>
            <Text style={styles.monthValue}>{month.getFullYear()}</Text>
          </View>
          <Pressable onPress={() => setMonth((current) => addMonths(current, 1))} style={styles.monthArrow}>
            <ChevronRight color={colors.text} size={18} />
          </Pressable>
        </View>

        <InfoCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Resumo de {formatMonthName(month).toLowerCase()}</Text>
            <StatusBadge label={espelhoQuery.isFetching ? "Atualizando" : "Fechado"} />
          </View>
          <Text style={styles.total}>{formatMinutesCompact(totalMinutos)}</Text>
          <Text style={styles.totalCaption}>Total trabalhado no mês</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{diasComRegistro}</Text>
              <Text style={styles.metricLabel}>Dias</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, saldoMinutos >= 0 ? styles.positive : styles.negative]}>{formatMinutesCompact(saldoMinutos)}</Text>
              <Text style={styles.metricLabel}>Saldo</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{itens.length}</Text>
              <Text style={styles.metricLabel}>Ajustes</Text>
            </View>
          </View>
        </InfoCard>

        <InfoCard title="Distribuição semanal" subtitle="Horas trabalhadas por semana do Mês.">
          <View style={styles.weekList}>
            {semanas.map((minutes, index) => {
              const width = `${Math.max(4, Math.round((minutes / maxSemana) * 100))}%` as `${number}%`;
              return (
                <View key={index} style={styles.weekRow}>
                  <Text style={styles.weekLabel}>Sem {index + 1}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width }]} />
                  </View>
                  <Text style={styles.weekHours}>{formatMinutesCompact(minutes)}</Text>
                </View>
              );
            })}
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.lastRow}>
            <View style={styles.fileIcon}>
              <FileText color={colors.primary} size={20} />
            </View>
            <View style={styles.lastContent}>
              <Text style={styles.lastTitle}>Último registro: {ultimaBatida ? (ultimaBatida.tipo === "E" ? "Entrada" : "Saída") : "-"}</Text>
              <Text style={styles.lastSubtitle}>{ultimaBatida ? `${toISODate(new Date(ultimaBatida.data_batida))} às ${formatTime(ultimaBatida.data_batida)}` : "Nenhuma batida no período"}</Text>
            </View>
          </View>
        </InfoCard>

        <AppButton
          leftIcon={<Download color={colors.white} size={17} />}
          loading={downloading}
          onPress={handleDownload}
          title="Baixar relatório mensal"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  monthSelector: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  monthArrow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  monthBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  monthLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  monthValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    marginTop: 4,
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
  total: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 40,
    marginTop: spacing.md,
  },
  totalCaption: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metricBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    flex: 1,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  positive: {
    color: colors.primary,
  },
  negative: {
    color: colors.danger,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
  weekList: {
    gap: spacing.md,
  },
  weekRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  weekLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    width: 42,
  },
  barTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 8,
  },
  weekHours: {
    color: colors.text,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    textAlign: "right",
    width: 58,
  },
  lastRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  fileIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  lastContent: {
    flex: 1,
  },
  lastTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  lastSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
});