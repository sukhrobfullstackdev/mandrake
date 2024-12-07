'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoSoldOutTag, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export function ItemSoldOut() {
  const { t } = useTranslation('send');
  const { closeNftCheckout } = useCloseNftCheckout();
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mb={8} mt={4}>
        <VStack gap={6}>
          <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
            <IcoSoldOutTag color="white" />
          </ImageWithIcon>

          <VStack gap={2}>
            <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {t('Item sold out')}
            </Text>
            <Text size="lg" styles={{ textAlign: 'center' }}>
              {t('Sorry, all {{maxQuantity}} passes have been purchased. You have not been charged.', {
                maxQuantity: nftTokenInfo.maxQuantity,
              })}
            </Text>
          </VStack>
        </VStack>

        <Button onPress={closeNftCheckout} label={t('Close')} expand variant="tertiary" />
      </VStack>
    </Animate>
  );
}
