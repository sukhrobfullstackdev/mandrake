'use client';

import { useNftContext } from '@app/passport/rpc/passport-context';
import WalletNavigation from '@app/passport/rpc/wallet/components/wallet-navigation';
import CollectionDetails, {
  type LinkDetail,
} from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/collection-details';
import NFTAttributes from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-attributes';
import NFTDetails from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-details';
import NFTImage from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-image';
import { ALCHEMY_KEYS } from '@constants/alchemy';
import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { PassportPage, WalletNavigationType, WalletPage } from '@magiclabs/ui-components';
import { Divider, Stack } from '@styled/jsx';
import { Network } from 'magic-passport/types';

export default function PassportCollectibleDetailsPage() {
  const router = usePassportRouter();
  const nftContext = useNftContext();
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;

  // This will only work for Alchemy based chains
  // TODO: Support Newtown - https://magiclink.atlassian.net/browse/M2PB-302
  const networkName = EVM_NETWORKS_BY_CHAIN_ID[network?.id]?.networkName as keyof typeof ALCHEMY_KEYS;
  const tokenId = nftContext.selectedNft?.tokenId;

  const { selectedNft } = nftContext;
  const nftDetails = {
    name: selectedNft?.name || '',
    description: selectedNft?.description || '',
    imgSrc: selectedNft?.imageURL || '',
    quantity: Number(selectedNft?.balance),
    ownedTimestamp: selectedNft?.acquiredAt?.blockTimestamp,
  };

  const nftContract = selectedNft?.contract
    ? {
        address: selectedNft.contract.address || '',
        metadata: selectedNft.contract.openSeaMetadata || {},
      }
    : null;

  const collectionDetails = nftContract?.metadata
    ? {
        name: nftContract.metadata.collectionName || '',
        description: nftContract.metadata.description || '',
        imgSrc: nftContract.metadata.imageUrl || '',
        linkDetails: [
          { url: nftContract.metadata.externalUrl, type: 'website' },
          {
            url: nftContract.metadata.twitterUsername
              ? `https://twitter.com/${nftContract.metadata.twitterUsername}`
              : undefined,
            type: 'twitter',
          },
          { url: nftContract.metadata.discordUrl, type: 'discord' },
        ].filter(link => link.url) as LinkDetail[],
      }
    : null;

  const handleBack = () => {
    router.replace('/passport/rpc/wallet/magic_passport_wallet_nfts');
  };

  return (
    <>
      <WalletNavigation active={WalletNavigationType.Gallery} />
      <WalletPage.Content>
        <PassportPage onBack={handleBack}>
          <PassportPage.Content>
            <Stack
              gap={8}
              mx="-2rem"
              mt="-1.5rem"
              px={10}
              pt={6}
              pb={32}
              maxW="28rem"
              maxH="calc(100vh - 63px)"
              overflowX="scroll"
              scrollbarWidth="none"
            >
              <NFTImage src={nftDetails.imgSrc} alt={nftDetails.name} />
              <Stack w="full" gap={0}>
                <NFTDetails
                  nftName={nftDetails.name}
                  description={nftDetails.description}
                  collectionName={collectionDetails?.name}
                  collectionLogoSrc={collectionDetails?.imgSrc}
                  contractAddress={nftContract?.address}
                  networkName={networkName}
                  tokenId={tokenId || ''}
                />
                <NFTAttributes
                  contractAddress={nftContract?.address || ''}
                  networkName={networkName}
                  quantity={nftDetails.quantity}
                  ownedTimestamp={nftDetails.ownedTimestamp}
                  attributes={selectedNft?.raw.metadata.attributes}
                />
              </Stack>
              {collectionDetails?.name && (
                <>
                  <Divider thickness="2px" color="surface.quaternary" />
                  <CollectionDetails
                    name={collectionDetails.name}
                    description={collectionDetails.description}
                    collectionLogoSrc={collectionDetails.imgSrc}
                    linkUrls={collectionDetails.linkDetails}
                  />
                </>
              )}
            </Stack>
          </PassportPage.Content>
        </PassportPage>
      </WalletPage.Content>
    </>
  );
}
