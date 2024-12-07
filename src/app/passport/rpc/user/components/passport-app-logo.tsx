import { IcoRocketFill } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';

interface PassportAppLogoProps {
  src?: string;
  height?: number;
  width?: number;
  alt?: string;
}
export default function PassportAppLogo({
  src,
  height = 48,
  width = 48,
  alt = 'Passport App Logo',
}: PassportAppLogoProps) {
  if (!src) {
    return (
      <VStack
        style={{ background: token('colors.magic.30') }}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'0.5rem'}
        height={height / 4}
        width={width / 4}
      >
        <IcoRocketFill height={height / 2} width={height / 2} />
      </VStack>
    );
  }
  return <Image src={src} height={height} width={width} alt={alt} className={css({ rounded: 'sm' })} />;
}
