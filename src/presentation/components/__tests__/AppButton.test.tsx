import { fireEvent, render } from "@testing-library/react-native";

import { AppButton } from "../AppButton";

describe("AppButton", () => {
  it("renderiza o titulo e chama onPress", async () => {
    const onPress = jest.fn();
    const screen = await render(<AppButton onPress={onPress} title="Registrar ponto" />);

    expect(screen.getByText("Registrar ponto")).toBeTruthy();

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("bloqueia interacao quando esta carregando", async () => {
    const onPress = jest.fn();
    const screen = await render(<AppButton loading onPress={onPress} title="Enviando" />);

    expect(screen.getByText("Enviando")).toBeTruthy();

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).not.toHaveBeenCalled();
  });
});
