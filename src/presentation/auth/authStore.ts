import { create } from "zustand";

import { authUseCases } from "../../app/dependencies";
import { getApiErrorMessage } from "../../core/http/getApiErrorMessage";
import type { User } from "../../domain/auth/entities/User";
import type { LoginCredentials } from "../../domain/auth/repositories/AuthRepository";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  restoreSession(): Promise<void>;
  signIn(credentials: LoginCredentials): Promise<void>;
  signOut(): Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  error: null,

  async restoreSession() {
    set({ status: "loading", error: null });
    const user = await authUseCases.restoreSession();
    set({
      user,
      status: user ? "authenticated" : "unauthenticated",
    });
  },

  async signIn(credentials) {
    try {
      set({ status: "loading", error: null });
      const user = await authUseCases.signIn(credentials);
      set({ user, status: "authenticated" });
    } catch (error) {
      set({
        user: null,
        status: "unauthenticated",
        error: getApiErrorMessage(error, "Não foi possível entrar."),
      });
      throw error;
    }
  },

  async signOut() {
    await authUseCases.signOut();
    set({ user: null, status: "unauthenticated", error: null });
  },
}));