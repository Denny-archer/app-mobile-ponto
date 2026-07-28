import type { TokenStorage } from "../../../core/storage/TokenStorage";
import type { User } from "../entities/User";
import type { AuthRepository, LoginCredentials } from "../repositories/AuthRepository";

export function createAuthUseCases(authRepository: AuthRepository, tokenStorage: TokenStorage) {
  return {
    async signIn(credentials: LoginCredentials): Promise<User> {
      const token = await authRepository.signIn(credentials);
      await tokenStorage.setAccessToken(token.accessToken);
      return authRepository.me();
    },

    async restoreSession(): Promise<User | null> {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        return null;
      }

      try {
        return await authRepository.me();
      } catch {
        await tokenStorage.clearAccessToken();
        return null;
      }
    },

    async signOut(): Promise<void> {
      await tokenStorage.clearAccessToken();
    },
  };
}