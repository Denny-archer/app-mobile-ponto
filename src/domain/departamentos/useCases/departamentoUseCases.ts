import type { ListarDepartamentosFiltro } from "../entities/Departamento";
import type { DepartamentoRepository } from "../repositories/DepartamentoRepository";

export function createDepartamentoUseCases(repository: DepartamentoRepository) {
  return {
    listarDepartamentos(filtro?: ListarDepartamentosFiltro) {
      return repository.listarDepartamentos(filtro);
    },
  };
}
