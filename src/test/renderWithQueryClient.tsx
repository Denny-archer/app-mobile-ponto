import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react-native";

export async function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        gcTime: Infinity,
        retry: 0,
      },
      queries: {
        gcTime: Infinity,
        retry: false,
        staleTime: 0,
      },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  const result = await render(ui, { wrapper: Wrapper, ...options });

  return { ...result, queryClient };
}
