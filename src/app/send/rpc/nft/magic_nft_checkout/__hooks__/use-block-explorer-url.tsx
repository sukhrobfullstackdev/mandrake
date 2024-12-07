/* istanbul ignore file */

import { getChain } from '@lib/viem/get-chain';
import { useCallback } from 'react';

type Props = {
  chainId: number;
  hash: string;
};

export const useViewTxOnExplorer = () => {
  const viewTxOnExplorer = useCallback(({ chainId, hash }: Props) => {
    const chain = getChain(chainId);
    window.open(`${chain.blockExplorers?.default.url}/tx/${hash}`, '_blank', 'noopener,noreferrer');
  }, []);

  return { viewTxOnExplorer };
};
