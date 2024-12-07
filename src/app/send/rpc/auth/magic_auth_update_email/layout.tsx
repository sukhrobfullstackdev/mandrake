'use client';

import { UpdateEmailProvider } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import { useEffect } from 'react';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { UpdateEmailEventEmit } from '@magic-sdk/types';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';

export default function Layout({ children }: { children: React.ReactNode }) {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(UpdateEmailEventEmit.Cancel, () => {
      rejectActiveRpcRequest(RpcErrorCode.RequestCancelled, RpcErrorMessage.UserCanceledAction);
    });
  }, []);
  return <UpdateEmailProvider>{children}</UpdateEmailProvider>;
}
