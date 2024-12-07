'use client';

import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { T, useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import { getChain } from '@lib/viem/get-chain';
import { Animate, Button, IcoCheckmark, IcoCopy, QRCode, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState } from 'react';

export function ReceiveFunds() {
  const { t } = useTranslation('send');
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const chain = getChain(nftTokenInfo.contractChainId);
  const [isCopied, setIsCopied] = useState(false);

  const publicAddress = nftCheckoutPayload.walletAddress ?? '';

  const handleCopytoClipboard = useCallback(() => {
    copyToClipboard(publicAddress);
    setIsCopied(true);
  }, []);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [isCopied]);

  return (
    <Animate type="slide" asChild>
      <VStack gap={0} w="full" mt={4}>
        <VStack gap={6}>
          <QRCode value={publicAddress} />

          <VStack gap={4}>
            <Button
              size="md"
              variant="neutral"
              onPress={handleCopytoClipboard}
              label={isCopied ? t('Copied!') : t('Copy address')}
            >
              <Button.LeadingIcon>{isCopied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
            </Button>
            <VStack maxW={64}>
              <Text
                size="sm"
                styles={{
                  textAlign: 'center',
                  color: token('colors.text.tertiary'),
                }}
              >
                <T ns="send" translate="Make sure you’re transferring assets on the <chainName/> network">
                  <b id="chainName">{chain.name}</b>
                </T>
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </Animate>
  );
}
