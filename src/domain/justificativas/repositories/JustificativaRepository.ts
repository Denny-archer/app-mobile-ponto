import type { Justificativa, SolicitarInclusaoInput, SolicitarRemocaoInput } from "../entities/Justificativa";

export interface JustificativaRepository {
  solicitarInclusao(input: SolicitarInclusaoInput): Promise<Justificativa>;
  solicitarRemocao(input: SolicitarRemocaoInput): Promise<Justificativa>;
}