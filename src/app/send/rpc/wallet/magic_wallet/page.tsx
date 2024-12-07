/* istanbul ignore file */
'use client';

import WalletHome from '@app/send/rpc/wallet/magic_wallet/home/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { useEffect } from 'react';
import { useCloseMagicWindowListener } from '@hooks/common/close-magic-window';

export default function ShowUI() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  useCloseMagicWindowListener();

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    } else {
      IFrameMessageService.showOverlay();
    }
  }, [isHydrateSessionComplete, isHydrateSessionError]);

  return <WalletHome />;
}
