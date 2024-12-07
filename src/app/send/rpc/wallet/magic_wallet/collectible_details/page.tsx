'use client';

import { CollectibleDetails } from '@components/collectible/collectible-details';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';
import { useSearchParams } from 'next/navigation';

export default function CollectibleDetailsPage() {
  const router = useSendRouter();
  const searchParams = useSearchParams();

  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');

  const isMissingParams = !contractAddress || !tokenId;

  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/wallet/magic_wallet/home')} />
      <Page.Content>
        {isMissingParams ? (
          // TODO: implement error UI
          <div>Go back to wallet home and try again</div>
        ) : (
          <CollectibleDetails contractAddress={contractAddress} tokenId={tokenId} />
        )}
      </Page.Content>
      <PageFooter />
    </>
  );
}
