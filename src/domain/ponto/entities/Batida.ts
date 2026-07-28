export type TipoBatida = "E" | "S";

export type Batida = {
  id: number;
  id_usuario: number;
  data_batida: string;
  nome_imagem?: string | null;
  tipo: TipoBatida | string;
  descricao?: string | null;
};

export type RegistrarPontoInput = {
  idUsuario: number;
  tipo: TipoBatida;
  imagemUri: string;
  descricao?: string;
};

export type SaldoDiario = {
  id_usuario: number;
  data: string;
  carga_horaria_esperada: string;
  tempo_trabalhado: string;
  saldo_dia: string;
  qtd_batidas: number;
  status: string;
};

export type EspelhoPontoItem = {
  data: string;
  dia_semana: string;
  status: string;
  carga_esperada: string;
  tempo_trabalhado: string;
  saldo: string;
  origem: string;
};