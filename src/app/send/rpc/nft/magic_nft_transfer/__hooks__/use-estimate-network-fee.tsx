/* istanbul ignore file */

import { AwsCredentialIdentity } from '@aws-sdk/types';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { WalletInfo } from '@custom-types/wallet';
import { DkmsService } from '@lib/dkms';
import { getViemClient } from '@lib/viem/get-viem-client';
import { getAddress, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

type Params = {
  chainId: number;
  to: string;
  contractAddress: string;
  tokenId: string;
  quantity: number;
  tokenType: string;
  walletAddress: string;
  credentialsData: AwsCredentialIdentity | undefined;
  walletInfoData: WalletInfo | undefined;
  ethWalletHydrationError: string;
};

export const handleEstimateNetworkFee = async ({
  chainId,
  to,
  contractAddress,
  quantity,
  tokenId,
  tokenType,
  walletAddress,
  credentialsData,
  walletInfoData,
  ethWalletHydrationError,
}: Params) => {
  try {
    if (!credentialsData || !walletInfoData || ethWalletHydrationError) {
      throw new Error(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
    }

    const decryptedPrivateKey = await DkmsService.reconstructSecret(
      credentialsData,
      walletInfoData.encryptedPrivateAddress,
    );
    const account = privateKeyToAccount(decryptedPrivateKey as `0x${string}`);

    const [gas, gasPrice] = await Promise.all([
      getViemClient(chainId).estimateContractGas({
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
      }),
      getViemClient(chainId).getGasPrice(),
    ]);

    return gas * gasPrice;
  } catch (error) {
    return BigInt('21000') * BigInt('1020000000');
  }
};
