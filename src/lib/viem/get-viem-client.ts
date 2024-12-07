/* istanbul ignore file */

import { getAlchemyRpcUrl } from '@lib/viem/get-alchemy-url';
import { getChain } from '@lib/viem/get-chain';
import { createPublicClient, http } from 'viem';

export const getViemClient = (chainId: number) => {
  const chain = getChain(chainId);
  const rpcUrl = getAlchemyRpcUrl(chainId);

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  return client;
};
