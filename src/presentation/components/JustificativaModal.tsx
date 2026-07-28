import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Batida } from "../../domain/ponto/entities/Batida";
import { formatTime, toApiDateTime, toISODate } from "../../shared/utils/dateTime";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { AppButton } from "./AppButton";

type Mode = "inclusao" | "remocao";

type JustificativaModalProps = {
  visible: boolean;
  mode: Mode;
  selectedBatida?: Batida | null;
  loading?: boolean;
  onClose: () => void;
  onSubmitInclusao: (input: { dataRequerida: string; texto: string }) => Promise<void>;
  onSubmitRemocao: (input: { idBatida: number; texto: string }) => Promise<void>;
};

export function JustificativaModal({ visible, mode, selectedBatida, loading, onClose, onSubmitInclusao, onSubmitRemocao }: JustificativaModalProps) {
  const [activeMode, setActiveMode] = useState<Mode>(mode);
  const [date, setDate] = useState(toISODate());
  const [time, setTime] = useState(formatTime(new Date()));
  const [texto, setTexto] = useState("");

  useEffect(() => {
    setActiveMode(mode);
    setDate(toISODate());
    setTime(formatTime(new Date()));
    setTexto("");
  }, [mode, visible]);

  async function handleSubmit() {
    if (activeMode === "remocao" && selectedBatida) {
      await onSubmitRemocao({ idBatida: selectedBatida.id, texto });
      return;
    }

    await onSubmitInclusao({ dataRequerida: toApiDateTime(date, time), texto });
  }

  const removalDisabled = activeMode === "remocao" && !selectedBatida;

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
              : "Selecione uma batida registrada indevidamente e descreva o motivo da remoção."}
          </Text>

          <View style={styles.segmented}>
            <Pressable onPress={() => setActiveMode("inclusao")} style={[styles.segment, activeMode === "inclusao" && styles.segmentActive]}>
              <Text style={[styles.segmentText, activeMode === "inclusao" && styles.segmentTextActive]}>Inclusão</Text>
            </Pressable>
            <Pressable onPress={() => setActiveMode("remocao")} style={[styles.segment, activeMode === "remocao" && styles.segmentDanger]}>
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
            <View style={styles.selectedBox}>
              <Text style={styles.selectedTime}>{selectedBatida ? formatTime(selectedBatida.data_batida) : "Nenhuma batida selecionada"}</Text>
              <Text style={styles.selectedMeta}>{selectedBatida ? "Batida selecionada para remoção" : "Toque em uma batida antes de solicitar remoção."}</Text>
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
            <AppButton disabled={removalDisabled || !texto.trim()} loading={loading} onPress={handleSubmit} style={styles.actionButton} title="Enviar" variant={activeMode === "remocao" ? "danger" : "primary"} />
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
    minHeight: 90,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  selectedBox: {
    backgroundColor: colors.successSoft,
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  selectedTime: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 20,
  },
  selectedMeta: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: 2,
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