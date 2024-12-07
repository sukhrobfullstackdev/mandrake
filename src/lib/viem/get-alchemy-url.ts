import { ALCHEMY_KEYS } from '@constants/alchemy';
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonAmoy,
  sepolia,
} from 'viem/chains';

export const getAlchemyRpcUrl = (chainId: number) => {
  if (chainId === mainnet.id) {
    return `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.Ethereum}`;
  }

  if (chainId === sepolia.id) {
    return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEYS['Sepolia Testnet']}`;
  }

  if (chainId === polygon.id) {
    return `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.Polygon}`;
  }

  if (chainId === polygonAmoy.id) {
    return `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_KEYS['Polygon Amoy Testnet']}`;
  }

  if (chainId === optimism.id) {
    return `https://optimism-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.Optimism}`;
  }

  if (chainId === optimismGoerli.id) {
    return `https://optimism-goerli.g.alchemy.com/v2/${ALCHEMY_KEYS['Optimism Goerli Testnet']}`;
  }

  if (chainId === arbitrum.id) {
    return `https://arbitrum-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS['Arbitrum One']}`;
  }

  if (chainId === arbitrumSepolia.id) {
    return `https://arbitrum-sepolia.g.alchemy.com/v2/${ALCHEMY_KEYS['Arbitrum Sepolia Testnet']}`;
  }

  if (chainId === base.id) {
    return `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS.Base}`;
  }

  if (chainId === baseSepolia.id) {
    return `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEYS['Base Sepolia Testnet']}`;
  }

  throw new Error("Doesn't support chain");
};
