'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { ViewTranssactionButton } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-confirmed/view-transaction-button';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, IcoCheckmarkCircleFill, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function PaymentConfirmed() {
  const { t } = useTranslation('send');
  const { setStatus } = useNftCheckoutContext();
  const search = useSearchParams();
  const hash = search.get('hash');

  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  useEffect(() => {
    if (!hash) {
      setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams({
        hash,
      });
      window.history.pushState(null, '', `?${params.toString()}`);

      setStatus(NFT_CHECKOUT_STATUS.ORDER_CONFIRMED);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [setStatus, hash]);

  return (
    <Animate type="slide" asChild>
      <VStack gap={6} w="full" mt={4}>
        <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
          <IcoCheckmarkCircleFill width={40} height={40} color="white" />
        </ImageWithIcon>

        <VStack gap={3}>
          <Text size="lg" styles={{ fontWeight: 500, fontSize: '1.25rem' }}>
            {t('Payment confirmed')}
          </Text>
          {hash && <ViewTranssactionButton hash={hash} chainId={nftTokenInfo.contractChainId} />}
        </VStack>
      </VStack>
    </Animate>
  );
}
