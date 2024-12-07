import { useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { flagDefaults } from '@constants/launch-darkly-flags';
import { useStore } from '@hooks/store';
import { makeLaunchDarklyFlagsFetcher, type LaunchDarklyAllFlagsResponse } from './fetchers';
import { LaunchDarklyAllFlagsQueryKey, launchDarklyQueryKeys } from './keys';

export * from './fetchers';
export * from './keys';

export const useFlagsQuery = (
  config?: Omit<
    UseQueryOptions<LaunchDarklyAllFlagsResponse, Error, LaunchDarklyAllFlagsResponse, LaunchDarklyAllFlagsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<LaunchDarklyAllFlagsResponse> => {
  const { magicApiKey } = useStore.getState();
  const queryKey = launchDarklyQueryKeys.allFlags({ apiKey: magicApiKey || '' });

  const queryFn = makeLaunchDarklyFlagsFetcher();

  return useQuery({
    queryKey,
    queryFn,
    gcTime: 1000 * 60 * 10, // 10 minutes
    staleTime: 1000 * 60 * 1, // 1 minute
    placeholderData: flagDefaults,
    ...config,
  });
};
