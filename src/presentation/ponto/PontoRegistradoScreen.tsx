import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2, Download, Home } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatTime } from "../../shared/utils/dateTime";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "PontoRegistrado">;

function tipoLabel(tipo: string) {
  return tipo === "E" ? "Entrada" : tipo === "S" ? "Saída" : tipo;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function PontoRegistradoScreen({ navigation, route }: Props) {
  const user = useAuthStore((state) => state.user);
  const { batida, imagemUri } = route.params;
  const [downloading, setDownloading] = useState(false);

  async function handleComprovante() {
    try {
      setDownloading(true);
      await downloadAuthenticatedPdf(`/batidas/${batida.id}/comprovante`, `comprovante-${batida.id}.pdf`);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível abrir o comprovante.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={() => navigation.replace("Home")} title="" />

      <InfoCard style={styles.successCard}>
        <View style={styles.successIcon}>
          <CheckCircle2 color={colors.primary} size={44} />
        </View>
        <Text style={styles.title}>Ponto Registrado!</Text>
        <Text style={styles.subtitle}>Registro realizado com sucesso</Text>

        {imagemUri ? <Image source={{ uri: imagemUri }} style={styles.photo} /> : <View style={styles.photoPlaceholder} />}

        <View style={styles.details}>
          <DetailRow label="Usuário" value={user?.nome ?? "-"} />
          <DetailRow label="Email" value={user?.email ?? "-"} />
          <DetailRow label="Hora" value={formatTime(batida.data_batida)} />
          <DetailRow label="Data" value={formatDateLong(new Date(batida.data_batida))} />
          <DetailRow label="Tipo" value={tipoLabel(batida.tipo)} />
        </View>
      </InfoCard>

      <View style={styles.actions}>
        <AppButton
          leftIcon={<Download color={colors.white} size={17} />}
          loading={downloading}
          onPress={handleComprovante}
          title="Baixar Comprovante"
          variant="primary"
        />
        <AppButton
          leftIcon={<Home color={colors.white} size={17} />}
          onPress={() => navigation.replace("Home")}
          title="Voltar ao Início"
          variant="primary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  successCard: {
    alignItems: "center",
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 76,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 76,
  },
  title: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  photo: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 190,
    marginTop: spacing.lg,
    width: "100%",
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 190,
    marginTop: spacing.lg,
    width: "100%",
  },
  details: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: "100%",
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: colors.text,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  detailValue: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginLeft: spacing.md,
    textAlign: "right",
    textTransform: "capitalize",
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});