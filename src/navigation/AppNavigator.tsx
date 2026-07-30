import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Batida, TipoBatida } from "../domain/ponto/entities/Batida";
import type { UsuarioGestao } from "../domain/usuarios/repositories/UsuarioRepository";
import { AlterarSenhaScreen } from "../presentation/conta/AlterarSenhaScreen";
import { GestaoColaboradorDetalheScreen } from "../presentation/gestao/GestaoColaboradorDetalheScreen";
import { GestaoColaboradoresScreen } from "../presentation/gestao/GestaoColaboradoresScreen";
import { GestaoHomeScreen } from "../presentation/gestao/GestaoHomeScreen";
import { GestaoJustificativasScreen } from "../presentation/gestao/GestaoJustificativasScreen";
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
  GestaoHome: undefined;
  GestaoColaboradores: undefined;
  GestaoColaboradorDetalhe: { colaboradorId: number; colaborador?: UsuarioGestao };
  GestaoJustificativas: { colaboradorId?: number; colaboradorNome?: string } | undefined;
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
      <Stack.Screen name="GestaoHome" component={GestaoHomeScreen} />
      <Stack.Screen name="GestaoColaboradores" component={GestaoColaboradoresScreen} />
      <Stack.Screen name="GestaoColaboradorDetalhe" component={GestaoColaboradorDetalheScreen} />
      <Stack.Screen name="GestaoJustificativas" component={GestaoJustificativasScreen} />
    </Stack.Navigator>
  );
}