import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { Batida } from "../../domain/ponto/entities/Batida";
import { formatDateShort, formatTime, toApiDateTime, toISODate } from "../../shared/utils/dateTime";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { AppButton } from "./AppButton";

type Mode = "inclusao" | "remocao";

type JustificativaModalProps = {
  visible: boolean;
  mode: Mode;
  selectedBatida?: Batida | null;
  batidasRemocao?: Batida[];
  loading?: boolean;
  loadingBatidas?: boolean;
  onClose: () => void;
  onRequestBatidas?: () => Promise<unknown> | unknown;
  onSubmitInclusao: (input: { dataRequerida: string; texto: string }) => Promise<void>;
  onSubmitRemocao: (input: { idBatida: number; texto: string }) => Promise<void>;
};

function tipoLabel(tipo: string) {
  if (tipo === "E") return "Entrada";
  if (tipo === "S") return "Saída";
  if (tipo === "J") return "Justificativa";
  return tipo;
}

export function JustificativaModal({
  visible,
  mode,
  selectedBatida,
  batidasRemocao = [],
  loading,
  loadingBatidas,
  onClose,
  onRequestBatidas,
  onSubmitInclusao,
  onSubmitRemocao,
}: JustificativaModalProps) {
  const [activeMode, setActiveMode] = useState<Mode>(mode);
  const [selectedRemovalBatida, setSelectedRemovalBatida] = useState<Batida | null>(selectedBatida ?? null);
  const [date, setDate] = useState(toISODate());
  const [time, setTime] = useState(formatTime(new Date()));
  const [texto, setTexto] = useState("");

  useEffect(() => {
    setActiveMode(mode);
    setSelectedRemovalBatida(selectedBatida ?? null);
    setDate(toISODate());
    setTime(formatTime(new Date()));
    setTexto("");
  }, [mode, selectedBatida, visible]);

  useEffect(() => {
    if (visible && activeMode === "remocao") {
      void onRequestBatidas?.();
    }
  }, [activeMode, onRequestBatidas, visible]);

  async function handleSubmit() {
    if (activeMode === "remocao") {
      if (!selectedRemovalBatida) return;
      await onSubmitRemocao({ idBatida: selectedRemovalBatida.id, texto });
      return;
    }

    await onSubmitInclusao({ dataRequerida: toApiDateTime(date, time), texto });
  }

  function handleModeChange(nextMode: Mode) {
    setActiveMode(nextMode);
  }

  const removalDisabled = activeMode === "remocao" && !selectedRemovalBatida;
  const submitDisabled = removalDisabled || !texto.trim();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{activeMode === "inclusao" ? "Solicitar inclusão" : "Solicitar remoção"}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>x</Text>
            </Pressable>
          </View>

          <Text style={styles.description}>
            {activeMode === "inclusao"
              ? "Informe o horário que não apareceu nas batidas do dia e envie a justificativa."
              : "Selecione a batida registrada indevidamente e descreva o motivo da remoção."}
          </Text>

          <View style={styles.segmented}>
            <Pressable onPress={() => handleModeChange("inclusao")} style={[styles.segment, activeMode === "inclusao" && styles.segmentActive]}>
              <Text style={[styles.segmentText, activeMode === "inclusao" && styles.segmentTextActive]}>Inclusão</Text>
            </Pressable>
            <Pressable onPress={() => handleModeChange("remocao")} style={[styles.segment, activeMode === "remocao" && styles.segmentDanger]}>
              <Text style={[styles.segmentText, activeMode === "remocao" && styles.segmentTextDanger]}>Remoção</Text>
            </Pressable>
          </View>

          {activeMode === "inclusao" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Data</Text>
              <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} />
              <Text style={styles.label}>Horário</Text>
              <TextInput value={time} onChangeText={setTime} placeholder="HH:mm" style={styles.input} />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Batida para remoção</Text>

              {loadingBatidas ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.loadingText}>Buscando batidas do dia...</Text>
                </View>
              ) : batidasRemocao.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Nenhuma batida disponível</Text>
                  <Text style={styles.emptyText}>Não encontramos batidas registradas para remover neste dia.</Text>
                </View>
              ) : (
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={styles.batidasList}>
                  {batidasRemocao.map((batida) => {
                    const selected = selectedRemovalBatida?.id === batida.id;
                    return (
                      <Pressable
                        key={batida.id}
                        onPress={() => setSelectedRemovalBatida(batida)}
                        style={[styles.batidaOption, selected && styles.batidaOptionSelected]}
                      >
                        <View style={styles.batidaOptionContent}>
                          <Text style={styles.batidaOptionTime}>{formatTime(batida.data_batida)}</Text>
                          <Text style={styles.batidaOptionMeta}>{tipoLabel(batida.tipo)} · {formatDateShort(batida.data_batida)}</Text>
                        </View>
                        <Text style={[styles.batidaOptionAction, selected && styles.batidaOptionActionSelected]}>{selected ? "Selecionada" : "Selecionar"}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Justificativa</Text>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setTexto}
              placeholder="Descreva o motivo"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textArea]}
              value={texto}
            />
          </View>

          <View style={styles.actions}>
            <AppButton disabled={loading} onPress={onClose} style={styles.actionButton} title="Cancelar" variant="outline" />
            <AppButton disabled={submitDisabled} loading={loading} onPress={handleSubmit} style={styles.actionButton} title="Enviar" variant={activeMode === "remocao" ? "danger" : "primary"} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    maxHeight: "92%",
    padding: spacing.lg,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  close: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 16,
  },
  description: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentDanger: {
    backgroundColor: colors.danger,
  },
  segmentText: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  segmentTextActive: {
    color: colors.white,
  },
  segmentTextDanger: {
    color: colors.white,
  },
  form: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  label: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  textArea: {
    minHeight: 88,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 72,
    justifyContent: "center",
    padding: spacing.md,
  },
  loadingText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  emptyBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  batidasList: {
    maxHeight: 178,
  },
  batidaOption: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  batidaOptionSelected: {
    backgroundColor: colors.successSoft,
    borderColor: colors.primary,
  },
  batidaOptionContent: {
    flex: 1,
  },
  batidaOptionTime: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
  },
  batidaOptionMeta: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  batidaOptionAction: {
    color: colors.muted,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },
  batidaOptionActionSelected: {
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
