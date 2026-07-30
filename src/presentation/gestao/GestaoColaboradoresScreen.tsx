import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight, RefreshCw, Search, User } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { departamentoUseCases, usuarioUseCases } from "../../app/dependencies";
import type { UsuarioGestao } from "../../domain/usuarios/repositories/UsuarioRepository";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { canAccessGestao, normalizePlainText, roleLabel } from "../../shared/utils/roles";
import { usuarioStatusInfo } from "../../shared/utils/status";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "GestaoColaboradores">;
type StatusFiltro = "todos" | "ativos" | "inativos";

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

function buildUsuarioFiltro(search: string, departamento: string | null, status: StatusFiltro) {
  const term = search.trim();
  const filtro: {
    nome?: string;
    email?: string;
    matricula?: string;
    departamento?: string;
    status?: boolean;
    skip: number;
    limit: number;
    sort: boolean;
  } = { skip: 0, limit: 30, sort: true };

  if (term.includes("@")) {
    filtro.email = term;
  } else if (/^\d+$/.test(term)) {
    filtro.matricula = term;
  } else if (term.length > 0) {
    filtro.nome = term;
  }

  if (departamento) filtro.departamento = departamento;
  if (status === "ativos") filtro.status = true;
  if (status === "inativos") filtro.status = false;

  return filtro;
}

function DepartamentoChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ColaboradorCard({ colaborador, onPress }: { colaborador: UsuarioGestao; onPress: () => void }) {
  const status = usuarioStatusInfo(colaborador.status);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.colaboradorCard, pressed && styles.pressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(colaborador.nome)}</Text>
      </View>

      <View style={styles.colaboradorContent}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.colaboradorNome}>{colaborador.nome}</Text>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>

        <Text numberOfLines={1} style={styles.colaboradorEmail}>{colaborador.email}</Text>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.metaText}>Mat. {colaborador.matricula || "-"}</Text>
          <Text numberOfLines={1} style={styles.metaText}>{String(colaborador.departamento ?? "Sem departamento")}</Text>
        </View>
        <Text numberOfLines={1} style={styles.roleText}>{roleLabel(colaborador.tipo_usuario)}</Text>
      </View>

      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}

export function GestaoColaboradoresScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const permitido = canAccessGestao(user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("ativos");
  const [departamento, setDepartamento] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const departamentosQuery = useQuery({
    enabled: permitido,
    queryKey: ["gestao", "departamentos"],
    queryFn: () => departamentoUseCases.listarDepartamentos({ sort: true }),
    staleTime: 1000 * 60 * 10,
  });

  const filtro = useMemo(
    () => buildUsuarioFiltro(debouncedSearch, departamento, status),
    [debouncedSearch, departamento, status]
  );

  const usuariosQuery = useQuery({
    enabled: permitido,
    queryKey: ["gestao", "usuarios", filtro],
    queryFn: () => usuarioUseCases.listarUsuarios(filtro),
    refetchOnMount: "always",
  });

  const usuarios = usuariosQuery.data ?? [];
  const departamentos = departamentosQuery.data ?? [];
  const loading = usuariosQuery.isLoading || usuariosQuery.isFetching;

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Colaboradores" subtitle="Busca e consulta" />

      <View style={styles.stack}>
        <View style={styles.searchBox}>
          <Search color={colors.muted} size={18} />
          <TextInput
            autoCapitalize="words"
            onChangeText={setSearch}
            placeholder="Nome, e-mail ou matrícula"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={search}
          />
        </View>

        <View style={styles.filterBlock}>
          <View style={styles.segmented}>
            <DepartamentoChip label="Ativos" onPress={() => setStatus("ativos")} selected={status === "ativos"} />
            <DepartamentoChip label="Todos" onPress={() => setStatus("todos")} selected={status === "todos"} />
            <DepartamentoChip label="Inativos" onPress={() => setStatus("inativos")} selected={status === "inativos"} />
          </View>

          <View style={styles.departamentoHeader}>
            <View style={styles.departamentoTitleRow}>
              <Building2 color={colors.muted} size={16} />
              <Text style={styles.filterTitle}>Departamento</Text>
            </View>
            <Pressable onPress={() => setDepartamento(null)}>
              <Text style={styles.clearFilter}>Limpar</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <DepartamentoChip label="Todos" onPress={() => setDepartamento(null)} selected={!departamento} />
            {departamentos.map((item) => (
              <DepartamentoChip
                key={item.id}
                label={item.nome}
                onPress={() => setDepartamento(item.nome)}
                selected={normalizePlainText(departamento) === normalizePlainText(item.nome)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>Resultados</Text>
            <Text style={styles.resultsSubtitle}>{loading ? "Atualizando..." : `${usuarios.length} colaborador${usuarios.length === 1 ? "" : "es"}`}</Text>
          </View>
          <Pressable onPress={() => usuariosQuery.refetch()} style={styles.refreshButton}>
            <RefreshCw color={colors.primary} size={18} />
          </Pressable>
        </View>

        {usuariosQuery.isError ? (
          <InfoCard>
            <Text style={styles.errorTitle}>Não foi possível carregar colaboradores.</Text>
            <Text style={styles.errorText}>Verifique a conexão ou suas permissões e tente novamente.</Text>
            <AppButton onPress={() => usuariosQuery.refetch()} title="Tentar novamente" variant="outline" />
          </InfoCard>
        ) : null}

        {!usuariosQuery.isError && usuarios.length === 0 ? (
          <InfoCard>
            <View style={styles.emptyIcon}>
              <User color={colors.muted} size={24} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum colaborador encontrado</Text>
            <Text style={styles.emptyText}>Ajuste a busca ou os filtros para localizar outro colaborador.</Text>
          </InfoCard>
        ) : null}

        <View style={styles.list}>
          {usuarios.map((colaborador) => (
            <ColaboradorCard
              colaborador={colaborador}
              key={colaborador.id}
              onPress={() => navigation.navigate("GestaoColaboradorDetalhe", { colaboradorId: colaborador.id, colaborador })}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    minHeight: 48,
  },
  filterBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  departamentoHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  departamentoTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  filterTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  clearFilter: {
    color: colors.primary,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.softGreen,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultsTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
  },
  resultsSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 2,
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
  list: {
    gap: spacing.sm,
  },
  colaboradorCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
  },
  colaboradorContent: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  colaboradorNome: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  colaboradorEmail: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metaText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  roleText: {
    color: colors.primary,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 52,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  errorText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
