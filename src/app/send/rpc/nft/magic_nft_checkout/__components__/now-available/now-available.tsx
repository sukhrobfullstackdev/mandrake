'use client';

import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { useCloseNftCheckout } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout';
import { useFlags } from '@hooks/common/launch-darkly';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useStore } from '@hooks/store';
import { T, useTranslation } from '@lib/common/i18n';
import { Animate, Button, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import Link from 'next/link';

export function NowAvailable() {
  const { t } = useTranslation('send');
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { closeNftCheckout } = useCloseNftCheckout();
  const { domainOrigin } = useStore.getState().decodedQueryParams;
  const flags = useFlags();

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <VStack gap={6}>
          <NftImage src={nftCheckoutPayload.imageUrl} width={144} height={144} />

          <Text.H4 styles={{ fontWeight: 400, textAlign: 'center' }}>
            <T ns="send" translate="<name/> is now available">
              <span id="name">{nftCheckoutPayload.name}</span>
            </T>
          </Text.H4>
        </VStack>

        <VStack w="full" gap={2} mt={8}>
          {flags?.isForbesUiEnabled ? (
            <Link
              target="_blank"
              id="nft-view-link"
              href={`${domainOrigin || 'https://www.forbes.com'}/legacy-pass/my-pass`}
              rel="noreferrer"
            >
              <Button expand label={t('View Legacy Pass')} variant="primary" iconSize={24}></Button>
            </Link>
          ) : (
            <Button expand variant="tertiary" label={t('Close')} onPress={closeNftCheckout} />
          )}
        </VStack>
      </VStack>
    </Animate>
  );
}
