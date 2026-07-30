import type { UsuarioRepository } from "../repositories/UsuarioRepository";

export function createUsuarioUseCases(repository: UsuarioRepository) {
  return {
    alterarSenha(idUsuario: number, novaSenha: string) {
      return repository.alterarSenha(idUsuario, novaSenha);
    },
  };
}