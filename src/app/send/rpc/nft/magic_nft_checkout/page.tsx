/* istanbul ignore file */

import { NftCheckoutProvider } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NftCheckoutHome } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-home';
import { JsonRpcRequestPayload } from '@custom-types/json-rpc';
import { usePrefetchFlags } from '@hooks/common/launch-darkly';
import { makeNftTokenInfoFetcher } from '@hooks/data/embedded/nft/fetchers';
import { nftQueryKeys } from '@hooks/data/embedded/nft/keys';
import { useStore } from '@hooks/store';
import { getServerQueryClient } from '@lib/server/query-client';
import { NFTCheckoutRequest } from '@magic-sdk/types';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getDecodedQueryParams } from '@utils/query-string';
import qs from 'qs';

interface SearchParams {
  encodedQueryParams?: string;
  activeRpcPayload?: JsonRpcRequestPayload | null;
  webCryptoDpopJwt?: string;
}

type Props = {
  searchParams: SearchParams;
};

export default async function MagicNftCheckoutPage({ searchParams }: Props) {
  const queryClient = await getServerQueryClient();

  const parsedParams: SearchParams = qs.parse(qs.stringify(searchParams));
  // TODO: check payload validation
  const payload = parsedParams.activeRpcPayload?.params?.[0] as unknown as NFTCheckoutRequest;

  // update state
  if (parsedParams.encodedQueryParams) {
    useStore.setState({ decodedQueryParams: getDecodedQueryParams(parsedParams.encodedQueryParams) });
  }

  await Promise.all([
    usePrefetchFlags(),
    queryClient.prefetchQuery({
      queryKey: nftQueryKeys.getNftTokenInfo({
        contractId: payload.contractId,
        tokenId: payload.tokenId,
      }),
      queryFn: makeNftTokenInfoFetcher(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NftCheckoutProvider>
        <NftCheckoutHome />
      </NftCheckoutProvider>
    </HydrationBoundary>
  );
}
