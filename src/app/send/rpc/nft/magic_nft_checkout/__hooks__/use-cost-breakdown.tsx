/* istanbul ignore file */

import { useNetworkFee, useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { toUsd } from '@lib/utils/nft-checkout';
import { useMemo } from 'react';

export const useCostBreakdown = () => {
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const { data: networkFee } = useNetworkFee({
    chainId: nftTokenInfo.contractChainId,
    quantity: nftCheckoutPayload.quantity ?? 1,
    address: nftCheckoutPayload.walletAddress ?? '',
    contractAddress: nftTokenInfo.contractAddress,
    functionName: nftTokenInfo.contractCryptoMintFunction,
    tokenId: nftCheckoutPayload.tokenId,
    tokenType: nftTokenInfo.contractType,
    value: nftTokenInfo.price,
  });

  const subtotalInUsd = useMemo(() => {
    return nftTokenInfo.price * nftTokenInfo.usdRate * (nftCheckoutPayload.quantity ?? 1);
  }, [nftTokenInfo, nftCheckoutPayload]);

  const networkFeeInUsd = useMemo(() => {
    return networkFee ? +networkFee * nftTokenInfo.usdRate : 0;
  }, [networkFee, nftTokenInfo]);

  const serviceFeeInUsd = useMemo(() => {
    return (subtotalInUsd + networkFeeInUsd) * 0.0499 + 0.49;
  }, [subtotalInUsd, networkFeeInUsd]);

  return {
    subtotalInUsd: toUsd(subtotalInUsd),
    networkFeeInUsd: toUsd(networkFeeInUsd),
    serviceFeeInUsd: toUsd(serviceFeeInUsd),
    totalInUsd: toUsd(subtotalInUsd + networkFeeInUsd + serviceFeeInUsd),
    total: subtotalInUsd + networkFeeInUsd + serviceFeeInUsd,
  };
};
