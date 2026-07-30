import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CheckCircle2,
  Download,
  Home,
  ImageOff,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { buildPontoImageUrl } from "../../core/files/buildPontoImageUrl";
import { downloadAuthenticatedPdf } from "../../core/files/downloadAuthenticatedPdf";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import {
  formatDateShort,
  formatTime,
} from "../../shared/utils/dateTime";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<
  AppStackParamList,
  "PontoRegistrado"
>;

type DetailItemProps = {
  label: string;
  value: string;
};

function tipoLabel(tipo: string) {
  if (tipo === "E") {
    return "Entrada";
  }

  if (tipo === "S") {
    return "Saída";
  }

  return tipo;
}

function normalizeValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "Não informado";
  }

  return String(value);
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>

      <Text selectable style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

export function PontoRegistradoScreen({
  navigation,
  route,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const { batida, imagemUri } = route.params;

  const backendImageUri = buildPontoImageUrl(
    batida.nome_imagem,
  );

  const imageCandidates = [
    imagemUri,
    backendImageUri,
  ].filter((uri): uri is string => Boolean(uri));

  const [imageIndex, setImageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const currentImageUri = imageCandidates[imageIndex];

  const colaborador = normalizeValue(
    user?.nome ?? `Usuário ${batida.id_usuario}`,
  );

  const email = normalizeValue(user?.email);
  const matricula = normalizeValue(user?.matricula);

  const dataRegistro = formatDateShort(batida.data_batida);
  const horaRegistro = formatTime(batida.data_batida);
  const tipoRegistro = tipoLabel(batida.tipo);

  async function handleComprovante() {
    try {
      setDownloading(true);

      await downloadAuthenticatedPdf(
        `/batidas/${batida.id}/comprovante`,
        `comprovante-${batida.id}.pdf`,
      );
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o comprovante.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleImageError() {
    setImageIndex((current) => current + 1);
  }

  return (
    <Screen scroll>
      <MobileHeader
        canGoBack
        onBack={() => navigation.replace("Home")}
        title=""
      />

      <View style={styles.content}>
        {/* Confirmação e imagem */}
        <InfoCard style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle2
              color={colors.primary}
              size={38}
              strokeWidth={2.2}
            />
          </View>

          <Text style={styles.title}>
            Ponto registrado!
          </Text>

          <Text style={styles.subtitle}>
            Seu registro foi realizado com sucesso.
          </Text>

          <View style={styles.recordSummary}>
            <Text style={styles.recordType}>
              {tipoRegistro}
            </Text>

            <View style={styles.summaryDivider} />

            <Text style={styles.recordDateTime}>
              {dataRegistro} às {horaRegistro}
            </Text>
          </View>

          <View style={styles.photoFrame}>
            {currentImageUri ? (
              <Image
                accessibilityLabel="Selfie do registro de ponto"
                onError={handleImageError}
                resizeMode="cover"
                source={{ uri: currentImageUri }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoFallback}>
                <ImageOff
                  color={colors.muted}
                  size={28}
                />

                <Text style={styles.photoFallbackText}>
                  Selfie indisponível neste dispositivo
                </Text>
              </View>
            )}
          </View>
        </InfoCard>

        {/* Informações do registro */}
        <InfoCard>
          <Text style={styles.sectionTitle}>
            Detalhes do registro
          </Text>

          <View style={styles.details}>
            <DetailItem
              label="Colaborador"
              value={colaborador}
            />

            <View style={styles.detailColumns}>
              <View style={styles.detailColumn}>
                <DetailItem
                  label="Registro"
                  value={String(batida.id)}
                />
              </View>

              <View style={styles.detailColumn}>
                <DetailItem
                  label="Matrícula"
                  value={matricula}
                />
              </View>
            </View>

            <DetailItem
              label="E-mail"
              value={email}
            />
          </View>
        </InfoCard>

        {/* Ações */}
        <View style={styles.actions}>
          <AppButton
            leftIcon={
              <Home
                color={colors.white}
                size={18}
              />
            }
            onPress={() => navigation.replace("Home")}
            title="Voltar ao início"
            variant="primary"
          />

          <AppButton
            leftIcon={
              <Download
                color={colors.primary}
                size={18}
              />
            }
            loading={downloading}
            onPress={handleComprovante}
            title="Baixar comprovante"
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },

  successCard: {
    alignItems: "center",
  },

  successIcon: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 64,
  },

  title: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },

  subtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    textAlign: "center",
  },

  recordSummary: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.softGreen,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  recordType: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },

  summaryDivider: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 4,
    marginHorizontal: spacing.sm,
    opacity: 0.45,
    width: 4,
  },

  recordDateTime: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    textAlign: "center",
  },

  photoFrame: {
    alignSelf: "stretch",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 170,
    marginTop: spacing.md,
    overflow: "hidden",
  },

  photo: {
    height: "100%",
    width: "100%",
  },

  photoFallback: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },

  photoFallbackText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    lineHeight: 21,
  },

  details: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  detailColumns: {
    flexDirection: "row",
    gap: spacing.md,
  },

  detailColumn: {
    flex: 1,
  },

  detailItem: {
    minWidth: 0,
  },

  detailLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 3,
  },

  detailValue: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    lineHeight: 19,
  },

  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});