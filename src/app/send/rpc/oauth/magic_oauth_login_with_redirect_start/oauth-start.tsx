'use client';

import { OauthStart, OauthStartResult } from '@components/oauth/oauth-start';
import { RpcErrorCode } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import { OAuthStartParams } from './page';
import { useCallback } from 'react';

let startTime = 0;

export default function OAuthStartRPC() {
  startTime = performance.now();
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const params = activeRpcPayload?.params?.[0] as OAuthStartParams;
  const { provider, scope, loginHint, redirectURI, bundleId, customData } = params || {};
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const onSuccess = useCallback(
    (result: OauthStartResult) => {
      logger.info('OAuth start success', {
        timeToSuccess: Math.round(performance.now() - startTime),
        oauthContext: 'magic_oauth_login_with_redirect_start',
        oauthStep: 'start',
        provider,
        ...result,
      });

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(result);
    },
    [provider],
  );

  const onError = useCallback(
    (errorCode: string | number, errorMessage?: string) => {
      logger.error('OAuth start error', {
        timeToError: Math.round(performance.now() - startTime),
        oauthContext: 'magic_oauth_login_with_redirect_start',
        oauthStep: 'start',
        provider,
        error: errorMessage,
        errorCode,
      });

      rejectActiveRpcRequest(errorCode, errorMessage);
    },
    [provider],
  );

  // double check if params were not provided
  if (!params?.provider || !params?.redirectURI) {
    rejectActiveRpcRequest(RpcErrorCode.InvalidParams);
    return null;
  }

  return (
    <OauthStart
      provider={provider}
      redirectUri={redirectURI}
      loginHint={loginHint}
      bundleId={bundleId}
      scope={scope}
      customData={customData}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
