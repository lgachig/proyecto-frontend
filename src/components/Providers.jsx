import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const CACHE_MINUTES = 60;
const STALE_MINUTES = 10;

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * STALE_MINUTES,
            gcTime: 1000 * 60 * CACHE_MINUTES,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}