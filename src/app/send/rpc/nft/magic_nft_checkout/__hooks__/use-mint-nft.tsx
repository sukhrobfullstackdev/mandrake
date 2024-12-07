/* istanbul ignore file */

import { useHasSufficientInventory } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-has-sufficient-inventory';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import {
  useBalanceOfNft,
  useCurrentStage,
  useIsAllowList,
  useNftCheckoutPayload,
  useNftTokenInfo,
} from '@hooks/data/embedded/nft';
import { DkmsService } from '@lib/dkms';
import { getMintingAbi } from '@lib/utils/nft-checkout';
import { getViemClient } from '@lib/viem/get-viem-client';
import { getWalletClient } from '@lib/viem/get-wallet-client';
import { useMutation } from '@tanstack/react-query';
import { getBigInt } from 'ethers';
import { useMemo } from 'react';
import { getAddress, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

type Params = {
  chainId: number;
  quantity: number;
  contractAddress: string;
  functionName: string;
  tokenId: string;
  tokenType: string;
  value: number;
};

export const useMintNft = () => {
  const { setStatus } = useNftCheckoutContext();
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const { hasSufficientInventory } = useHasSufficientInventory();
  const { data: balanceOfNft } = useBalanceOfNft({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
    owner: nftCheckoutPayload.walletAddress ?? '',
  });
  const { data: isAllowList } = useIsAllowList({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
    address: nftCheckoutPayload.walletAddress ?? '',
  });
  const { data: currentStage } = useCurrentStage({
    chainId: nftTokenInfo.contractChainId,
    contractAddress: nftTokenInfo.contractAddress,
  });

  const { credentialsData, walletInfoData, ethWalletHydrationError } = useHydrateOrCreateEthWallet();

  const {
    mutateAsync,
    isPending: isMutationPending,
    ...rest
  } = useMutation({
    mutationFn: async ({ chainId, contractAddress, quantity, functionName, tokenId, tokenType, value }: Params) => {
      if (!credentialsData || !walletInfoData || ethWalletHydrationError) {
        throw new Error(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
      }

      if (!hasSufficientInventory) {
        throw new Error(NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT);
      }

      if (balanceOfNft > 0) {
        throw new Error(NFT_CHECKOUT_STATUS.ALREADY_EXISTS);
      }

      if (!isAllowList || currentStage === 0) {
        throw new Error(NFT_CHECKOUT_STATUS.NOT_ALLOWED);
      }

      const decryptedPrivateKey = await DkmsService.reconstructSecret(
        credentialsData,
        walletInfoData.encryptedPrivateAddress,
      );
      const account = privateKeyToAccount(decryptedPrivateKey as `0x${string}`);

      const abi = getMintingAbi(tokenType, functionName);

      const { request } = await getViemClient(chainId).simulateContract({
        account,
        address: getAddress(contractAddress),
        abi,
        functionName,
        args: tokenType === 'ERC1155' ? [getBigInt(quantity), getBigInt(tokenId)] : [],
        value: parseEther(value.toString()),
      });

      return getWalletClient(chainId).writeContract(request);
    },
    onSuccess: response => {
      const params = new URLSearchParams({
        hash: response,
      });
      window.history.pushState(null, '', `?${params.toString()}`);

      setStatus(NFT_CHECKOUT_STATUS.PAYMENT_CONFIRMED);
    },
    onError: (error, params) => {
      logger.error(
        'Failed to mint NFT - use-mint-nft',
        {
          params,
        },
        error,
      );
      if (error.message === NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT) {
        setStatus(NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT);
        return;
      }

      if (error.message === NFT_CHECKOUT_STATUS.ALREADY_EXISTS) {
        setStatus(NFT_CHECKOUT_STATUS.ALREADY_EXISTS);
        return;
      }

      if (error.message === NFT_CHECKOUT_STATUS.NOT_ALLOWED) {
        setStatus(NFT_CHECKOUT_STATUS.NOT_ALLOWED);
        return;
      }

      setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
    },
  });

  const isPending = useMemo(() => {
    return !!credentialsData || !!walletInfoData || isMutationPending;
  }, [credentialsData, walletInfoData, isMutationPending]);

  return { mintNft: mutateAsync, isPending, ...rest };
};
