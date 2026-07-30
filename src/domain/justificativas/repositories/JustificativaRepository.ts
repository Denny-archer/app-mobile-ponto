import type {
  Justificativa,
  ListarJustificativasFiltro,
  ResponderJustificativaInput,
  SolicitarInclusaoInput,
  SolicitarRemocaoInput,
} from "../entities/Justificativa";

export interface JustificativaRepository {
  listarJustificativas(filtro?: ListarJustificativasFiltro): Promise<Justificativa[]>;
  solicitarInclusao(input: SolicitarInclusaoInput): Promise<Justificativa>;
  solicitarRemocao(input: SolicitarRemocaoInput): Promise<Justificativa>;
  responderJustificativa(input: ResponderJustificativaInput): Promise<Justificativa>;
}