/* istanbul ignore file */

import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { DkmsService } from '@lib/dkms';
import { getViemClient } from '@lib/viem/get-viem-client';
import { getWalletClient } from '@lib/viem/get-wallet-client';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAddress, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

type Params = {
  chainId: number;
  to: string;
  contractAddress: string;
  tokenId: string;
  quantity: number;
  tokenType: string;
};

export const useTransferNft = () => {
  const walletAddress = useUserMetadata().userMetadata?.publicAddress ?? '';

  const { credentialsData, walletInfoData, ethWalletHydrationError } = useHydrateOrCreateEthWallet();

  const {
    mutateAsync,
    isPending: isMutationPending,
    ...rest
  } = useMutation({
    mutationFn: async ({ chainId, to, contractAddress, quantity, tokenId, tokenType }: Params) => {
      if (!credentialsData || !walletInfoData || ethWalletHydrationError) {
        throw new Error(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
      }

      const decryptedPrivateKey = await DkmsService.reconstructSecret(
        credentialsData,
        walletInfoData.encryptedPrivateAddress,
      );
      const account = privateKeyToAccount(decryptedPrivateKey as `0x${string}`);

      const { request } = await getViemClient(chainId).simulateContract({
        account,
        address: getAddress(contractAddress),
        abi:
          tokenType === 'ERC1155'
            ? parseAbi([
                'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external',
              ])
            : parseAbi(['function transferFrom(address from, address to, uint256 tokenId) public']),
        functionName: tokenType === 'ERC1155' ? 'safeTransferFrom' : 'transferFrom',
        args:
          tokenType === 'ERC1155'
            ? [getAddress(walletAddress), getAddress(to), BigInt(tokenId), BigInt(quantity), '0x']
            : [getAddress(walletAddress), getAddress(to), BigInt(tokenId)],
      });

      return getWalletClient(chainId).writeContract(request);
    },
  });

  const isPending = useMemo(() => {
    return !!credentialsData || !!walletInfoData || isMutationPending;
  }, [credentialsData, walletInfoData, isMutationPending]);

  return { transferNft: mutateAsync, isPending, ...rest };
};
