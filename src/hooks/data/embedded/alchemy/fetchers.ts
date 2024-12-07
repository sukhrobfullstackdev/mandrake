import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import {
  alchemyQueryKeys,
  GetNftsForOwnerQueryKey,
  GetSingleNftForOwnerQueryKey,
  GetSingleNftQueryKey,
  GetTransactionReceiptQueryKey,
} from '@hooks/data/embedded/alchemy/keys';

import { getQueryClient } from '@lib/common/query-client';
import { QueryFunction } from '@tanstack/react-query';
import { Alchemy, Nft, NftOrdering, OwnedNft, OwnedNftsResponse, TransactionReceipt } from 'alchemy-sdk';

export type GetNftsForOwnerParams = {
  networkName: keyof typeof ALCHEMY_KEYS;
  address: string;
  spam?: boolean;
};

export type GetSingleNftForOwnerParams = {
  networkName: keyof typeof ALCHEMY_KEYS;
  address: string;
  contractAddress: string;
  tokenId: string;
};

export type GetSingleNftParams = {
  networkName: keyof typeof ALCHEMY_KEYS;
  contractAddress: string;
  tokenId: string;
};

export type GetTransactionReceiptParams = {
  networkName: keyof typeof ALCHEMY_KEYS;
  hash: string;
};

export const makeGetNFtsForOwnerFetcher =
  (): QueryFunction<OwnedNftsResponse, GetNftsForOwnerQueryKey> =>
  ({ queryKey: [, { networkName, address }] }) => {
    const alchemyInstance = new Alchemy({
      apiKey: ALCHEMY_KEYS[networkName],
      network: ALCHEMY_NETWORKS[networkName],
    });

    return alchemyInstance.nft.getNftsForOwner(address, {
      orderBy: NftOrdering.TRANSFERTIME,
    });
  };

export const makeGetSingleNFtForOwnerFetcher =
  (): QueryFunction<OwnedNft, GetSingleNftForOwnerQueryKey> =>
  async ({ queryKey: [, { networkName, contractAddress, address, tokenId }] }) => {
    const queryClient = getQueryClient();
    let nfts = queryClient.getQueryData<OwnedNftsResponse>(alchemyQueryKeys.getNftsForOwner({ networkName, address }));

    if (!nfts) {
      const alchemyInstance = new Alchemy({
        apiKey: ALCHEMY_KEYS[networkName],
        network: ALCHEMY_NETWORKS[networkName],
      });

      nfts = await alchemyInstance.nft.getNftsForOwner(address, {
        orderBy: NftOrdering.TRANSFERTIME,
      });
    }

    const singleNft = nfts.ownedNfts.find(v => v.contract.address === contractAddress && v.tokenId === tokenId);
    if (!singleNft) {
      throw new Error('NFT not found');
    }

    return singleNft;
  };

export const makeGetSingleNftFetcher =
  (): QueryFunction<Nft, GetSingleNftQueryKey> =>
  ({ queryKey: [, { networkName, contractAddress, tokenId }] }) => {
    const alchemyInstance = new Alchemy({
      apiKey: ALCHEMY_KEYS[networkName],
      network: ALCHEMY_NETWORKS[networkName],
    });

    return alchemyInstance.nft.getNftMetadata(contractAddress, tokenId);
  };

export const makeGetTransactionReceiptFetcher =
  (): QueryFunction<TransactionReceipt, GetTransactionReceiptQueryKey> =>
  async ({ queryKey: [, { networkName, hash }] }) => {
    const alchemyInstance = new Alchemy({
      apiKey: ALCHEMY_KEYS[networkName],
      network: ALCHEMY_NETWORKS[networkName],
    });

    const receipt = await alchemyInstance.core.getTransactionReceipt(hash);
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    return receipt;
  };
