import { SDKType } from '@constants/sdk-type';

export function supportsCustomNode(sdk: string): boolean {
  return Object.values(SDKType).some(value => value === sdk);
}

export function isOptimism(network?: string): boolean {
  return network === 'optimistic-goerli' || network === 'optimistic-mainnet';
}
