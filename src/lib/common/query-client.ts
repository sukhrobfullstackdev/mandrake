/* istanbul ignore file */
'use client';

import { QUERY_OPTIONS } from '@constants/config';
import { isServer } from '@lib/utils/context';
import { QueryClient } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined = undefined;

export const makeQueryClient = (): QueryClient => new QueryClient(QUERY_OPTIONS);

// This function will return the query client for client components
export const getQueryClient = (): QueryClient => {
  if (isServer) {
    // for when client component is being rendered on the server
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
  }
};
