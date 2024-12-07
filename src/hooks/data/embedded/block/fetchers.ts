import { getViemClient } from '@lib/viem/get-viem-client';
import { getAddress } from 'viem';

export type GetBalanceParams = {
  chainId: number;
  address: string;
};

export const getBalance = async (params: GetBalanceParams) => {
  return getViemClient(params.chainId).getBalance({
    address: getAddress(params.address),
  });
};
