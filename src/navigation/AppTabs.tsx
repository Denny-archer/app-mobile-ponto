import { AppNavigator } from "./AppNavigator";

export type AppTabParamList = Record<string, never>;

export function AppTabs() {
  return <AppNavigator />;
}