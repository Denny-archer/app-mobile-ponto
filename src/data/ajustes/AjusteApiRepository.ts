import type { AxiosInstance } from "axios";

import type { Ajuste, ListarAjustesFiltro } from "../../domain/ajustes/entities/Ajuste";
import type { AjusteRepository } from "../../domain/ajustes/repositories/AjusteRepository";

type AjustesResponse = {
  ajustes?: Ajuste[];
};

function normalizeAjustesResponse(data: AjustesResponse | Ajuste[] | Ajuste | null | undefined) {
  if (Array.isArray(data)) return data;
  if (data && "ajustes" in data && Array.isArray(data.ajustes)) return data.ajustes;
  if (data && "id" in data) return [data as Ajuste];
  return [];
}

export class AjusteApiRepository implements AjusteRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listarAjustes(filtro: ListarAjustesFiltro): Promise<Ajuste[]> {
    const { data } = await this.http.get<AjustesResponse | Ajuste[] | Ajuste>(`/ajustes/${filtro.idUsuario}`, {
      params: {
        data_inicio: filtro.dataInicio,
        data_fim: filtro.dataFim,
      },
    });

    return normalizeAjustesResponse(data);
  }
}
