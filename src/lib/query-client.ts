import {
  isServer,
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

/**
 * Create a new query client.
 * @returns The query client.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime: 30 * 1000,
        staleTime: 0, // Disable stale time to ensure fresh data on every request
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => {
          return false;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Get the query client.
 *
 * If the code is running on the server, a new query client is created.
 * If the code is running on the client, the same query client is reused.
 * @returns The query client.
 */
export default function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
  }
}
