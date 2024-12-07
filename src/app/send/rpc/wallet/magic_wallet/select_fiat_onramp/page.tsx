'use client';

import FiatOnramp from '@components/show-ui/fiat-on-ramps/FiatOnramp';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';

export default function SelectFiatOnrampPage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/wallet/magic_wallet/home')} />
      <Page.Content>
        <FiatOnramp
          onramperRoute="/send/rpc/wallet/magic_wallet/onramper"
          sardineRoute="/send/rpc/wallet/magic_wallet/sardine_onramp"
          stripeRoute="/send/rpc/wallet/magic_wallet/stripe_onramp"
        />
      </Page.Content>
      <PageFooter />
    </>
  );
}
