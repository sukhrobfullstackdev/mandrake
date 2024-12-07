import { Skeleton, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';

interface NftImagePreviewProps {
  nftImage: string;
  nftName?: string;
  size: number;
  isLoading: boolean;
  center?: boolean;
}

export function NftImagePreview({ nftImage, nftName, size, isLoading, center }: NftImagePreviewProps) {
  return (
    <HStack alignSelf={center ? 'center' : 'flex-start'}>
      {isLoading ? (
        <>
          <Skeleton
            width={size}
            height={size}
            borderRadius="12px"
            backgroundColor={token('colors.surface.secondary')}
          />
          <Skeleton width="140px" height="24px" backgroundColor={token('colors.surface.secondary')} />
        </>
      ) : (
        <>
          <Image
            src={nftImage}
            width={size}
            height={size}
            alt="NFT Preview"
            className={css({ rounded: 'xl', marginRight: '1rem' })}
          />
          {nftName ? <Text.H4>{nftName}</Text.H4> : null}
        </>
      )}
    </HStack>
  );
}
