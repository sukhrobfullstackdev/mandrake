/* istanbul ignore file */
'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { useEffect } from 'react';
import AgreementViewPage from './agreement_view/page';

export default function RevealPrivateKey() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    } else {
      IFrameMessageService.showOverlay();
    }
  }, [isHydrateSessionComplete, isHydrateSessionError]);

  return <AgreementViewPage />;
}
