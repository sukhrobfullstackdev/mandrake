import { css } from '@styled/css';
import { ImageProps } from 'next/image';

export type NftImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt?: string;
};

export const NftImage = ({ src, alt = 'NFT', width = 96, height = 96, ...rest }: NftImageProps) => {
  return (
    // skipcq: JS-W1015
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...rest}
      className={css({
        borderRadius: 12,
      })}
    />
  );
};
