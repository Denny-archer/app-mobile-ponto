import type { Departamento, ListarDepartamentosFiltro } from "../entities/Departamento";

export interface DepartamentoRepository {
  listarDepartamentos(filtro?: ListarDepartamentosFiltro): Promise<Departamento[]>;
}
