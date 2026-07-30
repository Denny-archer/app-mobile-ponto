import * as FileSystem from "expo-file-system/legacy";

export async function persistCapturedImage(sourceUri: string): Promise<string> {
  const cacheDirectory = FileSystem.cacheDirectory;

  if (!cacheDirectory) {
    return sourceUri;
  }

  const targetUri = `${cacheDirectory}ponto-selfie-${Date.now()}.jpg`;

  try {
    await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
    const targetInfo = await FileSystem.getInfoAsync(targetUri);
    return targetInfo.exists ? targetUri : sourceUri;
  } catch {
    return sourceUri;
  }
}
