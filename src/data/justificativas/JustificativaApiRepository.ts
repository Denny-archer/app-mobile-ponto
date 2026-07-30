import type { AxiosInstance } from "axios";

import type { Justificativa, ListarJustificativasFiltro, SolicitarInclusaoInput, SolicitarRemocaoInput } from "../../domain/justificativas/entities/Justificativa";
import type { JustificativaRepository } from "../../domain/justificativas/repositories/JustificativaRepository";

type JustificativasResponse = {
  justificativas: Justificativa[];
};

export class JustificativaApiRepository implements JustificativaRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listarJustificativas(filtro?: ListarJustificativasFiltro): Promise<Justificativa[]> {
    const { data } = await this.http.get<JustificativasResponse>("/justificativas/", {
      params: {
        id_requerente: filtro?.idRequerente,
        data_requerida: filtro?.dataRequerida,
        status: filtro?.status,
        skip: filtro?.skip,
        limit: filtro?.limit,
      },
    });

    return data.justificativas ?? [];
  }

  async solicitarInclusao(input: SolicitarInclusaoInput): Promise<Justificativa> {
    const { data } = await this.http.post<Justificativa>("/justificativas/", null, {
      params: {
        data_requerida: input.dataRequerida,
        texto: input.texto,
      },
    });

    return data;
  }

  async solicitarRemocao(input: SolicitarRemocaoInput): Promise<Justificativa> {
    const { data } = await this.http.post<Justificativa>("/justificativas/remocao", null, {
      params: {
        id_batida: input.idBatida,
        texto: input.texto,
      },
    });

    return data;
  }
}
