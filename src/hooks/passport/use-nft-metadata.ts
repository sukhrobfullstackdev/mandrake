import { formatDataField } from '@app/passport/libs/format_data_field';
import { NFT_PASSPORT_NO_IMAGE_URL } from '@constants/nft';
import { getCollectionName } from '@lib/passport-utils/get-collection-name';
import { extractTokenURI } from '@lib/utils/decode-token-uri';
import { ipfsToHttp } from '@lib/utils/ipfs-to-http';
import { Call, Network } from 'magic-passport/types';
import { useEffect, useState } from 'react';

interface UseNFTMetadataProps {
  calls: Call[] | null;
  network: Network;
}

export function useNFTMetadata({ calls, network }: UseNFTMetadataProps) {
  const [nftName, setNftName] = useState<string>('');
  const [nftImage, setNftImage] = useState<string>(NFT_PASSPORT_NO_IMAGE_URL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetadata() {
      if (!calls) {
        setIsLoading(false);
        return;
      }

      try {
        const data = formatDataField(calls[0]);
        const tokenURI = extractTokenURI(data);

        let hasValidName = false;
        let hasValidImage = false;

        if (tokenURI) {
          try {
            const response = await fetch(ipfsToHttp(tokenURI));

            if (response.ok) {
              const metadata = await response.json();

              if (metadata.name) {
                setNftName(metadata.name);
                hasValidName = true;
              }

              if (metadata.image) {
                setNftImage(ipfsToHttp(metadata.image));
                hasValidImage = true;
              }
            }
          } catch (error) {
            logger.error('Error fetching token URI metadata:', error);
          }
        }

        // If we don't have a valid name from tokenURI, try to get the collection name
        if (!hasValidName) {
          try {
            const collectionName = await getCollectionName({ network, calls });
            setNftName(collectionName || 'Untitled NFT');
          } catch (error) {
            logger.error('Error fetching collection name:', error);
            setNftName('Untitled NFT');
          }
        }

        // If we don't have a valid image from tokenURI, set the placeholder image
        if (!hasValidImage) {
          setNftImage(NFT_PASSPORT_NO_IMAGE_URL);
        }
      } catch (error) {
        logger.error('Error in NFT metadata fetching:', error);
        setNftName('Untitled NFT');
        setNftImage(NFT_PASSPORT_NO_IMAGE_URL);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetadata();
  }, [calls, network]);

  return {
    nftName,
    nftImage,
    isLoading,
  };
}
