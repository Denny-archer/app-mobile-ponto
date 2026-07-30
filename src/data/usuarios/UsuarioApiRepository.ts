import type { AxiosInstance } from "axios";

import type { User } from "../../domain/auth/entities/User";
import type { ListarUsuariosFiltro, UsuarioGestao, UsuarioRepository } from "../../domain/usuarios/repositories/UsuarioRepository";

type UsuariosResponse = {
  usuarios?: UsuarioGestao[];
};

export class UsuarioApiRepository implements UsuarioRepository {
  constructor(private readonly http: AxiosInstance) {}

  async alterarSenha(idUsuario: number, novaSenha: string): Promise<User> {
    const { data } = await this.http.patch<User>(`/usuarios/${idUsuario}`, {
      password: novaSenha,
    });

    return data;
  }

  async listarUsuarios(filtro?: ListarUsuariosFiltro): Promise<UsuarioGestao[]> {
    const { data } = await this.http.get<UsuariosResponse>("/usuarios/", {
      params: {
        id: filtro?.id,
        nome: filtro?.nome,
        email: filtro?.email,
        matricula: filtro?.matricula,
        departamento: filtro?.departamento,
        status: filtro?.status,
        skip: filtro?.skip ?? 0,
        limit: filtro?.limit ?? 25,
        sort: filtro?.sort ?? true,
      },
    });

    return data.usuarios ?? [];
  }

  async obterUsuarioPorId(idUsuario: number): Promise<UsuarioGestao | null> {
    const usuarios = await this.listarUsuarios({ id: idUsuario, limit: 1, skip: 0 });
    return usuarios[0] ?? null;
  }
}