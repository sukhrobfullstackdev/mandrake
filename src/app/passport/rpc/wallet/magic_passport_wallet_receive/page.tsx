'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { copyToClipboard } from '@lib/utils/copy';
import {
  Button,
  IcoCheckmark,
  IcoCopy,
  LogoArbitrumMono,
  LogoBaseMono,
  LogoEthereumMono,
  LogoPolygonMono,
  PassportPage,
  QRCode,
  WalletAddress,
  WalletPage,
} from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState } from 'react';

export default function PassportReceiveFundsPage() {
  const router = usePassportRouter();
  const [isCopied, setIsCopied] = useState(false);
  const { smartAccount } = useSmartAccount();

  const handleCopyAddress = () => {
    if (!smartAccount || isCopied) return;
    copyToClipboard(smartAccount?.address);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <WalletPage.Content>
      <PassportPage onBack={() => router.replace('/passport/rpc/wallet/magic_passport_wallet')}>
        <PassportPage.Title title="Receive" />
        <PassportPage.Content>
          <VStack mt={2} gap={8} maxW="16.25rem">
            <VStack gap={6} w="full">
              <QRCode
                size={220}
                value={smartAccount?.address ?? ''}
                eyeRadius={8}
                // Placeholder image until profile images are added
                logoImage="https://assets.fortmatic.com/MagicLogos/c9d755be88b7e8918a7faa5d202966a2/d5fb9b2612b93fbea28288ffbce0835a.png"
                logoHeight={64}
                logoWidth={64}
                logoPadding={7}
                quietZone={20}
                removeQrCodeBehindLogo
                style={{ borderRadius: 28 }}
              />
              <HStack w="full" justify="space-between">
                <LogoEthereumMono color={token('colors.text.secondary')} />
                <LogoBaseMono color={token('colors.text.secondary')} />
                <LogoPolygonMono color={token('colors.text.secondary')} />
                <LogoArbitrumMono color={token('colors.text.secondary')} />
              </HStack>
            </VStack>
            <VStack gap={5} w="full">
              <Button
                expand
                size="lg"
                variant="neutral"
                textStyle={isCopied ? 'positive' : undefined}
                label={isCopied ? 'Copied' : 'Copy Address'}
                onPress={handleCopyAddress}
                centerContent
              >
                <Button.LeadingIcon>{isCopied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
              </Button>
              <WalletAddress address={smartAccount?.address ?? ''} />
            </VStack>
          </VStack>
        </PassportPage.Content>
      </PassportPage>
    </WalletPage.Content>
  );
}
