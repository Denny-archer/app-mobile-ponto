import type { ListarAjustesFiltro } from "../entities/Ajuste";
import type { AjusteRepository } from "../repositories/AjusteRepository";

export function createAjusteUseCases(repository: AjusteRepository) {
  return {
    listarAjustes(filtro: ListarAjustesFiltro) {
      return repository.listarAjustes(filtro);
    },
  };
}
