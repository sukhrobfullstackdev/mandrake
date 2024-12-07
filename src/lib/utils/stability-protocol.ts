import { useStore } from '@hooks/store';

export function isStabilityProtocol(): boolean {
  const { ethNetwork } = useStore.getState().decodedQueryParams;
  if (typeof ethNetwork === 'string') return false;
  if (ethNetwork?.chainId) {
    const chainId = ethNetwork.chainId;
    const mainnetChainId = 101010;
    const testnetChainId = 20180427;
    if (Number(chainId) === mainnetChainId || Number(chainId) === testnetChainId) {
      return true;
    }
  }
  return false;
}
