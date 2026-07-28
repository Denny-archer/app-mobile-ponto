import type { RegistrarPontoInput } from "../entities/Batida";
import type { EspelhoFiltro, ListarBatidasFiltro, PontoRepository } from "../repositories/PontoRepository";

export function createPontoUseCases(pontoRepository: PontoRepository) {
  return {
    registrarPonto(input: RegistrarPontoInput) {
      return pontoRepository.registrarPonto(input);
    },

    listarBatidas(filtro?: ListarBatidasFiltro) {
      return pontoRepository.listarBatidas(filtro);
    },

    obterSaldoDiario(idUsuario: number, data: string) {
      return pontoRepository.obterSaldoDiario(idUsuario, data);
    },

    listarEspelho(filtro: EspelhoFiltro) {
      return pontoRepository.listarEspelho(filtro);
    },
  };
}