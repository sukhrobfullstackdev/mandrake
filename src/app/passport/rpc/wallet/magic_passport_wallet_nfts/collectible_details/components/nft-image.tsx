import { NFT_PASSPORT_NO_IMAGE_URL } from '@constants/nft';
import { NFTTile } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import Image from 'next/image';

type NFTImageProps = {
  src?: string;
  alt: string;
};

export default function NFTImage({ src, alt }: NFTImageProps) {
  if (!src) return <Image src={NFT_PASSPORT_NO_IMAGE_URL} alt={alt} width={368} height={368} />;

  return (
    <Box position="relative" boxShadow="0px 4.211px 21.053px 0px rgba(0, 0, 0, 0.10)" rounded="2xl">
      <NFTTile src={src} alt={alt} />
      <Box
        h="full"
        w="full"
        zIndex={-1}
        position="absolute"
        top={2}
        opacity={0.3}
        filter="blur(27px)"
        rounded="2xl"
        style={{ background: `url(${src}) lightgray -38.825px -41.342px / 121.101% 121.101% no-repeat` }}
      />
    </Box>
  );
}
