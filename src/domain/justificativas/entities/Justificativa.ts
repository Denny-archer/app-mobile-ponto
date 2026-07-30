export type TipoJustificativa = "INCLUSAO" | "REMOCAO";

export type Justificativa = {
  id: number;
  requerente?: string;
  departamento_requerente?: string;
  id_requerente?: number;
  data_requerida: string;
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
  dataRequerida?: string;
  status?: string;
  skip?: number;
  limit?: number;
};

export type SolicitarInclusaoInput = {
  dataRequerida: string;
  texto: string;
};

export type SolicitarRemocaoInput = {
  idBatida: number;
  texto: string;
};
