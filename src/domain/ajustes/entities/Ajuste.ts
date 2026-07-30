export type Ajuste = {
  id: number;
  id_usuario: number;
  data: string;
  valor: string;
  motivo: string;
  criado_por: number;
};

export type ListarAjustesFiltro = {
  idUsuario: number;
  dataInicio: string;
  dataFim: string;
};
