'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Button, IcoRefreshCircleFill, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useSearchParams } from 'next/navigation';

export function PriceEstimateExpired() {
  const { t } = useTranslation('send');
  const search = useSearchParams();
  const hash = search.get('hash');

  const { setStatus } = useNftCheckoutContext();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  const handleTryAgain = () => {
    if (hash) {
      setStatus(NFT_CHECKOUT_STATUS.CRYPTO_CHECKOUT);
      return;
    }

    setStatus(NFT_CHECKOUT_STATUS.PAYMENT_METHODS);
  };

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <VStack gap={6}>
          <ImageWithIcon src={nftCheckoutPayload.imageUrl} alt="Thumbnail" width={96} height={96}>
            <IcoRefreshCircleFill color="white" width={40} height={40} />
          </ImageWithIcon>

          <VStack gap={2} mb={8}>
            <Text size="lg" styles={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {t('Price estimate expired')}
            </Text>
            <Text size="lg" styles={{ textAlign: 'center' }}>
              {t('You have not been charged.')}
              <br />
              {t('Please try again.')}
            </Text>
          </VStack>
        </VStack>

        <Button expand variant="primary" label={t('View updated price')} onPress={handleTryAgain} />

        <Box mt={4}>
          <Text size="sm" styles={{ textAlign: 'center', color: token('colors.text.tertiary') }}>
            {t(
              `Ethereum's dollar value and network costs can change rapidly. View the updated price to complete your purchase.`,
            )}
          </Text>
        </Box>
      </VStack>
    </Animate>
  );
}
