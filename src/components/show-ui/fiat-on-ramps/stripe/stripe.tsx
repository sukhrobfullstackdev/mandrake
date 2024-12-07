'use client';

import { T } from '@common/i18n';
import FiatOnrampError from '@components/show-ui/fiat-on-ramps/FiatOnrampError';
import { MAGIC_WALLET_DAPP_REFERRER } from '@constants/env';
import { ETH_SENDTRANSACTION } from '@constants/eth-rpc-methods';
import { MAGIC_WALLET } from '@constants/route-methods';
import { useChainInfo } from '@hooks/common/chain-info';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useStripeClientToken } from '@hooks/data/embedded/onramp';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, IcoPendingConnection, IconMagicLogo, LoadingSpinner, LogoLink, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { isMobileSdk } from '@utils/platform';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Stripe() {
  const { t } = useTranslation();
  const router = useSendRouter();
  const { chainInfo } = useChainInfo();
  const { userMetadata } = useUserMetadata();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const backNavigationRoute = activeRpcPayload?.method.endsWith(ETH_SENDTRANSACTION)
    ? '/send/rpc/eth/eth_sendTransaction'
    : activeRpcPayload?.method.endsWith(MAGIC_WALLET)
      ? '/send/rpc/wallet/magic_wallet/home'
      : '/send/rpc/wallet/magic_show_fiat_onramp';

  const supportedDestinationCurrencies =
    chainInfo?.name === 'Polygon' ? ['matic', 'usdc'] : [chainInfo?.currency?.toLocaleLowerCase() || 'eth'];

  const { isLoading, error, data } = useStripeClientToken(
    {
      isMainnet: !!chainInfo?.isMainnet,
      publicAddress: userMetadata?.publicAddress || '',
      supportedDestinationNetworks: [chainInfo?.name.toLocaleLowerCase() || 'ethereum'],
      supportedDestinationCurrencies,
      sourceExchangeAmount: chainInfo?.name === 'Polygon' ? '5' : '100',
      sourceCurrency: 'usd',
    },
    { enabled: !!userMetadata?.publicAddress },
  );
  const stripeClientToken = data?.clientSecret;
  const stripeLink = `${MAGIC_WALLET_DAPP_REFERRER}/stripe?address=${userMetadata?.publicAddress}&client_token=${stripeClientToken}&is_mainnet=${!!chainInfo?.isMainnet}&open_in_device_browser=${isMobileSdk()}`;

  const handleOpenStripePopup = () => {
    window.open(stripeLink, undefined, 'width=480,height=800');
  };

  useEffect(() => {
    if (!stripeClientToken) return;
    handleOpenStripePopup();
  }, [stripeClientToken]);

  const handleBackButtonClick = () => {
    router.replace(backNavigationRoute);
  };

  return (
    <>
      {isLoading && (
        <VStack gap={24}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
      )}
      {!isLoading && (
        <>
          {error && <FiatOnrampError onBackPress={handleBackButtonClick} error={error} />}
          {!error && (
            <>
              <HStack>
                <IconMagicLogo height={42} width={42} />
                <IcoPendingConnection height={42} width={42} />
                <LogoLink height={42} width={42} />
              </HStack>
              <VStack mt="2">
                <VStack mb="2">
                  <Text.H4>{t('Continue to Link by Stripe')}</Text.H4>
                  <Text size="md" styles={{ textAlign: 'center' }}>
                    <T ns="send" translate="Please continue to <stripeLink/> to complete the transaction.">
                      <Link target="_blank" id="stripeLink" href={stripeLink} rel="noreferrer">
                        <Text size="sm" inline={true} styles={{ fontWeight: 500, color: token('colors.blue.600') }}>
                          Link by Stripe
                        </Text>
                      </Link>
                    </T>
                  </Text>
                </VStack>
                <Button variant="text" label={t('Back to Wallet')} size="md" onPress={handleBackButtonClick} />
              </VStack>
            </>
          )}
        </>
      )}
    </>
  );
}
