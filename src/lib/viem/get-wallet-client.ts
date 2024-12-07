/* istanbul ignore file */

import { getAlchemyRpcUrl } from '@lib/viem/get-alchemy-url';
import { getChain } from '@lib/viem/get-chain';
import { createWalletClient, http } from 'viem';

export const getWalletClient = (chainId: number) => {
  const chain = getChain(chainId);
  const rpcUrl = getAlchemyRpcUrl(chainId);

  const wallet = createWalletClient({
    chain,
    transport: http(rpcUrl),
  });

  return wallet;
};
