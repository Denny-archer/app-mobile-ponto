import type { Ajuste, ListarAjustesFiltro } from "../entities/Ajuste";

export interface AjusteRepository {
  listarAjustes(filtro: ListarAjustesFiltro): Promise<Ajuste[]>;
}
