import type { SolicitarInclusaoInput, SolicitarRemocaoInput } from "../entities/Justificativa";
import type { JustificativaRepository } from "../repositories/JustificativaRepository";

export function createJustificativaUseCases(repository: JustificativaRepository) {
  return {
    solicitarInclusao(input: SolicitarInclusaoInput) {
      return repository.solicitarInclusao(input);
    },

    solicitarRemocao(input: SolicitarRemocaoInput) {
      return repository.solicitarRemocao(input);
    },
  };
}