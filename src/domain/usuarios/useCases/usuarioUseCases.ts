import type { ListarUsuariosFiltro, UsuarioRepository } from "../repositories/UsuarioRepository";

export function createUsuarioUseCases(repository: UsuarioRepository) {
  return {
    alterarSenha(idUsuario: number, novaSenha: string) {
      return repository.alterarSenha(idUsuario, novaSenha);
    },

    listarUsuarios(filtro?: ListarUsuariosFiltro) {
      return repository.listarUsuarios(filtro);
    },

    obterUsuarioPorId(idUsuario: number) {
      return repository.obterUsuarioPorId(idUsuario);
    },
  };
}