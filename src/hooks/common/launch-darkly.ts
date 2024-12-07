import { launchDarklyQueryKeys, makeLaunchDarklyFlagsFetcher, useFlagsQuery } from '@hooks/data/embedded/launch-darkly';
import { useStore } from '@hooks/store';
import { type LDFlagSet } from '@launchdarkly/node-server-sdk';
import { getServerQueryClient } from '@lib/server/query-client';

type PrefetchFlagsParams = {
  returnFlags?: boolean;
  enabled?: boolean;
  magicApiKey?: string;
};

/** Convenience hook to get flags without needing to handle react query states.
 * Only use if you know flags have been fetched ahead of time. Otherwise, data will be
 * placeholder data until it has completed fetching */
export const useFlags = (): LDFlagSet | undefined => {
  const { data } = useFlagsQuery();
  return data;
};

// Convenience hook for prefetching flags on server components
export const usePrefetchFlags = async ({
  returnFlags = false,
  enabled = true,
  magicApiKey,
}: PrefetchFlagsParams = {}): Promise<LDFlagSet | undefined> => {
  if (!enabled) return;

  const queryClient = await getServerQueryClient();
  /** Normally just get apiKey from state, but if that is not possible
   * you can pass it in how you wish.
   */
  const apiKey = magicApiKey || useStore.getState().magicApiKey || '';

  const queryConfig = {
    queryKey: launchDarklyQueryKeys.allFlags({ apiKey }),
    queryFn: makeLaunchDarklyFlagsFetcher(),
    gcTime: 1000 * 60 * 10, // 10 minutes
    staleTime: 1000 * 60 * 1, // 1 minute
  };

  if (returnFlags) {
    const flags = await queryClient.fetchQuery(queryConfig);
    return flags;
  }

  await queryClient.prefetchQuery(queryConfig);
};
