'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ReactNode } from 'react';

import { getQueryClient } from '@/lib';

/**
 * The QueryClientProvider with the query client.
 * @param props The properties.
 * @param props.children The children.
 * @returns The QueryClientProvider.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
