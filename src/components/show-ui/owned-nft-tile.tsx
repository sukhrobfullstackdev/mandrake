'use client';

import {
  NFT_LOADING_IMAGE_DARK_URL,
  NFT_LOADING_IMAGE_URL,
  NFT_NO_IMAGE_DARK_URL,
  NFT_NO_IMAGE_URL,
  NFT_PASSPORT_NO_IMAGE_URL,
} from '@constants/nft';
import { useColorMode } from '@hooks/common/client-config';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';
import { NFTTile, Text } from '@magiclabs/ui-components';
import { Center, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useQuery } from '@tanstack/react-query';

type Props = {
  nft: OwnedNFT | undefined;
  balance?: number;
  isCountVisible?: boolean;
  countPosition?: 'top-right' | 'bottom-right';
  onPress?: () => void;
  isPassport?: boolean;
};

const OwnedNftTile = ({
  nft,
  balance = 1,
  onPress,
  isCountVisible = true,
  countPosition = 'top-right',
  isPassport = false,
}: Props) => {
  const theme = useColorMode();
  const isDarkTheme = theme === 'dark';

  const defaultImageUrl = isPassport
    ? NFT_PASSPORT_NO_IMAGE_URL
    : isDarkTheme
      ? NFT_NO_IMAGE_DARK_URL
      : NFT_NO_IMAGE_URL;
  const loadingImageUrl = isDarkTheme ? NFT_LOADING_IMAGE_DARK_URL : NFT_LOADING_IMAGE_URL;

  const {
    data: imageUrl,
    isError,
    isPending,
  } = useQuery({
    queryKey: [
      'nft-image',
      {
        contractAddress: nft?.contract?.address,
        tokenId: nft?.tokenId,
        tokenType: nft?.tokenType,
      },
    ],
    queryFn: async () => {
      try {
        const src = nft?.imageURL;

        if (!src) {
          throw new Error('Image url not found');
        }

        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });

        await promise;

        return src;
      } catch {
        return defaultImageUrl;
      }
    },
  });

  if (isError) {
    return <NFTTile src={defaultImageUrl} alt={nft?.name ?? '(Untitled)'} onPress={onPress} />;
  }

  if (isPending) {
    return <NFTTile src={loadingImageUrl} alt="Loading NFT" onPress={onPress} />;
  }

  return (
    <VStack pos="relative">
      <NFTTile src={imageUrl} alt={nft?.name ?? '(Untitled)'} onPress={onPress} />
      {isCountVisible && balance > 1 && (
        <>
          {countPosition === 'top-right' && (
            <Center
              pos="absolute"
              bg="rgba(25, 25, 25, 0.40)"
              borderRadius="md"
              px={2}
              py={1.5}
              borderColor={isDarkTheme ? 'slate.1' : 'ink.20'}
              top={2}
              right={2}
            >
              <Text size="xs" styles={{ color: token('colors.white'), fontWeight: 600, lineHeight: 1 }}>
                x{balance}
              </Text>
            </Center>
          )}
          {countPosition === 'bottom-right' && (
            <Center
              pos="absolute"
              bg={isDarkTheme ? 'slate.3' : 'ink.20'}
              borderRadius="md"
              px={1.5}
              py={1}
              borderColor={isDarkTheme ? 'slate.1' : 'white'}
              borderWidth={2}
              boxSizing={'border-box'}
              bottom={-2}
              right={-4}
            >
              <Text size="xs" styles={{ fontWeight: 600, lineHeight: 1 }}>
                x{balance}
              </Text>
            </Center>
          )}
        </>
      )}
    </VStack>
  );
};

export default OwnedNftTile;
