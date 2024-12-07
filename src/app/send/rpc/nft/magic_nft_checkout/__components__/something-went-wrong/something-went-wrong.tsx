'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoWarningFill, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

type Props = {
  onTryAgain?: () => void;
};

export function SomethingWentWrongPage(props?: Props) {
  const { t } = useTranslation('send');
  const { setStatus } = useNftCheckoutContext();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  const handleTryAgain = () => {
    if (props?.onTryAgain) {
      props.onTryAgain();
    } else {
      setStatus(NFT_CHECKOUT_STATUS.PAYMENT_METHODS);
    }
  };

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
          <IcoWarningFill width={40} height={40} color="white" />
        </ImageWithIcon>

        <VStack gap={2} mb={8} mt={6}>
          <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {t('Something went wrong')}
          </Text>
          <Text size="md" styles={{ textAlign: 'center', color: token('colors.text.tertiary') }}>
            {t('We ran into a technical issue. You have not been charged. Please try again.')}
          </Text>
        </VStack>

        <Button onPress={handleTryAgain} label={t('Try Again')} expand size="md" />
      </VStack>
    </Animate>
  );
}
