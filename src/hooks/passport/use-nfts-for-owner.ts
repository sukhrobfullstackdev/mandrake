import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { Endpoint } from '@constants/endpoint';
import { usePassportStore } from '@hooks/data/passport/store';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { HttpService } from '@http-services';
import { useQuery } from '@tanstack/react-query';
import { Alchemy, NftOrdering, OwnedNft } from 'alchemy-sdk';
import { newtonSepolia } from 'magic-passport/networks';

// we don't have the image property on the newton indexer api response,
// we just have imageURL, so we have this new type to handle this.
export interface OwnedNFT extends Omit<OwnedNft, 'image'> {
  imageURL: string;
}

export const useNftsForOwner = () => {
  const { decodedQueryParams } = usePassportStore(state => state);
  const { network } = decodedQueryParams;
  if (!network) {
    throw new Error('No chain ID in query params');
  }
  const { smartAccount } = useSmartAccount();
  const publicClient = KernelClientService.getPublicClient({ network });

  return useQuery({
    queryKey: ['nftsForOwner'],
    queryFn: async () => {
      if (!publicClient) throw new Error('allTokenBalances: Public client not found');
      if (!smartAccount) throw new Error('allTokenBalances: Smart account not found');

      // Newton network
      if (network.id === newtonSepolia.id) {
        const response = await HttpService.MagicIndexer.Get(
          `${Endpoint.MagicIndexer.GetNftsForOwner}?address=${smartAccount.address}&chain_id=11155111`,
        );
        return response.data as OwnedNFT[];
      }

      // Other EVM networks
      const networkName = EVM_NETWORKS_BY_CHAIN_ID[network.id].networkName;
      const alchemyInstance = new Alchemy({
        apiKey: ALCHEMY_KEYS[networkName as keyof typeof ALCHEMY_KEYS],
        network: ALCHEMY_NETWORKS[networkName as keyof typeof ALCHEMY_KEYS],
      });

      const data = await alchemyInstance.nft.getNftsForOwner(smartAccount!.address, {
        orderBy: NftOrdering.TRANSFERTIME,
        omitMetadata: false,
      });

      return data.ownedNfts.map(ownedNft => {
        return {
          ...ownedNft,
          imageURL: ownedNft.image.originalUrl,
        } as OwnedNFT;
      });
    },
    gcTime: 8000,
    enabled: !!smartAccount,
  });
};
