import { env } from "../config/env";

export function buildPontoImageUrl(nomeImagem?: string | null): string | undefined {
  if (!nomeImagem) {
    return undefined;
  }

  const baseUrl = env.apiBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}/pontos/${encodeURIComponent(nomeImagem)}`;
}
