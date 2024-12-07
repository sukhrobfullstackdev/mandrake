'use client';

import { CollectibleTransferConfirm } from '@components/collectible/collectible-transfer-confirm';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CollectibleTransferConfirmedPage() {
  const searchParams = useSearchParams();
  const router = useSendRouter();
  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');
  const count = searchParams.get('count');
  const hash = searchParams.get('hash');

  const isMissingParams = !contractAddress || !tokenId || !hash;

  useEffect(() => {
    if (isMissingParams) {
      router.replace(NFT_TRANSFER_ROUTES.ERROR);
    }
  }, [isMissingParams]);
  return (
    <Page.Content>
      {!isMissingParams && (
        <CollectibleTransferConfirm
          contractAddress={contractAddress}
          tokenId={tokenId}
          hash={hash}
          count={Number(count)}
        />
      )}
    </Page.Content>
  );
}
