import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "../presentation/auth/authStore";
import { colors } from "../presentation/theme/colors";
import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return status === "authenticated" ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
});