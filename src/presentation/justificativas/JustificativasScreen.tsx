import { StyleSheet, Text } from "react-native";

import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function JustificativasScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Justificativas</Text>
      <InfoCard
        title="Módulo preparado"
        subtitle="Aqui devem entrar listagem, criação e acompanhamento das justificativas do colaborador."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
});