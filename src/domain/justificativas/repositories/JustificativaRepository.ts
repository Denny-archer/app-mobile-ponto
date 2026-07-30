import type { Justificativa, ListarJustificativasFiltro, SolicitarInclusaoInput, SolicitarRemocaoInput } from "../entities/Justificativa";

export interface JustificativaRepository {
  listarJustificativas(filtro?: ListarJustificativasFiltro): Promise<Justificativa[]>;
  solicitarInclusao(input: SolicitarInclusaoInput): Promise<Justificativa>;
  solicitarRemocao(input: SolicitarRemocaoInput): Promise<Justificativa>;
}
