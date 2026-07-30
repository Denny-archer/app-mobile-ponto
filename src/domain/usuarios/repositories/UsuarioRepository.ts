import type { User } from "../../auth/entities/User";

export interface UsuarioRepository {
  alterarSenha(idUsuario: number, novaSenha: string): Promise<User>;
}