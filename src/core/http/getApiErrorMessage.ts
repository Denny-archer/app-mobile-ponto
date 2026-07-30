import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Erro inesperado.") {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 401) {
    return "Usuário ou senha incorretos.";
  }

  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg).filter(Boolean).join("\n") || fallback;
  }

  return error.message || fallback;
}