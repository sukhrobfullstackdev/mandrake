'use client';

import { POPUP_VERIFY_URL } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import { useOAuthContext } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import { OauthStart, OauthStartResult } from '@components/oauth/oauth-start';
import { RpcErrorCode } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import { OAuthStartParams } from './page';
import { useCallback } from 'react';

let startTime = 0;

export default function GenerateProviderURI() {
  startTime = performance.now();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const params = activeRpcPayload?.params?.[0] as OAuthStartParams;
  const { provider, scope, loginHint } = params || {};
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();
  const oauthContext = useOAuthContext();
  const pathname = usePathname();

  const onSuccess = useCallback((result: OauthStartResult) => {
    logger.info('OAuth V2 popup start success', {
      timeToSuccess: Math.round(performance.now() - startTime),
      oauthContext: 'magic_oauth_login_with_popup',
      oauthStep: 'start',
      provider,
      ...result,
    });

    oauthContext.setOAuthState({
      ...oauthContext,
      providerURI: result.oauthAuthoriationURI,
    });

    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
    router.replace('/send/rpc/oauth/magic_oauth_login_with_popup/popup');
  }, []);

  const onError = useCallback((errorCode: string | number, errorMessage?: string) => {
    logger.error('OAuth V2 popup start error', {
      timeToError: Math.round(performance.now() - startTime),
      oauthContext: 'magic_oauth_login_with_popup',
      oauthStep: 'start',
      provider,
      error: errorMessage,
      errorCode,
    });

    rejectActiveRpcRequest(errorCode, errorMessage);
  }, []);

  // double check if params were not provided
  if (!params?.provider) {
    rejectActiveRpcRequest(RpcErrorCode.InvalidParams);
    return null;
  }

  return (
    <OauthStart
      provider={provider}
      redirectUri={POPUP_VERIFY_URL}
      loginHint={loginHint}
      scope={scope}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
