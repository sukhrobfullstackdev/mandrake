'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoWarningFill, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export function NotAllowedPage() {
  const { t } = useTranslation('send');
  const { closeNftCheckout } = useCloseNftCheckout();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
          <IcoWarningFill width={40} height={40} color="white" />
        </ImageWithIcon>

        <VStack gap={2} mb={8} mt={6}>
          <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {t('Not Allowed')}
          </Text>
          <Text size="md" styles={{ textAlign: 'center', color: token('colors.text.tertiary') }}>
            {t('Your wallet is not listed on the private sale list.')}
          </Text>
        </VStack>

        <Button onPress={closeNftCheckout} label={t('Close')} expand size="md" />
      </VStack>
    </Animate>
  );
}
