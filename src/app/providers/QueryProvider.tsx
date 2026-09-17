import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NODES_STALE_TIME_MS } from '@/shared/config';
import type { QueryProviderProps } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: NODES_STALE_TIME_MS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Провайдер React Query для приложения.
 *
 * @param {QueryProviderProps} props - дочерние элементы
 * @returns {JSX.Element} `QueryClientProvider`
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
