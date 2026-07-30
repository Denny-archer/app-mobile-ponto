export type TipoJustificativa = "INCLUSAO" | "REMOCAO";

export type Justificativa = {
  id: number;
  requerente?: string;
  departamento_requerente?: string;
  id_requerente?: number;
  data_requerida: string;
  id_batida_referenciada?: number | null;
  tipo: string;
  texto: string;
  validador?: string | null;
  nome_anexo?: string | null;
  status: string | number;
  criado_em: string;
  atualizado_em: string;
};

export type ListarJustificativasFiltro = {
  idRequerente?: number;
  idDepartamentoRequerente?: number;
  dataRequerida?: string;
  idValidador?: number;
  status?: string;
  skip?: number;
  limit?: number;
  sort?: boolean;
};

export type SolicitarInclusaoInput = {
  dataRequerida: string;
  texto: string;
};

export type SolicitarRemocaoInput = {
  idBatida: number;
  texto: string;
};

export type ResponderJustificativaInput = {
  idJustificativa: number;
  resposta: 2 | 3;
};