import { NftImage, NftImageProps } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';

export const ImageWithIcon = ({ children, src, ...rest }: NftImageProps) => {
  return (
    <VStack justifyContent="center" pos="relative" overflow="hidden" borderRadius={12}>
      <NftImage src={src} {...rest} />
      <div
        className={css({
          pos: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.50)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        {children}
      </div>
    </VStack>
  );
};
