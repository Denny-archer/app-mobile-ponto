import * as SecureStore from "expo-secure-store";

import type { TokenStorage } from "./TokenStorage";

const ACCESS_TOKEN_KEY = "ponto.accessToken";

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureTokenStorage: TokenStorage = {
  getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, secureStoreOptions);
  },

  async clearAccessToken() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },
};