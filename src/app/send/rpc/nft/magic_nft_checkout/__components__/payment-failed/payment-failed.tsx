'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoDismissCircleFill, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function PaymentFailed() {
  const { t } = useTranslation('send');
  const search = useSearchParams();
  const orderId = search.get('orderId');

  const { setStatus } = useNftCheckoutContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  const handleClose = useCallback(() => {
    if (orderId) {
      setStatus(NFT_CHECKOUT_STATUS.PAYPAL_CHECKOUT);
      return;
    }

    setStatus(NFT_CHECKOUT_STATUS.CRYPTO_CHECKOUT);
  }, [rejectActiveRpcRequest]);

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <VStack gap={6} mb={8}>
          <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
            <IcoDismissCircleFill color="white" width={40} height={40} />
          </ImageWithIcon>

          <VStack gap={2}>
            <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {t('Payment failed')}
            </Text>
            <Text size="lg" styles={{ textAlign: 'center' }}>
              {t('You have not been charged. Please try again.')}
            </Text>
          </VStack>
        </VStack>

        <Button onPress={handleClose} variant="tertiary" size="md" label={t('Try Again')} />
      </VStack>
    </Animate>
  );
}
