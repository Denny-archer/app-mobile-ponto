import type { User } from "../../auth/entities/User";

export type UsuarioGestao = User & {
  criado_em?: string;
  atualizado_em?: string;
};

export type ListarUsuariosFiltro = {
  id?: number;
  nome?: string;
  email?: string;
  matricula?: string;
  departamento?: string;
  status?: boolean;
  skip?: number;
  limit?: number;
  sort?: boolean;
};

export interface UsuarioRepository {
  alterarSenha(idUsuario: number, novaSenha: string): Promise<User>;
  listarUsuarios(filtro?: ListarUsuariosFiltro): Promise<UsuarioGestao[]>;
  obterUsuarioPorId(idUsuario: number): Promise<UsuarioGestao | null>;
}