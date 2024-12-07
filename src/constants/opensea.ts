import { NETWORK_NAMES } from '@constants/chain-info';

export const OPENSEA_NETWORKS: {
  [key: string]: string;
} = {
  [NETWORK_NAMES.ETHEREUM]: 'ethereum',
  [NETWORK_NAMES.GOERLI]: 'goerli',
  [NETWORK_NAMES.SEPOLIA]: 'sepolia',
  [NETWORK_NAMES.POLYGON]: 'matic',
  [NETWORK_NAMES.POLYGON_MUMBAI]: 'mumbai',
  [NETWORK_NAMES.POLYGON_AMOY]: 'amoy',
  [NETWORK_NAMES.OPTIMISM]: 'optimism',
  [NETWORK_NAMES.OPTIMISM_GOERLI]: 'optimism-goerli',
  [NETWORK_NAMES.ARBITRUM_ONE]: 'arbitrum',
  [NETWORK_NAMES.ARBITRUM_SEPOLIA]: 'arbitrum-sepolia',
  [NETWORK_NAMES.BASE_SEPOLIA]: 'base-sepolia',
} as const;
