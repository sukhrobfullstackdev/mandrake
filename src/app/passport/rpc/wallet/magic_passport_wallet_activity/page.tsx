'use client';

import WalletHeader from '@app/passport/rpc/wallet/components/wallet-header';
import WalletNavigation from '@app/passport/rpc/wallet/components/wallet-navigation';
import { useTranslation } from '@lib/common/i18n';
import { Text, WalletNavigationType, WalletPage } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';

export default function PassportShowUIPage() {
  const { t } = useTranslation('passport');

  return (
    <>
      <WalletHeader />
      <WalletNavigation active={WalletNavigationType.Activity} />
      <WalletPage.Content>
        <Text.H2>{t('Activity')}</Text.H2>
        <Center px={10}>
          <Text>Token list goes here.</Text>
        </Center>
      </WalletPage.Content>
    </>
  );
}
