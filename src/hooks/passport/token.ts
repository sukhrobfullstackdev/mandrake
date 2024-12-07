import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { Endpoint } from '@constants/endpoint';
import { TokenMetadata } from '@custom-types/indexer';
import { usePassportStore } from '@hooks/data/passport/store';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { HttpService } from '@http-services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alchemy, TokenBalance, TokenMetadataResponse } from 'alchemy-sdk';
import { newtonSepolia } from 'magic-passport/networks';
import { formatEther } from 'viem';

export const useUsdcBalance = () => {
  const { decodedQueryParams } = usePassportStore(state => state);
  const network = decodedQueryParams.network;
  if (!network) {
    throw new Error('No network found in query params');
  }
  const { smartAccount } = useSmartAccount();

  return useQuery({
    queryKey: ['usdcBalance'],
    queryFn: () => {
      if (!smartAccount) throw new Error('useUsdcBalance: Smart account not found');
      const { cabClient } = KernelClientService.getCABKernelClient({ smartAccount, network });

      const kernelClient = KernelClientService.getSingleChainKernelClient({ smartAccount, network });

      if (!cabClient) throw new Error('useUsdcBalance: CAB client not found');
      if (!kernelClient) throw new Error('useUsdcBalance: kernel client not found');

      return cabClient.getCabBalance({ address: smartAccount!.address, token: '6TEST' });
    },
    enabled: !!smartAccount,
    gcTime: 8000,
  });
};

export const useNativeTokenBalance = () => {
  const { decodedQueryParams } = usePassportStore(state => state);
  const network = decodedQueryParams.network;
  if (!network) {
    throw new Error('No network found in query params');
  }
  const { smartAccount } = useSmartAccount();
  const publicClient = KernelClientService.getPublicClient({ network });

  return useQuery({
    queryKey: ['nativeTokenBalance'],
    queryFn: async () => {
      if (!publicClient) throw new Error('nativeTokenBalance: Public client not found');
      if (!smartAccount) throw new Error('nativeTokenBalance: Smart account not found');

      const nativeTokenBalance = await publicClient.getBalance({ address: smartAccount.address });

      return formatEther(nativeTokenBalance);
    },
    gcTime: 8000,
  });
};

export const useErc20TokenBalances = () => {
  const { decodedQueryParams } = usePassportStore(state => state);
  const { network } = decodedQueryParams;
  if (!network) {
    throw new Error('No chain ID in query params');
  }
  const { smartAccount } = useSmartAccount();
  const publicClient = KernelClientService.getPublicClient({ network });

  return useQuery({
    queryKey: ['allTokenBalances'],
    queryFn: async () => {
      if (!publicClient) throw new Error('allTokenBalances: Public client not found');
      if (!smartAccount) throw new Error('allTokenBalances: Smart account not found');

      // Newton network
      if (network?.id === newtonSepolia.id) {
        const response = await HttpService.MagicIndexer.Post(
          `${Endpoint.MagicIndexer.GetTokenBalance}`,
          {},
          {
            addresses: [smartAccount!.address],
            chain_id: network.id,
          },
        );
        return response.data.tokenBalances as TokenBalance[];
      }

      // Other EVM networks
      const networkName = EVM_NETWORKS_BY_CHAIN_ID[network.id].networkName;
      const alchemyInstance = new Alchemy({
        apiKey: ALCHEMY_KEYS[networkName as keyof typeof ALCHEMY_KEYS],
        network: ALCHEMY_NETWORKS[networkName as keyof typeof ALCHEMY_KEYS],
      });

      const alchemyResponse = await alchemyInstance.core.getTokenBalances(smartAccount!.address);
      return alchemyResponse.tokenBalances.filter(item => Number(item.tokenBalance) > 0);
    },
    gcTime: 8000,
    enabled: !!smartAccount,
  });
};

export const useErc20TokenMetadata = () => {
  const { decodedQueryParams } = usePassportStore(state => state);
  const { network } = decodedQueryParams;
  if (!network) {
    throw new Error('No chain ID in query params');
  }

  return useMutation({
    mutationFn: async (tokenBalances: TokenBalance[]) => {
      const addresses = tokenBalances?.map(token => token.contractAddress);

      // Newton network
      if (network?.id === newtonSepolia.id) {
        const response = await HttpService.MagicIndexer.Post(
          `${Endpoint.MagicIndexer.GetTokenMetadata}`,
          {},
          { addresses, chain_id: network.id },
        );
        return response.data.contractMetadatas.reduce(
          (acc: { [key: string]: TokenMetadataResponse }, meta: TokenMetadata) => {
            acc[meta.address.toLowerCase()] = {
              name: meta.name,
              symbol: meta.symbol,
              decimals: meta.decimals,
              logo: meta.logo,
            };
            return acc;
          },
          {} as { [key: string]: TokenMetadataResponse },
        );
      } else {
        // Other EVM networks
        const networkName = EVM_NETWORKS_BY_CHAIN_ID[network.id].networkName;
        const alchemyInstance = new Alchemy({
          apiKey: ALCHEMY_KEYS[networkName as keyof typeof ALCHEMY_KEYS],
          network: ALCHEMY_NETWORKS[networkName as keyof typeof ALCHEMY_KEYS],
        });

        const metadataPromises = tokenBalances.map(tb => alchemyInstance.core.getTokenMetadata(tb.contractAddress));
        const metadataList = await Promise.all(metadataPromises);

        // convert response into a key-value pair for faster search
        return metadataList.reduce(
          (acc: { [key: string]: TokenMetadataResponse }, meta, index) => {
            acc[tokenBalances[index].contractAddress.toLowerCase()] = meta;
            return acc;
          },
          {} as { [key: string]: TokenMetadataResponse },
        );
      }
    },
  });
};
