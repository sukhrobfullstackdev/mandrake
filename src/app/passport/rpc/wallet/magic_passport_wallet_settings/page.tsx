'use client';

import WalletHeader from '@app/passport/rpc/wallet/components/wallet-header';
import WalletNavigation from '@app/passport/rpc/wallet/components/wallet-navigation';
import { useTranslation } from '@lib/common/i18n';
import {
  Button,
  IcoArrowLeft,
  IcoCaretRight,
  NavigationButton,
  WalletNavigationType,
  WalletPage,
} from '@magiclabs/ui-components';
import { Circle, VStack } from '@styled/jsx';
import { useCallback } from 'react';

const NavIcon = () => (
  <NavigationButton.TrailingIcon>
    <IcoCaretRight />
  </NavigationButton.TrailingIcon>
);

export default function PassportShowUIPage() {
  const { t } = useTranslation('passport');

  const onAccount = useCallback(() => {
    logger.info('Go to account');
  }, []);

  const onApps = useCallback(() => {
    logger.info('Go to apps');
  }, []);

  const onKey = useCallback(() => {
    logger.info('Go to private key');
  }, []);

  const onLogout = useCallback(() => {
    alert('User log out action');
  }, []);

  const onPreferences = useCallback(() => {
    logger.info('Go to preferences');
  }, []);

  return (
    <>
      <WalletHeader />
      <WalletNavigation active={WalletNavigationType.Settings} />
      <WalletPage.Content>
        <Circle bgColor="brand.base" size={20} m={4} />
        <VStack px={10} w="full">
          <NavigationButton primaryLabel={t('Account')} onPress={onAccount}>
            <NavIcon />
          </NavigationButton>
          <NavigationButton primaryLabel={t('Preferences')} onPress={onPreferences}>
            <NavIcon />
          </NavigationButton>
          <NavigationButton primaryLabel={t('Apps')} onPress={onApps}>
            <NavIcon />
          </NavigationButton>
          <NavigationButton primaryLabel={t('Private Key')} secondaryLabel={t('ADVANCED')} onPress={onKey}>
            <NavIcon />
          </NavigationButton>
        </VStack>
        <Button label={t('Log Out')} textStyle="negative" variant="text" onPress={onLogout}>
          <Button.LeadingIcon>
            {/* TODO: replace with proper icon */}
            <IcoArrowLeft />
          </Button.LeadingIcon>
        </Button>
      </WalletPage.Content>
    </>
  );
}
