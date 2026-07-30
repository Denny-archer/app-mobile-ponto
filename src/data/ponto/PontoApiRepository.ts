import type { AxiosInstance } from "axios";

import type { Batida, EspelhoPontoItem, RegistrarPontoInput, SaldoDiario } from "../../domain/ponto/entities/Batida";
import type { EspelhoFiltro, ListarBatidasFiltro, PontoRepository } from "../../domain/ponto/repositories/PontoRepository";

type BatidasResponse = {
  batidas: Batida[];
};

type EspelhoResponse = {
  datas: EspelhoPontoItem[];
};

export class PontoApiRepository implements PontoRepository {
  constructor(private readonly http: AxiosInstance) {}

  async registrarPonto(input: RegistrarPontoInput): Promise<Batida> {
    const formData = new FormData();
    formData.append("imagem", {
      uri: input.imagemUri,
      name: `selfie-${Date.now()}.jpg`,
      type: "image/jpeg",
    } as unknown as Blob);

    const { data } = await this.http.post<Batida>("/batidas/", formData, {
      params: {
        id_usuario: input.idUsuario,
        tipo: input.tipo,
        descricao: input.descricao,
      },
    });

    return data;
  }

  async listarBatidas(filtro?: ListarBatidasFiltro): Promise<Batida[]> {
    const { data } = await this.http.get<BatidasResponse>("/batidas/", {
      params: {
        id_usuario: filtro?.idUsuario,
        data_inicio: filtro?.dataInicio,
        data_fim: filtro?.dataFim,
        sort: filtro?.sort,
      },
    });

    return data.batidas ?? [];
  }

  async obterSaldoDiario(idUsuario: number, dataReferencia: string): Promise<SaldoDiario | null> {
    try {
      const { data } = await this.http.get<SaldoDiario>(`/batidas/saldo_diario/${idUsuario}`, {
        params: { data: dataReferencia },
      });
      return data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  }

  async listarEspelho(filtro: EspelhoFiltro): Promise<EspelhoPontoItem[]> {
    const { data } = await this.http.get<EspelhoResponse>(`/batidas/espelho/${filtro.idUsuario}`, {
      params: {
        data_inicio: filtro.dataInicio,
        data_fim: filtro.dataFim,
      },
    });

    return data.datas ?? [];
  }
}