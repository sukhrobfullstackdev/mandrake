'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoSoldOutTag, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export function PreSaleSoldOut() {
  const { t } = useTranslation('send');
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { closeNftCheckout } = useCloseNftCheckout();

  return (
    <Animate type="slide" asChild>
      <VStack gap={0}>
        <VStack gap={6} w="full" mb={8} mt={4}>
          <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
            <IcoSoldOutTag color="white" />
          </ImageWithIcon>

          <VStack gap={2}>
            <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {t('Pre-sale sold out')}
            </Text>
            <Text size="lg" styles={{ textAlign: 'center' }}>
              {t('You have not been charged. More passes will be available soon during the public sale!')}
            </Text>
          </VStack>
        </VStack>

        <Button onPress={closeNftCheckout} expand variant="tertiary" label={t('Close')} />
      </VStack>
    </Animate>
  );
}
