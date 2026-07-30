export type UserRoleId = 1 | 2 | 3 | 4 | 5;

export type UserRoleName = "Administrador" | "Colaborador" | "Chefe Setor" | "Gestor RH" | "Visualizador";

export type UserRoleValue = UserRoleId | UserRoleName | number | string;

export type User = {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  tipo_usuario: UserRoleValue;
  departamento?: string | number | null;
  cargo?: string | number | null;
  cpf?: string | null;
  data_admissao?: string | null;
  status?: boolean;
};