import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { EspelhoPontoItem } from "../../domain/ponto/entities/Batida";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import {
  addMonths,
  endOfMonth,
  formatDateShort,
  formatMinutesCompact,
  formatMonthApiDate,
  formatMonthName,
  formatTime,
  parseTimeToMinutes,
  startOfMonth,
  toISODate,
} from "../../shared/utils/dateTime";
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
type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tipoBatidaLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

function monthStatusLabel(isCurrentMonth: boolean, isFetching: boolean) {
  if (isFetching) return { label: "Atualizando", tone: "info" as StatusTone };
  return isCurrentMonth
    ? { label: "Em aberto", tone: "warning" as StatusTone }
    : { label: "Fechado", tone: "success" as StatusTone };
}

function isPendencia(status: string) {
  const normalized = normalizeText(status);
  return (
    normalized.includes("falta")
    || normalized.includes("incompleto")
    || normalized.includes("debito")
    || normalized.includes("jornada indefinida")
  );
}

function statusTone(status: string): StatusTone {
  if (isPendencia(status)) return "danger";

  const normalized = normalizeText(status);
  if (normalized.includes("ok")) return "success";
  if (normalized.includes("aberto")) return "warning";
  if (normalized.includes("feriado") || normalized.includes("folga") || normalized.includes("nao trabalha")) return "neutral";

  return "info";
}

function sumCargaEsperada(itens: EspelhoPontoItem[]) {
  return itens.reduce((total, item) => total + parseTimeToMinutes(item.carga_esperada), 0);
}

function countStatus(itens: EspelhoPontoItem[]) {
  const counts = new Map<string, number>();

  for (const item of itens) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status));
}

export function RelatorioMensalScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? 0;
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [downloading, setDownloading] = useState(false);
  const isFocused = useIsFocused();

  const currentMonth = startOfMonth(new Date());
  const isCurrentMonth = month.getTime() === currentMonth.getTime();
  const canGoNext = addMonths(month, 1).getTime() <= currentMonth.getTime();
  const dataInicio = useMemo(() => toISODate(startOfMonth(month)), [month]);
  const dataFim = useMemo(() => toISODate(endOfMonth(month)), [month]);

  const espelhoQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["espelho-mensal", userId, dataInicio, dataFim],
    queryFn: () => pontoUseCases.listarEspelho({ idUsuario: userId, dataInicio, dataFim }),
    refetchInterval: isFocused && isCurrentMonth ? 30000 : false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  const batidasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["batidas-mes", userId, dataInicio, dataFim],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: userId, dataInicio, dataFim }),
    refetchInterval: isFocused && isCurrentMonth ? 30000 : false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (userId <= 0) return;

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["espelho-mensal", userId, dataInicio, dataFim] }),
        queryClient.invalidateQueries({ queryKey: ["batidas-mes", userId, dataInicio, dataFim] }),
      ]);
    }, [dataFim, dataInicio, userId])
  );

  const itens = espelhoQuery.data ?? [];
  const batidas = batidasQuery.data ?? [];

  const resumo = useMemo(() => {
    const totalMinutos = sumTempoTrabalhado(itens);
    const previstoMinutos = sumCargaEsperada(itens);
    const saldoMinutos = sumSaldo(itens);
    const semanas = groupTempoPorSemana(itens);
    const diasTrabalhados = itens.filter((item) => parseTimeToMinutes(item.tempo_trabalhado) > 0).length;
    const pendencias = itens.filter((item) => isPendencia(item.status)).length;
    const statusResumo = countStatus(itens);

    return {
      totalMinutos,
      previstoMinutos,
      saldoMinutos,
      semanas,
      diasTrabalhados,
      diasApurados: itens.length,
      pendencias,
      statusResumo,
    };
  }, [itens]);

  const statusMes = monthStatusLabel(isCurrentMonth, espelhoQuery.isFetching || batidasQuery.isFetching);
  const maxSemana = Math.max(...resumo.semanas, 1);
  const ultimaBatida = getUltimaBatida(batidas);
  const justificativasAprovadas = batidas.filter((batida) => batida.tipo === "J").length;
  const hasEspelhoError = espelhoQuery.isError;
  const hasNoData = !espelhoQuery.isLoading && !hasEspelhoError && itens.length === 0;

  function goPreviousMonth() {
    setMonth((current) => addMonths(current, -1));
  }

  function goNextMonth() {
    if (!canGoNext) return;
    setMonth((current) => addMonths(current, 1));
  }

  async function handleDownload() {
    if (userId <= 0) {
      Alert.alert("Sessão inválida", "Faça login novamente para baixar o relatório.");
      return;
    }

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
      <MobileHeader canGoBack onBack={navigation.goBack} title="Relatório mensal" action="download" onAction={handleDownload} />

      <View style={styles.stack}>
        <View style={styles.monthSelector}>
          <Pressable onPress={goPreviousMonth} style={styles.monthArrow}>
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
          <Pressable disabled={!canGoNext} onPress={goNextMonth} style={[styles.monthArrow, !canGoNext && styles.monthArrowDisabled]}>
            <ChevronRight color={canGoNext ? colors.text : colors.muted} size={18} />
          </Pressable>
        </View>

        {hasEspelhoError ? (
          <InfoCard>
            <Text style={styles.errorTitle}>Não foi possível carregar o espelho mensal.</Text>
            <Text style={styles.errorText}>Verifique sua conexão e tente abrir a tela novamente.</Text>
          </InfoCard>
        ) : null}

        <InfoCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Resumo de {formatMonthName(month).toLowerCase()}</Text>
            <StatusBadge label={statusMes.label} tone={statusMes.tone} />
          </View>

          <Text style={styles.total}>{formatMinutesCompact(resumo.totalMinutos)}</Text>
          <Text style={styles.totalCaption}>Total trabalhado pelo espelho oficial</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{resumo.diasTrabalhados}</Text>
              <Text style={styles.metricLabel}>Dias trabalhados</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{formatMinutesCompact(resumo.previstoMinutos)}</Text>
              <Text style={styles.metricLabel}>Previsto</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, resumo.saldoMinutos >= 0 ? styles.positive : styles.negative]}>{formatMinutesCompact(resumo.saldoMinutos)}</Text>
              <Text style={styles.metricLabel}>{isCurrentMonth ? "Saldo parcial" : "Saldo"}</Text>
            </View>
          </View>

          <View style={styles.compactFacts}>
            <Text style={styles.factText}>{resumo.diasApurados} dias apurados</Text>
            <Text style={styles.factDivider}>•</Text>
            <Text style={styles.factText}>{justificativasAprovadas} justificativas</Text>
            <Text style={styles.factDivider}>•</Text>
            <Text style={[styles.factText, resumo.pendencias > 0 && styles.factDanger]}>{resumo.pendencias} pendências</Text>
          </View>
        </InfoCard>

        <InfoCard title="Distribuição semanal" subtitle="Horas trabalhadas por semana conforme o espelho.">
          {hasNoData ? (
            <Text style={styles.emptyText}>Nenhum dado apurado para este período.</Text>
          ) : (
            <View style={styles.weekList}>
              {resumo.semanas.map((minutes, index) => {
                const width = (minutes > 0 ? `${Math.max(4, Math.round((minutes / maxSemana) * 100))}%` : "0%") as `${number}%`;
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
          )}
        </InfoCard>

        <InfoCard title="Situação do mês" subtitle="Resumo diário retornado pelo espelho.">
          {resumo.statusResumo.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma situação para exibir.</Text>
          ) : (
            <View style={styles.statusGrid}>
              {resumo.statusResumo.slice(0, 6).map((item) => (
                <View key={item.status} style={styles.statusItem}>
                  <StatusBadge label={item.status} tone={statusTone(item.status)} />
                  <Text style={styles.statusCount}>{item.count} dia{item.count > 1 ? "s" : ""}</Text>
                </View>
              ))}
            </View>
          )}
        </InfoCard>

        <InfoCard>
          <View style={styles.lastRow}>
            <View style={styles.fileIcon}>
              <FileText color={colors.primary} size={20} />
            </View>
            <View style={styles.lastContent}>
              <Text style={styles.lastTitle}>Último registro: {ultimaBatida ? tipoBatidaLabel(ultimaBatida.tipo) : "-"}</Text>
              <Text style={styles.lastSubtitle}>{ultimaBatida ? `${formatDateShort(ultimaBatida.data_batida)} às ${formatTime(ultimaBatida.data_batida)}` : "Nenhuma batida no período"}</Text>
            </View>
          </View>
        </InfoCard>

        <AppButton
          disabled={userId <= 0}
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
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  monthArrowDisabled: {
    opacity: 0.45,
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
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
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
    minHeight: 66,
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
    lineHeight: 14,
    marginTop: 2,
  },
  compactFacts: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  factText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  factDivider: {
    color: colors.border,
    fontFamily: typography.fontFamilyBold,
    fontSize: 11,
  },
  factDanger: {
    color: colors.danger,
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
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusItem: {
    alignItems: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  statusCount: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
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
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
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
    marginTop: spacing.xs,
  },
});
