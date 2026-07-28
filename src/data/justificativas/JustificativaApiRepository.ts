import type { AxiosInstance } from "axios";

import type { Justificativa, SolicitarInclusaoInput, SolicitarRemocaoInput } from "../../domain/justificativas/entities/Justificativa";
import type { JustificativaRepository } from "../../domain/justificativas/repositories/JustificativaRepository";

export class JustificativaApiRepository implements JustificativaRepository {
  constructor(private readonly http: AxiosInstance) {}

  async solicitarInclusao(input: SolicitarInclusaoInput): Promise<Justificativa> {
    const formData = new FormData();
    const { data } = await this.http.post<Justificativa>("/justificativas/", formData, {
      params: {
        data_requerida: input.dataRequerida,
        texto: input.texto,
      },
      headers: {
        "Content-Type": "multipart/form-data",
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