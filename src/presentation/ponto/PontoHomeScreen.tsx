import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Download, FileText, Settings, TimerReset } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatTime, toISODate } from "../../shared/utils/dateTime";
import { getNextTipoBatida, getPrimeiraEntrada, getUltimaBatida, getUltimaSaida } from "../../shared/utils/ponto";
import { useAuthStore } from "../auth/authStore";
import { AccountActionsSheet } from "../components/AccountActionsSheet";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { UserSummaryCard } from "../components/UserSummaryCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

function tipoLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

export function PontoHomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const userId = user?.id ?? 0;
  const today = useMemo(() => toISODate(), []);
  const isFocused = useIsFocused();
  const [now, setNow] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const batidasQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["batidas-dia", userId, today],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: userId, dataInicio: today, dataFim: today }),
    refetchInterval: isFocused ? 30000 : false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  const saldoQuery = useQuery({
    enabled: userId > 0,
    queryKey: ["saldo-dia", userId, today],
    queryFn: () => pontoUseCases.obterSaldoDiario(userId, today),
    refetchInterval: isFocused ? 30000 : false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (userId <= 0) return;

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["batidas-dia", userId, today] }),
        queryClient.invalidateQueries({ queryKey: ["saldo-dia", userId, today] }),
      ]);
    }, [today, userId])
  );

  const batidas = batidasQuery.data ?? [];
  const primeiraEntrada = getPrimeiraEntrada(batidas);
  const ultimaSaida = getUltimaSaida(batidas);
  const ultimaBatida = getUltimaBatida(batidas);
  const nextTipo = getNextTipoBatida(batidas);
  const statusLabel = nextTipo === "E" ? "Entrada" : "Saída";
  const resumoDiario = saldoQuery.data;
  const tempoTrabalhadoOficial = resumoDiario?.tempo_trabalhado ?? "--:--";
  const cargaHorariaOficial = resumoDiario?.carga_horaria_esperada ?? "--:--";
  const saldoDiaOficial = resumoDiario?.saldo_dia ?? "--:--";
  const totalRegistros = resumoDiario?.qtd_batidas ?? batidas.length;
  const saldoNegativo = saldoDiaOficial.trim().startsWith("-");
  const resumoAtualizando = batidasQuery.isFetching || saldoQuery.isFetching;

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

  function handleChangePassword() {
    setAccountMenuVisible(false);
    navigation.navigate("AlterarSenha");
  }

  function confirmLogout() {
    setAccountMenuVisible(false);

    Alert.alert(
      "Sair da conta?",
      "Você precisará informar suas credenciais para entrar novamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ]
    );
  }

  return (
    <>
      <Screen scroll>
        <View style={styles.titleArea}>
          <View style={styles.titleContent}>
            <Text style={styles.title}>Ponto Eletrônico</Text>
            <Text style={styles.subtitle}>{formatDateLong(now)}</Text>
          </View>

          <Pressable
            accessibilityHint="Abre as opções da sua conta"
            accessibilityLabel="Conta e segurança"
            accessibilityRole="button"
            accessibilityState={{ expanded: accountMenuVisible }}
            onPress={() => setAccountMenuVisible(true)}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          >
            <Settings color={colors.text} size={22} />
          </Pressable>
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
              <View style={styles.summaryBadges}>
                {resumoAtualizando ? <StatusBadge label="Atualizando" tone="info" /> : null}
                <StatusBadge label={resumoDiario?.status ?? "Em aberto"} />
              </View>
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
                <Text style={styles.summaryLabel}>Último registro</Text>
                <Text style={styles.summaryValue}>{ultimaBatida ? `${formatTime(ultimaBatida.data_batida)} · ${tipoLabel(ultimaBatida.tipo)}` : "--:--"}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Registros</Text>
                <Text style={styles.summaryValue}>{totalRegistros}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Previsto</Text>
                <Text style={styles.summaryValue}>{cargaHorariaOficial}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tempo trabalhado</Text>
                <Text style={styles.summaryValueStrong}>{tempoTrabalhadoOficial}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Saldo do dia</Text>
                <Text style={[styles.summaryValueStrong, saldoNegativo ? styles.summaryValueDanger : styles.summaryValueSuccess]}>{saldoDiaOficial}</Text>
              </View>
            </View>
          </InfoCard>

          <AppButton
            leftIcon={<Download color={colors.blue} size={17} />}
            loading={downloading}
            onPress={handleComprovante}
            title="Baixar comprovante"
            variant="secondary"
          />

          <View style={styles.quickActions}>
            <InfoCard style={styles.quickCard} onPress={() => navigation.navigate("PontosBatidos")}>
              <View style={styles.quickIcon}>
                <CalendarDays color={colors.primary} size={28} />
              </View>
              <Text style={styles.quickTitle}>Pontos batidos</Text>
              <Text style={styles.quickSubtitle}>Ver histórico de registros</Text>
            </InfoCard>

            <InfoCard style={styles.quickCard} onPress={() => navigation.navigate("RelatorioMensal")}>
              <View style={styles.quickIcon}>
                <FileText color={colors.primary} size={28} />
              </View>
              <Text style={styles.quickTitle}>Relatório mensal</Text>
              <Text style={styles.quickSubtitle}>Visualizar relatório</Text>
            </InfoCard>
          </View>
        </View>
      </Screen>

      <AccountActionsSheet
        onChangePassword={handleChangePassword}
        onClose={() => setAccountMenuVisible(false)}
        onLogout={confirmLogout}
        visible={accountMenuVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  titleArea: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleContent: {
    flex: 1,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginLeft: spacing.md,
    width: 48,
  },
  settingsButtonPressed: {
    backgroundColor: colors.pressed,
    opacity: 0.8,
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
  summaryBadges: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  summaryRows: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.muted,
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.muted,
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    textAlign: "right",
  },
  summaryValueStrong: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    textAlign: "right",
  },
  summaryValueDanger: {
    color: colors.danger,
  },
  summaryValueSuccess: {
    color: colors.primary,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 135,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 56,
  },
  quickTitle: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  quickSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
});
