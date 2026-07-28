import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { env } from "../config/env";
import { secureTokenStorage } from "../storage/secureTokenStorage";

function joinApiUrl(path: string) {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function downloadAuthenticatedPdf(path: string, fileName: string) {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Armazenamento temporário indisponível.");
  }

  const token = await secureTokenStorage.getAccessToken();
  const result = await FileSystem.downloadAsync(
    joinApiUrl(path),
    `${FileSystem.cacheDirectory}${fileName}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  if (result.status >= 400) {
    throw new Error("Não foi possível baixar o PDF.");
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: fileName,
      UTI: "com.adobe.pdf",
    });
  }

  return result.uri;
}