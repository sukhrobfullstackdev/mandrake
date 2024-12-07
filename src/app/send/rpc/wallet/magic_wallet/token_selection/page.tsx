'use client';

import ShowSendTokensUI from '@components/show-ui/show-send-tokens-ui';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';

export default function WalletTokenSelectionPage() {
  const router = useSendRouter();

  const handlePressBack = () => {
    router.replace('/send/rpc/wallet/magic_wallet/home');
  };

  return (
    <>
      <WalletPageHeader onPressBack={handlePressBack} />
      <ShowSendTokensUI />
    </>
  );
}
