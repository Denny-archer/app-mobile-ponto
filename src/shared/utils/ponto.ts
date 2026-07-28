import type { Batida, EspelhoPontoItem, TipoBatida } from "../../domain/ponto/entities/Batida";
import { parseTimeToMinutes } from "./dateTime";

export function getNextTipoBatida(batidas: Batida[]): TipoBatida {
  if (batidas.length === 0) return "E";
  const sorted = [...batidas].sort((a, b) => new Date(a.data_batida).getTime() - new Date(b.data_batida).getTime());
  const last = sorted[sorted.length - 1];
  return last.tipo === "E" ? "S" : "E";
}

export function getPrimeiraEntrada(batidas: Batida[]) {
  return [...batidas]
    .filter((batida) => batida.tipo === "E")
    .sort((a, b) => new Date(a.data_batida).getTime() - new Date(b.data_batida).getTime())[0];
}

export function getUltimaSaida(batidas: Batida[]) {
  return [...batidas]
    .filter((batida) => batida.tipo === "S")
    .sort((a, b) => new Date(b.data_batida).getTime() - new Date(a.data_batida).getTime())[0];
}

export function getUltimaBatida(batidas: Batida[]) {
  return [...batidas].sort((a, b) => new Date(b.data_batida).getTime() - new Date(a.data_batida).getTime())[0];
}

export function sumTempoTrabalhado(itens: EspelhoPontoItem[]) {
  return itens.reduce((total, item) => total + parseTimeToMinutes(item.tempo_trabalhado), 0);
}

export function sumSaldo(itens: EspelhoPontoItem[]) {
  return itens.reduce((total, item) => total + parseTimeToMinutes(item.saldo), 0);
}

export function groupTempoPorSemana(itens: EspelhoPontoItem[]) {
  const weeks = [0, 0, 0, 0, 0];
  for (const item of itens) {
    const day = new Date(`${item.data}T00:00:00`);
    const index = Math.min(4, Math.floor((day.getDate() - 1) / 7));
    weeks[index] += parseTimeToMinutes(item.tempo_trabalhado);
  }
  return weeks;
}