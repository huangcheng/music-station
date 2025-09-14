import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';

import type { PropsWithChildren } from 'react';
import type { FetchQueryOptions, QueryKey } from '@tanstack/react-query';

export type ServerComponentProviderProps<
  TQueryFnData,
  TQueryKey extends QueryKey,
> = FetchQueryOptions<TQueryFnData, Error, TQueryFnData, TQueryKey>;

export default async function ServerComponentProvider<
  TQueryFnData,
  TQueryKey extends QueryKey,
>({
  children,
  ...rest
}: PropsWithChildren<ServerComponentProviderProps<TQueryFnData, TQueryKey>>) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    ...rest,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
