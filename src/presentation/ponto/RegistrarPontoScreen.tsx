import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, Clock3 } from "lucide-react-native";
import { useRef, useState, type ElementRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { queryClient } from "../../app/queryClient";
import { persistCapturedImage } from "../../core/files/persistCapturedImage";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { formatDateLong, formatTime } from "../../shared/utils/dateTime";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "RegistrarPonto">;

function tipoLabel(tipo: string) {
  return tipo === "E" ? "entrada" : "saída";
}

export function RegistrarPontoScreen({ navigation, route }: Props) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? 0;
  const cameraRef = useRef<ElementRef<typeof CameraView>>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tipo = route.params.tipo;

  async function handleRegistrar() {
    if (!userId) {
      Alert.alert("Sessão inválida", "Faça login novamente para registrar o ponto.");
      return;
    }

    if (!cameraRef.current || !isCameraReady) {
      Alert.alert("Câmera indisponível", "Aguarde a câmera ficar pronta.");
      return;
    }

    try {
      setIsSubmitting(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.65, shutterSound: false });

      if (!photo?.uri) {
        throw new Error("Não foi possível capturar a selfie.");
      }

      const imagemUri = await persistCapturedImage(photo.uri);
      const batida = await pontoUseCases.registrarPonto({
        idUsuario: userId,
        tipo,
        imagemUri,
      });

      await queryClient.invalidateQueries({ queryKey: ["batidas-dia"] });
      await queryClient.invalidateQueries({ queryKey: ["saldo-dia"] });
      navigation.replace("PontoRegistrado", { batida, imagemUri });
    } catch (error) {
      Alert.alert("Erro ao registrar ponto", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Registrar ponto" subtitle={formatDateLong(new Date())} action="more" />

      <View style={styles.stack}>
        <View style={styles.photoHeader}>
          <Text style={styles.sectionLabel}>Foto para validação</Text>
          <Text style={styles.cameraStatus}>{permission?.granted ? "Câmera ativa" : "Permissão pendente"}</Text>
        </View>

        <View style={styles.cameraBox}>
          {permission?.granted ? (
            <>
              <CameraView
                facing="front"
                mirror
                mode="picture"
                onCameraReady={() => setIsCameraReady(true)}
                style={styles.cameraPreview}
                ref={cameraRef}
              />
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </>
          ) : (
            <View style={styles.permissionBox}>
              <Camera color={colors.primary} size={36} />
              <Text style={styles.permissionTitle}>Permita o acesso à câmera</Text>
              <Text style={styles.permissionText}>A selfie é obrigatória para validar a batida biométrica.</Text>
              <AppButton onPress={() => { void requestPermission(); }} title="Permitir câmera" />
            </View>
          )}
        </View>

        <InfoCard>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Colaborador</Text>
            <Text style={styles.detailValue}>{user?.nome ?? "-"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data</Text>
            <Text style={styles.detailValue}>{formatDateLong(new Date())}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo e horário</Text>
            <View style={styles.typeRow}>
              <StatusBadge label={tipo === "E" ? "Entrada" : "Saída"} />
              <Text style={styles.detailValue}>{formatTime(new Date())}</Text>
            </View>
          </View>
        </InfoCard>

        <AppButton
          leftIcon={<Clock3 color={colors.white} size={17} />}
          loading={isSubmitting}
          onPress={handleRegistrar}
          title={`Registrar ${tipoLabel(tipo)}`}
        />

        <AppButton
          onPress={() => navigation.navigate("PontosBatidos")}
          title="Ver pontos batidos"
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  photoHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
  },
  cameraStatus: {
    color: colors.primary,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 10,
  },
  cameraPreview: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  cameraBox: {
    backgroundColor: colors.softGreen,
    borderRadius: 14,
    height: 285,
    overflow: "hidden",
  },
  permissionBox: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  permissionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    textAlign: "center",
  },
  permissionText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  corner: {
    borderColor: colors.white,
    height: 40,
    position: "absolute",
    width: 40,
  },
  cornerTopLeft: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    left: 24,
    top: 24,
  },
  cornerTopRight: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    right: 24,
    top: 24,
  },
  cornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    bottom: 24,
    left: 24,
  },
  cornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    bottom: 24,
    right: 24,
  },
  detailRow: {
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  detailValue: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    textAlign: "right",
  },
  typeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
