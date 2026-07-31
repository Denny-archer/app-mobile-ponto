import { render, userEvent, waitFor } from "@testing-library/react-native";

import { LoginScreen } from "../LoginScreen";
import { useAuthStore } from "../authStore";

const initialAuthActions = {
  restoreSession: useAuthStore.getState().restoreSession,
  signIn: useAuthStore.getState().signIn,
  signOut: useAuthStore.getState().signOut,
};

describe("LoginScreen", () => {
  beforeEach(() => {
    useAuthStore.setState({
      ...initialAuthActions,
      error: null,
      status: "unauthenticated",
      user: null,
    });
  });

  it("envia credenciais preenchidas para o authStore", async () => {
    const user = userEvent.setup();
    const signIn = jest.fn(async () => undefined);
    useAuthStore.setState({
      error: null,
      signIn,
      status: "unauthenticated",
      user: null,
    });

    const screen = await render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText("Digite seu acesso"), "  denilson  ");
    await user.type(screen.getByPlaceholderText("Digite sua senha"), "123456");
    await user.press(screen.getByRole("button"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        login: "denilson",
        password: "123456",
      });
    });
  });

  it("exibe erro de autenticacao vindo do estado", async () => {
    useAuthStore.setState({
      error: "Usuario ou senha incorretos.",
      status: "unauthenticated",
      user: null,
    });

    const screen = await render(<LoginScreen />);

    expect(await screen.findByText("Usuario ou senha incorretos.")).toBeTruthy();
  });
});
