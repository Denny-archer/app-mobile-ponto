import type { AxiosInstance } from "axios";

import type { User } from "../../domain/auth/entities/User";
import type { UsuarioRepository } from "../../domain/usuarios/repositories/UsuarioRepository";

export class UsuarioApiRepository implements UsuarioRepository {
  constructor(private readonly http: AxiosInstance) {}

  async alterarSenha(idUsuario: number, novaSenha: string): Promise<User> {
    const { data } = await this.http.patch<User>(`/usuarios/${idUsuario}`, {
      password: novaSenha,
    });

    return data;
  }
}