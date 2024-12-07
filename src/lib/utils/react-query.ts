import { QueryClient } from '@tanstack/react-query';

// useful for debugging and viewing what is stored in query client's cache without RQ devtools
export const getAllQueryCacheList = (queryClient: QueryClient) => {
  return queryClient
    .getQueryCache()
    .getAll()
    .map(cacheItem => cacheItem.queryHash);
};
