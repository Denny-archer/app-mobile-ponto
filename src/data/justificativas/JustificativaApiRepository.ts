import type { AxiosInstance } from "axios";

import type {
  Justificativa,
  ListarJustificativasFiltro,
  ResponderJustificativaInput,
  SolicitarInclusaoInput,
  SolicitarRemocaoInput,
} from "../../domain/justificativas/entities/Justificativa";
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
        id_departamento_requerente: filtro?.idDepartamentoRequerente,
        data_requerida: filtro?.dataRequerida,
        id_validador: filtro?.idValidador,
        status: filtro?.status,
        skip: filtro?.skip,
        limit: filtro?.limit,
        sort: filtro?.sort,
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

  async responderJustificativa(input: ResponderJustificativaInput): Promise<Justificativa> {
    const { data } = await this.http.patch<Justificativa>(`/justificativas/${input.idJustificativa}`, {
      resposta: input.resposta,
    });

    return data;
  }
}