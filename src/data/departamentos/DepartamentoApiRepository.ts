import type { AxiosInstance } from "axios";

import type { Departamento, ListarDepartamentosFiltro } from "../../domain/departamentos/entities/Departamento";
import type { DepartamentoRepository } from "../../domain/departamentos/repositories/DepartamentoRepository";

type DepartamentosResponse = {
  departamentos?: Departamento[];
};

export class DepartamentoApiRepository implements DepartamentoRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listarDepartamentos(filtro?: ListarDepartamentosFiltro): Promise<Departamento[]> {
    const { data } = await this.http.get<DepartamentosResponse>("/departamentos/", {
      params: {
        nome: filtro?.nome,
        skip: filtro?.skip ?? 0,
        limit: filtro?.limit,
        sort: filtro?.sort ?? true,
      },
    });

    return data.departamentos ?? [];
  }
}
