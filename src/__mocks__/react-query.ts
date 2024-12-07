import { QUERY_OPTIONS } from '@constants/config';
import { QueryClientConfig, QueryObserverBaseResult, UseQueryResult } from '@tanstack/react-query';

export const TEST_CONFIG: QueryClientConfig = {
  ...QUERY_OPTIONS,
  defaultOptions: {
    ...QUERY_OPTIONS.defaultOptions,
    queries: {
      ...QUERY_OPTIONS.defaultOptions?.queries,
      retry: false,
      gcTime: Infinity,
    },
  },
};

export const getMockUseQueryResult = <TData = undefined>(
  data: TData,
  overrides: Record<string, unknown> = {},
): UseQueryResult<TData> => {
  return {
    data,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    errorUpdateCount: 0,
    failureReason: null,
    fetchStatus: 'idle',
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isInitialLoading: false,
    isPaused: false,
    isFetching: false,
    isLoading: false,
    isPending: false,
    isLoadingError: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    status: 'success',
    refetch: jest.fn().mockImplementation((): QueryObserverBaseResult<TData> => getMockUseQueryResult(data, overrides)),
    ...overrides,
  };
};
