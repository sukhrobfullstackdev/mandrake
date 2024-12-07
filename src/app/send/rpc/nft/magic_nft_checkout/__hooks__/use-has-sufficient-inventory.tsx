/* istanbul ignore file */

import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useMemo } from 'react';

export const useHasSufficientInventory = () => {
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const hasSufficientInventory = useMemo(() => {
    return nftTokenInfo.mintedQuantity < nftTokenInfo.maxQuantity;
  }, [nftTokenInfo]);

  return { hasSufficientInventory };
};
