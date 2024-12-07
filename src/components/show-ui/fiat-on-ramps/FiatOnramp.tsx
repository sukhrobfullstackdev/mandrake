'use client';

import { T } from '@common/i18n';
import { NODE_ENV } from '@constants/env';
import { useChainInfo } from '@hooks/common/chain-info';
import { useColorMode } from '@hooks/common/client-config';
import { useFlags } from '@hooks/common/launch-darkly';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { shouldRouteToOnRamper, shouldRouteToStripe } from '@lib/onramp/onramp';
import { isSafariAgent } from '@lib/user-agent/user-agent';
import {
  Button,
  IcoBank,
  IcoCaretRight,
  IcoCreditCard,
  IcoExternalLink,
  LoadingSpinner,
  LogoApple,
  LogoGoogle,
  LogoLinkByStripe,
  LogoLinkByStripeMono,
  LogoOnramper,
  LogoOnramperMono,
  LogoSardine,
  LogoSardineMono,
  NavigationButton,
  Page,
  Text,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { isOptimism } from '@utils/network';
import { isAndroidDevice, isIosDevice } from '@utils/platform';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FiatOnrampProps {
  stripeRoute: string;
  sardineRoute: string;
  onramperRoute: string;
}

export default function FiatOnramp({ stripeRoute, sardineRoute, onramperRoute }: FiatOnrampProps) {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const { chainInfo } = useChainInfo();
  const queryParams = useStore(state => state.decodedQueryParams);
  const flags = useFlags();
  const theme = useColorMode();
  const isProd = NODE_ENV === 'production';
  const areOnRampsDisabled = !chainInfo?.isMainnet && isProd;

  const isFiatOnRampEnabled = flags?.isFiatOnRampEnabled;
  const isFiatOnRampSardineEnabled = flags?.isFiatOnRampSardineEnabled;
  const isFiatOnRampStripeEnabled = flags?.isFiatOnRampStripeEnabled;

  const isSardineEnabled = isFiatOnRampEnabled && isFiatOnRampSardineEnabled && !isOptimism(chainInfo?.network);
  const isStripeEnabled = isFiatOnRampEnabled && isFiatOnRampStripeEnabled && !isOptimism(chainInfo?.network);
  const isBankTransferEnabled = isSardineEnabled || isStripeEnabled;
  const [isBankTransferDrawerOpen, setIsBankTransferDrawerOpen] = useState(false);
  const [isCreditCardDrawerOpen, setIsCreditCardDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkTheme = theme === 'dark';

  // On page load, route to OnRamper if we should
  const routeToOnRamperIfNeeded = () => {
    const routeToStripe = shouldRouteToStripe(!!chainInfo?.isMainnet, !!queryParams.meta?.onRamperApiKey);
    if (routeToStripe) {
      return router.replace(stripeRoute);
    }
    const routeToOnRamper = shouldRouteToOnRamper(
      !!chainInfo?.isMainnet,
      chainInfo?.network,
      isFiatOnRampEnabled,
      isFiatOnRampSardineEnabled,
      isFiatOnRampStripeEnabled,
      !!queryParams.meta?.onRamperApiKey,
    );
    if (routeToOnRamper) {
      return router.replace(onramperRoute);
    }
    return setIsLoading(false);
  };

  const handleBankTransferClick = () => {
    if (isStripeEnabled && isSardineEnabled) {
      return setIsBankTransferDrawerOpen(!isBankTransferDrawerOpen);
    }
    if (isStripeEnabled) {
      return router.replace(stripeRoute);
    }
    return router.replace(sardineRoute);
  };

  const handleCreditCardClick = () => {
    if (isStripeEnabled || isSardineEnabled) {
      return setIsCreditCardDrawerOpen(!isCreditCardDrawerOpen);
    }
    return router.replace(onramperRoute);
  };

  const handleApplePayClick = () => {
    return router.replace(`${onramperRoute}?defaultPaymentMethod=applepay`);
  };

  const handleGooglePayClick = () => {
    return router.replace(`${onramperRoute}?defaultPaymentMethod=googlepay`);
  };

  const paymentMethodButtons = [
    {
      title: t('Instant Bank Transfer'),
      onClick: handleBankTransferClick,
      icon: <IcoBank />,
      isEnabled: isBankTransferEnabled,
      label: '',
    },
    {
      title: t('Credit or Debit'),
      onClick: handleCreditCardClick,
      icon: <IcoCreditCard />,
      isEnabled: isFiatOnRampEnabled,
      label: '',
    },
    {
      title: 'Apple Pay',
      onClick: handleApplePayClick,
      icon: <LogoApple />,
      isEnabled: isFiatOnRampEnabled && (isIosDevice() || isSafariAgent()),
      label: '',
    },
    {
      title: 'Google Pay',
      onClick: handleGooglePayClick,
      icon: <LogoGoogle />,
      isEnabled: isFiatOnRampEnabled && isAndroidDevice(),
      label: '',
    },
  ];

  const bankTransferProviders = [
    isSardineEnabled && {
      name: 'Sardine',
      icon: isDarkTheme ? <LogoSardineMono /> : <LogoSardine />,
      limit: t('$3,000 daily limit'),
      onClick: () => router.replace(sardineRoute),
    },
    {
      name: 'onramper',
      icon: isDarkTheme ? <LogoOnramperMono /> : <LogoOnramper />,
      limit: t('Limits vary'),
      onClick: () => router.replace(onramperRoute),
    },
    isStripeEnabled && {
      name: t('Stripe'),
      icon: isDarkTheme ? <LogoLinkByStripeMono /> : <LogoLinkByStripe />,
      limit: t('$1,500 weekly limit'),
      onClick: () => router.replace(stripeRoute),
    },
  ].filter(provider => !!provider);

  const creditCardProviders = [
    isSardineEnabled && {
      name: 'sardine',
      icon: isDarkTheme ? <LogoSardineMono /> : <LogoSardine />,
      limit: t('$3,000 daily limit'),
      onClick: () => router.replace(sardineRoute),
    },
    {
      name: 'onramper',
      icon: isDarkTheme ? <LogoOnramperMono /> : <LogoOnramper />,
      limit: t('Limits vary'),
      onClick: () => router.replace(onramperRoute),
    },
    isStripeEnabled && {
      name: 'stripe',
      icon: isDarkTheme ? <LogoLinkByStripeMono /> : <LogoLinkByStripe />,
      limit: t('$1,500 weekly limit'),
      onClick: () => router.replace(stripeRoute),
    },
  ].filter(provider => !!provider);

  useEffect(() => {
    if (!chainInfo || !queryParams) return;
    routeToOnRamperIfNeeded();
  }, [chainInfo, queryParams]);

  return (
    <>
      {isLoading && (
        <VStack gap={24}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
      )}
      {!isLoading && (
        <>
          {areOnRampsDisabled && (
            <Text size="sm" variant="warning" styles={{ textAlign: 'center' }}>
              <T ns="send" translate="On-ramps unavailable on testnets. <learnMoreLink/>">
                <Link
                  target="_blank"
                  id="learnMoreLink"
                  className={css({ color: 'blue' })}
                  href="https://magic.link/docs/connect/features/fiat-on-ramps"
                  rel="noreferrer"
                >
                  <Button iconSize={12} size="sm" variant="text" label={t('Learn More')}>
                    <Button.TrailingIcon>
                      <IcoExternalLink />
                    </Button.TrailingIcon>
                  </Button>
                </Link>
              </T>
            </Text>
          )}
          <VStack width="100%" alignItems="flex-start">
            <Text.H4>{t('Payment Method')}</Text.H4>
            {paymentMethodButtons.map(
              paymentMethod =>
                paymentMethod.isEnabled && (
                  <NavigationButton
                    key={paymentMethod.title}
                    primaryLabel={paymentMethod.title}
                    secondaryLabel={paymentMethod.label}
                    onPress={paymentMethod.onClick}
                    disabled={areOnRampsDisabled}
                  >
                    <NavigationButton.LeadingIcon>{paymentMethod.icon}</NavigationButton.LeadingIcon>
                    <NavigationButton.TrailingIcon>
                      <IcoCaretRight />
                    </NavigationButton.TrailingIcon>
                  </NavigationButton>
                ),
            )}
          </VStack>
          {/*{Bank transfer drawer}*/}
          <Page.Drawer
            title={t('Instant Bank Transfer')}
            onToggle={() => setIsBankTransferDrawerOpen(!isBankTransferDrawerOpen)}
            isOpen={isBankTransferDrawerOpen}
          >
            <VStack>
              {bankTransferProviders.map(provider => (
                <NavigationButton
                  key={provider.name}
                  onPress={provider.onClick}
                  primaryLabel=""
                  secondaryLabel={provider.limit}
                  aria-label={provider.name}
                  isExternalLink={provider.name.toLowerCase() === 'stripe'}
                >
                  <NavigationButton.LeadingIcon>{provider.icon}</NavigationButton.LeadingIcon>
                  <NavigationButton.TrailingIcon>
                    <IcoCaretRight />
                  </NavigationButton.TrailingIcon>
                </NavigationButton>
              ))}
            </VStack>
          </Page.Drawer>
          {/*{Credit Card drawer}*/}
          <Page.Drawer
            title={t('Credit or Debit')}
            onToggle={() => setIsCreditCardDrawerOpen(!isCreditCardDrawerOpen)}
            isOpen={isCreditCardDrawerOpen}
          >
            <VStack>
              {creditCardProviders.map(provider => (
                <NavigationButton
                  key={provider.name}
                  onPress={provider.onClick}
                  primaryLabel=""
                  secondaryLabel={provider.limit}
                  aria-label={provider.name}
                  isExternalLink={provider.name === 'stripe'}
                >
                  <NavigationButton.LeadingIcon>{provider.icon}</NavigationButton.LeadingIcon>
                  <NavigationButton.TrailingIcon>
                    <IcoCaretRight />
                  </NavigationButton.TrailingIcon>
                </NavigationButton>
              ))}
            </VStack>
          </Page.Drawer>
        </>
      )}
    </>
  );
}
