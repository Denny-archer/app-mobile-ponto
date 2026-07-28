import axios from "axios";

import { env } from "../config/env";
import { secureTokenStorage } from "../storage/secureTokenStorage";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
});

httpClient.interceptors.request.use(async (config) => {
  const token = await secureTokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});