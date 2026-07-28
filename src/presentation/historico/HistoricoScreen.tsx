import { useQuery } from "@tanstack/react-query";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { pontoUseCases } from "../../app/dependencies";
import { getApiErrorMessage } from "../../core/http/getApiErrorMessage";
import type { Batida } from "../../domain/ponto/entities/Batida";
import { useAuthStore } from "../auth/authStore";
import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function formatBatidaDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tipoLabel(tipo: string) {
  return tipo === "E" ? "Entrada" : tipo === "S" ? "Saída" : tipo;
}

function BatidaItem({ item }: { item: Batida }) {
  return (
    <View style={styles.item}>
      <View>
        <Text style={styles.itemTitle}>{tipoLabel(item.tipo)}</Text>
        <Text style={styles.itemSubtitle}>{formatBatidaDate(item.data_batida)}</Text>
      </View>
      <Text style={styles.itemDescription}>{item.descricao || "-"}</Text>
    </View>
  );
}

export function HistoricoScreen() {
  const user = useAuthStore((state) => state.user);

  const batidasQuery = useQuery({
    enabled: Boolean(user?.id),
    queryKey: ["batidas", user?.id],
    queryFn: () => pontoUseCases.listarBatidas({ idUsuario: user?.id }),
  });

  const batidas = batidasQuery.data ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Últimas batidas registradas para o usuário logado.</Text>
      </View>

      {batidasQuery.isError ? (
        <InfoCard title="Erro ao carregar histórico" subtitle={getApiErrorMessage(batidasQuery.error)} />
      ) : null}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={batidas}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            onRefresh={() => { void batidasQuery.refetch(); }}
            refreshing={batidasQuery.isRefetching}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => <BatidaItem item={item} />}
        ListEmptyComponent={
          <InfoCard
            title={batidasQuery.isLoading ? "Carregando..." : "Nenhuma batida encontrada"}
            subtitle={batidasQuery.isLoading ? "Buscando informações na API." : "Quando houver registros, eles aparecerão aqui."}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  item: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  itemSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  itemDescription: {
    color: colors.muted,
    flexShrink: 1,
    marginLeft: spacing.md,
    textAlign: "right",
  },
});