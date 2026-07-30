import type { User, UserRoleId, UserRoleValue } from "../../domain/auth/entities/User";

export const USER_ROLES = {
  ADMINISTRADOR: 1,
  COLABORADOR: 2,
  CHEFE_SETOR: 3,
  GESTOR_RH: 4,
  VISUALIZADOR: 5,
} as const satisfies Record<string, UserRoleId>;

export function normalizePlainText(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .trim();
}

export function normalizeUserRole(value: UserRoleValue | null | undefined): UserRoleId | null {
  if (typeof value === "number") {
    return value >= 1 && value <= 5 ? (value as UserRoleId) : null;
  }

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) {
    return numeric as UserRoleId;
  }

  const normalized = normalizePlainText(value);

  if (normalized.includes("admin")) return USER_ROLES.ADMINISTRADOR;
  if (normalized.includes("gestor") && normalized.includes("rh")) return USER_ROLES.GESTOR_RH;
  if (normalized.includes("chefe")) return USER_ROLES.CHEFE_SETOR;
  if (normalized.includes("visual")) return USER_ROLES.VISUALIZADOR;
  if (normalized.includes("colab")) return USER_ROLES.COLABORADOR;

  return null;
}

export function canAccessGestao(user: User | null | undefined) {
  const role = normalizeUserRole(user?.tipo_usuario);
  return role === USER_ROLES.ADMINISTRADOR || role === USER_ROLES.GESTOR_RH || role === USER_ROLES.CHEFE_SETOR;
}

export function canManageJustificativas(user: User | null | undefined) {
  return canAccessGestao(user);
}

export function roleLabel(value: UserRoleValue | null | undefined) {
  const role = normalizeUserRole(value);

  switch (role) {
    case USER_ROLES.ADMINISTRADOR:
      return "Administrador";
    case USER_ROLES.GESTOR_RH:
      return "Gestor RH";
    case USER_ROLES.CHEFE_SETOR:
      return "Chefe de Setor";
    case USER_ROLES.VISUALIZADOR:
      return "Visualizador";
    case USER_ROLES.COLABORADOR:
      return "Colaborador";
    default:
      return String(value ?? "Perfil não informado");
  }
}
