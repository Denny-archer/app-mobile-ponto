export type TipoJustificativa = "INCLUSAO" | "REMOCAO";

export type Justificativa = {
  id: number;
  requerente?: string;
  id_requerente?: number;
  data_requerida: string;
  tipo: string;
  texto: string;
  status: string | number;
  criado_em: string;
  atualizado_em: string;
};

export type SolicitarInclusaoInput = {
  dataRequerida: string;
  texto: string;
};

export type SolicitarRemocaoInput = {
  idBatida: number;
  texto: string;
};