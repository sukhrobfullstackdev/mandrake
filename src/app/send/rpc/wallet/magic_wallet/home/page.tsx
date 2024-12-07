'use client';

import NFTList from '@components/show-ui/nft-list';
import TokenList from '@components/show-ui/token-list';
import WalletBalance from '@components/show-ui/wallet-balance';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useNativeTokenBalance } from '@hooks/common/show-ui';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useTranslation } from '@lib/common/i18n';
import {
  Button,
  IcoArrowDown,
  IcoPaperPlane,
  IcoQrcode,
  Page,
  SegmentedControl,
  Tab,
  Text,
} from '@magiclabs/ui-components';
import { Center, HStack, VStack } from '@styled/jsx';
import { useState } from 'react';

export default function WalletHome() {
  const { t } = useTranslation('send');
  const [selectedTab, setSelectedTab] = useState('collectibles');
  const router = useSendRouter();
  const features = useClientConfigFeatureFlags();
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const nativeTokenBalance = useNativeTokenBalance(walletAddress || '');

  const handlePressAccount = () => {
    router.replace('/send/rpc/wallet/magic_wallet/account_info');
  };

  const handlePressBuy = () => {
    router.replace('/send/rpc/wallet/magic_wallet/select_fiat_onramp');
  };

  const handlePressSend = () => {
    router.replace('/send/rpc/wallet/magic_wallet/token_selection');
  };

  const handlePressReceive = () => {
    router.replace('/send/rpc/wallet/magic_wallet/receive_funds');
  };

  const segmentedControlContent = {
    collectibles: (
      <Center my={2} w="full">
        <NFTList />
      </Center>
    ),
    tokens: <TokenList />,
  };

  return (
    <>
      <WalletPageHeader onPressBack={handlePressAccount} isHomePage />
      <Page.Content>
        <WalletBalance />
        <HStack w="full" justifyContent="space-around" mt={6} mb={1}>
          {features?.isFiatOnrampEnabled && (
            <VStack gap={1} w="1/3">
              <Button variant="neutral" size="sm" onPress={handlePressBuy} aria-label="Buy">
                <Button.LeadingIcon>
                  <IcoArrowDown />
                </Button.LeadingIcon>
              </Button>
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Buy')}
              </Text>
            </VStack>
          )}
          <VStack gap={1} w="1/3">
            <Button
              variant="neutral"
              size="sm"
              onPress={handlePressSend}
              aria-label="Send"
              disabled={nativeTokenBalance === 0}
            >
              <Button.LeadingIcon>
                <IcoPaperPlane />
              </Button.LeadingIcon>
            </Button>
            <Text size="sm" styles={{ fontWeight: 500 }}>
              {t('Send')}
            </Text>
          </VStack>
          <VStack gap={1} w="1/3">
            <Button variant="neutral" size="sm" onPress={handlePressReceive} aria-label="Receive">
              <Button.LeadingIcon>
                <IcoQrcode />
              </Button.LeadingIcon>
            </Button>
            <Text size="sm" styles={{ fontWeight: 500 }}>
              {t('Receive')}
            </Text>
          </VStack>
        </HStack>
        {features?.isNftViewerEnabled ? (
          <VStack w="full" mt={6}>
            <SegmentedControl size="sm" selectedTab={selectedTab} onChange={setSelectedTab}>
              <Tab id="collectibles" label="Collectibles" />
              <Tab id="tokens" label="Tokens" />
            </SegmentedControl>
            {segmentedControlContent[selectedTab as keyof typeof segmentedControlContent]}
          </VStack>
        ) : (
          <TokenList />
        )}
      </Page.Content>
    </>
  );
}
