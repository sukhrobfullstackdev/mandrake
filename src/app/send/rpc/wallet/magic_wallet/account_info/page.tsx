'use client';

import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useAppName, useAssetUri, useColorMode, useThemeColors } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import {
  Button,
  ClientAssetLogo,
  IcoCopy,
  IconMagicLogo,
  IconProfileDark,
  IconProfileLight,
  Page,
  Text,
  WalletAddress,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Circle, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';
import { useRef } from 'react';

export default function WalletAccountInfoPage() {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const { userMetadata } = useUserMetadata();
  const appName = useAppName();
  const assetUri = useAssetUri();
  const theme = useColorMode();
  const { buttonColor } = useThemeColors();
  const isDarkMode = theme === 'dark';
  const walletAddress = userMetadata?.publicAddress || '';
  const emailAddress = userMetadata?.email || '';

  const walletAddressRef = useRef<HTMLButtonElement>(null);

  const handleAddressContainerClick = () => {
    if (walletAddressRef.current) {
      walletAddressRef.current.click();
    }
  };

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    copyToClipboard(walletAddress);
  };

  const handlePressWallet = () => {
    router.replace('/send/rpc/wallet/magic_wallet/home');
  };

  const handleLogout = () => {
    router.replace('/send/rpc/auth/magic_auth_logout');
  };

  return (
    <>
      <WalletPageHeader onPressBack={handlePressWallet} isAccountPage />
      <Page.Content>
        <Box
          w="full"
          h={28}
          position="absolute"
          top={0}
          zIndex={-1}
          overflow="hidden"
          style={{
            backgroundImage: buttonColor
              ? `linear-gradient(113.64deg, ${token('colors.brand.base')} -3.38%, ${token(isDarkMode ? 'colors.brand.lighter' : 'colors.brand.darker')} 99.1%)`
              : 'linear-gradient(113.64deg, #3728b7 -3.38%, #6851ff 46.01%, #c970ff 99.1%)',
          }}
        >
          <Image
            src={'https://assets.auth.magic.link/static/app.background-waves.4b516d436a57c772974c9076fdb5eed3.svg'}
            alt="waves"
            fill
            className={css({ objectFit: 'cover', w: 'full', minH: 28 })}
          />
        </Box>
        <Circle my={2} borderWidth="thick" borderColor="surface.primary" bg="surface.primary">
          {isDarkMode ? <IconProfileDark width={64} height={64} /> : <IconProfileLight width={64} height={64} />}
        </Circle>
        <Text.H4>{emailAddress}</Text.H4>
        <VStack w="full">
          <Box
            onClick={handleAddressContainerClick}
            aria-label="copy wallet address"
            w="full"
            p={4}
            mt={4}
            mb={2}
            rounded="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, .1)"
            cursor="pointer"
            _dark={{ bg: 'slate.1' }}
            className="group"
          >
            <HStack justifyContent="space-between">
              <HStack justifyContent="flex-start" gap={4}>
                <ClientAssetLogo assetUri={assetUri}>
                  <ClientAssetLogo.PlaceholderIcon>
                    <IconMagicLogo />
                  </ClientAssetLogo.PlaceholderIcon>
                </ClientAssetLogo>
                <VStack gap={0} alignItems="flex-start">
                  <Text styles={{ fontWeight: 500, textAlign: 'left' }}>{appName} Wallet</Text>
                  <WalletAddress
                    ref={walletAddressRef}
                    address={walletAddress}
                    onCopy={handleCopyAddress}
                    aria-label="copy wallet address"
                  />
                </VStack>
              </HStack>
              <IcoCopy
                className={css({
                  transition: 'color 0.2s',
                  color: 'ink.50',
                  _dark: { color: 'ink.70' },
                  _groupHover: { color: 'ink.70', _dark: { color: 'ink.50' } },
                })}
                width={20}
                height={20}
              />
            </HStack>
          </Box>
        </VStack>
        <Box mt={4} mb={2}>
          <Button variant="text" label={t('Log out')} onPress={handleLogout} />
        </Box>
      </Page.Content>
    </>
  );
}
