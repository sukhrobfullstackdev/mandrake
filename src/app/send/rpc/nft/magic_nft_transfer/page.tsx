'use client';

import { CollectibleTransferForm } from '@components/collectible/collectible-transfer-form';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CollectibleTransfer() {
  const searchParams = useSearchParams();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const router = useSendRouter();
  const getParam = (queryParam: string, payloadParam: string): string | null =>
    searchParams.get(queryParam) || activeRpcPayload?.params[0]?.[payloadParam];

  const contractAddress = getParam('contractAddress', 'contractAddress');
  const tokenId = getParam('tokenId', 'tokenId');
  const count = getParam('count', 'quantity');
  const to = getParam('to', 'recipient');

  const isMissingParams = !contractAddress || !tokenId;

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  useEffect(() => {
    if (isMissingParams) {
      router.replace(NFT_TRANSFER_ROUTES.INVALID_PARAMS);
    }
  }, [isMissingParams]);

  return (
    <Page.Content>
      <CollectibleTransferForm
        recipient={to}
        count={count}
        contractAddress={contractAddress as string}
        tokenId={tokenId as string}
      />
    </Page.Content>
  );
}
