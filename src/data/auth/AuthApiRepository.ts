import type { AxiosInstance } from "axios";

import type { User } from "../../domain/auth/entities/User";
import type { AuthRepository, AuthToken, LoginCredentials } from "../../domain/auth/repositories/AuthRepository";

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export class AuthApiRepository implements AuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async signIn(credentials: LoginCredentials): Promise<AuthToken> {
    const body = new URLSearchParams();
    body.append("username", credentials.login);
    body.append("password", credentials.password);

    const { data } = await this.http.post<TokenResponse>("/token/", body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
    };
  }

  async me(): Promise<User> {
    const { data } = await this.http.get<User>("/usuarios/me");
    return data;
  }
}