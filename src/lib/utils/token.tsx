/* istanbul ignore file */
import LogoUSDC from '@components/icons/LogoUSDC';
import { LogoEthereumCircleMono, LogoPolygon } from '@magiclabs/ui-components';
import { newtonSepolia } from 'magic-passport/networks';
import { Network } from 'magic-passport/types';
import { ReactElement, ReactNode } from 'react';
import { baseSepolia, mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';

export interface TokenMetadata {
  decimals: number;
  icon: ReactNode;
  symbol: string;
  name: string;
  isNativeToken?: boolean;
}
export const getNativeTokenMetadata = (network: Network): TokenMetadata => {
  switch (network.id) {
    case polygonAmoy.id:
      return {
        icon: <LogoPolygon />,
        symbol: polygonAmoy.nativeCurrency.symbol,
        name: polygonAmoy.nativeCurrency.name,
        decimals: polygonAmoy.nativeCurrency.decimals,
        isNativeToken: true,
      };
    case sepolia.id:
      return {
        icon: <LogoEthereumCircleMono />,
        symbol: sepolia.nativeCurrency.symbol,
        name: 'ETH (Sepolia)',
        decimals: sepolia.nativeCurrency.decimals,
        isNativeToken: true,
      };
    case baseSepolia.id:
      return {
        icon: <LogoEthereumCircleMono />,
        symbol: baseSepolia.nativeCurrency.symbol,
        name: 'ETH (Base Sepolia)',
        decimals: baseSepolia.nativeCurrency.decimals,
        isNativeToken: true,
      };
    case newtonSepolia.id:
      return {
        icon: <LogoEthereumCircleMono />,
        symbol: newtonSepolia.nativeCurrency.symbol,
        name: 'ETH (Newton Sepolia)',
        decimals: newtonSepolia.nativeCurrency.decimals,
        isNativeToken: true,
      };
    default:
      return {
        icon: <LogoEthereumCircleMono />,
        symbol: sepolia.nativeCurrency.symbol,
        name: 'ETH (Sepolia)',
        decimals: sepolia.nativeCurrency.decimals,
        isNativeToken: true,
      };
  }
};
export const getNetworkIcon = (network: Network): ReactElement => {
  switch (network.id) {
    case sepolia.id:
      return <LogoEthereumCircleMono />;
    case baseSepolia.id:
      return <LogoEthereumCircleMono />;
    case newtonSepolia.id:
      return <LogoEthereumCircleMono />;
    default:
      return <LogoEthereumCircleMono />;
  }
};

export interface DrawerTokenMetadata extends TokenMetadata {
  networkIcon?: ReactNode;
  needsCabClient?: boolean;
}

export const getDrawerTokens = (network: Network): DrawerTokenMetadata[] => {
  const networkIcon = getNetworkIcon(network);
  return [
    {
      name: 'USDC (6TEST)',
      icon: <LogoUSDC />,
      symbol: 'USDC',
      networkIcon: networkIcon,
      decimals: 6,
      needsCabClient: true,
    },
    getNativeTokenMetadata(network),
  ];
};

export const ETH_PRICE_FALLBACK = 3000;
export const MATIC_PRICE_FALLBACK = 0.4;
export const USDC_6TEST_PRICE = 1;

// TODO: Fetch the ETH/USDC exchange rate (e.g., using Chainlink or a CEX API)
export const getTokenPriceUSD = (tokenSymbol: string): number => {
  switch (tokenSymbol) {
    // ETH price is ETH price, regardless of network
    case mainnet.nativeCurrency.symbol:
      return ETH_PRICE_FALLBACK;
    // MATIC price is MATIC price, regardless of network NOTE: MATIC is called POL now
    case polygon.nativeCurrency.symbol:
      return MATIC_PRICE_FALLBACK;
    // USDC price is USDC price, regardless of network
    case 'USDC':
      return USDC_6TEST_PRICE;
    default:
      return ETH_PRICE_FALLBACK;
  }
};
