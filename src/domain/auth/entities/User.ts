export type UserRoleId = 1 | 2 | 3 | 4 | 5;

export type User = {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  tipo_usuario: UserRoleId | number;
  cargo?: string | number | null;
};