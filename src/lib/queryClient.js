import { QueryClient } from '@tanstack/react-query';

const CACHE_MINUTES = 60;
const STALE_MINUTES = 10;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * STALE_MINUTES,
      gcTime: 1000 * 60 * CACHE_MINUTES,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});