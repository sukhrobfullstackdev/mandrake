/* istanbul ignore file */

import Container from '@app/api-wallets/container';
import { usePrefetchFlags } from '@hooks/common/launch-darkly';
import { useStore } from '@hooks/store';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getDecodedQueryParams } from '@utils/query-string';

export interface MagicApiWalletProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MagicApiWallet({ searchParams }: MagicApiWalletProps) {
  const queryClient = await getServerQueryClient();

  // use decodeUriComponent to make sure the encoding of special characters like '='
  // are replaced with the actual characters.
  const encodedQueryParams = decodeURIComponent(searchParams.params as string);
  const decodedQueryParams = getDecodedQueryParams(encodedQueryParams);

  // encoded query params must be in state before we prefetch flags
  useStore.setState({
    decodedQueryParams,
  });
  await usePrefetchFlags();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container encodedQueryParams={encodedQueryParams} decodedQueryParams={decodedQueryParams} />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
