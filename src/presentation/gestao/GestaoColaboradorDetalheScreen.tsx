import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardCheck, Clock, Download, FileText, RefreshCw } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ajusteUseCases, justificativaUseCases, pontoUseCases, usuarioUseCases } from "../../app/dependencies";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { Batida } from "../../domain/ponto/entities/Batida";
import type { UsuarioGestao } from "../../domain/usuarios/repositories/UsuarioRepository";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import {
  endOfMonth,
  formatDateShort,
  formatMinutesCompact,
  formatMonthApiDate,
  formatMonthName,
  formatTime,
  startOfMonth,
  toISODate,
} from "../../shared/utils/dateTime";
import { roleLabel } from "../../shared/utils/roles";
import { justificativaStatusInfo, tipoJustificativaLabel, usuarioStatusInfo } from "../../shared/utils/status";
import { getPrimeiraEntrada, getUltimaBatida, getUltimaSaida, sumSaldo, sumTempoTrabalhado } from "../../shared/utils/ponto";
import { AppButton } from "../components/AppButton";
import { BatidaRow } from "../components/BatidaRow";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "GestaoColaboradorDetalhe">;

type InfoRowProps = {
  label: string;
  value: string | number;
  strong?: boolean;
  danger?: boolean;
};

function initials(name?: string) {
  if (!name) return "--";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function tipoBatidaLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

function sortBatidas(batidas: Batida[]) {
  return [...batidas].sort((a, b) => new Date(a.data_batida).getTime() - new Date(b.data_batida).getTime());
}

function InfoRow({ label, value, strong, danger }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[strong ? styles.infoValueStrong : styles.infoValue, danger && styles.infoDanger]}>{value}</Text>
    </View>
  );
}

function MetricBox({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "success" | "danger" }) {
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricValue, tone === "success" && styles.successText, tone === "danger" && styles.dangerText]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ColaboradorHeader({ colaborador }: { colaborador: UsuarioGestao }) {
  const status = usuarioStatusInfo(colaborador.status);

  return (
    <InfoCard>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(colaborador.nome)}</Text>
        </View>
        <View style={styles.profileContent}>
          <Text numberOfLines={1} style={styles.profileName}>{colaborador.nome}</Text>
          <Text numberOfLines={1} style={styles.profileMeta}>{colaborador.email}</Text>
          <Text numberOfLines={1} style={styles.profileMeta}>Mat. {colaborador.matricula || "-"} · {String(colaborador.departamento ?? "Sem departamento")}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <View style={styles.profileFooter}>
        <Text style={styles.profileRole}>{roleLabel(colaborador.tipo_usuario)}</Text>
        <Text numberOfLines={1} style={styles.profileCargo}>{String(colaborador.cargo ?? "Cargo não informado")}</Text>
      </View>
    </InfoCard>
  );
}

export function GestaoColaboradorDetalheScreen({ navigation, route }: Props) {
  const { colaboradorId, colaborador: colaboradorInicial } = route.params;
  const today = toISODate();
  const month = startOfMonth(new Date());
  const dataInicioMes = toISODate(startOfMonth(month));
  const dataFimMes = toISODate(endOfMonth(month));
  const [downloading, setDownloading] = useState(false);

  const usuarioQuery = useQuery({
    queryKey: ["gestao", "usuario", colaboradorId],
    queryFn: () => usuarioUseCases.obterUsuarioPorId(colaboradorId),
    placeholderData: colaboradorInicial,
  });

  const batidasDiaQuery = useQuery({
    queryKey: ["gestao", "batidas-dia", colaboradorId, today],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: colaboradorId, dataInicio: today, dataFim: today, sort: true }),
    refetchOnMount: "always",
  });

  const saldoDiaQuery = useQuery({
    queryKey: ["gestao", "saldo-dia", colaboradorId, today],
    queryFn: () => pontoUseCases.obterSaldoDiario(colaboradorId, today),
    refetchOnMount: "always",
  });

  const espelhoQuery = useQuery({
    queryKey: ["gestao", "espelho-mensal", colaboradorId, dataInicioMes, dataFimMes],
    queryFn: () => pontoUseCases.listarEspelho({ idUsuario: colaboradorId, dataInicio: dataInicioMes, dataFim: dataFimMes }),
    refetchOnMount: "always",
  });

  const justificativasQuery = useQuery({
    queryKey: ["gestao", "justificativas-colaborador", colaboradorId],
    queryFn: () => justificativaUseCases.listarJustificativas({ idRequerente: colaboradorId, limit: 5, skip: 0, sort: true }),
    refetchOnMount: "always",
  });

  const ajustesQuery = useQuery({
    queryKey: ["gestao", "ajustes", colaboradorId, dataInicioMes, dataFimMes],
    queryFn: () => ajusteUseCases.listarAjustes({ idUsuario: colaboradorId, dataInicio: dataInicioMes, dataFim: dataFimMes }),
    refetchOnMount: "always",
  });

  const colaborador = usuarioQuery.data ?? colaboradorInicial;
  const batidasDia = sortBatidas(batidasDiaQuery.data ?? []);
  const saldoDia = saldoDiaQuery.data;
  const itensEspelho = espelhoQuery.data ?? [];
  const justificativas = justificativasQuery.data ?? [];
  const ajustes = ajustesQuery.data ?? [];

  const resumoMes = useMemo(() => {
    const total = sumTempoTrabalhado(itensEspelho);
    const saldo = sumSaldo(itensEspelho);
    const pendencias = itensEspelho.filter((item) => {
      const status = item.status.toLowerCase();
      return status.includes("falta") || status.includes("incompleto") || status.includes("débito") || status.includes("debito");
    }).length;

    return { total, saldo, pendencias };
  }, [itensEspelho]);

  const primeiraEntrada = getPrimeiraEntrada(batidasDia);
  const ultimaSaida = getUltimaSaida(batidasDia);
  const ultimaBatida = getUltimaBatida(batidasDia);
  const saldoNegativo = (saldoDia?.saldo_dia ?? "").trim().startsWith("-");
  const saldoMesNegativo = resumoMes.saldo < 0;

  async function refreshAll() {
    await Promise.all([
      usuarioQuery.refetch(),
      batidasDiaQuery.refetch(),
      saldoDiaQuery.refetch(),
      espelhoQuery.refetch(),
      justificativasQuery.refetch(),
      ajustesQuery.refetch(),
    ]);
  }

  async function handleDownload() {
    try {
      setDownloading(true);
      const data = encodeURIComponent(formatMonthApiDate(month));
      await downloadAuthenticatedPdf(`/batidas/relatorio-mensal/${colaboradorId}?data=${data}`, `relatorio-${colaboradorId}-${formatMonthApiDate(month)}.pdf`);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível baixar o relatório.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Detalhe do colaborador" action="download" onAction={handleDownload} />

      <View style={styles.stack}>
        {colaborador ? <ColaboradorHeader colaborador={colaborador} /> : null}

        <View style={styles.refreshRow}>
          <Text style={styles.refreshText}>Dados de {formatDateShort(today)} e {formatMonthName(month).toLowerCase()}</Text>
          <Pressable onPress={refreshAll} style={styles.refreshButton}>
            <RefreshCw color={colors.primary} size={18} />
          </Pressable>
        </View>

        <InfoCard>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWithIcon}>
              <Clock color={colors.primary} size={18} />
              <Text style={styles.cardTitle}>Hoje</Text>
            </View>
            <StatusBadge label={saldoDia?.status ?? "Sem histórico"} tone={saldoNegativo ? "danger" : "success"} />
          </View>

          <View style={styles.rowsBlock}>
            <InfoRow label="Entrada" value={primeiraEntrada ? formatTime(primeiraEntrada.data_batida) : "--:--"} />
            <InfoRow label="Saída" value={ultimaSaida ? formatTime(ultimaSaida.data_batida) : "--:--"} />
            <InfoRow label="Último registro" value={ultimaBatida ? `${formatTime(ultimaBatida.data_batida)} · ${tipoBatidaLabel(ultimaBatida.tipo)}` : "--:--"} />
            <InfoRow label="Tempo trabalhado" value={saldoDia?.tempo_trabalhado ?? "--:--"} strong />
            <InfoRow label="Saldo do dia" value={saldoDia?.saldo_dia ?? "--:--"} danger={saldoNegativo} strong />
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWithIcon}>
              <CalendarDays color={colors.primary} size={18} />
              <Text style={styles.cardTitle}>Banco de horas</Text>
            </View>
            <StatusBadge label={saldoMesNegativo ? "Débito" : "Crédito"} tone={saldoMesNegativo ? "danger" : "success"} />
          </View>

          <View style={styles.metricsRow}>
            <MetricBox label="Trabalhado" value={formatMinutesCompact(resumoMes.total)} />
            <MetricBox label="Saldo mês" value={formatMinutesCompact(resumoMes.saldo)} tone={saldoMesNegativo ? "danger" : "success"} />
            <MetricBox label="Pendências" value={resumoMes.pendencias} tone={resumoMes.pendencias > 0 ? "danger" : "neutral"} />
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Batidas de hoje</Text>
            <Text style={styles.countText}>{batidasDia.length} registros</Text>
          </View>
          <View style={styles.listBlock}>
            {batidasDia.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma batida registrada hoje.</Text>
            ) : (
              batidasDia.map((batida, index) => <BatidaRow atual={index === batidasDia.length - 1} batida={batida} key={batida.id} />)
            )}
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWithIcon}>
              <ClipboardCheck color={colors.primary} size={18} />
              <Text style={styles.cardTitle}>Justificativas recentes</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("GestaoJustificativas", { colaboradorId, colaboradorNome: colaborador?.nome })}>
              <Text style={styles.linkText}>Ver todas</Text>
            </Pressable>
          </View>

          <View style={styles.listBlock}>
            {justificativas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma justificativa recente.</Text>
            ) : (
              justificativas.map((item) => {
                const status = justificativaStatusInfo(item.status);
                return (
                  <View style={styles.justificativaCard} key={item.id}>
                    <View style={styles.justificativaTop}>
                      <Text style={styles.justificativaTitle}>{tipoJustificativaLabel(item.tipo)}</Text>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </View>
                    <Text numberOfLines={2} style={styles.justificativaText}>{item.texto}</Text>
                    <Text style={styles.justificativaMeta}>{formatDateShort(item.data_requerida)} às {formatTime(item.data_requerida)}</Text>
                  </View>
                );
              })
            )}
          </View>
        </InfoCard>

        <InfoCard>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWithIcon}>
              <FileText color={colors.primary} size={18} />
              <Text style={styles.cardTitle}>Ajustes no mês</Text>
            </View>
            <Text style={styles.countText}>{ajustes.length}</Text>
          </View>

          <View style={styles.listBlock}>
            {ajustesQuery.isError ? (
              <Text style={styles.emptyText}>Não foi possível carregar os ajustes deste período.</Text>
            ) : ajustes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum ajuste manual neste mês.</Text>
            ) : (
              ajustes.slice(0, 4).map((ajuste) => (
                <View style={styles.ajusteRow} key={ajuste.id}>
                  <View style={styles.ajusteContent}>
                    <Text style={styles.ajusteTitle}>{ajuste.motivo}</Text>
                    <Text style={styles.ajusteMeta}>{formatDateShort(ajuste.data)}</Text>
                  </View>
                  <Text style={styles.ajusteValor}>{String(ajuste.valor)}</Text>
                </View>
              ))
            )}
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
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  profileContent: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
  },
  profileMeta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  profileFooter: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  profileRole: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
  },
  profileCargo: {
    color: colors.muted,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    textAlign: "right",
  },
  refreshRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  refreshText: {
    color: colors.muted,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
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
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardTitleWithIcon: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  rowsBlock: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  infoLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  infoValue: {
    color: colors.muted,
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    textAlign: "right",
  },
  infoValueStrong: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    textAlign: "right",
  },
  infoDanger: {
    color: colors.danger,
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
    minHeight: 68,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  successText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.danger,
  },
  countText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  listBlock: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
  },
  justificativaCard: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  justificativaTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  justificativaTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  justificativaText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  justificativaMeta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  ajusteRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  ajusteContent: {
    flex: 1,
  },
  ajusteTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  ajusteMeta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  ajusteValor: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
});
