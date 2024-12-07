/* istanbul ignore file */
'use client';

import { getETHNetworkUrl } from '@lib/utils/network-name';
import { JsonRpcProvider } from 'ethers';

const rpcProviders: Record<string, JsonRpcProvider> = {};

export const getRpcProvider = (): JsonRpcProvider => {
  const nodeUrl = getETHNetworkUrl() as string;
  if (rpcProviders[nodeUrl]) {
    return rpcProviders[nodeUrl];
  } else {
    rpcProviders[nodeUrl] = new JsonRpcProvider(nodeUrl);
    return rpcProviders[nodeUrl];
  }
};
