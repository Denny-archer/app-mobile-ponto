import axios, { type AxiosInstance } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

type AxiosMockResult = {
  http: AxiosInstance;
  mock: AxiosMockAdapter;
};

export function createAxiosMock(baseURL = "http://localhost:8000"): AxiosMockResult {
  const http = axios.create({ baseURL });
  const mock = new AxiosMockAdapter(http);

  return { http, mock };
}
