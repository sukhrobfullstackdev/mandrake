'use server';

import { flagDefaults } from '@constants/launch-darkly-flags';
import { launchDarklyQueryKeys } from '@hooks/data/embedded/launch-darkly';
import { useStore } from '@hooks/store';
import { allFlagsFromLaunchDarklyFetcher } from '@lib/server/launch-darkly';
import { getServerQueryClient } from '@lib/server/query-client';
import { OriginCase, camelizeKeys } from '@utils/object-helpers';

/** Nextjs server actions
 *  More info: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 */

export async function fetchFlags(magicApiKey?: string) {
  const queryClient = await getServerQueryClient();
  const apiKey = magicApiKey || useStore.getState().magicApiKey || '';

  const allFlags = await queryClient.fetchQuery({
    queryKey: launchDarklyQueryKeys.allFlagsServerState({ apiKey }),
    queryFn: allFlagsFromLaunchDarklyFetcher,
    gcTime: 1000 * 60 * 2, // 2 minutes
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  return camelizeKeys(allFlags || flagDefaults, OriginCase.Kabob);
}
