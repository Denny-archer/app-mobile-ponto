import NetInfo from "@react-native-community/netinfo";
import { render, userEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { queryClient } from "../../../app/queryClient";
import type { Batida } from "../../../domain/ponto/entities/Batida";
import { useAuthStore } from "../../auth/authStore";
import { RegistrarPontoScreen } from "../RegistrarPontoScreen";

const mockRegistrarPonto = jest.fn();
const mockPersistCapturedImage = jest.fn(async (_uri: string) => "file:///test-cache/selfie-persistida.jpg");

jest.mock("../../../app/dependencies", () => ({
  pontoUseCases: {
    registrarPonto: (input: unknown) => mockRegistrarPonto(input),
  },
}));

jest.mock("../../../core/files/persistCapturedImage", () => ({
  persistCapturedImage: (uri: string) => mockPersistCapturedImage(uri),
}));

function createNavigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  };
}

function setAuthenticatedUser() {
  useAuthStore.setState({
    error: null,
    status: "authenticated",
    user: {
      email: "denilson.jose@coffito.gov.br",
      id: 18,
      matricula: "128",
      nome: "Denilson Adelino Jose",
      tipo_usuario: "Colaborador",
    },
  });
}

describe("RegistrarPontoScreen", () => {
  beforeEach(() => {
    setAuthenticatedUser();
    mockRegistrarPonto.mockReset();
    mockPersistCapturedImage.mockClear();
    jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      details: null,
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("captura selfie, registra ponto e navega para tela de sucesso", async () => {
    const user = userEvent.setup();
    const batida: Batida = {
      data_batida: "2026-07-31T16:18:00",
      id: 501,
      id_usuario: 18,
      nome_imagem: "selfie.jpg",
      tipo: "E",
    };
    mockRegistrarPonto.mockResolvedValue(batida);
    const navigation = createNavigation();

    const screen = await render(
      <RegistrarPontoScreen
        navigation={navigation as never}
        route={{ params: { tipo: "E" } } as never}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("camera-view")).toBeTruthy());

    await user.press(screen.getByText("Registrar entrada"));

    await waitFor(() => {
      expect(mockRegistrarPonto).toHaveBeenCalledWith({
        idUsuario: 18,
        imagemUri: "file:///test-cache/selfie-persistida.jpg",
        tipo: "E",
      });
    });

    expect(mockPersistCapturedImage).toHaveBeenCalledWith("file:///selfie.jpg");
    expect(navigation.replace).toHaveBeenCalledWith("PontoRegistrado", {
      batida,
      imagemUri: "file:///test-cache/selfie-persistida.jpg",
    });
  });

  it("bloqueia envio quando o aparelho esta offline", async () => {
    const user = userEvent.setup();
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({
      details: null,
      isConnected: false,
      isInternetReachable: false,
      type: "none",
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const navigation = createNavigation();

    const screen = await render(
      <RegistrarPontoScreen
        navigation={navigation as never}
        route={{ params: { tipo: "E" } } as never}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("camera-view")).toBeTruthy());

    await user.press(screen.getByText("Registrar entrada"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining("Sem conex"),
        expect.stringContaining("ponto"),
      );
    });

    expect(mockRegistrarPonto).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
