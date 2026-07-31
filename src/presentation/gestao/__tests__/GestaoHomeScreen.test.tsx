import { waitFor } from "@testing-library/react-native";

import { renderWithQueryClient } from "../../../test/renderWithQueryClient";
import { useAuthStore } from "../../auth/authStore";
import { GestaoHomeScreen } from "../GestaoHomeScreen";

const mockListarJustificativas = jest.fn();

jest.mock("../../../app/dependencies", () => ({
  justificativaUseCases: {
    listarJustificativas: (filtro: unknown) => mockListarJustificativas(filtro),
  },
}));

function createNavigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
}

describe("GestaoHomeScreen", () => {
  afterEach(() => {
    mockListarJustificativas.mockReset();
  });

  it("oculta recursos de gestao para colaborador", async () => {
    useAuthStore.setState({
      error: null,
      status: "authenticated",
      user: {
        email: "colaborador@coffito.gov.br",
        id: 12,
        matricula: "12",
        nome: "Colaborador Teste",
        tipo_usuario: "Colaborador",
      },
    });

    const screen = await renderWithQueryClient(
      <GestaoHomeScreen navigation={createNavigation() as never} route={{} as never} />,
    );

    expect(screen.getByText(/Acesso/)).toBeTruthy();
    expect(mockListarJustificativas).not.toHaveBeenCalled();
  });

  it("exibe atalhos de gestao para gestor autorizado", async () => {
    mockListarJustificativas.mockResolvedValue([{ id: 1 }]);
    useAuthStore.setState({
      error: null,
      status: "authenticated",
      user: {
        email: "gestor.rh@coffito.gov.br",
        id: 7,
        matricula: "47",
        nome: "Gestor RH",
        tipo_usuario: "Gestor RH",
      },
    });

    const screen = await renderWithQueryClient(
      <GestaoHomeScreen navigation={createNavigation() as never} route={{} as never} />,
    );

    await waitFor(() => {
      expect(mockListarJustificativas).toHaveBeenCalled();
    });

    expect(screen.getByText("Colaboradores")).toBeTruthy();
    expect(screen.getByText("Justificativas")).toBeTruthy();
    expect(screen.getByText("Banco de horas")).toBeTruthy();
  });
});
