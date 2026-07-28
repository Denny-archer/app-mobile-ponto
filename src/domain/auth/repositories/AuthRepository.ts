import type { User } from "../entities/User";

export type LoginCredentials = {
  login: string;
  password: string;
};

export type AuthToken = {
  accessToken: string;
  tokenType: string;
};

export interface AuthRepository {
  signIn(credentials: LoginCredentials): Promise<AuthToken>;
  me(): Promise<User>;
}