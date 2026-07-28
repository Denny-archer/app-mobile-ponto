import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Download, FileText, TimerReset } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatTime, toISODate } from "../../shared/utils/dateTime";
import { getNextTipoBatida, getPrimeiraEntrada, getUltimaBatida, getUltimaSaida } from "../../shared/utils/ponto";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { UserSummaryCard } from "../components/UserSummaryCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export function PontoHomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? 0;
  const today = useMemo(() => toISODate(), []);
  const [now, setNow] = useState(new Date());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const batidasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["batidas-dia", userId, today],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: userId, dataInicio: today, dataFim: today }),
  });

  const saldoQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["saldo-dia", userId, today],
    queryFn: () => pontoUseCases.obterSaldoDiario(userId, today),
  });

  const batidas = batidasQuery.data ?? [];
  const primeiraEntrada = getPrimeiraEntrada(batidas);
  const ultimaSaida = getUltimaSaida(batidas);
  const ultimaBatida = getUltimaBatida(batidas);
  const nextTipo = getNextTipoBatida(batidas);
  const statusLabel = nextTipo === "E" ? "Entrada" : "Saída";

  async function handleComprovante() {
    if (!ultimaBatida) {
      Alert.alert("Comprovante indisponível", "Registre uma batida para gerar o comprovante.");
      return;
    }

    try {
      setDownloading(true);
      await downloadAuthenticatedPdf(`/batidas/${ultimaBatida.id}/comprovante`, `comprovante-${ultimaBatida.id}.pdf`);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível abrir o comprovante.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.titleArea}>
        <Text style={styles.title}>Ponto Eletrônico</Text>
        <Text style={styles.subtitle}>{formatDateLong(now)}</Text>
      </View>

      <View style={styles.stack}>
        <UserSummaryCard user={user} />

        <InfoCard>
          <View style={styles.clockCardHeader}>
            <StatusBadge label={statusLabel} />
          </View>
          <Text style={styles.clock}>{formatTime(now)}</Text>
          <Text style={styles.clockSubtitle}>Pronto para registrar o ponto</Text>
        </InfoCard>

        <AppButton
          leftIcon={<TimerReset color={colors.white} size={17} />}
          onPress={() => navigation.navigate("RegistrarPonto", { tipo: nextTipo })}
          title="Registrar ponto"
        />

        <InfoCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Resumo de hoje</Text>
            <Text style={styles.openStatus}>{saldoQuery.data?.status ?? "Em aberto"}</Text>
          </View>
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entrada</Text>
              <Text style={styles.summaryValue}>{primeiraEntrada ? formatTime(primeiraEntrada.data_batida) : "--:--"}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saída</Text>
              <Text style={styles.summaryValue}>{ultimaSaida ? formatTime(ultimaSaida.data_batida) : "--:--"}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jornada</Text>
              <Text style={styles.summaryValueStrong}>{saldoQuery.data?.tempo_trabalhado ?? "00:00"}</Text>
            </View>
          </View>
        </InfoCard>

        <AppButton
          leftIcon={<Download color={colors.blue} size={17} />}
          loading={downloading}
          onPress={handleComprovante}
          title="Ver comprovante"
          variant="secondary"
        />

        <View style={styles.footerActions}>
          <AppButton
            leftIcon={<CalendarDays color={colors.primary} size={17} />}
            onPress={() => navigation.navigate("PontosBatidos")}
            style={styles.footerButton}
            title="Pontos batidos"
            variant="outline"
          />
          <AppButton
            leftIcon={<FileText color={colors.primary} size={17} />}
            onPress={() => navigation.navigate("RelatorioMensal")}
            style={styles.footerButton}
            title="Relatório"
            variant="outline"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleArea: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  stack: {
    gap: spacing.md,
  },
  clockCardHeader: {
    alignItems: "center",
  },
  clock: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 42,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  clockSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    textAlign: "center",
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
  openStatus: {
    color: colors.primary,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  summaryRows: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  summaryValueStrong: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  footerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});