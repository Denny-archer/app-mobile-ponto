export type Departamento = {
  id: number;
  nome: string;
};

export type ListarDepartamentosFiltro = {
  nome?: string;
  skip?: number;
  limit?: number;
  sort?: boolean;
};
