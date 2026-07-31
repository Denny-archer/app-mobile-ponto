import axios from "axios";

export function isApiConnectionError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}

export function getApiErrorMessage(error: unknown, fallback = "Erro inesperado.") {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (isApiConnectionError(error)) {
    if (error.code === "ECONNABORTED") {
      return "A conexão demorou demais. Verifique sua internet e tente novamente.";
    }

    return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
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
