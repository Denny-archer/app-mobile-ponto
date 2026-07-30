import { normalizePlainText } from "./roles";

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

export function tipoJustificativaLabel(tipo: string) {
  const normalized = normalizePlainText(tipo);
  if (normalized.includes("remoc")) return "Remoção";
  if (normalized.includes("inclus")) return "Inclusão";
  return tipo;
}

export function justificativaStatusInfo(status: string | number): { label: string; tone: StatusTone; aguardando: boolean } {
  if (status === 1) return { label: "Aguardando validação", tone: "warning", aguardando: true };
  if (status === 2) return { label: "Aprovado", tone: "success", aguardando: false };
  if (status === 3) return { label: "Reprovado", tone: "danger", aguardando: false };

  const normalized = normalizePlainText(status);
  if (normalized.includes("aguard")) return { label: "Aguardando validação", tone: "warning", aguardando: true };
  if (normalized.includes("aprov")) return { label: "Aprovado", tone: "success", aguardando: false };
  if (normalized.includes("reprov")) return { label: "Reprovado", tone: "danger", aguardando: false };

  return { label: String(status), tone: "neutral", aguardando: false };
}

export function usuarioStatusInfo(status: boolean | null | undefined) {
  if (status === false) return { label: "Inativo", tone: "danger" as StatusTone };
  return { label: "Ativo", tone: "success" as StatusTone };
}
