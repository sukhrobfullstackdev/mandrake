'use client';

import { useOAuthContext } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useOAuthResolve } from '@hooks/common/oauth-resolve';
import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';
import { oauthQueryKeys } from '@hooks/data/embedded/oauth/keys';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { RPCErrorCode } from '@magic-sdk/types';
import { useMutationState } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function OAuthResolvePage() {
  const pathname = usePathname();
  const startTime = useRef(performance.now());
  const { metaData } = useOAuthContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const {
    resolve,
    data: resolveData,
    error: resolveError,
  } = useOAuthResolve({
    provider: metaData?.provider || '',
    lifespan: activeRpcPayload?.params[0]?.lifespan,
  });

  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const verifyData = useMutationState({
    // this mutation key needs to match the mutation key of the given mutation (see above)
    filters: { mutationKey: oauthQueryKeys.verify() },
    select: mutation => mutation.state.data,
  })[0] as OAuthVerifyResponse;

  useEffect(() => {
    if (verifyData) resolve(verifyData);
  }, [verifyData?.oauthAccessToken]);

  // on resolve of OAuth flow
  useEffect(() => {
    if (resolveError) {
      logger.error('OAuth V2 popup resolve error', {
        timeToError: Math.round(performance.now() - startTime.current),
        oauthContext: 'magic_oauth_login_with_popup',
        oauthStep: 'resolve',
        message: resolveError,
        provider: metaData?.provider,
        redirectUri: metaData?.redirectUri,
      });

      rejectActiveRpcRequest(RPCErrorCode.InternalError, resolveError);
    }

    if (resolveData) {
      logger.info('OAuth V2 popup resolve success', {
        timeToSuccess: Math.round(performance.now() - startTime.current),
        oauthContext: 'magic_oauth_login_with_popup',
        oauthStep: 'resolve',
        result: resolveData,
        provider: metaData?.provider,
        redirectUri: metaData?.redirectUri,
      });

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(resolveData);
    }
  }, [resolveData, resolveError]);

  return null;
}
