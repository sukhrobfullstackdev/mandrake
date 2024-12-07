/* istanbul ignore file */

import { useHasSufficientInventory } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-has-sufficient-inventory';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import {
  useBalanceOfNft,
  useCurrentStage,
  useIsAllowList,
  useNftCheckoutPayload,
  useNftTokenInfo,
} from '@hooks/data/embedded/nft';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { isEmpty } from '@lib/utils/is-empty';
import { getMintingAbi } from '@lib/utils/nft-checkout';
import { getAlchemyRpcUrl } from '@lib/viem/get-alchemy-url';
import { NftCheckoutIntermediaryEvents } from '@magic-sdk/types';
import { useMutation } from '@tanstack/react-query';
import { Contract, JsonRpcProvider, parseEther } from 'ethers';
import { toHex } from 'viem';

export const useMintNftWithWeb3Modal = () => {
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

  return useMutation<string, Error>({
    mutationFn: () => {
      if (!hasSufficientInventory) {
        throw new Error(NFT_CHECKOUT_STATUS.ITEM_SOLD_OUT);
      }

      if (balanceOfNft > 0) {
        throw new Error(NFT_CHECKOUT_STATUS.ALREADY_EXISTS);
      }

      if (!isAllowList || currentStage === 0) {
        throw new Error(NFT_CHECKOUT_STATUS.NOT_ALLOWED);
      }

      const { quantity = 1, walletAddress: address = '' } = nftCheckoutPayload;
      const {
        contractChainId: chainId,
        tokenId,
        contractAddress,
        contractCryptoMintFunction: functionName,
        contractType: tokenType,
        price: value,
      } = nftTokenInfo;

      const provider = new JsonRpcProvider(getAlchemyRpcUrl(nftTokenInfo.contractChainId));
      const abi = getMintingAbi(tokenType, functionName);

      const contract = new Contract(contractAddress, abi, provider);

      let txData: string;
      if (nftTokenInfo.contractType === 'ERC1155') {
        txData = contract.interface.encodeFunctionData(functionName, [quantity.toString(), tokenId.toString()]);
      } else {
        txData = contract.interface.encodeFunctionData(functionName);
      }

      return new Promise<string>(resolve => {
        AtomicRpcPayloadService.onEvent(NftCheckoutIntermediaryEvents.Success, args => {
          const hash = args as string;
          resolve(hash);
        });
        AtomicRpcPayloadService.onEvent(NftCheckoutIntermediaryEvents.Failure, () => {
          resolve('');
        });

        AtomicRpcPayloadService.emitJsonRpcEventResponse(NftCheckoutIntermediaryEvents.Initiated, [
          {
            data: txData,
            to: contractAddress,
            chainId,
            value: toHex(parseEther(value.toString())),
            from: address,
          },
        ]);
      });
    },
    onSuccess: response => {
      if (isEmpty(response)) {
        return;
      }

      const params = new URLSearchParams({
        hash: response,
      });
      window.history.pushState(null, '', `?${params.toString()}`);

      setStatus(NFT_CHECKOUT_STATUS.PAYMENT_CONFIRMED);
    },
    onError: (error, params) => {
      logger.error('Failed to mint NFT (web3modal)', { params }, error);
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
};
