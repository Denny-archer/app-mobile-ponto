import { userEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import type { Justificativa } from "../../../domain/justificativas/entities/Justificativa";
import { renderWithQueryClient } from "../../../test/renderWithQueryClient";
import { useAuthStore } from "../../auth/authStore";
import { GestaoJustificativasScreen } from "../GestaoJustificativasScreen";

const mockListarJustificativas = jest.fn();
const mockResponderJustificativa = jest.fn();

jest.mock("../../../app/dependencies", () => ({
  justificativaUseCases: {
    listarJustificativas: (filtro: unknown) => mockListarJustificativas(filtro),
    responderJustificativa: (input: unknown) => mockResponderJustificativa(input),
  },
}));

function createNavigation() {
  return {
    goBack: jest.fn(),
  };
}

const justificativaPendente: Justificativa = {
  atualizado_em: "2026-07-31T10:00:00",
  criado_em: "2026-07-31T10:00:00",
  data_requerida: "2026-07-31T08:00:00",
  departamento_requerente: "TI",
  id: 77,
  id_requerente: 18,
  requerente: "Denilson Adelino Jose",
  status: "Aguardando",
  texto: "batida atrasada",
  tipo: "INCLUSAO",
};

describe("GestaoJustificativasScreen", () => {
  beforeEach(() => {
    mockListarJustificativas.mockResolvedValue([justificativaPendente]);
    mockResponderJustificativa.mockResolvedValue({ ok: true });
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockListarJustificativas.mockReset();
    mockResponderJustificativa.mockReset();
  });

  it("lista justificativas pendentes e aprova uma solicitacao", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      const approveButton = buttons?.find((button) => button.text === "Aprovar");
      approveButton?.onPress?.();
    });

    const screen = await renderWithQueryClient(
      <GestaoJustificativasScreen
        navigation={createNavigation() as never}
        route={{ params: undefined } as never}
      />,
    );

    expect(await screen.findByText("batida atrasada")).toBeTruthy();
    expect(screen.getByText("Denilson Adelino Jose")).toBeTruthy();

    await user.press(screen.getByText("Aprovar"));

    await waitFor(() => {
      expect(mockResponderJustificativa).toHaveBeenCalledWith({
        idJustificativa: 77,
        resposta: 2,
      });
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Justificativa aprovada", expect.any(String));
    });
  });
});
