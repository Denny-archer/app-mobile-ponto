import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Batida, TipoBatida } from "../domain/ponto/entities/Batida";
import { AlterarSenhaScreen } from "../presentation/conta/AlterarSenhaScreen";
import { PontosBatidosScreen } from "../presentation/historico/PontosBatidosScreen";
import { PontoHomeScreen } from "../presentation/ponto/PontoHomeScreen";
import { PontoRegistradoScreen } from "../presentation/ponto/PontoRegistradoScreen";
import { RegistrarPontoScreen } from "../presentation/ponto/RegistrarPontoScreen";
import { RelatorioMensalScreen } from "../presentation/relatorio/RelatorioMensalScreen";

export type AppStackParamList = {
  Home: undefined;
  RegistrarPonto: { tipo: TipoBatida };
  PontoRegistrado: { batida: Batida; imagemUri?: string };
  PontosBatidos: undefined;
  RelatorioMensal: undefined;
  AlterarSenha: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={PontoHomeScreen} />
      <Stack.Screen name="RegistrarPonto" component={RegistrarPontoScreen} />
      <Stack.Screen name="PontoRegistrado" component={PontoRegistradoScreen} />
      <Stack.Screen name="PontosBatidos" component={PontosBatidosScreen} />
      <Stack.Screen name="RelatorioMensal" component={RelatorioMensalScreen} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
    </Stack.Navigator>
  );
}