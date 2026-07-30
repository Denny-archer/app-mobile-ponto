import type { Batida, EspelhoPontoItem, RegistrarPontoInput, SaldoDiario } from "../entities/Batida";

export type ListarBatidasFiltro = {
  idUsuario?: number;
  dataInicio?: string;
  dataFim?: string;
  sort?: boolean;
};

export type EspelhoFiltro = {
  idUsuario: number;
  dataInicio: string;
  dataFim: string;
};

export interface PontoRepository {
  registrarPonto(input: RegistrarPontoInput): Promise<Batida>;
  listarBatidas(filtro?: ListarBatidasFiltro): Promise<Batida[]>;
  obterSaldoDiario(idUsuario: number, data: string): Promise<SaldoDiario | null>;
  listarEspelho(filtro: EspelhoFiltro): Promise<EspelhoPontoItem[]>;
}