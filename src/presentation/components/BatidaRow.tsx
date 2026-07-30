import { FileCheck2, LogIn, LogOut } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Batida } from "../../domain/ponto/entities/Batida";
import { formatTime } from "../../shared/utils/dateTime";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusBadge } from "./StatusBadge";

function getTipoLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

function getTipoIcon(tipo: string) {
  if (tipo === "E") return LogIn;
  if (tipo === "S") return LogOut;
  return FileCheck2;
}

type BatidaRowProps = {
  batida: Batida;
  atual?: boolean;
  onPress?: () => void;
};

export function BatidaRow({ batida, atual, onPress }: BatidaRowProps) {
  const Icon = getTipoIcon(batida.tipo);

  return (
    <Pressable accessibilityRole={onPress ? "button" : undefined} onPress={onPress} style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={16} />
      </View>
      <View style={styles.content}>
        <Text style={styles.time}>{formatTime(batida.data_batida)}</Text>
        <Text style={styles.label}>{getTipoLabel(batida.tipo)}</Text>
      </View>
      <StatusBadge label={atual ? "Atual" : "Confirmado"} tone={atual ? "success" : "neutral"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  content: {
    flex: 1,
  },
  time: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  label: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
});
